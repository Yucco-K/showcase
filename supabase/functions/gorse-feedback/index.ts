import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Gorse関連の型定義
interface GorseFeedback {
	FeedbackType: string;
	UserId: string;
	ItemId: string;
	Timestamp: string;
	Comment?: string;
}

interface GorseClient {
	insertFeedbacks: (feedbacks: GorseFeedback[]) => Promise<void>;
}

// 簡易Gorseクライアント実装
const createGorseClient = (endpoint: string, apiKey: string): GorseClient => {
	return {
		async insertFeedbacks(feedbacks: GorseFeedback[]) {
			const response = await fetch(`${endpoint}/api/feedback`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"X-API-Key": apiKey,
				},
				body: JSON.stringify(feedbacks),
			});

			if (!response.ok) {
				throw new Error(
					`Gorse API error: ${response.status} ${response.statusText}`
				);
			}
		},
	};
};

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
		const supabaseUrl = getEnvVar("SUPABASE_URL");
		const supabaseServiceKey = getEnvVar("SUPABASE_SERVICE_ROLE_KEY");
		const gorseEndpoint = getEnvVar("GORSE_ENDPOINT");
		const gorseApiKey = Deno.env.get("GORSE_API_KEY") || "";

		// Supabaseクライアントの初期化
		const supabase = createClient(supabaseUrl, supabaseServiceKey);

		// Gorseクライアントの初期化
		const gorse = createGorseClient(gorseEndpoint, gorseApiKey);

		// リクエストボディの解析
		const { user_id, item_id, feedback_type, comment } = await req.json();

		// 必須パラメータの検証
		if (!user_id || !item_id || !feedback_type) {
			return new Response(
				JSON.stringify({
					error: "Missing required parameters: user_id, item_id, feedback_type",
				}),
				{
					status: 400,
					headers: { ...corsHeaders, "Content-Type": "application/json" },
				}
			);
		}

		// ユーザーの存在確認（オプション）
		const { data: userExists } = await supabase
			.from("profiles")
			.select("id")
			.eq("id", user_id)
			.single();

		if (!userExists) {
			console.warn(`User ${user_id} not found in profiles table`);
		}

		// 商品の存在確認（オプション）
		const { data: productExists } = await supabase
			.from("products")
			.select("id")
			.eq("id", item_id)
			.single();

		if (!productExists) {
			console.warn(`Product ${item_id} not found in products table`);
		}

		// Gorseにフィードバックを送信
		const feedback: GorseFeedback = {
			FeedbackType: feedback_type,
			UserId: user_id,
			ItemId: item_id,
			Timestamp: new Date().toISOString(),
			Comment: comment || undefined,
		};

		await gorse.insertFeedbacks([feedback]);

		// 成功レスポンス
		return new Response(
			JSON.stringify({
				success: true,
				message: "Feedback sent to Gorse successfully",
				feedback: feedback,
			}),
			{
				status: 200,
				headers: { ...corsHeaders, "Content-Type": "application/json" },
			}
		);
	} catch (error) {
		console.error("Error in gorse-feedback function:", error);

		return new Response(
			JSON.stringify({
				error: "Internal server error",
				message: error instanceof Error ? error.message : "Unknown error",
			}),
			{
				status: 500,
				headers: { ...corsHeaders, "Content-Type": "application/json" },
			}
		);
	}
});
