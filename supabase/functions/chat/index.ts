import { createClient } from "npm:@supabase/supabase-js@2.39.7";

// 環境変数の取得と検証
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
const openaiApiKey = Deno.env.get("OPENAI_API_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 外部アプリ推奨を防ぐ制御
const FORBIDDEN_APPS = [
	"todoist",
	"trello",
	"notion",
	"microsoft to do",
	"microsoft todo",
	"asana",
	"slack",
	"discord",
	"zoom",
	"teams",
	"google",
	"apple",
	"spotify",
	"youtube",
	"netflix",
	"amazon",
	"facebook",
	"twitter",
];

function containsForbiddenApps(text: string): boolean {
	const lowerText = text.toLowerCase();
	return FORBIDDEN_APPS.some((app) => lowerText.includes(app));
}

async function generateAnswer(query: string, contextDocs: string[]) {
	try {
		const context = contextDocs.join("\n---\n");
		const systemPrompt = `あなたはPortfolio Showcaseの専門AIアシスタントです。

【絶対ルール】
1. Portfolio Showcaseの商品のみを推奨してください
2. 外部のアプリ、サービス、商品は絶対に推奨しないでください
3. 商品が見つからない場合は「Portfolio Showcaseに該当する商品がございません」と回答してください
4. 常に日本語で回答してください
5. 外部知識は一切使用しないでください

【禁止事項】
- Todoist、Microsoft To Do、Trello、Notion等の外部アプリの推奨
- 外部サービスの紹介
- 一般的なアドバイスの提供
- 外部知識に基づく回答

【回答パターン】
- 商品が見つかった場合：「Portfolio Showcaseの[商品名]をおすすめします。[商品の説明]」
- 商品が見つからない場合：「Portfolio Showcaseに該当する商品がございません」

【コンテキスト】
${context}

上記ルールに厳密に従って回答してください。外部知識は一切使用せず、コンテキスト内の商品のみを推奨してください。`;

		const response = await fetch("https://api.openai.com/v1/chat/completions", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${openaiApiKey}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				model: "gpt-4o-mini",
				messages: [
					{ role: "system", content: systemPrompt },
					{ role: "user", content: query },
				],
				temperature: 0.2,
				max_tokens: 500,
			}),
		});

		const data = await response.json();
		let answer =
			data.choices[0]?.message?.content ||
			"申し訳ありません。現在回答できません。";

		// 外部アプリ推奨チェック
		if (containsForbiddenApps(answer)) {
			answer = "Portfolio Showcaseに該当する商品がございません。";
		}

		return answer;
	} catch (err) {
		console.error("[QAChain] 回答生成エラー:", err);
		return "申し訳ありません。現在回答できません。";
	}
}

// 商品＋FAQ・ガイド・規約 横断検索RAG
async function retrieveAllContexts(query: string, k: number = 3) {
	try {
		// 簡易的なキーワード検索（埋め込みの代わり）
		const { data: productData, error: productError } = await supabase
			.from("products")
			.select("name, description, long_description, features")
			.or(
				`name.ilike.%${query}%,description.ilike.%${query}%,long_description.ilike.%${query}%`
			)
			.limit(k);

		if (productError) throw productError;

		const productDocs = (productData || []).map(
			(product) =>
				`商品名: ${product.name}\n説明: ${product.description}\n詳細: ${product.long_description}\n機能: ${product.features}`
		);

		return productDocs;
	} catch (err) {
		console.error("[Retriever] 検索エラー:", err);
		return [];
	}
}

export default async (req, res) => {
	try {
		const { message } = req.body;
		if (!message) {
			res.status(400).json({ error: "質問が指定されていません。" });
			return;
		}

		// 商品検索
		const docs = await retrieveAllContexts(message, 3);
		if (docs.length === 0) {
			res.status(200).json({
				reply: "Portfolio Showcaseに該当する商品がございません。",
				success: true,
			});
			return;
		}

		const answer = await generateAnswer(message, docs);
		res.status(200).json({
			reply: answer,
			success: true,
		});
	} catch (err) {
		console.error("[API] エラー:", err);
		res.status(500).json({ error: "システムエラーが発生しました。" });
	}
};
