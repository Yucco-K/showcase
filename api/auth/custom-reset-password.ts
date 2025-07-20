import { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Service Role Keyを使用してSupabaseクライアントを作成
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
	auth: {
		autoRefreshToken: false,
		persistSession: false,
	},
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
	// CORS設定
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
	res.setHeader("Access-Control-Allow-Headers", "Content-Type");

	if (req.method === "OPTIONS") {
		return res.status(200).end();
	}

	if (req.method !== "POST") {
		return res.status(405).json({ error: "Method not allowed" });
	}

	try {
		const { email, redirectUrl } = req.body;

		if (!email || !redirectUrl) {
			return res
				.status(400)
				.json({ error: "Email and redirectUrl are required" });
		}

		// Supabase Admin APIを使用してパスワードリセット用のリンクを生成
		const { data, error } = await supabase.auth.admin.generateLink({
			type: "recovery",
			email: email,
			options: {
				redirectTo: redirectUrl,
			},
		});

		console.log("Admin generateLink result:", {
			success: !error,
			hasData: !!data,
			hasProperties: !!data?.properties,
			hasActionLink: !!data?.properties?.action_link,
			hasHashed: !!data?.properties?.hashed_token,
			hasEmailOtp: !!data?.properties?.email_otp,
			hasVerificationType: !!data?.properties?.verification_type,
		});

		if (error) {
			console.error("Generate link error:", error);
			return res.status(500).json({ error: "Failed to generate reset link" });
		}

		// 生成されたリンクを確認
		const actionLink = data.properties?.action_link;
		if (!actionLink) {
			return res.status(500).json({ error: "Failed to generate action link" });
		}

		console.log("Generated action link:", actionLink);

		// リンクからJWTトークンを抽出
		const url = new URL(actionLink);
		const access_token = url.searchParams.get("access_token");
		const refresh_token = url.searchParams.get("refresh_token");
		const token = url.searchParams.get("token");
		const type = url.searchParams.get("type");

		console.log("Extracted tokens:", {
			access_token: access_token
				? `${access_token.substring(0, 20)}...`
				: "missing",
			refresh_token: refresh_token
				? `${refresh_token.substring(0, 20)}...`
				: "missing",
			token: token ? `${token.substring(0, 20)}...` : "missing",
			type,
		});

		// カスタムリンクを作成
		let customResetLink: string;
		if (access_token && refresh_token) {
			// JWTトークンが利用可能な場合
			customResetLink = `${redirectUrl}?access_token=${access_token}&refresh_token=${refresh_token}&type=recovery`;
		} else if (token && type) {
			// 通常のトークンの場合
			customResetLink = `${redirectUrl}?token=${token}&type=${type}`;
		} else {
			// フォールバック: 元のリンクを使用
			console.log("No JWT tokens found, using original action link");
			customResetLink = actionLink;
		}

		return res.status(200).json({
			success: true,
			resetLink: customResetLink,
			originalLink: actionLink,
			tokens: {
				access_token: access_token ? "present" : "missing",
				refresh_token: refresh_token ? "present" : "missing",
				token: token ? "present" : "missing",
				type,
			},
			message: "Custom reset link generated successfully",
		});
	} catch (error: unknown) {
		console.error("Custom reset password error:", error);
		return res.status(500).json({
			error: "Internal server error",
			details: error instanceof Error ? error.message : "Unknown error",
		});
	}
}
