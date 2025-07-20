import React, { useState } from "react";
import styled from "styled-components";
import { useAuth } from "../../contexts/AuthProvider";
import { useToast } from "../../hooks/useToast";
import { Toast } from "../ui/Toast";
import { useLoginAttempts } from "../../hooks/useLoginAttempts";
import { usePreventDoubleClick } from "../../hooks/usePreventDoubleClick";
import {
	signUpSchema,
	signInSchema,
	resetPasswordSchema,
} from "../../lib/validation";

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

const Modal = styled.div.attrs({ className: "login-modal" })`
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
	margin-left: auto;
	margin-right: auto;
	display: block;
	max-width: 300px;
	border-radius: 8px;
	border: 1px solid rgba(255, 255, 255, 0.2);
	background: rgba(255, 255, 255, 0.05);
	color: #fff;
	&:focus {
		outline: none;
		border-color: #3ea8ff;
	}

	@media (max-width: 768px) {
		max-width: 280px;
		width: 280px;
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
	color: #dc2626;
	font-size: 0.9rem;
	margin-top: 8px;
	text-align: center;
	font-weight: 500;
`;

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
	const { signIn, signUp, resetPassword } = useAuth();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);
	const [isSignUp, setIsSignUp] = useState(false);
	const [isResetMode, setIsResetMode] = useState(false);
	const { toast, showSuccess, showError, hideToast } = useToast();
	const [isLoading, setIsLoading] = useState(false);
	const { isSubmitting, preventDoubleClick } = usePreventDoubleClick(1000);

	// ブロック解除時にエラーメッセージをクリアするコールバック
	const handleBlockReleased = React.useCallback(() => {
		setError(null);
		setSuccess(null);
	}, []);

	const {
		remainingAttempts,
		isBlocked,
		timeRemainingFormatted,
		recordFailedAttempt,
		resetAttempts,
	} = useLoginAttempts(handleBlockReleased);

	const handleSubmit = async () => {
		preventDoubleClick(async () => {
			try {
				setError(null);
				setSuccess(null);
				setIsLoading(true);

				// ログインがブロックされている場合
				if (isBlocked) {
					return;
				}

				// バリデーション
				try {
					if (isResetMode) {
						resetPasswordSchema.parse({ email });
					} else if (isSignUp) {
						signUpSchema.parse({ email, password });
					} else {
						signInSchema.parse({ email, password });
					}
				} catch (validationError) {
					if (validationError instanceof Error) {
						// Zodエラーメッセージを適切に処理
						const message = validationError.message;

						// JSON形式の場合は最初のエラーメッセージを抽出
						if (message.startsWith("[") && message.endsWith("]")) {
							try {
								const errors = JSON.parse(message);
								if (errors.length > 0) {
									const firstError = errors[0];
									setError(firstError.message);
								} else {
									setError("入力内容に問題があります");
								}
							} catch {
								setError("入力内容に問題があります");
							}
						} else {
							setError(message);
						}
						return;
					}
				}

				if (isResetMode) {
					await resetPassword(email);
					showSuccess("パスワードリセット用のメールを送信しました。");
					setIsResetMode(false);
					return;
				}

				if (isSignUp) {
					await signUp(email, password);
					const successMsg =
						"認証メールを送信しました。メールを確認してアカウントを有効化してください。";
					setSuccess(successMsg);
					showSuccess(successMsg);
					// フォームをリセット
					setEmail("");
					setPassword("");
					setIsSignUp(false);
					// トーストが十分表示されるまで待ってからモーダルを閉じる
					setTimeout(() => {
						onClose();
					}, 4000);
				} else {
					await signIn(email, password);
					// ログイン成功時は試行回数をリセット
					resetAttempts();
					showSuccess("ログインしました！");
					// フォームをリセット
					setEmail("");
					setPassword("");
					// ログイン成功時は即座に閉じる
					setTimeout(() => {
						onClose();
					}, 1000);
				}
			} catch (err) {
				if (err instanceof Error) {
					// ログイン失敗時は試行回数を記録（サインアップやリセットモードでない場合のみ）
					if (
						!isSignUp &&
						!isResetMode &&
						err.message.includes("Invalid login credentials")
					) {
						recordFailedAttempt();
					}

					// より分かりやすいエラーメッセージに変換
					let errorMessage = err.message;
					if (
						err.message.includes("User already registered") ||
						err.message.includes("already been registered") ||
						err.message.includes("already exists") ||
						err.message.includes("duplicate key") ||
						err.message.includes("already registered") ||
						err.message.includes("email already")
					) {
						errorMessage =
							"このメールアドレスは既に登録されています。ログインしてください。";
					} else if (err.message.includes("Invalid email")) {
						errorMessage = "無効なメールアドレスです。";
					} else if (err.message.includes("Password should be at least")) {
						errorMessage = "パスワードは6文字以上で入力してください。";
					} else if (err.message.includes("Invalid login credentials")) {
						errorMessage = `メールアドレスまたはパスワードが間違っています。${
							remainingAttempts > 0
								? `残り再試行回数: ${remainingAttempts - 1}回`
								: ""
						}`;
					}

					setError(errorMessage);
					// サインアップ時のエラーはトーストでも表示
					if (isSignUp) {
						showError(errorMessage);
					} else if (!err.message.includes("Invalid login credentials")) {
						// ログイン失敗の場合はトーストを表示しない（モーダル内のエラーメッセージのみ）
						showError(errorMessage);
					}
				}
			} finally {
				setIsLoading(false);
			}
		});
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !isLoading && !isSubmitting) {
			handleSubmit();
		}
	};

	if (!isOpen) return null;

	return (
		<Backdrop onClick={onClose}>
			<Modal onClick={(e) => e.stopPropagation()}>
				<Title>
					{isResetMode
						? "パスワードリセット"
						: isSignUp
						? "サインアップ"
						: "ログイン"}
				</Title>
				<Input
					placeholder="Email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					onKeyPress={handleKeyPress}
					disabled={isLoading || isSubmitting}
				/>
				{!isResetMode && (
					<Input
						placeholder="Password"
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						onKeyPress={handleKeyPress}
						disabled={isLoading || isSubmitting}
					/>
				)}
				{error && <ErrorMsg>{error}</ErrorMsg>}
				{success && <ErrorMsg style={{ color: "#10b981" }}>{success}</ErrorMsg>}
				{isBlocked && (
					<ErrorMsg
						style={{ color: "#ef4444", fontSize: "0.9rem", fontWeight: "bold" }}
					>
						ログインが制限されています。残り時間: {timeRemainingFormatted}
					</ErrorMsg>
				)}
				<Button
					$variant="primary"
					onClick={handleSubmit}
					disabled={isLoading || isSubmitting || isBlocked}
				>
					{isLoading
						? "処理中..."
						: isResetMode
						? "パスワードリセットメール送信"
						: isSignUp
						? "サインアップ"
						: "ログイン"}
				</Button>
				{!isResetMode && (
					<Button
						$variant="secondary"
						onClick={() => setIsSignUp((prev) => !prev)}
						disabled={isLoading || isSubmitting}
					>
						{isSignUp ? "ログインに切替" : "アカウント作成"}
					</Button>
				)}
				<Button
					$variant="secondary"
					onClick={() => {
						setIsResetMode((prev) => !prev);
						setIsSignUp(false);
						setError(null);
					}}
					disabled={isLoading || isSubmitting}
				>
					{isResetMode ? "ログインに戻る" : "パスワードを忘れた場合"}
				</Button>
			</Modal>
			<Toast
				message={toast.message}
				type={toast.type}
				isVisible={toast.isVisible}
				onClose={hideToast}
			/>
		</Backdrop>
	);
};
