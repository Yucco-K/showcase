#!/usr/bin/env -S deno run --allow-net --allow-read --allow-env

import { OpenAIEmbeddings } from "@langchain/openai";
import { createClient } from "@supabase/supabase-js";

// Supabaseクライアントの初期化
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 埋め込みモデルの設定
const EMBEDDING_MODELS = [
	"text-embedding-3-small",
	"text-embedding-ada-002",
	// "text-embedding-3-large", // Uncomment for testing or benchmarking purposes
];

/**
 * 商品データの前処理関数
 * @param product 商品オブジェクト
 * @returns 前処理された文字列
 */
function preprocessProductData(product: any): string {
	// 複数のフィールドを組み合わせて、より豊かな文脈を作成
	const contextFields = [
		product.name,
		product.description,
		product.long_desc,
		product.category,
		product.tags?.join(" "),
		product.features?.join(" "),
	];

	// 空白や不要な文字を削除し、文脈を整理
	return contextFields
		.filter((field) => field && field.trim() !== "")
		.map((field) => field.replace(/\s+/g, " ").trim())
		.join(" | ");
}

/**
 * 埋め込みモデルの性能を比較
 */
async function compareEmbeddingModels() {
	console.log("🔍 埋め込みモデルの性能比較を開始...");

	try {
		// 商品データを取得
		const { data: products, error } = await supabase
			.from("products")
			.select("*");

		if (error) throw error;

		// 各モデルで性能を比較
		for (const modelName of EMBEDDING_MODELS) {
			console.log(`\n🚀 モデル: ${modelName}`);

			const embeddings = new OpenAIEmbeddings({
				apiKey: Deno.env.get("OPENAI_API_KEY"),
				model: modelName,
			});

			// テスト用のクエリ
			const testQueries = [
				"タスク管理アプリが欲しい",
				"健康管理のためのアプリを探している",
				"料理のレシピを管理したい",
			];

			for (const query of testQueries) {
				console.log(`\n🔍 検索クエリ: "${query}"`);

				// クエリの埋め込みを生成
				const queryEmbedding = await embeddings.embedQuery(query);

				// 商品データの埋め込みを生成し、類似度を計算
				const productEmbeddings = await Promise.all(
					products.map(async (product) => {
						const preprocessedText = preprocessProductData(product);
						const embedding = await embeddings.embedQuery(preprocessedText);

						// コサイン類似度の計算
						const similarity = cosineSimilarity(queryEmbedding, embedding);

						return {
							id: product.id,
							name: product.name,
							similarity: similarity,
						};
					})
				);

				// 類似度でソートし、上位3件を表示
				const topResults = productEmbeddings
					.sort((a, b) => b.similarity - a.similarity)
					.slice(0, 3);

				console.log("✅ 検索結果:");
				topResults.forEach((result, index) => {
					console.log(
						`  ${index + 1}. ${result.name} (類似度: ${(
							result.similarity * 100
						).toFixed(1)}%)`
					);
				});
			}
		}
	} catch (error) {
		console.error("❌ エラーが発生しました:", error);
	}
}

/**
 * コサイン類似度の計算
 * @param vec1 ベクトル1
 * @param vec2 ベクトル2
 * @returns 類似度スコア
 */
function cosineSimilarity(vec1: number[], vec2: number[]): number {
	// ベクトルの長さが異なる場合は0を返す
	if (vec1.length !== vec2.length) return 0;

	let dotProduct = 0;
	let magnitude1 = 0;
	let magnitude2 = 0;

	for (let i = 0; i < vec1.length; i++) {
		dotProduct += vec1[i] * vec2[i];
		magnitude1 += vec1[i] * vec1[i];
		magnitude2 += vec2[i] * vec2[i];
	}

	magnitude1 = Math.sqrt(magnitude1);
	magnitude2 = Math.sqrt(magnitude2);

	// ゼロ除算を防ぐ
	if (magnitude1 === 0 || magnitude2 === 0) return 0;

	return dotProduct / (magnitude1 * magnitude2);
}

// スクリプトが直接実行された場合のみテストを実行
if (import.meta.main) {
	compareEmbeddingModels();
}
