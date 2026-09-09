// Gorse推薦システムクライアント（直接API呼び出し）

import type { Product } from "../types/product.ts";

// APIエンドポイントのデバッグ情報を出力
// 本番環境ではプロキシエンドポイントを使用（Mixed Contentエラーを回避）
const GORSE_ENDPOINT =
	import.meta.env.PROD
		? "/gorse-api"
		: import.meta.env.VITE_GORSE_ENDPOINT || "http://52.199.237.91:8087/api";

// ⚠️ セキュリティ上の注意:
// Gorse API Keyはクライアント側では空文字列にして、
// 実際のAPIキーはSupabase Edge Functionsなどのサーバー側で管理すべきです。
// 現状、読み取り専用のAPIなのでリスクは限定的ですが、改善が必要です。
const GORSE_API_KEY = "";

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

// レート制限の設定
interface RateLimitEntry {
	count: number;
	resetTime: number; // タイムスタンプ
}

class GorseClient {
	private endpoint: string;
	private apiKey: string;
	private requestCache: Map<string, { data: unknown; timestamp: number }> =
		new Map();
	private cacheTimeout = 5 * 60 * 1000; // 5分間キャッシュ
	private requestQueue: Map<string, Promise<unknown>> = new Map();

	// レート制限: IPアドレスまたはユーザーID毎に管理
	private rateLimits: Map<string, RateLimitEntry> = new Map();
	private maxRequestsPerDay = 100; // 1日あたりの最大リクエスト数
	private maxRequestsPerHour = 30; // 1時間あたりの最大リクエスト数

	constructor(endpoint: string, apiKey: string) {
		this.endpoint = endpoint;
		this.apiKey = apiKey;

		// 定期的に古いレート制限エントリをクリーンアップ（1時間ごと）
		setInterval(() => this.cleanupRateLimits(), 60 * 60 * 1000);
	}

	private cleanupRateLimits(): void {
		const now = Date.now();
		for (const [key, entry] of this.rateLimits.entries()) {
			if (now > entry.resetTime) {
				this.rateLimits.delete(key);
			}
		}
	}

	private checkRateLimit(
		identifier: string,
		windowMs: number,
		maxRequests: number
	): boolean {
		const now = Date.now();
		const entry = this.rateLimits.get(identifier);

		if (!entry || now > entry.resetTime) {
			// 新しいウィンドウを開始
			this.rateLimits.set(identifier, {
				count: 1,
				resetTime: now + windowMs,
			});
			return true;
		}

		if (entry.count >= maxRequests) {
			// レート制限を超過
			console.warn(
				`[Gorse] Rate limit exceeded for ${identifier}. Limit: ${maxRequests}, Current: ${entry.count}`
			);
			return false;
		}

		// カウントを増やす
		entry.count++;
		return true;
	}

	private getRateLimitIdentifier(userId?: string): string {
		// ユーザーIDがあればそれを使用、なければIPアドレスベースの識別子
		if (userId) {
			return `user:${userId}`;
		}
		// ブラウザのフィンガープリントまたはセッションID
		// LocalStorageを使用してクライアント側で永続化
		let clientId = localStorage.getItem("gorse_client_id");
		if (!clientId) {
			clientId = `client:${Date.now()}-${Math.random()
				.toString(36)
				.substring(7)}`;
			localStorage.setItem("gorse_client_id", clientId);
		}
		return clientId;
	}

	private async request(
		path: string,
		options?: RequestInit,
		userId?: string
	): Promise<unknown> {
		const url = `${this.endpoint}${path}`;

		// レート制限チェック
		const identifier = this.getRateLimitIdentifier(userId);
		const hourlyLimit = this.checkRateLimit(
			`${identifier}:hourly`,
			60 * 60 * 1000, // 1時間
			this.maxRequestsPerHour
		);
		const dailyLimit = this.checkRateLimit(
			`${identifier}:daily`,
			24 * 60 * 60 * 1000, // 24時間
			this.maxRequestsPerDay
		);

		if (!hourlyLimit || !dailyLimit) {
			const errorMsg = !hourlyLimit
				? `1時間あたりの制限（${this.maxRequestsPerHour}回）を超過しました。しばらく待ってから再度お試しください。`
				: `1日あたりの制限（${this.maxRequestsPerDay}回）を超過しました。明日再度お試しください。`;
			console.error(`[Gorse] ⛔ Rate limit exceeded: ${errorMsg}`);
			throw new Error(errorMsg);
		}

		// GETリクエストのみキャッシュ
		const method = options?.method || "GET";
		const cacheKey = `${method}:${url}`;

		// キャッシュチェック
		if (method === "GET") {
			const cached = this.requestCache.get(cacheKey);
			if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
				console.log(`[Gorse] 💾 Cache hit: ${path}`);
				return cached.data;
			}

			// 同じリクエストが進行中の場合は待機（重複リクエスト防止）
			const ongoing = this.requestQueue.get(cacheKey);
			if (ongoing) {
				console.log(`[Gorse] ⏳ Waiting for ongoing request: ${path}`);
				return ongoing;
			}
		}

