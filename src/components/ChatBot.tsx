import React, {
	useState,
	useEffect,
	useRef,
	useCallback,
	type FormEvent,
} from "react";
import styled from "styled-components";
import { supabase } from "../lib/supabase";
import { useToast } from "../hooks/useToast";
import { useAuth } from "../contexts/AuthProvider";
import { useProfile } from "../hooks/useSupabase";
import { fetchChatReply } from "../api/chat";
import { getPopularFAQs, type FAQ } from "../data/faq";
import {
	IconSend,
	IconRobot,
	IconUser,
	IconX,
	IconMessageCircle,
} from "@tabler/icons-react";

// Type definitions for chat messages stored in Supabase
interface ChatMessage {
	id: string;
	role: "user" | "assistant";
	content: string;
	created_at: string;
}

// Styled components
const ChatContainer = styled.div<{ $isOpen: boolean; $isClosing: boolean }>`
	position: fixed;
	bottom: 20px;
	right: 20px;
	width: ${({ $isOpen }) => ($isOpen ? "400px" : "60px")};
	height: ${({ $isOpen }) => ($isOpen ? "600px" : "60px")};
	background: linear-gradient(
		135deg,
		rgba(224, 255, 255, 0.95),
		rgba(176, 224, 230, 0.95)
	);
	border-radius: 12px;
	box-shadow: 0 8px 32px rgba(64, 224, 208, 0.2);
	backdrop-filter: blur(20px);
	border: 1px solid rgba(135, 206, 235, 0.3);
	transition: all 0.3s ease;
	z-index: 9999;
	display: flex;
	flex-direction: column;
	overflow: hidden;

	${({ $isClosing }) =>
		$isClosing &&
		`
		animation: fadeToMist 2s ease-out forwards;
		pointer-events: none;
	`}

	@keyframes fadeToMist {
		0% {
			opacity: 1;
			transform: scale(1);
			filter: blur(0px);
		}
		50% {
			opacity: 0.7;
			transform: scale(1.02);
			filter: blur(1px);
		}
		100% {
			opacity: 0;
			transform: scale(1.05);
			filter: blur(5px);
		}
	}

	@media (max-width: 768px) {
		width: ${({ $isOpen }) => ($isOpen ? "calc(100vw - 40px)" : "60px")};
		height: ${({ $isOpen }) => ($isOpen ? "calc(100vh - 40px)" : "60px")};
		bottom: 20px;
		right: 20px;
	}
`;

const ChatToggle = styled.button<{ $isOpen: boolean }>`
	width: 60px;
	height: 60px;
	border-radius: 50%;
	background: linear-gradient(135deg, #40e0d0, #87ceeb);
	border: none;
	color: white;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	position: ${({ $isOpen }) => ($isOpen ? "absolute" : "static")};
	top: ${({ $isOpen }) => ($isOpen ? "10px" : "auto")};
	right: ${({ $isOpen }) => ($isOpen ? "10px" : "auto")};
	z-index: 10000;
	transition: all 0.2s ease;
	box-shadow: 0 4px 12px rgba(64, 224, 208, 0.3);

	&:hover {
		transform: scale(1.05);
		box-shadow: 0 6px 16px rgba(64, 224, 208, 0.4);
		background: linear-gradient(135deg, #20b2aa, #40e0d0);
	}
`;

const ChatHeader = styled.div`
	padding: 16px;
	border-bottom: 1px solid rgba(135, 206, 235, 0.2);
	background: rgba(176, 224, 230, 0.3);

	h3 {
		margin: 0;
		color: #2c5f6e;
		font-size: 16px;
		font-weight: 600;
	}
`;

const MessageArea = styled.div<{ $isClosing: boolean }>`
	flex: 1;
	padding: 16px;
	overflow-y: auto;
	display: flex;
	flex-direction: column;
	gap: 12px;
	max-height: calc(100% - 120px);

	${({ $isClosing }) =>
		$isClosing &&
		`
		.message-content {
			animation: dissolveMessages 2s ease-out forwards;
		}
	`}

	@keyframes dissolveMessages {
		0% {
			opacity: 1;
			transform: translateY(0);
		}
		50% {
			opacity: 0.3;
			transform: translateY(-5px);
		}
		100% {
			opacity: 0;
			transform: translateY(-10px);
		}
	}
`;

