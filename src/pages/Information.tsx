import React, { useState, useEffect, useCallback, useRef } from "react";
import styled from "styled-components";
import { useAuth } from "../contexts/AuthProvider";
import { useToast } from "../hooks/useToast";
import { Toast } from "../components/ui/Toast";
import {
	Modal,
	Button,
	Group,
	Tabs,
	Paper,
	Box,
	Textarea,
	Tooltip,
	ActionIcon,
} from "@mantine/core";
import {
	IconEdit,
	IconEye,
	IconCode,
	IconBold,
	IconItalic,
	IconStrikethrough,
	IconLink,
	IconList,
	IconListNumbers,
	IconQuote,
	IconCodeDots,
	IconHeading,
	IconTable,
} from "@tabler/icons-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { supabase } from "../lib/supabase";
// スタイルコンポーネント
const EditButton = styled.button`
	position: absolute;
	top: 20px;
	right: 20px;
	z-index: 1000;
	background: linear-gradient(135deg, #ffb366, #ffd4a3);
	color: #8b4513;
	border: none;
	border-radius: 12px;
	padding: 14px 20px;
	font-weight: 700;
	font-size: 16px;
	cursor: pointer;
	display: flex;
	align-items: center;
	gap: 10px;
	box-shadow: 0 8px 25px rgba(255, 179, 102, 0.3), 0 4px 12px rgba(0, 0, 0, 0.1),
		inset 0 1px 0 rgba(255, 255, 255, 0.3);
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	backdrop-filter: blur(8px);
	border: 1px solid rgba(255, 255, 255, 0.2);
	letter-spacing: 0.5px;

	&:hover {
		background: linear-gradient(135deg, #ff9f4a, #ffcc80);
		color: #5d2e0a;
		transform: translateY(-3px) scale(1.02);
		box-shadow: 0 12px 35px rgba(255, 179, 102, 0.4),
			0 8px 20px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.4);
	}

	&:active {
		transform: translateY(-1px) scale(1.01);
		box-shadow: 0 6px 20px rgba(255, 179, 102, 0.3),
			0 3px 8px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2);
	}

	svg {
		filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
	}

	@media (max-width: 768px) {
		top: 15px;
		right: 15px;
		padding: 12px 16px;
		font-size: 14px;
		border-radius: 10px;
		gap: 8px;
	}
`;

const ContentContainer = styled.div`
	position: relative;
	z-index: 2;
	width: 100%;
	color: #2c1810;
	text-align: left;
	max-width: 800px;
	margin: 0 auto;
`;

const MarkdownContent = styled.div`
	color: #2c1810;
	line-height: 1.6;
	font-size: 1.1rem;
	max-width: 800px;
	margin: 0 auto;
	padding: calc(2rem + 40px) 2rem 2rem 2rem;
	background: rgba(255, 255, 255, 0.1);
	border-radius: 12px;
	backdrop-filter: blur(20px);
	box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
	border: 1px solid rgba(255, 255, 255, 0.2);

	@media (max-width: 768px) {
		padding: calc(1.5rem + 40px) 1rem 1.5rem 1rem;
		font-size: 1rem;
		margin: 0 1rem;
		max-width: calc(100% - 2rem);
	}

	@media (max-width: 480px) {
		padding: calc(1rem + 40px) 0.75rem 1rem 0.75rem;
		font-size: 0.95rem;
		margin: 0 0.5rem;
		max-width: calc(100% - 1rem);
	}
`;

const ToolbarContainer = styled.div`
	display: flex;
	align-items: center;
	gap: 12px;
	padding: 8px 12px;
	background: rgba(255, 255, 255, 0.05);
	border-radius: 8px 8px 0 0;
	border-bottom: 1px solid rgba(0, 0, 0, 0.1);
	flex-wrap: nowrap; /* prevent wrapping */
	overflow-x: auto; /* allow scroll on small screens */
	width: 100%;

	svg {
		display: block;
		width: 18px;
		height: 18px;
	}

	@media (max-width: 768px) {
		gap: 8px;
		padding: 6px 8px;
	}

	@media (max-width: 480px) {
		gap: 6px;
		padding: 4px 6px;

		svg {
			width: 16px;
			height: 16px;
		}
	}
`;

const TextareaContainer = styled.div`
	border-radius: 0 0 8px 8px;
	overflow: hidden;
`;

