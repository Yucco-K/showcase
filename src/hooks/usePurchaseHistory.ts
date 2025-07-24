import { useCallback } from "react";
import { supabase } from "../lib/supabase";
import type { Purchase } from "../types/purchase";

export function usePurchaseHistory() {
	// 購入履歴を取得
	const getPurchaseHistory = useCallback((): Purchase[] => {
		return JSON.parse(localStorage.getItem("product-purchases") || "[]");
	}, []);

	// Supabaseから全購入履歴を取得
	const getAllPurchaseHistory = useCallback(async (): Promise<Purchase[]> => {
		const { data, error } = await supabase.from("purchases").select("*");
		if (error) {
			console.error("Failed to fetch purchase history:", error);
			return [];
		}
		return (data || []).filter(
			(item): item is Purchase => typeof item.productId === "string"
		);
	}, []);

	// 購入履歴に追加
	const addPurchase = useCallback(
		(purchase: Purchase) => {
			const purchases = getPurchaseHistory();
			purchases.push({ ...purchase, purchaseDate: new Date().toISOString() });
			localStorage.setItem("product-purchases", JSON.stringify(purchases));
		},
		[getPurchaseHistory]
	);

	// 購入済み判定
	const isPurchased = useCallback(
		(productId: string): boolean => {
			const purchases = getPurchaseHistory();
			return purchases.some((purchase) => purchase.productId === productId);
		},
		[getPurchaseHistory]
	);

	// 履歴リセット
	const clearPurchaseHistory = useCallback(() => {
		localStorage.removeItem("product-purchases");
	}, []);

	return {
		getPurchaseHistory,
		getAllPurchaseHistory,
		addPurchase,
		isPurchased,
		clearPurchaseHistory,
	};
}
