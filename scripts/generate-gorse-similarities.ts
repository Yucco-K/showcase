import { createClient } from "@supabase/supabase-js";
import { Gorse } from "gorsejs";
import * as dotenv from "dotenv";
import path from "node:path";

// 定数定義
const MAX_PRODUCTS_TO_SELECT = 3;
const MIN_PRODUCTS_TO_SELECT = 1;

// 環境変数を読み込む（.envと.env.local両方）
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

// Supabase クライアントの初期化
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log("Supabase URL:", supabaseUrl);
console.log("Supabase Key Exists:", !!supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
	throw new Error(
		"環境変数 VITE_SUPABASE_URL または VITE_SUPABASE_ANON_KEY が設定されていません。"
	);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Gorse クライアントの初期化
const gorse = new Gorse({
	endpoint: process.env.VITE_GORSE_ENDPOINT || "http://52.198.15.232:8086",
	secret: process.env.GORSE_API_KEY || "",
});

// 擬似ユーザーを生成（テスト用）
async function generateTestUsers(count: number) {
	console.log(`🧑‍💼 ${count}人の擬似ユーザーを生成します...`);

	const users = [];
	for (let i = 1; i <= count; i++) {
		const userId = `test-user-${i}`;
		try {
			await (gorse as any).insertUser({
				UserId: userId,
				Labels: ["test-user"],
			});
			users.push(userId);
			console.log(`✅ ユーザー ${userId} を追加しました`);
		} catch (error) {
			console.error(`❌ ユーザー ${userId} の追加に失敗しました:`, error);
		}
	}

	return users;
}

// 商品間の類似性データを生成
async function generateSimilarityData() {
	try {
		console.log("🔄 商品間の類似性データを生成します...");

		// Supabaseから商品データを取得
		const { data: products, error } = await supabase
			.from("products")
			.select("*");

		if (error) {
			throw new Error(`商品データの取得に失敗しました: ${error.message}`);
		}

		if (!products || products.length === 0) {
			console.log("⚠️ 商品データがありません");
			return;
		}

		console.log(`📦 ${products.length}件の商品データを取得しました`);

		// カテゴリ別に商品をグループ化
		const productsByCategory: Record<string, any[]> = {};
		products.forEach((product) => {
			const category = product.category;
			if (!productsByCategory[category]) {
				productsByCategory[category] = [];
			}
			productsByCategory[category].push(product);
		});

		// テストユーザーの生成
		const testUsers = await generateTestUsers(10);

		// 各ユーザーが各カテゴリの商品に対して関連性の高いフィードバックを生成
		let feedbackCount = 0;

		for (const userId of testUsers) {
			// 各カテゴリから1-3商品をランダムに選んでいいね/購入
			for (const [category, categoryProducts] of Object.entries(
				productsByCategory
			)) {
				// このカテゴリから何個の商品を選ぶか
				const numToSelect =
					Math.floor(Math.random() * MAX_PRODUCTS_TO_SELECT) +
					MIN_PRODUCTS_TO_SELECT; // 1~3個

				// ランダムに商品を選択
				const selectedProducts = [...categoryProducts]
					.sort(() => 0.5 - Math.random())
					.slice(0, Math.min(numToSelect, categoryProducts.length));

				// 選択した商品に対してフィードバックを生成
				for (const product of selectedProducts) {
					try {
						const feedbackType = Math.random() < 0.3 ? "purchase" : "like";

						await gorse.insertFeedbacks([
							{
								FeedbackType: feedbackType,
								UserId: userId,
								ItemId: String(product.id),
								Timestamp: new Date().toISOString(),
							},
						]);

						feedbackCount++;
						console.log(
							`✅ ユーザー ${userId} が商品 ${product.name} に ${feedbackType} フィードバックを送信しました`
						);

						// APIレート制限を避けるため少し待機
						await new Promise((resolve) => setTimeout(resolve, 50));
					} catch (error) {
						console.error(`❌ フィードバック送信に失敗しました:`, error);
					}
				}
			}
		}

		// 関連性の高い商品同士でさらにフィードバックを強化
		console.log("\n🔄 関連性の高い商品間のフィードバックを強化します...");

		// 各カテゴリ内で相互に関連付け
		for (const [category, categoryProducts] of Object.entries(
			productsByCategory
		)) {
			if (categoryProducts.length < 2) continue;

			// カテゴリ内の商品をグループ化（特徴やタグで）
			const productGroups: Record<string, any[]> = {};

			categoryProducts.forEach((product) => {
				// タグやその他の特徴に基づいてグループ化
				const groupKey =
					product.tags && product.tags.length > 0
						? product.tags[0]
						: `group-${Math.floor(Math.random() * 3)}`;

				if (!productGroups[groupKey]) {
					productGroups[groupKey] = [];
				}
				productGroups[groupKey].push(product);
			});

			// 同じグループ内の商品に対して複数ユーザーが同様のフィードバックを送信
			for (const [groupKey, groupProducts] of Object.entries(productGroups)) {
				if (groupProducts.length < 2) continue;

				// 各グループに3人のユーザーを割り当て
				const groupUsers = testUsers.slice(0, 3);

				for (const userId of groupUsers) {
					for (const product of groupProducts) {
						try {
							// 同一グループ内では同じフィードバックタイプを使用
							const feedbackType = Math.random() < 0.5 ? "purchase" : "like";

							await gorse.insertFeedbacks([
								{
									FeedbackType: feedbackType,
									UserId: userId,
									ItemId: String(product.id),
									Timestamp: new Date().toISOString(),
								},
							]);

							feedbackCount++;
							console.log(
								`✅ グループ ${groupKey} のユーザー ${userId} が商品 ${product.name} に ${feedbackType} フィードバックを送信しました`
							);

							// APIレート制限を避けるため少し待機
							await new Promise((resolve) => setTimeout(resolve, 50));
						} catch (error) {
							console.error(
								`❌ グループフィードバック送信に失敗しました:`,
								error
							);
						}
					}
				}
			}
		}

		console.log(`
    📊 類似性データ生成結果:
      ✅ テストユーザー: ${testUsers.length}人
      ✅ 商品カテゴリ: ${Object.keys(productsByCategory).length}種類
      ✅ 総フィードバック数: ${feedbackCount}件
    `);
	} catch (error) {
		console.error("💥 処理中にエラーが発生しました:", error);
	}
}

// スクリプト実行
generateSimilarityData()
	.then(() => {
		console.log("🎉 類似性データの生成が完了しました！");
		console.log("📝 Gorseシステムがデータを処理するまで数分お待ちください。");
		process.exit(0);
	})
	.catch((error) => {
		console.error("スクリプト実行エラー:", error);
		process.exit(1);
	});
