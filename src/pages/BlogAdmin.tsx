import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthProvider";

import { BlogPlatform } from "../types/blog";
import { useToast } from "../hooks/useToast";
import { Toast } from "../components/ui/Toast";

interface Blog {
	id: string;
	title: string;
	url: string;
	platform: BlogPlatform | null;
	published_at: string | null;
	tags: string[] | null;
	read_time: number | null;
	author: string | null;
	created_at: string;
}

interface BlogFormData {
	title: string;
	url: string;
	platform: BlogPlatform | "";
	published_at: string;
	tags: string;
	read_time: number | "";
	author: string;
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
		margin: 0 -16px 24px -16px;
		padding: 0 16px;
	}
`;

const BlogTable = styled.table`
	width: 100%;
	border-collapse: collapse;
	background: rgba(255, 255, 255, 0.05);
	border-radius: 12px;
	overflow: hidden;
	min-width: 800px;

	@media (max-width: 768px) {
		min-width: 1200px;
	}
`;

const Th = styled.th`
	background: rgba(255, 255, 255, 0.1);
	color: white;
	padding: 16px;
	text-align: left;
	font-weight: 600;
`;

const Td = styled.td`
	color: white;
	padding: 16px;
	border-top: 1px solid rgba(255, 255, 255, 0.1);
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
	margin-bottom: ${({ $variant }) => ($variant === "edit" ? "8px" : "0")};
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
	max-width: 600px;
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
		background: rgba(255, 255, 255, 0.15);
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

