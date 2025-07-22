import { useState, useMemo, useEffect } from "react";
import type { ProductFilter, Product } from "../types/product";
import { ProductCategory } from "../types/product";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthProvider";
import { toCamelCase } from "../utils/caseConverter";
import { useSupabaseQuery } from "./common/useSupabaseQuery";
import { useFavorites } from "./useFavorites";
import { filterProducts } from "../utils/filter";

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
	const camel = toCamelCase(row) as Partial<Product>;
	const avgRating =
		(row.stars_count && row.stars_count > 0
			? (row.stars_total ?? 0) / row.stars_count
			: 0) || 0;
	const likesCount = row.product_likes?.[0]?.count ?? row.likes ?? 0;
	const reviewCount = row.product_reviews?.[0]?.count ?? row.stars_count ?? 0;
	return {
		id: camel.id ?? row.id,
		name: camel.name ?? row.name,
		description: camel.description ?? row.description,
		longDescription: camel.longDescription ?? row.long_desc ?? "",
		price: camel.price ?? Number(row.price),
		category: camel.category ?? (row.category as ProductCategory),
		imageUrl: camel.imageUrl ?? (row.image_url || ""),
		screenshots: camel.screenshots ?? [],
		features: (camel.features ?? row.features ?? []) as string[],
		requirements: (camel.requirements ?? row.requirements ?? []) as string[],
		version: camel.version ?? "1.0.0",
		lastUpdated: camel.lastUpdated ?? row.last_updated ?? "",
		rating: camel.rating ?? avgRating,
		reviewCount: camel.reviewCount ?? reviewCount,
		likes: camel.likes ?? likesCount,
		tags: (camel.tags ?? row.tags ?? []) as string[],
		isPopular: camel.isPopular ?? !!row.is_popular,
		isFeatured: camel.isFeatured ?? !!row.is_featured,
	};
};

export const useProducts = () => {
	const { user } = useAuth();
	const { favorites, toggleFavorite, isFavorite } = useFavorites(user?.id);
	const { data: products, loading: isLoading } = useSupabaseQuery<
		DbProduct,
		Product
	>({
		table: "products",
		select: "*, product_likes(count), product_reviews(count)",
		transform: mapDbProduct,
		cache: true,
	});

	// フィルタリングされた商品リスト
	const [filter, setFilter] = useState<ProductFilter>({});
	const filteredProducts = useMemo(
		() => filterProducts(products, filter),
		[products, filter]
	);

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
				setProduct(mapDbProduct(data as unknown as DbProduct));
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
