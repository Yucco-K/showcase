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
					Internship Portfolio
				</h1>
				<h2>🍀 About</h2>
				<p>
					<b>教育系IT企業での長期インターン（2024年12月〜現在）</b>
				</p>
				<p>
					2024年12月から、教育系SaaSを展開する企業で長期インターンとしてプロダクト開発に参加しています。フロントエンドを中心に、UI/UXの改善、新機能の実装、バグ修正、運用効率の向上など、
					<b>プロダクトの改善に幅広く携わっています</b>。
				</p>
				<p>
					要件や設計をもとに、手を動かしながら実装を進め、
					<b>
						Issue作成者やレビュー担当者と丁寧にやり取りしつつ、品質とスピードの両立を意識した開発（Cursor
						EditorなどAIツールの活用）を経験
					</b>
					。現在もチーム開発の中で着実にスキルを積み上げています。
				</p>
				<h2>🚀 What I Worked On</h2>
				<h3>✅ UX改善・UI向上</h3>
				<div style={{ textAlign: "left", margin: "0 auto", maxWidth: 600 }}>
					<b>スケルトンUIの導入：</b>{" "}
					ローディング中のちらつきや無表示を防止するため、レッスン詳細ページにスケルトンを実装。
					<br />
					<b>外部リンクの視認性アップ：</b>{" "}
					リンクと通常テキストが見分けづらい問題を改善。色付きの下線を追加してアクセシビリティも意識。
					<br />
					<b>初期タグのハイライト：</b>{" "}
					クイズ一覧ページで、初期状態からタグが選択されているように見せる改善を実装。機能の発見性が向上。
					<br />
					<b>完了ボタンとリダイレクト挙動の調整：</b>{" "}
					チュートリアル最終ページの「完了」ボタン文言と、クリック後のリダイレクト先を見直し、ユーザーの意図に沿ったナビゲーションに改善。
					<br />
				</div>
				<h2>📝 Notes</h2>
				<div style={{ fontSize: "0.95rem", color: "#444" }}>
					実際のプロダクト名や顧客情報などは守秘義務により記載しておりません。
					<br />
					上記は私が担当・関与した業務の一部を抜粋したものです。
				</div>
			</div>
		</main>
	);
};

export default Internship;
