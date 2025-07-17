import { Link, useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useAuth } from "../../contexts/AuthProvider";
import { LoginModal } from "../auth/LoginModal";
import React from "react";
import { LogoutConfirmationModal } from "../auth/LogoutConfirmationModal";
import { useToast } from "../../hooks/useToast";

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

const NavBar: React.FC = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const { user, signOut } = useAuth();
	const [showLoginModal, setShowLoginModal] = React.useState(false);
	const [showLogoutModal, setShowLogoutModal] = React.useState(false);
	const { showToast } = useToast();

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

	return (
		<>
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
						<UserButton
							onClick={() => navigate("/mypage")}
							aria-label="Go to My Page"
						>
							My Page
						</UserButton>
						<UserButton
							onClick={() => setShowLogoutModal(true)}
							aria-label="ログアウト"
						>
							ログアウト
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
