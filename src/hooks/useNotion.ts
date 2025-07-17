import { useState, useEffect } from "react";
import {
	getNotionPages,
	getNotionPage,
	getNotionPageBlocks,
	NotionPage,
} from "../lib/notion";

export const useNotionPages = () => {
	const [pages, setPages] = useState<NotionPage[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchPages = async () => {
			try {
				setLoading(true);
				setError(null);
				const fetchedPages = await getNotionPages();
				setPages(fetchedPages);
			} catch (err) {
				setError(
					err instanceof Error ? err.message : "Failed to fetch Notion pages"
				);
			} finally {
				setLoading(false);
			}
		};

		fetchPages();
	}, []);

	return { pages, loading, error };
};

export const useNotionPage = (pageId: string | null) => {
	const [page, setPage] = useState<any>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!pageId) {
			setPage(null);
			return;
		}

		const fetchPage = async () => {
			try {
				setLoading(true);
				setError(null);
				const fetchedPage = await getNotionPage(pageId);
				setPage(fetchedPage);
			} catch (err) {
				setError(
					err instanceof Error ? err.message : "Failed to fetch Notion page"
				);
			} finally {
				setLoading(false);
			}
		};

		fetchPage();
	}, [pageId]);

	return { page, loading, error };
};

export const useNotionPageBlocks = (pageId: string | null) => {
	const [blocks, setBlocks] = useState<any[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!pageId) {
			setBlocks([]);
			return;
		}

		const fetchBlocks = async () => {
			try {
				setLoading(true);
				setError(null);
				const fetchedBlocks = await getNotionPageBlocks(pageId);
				setBlocks(fetchedBlocks);
			} catch (err) {
				setError(
					err instanceof Error
						? err.message
						: "Failed to fetch Notion page blocks"
				);
			} finally {
				setLoading(false);
			}
		};

		fetchBlocks();
	}, [pageId]);

	return { blocks, loading, error };
};
