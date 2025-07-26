#!/usr/bin/env -S deno run --allow-net --allow-env

/**
 * chatbot APIの本番統合テストスクリプト
 * - APIエンドポイントに対して自動で質問→応答を検証
 */

const API_URL =
	Deno.env.get("CHATBOT_API_URL") || "http://localhost:8787/api/chat";

const testQueries = [
	"おすすめのタスク管理アプリは？",
	"健康管理に役立つサービスは？",
	"料理レシピを整理したい",
	"音楽プレイリストを作りたい",
];

async function testChatbotAPI() {
	for (const query of testQueries) {
		const res = await fetch(API_URL, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ query }),
		});
		const data = await res.json();
		console.log(
			`\nQ: ${query}\nA: ${data.answer || data.reply || data.error}\n`
		);
	}
}

if (import.meta.main) {
	testChatbotAPI();
}
