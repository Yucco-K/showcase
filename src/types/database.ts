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

// お問い合わせカテゴリ
export type ContactCategory =
	| "urgent" // 緊急
	| "account_delete" // 退会申請
	| "feature_request" // 機能追加の提案
	| "account_related" // アカウント関連
	| "billing" // 支払いや請求
	| "support" // サポート依頼
	| "other"; // その他

// お問い合わせ
export interface Contact {
	id: string;
	name: string;
	email: string;
	title?: string;
	message: string;
	category: ContactCategory;
	created_at: string;
	// 管理用フィールド
	is_checked?: boolean;
	is_replied?: boolean;
	status?: "pending" | "in_progress" | "completed" | "closed";
	admin_notes?: string | null;
	replied_at?: string | null;
	checked_at?: string | null;
	checked_by?: string | null;
	replied_by?: string | null;
	// ピン留め関連フィールド
	is_pinned?: boolean;
	pinned_at?: string | null;
	pinned_by?: string | null;
}
