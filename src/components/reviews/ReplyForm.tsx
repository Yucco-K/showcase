import React, { useState } from "react";
import styled from "styled-components";

const ReplyFormContainer = styled.div`
	margin-top: 16px;
	padding: 16px;
	background: rgba(255, 255, 255, 0.05);
	border-radius: 8px;
	border: 1px solid rgba(255, 255, 255, 0.1);
	width: 100%;
	max-width: 100%;
	margin-left: 0;
	margin-right: 0;

	@media (max-width: 600px) {
		padding: 20px;
		margin-top: 20px;
		border-radius: 12px;
	}
`;

const ReplyTextArea = styled.textarea`
	width: 100%;
	min-height: 140px;
	padding: 12px;
	border-radius: 6px;
	border: 1px solid rgba(255, 255, 255, 0.2);
	background: rgba(255, 255, 255, 0.05);
	color: #fff;
	font-size: 16px;
	resize: vertical;
	font-family: inherit;
	box-sizing: border-box;
	line-height: 1.5;
	word-wrap: break-word;
	word-break: break-word;
	overflow-wrap: break-word;
	white-space: pre-wrap;

	&::placeholder {
		color: rgba(255, 255, 255, 0.5);
	}

	&:focus {
		outline: none;
		border-color: #3b82f6;
		background: rgba(255, 255, 255, 0.1);
	}
	// mobile
	@media (max-width: 600px) {
		width: 92%;
		min-height: 120px;
		font-size: 16px;
		padding: 12px;
	}
`;

const ReplyButtons = styled.div`
	display: flex;
	gap: 12px;
	margin-top: 8px;

	@media (max-width: 600px) {
		gap: 12px;
		margin-top: 8px;
	}
`;

const ReplyButton = styled.button<{ $primary?: boolean }>`
	padding: 12px 24px;
	border-radius: 8px;
	font-size: 16px;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.2s ease;
	border: none;

	${(props) =>
		props.$primary
			? `
		background: linear-gradient(135deg, #3b82f6, #1d4ed8);
		color: white;
		
		&:hover {
			background: linear-gradient(135deg, #2563eb, #1e40af);
		}
	`
			: `
		background: rgba(255,255,255,0.15);
		color: #333;
		border: 1px solid #ccc;
		
		&:hover {
			background: rgba(255,255,255,0.2);
		}
	`}
	// mobile
	@media (max-width: 600px) {
		padding: 12px 24px;
		font-size: 16px;
	}
`;

interface ReplyFormProps {
	onSubmit: (comment: string) => void;
	onCancel: () => void;
	placeholder?: string;
}

export const ReplyForm: React.FC<ReplyFormProps> = ({
	onSubmit,
	onCancel,
	placeholder = "返信を書いてください...",
}) => {
	const [comment, setComment] = useState("");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (comment.trim()) {
			onSubmit(comment.trim());
			setComment("");
		}
	};

	return (
		<ReplyFormContainer>
			<form onSubmit={handleSubmit}>
				<ReplyTextArea
					value={comment}
					onChange={(e) => setComment(e.target.value)}
					placeholder={placeholder}
					required
				/>
				<ReplyButtons>
					<ReplyButton type="submit" $primary style={{ whiteSpace: "nowrap" }}>
						返信
					</ReplyButton>
					<ReplyButton
						type="button"
						onClick={onCancel}
						style={{ whiteSpace: "nowrap" }}
					>
						キャンセル
					</ReplyButton>
				</ReplyButtons>
			</form>
		</ReplyFormContainer>
	);
};
