import { PortfolioGrid, PortfolioCard } from "../styles/commonStyles";
import { portfolioLinks } from "../data/portfolioLinks";

const Portfolio: React.FC = () => {
	return (
		<main
			style={{
				width: "100%",
				padding: "6rem 0 4rem 0",
				textAlign: "center",
				flex: 1,
				boxSizing: "border-box",
			}}
		>
			<h1 style={{ marginBottom: "2rem" }}>WEB App Portfolio</h1>
			<PortfolioGrid>
				{portfolioLinks.map((link) => (
					<PortfolioCard
						key={link.url}
						href={link.url}
						target="_blank"
						rel="noopener noreferrer"
					>
						{link.title}
					</PortfolioCard>
				))}
			</PortfolioGrid>
		</main>
	);
};

export default Portfolio;
