import React from "react";
import styled from "styled-components";
import { ProductCard } from "../components/products/ProductCard";
import { useProducts } from "../hooks/useProducts";
import { ProductCategory } from "../types/product";
import type { Product } from "../types/product";

const Container = styled.div`
	min-height: 100vh;
	padding: 80px 20px 40px;
	width: 100%;
`;

const ContentWrapper = styled.div`
	max-width: 1008px; /* ⬅️ グリッドの幅と合わせる */
	margin: 0 auto;
	padding-inline: 24px; /* ⬅️ 左右余白をしっかり確保 */
	box-sizing: border-box;

	@media (max-width: 1440px) {
		width: 100%;
		padding-inline: 16px; /* スマホで少し狭め */
	}
`;

const Header = styled.div`
	text-align: center;
	margin-bottom: 60px;
`;

const Title = styled.h1`
	color: white;
	font-size: 48px;
	font-weight: 700;
	margin: 0 0 20px 0;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	background-clip: text;
`;

const Subtitle = styled.p`
	color: rgba(255, 255, 255, 0.8);
	font-size: 18px;
	margin: 0;
`;

const FilterSection = styled.div`
	background: rgba(255, 255, 255, 0.1);
	backdrop-filter: blur(10px);
	border: 1px solid rgba(255, 255, 255, 0.2);
	border-radius: 16px;
	padding: 24px;
	margin-bottom: 40px;
	width: 100%;
	box-sizing: border-box;
	max-width: 1008px; /* align with 3 card width */
	margin-left: auto;
	margin-right: auto;
`;

const FilterRow = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 16px;
	align-items: center;
	justify-content: center; /* Center within wrapper */
	margin-bottom: 16px;

	&:last-child {
		margin-bottom: 0;
	}
`;

const SearchInput = styled.input`
	background: rgba(255, 255, 255, 0.1);
	border: 1px solid rgba(255, 255, 255, 0.3);
	border-radius: 8px;
	color: white;
	padding: 12px 16px;
	font-size: 14px;
	width: 100%;
	max-width: 320px;

	&::placeholder {
		color: rgba(255, 255, 255, 0.5);
	}

	&:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
	}
`;

const Select = styled.select`
	background: rgba(255, 255, 255, 0.1);
	border: 1px solid rgba(255, 255, 255, 0.3);
	border-radius: 8px;
	color: white;
	padding: 12px 16px;
	font-size: 14px;
	width: 100%;
	max-width: 200px;

	option {
		background: #1f2937;
		color: white;
	}

	&:focus {
		outline: none;
		border-color: #3b82f6;
	}
`;

const PriceInputs = styled.div`
	display: flex;
	gap: 8px;
	align-items: center;
`;

const PriceInput = styled.input`
	background: rgba(255, 255, 255, 0.1);
	border: 1px solid rgba(255, 255, 255, 0.3);
	border-radius: 8px;
	color: white;
	padding: 12px 16px;
	font-size: 14px;
	width: 100%;
	max-width: 120px;

	&::placeholder {
		color: rgba(255, 255, 255, 0.5);
	}

	&:focus {
		outline: none;
		border-color: #3b82f6;
	}
`;

const PriceLabel = styled.span`
	color: rgba(255, 255, 255, 0.8);
	font-size: 14px;
`;

const ClearButton = styled.button`
	background: rgba(239, 68, 68, 0.2);
	border: 1px solid rgba(239, 68, 68, 0.5);
	border-radius: 8px;
	color: #f87171;
	padding: 12px 16px;
	font-size: 14px;
	cursor: pointer;
	transition: all 0.2s ease;

	&:hover {
		background: rgba(239, 68, 68, 0.3);
		border-color: rgba(239, 68, 68, 0.7);
	}
`;

const ResultsHeader = styled.div`
	display: flex;
	gap: 32px;
	justify-content: center;
	align-items: center;
	margin-bottom: 32px;
`;

const ResultsCount = styled.p`
	color: rgba(255, 255, 255, 0.8);
	font-size: 16px;
	margin: 0;
`;

const ProductGrid = styled.div<{ view: "grid" | "list" }>`
	width: 100%;
	max-width: 1008px;
	padding: 16px;
	box-sizing: border-box;
	margin-left: auto;
	margin-right: auto;

	${(props) =>
		props.view === "grid"
			? `
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
		gap: 24px;
	`
			: `
		display: flex;
		flex-direction: column;
		gap: 16px;
	`}
`;

const NoResults = styled.div`
	text-align: center;
	padding: 80px 20px;
	color: rgba(255, 255, 255, 0.6);
`;

const NoResultsTitle = styled.h3`
	font-size: 24px;
	margin: 0 0 16px 0;
`;

const NoResultsText = styled.p`
	font-size: 16px;
	margin: 0;
`;

const FeaturedSection = styled.div`
	margin-bottom: 60px;
	display: flex;
	flex-direction: column;
	align-items: center;
	max-width: 1008px;
	margin-left: auto;
	margin-right: auto;
