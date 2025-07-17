import React from "react";
import styled from "styled-components";
import type { Product } from "../../types/product";
import { Link } from "react-router-dom";

interface PurchasedProductCardProps {
	product: Product;
}

const Card = styled.div`
	width: 320px;
	max-width: 100%;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	border-radius: 16px;
	padding: 24px;
	transition: all 0.3s ease;
	position: relative;
	overflow: hidden;
	box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
	cursor: pointer;

	@media (max-width: 768px) {
		width: 300px;
		padding: 20px;
	}

	&:hover {
		transform: translateY(-5px);
		box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
	}

	&::before {
		content: "";
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(
			to bottom,
			rgba(255, 255, 255, 0.1),
			rgba(255, 255, 255, 0.05)
		);
		pointer-events: none;
	}
`;

const CategoryBadge = styled.span`
	display: inline-block;
	background: rgba(255, 255, 255, 0.9);
	color: #333;
	padding: 4px 12px;
	border-radius: 20px;
	font-size: 12px;
	font-weight: 600;
	text-transform: uppercase;
	margin-bottom: 16px;
`;

const Title = styled.h3`
	color: white;
	font-size: 24px;
	font-weight: 700;
	margin: 0 0 12px 0;
	line-height: 1.3;
`;

const Price = styled.div`
	color: #4ade80;
	font-size: 20px;
	font-weight: 700;
	margin-bottom: 16px;
`;

const Description = styled.p`
	color: rgba(255, 255, 255, 0.9);
	font-size: 14px;
	line-height: 1.6;
	margin: 0;
	display: -webkit-box;
	-webkit-line-clamp: 3;
	-webkit-box-orient: vertical;
	overflow: hidden;
`;

const ButtonContainer = styled.div`
	display: flex;
	flex-direction: column;
	gap: 12px;
	margin-top: 20px;
`;

const InstallButton = styled.button`
	background: linear-gradient(135deg, #4ade80, #22c55e);
	color: white;
	border: none;
	border-radius: 8px;
	padding: 12px 16px;
	font-size: 14px;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.2s ease;
	width: 100%;

	&:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(74, 222, 128, 0.5);
	}

	&:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		background: linear-gradient(135deg, #6b7280, #4b5563);
	}
`;

const DocumentationButton = styled.button`
	background: rgba(255, 255, 255, 0.1);
	color: white;
	border: 1px solid rgba(255, 255, 255, 0.3);
	border-radius: 8px;
	padding: 10px 16px;
	font-size: 13px;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.2s ease;
	width: 100%;

	&:hover:not(:disabled) {
		background: rgba(255, 255, 255, 0.2);
		border-color: rgba(255, 255, 255, 0.5);
	}

	&:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		background: rgba(255, 255, 255, 0.05);
		border-color: rgba(255, 255, 255, 0.1);
	}
`;

const DetailsButton = styled(Link)`
	background: linear-gradient(135deg, #3ea8ff, #0066cc);
	color: white;
	border: none;
	border-radius: 8px;
	padding: 12px 16px;
	font-size: 14px;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.2s ease;
	width: 50%;
	text-align: center;
	text-decoration: none;
	margin-top: 4px;

	&:hover {
		background: linear-gradient(135deg, #0066cc, #0055bb);
		color: #ffd700;
		transform: translateY(-2px);
	}
`;

export const PurchasedProductCard: React.FC<PurchasedProductCardProps> = ({
	product,
}) => {
	return (
		<Card>
			<CategoryBadge>{product.category}</CategoryBadge>
			<Title>{product.name}</Title>
			<Price>¥{product.price.toLocaleString()}</Price>
			<Description>{product.description}</Description>
			<ButtonContainer>
				<InstallButton disabled>インストールを開始する</InstallButton>
				<DocumentationButton disabled>
					<span role="img" aria-label="document" style={{ marginRight: 6 }}>
						📖
					</span>
					Document
				</DocumentationButton>
				<DetailsButton to={`/products/${product.id}`}>詳細</DetailsButton>
			</ButtonContainer>
		</Card>
	);
};
