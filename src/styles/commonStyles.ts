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
	flex-direction: column;
	align-items: flex-start;
	justify-content: flex-start;
	min-height: 200px;
	padding: 2rem;
	background: rgba(255, 255, 255, 0.12);
	border-radius: 1.5rem;
	box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
	color: #222;
	text-decoration: none;
	transition: all 0.3s ease;
	position: relative;

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
		min-height: 170px;
		padding: 1.5rem;
	}
`;

export const PortfolioCardTitle = styled.h3`
	margin: 0 0 1rem 0;
	font-size: 1.2rem;
	font-weight: 600;
	color: #222;

	@media (max-width: 768px) {
		font-size: 1.1rem;
		margin: 0 0 0.75rem 0;
	}
`;

export const PortfolioCardDescription = styled.p<{ $expanded?: boolean }>`
	margin: 0;
	font-size: 0.95rem;
	font-weight: 400;
	line-height: 1.6;
	color: rgba(34, 34, 34, 0.8);
	display: ${({ $expanded }) => ($expanded ? "block" : "-webkit-box")};
	-webkit-line-clamp: ${({ $expanded }) => ($expanded ? "unset" : "3")};
	-webkit-box-orient: vertical;
	overflow: hidden;
	text-overflow: ellipsis;

	@media (max-width: 768px) {
		font-size: 0.9rem;
		-webkit-line-clamp: ${({ $expanded }) => ($expanded ? "unset" : "2")};
	}
`;

export const ReadMoreButton = styled.button`
	background: none;
	border: none;
	color: #4a90e2;
	font-size: 0.9rem;
	font-weight: 600;
	padding: 0.5rem 0 0 0;
	cursor: pointer;
	text-align: left;
	transition: color 0.2s;
	margin-top: 0.5rem;

	&:hover {
		color: #357abd;
		text-decoration: underline;
	}

	&:focus {
		outline: 2px solid #ffd700;
		outline-offset: 2px;
		border-radius: 4px;
	}

	@media (max-width: 768px) {
		font-size: 0.85rem;
	}
`;
