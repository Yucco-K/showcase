import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import type { Review } from "../types/review";

interface ProfileBrief {
	id: string;
	full_name: string | null;
	avatar_url: string | null;
	role?: string | null;
}

export const useReviews = (productId: string, userId?: string) => {
	const [reviews, setReviews] = useState<Review[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchReviews = useCallback(async () => {
		setLoading(true);
		console.log("fetchReviews called for productId:", productId);
		const { data, error } = await supabase
			.from("product_reviews")
			.select("*")
			.eq("product_id", productId)
			.order("created_at", { ascending: false });

		console.log("fetchReviews result:", {
			dataCount: data?.length,
			error,
			errorMessage: error?.message,
		});

		if (error) {
			setError(error.message);
		} else {
			const reviewsData = data as unknown as Review[];

			// ユーザー情報を取得
			const userIds = [...new Set(reviewsData.map((r) => r.user_id))];
			const { data: profilesData } = await supabase
				.from("profiles")
				.select("id, full_name, avatar_url, role")
				.in("id", userIds);

			// Map profiles by id
			const profilesMap = new Map<string, ProfileBrief>();
			(profilesData as ProfileBrief[] | null)?.forEach((p) =>
				profilesMap.set(p.id, p)
			);

			const reviewsWithProfiles: Review[] = reviewsData.map((rev) => ({
				...rev,
				profiles: profilesMap.get(rev.user_id) ?? null,
			}));

			// 階層構造に変換（ネストした返信対応）
			const topLevelReviews = reviewsWithProfiles.filter((r) => !r.parent_id);
			const allReplies = reviewsWithProfiles.filter((r) => r.parent_id);

			console.log("Processed reviews:", {
				totalReviews: reviewsData.length,
				topLevelReviews: topLevelReviews.length,
				replies: allReplies.length,
			});

			// 階層構造を構築する関数
			const buildReplyTree = (
				parentId: string,
				level: number = 0
			): Review[] => {
				return allReplies
					.filter((reply) => reply.parent_id === parentId)
					.map((reply) => ({
						...reply,
						replies: buildReplyTree(reply.id, level + 1),
					}))
					.sort(
						(a, b) =>
							new Date(a.created_at).getTime() -
							new Date(b.created_at).getTime()
					);
			};

			// 各レビューに返信ツリーを追加
			const reviewsWithReplies = topLevelReviews.map((review) => ({
				...review,
				replies: buildReplyTree(review.id),
			}));

			setReviews(reviewsWithReplies);
			setError(null);
		}
		setLoading(false);
	}, [productId]);

	useEffect(() => {
		fetchReviews();
	}, [fetchReviews]);

	// Add new review (for first-time reviews)
	const addReview = async (rating: number, comment: string | null) => {
		if (!userId) return { error: "user not logged in" };

		const payload = {
			product_id: productId,
			user_id: userId,
			rating,
			comment,
		};

		console.log("Add review payload:", payload);

		const { error } = await supabase.from("product_reviews").insert(payload);

		console.log("Supabase add review result:", { error });

		if (!error) await fetchReviews();
		return { error };
	};

	// Update existing review
	const updateReview = async (rating: number, comment: string | null) => {
		if (!userId) return { error: "user not logged in" };

		const payload = {
			rating,
			comment,
		};

		console.log("Update review payload:", payload);

		const { error } = await supabase
			.from("product_reviews")
			.update(payload)
			.match({ product_id: productId, user_id: userId })
			.is("parent_id", null); // 返信ではないレビューのみを更新

		console.log("Supabase update review result:", { error });

		if (!error) await fetchReviews();
		return { error };
	};

	// Legacy function for backward compatibility
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

	// Add reply to a review or another reply
	const addReply = async (parentId: string, comment: string) => {
		console.log("addReply called with:", {
			parentId,
			comment,
			userId,
			productId,
		});

		if (!userId) return { error: "user not logged in" };

		// 親の階層レベルを取得
		const { data: parentData } = await supabase
			.from("product_reviews")
			.select("reply_level")
			.eq("id", parentId)
			.single();

		const parentLevel = (parentData?.reply_level as number) || 0;
		const newLevel = parentLevel + 1;

		// 最大階層数を制限（3階層まで）
		if (newLevel > 3) {
			return { error: "返信の階層が深すぎます（3階層まで）" };
		}

		const payload: {
			product_id: string;
			user_id: string;
			comment: string;
			parent_id: string;
			reply_level: number;
			rating?: number;
		} = {
			product_id: productId,
			user_id: userId,
			comment,
			parent_id: parentId,
			reply_level: newLevel,
		};

		// 通常レビューのみ rating を含める（返信では含めない）
		if (!parentId) {
			payload.rating = 3; // デフォルト値
		}

		console.log("addReply payload:", payload);

		const { data, error } = await supabase
			.from("product_reviews")
			.insert(payload)
			.select();

		console.log("addReply result:", {
			data,
			error,
			errorMessage: error?.message,
		});

		if (!error) {
			console.log("Reply added successfully, refreshing reviews...");
			await fetchReviews();
		} else {
			console.log("Reply addition failed");
		}

		return { error };
	};

	const updateReply = async (replyId: string, comment: string) => {
		if (!userId) return { error: "user not logged in" };
		const { error } = await supabase
			.from("product_reviews")
			.update({ comment })
			.eq("id", replyId);
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

	const deleteReview = async (reviewId: string) => {
		console.log("deleteReview called with reviewId:", reviewId);

		// 現在のユーザー情報を確認
		const {
			data: { user },
		} = await supabase.auth.getUser();
		console.log("Current user:", {
			id: user?.id,
			email: user?.email,
			role: user?.user_metadata?.role,
		});

		// 削除前のレビューを確認
		const { data: beforeDelete } = await supabase
			.from("product_reviews")
			.select("*")
			.eq("id", reviewId);
		console.log("Review before deletion:", beforeDelete);

		const { data, error } = await supabase
			.from("product_reviews")
			.delete()
			.eq("id", reviewId)
			.select();
		console.log("deleteReview result:", {
			data,
			dataLength: data?.length,
			error,
			errorMessage: error?.message,
			errorCode: error?.code,
		});

		// 削除されたデータの詳細を確認
		if (data && data.length > 0) {
			console.log("Deleted review details:", data[0]);
		} else {
			console.log("No data returned from delete operation");
		}

		// 削除後のレビューを確認
		const { data: afterDelete } = await supabase
			.from("product_reviews")
			.select("*")
			.eq("id", reviewId);
		console.log("Review after deletion:", afterDelete);

		if (!error) {
			console.log("Deletion successful, refreshing reviews...");
			await fetchReviews();
		} else {
			console.log("Deletion failed, not refreshing reviews");
		}
		return { error };
	};

	const myReview = reviews.find((r) => r.user_id === userId);

	return {
		reviews,
		loading,
		error,
		refresh: fetchReviews,
		upsertReview,
		addReview,
		updateReview,
		addReply,
		updateReply,
		deleteOwnReview,
		deleteReview,
		myReview,
	};
};
