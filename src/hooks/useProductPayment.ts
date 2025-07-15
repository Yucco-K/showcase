import { useState } from "react";

interface ProductPaymentResult {
	success: boolean;
	message: string;
	paymentId?: string;
	amount?: number;
	productId?: string;
	error?: string;
}

interface ProductPaymentData {
	productId: string;
	productName: string;
	amount: number;
	currency?: string;
}

interface PaymentState {
	isProcessing: boolean;
	error: string | null;
	success: boolean;
}

export const useProductPayment = () => {
	const [paymentState, setPaymentState] = useState<PaymentState>({
		isProcessing: false,
		error: null,
		success: false,
	});

	const processProductPayment = async (
		paymentData: ProductPaymentData
	): Promise<ProductPaymentResult> => {
		setPaymentState({
			isProcessing: true,
			error: null,
			success: false,
		});

		try {
			// 実際のStripe決済処理をシミュレート
			await new Promise((resolve) => setTimeout(resolve, 2000));

			// ランダムに成功/失敗を決定（実際の実装では本物のStripe APIを使用）
			const isSuccess = Math.random() > 0.2; // 80%の確率で成功

			if (isSuccess) {
				const result: ProductPaymentResult = {
					success: true,
					message: `${paymentData.productName}の購入が完了しました！`,
					paymentId: `pi_${Date.now()}_${Math.random()
						.toString(36)
						.substr(2, 9)}`,
					amount: paymentData.amount,
					productId: paymentData.productId,
				};

				setPaymentState({
					isProcessing: false,
					error: null,
					success: true,
				});

				// 購入履歴をローカルストレージに保存
				const purchases = JSON.parse(
					localStorage.getItem("product-purchases") || "[]"
				);
				purchases.push({
					...result,
					purchaseDate: new Date().toISOString(),
				});
				localStorage.setItem("product-purchases", JSON.stringify(purchases));

				return result;
			} else {
				throw new Error("決済処理中にエラーが発生しました");
			}
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "決済に失敗しました";

			setPaymentState({
				isProcessing: false,
				error: errorMessage,
				success: false,
			});

			return {
				success: false,
				message: errorMessage,
				error: errorMessage,
			};
		}
	};

	const resetPaymentState = () => {
		setPaymentState({
			isProcessing: false,
			error: null,
			success: false,
		});
	};

	const getPurchaseHistory = () => {
		return JSON.parse(localStorage.getItem("product-purchases") || "[]");
	};

	const isPurchased = (productId: string): boolean => {
		const purchases = getPurchaseHistory();
		return purchases.some((purchase: any) => purchase.productId === productId);
	};

	return {
		...paymentState,
		processProductPayment,
		resetPaymentState,
		getPurchaseHistory,
		isPurchased,
	};
};
