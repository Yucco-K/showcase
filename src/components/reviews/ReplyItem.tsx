import React from "react";
import styled from "styled-components";
import { useAuth } from "../../contexts/AuthProvider";
import type { Review } from "../../types/review";
import { ReplyForm } from "./ReplyForm";

const ReplyContainer = styled.div`
	margin-top: 8px;
	padding: 8px 16px 8px 28px; /* left padding for indent */
	background: rgba(255, 255, 255, 0.03);
	border-left: 3px solid rgba(59, 130, 246, 0.5);
	border-radius: 0 8px 8px 0;
	width: 100%;
	box-sizing: border-box;
`;

const ReplyContent = styled.div`
	color: rgba(255, 255, 255, 0.9);
	font-size: 16px;
	line-height: 1.5;
	font-weight: 500;
	word-wrap: break-word;
	word-break: break-word;
	overflow-wrap: break-word;
	white-space: pre-wrap;

	@media (max-width: 600px) {
		font-size: 18px;
		line-height: 1.6;
	}
`;

const ReplyMeta = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-top: 8px;
	font-size: 14px;
	color: rgba(255, 255, 255, 0.6);

	@media (max-width: 600px) {
		font-size: 16px;
		margin-top: 10px;
	}
`;

const ReplyActions = styled.div`
	display: flex;
	gap: 8px;
	align-items: center;
`;

const ReplyActionButton = styled.button`
	background: rgba(255, 255, 255, 0.1);
	border: 1px solid rgba(255, 255, 255, 0.2);
	color: rgba(255, 255, 255, 0.8);
	cursor: pointer;
	font-size: 14px;
	padding: 6px 10px;
	border-radius: 6px;
	transition: all 0.2s ease;
	margin-left: 8px;
	min-width: 32px;
	height: 32px;
	display: flex;
	align-items: center;
	justify-content: center;

	&:hover {
		background: rgba(255, 255, 255, 0.2);
		color: #ffffff;
		border-color: rgba(255, 255, 255, 0.4);
		transform: translateY(-1px);
	}

	&:active {
		transform: translateY(0);
	}

	@media (max-width: 600px) {
		font-size: 16px;
		padding: 8px 12px;
		min-width: 40px;
		height: 40px;
		border-radius: 8px;
	}
