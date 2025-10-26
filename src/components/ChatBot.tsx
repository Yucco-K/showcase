import React, {
	useState,
	useEffect,
	useRef,
	useCallback,
	useMemo,
} from "react";
import styled, { keyframes } from "styled-components";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { fetchChatReply, getChatRemainingRequests } from "../api/chat";
import {
	FAQ_DATA,
	getFAQCategories,
	getFAQsByCategory,
	type FAQ,
} from "../data/faq";
import {
	IconSend,
	IconMessageCircle,
	IconX,
	IconRobot,
	IconUser,
} from "@tabler/icons-react";
import { useAuth } from "../contexts/AuthProvider";
import { useProfile } from "../hooks/useSupabase";

interface Message {
	id: string;
	text: string;
	sender: "user" | "bot" | "system";
}

const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
`;

const fadeOut = keyframes`
  from { opacity: 1; transform: scale(1); }
  to { opacity: 0; transform: scale(0.95); }
`;

const Wrapper = styled.div<{ $isClosing: boolean }>`
	position: fixed;
	bottom: 20px;
	right: 20px;
	width: 400px;
	height: 698px;
	background: rgba(19, 21, 25, 0.85);
	backdrop-filter: blur(10px);
	border-radius: 12px;
	box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
	border: 1px solid rgba(255, 255, 255, 0.18);
	display: flex;
	flex-direction: column;
	animation: ${({ $isClosing }) => ($isClosing ? fadeOut : fadeIn)} 0.3s
		ease-out forwards;
	z-index: 1000;

	@media (max-width: 480px) {
		width: calc(100vw - 40px);
		height: calc(100vh - 90px);
	}
