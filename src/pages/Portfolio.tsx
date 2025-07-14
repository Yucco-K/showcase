import YuccoCat from "../components/YuccoCat";

const portfolioLinks = [
	{ title: "question-app", url: "https://github.com/Yucco-K/question-app" },
	{ title: "snapstreamApp", url: "https://github.com/Yucco-K/snapstreamApp" },
	{
		title: "lostiteminfoApp",
		url: "https://github.com/Yucco-K/lostiteminfoApp",
	},
	{
		title: "jutaku-assignment",
		url: "https://github.com/Yucco-K/jutaku-assignment",
	},
	{ title: "tech-blog-1", url: "https://github.com/Yucco-K/tech-blog-1" },
];

const Portfolio: React.FC = () => {
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
					{portfolioLinks.map((link) => (
						<a
							key={link.url}
							href={link.url}
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
							{link.title}
						</a>
					))}
				</div>
			</main>
			<YuccoCat />
		</>
	);
};

export default Portfolio;
