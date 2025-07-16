import { Link, useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useAuth } from "../../contexts/AuthProvider";
import { LoginModal } from "../auth/LoginModal";
import React from "react";
import { LogoutConfirmationModal } from "../auth/LogoutConfirmationModal";
import { useToast } from "../../hooks/useToast";
import { Toast } from "../ui/Toast";
import { supabase } from "../../lib/supabase";
import type { Profile } from "../../types/database";

const Nav = styled.nav`
	display: flex;
	justify-content: center;
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
	}
`;

const NavLink = styled(Link)<{ $active?: boolean }>`
	color: ${({ $active, to }) =>
		$active && to === "/sample"
			? "#ffc300"
			: $active
			? "#ffd700"
			: "rgba(255, 255, 255, 0.7)"};
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

	@media (max-width: 768px) {
		font-size: 1rem;
		padding: 0.8em 1em;
		border-radius: 0;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
		text-align: center;
	}
`;

const MobileMenuButton = styled.button`
	display: none;
	background: none;
	border: none;
	color: white;
	font-size: 1.5rem;
	cursor: pointer;
	padding: 1rem;

	@media (max-width: 768px) {
		display: block;
	}
`;

const MenuContainer = styled.div<{ $isOpen: boolean }>`
	display: flex;
	gap: 2rem;
	align-items: center;

	@media (max-width: 768px) {
		display: ${({ $isOpen }) => ($isOpen ? "flex" : "none")};
		flex-direction: column;
		gap: 0;
		width: 100%;
	}
`;

const UserSection = styled.div`
	display: flex;
	align-items: center;
	gap: 1rem;
	margin-left: auto;

	@media (max-width: 768px) {
		margin-left: 0;
		margin-top: 1rem;
		flex-direction: column;
		gap: 0.5rem;
	}
`;

const AvatarContainer = styled.div`
	position: relative;
	cursor: pointer;

	@media (max-width: 768px) {
		margin-bottom: 8px;
	}
`;

const Avatar = styled.img`
	width: 40px;
	height: 40px;
	border-radius: 50%;
	object-fit: cover;
	border: 2px solid rgba(255, 255, 255, 0.3);
	transition: all 0.2s ease;

	&:hover {
		border-color: #3ea8ff;
		transform: scale(1.05);
	}
`;

const AvatarPlaceholder = styled.div`
	width: 40px;
	height: 40px;
	border-radius: 50%;
	background: linear-gradient(135deg, #3ea8ff, #0066cc);
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 1rem;
	color: white;
	border: 2px solid rgba(255, 255, 255, 0.3);
	transition: all 0.2s ease;
	cursor: pointer;

	&:hover {
		border-color: #3ea8ff;
		transform: scale(1.05);
	}
`;

const UserDropdown = styled.div`
	position: absolute;
	top: 100%;
	right: 0;
	background: rgba(20, 26, 42, 0.95);
	backdrop-filter: blur(12px);
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 8px;
	padding: 0.5rem 0;
	min-width: 200px;
	box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
	z-index: 1000;
	margin-top: 0.5rem;
`;

const DropdownItem = styled.div`
	padding: 0.75rem 1rem;
	color: white;
	cursor: pointer;
	transition: background 0.2s ease;

	&:hover {
		background: rgba(255, 255, 255, 0.1);
	}

	&:first-child {
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	}
`;

const UserInfo = styled.div`
	padding: 0.75rem 1rem;
	border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const UserName = styled.div`
	color: white;
	font-weight: 600;
	font-size: 0.9rem;
	margin-bottom: 0.25rem;
`;

const UserEmail = styled.div`
	color: rgba(255, 255, 255, 0.7);
	font-size: 0.8rem;
`;

const UserBio = styled.div`
	color: rgba(255, 255, 255, 0.8);
	font-size: 0.8rem;
	margin-top: 0.5rem;
	line-height: 1.4;
