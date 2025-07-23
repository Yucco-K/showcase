import React from "react";
import styled from "styled-components";
import { ProductCard } from "../products/ProductCard";
import Spinner from "../ui/Spinner";
import { useSimilarProducts } from "../../hooks/useRecommendations";
import { useProducts } from "../../hooks/useProducts";
import { useFavorites } from "../../hooks/useFavorites";
import { useAuth } from "../../contexts/AuthProvider";
import type { Product } from "../../types/product";

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

export const SimilarProductsList: React.FC<SimilarProductsListProps> = ({
	productId,
	title = "似たアプリ",
	maxItems = 4,
	className,
}) => {
	const { user } = useAuth();
	const { filteredProducts } = useProducts();
	const { toggleFavorite, isFavorite } = useFavorites(user?.id);
	const { similarItems, isLoading, error, refetch, clearError } =
		useSimilarProducts(productId, filteredProducts, maxItems);

	// 類似商品IDに対応する商品データを取得
	const similarProducts = similarItems
		.map((id: string) => filteredProducts.find((p: Product) => p.id === id))
		.filter((product): product is Product => product !== undefined)
		.filter((product) => product.id !== productId) // 自分自身を除外
		.slice(0, maxItems);

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
				</EmptyState>
			</Container>
		);
	}

	// 類似商品の表示
	return (
		<Container className={className}>
			<Title>{title}</Title>
			<Grid>
				{similarProducts.map((product) => (
					<ProductCard
						key={product.id}
						product={product}
						isFavorite={isFavorite(product.id)}
						onToggleFavorite={toggleFavorite}
					/>
				))}
			</Grid>
		</Container>
	);
};
