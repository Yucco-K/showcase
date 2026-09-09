import { createClient } from "@supabase/supabase-js";
import { gorseApi } from "../src/lib/gorse.ts";

// 環境変数を設定
const SUPABASE_URL =
	process.env.VITE_SUPABASE_URL || "https://your-project.supabase.co";
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || "your-anon-key";

async function testGorseConnection() {
	console.log("🔍 Gorse API接続テスト開始...\n");

	try {
		// 1. Gorse API接続テスト
		console.log("1. Gorse API接続テスト...");
		const isHealthy = await gorseApi.isHealthy();

		if (isHealthy) {
			console.log("✅ Gorse API接続成功");
		} else {
			console.log("⚠️ Gorse API接続に問題があります");
		}

		// 2. サンプルユーザーIDで推薦取得テスト
		console.log("\n2. 推薦取得テスト（サンプルユーザー: test_user）...");
		const recommendations = await gorseApi.getRecommendations("test_user", 5);
		console.log("✅ 推薦取得成功:", recommendations.length, "件");

		if (recommendations.length > 0) {
			console.log(
				"  推薦アイテム:",
				recommendations.map((r) => r.ItemId).join(", ")
			);
		}

		// 3. 類似アイテム取得テスト（サンプルアイテムID: test_item）
		console.log(
			"\n3. 類似アイテム取得テスト（サンプルアイテム: test_item）..."
		);
		const similarItems = await gorseApi.getSimilarItems("test_item", 5);
		console.log("✅ 類似アイテム取得成功:", similarItems.length, "件");

		if (similarItems.length > 0) {
			console.log(
				"  類似アイテム:",
				similarItems.map((r) => r.ItemId).join(", ")
			);
		}

		// 4. フィードバック送信テスト
		console.log("\n4. フィードバック送信テスト...");
		await gorseApi.sendFeedback("test_user", "test_item", "view");
		console.log("✅ フィードバック送信成功");
	} catch (error) {
		console.error("❌ エラーが発生しました:", error);
	}

	console.log("\n🔍 Gorse API接続テスト完了");
}

async function testSupabaseConnection() {
	console.log("\n🔍 Supabase接続テスト開始...\n");

	try {
		// Supabaseクライアント作成
		const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

		// 1. セッションテスト
		console.log("1. Supabaseセッションテスト...");
		const {
			data: { session },
			error: sessionError,
		} = await supabase.auth.getSession();

		if (sessionError) {
			console.log("⚠️ セッション取得エラー:", sessionError.message);
		} else {
			console.log("✅ Supabase接続成功");
		}

		// 2. 商品テーブルアクセステスト
		console.log("\n2. 商品テーブルアクセステスト...");
		const { data: products, error: productsError } = await supabase
			.from("products")
			.select("*")
			.limit(5);

		if (productsError) {
			console.log("⚠️ 商品テーブルアクセスエラー:", productsError.message);
		} else {
			console.log("✅ 商品テーブルアクセス成功:", products?.length || 0, "件");
		}
	} catch (error) {
		console.error("❌ Supabase接続エラー:", error);
	}

	console.log("\n🔍 Supabase接続テスト完了");
}

async function testFrontendIntegration() {
	console.log("🚀 フロントエンド統合テスト開始...\n");

	// 環境変数確認
	console.log("📋 環境変数確認:");
	console.log(
		"  - VITE_GORSE_ENDPOINT:",
		process.env.VITE_GORSE_ENDPOINT || "http://52.199.237.91:8087"
	);
	console.log(
		"  - GORSE_API_KEY:",
		process.env.GORSE_API_KEY ? "設定済み" : "未設定"
	);
	console.log("  - VITE_SUPABASE_URL:", SUPABASE_URL);
	console.log(
		"  - VITE_SUPABASE_ANON_KEY:",
		SUPABASE_ANON_KEY ? "設定済み" : "未設定"
	);
	console.log("");

	await testGorseConnection();
	await testSupabaseConnection();

	console.log("\n🎉 フロントエンド統合テスト完了！");
}

// テスト実行
testFrontendIntegration().catch(console.error);
