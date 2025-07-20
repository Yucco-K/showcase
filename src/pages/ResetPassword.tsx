import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import styled from "styled-components";
import { supabase } from "../lib/supabase";
import { useToast } from "../hooks/useToast";
import { Toast } from "../components/ui/Toast";
import { useAuth } from "../contexts/AuthProvider";

const Overlay = styled.div`
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.8);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1000;
`;

const Container = styled.div`
	background: #1f2937;
	border: 1px solid rgba(255, 255, 255, 0.2);
	border-radius: 12px;
	padding: 32px;
	max-width: 500px;
	width: 90%;
	max-height: 90vh;
	overflow-y: auto;
	color: white;
	display: flex;
	flex-direction: column;
	align-items: center;
`;

const Title = styled.h1`
	text-align: center;
	margin-bottom: 2rem;
	color: #fff;
	font-size: 1.8rem;
	font-weight: 600;
`;

const WarningTitle = styled.h1`
	text-align: center;
	margin-bottom: 2rem;
	color: #f59e0b;
	font-size: 1.8rem;
	font-weight: 600;
`;

const Input = styled.input`
	width: 100%;
	padding: 12px 16px;
	margin-bottom: 16px;
	border-radius: 8px;
	border: 1px solid rgba(255, 255, 255, 0.2);
	background: rgba(255, 255, 255, 0.05);
	color: #fff;
	font-size: 14px;
	box-sizing: border-box;
	&:focus {
		outline: none;
		border-color: #3ea8ff;
		background: rgba(255, 255, 255, 0.1);
	}
	&:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
`;

const Button = styled.button`
	width: 100%;
	padding: 12px 16px;
	border: none;
	border-radius: 8px;
	background: linear-gradient(135deg, #3ea8ff, #0066cc);
	color: #fff;
	font-weight: 600;
	cursor: pointer;
	margin-top: 8px;

	&:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
`;

const ErrorMsg = styled.p`
	color: #ef4444;
	font-size: 0.9rem;
	margin-top: 8px;
	text-align: center;
`;

const InfoMsg = styled.div`
	text-align: center;
	margin-top: 16px;
	padding: 16px;
	background: rgba(255, 255, 255, 0.1);
	border: 1px solid rgba(255, 255, 255, 0.2);
	border-radius: 8px;
	color: #ffffff;
	font-size: 1rem;
	line-height: 1.5;
	font-weight: 500;
`;

const Spinner = styled.div`
	display: inline-block;
	width: 16px;
	height: 16px;
	border: 2px solid rgba(255, 255, 255, 0.3);
	border-radius: 50%;
	border-top-color: #ffffff;
	animation: spin 1s ease-in-out infinite;
	margin-right: 8px;

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
`;

const SuccessMsg = styled.p`
	color: #10b981;
	font-size: 0.9rem;
	margin-top: 8px;
	text-align: center;
`;

