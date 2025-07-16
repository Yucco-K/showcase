import React, { useEffect } from "react";
import styled from "styled-components";

interface ToastProps {
	message: string;
	type?: "success" | "error" | "info" | "warning";
	duration?: number;
	onClose: () => void;
	isVisible: boolean;
}

const ToastContainer = styled.div<{ $isVisible: boolean; $type: string }>`
	position: fixed;
	top: 20px;
	right: 20px;
	background: ${({ $type }) => {
		switch ($type) {
			case "success":
				return "linear-gradient(135deg, #10b981, #059669)";
			case "error":
				return "linear-gradient(135deg, #f97316, #ea580c)";
			case "warning":
				return "linear-gradient(135deg, #f59e0b, #d97706)";
			default:
				return "linear-gradient(135deg, #3b82f6, #1d4ed8)";
		}
	}};
	color: white;
	padding: 16px 24px;
	border-radius: 8px;
	box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
	font-weight: 600;
	z-index: 3000;
	transform: translateX(${({ $isVisible }) => ($isVisible ? "0" : "100%")});
	opacity: ${({ $isVisible }) => ($isVisible ? "1" : "0")};
	transition: all 0.3s ease;
	max-width: 400px;
	word-wrap: break-word;
`;

const CloseButton = styled.button`
	background: none;
	border: none;
	color: white;
	font-size: 18px;
	cursor: pointer;
	margin-left: 12px;
	padding: 0;
	opacity: 0.8;
	transition: opacity 0.2s ease;

	&:hover {
		opacity: 1;
	}
`;

export const Toast: React.FC<ToastProps> = ({
	message,
	type = "info",
	duration = 5000,
	onClose,
	isVisible,
}) => {
	console.log("Toast render:", { message, type, isVisible });

	useEffect(() => {
		if (isVisible && duration > 0) {
			const timer = setTimeout(() => {
				onClose();
			}, duration);

			return () => clearTimeout(timer);
		}
	}, [isVisible, duration, onClose]);

	if (!isVisible) return null;

	return (
		<ToastContainer $isVisible={isVisible} $type={type} data-testid="toast">
			<span>{message}</span>
			<CloseButton onClick={onClose}>&times;</CloseButton>
		</ToastContainer>
	);
};
