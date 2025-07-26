#!/usr/bin/env -S deno run --allow-net

const API_URL = "https://ljjptkfrdeiktywbbybr.supabase.co/functions/v1/chat";
const JWT_TOKEN =
	"eyJhbGciOiJIUzI1NiIsImtpZCI6Im9Oc0FVeTRpajJnWDY4N2MiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2xqanB0a2ZyZGVpa3R5d2JieWJyLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiI3YTlmZmYxNy03MDI2LTQzZjQtYmQ4Yy02MzdkMjg2ODVhMDYiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzUzNTQzMjM2LCJpYXQiOjE3NTM1Mzk2MzYsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsInBob25lIjoiIiwiYXBwX21ldGFkYXRhIjp7InByb3ZpZGVyIjoiZW1haWwiLCJwcm92aWRlcnMiOlsiZW1haWwiXX0sInVzZXJfbWV0YWRhdGEiOnsiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBob25lX3ZlcmlmaWVkIjpmYWxzZSwic3ViIjoiN2E5ZmZmMTctNzAyNi00M2Y0LWJkOGMtNjM3ZDI4Njg1YTA2In0sInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiYWFsIjoiYWFsMSIsImFtciI6W3sibWV0aG9kIjoicGFzc3dvcmQiLCJ0aW1lc3RhbXAiOjE3NTM1Mzk2MzZ9XSwic2Vzc2lvbl9pZCI6ImIwZGY0OTRkLTFlNmQtNDU2ZS05OTI1LWFiMzk3MzBkOThiYSIsImlzX2Fub255bW91cyI6ZmFsc2V9.DQmXkvUr15ryEBZFY_AspnjuOuF61QGYg1IxIYkUZZQ";

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
