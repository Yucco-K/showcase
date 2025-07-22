import { useCallback } from "react";
import { sendFeedback, FEEDBACK_TYPES } from "../lib/gorse";
import { useAuth } from "../contexts/AuthProvider";
import { useToast } from "./useToast";
import type { FeedbackType } from "../types/recommendation";

export const useGorseFeedback = () => {
	const { user } = useAuth();
	const { showError } = useToast();

	// フィードバック送信の共通ロジック
	const sendUserFeedback = useCallback(
		async (
			itemId: string,
			feedbackType: FeedbackType,
			silent: boolean = false
		) => {
			if (!user?.id) {
				if (!silent) {
					showError("ログインが必要です");
				}
				return false;
			}

			try {
				await sendFeedback(user.id, itemId, feedbackType);
				return true;
			} catch (error) {
				console.error("Failed to send feedback:", error);
				if (!silent) {
					showError("フィードバックの送信に失敗しました");
				}
				return false;
			}
		},
		[user?.id, showError]
	);

	// 購入フィードバック送信
	const sendPurchaseFeedback = useCallback(
		async (productId: string) => {
			return await sendUserFeedback(productId, FEEDBACK_TYPES.PURCHASE);
		},
		[sendUserFeedback]
	);

	// いいねフィードバック送信
	const sendLikeFeedback = useCallback(
		async (productId: string) => {
			return await sendUserFeedback(productId, FEEDBACK_TYPES.LIKE, true);
		},
		[sendUserFeedback]
	);

	// 閲覧フィードバック送信（サイレント）
	const sendViewFeedback = useCallback(
		async (productId: string) => {
			return await sendUserFeedback(productId, FEEDBACK_TYPES.VIEW, true);
		},
		[sendUserFeedback]
	);

	// カートに追加フィードバック送信
	const sendCartFeedback = useCallback(
		async (productId: string) => {
			return await sendUserFeedback(productId, FEEDBACK_TYPES.CART, true);
		},
		[sendUserFeedback]
	);

	// 複数のフィードバックを一括送信
	const sendBatchFeedback = useCallback(
		async (
			feedbacks: Array<{ itemId: string; feedbackType: FeedbackType }>
		) => {
			if (!user?.id) {
				showError("ログインが必要です");
				return false;
			}

			let successCount = 0;
			let failureCount = 0;

			for (const feedback of feedbacks) {
				try {
					await sendFeedback(user.id, feedback.itemId, feedback.feedbackType);
					successCount++;
				} catch (error) {
					console.error(
						`Failed to send feedback for item ${feedback.itemId}:`,
						error
					);
					failureCount++;
				}

				// APIレート制限を避けるため少し待機
				await new Promise((resolve) => setTimeout(resolve, 50));
			}

			console.log(
				`Batch feedback sent - Success: ${successCount}, Failed: ${failureCount}`
			);
			return failureCount === 0;
		},
		[user?.id, showError]
	);

	return {
		sendPurchaseFeedback,
		sendLikeFeedback,
		sendViewFeedback,
		sendCartFeedback,
		sendBatchFeedback,
		isLoggedIn: !!user?.id,
	};
};
