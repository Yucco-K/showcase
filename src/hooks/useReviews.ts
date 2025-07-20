import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import type { Review } from "../types/review";

export const useReviews = (productId: string, userId?: string) => {
	const [reviews, setReviews] = useState<Review[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchReviews = useCallback(async () => {
		setLoading(true);
		const { data, error } = await supabase
			.from("product_reviews")
			.select("*")
			.eq("product_id", productId)
			.order("created_at", { ascending: false });
		if (error) {
			setError(error.message);
		} else {
			setReviews(data as Review[]);
			setError(null);
		}
		setLoading(false);
	}, [productId]);

	useEffect(() => {
		fetchReviews();
	}, [fetchReviews]);

	// Add or update review (unique constraint ensures 1 per user)
	const upsertReview = async (rating: number, comment: string | null) => {
		if (!userId) return { error: "user not logged in" };

		const payload = {
			product_id: productId,
			user_id: userId,
			rating,
			comment,
		};

		console.log("Upsert payload:", payload);

		const { error } = await supabase.from("product_reviews").upsert(payload, {
			onConflict: "product_id, user_id",
		});

		console.log("Supabase upsert result:", { error });

		if (!error) await fetchReviews();
		return { error };
	};

	const deleteOwnReview = async () => {
		if (!userId) return { error: "user not logged in" };
		const { error } = await supabase
			.from("product_reviews")
			.delete()
			.match({ product_id: productId, user_id: userId });
		if (!error) await fetchReviews();
		return { error };
	};

	const myReview = reviews.find((r) => r.user_id === userId);

	return {
		reviews,
		loading,
		error,
		refresh: fetchReviews,
		upsertReview,
		deleteOwnReview,
		myReview,
	};
};