`;

const ChatButton = styled.button`
	position: fixed;
	bottom: 20px;
	right: 20px;
	width: 60px;
	height: 60px;
	border-radius: 50%;
	background: linear-gradient(135deg, #3ea8ff, #0066cc);
	border: none;
	color: white;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 4px 12px rgba(0, 102, 204, 0.4);
	cursor: pointer;
	z-index: 999;
`;

const Header = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 12px;
	background: linear-gradient(135deg, #2c3e50, #1a2833);
	border-bottom: 1px solid rgba(255, 255, 255, 0.2);
	position: relative;
`;

const HeaderTitle = styled.span`
	font-weight: bold;
	color: white;
	position: absolute;
	left: 50%;
	transform: translateX(-50%);
	white-space: nowrap;
	line-height: 1;
	margin-top: 2px;
`;

const TopButton = styled.button`
	background: none;
	border: 1px solid rgba(255, 255, 255, 0.4);
	color: white;
	padding: 4px 8px;
	border-radius: 4px;
	cursor: pointer;
	font-size: 0.8rem;
	transition: all 0.2s ease;
	z-index: 1;

	&:hover {
		background: rgba(255, 255, 255, 0.1);
		border-color: rgba(255, 255, 255, 0.7);
	}
`;

const CloseButton = styled.button`
	background: none;
	border: none;
	color: white;
	border-radius: 50%;
	cursor: pointer;
	font-size: 20px;
	width: 28px;
	height: 28px;
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1;

	&:hover {
		background: rgba(255, 255, 255, 0.2);
	}
`;

const MessageArea = styled.div`
	flex: 1;
	padding: 16px;
	overflow-y: auto;
	display: flex;
	flex-direction: column;
	gap: 12px;
`;

const MessageContainer = styled.div<{ $sender: "user" | "bot" | "system" }>`
	display: flex;
	gap: 8px;
	align-items: flex-start;
	margin: 10px;
	flex-direction: ${({ $sender }) =>
		$sender === "user" ? "row-reverse" : "row"};
`;

const Avatar = styled.div<{ $sender: "user" | "bot" }>`
	width: 32px;
	height: 32px;
	border-radius: 50%;
	background: ${({ $sender }) =>
		$sender === "user"
			? "linear-gradient(135deg, #007bff, #0056b3)"
			: "linear-gradient(135deg, #10b981, #059669)"};
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const MessageBubble = styled.div<{ $sender: "user" | "bot" | "system" }>`
	padding: 10px 15px;
	border-radius: 20px;
	max-width: 80%;
	background: ${({ $sender }) =>
		$sender === "user"
			? "linear-gradient(135deg, #007bff, #0056b3)"
			: "rgba(255, 255, 255, 0.15)"};
	color: white;
	text-align: left;
	word-wrap: break-word;
	box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
	opacity: 0;
	animation: ${fadeIn} 0.3s forwards;

	/* Markdown styling */
	p {
		margin: 0.5em 0;
		&:first-child {
			margin-top: 0;
		}
		&:last-child {
			margin-bottom: 0;
		}
	}

	ul,
	ol {
		margin: 0.5em 0;
		padding-left: 1.5em;
	}

	li {
		margin: 0.25em 0;
	}

	code {
		background: rgba(0, 0, 0, 0.2);
		padding: 2px 6px;
		border-radius: 4px;
		font-family: "Courier New", monospace;
		font-size: 0.9em;
	}

	pre {
		background: rgba(0, 0, 0, 0.3);
		padding: 10px;
		border-radius: 6px;
		overflow-x: auto;
		margin: 0.5em 0;

		code {
			background: none;
			padding: 0;
		}
	}

	strong {
		font-weight: 600;
	}

	em {
		font-style: italic;
	}

	a {
		color: #a5c9ff;
		text-decoration: underline;
	}
`;

const FAQButton = styled.button`
	background: none;
	border: none;
	padding: 0;
	margin: 0;
	color: #a5c9ff;
	cursor: pointer;
	text-align: left;
	width: 100%;
	font-size: inherit;

	&:hover {
		opacity: 0.8;
	}
`;

const InputArea = styled.div`
	padding: 16px;
	border-top: 1px solid rgba(255, 255, 255, 0.1);
	display: flex;
	gap: 8px;
`;

const Input = styled.input`
	flex: 1;
	padding: 12px;
	border-radius: 8px;
	border: 1px solid rgba(255, 255, 255, 0.3);
	background: rgba(255, 255, 255, 0.1);
	color: white;

	&::placeholder {
		color: rgba(255, 255, 255, 0.6);
	}
`;

const SendButton = styled.button`
	width: 48px;
	height: 48px;
	border-radius: 8px;
	border: none;
	background: #007bff;
	color: white;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;

	&:disabled {
		opacity: 0.5;
	}
`;

const Spinner = styled.div`
	border: 2px solid #f3f3f3;
	border-top: 2px solid #3498db;
	border-radius: 50%;
	width: 18px;
	height: 18px;
	animation: spin 1s linear infinite;

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
`;

const FAQContainer = styled.div`
	padding: 12px;
	border-top: 1px solid rgba(255, 255, 255, 0.1);
	max-height: 200px;
	overflow-y: auto;
`;

const CategoryButton = styled.button`
	display: block;
	width: 100%;
	padding: 10px;
	margin-bottom: 8px;
	background: rgba(255, 255, 255, 0.1);
	color: white;
	border: 1px solid rgba(255, 255, 255, 0.2);
	border-radius: 8px;
	cursor: pointer;
`;

const BackButton = styled.button`
	background: rgba(255, 255, 255, 0.2);
	border: none;
	color: white;
	padding: 8px 16px;
	border-radius: 6px;
	cursor: pointer;
	margin-bottom: 12px;
	margin-left: 12px;

	&:hover {
		background: rgba(255, 255, 255, 0.3);
	}
`;

const ErrorMessage = styled.div`
	color: #ffcccc;
	padding: 12px;
	text-align: center;
	background: rgba(255, 100, 100, 0.2);
	white-space: pre-line;
	line-height: 1.5;
`;

const RateLimitInfo = styled.div`
	padding: 8px 12px;
	font-size: 0.75rem;
	color: rgba(255, 255, 255, 0.6);
	text-align: center;
	border-top: 1px solid rgba(255, 255, 255, 0.1);
	background: rgba(0, 0, 0, 0.2);

	span {
		margin: 0 8px;
	}

	.warning {
		color: #ffcc00;
	}

	.danger {
		color: #ff6b6b;
	}
`;

export const ChatBot: React.FC = () => {
	const { user } = useAuth();
	const isAuthenticated = !!user;
	const [isOpen, setIsOpen] = useState(false);
	const [isClosing, setIsClosing] = useState(false);
	const [messages, setMessages] = useState<Message[]>([]);
	const [input, setInput] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [selectedCategory, setSelectedCategory] = useState<
		FAQ["category"] | null
	>(null);
	const [isMounted, setIsMounted] = useState(false);
	const [remainingRequests, setRemainingRequests] = useState<{
		hourly: number;
		daily: number;
	}>({ hourly: isAuthenticated ? 50 : 10, daily: isAuthenticated ? 100 : 10 });
	const messageAreaRef = useRef<HTMLDivElement>(null);

	const faqCategories = useMemo(() => getFAQCategories(), []);

	const initialMessages = useMemo(
		(): Message[] => [
			{
				id: `bot-initial-${Date.now()}`,
				text: "こんにちは！Showcase・コンシェルジュです。ご用の際はお気軽にお声がけください。",
				sender: "bot" as const,
			},
		],
		[]
	);

	const resetChatState = useCallback(() => {
		setMessages(initialMessages);
		setSelectedCategory(null);
		setInput("");
		setError(null);
	}, [initialMessages]);

	useEffect(() => {
		setIsMounted(true);
		// 初回レート制限情報を取得
		const remaining = getChatRemainingRequests(isAuthenticated);
		setRemainingRequests(remaining);
	}, [isAuthenticated]);

	useEffect(() => {
		if (isOpen) {
			resetChatState();
		}
	}, [isOpen, resetChatState]);

	useEffect(() => {
		if (messageAreaRef.current) {
			messageAreaRef.current.scrollTop = messageAreaRef.current.scrollHeight;
		}
	}, [messages]);

	const handleSendMessage = async () => {
		if (input.trim() === "") return;
		const userMessage: Message = {
			id: `user-${Date.now()}`,
			text: input,
			sender: "user",
		};
		setMessages((prev) => [...prev, userMessage]);
		const currentInput = input;
		setInput("");
		setIsLoading(true);
		setError(null);

		try {
			const reply = await fetchChatReply(currentInput, isAuthenticated);
			const botMessage: Message = {
				id: `bot-${Date.now()}`,
				text: reply,
				sender: "bot",
			};
			setMessages((prev) => [...prev, botMessage]);

			// ボット返信後、メッセージエリアを最下部にスクロール（返信の1行目が見えるように）
			setTimeout(() => {
				if (messageAreaRef.current) {
					messageAreaRef.current.scrollTop =
						messageAreaRef.current.scrollHeight;
				}
			}, 100);

			// レート制限情報を更新
			const remaining = getChatRemainingRequests(isAuthenticated);
			setRemainingRequests(remaining);
			console.log(
				`[Chat] 残りのリクエスト数 - 時間: ${remaining.hourly}, 日: ${remaining.daily}`
			);
		} catch (err) {
			if (err instanceof Error) {
				// レート制限エラーの場合は見やすく整形
				if (err.message.includes("制限")) {
					setError(`申し訳ありません。\n${err.message}`);
				} else {
					setError(
						`エラーが発生しました。しばらくしてから再度お試しください。\n(${err.message})`
					);
				}
			} else {
				setError("予期せぬエラーが発生しました。");
			}
		} finally {
			setIsLoading(false);
		}
	};

	const handleCategorySelect = (category: FAQ["category"]) => {
		setSelectedCategory(category);
		const faqs = getFAQsByCategory(category);
		const categoryMessages: Message[] = faqs.map((faq, index) => ({
			id: `faq-cat-${category}-${index}`,
			text: faq.question,
			sender: "system" as const,
		}));
		setMessages((prev) => [...prev, ...categoryMessages]);
	};

	const handleBackToCategories = () => {
		setSelectedCategory(null);
		setMessages(initialMessages);
	};

	const handleFAQSelect = (question: string) => {
		const faq = FAQ_DATA.find((f) => f.question === question);
		if (faq) {
			const faqMessages: Message[] = [
				{ id: `faq-q-${faq.id}`, text: faq.question, sender: "user" },
				{ id: `faq-a-${faq.id}`, text: faq.answer, sender: "bot" },
			];
			setMessages((prev) => [...prev, ...faqMessages]);
			setSelectedCategory(null); // カテゴリ選択に戻る
			// FAQ選択はローカルデータなのでレート制限にカウントしない
		}
	};

	const handleClose = () => {
		setIsClosing(true);
		setTimeout(() => {
			setIsOpen(false);
			setIsClosing(false);
		}, 300);
	};

	if (!isMounted) {
		return null;
	}

	const showTopButton = messages.length > 1 || selectedCategory;
	const showFAQCategories = !selectedCategory && messages.length === 1;
	const showBackToCategories = !isLoading && selectedCategory;

	return (
		<>
			{!isOpen && (
				<ChatButton onClick={() => setIsOpen(true)}>
					<IconMessageCircle size={24} />
				</ChatButton>
			)}
			{isOpen && (
				<Wrapper $isClosing={isClosing}>
					<Header>
						<div>
							{showTopButton && (
								<TopButton onClick={resetChatState}>TOPへ</TopButton>
							)}
						</div>
						<HeaderTitle>Showcase・コンシェルジュ</HeaderTitle>
						<CloseButton onClick={handleClose}>×</CloseButton>
					</Header>

					{error && <ErrorMessage>{error}</ErrorMessage>}

					<MessageArea ref={messageAreaRef}>
						{messages.map((msg) => (
							<MessageContainer key={msg.id} $sender={msg.sender}>
								{msg.sender !== "system" && (
									<Avatar $sender={msg.sender as "user" | "bot"}>
										{msg.sender === "bot" ? (
											<IconRobot size={20} />
										) : (
											<IconUser size={20} />
										)}
									</Avatar>
								)}
								<MessageBubble $sender={msg.sender}>
									{msg.sender === "system" ? (
										<FAQButton onClick={() => handleFAQSelect(msg.text)}>
											{msg.text}
										</FAQButton>
									) : msg.sender === "bot" ? (
										<ReactMarkdown remarkPlugins={[remarkGfm]}>
											{msg.text}
										</ReactMarkdown>
									) : (
										msg.text
									)}
								</MessageBubble>
							</MessageContainer>
						))}
					</MessageArea>

					{showFAQCategories ? (
						<FAQContainer>
							<p
								style={{
									color: "white",
									textAlign: "center",
									fontSize: "0.9rem",
									marginBottom: "12px",
								}}
							>
								または、以下のカテゴリから選択してください
							</p>
							{faqCategories.map((category) => (
								<CategoryButton
									key={category}
									onClick={() => handleCategorySelect(category)}
								>
									{category}
								</CategoryButton>
							))}
						</FAQContainer>
					) : (
						showBackToCategories && (
							<BackButton onClick={handleBackToCategories}>
								カテゴリに戻る
							</BackButton>
						)
					)}

					<InputArea>
						<Input
							type="text"
							value={input}
							onChange={(e) => setInput(e.target.value)}
							onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
							placeholder="メッセージを入力..."
						/>
						<SendButton onClick={handleSendMessage} disabled={isLoading}>
							{isLoading ? <Spinner /> : <IconSend size={18} />}
						</SendButton>
					</InputArea>

					<RateLimitInfo>
						<span
							className={
								remainingRequests.hourly <= (isAuthenticated ? 10 : 3)
									? "danger"
									: remainingRequests.hourly <= (isAuthenticated ? 20 : 5)
									? "warning"
									: ""
							}
						>
							残り: {remainingRequests.hourly}/{isAuthenticated ? 50 : 10}{" "}
							(1時間)
						</span>{" "}
						<span
							className={
								remainingRequests.daily <= (isAuthenticated ? 20 : 3)
									? "danger"
									: remainingRequests.daily <= (isAuthenticated ? 40 : 5)
									? "warning"
									: ""
							}
						>
							{remainingRequests.daily}/{isAuthenticated ? 100 : 10} (1日)
						</span>{" "}
						<span style={{ fontSize: "0.7rem", opacity: 0.7 }}>
							※ FAQは除く
						</span>
					</RateLimitInfo>
				</Wrapper>
			)}
		</>
	);
};

export default ChatBot;
