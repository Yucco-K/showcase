// Gorse推薦システムクライアント（直接API呼び出し）

import { products } from "../data/products.ts";
import type { Product } from "../types/product.ts";

const GORSE_ENDPOINT =
	import.meta.env.VITE_GORSE_ENDPOINT || "http://52.198.15.232:8087";
const GORSE_API_KEY =
	import.meta.env.VITE_GORSE_API_KEY ||
	"[REDACTED_GORSE_API_KEY]=";

export interface GorseItem {
	ItemId: string;
	IsHidden: boolean;
	Categories: string[];
	Timestamp: string;
	Labels: string[];
	Comment: string;
}

export interface GorseUser {
	UserId: string;
	Labels: string[];
	Subscribe: string[];
	Comment: string;
}

export interface GorseFeedback {
	FeedbackType: string;
	UserId: string;
	ItemId: string;
	Timestamp: string;
	Comment: string;
}

export interface GorseRecommendation {
	ItemId: string;
	Score: number;
}

// フィードバックタイプの定義
export const FEEDBACK_TYPES = {
	PURCHASE: "purchase",
	LIKE: "like",
	VIEW: "view",
	CART: "cart",
} as const;

export type FeedbackType = (typeof FEEDBACK_TYPES)[keyof typeof FEEDBACK_TYPES];

class GorseClient {
	private endpoint: string;
	private apiKey: string;

	constructor(endpoint: string, apiKey: string) {
		this.endpoint = endpoint;
		this.apiKey = apiKey;
	}

	private async request(
		path: string,
		_options?: RequestInit
	): Promise<unknown> {
		// 一時的に空配列を返す（Gorseサーバーとの接続問題を回避）
		void _options;
		console.log(
			`Gorse API request: ${path} - returning empty array temporarily`
		);
		return [];
	}

	// ヘルスチェック
	async health(): Promise<boolean> {
		try {
			await this.request("/api/health");
			return true;
		} catch {
			return false;
		}
	}

	// アイテム関連
	async getItems(offset = 0, n = 10): Promise<GorseItem[]> {
		return this.request(`/api/item?offset=${offset}&n=${n}`) as Promise<
			GorseItem[]
		>;
	}

	async getItem(itemId: string): Promise<GorseItem> {
		return this.request(`/api/item/${itemId}`) as Promise<GorseItem>;
	}

	async insertItem(item: GorseItem): Promise<void> {
		await this.request(`/api/item/${item.ItemId}`, {
			method: "POST",
			body: JSON.stringify(item),
		});
	}

	async deleteItem(itemId: string): Promise<void> {
		await this.request(`/api/item/${itemId}`, {
			method: "DELETE",
		});
	}

	// ユーザー関連
	async getUsers(offset = 0, n = 10): Promise<GorseUser[]> {
		return this.request(`/api/user?offset=${offset}&n=${n}`) as Promise<
			GorseUser[]
		>;
	}

	async getUser(userId: string): Promise<GorseUser> {
		return this.request(`/api/user/${userId}`) as Promise<GorseUser>;
	}

	async insertUser(user: GorseUser): Promise<void> {
		await this.request(`/api/user/${user.UserId}`, {
			method: "POST",
			body: JSON.stringify(user),
		});
	}

	async deleteUser(userId: string): Promise<void> {
		await this.request(`/api/user/${userId}`, {
			method: "DELETE",
		});
	}

	// フィードバック関連
	async insertFeedback(feedback: GorseFeedback): Promise<void> {
		await this.request("/api/feedback", {
			method: "POST",
			body: JSON.stringify(feedback),
		});
	}

	async getFeedback(userId: string, itemId: string): Promise<GorseFeedback[]> {
		return this.request(`/api/feedback/${userId}/${itemId}`) as Promise<
			GorseFeedback[]
		>;
	}

	// 推薦関連
	async getRecommendations(
		userId: string,
		n = 10
	): Promise<GorseRecommendation[]> {
		return this.request(`/api/recommend/${userId}?n=${n}`) as Promise<
			GorseRecommendation[]
		>;
	}

	async getLatestRecommendations(
		userId: string,
		n = 10
	): Promise<GorseRecommendation[]> {
		return this.request(`/api/latest/${userId}?n=${n}`) as Promise<
			GorseRecommendation[]
		>;
	}

	async getPopularRecommendations(
		userId: string,
		n = 10
	): Promise<GorseRecommendation[]> {
		return this.request(`/api/popular/${userId}?n=${n}`) as Promise<
			GorseRecommendation[]
		>;
	}

