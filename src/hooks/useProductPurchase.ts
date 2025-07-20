import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export const useProductPurchase = (
	productId: string,
	userId: string | undefined
) => {
	const [hasPurchased, setHasPurchased] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const checkPurchaseStatus = async () => {
			if (!userId || !productId) {
				setHasPurchased(false);
				setIsLoading(false);
				return;
			}

			try {
				// まず、データベースの購入履歴をチェック
				const { data: dbPurchases, error: dbError } = await supabase
					.from("product_purchases")
					.select("id")
					.eq("user_id", userId)
					.eq("product_id", productId)
					.maybeSingle();

				if (dbError && dbError.code !== "PGRST116") {
					console.error("Database purchase check error:", dbError);
				}

				// データベースに購入履歴がある場合
				if (dbPurchases) {
					setHasPurchased(true);
					setIsLoading(false);
					return;
				}

				// データベースにない場合は、ローカルストレージもチェック
				const localPurchases = JSON.parse(
					localStorage.getItem("product-purchases") || "[]"
				);

				const hasLocalPurchase = localPurchases.some(
					(purchase: { productId: string; success: boolean }) =>
						purchase.productId === productId && purchase.success === true
				);

				setHasPurchased(hasLocalPurchase);
			} catch (error) {
				console.error("Purchase status check error:", error);
				setHasPurchased(false);
			} finally {
				setIsLoading(false);
			}
		};

		checkPurchaseStatus();
	}, [productId, userId]);

	return { hasPurchased, isLoading };
};
