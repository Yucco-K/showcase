// Chat API client for communicating with Supabase Edge Functions

import { supabase } from "../lib/supabase";

export async function fetchChatReply(message: string): Promise<string> {
	// Supabase Edge Functionのエンドポイントを使用
	const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

	if (!supabaseUrl) {
		throw new Error("VITE_SUPABASE_URL環境変数が設定されていません");
	}

	const endpoint = `${supabaseUrl}/functions/v1/chat`;

	// 現在のユーザーセッションを取得
	const {
		data: { session },
		error: sessionError,
	} = await supabase.auth.getSession();

	if (sessionError || !session) {
		throw new Error("認証が必要です。ログインしてください。");
	}

	const res = await fetch(endpoint, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${session.access_token}`,
		},
		body: JSON.stringify({ message }),
	});

	if (!res.ok) {
		throw new Error(`チャットAPIからの応答に失敗しました: ${res.status}`);
	}

	const data = await res.json();
	return data.reply || "申し訳ございませんが、応答を生成できませんでした。";
}
