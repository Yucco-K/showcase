import { useProjects } from "../hooks/useProjects";

const Portfolio: React.FC = () => {
	const { projects, loading, error } = useProjects();

	if (loading) {
		return (
			<main style={{ padding: "4rem 0", textAlign: "center" }}>
				<h1 style={{ marginBottom: "2rem" }}>WEB App Portfolio</h1>
				<p>読み込み中...</p>
			</main>
		);
	}

	if (error) {
		return (
			<main style={{ padding: "4rem 0", textAlign: "center" }}>
				<h1 style={{ marginBottom: "2rem" }}>WEB App Portfolio</h1>
				<p>エラーが発生しました: {error}</p>
			</main>
		);
	}

	const sortedProjects = [...projects].sort((a, b) =>
		b.title.localeCompare(a.title)
	);

	return (
		<>
			<main style={{ padding: "4rem 0", textAlign: "center" }}>
				<h1 style={{ marginBottom: "2rem" }}>WEB App Portfolio</h1>
				<div
					style={{
						display: "flex",
						flexWrap: "wrap",
						justifyContent: "center",
						gap: "2rem",
					}}
				>
					{sortedProjects.map((project) => (
						<a
							key={project.id}
							href={project.github_url || project.demo_url || "#"}
							target="_blank"
							rel="noopener noreferrer"
							style={{
								display: "block",
								minWidth: 220,
								maxWidth: 320,
								padding: "1.5rem",
								background: "rgba(255,255,255,0.12)",
								borderRadius: "1.5rem",
								boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
								color: "#222",
								fontWeight: 600,
								fontSize: "1.1rem",
								textDecoration: "none",
								transition: "transform 0.2s, box-shadow 0.2s",
							}}
						>
							{project.title}
						</a>
					))}
				</div>
			</main>
		</>
	);
};

export default Portfolio;
