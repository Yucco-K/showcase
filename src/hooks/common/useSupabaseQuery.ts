import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "../../lib/supabase";

interface UseSupabaseQueryOptions<T, R> {
	table: string;
	select?: string;
	order?: { column: string; ascending?: boolean };
	eq?: Record<string, any>;
	transform?: (row: T) => R;
	cache?: boolean;
	retry?: number;
}

export function useSupabaseQuery<T = any, R = T>(
	options: UseSupabaseQueryOptions<T, R>
) {
	const {
		table,
		select = "*",
		order,
		eq,
		transform,
		cache = false,
		retry = 0,
	} = options;

	const [data, setData] = useState<R[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [retryCount, setRetryCount] = useState(0);
	const cacheRef = useRef<{
		key: string;
		value: R[];
		timestamp: number;
	} | null>(null);
	const abortControllerRef = useRef<AbortController | null>(null);

	const fetchData = useCallback(async () => {
		if (abortControllerRef.current) {
			abortControllerRef.current.abort();
		}
		abortControllerRef.current = new AbortController();

		setLoading(true);
		setError(null);

		const cacheKey = JSON.stringify({ table, select, order, eq });
		if (
			cache &&
			cacheRef.current &&
			cacheRef.current.key === cacheKey &&
			Date.now() - cacheRef.current.timestamp < 5 * 60 * 1000
		) {
			setData(cacheRef.current.value);
			setLoading(false);
			return;
		}

		try {
			let query = supabase.from(table).select(select);
			if (order) {
				query = query.order(order.column, {
					ascending: order.ascending ?? false,
				});
			}
			if (eq) {
				Object.entries(eq).forEach(([k, v]) => {
					query = query.eq(k, v);
				});
			}
			const { data: raw, error } = await query;
			if (error) throw error;
			let result: R[] = Array.isArray(raw)
				? transform
					? raw.map(transform)
					: raw
				: [];
			if (cache) {
				cacheRef.current = {
					key: cacheKey,
					value: result,
					timestamp: Date.now(),
				};
			}
			setData(result);
		} catch (err) {
			setError(err instanceof Error ? err.message : "データ取得に失敗しました");
			setData([]);
		} finally {
			setLoading(false);
		}
	}, [table, select, order, eq, transform, cache, retryCount]);

	useEffect(() => {
		fetchData();
		return () => {
			if (abortControllerRef.current) {
				abortControllerRef.current.abort();
			}
		};
	}, [fetchData]);

	const refetch = useCallback(() => {
		setRetryCount((c) => c + 1);
	}, []);

	return { data, loading, error, refetch };
}
