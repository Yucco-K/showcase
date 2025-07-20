import React, { createContext, useContext, useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

interface AuthContextValue {
	user: User | null;
	session: Session | null;
	loading: boolean;
	signIn: (email: string, password: string) => Promise<void>;
	signUp: (email: string, password: string) => Promise<void>;
	signOut: () => Promise<void>;
	resetPassword: (email: string) => Promise<void>;
	isAdmin: (user: User | null) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [user, setUser] = useState<User | null>(null);
	const [session, setSession] = useState<Session | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		supabase.auth.getSession().then(({ data }) => {
			setSession(data.session);
			setUser(data.session?.user ?? null);
			setLoading(false);
		});

		const { data: listener } = supabase.auth.onAuthStateChange(
			(event, newSession) => {
				setSession(newSession);
				setUser(newSession?.user ?? null);
			}
		);

		return () => {
			listener.subscription.unsubscribe();
		};
	}, []);

	const signIn = async (email: string, password: string) => {
		const { error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});
		if (error) throw error;
	};

	const signUp = async (email: string, password: string) => {
		// バックエンドで既存ユーザーをチェック
		try {
			const { data: userExists, error: checkError } = await supabase.rpc(
				"check_user_exists",
				{
					email_address: email,
				}
			);

			if (checkError) {
				// チェックに失敗した場合は通常のサインアップ処理を続行
			} else if (userExists) {
				throw new Error("User already registered");
			}
		} catch (error) {
			// バックエンドチェックでエラーが発生した場合は、そのエラーを投げる
			if (
				error instanceof Error &&
				error.message === "User already registered"
			) {
				throw error;
			}
			// その他のエラー（ネットワークエラーなど）の場合は通常のサインアップ処理を続行
		}

		// 開発環境と本番環境で適切なURLを使用
		const redirectUrl = import.meta.env.PROD
			? `${window.location.origin}`
			: `http://localhost:5173`;

		const { error } = await supabase.auth.signUp({
			email,
			password,
			options: {
				emailRedirectTo: redirectUrl,
			},
		});
		if (error) throw error;
	};

	const signOut = async () => {
		const { error } = await supabase.auth.signOut();
		if (error) throw error;
	};

	const resetPassword = async (email: string) => {
		try {
			// 開発環境と本番環境で適切なURLを使用
			const redirectUrl = import.meta.env.PROD
				? `${window.location.origin}/reset-password`
				: `http://localhost:5173/reset-password`;

			// カスタムAPIエンドポイントを使用してJWTトークンを含んだリンクを生成
			const response = await fetch("/api/auth/custom-reset-password", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					email,
					redirectUrl,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to send reset email");
			}

			// カスタムリンクが生成された場合
			if (data.resetLink) {
				// 実際の実装では、ここでメール送信を行う
			}

			// フォールバック: 標準的なSupabaseの機能も並行して使用
			const { error: fallbackError } =
				await supabase.auth.resetPasswordForEmail(email, {
					redirectTo: redirectUrl,
				});

			if (fallbackError) {
				// フォールバックエラーは無視
			}
		} catch {
			// エラーが発生した場合は標準的なSupabaseの機能を使用
			const redirectUrl = import.meta.env.PROD
				? `${window.location.origin}/reset-password`
				: `http://localhost:5173/reset-password`;

			const { error: fallbackError } =
				await supabase.auth.resetPasswordForEmail(email, {
					redirectTo: redirectUrl,
				});

			if (fallbackError) {
				throw fallbackError;
			}
		}
	};

	const adminEmails =
		(import.meta.env.VITE_ADMIN_EMAILS as string | undefined)
			?.split(",")
			.map((e) => e.trim().toLowerCase()) ?? [];
	const isAdmin = (targetUser: User | null) => {
		if (!targetUser) return false;
		return adminEmails.includes(targetUser.email?.toLowerCase() ?? "");
	};

	return (
		<AuthContext.Provider
			value={{
				user,
				session,
				loading,
				signIn,
				signUp,
				signOut,
				resetPassword,
				isAdmin,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
	const ctx = useContext(AuthContext);
	if (!ctx) throw new Error("useAuth must be used within AuthProvider");
	return ctx;
};
