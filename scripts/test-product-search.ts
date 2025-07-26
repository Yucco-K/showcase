#!/usr/bin/env -S deno run --allow-net --allow-read --allow-env

import { OpenAIEmbeddings } from "@langchain/openai";
import { createClient } from "@supabase/supabase-js";
import { expandQuery } from "./query-expansion.ts";

// Supabaseクライアントの初期化
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// OpenAI埋め込みの初期化
const embeddings = new OpenAIEmbeddings({
	apiKey: Deno.env.get("OPENAI_API_KEY"),
	model: "text-embedding-3-small",
});

/**
 * 拡張クエリを使用して類似商品を検索
 * @param query 検索クエリ
 * @param threshold 類似度のしきい値
 * @param k 返す結果の最大数
 */
async function searchSimilarProductsWithExpansion(
	query: string,
	threshold: number = 0.2,
	k: number = 3
) {
	console.log(`🔍 検索クエリ: "${query}"`);

	try {
		// クエリを拡張
		const expandedQueries = await expandQuery(query);
		console.log("✅ 拡張されたクエリ:");
		expandedQueries.forEach((q, index) => {
			console.log(`  ${index + 1}. ${q}`);
		});

		// 拡張クエリの埋め込みを並列で生成
		const embeddingPromises = expandedQueries.map((q) =>
			embeddings.embedQuery(q)
		);
		const queryEmbeddings = await Promise.all(embeddingPromises);

		// 各拡張クエリの埋め込みで検索し、結果をマージ
		const searchPromises = queryEmbeddings.map((embedding) =>
			supabase.rpc("match_products", {
				query_embedding: embedding,
				match_threshold: threshold,
				match_count: k,
			})
		);

		const searchResults = await Promise.all(searchPromises);

		// 結果をマージし、重複を除去
		const mergedResults = searchResults
			.flatMap((result) => result.data || [])
			.filter((result) => result !== null)
			.reduce((acc, current) => {
				const exists = acc.some((item) => item.id === current.id);
				if (!exists) {
					acc.push(current);
				}
				return acc;
			}, [])
			.sort((a, b) => b.similarity - a.similarity)
			.slice(0, k);

		if (mergedResults.length > 0) {
			console.log("✅ 検索結果:");
			mergedResults.forEach((result, index) => {
				console.log(
					`  ${index + 1}. ${result.content} (類似度: ${(
						result.similarity * 100
					).toFixed(1)}%)`
				);
			});
		} else {
			console.log("❌ 類似商品が見つかりませんでした");
		}

		return mergedResults;
	} catch (error) {
		console.error("❌ 検索中にエラーが発生:", error);
		return [];
	}
}

/**
 * メイン検索テスト関数
 */
async function testProductSearch() {
	const testQueries = [
		"タスク管理アプリが欲しい",
		"健康管理のためのアプリを探している",
		"料理のレシピを管理したい",
		"アイデアを整理するツールが欲しい",
		"音楽プレイリストを作りたい",
	];

	for (const query of testQueries) {
		await searchSimilarProductsWithExpansion(query);
		console.log("\n---\n");
	}
}

// スクリプトが直接実行された場合のみテストを実行
if (import.meta.main) {
	testProductSearch();
}