// スケルトンスタイル
const SkeletonContainer = styled.div`
	max-width: 800px;
	margin: 0 auto;
	padding: 2rem;
	background: rgba(255, 255, 255, 0.1);
	border-radius: 12px;
	backdrop-filter: blur(20px);
	box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
	border: 1px solid rgba(255, 255, 255, 0.2);

	@media (max-width: 768px) {
		padding: 1.5rem 1rem;
		margin: 0 1rem;
		max-width: calc(100% - 2rem);
	}

	@media (max-width: 480px) {
		padding: 1rem 0.75rem;
		margin: 0 0.5rem;
		max-width: calc(100% - 1rem);
	}
`;

const SkeletonLine = styled.div<{
	$width?: string;
	$height?: string;
	$marginBottom?: string;
}>`
	background: linear-gradient(
		90deg,
		rgba(255, 255, 255, 0.1) 25%,
		rgba(255, 255, 255, 0.2) 50%,
		rgba(255, 255, 255, 0.1) 75%
	);
	background-size: 200% 100%;
	animation: skeleton-loading 1.5s infinite;
	border-radius: 4px;
	width: ${({ $width }) => $width || "100%"};
	height: ${({ $height }) => $height || "1rem"};
	margin-bottom: ${({ $marginBottom }) => $marginBottom || "1rem"};

	@keyframes skeleton-loading {
		0% {
			background-position: 200% 0;
		}
		100% {
			background-position: -200% 0;
		}
	}
`;

const InformationSkeleton: React.FC = () => {
	return (
		<SkeletonContainer>
			{/* タイトル */}
			<SkeletonLine $width="60%" $height="2.2rem" $marginBottom="1.5rem" />

			{/* セクション1 */}
			<SkeletonLine $width="40%" $height="1.8rem" $marginBottom="1rem" />
			<SkeletonLine $width="100%" $height="1rem" $marginBottom="0.5rem" />
			<SkeletonLine $width="95%" $height="1rem" $marginBottom="0.5rem" />
			<SkeletonLine $width="80%" $height="1rem" $marginBottom="1.5rem" />

			{/* セクション2 */}
			<SkeletonLine $width="45%" $height="1.8rem" $marginBottom="1rem" />
			<SkeletonLine $width="100%" $height="1rem" $marginBottom="0.5rem" />
			<SkeletonLine $width="90%" $height="1rem" $marginBottom="0.5rem" />
			<SkeletonLine $width="85%" $height="1rem" $marginBottom="1.5rem" />

			{/* サブセクション */}
			<SkeletonLine $width="35%" $height="1.4rem" $marginBottom="0.8rem" />
			<SkeletonLine $width="100%" $height="1rem" $marginBottom="0.5rem" />
			<SkeletonLine $width="75%" $height="1rem" $marginBottom="0.5rem" />
		</SkeletonContainer>
	);
};

interface InformationData {
	id?: string;
	title: string;
	content: string;
	updated_at?: string;
}

