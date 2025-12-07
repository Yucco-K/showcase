import styled from "styled-components";

export const PortfolioGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 2rem;
	max-width: 1200px;
	margin: 0 auto;
	padding: 0 2rem;

	@media (max-width: 1024px) {
		grid-template-columns: repeat(2, 1fr);
	}

	@media (max-width: 768px) {
		grid-template-columns: 1fr;
		gap: 1.5rem;
	}
`;

export const PortfolioCard = styled.a`
	display: flex;
	align-items: center;
	justify-content: center;
	min-height: 120px;
	padding: 2rem;
	background: rgba(255, 255, 255, 0.12);
	border-radius: 1.5rem;
	box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
	color: #222;
	font-weight: 600;
	font-size: 1.1rem;
	text-decoration: none;
	text-align: center;
	transition: all 0.3s ease;

	&:hover {
		transform: translateY(-4px);
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
		background: rgba(255, 255, 255, 0.18);
	}

	&:focus {
		outline: 2px solid #ffd700;
		outline-offset: 2px;
	}

	@media (max-width: 768px) {
		min-height: 100px;
		padding: 1.5rem;
		font-size: 1rem;
	}
`;