`;

const SectionTitle = styled.h2`
	color: white;
	font-size: 28px;
	font-weight: 600;
	margin: 0 0 24px 0;
	text-align: center;
`;

export const ProductList: React.FC = () => {
	const {
		filteredProducts,
		filter,
		updateFilter,
		clearFilter,
		toggleFavorite,
		isFavorite,
		categories,
		filteredProductCount,
	} = useProducts();

	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		updateFilter({ searchQuery: e.target.value });
	};

	const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const category = e.target.value as ProductCategory | "";
		updateFilter({ category: category || undefined });
	};

	const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const [sortBy, sortOrder] = e.target.value.split("-") as [
			"name" | "price" | "rating" | "popular",
			"asc" | "desc"
		];
		updateFilter({ sortBy, sortOrder });
	};

	const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = parseInt(e.target.value) || undefined;
		updateFilter({ minPrice: value });
	};

	const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = parseInt(e.target.value) || undefined;
		updateFilter({ maxPrice: value });
	};

	const getCategoryLabel = (category: ProductCategory) => {
		const labels: Record<ProductCategory, string> = {
			[ProductCategory.PRODUCTIVITY]: "生産性",
			[ProductCategory.DESIGN]: "デザイン",
			[ProductCategory.DEVELOPMENT]: "開発",
			[ProductCategory.BUSINESS]: "ビジネス",
			[ProductCategory.ENTERTAINMENT]: "エンターテイメント",
			[ProductCategory.EDUCATION]: "教育",
			[ProductCategory.HEALTH]: "健康維持",
		};
		return labels[category];
	};

	// フィルター後の注目アプリ
	const featuredFilteredProducts = filteredProducts.filter(
		(product: Product): boolean => product.isFeatured
	);

	return (
		<Container>
			<ContentWrapper>
				<Header>
					<Title>アプリストア</Title>
					<Subtitle>
						あなたの生産性を向上させる最高のアプリを発見しよう
					</Subtitle>
				</Header>

				<FilterSection>
					<FilterRow>
						<SearchInput
							type="text"
							placeholder="アプリを検索..."
							value={filter.searchQuery || ""}
							onChange={handleSearchChange}
						/>
						<Select
							value={filter.category || ""}
							onChange={handleCategoryChange}
							aria-label="カテゴリーを選択"
							title="カテゴリーを選択"
						>
							<option value="">すべてのカテゴリー</option>
							{categories.map((category) => (
								<option key={category} value={category}>
									{getCategoryLabel(category)}
								</option>
							))}
						</Select>
					</FilterRow>

					<FilterRow>
						<PriceInputs>
							<PriceLabel>価格:</PriceLabel>
							<PriceInput
								type="number"
								placeholder="最低価格"
								value={filter.minPrice || ""}
								onChange={handleMinPriceChange}
							/>
							<PriceLabel>〜</PriceLabel>
							<PriceInput
								type="number"
								placeholder="最高価格"
								value={filter.maxPrice || ""}
								onChange={handleMaxPriceChange}
							/>
						</PriceInputs>

						<Select
							value={
								filter.sortBy && filter.sortOrder
									? `${filter.sortBy}-${filter.sortOrder}`
									: ""
							}
							onChange={handleSortChange}
							aria-label="並び順を選択"
							title="並び順を選択"
						>
							<option value="">並び順</option>
							<option value="name-asc">名前 (A-Z)</option>
							<option value="name-desc">名前 (Z-A)</option>
							<option value="price-asc">価格 (安い順)</option>
							<option value="price-desc">価格 (高い順)</option>
							<option value="rating-desc">評価 (高い順)</option>
							<option value="popular-desc">人気順</option>
						</Select>

						<ClearButton onClick={clearFilter}>フィルターをクリア</ClearButton>
					</FilterRow>
				</FilterSection>

				{featuredFilteredProducts.length > 0 && (
					<FeaturedSection>
						<SectionTitle>注目のアプリ</SectionTitle>
						<ProductGrid view="grid">
							{featuredFilteredProducts.map((product) => (
								<ProductCard
									key={product.id}
									product={product}
									isFavorite={isFavorite(product.id)}
									onToggleFavorite={toggleFavorite}
								/>
							))}
						</ProductGrid>
					</FeaturedSection>
				)}

				<ResultsHeader>
					<ResultsCount>
						{filteredProductCount}件のアプリが見つかりました
					</ResultsCount>
				</ResultsHeader>

				{filteredProducts.length > 0 ? (
					<ProductGrid view="grid">
						{filteredProducts.map((product) => (
							<ProductCard
								key={product.id}
								product={product}
								isFavorite={isFavorite(product.id)}
								onToggleFavorite={toggleFavorite}
							/>
						))}
					</ProductGrid>
				) : (
					<NoResults>
						<NoResultsTitle>アプリが見つかりませんでした</NoResultsTitle>
						<NoResultsText>
							検索条件を変更してもう一度お試しください
						</NoResultsText>
					</NoResults>
				)}
			</ContentWrapper>
		</Container>
	);
};
