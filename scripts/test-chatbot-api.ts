#!/usr/bin/env -S deno run --allow-net --allow-env

/**
 * chatbot APIの本番統合テストスクリプト
 * - APIエンドポイントに対して自動で質問→応答を検証
 */

// Deno用型宣言
interface ImportMeta {
	main?: boolean;
}

// 環境変数から設定を取得
const SUPABASE_URL =
	Deno.env.get("VITE_SUPABASE_URL") ||
	"https://ljjptkfrdeiktywbbybr.supabase.co";
const API_URL = `${SUPABASE_URL}/functions/v1/chat`;

const testQueries = [
	"AppBuzz Hiveについて教えて",
	"MyRecipeNoteの価格は？",
	"SnazzySync Appsの機能は？",
	"CollabPlannerの特徴は？",
	"AppJive Junctionについて教えて",
	"ByteBoundの価格は？",
	"Pixel Pulse Nexusの機能は？",
	"AppThriveの特徴は？",
	"おすすめの商品はありますか？",
	"プライバシーポリシーはどこに書かれていますか？",
];

// 環境変数からANON_KEYを取得（フォールバックとして既存のキーを使用）
const ANON_KEY =
	Deno.env.get("VITE_SUPABASE_ANON_KEY") ||
	Deno.env.get("SUPABASE_ANON_KEY") ||
	"[REDACTED_SUPABASE_ANON_KEY]";

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
// @ts-ignore: import.meta.main is Deno-specific and may not be in types
if (import.meta.main) {
	testChatbotAPI();
}
