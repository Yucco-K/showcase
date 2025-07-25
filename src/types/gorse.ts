/**
 * Gorse API関連の型定義
 */

// フィードバックアイテムの型
export interface GorseFeedbackItem {
	FeedbackType: string;
	ItemId: string;
	UserId?: string;
	Timestamp?: string;
}

// Gorse APIの応答形式（配列または包含オブジェクト）
export interface GorseFeedbackResponse {
	Feedback?: GorseFeedbackItem[];
	feedback?: GorseFeedbackItem[];
}

// ユーザー情報の型
export interface GorseUser {
	UserId: string;
	Labels?: string[];
	Subscribe?: string[];
	Comment?: string;
}

// アイテム情報の型
export interface GorseItem {
	ItemId: string;
	Categories?: string[];
	Labels?: string[];
	Comment?: string;
	Timestamp?: string;
}

// 推薦結果の型
export interface GorseRecommendation {
	ItemId?: string;
	Id?: string; // 別名の場合
	Score: number;
}

// 類似アイテムの応答型
export interface GorseNeighborResponse {
	Id: string;
	Score: number;
}
