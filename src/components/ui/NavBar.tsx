import { Link, useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useAuth } from "../../contexts/AuthProvider";
import { LoginModal } from "../auth/LoginModal";
import React, { useEffect, useState } from "react";
import { LogoutConfirmationModal } from "../auth/LogoutConfirmationModal";
import { useToast } from "../../hooks/useToast";
import { supabase } from "../../lib/supabase";

const Nav = styled.nav`
	display: flex;
	justify-content: center;
	align-items: center;
	gap: 2rem;
	padding: 1.2rem 0;
	background: rgba(20, 26, 42, 0.2); /* さらに透明度を上げる */
	backdrop-filter: blur(12px) saturate(150%);
	border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	position: sticky;
	top: 0;
	z-index: 10;

	@media (max-width: 768px) {
		flex-direction: column;
		gap: 0;
		padding: 0;
		align-items: stretch;
	}
`;

const NavLink = styled(Link)<{ $active?: boolean }>`
	color: ${({ $active }) => ($active ? "#ffd700" : "rgba(255, 255, 255, 0.7)")};
	font-weight: 600;
	text-decoration: none;
	font-size: 1.2rem;
	padding: 0.3em 1em;
	border-radius: 1em;
	background: ${({ $active }) => ($active ? "rgba(255,255,255,0.12)" : "none")};
	transition: background 0.2s, color 0.2s;

	&:hover {
		background: rgba(255, 255, 255, 0.18);
		color: #ffd700;
	}

	&:focus {
		outline: 2px solid #ffd700;
		outline-offset: 2px;
		background: rgba(255, 255, 255, 0.18);
		color: #ffd700;
	}

	@media (max-width: 768px) {
		font-size: 1rem;
		padding: 0.8em 1em;
		border-radius: 0;
		text-align: center;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	}
`;

const LoginButton = styled.button`
	background: none;
	border: none;
	color: rgba(255, 255, 255, 0.7);
	font-weight: 600;
	font-size: 1.2rem;
	padding: 0.3em 1em;
	border-radius: 1em;
	cursor: pointer;
	transition: background 0.2s, color 0.2s;

	&:hover {
		background: rgba(255, 255, 255, 0.18);
		color: #ffd700;
	}

	&:focus {
		outline: 2px solid #ffd700;
		outline-offset: 2px;
		background: rgba(255, 255, 255, 0.18);
		color: #ffd700;
	}

	@media (max-width: 768px) {
		font-size: 1rem;
		padding: 0.8em 1em;
		border-radius: 0;
		text-align: center;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	}
`;

const UserMenu = styled.div`
	position: relative;
	display: flex;
	align-items: center;
	gap: 1rem;

	@media (max-width: 768px) {
		flex-direction: column;
		align-items: stretch;
		gap: 0.5rem;
	}
`;

const UserButton = styled.button`
	background: none;
	border: none;
	color: rgba(255, 255, 255, 0.7);
	font-weight: 600;
	font-size: 1.2rem;
	padding: 0.3em 1em;
	border-radius: 1em;
	cursor: pointer;
	transition: background 0.2s, color 0.2s;

	&:hover {
		background: rgba(255, 255, 255, 0.18);
		color: #ffd700;
	}

	&:focus {
		outline: 2px solid #ffd700;
		outline-offset: 2px;
		background: rgba(255, 255, 255, 0.18);
		color: #ffd700;
	}

	@media (max-width: 768px) {
		font-size: 1rem;
		padding: 0.8em 1em;
		border-radius: 0;
		text-align: center;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	}
`;

const AvatarButton = styled.button`
	background: none;
	border: none;
	cursor: pointer;
	padding: 0;
	border-radius: 50%;
	transition: transform 0.2s ease;
	display: flex;
	align-items: center;
	justify-content: center;

	&:hover {
		transform: scale(1.1);
	}

	@media (max-width: 768px) {
		width: 100%;
		justify-content: flex-start;
		padding: 0.8em 1em;
		border-radius: 0;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	}
`;

const AvatarImage = styled.img`
	width: 40px;
	height: 40px;
	border-radius: 50%;
	object-fit: cover;
	border: 2px solid rgba(255, 255, 255, 0.3);
	transition: border-color 0.2s ease;

	${AvatarButton}:hover & {
		border-color: #ffd700;
	}

	@media (max-width: 768px) {
		width: 32px;
		height: 32px;
		margin-right: 12px;
	}
`;

const AvatarPlaceholder = styled.div`
	width: 40px;
	height: 40px;
	border-radius: 50%;
	background: linear-gradient(135deg, #667eea, #764ba2);
	display: flex;
	align-items: center;
	justify-content: center;
	color: white;
	font-size: 1.2rem;
	font-weight: bold;
	border: 2px solid rgba(255, 255, 255, 0.3);
	transition: border-color 0.2s ease;

	${AvatarButton}:hover & {
		border-color: #ffd700;
	}

	@media (max-width: 768px) {
		width: 32px;
		height: 32px;
		font-size: 1rem;
		margin-right: 12px;
	}
`;

