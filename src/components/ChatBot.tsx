import React, {
	useState,
	useEffect,
	useRef,
	useCallback,
	useMemo,
} from "react";
import styled, { keyframes } from "styled-components";
import { fetchChatReply } from "../api/chat";
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
	height: 600px;
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

const MessageBubble = styled.div<{ sender: "user" | "bot" | "system" }>`
	align-self: ${({ sender }) =>
		sender === "user" ? "flex-end" : "flex-start"};
	background: ${({ sender }) =>
		sender === "user"
			? "linear-gradient(135deg, #007bff, #0056b3)"
			: "rgba(255, 255, 255, 0.15)"};
	color: white;
	padding: 10px 15px;
	border-radius: 18px;
	max-width: 80%;
	word-wrap: break-word;
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
		text-decoration: underline;
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
`;

export const ChatBot: React.FC = () => {
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
	const messageAreaRef = useRef<HTMLDivElement>(null);

	const faqCategories = useMemo(() => getFAQCategories(), []);

	const initialMessages = useMemo(
		() => [
			{
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
	}, []);

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
		const userMessage: Message = { text: input, sender: "user" };
		setMessages((prev) => [...prev, userMessage]);
		const currentInput = input;
		setInput("");
		setIsLoading(true);
		setError(null);

		try {
			const reply = await fetchChatReply(currentInput);
			const botMessage: Message = { text: reply, sender: "bot" };
			setMessages((prev) => [...prev, botMessage]);
		} catch (err) {
			setError("エラーが発生しました。しばらくしてから再度お試しください。");
		} finally {
			setIsLoading(false);
		}
	};

	const handleCategorySelect = (category: FAQ["category"]) => {
		setSelectedCategory(category);
		const faqs = getFAQsByCategory(category);
		const categoryMessages: Message[] = faqs.map((faq) => ({
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
				{ text: faq.question, sender: "user" },
				{ text: faq.answer, sender: "bot" },
			];
			setMessages((prev) => [...prev, ...faqMessages]);
			setSelectedCategory(null); // 回答後はカテゴリ選択に戻る
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
						{messages.map((msg, index) => (
							<MessageBubble key={index} sender={msg.sender}>
								{msg.sender === "system" ? (
									<FAQButton onClick={() => handleFAQSelect(msg.text)}>
										{msg.text}
									</FAQButton>
								) : (
									msg.text
								)}
							</MessageBubble>
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
				</Wrapper>
			)}
		</>
	);
};

export default ChatBot;