`;

interface ReplyItemProps {
	reply: Review;
	onDelete?: (replyId: string) => Promise<void>;
	onEdit?: (replyId: string, newComment: string) => Promise<void>;
	onReply?: (
		replyId: string,
		comment: string
	) => Promise<{ error?: string | { message: string } } | void>;
	canDelete?: boolean | null;
	canEdit?: boolean | null;
	canReply?: boolean | null;
}

export const ReplyItem: React.FC<ReplyItemProps> = ({
	reply,
	onDelete,
	onEdit,
	onReply,
	canDelete = false,
	canEdit = false,
	canReply = false,
}) => {
	const { user, isAdmin } = useAuth();
	const [isEditing, setIsEditing] = React.useState(false);
	const [isReplying, setIsReplying] = React.useState(false);
	const [editComment, setEditComment] = React.useState(reply.comment ?? "");
	const [isRepliesExpanded, setIsRepliesExpanded] = React.useState(false);

	// 編集モードに入るたびに最新コメントをロード
	const startEdit = () => {
		setEditComment(reply.comment ?? "");
		setIsEditing(true);
		setIsReplying(false); // 返信モードを無効化
	};

	const cancelEdit = () => {
		setEditComment(reply.comment ?? "");
		setIsEditing(false);
	};

	const handleReply = async (comment: string) => {
		if (!onReply) return;
		try {
			const result = await onReply(reply.id, comment);
			// エラーが返された場合の処理
			if (result && result.error) {
				alert(result.error);
				return;
			}
			setIsReplying(false);
		} catch (error) {
			console.error("Reply submission error:", error);
			alert("返信の投稿に失敗しました。");
		}
	};

	const cancelReply = () => {
		setIsReplying(false);
	};

	const startReply = () => {
		setIsReplying(true);
		setIsEditing(false); // 編集モードを無効化
	};

	const handleEdit = async (newComment: string) => {
		if (!onEdit) return;
		try {
			console.log(
				"ReplyItem handleEdit called for reply:",
				reply.id,
				"with comment:",
				newComment
			);
			await onEdit(reply.id, newComment);
			setIsEditing(false);
		} catch (error) {
			console.error("Edit submission error:", error);
		}
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("ja-JP", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	return (
		<ReplyContainer>
			{/* アバターと名前 */}
			<div
				style={{
					display: "flex",
					alignItems: "center",
					gap: "8px",
					marginBottom: "8px",
				}}
			>
				{reply.profiles?.avatar_url ? (
					<img
						src={reply.profiles.avatar_url}
						alt="avatar"
						style={{
							width: "20px",
							height: "20px",
							borderRadius: "50%",
							objectFit: "cover",
						}}
					/>
				) : (
					<div
						style={{
							width: "20px",
							height: "20px",
							borderRadius: "50%",
							background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							fontSize: "10px",
							color: "white",
							fontWeight: "600",
						}}
					>
						{reply.profiles?.full_name
							? reply.profiles.full_name.charAt(0).toUpperCase()
							: "U"}
					</div>
				)}
				<span
					style={{
						fontSize: "12px",
						color: "rgba(255, 255, 255, 0.8)",
						fontWeight: "500",
					}}
				>
					{reply.profiles?.full_name || "匿名ユーザー"}
				</span>
			</div>

			{isEditing ? (
				<div>
					<textarea
						value={editComment}
						onChange={(e) => setEditComment(e.target.value)}
						style={{
							width: "100%",
							minHeight: 60,
							wordWrap: "break-word",
							wordBreak: "break-word",
							overflowWrap: "break-word",
							whiteSpace: "pre-wrap",
							boxSizing: "border-box",
						}}
						placeholder="返信を編集..."
					/>
					<div
						style={{
							marginTop: 8,
							display: "flex",
							gap: "8px",
							alignItems: "center",
						}}
					>
						<ReplyActionButton
							onClick={() => handleEdit(editComment)}
							style={{
								background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
								color: "white",
								border: "none",
								fontWeight: "600",
								whiteSpace: "nowrap",
							}}
						>
							保存
						</ReplyActionButton>
						<ReplyActionButton
							onClick={cancelEdit}
							style={{
								background: "rgba(255,255,255,0.15)",
								color: "#333",
								border: "1px solid #ccc",
								whiteSpace: "nowrap",
							}}
						>
							キャンセル
						</ReplyActionButton>
					</div>
				</div>
			) : (
				<>
					<ReplyContent>{reply.comment}</ReplyContent>
					<ReplyMeta>
						<span
							style={{
								whiteSpace: "nowrap",
								marginBottom: "8px",
								display: "block",
							}}
						>
							{formatDate(reply.created_at)}
						</span>
					</ReplyMeta>
					<ReplyActions>
						{canReply && !isEditing && (reply.reply_level ?? 0) < 3 && (
							<ReplyActionButton
								onClick={startReply}
								aria-label="reply to reply"
							>
								💬
							</ReplyActionButton>
						)}
						{canEdit && !isReplying && (
							<ReplyActionButton onClick={startEdit} aria-label="edit reply">
								✏️
							</ReplyActionButton>
						)}
						{canDelete && !isEditing && !isReplying && (
							<ReplyActionButton
								onClick={() => onDelete?.(reply.id)}
								aria-label="delete reply"
							>
								🗑️
							</ReplyActionButton>
						)}
					</ReplyActions>
				</>
			)}

			{isReplying && !isEditing && (
				<ReplyForm
					onSubmit={handleReply}
					onCancel={cancelReply}
					placeholder="返信の返信を書いてください..."
				/>
			)}

			{/* ネストした返信を表示 */}
			{reply.replies && reply.replies.length > 0 && !isEditing && (
				<div style={{ marginTop: "8px", marginLeft: "20px" }}>
					{/* アコーディオンヘッダー */}
					<button
						style={{
							cursor: "pointer",
							display: "flex",
							alignItems: "center",
							gap: "8px",
							padding: "4px 8px",
							borderRadius: "4px",
							background: "rgba(255, 255, 255, 0.05)",
							marginBottom: isRepliesExpanded ? "8px" : "0",
							border: "none",
							color: "inherit",
							fontSize: "inherit",
							fontFamily: "inherit",
						}}
						onClick={() => setIsRepliesExpanded(!isRepliesExpanded)}
						type="button"
						aria-label={`${reply.replies.length}件の返信を${
							isRepliesExpanded ? "閉じる" : "開く"
						}`}
					>
						<span
							style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.7)" }}
						>
							{isRepliesExpanded ? "▼" : "▶"}
						</span>
						<span
							style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.7)" }}
						>
							{reply.replies.length}件の返信
						</span>
					</button>

					{/* アコーディオンコンテンツ */}
					{isRepliesExpanded && (
						<div>
							{reply.replies.map((nestedReply) => {
								console.log(
									"Rendering nested reply:",
									nestedReply.id,
									"under parent:",
									reply.id
								);
								return (
									<ReplyItem
										key={nestedReply.id}
										reply={nestedReply}
										onEdit={onEdit}
										onReply={onReply}
										onDelete={onDelete}
										canEdit={
											user && (nestedReply.user_id === user.id || isAdmin(user))
										}
										canDelete={
											user && (nestedReply.user_id === user.id || isAdmin(user))
										}
										canReply={!!user}
									/>
								);
							})}
						</div>
					)}
				</div>
			)}
		</ReplyContainer>
	);
};
