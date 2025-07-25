// Chat API client for communicating with AWS Lambda backend

export async function fetchChatReply(message: string): Promise<string> {
	const endpoint = import.meta.env.VITE_CHATBOT_ENDPOINT;

	if (!endpoint) {
		throw new Error("VITE_CHATBOT_ENDPOINT環境変数が設定されていません");
	}

	const res = await fetch(endpoint, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ message }),
	});

	if (!res.ok) {
		throw new Error(`チャットAPIからの応答に失敗しました: ${res.status}`);
	}

	const data = await res.json();
	return data.reply || "申し訳ございませんが、応答を生成できませんでした。";
}
