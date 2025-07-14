import React, { useState } from "react";
import styled from "styled-components";
import { PRICING_PLANS } from "../lib/stripe";
import type { PricingPlan } from "../lib/stripe";
import type { PaymentFormProps } from "../types/payment";
import { useStripePayment } from "../hooks/useStripePayment";
import PricingPlanCard from "./payment/PricingPlan";
import PaymentButton from "./payment/PaymentButton";
import ErrorMessage from "./ui/ErrorMessage";
import SuccessMessage from "./ui/SuccessMessage";

const PaymentContainer = styled.div`
	max-width: 500px;
	margin: 2rem auto;
	padding: 2rem;
	background: rgba(255, 255, 255, 0.95);
	border-radius: 12px;
	box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
	backdrop-filter: blur(10px);
`;

const PaymentTitle = styled.h2`
	text-align: center;
	margin-bottom: 2rem;
	color: #333;
`;

const PaymentForm: React.FC<PaymentFormProps> = ({
	onPaymentSuccess,
	onPaymentError,
}) => {
	const [selectedPlan, setSelectedPlan] = useState<PricingPlan>("basic");
	const { paymentState, processPayment } = useStripePayment();

	const handlePayment = async () => {
		try {
			await processPayment(selectedPlan, onPaymentSuccess, onPaymentError);
		} catch (error) {
			// エラーは useStripePayment フック内で処理済み
			console.error("Payment processing failed:", error);
		}
	};

	const handlePlanSelect = (planKey: string) => {
		setSelectedPlan(planKey as PricingPlan);
	};

	return (
		<PaymentContainer>
			<PaymentTitle>プラン選択・決済</PaymentTitle>

			{Object.entries(PRICING_PLANS).map(([key, plan]) => (
				<PricingPlanCard
					key={key}
					planKey={key}
					plan={plan}
					selected={selectedPlan === key}
					onSelect={handlePlanSelect}
				/>
			))}

			{paymentState.error && <ErrorMessage message={paymentState.error} />}
			{paymentState.success && (
				<SuccessMessage message={paymentState.success} />
			)}

			<PaymentButton
				loading={paymentState.loading}
				planName={PRICING_PLANS[selectedPlan].name}
				onClick={handlePayment}
			/>
		</PaymentContainer>
	);
};

export default PaymentForm;