const Information: React.FC = () => {
	const { user, isAdmin } = useAuth();
	const { toast, showSuccess, showError, hideToast } = useToast();
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [isInitialLoading, setIsInitialLoading] = useState(true);
	const [information, setInformation] = useState<InformationData>({
		title: "Information",
		content:
			"# Information\n\n## セクション1\n\nテキストテキスト\n\n## セクション2\n\nテキストテキスト\n\n### サブセクション\n\nテキストテキスト",
	});
	const [editingData, setEditingData] = useState<InformationData>({
		title: "",
		content: "",
	});
	const textareaRef = useRef<HTMLTextAreaElement | null>(null);
	const modalScrollRef = useRef<number>(0);

	// データ取得
	const fetchInformation = useCallback(async () => {
		try {
			setIsInitialLoading(true);
			const { data, error } = await supabase
				.from("information")
				.select("*")
				.single();

			if (error && error.code !== "PGRST116") {
				console.error("Error fetching information:", error);
				return;
			}

			if (data) {
				const informationData = data as {
					id?: string;
					title: string;
					content: string;
					updated_at?: string;
				};
				setInformation({
					id: informationData.id,
					title: informationData.title || "Information",
					content: informationData.content || "",
					updated_at: informationData.updated_at,
				});
			}
		} catch (error) {
			console.error("Failed to fetch information:", error);
		} finally {
			setIsInitialLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchInformation();
	}, [fetchInformation]);

	const handleEdit = () => {
		setEditingData({
			title: "",
			content: information.content || "",
		});
		setIsModalOpen(true);
	};

	const handleSave = async () => {
		if (!editingData.content.trim()) {
			showError("コンテンツを入力してください");
			return;
		}

		setIsLoading(true);
		try {
			const { error } = await supabase.from("information").upsert({
				id: information.id || "default",
				title: information.title || "Information",
				content: editingData.content,
				updated_at: new Date().toISOString(),
			});

			if (error) throw error;

			setInformation({
				...information,
				content: editingData.content,
			});

			showSuccess("情報を更新しました");
			setIsModalOpen(false);
		} catch (error) {
			console.error("Failed to save information:", error);
			showError("保存に失敗しました");
		} finally {
			setIsLoading(false);
		}
	};

	// マークダウンボタンの機能
	const insertMarkdown = (
		prefix: string,
		suffix: string = "",
		placeholder: string = ""
	) => {
		const textarea =
			textareaRef.current ||
			(document.querySelector(
				"textarea[data-mantine-input]"
			) as HTMLTextAreaElement);
		if (!textarea) return;

		// 現在のスクロール位置を保存
		const scrollTop = textarea.scrollTop;
		const modalElement = document.querySelector("[data-mantine-modal]");
		if (modalElement) {
			modalScrollRef.current = modalElement.scrollTop;
		}

		const start = textarea.selectionStart;
		const end = textarea.selectionEnd;
		const selectedText = editingData.content.substring(start, end);
		const newText = selectedText || placeholder;

		const newContent =
			editingData.content.substring(0, start) +
			prefix +
			newText +
			suffix +
			editingData.content.substring(end);

		setEditingData((prev) => ({ ...prev, content: newContent }));

		// カーソル位置とスクロール位置を更新
		setTimeout(() => {
			textarea.focus();
			const newCursorPos =
				start + prefix.length + newText.length + suffix.length;
			textarea.setSelectionRange(newCursorPos, newCursorPos);
			// スクロール位置を復元
			textarea.scrollTop = scrollTop;

			// モーダルのスクロール位置も復元
			const modalElement = document.querySelector("[data-mantine-modal]");
			if (modalElement) {
				modalElement.scrollTop = modalScrollRef.current;
			}
		}, 0);
	};

	const markdownButtons = [
		{
			icon: IconBold,
			tooltip: "太字",
			action: () => insertMarkdown("**", "**", "太字テキスト"),
		},
		{
			icon: IconItalic,
			tooltip: "斜体",
			action: () => insertMarkdown("*", "*", "斜体テキスト"),
		},
		{
			icon: IconStrikethrough,
			tooltip: "取り消し線",
			action: () => insertMarkdown("~~", "~~", "取り消しテキスト"),
		},
		{
			icon: IconLink,
			tooltip: "リンク",
			action: () => insertMarkdown("[", "](URL)", "リンクテキスト"),
		},
		{
			icon: IconHeading,
			tooltip: "見出し",
			action: () => insertMarkdown("# ", "", "見出し"),
		},
		{
			icon: IconList,
			tooltip: "箇条書き",
			action: () => insertMarkdown("- ", "", "リスト項目"),
		},
		{
			icon: IconListNumbers,
			tooltip: "番号付きリスト",
			action: () => insertMarkdown("1. ", "", "リスト項目"),
		},
		{
			icon: IconQuote,
			tooltip: "引用",
			action: () => insertMarkdown("> ", "", "引用文"),
		},
		{
			icon: IconCode,
			tooltip: "インラインコード",
			action: () => insertMarkdown("`", "`", "コード"),
		},
		{
			icon: IconCodeDots,
			tooltip: "コードブロック",
			action: () => insertMarkdown("```\n", "\n```", "コードブロック"),
		},
		{
			icon: IconTable,
			tooltip: "テーブル",
			action: () =>
				insertMarkdown(
					"| 列1 | 列2 | 列3 |\n|-----|-----|-----|\n| セル1 | セル2 | セル3 |",
					""
				),
		},
	];

	// レスポンシブpadding
	const getResponsivePadding = React.useCallback(() => {
		if (window.innerWidth < 480) return "1rem 0.5rem";
		if (window.innerWidth < 768) return "1.5rem 1rem";
		if (window.innerWidth < 900) return "2rem 2rem";
		if (window.innerWidth < 1200) return "2rem 4rem";
		return "2rem 8rem";
	}, []);

	const [padding, setPadding] = React.useState(getResponsivePadding());

	React.useEffect(() => {
		const handleResize = () => setPadding(getResponsivePadding());
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, [getResponsivePadding]);

	return (
		<>
			{toast && <Toast {...toast} onClose={hideToast} />}

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
				<ContentContainer>
					{isAdmin(user) && !isInitialLoading && (
						<EditButton onClick={handleEdit}>
							<IconEdit size={16} />
							編集
						</EditButton>
					)}
					{isInitialLoading ? (
						<InformationSkeleton />
					) : (
						<MarkdownContent>
							<ReactMarkdown
								remarkPlugins={[remarkGfm]}
								components={{
									h1: ({ children }) => (
										<h1
											style={{
												color: "#6a4fb6",
												fontSize: window.innerWidth < 768 ? "1.8rem" : "2.2rem",
												fontWeight: 800,
												textAlign: "center",
												marginBottom: "1.2rem",
												letterSpacing: "0.04em",
											}}
										>
											{children}
										</h1>
									),
									h2: ({ children }) => (
										<h2
											style={{
												color: "#6a4fb6",
												fontSize: window.innerWidth < 768 ? "1.5rem" : "1.8rem",
												fontWeight: 700,
												marginTop: "1.5rem",
												marginBottom: "1rem",
											}}
										>
											{children}
										</h2>
									),
									h3: ({ children }) => (
										<h3
											style={{
												color: "#6a4fb6",
												fontSize: window.innerWidth < 768 ? "1.2rem" : "1.4rem",
												fontWeight: 600,
												marginTop: "1rem",
												marginBottom: "0.5rem",
											}}
										>
											{children}
										</h3>
									),
									p: ({ children }) => (
										<p style={{ marginBottom: "1rem", lineHeight: 1.6 }}>
											{children}
										</p>
									),
									ul: ({ children }) => (
										<ul style={{ marginBottom: "1rem", paddingLeft: "2rem" }}>
											{children}
										</ul>
									),
									ol: ({ children }) => (
										<ol style={{ marginBottom: "1rem", paddingLeft: "2rem" }}>
											{children}
										</ol>
									),
									li: ({ children }) => (
										<li style={{ marginBottom: "0.5rem" }}>{children}</li>
									),
									blockquote: ({ children }) => (
										<blockquote
											style={{
												borderLeft: "4px solid #6a4fb6",
												paddingLeft: "1rem",
												margin: "1rem 0",
												fontStyle: "italic",
											}}
										>
											{children}
										</blockquote>
									),
									code: ({ children, className }) => {
										const isInline = !className;
										return isInline ? (
											<code
												style={{
													backgroundColor: "rgba(255, 255, 255, 0.1)",
													padding: "0.2rem 0.4rem",
													borderRadius: "4px",
													fontFamily: "monospace",
												}}
											>
												{children}
											</code>
										) : (
											<pre
												style={{
													backgroundColor: "rgba(0, 0, 0, 0.3)",
													padding: "1rem",
													borderRadius: "8px",
													overflowX: "auto",
													margin: "1rem 0",
												}}
											>
												<code style={{ fontFamily: "monospace" }}>
													{children}
												</code>
											</pre>
										);
									},
									strong: ({ children }) => (
										<strong style={{ fontWeight: 700 }}>{children}</strong>
									),
									em: ({ children }) => (
										<em style={{ fontStyle: "italic" }}>{children}</em>
									),
									a: ({ children, href }) => (
										<a
											href={href}
											style={{
												color: "#ffa366",
												textDecoration: "none",
												fontWeight: "600",
												textShadow: "0 0 3px rgba(255, 255, 255, 0.8)",
												backgroundColor: "rgba(255, 255, 255, 0.1)",
												padding: "2px 4px",
												borderRadius: "3px",
												transition: "all 0.3s ease",
											}}
											onMouseEnter={(e) => {
												e.currentTarget.style.color = "#ff6b35";
												e.currentTarget.style.backgroundColor =
													"rgba(255, 255, 255, 0.2)";
											}}
											onMouseLeave={(e) => {
												e.currentTarget.style.color = "#ffa366";
												e.currentTarget.style.backgroundColor =
													"rgba(255, 255, 255, 0.1)";
											}}
											target="_blank"
											rel="noopener noreferrer"
										>
											{children}
										</a>
									),
									table: ({ children }) => (
										<table
											style={{
												width: "100%",
												borderCollapse: "collapse",
												margin: "1rem 0",
												border: "1px solid rgba(255, 255, 255, 0.2)",
												fontSize: window.innerWidth < 768 ? "0.9rem" : "1rem",
											}}
										>
											{children}
										</table>
									),
									th: ({ children }) => (
										<th
											style={{
												padding: "0.75rem",
												border: "1px solid rgba(255, 255, 255, 0.2)",
												backgroundColor: "rgba(255, 255, 255, 0.1)",
												fontWeight: 600,
												textAlign: "left",
											}}
										>
											{children}
										</th>
									),
									td: ({ children }) => (
										<td
											style={{
												padding: "0.75rem",
												border: "1px solid rgba(255, 255, 255, 0.2)",
											}}
										>
											{children}
										</td>
									),
									img: ({ src, alt }) => (
										<img
											src={src}
											alt={alt}
											style={{
												maxWidth: "100%",
												height: "auto",
												borderRadius: "8px",
												margin: "1rem 0",
												boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
												display: "block",
												marginLeft: "auto",
												marginRight: "auto",
											}}
										/>
									),
								}}
							>
								{information.content}
							</ReactMarkdown>
						</MarkdownContent>
					)}
				</ContentContainer>
			</main>

			<Modal
				opened={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				title="情報の編集"
				size="xl"
				fullScreen={window.innerWidth < 768}
				styles={{
					title: { color: "#6a4fb6", fontWeight: 600 },
					header: { backgroundColor: "#f8f9fa" },
					body: {
						padding: window.innerWidth < 768 ? "1rem" : "1.5rem",
					},
				}}
			>
				<Tabs
					defaultValue="edit"
					style={{ marginBottom: "1rem" }}
					styles={{
						list: {
							backgroundColor: "#f8f9fa",
							borderRadius: "8px",
							padding: "4px",
						},
						tab: {
							backgroundColor: "transparent",
							color: "#6c757d",
							fontWeight: 600,
							border: "none",
							borderRadius: "6px",
							padding: "12px 20px",
							transition: "all 0.2s ease",
							"&:hover": {
								backgroundColor: "#e9ecef",
								color: "#495057",
							},
							"&[data-active]": {
								backgroundColor: "#d2691e",
								color: "white",
								boxShadow: "0 2px 8px rgba(210, 105, 30, 0.2)",
							},
						},
					}}
				>
					<Tabs.List>
						<Tabs.Tab value="edit" leftSection={<IconCode size={16} />}>
							編集
						</Tabs.Tab>
						<Tabs.Tab value="preview" leftSection={<IconEye size={16} />}>
							プレビュー
						</Tabs.Tab>
					</Tabs.List>

					<Tabs.Panel value="edit" pt="xs">
						<Paper withBorder p="md">
							<ToolbarContainer>
								{markdownButtons.map((button) => (
									<Tooltip key={button.tooltip} label={button.tooltip}>
										<ActionIcon
											variant="light"
											color="violet"
											radius="sm"
											onClick={(e) => {
												e.preventDefault();
												e.stopPropagation();
												button.action();
											}}
											type="button"
										>
											<button.icon size={16} />
										</ActionIcon>
									</Tooltip>
								))}
							</ToolbarContainer>
							<TextareaContainer>
								<Textarea
									ref={textareaRef as React.RefObject<HTMLTextAreaElement>}
									label="コンテンツ（マークダウン対応）"
									value={editingData.content}
									onChange={(e) =>
										setEditingData((prev) => ({
											...prev,
											content: e.target.value,
										}))
									}
									placeholder="メモを書く"
									required
									minRows={window.innerWidth < 768 ? 35 : 45}
									maxRows={window.innerWidth < 768 ? 50 : 60}
									styles={{
										input: {
											fontFamily: "monospace",
											fontSize: window.innerWidth < 768 ? "13px" : "14px",
											lineHeight: 1.5,
											minHeight:
												window.innerWidth < 768
													? "calc(100% + 300px)"
													: "calc(100% + 400px)",
											border: "none",
											borderRadius: "0 0 8px 8px",
										},
										label: {
											display: "none",
										},
									}}
								/>
							</TextareaContainer>
						</Paper>
					</Tabs.Panel>

					<Tabs.Panel value="preview" pt="xs">
						<Paper
							withBorder
							p="md"
							style={{ minHeight: window.innerWidth < 768 ? "600px" : "800px" }}
						>
							<Box style={{ color: "#333" }}>
								<ReactMarkdown
									remarkPlugins={[remarkGfm]}
									components={{
										h1: ({ children }) => (
											<h1
												style={{
													color: "#6a4fb6",
													fontSize: "2rem",
													fontWeight: 800,
													marginBottom: "1rem",
													borderBottom: "2px solid #6a4fb6",
													paddingBottom: "0.5rem",
												}}
											>
												{children}
											</h1>
										),
										h2: ({ children }) => (
											<h2
												style={{
													color: "#6a4fb6",
													fontSize: "1.5rem",
													fontWeight: 700,
													marginTop: "1.5rem",
													marginBottom: "0.5rem",
												}}
											>
												{children}
											</h2>
										),
										h3: ({ children }) => (
											<h3
												style={{
													color: "#6a4fb6",
													fontSize: "1.2rem",
													fontWeight: 600,
													marginTop: "1rem",
													marginBottom: "0.5rem",
												}}
											>
												{children}
											</h3>
										),
										p: ({ children }) => (
											<p style={{ marginBottom: "1rem", lineHeight: 1.6 }}>
												{children}
											</p>
										),
										ul: ({ children }) => (
											<ul style={{ marginBottom: "1rem", paddingLeft: "2rem" }}>
												{children}
											</ul>
										),
										ol: ({ children }) => (
											<ol style={{ marginBottom: "1rem", paddingLeft: "2rem" }}>
												{children}
											</ol>
										),
										li: ({ children }) => (
											<li style={{ marginBottom: "0.5rem" }}>{children}</li>
										),
										blockquote: ({ children }) => (
											<blockquote
												style={{
													borderLeft: "4px solid #6a4fb6",
													paddingLeft: "1rem",
													margin: "1rem 0",
													fontStyle: "italic",
													backgroundColor: "#f8f9fa",
													padding: "1rem",
													borderRadius: "4px",
												}}
											>
												{children}
											</blockquote>
										),
										code: ({ children, className }) => {
											const isInline = !className;
											return isInline ? (
												<code
													style={{
														backgroundColor: "#f1f3f4",
														padding: "0.2rem 0.4rem",
														borderRadius: "4px",
														fontFamily: "monospace",
														fontSize: "0.9em",
													}}
												>
													{children}
												</code>
											) : (
												<pre
													style={{
														backgroundColor: "#f8f9fa",
														padding: "1rem",
														borderRadius: "8px",
														overflowX: "auto",
														margin: "1rem 0",
														border: "1px solid #e9ecef",
													}}
												>
													<code style={{ fontFamily: "monospace" }}>
														{children}
													</code>
												</pre>
											);
										},
										strong: ({ children }) => (
											<strong style={{ fontWeight: 700 }}>{children}</strong>
										),
										em: ({ children }) => (
											<em style={{ fontStyle: "italic" }}>{children}</em>
										),
										a: ({ children, href }) => (
											<a
												href={href}
												style={{
													color: "#ff0000",
													textDecoration: "underline",
													fontWeight: "600",
													textShadow:
														"0 0 3px rgba(255, 255, 255, 0.8), 0 0 6px rgba(255, 255, 255, 0.6)",
													backgroundColor: "rgba(255, 255, 255, 0.2)",
													padding: "3px 6px",
													borderRadius: "4px",
													border: "1px solid rgba(255, 255, 255, 0.3)",
												}}
												target="_blank"
												rel="noopener noreferrer"
											>
												{children}
											</a>
										),
										table: ({ children }) => (
											<table
												style={{
													width: "100%",
													borderCollapse: "collapse",
													margin: "1rem 0",
													border: "1px solid #e9ecef",
												}}
											>
												{children}
											</table>
										),
										th: ({ children }) => (
											<th
												style={{
													padding: "0.75rem",
													border: "1px solid #e9ecef",
													backgroundColor: "#f8f9fa",
													fontWeight: 600,
													textAlign: "left",
												}}
											>
												{children}
											</th>
										),
										td: ({ children }) => (
											<td
												style={{
													padding: "0.75rem",
													border: "1px solid #e9ecef",
												}}
											>
												{children}
											</td>
										),
										img: ({ src, alt }) => (
											<img
												src={src}
												alt={alt}
												style={{
													maxWidth: "100%",
													height: "auto",
													borderRadius: "8px",
													margin: "1rem 0",
													boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
													display: "block",
													marginLeft: "auto",
													marginRight: "auto",
												}}
											/>
										),
									}}
								>
									{editingData.content}
								</ReactMarkdown>
							</Box>
						</Paper>
					</Tabs.Panel>
				</Tabs>

				<Group justify="flex-end" mt="md">
					<Button variant="outline" onClick={() => setIsModalOpen(false)}>
						キャンセル
					</Button>
					<Button onClick={handleSave} loading={isLoading}>
						保存
					</Button>
				</Group>
			</Modal>
		</>
	);
};

export default Information;
