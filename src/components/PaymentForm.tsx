import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import styled from "styled-components";
import { PRICING_PLANS } from "../lib/stripe";
import type { PricingPlan } from "../lib/stripe";

const stripePromise = loadStripe(
	import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "pk_test_dummy"
);

const PaymentContainer = styled.div`
	max-width: 500px;
	margin: 2rem auto;
	padding: 2rem;
	background: rgba(255, 255, 255, 0.95);
	border-radius: 12px;
	box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
	backdrop-filter: blur(10px);
`;

const PlanCard = styled.div<{ selected: boolean }>`
	padding: 1.5rem;
	border: 2px solid ${({ selected }) => (selected ? "#007bff" : "#e0e0e0")};
	border-radius: 8px;
	margin-bottom: 1rem;
	cursor: pointer;
	transition: all 0.3s ease;
	background: ${({ selected }) => (selected ? "#f0f8ff" : "#fff")};

	&:hover {
		border-color: #007bff;
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 123, 255, 0.15);
	}
`;

const PlanTitle = styled.h3`
	margin: 0 0 0.5rem 0;
	color: #333;
	font-size: 1.2rem;
`;

const PlanPrice = styled.div`
	font-size: 1.8rem;
	font-weight: bold;
	color: #007bff;
	margin-bottom: 1rem;
`;

const FeatureList = styled.ul`
	list-style: none;
	padding: 0;
	margin: 0;
`;

const FeatureItem = styled.li`
	padding: 0.25rem 0;
	color: #666;

	&:before {
		content: "✓";
		color: #28a745;
		font-weight: bold;
		margin-right: 0.5rem;
	}
`;

const PaymentButton = styled.button<{ disabled: boolean }>`
	width: 100%;
	padding: 1rem;
	background: ${({ disabled }) => (disabled ? "#ccc" : "#007bff")};
	color: white;
	border: none;
	border-radius: 6px;
	font-size: 1.1rem;
	font-weight: 600;
	cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
	transition: background 0.3s ease;

	&:hover {
		background: ${({ disabled }) => (disabled ? "#ccc" : "#0056b3")};
	}
`;

const ErrorMessage = styled.div`
	color: #dc3545;
	padding: 1rem;
	background: #f8d7da;
	border: 1px solid #f5c6cb;
	border-radius: 4px;
	margin: 1rem 0;
`;

const SuccessMessage = styled.div`
	color: #155724;
	padding: 1rem;
	background: #d4edda;
	border: 1px solid #c3e6cb;
	border-radius: 4px;
	margin: 1rem 0;
`;

interface PaymentResult {
	paymentIntent: {
		id: string;
		status: string;
		amount: number;
		currency: string;
		client_secret?: string;
	};
}

interface PaymentFormProps {
	onPaymentSuccess?: (result: PaymentResult) => void;
	onPaymentError?: (error: string) => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
	onPaymentSuccess,
	onPaymentError,
}) => {
	const [selectedPlan, setSelectedPlan] = useState<PricingPlan>("basic");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);

	const handlePayment = async () => {
		try {
			setLoading(true);
			setError(null);
			setSuccess(null);

			const stripe = await stripePromise;
			if (!stripe) {
				throw new Error("Stripeの読み込みに失敗しました");
			}

			const plan = PRICING_PLANS[selectedPlan];

			// 実際の決済処理では、バックエンドAPIに決済インテントを作成するリクエストを送信
			// ここではデモ用のモック処理

			// PaymentIntentの作成をシミュレート
			const mockPaymentIntent = {
				id: `pi_demo_${Date.now()}`,
				client_secret: "pi_demo_secret",
				status: "requires_payment_method",
				amount: plan.price,
				currency: plan.currency,
			};

			console.log("決済インテント作成:", mockPaymentIntent);

			// Stripeチェックアウトのシミュレート
			const mockResult = {
				paymentIntent: {
					...mockPaymentIntent,
					status: "succeeded",
				},
			};

			// 成功処理
			setSuccess(
				`${
					plan.name
				}プランの決済が完了しました！金額: ¥${plan.price.toLocaleString()}`
			);

			if (onPaymentSuccess) {
				onPaymentSuccess(mockResult);
			}

			// Supabaseに決済記録を保存する処理もここに追加可能
			console.log("決済成功:", mockResult);
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : "決済処理中にエラーが発生しました";
			setError(errorMessage);

			if (onPaymentError) {
				onPaymentError(errorMessage);
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<PaymentContainer>
			<h2 style={{ textAlign: "center", marginBottom: "2rem", color: "#333" }}>
				プラン選択・決済
			</h2>

			{Object.entries(PRICING_PLANS).map(([key, plan]) => (
				<PlanCard
					key={key}
					selected={selectedPlan === key}
					onClick={() => setSelectedPlan(key as PricingPlan)}
				>
					<PlanTitle>{plan.name}</PlanTitle>
					<PlanPrice>¥{plan.price.toLocaleString()}/月</PlanPrice>
					<FeatureList>
						{plan.features.map((feature) => (
							<FeatureItem key={feature}>{feature}</FeatureItem>
						))}
					</FeatureList>
				</PlanCard>
			))}

			{error && <ErrorMessage>{error}</ErrorMessage>}
			{success && <SuccessMessage>{success}</SuccessMessage>}

			<PaymentButton disabled={loading} onClick={handlePayment}>
				{loading
					? "処理中..."
					: `${PRICING_PLANS[selectedPlan].name}プランで決済する`}
			</PaymentButton>

			<div
				style={{
					marginTop: "1rem",
					fontSize: "0.9rem",
					color: "#666",
					textAlign: "center",
				}}
			>
				※ これはデモ画面です。実際の決済は行われません。
			</div>
		</PaymentContainer>
	);
};

export default PaymentForm;
