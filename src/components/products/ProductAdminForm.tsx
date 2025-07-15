import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthProvider";
import { LoginModal } from "../auth/LoginModal";
import { ProductCategory } from "../../types/product";
import { type Product } from "../../types/product";

// Supabase 行オブジェクト（snake_case）
interface DbProduct
	extends Omit<
		Product,
		"longDescription" | "imageUrl" | "rating" | "reviewCount"
	> {
	long_desc: string | null;
	image_url: string | null;
	is_featured: boolean | null;
	is_popular: boolean | null;
}

interface ProductAdminFormProps {
	productId?: string; // undefined なら新規
	onCompleted?: () => void;
}

const Container = styled.div`
	max-width: 700px;
	margin: 0 auto;
	padding: 24px;
	background: rgba(255, 255, 255, 0.05);
	border-radius: 12px;
`;

const Field = styled.div`
	margin-bottom: 16px;
	label {
		display: block;
		font-weight: 600;
		margin-bottom: 4px;
		color: #fff;
	}
	input,
	select,
	textarea {
		width: 100%;
		padding: 10px 14px;
		border-radius: 8px;
		border: 1px solid rgba(255, 255, 255, 0.2);
		background: rgba(255, 255, 255, 0.05);
		color: #fff;
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
`;

export const ProductAdminForm: React.FC<ProductAdminFormProps> = ({
	productId,
	onCompleted,
}) => {
	const { user, isAdmin, loading } = useAuth();

	// state
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [longDesc, setLongDesc] = useState("");
	const [price, setPrice] = useState<number | "">("");
	const [category, setCategory] = useState<ProductCategory | "">("");
	const [imageUrl, setImageUrl] = useState("");
	const [tags, setTags] = useState("");
	const [isFeatured, setIsFeatured] = useState(false);
	const [isPopular, setIsPopular] = useState(false);

	const [error, setError] = useState<string | null>(null);
	const [loadingSave, setLoadingSave] = useState(false);

	// fetch existing product when editing
	useEffect(() => {
		if (!productId) return;
		(async () => {
			const { data, error } = await supabase
				.from("products")
				.select("*")
				.eq("id", productId)
				.single();
			if (error) {
				setError(error.message);
				return;
			}
			if (data) {
				const row = data as unknown as DbProduct;
				setName(row.name);
				setDescription(row.description);
				setLongDesc(row.long_desc ?? "");
				setPrice(Number(row.price));
				setCategory(row.category as ProductCategory);
				setImageUrl(row.image_url ?? "");
				setTags((row.tags ?? []).join(","));
				setIsFeatured(!!row.is_featured);
				setIsPopular(!!row.is_popular);
			}
		})();
	}, [productId]);

	if (loading) return <p style={{ color: "#fff" }}>Loading...</p>;
	if (!user) return <LoginModal isOpen={true} onClose={() => {}} />;
	if (!isAdmin(user))
		return <p style={{ color: "#fff" }}>管理者のみアクセスできます。</p>;

	const handleSave = async () => {
		setError(null);
		setLoadingSave(true);
		const payload: Record<string, unknown> = {
			name,
			description,
			long_desc: longDesc || null,
			price: price || null,
			category: category || null,
			image_url: imageUrl || null,
			tags: tags ? tags.split(",").map((t) => t.trim()) : null,
			is_featured: isFeatured,
			is_popular: isPopular,
		};

		let supaRes: { error: Error | null };
		if (productId) {
			supaRes = await supabase
				.from("products")
				.update(payload)
				.eq("id", productId);
		} else {
			supaRes = await supabase.from("products").insert(payload);
		}
		setLoadingSave(false);
		if (supaRes.error) {
			setError(supaRes.error.message);
		} else {
			onCompleted?.();
		}
	};

	const handleDelete = async () => {
		if (!productId) return;
		if (!confirm("本当に削除しますか？")) return;
		const { error } = await supabase
			.from("products")
			.delete()
			.eq("id", productId);
		if (error) setError(error.message);
		else onCompleted?.();
	};

	return (
		<Container>
			<h2 style={{ color: "#fff" }}>
				{productId ? "商品を編集" : "新規商品を追加"}
			</h2>
			{error && <p style={{ color: "#ef4444" }}>{error}</p>}

			<Field>
				<label htmlFor="name">商品名 *</label>
				<input
					id="name"
					value={name}
					onChange={(e) => setName(e.target.value)}
				/>
			</Field>

			<Field>
				<label htmlFor="description">説明 *</label>
				<textarea
					id="description"
					rows={3}
					value={description}
					onChange={(e) => setDescription(e.target.value)}
				/>
			</Field>

			<Field>
				<label htmlFor="longDesc">詳細説明</label>
				<textarea
					id="longDesc"
					rows={5}
					value={longDesc}
					onChange={(e) => setLongDesc(e.target.value)}
				/>
			</Field>

			<Field>
				<label htmlFor="price">価格 (¥) *</label>
				<input
					id="price"
					type="number"
					value={price}
					onChange={(e) =>
						setPrice(e.target.value ? Number(e.target.value) : "")
					}
				/>
			</Field>

			<Field>
				<label htmlFor="category">カテゴリ *</label>
				<select
					id="category"
					value={category}
					onChange={(e) => setCategory(e.target.value as ProductCategory | "")}
				>
					<option value="">選択してください</option>
					{Object.values(ProductCategory).map((c) => (
						<option key={c} value={c}>
							{c}
						</option>
					))}
				</select>
			</Field>

			<Field>
				<label htmlFor="imageUrl">画像 URL</label>
				<input
					id="imageUrl"
					value={imageUrl}
					onChange={(e) => setImageUrl(e.target.value)}
				/>
			</Field>

			<Field>
				<label htmlFor="tags">タグ（カンマ区切り）</label>
				<input
					id="tags"
					placeholder="finance, todo"
					value={tags}
					onChange={(e) => setTags(e.target.value)}
				/>
			</Field>

			<Field>
				<label>
					<input
						type="checkbox"
						checked={isFeatured}
						onChange={(e) => setIsFeatured(e.target.checked)}
					/>
					注目商品 (Featured)
				</label>
			</Field>

			<Field>
				<label>
					<input
						type="checkbox"
						checked={isPopular}
						onChange={(e) => setIsPopular(e.target.checked)}
					/>
					人気商品 (Popular)
				</label>
			</Field>

			<ButtonRow>
				<Button $variant="primary" onClick={handleSave} disabled={loadingSave}>
					{productId ? "更新" : "追加"}
				</Button>
				{productId && (
					<Button
						$variant="danger"
						onClick={handleDelete}
						disabled={loadingSave}
					>
						削除
					</Button>
				)}
			</ButtonRow>
		</Container>
	);
};
