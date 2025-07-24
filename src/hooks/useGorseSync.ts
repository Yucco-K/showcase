import { useCallback } from "react";
import { insertItem, insertUser } from "../lib/gorse";
import type { Product, ProductCategory } from "../types/product";
import type { Profile } from "../types/database";
import { useToast } from "./useToast";
import { supabase } from "../lib/supabase";

// 定数定義
const API_RATE_LIMIT_DELAY_MS = 100;

export const useGorseSync = () => {
	const { showError, showSuccess } = useToast();

	// 商品をGorseに同期
	const syncProductToGorse = useCallback(
		async (product: Product) => {
			try {
				const labels = [];
				const categories = [product.category];

				// 商品の特徴をラベルに追加
				if (product.isFeatured) labels.push("featured");
				if (product.isPopular) labels.push("popular");
				if (product.tags) labels.push(...product.tags);

				await insertItem(product.id, labels, categories);

				console.log(`Product ${product.id} synced to Gorse`);
				return true;
			} catch (error) {
				console.error(`Failed to sync product ${product.id} to Gorse:`, error);
				showError(`商品 ${product.name} の同期に失敗しました`);
				return false;
			}
		},
		[showError]
	);

	// 複数の商品を一括同期
	const syncProductsToGorse = useCallback(
		async (products: Product[]) => {
			let successCount = 0;
			let failureCount = 0;

			for (const product of products) {
				const success = await syncProductToGorse(product);
				if (success) {
					successCount++;
				} else {
					failureCount++;
				}

				// APIレート制限を避けるため少し待機
				await new Promise((resolve) =>
					setTimeout(resolve, API_RATE_LIMIT_DELAY_MS)
				);
			}

			if (failureCount === 0) {
				showSuccess(`${successCount}件の商品を正常に同期しました`);
			} else {
				showError(
					`${failureCount}件の商品の同期に失敗しました（成功: ${successCount}件）`
				);
			}

			return { successCount, failureCount };
		},
		[syncProductToGorse, showError, showSuccess]
	);

	// ユーザーをGorseに同期
	const syncUserToGorse = useCallback(async (profile: Profile) => {
		try {
			const labels = [];

			// プロフィール情報からラベルを生成
			if (profile.biography) labels.push("has_bio");

			await insertUser(profile.id, labels);

			console.log(`User ${profile.id} synced to Gorse`);
			return true;
		} catch (error) {
			console.error(`Failed to sync user ${profile.id} to Gorse:`, error);
			return false;
		}
	}, []);

	// 既存の商品データを全てGorseに同期
	const syncAllProductsToGorse = useCallback(async () => {
		try {
			// 商品データを取得
			const { data: products } = await supabase.from("products").select("*");

			if (!products || products.length === 0) {
				showError("同期する商品データが見つかりません");
				return;
			}

			// 商品データをProduct型に変換
			const productData: Product[] = products.map((p) => ({
				id: String(p.id),
				name: String(p.name),
				description: String(p.description),
				longDescription: String(p.long_desc || ""),
				price: Number(p.price),
				category: String(p.category) as ProductCategory,
				imageUrl: String(p.image_url || ""),
				screenshots: [],
				features: Array.isArray(p.features) ? p.features.map(String) : [],
				requirements: Array.isArray(p.requirements)
					? p.requirements.map(String)
					: [],
				version: "1.0.0",
				lastUpdated: String(p.last_updated || ""),
				rating: 0,
				reviewCount: 0,
				likes: 0,
				tags: Array.isArray(p.tags) ? p.tags.map(String) : [],
				isPopular: Boolean(p.is_popular),
				isFeatured: Boolean(p.is_featured),
			}));

			await syncProductsToGorse(productData);
		} catch (error) {
			console.error("Failed to sync all products to Gorse:", error);
			showError("商品データの一括同期に失敗しました");
		}
	}, [syncProductsToGorse, showError]);

	return {
		syncProductToGorse,
		syncProductsToGorse,
		syncUserToGorse,
		syncAllProductsToGorse,
	};
};
