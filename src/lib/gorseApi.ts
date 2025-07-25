import { gorse } from "./gorse";
import type { GorseFeedbackItem, GorseFeedbackResponse } from "../types/gorse";
import { isDevelopmentEnvironment } from "../utils/environment";

/**
 * 型安全なGorseフィードバック取得関数
 * @param offset オフセット
 * @param n 取得件数
 * @returns フィードバックアイテムの配列
 */
export async function fetchGorseFeedback(
	offset = 0,
	n = 10000
): Promise<GorseFeedbackItem[]> {
	try {
		const raw = await (
			gorse as unknown as { request: (path: string) => Promise<unknown> }
		).request(`/api/feedback?offset=${offset}&n=${n}`);

		// API応答形式に柔軟に対応
		let data: GorseFeedbackItem[] = [];

		if (Array.isArray(raw)) {
			data = raw as GorseFeedbackItem[];
		} else if (raw && typeof raw === "object") {
			const response = raw as GorseFeedbackResponse;
			if (Array.isArray(response.Feedback)) {
				data = response.Feedback;
			} else if (Array.isArray(response.feedback)) {
				data = response.feedback;
			}
		}

		if (data.length === 0 && isDevelopmentEnvironment()) {
			console.warn(
				"[Gorse] フィードバック配列が空または予期しない形式です。" +
					"期待値: Array<{FeedbackType:string; ItemId:string}>. " +
					"実際の応答:",
				raw
			);
		}

		return data;
	} catch (error) {
		console.error("Gorseフィードバック取得エラー:", error);
		return [];
	}
}
