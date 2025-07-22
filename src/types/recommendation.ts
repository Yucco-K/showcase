// 推薦システム関連の型定義

// フィードバックタイプ
export type FeedbackType = "purchase" | "like" | "view" | "cart";

// 推薦アイテム
export interface RecommendationItem {
	id: string;
	score?: number;
	reason?: string;
}

// 推薦結果
export interface RecommendationResult {
	userId: string;
	items: RecommendationItem[];
	timestamp: string;
	algorithm?: string;
}

// Gorseアイテム
export interface GorseItem {
	ItemId: string;
	IsHidden: boolean;
	Labels: string[];
	Categories: string[];
	Timestamp: string;
	Comment?: string;
}

// Gorseユーザー
export interface GorseUser {
	UserId: string;
	Labels: string[];
	Comment?: string;
}

// Gorseフィードバック
export interface GorseFeedback {
	FeedbackType: FeedbackType;
	UserId: string;
	ItemId: string;
	Timestamp: string;
	Comment?: string;
}

// 推薦設定
export interface RecommendationConfig {
	maxItems: number;
	includeCategories?: string[];
	excludeCategories?: string[];
	minScore?: number;
}

// 推薦統計
export interface RecommendationStats {
	totalRecommendations: number;
	clickThroughRate: number;
	conversionRate: number;
	lastUpdated: string;
}

// フィードバック統計
export interface FeedbackStats {
	totalFeedbacks: number;
	feedbacksByType: Record<FeedbackType, number>;
	uniqueUsers: number;
	uniqueItems: number;
}
