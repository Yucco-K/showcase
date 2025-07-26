#!/usr/bin/env -S deno run --allow-net --allow-env

/**
 * chatbot APIの本番統合テストスクリプト
 * - APIエンドポイントに対して自動で質問→応答を検証
 */

// Deno用型宣言
interface ImportMeta {
	main?: boolean;
}

const API_URL = "https://ljjptkfrdeiktywbbybr.supabase.co/functions/v1/chat";

const testQueries = [
	"おすすめのタスク管理アプリは？",
	"健康管理に役立つサービスは？",
	"料理レシピを整理したい",
	"音楽プレイリストを作りたい",
];

const ANON_KEY =
	"[REDACTED_SUPABASE_ANON_KEY_2]";

async function testChatbotAPI() {
	for (const query of testQueries) {
		const res = await fetch(API_URL, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${ANON_KEY}`,
			},
			body: JSON.stringify({ message: query }),
		});
		const text = await res.text();
		console.log(`\nQ: ${query}\nRaw Response: ${text}\n`);
	}
}

// Deno用のmain判定をNode互換に修正
// @ts-ignore
if (import.meta.main) {
	testChatbotAPI();
}
