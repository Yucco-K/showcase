import { createClient } from "@supabase/supabase-js";

// フロントエンドと同じ環境変数を使用
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
	throw new Error("Missing VITE_SUPABASE_URL environment variable");
}

if (!supabaseAnonKey) {
	throw new Error("Missing VITE_SUPABASE_ANON_KEY environment variable");
}

console.log("=== フロントエンド接続テスト ===");
console.log("Supabase URL:", supabaseUrl);
console.log("Supabase Anon Key:", supabaseAnonKey.substring(0, 20) + "...");

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testFrontendConnection() {
	try {
		// 1. 基本的な接続テスト
		console.log("\n1. 基本的な接続テスト...");

		const {
			data: { session },
			error: sessionError,
		} = await supabase.auth.getSession();

		if (sessionError) {
			console.error("セッション確認エラー:", sessionError);
		} else {
			console.log("✅ Supabase接続成功");
			console.log("認証状態:", session ? "ログイン中" : "未ログイン");
		}

		// 2. productsテーブルアクセステスト
		console.log("\n2. productsテーブルアクセステスト...");

		const { data: productsData, error: productsError } = await supabase
			.from("products")
			.select("*")
			.limit(1);

		if (productsError) {
			console.error("productsテーブルアクセスエラー:", productsError);
			console.log("エラー詳細:", productsError);
		} else {
			console.log("✅ productsテーブルアクセス成功");
			console.log(`取得された商品数: ${productsData?.length || 0}`);
		}

		// 3. フロントエンドと同じクエリのテスト
		console.log("\n3. フロントエンドと同じクエリのテスト...");

		const { data: fullQueryData, error: fullQueryError } = await supabase
			.from("products")
			.select("*, product_likes(count), product_reviews(count)");

		if (fullQueryError) {
			console.error("フルクエリアクセスエラー:", fullQueryError);
			console.log("エラー詳細:", fullQueryError);
		} else {
			console.log("✅ フルクエリアクセス成功");
			console.log(`取得された商品数: ${fullQueryData?.length || 0}`);

			if (fullQueryData && fullQueryData.length > 0) {
				console.log("最初の商品のサンプル:");
				const firstProduct = fullQueryData[0];
				console.log("  - ID:", firstProduct.id);
				console.log("  - Name:", firstProduct.name);
				console.log("  - Likes count:", firstProduct.product_likes?.[0]?.count);
				console.log(
					"  - Reviews count:",
					firstProduct.product_reviews?.[0]?.count
				);
			}
		}

		// 4. 環境変数の確認
		console.log("\n4. 環境変数の確認...");
		const adminEmails = process.env.VITE_ADMIN_EMAILS;
		console.log("VITE_ADMIN_EMAILS:", adminEmails);

		if (adminEmails) {
			const emailList = adminEmails
				.split(",")
				.map((e) => e.trim().toLowerCase());
			console.log("設定済み管理者メールアドレス:", emailList);
		} else {
			console.log("❌ VITE_ADMIN_EMAILS が設定されていません");
		}

		console.log("\n=== テスト完了 ===");
	} catch (error) {
		console.error("テスト中にエラーが発生:", error);
	}
}

testFrontendConnection();
