import React, { useState, useEffect, useRef, useCallback } from "react";
import styled, { keyframes } from "styled-components";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthProvider";
import { useToast } from "../hooks/useToast";
import { Toast } from "../components/ui/Toast";
import { AvatarDeleteConfirmationModal } from "../components/auth/AvatarDeleteConfirmationModal";
import { PurchasedProductCard } from "../components/products/PurchasedProductCard";
import type { Product } from "../types/product";
import { useNavigate } from "react-router-dom";
import { profileUpdateSchema, changePasswordSchema } from "../lib/validation";

interface Profile {
	id: string;
	email: string;
	full_name: string | null;
	avatar_url: string | null;
	biography: string | null;
	created_at: string;
	updated_at: string;
}

interface LikedProduct {
	id: string;
	name: string;
	description: string;
	price: number;
	image_url: string | null;
	category: string;
}

// アニメーション定義
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
`;

const Container = styled.div`
	max-width: 1400px;
	margin: 0 auto;
	padding: 32px;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	min-height: 100vh;
	position: relative;
	overflow-x: hidden;

	&::before {
		content: "";
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: radial-gradient(
				circle at 20% 80%,
				rgba(120, 119, 198, 0.3) 0%,
				transparent 50%
			),
			radial-gradient(
				circle at 80% 20%,
				rgba(255, 119, 198, 0.3) 0%,
				transparent 50%
			),
			radial-gradient(
				circle at 40% 40%,
				rgba(120, 219, 255, 0.2) 0%,
				transparent 50%
			);
		pointer-events: none;
	}

	@media (max-width: 768px) {
		padding: 20px;
	}
