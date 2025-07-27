// Chat API client for communicating with the Vercel serverless function

export async function fetchChatReply(message: string): Promise<string> {
	// Vercel Serverless Functionの相対パスエンドポイントを使用
	const endpoint = "/api/chat";

	try {
		const res = await fetch(endpoint, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ message }),
		});

		if (!res.ok) {
			const errorData = await res.json();
			console.error("Chat API Error:", errorData);
			throw new Error(
				`チャットAPIからの応答に失敗しました: ${res.status} ${
					errorData.error || ""
				}`
			);
		}

		const data = await res.json();
		return data.reply || "申し訳ございませんが、応答を生成できませんでした。";
	} catch (error) {
		console.error("fetchChatReplyでエラーが発生しました:", error);
		// ネットワークエラーなど、より一般的なエラーメッセージを返す
		throw new Error(
			"チャットサービスへの接続に失敗しました。ネットワーク接続を確認してください。"
		);
	}
}
