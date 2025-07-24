import React, { useState } from "react";
import styled from "styled-components";
import { ProductCard } from "../products/ProductCard";
import Spinner from "../ui/Spinner";
import { useSimilarProducts } from "../../hooks/useRecommendations";
import { useProducts } from "../../hooks/useProducts";
import { useFavorites } from "../../hooks/useFavorites";
import { useAuth } from "../../contexts/AuthProvider";
import type { Product } from "../../types/product";
import { ProductCategory } from "../../types/product";

interface SimilarProductsListProps {
	productId: string;
	title?: string;
	maxItems?: number;
	className?: string;
}

const Container = styled.div`
	margin: 2rem 0;
`;

const Title = styled.h3`
	color: white;
	margin-bottom: 1.5rem;
	font-size: 1.25rem;
	font-weight: 600;

	@media (max-width: 768px) {
		font-size: 1.125rem;
		margin-bottom: 1rem;
	}
`;

const Grid = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
	gap: 1rem;

	@media (max-width: 768px) {
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: 0.75rem;
	}
`;

const LoadingContainer = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 2rem;
`;

const EmptyState = styled.div`
	text-align: center;
	padding: 2rem;
	color: rgba(255, 255, 255, 0.7);
	font-size: 0.875rem;
`;

const ErrorContainer = styled.div`
	text-align: center;
	padding: 2rem;
	color: #ef4444;
	font-size: 0.875rem;
`;

const RetryButton = styled.button`
	background: linear-gradient(135deg, #3ea8ff, #0066cc);
	color: white;
	border: none;
	padding: 0.375rem 0.75rem;
	border-radius: 4px;
	font-size: 0.75rem;
	cursor: pointer;
	margin-top: 0.75rem;
	transition: transform 0.2s ease;

	&:hover {
		transform: translateY(-1px);
	}

	&:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		transform: none;
	}
`;

const ShowMoreButton = styled.button`
	background: linear-gradient(135deg, #10b981, #059669);
	color: white;
	border: none;
	padding: 0.5rem 1rem;
	border-radius: 6px;
	font-size: 0.875rem;
	font-weight: 500;
	cursor: pointer;
	margin-top: 1rem;
	transition: all 0.2s ease;
	display: block;
	margin-left: auto;
	margin-right: auto;

	&:hover {
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
	}

	&:active {
		transform: translateY(0);
	}
`;

export const SimilarProductsList: React.FC<SimilarProductsListProps> = ({
	productId,
	title = "似たアプリ",
	className,
}) => {
	const { user } = useAuth();
	const { filteredProducts, allProducts } = useProducts();
	const { toggleFavorite, isFavorite } = useFavorites(user?.id);
	const { similarItems, isLoading, error, refetch, clearError } =
		useSimilarProducts(productId, filteredProducts, 10); // 最大10件取得

	// 表示状態の管理
	const [showAll, setShowAll] = useState(false);
	const displayItems = showAll ? similarItems : similarItems.slice(0, 2);

	// 開発中のみ概要ログを出力
	if (import.meta.env.DEV) {
		console.debug("📊 SimilarProductsList", {
			productId,
			similarItems,
			displayItemsCount: displayItems.length,
		});
	}
	// Gorseから返されたIDを使って実際の商品データを取得
	const similarProducts = displayItems
		.filter((id: string) => id !== productId) // 自分自身を除外
		.map((id: string) => {
			// 実際の商品データベースから商品を検索
			const actualProduct = allProducts.find((product) => product.id === id);

			if (actualProduct) {
				// 実際の商品データが見つかった場合
				if (import.meta.env.DEV) {
					console.debug(
						`✅ 商品データ発見: ${actualProduct.name} (${actualProduct.id})`
					);
				}
				return actualProduct;
			} else {
				// 商品データが見つからない場合のフォールバック
				console.warn(`❌ 商品データが見つかりません: ${id}`);
				const fallbackProduct: Product = {
					id,
					name: `商品 (${id.slice(0, 8)})`,
					description: `商品ID: ${id} - データが見つかりませんでした`,
					longDescription: `この商品の詳細情報は現在利用できません。商品ID: ${id}`,
					price: 0,
					category: ProductCategory.PRODUCTIVITY,
					imageUrl: "",
					screenshots: [],
					features: [],
					requirements: [],
					version: "1.0.0",
					lastUpdated: new Date().toISOString(),
					rating: 0,
					reviewCount: 0,
					likes: 0,
					tags: [],
					isPopular: false,
					isFeatured: false,
				};
				return fallbackProduct;
			}
		});

	if (import.meta.env.DEV) {
		console.debug(
			"📋 UIに表示される商品:",
			similarProducts.map((p) => p.name)
		);
	}

	// ローディング中の表示
	if (isLoading) {
		return (
			<Container className={className}>
				<Title>{title}</Title>
				<LoadingContainer>
					<Spinner text="似たアプリを検索中..." size={32} />
				</LoadingContainer>
			</Container>
		);
	}

	// エラー状態の表示
	if (error) {
		return (
			<Container className={className}>
				<Title>{title}</Title>
				<ErrorContainer>
					<p>{error}</p>
					<RetryButton
						onClick={() => {
							clearError();
							refetch();
						}}
					>
						再試行
					</RetryButton>
				</ErrorContainer>
			</Container>
		);
	}

	// 類似商品がない場合
	if (similarProducts.length === 0) {
		return (
			<Container className={className}>
				<Title>{title}</Title>
				<EmptyState>
					<p>似たアプリが見つかりませんでした</p>
					<RetryButton
						onClick={() => {
							refetch();
						}}
					>
						再検索
					</RetryButton>
				</EmptyState>
			</Container>
		);
	}

	// 類似商品の表示
	return (
		<Container className={className}>
			<Title>{title}</Title>
			<Grid>
				{similarProducts.map((product) => {
					if (import.meta.env.DEV) {
						console.debug("🛒 ProductCard props", {
							id: product.id,
							name: product.name,
							price: product.price,
						});
					}
					return (
						<ProductCard
							key={product.id}
							product={product}
							isFavorite={isFavorite(product.id)}
							onToggleFavorite={toggleFavorite}
						/>
					);
				})}
			</Grid>
			{similarItems.length > 2 && (
				<ShowMoreButton onClick={() => setShowAll(!showAll)}>
					{showAll ? "閉じる" : `もっと見る (${similarItems.length - 2}件)`}
				</ShowMoreButton>
			)}
		</Container>
	);
};
