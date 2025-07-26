// Chat API client for communicating with Supabase Edge Functions

export async function fetchChatReply(message: string): Promise<string> {
	// Supabase Edge Functionのエンドポイントを使用
	const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
	const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

	if (!supabaseUrl) {
		throw new Error("VITE_SUPABASE_URL環境変数が設定されていません");
	}

	if (!supabaseAnonKey) {
		throw new Error("VITE_SUPABASE_ANON_KEY環境変数が設定されていません");
	}

	const endpoint = `${supabaseUrl}/functions/v1/chat`;

	// 匿名アクセス（認証不要）でチャットボットAPIを呼び出し
	const res = await fetch(endpoint, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${supabaseAnonKey}`,
		},
		body: JSON.stringify({ message }),
	});

	if (!res.ok) {
		const errorText = await res.text();
		console.error("チャットAPIエラー:", errorText);
		throw new Error(`チャットAPIからの応答に失敗しました: ${res.status}`);
	}

	const data = await res.json();
	return data.reply || "申し訳ございませんが、応答を生成できませんでした。";
}