const Message = styled.div<{ $isUser: boolean }>`
	display: flex;
	align-items: flex-start;
	gap: 8px;
	flex-direction: ${({ $isUser }) => ($isUser ? "row-reverse" : "row")};

	.icon {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		background: ${({ $isUser }) =>
			$isUser
				? "linear-gradient(135deg, #3ea8ff, #0066cc)"
				: "linear-gradient(135deg, #ffb366, #ffd4a3)"};
		color: ${({ $isUser }) => ($isUser ? "white" : "#8b4513")};
		flex-shrink: 0;
		overflow: hidden;
	}

	.content {
		background: ${({ $isUser }) =>
			$isUser
				? "linear-gradient(135deg, #3ea8ff, #0066cc)"
				: "rgba(255, 255, 255, 0.8)"};
		color: ${({ $isUser }) => ($isUser ? "white" : "#2c1810")};
		padding: 12px 16px;
		border-radius: 18px;
		max-width: 80%;
		word-wrap: break-word;
		line-height: 1.4;
		font-size: 14px;
	}
`;

const UserAvatar = styled.img`
	width: 100%;
	height: 100%;
	object-fit: cover;
	border-radius: 50%;
`;

const InputArea = styled.form`
	padding: 16px;
	border-top: 1px solid rgba(135, 206, 235, 0.2);
	display: flex;
	gap: 8px;
	background: rgba(176, 224, 230, 0.2);
`;

const Input = styled.input`
	flex: 1;
	padding: 12px 16px;
	border: 1px solid rgba(135, 206, 235, 0.3);
	border-radius: 24px;
	background: rgba(255, 255, 255, 0.9);
	color: #2c5f6e;
	font-size: 14px;
	outline: none;

	&:focus {
		border-color: #40e0d0;
		background: rgba(255, 255, 255, 0.95);
		box-shadow: 0 0 0 2px rgba(64, 224, 208, 0.2);
	}

	&::placeholder {
		color: rgba(44, 95, 110, 0.6);
	}
`;

const SendButton = styled.button`
	width: 48px;
	height: 48px;
	border-radius: 50%;
	background: linear-gradient(135deg, #40e0d0, #87ceeb);
	border: none;
	color: white;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.2s ease;
	box-shadow: 0 2px 8px rgba(64, 224, 208, 0.3);

	&:hover:not(:disabled) {
		transform: scale(1.05);
		background: linear-gradient(135deg, #20b2aa, #40e0d0);
		box-shadow: 0 4px 12px rgba(64, 224, 208, 0.4);
	}

	&:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
`;

const LoadingIndicator = styled.div`
	display: flex;
	align-items: center;
	gap: 8px;
	color: #666;
	font-size: 14px;
	padding: 8px 0;

	&::after {
		content: "";
		width: 16px;
		height: 16px;
		border: 2px solid #ddd;
		border-top: 2px solid #ffb366;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
`;

const FAQContainer = styled.div`
	margin-bottom: 16px;
	padding: 12px;
	background: rgba(255, 255, 255, 0.05);
	border-radius: 12px;
	border: 1px solid rgba(135, 206, 235, 0.2);
`;

const FAQTitle = styled.h4`
	margin: 0 0 12px 0;
	color: #40e0d0;
	font-size: 14px;
	font-weight: 600;
	text-align: center;
`;

const FAQTags = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
`;

const FAQTag = styled.button`
	background: linear-gradient(
		135deg,
		rgba(64, 224, 208, 0.2),
		rgba(135, 206, 235, 0.2)
	);
	border: 1px solid rgba(64, 224, 208, 0.4);
	border-radius: 16px;
	color: #2d3748;
	padding: 6px 12px;
	font-size: 12px;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.2s ease;
	white-space: nowrap;

	&:hover {
		background: linear-gradient(
			135deg,
			rgba(64, 224, 208, 0.3),
			rgba(135, 206, 235, 0.3)
		);
		border-color: rgba(64, 224, 208, 0.6);
		transform: translateY(-1px);
		color: #1a202c;
	}

	&:active {
		transform: translateY(0);
	}

	&:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		transform: none;

		&:hover {
			transform: none;
		}
	}
