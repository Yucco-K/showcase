import { lazy, Suspense } from "react";

const BubbleScene = lazy(() => import("./BubbleScene"));

export default function LazyBubbleScene() {
	return (
		<Suspense
			fallback={
				<div
					style={{
						position: "fixed",
						inset: 0,
						zIndex: 0,
						width: "100vw",
						height: "100vh",
						background: "#2b8dff",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						color: "white",
						fontSize: "1.2rem",
					}}
				>
					読み込み中...
				</div>
			}
		>
			<BubbleScene />
		</Suspense>
	);
}
