import { Gorse } from "gorsejs";

// Gorse クライアント設定
export const gorse = new Gorse({
	endpoint:
		import.meta.env.VITE_NEXT_PUBLIC_GORSE_ENDPOINT || "http://localhost:8087",
	secret: import.meta.env.VITE_GORSE_API_KEY || "",
});

// フィードバックタイプの定義
export const FEEDBACK_TYPES = {
	PURCHASE: "purchase",
	LIKE: "like",
	VIEW: "view",
	CART: "cart",
} as const;

export type FeedbackType = (typeof FEEDBACK_TYPES)[keyof typeof FEEDBACK_TYPES];

// フィードバック送信用のヘルパー関数
export const sendFeedback = async (
	userId: string,
	itemId: string,
	feedbackType: FeedbackType
) => {
	try {
		await gorse.insertFeedbacks([
			{
				FeedbackType: feedbackType,
				UserId: userId,
				ItemId: itemId,
				Timestamp: new Date().toISOString(),
			},
		]);
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
		const recommendations = await gorse.getRecommend({
			userId,
			cursorOptions: { n: limit },
		});
		return recommendations;
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
		await gorse.upsertItem({
			ItemId: itemId,
			IsHidden: false,
			Labels: labels || [],
			Categories: categories || [],
			Timestamp: new Date().toISOString(),
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
		});
		console.log(`User inserted: ${userId}`);
	} catch (error) {
		console.error("Failed to insert user to Gorse:", error);
		throw error;
	}
};

// 類似アイテム取得用のヘルパー関数
export const getSimilarItems = async (
	itemId: string,
	limit: number = 5
): Promise<string[]> => {
	try {
		const similarItems = await gorse.getItemNeighbors({
			itemId,
			cursorOptions: { n: limit },
		});
		return similarItems;
	} catch (error) {
		console.error("Failed to get similar items from Gorse:", error);
		// フォールバック: 空の配列を返す
		return [];
	}
};
