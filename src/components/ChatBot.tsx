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
	id: string;
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
	z-index: 10;
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

// Main ChatBot component
const ChatBot: React.FC = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [input, setInput] = useState("");
	const [loading, setLoading] = useState(false);
	const [isAdmin, setIsAdmin] = useState<boolean | null>(null); // null = loading, false = not admin, true = admin
	const { showError } = useToast();

	// Check if user is admin
	useEffect(() => {
		const checkAdminRole = async () => {
			try {
				const {
					data: { user },
				} = await supabase.auth.getUser();

				if (!user) {
					setIsAdmin(false);
					return;
				}

				const { data: profile, error } = await supabase
					.from("profiles")
					.select("role")
					.eq("id", user.id)
					.single();

				if (error) {
					console.error("Error fetching user profile:", error);
					setIsAdmin(false);
					return;
				}

				setIsAdmin(profile?.role === "admin");
			} catch (error) {
				console.error("Error checking admin role:", error);
				setIsAdmin(false);
			}
		};

		checkAdminRole();
	}, []);

	// Fetch existing chat history from Supabase on component mount
	useEffect(() => {
		if (!isOpen) return;

		const fetchHistory = async (page: number = 1) => {
			const limit = 50; // Number of messages per page
			const offset = (page - 1) * limit; // Calculate offset based on page
			try {
				const { data, error } = await supabase
					.from("messages")
					.select("id, role, content, created_at")
					.order("created_at", { ascending: true })
					.range(offset, offset + limit - 1); // Use range for pagination

				if (error) {
					// Handle auth errors gracefully - allow anonymous usage
					if (
						error.message?.includes("Refresh Token") ||
						error.message?.includes("Invalid Refresh Token")
					) {
						console.warn(
							"Authentication token expired, continuing with anonymous access"
						);
						setMessages([]); // Start with empty messages for anonymous users
					} else {
						console.error("Error fetching chat history:", error);
						showError("チャット履歴の取得に失敗しました");
					}
				} else {
					setMessages((data || []) as ChatMessage[]);
				}
			} catch (error) {
				console.error("Failed to fetch chat history:", error);
				// Continue with empty messages if fetch fails
				setMessages([]);
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

		try {
			// Try to save user's message into Supabase (optional for anonymous users)
			try {
				const { error: insertError } = await supabase.from("messages").insert({
					role: newUserMessage.role,
					content: newUserMessage.content,
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
					.insert({ role: "assistant", content: assistantReply });

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
		} catch (err) {
			console.error("Error calling chat endpoint:", err);
			showError(
				"チャットボットの応答に失敗しました。しばらく時間をおいて再度お試しください。"
			);
		} finally {
			setLoading(false);
		}
	};

	// Don't render anything if admin check is still loading
	if (isAdmin === null) {
		return null;
	}

	// Don't render chatbot if user is not admin
	if (!isAdmin) {
		return null;
	}

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
