import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// 環境変数の取得と検証
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
const openaiApiKey = Deno.env.get("OPENAI_API_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// カスタムRAG - OpenAI Embeddings API直接呼び出し
async function generateEmbedding(text: string): Promise<number[]> {
	try {
		const response = await fetch("https://api.openai.com/v1/embeddings", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${openaiApiKey}`,
			},
			body: JSON.stringify({
				model: "text-embedding-3-small",
				input: text,
			}),
		});

		if (!response.ok) {
			throw new Error(`OpenAI Embeddings API error: ${response.status}`);
		}

		const data = await response.json();
		return data.data[0].embedding;
	} catch (err) {
		console.error("[Embeddings] エラー:", err);
		throw err;
	}
}

// カスタムRAG - OpenAI Chat Completions API直接呼び出し
async function generateAnswer(
	query: string,
	contextDocs: string[]
): Promise<string> {
	try {
		const context = contextDocs.join("\n---\n");
		const systemPrompt = `あなたはPortfolio Showcaseの専門AIアシスタントです。以下のコンテキストにあるPortfolio Showcase商品のみを推奨してください。

【Portfolio Showcase商品・サービス情報】
${context}

【重要な指示】
- 上記のコンテキストにあるPortfolio Showcase商品のみを紹介してください
- 商品名、価格、機能、特徴を具体的に説明してください
- 価格は必ず日本円（¥）で表示してください。ドル（$）表記は絶対に使用しないでください
- 「おすすめ商品」を聞かれたら、AppBuzz Hive、MyRecipeNote、SnazzySync Apps、CollabPlannerなどの実際のShowcase商品を推奨してください
- Simple TODOや一般的なアプリではなく、Portfolio Showcaseの商品に限定してください
- 商品の価格も含めて回答してください
- 価格表示例: ¥32,000、¥500、¥24,000、¥1,200`;

		const response = await fetch("https://api.openai.com/v1/chat/completions", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${openaiApiKey}`,
			},
			body: JSON.stringify({
				model: "gpt-4o-mini",
				messages: [
					{ role: "system", content: systemPrompt },
					{ role: "user", content: query },
				],
				temperature: 0.1, // より確定的な回答のため低く設定
				max_tokens: 600, // より詳細な回答のため増加
			}),
		});

		if (!response.ok) {
			throw new Error(`OpenAI Chat API error: ${response.status}`);
		}

		const data = await response.json();
		return data.choices[0].message.content;
	} catch (err) {
		console.error("[ChatCompletion] エラー:", err);
		return "申し訳ありません。現在回答できません。";
	}
}

