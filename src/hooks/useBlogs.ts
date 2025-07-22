import { useState, useEffect, useCallback, useRef } from "react";
import type { BlogEntry, BlogFilter } from "../types/blog";
import { supabase } from "../lib/supabase"; // Supabaseクライアントをインポート

// キャッシュ用のグローバル変数
let blogsCache: BlogEntry[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5分

export const useBlogs = () => {
	const [allBlogs, setAllBlogs] = useState<BlogEntry[]>([]);
	const [filteredBlogs, setFilteredBlogs] = useState<BlogEntry[]>([]);
	const [filters, setFilters] = useState<BlogFilter>({});
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [retryCount, setRetryCount] = useState(0);
	const abortControllerRef = useRef<AbortController | null>(null);

	// 初期化: Supabaseからデータを読み込む
	useEffect(() => {
		const fetchBlogs = async () => {
			// 前のリクエストをキャンセル
			if (abortControllerRef.current) {
				abortControllerRef.current.abort();
			}
			abortControllerRef.current = new AbortController();

			setIsLoading(true);
			setError(null);

			try {
				// キャッシュをチェック
				const now = Date.now();
				if (blogsCache && now - cacheTimestamp < CACHE_DURATION) {
					console.log("Using cached blogs data");
					setAllBlogs(blogsCache);
					setIsLoading(false);
					return;
				}

				console.log(
					"Fetching blogs from Supabase... (attempt:",
					retryCount + 1,
					")"
				);

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
				const formattedBlogs: BlogEntry[] = data.map(
					(blog: Record<string, unknown>) => ({
						id: blog.id as string,
						title: blog.title as string,
						platform: blog.platform as string,
						url: blog.url as string,
						publishDate: blog.published_at as string,
						updateDate: blog.updated_at as string,
						author: blog.author as string,
						readTime: Number(blog.read_time) || 0,
						tags: (blog.tags as string[]) || [],
						description: "", // descriptionはテーブルにないので空文字を設定
						isExternal: true, // 外部リンクであると仮定
						thumbnail: undefined, // thumbnailはテーブルにないのでundefined
					})
				);

				console.log("Formatted blogs:", formattedBlogs);

				// キャッシュを更新
				blogsCache = formattedBlogs;
				cacheTimestamp = now;

				setAllBlogs(formattedBlogs);
				setRetryCount(0); // 成功時にリトライカウントをリセット
			} catch (error) {
				if (error instanceof Error && error.name === "AbortError") {
					console.log("Request was aborted");
					return;
				}

				console.error("Failed to load blogs from Supabase:", error);
				setError(
					error instanceof Error ? error.message : "Failed to load blogs"
				);
				setAllBlogs([]); // エラー時は空にする
			} finally {
				setIsLoading(false);
			}
		};

		fetchBlogs();

		// クリーンアップ関数
		return () => {
			if (abortControllerRef.current) {
				abortControllerRef.current.abort();
			}
		};
	}, [retryCount]);

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

	// リトライ機能
	const retry = useCallback(() => {
		setRetryCount((prev) => prev + 1);
	}, []);

	return {
		// データ
		blogs: filteredBlogs,
		allBlogs,
		filters,
		isLoading,
		error,

		// フィルタ操作
		updateFilter,
		resetFilters,

		// ユーティリティ
		getAllTags,
		getPlatformCounts,
		getStats,

		// エラーハンドリング
		retry,
	};
};
