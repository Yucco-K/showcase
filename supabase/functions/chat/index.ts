import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { OpenAI } from "https://esm.sh/openai@4.0.0";

// 環境変数の型安全な取得
const getEnv = (key: string): string => {
	const value = Deno.env.get(key);
	if (!value) throw new Error(`環境変数 ${key} が設定されていません`);
	return value;
};

// 意図分類の列挙型
enum QueryIntent {
	PRODUCT_INQUIRY = "PRODUCT_INQUIRY",
	SUPPORT = "SUPPORT",
	PRICING = "PRICING",
	GENERAL_INFO = "GENERAL_INFO",
	UNKNOWN = "UNKNOWN",
}

// ユーザークエリのインターフェース
interface UserQuery {
	text: string;
	timestamp: Date;
	sessionId: string;
}

// 検索結果のインターフェース
interface SearchResult {
	content: string;
	source: string;
	relevanceScore: number;
}

// チャットボット応答のインターフェース
interface ChatbotResponse {
	text: string;
	confidence: number;
	type: "DIRECT" | "FALLBACK";
}

class PortfolioShowcaseChatbot {
	private supabase: any;
	private openai: OpenAI;

	constructor() {
		this.supabase = createClient(
			getEnv("SUPABASE_URL"),
			getEnv("SUPABASE_ANON_KEY")
		);

		this.openai = new OpenAI({
			apiKey: getEnv("OPENAI_API_KEY"),
		});
	}

	// 意図分類メソッド
	private classifyIntent(query: string): QueryIntent {
		const lowerQuery = query.toLowerCase();

		const intentPatterns = [
			{ intent: QueryIntent.PRICING, keywords: ["価格", "料金", "値段"] },
			{
				intent: QueryIntent.PRODUCT_INQUIRY,
				keywords: ["製品", "商品", "アプリ"],
			},
			{ intent: QueryIntent.SUPPORT, keywords: ["サポート", "問題", "助け"] },
		];

		for (const pattern of intentPatterns) {
			if (pattern.keywords.some((keyword) => lowerQuery.includes(keyword))) {
				return pattern.intent;
			}
		}

		return QueryIntent.UNKNOWN;
	}

	// 情報検索メソッド
	private async searchKnowledgeBase(
		query: string,
		intent: QueryIntent
	): Promise<SearchResult[]> {
		try {
			switch (intent) {
				case QueryIntent.PRODUCT_INQUIRY:
					return await this.searchProductDatabase(query);
				case QueryIntent.PRICING:
					return await this.searchPricingInfo(query);
				default:
					return await this.semanticSearch(query);
			}
		} catch (error) {
			console.error("ナレッジベース検索エラー:", error);
			return [];
		}
	}

	// 製品データベース検索
	private async searchProductDatabase(query: string): Promise<SearchResult[]> {
		const { data, error } = await this.supabase
			.from("products")
			.select("name, description, price, features")
			.textSearch("name", query)
			.limit(3);

		if (error) {
			console.error("製品検索エラー:", error);
			return [];
		}

		return data.map((product) => ({
			content: `
商品名: ${product.name}
価格: ¥${product.price.toLocaleString("ja-JP")}
説明: ${product.description}
機能: ${product.features?.join(", ") || "詳細情報なし"}
      `.trim(),
			source: "product_database",
			relevanceScore: 0.8,
		}));
	}

	// 価格情報検索
	private async searchPricingInfo(_query: string): Promise<SearchResult[]> {
		const { data, error } = await this.supabase
			.from("products")
			.select("name, price")
			.order("price", { ascending: true })
			.limit(5);

		if (error) {
			console.error("価格情報検索エラー:", error);
			return [];
		}

		return [
			{
				content:
					`現在のおすすめ商品の価格帯:\n` +
					data
						.map((p) => `${p.name}: ¥${p.price.toLocaleString("ja-JP")}`)
						.join("\n"),
				source: "pricing_info",
				relevanceScore: 0.7,
			},
		];
	}