const ResetPassword: React.FC = () => {
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const { toast, showSuccess, showError, hideToast } = useToast();
	const { user, session } = useAuth();

	// セッション情報を確認
	useEffect(() => {
		console.log("ResetPassword - AuthProvider session:", session);
		console.log("ResetPassword - AuthProvider user:", user);

		const checkSession = async () => {
			const {
				data: { session: directSession },
			} = await supabase.auth.getSession();
			console.log("ResetPassword - Direct session:", directSession);

			// JWTトークンの詳細を確認
			if (directSession) {
				console.log(
					"ResetPassword - JWT access token:",
					directSession.access_token ? "exists" : "missing"
				);
				console.log(
					"ResetPassword - JWT refresh token:",
					directSession.refresh_token ? "exists" : "missing"
				);
				console.log(
					"ResetPassword - JWT expires at:",
					directSession.expires_at
				);
				console.log(
					"ResetPassword - JWT token type:",
					directSession.token_type
				);
			}

			// ローカルストレージからJWTを確認
			const storedData = localStorage.getItem(
				"sb-ljjptkfrdeiktywbbybr-auth-token"
			);
			let parsedStoredData = null;
			try {
				parsedStoredData = storedData ? JSON.parse(storedData) : null;
			} catch (e) {
				console.log("ResetPassword - Failed to parse stored data:", e);
			}

			console.log("ResetPassword - Full stored data:", parsedStoredData);
			console.log(
				"ResetPassword - Stored access token:",
				parsedStoredData?.access_token ? "exists" : "missing"
			);
			console.log(
				"ResetPassword - Stored refresh token:",
				parsedStoredData?.refresh_token ? "exists" : "missing"
			);
		};
		checkSession();
	}, [session, user]);

	useEffect(() => {
		// URLからトークンとエラー情報を確認
		const token = searchParams.get("token");
		const type = searchParams.get("type");
		const error = searchParams.get("error");
		const errorDescription = searchParams.get("error_description");

		// ハッシュフラグメントからもパラメータを取得
		const hashParams = new URLSearchParams(window.location.hash.substring(1));
		const hashToken = hashParams.get("token");
		const hashType = hashParams.get("type");
		const hashError = hashParams.get("error");
		const hashErrorDescription = hashParams.get("error_description");

		// URLからJWTトークンを直接取得
		const urlAccessToken = searchParams.get("access_token");
		const urlRefreshToken = searchParams.get("refresh_token");
		const hashAccessToken = hashParams.get("access_token");
		const hashRefreshToken = hashParams.get("refresh_token");

		console.log("ResetPassword - Token extraction:", {
			urlAccessToken: urlAccessToken ? "exists" : "missing",
			urlRefreshToken: urlRefreshToken ? "exists" : "missing",
			hashAccessToken: hashAccessToken ? "exists" : "missing",
			hashRefreshToken: hashRefreshToken ? "exists" : "missing",
		});

		// 実際に使用するパラメータ（URLパラメータを優先、なければハッシュから）
		const finalToken = token || hashToken;
		const finalType = type || hashType;
		const finalError = error || hashError;
		const finalErrorDescription = errorDescription || hashErrorDescription;

		console.log("ResetPassword - URL params:", {
			token: finalToken ? "exists" : "missing",
			type: finalType,
			error: finalError,
			errorDescription: finalErrorDescription,
			accessToken: urlAccessToken || hashAccessToken ? "exists" : "missing",
			refreshToken: urlRefreshToken || hashRefreshToken ? "exists" : "missing",
			allParams: Object.fromEntries(searchParams.entries()),
			hashParams: Object.fromEntries(hashParams.entries()),
			rawUrl: window.location.href,
			search: window.location.search,
			hash: window.location.hash,
		});

		// エラーがある場合は適切なメッセージを表示
		if (finalError) {
			let errorMessage = "パスワードリセットリンクに問題があります。";
			if (
				finalError === "access_denied" &&
				finalErrorDescription?.includes("expired")
			) {
				errorMessage =
					"パスワードリセットリンクの有効期限が切れています。新しいリセットメールを送信してください。";
			} else if (finalErrorDescription) {
				errorMessage = decodeURIComponent(
					finalErrorDescription.replace(/\+/g, " ")
				);
			}
			setError(errorMessage);
			console.log(
				"ResetPassword - Error detected:",
				finalError,
				finalErrorDescription
			);
			return;
		}

		// JWTトークンがURLにある場合は直接セッションを設定
		const finalAccessToken = urlAccessToken || hashAccessToken;
		const finalRefreshToken = urlRefreshToken || hashRefreshToken;

		if (finalAccessToken && finalRefreshToken) {
			console.log("ResetPassword - JWT tokens found in URL, setting session");
			console.log(
				"ResetPassword - Access token length:",
				finalAccessToken.length
			);
			console.log(
				"ResetPassword - Refresh token length:",
				finalRefreshToken.length
			);

			const setSessionFromTokens = async () => {
				const { data, error } = await supabase.auth.setSession({
					access_token: finalAccessToken,
					refresh_token: finalRefreshToken,
				});

				if (error) {
					console.error(
						"ResetPassword - Failed to set session from JWT:",
						error
					);
					setError("セッションの設定に失敗しました。");
				} else {
					console.log(
						"ResetPassword - Session set from JWT successfully:",
						data
					);
					console.log("ResetPassword - Session tokens:", {
						access_token: data.session?.access_token ? "exists" : "missing",
						refresh_token: data.session?.refresh_token ? "exists" : "missing",
					});
				}
			};
			setSessionFromTokens();
		} else {
			console.log("ResetPassword - Missing JWT tokens:", {
				access_token: finalAccessToken ? "exists" : "missing",
				refresh_token: finalRefreshToken ? "exists" : "missing",
			});
		}

		// JWTトークンがある場合は、verifyOtpをスキップ
		if (finalAccessToken && finalRefreshToken) {
			console.log(
				"ResetPassword - JWT tokens available, skipping verification"
			);
			return;
		}

		// 通常のトークンがない場合は、ホームにリダイレクト
		if (!finalToken || finalType !== "recovery") {
			console.log(
				"ResetPassword - Missing token or wrong type, redirecting to home"
			);
			// 3秒後に自動的にTopページにリダイレクト
			const timer = setTimeout(() => {
				navigate("/");
			}, 3000);
			return () => clearTimeout(timer);
		}

		// 通常のトークンを検証してセッションを設定
		const verifyToken = async () => {
			console.log("ResetPassword - Verifying token");
			if (!finalToken) {
				setError("トークンが見つかりません。");
				return;
			}

			// Supabaseの最新APIでは、パスワードリセットは自動的にセッションを設定する
			const { data, error } = await supabase.auth.verifyOtp({
				token_hash: finalToken,
				type: "recovery",
			});

			if (error) {
				setError("トークンの検証に失敗しました。");
				console.error("Token verification error:", error);
			} else {
				console.log("ResetPassword - Token verified successfully", data);
				console.log(
					"ResetPassword - Session after verification:",
					data.session
				);
				console.log("ResetPassword - User after verification:", data.user);

				// セッションが設定されたら、パスワード変更画面を表示
				if (data.session) {
					console.log(
						"ResetPassword - Session established, showing password form"
					);
				}
			}
		};

		verifyToken();
	}, [searchParams, navigate]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (password !== confirmPassword) {
			setError("パスワードが一致しません。");
			return;
		}

		if (password.length < 6) {
			setError("パスワードは6文字以上で入力してください。");
			return;
		}

		try {
			setError(null);
			setIsLoading(true);

			// セッションが確立されているか確認
			const {
				data: { session },
			} = await supabase.auth.getSession();
			if (!session) {
				setError(
					"セッションが確立されていません。リンクが無効または期限切れです。"
				);
				return;
			}

			const { error } = await supabase.auth.updateUser({
				password: password,
			});

			if (error) {
				throw error;
			}

			// パスワード更新後、新しいセッションを確立してrefresh tokenを取得
			try {
				const { data: newSession, error: refreshError } =
					await supabase.auth.refreshSession();
				if (!refreshError && newSession.session) {
					console.log("New session established with refresh token");
				}
			} catch (refreshErr) {
				console.log(
					"Session refresh failed, but password update succeeded",
					refreshErr
				);
			}

			setSuccess("パスワードが正常に更新されました。");
			showSuccess("パスワードが正常に更新されました。");

			// 3秒後にログインページにリダイレクト
			setTimeout(() => {
				navigate("/");
			}, 3000);
		} catch (err) {
			if (err instanceof Error) {
				setError(err.message);
				showError(err.message);
			}
		} finally {
			setIsLoading(false);
		}
	};

	const token = searchParams.get("token");
	const type = searchParams.get("type");
	const urlError = searchParams.get("error");
	const accessToken = searchParams.get("access_token");

	// エラーがある場合はエラーメッセージを表示
	if (urlError) {
		return (
			<Overlay onClick={() => navigate("/")}>
				<Container onClick={(e) => e.stopPropagation()}>
					<WarningTitle>エラーが発生しました</WarningTitle>
					<ErrorMsg style={{ fontSize: "1rem", marginBottom: "16px" }}>
						{urlError === "access_denied"
							? "パスワードリセットリンクの有効期限が切れています。新しいリセットメールを送信してください。"
							: "パスワードリセットリンクに問題があります。"}
					</ErrorMsg>
					<div
						style={{ display: "flex", gap: "12px", justifyContent: "center" }}
					>
						<Button onClick={() => navigate("/")}>ログインページに戻る</Button>
						<Button
							onClick={() => navigate("/")}
							style={{
								background: "rgba(34, 197, 94, 0.2)",
								border: "1px solid rgba(34, 197, 94, 0.5)",
							}}
						>
							新しいリセットメールを送信
						</Button>
					</div>
				</Container>
			</Overlay>
		);
	}

	// JWTトークンまたは通常のトークンまたはセッションが必要
	const hasValidToken =
		(token && type === "recovery") ||
		(accessToken && (type === "recovery" || !type)) || // typeがない場合もJWTトークンなら有効
		session; // セッションが確立されている場合は有効とみなす

	console.log("ResetPassword - Page display check:", {
		token: token ? "exists" : "missing",
		type: type || "missing",
		accessToken: accessToken ? "exists" : "missing",
		hasValidToken,
		session: session ? "exists" : "missing",
		url: window.location.href,
	});

	if (!hasValidToken) {
		return (
			<Overlay onClick={() => navigate("/")}>
				<Container onClick={(e) => e.stopPropagation()}>
					<WarningTitle>無効な操作です</WarningTitle>
					<InfoMsg>
						<Spinner />
						ログインページに戻ります...
					</InfoMsg>
				</Container>
			</Overlay>
		);
	}

	return (
		<Overlay onClick={() => navigate("/")}>
			<Container onClick={(e) => e.stopPropagation()}>
				<Title>新しいパスワードを設定</Title>
				<InfoMsg
					style={{
						background: "rgba(34, 197, 94, 0.1)",
						border: "1px solid rgba(34, 197, 94, 0.3)",
						color: "#22c55e",
						marginBottom: "24px",
					}}
				>
					パスワードリセットリンクが有効です。新しいパスワードを設定してください。
				</InfoMsg>
				<form
					onSubmit={handleSubmit}
					style={{ width: "100%", maxWidth: "400px" }}
				>
					<Input
						type="password"
						placeholder="新しいパスワード（6文字以上）"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						disabled={isLoading}
						required
					/>
					<Input
						type="password"
						placeholder="新しいパスワード（確認）"
						value={confirmPassword}
						onChange={(e) => setConfirmPassword(e.target.value)}
						disabled={isLoading}
						required
					/>
					{error && <ErrorMsg>{error}</ErrorMsg>}
					{success && <SuccessMsg>{success}</SuccessMsg>}
					<Button type="submit" disabled={isLoading}>
						{isLoading ? "更新中..." : "パスワードを更新"}
					</Button>
				</form>
				<Toast
					message={toast.message}
					type={toast.type}
					isVisible={toast.isVisible}
					onClose={hideToast}
				/>
			</Container>
		</Overlay>
	);
};

export default ResetPassword;
