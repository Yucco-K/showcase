import React from "react";
import styled from "styled-components";
import { ProductCard } from "../products/ProductCard";
import Spinner from "../ui/Spinner";
import { useRecommendations } from "../../hooks/useRecommendations";
import { useProducts } from "../../hooks/useProducts";
import { useFavorites } from "../../hooks/useFavorites";
import { useAuth } from "../../contexts/AuthProvider";
import type { Product } from "../../types/product";

interface RecommendationListProps {
	title?: string;
	maxItems?: number;
	showTitle?: boolean;
	fallbackProducts?: Product[];
	className?: string;
}

const Container = styled.div`
	margin-bottom: 2rem;
`;

const Title = styled.h2`
	color: white;
	margin-bottom: 1.5rem;
	font-size: 1.5rem;
	font-weight: 600;
	text-align: center;

	@media (max-width: 768px) {
		font-size: 1.25rem;
		margin-bottom: 1rem;
	}
`;

const Grid = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
	gap: 1.5rem;
	padding: 0 1rem;

	@media (max-width: 768px) {
		grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
		gap: 1rem;
		padding: 0 0.5rem;
	}
`;

const LoadingContainer = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 3rem;
`;

const EmptyState = styled.div`
	text-align: center;
	padding: 2rem;
	color: rgba(255, 255, 255, 0.7);
	font-size: 1rem;
`;

const ErrorContainer = styled.div`
	text-align: center;
	padding: 2rem;
	color: #ef4444;
`;

const RefreshButton = styled.button`
	background: linear-gradient(135deg, #3ea8ff, #0066cc);
	color: white;
	border: none;
	padding: 0.5rem 1rem;
	border-radius: 6px;
	font-size: 0.875rem;
	cursor: pointer;
	margin-top: 1rem;
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

export const RecommendationList: React.FC<RecommendationListProps> = ({
	title = "あなたにおすすめ",
	maxItems = 8,
	showTitle = true,
	fallbackProducts = [],
	className,
}) => {
	const { user } = useAuth();
	const { filteredProducts } = useProducts();
	const { toggleFavorite, isFavorite } = useFavorites(user?.id);
	const {
		recommendations,
		isLoading,
		error,
		metadata,
		fetchRecommendations,
		clearError,
	} = useRecommendations({
		maxItems,
		fallbackProducts,
	});

	// 推薦されたIDに対応する商品データを取得
	const recommendedProducts = recommendations
		.map((id: string) => filteredProducts.find((p: Product) => p.id === id))
		.filter((product): product is Product => product !== undefined)
		.slice(0, maxItems);

	// ローディング中の表示
	if (isLoading) {
		return (
			<Container className={className}>
				{showTitle && <Title>{title}</Title>}
				<LoadingContainer>
					<Spinner text="推薦を取得中..." />
				</LoadingContainer>
			</Container>
		);
	}

	// エラー状態の表示
	if (error) {
		return (
			<Container className={className}>
				{showTitle && <Title>{title}</Title>}
				<ErrorContainer>
					<p>{error}</p>
					<RefreshButton
						onClick={() => {
							clearError();
							fetchRecommendations();
						}}
					>
						再試行
					</RefreshButton>
				</ErrorContainer>
			</Container>
		);
	}

	// 推薦商品がない場合
	if (recommendedProducts.length === 0) {
		return (
			<Container className={className}>
				{showTitle && <Title>{title}</Title>}
				<EmptyState>
					<p>現在おすすめできる商品がありません</p>
					<RefreshButton
						onClick={() => fetchRecommendations()}
						disabled={isLoading}
					>
						再読み込み
					</RefreshButton>
				</EmptyState>
			</Container>
		);
	}

	// 推薦商品の表示
	return (
		<Container className={className}>
			{showTitle && (
				<Title>
					{title}
					{metadata.isPersonalized && (
						<span
							style={{
								fontSize: "0.875rem",
								opacity: 0.8,
								marginLeft: "0.5rem",
							}}
						>
							(パーソナライズ済み)
						</span>
					)}
				</Title>
			)}
			<Grid>
				{recommendedProducts.map((product) => (
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
