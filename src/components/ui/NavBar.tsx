import { Link, useLocation } from "react-router-dom";
import styled from "styled-components";

const Nav = styled.nav`
	display: flex;
	justify-content: center;
	gap: 2rem;
	padding: 1.5rem 0 1rem 0;
	background: rgba(0, 0, 0, 0.08);
	position: sticky;
	top: 0;
	z-index: 10;
`;

const NavLink = styled(Link)<{ $active?: boolean }>`
	color: ${({ $active, to }) =>
		$active && to === "/internship" ? "#ffc300" : $active ? "#ffd700" : "#fff"};
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

	return (
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
			<NavLink to="/payment" $active={pathname === "/payment"}>
				Payment
			</NavLink>
		</Nav>
	);
};

export default NavBar;
