import React from "react";
import styled from "styled-components";

interface AvatarDeleteConfirmationModalProps {
	isOpen: boolean;
	onConfirm: () => void;
	onCancel: () => void;
}

const Overlay = styled.div`
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.7);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1000;
`;

const Modal = styled.div`
	background: #1f2937;
	border: 1px solid rgba(255, 255, 255, 0.2);
	border-radius: 12px;
	padding: 32px;
	max-width: 400px;
	width: 90%;
	text-align: center;
	color: white;
`;

const Title = styled.h2`
	margin: 0 0 16px 0;
	font-size: 20px;
	font-weight: 600;
`;

const Message = styled.p`
	margin: 0 0 24px 0;
	color: rgba(255, 255, 255, 0.8);
	line-height: 1.5;
`;

const ButtonGroup = styled.div`
	display: flex;
	gap: 12px;
	justify-content: center;
`;

const Button = styled.button<{ $variant: "primary" | "secondary" }>`
	padding: 12px 24px;
	border-radius: 8px;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.2s ease;
	border: none;
	font-size: 14px;

	${(props) =>
		props.$variant === "primary"
			? `
		background: #ef4444;
		color: white;
		&:hover {
			background: #dc2626;
		}
	`
			: `
		background: rgba(255, 255, 255, 0.1);
		color: white;
		border: 1px solid rgba(255, 255, 255, 0.3);
		&:hover {
			background: rgba(255, 255, 255, 0.2);
		}
	`}
`;

export const AvatarDeleteConfirmationModal: React.FC<
	AvatarDeleteConfirmationModalProps
> = ({ isOpen, onConfirm, onCancel }) => {
	if (!isOpen) return null;

	return (
		<Overlay onClick={onCancel}>
			<Modal onClick={(e) => e.stopPropagation()}>
				<Title>アバター削除の確認</Title>
				<Message>本当にアバターを削除しますか？</Message>
				<ButtonGroup>
					<Button $variant="secondary" onClick={onCancel}>
						キャンセル
					</Button>
					<Button $variant="primary" onClick={onConfirm}>
						削除
					</Button>
				</ButtonGroup>
			</Modal>
		</Overlay>
	);
};
