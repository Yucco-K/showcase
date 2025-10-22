// Chat API client for communicating with Supabase Edge Functions

// レート制限の管理
interface RateLimitEntry {
	count: number;
	resetTime: number;
}

class ChatRateLimiter {
	private rateLimits: Map<string, RateLimitEntry> = new Map();
	private maxRequestsPerDay = 100; // 1日あたりの最大リクエスト数
	private maxRequestsPerHour = 50; // 1時間あたりの最大リクエスト数

	private getClientId(): string {
		let clientId = localStorage.getItem("chat_client_id");
		if (!clientId) {
			clientId = `chat:${Date.now()}-${Math.random()
				.toString(36)
				.substring(7)}`;
			localStorage.setItem("chat_client_id", clientId);
		}
		return clientId;
	}

	checkRateLimit(windowMs: number, maxRequests: number, key: string): boolean {
		const now = Date.now();
		const entry = this.rateLimits.get(key);

		if (!entry || now > entry.resetTime) {
			this.rateLimits.set(key, {
				count: 1,
				resetTime: now + windowMs,
			});
			return true;
		}

		if (entry.count >= maxRequests) {
			console.warn(
				`[Chat] Rate limit exceeded for ${key}. Limit: ${maxRequests}, Current: ${entry.count}`
			);
			return false;
		}

		entry.count++;
		return true;
	}

	checkLimits(): { allowed: boolean; message?: string } {
		const clientId = this.getClientId();
		const hourlyLimit = this.checkRateLimit(
			60 * 60 * 1000,
			this.maxRequestsPerHour,
			`${clientId}:hourly`
		);
		const dailyLimit = this.checkRateLimit(
			24 * 60 * 60 * 1000,
			this.maxRequestsPerDay,
			`${clientId}:daily`
		);

		if (!hourlyLimit) {
			return {
				allowed: false,
				message: `1時間あたりのチャット制限（${this.maxRequestsPerHour}回）を超過しました。しばらく待ってから再度お試しください。`,
			};
		}

		if (!dailyLimit) {
			return {
				allowed: false,
				message: `1日あたりのチャット制限（${this.maxRequestsPerDay}回）を超過しました。明日再度お試しください。`,
			};
		}

		return { allowed: true };
	}

	getRemainingRequests(): { hourly: number; daily: number } {
		const clientId = this.getClientId();
		const hourlyEntry = this.rateLimits.get(`${clientId}:hourly`);
		const dailyEntry = this.rateLimits.get(`${clientId}:daily`);

		return {
			hourly: hourlyEntry
				? Math.max(0, this.maxRequestsPerHour - hourlyEntry.count)
				: this.maxRequestsPerHour,
			daily: dailyEntry
				? Math.max(0, this.maxRequestsPerDay - dailyEntry.count)
				: this.maxRequestsPerDay,
		};
	}
}

const rateLimiter = new ChatRateLimiter();

// 残りのリクエスト数を取得
export function getChatRemainingRequests(): { hourly: number; daily: number } {
	return rateLimiter.getRemainingRequests();
}

export async function fetchChatReply(message: string): Promise<string> {
	// レート制限チェック
	const limitCheck = rateLimiter.checkLimits();
	if (!limitCheck.allowed) {
		throw new Error(limitCheck.message || "レート制限を超過しました。");
	}
	// Supabase Edge Functionsのエンドポイントを使用
	const endpoint = "https://ljjptkfrdeiktywbbybr.supabase.co/functions/v1/chat";

	try {
		const res = await fetch(endpoint, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
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
