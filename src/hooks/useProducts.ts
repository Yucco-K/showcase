import { useState, useMemo, useEffect } from "react";
import type { ProductFilter, Product } from "../types/product";
import { ProductCategory } from "../types/product";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthProvider";
import { toCamelCase } from "../utils/caseConverter";

// DB Row 型（Snake case カラム）
type DbProduct = {
	id: string;
	name: string;
	description: string;
	long_desc: string | null;
	price: number;
	category: string;
	image_url: string | null;
	tags: string[] | null;
	is_featured: boolean | null;
	is_popular: boolean | null;
	likes?: number | null; // 保持していても良い
	stars_total: number | null;
	stars_count: number | null;
	features: string[] | null;
	requirements: string[] | null;
	last_updated: string | null;
	product_likes?: { count: number }[]; // relation count
	product_reviews?: { count: number }[];
};

// DB → フロント用 Product 型へ変換
const mapDbProduct = (row: DbProduct): Product => {
	const camel = toCamelCase(row) as DbProduct;
	// likes/reviewCountなど追加計算が必要な場合はここで上書き
	const avgRating =
		(row.stars_count && row.stars_count > 0
			? (row.stars_total ?? 0) / row.stars_count
			: 0) || 0;
	const likesCount = row.product_likes?.[0]?.count ?? row.likes ?? 0;
	const reviewCount = row.product_reviews?.[0]?.count ?? row.stars_count ?? 0;
	if (import.meta.env.DEV) {
		console.log("[mapDbProduct]", row.name, {
			stars_total: row.stars_total,
			stars_count: row.stars_count,
			avgRating,
			image_url: row.image_url,
			imageUrl: row.image_url || "",
		});
	}
	return {
		...camel,
		longDescription: row.long_desc ?? "",
		imageUrl: row.image_url || "",
		features: row.features ?? [],
		requirements: row.requirements ?? [],
		screenshots: [],
		version: "1.0.0",
		lastUpdated: row.last_updated ?? "",
		rating: avgRating,
		reviewCount: reviewCount,
		likes: likesCount,
		isPopular: !!row.is_popular,
		isFeatured: !!row.is_featured,
		category: row.category as ProductCategory,
		tags: row.tags ?? [],
	};
};

// DbProduct型かどうかを判定する型ガード
function isDbProduct(obj: unknown): obj is DbProduct {
	return (
		obj !== null &&
		typeof obj === "object" &&
		"id" in obj &&
		"name" in obj &&
		"description" in obj
	);
}

