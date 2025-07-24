import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;
const gorseEndpoint = process.env.VITE_GORSE_ENDPOINT!;

const supabase = createClient(supabaseUrl, supabaseKey);

interface GorseItem {
	ItemId: string;
	Categories: string[];
	Timestamp: string;
	Labels: string[];
	Comment: string;
}

interface Product {
	id: string;
	name: string;
	description: string;
	price: number;
	category: string;
	image_url: string;
	created_at: string;
	updated_at: string;
}

async function syncGorseToSupabase() {
	console.log("🔄 GorseとSupabaseの同期を開始...");

	try {
		// 1. Gorseから全アイテムを取得
		console.log("📥 Gorseからアイテムを取得中...");
		const gorseResponse = await fetch(`${gorseEndpoint}/api/items`);
		if (!gorseResponse.ok) {
			throw new Error(`Gorse API error: ${gorseResponse.status}`);
		}
		const gorseResponseData = await gorseResponse.json();
		console.log(
			"📋 Gorse API response:",
			JSON.stringify(gorseResponseData, null, 2)
		);

		// レスポンス形式を確認して適切に処理
		const gorseItems: GorseItem[] = gorseResponseData.Items || [];
		console.log(`✅ Gorseから ${gorseItems.length} 個のアイテムを取得`);

		// 2. Supabaseから既存の商品を取得
		console.log("📥 Supabaseから既存商品を取得中...");
		const { data: existingProducts, error } = await supabase
			.from("products")
			.select("id");

		if (error) {
			throw new Error(`Supabase error: ${error.message}`);
		}

		const existingIds = new Set(existingProducts.map((p) => p.id));
		console.log(`✅ Supabaseに ${existingIds.size} 個の既存商品を確認`);

		// 3. 不足している商品を特定
		const missingItems = gorseItems.filter(
			(item) => !existingIds.has(item.ItemId)
		);
		console.log(`📊 同期が必要な商品: ${missingItems.length} 個`);

		if (missingItems.length === 0) {
			console.log("✅ すべての商品が既に同期済みです");
			return;
		}

		// 4. 不足している商品をSupabaseに追加
		console.log("📤 不足している商品をSupabaseに追加中...");
		const productsToInsert: Product[] = missingItems.map((item) => ({
			id: item.ItemId,
			name: item.Comment || `Product ${item.ItemId.slice(0, 8)}`,
			description: `Auto-synced from Gorse: ${
				item.Comment || "No description"
			}`,
			price: Math.floor(Math.random() * 5000) + 1000, // ランダム価格
			category: item.Categories?.[0] || "uncategorized",
			image_url: "https://via.placeholder.com/300",
			created_at: new Date(item.Timestamp).toISOString(),
			updated_at: new Date().toISOString(),
		}));

		const { error: insertError } = await supabase
			.from("products")
			.insert(productsToInsert);

		if (insertError) {
			throw new Error(`Insert error: ${insertError.message}`);
		}

		console.log(`✅ ${productsToInsert.length} 個の商品を正常に同期しました`);
	} catch (error) {
		console.error("❌ 同期エラー:", error);
		throw error;
	}
}

// スクリプト実行
syncGorseToSupabase()
	.then(() => {
		console.log("🎉 同期完了！");
		process.exit(0);
	})
	.catch((error) => {
		console.error("💥 同期失敗:", error);
		process.exit(1);
	});

export { syncGorseToSupabase };
