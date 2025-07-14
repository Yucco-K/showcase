export interface PaymentResult {
	paymentIntent: {
		id: string;
		status: string;
		amount: number;
		currency: string;
		client_secret?: string;
	};
}

export interface PaymentFormProps {
	onPaymentSuccess?: (result: PaymentResult) => void;
	onPaymentError?: (error: string) => void;
}

export interface PricingPlanData {
	name: string;
	price: number;
	currency: string;
	features: readonly string[];
}

export interface PaymentState {
	loading: boolean;
	error: string | null;
	success: string | null;
}

export interface MockPaymentIntent {
	id: string;
	client_secret: string;
	status: string;
	amount: number;
	currency: string;
}

export interface SubscriptionData {
	id: string;
	status: string;
	plan: string;
	current_period_start: string;
	current_period_end: string;
}
