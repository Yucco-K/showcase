import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { supabase } from "../../lib/supabase";
import { BlogPlatform } from "../../types/blog";
import { useAuth } from "../../contexts/AuthProvider";
import { LoginModal } from "../auth/LoginModal";

interface BlogAdminFormProps {
	blogId?: string; // undefined なら新規
	onCompleted?: () => void;
}

const Container = styled.div`
	max-width: 600px;
	margin: 0 auto;
	padding: 24px;
	background: rgba(255, 255, 255, 0.05);
	border-radius: 12px;
	overflow-y: auto;
	max-height: 90vh;
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

export const BlogAdminForm: React.FC<BlogAdminFormProps> = ({
	blogId,
	onCompleted,
}) => {
	const { user, isAdmin, loading } = useAuth();

	const [title, setTitle] = useState("");
	const [url, setUrl] = useState("");
	const [platform, setPlatform] = useState<BlogPlatform | "">("");
	const [publishedAt, setPublishedAt] = useState("");
	const [tags, setTags] = useState("");
	const [readTime, setReadTime] = useState<number | "">("");
	const [author, setAuthor] = useState("Yuki");
	const [error, setError] = useState<string | null>(null);
	const [loadingSave, setLoadingSave] = useState(false);

	// fetch blog when editing
	useEffect(() => {
		if (!blogId) return;
		(async () => {
			const { data, error } = await supabase
				.from("blogs")
				.select("*")
				.eq("id", blogId)
				.single();
			if (error) {
				setError(error.message);
				return;
			}
			if (data) {
				setTitle((data.title as string) ?? "");
				setUrl((data.url as string) ?? "");
				setPlatform((data.platform as BlogPlatform) ?? "");
				setPublishedAt(
					(data.published_at as string)
						? (data.published_at as string).substring(0, 10)
						: ""
				);
				setTags((data.tags as string[])?.join(",") ?? "");
				setReadTime((data.read_time as number) ?? "");
				setAuthor((data.author as string) ?? "");
			}
		})();
	}, [blogId]);

	if (loading) return <p style={{ color: "#fff" }}>Loading...</p>;
	if (!user) {
		return <LoginModal isOpen={true} onClose={() => {}} />;
	}
	if (!isAdmin(user)) {
		return <p style={{ color: "#fff" }}>管理者のみアクセスできます。</p>;
	}

	const handleSave = async () => {
		setError(null);
		setLoadingSave(true);
		const payload: Record<string, unknown> = {
			title,
			url,
			platform: platform || null,
			published_at: publishedAt ? new Date(publishedAt).toISOString() : null,
			tags: tags ? tags.split(",").map((t) => t.trim()) : null,
			read_time: readTime || null,
			author: author || null,
		};
		let supaRes: { error: Error | null };
		if (blogId) {
			supaRes = await supabase.from("blogs").update(payload).eq("id", blogId);
		} else {
			supaRes = await supabase.from("blogs").insert(payload);
		}
		setLoadingSave(false);
		if (supaRes.error) {
			setError(supaRes.error.message);
		} else {
			onCompleted?.();
		}
	};

	const handleDelete = async () => {
		if (!blogId) return;
		if (!confirm("本当に削除しますか？")) return;
		const { error } = await supabase.from("blogs").delete().eq("id", blogId);
		if (error) setError(error.message);
		else onCompleted?.();
	};

	return (
		<Container>
			<h2 style={{ color: "#fff" }}>
				{blogId ? "記事を編集" : "新規記事を追加"}
			</h2>
			{error && <p style={{ color: "#ef4444" }}>{error}</p>}
			<Field>
				<label htmlFor="title">タイトル *</label>
				<input
					id="title"
					placeholder="記事タイトル"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
				/>
			</Field>
			<Field>
				<label htmlFor="url">URL *</label>
				<input
					id="url"
					placeholder="https://..."
					value={url}
					onChange={(e) => setUrl(e.target.value)}
				/>
			</Field>
			<Field>
				<label htmlFor="platform">プラットフォーム</label>
				<select
					id="platform"
					value={platform}
					onChange={(e) => setPlatform(e.target.value as BlogPlatform | "")}
				>
					<option value="">選択してください</option>
					{Object.values(BlogPlatform).map((p) => (
						<option key={p} value={p}>
							{p}
						</option>
					))}
				</select>
			</Field>
			<Field>
				<label htmlFor="published_at">公開日 *</label>
				<input
					id="published_at"
					type="date"
					value={publishedAt}
					onChange={(e) => setPublishedAt(e.target.value)}
				/>
			</Field>
			<Field>
				<label htmlFor="tags">タグ（カンマ区切り）</label>
				<input
					id="tags"
					placeholder="react, supabase"
					value={tags}
					onChange={(e) => setTags(e.target.value)}
				/>
			</Field>
			<Field>
				<label htmlFor="read_time">読了時間（分）</label>
				<input
					id="read_time"
					type="number"
					placeholder="5"
					value={readTime}
					onChange={(e) =>
						setReadTime(e.target.value ? Number(e.target.value) : "")
					}
				/>
			</Field>
			<Field>
				<label htmlFor="author">著者</label>
				<input
					id="author"
					placeholder="Yuki"
					value={author}
					onChange={(e) => setAuthor(e.target.value)}
				/>
			</Field>

			<ButtonRow>
				<Button $variant="primary" onClick={handleSave} disabled={loadingSave}>
					{blogId ? "更新" : "追加"}
				</Button>
				{blogId && (
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
