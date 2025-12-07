import { useProjects } from "../hooks/useProjects";
import { PortfolioGrid, PortfolioCard } from "../styles/commonStyles";

const Portfolio: React.FC = () => {
	const { projects, loading, error } = useProjects();

	if (loading) {
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
				<p>読み込み中...</p>
			</main>
		);
	}

	if (error) {
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
				<p>エラーが発生しました: {error}</p>
			</main>
		);
	}

	const sortedProjects = [...projects].sort((a, b) =>
		b.title.localeCompare(a.title)
	);

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
				{sortedProjects.map((project) => (
					<PortfolioCard
						key={project.id}
						href={project.github_url || project.demo_url || "#"}
						target="_blank"
						rel="noopener noreferrer"
					>
						{project.title}
					</PortfolioCard>
				))}
			</PortfolioGrid>
		</main>
	);
};

export default Portfolio;