`;

const Title = styled.h1`
	color: white;
	margin-bottom: 40px;
	font-size: 3rem;
	text-align: center;
	font-weight: 800;
	text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
	animation: ${fadeInUp} 0.8s ease-out;
	background: linear-gradient(135deg, #fff, #f0f0f0);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	background-clip: text;
	letter-spacing: -0.02em;

	@media (max-width: 768px) {
		font-size: 2rem;
		margin-bottom: 30px;
	}
`;

const Grid = styled.div`
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 32px;
	animation: ${fadeInUp} 0.8s ease-out 0.2s both;

	@media (max-width: 768px) {
		grid-template-columns: 1fr;
		gap: 24px;
	}
`;

const Section = styled.div`
	background: rgba(255, 255, 255, 0.95);
	border-radius: 24px;
	padding: 32px;
	border: 1px solid rgba(255, 255, 255, 0.2);
	box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1), 0 8px 16px rgba(0, 0, 0, 0.05);
	backdrop-filter: blur(20px);
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	position: relative;
	overflow: hidden;

	&::before {
		content: "";
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 4px;
		background: linear-gradient(90deg, #667eea, #764ba2, #f093fb);
		background-size: 200% 100%;
		animation: ${shimmer} 3s ease-in-out infinite;
	}

	&:hover {
		transform: translateY(-8px);
		box-shadow: 0 32px 64px rgba(0, 0, 0, 0.15), 0 16px 32px rgba(0, 0, 0, 0.1);
	}

	@media (max-width: 768px) {
		padding: 24px;
		border-radius: 20px;
	}
`;

const SectionTitle = styled.h2`
	color: #2d3748;
	margin: 0 0 24px 0;
	font-size: 1.75rem;
	border-bottom: 3px solid;
	border-image: linear-gradient(90deg, #667eea, #764ba2) 1;
	padding-bottom: 12px;
	font-weight: 700;
	position: relative;

	&::after {
		content: "";
		position: absolute;
		bottom: -3px;
		left: 0;
		width: 60px;
		height: 3px;
		background: linear-gradient(90deg, #667eea, #764ba2);
		border-radius: 2px;
	}

	@media (max-width: 768px) {
		font-size: 1.5rem;
		margin-bottom: 20px;
		padding-bottom: 10px;
	}
`;

const ProfileHeader = styled.div`
	display: flex;
	align-items: center;
	gap: 24px;
	margin-bottom: 32px;

	@media (max-width: 768px) {
		flex-direction: column;
		text-align: center;
		gap: 20px;
	}
`;

// AvatarDeleteButton追加
const AvatarDeleteButton = styled.button`
	position: absolute;
	top: 0;
	right: 0;
	background: rgba(255, 255, 255, 0.85);
	border: none;
	border-radius: 50%;
	width: 32px;
	height: 32px;
	display: flex;
	align-items: center;
	justify-content: center;
	color: #e53e3e;
	font-size: 1.2rem;
	cursor: pointer;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
	z-index: 2;
	transition: all 0.3s ease;
	opacity: 0;
	transform: scale(0.8);
	pointer-events: none;

	&:hover {
		background: #ffeaea;
		transform: scale(1.1);
	}
`;

const AvatarContainer = styled.div`
	position: relative;
	animation: ${float} 6s ease-in-out infinite;

	&:hover ${AvatarDeleteButton} {
		opacity: 1;
		transform: scale(1);
		pointer-events: auto;
	}
`;

const Avatar = styled.img`
	width: 120px;
	height: 120px;
	border-radius: 50%;
	object-fit: cover;
	border: 4px solid white;
	box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15), 0 8px 16px rgba(0, 0, 0, 0.1);
	transition: all 0.3s ease;

	&:hover {
		transform: scale(1.05);
		box-shadow: 0 32px 64px rgba(0, 0, 0, 0.2), 0 16px 32px rgba(0, 0, 0, 0.15);
	}

	@media (max-width: 768px) {
		width: 100px;
		height: 100px;
		border-width: 3px;
	}
`;

const AvatarPlaceholder = styled.div`
	width: 120px;
	height: 120px;
	border-radius: 50%;
	background: linear-gradient(135deg, #667eea, #764ba2);
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 2.5rem;
	color: white;
	border: 4px solid white;
	box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15), 0 8px 16px rgba(0, 0, 0, 0.1);
	transition: all 0.3s ease;
	position: relative;
	overflow: hidden;

	&::before {
		content: "";
		position: absolute;
		top: -50%;
		left: -50%;
		width: 200%;
		height: 200%;
		background: linear-gradient(
			45deg,
			transparent,
			rgba(255, 255, 255, 0.1),
			transparent
		);
		transform: rotate(45deg);
		animation: ${shimmer} 2s ease-in-out infinite;
	}

	&:hover {
		transform: scale(1.05);
		box-shadow: 0 32px 64px rgba(0, 0, 0, 0.2), 0 16px 32px rgba(0, 0, 0, 0.15);
	}

	@media (max-width: 768px) {
		width: 100px;
		height: 100px;
		font-size: 2rem;
		border-width: 3px;
	}
`;

const AvatarUpload = styled.input`
	position: absolute;
	bottom: 0;
	right: 0;
	width: 36px;
	height: 36px;
	border-radius: 50%;
	background: linear-gradient(135deg, #667eea, #764ba2);
	border: 3px solid white;
	cursor: pointer;
	opacity: 0;
	transition: all 0.3s ease;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);

	&:hover {
		opacity: 1;
		transform: scale(1.1);
	}
`;

const ProfileInfo = styled.div`
	flex: 1;
`;

const ProfileName = styled.h3`
	color: #2d3748;
	margin: 0 0 8px 0;
	font-size: 1.75rem;
	font-weight: 700;
	background: linear-gradient(135deg, #667eea, #764ba2);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	background-clip: text;
`;

const ProfileEmail = styled.p`
	color: #718096;
	margin: 0 0 16px 0;
	user-select: none;
	font-size: 1rem;
	font-weight: 500;
`;

const ProfileBio = styled.p`
	color: #4a5568;
	margin: 0;
	line-height: 1.7;
	font-size: 1rem;
`;

const Form = styled.form`
	display: flex;
	flex-direction: column;
	gap: 20px;
`;

const FormField = styled.div`
	display: flex;
	flex-direction: column;
	gap: 8px;

	label {
		color: #2d3748;
		font-weight: 600;
		font-size: 0.95rem;
		margin-bottom: 4px;
	}

	input,
	textarea {
		padding: 16px;
		border-radius: 12px;
		border: 2px solid #e2e8f0;
		background: rgba(255, 255, 255, 0.9);
		color: #2d3748;
		font-size: 14px;
		transition: all 0.3s ease;
		font-family: inherit;

		&:focus {
			outline: none;
			border-color: #667eea;
			box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
			background: white;
		}

		&::placeholder {
			color: #a0aec0;
		}
	}

	textarea {
		resize: vertical;
		min-height: 120px;
	}

	@media (max-width: 768px) {
		label {
			font-size: 0.9rem;
		}

		input,
		textarea {
			padding: 14px;
			font-size: 16px; /* iOS Safariでズームを防ぐ */
		}
	}
`;

const Button = styled.button<{ $variant?: "primary" | "secondary" | "danger" }>`
	padding: 16px 32px;
	border: none;
	border-radius: 16px;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	font-size: 14px;
	position: relative;
	overflow: hidden;
	font-family: inherit;

	&::before {
		content: "";
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(
			90deg,
			transparent,
			rgba(255, 255, 255, 0.2),
			transparent
		);
		transition: left 0.5s;
	}

	&:hover::before {
		left: 100%;
	}

	${({ $variant }) => {
		switch ($variant) {
			case "secondary":
				return `
					background: linear-gradient(135deg, #f7fafc, #edf2f7);
					color: #4a5568;
					border: 2px solid #e2e8f0;
					
					&:hover {
						background: linear-gradient(135deg, #edf2f7, #e2e8f0);
						transform: translateY(-2px);
						box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
					}
				`;
			case "danger":
				return `
					background: linear-gradient(135deg, #f56565, #e53e3e);
					color: white;
					
					&:hover {
						background: linear-gradient(135deg, #e53e3e, #c53030);
						transform: translateY(-2px);
						box-shadow: 0 8px 25px rgba(229, 62, 62, 0.3);
					}
				`;
			default:
				return `
					background: linear-gradient(135deg, #667eea, #764ba2);
					color: white;
					box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
					
					&:hover {
						background: linear-gradient(135deg, #5a67d8, #6b46c1);
						transform: translateY(-3px);
						box-shadow: 0 12px 35px rgba(102, 126, 234, 0.4);
					}
				`;
		}
	}}

	&:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		transform: none;
		box-shadow: none;
	}

	@media (max-width: 768px) {
		padding: 14px 24px;
		font-size: 16px;
		width: 100%;
	}
`;

const ProductGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
	gap: 24px;
	margin-top: 24px;

	@media (max-width: 768px) {
		grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
		gap: 16px;
		margin-top: 20px;
	}
`;

const ProductCard = styled.div`
	background: rgba(255, 255, 255, 0.95);
	border-radius: 20px;
	padding: 24px;
	border: 1px solid rgba(255, 255, 255, 0.2);
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1), 0 4px 12px rgba(0, 0, 0, 0.05);
	backdrop-filter: blur(10px);
	position: relative;
	overflow: hidden;
	cursor: pointer;

	&::before {
		content: "";
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 3px;
		background: linear-gradient(90deg, #667eea, #764ba2);
	}

	&:hover {
		transform: translateY(-8px) scale(1.02);
		box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15), 0 8px 16px rgba(0, 0, 0, 0.1);
	}

	@media (max-width: 768px) {
		padding: 20px;
		border-radius: 16px;
	}
`;

const ProductName = styled.h3`
	color: #2d3748;
	margin: 0 0 12px 0;
	font-size: 1.3rem;
	font-weight: 700;
`;

const ProductDescription = styled.p`
	color: #718096;
	margin: 0 0 16px 0;
	font-size: 0.95rem;
	line-height: 1.6;
`;

const ProductPrice = styled.div`
	color: #667eea;
	font-weight: 700;
	font-size: 1.2rem;
	background: linear-gradient(135deg, #667eea, #764ba2);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	background-clip: text;
`;

const EmptyMessage = styled.div`
	text-align: center;
	padding: 60px 20px;
	color: #718096;
	font-style: italic;
	background: rgba(255, 255, 255, 0.5);
	border-radius: 16px;
	border: 2px dashed #e2e8f0;
	font-size: 1.1rem;
`;

const LoadingMessage = styled.div`
	text-align: center;
	padding: 60px 20px;
	color: white;
	font-size: 1.2rem;
	font-weight: 500;
`;

const ErrorMessage = styled.div`
	text-align: center;
	padding: 60px 20px;
	color: #f56565;
	font-size: 1.2rem;
	font-weight: 500;
`;

export const MyPage: React.FC = () => {
	const { user } = useAuth();
	const { toast, showError, showSuccess, hideToast } = useToast();
	const [profile, setProfile] = useState<Profile | null>(null);
	const [likedProducts, setLikedProducts] = useState<LikedProduct[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [isAvatarDeleteModalOpen, setIsAvatarDeleteModalOpen] = useState(false);
	const [formData, setFormData] = useState({
		full_name: "",
		biography: "",
		email: "",
		currentPassword: "",
		newPassword: "",
		confirmPassword: "",
		newEmail: "",
		confirmEmail: "",
	});
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [purchasedProducts, setPurchasedProducts] = useState<Product[]>([]);
	const navigate = useNavigate();

	useEffect(() => {
		if (!user) return;
		let isMounted = true;
		(async () => {
			// 1. 購入履歴を取得
			const { data: purchases, error: purchasesError } = await supabase
				.from("product_purchases")
				.select("product_id")
				.eq("user_id", user.id);
			if (purchasesError || !purchases) return;
			const productIds = purchases.map((p) => p.product_id as string);
			if (productIds.length === 0) {
				if (isMounted) setPurchasedProducts([]);
				return;
			}
			// 2. 商品情報を一括取得
			const { data: products, error: productsError } = await supabase
				.from("products")
				.select("*")
				.in("id", productIds);
			if (!productsError && products && isMounted) {
				// DBのsnake_caseをcamelCaseに変換
				const mapped = products.map((p) => ({
					id: p.id as string,
					name: p.name as string,
					description: p.description as string,
					longDescription: (p.long_description as string) ?? "",
					price: p.price as number,
					originalPrice: (p.original_price as number) ?? undefined,
					category: p.category as string,
					imageUrl: (p.image_url as string) ?? "",
					screenshots: (p.screenshots as string[]) ?? [],
					features: (p.features as string[]) ?? [],
					requirements: (p.requirements as string[]) ?? [],
					version: (p.version as string) ?? "",
					lastUpdated: (p.last_updated as string) ?? "",
					rating: (p.rating as number) ?? 0,
					reviewCount: (p.review_count as number) ?? 0,
					likes: (p.likes as number) ?? 0,
					tags: (p.tags as string[]) ?? [],
					isPopular: (p.is_popular as boolean) ?? false,
					isFeatured: (p.is_featured as boolean) ?? false,
				}));
				setPurchasedProducts(mapped as Product[]);
			}
		})();
		return () => {
			isMounted = false;
		};
	}, [user]);

	const fetchProfile = useCallback(async () => {
		try {
			const { data, error } = await supabase
				.from("profiles")
				.select("*")
				.eq("id", user?.id)
				.single();

			if (error) throw error;

			setProfile(data as Profile);
			setFormData({
				full_name: (data.full_name as string) || "",
				biography: (data.biography as string) || "",
				email: (data.email as string) || "",
				currentPassword: "",
				newPassword: "",
				confirmPassword: "",
				newEmail: "",
				confirmEmail: "",
			});
		} catch (error) {
			console.error("Failed to fetch profile:", error);
			showError("プロフィールの取得に失敗しました");
		} finally {
			setIsLoading(false);
		}
	}, [user, showError]);

	const fetchLikedProducts = useCallback(async () => {
		try {
			const { data, error } = await supabase
				.from("product_likes")
				.select(
					`
					product_id,
					products (
						id,
						name,
						description,
						price,
						image_url,
						category
					)
				`
				)
				.eq("user_id", user?.id);

			if (error) throw error;

			const products =
				(data as Array<{ products: LikedProduct | null }>)
					?.map((item) => item.products)
					.filter((p): p is LikedProduct => p !== null) ?? [];
			setLikedProducts(products);
		} catch (error) {
			console.error("Failed to fetch liked products:", error);
		}
	}, [user]);

	useEffect(() => {
		if (user) {
			fetchProfile();
			fetchLikedProducts();
		}
	}, [user, fetchProfile, fetchLikedProducts]);

	// アバタークリックでファイル選択を開く
	const handleAvatarClick = () => {
		fileInputRef.current?.click();
	};

	// アバター削除確認モーダルを開く
	const handleAvatarDeleteClick = () => {
		setIsAvatarDeleteModalOpen(true);
	};

	// アバター削除確認
	const handleAvatarDeleteConfirm = async () => {
		if (!user) return;
		try {
			// 現在のセッションを確認
			const {
				data: { session },
			} = await supabase.auth.getSession();
			const userId = session?.user?.id || user.id;

			if (!userId) {
				showError("ユーザーIDが取得できません。ログインし直してください。");
				return;
			}

			// ストレージから削除（URLからファイルパスを抽出）
			if (profile?.avatar_url) {
				const urlParts = profile.avatar_url.split("/");
				const fileName = urlParts[urlParts.length - 1];
				const filePath = `${userId}/${fileName}`; // RLSポリシーに合わせてユーザーID/ファイル名の形式
				await supabase.storage.from("avatars").remove([filePath]);
			}
			// プロフィールのavatar_urlをnullに
			const { error } = await supabase
				.from("profiles")
				.update({ avatar_url: null })
				.eq("id", userId);
			if (error) throw error;
			setProfile((prev) => (prev ? { ...prev, avatar_url: null } : null));
			showSuccess("アバターを削除しました");
			setIsAvatarDeleteModalOpen(false);
		} catch (error) {
			console.error("Failed to delete avatar:", error);
			showError("アバターの削除に失敗しました");
		}
	};

	// アバター削除キャンセル
	const handleAvatarDeleteCancel = () => {
		setIsAvatarDeleteModalOpen(false);
	};

	const handleAvatarUpload = async (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		const file = event.target.files?.[0];
		if (!file || !user) return;

		console.group("👤 アバターアップロード詳細");
		console.log("=== BACKEND LOG START ===");
		console.log("Timestamp:", new Date().toISOString());
		console.log("Starting avatar upload...");
		console.log("User object:", user);
		console.log("User ID:", user.id);
		console.log("User email:", user.email);
		console.log("File:", file.name, file.size, file.type);
		console.log("File details:", {
			name: file.name,
			size: file.size,
			type: file.type,
			lastModified: new Date(file.lastModified).toISOString(),
		});

		// ユーザーIDの確認
		if (!user.id) {
			showError("ユーザーIDが取得できません。ログインし直してください。");
			return;
		}

		// 現在のセッションを確認
		console.log("=== SESSION DEBUG ===");
		const {
			data: { session },
		} = await supabase.auth.getSession();
		console.log("Current session:", session);
		console.log("Session user ID:", session?.user?.id);
		console.log("Session details:", {
			access_token: session?.access_token ? "present" : "missing",
			refresh_token: session?.refresh_token ? "present" : "missing",
			expires_at: session?.expires_at,
			user_id: session?.user?.id,
			user_email: session?.user?.email,
		});

		// セッションからユーザーIDを取得
		const userId = session?.user?.id || user.id;
		console.log("Final user ID:", userId);
		console.log(
			"User ID source:",
			session?.user?.id ? "session" : "user object"
		);

		if (!userId) {
			showError("ユーザーIDが取得できません。ログインし直してください。");
			return;
		}

		try {
			// ファイルサイズチェック（5MB以下）
			if (file.size > 5 * 1024 * 1024) {
				showError("ファイルサイズは5MB以下にしてください");
				return;
			}

			// ファイル形式チェック
			const allowedTypes = [
				"image/jpeg",
				"image/png",
				"image/gif",
				"image/webp",
			];
			if (!allowedTypes.includes(file.type)) {
				showError("JPEG、PNG、GIF、WebP形式の画像を選択してください");
				return;
			}

			const fileExt = file.name.split(".").pop();
			const fileName = `avatar-${Date.now()}.${fileExt}`;
			// 空文字を除去してクリーンなパスを構築
			const pathParts = [fileName].filter(Boolean);
			const filePath = pathParts.join("/");

			console.log("[1] file.name:", file.name);
			console.log("[2] fileExt:", fileExt);
			console.log("[3] fileName:", fileName);
			console.log("[4] filePath:", filePath);
			console.log("User ID for reference:", userId);

			// 既存のアバターを削除
			if (profile?.avatar_url) {
				try {
					console.log("[5] existing avatar_url:", profile.avatar_url);
					// URLからファイルパスを抽出
					const urlParts = profile.avatar_url.split("/");
					const existingFileName = urlParts[urlParts.length - 1];
					// 空文字を除去してクリーンなパスを構築
					const existingPathParts = [existingFileName].filter(Boolean);
					const existingFilePath = existingPathParts.join("/");
					console.log("[6] existingFilePath:", existingFilePath);
					await supabase.storage.from("avatars").remove([existingFilePath]);
				} catch (deleteError) {
					console.warn("Failed to delete existing avatar:", deleteError);
				}
			}

			// 新しいアバターをアップロード
			console.log("[7] upload start → filePath:", filePath);
			console.log("=== UPLOAD REQUEST DEBUG ===");
			console.log("Supabase client config:", {
				url: import.meta.env.VITE_SUPABASE_URL,
				anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY ? "present" : "missing",
			});
			console.log("Upload request details:", {
				bucket: "avatars",
				path: filePath,
				fileSize: file.size,
				fileType: file.type,
				options: { cacheControl: "3600", upsert: false },
			});

			const { data, error: uploadError } = await supabase.storage
				.from("avatars")
				.upload(filePath, file, {
					cacheControl: "3600",
					upsert: false,
				});

			if (uploadError) {
				console.error("=== UPLOAD ERROR ===");
				console.error("Upload error:", uploadError);
				console.error("Error message:", uploadError.message);
				console.error("Error details:", uploadError);
				console.error(
					"Full error object:",
					JSON.stringify(uploadError, null, 2)
				);
				console.log("[8] upload data:", null); // アップロード失敗時はnull
				console.log("[9] uploadError:", uploadError); // エラー詳細

				// バックエンドエラーの詳細分析
				console.error("=== BACKEND ERROR ANALYSIS ===");
				console.error(
					"RLS Policy Issue:",
					uploadError.message.includes("row-level security policy")
				);
				console.error("Error message analysis:", {
					containsRLS: uploadError.message.includes(
						"row-level security policy"
					),
					containsUnauthorized: uploadError.message.includes("Unauthorized"),
					containsForbidden: uploadError.message.includes("Forbidden"),
					message: uploadError.message,
				});

				throw new Error(uploadError.message);
			}

			console.log("[8] upload data:", data);
			console.log("[9] uploadError:", null);
			console.log("=== UPLOAD SUCCESS DEBUG ===");
			console.log(
				"Upload successful with data:",
				JSON.stringify(data, null, 2)
			);
			console.log("Upload path:", data?.path);
			console.log("Upload ID:", data?.id);
			console.log("Upload fullPath:", data?.fullPath);

			// 公式ドキュメントに従った正しいURL取得方法
			const { data: urlData } = supabase.storage
				.from("avatars")
				.getPublicUrl(filePath);

			// 正しいURLを使用
			const finalUrl = urlData.publicUrl;

			console.log("[10] filePath:", filePath);
			console.log("[11] urlData:", urlData);
			console.log("[12] finalUrl (from getPublicUrl):", finalUrl);

			// ターミナルでも確認できるようにサーバーサイドログを出力
			console.log("=== SERVER LOG ===");
			console.log("Generated URL:", finalUrl);
			console.log("File path:", filePath);
			console.log("URL data:", JSON.stringify(urlData, null, 2));

			// エラー時にも詳細ログを出力
			if (!finalUrl) {
				console.error("ERROR: finalUrl is empty or undefined");
				console.error("urlData:", urlData);
				console.error("filePath:", filePath);
			}

			// プロフィールを更新（テスト用URLを使用）
			console.log("Updating profile...");
			const { error: updateError } = await supabase
				.from("profiles")
				.update({ avatar_url: finalUrl })
				.eq("id", user.id);

			if (updateError) {
				console.error("Update error:", updateError);
				throw new Error(updateError.message);
			}

			setProfile((prev) => (prev ? { ...prev, avatar_url: finalUrl } : null));
			showSuccess("アバターを更新しました");

			console.log("Final avatar URL saved:", finalUrl);
			console.groupEnd();

			// ファイル入力をリセット
			event.target.value = "";
		} catch (error) {
			console.error("=== FINAL ERROR ===");
			console.error("Failed to upload avatar:", error);
			console.error("Error type:", typeof error);
			console.error("Error instanceof Error:", error instanceof Error);
			console.error("Full error object:", error);
			showError(
				error instanceof Error
					? error.message
					: "アバターのアップロードに失敗しました"
			);
		}
	};

	const handleProfileUpdate = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!user) return;

		// バリデーション
		try {
			profileUpdateSchema.parse({
				username: formData.full_name || undefined,
				biography: formData.biography,
			});
		} catch (validationError) {
			if (validationError instanceof Error) {
				// Zodエラーメッセージを適切に処理
				const message = validationError.message;

				// JSON形式の場合は最初のエラーメッセージを抽出
				if (message.startsWith("[") && message.endsWith("]")) {
					try {
						const errors = JSON.parse(message);
						if (errors.length > 0) {
							const firstError = errors[0];
							showError(firstError.message);
						} else {
							showError("入力内容に問題があります");
						}
					} catch {
						showError("入力内容に問題があります");
					}
				} else {
					showError(message);
				}
				return;
			}
		}

		setIsSaving(true);
		try {
			const { error } = await supabase
				.from("profiles")
				.update({
					full_name: formData.full_name,
					biography: formData.biography,
				})
				.eq("id", user.id);

			if (error) throw error;

			setProfile((prev) =>
				prev
					? {
							...prev,
							full_name: formData.full_name,
							biography: formData.biography,
					  }
					: null
			);

			showSuccess("プロフィールを更新しました");
		} catch (error) {
			console.error("Failed to update profile:", error);
			showError("プロフィールの更新に失敗しました");
		} finally {
			setIsSaving(false);
		}
	};

	const handlePasswordChange = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!user) return;

		// バリデーション
		try {
			changePasswordSchema.parse({
				currentPassword: formData.currentPassword,
				newPassword: formData.newPassword,
				confirmPassword: formData.confirmPassword,
			});
		} catch (validationError) {
			if (validationError instanceof Error) {
				// Zodエラーメッセージを適切に処理
				const message = validationError.message;

				// JSON形式の場合は最初のエラーメッセージを抽出
				if (message.startsWith("[") && message.endsWith("]")) {
					try {
						const errors = JSON.parse(message);
						if (errors.length > 0) {
							const firstError = errors[0];
							showError(firstError.message);
						} else {
							showError("入力内容に問題があります");
						}
					} catch {
						showError("入力内容に問題があります");
					}
				} else {
					showError(message);
				}
				return;
			}
		}

		setIsSaving(true);
		try {
			// 現在のパスワードで再認証
			const { error: reauthError } = await supabase.auth.signInWithPassword({
				email: user.email!,
				password: formData.currentPassword,
			});

			if (reauthError) {
				showError("現在のパスワードが正しくありません");
				return;
			}

			// パスワード変更
			const { error } = await supabase.auth.updateUser({
				password: formData.newPassword,
			});

			if (error) throw error;

			setFormData((prev) => ({
				...prev,
				currentPassword: "",
				newPassword: "",
				confirmPassword: "",
			}));

			showSuccess("パスワードを変更しました");
		} catch (error) {
			console.error("Failed to change password:", error);
			showError("パスワードの変更に失敗しました");
		} finally {
			setIsSaving(false);
		}
	};

	const handleEmailChange = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!user) return;

		if (!formData.currentPassword) {
			showError("現在のパスワードを入力してください");
			return;
		}

		if (formData.newEmail !== formData.confirmEmail) {
			showError("新しいメールアドレスが一致しません");
			return;
		}

		if (!formData.newEmail.includes("@")) {
			showError("有効なメールアドレスを入力してください");
			return;
		}

		setIsSaving(true);
		try {
			// 現在のパスワードで再認証
			const { error: reauthError } = await supabase.auth.signInWithPassword({
				email: user.email!,
				password: formData.currentPassword,
			});

			if (reauthError) {
				showError("現在のパスワードが正しくありません");
				return;
			}

			// メールアドレス変更
			const { error } = await supabase.auth.updateUser({
				email: formData.newEmail,
			});

			if (error) throw error;

			setFormData((prev) => ({
				...prev,
				currentPassword: "",
				newEmail: "",
				confirmEmail: "",
			}));

			showSuccess(
				"メールアドレス変更時の認証メールが送信されました。ご確認ください。"
			);
		} catch (error) {
			console.error("Failed to change email:", error);
			showError("メールアドレスの変更に失敗しました");
		} finally {
			setIsSaving(false);
		}
	};

	if (isLoading) {
		return (
			<Container>
				<LoadingMessage>✨ プロフィールを読み込んでいます...</LoadingMessage>
			</Container>
		);
	}

	if (!user) {
		return (
			<Container>
				<ErrorMessage>ログインが必要です</ErrorMessage>
			</Container>
		);
	}

	return (
		<Container>
			<Title>✨ My Page</Title>

			{purchasedProducts.length > 0 && (
				<Section style={{ marginBottom: 32 }}>
					<SectionTitle>購入したアプリ</SectionTitle>
					<div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
						{purchasedProducts.map((product) => (
							<PurchasedProductCard
								key={product.id}
								product={product as Product}
							/>
						))}
					</div>
				</Section>
			)}

			<Grid data-testid="grid">
				{/* プロフィール情報 */}
				<Section>
					<SectionTitle>👤 プロフィール</SectionTitle>
					<ProfileHeader>
						<AvatarContainer
							onClick={handleAvatarClick}
							style={{ cursor: "pointer" }}
						>
							{profile?.avatar_url ? (
								<>
									<Avatar src={profile.avatar_url} alt="アバター" />
									<AvatarDeleteButton
										type="button"
										title="アバターを削除"
										onClick={(e) => {
											e.stopPropagation();
											handleAvatarDeleteClick();
										}}
									>
										🗑
									</AvatarDeleteButton>
								</>
							) : (
								<AvatarPlaceholder>
									{profile?.full_name?.charAt(0) ||
										user.email?.charAt(0) ||
										"?"}
								</AvatarPlaceholder>
							)}
							<AvatarUpload
								ref={fileInputRef}
								type="file"
								accept="image/*"
								onChange={handleAvatarUpload}
								title="アバターを変更"
								style={{ display: "none" }}
							/>
						</AvatarContainer>
						<ProfileInfo>
							<ProfileName>{profile?.full_name || "名前未設定"}</ProfileName>
							<ProfileEmail>{profile?.email}</ProfileEmail>
							<ProfileBio>
								{profile?.biography || "バイオグラフィーが設定されていません"}
							</ProfileBio>
						</ProfileInfo>
					</ProfileHeader>

					<Form onSubmit={handleProfileUpdate}>
						<FormField>
							<label htmlFor="full_name">名前</label>
							<input
								id="full_name"
								type="text"
								value={formData.full_name}
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										full_name: e.target.value,
									}))
								}
								placeholder="あなたの名前を入力"
							/>
						</FormField>

						<FormField>
							<label htmlFor="biography">バイオグラフィー</label>
							<textarea
								id="biography"
								value={formData.biography}
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										biography: e.target.value,
									}))
								}
								placeholder="自己紹介を入力してください"
							/>
						</FormField>

						<Button type="submit" disabled={isSaving}>
							{isSaving ? "更新中..." : "プロフィールを更新"}
						</Button>
					</Form>
				</Section>

				{/* パスワード変更 */}
				<Section>
					<SectionTitle>🔐 パスワード変更</SectionTitle>
					<Form onSubmit={handlePasswordChange}>
						<FormField>
							<label htmlFor="currentPassword">現在のパスワード</label>
							<input
								id="currentPassword"
								type="password"
								value={formData.currentPassword}
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										currentPassword: e.target.value,
									}))
								}
								placeholder="現在のパスワードを入力"
								required
							/>
						</FormField>

						<FormField>
							<label htmlFor="newPassword">新しいパスワード</label>
							<input
								id="newPassword"
								type="password"
								value={formData.newPassword}
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										newPassword: e.target.value,
									}))
								}
								placeholder="新しいパスワードを入力"
								required
							/>
						</FormField>

						<FormField>
							<label htmlFor="confirmPassword">パスワード確認</label>
							<input
								id="confirmPassword"
								type="password"
								value={formData.confirmPassword}
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										confirmPassword: e.target.value,
									}))
								}
								placeholder="新しいパスワードを再入力"
								required
							/>
						</FormField>

						<Button type="submit" disabled={isSaving}>
							{isSaving ? "変更中..." : "パスワードを変更"}
						</Button>
					</Form>
				</Section>
			</Grid>

			{/* メールアドレス変更 */}
			<Section style={{ marginTop: "32px" }}>
				<SectionTitle>📧 メールアドレス変更</SectionTitle>
				<Form onSubmit={handleEmailChange}>
					<FormField>
						<label htmlFor="emailCurrentPassword">現在のパスワード</label>
						<input
							id="emailCurrentPassword"
							type="password"
							value={formData.currentPassword}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									currentPassword: e.target.value,
								}))
							}
							placeholder="現在のパスワードを入力"
							required
						/>
					</FormField>

					<FormField>
						<label htmlFor="newEmail">新しいメールアドレス</label>
						<input
							id="newEmail"
							type="email"
							value={formData.newEmail}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									newEmail: e.target.value,
								}))
							}
							placeholder="新しいメールアドレスを入力"
							required
						/>
					</FormField>

					<FormField>
						<label htmlFor="confirmEmail">メールアドレス確認</label>
						<input
							id="confirmEmail"
							type="email"
							value={formData.confirmEmail}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									confirmEmail: e.target.value,
								}))
							}
							placeholder="新しいメールアドレスを再入力"
							required
						/>
					</FormField>

					<Button type="submit" disabled={isSaving}>
						{isSaving ? "変更中..." : "メールアドレスを変更"}
					</Button>
				</Form>
			</Section>

			{/* いいねしたアプリ */}
			<Section style={{ marginTop: "64px", marginBottom: "64px" }}>
				<SectionTitle>❤️ いいねしたアプリ</SectionTitle>
				{likedProducts.length > 0 ? (
					<ProductGrid>
						{likedProducts.map((product) => (
							<ProductCard
								key={product.id}
								onClick={() => navigate(`/products/${product.id}`)}
							>
								<ProductName>{product.name}</ProductName>
								<ProductDescription>{product.description}</ProductDescription>
								<ProductPrice>¥{product.price.toLocaleString()}</ProductPrice>
							</ProductCard>
						))}
					</ProductGrid>
				) : (
					<EmptyMessage>まだいいねしたアプリはありません</EmptyMessage>
				)}
			</Section>

			<Toast
				message={toast.message}
				type={toast.type}
				isVisible={toast.isVisible}
				onClose={hideToast}
			/>
			<AvatarDeleteConfirmationModal
				isOpen={isAvatarDeleteModalOpen}
				onConfirm={handleAvatarDeleteConfirm}
				onCancel={handleAvatarDeleteCancel}
			/>
		</Container>
	);
};
