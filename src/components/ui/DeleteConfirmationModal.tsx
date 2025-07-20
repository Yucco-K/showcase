import React from "react";
import styled from "styled-components";

interface DeleteConfirmationModalProps {
	isOpen: boolean;
	title?: string;
	message?: string;
	confirmText?: string;
	cancelText?: string;
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
	max-width: 320px;
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
    &:hover { background: #dc2626; }
  `
			: `
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.3);
    &:hover { background: rgba(255, 255, 255, 0.2); }
  `};
`;

export const DeleteConfirmationModal: React.FC<
	DeleteConfirmationModalProps
> = ({
	isOpen,
	title = "削除の確認",
	message = "本当に削除しますか？",
	confirmText = "削除",
	cancelText = "キャンセル",
	onConfirm,
	onCancel,
}) => {
	if (!isOpen) return null;

	return (
		<Overlay onClick={onCancel}>
			<Modal onClick={(e) => e.stopPropagation()}>
				<Title>{title}</Title>
				<Message>{message}</Message>
				<ButtonGroup>
					<Button $variant="secondary" onClick={onCancel}>
						{cancelText}
					</Button>
					<Button $variant="primary" onClick={onConfirm}>
						{confirmText}
					</Button>
				</ButtonGroup>
			</Modal>
		</Overlay>
	);
};
