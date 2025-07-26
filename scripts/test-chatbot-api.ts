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
	"Zen Breathについて教えて",
	"Runner Tribeの価格は？",
	"Mind Craftの機能は？",
	"おすすめの商品はありますか？",
];

const ANON_KEY =
	"eyJhbGciOiJIUzI1NiIsImtpZCI6Im9Oc0FVeTRpajJnWDY4N2MiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2xqanB0a2ZyZGVpa3R5d2JieWJyLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiI3YTlmZmYxNy03MDI2LTQzZjQtYmQ4Yy02MzdkMjg2ODVhMDYiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzUzNTQ2OTg5LCJpYXQiOjE3NTM1NDMzODksImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsInBob25lIjoiIiwiYXBwX21ldGFkYXRhIjp7InByb3ZpZGVyIjoiZW1haWwiLCJwcm92aWRlcnMiOlsiZW1haWwiXX0sInVzZXJfbWV0YWRhdGEiOnsiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBob25lX3ZlcmlmaWVkIjpmYWxzZSwic3ViIjoiN2E5ZmZmMTctNzAyNi00M2Y0LWJkOGMtNjM3ZDI4Njg1YTA2In0sInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiYWFsIjoiYWFsMSIsImFtciI6W3sibWV0aG9kIjoicGFzc3dvcmQiLCJ0aW1lc3RhbXAiOjE3NTM1NDMzODl9XSwic2Vzc2lvbl9pZCI6ImJjYzIxZjgzLWJjODItNDRmYS1iZmQ0LTRiYzA0MzBlNzJlMyIsImlzX2Fub255bW91cyI6ZmFsc2V9.EwBamlePFyxUhi6YWbPUv1FDrQoBGXNjm6fntxFbrDc";

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
