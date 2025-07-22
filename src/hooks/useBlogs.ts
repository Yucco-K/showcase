import { useMemo, useCallback, useState } from "react";
import type { BlogEntry, BlogFilter, BlogPlatform } from "../types/blog";
import { useSupabaseQuery } from "./common/useSupabaseQuery";
import { filterBlogs } from "../utils/filter";

// DB Row 型
type DbBlog = {
	id: string;
	title: string;
	platform: string;
	url: string;
	published_at: string;
	updated_at: string;
	author: string;
	read_time: number | string;
	tags: string[] | null;
};

// DB → BlogEntry型へ変換
const mapDbBlog = (row: DbBlog): BlogEntry => ({
	id: row.id,
	title: row.title,
	platform: row.platform as BlogPlatform,
	url: row.url,
	publishDate: row.published_at,
	updateDate: row.updated_at,
	author: row.author,
	readTime: Number(row.read_time) || 0,
	tags: row.tags ?? [],
	description: "", // descriptionはテーブルにないので空文字
	isExternal: true,
	thumbnail: undefined,
});

export const useBlogs = () => {
	const {
		data: allBlogs,
		loading: isLoading,
		error,
		refetch,
	} = useSupabaseQuery<DbBlog, BlogEntry>({
		table: "blogs",
		select: "*",
		order: { column: "published_at", ascending: false },
		transform: mapDbBlog,
		cache: true,
	});

	const [filters, setFilters] = useState<BlogFilter>({});

	// フィルタリング
	const filteredBlogs = useMemo(
		() => filterBlogs(allBlogs, filters),
		[allBlogs, filters]
	);

	// フィルタ操作
	const updateFilter = useCallback((newFilters: Partial<BlogFilter>) => {
		setFilters((prev) => ({ ...prev, ...newFilters }));
	}, []);
	const resetFilters = useCallback(() => {
		setFilters({});
	}, []);

	// タグ一覧
	const getAllTags = useCallback(() => {
		return Array.from(new Set(allBlogs.flatMap((blog) => blog.tags))).sort();
	}, [allBlogs]);

	// プラットフォーム別記事数
	const getPlatformCounts = useCallback(() => {
		const counts = {} as Record<string, number>;
		allBlogs.forEach((blog) => {
			counts[blog.platform] = (counts[blog.platform] || 0) + 1;
		});
		return counts;
	}, [allBlogs]);

	// 統計情報
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
		blogs: filteredBlogs,
		allBlogs,
		filters,
		isLoading,
		error,
		updateFilter,
		resetFilters,
		getAllTags,
		getPlatformCounts,
		getStats,
		refetch,
	};
};