export const useProducts = () => {
	const [filter, setFilter] = useState<ProductFilter>({});
	const [products, setProducts] = useState<Product[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(true);

	/** 現在のユーザーのお気に入り product_id リスト */
	const { user } = useAuth();
	const [favorites, setFavorites] = useState<string[]>([]);

	/** 初回ロード時またはユーザー変更時に DB から likes を取得 */
	useEffect(() => {
		if (!user) {
			setFavorites([]);
			return;
		}

		let isMounted = true;
		(async () => {
			const { data, error } = await supabase
				.from("product_likes")
				.select("product_id")
				.eq("user_id", user.id);

			if (error) {
				console.error("Failed to fetch user likes", error);
				return;
			}

			if (isMounted && data) {
				setFavorites(data.map((row) => row.product_id as string));
			}
		})();

		return () => {
			isMounted = false;
		};
	}, [user]);

	// 初回ロード: Supabase から商品一覧を取得
	useEffect(() => {
		let isMounted = true;
		(async () => {
			const { data, error } = await supabase
				.from("products")
				.select("*, product_likes(count), product_reviews(count)");
			if (error) {
				console.error("Failed to fetch products", error);
				if (isMounted) setIsLoading(false);
				return;
			}
			if (Array.isArray(data)) {
				const valid = data.filter(isDbProduct);
				setProducts(valid.map(mapDbProduct));
			} else {
				setProducts([]);
			}
			setIsLoading(false);
		})();
		return () => {
			isMounted = false;
		};
	}, []);

	// フィルタリングされた商品リスト
	const filteredProducts = useMemo(() => {
		let result = products;

		// カテゴリーフィルター
		if (filter.category) {
			result = result.filter((product) => product.category === filter.category);
		}

		// 価格フィルター
		if (filter.minPrice !== undefined) {
			result = result.filter((product) => product.price >= filter.minPrice!);
		}
		if (filter.maxPrice !== undefined) {
			result = result.filter((product) => product.price <= filter.maxPrice!);
		}

		// 評価フィルター
		if (filter.minRating !== undefined) {
			result = result.filter(
				(product) => (product.rating ?? 0) >= filter.minRating!
			);
		}

		// 検索クエリ
		if (filter.searchQuery) {
			const searchTerm = filter.searchQuery.toLowerCase();
			result = result.filter(
				(product) =>
					product.name.toLowerCase().includes(searchTerm) ||
					product.description.toLowerCase().includes(searchTerm) ||
					product.tags.some((tag) => tag.toLowerCase().includes(searchTerm))
			);
		}

		// ソート
		if (filter.sortBy) {
			result = [...result].sort((a, b) => {
				let aValue: string | number;
				let bValue: string | number;

				switch (filter.sortBy) {
					case "name":
						aValue = a.name.toLowerCase();
						bValue = b.name.toLowerCase();
						break;
					case "price":
						aValue = a.price;
						bValue = b.price;
						break;
					case "rating":
						aValue = a.rating;
						bValue = b.rating;
						break;
					case "popular":
						aValue = a.reviewCount;
						bValue = b.reviewCount;
						break;
					default:
						return 0;
				}

				if (filter.sortOrder === "desc") {
					return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
				} else {
					return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
				}
			});
		}

		return result;
	}, [filter, products]);

	// お気に入り関連の関数
	const toggleFavorite = async (productId: string) => {
		if (!user) {
			console.warn("Like requires login");
			return;
		}

		// 既に like 済みかどうか
		const isLiked = favorites.includes(productId);

		if (isLiked) {
			// Unlike => DELETE
			const { error } = await supabase
				.from("product_likes")
				.delete()
				.eq("product_id", productId)
				.eq("user_id", user.id);

			if (error) {
				console.error("Failed to unlike", error);
				return;
			}

			// ローカル state 更新 (楽観的)
			setFavorites((prev) => prev.filter((id) => id !== productId));

			// 楽観的に likes を -1
			setProducts((prev) =>
				prev.map((p) =>
					p.id === productId
						? { ...p, likes: Math.max((p.likes ?? 0) - 1, 0) }
						: p
				)
			);

			// DB の正確なカウントを取得して products state を更新
			const { data: refreshed, error: refErr } = await supabase
				.from("products")
				.select("*, product_likes(count), product_reviews(count)")
				.eq("id", productId)
				.single();
			if (refErr) {
				console.error("Failed to refetch product after unlike", refErr);
			}
			if (refreshed) {
				const updated = mapDbProduct(refreshed as DbProduct);
				setProducts((prev) =>
					prev.map((p) => (p.id === productId ? updated : p))
				);
			}
		} else {
			// Like => INSERT
			const { error } = await supabase.from("product_likes").insert({
				product_id: productId,
				user_id: user.id,
			});

			if (error) {
				console.error("Failed to like", error);
				return;
			}

			// 楽観的に +1
			setFavorites((prev) => [...prev, productId]);
			setProducts((prev) =>
				prev.map((p) =>
					p.id === productId ? { ...p, likes: (p.likes ?? 0) + 1 } : p
				)
			);
			const { data: refreshedAdd, error: refErrAdd } = await supabase
				.from("products")
				.select("*, product_likes(count), product_reviews(count)")
				.eq("id", productId)
				.single();
			if (refErrAdd) {
				console.error("Failed to refetch product after like", refErrAdd);
			}
			if (refreshedAdd) {
				const updated = mapDbProduct(refreshedAdd as DbProduct);
				setProducts((prev) =>
					prev.map((p) => (p.id === productId ? updated : p))
				);
			}
		}
	};

	const isFavorite = (productId: string) => favorites.includes(productId);

	const getFavoriteProducts = () => {
		return products.filter((product) => favorites.includes(product.id));
	};

	// フィルター更新関数
	const updateFilter = (newFilter: Partial<ProductFilter>) => {
		setFilter((prev) => ({ ...prev, ...newFilter }));
	};

	const clearFilter = () => {
		setFilter({});
	};

	// 検索関数
	const searchProductsWithQuery = (query: string) => {
		const searchTerm = query.toLowerCase();
		return products.filter(
			(product) =>
				product.name.toLowerCase().includes(searchTerm) ||
				product.description.toLowerCase().includes(searchTerm) ||
				product.tags.some((tag) => tag.toLowerCase().includes(searchTerm))
		);
	};

	return {
		// データ
		allProducts: products,
		filteredProducts,
		popularProducts: products.filter((p) => p.isPopular),
		featuredProducts: products.filter((p) => p.isFeatured),
		favoriteProducts: getFavoriteProducts(),

		// フィルター状態
		filter,

		// フィルター関数
		updateFilter,
		clearFilter,

		// 商品取得関数
		getProductById: (id: string) => products.find((p) => p.id === id),
		getProductsByCategory: (category: ProductCategory) =>
			products.filter((p) => p.category === category),
		searchProducts: searchProductsWithQuery,

		// お気に入り関数
		favorites,
		toggleFavorite,
		isFavorite,

		// ユーティリティ
		categories: Object.values(ProductCategory),
		totalProductCount: products.length,
		filteredProductCount: filteredProducts.length,
		isLoading,
	};
};

// 個別の商品詳細フック
export const useProduct = (productId: string) => {
	const [product, setProduct] = useState<Product | undefined>(undefined);
	const [isLoading, setLoading] = useState<boolean>(true);

	useEffect(() => {
		let isMounted = true;
		(async () => {
			const { data, error } = await supabase
				.from("products")
				.select("*, product_likes(count), product_reviews(count)")
				.eq("id", productId)
				.single();
			if (error) {
				console.error("Failed to fetch product", error);
				if (isMounted) setLoading(false);
				return;
			}
			if (isMounted && data) {
				setProduct(mapDbProduct(data as DbProduct));
				setLoading(false);
			}
		})();
		return () => {
			isMounted = false;
		};
	}, [productId]);

	return {
		product,
		isLoading,
		isFound: !!product,
	};
};
