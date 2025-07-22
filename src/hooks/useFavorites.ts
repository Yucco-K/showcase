import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export function useFavorites(userId?: string) {
	const [favorites, setFavorites] = useState<string[]>([]);

	useEffect(() => {
		if (!userId) {
			setFavorites([]);
			return;
		}
		let isMounted = true;
		(async () => {
			const { data, error } = await supabase
				.from("product_likes")
				.select("product_id")
				.eq("user_id", userId);
			if (error) {
				console.error("Failed to fetch user likes", error);
				return;
			}
			if (isMounted && data) {
				setFavorites(data.map((row) => row.product_id as string));
			}
		})();
		return () => {
			isMounted = false;
		};
	}, [userId]);

	// お気に入り追加/削除
	const toggleFavorite = async (productId: string) => {
		if (!userId) {
			console.warn("Like requires login");
			return;
		}
		const isLiked = favorites.includes(productId);
		if (isLiked) {
			const { error } = await supabase
				.from("product_likes")
				.delete()
				.eq("product_id", productId)
				.eq("user_id", userId);
			if (error) {
				console.error("Failed to unlike", error);
				return;
			}
			setFavorites((prev) => prev.filter((id) => id !== productId));
		} else {
			const { error } = await supabase.from("product_likes").insert({
				product_id: productId,
				user_id: userId,
			});
			if (error) {
				console.error("Failed to like", error);
				return;
			}
			setFavorites((prev) => [...prev, productId]);
		}
	};

	const isFavorite = (productId: string) => favorites.includes(productId);

	return { favorites, toggleFavorite, isFavorite };
}
