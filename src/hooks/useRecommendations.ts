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

	// ユーザー向け推薦取得
	const fetchRecommendations = useCallback(
		async (config?: RecommendationConfig) => {
			if (!user?.id) {
				// ログインしていない場合はフォールバック商品を使用
				if (fallbackProducts.length > 0) {
					const fallbackIds = fallbackProducts
						.slice(0, config?.maxItems || maxItems)
						.map((p) => p.id);
					setRecommendations(fallbackIds);
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
					const fallbackIds = fallbackProducts
						.slice(0, config?.maxItems || maxItems)
						.map((p) => p.id);
					setRecommendations(fallbackIds);
				} else {
					setRecommendations(items);
				}

				setLastFetched(new Date());
			} catch (err) {
				console.error("Failed to fetch recommendations:", err);
				setError("推薦の取得に失敗しました");

				// エラー時もフォールバックを使用
				if (fallbackProducts.length > 0) {
					const fallbackIds = fallbackProducts
						.slice(0, config?.maxItems || maxItems)
						.map((p) => p.id);
					setRecommendations(fallbackIds);
				}
			} finally {
				setIsLoading(false);
			}
		},
		[user?.id, maxItems, fallbackProducts]
	);

	// 類似商品推薦取得
	const fetchSimilarItems = useCallback(
		async (itemId: string, limit: number = 5): Promise<string[]> => {
			try {
				const items = await getSimilarItems(itemId, limit);
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
	limit: number = 5
) => {
	const [similarItems, setSimilarItems] = useState<string[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const fetchSimilar = useCallback(async () => {
		if (!productId) {
			setSimilarItems([]);
			return;
		}

		setIsLoading(true);
		setError(null);

		try {
			const items = await getSimilarItems(productId, limit);
			setSimilarItems(items);
		} catch (err) {
			console.error(`Failed to fetch similar items for ${productId}:`, err);
			setError("類似商品の取得に失敗しました");
			setSimilarItems([]);
		} finally {
			setIsLoading(false);
		}
	}, [productId, limit]);

	useEffect(() => {
		fetchSimilar();
	}, [fetchSimilar]);

	return {
		similarItems,
		isLoading,
		error,
		refetch: fetchSimilar,
		clearError: () => setError(null),
	};
};
