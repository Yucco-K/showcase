import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useProduct } from "../hooks/useProducts";
import { useProducts } from "../hooks/useProducts";
import { PaymentModal } from "../components/payment/PaymentModal";
import { LoginModal } from "../components/auth/LoginModal";
import { useAuth } from "../contexts/AuthProvider";
import { DeleteConfirmationModal } from "../components/ui/DeleteConfirmationModal";
import { useReviews } from "../hooks/useReviews";
import { useProductPurchase } from "../hooks/useProductPurchase";
import { PreventDoubleClickButton } from "../components/ui/PreventDoubleClickButton";
import { ReplyForm } from "../components/reviews/ReplyForm";
import { ReplyItem } from "../components/reviews/ReplyItem";
import { useToast } from "../hooks/useToast";
import { Toast } from "../components/ui/Toast";
import { ProductDetailSkeleton } from "../components/ui/Skeleton";
import { formatDate } from "../utils/date";
import { SimilarProductsList } from "../components/recommendations/SimilarProductsList";

const Container = styled.div`
	min-height: 100vh;
	padding: 80px 20px 40px;
	max-width: 1200px;
	margin: 0 auto;
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

const ProductImage = styled.img`
	width: 100%;
	height: 100%;
	object-fit: cover;
	border-radius: 16px;
`;

const ImageFallback = styled.div`
	width: 100%;
	height: 100%;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 16px;
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
	word-wrap: break-word;
	word-break: break-word;
	overflow-wrap: break-word;
	max-width: 100%;
	overflow: hidden;
