import { useState } from "react";
import { FaGithub, FaExternalLinkAlt } from "react-icons/fa";
import { useProjects } from "../hooks/useProjects";
import {
	PortfolioGrid,
	PortfolioCard,
	PortfolioCardTitle,
	PortfolioCardDescription,
	ReadMoreButton,
	ViewOnGitHub,
} from "../styles/commonStyles";

const Portfolio: React.FC = () => {
	const { projects, loading, error } = useProjects();
	const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

	const toggleExpanded = (projectId: string, event: React.MouseEvent) => {
		event.preventDefault();
		event.stopPropagation();
		setExpandedCards((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(projectId)) {
				newSet.delete(projectId);
			} else {
				newSet.add(projectId);
			}
			return newSet;
		});
	};

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
				{sortedProjects.map((project) => {
					const isExpanded = expandedCards.has(project.id);
					const hasLongDescription =
						project.description && project.description.length > 100;
					const linkType = project.github_url
						? "github"
						: project.demo_url
							? "demo"
							: null;

					return (
						<PortfolioCard
							key={project.id}
							href={project.github_url || project.demo_url || "#"}
							target="_blank"
							rel="noopener noreferrer"
						>
							<PortfolioCardTitle>{project.title}</PortfolioCardTitle>
							{project.description && (
								<>
									<PortfolioCardDescription $expanded={isExpanded}>
										{project.description}
									</PortfolioCardDescription>
									{hasLongDescription && (
										<ReadMoreButton
											onClick={(e) => toggleExpanded(project.id, e)}
										>
											{isExpanded ? "閉じる" : "続きを読む →"}
										</ReadMoreButton>
									)}
								</>
							)}
							{linkType && (
								<ViewOnGitHub>
									{linkType === "github" ? (
										<>
											<FaGithub />
											<span>GitHubで見る</span>
										</>
									) : (
										<>
											<FaExternalLinkAlt />
											<span>デモを見る</span>
										</>
									)}
								</ViewOnGitHub>
							)}
						</PortfolioCard>
					);
				})}
			</PortfolioGrid>
		</main>
	);
};

export default Portfolio;
