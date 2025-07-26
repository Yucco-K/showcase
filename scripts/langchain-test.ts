#!/usr/bin/env -S deno run --allow-net --allow-read --allow-env

import { OpenAIEmbeddings } from "@langchain/openai";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { createClient } from "@supabase/supabase-js";

// Supabaseクライアントの初期化
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testLangChainIntegration() {
	console.log("🚀 LangChain統合テストを開始...");

	try {
		// OpenAI埋め込みの初期化
		const embeddings = new OpenAIEmbeddings({
			apiKey: Deno.env.get("OPENAI_API_KEY"),
			model: "text-embedding-3-small",
		});

		// Supabaseベクターストアの初期化
		const vectorStore = new SupabaseVectorStore(embeddings, {
			client: supabase,
			tableName: "product_embeddings",
			queryName: "match_products",
		});

		// テスト検索クエリ
		const testQueries = [
			"タスク管理アプリが欲しい",
			"健康管理のためのアプリを探している",
			"料理のレシピを管理したい",
		];

		for (const query of testQueries) {
			console.log(`\n🔍 検索クエリ: "${query}"`);

			// クエリのベクトル化
			const queryEmbedding = await embeddings.embedQuery(query);

			// カスタムRPCを直接呼び出し
			const { data, error } = await supabase.rpc("match_products", {
				query_embedding: queryEmbedding,
				match_threshold: 0.2,
				match_count: 3,
			});

			if (error) {
				console.error("❌ 検索エラー:", error);
				continue;
			}

			if (data && data.length > 0) {
				console.log("✅ 検索結果:");
				data.forEach((result, index) => {
					console.log(
						`  ${index + 1}. ${result.content} (類似度: ${(
							result.similarity * 100
						).toFixed(1)}%)`
					);
				});
			} else {
				console.log("❌ 類似商品が見つかりませんでした");
			}
		}

		console.log("\n🎉 LangChain統合テストが完了しました！");
	} catch (error) {
		console.error("❌ エラーが発生しました:", error);
	}
}

// メイン関数の実行
testLangChainIntegration();