export const BlogAdmin: React.FC = () => {
	const navigate = useNavigate();
	const { user, isAdmin, loading } = useAuth();
	const { toast, showSuccess, showError, hideToast } = useToast();
	const [blogs, setBlogs] = useState<Blog[]>([]);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

	const {
		register,
		handleSubmit,
		reset,
		setValue,
		formState: { errors },
	} = useForm<BlogFormData>();

	// ブログ一覧を取得
	const fetchBlogs = useCallback(async () => {
		try {
			const { data, error } = await supabase
				.from("blogs")
				.select("*")
				.order("published_at", { ascending: false });

			if (error) throw error;
			setBlogs(data || []);
		} catch (error) {
			console.error("Failed to fetch blogs:", error);
			showError("ブログ一覧の取得に失敗しました");
		}
	}, [showError]);

	useEffect(() => {
		if (user && isAdmin(user)) {
			fetchBlogs();
		}
	}, [user, isAdmin, fetchBlogs]);

	// フォームをリセット
	const resetForm = () => {
		reset();
		setEditingBlog(null);
	};

	// 新規作成モーダルを開く
	const handleCreate = () => {
		resetForm();
		setIsModalOpen(true);
	};

	// 編集モーダルを開く
	const handleEdit = (blog: Blog) => {
		setEditingBlog(blog);
		setValue("title", blog.title);
		setValue("url", blog.url);
		setValue("platform", blog.platform || "");
		setValue(
			"published_at",
			blog.published_at ? blog.published_at.substring(0, 10) : ""
		);
		setValue("tags", blog.tags?.join(", ") || "");
		setValue("read_time", blog.read_time || "");
		setValue("author", blog.author || "");
		setIsModalOpen(true);
	};

	// 削除処理
	const handleDelete = async (blogId: string) => {
		// 削除確認用のIDを設定
		setDeleteConfirmId(blogId);
	};

	const confirmDelete = async () => {
		if (!deleteConfirmId) return;

		try {
			const { error } = await supabase
				.from("blogs")
				.delete()
				.eq("id", deleteConfirmId);

			if (error) throw error;

			showSuccess("ブログを削除しました");
			fetchBlogs();
		} catch (error) {
			console.error("Failed to delete blog:", error);
			showError("削除に失敗しました");
		} finally {
			setDeleteConfirmId(null);
		}
	};

	// フォーム送信処理
	const onSubmit = async (data: BlogFormData) => {
		setIsLoading(true);
		try {
			const payload = {
				title: data.title,
				url: data.url,
				platform: data.platform || null,
				published_at: data.published_at
					? new Date(data.published_at).toISOString()
					: null,
				tags: data.tags ? data.tags.split(",").map((t) => t.trim()) : null,
				read_time: data.read_time || null,
				author: data.author || null,
			};

			if (editingBlog) {
				// 更新
				const { error } = await supabase
					.from("blogs")
					.update(payload)
					.eq("id", editingBlog.id);

				if (error) throw error;
				showSuccess("ブログを更新しました");
			} else {
				// 新規作成
				const { error } = await supabase.from("blogs").insert(payload);

				if (error) throw error;
				showSuccess("ブログを作成しました");
			}

			setIsModalOpen(false);
			resetForm();
			fetchBlogs();
		} catch (error) {
			console.error("Failed to save blog:", error);
			showError(editingBlog ? "更新に失敗しました" : "作成に失敗しました");
		} finally {
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
			<Title>Blog Admin</Title>

			<CreateButton onClick={handleCreate}>+ New Create</CreateButton>

			<TableContainer>
				<BlogTable>
					<thead>
						<tr>
							<Th>タイトル</Th>
							<Th>URL</Th>
							<Th>プラットフォーム</Th>
							<Th>公開日</Th>
							<Th>著者</Th>
							<Th>操作</Th>
						</tr>
					</thead>
					<tbody>
						{blogs.map((blog) => (
							<tr key={blog.id}>
								<Td>{blog.title}</Td>
								<Td>
									<a
										href={blog.url}
										target="_blank"
										rel="noopener noreferrer"
										style={{
											color: "#1e40af",
											textDecoration: "none",
											fontWeight: "500",
											transition: "all 0.2s ease",
										}}
										onMouseOver={(e) => {
											e.currentTarget.style.color = "#3b82f6";
											e.currentTarget.style.textDecoration = "underline";
										}}
										onMouseOut={(e) => {
											e.currentTarget.style.color = "#1e40af";
											e.currentTarget.style.textDecoration = "none";
										}}
										onFocus={(e) => {
											e.currentTarget.style.color = "#3b82f6";
											e.currentTarget.style.textDecoration = "underline";
										}}
										onBlur={(e) => {
											e.currentTarget.style.color = "#1e40af";
											e.currentTarget.style.textDecoration = "none";
										}}
									>
										{blog.url}
									</a>
								</Td>
								<Td>{blog.platform}</Td>
								<Td>
									{blog.published_at
										? new Date(blog.published_at).toLocaleDateString()
										: "-"}
								</Td>
								<Td>{blog.author || "-"}</Td>
								<Td>
									<ActionButton
										$variant="edit"
										onClick={() => handleEdit(blog)}
									>
										✏️
									</ActionButton>
									<ActionButton
										$variant="delete"
										onClick={() => handleDelete(blog.id)}
									>
										🗑️
									</ActionButton>
								</Td>
							</tr>
						))}
					</tbody>
				</BlogTable>
			</TableContainer>

			{isModalOpen && (
				<Modal onClick={() => setIsModalOpen(false)}>
					<ModalContent onClick={(e) => e.stopPropagation()}>
						<CloseButton onClick={() => setIsModalOpen(false)}>×</CloseButton>
						<h2 style={{ color: "white", marginBottom: "24px" }}>
							{editingBlog ? "ブログを編集" : "新規ブログを作成"}
						</h2>

						<Form onSubmit={handleSubmit(onSubmit)}>
							<FormField>
								<label htmlFor="title">タイトル *</label>
								<input
									id="title"
									{...register("title", { required: "タイトルは必須です" })}
									placeholder="記事タイトル"
								/>
								{errors.title && (
									<ErrorMessage>{errors.title.message}</ErrorMessage>
								)}
							</FormField>

							<FormField>
								<label htmlFor="url">URL *</label>
								<input
									id="url"
									{...register("url", {
										required: "URLは必須です",
										pattern: {
											value: /^https?:\/\/.+/,
											message: "有効なURLを入力してください",
										},
									})}
									placeholder="https://..."
								/>
								{errors.url && (
									<ErrorMessage>{errors.url.message}</ErrorMessage>
								)}
							</FormField>

							<FormField>
								<label htmlFor="platform">プラットフォーム</label>
								<select id="platform" {...register("platform")}>
									<option value="">選択してください</option>
									{Object.values(BlogPlatform).map((platform) => (
										<option key={platform} value={platform}>
											{platform}
										</option>
									))}
								</select>
							</FormField>

							<FormField>
								<label htmlFor="published_at">公開日 *</label>
								<input
									id="published_at"
									type="date"
									{...register("published_at", {
										required: "公開日は必須です",
									})}
								/>
								{errors.published_at && (
									<ErrorMessage>{errors.published_at.message}</ErrorMessage>
								)}
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
								<label htmlFor="read_time">読了時間（分）</label>
								<input
									id="read_time"
									type="number"
									{...register("read_time", { valueAsNumber: true })}
									placeholder="5"
								/>
							</FormField>

							<FormField>
								<label htmlFor="author">著者</label>
								<input id="author" {...register("author")} placeholder="Yuki" />
							</FormField>

							<ButtonRow>
								<Button type="submit" $variant="primary" disabled={isLoading}>
									{isLoading ? "処理中..." : editingBlog ? "更新" : "作成"}
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
							pointerEvents: "auto",
						}}
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
							このブログを削除しますか？この操作は取り消せません。
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
