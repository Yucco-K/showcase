export interface Profile {
	id: string;
	email: string;
	full_name?: string;
	avatar_url?: string;
	biography?: string;
	role: "user" | "admin" | "moderator";
	subscription_plan: string;
	stripe_customer_id?: string;
	created_at: string;
	updated_at: string;
}

export interface Project {
	id: string;
	title: string;
	description?: string;
	technologies: string[];
	github_url?: string;
	demo_url?: string;
	image_url?: string;
	featured: boolean;
	created_at: string;
	updated_at: string;
}

export interface Payment {
	id: string;
	user_id: string;
	stripe_payment_intent_id: string;
	amount: number;
	currency: string;
	plan_type: string;
	status: string;
	created_at: string;
}

export interface Subscription {
	id: string;
	user_id: string;
	stripe_subscription_id: string;
	plan_type: string;
	status: string;
	current_period_start: string;
	current_period_end: string;
	created_at: string;
	updated_at: string;
}
