import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useProduct } from "../hooks/useProducts";
import { useProducts } from "../hooks/useProducts";
import { PaymentModal } from "../components/payment/PaymentModal";
import { useAuth } from "../contexts/AuthProvider";
import { useReviews } from "../hooks/useReviews";

const Container = styled.div`
	min-height: 100vh;
	padding: 80px 20px 40px;
	max-width: 1200px;
	margin: 0 auto;
`;

const BackButton = styled.button`
	background: rgba(255, 255, 255, 0.1);
	border: 1px solid rgba(255, 255, 255, 0.3);
	border-radius: 8px;
	color: white;
	padding: 12px 20px;
	font-size: 14px;
	cursor: pointer;
	transition: all 0.2s ease;
	margin-bottom: 32px;
	display: flex;
	align-items: center;
	gap: 8px;

	&:hover {
		background: rgba(255, 255, 255, 0.2);
		border-color: rgba(255, 255, 255, 0.4);
	}
`;

const NotFound = styled.div`
	text-align: center;
	padding: 80px 20px;
	color: rgba(255, 255, 255, 0.6);

	h2 {
		font-size: 32px;
		margin: 0 0 16px 0;
	}

	p {
		font-size: 16px;
		margin: 0;
	}
`;

const ProductHeader = styled.div`
	display: grid;
	grid-template-columns: 400px 1fr;
	gap: 48px;
	margin-bottom: 60px;

	@media (max-width: 768px) {
		grid-template-columns: 1fr;
		gap: 32px;
	}
`;

const ImageSection = styled.div`
	position: relative;
`;

const MainImage = styled.div`
	width: 100%;
	height: 300px;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	border-radius: 16px;
	position: relative;
	overflow: hidden;
	display: flex;
	align-items: center;
	justify-content: center;
	color: white;
	font-size: 24px;
	font-weight: bold;
	margin-bottom: 16px;
`;

const CategoryBadge = styled.span`
	position: absolute;
	top: 16px;
	left: 16px;
	background: rgba(255, 255, 255, 0.9);
	color: #333;
	padding: 6px 16px;
	border-radius: 20px;
	font-size: 14px;
	font-weight: 600;
	text-transform: uppercase;
`;

const PopularBadge = styled.div`
	position: absolute;
	top: -8px;
	right: 16px;
	background: linear-gradient(135deg, #f59e0b, #d97706);
	color: white;
	padding: 8px 16px;
	border-radius: 0 0 12px 12px;
	font-size: 14px;
	font-weight: 600;
	z-index: 1;
`;

const Screenshots = styled.div`
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 8px;
`;

const Screenshot = styled.div`
	height: 80px;
	background: linear-gradient(135deg, #a8b2ff 0%, #c4a8ff 100%);
	border-radius: 8px;
	display: flex;
	align-items: center;
	justify-content: center;
	color: white;
	font-size: 12px;
	cursor: pointer;
	transition: all 0.2s ease;

	&:hover {
		transform: scale(1.05);
	}
`;

const InfoSection = styled.div``;

const Title = styled.h1`
	color: white;
	font-size: 36px;
	font-weight: 700;
	margin: 0 0 16px 0;
	line-height: 1.2;
`;

const Description = styled.p`
	color: rgba(255, 255, 255, 0.8);
	font-size: 18px;
	line-height: 1.6;
	margin: 0 0 24px 0;
`;

const PriceSection = styled.div`
	display: flex;
	align-items: center;
	gap: 16px;
	margin-bottom: 24px;
`;

const Price = styled.span`
	color: #4ade80;
	font-size: 32px;
	font-weight: 700;
`;

const OriginalPrice = styled.span`
	color: rgba(255, 255, 255, 0.5);
	font-size: 24px;
	text-decoration: line-through;
`;

const SaleBadge = styled.span`
	background: linear-gradient(135deg, #ef4444, #dc2626);
	color: white;
	padding: 6px 12px;
	border-radius: 8px;
	font-size: 14px;
	font-weight: 600;
`;

const RatingSection = styled.div`
	display: flex;
	align-items: center;
	gap: 16px;
	margin-bottom: 32px;
`;

const Stars = styled.div`
	display: flex;
	gap: 4px;
`;

// Transient props: prefix custom props with $ to avoid DOM warnings
const Star = styled.span<{ $filled: boolean }>`
	color: ${(props) => (props.$filled ? "#fbbf24" : "rgba(255, 255, 255, 0.3)")};
	font-size: 20px;
`;

const RatingText = styled.span`
	color: white;
	font-size: 18px;
	font-weight: 600;
`;

const ReviewsSection = styled.div`
	margin-top: 48px;
`;

