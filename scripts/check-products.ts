import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

// Gorseから返されるID（コンソールログから取得）
const gorseItemIds = [
	"4fc7c824-22ab-465b-b6d4-8f56597ab5d2",
	"23382510-1131-4ab1-a0d4-af94efc9188c",
	"bf7e12f6-9ab9-4754-8694-769ccc4320e6",
	"8f0ffaa8-0af2-4fdf-bc90-dd10613a75f9",
];

async function checkProducts() {
	console.log("🔍 Supabase productsテーブルの確認...");
	console.log("📋 確認対象ID:", gorseItemIds);

	try {
		// 1. 特定のIDが存在するか確認
		const { data: specificProducts, error: specificError } = await supabase
			.from("products")
			.select("id, name, category")
			.in("id", gorseItemIds);

		if (specificError) {
			throw new Error(`Specific query error: ${specificError.message}`);
		}

		console.log("\n✅ 特定IDの確認結果:");
		console.log(`  見つかった商品: ${specificProducts.length}個`);

		const foundIds = new Set(specificProducts.map((p) => p.id));
		gorseItemIds.forEach((id) => {
			const found = foundIds.has(id);
			console.log(`  ${id}: ${found ? "✅ 存在" : "❌ 不存在"}`);
		});

		// 2. 全商品の数を確認
		const { count: totalCount, error: countError } = await supabase
			.from("products")
			.select("*", { count: "exact", head: true });

		if (countError) {
			throw new Error(`Count query error: ${countError.message}`);
		}

		console.log(`\n📊 全商品数: ${totalCount}個`);

		// 3. 最新の商品をいくつか表示
		const { data: recentProducts, error: recentError } = await supabase
			.from("products")
			.select("id, name, category, created_at")
			.order("created_at", { ascending: false })
			.limit(5);

		if (recentError) {
			throw new Error(`Recent query error: ${recentError.message}`);
		}

		console.log("\n📅 最新の商品（上位5件）:");
		recentProducts.forEach((p) => {
			console.log(`  ${p.id}: ${p.name} (${p.category})`);
		});
	} catch (error) {
		console.error("❌ エラー:", error);
		throw error;
	}
}

// スクリプト実行
checkProducts()
	.then(() => {
		console.log("\n🎉 確認完了！");
		process.exit(0);
	})
	.catch((error) => {
		console.error("\n💥 失敗:", error);
		process.exit(1);
	});
