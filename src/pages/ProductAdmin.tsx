import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthProvider";
import { ProductCategory } from "../types/product";
import { useToast } from "../hooks/useToast";
import { Toast } from "../components/ui/Toast";

interface Product {
	id: string;
	name: string;
	description: string;
	long_desc: string | null;
	price: number;
	category: ProductCategory;
	image_url: string | null;
	tags: string[] | null;
	is_featured: boolean;
	is_popular: boolean;
	last_updated: string | null;
	features: string[] | null;
	requirements: string[] | null;
	created_at: string;
}

interface ProductFormData {
	name: string;
	description: string;
	long_desc: string;
	price: number | "";
	category: ProductCategory | "";
	image_url: string;
	tags: string;
	is_featured: boolean;
	is_popular: boolean;
	last_updated: string;
	features: string;
	requirements: string;
}

const Container = styled.div`
	max-width: 1200px;
	margin: 0 auto;
	padding: 24px;

	@media (max-width: 768px) {
		padding: 16px;
	}
`;

const Title = styled.h1`
	color: white;
	margin-bottom: 24px;
`;

const CreateButton = styled.button`
	background: linear-gradient(135deg, #10b981, #059669);
	color: white;
	border: none;
	border-radius: 8px;
	padding: 12px 24px;
	font-weight: 600;
	cursor: pointer;
	margin-bottom: 24px;
	transition: all 0.2s ease;

	&:hover {
		transform: translateY(-2px);
		box-shadow: 0 10px 20px rgba(16, 185, 129, 0.3);
	}
`;

const TableContainer = styled.div`
	overflow-x: auto;
	border-radius: 12px;
	margin-bottom: 24px;
	position: relative;

	@media (max-width: 768px) {
		margin: 0 0 24px 0;
		padding: 0;
	}
`;

const ProductTable = styled.table`
	width: 100%;
	border-collapse: collapse;
	background: rgba(255, 255, 255, 0.05);
	border-radius: 12px;
	overflow: hidden;
	min-width: 800px;

	@media (max-width: 768px) {
		font-size: 0.8rem;
	}
`;

const Th = styled.th`
	background: rgba(255, 255, 255, 0.1);
	color: white;
	padding: 16px;
	text-align: left;
	font-weight: 600;

	@media (max-width: 768px) {
		&:first-child {
			position: sticky;
			left: 0;
			z-index: 2;
			background: rgba(255, 255, 255, 0.15);
			width: 40vw;
			max-width: 40vw;
		}
		&:nth-child(2) {
			width: 60vw;
			max-width: 60vw;
		}
	}
`;

const Td = styled.td`
	color: white;
	padding: 16px;
	border-top: 1px solid rgba(255, 255, 255, 0.1);

	@media (max-width: 768px) {
		&:first-child {
			position: sticky;
			left: 0;
			z-index: 1;
			background: rgba(255, 255, 255, 0.05);
			width: 40vw;
			max-width: 40vw;
		}
		&:nth-child(2) {
			width: 60vw;
			max-width: 60vw;
			word-wrap: break-word;
			white-space: normal;
		}
	}
`;

const ActionButton = styled.button<{ $variant: "edit" | "delete" }>`
	background: ${({ $variant }) =>
		$variant === "edit"
			? "linear-gradient(135deg, #3b82f6, #1d4ed8)"
			: "linear-gradient(135deg, #f97316, #ea580c)"};
	color: white;
	border: none;
	border-radius: 6px;
	padding: 8px 12px;
	margin-left: 8px;
	cursor: pointer;
	font-size: 14px;
	transition: all 0.2s ease;

	&:hover {
		transform: scale(1.05);
	}
`;

const Modal = styled.div`
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.8);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1000;
`;

const ModalContent = styled.div`
	background: #1e1e2f;
	border-radius: 12px;
	padding: 32px 32px 32px 32px;
	width: 90%;
	max-width: 700px;
	max-height: 90vh;
	overflow-y: auto;
	position: relative;

	@media (max-width: 768px) {
		width: 95%;
		padding: 24px 16px;
		max-height: 95vh;
	}
`;

