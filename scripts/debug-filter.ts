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

async function debugFilter() {
	console.log("🔍 フィルタリングのデバッグ...");

	try {
		// 全商品を取得
		const { data: allProducts, error } = await supabase
			.from("products")
			.select("*, product_likes(count), product_reviews(count)");

		if (error) {
			throw new Error(`Supabase error: ${error.message}`);
		}

		console.log(`\n📊 全商品数: ${allProducts.length}個`);

		// 各種フィルターをテスト
		const testFilters = [
			{ name: "フィルターなし", filter: {} },
			{ name: "カテゴリ: health", filter: { category: "health" } },
			{ name: "カテゴリ: productivity", filter: { category: "productivity" } },
			{ name: "価格: 1000円以上", filter: { minPrice: 1000 } },
			{ name: "価格: 5000円以下", filter: { maxPrice: 5000 } },
			{ name: "評価: 3.0以上", filter: { minRating: 3.0 } },
			{ name: '検索: "App"', filter: { searchQuery: "App" } },
		];

		testFilters.forEach(({ name, filter }) => {
			// フィルタリング関数を模擬
			let filtered = allProducts;

			if (filter.category) {
				filtered = filtered.filter((p) => p.category === filter.category);
			}
			if (filter.minPrice !== undefined) {
				filtered = filtered.filter((p) => p.price >= filter.minPrice);
			}
			if (filter.maxPrice !== undefined) {
				filtered = filtered.filter((p) => p.price <= filter.maxPrice);
			}
			if (filter.minRating !== undefined) {
				filtered = filtered.filter(
					(p) =>
						(p.stars_count && p.stars_count > 0
							? (p.stars_total || 0) / p.stars_count
							: 0) >= filter.minRating
				);
			}
			if (filter.searchQuery) {
				const searchTerm = filter.searchQuery.toLowerCase();
				filtered = filtered.filter(
					(p) =>
						p.name.toLowerCase().includes(searchTerm) ||
						p.description.toLowerCase().includes(searchTerm) ||
						(p.tags &&
							p.tags.some((tag) => tag.toLowerCase().includes(searchTerm)))
				);
			}

			console.log(`\n🔍 ${name}:`);
			console.log(`  フィルター後: ${filtered.length}個`);

			// GorseのIDが含まれているか確認
			const filteredIds = filtered.map((p) => p.id);
			const foundIds = gorseItemIds.filter((id) => filteredIds.includes(id));
			console.log(`  GorseのIDが見つかった: ${foundIds.length}個`);

			if (foundIds.length > 0) {
				foundIds.forEach((id) => {
					const product = filtered.find((p) => p.id === id);
					console.log(`    ✅ ${id}: ${product?.name} (${product?.category})`);
				});
			} else {
				gorseItemIds.forEach((id) => {
					console.log(`    ❌ ${id}: 見つからない`);
				});
			}
		});
	} catch (error) {
		console.error("❌ エラー:", error);
		throw error;
	}
}

// スクリプト実行
debugFilter()
	.then(() => {
		console.log("\n🎉 デバッグ完了！");
		process.exit(0);
	})
	.catch((error) => {
		console.error("\n💥 失敗:", error);
		process.exit(1);
	});
