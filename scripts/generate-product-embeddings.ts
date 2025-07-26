#!/usr/bin/env -S deno run --allow-net --allow-env

/**
 * Portfolio Showcase 商品データ埋め込み生成スクリプト
 *
 * 商品データをOpenAI Embeddings APIでベクトル化し、
 * Supabase pgvectorテーブルに保存する
 */

interface Product {
	id: string;
	name: string;
	description: string;
	long_desc: string;
	price: number;
	category: string;
	tags: string[];
	features: string[];
	requirements: string[];
}

interface EmbeddingResponse {
	object: string;
	data: Array<{
		object: string;
		embedding: number[];
		index: number;
	}>;
	model: string;
	usage: {
		prompt_tokens: number;
		total_tokens: number;
	};
}

// 商品データ（簡略化版）
const PRODUCTS: Product[] = [
	{
		id: "a2471462-9461-48dd-ad52-a5b9318ae0bc",
		name: "AppBuzz Hive",
		description: "ニュースフィードとコメント機能付き情報収集アプリ",
		long_desc:
			"AppBuzz Hive は、ニュースや記事をカテゴリ別にまとめ、コメント・お気に入り機能付きで自分だけの情報ハブにできます。",
		price: 32000,
		category: "business",
		tags: ["ニュース", "コメント", "お気に入り"],
		features: ["コメント", "お気に入り", "通知"],
		requirements: ["ウェブ連携"],
	},
	{
		id: "36f65661-3a74-47df-b4f3-6d5a22b54e17",
		name: "MyRecipeNote",
		description: "オリジナルレシピを簡単に整理・共有",
		long_desc:
			"「MyRecipeNote」は、お気に入りの料理レシピを登録し、写真付きで保存・共有できるアプリです。",
		price: 500,
		category: "レシピ・生活",
		tags: ["料理", "写真", "タグ"],
		features: ["写真付き登録", "材料タグ付け", "レシピ共有機能"],
		requirements: ["会員登録が必要", "ブラウザ環境推奨"],
	},
	{
		id: "7050e32a-f699-4954-90bd-8a0d98f58419",
		name: "Simple TODO",
		description: "最小限の機能でサクッと使える TODO アプリ",
		long_desc:
			"Simple TODO は、「タスクの追加・完了・削除」だけに徹底的にこだわった、究極のシンプル TODO アプリです。",
		price: 33000,
		category: "productivity",
		tags: ["タスク", "TODO"],
		features: ["テスト"],
		requirements: [],
	},
	{
		id: "6a054dbe-51db-43fb-9bc8-8ab83c3f69f2",
		name: "IdeaLog",
		description: "ひらめきを逃さず記録・整理できるノートアプリ",
		long_desc:
			"IdeaLog は、ビジネスアイデア、ブログのネタ、企画の構想など、あらゆるひらめきを逃さずキャッチし、自由に育てられるノート管理アプリです。",
		price: 1500,
		category: "productivity",
		tags: ["アイデア", "メモ", "分類"],
		features: ["AI提案", "タグ分類", "メモ検索"],
		requirements: ["特になし（無料プランあり）"],
	},
	{
		id: "8f0ffaa8-0af2-4fdf-bc90-dd10613a75f9",
		name: "Health Tracker",
		description: "体重・睡眠・食事を記録して健康管理",
		long_desc:
			"Health Tracker は、毎日の体重・睡眠時間・食事内容をシンプルに記録し、健康の見える化を叶えるヘルスケアアプリです。",
		price: 72000,
		category: "health",
		tags: ["健康", "ヘルスケア"],
		features: [],
		requirements: [],
	},
];

/**
 * 商品データをテキスト形式に変換
 */
function productToText(product: Product): string {
	return `
商品名: ${product.name}
価格: ¥${product.price.toLocaleString()}
カテゴリ: ${product.category}
説明: ${product.description}
詳細: ${product.long_desc}
タグ: ${product.tags.join(", ")}
機能: ${product.features.join(", ")}
要件: ${product.requirements.join(", ")}
`.trim();
}

/**
 * OpenAI Embeddings APIでテキストをベクトル化
 */
async function generateEmbedding(text: string): Promise<number[]> {
	const apiKey = Deno.env.get("OPENAI_API_KEY");
	if (!apiKey) {
		throw new Error("OPENAI_API_KEY environment variable is required");
	}

	const response = await fetch("https://api.openai.com/v1/embeddings", {
		method: "POST",
		headers: {
			Authorization: `Bearer ${apiKey}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			input: text,
			model: "text-embedding-3-small",
		}),
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(`OpenAI API error: ${response.status} ${error}`);
	}

	const data: EmbeddingResponse = await response.json();
	return data.data[0].embedding;
}

/**
 * Supabaseに埋め込みデータを保存
 */
async function saveEmbeddingToSupabase(
	productId: string,
	text: string,
	embedding: number[]
): Promise<void> {
	const supabaseUrl = Deno.env.get("SUPABASE_URL");
	const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY");

	if (!supabaseUrl || !supabaseKey) {
		throw new Error("Supabase environment variables are required");
	}

	const response = await fetch(`${supabaseUrl}/rest/v1/product_embeddings`, {
		method: "POST",
		headers: {
			apikey: supabaseKey,
			Authorization: `Bearer ${supabaseKey}`,
			"Content-Type": "application/json",
			Prefer: "return=minimal",
		},
		body: JSON.stringify({
			product_id: productId,
			content: text,
			embedding: embedding,
			created_at: new Date().toISOString(),
		}),
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(`Supabase error: ${response.status} ${error}`);
	}
}

/**
 * メイン処理
 */
async function main() {
	console.log("🚀 Portfolio Showcase 商品埋め込み生成を開始...");

	try {
		for (const product of PRODUCTS) {
			console.log(`📦 処理中: ${product.name}`);

			// 商品データをテキストに変換
			const text = productToText(product);

			// 埋め込み生成
			console.log(`  🔄 埋め込み生成中...`);
			const embedding = await generateEmbedding(text);

			// Supabaseに保存
			console.log(`  💾 Supabaseに保存中...`);
			await saveEmbeddingToSupabase(product.id, text, embedding);

			console.log(`  ✅ 完了: ${product.name}`);

			// API制限を考慮して少し待機
			await new Promise((resolve) => setTimeout(resolve, 1000));
		}

		console.log("🎉 全ての商品の埋め込み生成が完了しました！");
	} catch (error) {
		console.error("❌ エラーが発生しました:", error);
		Deno.exit(1);
	}
}

// スクリプト実行
if (import.meta.main) {
	main();
}
