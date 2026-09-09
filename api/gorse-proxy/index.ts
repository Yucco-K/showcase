import { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

// Gorse APIへのサーバーサイドプロキシ。
//
// これまでvercel.jsonの静的リライトでブラウザから直接Gorseサーバーへ
// アクセスしていたため、クライアント側(localStorage)のレート制限は
// ユーザーが削除・改ざんして回避できてしまっていた。
// このFunctionを経由させることで、ユーザーID(ログイン時)またはIP単位の
// リクエスト数をSupabase上でサーバー側にカウントし、実効性のある
// レート制限をかける。

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
	auth: {
		autoRefreshToken: false,
		persistSession: false,
	},
});

const GORSE_ENDPOINT =
	process.env.GORSE_ENDPOINT || "http://18.183.35.86:8087";
const GORSE_API_KEY = process.env.GORSE_API_KEY || "";

// 既存のクライアント側実装(src/lib/gorse.ts)と同じ閾値を踏襲
const HOURLY_LIMIT = 30;
const DAILY_LIMIT = 100;

const ALLOWED_ORIGINS = (
	process.env.ALLOWED_ORIGINS ||
	"https://showcase-topaz.vercel.app,http://localhost:5173,http://127.0.0.1:5173"
)
	.split(",")
	.map((origin) => origin.trim())
	.filter(Boolean);

function setCorsHeaders(req: VercelRequest, res: VercelResponse): void {
	const origin = req.headers.origin;
	if (origin && ALLOWED_ORIGINS.includes(origin)) {
		res.setHeader("Access-Control-Allow-Origin", origin);
		res.setHeader("Vary", "Origin");
	}
	res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
	res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

// ログイン済みならSupabaseユーザーID、未ログインならIPアドレスを識別子に使う
async function getIdentifier(req: VercelRequest): Promise<string> {
	const authHeader = req.headers.authorization;
	if (authHeader?.startsWith("Bearer ")) {
		const token = authHeader.slice("Bearer ".length);
		try {
			const { data, error } = await supabase.auth.getUser(token);
			if (!error && data.user) {
				return `user:${data.user.id}`;
			}
		} catch (error) {
			console.warn("[gorse-proxy] Failed to resolve user from token:", error);
		}
	}

	const forwardedFor = req.headers["x-forwarded-for"];
	const ip = Array.isArray(forwardedFor)
		? forwardedFor[0]
		: forwardedFor?.split(",")[0]?.trim();
	return `ip:${ip || "unknown"}`;
}

async function checkRateLimit(
	identifier: string
): Promise<{ ok: boolean; message?: string }> {
	const now = new Date();
	const hourStart = new Date(now);
	hourStart.setMinutes(0, 0, 0);
	const dayStart = new Date(now);
	dayStart.setHours(0, 0, 0, 0);

	const { data: hourlyCount, error: hourlyError } = await supabase.rpc(
		"increment_gorse_rate_limit",
		{
			p_identifier: identifier,
			p_window_type: "hour",
			p_window_start: hourStart.toISOString(),
		}
	);
	if (hourlyError) throw hourlyError;

	if ((hourlyCount as number) > HOURLY_LIMIT) {
		return {
			ok: false,
			message: `1時間あたりの制限（${HOURLY_LIMIT}回）を超過しました。しばらく待ってから再度お試しください。`,
		};
	}

	const { data: dailyCount, error: dailyError } = await supabase.rpc(
		"increment_gorse_rate_limit",
		{
			p_identifier: identifier,
			p_window_type: "day",
			p_window_start: dayStart.toISOString(),
		}
	);
	if (dailyError) throw dailyError;

	if ((dailyCount as number) > DAILY_LIMIT) {
		return {
			ok: false,
			message: `1日あたりの制限（${DAILY_LIMIT}回）を超過しました。明日再度お試しください。`,
		};
	}

	return { ok: true };
}

export default async function handler(
	req: VercelRequest,
	res: VercelResponse
) {
	setCorsHeaders(req, res);

	if (req.method === "OPTIONS") {
		res.status(200).end();
		return;
	}

	try {
		const identifier = await getIdentifier(req);
		const rateLimit = await checkRateLimit(identifier);
		if (!rateLimit.ok) {
			res.status(429).json({ error: rateLimit.message });
			return;
		}
	} catch (error) {
		// レート制限チェック自体の失敗（DB一時障害等）でGorseアクセスを
		// 全面停止させるより、ログを残した上でリクエストは通す方針とする
		// （fail open）。乱用防止が目的であり、厳密な課金制御ではないため。
		console.error("[gorse-proxy] Rate limit check failed, failing open:", error);
	}

	// ?path=... はこのプロキシ自身のルーティング専用パラメータのため、
	// Gorse本体への転送時には取り除き、それ以外のクエリはそのまま引き継ぐ。
	const pathParam = Array.isArray(req.query.path)
		? req.query.path.join("/")
		: req.query.path || "";
	const gorsePath = `/${pathParam}`;

	const forwardParams = new URLSearchParams();
	for (const [key, value] of Object.entries(req.query)) {
		if (key === "path") continue;
		if (Array.isArray(value)) {
			value.forEach((v) => forwardParams.append(key, v));
		} else if (value !== undefined) {
			forwardParams.append(key, value);
		}
	}
	const queryString = forwardParams.toString();
	const targetUrl = `${GORSE_ENDPOINT}${gorsePath}${queryString ? `?${queryString}` : ""}`;

	try {
		const method = req.method || "GET";
		const gorseResponse = await fetch(targetUrl, {
			method,
			headers: {
				"Content-Type": "application/json",
				"X-API-Key": GORSE_API_KEY,
			},
			body: ["GET", "HEAD"].includes(method)
				? undefined
				: JSON.stringify(req.body),
		});

		const contentType =
			gorseResponse.headers.get("content-type") || "application/json";
		res.setHeader("Content-Type", contentType);
		const text = await gorseResponse.text();
		res.status(gorseResponse.status).send(text);
	} catch (error) {
		console.error("[gorse-proxy] Failed to reach Gorse backend:", error);
		res.status(502).json({ error: "Gorse backend unreachable" });
	}
}
