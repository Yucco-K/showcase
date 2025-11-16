import React, { useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import type { Product } from "../../types/product";
import { useAuth } from "../../contexts/AuthProvider";
import { LoginModal } from "../auth/LoginModal";

interface ProductCardProps {
	product: Product;
	isFavorite: boolean;
	onToggleFavorite: (productId: string) => void;
}

const Card = styled.div`
	width: 320px;
	max-width: 100%;

	background: rgba(255, 255, 255, 0.1);
	backdrop-filter: blur(10px);
	border: 1px solid rgba(255, 255, 255, 0.2);
	border-radius: 16px;
	padding: 20px;
	transition: all 0.3s ease;
	position: relative;
	overflow: hidden;

	@media (max-width: 768px) {
		width: 300px;
		padding: 16px;
	}

	&:hover {
		transform: translateY(-5px);
		box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
		border-color: rgba(255, 255, 255, 0.3);
	}
`;

const ImageContainer = styled.div`
	width: 100%;
	height: 200px;
	border-radius: 12px;
	margin-bottom: 16px;
	position: relative;
	overflow: hidden;
	display: flex;
	align-items: center;
	justify-content: center;
	color: white;
	font-size: 18px;
	font-weight: bold;

	@media (max-width: 768px) {
		height: 140px;
		font-size: 14px;
	}
`;

const ProductImage = styled.img`
	width: 100%;
	height: 100%;
	object-fit: cover;
	border-radius: 12px;
`;

const ImageFallback = styled.div`
	width: 100%;
	height: 100%;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 12px;
`;

const CategoryBadge = styled.span`
	position: absolute;
	top: 12px;
	left: 12px;
	background: rgba(255, 255, 255, 0.9);
	color: #333;
	padding: 4px 12px;
	border-radius: 20px;
	font-size: 12px;
	font-weight: 600;
	text-transform: uppercase;
`;

const FavoriteButton = styled.button`
	position: absolute;
	top: 12px;
	right: 12px;
	background: rgba(255, 255, 255, 0.9);
	border: none;
	border-radius: 50%;
	width: 36px;
	height: 36px;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	transition: all 0.2s ease;
	font-size: 18px;

	&:hover {
		background: rgba(255, 255, 255, 1);
		transform: scale(1.1);
	}
`;

const Title = styled.h3`
	color: white;
	font-size: 18px;
	font-weight: 600;
	margin: 0 0 8px 0;
	line-height: 1.3;
`;

const Description = styled.p`
	color: rgba(255, 255, 255, 0.8);
	font-size: 14px;
	line-height: 1.5;
	margin: 0 0 16px 0;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
`;

const PriceContainer = styled.div`
	display: flex;
	align-items: center;
	gap: 8px;
	margin-bottom: 16px;
`;

const Price = styled.span`
	color: #4ade80;
	font-size: 20px;
	font-weight: 700;
`;

const OriginalPrice = styled.span`
	color: rgba(255, 255, 255, 0.5);
	font-size: 16px;
	text-decoration: line-through;
`;

const SaleBadge = styled.span`
	background: linear-gradient(135deg, #ef4444, #dc2626);
	color: white;
	padding: 2px 8px;
	border-radius: 4px;
	font-size: 12px;
	font-weight: 600;
`;

const RatingContainer = styled.div`
	display: flex;
	align-items: center;
	gap: 8px;
	margin-bottom: 16px;
`;

const Stars = styled.div`
	display: flex;
	gap: 2px;
`;

// Transient star prop
const Star = styled.span<{ $filled: boolean }>`
	color: ${(props) => (props.$filled ? "#fbbf24" : "rgba(255, 255, 255, 0.3)")};
	font-size: 14px;
`;

const ReviewCount = styled.span`
	color: rgba(255, 255, 255, 0.6);
	font-size: 14px;
`;

const TagsContainer = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 6px;
	margin-bottom: 16px;
`;

const Tag = styled.span`
	background: rgba(255, 255, 255, 0.1);
	color: rgba(255, 255, 255, 0.8);
	padding: 4px 8px;
	border-radius: 12px;
	font-size: 12px;
`;

const ViewButton = styled(Link)`
	display: block;
	background: linear-gradient(135deg, #3b82f6, #1d4ed8);
	color: white;
	text-decoration: none;
	padding: 12px 24px;
	border-radius: 8px;
	text-align: center;
	font-weight: 600;
	transition: all 0.2s ease;

	&:hover {
		transform: translateY(-2px);
		box-shadow: 0 10px 20px rgba(59, 130, 246, 0.3);
	}
`;

const PopularBadge = styled.div`
	position: absolute;
	top: -8px;
	right: 16px;
	background: linear-gradient(135deg, #f59e0b, #d97706);
	color: white;
	padding: 6px 12px;
	border-radius: 0 0 8px 8px;
	font-size: 12px;
	font-weight: 600;
	z-index: 1;
`;

export const ProductCardComponent: React.FC<ProductCardProps> = ({
	product,
	isFavorite,
	onToggleFavorite,
}) => {
	const { user } = useAuth();
	const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

	const isOnSale =
		product.originalPrice && product.originalPrice > product.price;
	const salePercentage = isOnSale
		? Math.round(
				((product.originalPrice! - product.price) / product.originalPrice!) *
					100
		  )
		: 0;

	const renderStars = (rating: number) => {
		return Array.from({ length: 5 }, (_, index) => {
			const filled = index < Math.floor(rating);
			return (
				<Star
					key={`star-${index}-${filled ? "filled" : "empty"}`}
					$filled={filled}
				>
					★
				</Star>
			);
		});
	};

	const getCategoryLabel = (category: string) => {
		const labels: Record<string, string> = {
			productivity: "生産性",
			design: "デザイン",
			development: "開発",
			business: "ビジネス",
			entertainment: "エンターテイメント",
			education: "教育",
			health: "健康維持",
		};
		return labels[category] || category;
	};

	return (
		<>
			<Card data-testid="product-card">
				{product.isPopular && <PopularBadge>人気</PopularBadge>}

				<ImageContainer>
					{product.imageUrl && product.imageUrl.trim() !== "" ? (
						<ProductImage
							src={product.imageUrl}
							alt={product.name}
							onError={(e) => {
								// 画像読み込みエラー時にフォールバック表示
								const target = e.target as HTMLImageElement;
								target.style.display = "none";
								const fallback = target.parentElement?.querySelector(
									".image-fallback"
								) as HTMLElement;
								if (fallback) fallback.style.display = "flex";
							}}
						/>
					) : null}
					<ImageFallback
						className="image-fallback"
						style={{
							display:
								product.imageUrl && product.imageUrl.trim() !== ""
									? "none"
									: "flex",
						}}
					>
						{product.name}
					</ImageFallback>
					<CategoryBadge>{getCategoryLabel(product.category)}</CategoryBadge>
					<FavoriteButton
						data-testid="like-button"
						onClick={(e) => {
							e.preventDefault();
							if (!user) {
								setIsLoginModalOpen(true);
							} else {
								onToggleFavorite(product.id);
							}
						}}
					>
						{isFavorite ? "❤️" : "🤍"}
					</FavoriteButton>
				</ImageContainer>

				<Title>{product.name}</Title>
				<Description>{product.description}</Description>

				<PriceContainer>
					<Price>¥{product.price.toLocaleString()}</Price>
					{isOnSale && (
						<>
							<OriginalPrice>
								¥{product.originalPrice!.toLocaleString()}
							</OriginalPrice>
							<SaleBadge>{salePercentage}% OFF</SaleBadge>
						</>
					)}
				</PriceContainer>

				<RatingContainer>
					<Stars>{renderStars(product.rating)}</Stars>
					<ReviewCount>({product.reviewCount})</ReviewCount>
				</RatingContainer>

				<TagsContainer>
					{product.tags.slice(0, 3).map((tag) => (
						<Tag key={tag}>{tag}</Tag>
					))}
				</TagsContainer>

				<ViewButton
					to={`/products/${product.id}`}
					onClick={() => {
						if (import.meta.env.DEV) {

							console.debug(
								`🔗 詳細ボタンクリック: ${product.name} (ID: ${product.id})`
							);
						}
					}}
				>
					詳細を見る
				</ViewButton>
			</Card>
			<LoginModal
				isOpen={isLoginModalOpen}
				onClose={() => setIsLoginModalOpen(false)}
			/>
		</>
	);
};

// エイリアスとしてProductCardもエクスポート
export const ProductCard = ProductCardComponent;
