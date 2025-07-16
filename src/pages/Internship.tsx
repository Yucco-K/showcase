import React from "react";
import BubbleScene from "../components/BubbleScene";

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
			<BubbleScene />
			<div
				style={{
					position: "relative",
					zIndex: 2,
					width: "100%",
					color: "#fff",
				}}
			>
				<h1
					style={{
						color: "#6a4fb6",
						fontWeight: 800,
						fontSize: "2.2rem",
						marginBottom: "1.2rem",
						letterSpacing: "0.04em",
					}}
				>
					Sample Portfolio
				</h1>
				<h2>テキストテキスト</h2>
				<p>テキストテキスト</p>
				<p>テキストテキスト</p>
				<p>テキストテキスト</p>
				<h2>テキストテキスト</h2>
				<h3>テキストテキスト</h3>
				<div style={{ textAlign: "left", margin: "0 auto", maxWidth: 600 }}>
					テキストテキスト
				</div>
				<h3>テキストテキスト</h3>
				<div style={{ textAlign: "left", margin: "0 auto", maxWidth: 600 }}>
					テキストテキスト
				</div>
				<h3>テキストテキスト</h3>
				<div style={{ textAlign: "left", margin: "0 auto", maxWidth: 600 }}>
					テキストテキスト
				</div>
				<h2>テキストテキスト</h2>
				<p style={{ fontSize: "0.95rem", color: "#444" }}>テキストテキスト</p>
				<h3>テキストテキスト</h3>
				<div>テキストテキスト</div>
				<h3>テキストテキスト</h3>
				<div>テキストテキスト</div>
				<h3>テキストテキスト</h3>
				<div>テキストテキスト</div>
				<h3>テキストテキスト</h3>
				<div>テキストテキスト</div>
				<h2>テキストテキスト</h2>
				<div style={{ fontSize: "0.95rem", color: "#444" }}>
					テキストテキスト
				</div>
				<h2>テキストテキスト</h2>
				<p>テキストテキスト</p>
			</div>
		</main>
	);
};

export default Internship;
