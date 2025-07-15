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
`;

const NavBar: React.FC = () => {
	const { pathname } = useLocation();
	const navigate = useNavigate();
	const { user, isAdmin, signOut } = useAuth();
	const [loginOpen, setLoginOpen] = React.useState(false);
	const [logoutModalOpen, setLogoutModalOpen] = React.useState(false);
	const { toast, showSuccess, hideToast } = useToast();

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

	return (
		<>
			<Nav>
				<NavLink to="/" $active={pathname === "/"}>
					Top
				</NavLink>
				<NavLink to="/internship" $active={pathname === "/internship"}>
					Internship
				</NavLink>
				<NavLink to="/portfolio" $active={pathname === "/portfolio"}>
					Portfolio
				</NavLink>
				<NavLink to="/products" $active={pathname.startsWith("/products")}>
					Products
				</NavLink>
				<NavLink to="/blog" $active={pathname === "/blog"}>
					Blog
				</NavLink>
				{user ? (
					<NavLink to="/contact" $active={pathname === "/contact"}>
						Contact
					</NavLink>
				) : (
					<NavLink as="button" to="#" onClick={() => setLoginOpen(true)}>
						Contact
					</NavLink>
				)}

				{/* Auth buttons */}
				{!user ? (
					<NavLink as="button" to="#" onClick={() => setLoginOpen(true)}>
						Login
					</NavLink>
				) : (
					<NavLink as="button" to="#" onClick={handleLogoutClick}>
						Logout
					</NavLink>
				)}

				{/* Admin links */}
				{user && isAdmin(user) && (
					<>
						<NavLink to="/blog-admin" $active={pathname === "/blog-admin"}>
							Blog Admin
						</NavLink>
						<NavLink
							to="/product-admin"
							$active={pathname === "/product-admin"}
						>
							Product Admin
						</NavLink>
					</>
				)}
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
