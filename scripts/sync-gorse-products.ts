import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import path from "path";

// 環境変数を読み込む（.envと.env.local両方）
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

// Gorse設定
const GORSE_ENDPOINT =
	process.env.VITE_GORSE_ENDPOINT || "http://18.183.44.71:8087";
const GORSE_API_KEY =
	process.env.VITE_GORSE_API_KEY ||
	"kmKLLA5eCveQTVOVDftScxlWJaKmJJVbfSlPMZYSqno=";

// Supabase クライアントの初期化
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
// サービスロール（管理者権限）を使用する場合
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

console.log("Supabase URL:", supabaseUrl);
console.log("Supabase Key Exists:", !!supabaseAnonKey);
console.log("Gorse Endpoint:", GORSE_ENDPOINT);

if (!supabaseUrl || !supabaseAnonKey) {
	throw new Error(
		"環境変数 VITE_SUPABASE_URL または VITE_SUPABASE_ANON_KEY が設定されていません。"
	);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Gorse APIクライアント
const insertItemToGorse = async (
	itemId: string,
	labels?: string[],
	categories?: string[]
) => {
	const url = `${GORSE_ENDPOINT}/api/items`;
	const items = [
		{
			ItemId: itemId,
			IsHidden: false,
			Labels: labels || [],
			Categories: categories || [],
			Timestamp: new Date().toISOString(),
			Comment: "",
		},
	];

	try {
		const response = await fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-API-Key": GORSE_API_KEY,
			},
			body: JSON.stringify(items),
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const result = await response.json();
		console.log(
			`Item inserted: ${itemId} (RowAffected: ${result.RowAffected})`
		);
	} catch (error) {
		console.error("Failed to insert item to Gorse:", error);
		throw error;
	}
};

// アイテム登録用のヘルパー関数（既存のinsertItemを使用）
const syncItem = async (
	itemId: string,
	labels?: string[],
	categories?: string[]
) => {
	try {
		await insertItemToGorse(itemId, labels, categories);
		console.log(`Item inserted: ${itemId}`);
	} catch (error) {
		console.error("Failed to insert item to Gorse:", error);
		throw error;
	}
};

// Gorseに商品データを同期するためのスクリプト
const syncProductsToGorse = async () => {
	try {
		console.log("🔄 Gorseに商品データの同期を開始します...");

		// Supabaseから商品データを取得
		const { data: products, error } = await supabase
			.from("products")
			.select("*");

		if (error) {
			throw new Error(`商品データの取得に失敗しました: ${error.message}`);
		}

		if (!products || products.length === 0) {
			console.log("⚠️ 同期する商品データがありません");
			return;
		}

		console.log(`📦 ${products.length}件の商品データを取得しました`);

		// 商品データを処理してGorseに同期
		let successCount = 0;
		let failureCount = 0;

		for (const p of products) {
			try {
				const labels: string[] = [];
				const categories: string[] = [String(p.category)];

				// 商品の特徴をラベルに追加
				if (p.is_featured) labels.push("featured");
				if (p.is_popular) labels.push("popular");
				if (Array.isArray(p.tags)) labels.push(...p.tags.map(String));

				await syncItem(String(p.id), labels, categories);

				successCount++;
				console.log(`✅ 商品 ${p.name} (ID: ${p.id}) を同期しました`);

				// APIレート制限を避けるため少し待機
				await new Promise((resolve) => setTimeout(resolve, 100));
			} catch (error) {
				failureCount++;
				console.error(
					`❌ 商品 ${p.name} (ID: ${p.id}) の同期に失敗しました:`,
					error
				);
			}
		}

		console.log(`
    📊 同期結果:
      ✅ 成功: ${successCount}件
      ❌ 失敗: ${failureCount}件
    `);
	} catch (error) {
		console.error("💥 同期処理中にエラーが発生しました:", error);
	}
};

// スクリプト実行
syncProductsToGorse()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error("スクリプト実行エラー:", error);
		process.exit(1);
	});