`;

// Main ChatBot component
const ChatBot: React.FC = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [input, setInput] = useState("");
	const [loading, setLoading] = useState(false);
	const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null); // null = loading, false = not authenticated, true = authenticated
	const [isClosing, setIsClosing] = useState(false);
	const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
	const { showError } = useToast();
	const { user } = useAuth();
	const { profile } = useProfile(user?.id);
	const messageAreaRef = useRef<HTMLDivElement>(null);
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);
	const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const [popularFAQs] = useState<FAQ[]>(() => getPopularFAQs(5));

	// 認証状態をチェック
	useEffect(() => {
		const checkAuthStatus = async () => {
			try {
				const {
					data: { user },
				} = await supabase.auth.getUser();

				setIsAuthenticated(!!user);
			} catch (error) {
				console.error("Error checking auth status:", error);
				setIsAuthenticated(false);
			}
		};

		checkAuthStatus();
	}, []);

	// メッセージが更新されたときに自動で最下部にスクロール
	const scrollToBottom = useCallback(() => {
		if (messageAreaRef.current) {
			messageAreaRef.current.scrollTop = messageAreaRef.current.scrollHeight;
		}
	}, []);

	// チャットが開かれた時の初期化（履歴は読み込まず、常にFAQタグを表示）
	useEffect(() => {
		if (!isOpen) return;

		// 毎回新しいセッションとして開始
		setMessages([]);
		setTimeout(scrollToBottom, 100);
	}, [isOpen, scrollToBottom]);

	// タイムアウト管理
	const resetTimeout = useCallback(() => {
		// 既存のタイマーをクリア
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		}
		if (warningTimeoutRef.current) {
			clearTimeout(warningTimeoutRef.current);
		}

		setShowTimeoutWarning(false);

		// 4分後に警告メッセージを表示
		warningTimeoutRef.current = setTimeout(() => {
			setShowTimeoutWarning(true);
			const warningMessage = {
				id: crypto.randomUUID(),
				role: "assistant" as const,
				content:
					"一定時間経過いたしました。続いてのご質問はありませんか？では、いったんチャットを閉じて終了いたします。",
				created_at: new Date().toISOString(),
			};
			setMessages((prev) => [...prev, warningMessage]);
			setTimeout(scrollToBottom, 100);
		}, 4 * 60 * 1000); // 4分

		// 5分後に自動クローズ
		timeoutRef.current = setTimeout(() => {
			setIsClosing(true);
			setTimeout(() => {
				setIsOpen(false);
				// リセット処理はuseEffectで自動実行される
			}, 2000); // 2秒のフェードアウト時間
		}, 5 * 60 * 1000); // 5分
	}, [scrollToBottom]);

	// チャット画面をリセットする関数
	const resetChatState = useCallback(() => {
		setMessages([]);
		setInput("");
		setLoading(false);
		setIsClosing(false);
		setShowTimeoutWarning(false);

		// タイマーをクリア
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		}
		if (warningTimeoutRef.current) {
			clearTimeout(warningTimeoutRef.current);
		}
	}, []);

	// チャットが開かれたときとメッセージが送信されたときにタイマーをリセット
	useEffect(() => {
		if (isOpen) {
			resetTimeout();
		} else {
			// チャットが閉じられたときに画面をリセット
			resetChatState();
		}

		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
			if (warningTimeoutRef.current) {
				clearTimeout(warningTimeoutRef.current);
			}
		};
	}, [isOpen, resetTimeout, resetChatState]);

	// FAQタグクリック時の処理
	const handleFAQClick = useCallback(
		async (faq: FAQ) => {
			// FAQの質問をユーザーメッセージとして追加
			const userMessage = {
				id: crypto.randomUUID(),
				role: "user" as const,
				content: faq.question,
				created_at: new Date().toISOString(),
			};

			setMessages((prev) => [...prev, userMessage]);
			setTimeout(scrollToBottom, 100);

			// タイムアウトをリセット
			resetTimeout();

			// FAQ回答をAIメッセージとして追加
			setTimeout(() => {
				const aiMessage = {
					id: crypto.randomUUID(),
					role: "assistant" as const,
					content: `${faq.answer}\n\n他にご質問がございましたら、お気軽にお尋ねください。`,
					created_at: new Date().toISOString(),
				};
				setMessages((prev) => [...prev, aiMessage]);
				setTimeout(scrollToBottom, 100);
			}, 500); // 0.5秒後に回答を表示

			// データベースにも保存（バックグラウンドで実行）
			try {
				const sessionId = crypto.randomUUID();
				await supabase.from("messages").insert([
					{
						role: "user",
						content: faq.question,
						session_id: sessionId,
						user_id: user?.id || null,
					},
					{
						role: "assistant",
						content: `${faq.answer}\n\n他にご質問がございましたら、お気軽にお尋ねください。`,
						session_id: sessionId,
						user_id: null, // ボットのメッセージは常にnull
					},
				]);
			} catch (error) {
				console.warn("Failed to save FAQ messages to database:", error);
			}
		},
		[scrollToBottom, resetTimeout, user?.id]
	);

	// Handle form submission
	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		const trimmed = input.trim();
		if (!trimmed || loading) return;

		// Append user's message to local state
		const newUserMessage: Omit<ChatMessage, "id" | "created_at"> = {
			role: "user",
			content: trimmed,
		};

		const tempId = crypto.randomUUID();
		setMessages((prev) => [
			...prev,
			{
				id: tempId,
				role: newUserMessage.role,
				content: newUserMessage.content,
				created_at: new Date().toISOString(),
			},
		]);
		setInput("");
		setLoading(true);

		// ユーザーメッセージ追加後にスクロール
		setTimeout(scrollToBottom, 100);

		// タイムアウトをリセット
		resetTimeout();

		// セッションIDを生成
		const sessionId = crypto.randomUUID();

		try {
			// Try to save user's message into Supabase (optional for anonymous users)
			try {
				const { error: insertError } = await supabase.from("messages").insert({
					role: newUserMessage.role,
					content: newUserMessage.content,
					session_id: sessionId,
					user_id: user?.id || null,
				});

				if (insertError && !insertError.message?.includes("Refresh Token")) {
					console.error("Supabase insert error:", insertError);
				}
			} catch (dbError) {
				console.warn(
					"Failed to save user message to database (continuing with local storage only):",
					dbError
				);
			}

			// Get AI response using the API client
			const assistantReply = await fetchChatReply(trimmed);

			// Try to save assistant's reply into Supabase (optional for anonymous users)
			try {
				const { error: assistantInsertError } = await supabase
					.from("messages")
					.insert({
						role: "assistant",
						content: assistantReply,
						session_id: sessionId,
						user_id: null, // ボットのメッセージは常にnull
					});

				if (
					assistantInsertError &&
					!assistantInsertError.message?.includes("Refresh Token")
				) {
					console.error(
						"Supabase insert error (assistant):",
						assistantInsertError
					);
				}
			} catch (dbError) {
				console.warn(
					"Failed to save assistant message to database (continuing with local storage only):",
					dbError
				);
			}

			// Append assistant's reply to local state
			setMessages((prev) => [
				...prev,
				{
					id: crypto.randomUUID(),
					role: "assistant",
					content: assistantReply,
					created_at: new Date().toISOString(),
				},
			]);

			// AI応答追加後にスクロール
			setTimeout(scrollToBottom, 100);
		} catch (err) {
			console.error("Error calling chat endpoint:", err);
			showError(
				"チャットボットの応答に失敗しました。しばらく時間をおいて再度お試しください。"
			);
		} finally {
			setLoading(false);
		}
	};

	// 認証チェックのローディング状態
	if (isAuthenticated === null) {
		return null;
	}

	// 未認証ユーザーにはチャットボットを表示しない
	if (!isAuthenticated) {
		return null;
	}

	return (
		<ChatContainer $isOpen={isOpen} $isClosing={isClosing}>
			<ChatToggle
				$isOpen={isOpen}
				onClick={() => {
					if (!isClosing) {
						if (isOpen) {
							// 手動で閉じる場合
							setIsOpen(false);
						} else {
							// 開く場合
							setIsOpen(true);
						}
					}
				}}
			>
				{isOpen ? <IconX size={24} /> : <IconMessageCircle size={24} />}
			</ChatToggle>

			{isOpen && (
				<>
					<ChatHeader>
						<h3>AI アシスタント</h3>
					</ChatHeader>

					<MessageArea ref={messageAreaRef} $isClosing={isClosing}>
						{messages.length === 0 && (
							<>
								<Message $isUser={false}>
									<div className="icon">
										<IconRobot size={18} />
									</div>
									<div className="content message-content">
										こんにちは！何かご質問はありますか？
										<br />
										よくあるご質問から選択することもできます。
									</div>
								</Message>

								<FAQContainer>
									<FAQTitle>💡 よくあるご質問</FAQTitle>
									<FAQTags>
										{popularFAQs.map((faq) => (
											<FAQTag
												key={faq.id}
												onClick={() => handleFAQClick(faq)}
												disabled={isClosing || showTimeoutWarning}
											>
												{faq.question}
											</FAQTag>
										))}
									</FAQTags>
								</FAQContainer>
							</>
						)}

						{messages.map((msg) => (
							<Message key={msg.id} $isUser={msg.role === "user"}>
								<div className="icon">
									{msg.role === "user" ? (
										profile?.avatar_url ? (
											<UserAvatar src={profile.avatar_url} alt="You" />
										) : (
											<IconUser size={18} />
										)
									) : (
										<IconRobot size={18} />
									)}
								</div>
								<div className={`content message-content`}>{msg.content}</div>
							</Message>
						))}

						{loading && (
							<LoadingIndicator>AI が回答を生成しています...</LoadingIndicator>
						)}
					</MessageArea>

					<InputArea onSubmit={handleSubmit}>
						<Input
							type="text"
							value={input}
							onChange={(e) => setInput(e.target.value)}
							placeholder="メッセージを入力してください..."
							disabled={loading || isClosing || showTimeoutWarning}
							maxLength={500}
						/>
						<SendButton
							type="submit"
							disabled={
								loading || isClosing || showTimeoutWarning || !input.trim()
							}
						>
							<IconSend size={20} />
						</SendButton>
					</InputArea>
				</>
			)}
		</ChatContainer>
	);
};

export default ChatBot;