`;

const ReviewActions = styled.div`
	display: flex;
	gap: 8px;
	word-wrap: break-word;
	word-break: break-word;
	overflow-wrap: break-word;
	max-width: 100%;
	overflow: hidden;
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
	font-size: 16px;
	line-height: 1.5;
	word-wrap: break-word;
	word-break: break-word;
	overflow-wrap: break-word;
	white-space: pre-wrap;
	box-sizing: border-box;

	@media (max-width: 768px) {
		width: 92%; /* slightly shorter on small screens */
	}
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
	color: ${(props) => (props.$active ? "#2563eb" : "rgba(255, 255, 255, 0.6)")};
	padding: 16px 24px;
	font-size: 16px;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.2s ease;
	border-bottom: 2px solid
		${(props) => (props.$active ? "#2563eb" : "transparent")};

	&:hover {
		color: ${(props) => (props.$active ? "#2563eb" : "#ffffff")};
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

// LongDescription は使用されなくなったため削除

const TruncatedDescription = styled.div<{ $expanded: boolean }>`
	white-space: pre-line;
	font-size: 16px;
	line-height: 1.7;
	position: relative;
	overflow: hidden;
	color: rgba(255, 255, 255, 0.8);

	${({ $expanded }) =>
		!$expanded &&
		`
		display: -webkit-box;
		-webkit-line-clamp: 5;
		-webkit-box-orient: vertical;
		overflow: hidden;
		
		-webkit-mask: linear-gradient(
			to bottom,
			black 0%,
			black 60%,
			transparent 100%
		);
		mask: linear-gradient(
			to bottom,
			black 0%,
			black 60%,
			transparent 100%
		);
	`}
`;

const ReadMoreButton = styled.button`
	background: linear-gradient(135deg, #3b82f6, #1d4ed8);
	color: white;
	border: none;
	padding: 8px 16px;
	border-radius: 6px;
	font-size: 14px;
	font-weight: 500;
	cursor: pointer;
	margin-top: 12px;
	transition: all 0.2s ease;

	&:hover {
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
	}
`;

const TagsContainer = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
	margin-bottom: 32px;
`;

const Tag = styled.span`
	background: rgba(255, 255, 255, 0.1);
	color: rgba(255, 255, 255, 0.8);
	padding: 6px 12px;
	border-radius: 16px;
	font-size: 14px;
`;

const ReviewControls = styled.div`
	display: flex;
	gap: 16px;
	align-items: center;
	margin-bottom: 24px;
	flex-wrap: wrap;

	@media (max-width: 768px) {
		flex-direction: column;
		align-items: stretch;
		gap: 12px;
	}
`;

const FilterGroup = styled.div`
	display: flex;
	gap: 8px;
	align-items: center;
`;

const FilterLabel = styled.label`
	color: rgba(255, 255, 255, 0.8);
	font-size: 14px;
	font-weight: 500;
	white-space: nowrap;
`;

const FilterSelect = styled.select`
	background: rgba(255, 255, 255, 0.1);
	border: 1px solid rgba(255, 255, 255, 0.2);
	border-radius: 6px;
	color: white;
	padding: 6px 12px;
	font-size: 14px;
	cursor: pointer;
	min-width: 120px;

	option {
		background: #1a1a1a;
		color: white;
	}

	&:focus {
		outline: none;
		border-color: #3b82f6;
	}
`;

const ClearFilterButton = styled.button`
	background: rgba(255, 255, 255, 0.1);
	border: 1px solid rgba(255, 255, 255, 0.2);
	border-radius: 6px;
	color: rgba(255, 255, 255, 0.8);
	padding: 6px 12px;
	font-size: 14px;
	cursor: pointer;
	transition: all 0.2s ease;

	&:hover {
		background: rgba(255, 255, 255, 0.15);
		color: white;
	}
`;

const ProductDetail: React.FC = () => {
	useEffect(() => {
		document.title = "Dummy App Store";
		// ページトップにスクロール
		window.scrollTo(0, 0);
	}, []);

	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const { product, isFound, isLoading } = useProduct(id || "");
	const { toggleFavorite, isFavorite, allProducts } = useProducts();
	const { user, isAdmin } = useAuth();
	const reviewsHook = useReviews(id || "", user?.id);
	const {
		reviews,
		allReviews,
		loading: reviewsLoading,
		filter,
		updateFilter,
		clearFilter,
		addReview,
		updateReview,
		addReply,
		updateReply,
		deleteOwnReview,
		deleteReview,
		myReview,
	} = reviewsHook;
	const { hasPurchased, isLoading: purchaseLoading } = useProductPurchase(
		id || "",
		user?.id
	);
	const { toast, showSuccess, showError, hideToast } = useToast();

	// 平均評価と件数をリアルタイムで計算
	const validReviews = reviews.filter(
		(r) =>
			r.rating !== null &&
			r.rating !== undefined &&
			r.profiles?.role !== "admin"
	);
	const avgRating = validReviews.length
		? validReviews.reduce((sum, r) => sum + (r.rating ?? 0), 0) /
		  validReviews.length
		: product?.rating ?? 0;
	const reviewCount = reviews.length || product?.reviewCount || 0;

	// （後段で product が確定してから likesCount を計算する）

	const [ratingInput, setRatingInput] = useState<number>(myReview?.rating ?? 3);
	const [commentInput, setCommentInput] = useState<string>(
		myReview?.comment || ""
	);
	const [showReviewForm, setShowReviewForm] = useState(false);
	const [replyingTo, setReplyingTo] = useState<string | null>(null);
	const [expandedReplies, setExpandedReplies] = useState<Set<string>>(
		new Set()
	);

	const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
	const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
	const [activeTab, setActiveTab] = useState<
		"description" | "features" | "requirements"
	>("description");
	const [deleteTargetReview, setDeleteTargetReview] = useState<null | string>(
		null
	);
	const [descriptionExpanded, setDescriptionExpanded] = useState(false);
	const [showReadMoreButton, setShowReadMoreButton] = useState(false);
	const descriptionRef = useRef<HTMLDivElement>(null);

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("ja-JP", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	// 説明文の高さをチェックしてボタン表示を制御
	useEffect(() => {
		if (descriptionRef.current && !descriptionExpanded && product) {
			const element = descriptionRef.current;
			const lineHeight = parseFloat(getComputedStyle(element).lineHeight);
			const maxHeight = lineHeight * 5; // 5行分の高さ

			setShowReadMoreButton(element.scrollHeight > maxHeight);
		}
	}, [descriptionExpanded, product]);

	if (!id || isLoading) {
		return <ProductDetailSkeleton />;
	}

	if (!isFound || !product) {
		return (
			<Container>
				<PreventDoubleClickButton
					onClick={() => navigate("/products")}
					className="back-button"
					style={{ marginBottom: "24px" }}
				>
					← Back to Product List
				</PreventDoubleClickButton>
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

	const renderStars = (rating: number | null) => {
		return Array.from({ length: 5 }, (_, index) => {
			const filled = rating !== null && index < Math.floor(rating);
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
		if (!user) {
			setIsLoginModalOpen(true);
		} else {
			setIsPaymentModalOpen(true);
		}
	};

	const handlePaymentSuccess = () => {
		showSuccess(`${product.name}の購入が完了しました！ありがとうございます。`);
	};

	const handleSubmitReview = async (e: React.FormEvent) => {
		e.preventDefault();

		// レビュー権限チェック（ログインユーザーであれば投稿可能）
		if (!user) {
			showError("ログインが必要です。");
			return;
		}

		// 管理者レビューは常にデフォルト3、平均計算対象外
		const finalRating = isAdmin(user) ? 3 : Math.max(1, ratingInput);

		try {
			let result: { error?: string | Error | null };
			if (myReview) {
				// 既存のレビューがある場合は更新
				result = await updateReview(finalRating, commentInput || null);
			} else {
				// 新規の場合は追加
				result = await addReview(finalRating, commentInput || null);
			}

			if (result.error) {
				throw new Error(
					typeof result.error === "string" ? result.error : result.error.message
				);
			}

			if (myReview) {
				showSuccess("レビューを更新しました！");
			} else {
				showSuccess("レビューを投稿しました！");
			}
			setShowReviewForm(false);
		} catch (error) {
			if (myReview) {
				showError("更新に失敗しました...");
			} else {
				showError("投稿に失敗しました...");
			}
			console.error("Review submission error:", error);
		}
	};

	const handleSubmitReply = async (parentId: string, comment: string) => {
		if (!user) {
			showError("ログインが必要です。");
			return { error: "ログインが必要です。" };
		}

		try {
			const result = await addReply(parentId, comment);

			if (result.error) {
				const errorMessage =
					typeof result.error === "string"
						? result.error
						: result.error.message;
				showError(errorMessage);
				return { error: errorMessage };
			}

			showSuccess("返信を投稿しました！");
			setReplyingTo(null);
			return {};
		} catch (error) {
			const errorMessage = "返信の投稿に失敗しました...";
			showError(errorMessage);
			console.error("Reply submission error:", error);
			return { error: errorMessage };
		}
	};

	return (
		<Container>
			<PreventDoubleClickButton
				onClick={() => navigate("/products")}
				className="back-button"
				style={{ marginBottom: "24px", marginRight: "16px" }}
			>
				← Back to Product List
			</PreventDoubleClickButton>
			{user && (
				<PreventDoubleClickButton
					onClick={() => navigate("/mypage")}
					className="back-button"
					style={{ marginBottom: "24px" }}
				>
					← Back to My Page
				</PreventDoubleClickButton>
			)}

			<ProductHeader>
				<ImageSection>
					{product.isPopular && <PopularBadge>人気</PopularBadge>}
					<MainImage>
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
						<PreventDoubleClickButton
							onClick={handlePurchase}
							className="purchase-button"
							style={{
								background: "linear-gradient(135deg, #10b981, #059669)",
								color: "white",
								border: "none",
								padding: "12px 24px",
								borderRadius: "8px",
								fontWeight: "600",
								cursor: "pointer",
								transition: "all 0.2s ease",
								fontSize: "16px",
							}}
						>
							{user
								? `¥${product.price.toLocaleString()}で購入`
								: "ログインして購入する"}
						</PreventDoubleClickButton>
						<PreventDoubleClickButton
							onClick={() => {
								if (!user) {
									setIsLoginModalOpen(true);
								} else {
									toggleFavorite(product.id);
								}
							}}
							className="favorite-button"
						>
							{isFavorite(product.id) ? "❤️" : "🤍"}
						</PreventDoubleClickButton>
						<span
							data-testid="like-count-detail"
							style={{
								marginLeft: 4,
								display: "inline-block",
								transform: "translateY(14px)",
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
							<MetaValue>{formatDate(product.lastUpdated)}</MetaValue>
						</MetaItem>
					</MetaInfo>

					<TagsContainer>
						{product.tags.map((tag) => (
							<Tag key={tag}>{tag}</Tag>
						))}
					</TagsContainer>

					{/* Details Tabs */}
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
								<div>
									<TruncatedDescription
										ref={descriptionRef}
										$expanded={descriptionExpanded}
									>
										{product.longDescription}
									</TruncatedDescription>
									{showReadMoreButton && (
										<ReadMoreButton
											onClick={() =>
												setDescriptionExpanded(!descriptionExpanded)
											}
										>
											{descriptionExpanded ? "閉じる" : "続きを読む"}
										</ReadMoreButton>
									)}
								</div>
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

					{/* 似たアプリセクション */}
					<SimilarProductsList
						productId={product.id}
						title="似たアプリ"
						maxItems={4}
					/>

					{/* Reviews */}
					<ReviewsSection>
						<h3>レビュー</h3>

						{/* レビューコントロール */}
						<ReviewControls>
							<FilterGroup>
								<FilterLabel>星数フィルター:</FilterLabel>
								<FilterSelect
									value={filter.rating || ""}
									onChange={(e) => {
										const value = e.target.value;
										updateFilter({
											rating: value ? parseInt(value) : undefined,
										});
									}}
									aria-label="星数フィルター"
								>
									<option value="">すべて</option>
									<option value="5">★★★★★ 以上</option>
									<option value="4">★★★★ 以上</option>
									<option value="3">★★★ 以上</option>
									<option value="2">★★ 以上</option>
									<option value="1">★ 以上</option>
								</FilterSelect>
							</FilterGroup>

							<FilterGroup>
								<FilterLabel>ソート:</FilterLabel>
								<FilterSelect
									value={filter.sortBy || "date"}
									onChange={(e) => {
										updateFilter({
											sortBy: e.target.value as "date" | "rating",
										});
									}}
									aria-label="ソート方法"
								>
									<option value="date">日付順</option>
									<option value="rating">星数順</option>
								</FilterSelect>
							</FilterGroup>

							<FilterGroup>
								<FilterLabel>順序:</FilterLabel>
								<FilterSelect
									value={filter.sortOrder || "desc"}
									onChange={(e) => {
										updateFilter({
											sortOrder: e.target.value as "asc" | "desc",
										});
									}}
									aria-label="ソート順序"
								>
									<option value="desc">降順</option>
									<option value="asc">昇順</option>
								</FilterSelect>
							</FilterGroup>

							<ClearFilterButton onClick={() => clearFilter()} type="button">
								フィルターをクリア
							</ClearFilterButton>
						</ReviewControls>

						{reviewsLoading ? (
							<p>Loading...</p>
						) : (
							<>
								{reviews.length === 0 && allReviews.length === 0 && (
									<p>まだレビューがありません。</p>
								)}
								{reviews.length === 0 && allReviews.length > 0 && (
									<p>フィルター条件に合うレビューがありません。</p>
								)}
								{reviews.map((rev) => (
									<ReviewItem key={rev.id}>
										<div>
											{/* アバターと名前 */}
											<div
												style={{
													display: "flex",
													alignItems: "center",
													gap: "8px",
													marginBottom: "8px",
												}}
											>
												{rev.profiles?.avatar_url ? (
													<img
														src={rev.profiles.avatar_url}
														alt="avatar"
														style={{
															width: "24px",
															height: "24px",
															borderRadius: "50%",
															objectFit: "cover",
														}}
													/>
												) : (
													<div
														style={{
															width: "24px",
															height: "24px",
															borderRadius: "50%",
															background:
																"linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
															display: "flex",
															alignItems: "center",
															justifyContent: "center",
															fontSize: "12px",
															color: "white",
															fontWeight: "600",
														}}
													>
														{rev.profiles?.full_name
															? rev.profiles.full_name.charAt(0).toUpperCase()
															: "U"}
													</div>
												)}
												<span
													style={{
														fontSize: "14px",
														color: "rgba(255, 255, 255, 0.8)",
														fontWeight: "500",
													}}
												>
													{rev.profiles?.full_name || "匿名ユーザー"}
												</span>
											</div>

											{rev.profiles?.role !== "admin" &&
												renderStars(rev.rating)}
											<div
												style={{
													marginTop: "4px",
													fontSize: "12px",
													color: "rgba(255, 255, 255, 0.5)",
												}}
											>
												{formatDate(rev.created_at)}
											</div>
											{rev.comment && (
												<div>
													{rev.profiles?.role === "admin" && (
														<div
															style={{
																color: "#6d28d9",
																fontWeight: "600",
																margin: "8px 0",
																fontSize: "14px",
																backgroundColor: "rgba(109, 40, 217, 0.18)",
																padding: "4px 8px",
																borderRadius: "4px",
																border: "1px solid #6d28d9",
															}}
														>
															管理者より
														</div>
													)}
													{!isAdmin(user) &&
														rev.user_id === user?.id &&
														hasPurchased && (
															<div
																style={{
																	color: "#059669",
																	fontWeight: "600",
																	margin: "8px 0",
																	fontSize: "14px",
																	backgroundColor: "rgba(5, 150, 105, 0.18)",
																	padding: "4px 8px",
																	borderRadius: "4px",
																	border: "1px solid #059669",
																}}
															>
																購入済みユーザー
															</div>
														)}
													<p
														style={{
															wordWrap: "break-word",
															wordBreak: "break-word",
															overflowWrap: "break-word",
															whiteSpace: "pre-wrap",
															margin: 0,
															padding: 0,
														}}
													>
														{rev.comment}
													</p>

													{/* 返信ボタン */}
													{user && (
														<button
															type="button"
															onClick={() => setReplyingTo(rev.id)}
															style={{
																background: "none",
																border: "none",
																color: "#3b82f6",
																cursor: "pointer",
																fontSize: "16px",
																marginTop: "8px",
																padding: "4px 8px",
																borderRadius: "4px",
																transition: "all 0.2s ease",
															}}
														>
															💬 返信する
														</button>
													)}

													{/* 返信フォーム */}
													{replyingTo === rev.id && (
														<ReplyForm
															onSubmit={(comment) =>
																handleSubmitReply(rev.id, comment)
															}
															onCancel={() => setReplyingTo(null)}
														/>
													)}

													{/* 返信一覧 */}
													{rev.replies && rev.replies.length > 0 && (
														<div style={{ marginTop: "12px" }}>
															{/* アコーディオンヘッダー */}
															<button
																style={{
																	cursor: "pointer",
																	display: "flex",
																	alignItems: "center",
																	gap: "8px",
																	padding: "4px 8px",
																	borderRadius: "4px",
																	background: "rgba(255, 255, 255, 0.05)",
																	marginBottom: expandedReplies.has(rev.id)
																		? "8px"
																		: "0",
																	border: "none",
																	color: "inherit",
																	fontSize: "inherit",
																	fontFamily: "inherit",
																}}
																onClick={() => {
																	const newExpanded = new Set(expandedReplies);
																	if (newExpanded.has(rev.id)) {
																		newExpanded.delete(rev.id);
																	} else {
																		newExpanded.add(rev.id);
																	}
																	setExpandedReplies(newExpanded);
																}}
																type="button"
																aria-label={`${rev.replies.length}件の返信を${
																	expandedReplies.has(rev.id)
																		? "閉じる"
																		: "開く"
																}`}
															>
																<span
																	style={{
																		fontSize: "12px",
																		color: "rgba(255, 255, 255, 0.7)",
																	}}
																>
																	{expandedReplies.has(rev.id) ? "▼" : "▶"}
																</span>
																<span
																	style={{
																		fontSize: "12px",
																		color: "rgba(255, 255, 255, 0.7)",
																	}}
																>
																	{rev.replies.length}件の返信
																</span>
															</button>

															{/* アコーディオンコンテンツ */}
															{expandedReplies.has(rev.id) && (
																<div>
																	{rev.replies.map((reply) => (
																		<ReplyItem
																			key={reply.id}
																			reply={reply}
																			onEdit={async (replyId, newComment) => {
																				console.log(
																					"Editing reply:",
																					replyId,
																					"with comment:",
																					newComment
																				);
																				await updateReply(replyId, newComment);
																				showSuccess("返信を更新しました！");
																			}}
																			onReply={async (replyId, comment) => {
																				console.log(
																					"Replying to reply:",
																					replyId,
																					"with comment:",
																					comment
																				);
																				const result = await handleSubmitReply(
																					replyId,
																					comment
																				);
																				return result;
																			}}
																			onDelete={async (replyId) => {
																				try {
																					console.log(
																						"Deleting reply:",
																						replyId
																					);
																					await deleteReview(replyId);
																					showSuccess("返信を削除しました！");
																				} catch (error) {
																					showError("削除に失敗しました...");
																					console.error(
																						"Reply deletion error:",
																						error
																					);
																				}
																			}}
																			canEdit={
																				user &&
																				(reply.user_id === user.id ||
																					isAdmin(user))
																			}
																			canReply={user !== null}
																			canDelete={
																				user &&
																				(reply.user_id === user.id ||
																					isAdmin(user))
																			}
																		/>
																	))}
																</div>
															)}
														</div>
													)}
												</div>
											)}
										</div>
										{user && (rev.user_id === user.id || isAdmin(user)) && (
											<ReviewActions>
												{rev.user_id === user.id && (
													<button
														type="button"
														aria-label="edit review"
														onClick={() => {
															setRatingInput(rev.rating ?? 3);
															setCommentInput(rev.comment ?? "");
															setShowReviewForm(true);
														}}
													>
														✏️
													</button>
												)}
												<button
													type="button"
													aria-label="delete review"
													onClick={() => setDeleteTargetReview(rev.id)}
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
							<PreventDoubleClickButton
								onClick={() => setIsLoginModalOpen(true)}
								className="submit-button"
								style={{
									background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
									color: "white",
									border: "none",
									padding: "12px 24px",
									borderRadius: "8px",
									fontWeight: "600",
									cursor: "pointer",
									transition: "all 0.2s ease",
									fontSize: "16px",
								}}
							>
								ログインしてレビューを書く
							</PreventDoubleClickButton>
						)}

						{user && !purchaseLoading && (
							<>
								{!showReviewForm ? (
									<PreventDoubleClickButton
										onClick={() => {
											setShowReviewForm(true);
											// 既存のレビューがある場合は、その内容を設定
											if (myReview) {
												setRatingInput(myReview.rating ?? 3);
												setCommentInput(myReview.comment || "");
											} else {
												// 新規レビューの場合はデフォルト値を設定
												setRatingInput(3);
												setCommentInput("");
											}
										}}
									>
										{myReview ? "レビューを編集" : "レビューを書く"}
									</PreventDoubleClickButton>
								) : showReviewForm ? (
									<ReviewForm
										onSubmit={handleSubmitReview}
										data-testid="review-form"
									>
										<StarRow>
											{[1, 2, 3, 4, 5].map((rating) => (
												<Star
													key={`rating-${rating}`}
													$filled={rating <= ratingInput}
													onClick={() => {
														// トグル機能: 同じ星をクリックした場合は1つ減らす
														if (ratingInput === rating) {
															setRatingInput(Math.max(1, rating - 1));
														} else {
															setRatingInput(rating);
														}
													}}
												>
													★
												</Star>
											))}
										</StarRow>
										<TextArea
											name="comment"
											placeholder="レビューを書いてください..."
											value={commentInput}
											onChange={(e) => setCommentInput(e.target.value)}
										/>
										<input type="hidden" name="rating" value={ratingInput} />
										<div
											style={{
												display: "flex",
												gap: "12px",
												marginTop: "8px",
											}}
										>
											<button
												type="submit"
												style={{
													background:
														"linear-gradient(135deg, #3b82f6, #1d4ed8)",
													color: "white",
													border: "none",
													padding: "12px 24px",
													borderRadius: "8px",
													fontWeight: "600",
													cursor: "pointer",
													transition: "all 0.2s ease",
												}}
											>
												{myReview ? "更新する" : "投稿する"}
											</button>
											<button
												type="button"
												style={{
													background: "rgba(255,255,255,0.15)",
													color: "#333",
													border: "1px solid #ccc",
													padding: "12px 24px",
													borderRadius: "8px",
													fontWeight: "600",
													cursor: "pointer",
												}}
												onClick={() => {
													setShowReviewForm(false);
													setRatingInput(myReview?.rating ?? 3);
													setCommentInput(myReview?.comment || "");
												}}
											>
												キャンセル
											</button>
										</div>
									</ReviewForm>
								) : null}
							</>
						)}
					</ReviewsSection>
					<DeleteConfirmationModal
						isOpen={deleteTargetReview !== null}
						title="レビュー削除の確認"
						message="本当にレビューを削除しますか？"
						onCancel={() => setDeleteTargetReview(null)}
						onConfirm={async () => {
							if (!deleteTargetReview) return;
							const revId = deleteTargetReview;
							setDeleteTargetReview(null);
							// find review object
							const targetRev = reviews.find((r) => r.id === revId);
							if (!targetRev) return;
							try {
								let result: { error: unknown } | undefined;
								if (targetRev.user_id === user?.id) {
									result = await deleteOwnReview();
								} else {
									result = await deleteReview(revId);
								}
								if (result?.error) throw result.error;
								showSuccess("レビューを削除しました！");
							} catch {
								showError("削除に失敗しました...");
							}
						}}
					/>
				</InfoSection>
			</ProductHeader>

			<PaymentModal
				product={product}
				isOpen={isPaymentModalOpen}
				onClose={() => setIsPaymentModalOpen(false)}
				onSuccess={handlePaymentSuccess}
			/>
			<LoginModal
				isOpen={isLoginModalOpen}
				onClose={() => setIsLoginModalOpen(false)}
			/>
			<Toast
				message={toast.message}
				type={toast.type}
				isVisible={toast.isVisible}
				onClose={hideToast}
			/>
		</Container>
	);
};

export default ProductDetail;
