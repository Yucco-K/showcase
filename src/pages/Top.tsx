import { useState, useEffect } from "react";
import LazyBubbleScene from "../components/LazyBubbleScene";
import YuccoCat from "../components/YuccoCat";

const Top: React.FC = () => {
	const [isDesktop, setIsDesktop] = useState(true); // デフォルトはtrue（SSR対応）

	useEffect(() => {
		const checkScreenSize = () => {
			setIsDesktop(window.innerWidth >= 768);
		};

		// 初回実行
		checkScreenSize();

		// リサイズイベントリスナー
		window.addEventListener("resize", checkScreenSize);
		return () => window.removeEventListener("resize", checkScreenSize);
	}, []);

	return (
		<main
			style={{
				width: "100vw",
				minHeight: "100vh",
				padding: "6rem 0 4rem 0",
				textAlign: "center",
				position: "relative",
				zIndex: 1,
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "flex-start",
			}}
		>
			<LazyBubbleScene />
			{isDesktop && <YuccoCat />}
			<div style={{ position: "relative", zIndex: 2 }}>
				<h1
					style={{
						fontSize: "2.5rem",
						marginBottom: "1.5rem",
						textShadow: "0 2px 16px #0008",
					}}
				>
					Welcome to my Showcase!
				</h1>
			</div>
		</main>
	);
};

export default Top;
