import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// OpenAI APIのレスポンス型定義
interface OpenAIMessage {
	role: "system" | "user" | "assistant";
	content: string;
}

interface OpenAIRequest {
	model: string;
	messages: OpenAIMessage[];
	max_tokens?: number;
	temperature?: number;
}

interface OpenAIResponse {
	choices: Array<{
		message: {
			content: string;
		};
	}>;
}

// 環境変数の取得と検証
const getEnvVar = (name: string): string => {
	const value = Deno.env.get(name);
	if (!value) {
		throw new Error(`Environment variable ${name} is not set`);
	}
	return value;
};

serve(async (req: Request) => {
	// CORS対応
	const corsHeaders = {
		"Access-Control-Allow-Origin": "*",
		"Access-Control-Allow-Headers":
			"authorization, x-client-info, apikey, content-type",
		"Access-Control-Allow-Methods": "POST, OPTIONS",
	};

	// プリフライトリクエストの処理
	if (req.method === "OPTIONS") {
		return new Response("ok", { headers: corsHeaders });
	}

	// POSTリクエストのみ受け付け
	if (req.method !== "POST") {
		return new Response(JSON.stringify({ error: "Method not allowed" }), {
			status: 405,
			headers: { ...corsHeaders, "Content-Type": "application/json" },
		});
	}

	try {
		// 環境変数の取得
		const openaiApiKey = getEnvVar("OPENAI_API_KEY");
		const supabaseUrl = getEnvVar("SUPABASE_URL");
		const supabaseServiceKey = getEnvVar("SUPABASE_SERVICE_ROLE_KEY");

		// 認証トークンの取得
		const authHeader = req.headers.get("authorization");
		if (!authHeader) {
			return new Response(
				JSON.stringify({ error: "Missing authorization header" }),
				{
					status: 401,
					headers: { ...corsHeaders, "Content-Type": "application/json" },
				}
			);
		}

		// Supabaseクライアントの初期化（認証トークン付き）
		const supabase = createClient(supabaseUrl, supabaseServiceKey, {
			global: { headers: { Authorization: authHeader } },
		});

		// ユーザー認証の確認
		const token = authHeader.replace("Bearer ", "");
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser(token);

		if (authError || !user) {
			return new Response(
				JSON.stringify({ error: "Invalid authentication token" }),
				{
					status: 401,
					headers: { ...corsHeaders, "Content-Type": "application/json" },
				}
			);
		}

		// リクエストボディの解析
		const { message } = await req.json();

		// 必須パラメータの検証
		if (!message || typeof message !== "string") {
			return new Response(
				JSON.stringify({
					error: "Missing or invalid message parameter",
				}),
				{
					status: 400,
					headers: { ...corsHeaders, "Content-Type": "application/json" },
				}
			);
		}

		// メッセージ長の制限
		if (message.length > 1000) {
			return new Response(
				JSON.stringify({
					error: "Message too long. Maximum 1000 characters allowed.",
				}),
				{
					status: 400,
					headers: { ...corsHeaders, "Content-Type": "application/json" },
				}
			);
		}

		// OpenAI APIリクエストの構築
		const openaiRequest: OpenAIRequest = {
			model: "gpt-4.1-nano", // GPT-4.1 nanoモデルを使用
			messages: [
				{
					role: "system",
					content: `あなたは親切で知識豊富なAIアシスタントです。
					以下のルールに従って日本語で回答してください：
					1. 丁寧語を使用する
					2. 簡潔で分かりやすい回答を心がける
					3. 専門用語を使う場合は説明を加える
					4. 不適切な内容や危険な内容については回答を控える
					5. 最大300文字程度で回答する`,
				},
				{
					role: "user",
					content: message,
				},
			],
			max_tokens: 500,
			temperature: 0.7,
		};

		// OpenAI APIを呼び出し
		console.log("Calling OpenAI API...");
		const openaiResponse = await fetch(
			"https://api.openai.com/v1/chat/completions",
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${openaiApiKey}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify(openaiRequest),
			}
		);

		if (!openaiResponse.ok) {
			const errorText = await openaiResponse.text();
			console.error("OpenAI API error:", openaiResponse.status, errorText);

			return new Response(
				JSON.stringify({
					error: "OpenAI API call failed",
					details: `Status: ${openaiResponse.status}`,
				}),
				{
					status: 500,
					headers: { ...corsHeaders, "Content-Type": "application/json" },
				}
			);
		}

		const openaiData: OpenAIResponse = await openaiResponse.json();
		const reply =
			openaiData.choices[0]?.message?.content ||
			"申し訳ございませんが、応答を生成できませんでした。";

		console.log("OpenAI API call successful");

		// 成功レスポンス
		return new Response(
			JSON.stringify({
				reply: reply,
				success: true,
			}),
			{
				status: 200,
				headers: { ...corsHeaders, "Content-Type": "application/json" },
			}
		);
	} catch (error) {
		console.error("Error in chat function:", error);

		return new Response(
			JSON.stringify({
				error: "Internal server error",
				message: error instanceof Error ? error.message : "Unknown error",
				reply:
					"申し訳ございませんが、現在チャットサービスが利用できません。しばらく時間をおいて再度お試しください。",
			}),
			{
				status: 500,
				headers: { ...corsHeaders, "Content-Type": "application/json" },
			}
		);
	}
});
