import PaymentForm from "../components/PaymentForm";
import type { PaymentResult } from "../types/payment";

const Payment: React.FC = () => {
	const handlePaymentSuccess = (result: PaymentResult) => {
		console.log("決済成功:", result);
		// ここでSupabaseに決済記録を保存することも可能
	};

	const handlePaymentError = (error: string) => {
		console.error("決済エラー:", error);
	};

	return (
		<main
			style={{
				width: "100vw",
				minHeight: "100vh",
				padding: "2rem 1rem",
				background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
			}}
		>
			<PaymentForm
				onPaymentSuccess={handlePaymentSuccess}
				onPaymentError={handlePaymentError}
			/>
		</main>
	);
};

export default Payment;
