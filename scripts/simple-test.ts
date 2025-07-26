#!/usr/bin/env -S deno run --allow-net

const API_URL = "https://ljjptkfrdeiktywbbybr.supabase.co/functions/v1/chat";
const JWT_TOKEN =
	"[REDACTED_SUPABASE_ANON_KEY_2]";

async function testAPI() {
	try {
		console.log("APIテスト開始...");

		const response = await fetch(API_URL, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${JWT_TOKEN}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				message: "おすすめのタスク管理アプリは？",
			}),
		});

		console.log("ステータス:", response.status);
		console.log("ステータステキスト:", response.statusText);

		const text = await response.text();
		console.log("レスポンス:", text);
	} catch (error) {
		console.error("エラー:", error);
	}
}

testAPI();
