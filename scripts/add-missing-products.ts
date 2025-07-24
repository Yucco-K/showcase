import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

// Gorseから返されるがSupabaseに存在しない商品ID
const missingProductIds = [
	"4fc7c824-22ab-465b-b6d4-8f56597ab5d2",
	"23382510-1131-4ab1-a0d4-af94efc9188c",
	"bf7e12f6-9ab9-4754-8694-769ccc4320e6",
	"8f0ffaa8-0af2-4fdf-bc90-dd10613a75f9",
];

async function addMissingProducts() {
	console.log("🔄 不足している商品を追加中...");

	try {
		// 既存の商品を確認
		const { data: existingProducts, error } = await supabase
			.from("products")
			.select("id")
			.in("id", missingProductIds);

		if (error) {
			throw new Error(`Supabase error: ${error.message}`);
		}

		const existingIds = new Set(existingProducts.map((p) => p.id));
		const trulyMissingIds = missingProductIds.filter(
			(id) => !existingIds.has(id)
		);

		console.log(`📊 追加が必要な商品: ${trulyMissingIds.length} 個`);

		if (trulyMissingIds.length === 0) {
			console.log("✅ すべての商品が既に存在します");
			return;
		}

		// 不足している商品を追加
		const productsToInsert = trulyMissingIds.map((id, index) => ({
			id,
			name: `Gorse Product ${index + 1}`,
			description: `Auto-generated product from Gorse recommendation system (ID: ${id})`,
			price: Math.floor(Math.random() * 5000) + 1000,
			category: "recommendation",
			image_url: "https://via.placeholder.com/300",
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
			is_featured: false,
			is_popular: false,
			tags: ["gorse", "recommendation"],
		}));

		const { error: insertError } = await supabase
			.from("products")
			.insert(productsToInsert);

		if (insertError) {
			throw new Error(`Insert error: ${insertError.message}`);
		}

		console.log(`✅ ${productsToInsert.length} 個の商品を正常に追加しました`);
		console.log("📋 追加された商品ID:", trulyMissingIds);
	} catch (error) {
		console.error("❌ エラー:", error);
		throw error;
	}
}

// スクリプト実行
addMissingProducts()
	.then(() => {
		console.log("🎉 完了！");
		process.exit(0);
	})
	.catch((error) => {
		console.error("💥 失敗:", error);
		process.exit(1);
	});