`;

const NavBar: React.FC = () => {
	const { pathname } = useLocation();
	const navigate = useNavigate();
	const { user, isAdmin, signOut } = useAuth();
	const [loginOpen, setLoginOpen] = React.useState(false);
	const [logoutModalOpen, setLogoutModalOpen] = React.useState(false);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
	const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
	const [userProfile, setUserProfile] = React.useState<Profile | null>(null);
	const { toast, showSuccess, hideToast } = useToast();

	// Top画面（"/"）では常にメニューを開いた状態にする
	const isTopPage = pathname === "/";
	const shouldShowMobileMenu = isMobileMenuOpen || isTopPage;

	// ユーザープロフィールを取得
	const fetchUserProfile = React.useCallback(async () => {
		try {
			const { data, error } = await supabase
				.from("profiles")
				.select("*")
				.eq("id", user?.id)
				.single();

			if (error) throw error;
			setUserProfile(data);
		} catch (error) {
			console.error("Failed to fetch user profile:", error);
		}
	}, [user]);

	React.useEffect(() => {
		if (user) {
			fetchUserProfile();
		}
	}, [user, fetchUserProfile]);

	const toggleDropdown = () => {
		setIsDropdownOpen(!isDropdownOpen);
	};

	const closeDropdown = () => {
		setIsDropdownOpen(false);
	};

	const handleLogoutClick = () => {
		setLogoutModalOpen(true);
	};

	const handleLogoutConfirm = async () => {
		try {
			await signOut();
			showSuccess("ログアウトしました！");
			setLogoutModalOpen(false);
			// ログアウト後にトップページにリダイレクト
			navigate("/");
		} catch (error) {
			console.error("Logout error:", error);
		}
	};

	const handleLogoutCancel = () => {
		setLogoutModalOpen(false);
	};

	const toggleMobileMenu = () => {
		setIsMobileMenuOpen(!isMobileMenuOpen);
	};

	const closeMobileMenu = React.useCallback(() => {
		setIsMobileMenuOpen(false);
	}, []);

	// Close mobile menu when user scrolls up on non-Top pages (mobile only)
	React.useEffect(() => {
		if (typeof window === "undefined") return;

		let prevY = window.scrollY;
		const handleScroll = () => {
			const currentY = window.scrollY;
			// If scrolling up (currentY < prevY) and menu is open, close it
			if (
				currentY < prevY &&
				isMobileMenuOpen &&
				window.innerWidth <= 768 &&
				!isTopPage
			) {
				closeMobileMenu();
			}
			prevY = currentY;
		};

		window.addEventListener("scroll", handleScroll, { passive: true });
		return () => window.removeEventListener("scroll", handleScroll);
	}, [isMobileMenuOpen, isTopPage, closeMobileMenu]);

	return (
		<>
			<Nav>
				{/* モバイルメニューボタン - Top画面では非表示 */}
				{!isTopPage && (
					<MobileMenuButton type="button" onClick={toggleMobileMenu}>
						{isMobileMenuOpen ? "✕" : "☰"}
					</MobileMenuButton>
				)}

				{/* デスクトップメニュー */}
				<MenuContainer $isOpen={shouldShowMobileMenu}>
					<NavLink to="/" $active={pathname === "/"} onClick={closeMobileMenu}>
						Top
					</NavLink>
					<NavLink
						to="/internship"
						$active={pathname === "/internship"}
						onClick={closeMobileMenu}
					>
						Sample
					</NavLink>
					<NavLink
						to="/portfolio"
						$active={pathname === "/portfolio"}
						onClick={closeMobileMenu}
					>
						Portfolio
					</NavLink>
					<NavLink
						to="/products"
						$active={pathname.startsWith("/products")}
						onClick={closeMobileMenu}
					>
						Products
					</NavLink>
					<NavLink
						to="/blog"
						$active={pathname === "/blog"}
						onClick={closeMobileMenu}
					>
						Blog
					</NavLink>
					<NavLink
						to="/contact"
						$active={pathname === "/contact"}
						onClick={closeMobileMenu}
					>
						Contact
					</NavLink>

					{/* User Section */}
					{user && (
						<UserSection>
							<AvatarContainer onClick={toggleDropdown}>
								{userProfile?.avatar_url ? (
									<Avatar src={userProfile.avatar_url} alt="アバター" />
								) : (
									<AvatarPlaceholder>
										{userProfile?.full_name?.charAt(0) ||
											user.email?.charAt(0) ||
											"?"}
									</AvatarPlaceholder>
								)}
								{isDropdownOpen && (
									<UserDropdown>
										<UserInfo>
											<UserName>
												{userProfile?.full_name || "名前未設定"}
											</UserName>
											<UserEmail>{userProfile?.email}</UserEmail>
											{userProfile?.biography && (
												<UserBio>{userProfile.biography}</UserBio>
											)}
										</UserInfo>
										<DropdownItem
											onClick={() => {
												navigate("/mypage");
												closeDropdown();
												closeMobileMenu();
											}}
										>
											マイページ
										</DropdownItem>
										<DropdownItem
											onClick={() => {
												handleLogoutClick();
												closeDropdown();
												closeMobileMenu();
											}}
										>
											ログアウト
										</DropdownItem>
									</UserDropdown>
								)}
							</AvatarContainer>
						</UserSection>
					)}

					{/* Login button for non-authenticated users */}
					{!user && (
						<NavLink
							as="button"
							to="#"
							onClick={() => {
								setLoginOpen(true);
								closeMobileMenu();
							}}
						>
							Login
						</NavLink>
					)}

					{/* Admin links */}
					{user && isAdmin(user) && (
						<>
							<NavLink
								to="/blog-admin"
								$active={pathname === "/blog-admin"}
								onClick={closeMobileMenu}
							>
								Blog Admin
							</NavLink>
							<NavLink
								to="/product-admin"
								$active={pathname === "/product-admin"}
								onClick={closeMobileMenu}
							>
								Product Admin
							</NavLink>
							<NavLink
								to="/contact-admin"
								$active={pathname === "/contact-admin"}
								onClick={closeMobileMenu}
							>
								Contact Admin
							</NavLink>
						</>
					)}
				</MenuContainer>
			</Nav>
			{loginOpen && (
				<LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
			)}
			{logoutModalOpen && (
				<LogoutConfirmationModal
					isOpen={logoutModalOpen}
					onConfirm={handleLogoutConfirm}
					onCancel={handleLogoutCancel}
				/>
			)}
			<Toast
				message={toast.message}
				type={toast.type}
				isVisible={toast.isVisible}
				onClose={hideToast}
			/>
		</>
	);
};

export default NavBar;