const ReviewItem = styled.div`
	border-top: 1px solid rgba(255, 255, 255, 0.1);
	padding: 16px 0;
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
`;

const ReviewActions = styled.div`
	display: flex;
	gap: 8px;
	button {
		background: none;
		border: none;
		color: #ccc;
		cursor: pointer;
		font-size: 18px;
		&:hover {
			color: #fff;
		}
	}
`;

const ReviewForm = styled.form`
	margin-top: 24px;
	display: flex;
	flex-direction: column;
	gap: 12px;
`;

const StarRow = styled.div`
	display: flex;
	gap: 4px;
	font-size: 28px;
	cursor: pointer;
`;

const TextArea = styled.textarea`
	padding: 12px;
	border-radius: 6px;
	min-height: 140px;
	width: 100%;
`;

const SubmitButton = styled.button`
	padding: 12px;
	border: none;
	border-radius: 8px;
	background: #3ea8ff;
	color: #fff;
	font-weight: 600;
	cursor: pointer;
	width: 100%;
`;

const ReviewCount = styled.span`
	color: rgba(255, 255, 255, 0.6);
	font-size: 16px;
`;

const ActionButtons = styled.div`
	display: flex;
	gap: 16px;
	margin-bottom: 32px;
`;

const PurchaseButton = styled.button`
	background: linear-gradient(135deg, #3b82f6, #1d4ed8);
	border: none;
	border-radius: 12px;
	color: white;
	padding: 16px 32px;
	font-size: 18px;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.2s ease;
	flex: 1;

	&:hover {
		transform: translateY(-2px);
		box-shadow: 0 12px 24px rgba(59, 130, 246, 0.3);
	}

	&:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		transform: none;
	}
`;

const FavoriteButton = styled.button`
	background: rgba(255, 255, 255, 0.1);
	border: 1px solid rgba(255, 255, 255, 0.3);
	border-radius: 12px;
	color: white;
	padding: 16px 20px;
	font-size: 20px;
	cursor: pointer;
	transition: all 0.2s ease;

	&:hover {
		background: rgba(255, 255, 255, 0.2);
		transform: scale(1.05);
	}
`;

const MetaInfo = styled.div`
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 16px;
	margin-bottom: 32px;
`;

const MetaItem = styled.div`
	background: rgba(255, 255, 255, 0.1);
	border-radius: 12px;
	padding: 16px;
	text-align: center;
`;

const MetaLabel = styled.div`
	color: rgba(255, 255, 255, 0.6);
	font-size: 14px;
	margin-bottom: 4px;
`;

const MetaValue = styled.div`
	color: white;
	font-size: 16px;
	font-weight: 600;
`;

const DetailsTabs = styled.div`
	margin-bottom: 40px;
`;

const TabButtons = styled.div`
	display: flex;
	gap: 8px;
	margin-bottom: 24px;
	border-bottom: 1px solid rgba(255, 255, 255, 0.2);
`;

// Use transient prop $active
const TabButton = styled.button<{ $active: boolean }>`
	background: none;
	border: none;
	color: ${(props) => (props.$active ? "#3b82f6" : "rgba(255, 255, 255, 0.6)")};
	padding: 16px 24px;
	font-size: 16px;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.2s ease;
	border-bottom: 2px solid
		${(props) => (props.$active ? "#3b82f6" : "transparent")};

	&:hover {
		color: ${(props) => (props.$active ? "#3b82f6" : "white")};
	}
`;

const TabContent = styled.div`
	color: rgba(255, 255, 255, 0.8);
	line-height: 1.6;
`;

const FeaturesList = styled.ul`
	list-style: none;
	padding: 0;
	margin: 0;
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
	gap: 12px;
`;

const FeatureItem = styled.li`
	display: flex;
	align-items: center;
	gap: 12px;
	background: rgba(255, 255, 255, 0.05);
	padding: 12px 16px;
	border-radius: 8px;

	&::before {
		content: "✓";
		color: #4ade80;
		font-weight: bold;
		font-size: 16px;
	}
`;

const RequirementsList = styled.ul`
	list-style: none;
	padding: 0;
	margin: 0;
`;

const RequirementItem = styled.li`
	padding: 8px 0;
	border-bottom: 1px solid rgba(255, 255, 255, 0.1);

	&:last-child {
		border-bottom: none;
	}
`;

const LongDescription = styled.div`
	white-space: pre-line;
	font-size: 16px;
	line-height: 1.7;
`;

const TagsContainer = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
`;

const Tag = styled.span`
	background: rgba(255, 255, 255, 0.1);
	color: rgba(255, 255, 255, 0.8);
	padding: 6px 12px;
	border-radius: 16px;
	font-size: 14px;