// カスタムRAG - 商品＋FAQ・ガイド・規約 横断検索
async function retrieveAllContexts(
	query: string,
	k: number = 5
): Promise<string[]> {
	try {
		console.log(`[Retriever] クエリ: ${query}`);

		// おすすめ商品やShowcase商品を聞かれた場合の特別処理
		if (
			query.includes("おすすめ") ||
			query.includes("商品") ||
			query.includes("アプリ") ||
			query.includes("showcase")
		) {
			console.log(
				"[Retriever] おすすめ商品クエリを検出 - 直接商品データを取得"
			);
			const { data: recommendedProducts } = await supabase
				.from("products")
				.select(
					"name, price, category, description, long_description, features"
				)
				.or("recommended.eq.true,popular.eq.true")
				.limit(8);

			if (recommendedProducts && recommendedProducts.length > 0) {
				const productInfo = recommendedProducts.map(
					(p) =>
						`[Portfolio Showcase商品] ${
							p.name
						} - 価格: ¥${p.price?.toLocaleString("ja-JP")} - カテゴリ: ${
							p.category
						} - ${p.description} - 詳細: ${p.long_description} - 機能: ${
							p.features?.join(", ") || "なし"
						}`
				);
				console.log(`[Retriever] おすすめ商品: ${productInfo.length}件取得`);
				return productInfo;
			}
		}

		const embedding = await generateEmbedding(query);

		// 商品（product_embeddings）- より多くのコンテキストを取得
		const { data: productData, error: productError } = await supabase.rpc(
			"match_products",
			{
				query_embedding: embedding,
				match_threshold: 0.05, // さらに閾値を下げて検索精度向上
				match_count: k,
			}
		);
		if (productError) {
			console.error("[Product Search] エラー:", productError);
		}
		const productDocs = (
			(productData as { content: string; similarity: number }[] | null) || []
		).map(
			(row) =>
				`[Portfolio Showcase商品情報] ${
					row.content
				} (類似度: ${row.similarity?.toFixed(3)})`
		);

		// FAQ・ガイド・規約（doc_embeddings）
		const { data: docData, error: docError } = await supabase.rpc(
			"match_docs",
			{
				query_embedding: embedding,
				match_threshold: 0.05, // さらに閾値を下げて検索精度向上
				match_count: k,
				doc_type: null,
			}
		);
		if (docError) {
			console.error("[Doc Search] エラー:", docError);
		}
		const docDocs = (
			(docData as
				| { type: string; title: string; content: string; similarity: number }[]
				| null) || []
		).map(
			(row) =>
				`[${row.type}] ${row.title}\n${
					row.content
				} (類似度: ${row.similarity?.toFixed(3)})`
		);

		const allDocs = [...productDocs, ...docDocs];
		console.log(
			`[Retriever] 取得: 商品${productDocs.length}件, ドキュメント${docDocs.length}件, 合計${allDocs.length}件`
		);

		// コンテキストが少ない場合のフォールバック
		if (allDocs.length === 0) {
			console.log("[Retriever] フォールバック: 全商品情報を取得");
			const { data: allProducts } = await supabase
				.from("products")
				.select("name, price, description, long_description, features")
				.limit(10);

			if (allProducts && allProducts.length > 0) {
				return allProducts.map(
					(p) =>
						`[Portfolio Showcase商品] ${
							p.name
						} - 価格: ¥${p.price?.toLocaleString()} - ${
							p.description
						} - 機能: ${p.features?.join(", ") || "なし"}`
				);
			}
		}

		return allDocs;
	} catch (err) {
		console.error("[Retriever] 横断検索エラー:", err);
		return [];
	}
}

Deno.serve(async (req) => {
	// CORS設定
	const corsHeaders = {
		"Access-Control-Allow-Origin": "*",
		"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
		"Access-Control-Allow-Headers": "Content-Type, Authorization",
		"Access-Control-Max-Age": "86400",
	};

	// CORSプリフライトリクエスト対応
	if (req.method === "OPTIONS") {
		return new Response(null, {
			status: 200,
			headers: corsHeaders,
		});
	}

	try {
		// リクエストボディからパラメータを取得
		const body = await req.json();
		const { query, message } = body;
		const userQuery = query || message;

		if (!userQuery) {
			return new Response(
				JSON.stringify({ error: "質問が指定されていません。" }),
				{
					status: 400,
					headers: { ...corsHeaders, "Content-Type": "application/json" },
				}
			);
		}

		console.log(`[API] ユーザークエリ: ${userQuery}`);

		// 商品＋FAQ・ガイド・規約 横断検索
		const docs = await retrieveAllContexts(userQuery, 5);
		if (docs.length === 0) {
			return new Response(
				JSON.stringify({
					reply:
						"申し訳ありません。該当する商品・情報が見つかりませんでした。Portfolio Showcaseの商品については、具体的な商品名をお聞かせください。",
				}),
				{
					status: 200,
					headers: { ...corsHeaders, "Content-Type": "application/json" },
				}
			);
		}

		console.log(`[API] 取得コンテキスト: ${docs.length}件`);
		const answer = await generateAnswer(userQuery, docs);

		return new Response(JSON.stringify({ reply: answer }), {
			status: 200,
			headers: { ...corsHeaders, "Content-Type": "application/json" },
		});
	} catch (err) {
		console.error("[API] エラー:", err);
		return new Response(
			JSON.stringify({ error: "システムエラーが発生しました。" }),
			{
				status: 500,
				headers: { ...corsHeaders, "Content-Type": "application/json" },
			}
		);
	}
});
