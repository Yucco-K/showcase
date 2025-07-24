import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

// Gorseから返されるID
const gorseItemIds = [
	"4fc7c824-22ab-465b-b6d4-8f56597ab5d2",
	"23382510-1131-4ab1-a0d4-af94efc9188c",
	"bf7e12f6-9ab9-4754-8694-769ccc4320e6",
	"8f0ffaa8-0af2-4fdf-bc90-dd10613a75f9",
];

async function debugUseProducts() {
	console.log("🔍 useProductsフックのデバッグ...");

	try {
		// useProductsと同じクエリを実行
		const { data: products, error } = await supabase
			.from("products")
			.select("*, product_likes(count), product_reviews(count)");

		if (error) {
			throw new Error(`Supabase error: ${error.message}`);
		}

		console.log(`\n📊 取得した商品数: ${products.length}個`);

		// 全商品のIDを表示
		console.log("\n📋 全商品ID:");
		products.forEach((p, index) => {
			console.log(`  ${index + 1}. ${p.id}: ${p.name}`);
		});

		// GorseのIDが含まれているか確認
		console.log("\n🔍 GorseのIDが含まれているか確認:");
		const productIds = products.map((p) => p.id);
		gorseItemIds.forEach((id) => {
			const found = productIds.includes(id);
			console.log(
				`  ${id}: ${found ? "✅ 含まれている" : "❌ 含まれていない"}`
			);
		});

		// フィルタリングなしの状態で類似商品を検索
		console.log("\n🎯 フィルタリングなしで類似商品を検索:");
		const similarProducts = gorseItemIds
			.map((id) => products.find((p) => p.id === id))
			.filter((p) => p !== undefined);

		console.log(`  見つかった類似商品: ${similarProducts.length}個`);
		similarProducts.forEach((p) => {
			console.log(`  - ${p.id}: ${p.name} (${p.category})`);
		});
	} catch (error) {
		console.error("❌ エラー:", error);
		throw error;
	}
}

// スクリプト実行
debugUseProducts()
	.then(() => {
		console.log("\n🎉 デバッグ完了！");
		process.exit(0);
	})
	.catch((error) => {
		console.error("\n💥 失敗:", error);
		process.exit(1);
	});