const CloseButton = styled.button`
	position: absolute;
	top: 16px;
	right: 16px;
	background: none;
	border: none;
	color: rgba(255, 255, 255, 0.7);
	font-size: 24px;
	cursor: pointer;
	padding: 8px;
	border-radius: 4px;
	transition: all 0.2s ease;
	z-index: 10;

	&:hover {
		color: white;
		background: rgba(255, 255, 255, 0.1);
	}

	@media (max-width: 768px) {
		top: 12px;
		right: 12px;
		font-size: 20px;
		padding: 6px;
	}
`;

const Form = styled.form`
	display: flex;
	flex-direction: column;
	gap: 16px;
`;

const FormField = styled.div`
	display: flex;
	flex-direction: column;
	gap: 8px;

	label {
		color: white;
		font-weight: 600;
	}

	input,
	select,
	textarea {
		padding: 12px;
		border-radius: 8px;
		border: 1px solid rgba(255, 255, 255, 0.2);
		background: rgba(255, 255, 255, 0.05);
		color: white;
		font-size: 14px;

		&:focus {
			outline: none;
			border-color: #3b82f6;
		}
	}

	textarea {
		resize: vertical;
		min-height: 100px;
	}
`;

const CheckboxField = styled.div`
	display: flex;
	align-items: center;
	gap: 8px;

	label {
		color: white;
		font-weight: 600;
		cursor: pointer;
	}

	input[type="checkbox"] {
		width: auto;
		margin: 0;
	}
`;

const ButtonRow = styled.div`
	display: flex;
	gap: 12px;
	margin-top: 24px;
`;

const Button = styled.button<{ $variant?: "primary" | "secondary" | "danger" }>`
	flex: 1;
	padding: 12px;
	border: none;
	border-radius: 8px;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.2s ease;

	${({ $variant }) => {
		switch ($variant) {
			case "secondary":
				return "background: rgba(255,255,255,0.2); color:#fff;";
			case "danger":
				return "background: #dc2626; color:#fff;";
			default:
				return "background: linear-gradient(135deg,#3EA8FF,#0066CC); color:#fff;";
		}
	}}

	&:hover {
		transform: translateY(-2px);
	}
`;

const ErrorMessage = styled.p`
	color: #ef4444;
	font-size: 14px;
	margin: 0;
`;

