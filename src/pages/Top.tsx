import BubbleScene from "../components/BubbleScene";
import YuccoCat from "../components/YuccoCat";

const Top: React.FC = () => {
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
			<BubbleScene />
			<YuccoCat />
			<div style={{ position: "relative", zIndex: 2 }}>
				<h1
					style={{
						fontSize: "2.5rem",
						marginBottom: "1.5rem",
						textShadow: "0 2px 16px #0008",
					}}
				>
					Welcome to my portfolio site!
				</h1>
			</div>
		</main>
	);
};

export default Top;
