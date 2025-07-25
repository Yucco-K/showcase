import React, { useState, useEffect, type FormEvent } from "react";
import styled from "styled-components";
import { supabase } from "../lib/supabase";
import { useToast } from "../hooks/useToast";
import { fetchChatReply } from "../api/chat";
import {
	IconSend,
	IconRobot,
	IconUser,
	IconX,
	IconMessageCircle,
} from "@tabler/icons-react";

// Type definitions for chat messages stored in Supabase
interface ChatMessage {
	id: number;
	role: "user" | "assistant";
	content: string;
	created_at: string;
}

// Styled components
const ChatContainer = styled.div<{ $isOpen: boolean }>`
	position: fixed;
	bottom: 20px;
	right: 20px;
	width: ${({ $isOpen }) => ($isOpen ? "400px" : "60px")};
	height: ${({ $isOpen }) => ($isOpen ? "600px" : "60px")};
	background: rgba(255, 255, 255, 0.95);
	border-radius: 12px;
	box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
	backdrop-filter: blur(20px);
	border: 1px solid rgba(255, 255, 255, 0.2);
	transition: all 0.3s ease;
	z-index: 1000;
	display: flex;
	flex-direction: column;
	overflow: hidden;

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
	background: linear-gradient(135deg, #ffb366, #ffd4a3);
	border: none;
	color: #8b4513;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	position: ${({ $isOpen }) => ($isOpen ? "absolute" : "static")};
	top: ${({ $isOpen }) => ($isOpen ? "10px" : "auto")};
	right: ${({ $isOpen }) => ($isOpen ? "10px" : "auto")};
	z-index: 10;
	transition: all 0.2s ease;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

	&:hover {
		transform: scale(1.05);
		box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
	}
`;

const ChatHeader = styled.div`
	padding: 16px;
	border-bottom: 1px solid rgba(0, 0, 0, 0.1);
	background: rgba(255, 255, 255, 0.1);

	h3 {
		margin: 0;
		color: #2c1810;
		font-size: 16px;
		font-weight: 600;
	}
`;

const MessageArea = styled.div`
	flex: 1;
	padding: 16px;
	overflow-y: auto;
	display: flex;
	flex-direction: column;
	gap: 12px;
	max-height: calc(100% - 120px);
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

const InputArea = styled.form`
	padding: 16px;
	border-top: 1px solid rgba(0, 0, 0, 0.1);
	display: flex;
	gap: 8px;
	background: rgba(255, 255, 255, 0.1);
`;

const Input = styled.input`
	flex: 1;
	padding: 12px 16px;
	border: 1px solid rgba(0, 0, 0, 0.1);
	border-radius: 24px;
	background: rgba(255, 255, 255, 0.8);
	color: #2c1810;
	font-size: 14px;
	outline: none;

	&:focus {
		border-color: #ffb366;
		background: rgba(255, 255, 255, 0.95);
	}

	&::placeholder {
		color: rgba(44, 24, 16, 0.6);
	}
`;

const SendButton = styled.button`
	width: 48px;
	height: 48px;
	border-radius: 50%;
	background: linear-gradient(135deg, #ffb366, #ffd4a3);
	border: none;
	color: #8b4513;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.2s ease;

	&:hover:not(:disabled) {
		transform: scale(1.05);
		background: linear-gradient(135deg, #ff9f4a, #ffcc80);
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

// Main ChatBot component
const ChatBot: React.FC = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [input, setInput] = useState("");
	const [loading, setLoading] = useState(false);
	const { showError } = useToast();

	// Fetch existing chat history from Supabase on component mount
	useEffect(() => {
		if (!isOpen) return;

		const fetchHistory = async () => {
			try {
				const { data, error } = await supabase
					.from("messages")
					.select("id, role, content, created_at")
					.order("created_at", { ascending: true })
					.limit(50); // Limit to recent 50 messages

				if (error) {
					console.error("Error fetching chat history:", error);
					showError("チャット履歴の取得に失敗しました");
				} else {
					setMessages((data || []) as ChatMessage[]);
				}
			} catch (error) {
				console.error("Failed to fetch chat history:", error);
			}
		};

		fetchHistory();
	}, [isOpen, showError]);

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

		const tempId = Date.now();
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

		try {
			// Save user's message into Supabase
			const { error: insertError } = await supabase
				.from("messages")
				.insert({ role: newUserMessage.role, content: newUserMessage.content });

			if (insertError) {
				console.error("Supabase insert error:", insertError);
			}

			// Get AI response using the API client
			const assistantReply = await fetchChatReply(trimmed);

			// Save assistant's reply into Supabase
			const { error: assistantInsertError } = await supabase
				.from("messages")
				.insert({ role: "assistant", content: assistantReply });

			if (assistantInsertError) {
				console.error(
					"Supabase insert error (assistant):",
					assistantInsertError
				);
			}

			// Append assistant's reply to local state
			setMessages((prev) => [
				...prev,
				{
					id: tempId + 1,
					role: "assistant",
					content: assistantReply,
					created_at: new Date().toISOString(),
				},
			]);
		} catch (err) {
			console.error("Error calling chat endpoint:", err);
			showError(
				"チャットボットの応答に失敗しました。しばらく時間をおいて再度お試しください。"
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<ChatContainer $isOpen={isOpen}>
			<ChatToggle $isOpen={isOpen} onClick={() => setIsOpen(!isOpen)}>
				{isOpen ? <IconX size={24} /> : <IconMessageCircle size={24} />}
			</ChatToggle>

			{isOpen && (
				<>
					<ChatHeader>
						<h3>AI アシスタント</h3>
					</ChatHeader>

					<MessageArea>
						{messages.length === 0 && (
							<Message $isUser={false}>
								<div className="icon">
									<IconRobot size={18} />
								</div>
								<div className="content">
									こんにちは！何かご質問はありますか？
								</div>
							</Message>
						)}

						{messages.map((msg) => (
							<Message key={msg.id} $isUser={msg.role === "user"}>
								<div className="icon">
									{msg.role === "user" ? (
										<IconUser size={18} />
									) : (
										<IconRobot size={18} />
									)}
								</div>
								<div className="content">{msg.content}</div>
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
							disabled={loading}
							maxLength={500}
						/>
						<SendButton type="submit" disabled={loading || !input.trim()}>
							<IconSend size={20} />
						</SendButton>
					</InputArea>
				</>
			)}
		</ChatContainer>
	);
};

export default ChatBot;
