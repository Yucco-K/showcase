// Gorse推薦システムクライアント（直接API呼び出し）

import type { Product } from "../types/product.ts";

// APIエンドポイントのデバッグ情報を出力
// 注意: 本番環境ではhttps://forum.yu-cco.com/apiを使用
const GORSE_ENDPOINT =
	import.meta.env.VITE_GORSE_ENDPOINT || "http://18.183.44.71:8087";
const GORSE_API_KEY =
	import.meta.env.VITE_GORSE_API_KEY ||
	"kmKLLA5eCveQTVOVDftScxlWJaKmJJVbfSlPMZYSqno=";

console.log(`[Gorse] Using API endpoint: ${GORSE_ENDPOINT}`);
// APIキーはセキュリティ上の理由で完全には表示しない
console.log(
	`[Gorse] API key configured: ${GORSE_API_KEY ? "Yes (hidden)" : "No"}`
);

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
	ItemId?: string;
	Id?: string;
	Score: number;
}

// APIレスポンスの形式が異なる場合に対応するインターフェース
export interface GorseNeighborResponse {
	Id: string;
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

	private async request(path: string, options?: RequestInit): Promise<unknown> {
		const url = `${this.endpoint}${path}`;
		const controller = new AbortController();
		const timeout = 5000; // 5秒タイムアウト
		const timeoutId = setTimeout(() => controller.abort(), timeout);

		try {
			console.log(`[Gorse] Requesting: ${url}`, {
				method: options?.method || "GET",
				timestamp: new Date().toISOString(),
			});

			const startTime = performance.now();
			const response = await fetch(url, {
				...options,
				signal: controller.signal,
				headers: {
					"Content-Type": "application/json",
					"X-API-Key": this.apiKey,
					...options?.headers,
				},
				// CORSエラー対策
				mode: "cors",
				credentials: "same-origin",
			});
			const endTime = performance.now();

			console.log(
				`[Gorse] Response received in ${Math.round(endTime - startTime)}ms`,
				{
					status: response.status,
					url,
					timestamp: new Date().toISOString(),
				}
			);

			if (!response.ok) {
				const errorText = await response
					.text()
					.catch(() => "No error text available");
				throw new Error(
					`HTTP error! status: ${response.status}, url: ${url}, details: ${errorText}`
				);
			}

			const data = await response.json();
			return data;
		} catch (error) {
			if (error instanceof Error) {
				if (error.name === "AbortError") {
					console.error(`[Gorse] Request timeout after ${timeout}ms: ${url}`);
					throw new Error(`リクエストがタイムアウトしました（${timeout}ms）`);
				} else if (
					error.name === "TypeError" &&
					error.message.includes("Failed to fetch")
				) {
					console.error(
						`[Gorse] Network error - likely CORS or connectivity issue: ${url}`
					);
					throw new Error(
						`ネットワークエラー: APIサーバーに接続できません。CORSポリシーまたはサーバー接続の問題の可能性があります。`
					);
				}
				console.error(`[Gorse] Request failed: ${url}`, {
					error: error.message,
					name: error.name,
					stack: error.stack,
					timestamp: new Date().toISOString(),
				});
			}
			throw error;
		} finally {
			clearTimeout(timeoutId);
		}
	}

	private async retryRequest(
		path: string,
		options?: RequestInit,
		maxRetries: number = 3,
		delay: number = 1000
	): Promise<unknown> {
		let lastError: Error | undefined;

		for (let attempt = 1; attempt <= maxRetries; attempt++) {
			try {
				return await this.request(path, options);
			} catch (error) {
				lastError = error as Error;
				if (attempt < maxRetries) {
					console.log(
						`[Gorse] Retry attempt ${attempt}/${maxRetries} for ${path}`
					);
					await new Promise((resolve) => setTimeout(resolve, delay * attempt));
					continue;
				}
				break;
			}
		}

		throw lastError;
	}

	// ヘルスチェック
	async health(): Promise<boolean> {
		try {
			// 複数のパスを試す
			const paths = ["/health", "/api/health"];
			for (const path of paths) {
				try {
					await this.request(path);
					console.log(`[Gorse] Health check succeeded with ${path} path`);
					return true;
				} catch {
					console.log(`[Gorse] Health check failed with ${path} path`);
				}
			}
			// すべてのパスが失敗した場合
			console.error("[Gorse] All health check paths failed");
			return false;
		} catch (error) {
			console.error(
				"[Gorse] Health check failed:",
				error instanceof Error ? error.message : error
			);
			return false;
		}
	}

	// アイテム関連
	async getItems(offset = 0, n = 10): Promise<GorseItem[]> {
		return this.retryRequest(`/api/item?offset=${offset}&n=${n}`) as Promise<
			GorseItem[]
		>;
	}

	async getItem(itemId: string): Promise<GorseItem> {
		return this.retryRequest(`/api/item/${itemId}`) as Promise<GorseItem>;
	}

	async insertItem(item: GorseItem): Promise<void> {
		await this.retryRequest(`/api/items`, {
			method: "POST",
			body: JSON.stringify([item]),
		});
	}

	async deleteItem(itemId: string): Promise<void> {
		await this.retryRequest(`/api/item/${itemId}`, {
			method: "DELETE",
		});
	}

	// ユーザー関連
	async getUsers(offset = 0, n = 10): Promise<GorseUser[]> {
		return this.retryRequest(`/api/user?offset=${offset}&n=${n}`) as Promise<
			GorseUser[]
		>;
	}

	async getUser(userId: string): Promise<GorseUser> {
		return this.retryRequest(`/api/user/${userId}`) as Promise<GorseUser>;
	}