const NavBar: React.FC = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const { user, signOut, isAdmin } = useAuth();
	const [showLoginModal, setShowLoginModal] = React.useState(false);
	const [showLogoutModal, setShowLogoutModal] = React.useState(false);
	const { showToast } = useToast();
	const [isMobileNavOpen, setIsMobileNavOpen] = useState(true);
	const [isMobile, setIsMobile] = useState(false);
	const [profile, setProfile] = useState<{
		avatar_url: string | null;
		full_name: string | null;
	} | null>(null);

	useEffect(() => {
		const checkMobile = () => setIsMobile(window.innerWidth <= 768);
		checkMobile();
		window.addEventListener("resize", checkMobile);
		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	// プロフィール情報を取得
	useEffect(() => {
		const fetchProfile = async () => {
			if (!user) {
				setProfile(null);
				return;
			}

			try {
				const { data, error } = await supabase
					.from("profiles")
					.select("avatar_url, full_name")
					.eq("id", user.id)
					.single();

				if (error) {
					console.error("Profile fetch error:", error);
					return;
				}

				setProfile({
					avatar_url: data.avatar_url as string | null,
					full_name: data.full_name as string | null,
				});
			} catch (error) {
				console.error("Profile fetch error:", error);
			}
		};

		fetchProfile();
	}, [user]);

	// useEffectの依存配列警告を抑制
	// eslint-disable-next-line
	useEffect(() => {
		// 画面遷移時はナビを自動で閉じる
		setIsMobileNavOpen(false);
	}, [location.pathname]);

	const handleLogout = async () => {
		try {
			await signOut();
			showToast("ログアウトしました", "success");
			setShowLogoutModal(false);
			navigate("/");
		} catch (error) {
			console.error("Logout error:", error);
			showToast("ログアウトに失敗しました", "error");
		}
	};

	const isActive = (path: string) => location.pathname === path;

	const navItems = [
		{ path: "/", label: "Top" },
		{ path: "/portfolio", label: "Portfolio" },
		{ path: "/products", label: "Products" },
		{ path: "/blog", label: "Blog" },
		{ path: "/internship", label: "Sample" },
	];

	// ハンバーガーアイコン
	const showHamburger = isMobile && location.pathname !== "/";

	return (
		<>
			{showHamburger && (
				<button
					type="button"
					aria-label="メニューを開く"
					style={{
						position: "fixed",
						top: 0,
						left: 0,
						zIndex: 1001,
						background: "rgba(20, 26, 42, 0.2)",
						backdropFilter: "blur(12px) saturate(150%)",
						border: "none",
						borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
						width: 48,
						height: 48,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						fontSize: 32,
						color: "rgba(255, 255, 255, 0.7)",
						cursor: "pointer",
						borderRadius: 0,
					}}
					onClick={() => setIsMobileNavOpen((v) => !v)}
				>
					≡
				</button>
			)}

			{/* NavBar本体の表示制御 */}
			{(!isMobile || isMobileNavOpen || location.pathname === "/") && (
				<Nav aria-label="メインナビゲーション">
					{navItems.map((item) => (
						<NavLink
							key={item.path}
							to={item.path}
							$active={isActive(item.path)}
							aria-current={isActive(item.path) ? "page" : undefined}
						>
							{item.label}
						</NavLink>
					))}

					{user ? (
						<NavLink
							to="/contact"
							$active={isActive("/contact")}
							aria-current={isActive("/contact") ? "page" : undefined}
						>
							Contact
						</NavLink>
					) : (
						<LoginButton
							onClick={() => setShowLoginModal(true)}
							aria-label="Contact (Login required)"
						>
							Contact
						</LoginButton>
					)}

					{user ? (
						<UserMenu>
							{isAdmin(user) && (
								<>
									<UserButton
										onClick={() => navigate("/product-admin")}
										aria-label="Product Admin"
									>
										Product Admin
									</UserButton>
									<UserButton
										onClick={() => navigate("/blog-admin")}
										aria-label="Blog Admin"
									>
										Blog Admin
									</UserButton>
									<UserButton
										onClick={() => navigate("/contact-admin")}
										aria-label="Contact Admin"
									>
										Contact Admin
									</UserButton>
								</>
							)}
							<AvatarButton
								onClick={() => navigate("/mypage")}
								aria-label="Go to My Page"
							>
								{profile?.avatar_url ? (
									<AvatarImage src={profile.avatar_url} alt="User avatar" />
								) : (
									<AvatarPlaceholder>
										{profile?.full_name
											? profile.full_name.charAt(0).toUpperCase()
											: user.email?.charAt(0).toUpperCase() || "U"}
									</AvatarPlaceholder>
								)}
							</AvatarButton>
							<UserButton
								onClick={() => setShowLogoutModal(true)}
								aria-label="Logout"
							>
								Logout
							</UserButton>
						</UserMenu>
					) : (
						<LoginButton
							onClick={() => setShowLoginModal(true)}
							aria-label="ログイン"
						>
							Login
						</LoginButton>
					)}
				</Nav>
			)}

			{showLoginModal && (
				<LoginModal
					isOpen={showLoginModal}
					onClose={() => setShowLoginModal(false)}
				/>
			)}

			{showLogoutModal && (
				<LogoutConfirmationModal
					isOpen={showLogoutModal}
					onConfirm={handleLogout}
					onCancel={() => setShowLogoutModal(false)}
				/>
			)}
		</>
	);
};

export default NavBar;