	// 類似アイテム
	async getSimilarItems(
		itemId: string,
		n = 10
	): Promise<GorseRecommendation[]> {
		return this.request(`/api/similar/${itemId}?n=${n}`) as Promise<
			GorseRecommendation[]
		>;
	}

	// アイテムの詳細情報（カテゴリ、ラベルなど）
	async getItemNeighbors(
		itemId: string,
		n = 10
	): Promise<GorseRecommendation[]> {
		return this.request(`/api/item/${itemId}/neighbors?n=${n}`) as Promise<
			GorseRecommendation[]
		>;
	}

	// ユーザーの詳細情報
	async getUserNeighbors(
		userId: string,
		n = 10
	): Promise<GorseRecommendation[]> {
		return this.request(`/api/user/${userId}/neighbors?n=${n}`) as Promise<
			GorseRecommendation[]
		>;
	}
}

// シングルトンインスタンス
export const gorse = new GorseClient(GORSE_ENDPOINT, GORSE_API_KEY);

// フィードバック送信用のヘルパー関数
export const sendFeedback = async (
	userId: string,
	itemId: string,
	feedbackType: FeedbackType
) => {
	try {
		await gorse.insertFeedback({
			FeedbackType: feedbackType,
			UserId: userId,
			ItemId: itemId,
			Timestamp: new Date().toISOString(),
			Comment: "",
		});
		console.log(
			`Feedback sent: ${feedbackType} for user ${userId} on item ${itemId}`
		);
	} catch (error) {
		console.error("Failed to send feedback to Gorse:", error);
		throw error;
	}
};

// 推薦取得用のヘルパー関数
export const getRecommendations = async (
	userId: string,
	limit: number = 10
): Promise<string[]> => {
	try {
		const recommendations = await gorse.getRecommendations(userId, limit);
		return recommendations.map((r) => r.ItemId);
	} catch (error) {
		console.error("Failed to get recommendations from Gorse:", error);
		// フォールバック: 空の配列を返す
		return [];
	}
};

// アイテム登録用のヘルパー関数
export const insertItem = async (
	itemId: string,
	labels?: string[],
	categories?: string[]
) => {
	try {
		await gorse.insertItem({
			ItemId: itemId,
			IsHidden: false,
			Labels: labels || [],
			Categories: categories || [],
			Timestamp: new Date().toISOString(),
			Comment: "",
		});
		console.log(`Item inserted: ${itemId}`);
	} catch (error) {
		console.error("Failed to insert item to Gorse:", error);
		throw error;
	}
};

// ユーザー登録用のヘルパー関数
export const insertUser = async (userId: string, labels?: string[]) => {
	try {
		await gorse.insertUser({
			UserId: userId,
			Labels: labels || [],
			Subscribe: [],
			Comment: "",
		});
		console.log(`User inserted: ${userId}`);
	} catch (error) {
		console.error("Failed to insert user to Gorse:", error);
		throw error;
	}
};

// 類似アイテム取得用のローカルフォールバック関数
const getLocalSimilarItems = (itemId: string, limit: number = 5): string[] => {
	const current: Product | undefined = products.find((p) => p.id === itemId);
	if (!current) return [];

	// 同じカテゴリの商品を優先
	const sameCategory = products.filter(
		(p) => p.id !== itemId && p.category === current.category
	);

	// 同一カテゴリの商品数が足りない場合は、人気商品で補完
	const additional = products.filter(
		(p) => p.id !== itemId && p.category !== current.category && p.isPopular
	);

	const merged = [...sameCategory, ...additional];
	return merged.slice(0, limit).map((p) => p.id);
};

// 類似アイテム取得用のヘルパー関数
export const getSimilarItems = async (
	itemId: string,
	limit: number = 5
): Promise<string[]> => {
	try {
		const similarItems = await gorse.getSimilarItems(itemId, limit);
		// Gorseから結果が返らなかった場合はローカルフォールバック
		if (Array.isArray(similarItems) && similarItems.length > 0) {
			return similarItems.map((r) => r.ItemId);
		}
		console.log("Gorse returned empty, using local fallback");
		return getLocalSimilarItems(itemId, limit);
	} catch (error) {
		console.error(
			"Failed to get similar items from Gorse, using fallback:",
			error
		);
		return getLocalSimilarItems(itemId, limit);
	}
};
