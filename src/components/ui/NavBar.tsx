import { Link, useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useAuth } from "../../contexts/AuthProvider";
import { LoginModal } from "../auth/LoginModal";
import React from "react";
import { LogoutConfirmationModal } from "../auth/LogoutConfirmationModal";
import { useToast } from "../../hooks/useToast";
import { Toast } from "../ui/Toast";

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
		$active && to === "/internship"
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

	@media (max-width: 768px) {
		display: ${({ $isOpen }) => ($isOpen ? "flex" : "none")};
		flex-direction: column;
		gap: 0;
		width: 100%;
	}
`;

const NavBar: React.FC = () => {
	const { pathname } = useLocation();
	const navigate = useNavigate();
	const { user, isAdmin, signOut } = useAuth();
	const [loginOpen, setLoginOpen] = React.useState(false);
	const [logoutModalOpen, setLogoutModalOpen] = React.useState(false);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
	const { toast, showSuccess, hideToast } = useToast();

	// Top画面（"/"）では常にメニューを開いた状態にする
	const isTopPage = pathname === "/";
	const shouldShowMobileMenu = isMobileMenuOpen || isTopPage;

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

	const closeMobileMenu = () => {
		setIsMobileMenuOpen(false);
	};

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
						Internship
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
					{user ? (
						<NavLink
							to="/contact"
							$active={pathname === "/contact"}
							onClick={closeMobileMenu}
						>
							Contact
						</NavLink>
					) : (
						<NavLink
							as="button"
							to="#"
							onClick={() => {
								setLoginOpen(true);
								closeMobileMenu();
							}}
						>
							Contact
						</NavLink>
					)}

					{/* Auth buttons */}
					{!user ? (
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
					) : (
						<NavLink
							as="button"
							to="#"
							onClick={() => {
								handleLogoutClick();
								closeMobileMenu();
							}}
						>
							Logout
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