export const ProductAdmin: React.FC = () => {
	const navigate = useNavigate();
	const { user, isAdmin, loading } = useAuth();
	const { toast, showSuccess, showError, hideToast } = useToast();
	const [products, setProducts] = useState<Product[]>([]);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingProduct, setEditingProduct] = useState<Product | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

	const {
		register,
		handleSubmit,
		reset,
		setValue,
		watch,
		formState: { errors },
	} = useForm<ProductFormData>();

	// チェックボックスの値を監視
	const isFeatured = watch("is_featured");
	const isPopular = watch("is_popular");

	// デバッグ用：チェックボックスの値をログ出力
	console.log("Current checkbox values:", { isFeatured, isPopular });

	// 商品一覧を取得
	const fetchProducts = useCallback(async () => {
		try {
			const { data, error } = await supabase
				.from("products")
				.select("*")
				.order("created_at", { ascending: false });

			if (error) throw error;
			setProducts(data || []);
		} catch (error) {
			console.error("Failed to fetch products:", error);
			showError("商品一覧の取得に失敗しました");
		}
	}, [showError]);

	useEffect(() => {
		if (user && isAdmin(user)) {
			fetchProducts();
		}
	}, [user, isAdmin, fetchProducts]);

	// フォームをリセット
	const resetForm = () => {
		reset({
			name: "",
			description: "",
			long_desc: "",
			price: "",
			category: "",
			image_url: "",
			tags: "",
			is_featured: false,
			is_popular: false,
			last_updated: new Date().toISOString().split("T")[0],
			features: "",
			requirements: "",
		});
		setEditingProduct(null);
	};

	// 新規作成モーダルを開く
	const handleCreate = () => {
		resetForm();
		setIsModalOpen(true);
	};

	// 編集モーダルを開く
	const handleEdit = (product: Product) => {
		setEditingProduct(product);
		setValue("name", product.name);
		setValue("description", product.description);
		setValue("long_desc", product.long_desc || "");
		setValue("price", product.price);
		setValue("category", product.category);
		setValue("image_url", product.image_url || "");
		setValue("tags", product.tags?.join(", ") || "");
		setValue("is_featured", product.is_featured);
		setValue("is_popular", product.is_popular);
		setValue(
			"last_updated",
			product.last_updated || new Date().toISOString().split("T")[0]
		);
		setValue("features", product.features?.join(", ") || "");
		setValue("requirements", product.requirements?.join(", ") || "");
		setIsModalOpen(true);
	};

	// 削除処理
	const handleDelete = async (productId: string) => {
		// 削除確認用のIDを設定
		setDeleteConfirmId(productId);
	};

	const confirmDelete = async () => {
		if (!deleteConfirmId) return;

		try {
			const { error } = await supabase
				.from("products")
				.delete()
				.eq("id", deleteConfirmId);

			if (error) throw error;

			showSuccess("商品を削除しました");
			fetchProducts();
		} catch (error) {
			console.error("Failed to delete product:", error);
			showError("削除に失敗しました");
		} finally {
			setDeleteConfirmId(null);
		}
	};

	// フォーム送信処理
	const onSubmit = async (data: ProductFormData) => {
		console.log("onSubmit called with data:", JSON.stringify(data, null, 2));
		console.log("editingProduct:", JSON.stringify(editingProduct, null, 2));
		setIsLoading(true);
		try {
			const payload = {
				name: data.name,
				description: data.description,
				long_desc: data.long_desc || null,
				price: data.price || null,
				category: data.category || null,
				image_url: data.image_url || null,
				tags: data.tags ? data.tags.split(",").map((t) => t.trim()) : null,
				is_featured: Boolean(data.is_featured),
				is_popular: Boolean(data.is_popular),
				last_updated: data.last_updated || null,
				features: data.features
					? data.features.split(",").map((f) => f.trim())
					: null,
				requirements: data.requirements
					? data.requirements.split(",").map((r) => r.trim())
					: null,
			};

			console.log("Payload:", JSON.stringify(payload, null, 2));

			if (editingProduct) {
				console.log("Updating product with ID:", editingProduct.id);
				// 更新
				const { error } = await supabase
					.from("products")
					.update(payload)
					.eq("id", editingProduct.id);

				console.log(
					"Supabase update result:",
					JSON.stringify({ error }, null, 2)
				);

				if (error) throw error;
				console.log("Update successful, showing success toast");
				showSuccess("商品を更新しました");
			} else {
				console.log("Creating new product");
				// 新規作成
				const { error } = await supabase.from("products").insert(payload);

				console.log("Supabase insert result:", { error });

				if (error) throw error;
				console.log("Create successful, showing success toast");
				showSuccess("商品を作成しました");
			}

			console.log("Closing modal and resetting form");
			setIsModalOpen(false);
			resetForm();

			// 更新後のデータを確認
			if (editingProduct) {
				console.log("Fetching updated products...");
				const { data: updatedProducts, error: fetchError } = await supabase
					.from("products")
					.select("*")
					.eq("id", editingProduct.id)
					.single();

				console.log("Updated product from database:", updatedProducts);
				console.log("Fetch error:", fetchError);
			}

			fetchProducts();
		} catch (error) {
			console.error("Failed to save product:", error);
			showError(editingProduct ? "更新に失敗しました" : "作成に失敗しました");
		} finally {
			console.log("Setting loading to false");
			setIsLoading(false);
		}
	};

	if (loading) return <p style={{ color: "white" }}>Loading...</p>;
	if (!user) {
		navigate("/");
		return null;
	}
	if (!isAdmin(user))
		return <p style={{ color: "white" }}>管理者のみアクセスできます。</p>;

	return (
		<Container>
			<Title>Product Admin</Title>

			<CreateButton onClick={handleCreate}>+ New Create</CreateButton>

			<TableContainer>
				<ProductTable>
					<thead>
						<tr>
							<Th>商品名</Th>
							<Th>説明</Th>
							<Th>価格</Th>
							<Th>カテゴリ</Th>
							<Th>特徴</Th>
							<Th>操作</Th>
						</tr>
					</thead>
					<tbody>
						{products.map((product) => (
							<tr key={product.id}>
								<Td>{product.name}</Td>
								<Td>{product.description}</Td>
								<Td>¥{product.price.toLocaleString()}</Td>
								<Td>{product.category}</Td>
								<Td>
									{product.is_featured && (
										<span style={{ color: "#fbbf24", marginRight: "8px" }}>
											⭐
										</span>
									)}
									{product.is_popular && (
										<span style={{ color: "#ef4444" }}>🔥</span>
									)}
								</Td>
								<Td>
									<ActionButton
										$variant="edit"
										onClick={() => handleEdit(product)}
									>
										✏️
									</ActionButton>
									<ActionButton
										$variant="delete"
										onClick={() => handleDelete(product.id)}
									>
										🗑️
									</ActionButton>
								</Td>
							</tr>
						))}
					</tbody>
				</ProductTable>
			</TableContainer>

			{isModalOpen && (
				<Modal onClick={() => setIsModalOpen(false)}>
					<ModalContent onClick={(e) => e.stopPropagation()}>
						<CloseButton onClick={() => setIsModalOpen(false)}>×</CloseButton>
						<h2 style={{ color: "white", marginBottom: "24px" }}>
							{editingProduct ? "商品を編集" : "新規商品を作成"}
						</h2>

						<Form onSubmit={handleSubmit(onSubmit)}>
							<FormField>
								<label htmlFor="name">商品名 *</label>
								<input
									id="name"
									{...register("name", { required: "商品名は必須です" })}
									placeholder="商品名"
								/>
								{errors.name && (
									<ErrorMessage>{errors.name.message}</ErrorMessage>
								)}
							</FormField>

							<FormField>
								<label htmlFor="description">説明 *</label>
								<textarea
									id="description"
									{...register("description", { required: "説明は必須です" })}
									placeholder="商品の説明"
								/>
								{errors.description && (
									<ErrorMessage>{errors.description.message}</ErrorMessage>
								)}
							</FormField>

							<FormField>
								<label htmlFor="long_desc">詳細説明</label>
								<textarea
									id="long_desc"
									{...register("long_desc")}
									placeholder="商品の詳細説明"
								/>
							</FormField>

							<FormField>
								<label htmlFor="price">価格 (¥) *</label>
								<input
									id="price"
									type="number"
									{...register("price", {
										required: "価格は必須です",
										valueAsNumber: true,
										min: { value: 0, message: "価格は0以上で入力してください" },
									})}
									placeholder="1000"
								/>
								{errors.price && (
									<ErrorMessage>{errors.price.message}</ErrorMessage>
								)}
							</FormField>

							<FormField>
								<label htmlFor="category">カテゴリ *</label>
								<select
									id="category"
									{...register("category", { required: "カテゴリは必須です" })}
								>
									<option value="">選択してください</option>
									{Object.values(ProductCategory).map((category) => (
										<option key={category} value={category}>
											{category}
										</option>
									))}
								</select>
								{errors.category && (
									<ErrorMessage>{errors.category.message}</ErrorMessage>
								)}
							</FormField>

							<FormField>
								<label htmlFor="image_url">画像 URL</label>
								<input
									id="image_url"
									{...register("image_url")}
									placeholder="https://..."
								/>
							</FormField>

							<FormField>
								<label htmlFor="tags">タグ（カンマ区切り）</label>
								<input
									id="tags"
									{...register("tags")}
									placeholder="react, supabase"
								/>
							</FormField>

							<FormField>
								<label htmlFor="last_updated">最終更新日</label>
								<input
									id="last_updated"
									type="date"
									{...register("last_updated")}
								/>
							</FormField>

							<FormField>
								<label htmlFor="features">機能（カンマ区切り）</label>
								<textarea
									id="features"
									{...register("features")}
									placeholder="機能1, 機能2, 機能3"
								/>
							</FormField>

							<FormField>
								<label htmlFor="requirements">動作環境（カンマ区切り）</label>
								<textarea
									id="requirements"
									{...register("requirements")}
									placeholder="Windows 10, macOS 12.0, Webブラウザ"
								/>
							</FormField>

							<CheckboxField>
								<input
									id="is_featured"
									type="checkbox"
									{...register("is_featured")}
								/>
								<label htmlFor="is_featured">おすすめ商品</label>
							</CheckboxField>

							<CheckboxField>
								<input
									id="is_popular"
									type="checkbox"
									{...register("is_popular")}
								/>
								<label htmlFor="is_popular">人気商品</label>
							</CheckboxField>

							<ButtonRow>
								<Button type="submit" $variant="primary" disabled={isLoading}>
									{isLoading ? "処理中..." : editingProduct ? "更新" : "作成"}
								</Button>
								<Button
									type="button"
									$variant="secondary"
									onClick={() => setIsModalOpen(false)}
									disabled={isLoading}
								>
									キャンセル
								</Button>
							</ButtonRow>
						</Form>
					</ModalContent>
				</Modal>
			)}

			{/* 削除確認モーダル */}
			{deleteConfirmId && (
				<button
					type="button"
					style={{
						position: "fixed",
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						background: "rgba(0, 0, 0, 0.7)",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						zIndex: 1000,
						border: "none",
						cursor: "default",
					}}
					onClick={() => setDeleteConfirmId(null)}
					onKeyDown={(e) => {
						if (e.key === "Escape") {
							setDeleteConfirmId(null);
						}
					}}
				>
					<div
						style={{
							background: "#1f2937",
							border: "1px solid rgba(255, 255, 255, 0.2)",
							borderRadius: "12px",
							padding: "32px",
							maxWidth: "400px",
							width: "90%",
							textAlign: "center",
							color: "white",
						}}
						onClick={(e) => e.stopPropagation()}
						onKeyDown={(e) => e.stopPropagation()}
						role="dialog"
						tabIndex={-1}
					>
						<h2
							style={{
								margin: "0 0 16px 0",
								fontSize: "20px",
								fontWeight: 600,
							}}
						>
							削除確認
						</h2>
						<p
							style={{
								margin: "0 0 24px 0",
								color: "rgba(255, 255, 255, 0.8)",
								lineHeight: 1.5,
							}}
						>
							この商品を削除しますか？この操作は取り消せません。
						</p>
						<div
							style={{ display: "flex", gap: "12px", justifyContent: "center" }}
						>
							<button
								type="button"
								style={{
									padding: "12px 24px",
									borderRadius: "8px",
									fontWeight: 600,
									cursor: "pointer",
									transition: "all 0.2s ease",
									border: "1px solid rgba(255, 255, 255, 0.3)",
									fontSize: "14px",
									background: "rgba(255, 255, 255, 0.1)",
									color: "white",
								}}
								onClick={() => setDeleteConfirmId(null)}
								onMouseOver={(e) => {
									e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
								}}
								onMouseOut={(e) => {
									e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
								}}
								onFocus={(e) => {
									e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
								}}
								onBlur={(e) => {
									e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
								}}
							>
								キャンセル
							</button>
							<button
								type="button"
								style={{
									padding: "12px 24px",
									borderRadius: "8px",
									fontWeight: 600,
									cursor: "pointer",
									transition: "all 0.2s ease",
									border: "none",
									fontSize: "14px",
									background: "#ef4444",
									color: "white",
								}}
								onClick={confirmDelete}
								onMouseOver={(e) => {
									e.currentTarget.style.background = "#dc2626";
								}}
								onMouseOut={(e) => {
									e.currentTarget.style.background = "#ef4444";
								}}
								onFocus={(e) => {
									e.currentTarget.style.background = "#dc2626";
								}}
								onBlur={(e) => {
									e.currentTarget.style.background = "#ef4444";
								}}
							>
								削除
							</button>
						</div>
					</div>
				</button>
			)}

			<Toast
				message={toast.message}
				type={toast.type}
				isVisible={toast.isVisible}
				onClose={hideToast}
			/>
		</Container>
	);
};
