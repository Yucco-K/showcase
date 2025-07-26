#!/usr/bin/env -S deno run --allow-net --allow-env

/**
 * Portfolio Showcase 商品検索機能テストスクリプト
 *
 * 商品埋め込みデータを使用した類似商品検索のテスト
 */

interface ProductSearchResult {
	id: string;
	product_id: string;
	content: string;
	similarity: number;
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
 * Supabaseで類似商品を検索
 */
async function searchSimilarProducts(
	embedding: number[],
	threshold: number = 0.7,
	limit: number = 5
): Promise<ProductSearchResult[]> {
	const supabaseUrl = Deno.env.get("SUPABASE_URL");
	const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY");

	if (!supabaseUrl || !supabaseKey) {
		throw new Error("Supabase environment variables are required");
	}

	// PostgreSQLのmatch_products関数を呼び出し
	const response = await fetch(`${supabaseUrl}/rest/v1/rpc/match_products`, {
		method: "POST",
		headers: {
			apikey: supabaseKey,
			Authorization: `Bearer ${supabaseKey}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			query_embedding: embedding,
			match_threshold: threshold,
			match_count: limit,
		}),
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(`Supabase error: ${response.status} ${error}`);
	}

	return await response.json();
}

/**
 * 商品情報を解析して商品名を抽出
 */
function extractProductName(content: string): string {
	const lines = content.split("\n");
	for (const line of lines) {
		if (line.startsWith("商品名:")) {
			return line.replace("商品名:", "").trim();
		}
	}
	return "Unknown Product";
}

/**
 * メイン処理
 */
async function main() {
	console.log("🔍 Portfolio Showcase 商品検索機能テストを開始...");

	// テストクエリ
	const testQueries = [
		"タスク管理アプリが欲しい",
		"健康管理のためのアプリを探している",
		"料理のレシピを管理したい",
		"アイデアを整理するツールが欲しい",
		"音楽プレイリストを作りたい",
	];

	try {
		for (const query of testQueries) {
			console.log(`\n📝 検索クエリ: "${query}"`);

			// クエリをベクトル化
			console.log(`  🔄 クエリをベクトル化中...`);
			const embedding = await generateEmbedding(query);

			// 類似商品を検索
			console.log(`  🔍 類似商品を検索中...`);
			const results = await searchSimilarProducts(embedding, 0.3, 3);

			if (results.length === 0) {
				console.log(`  ❌ 類似商品が見つかりませんでした`);
				continue;
			}

			console.log(`  ✅ 検索結果 (${results.length}件):`);
			results.forEach((result, index) => {
				const productName = extractProductName(result.content);
				const similarity = (result.similarity * 100).toFixed(1);
				console.log(
					`    ${index + 1}. ${productName} (類似度: ${similarity}%)`
				);
			});

			// API制限を考慮して少し待機
			await new Promise((resolve) => setTimeout(resolve, 1000));
		}

		console.log("\n🎉 商品検索機能テストが完了しました！");
	} catch (error) {
		console.error("❌ エラーが発生しました:", error);
		Deno.exit(1);
	}
}

// スクリプト実行
if (import.meta.main) {
	main();
}
