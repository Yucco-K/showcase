import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { PRICING_PLANS } from "../lib/stripe";
import type { PricingPlan } from "../lib/stripe";
import type {
	PaymentState,
	PaymentResult,
	MockPaymentIntent,
} from "../types/payment";

const stripePromise = loadStripe(
	import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "pk_test_dummy"
);

export function useStripePayment() {
	const [paymentState, setPaymentState] = useState<PaymentState>({
		loading: false,
		error: null,
		success: null,
	});

	const processPayment = async (
		selectedPlan: PricingPlan,
		onSuccess?: (result: PaymentResult) => void,
		onError?: (error: string) => void
	) => {
		try {
			setPaymentState({
				loading: true,
				error: null,
				success: null,
			});

			const stripe = await stripePromise;
			if (!stripe) {
				throw new Error("Stripeの読み込みに失敗しました");
			}

			const plan = PRICING_PLANS[selectedPlan];

			// 実際の決済処理では、バックエンドAPIに決済インテントを作成するリクエストを送信
			// ここではデモ用のモック処理

			// PaymentIntentの作成をシミュレート
			const mockPaymentIntent: MockPaymentIntent = {
				id: `pi_demo_${Date.now()}`,
				client_secret: "pi_demo_secret",
				status: "requires_payment_method",
				amount: plan.price,
				currency: plan.currency,
			};

			console.log("決済インテント作成:", mockPaymentIntent);

			// Stripeチェックアウトのシミュレート
			const mockResult: PaymentResult = {
				paymentIntent: {
					...mockPaymentIntent,
					status: "succeeded",
				},
			};

			// 成功処理
			const successMessage = `${
				plan.name
			}プランの決済が完了しました！金額: ¥${plan.price.toLocaleString()}`;

			setPaymentState({
				loading: false,
				error: null,
				success: successMessage,
			});

			if (onSuccess) {
				onSuccess(mockResult);
			}

			// Supabaseに決済記録を保存する処理もここに追加可能
			console.log("決済成功:", mockResult);

			return mockResult;
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : "決済処理中にエラーが発生しました";

			setPaymentState({
				loading: false,
				error: errorMessage,
				success: null,
			});

			if (onError) {
				onError(errorMessage);
			}

			throw err;
		}
	};

	const resetPaymentState = () => {
		setPaymentState({
			loading: false,
			error: null,
			success: null,
		});
	};

	return {
		paymentState,
		processPayment,
		resetPaymentState,
	};
}
