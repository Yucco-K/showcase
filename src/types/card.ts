export interface CreditCard {
	id?: string;
	number: string;
	expiryMonth: string;
	expiryYear: string;
	cvc: string;
	holderName: string;
	brand?: CardBrand;
	last4?: string;
	isDefault?: boolean;
	nickname?: string;
}

export enum CardBrand {
	VISA = "visa",
	MASTERCARD = "mastercard",
	AMEX = "amex",
	JCB = "jcb",
	DISCOVER = "discover",
	DINERS = "diners",
	UNKNOWN = "unknown",
}

export interface CardValidation {
	isValid: boolean;
	errors: {
		number?: string;
		expiryMonth?: string;
		expiryYear?: string;
		cvc?: string;
		holderName?: string;
	};
}

export interface PaymentMethod {
	id: string;
	type: "card";
	card: {
		brand: CardBrand;
		last4: string;
		expMonth: number;
		expYear: number;
	};
	billingDetails: {
		name: string;
		email?: string;
		address?: {
			line1?: string;
			line2?: string;
			city?: string;
			state?: string;
			postalCode?: string;
			country?: string;
		};
	};
	isDefault: boolean;
	createdAt: string;
}

export interface PaymentIntent {
	id: string;
	amount: number;
	currency: string;
	status:
		| "requires_payment_method"
		| "requires_confirmation"
		| "processing"
		| "succeeded"
		| "canceled";
	clientSecret: string;
	metadata?: {
		productId?: string;
		productName?: string;
		userId?: string;
	};
}

export interface PaymentFlow {
	step: "input" | "confirm" | "processing" | "success" | "error";
	paymentIntent?: PaymentIntent;
	selectedCard?: CreditCard;
	error?: string;
	successMessage?: string;
}

export interface BillingAddress {
	line1: string;
	line2?: string;
	city: string;
	state: string;
	postalCode: string;
	country: string;
}