		const controller = new AbortController();
		const timeout = 2000; // 2秒タイムアウト（高速フォールバック用）
		const timeoutId = setTimeout(() => controller.abort(), timeout);

		const isDev =
			(typeof import.meta !== "undefined" &&
				(import.meta as { env?: { DEV?: boolean } }).env?.DEV) ||
			process.env.NODE_ENV === "development";

		const requestPromise = (async () => {
			try {
				// 開発モードのみ詳細ログ
				if (isDev) {
					console.debug(`[Gorse] → ${options?.method || "GET"} ${url}`);
				}

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

				if (isDev) {
					console.debug(
						`[Gorse] ← ${response.status} ${url} (${Math.round(
							endTime - startTime
						)}ms)`
					);
				}

				if (!response.ok) {
					const errorText = await response
						.text()
						.catch(() => "No error text available");
					throw new Error(
						`HTTP error! status: ${response.status}, url: ${url}, details: ${errorText}`
					);
				}

				const data = await response.json();

				// GETリクエストの場合はキャッシュに保存
				if (method === "GET") {
					this.requestCache.set(cacheKey, {
						data,
						timestamp: Date.now(),
					});
				}

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
		})();

		// GETリクエストの場合はキューに追加
		if (method === "GET") {
			this.requestQueue.set(cacheKey, requestPromise);
			requestPromise.finally(() => {
				this.requestQueue.delete(cacheKey);
			});
		}

		return requestPromise;
	}

	private async retryRequest(
		path: string,
		options?: RequestInit,
		maxRetries: number = 3,
		delay: number = 1000
	): Promise<unknown> {
		const isDevRetry =
			(typeof import.meta !== "undefined" &&
				(import.meta as { env?: { DEV?: boolean } }).env?.DEV) ||
			process.env.NODE_ENV === "development";
		let lastError: Error | undefined;

		for (let attempt = 1; attempt <= maxRetries; attempt++) {
			try {
				return await this.request(path, options);
			} catch (error) {
				lastError = error as Error;
				if (attempt < maxRetries) {
					if (isDevRetry) {
						console.debug(`[Gorse] Retry ${attempt}/${maxRetries}: ${path}`);
					}
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
		return this.retryRequest(`/api/items?offset=${offset}&n=${n}`) as Promise<
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
		return this.retryRequest(`/api/users?offset=${offset}&n=${n}`) as Promise<
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
		return this.request(
			`/api/recommend/${userId}?n=${n}`,
			{ method: "GET" },
			userId
		) as Promise<GorseRecommendation[]>;
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
		n = 10,
		userId?: string
	): Promise<GorseRecommendation[]> {
		try {
			const response = await this.request(
				`/api/item/${itemId}/neighbors?n=${n}`,
				{ method: "GET" },
				userId
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

			console.warn("[Gorse] Unexpected response format:", response);
			return [];
		} catch (error) {
			console.warn(`[Gorse] API not available, using local fallback: ${error}`);
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
	limit: number = 5,
	userId?: string
): Promise<string[]> => {
	console.log(`[Gorse] 類似商品を取得中: ${itemId} (最大${limit}個)`);

	if (!itemId) {
		console.error("[Gorse] Invalid itemId provided:", itemId);
		return getLocalSimilarItems(itemId, allProducts, limit);
	}

	try {
		console.log(`[Gorse] APIから類似商品を取得中...`);
		const similarItems = await gorse.getSimilarItems(itemId, limit, userId);

		// APIレスポンスの検証
		if (Array.isArray(similarItems) && similarItems.length > 0) {
			const result = similarItems
				.map((r) => r.ItemId || r.Id)
				.filter((id): id is string => id !== undefined);
			console.log(`[Gorse] 類似商品ID (${result.length}個):`, result);
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