	// セマンティック検索
	private async semanticSearch(query: string): Promise<SearchResult[]> {
		const { data, error } = await this.supabase.rpc("match_products", {
			query,
			k: 3,
		});

		if (error) {
			console.error("セマンティック検索エラー:", error);
			return [];
		}

		return data.map((item) => ({
			content: item.content,
			source: "semantic_search",
			relevanceScore: item.similarity,
		}));
	}

	// 回答生成メソッド
	private async generateResponse(
		searchResults: SearchResult[],
		query: string
	): Promise<ChatbotResponse> {
		// 最も関連性の高い結果を選択
		const topResults = searchResults
			.sort((a, b) => b.relevanceScore - a.relevanceScore)
			.slice(0, 2);

		if (topResults.length > 0 && topResults[0].relevanceScore > 0.7) {
			return {
				text: topResults.map((r) => r.content).join("\n\n"),
				confidence: topResults[0].relevanceScore,
				type: "DIRECT",
			};
		}

		// AIによる高度な回答生成（フォールバック）
		try {
			const aiResponse = await this.openai.chat.completions.create({
				model: "gpt-3.5-turbo",
				messages: [
					{
						role: "system",
						content: `あなたはPortfolio Showcaseの製品に特化したAIアシスタントです。
            質問に対して、製品情報を中心に簡潔かつ有益な回答を提供してください。`,
					},
					{ role: "user", content: query },
				],
				max_tokens: 300,
				temperature: 0.3,
			});

			return {
				text:
					aiResponse.choices[0].message.content ||
					"すみません。詳細を確認できませんでした。",
				confidence: 0.5,
				type: "FALLBACK",
			};
		} catch (error) {
			console.error("AI回答生成エラー:", error);
			return {
				text: "お問い合わせの内容が明確でないため、詳細を教えていただけますか？",
				confidence: 0.3,
				type: "FALLBACK",
			};
		}
	}

	// メインの処理メソッド
	async processQuery(
		query: string,
		_sessionId: string
	): Promise<ChatbotResponse> {
		// 入力のサニタイズ
		const sanitizedQuery = this.sanitizeInput(query);

		// 意図分類
		const intent = this.classifyIntent(sanitizedQuery);

		// 情報検索
		const searchResults = await this.searchKnowledgeBase(
			sanitizedQuery,
			intent
		);

		// 回答生成
		const response = await this.generateResponse(searchResults, sanitizedQuery);

		return response;
	}

	// 入力サニタイズ
	private sanitizeInput(input: string): string {
		// 基本的な入力クリーニング
		return input
			.replace(/[<>]/g, "") // HTMLタグ除去
			.replace(/\s+/g, " ") // 連続する空白を単一の空白に
			.trim();
	}
}

// Deno.serve関数
Deno.serve(async (req) => {
	// CORSヘッダー設定
	const corsHeaders = {
		"Access-Control-Allow-Origin": "*",
		"Access-Control-Allow-Methods": "POST, GET, OPTIONS",
		"Access-Control-Allow-Headers": "Content-Type",
	};

	// プリフライトリクエストの処理
	if (req.method === "OPTIONS") {
		return new Response(null, {
			headers: corsHeaders,
		});
	}

	try {
		// リクエストボディの解析
		const { message } = await req.json();

		if (!message) {
			return new Response(
				JSON.stringify({
					error: "メッセージが提供されていません",
				}),
				{
					status: 400,
					headers: { ...corsHeaders, "Content-Type": "application/json" },
				}
			);
		}

		// チャットボットインスタンス作成
		const chatbot = new PortfolioShowcaseChatbot();

		// クエリ処理
		const response = await chatbot.processQuery(
			message,
			req.headers.get("x-session-id") || "default_session"
		);

		// レスポンス返却
		return new Response(
			JSON.stringify({
				reply: response.text,
				confidence: response.confidence,
				type: response.type,
			}),
			{
				headers: {
					...corsHeaders,
					"Content-Type": "application/json",
				},
			}
		);
	} catch (error) {
		console.error("チャットボット処理エラー:", error);
		return new Response(
			JSON.stringify({
				error: "申し訳ありません。エラーが発生しました。",
			}),
			{
				status: 500,
				headers: { ...corsHeaders, "Content-Type": "application/json" },
			}
		);
	}
});
