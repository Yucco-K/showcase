import { useState, useEffect, useCallback } from "react";
import type { BlogEntry, BlogFilter } from "../types/blog";
import { supabase } from "../lib/supabase"; // Supabaseクライアントをインポート

export const useBlogs = () => {
	const [allBlogs, setAllBlogs] = useState<BlogEntry[]>([]);
	const [filteredBlogs, setFilteredBlogs] = useState<BlogEntry[]>([]);
	const [filters, setFilters] = useState<BlogFilter>({});
	const [isLoading, setIsLoading] = useState(true);

	// 初期化: Supabaseからデータを読み込む
	useEffect(() => {
		const fetchBlogs = async () => {
			setIsLoading(true);
			try {
				console.log("Fetching blogs from Supabase...");
				const { data, error } = await supabase
					.from("blogs")
					.select("*")
					.order("published_at", { ascending: false });

				if (error) {
					console.error("Supabase error:", error);
					throw error;
				}

				console.log("Raw data from Supabase:", data);

				// SupabaseからのデータをBlogEntry型に変換
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				const formattedBlogs: BlogEntry[] = data.map((blog: any) => ({
					id: blog.id,
					title: blog.title,
					platform: blog.platform,
					url: blog.url,
					publishDate: blog.published_at,
					updateDate: blog.updated_at,
					author: blog.author,
					readTime: blog.read_time,
					tags: blog.tags || [],
					description: "", // descriptionはテーブルにないので空文字を設定
					isExternal: true, // 外部リンクであると仮定
					thumbnail: undefined, // thumbnailはテーブルにないのでundefined
				}));

				console.log("Formatted blogs:", formattedBlogs);
				setAllBlogs(formattedBlogs);
			} catch (error) {
				console.error("Failed to load blogs from Supabase:", error);
				setAllBlogs([]); // エラー時は空にする
			} finally {
				setIsLoading(false);
			}
		};

		fetchBlogs();
	}, []);

	// フィルタリング処理
	useEffect(() => {
		let filtered = [...allBlogs];

		// プラットフォームでフィルタ
		if (filters.platform) {
			filtered = filtered.filter((blog) => blog.platform === filters.platform);
		}

		// タグでフィルタ
		if (filters.tags && filters.tags.length > 0) {
			filtered = filtered.filter((blog) =>
				filters.tags!.some((tag) => blog.tags.includes(tag))
			);
		}

		// 検索クエリでフィルタ
		if (filters.searchQuery && filters.searchQuery.trim()) {
			const query = filters.searchQuery.toLowerCase();
			filtered = filtered.filter(
				(blog) =>
					blog.title.toLowerCase().includes(query) ||
					blog.description.toLowerCase().includes(query) ||
					blog.tags.some((tag) => tag.toLowerCase().includes(query))
			);
		}

		// 日付順ソートは初期取得時に実施済みのため不要

		setFilteredBlogs(filtered);
	}, [allBlogs, filters]);

	// フィルタ更新
	const updateFilter = useCallback((newFilters: Partial<BlogFilter>) => {
		setFilters((prev) => ({ ...prev, ...newFilters }));
	}, []);

	// フィルタリセット
	const resetFilters = useCallback(() => {
		setFilters({});
	}, []);

	// 利用可能な全タグを取得
	const getAllTags = useCallback(() => {
		return Array.from(new Set(allBlogs.flatMap((blog) => blog.tags))).sort();
	}, [allBlogs]);

	// プラットフォーム別記事数を取得
	const getPlatformCounts = useCallback(() => {
		const counts = {} as Record<string, number>;
		allBlogs.forEach((blog) => {
			counts[blog.platform] = (counts[blog.platform] || 0) + 1;
		});
		return counts;
	}, [allBlogs]);

	// 統計情報を取得
	const getStats = useCallback(() => {
		return {
			total: allBlogs.length,
			byPlatform: getPlatformCounts(),
			averageReadTime:
				allBlogs.length > 0
					? Math.round(
							allBlogs.reduce((sum, blog) => sum + blog.readTime, 0) /
								allBlogs.length
					  )
					: 0,
			totalReadTime: allBlogs.reduce((sum, blog) => sum + blog.readTime, 0),
		};
	}, [allBlogs, getPlatformCounts]);

	return {
		// データ
		blogs: filteredBlogs,
		allBlogs,
		filters,
		isLoading,

		// フィルタ操作
		updateFilter,
		resetFilters,

		// ユーティリティ
		getAllTags,
		getPlatformCounts,
		getStats,
	};
};
