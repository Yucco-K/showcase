import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl) {
	throw new Error("Missing VITE_SUPABASE_URL environment variable");
}

if (!supabaseServiceKey) {
	throw new Error("Missing SUPABASE_SERVICE_KEY environment variable");
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkRlsPolicies() {
	try {
		console.log("=== RLSポリシー確認 ===");

		// 1. productsテーブルのRLSポリシー確認
		console.log("\n1. productsテーブルのRLSポリシー確認...");

		// 匿名ユーザーとしてproductsテーブルにアクセス
		const { data: productsData, error: productsError } = await supabase
			.from("products")
			.select("*")
			.limit(1);

		if (productsError) {
			console.error("productsテーブルアクセスエラー:", productsError);
		} else {
			console.log("✅ productsテーブルにアクセス可能");
			console.log(`取得された商品数: ${productsData?.length || 0}`);
		}

		// 2. product_reviewsテーブルのRLSポリシー確認
		console.log("\n2. product_reviewsテーブルのRLSポリシー確認...");

		const { data: reviewsData, error: reviewsError } = await supabase
			.from("product_reviews")
			.select("*")
			.limit(1);

		if (reviewsError) {
			console.error("product_reviewsテーブルアクセスエラー:", reviewsError);
		} else {
			console.log("✅ product_reviewsテーブルにアクセス可能");
			console.log(`取得されたレビュー数: ${reviewsData?.length || 0}`);
		}

		// 3. リレーションクエリのRLSポリシー確認
		console.log("\n3. リレーションクエリのRLSポリシー確認...");

		const { data: relationData, error: relationError } = await supabase
			.from("products")
			.select("*, product_reviews(count)")
			.limit(1);

		if (relationError) {
			console.error("リレーションクエリアクセスエラー:", relationError);
		} else {
			console.log("✅ リレーションクエリにアクセス可能");
			console.log(`取得された商品数: ${relationData?.length || 0}`);
		}

		// 4. フロントエンドと同じクエリのテスト
		console.log("\n4. フロントエンドと同じクエリのテスト...");

		const { data: frontendQueryData, error: frontendQueryError } =
			await supabase
				.from("products")
				.select("*, product_likes(count), product_reviews(count)");

		if (frontendQueryError) {
			console.error("フロントエンドクエリアクセスエラー:", frontendQueryError);
		} else {
			console.log("✅ フロントエンドクエリにアクセス可能");
			console.log(`取得された商品数: ${frontendQueryData?.length || 0}`);
		}

		// 5. 認証状態の確認
		console.log("\n5. 認証状態の確認...");

		const {
			data: { session },
			error: sessionError,
		} = await supabase.auth.getSession();

		if (sessionError) {
			console.error("セッション確認エラー:", sessionError);
		} else {
			console.log("認証状態:", session ? "ログイン中" : "未ログイン");
			if (session?.user) {
				console.log("ユーザーID:", session.user.id);
				console.log("メールアドレス:", session.user.email);
			}
		}

		console.log("\n=== 確認完了 ===");
	} catch (error) {
		console.error("確認中にエラーが発生:", error);
	}
}

checkRlsPolicies();
