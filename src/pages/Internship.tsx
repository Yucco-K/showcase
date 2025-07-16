import React from "react";
import LazyBubbleScene from "../components/LazyBubbleScene";

const Internship: React.FC = () => {
	// レスポンシブpadding
	const getResponsivePadding = React.useCallback(() => {
		if (window.innerWidth < 600) return "2rem 1rem";
		if (window.innerWidth < 900) return "2rem 4rem";
		if (window.innerWidth < 1200) return "2rem 8rem";
		return "2rem 12rem";
	}, []);

	const [padding, setPadding] = React.useState(getResponsivePadding());

	React.useEffect(() => {
		const handleResize = () => setPadding(getResponsivePadding());
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, [getResponsivePadding]);

	return (
		<main
			style={{
				width: "100vw",
				minHeight: "100vh",
				padding,
				color: "#222",
				textAlign: "center",
				display: "flex",
				flexDirection: "column",
				justifyContent: "center",
				alignItems: "center",
				boxSizing: "border-box",
				position: "relative",
			}}
		>
			<LazyBubbleScene />
			<div style={{ position: "relative", zIndex: 2 }}>
				<h1
					style={{
						fontSize: "2.5rem",
						marginBottom: "1.5rem",
						color: "#333",
					}}
				>
					インターンシップ募集
				</h1>
				<p
					style={{
						fontSize: "1.2rem",
						color: "#666",
						maxWidth: "600px",
						lineHeight: "1.6",
					}}
				>
					現在、フロントエンド開発のインターンシップ生を募集しています。
					一緒に素晴らしいプロダクトを作りませんか？
				</p>
			</div>
		</main>
	);
};

export default Internship;
