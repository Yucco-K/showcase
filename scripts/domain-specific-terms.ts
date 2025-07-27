#!/usr/bin/env -S deno run --allow-net --allow-read --allow-env

import { OpenAI } from "openai";
import { OpenAIEmbeddings } from "@langchain/openai";
import { createClient } from "@supabase/supabase-js";

// クライアントの初期化
const _openai = new OpenAI({
	apiKey: Deno.env.get("OPENAI_API_KEY"),
});

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ドメイン固有の専門用語とカテゴリのマッピング
const DOMAIN_TERMS: Record<string, string[]> = {
	productivity: [
		"タスク管理",
		"プロジェクト効率化",
		"ワークフロー最適化",
		"生産性向上",
		"時間管理",
		"TODO管理",
		"リソース配分",
	],
	health: [
		"ウェルネス",
		"フィットネス追跡",
		"健康データ可視化",
		"セルフケア",
		"運動記録",
		"栄養管理",
		"メンタルヘルス",
	],
	business: [
		"在庫管理",
		"財務分析",
		"経営指標",
		"ビジネスインテリジェンス",
		"コスト最適化",
		"リソース管理",
		"生産性分析",
	],
	entertainment: [
		"コンテンツキュレーション",
		"パーソナライズ推奨",
		"メディア管理",
		"エンターテインメント分析",
		"トレンド追跡",
	],
};

/**
 * 商品カテゴリに基づいて専門用語を生成
 * @param category 商品カテゴリ
 * @returns 専門用語を含む拡張テキスト
 */
function generateDomainSpecificText(
	category: string,
	originalText: string
): string {
	const domainTerms = DOMAIN_TERMS[category] || [];
	const termsText = domainTerms.join(" ");
	return `${originalText} | ドメイン専門用語: ${termsText}`;
}

/**
 * 商品データに専門用語を追加して埋め込みを生成
 */
async function enhanceProductEmbeddings() {
	console.log("🚀 ドメイン固有の専門用語を使用した埋め込み拡張を開始...");

	try {
		// 商品データを取得
		const { data: products, error } = await supabase
			.from("products")
			.select("*");

		if (error) throw error;

		const embeddings = new OpenAIEmbeddings({
			apiKey: Deno.env.get("OPENAI_API_KEY"),
			model: "text-embedding-3-small",
		});

		// 各商品の埋め込みを生成
		for (const product of products) {
			console.log(`🔍 処理中: ${product.name}`);

			// 商品データを前処理
			const preprocessedText = [
				product.name,
				product.description,
				product.long_desc,
				product.category,
				product.tags?.join(" "),
				product.features?.join(" "),
			]
				.filter((field) => field && field.trim() !== "")
				.join(" | ");

			// ドメイン固有の専門用語を追加
			const enhancedText = generateDomainSpecificText(
				product.category,
				preprocessedText
			);

			// 埋め込みを生成
			const embedding = await embeddings.embedQuery(enhancedText);

			// Supabaseに保存（INSERT OR REPLACEを使用）
			const { error: upsertError } = await supabase.rpc(
				"upsert_product_embedding",
				{
					p_product_id: product.id,
					p_content: enhancedText,
					p_embedding: embedding,
				}
			);

			if (upsertError) {
				console.error(`❌ 埋め込み保存エラー (${product.name}):`, upsertError);
			}
		}

		console.log("🎉 全商品の埋め込み拡張が完了しました！");
	} catch (error) {
		console.error("❌ エラーが発生しました:", error);
	}
}

// スクリプトが直接実行された場合のみテストを実行
if (import.meta.main) {
	enhanceProductEmbeddings();
}
