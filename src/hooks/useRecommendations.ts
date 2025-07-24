import { useState, useEffect, useCallback } from "react";
import { getRecommendations, getSimilarItems } from "../lib/gorse";
import { useAuth } from "../contexts/AuthProvider";
import type { Product } from "../types/product";
import type { RecommendationConfig } from "../types/recommendation";

interface UseRecommendationsProps {
	maxItems?: number;
	autoFetch?: boolean;
	fallbackProducts?: Product[];
}

export const useRecommendations = ({
	maxItems = 10,
	autoFetch = true,
	fallbackProducts = [],
}: UseRecommendationsProps = {}) => {
	const { user } = useAuth();
	const [recommendations, setRecommendations] = useState<string[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [lastFetched, setLastFetched] = useState<Date | null>(null);

	function applyFallbackRecommendations(
		fallbackProducts: Product[],
		maxItems: number,
		config?: RecommendationConfig,
		setRecommendations?: (ids: string[]) => void
	): string[] {
		const fallbackIds = fallbackProducts
			.slice(0, config?.maxItems || maxItems)
			.map((p) => p.id);
		if (setRecommendations) setRecommendations(fallbackIds);
		return fallbackIds;
	}

	// ユーザー向け推薦取得
	const fetchRecommendations = useCallback(
		async (config?: RecommendationConfig) => {
			if (!user?.id) {
				// ログインしていない場合はフォールバック商品を使用
				if (fallbackProducts.length > 0) {
					applyFallbackRecommendations(
						fallbackProducts,
						maxItems,
						config,
						setRecommendations
					);
				}
				return;
			}

			setIsLoading(true);
			setError(null);

			try {
				const items = await getRecommendations(
					user.id,
					config?.maxItems || maxItems
				);

				// 推薦結果がない場合はフォールバック
				if (items.length === 0 && fallbackProducts.length > 0) {
					applyFallbackRecommendations(
						fallbackProducts,
						maxItems,
						config,
						setRecommendations
					);
				} else {
					setRecommendations(items);
				}

				setLastFetched(new Date());
			} catch (err) {
				console.error("Failed to fetch recommendations:", err);
				setError("推薦の取得に失敗しました");

				// エラー時もフォールバックを使用
				if (fallbackProducts.length > 0) {
					applyFallbackRecommendations(
						fallbackProducts,
						maxItems,
						config,
						setRecommendations
					);
				}
			} finally {
				setIsLoading(false);
			}
		},
		[user?.id, maxItems, fallbackProducts]
	);

	// 類似商品推薦取得
	const fetchSimilarItems = useCallback(
		async (
			itemId: string,
			allProducts: Product[] = [],
			limit: number = 5
		): Promise<string[]> => {
			try {
				const items = await getSimilarItems(itemId, allProducts, limit);
				return items;
			} catch (err) {
				console.error(`Failed to fetch similar items for ${itemId}:`, err);
				return [];
			}
		},
		[]
	);

	// 推薦の手動更新
	const refreshRecommendations = useCallback(
		(config?: RecommendationConfig) => {
			return fetchRecommendations(config);
		},
		[fetchRecommendations]
	);

	// 自動取得の設定
	useEffect(() => {
		if (autoFetch && user?.id) {
			fetchRecommendations();
		}
	}, [autoFetch, user?.id, fetchRecommendations]);

	// 推薦結果のメタデータ
	const metadata = {
		count: recommendations.length,
		hasRecommendations: recommendations.length > 0,
		isPersonalized: !!user?.id,
		lastFetched,
		isFallback: !user?.id || (lastFetched && recommendations.length === 0),
	};

	return {
		recommendations,
		isLoading,
		error,
		metadata,
		fetchRecommendations: refreshRecommendations,
		fetchSimilarItems,
		clearError: () => setError(null),
		clearRecommendations: () => setRecommendations([]),
	};
};

// 特定商品の類似商品取得専用フック
export const useSimilarProducts = (
	productId: string | null,
	allProducts: Product[] = [],
	limit: number = 5
) => {
	const [similarItems, setSimilarItems] = useState<string[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [retryCount, setRetryCount] = useState(0);
	const maxRetries = 2;

	const fetchSimilar = useCallback(async () => {
		if (!productId) {
			setSimilarItems([]);
			return;
		}

		setIsLoading(true);
		setError(null);

		try {
			console.log(
				`[Recommendations] 類似商品を取得中 (${retryCount + 1}/${
					maxRetries + 1
				}回目)`
			);
			const items = await getSimilarItems(productId, allProducts, limit);
			console.log(`[Recommendations] Gorseから取得した類似商品ID:`, items);
			setSimilarItems(items);
			// 成功したらリトライカウントをリセット
			setRetryCount(0);
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : String(err);
			console.error(
				`[Recommendations] Failed to fetch similar items for ${productId}:`,
				errorMessage
			);

			// エラーメッセージを設定
			if (errorMessage.includes("タイムアウト")) {
				setError(
					`APIリクエストがタイムアウトしました。サーバーの応答が遅いか、接続に問題がある可能性があります。`
				);
			} else if (errorMessage.includes("CORS")) {
				setError(
					`CORSポリシーエラー: APIサーバーへのアクセスが制限されています。`
				);
			} else {
				setError(`類似アイテムの取得に失敗しました: ${errorMessage}`);
			}

			// フォールバックロジック
			if (allProducts.length > 0) {
				console.log(`[Recommendations] Using local fallback for ${productId}`);
				const current = allProducts.find((p) => p.id === productId);
				if (current) {
					const sameCategory = allProducts
						.filter(
							(p) => p.id !== productId && p.category === current.category
						)
						.slice(0, limit)
						.map((p) => p.id);

					if (sameCategory.length > 0) {
						console.log(
							`[Recommendations] Found ${sameCategory.length} fallback items in same category`
						);
						setSimilarItems(sameCategory);
					}
				}
			}
		} finally {
			setIsLoading(false);
		}
	}, [productId, allProducts, limit, retryCount]);

	// 自動リトライロジック
	useEffect(() => {
		if (error && retryCount < maxRetries) {
			const retryDelay = Math.pow(2, retryCount) * 1000; // 指数バックオフ: 1秒、2秒、4秒...
			console.log(
				`[Recommendations] Will retry in ${retryDelay}ms (attempt ${
					retryCount + 1
				}/${maxRetries})`
			);

			const timeoutId = setTimeout(() => {
				setRetryCount((prev) => prev + 1);
				fetchSimilar();
			}, retryDelay);

			return () => clearTimeout(timeoutId);
		}
	}, [error, retryCount, fetchSimilar]);

	useEffect(() => {
		fetchSimilar();
	}, [fetchSimilar]);

	return {
		similarItems,
		isLoading,
		error,
		refetch: () => {
			setRetryCount(0);
			return fetchSimilar();
		},
		clearError: () => setError(null),
	};
};