`;

export const ProductDetail: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const { product, isFound } = useProduct(id || "");
	const { toggleFavorite, isFavorite, allProducts } = useProducts();
	const { user } = useAuth();
	const {
		reviews,
		loading: reviewsLoading,
		upsertReview,
		deleteOwnReview,
		myReview,
	} = useReviews(id || "", user?.id);

	// 平均評価と件数をリアルタイムで計算
	const avgRating = reviews.length
		? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
		: product?.rating ?? 0;
	const reviewCount = reviews.length || product?.reviewCount || 0;

	// （後段で product が確定してから likesCount を計算する）

	const [ratingInput, setRatingInput] = useState<number>(myReview?.rating || 0);
	const [commentInput, setCommentInput] = useState<string>(
		myReview?.comment || ""
	);
	const [showReviewForm, setShowReviewForm] = useState(false);

	const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
	const [activeTab, setActiveTab] = useState<
		"description" | "features" | "requirements"
	>("description");

	if (!id || !isFound || !product) {
		return (
			<Container>
				<BackButton onClick={() => navigate("/products")}>
					← 商品一覧に戻る
				</BackButton>
				<NotFound>
					<h2>商品が見つかりません</h2>
					<p>指定された商品は存在しないか、削除された可能性があります。</p>
				</NotFound>
			</Container>
		);
	}

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

	// likes カウントは useProducts の最新値を優先
	const likesCount = product
		? allProducts.find((p) => p.id === product.id)?.likes ?? product.likes ?? 0
		: 0;

	const handlePurchase = () => {
		setIsPaymentModalOpen(true);
	};

	const handlePaymentSuccess = (productId: string) => {
		alert(`${product.name}の購入が完了しました！ありがとうございます。`);
		console.log(`Product ${productId} purchased successfully`);
	};

	const handleSubmitReview = async (e: React.FormEvent) => {
		e.preventDefault();
		await upsertReview(ratingInput, commentInput || null);
		setShowReviewForm(false);
	};

	return (
		<Container>
			<BackButton onClick={() => navigate("/products")}>
				← 商品一覧に戻る
			</BackButton>

			<ProductHeader>
				<ImageSection>
					{product.isPopular && <PopularBadge>人気</PopularBadge>}
					<MainImage>
						<CategoryBadge>{getCategoryLabel(product.category)}</CategoryBadge>
						{product.name}
					</MainImage>
					<Screenshots>
						{product.screenshots.slice(0, 3).map((screenshot, index) => (
							<Screenshot key={screenshot}>スクリーン {index + 1}</Screenshot>
						))}
					</Screenshots>
				</ImageSection>

				<InfoSection>
					<Title>{product.name}</Title>
					<Description>{product.description}</Description>

					<PriceSection>
						<Price>¥{product.price.toLocaleString()}</Price>
						{isOnSale && (
							<>
								<OriginalPrice>
									¥{product.originalPrice!.toLocaleString()}
								</OriginalPrice>
								<SaleBadge>{salePercentage}% OFF</SaleBadge>
							</>
						)}
					</PriceSection>

					<RatingSection>
						<Stars>{renderStars(avgRating)}</Stars>
						<RatingText>{avgRating.toFixed(1)}</RatingText>
						<ReviewCount>({reviewCount}件のレビュー)</ReviewCount>
					</RatingSection>

					<ActionButtons>
						<PurchaseButton onClick={handlePurchase}>
							¥{product.price.toLocaleString()}で購入
						</PurchaseButton>
						<FavoriteButton
							data-testid="like-button-detail"
							onClick={() => toggleFavorite(product.id)}
						>
							{isFavorite(product.id) ? "❤️" : "🤍"}
						</FavoriteButton>
						<span
							data-testid="like-count-detail"
							style={{
								marginLeft: 4,
								display: "inline-block",
								transform: "translateY(2px)",
							}}
						>
							{likesCount}
						</span>
					</ActionButtons>

					<MetaInfo>
						<MetaItem>
							<MetaLabel>バージョン</MetaLabel>
							<MetaValue>{product.version}</MetaValue>
						</MetaItem>
						<MetaItem>
							<MetaLabel>最終更新</MetaLabel>
							<MetaValue>{product.lastUpdated}</MetaValue>
						</MetaItem>
						<MetaItem>
							<MetaLabel>評価</MetaLabel>
							<MetaValue>{product.rating}/5.0</MetaValue>
						</MetaItem>
					</MetaInfo>

					<TagsContainer>
						{product.tags.map((tag) => (
							<Tag key={tag}>{tag}</Tag>
						))}
					</TagsContainer>

					{/* Reviews */}
					<ReviewsSection>
						<h3>レビュー</h3>
						{reviewsLoading ? (
							<p>Loading...</p>
						) : (
							<>
								{reviews.length === 0 && <p>まだレビューがありません。</p>}
								{reviews.map((rev) => (
									<ReviewItem key={rev.id}>
										<div>
											{renderStars(rev.rating)}
											{rev.comment && <p>{rev.comment}</p>}
										</div>
										{user && rev.user_id === user.id && (
											<ReviewActions>
												<button
													type="button"
													aria-label="edit review"
													onClick={() => {
														setRatingInput(rev.rating);
														setCommentInput(rev.comment ?? "");
														setShowReviewForm(true);
													}}
												>
													✏️
												</button>
												<button
													type="button"
													aria-label="delete review"
													onClick={async () => {
														// 即時にフォームを閉じて初期化
														setShowReviewForm(false);
														setRatingInput(0);
														setCommentInput("");
														// レビュー削除を非同期で実行
														await deleteOwnReview();
													}}
												>
													🗑️
												</button>
											</ReviewActions>
										)}
									</ReviewItem>
								))}
							</>
						)}

						{!user && (
							<SubmitButton
								type="button"
								onClick={() => setIsPaymentModalOpen(true)}
							>
								ログインしてレビューを書く
							</SubmitButton>
						)}

						{user && (
							<>
								{!showReviewForm && (
									<SubmitButton
										type="button"
										onClick={() => {
											if (myReview) {
												// 編集モード: 既存値をセット
												setRatingInput(myReview.rating);
												setCommentInput(myReview.comment ?? "");
											} else {
												// 新規投稿: フィールドを初期化
												setRatingInput(0);
												setCommentInput("");
											}
											setShowReviewForm(true);
										}}
									>
										{myReview ? "レビューを編集" : "レビューを書く"}
									</SubmitButton>
								)}
							</>
						)}

						{user && showReviewForm && (
							<ReviewForm onSubmit={handleSubmitReview}>
								<div>
									<span style={{ display: "block", marginBottom: 4 }}>
										評価:
									</span>
									<StarRow>
										{[1, 2, 3, 4, 5].map((n) => (
											<button
												key={n}
												onClick={() =>
													setRatingInput((prev) => (prev === n ? 0 : n))
												}
												style={{
													color: n <= ratingInput ? "#fbbf24" : "#555",
													background: "transparent",
													border: "none",
													cursor: "pointer",
													fontSize: "28px",
												}}
												type="button"
											>
												★
											</button>
										))}
									</StarRow>
								</div>
								<div style={{ width: "100%" }}>
									<label
										htmlFor="commentInput"
										style={{ display: "block", marginBottom: 4 }}
									>
										コメントを投稿してください。
									</label>
									<TextArea
										id="commentInput"
										value={commentInput}
										onChange={(e) => setCommentInput(e.target.value)}
									/>
								</div>
								<SubmitButton type="submit">
									{myReview ? "更新" : "投稿"}
								</SubmitButton>
								{/* 削除ボタンをフォームから削除 */}

								{/* Cancel button */}
								<SubmitButton
									type="button"
									style={{ background: "#6b7280" }}
									onClick={() => {
										setShowReviewForm(false);
									}}
								>
									キャンセル
								</SubmitButton>
							</ReviewForm>
						)}
					</ReviewsSection>
				</InfoSection>
			</ProductHeader>

			<DetailsTabs>
				<TabButtons>
					<TabButton
						$active={activeTab === "description"}
						onClick={() => setActiveTab("description")}
					>
						詳細説明
					</TabButton>
					<TabButton
						$active={activeTab === "features"}
						onClick={() => setActiveTab("features")}
					>
						機能
					</TabButton>
					<TabButton
						$active={activeTab === "requirements"}
						onClick={() => setActiveTab("requirements")}
					>
						動作環境
					</TabButton>
				</TabButtons>

				<TabContent>
					{activeTab === "description" && (
						<LongDescription>{product.longDescription}</LongDescription>
					)}

					{activeTab === "features" && (
						<FeaturesList>
							{product.features.map((feature) => (
								<FeatureItem key={feature}>{feature}</FeatureItem>
							))}
						</FeaturesList>
					)}

					{activeTab === "requirements" && (
						<RequirementsList>
							{product.requirements.map((requirement) => (
								<RequirementItem key={requirement}>
									{requirement}
								</RequirementItem>
							))}
						</RequirementsList>
					)}
				</TabContent>
			</DetailsTabs>

			<PaymentModal
				product={product}
				isOpen={isPaymentModalOpen}
				onClose={() => setIsPaymentModalOpen(false)}
				onSuccess={handlePaymentSuccess}
			/>
		</Container>
	);
};