	async insertUser(user: GorseUser): Promise<void> {
		await this.retryRequest(`/api/users`, {
			method: "POST",
			body: JSON.stringify([user]),
		});
	}

	async deleteUser(userId: string): Promise<void> {
		await this.retryRequest(`/api/user/${userId}`, {
			method: "DELETE",
		});
	}

	// フィードバック関連
	async insertFeedback(feedback: GorseFeedback): Promise<void> {
		await this.retryRequest("/api/feedback", {
			method: "POST",
			body: JSON.stringify([feedback]),
		});
	}

	async getFeedback(userId: string, itemId: string): Promise<GorseFeedback[]> {
		return this.retryRequest(`/api/feedback/${userId}/${itemId}`) as Promise<
			GorseFeedback[]
		>;
	}

	// 推薦関連
	async getRecommendations(
		userId: string,
		n = 10
	): Promise<GorseRecommendation[]> {
		return this.retryRequest(`/api/recommend/${userId}?n=${n}`) as Promise<
			GorseRecommendation[]
		>;
	}

	async getLatestRecommendations(
		userId: string,
		n = 10
	): Promise<GorseRecommendation[]> {
		return this.retryRequest(`/api/latest/${userId}?n=${n}`) as Promise<
			GorseRecommendation[]
		>;
	}

	async getPopularRecommendations(
		userId: string,
		n = 10
	): Promise<GorseRecommendation[]> {
		return this.retryRequest(`/api/popular/${userId}?n=${n}`) as Promise<
			GorseRecommendation[]
		>;
	}

	// 類似アイテム
	async getSimilarItems(
		itemId: string,
		n = 10
	): Promise<GorseRecommendation[]> {
		try {
			const response = await this.retryRequest(
				`/api/item/${itemId}/neighbors?n=${n}`
			);

			// レスポンス形式の確認とマッピング
			if (Array.isArray(response)) {
				// 新しい形式: { Id, Score } の配列
				if (response.length > 0 && "Id" in response[0]) {
					console.log("[Gorse] Converting neighbor response format");
					return (response as GorseNeighborResponse[]).map((item) => ({
						ItemId: item.Id,
						Score: item.Score,
					}));
				}
				// 元の形式: { ItemId, Score } の配列
				return response as GorseRecommendation[];
			}

			console.error("[Gorse] Unexpected response format:", response);
			return [];
		} catch (error) {
			console.error(`[Gorse] Error in getSimilarItems: ${error}`);
			throw error;
		}
	}

	// アイテムの詳細情報（カテゴリ、ラベルなど）
	async getItemNeighbors(
		itemId: string,
		n = 10
	): Promise<GorseRecommendation[]> {
		return this.retryRequest(`/api/item/${itemId}/neighbors?n=${n}`) as Promise<
			GorseRecommendation[]
		>;
	}

	// ユーザーの詳細情報
	async getUserNeighbors(
		userId: string,
		n = 10
	): Promise<GorseRecommendation[]> {
		return this.retryRequest(`/api/user/${userId}/neighbors?n=${n}`) as Promise<
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
		return recommendations
			.map((r) => r.ItemId || r.Id)
			.filter((id): id is string => id !== undefined);
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
const getLocalSimilarItems = (
	itemId: string,
	allProducts: Product[],
	limit: number = 5
): string[] => {
	console.log(`[Gorse] Using local fallback for item ${itemId}`);
	const current: Product | undefined = allProducts.find(
		(p: Product) => p.id === itemId
	);
	if (!current) {
		console.log(`[Gorse] Current product not found for ID: ${itemId}`);
		return [];
	}

	console.log(`[Gorse] Current product:`, current);

	// 同じカテゴリの商品を優先
	const sameCategory = allProducts.filter(
		(p: Product) => p.id !== itemId && p.category === current.category
	);

	// 同一カテゴリの商品数が足りない場合は、人気商品で補完
	const additional = allProducts.filter(
		(p: Product) =>
			p.id !== itemId && p.category !== current.category && p.isPopular
	);

	const merged = [...sameCategory, ...additional];
	const result = merged.slice(0, limit).map((p: Product) => p.id);
	console.log(`[Gorse] Local similar items result:`, result);
	return result;
};

// 類似アイテム取得用のヘルパー関数
export const getSimilarItems = async (
	itemId: string,
	allProducts: Product[] = [],
	limit: number = 5
): Promise<string[]> => {
	console.log(`[Gorse] Getting similar items for ${itemId}, limit: ${limit}`);

	if (!itemId) {
		console.error("[Gorse] Invalid itemId provided:", itemId);
		return getLocalSimilarItems(itemId, allProducts, limit);
	}

	try {
		console.log(
			`[Gorse] Attempting to get similar items from API for ${itemId}`
		);
		const similarItems = await gorse.getSimilarItems(itemId, limit);

		// APIレスポンスの検証
		if (Array.isArray(similarItems) && similarItems.length > 0) {
			console.log(`[Gorse] Raw API response:`, similarItems);
			console.log(
				`[Gorse] API returned ${similarItems.length} similar items:`,
				similarItems.map((r) => r.ItemId || r.Id)
			);
			const result = similarItems
				.map((r) => r.ItemId || r.Id)
				.filter((id): id is string => id !== undefined);
			console.log(`[Gorse] Final result:`, result);
			return result;
		}

		console.log("[Gorse] API returned empty result, using local fallback");
		return getLocalSimilarItems(itemId, allProducts, limit);
	} catch (error) {
		console.error(
			"[Gorse] Failed to get similar items from API:",
			error instanceof Error ? error.message : error
		);
		console.log("[Gorse] Using local fallback due to API error");
		return getLocalSimilarItems(itemId, allProducts, limit);
	}
};
