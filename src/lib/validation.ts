import { z } from "zod";

// メールアドレスのバリデーション
export const emailSchema = z
	.string()
	.min(1, "メールアドレスを入力してください")
	.email("有効なメールアドレスを入力してください")
	.max(254, "メールアドレスが長すぎます");

// パスワードのバリデーション
export const passwordSchema = z
	.string()
	.min(8, "パスワードは8文字以上で入力してください")
	.max(128, "パスワードは128文字以内で入力してください")
	.regex(
		/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
		"パスワードは大文字、小文字、数字を含む必要があります"
	);

// ユーザーネーム（表示名）は日本語を含む Unicode 文字を許可
// 連続スペースや制御文字を防ぐため、改行と制御コード以外の文字を許可
//   - \p{L}  : すべての Unicode 文字(Alphabet & 漢字 & 仮名)
//   - \p{N}  : 数字
//   - スペース・ハイフン・アンダースコアも許可
export const usernameSchema = z
	.string()
	.min(1, "ユーザーネームを入力してください")
	.max(50, "ユーザーネームは50文字以内で入力してください")
	.regex(
		/^[\p{L}\p{N}_\-\s]+$/u,
		"ユーザーネームには日本語を含む文字、数字、スペース、ハイフン、アンダースコアのみ使用できます"
	);

// バイオグラフィーのバリデーション
export const biographySchema = z
	.string()
	.max(500, "バイオグラフィーは500文字以内で入力してください")
	.optional();

// サインアップ用のスキーマ
export const signUpSchema = z.object({
	email: emailSchema,
	password: passwordSchema,
});

// ログイン用のスキーマ
export const signInSchema = z.object({
	email: emailSchema,
	password: z.string().min(1, "パスワードを入力してください"),
});

// パスワードリセット用のスキーマ
export const resetPasswordSchema = z.object({
	email: emailSchema,
});

// プロフィール更新用のスキーマ
export const profileUpdateSchema = z.object({
	username: usernameSchema.optional(),
	biography: biographySchema,
});

// パスワード変更用のスキーマ
export const changePasswordSchema = z
	.object({
		currentPassword: z.string().min(1, "現在のパスワードを入力してください"),
		newPassword: passwordSchema,
		confirmPassword: z.string().min(1, "確認用パスワードを入力してください"),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: "新しいパスワードと確認用パスワードが一致しません",
		path: ["confirmPassword"],
	});

// 型定義
export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
