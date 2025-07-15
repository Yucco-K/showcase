import React, { useState } from "react";
import styled from "styled-components";
import { useAuth } from "../../contexts/AuthProvider";

interface LoginModalProps {
	isOpen: boolean;
	onClose: () => void;
}

const Backdrop = styled.div`
	position: fixed;
	inset: 0;
	background: rgba(0, 0, 0, 0.6);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1000;
`;

const Modal = styled.div`
	width: 400px;
	background: #1e1e2f;
	border-radius: 12px;
	padding: 32px;
	box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
`;

const Title = styled.h2`
	margin: 0 0 24px 0;
	color: #fff;
	text-align: center;
`;

const Input = styled.input`
	width: 100%;
	padding: 12px 16px;
	margin-bottom: 16px;
	border-radius: 8px;
	border: 1px solid rgba(255, 255, 255, 0.2);
	background: rgba(255, 255, 255, 0.05);
	color: #fff;
	&:focus {
		outline: none;
		border-color: #3ea8ff;
	}
`;

const Button = styled.button<{ $variant?: "primary" | "secondary" }>`
	width: 100%;
	padding: 12px 16px;
	border: none;
	border-radius: 8px;
	font-weight: 600;
	cursor: pointer;
	margin-top: 8px;
	${({ $variant }) =>
		$variant === "secondary"
			? `background: rgba(255,255,255,0.2); color:#fff;`
			: `background: linear-gradient(135deg,#3EA8FF,#0066CC); color:#fff;`}
`;

const ErrorMsg = styled.p`
	color: #ef4444;
	font-size: 0.9rem;
	margin-top: 8px;
`;

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
	const { signIn, signUp } = useAuth();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isSignUp, setIsSignUp] = useState(false);

	const handleSubmit = async () => {
		try {
			setError(null);
			if (isSignUp) {
				await signUp(email, password);
			} else {
				await signIn(email, password);
			}
			onClose();
		} catch (err) {
			if (err instanceof Error) setError(err.message);
		}
	};

	if (!isOpen) return null;

	return (
		<Backdrop onClick={onClose}>
			<Modal onClick={(e) => e.stopPropagation()}>
				<Title>{isSignUp ? "サインアップ" : "ログイン"}</Title>
				<Input
					placeholder="Email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
				/>
				<Input
					placeholder="Password"
					type="password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
				/>
				{error && <ErrorMsg>{error}</ErrorMsg>}
				<Button $variant="primary" onClick={handleSubmit}>
					{isSignUp ? "サインアップ" : "ログイン"}
				</Button>
				<Button
					$variant="secondary"
					onClick={() => setIsSignUp((prev) => !prev)}
				>
					{isSignUp ? "ログインに切替" : "アカウント作成"}
				</Button>
			</Modal>
		</Backdrop>
	);
};
