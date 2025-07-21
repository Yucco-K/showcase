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

async function checkProductsTable() {
	try {
		console.log("=== Productsテーブル確認 ===");

		// 1. productsテーブルの構造確認
		console.log("\n1. productsテーブルの構造確認...");
		const { data: sampleProduct, error: productError } = await supabase
			.from("products")
			.select("*")
			.limit(1);

		if (productError) {
			console.error("productsテーブルアクセスエラー:", productError);
			return;
		}

		if (sampleProduct && sampleProduct.length > 0) {
			const product = sampleProduct[0];
			console.log("productsテーブルのカラム:");
			Object.keys(product).forEach((key) => {
				console.log(
					`  - ${key}: ${typeof product[key as keyof typeof product]}`
				);
			});
		} else {
			console.log("productsテーブルにデータがありません");
		}

		// 2. productsテーブルのデータ数確認
		console.log("\n2. productsテーブルのデータ数確認...");
		const { count: productCount, error: countError } = await supabase
			.from("products")
			.select("*", { count: "exact", head: true });

		if (countError) {
			console.error("productsテーブルカウントエラー:", countError);
		} else {
			console.log(`productsテーブルのデータ数: ${productCount}`);
		}

		// 3. product_reviewsテーブルの構造確認
		console.log("\n3. product_reviewsテーブルの構造確認...");
		const { data: sampleReview, error: reviewError } = await supabase
			.from("product_reviews")
			.select("*")
			.limit(1);

		if (reviewError) {
			console.error("product_reviewsテーブルアクセスエラー:", reviewError);
		} else if (sampleReview && sampleReview.length > 0) {
			const review = sampleReview[0];
			console.log("product_reviewsテーブルのカラム:");
			Object.keys(review).forEach((key) => {
				console.log(`  - ${key}: ${typeof review[key as keyof typeof review]}`);
			});
		} else {
			console.log("product_reviewsテーブルにデータがありません");
		}

		// 4. product_reviewsテーブルのデータ数確認
		console.log("\n4. product_reviewsテーブルのデータ数確認...");
		const { count: reviewCount, error: reviewCountError } = await supabase
			.from("product_reviews")
			.select("*", { count: "exact", head: true });

		if (reviewCountError) {
			console.error("product_reviewsテーブルカウントエラー:", reviewCountError);
		} else {
			console.log(`product_reviewsテーブルのデータ数: ${reviewCount}`);
		}

		// 5. リレーションクエリのテスト
		console.log("\n5. リレーションクエリのテスト...");
		const { data: relationTest, error: relationError } = await supabase
			.from("products")
			.select("*, product_reviews(count)");

		if (relationError) {
			console.error("リレーションクエリエラー:", relationError);
			console.log("エラー詳細:", relationError);
		} else {
			console.log("✅ リレーションクエリが成功しました");
			console.log(`取得された商品数: ${relationTest?.length || 0}`);
			if (relationTest && relationTest.length > 0) {
				console.log("最初の商品のサンプル:");
				console.log("  - ID:", relationTest[0].id);
				console.log("  - Name:", relationTest[0].name);
				console.log(
					"  - Reviews count:",
					relationTest[0].product_reviews?.[0]?.count
				);
			}
		}

		// 6. 個別のproduct_reviews取得テスト
		console.log("\n6. 個別のproduct_reviews取得テスト...");
		const { data: reviewsTest, error: reviewsTestError } = await supabase
			.from("product_reviews")
			.select("count");

		if (reviewsTestError) {
			console.error("product_reviews個別取得エラー:", reviewsTestError);
		} else {
			console.log("✅ product_reviews個別取得が成功しました");
			console.log(`取得されたレビュー数: ${reviewsTest?.length || 0}`);
		}

		console.log("\n=== 確認完了 ===");
	} catch (error) {
		console.error("確認中にエラーが発生:", error);
	}
}

checkProductsTable();
