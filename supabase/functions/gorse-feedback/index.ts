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
		"Access-Control-Allow-Methods": "POST, GET, OPTIONS",
	};

	// プリフライトリクエストの処理
	if (req.method === "OPTIONS") {
		return new Response("ok", { headers: corsHeaders });
	}

	// URLパスに基づいて処理を分岐
	const url = new URL(req.url);
	const path = url.pathname.split("/").pop(); // 最後のパスセグメントを取得

	// 類似商品取得のエンドポイント（JWT検証なし）
	if (path === "similar" && req.method === "GET") {
		try {
			const itemId = url.searchParams.get("itemId");
			const n = url.searchParams.get("n") || "5";

			if (!itemId) {
				return new Response(
					JSON.stringify({ error: "itemId parameter is required" }),
					{
						status: 400,
						headers: { ...corsHeaders, "Content-Type": "application/json" },
					}
				);
			}

			const gorseEndpoint =
				Deno.env.get("GORSE_ENDPOINT") || "http://52.198.15.232:8086";
			const gorseApiKey =
				Deno.env.get("GORSE_API_KEY") ||
				"kmKLLA5eCveQTVOVDftScxlWJaKmJJVbfSlPMZYSqno=";

			console.log(`Fetching similar items for ${itemId} from ${gorseEndpoint}`);

			// Gorse APIを呼び出し（HTTP/0.9対応）
			console.log(
				`Calling Gorse API: ${gorseEndpoint}/api/similar/${itemId}?n=${n}`
			);

			try {
				const gorseResponse = await fetch(
					`${gorseEndpoint}/api/similar/${itemId}?n=${n}`,
					{
						headers: {
							"X-API-Key": gorseApiKey,
							"Content-Type": "application/json",
						},
					}
				);

				console.log(`Gorse response status: ${gorseResponse.status}`);

				// HTTP/0.9レスポンスの処理
				const text = await gorseResponse.text();
				console.log(`Gorse response text: ${text.substring(0, 200)}...`);

				let data;

				if (!text.trim()) {
					data = [];
				} else {
					try {
						data = JSON.parse(text);
					} catch (parseError) {
						console.log(`JSON parse error: ${parseError}, using raw text`);
						data = text;
					}
				}

				return new Response(JSON.stringify(data), {
					headers: { ...corsHeaders, "Content-Type": "application/json" },
				});
			} catch (fetchError) {
				console.error(`Fetch error: ${fetchError.message}`);

				// HTTP/0.9エラーの場合は空配列を返す
				if (fetchError.message.includes("HTTP/0.9")) {
					console.log("HTTP/0.9 detected, returning empty array");
					return new Response(JSON.stringify([]), {
						headers: { ...corsHeaders, "Content-Type": "application/json" },
					});
				}

				throw fetchError;
			}

			return new Response(JSON.stringify(data), {
				headers: { ...corsHeaders, "Content-Type": "application/json" },
			});
		} catch (error) {
			console.error("Error in similar items function:", error);
			return new Response(
				JSON.stringify({
					error: "Internal server error",
					details: error.message,
				}),
				{
					status: 500,
					headers: { ...corsHeaders, "Content-Type": "application/json" },
				}
			);
		}
	}

	// POSTリクエストのみ受け付け（フィードバック用）
	if (req.method !== "POST") {
		return new Response(JSON.stringify({ error: "Method not allowed" }), {
			status: 405,
			headers: { ...corsHeaders, "Content-Type": "application/json" },
		});
	}

	// フィードバック処理（JWT検証あり）
	try {
		// 環境変数の取得
		const supabaseUrl = getEnvVar("SUPABASE_URL");
		const supabaseServiceKey = getEnvVar("SUPABASE_SERVICE_ROLE_KEY");
		const gorseEndpoint = getEnvVar("GORSE_ENDPOINT");
		const gorseApiKey = Deno.env.get("GORSE_API_KEY");
		if (!gorseApiKey) {
			throw new Error(
				"GORSE_API_KEY is not set. Please set the environment variable."
			);
		}

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
