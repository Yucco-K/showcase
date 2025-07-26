#!/usr/bin/env -S deno run --allow-net --allow-env

import { OpenAI } from "openai";

const openai = new OpenAI({
	apiKey: Deno.env.get("OPENAI_API_KEY"),
});

/**
 * クエリを拡張し、より多様な検索キーワードを生成
 * @param query 元のクエリ文字列
 * @returns 拡張されたクエリの配列
 */
export async function expandQuery(query: string): Promise<string[]> {
	try {
		const response = await openai.chat.completions.create({
			model: "gpt-3.5-turbo",
			messages: [
				{
					role: "system",
					content:
						"あなたは、ユーザークエリを拡張し、より多様な検索キーワードを生成する専門家です。元のクエリに関連する、異なる表現や同義語を提案してください。",
				},
				{
					role: "user",
					content: `以下のクエリに対して、関連する検索キーワードを3-5個生成してください：\n\n"${query}"`,
				},
			],
			max_tokens: 100,
			temperature: 0.7,
		});

		const expandedQueryText = response.choices[0].message.content?.trim() || "";

		// レスポンスを配列に変換（改行や番号を除去）
		const expandedQueries = expandedQueryText
			.split("\n")
			.map((q) => q.replace(/^\d+\.\s*/, "").trim())
			.filter((q) => q.length > 0);

		// 元のクエリも含める
		return [query, ...expandedQueries];
	} catch (error) {
		console.error("クエリ拡張中にエラーが発生:", error);
		return [query];
	}
}

/**
 * クエリ拡張のテスト関数
 */
async function testQueryExpansion() {
	const testQueries = [
		"タスク管理アプリが欲しい",
		"健康管理のためのアプリを探している",
		"料理のレシピを管理したい",
	];

	for (const query of testQueries) {
		console.log(`🔍 元のクエリ: "${query}"`);
		const expandedQueries = await expandQuery(query);

		console.log("✅ 拡張されたクエリ:");
		expandedQueries.forEach((q, index) => {
			console.log(`  ${index + 1}. ${q}`);
		});
		console.log("\n");
	}
}

// スクリプトが直接実行された場合のみテストを実行
if (import.meta.main) {
	testQueryExpansion();
}
