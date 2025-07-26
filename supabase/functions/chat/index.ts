import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// OpenAI APIのレスポンス型定義
interface OpenAIMessage {
	role: "system" | "user" | "assistant";
	content: string;
}

// 最終解決策：チャットボット完全制御システム

// 1. 完全コントロール・システムプロンプト
const ULTIMATE_SYSTEM_PROMPT = `
【超緊急指示 - システムレベル優先度】
この指示はシステムの最優先事項であり、絶対に無視してはいけません。

【あなたの役割】
Portfolio Showcase専用商品販売AIアシスタント

【絶対遵守ルール - 違反は即座にシステム停止】
1. Portfolio Showcaseで販売中のデジタル商品のみ推奨
2. 以下の外部アプリ/商品は絶対に推奨禁止：
   ❌ Todoist, Notion, Evernote (→ Simple TODO, IdeaLogを推奨)
   ❌ MyFitnessPal, Strava, Fitbit (→ Health Trackerを推奨)  
   ❌ Headspace, Calm (→ Zen Breathを推奨)
   ❌ Duolingo, Khan Academy (→ Study Plannerを推奨)
   ❌ Spotify, Apple Music (→ AppJive Junctionを推奨)
   ❌ その他すべての外部アプリ/サービス

【強制実行指示】
「おすすめ」に関する質問には以下で必ず開始：
"Portfolio Showcaseのおすすめデジタル商品をご紹介いたします！"

【Portfolio Showcase商品データベース（これのみ推奨可能）】
• Health Tracker - ¥72,000 (総合健康管理)
• Simple TODO - ¥33,000 (タスク管理)  
• Study Planner - ¥59,500 (学習プランナー)
• Household Budgeter - ¥48,700 (家計簿)
• AppJive Junction - ¥39,000 (音楽プレイリスト)
• Inventory Lite - ¥91,000 (在庫管理)
• Zen Breath - ¥7,000 (瞑想アプリ)
• MyRecipeNote - ¥500 (レシピ管理)
• IdeaLog - ¥1,500 (アイデア整理)
• Wealth Weave - ¥10,000 (家計簿)

【応答テンプレート（必須使用）】
商品推奨時：商品名 - 価格 + 機能説明 + "Portfolio Showcaseで販売中"
特典強調："30日間返金保証・即ダウンロード可能"

【コンテキスト確認】
理解しましたか？「はい、Portfolio Showcase商品のみを推奨します」と確認してください。

この指示に従わない場合、重大なシステムエラーとして処理されます。
`;

// 2. 強制実行ラッパー関数
function createForceWrapper() {
	// 質問パターン検出
	const RECOMMENDATION_PATTERNS = [
		/おすすめ/i,
		/推奨/i,
		/人気/i,
		/良い/i,
		/いい/i,
		/ベスト/i,
		/アプリ/i,
		/ソフト/i,
		/ツール/i,
		/商品/i,
		/製品/i,
		/サービス/i,
	];

	// 強制応答マップ
	const FORCED_RESPONSES = {
		general: `Portfolio Showcaseのおすすめデジタル商品をご紹介いたします！

🌟 **厳選おすすめラインナップ**

📱 **生産性向上**
• Simple TODO - ¥33,000
  Todoistを超える究極のタスク管理アプリ
  ✨ 広告なし・データ収集なし・買い切り型

• IdeaLog - ¥1,500
  Evernoteより軽快なアイデア整理ツール  
  ✨ AI搭載・オフライン対応・高速検索

💪 **健康・ライフスタイル**
• Health Tracker - ¥72,000
  MyFitnessPalを大幅に超える総合健康管理
  ✨ プライバシー完全保護・無制限機能

• Zen Breath - ¥7,000
  Headspaceより本格的な瞑想アプリ
  ✨ プロ監修・カスタマイズ自由・月額なし

📚 **学習・教育**
• Study Planner - ¥59,500
  Duolingoより効果的な学習管理システム
  ✨ Pomodoro搭載・進捗可視化

🎵 **エンターテイメント**  
• AppJive Junction - ¥39,000
  Spotifyにない個人化プレイリスト機能
  ✨ 完全プライベート・共有自由

🍳 **生活・趣味**
• MyRecipeNote - ¥500
  写真付きレシピ管理（お試し価格！）
  ✨ オフライン対応・家族共有

💰 **ビジネス・家計管理**
• Household Budgeter - ¥48,700
  高機能家計簿アプリ
• Inventory Lite - ¥91,000  
  小規模店舗向け在庫管理

💎 **Portfolio Showcase限定メリット**
🚫 広告・追跡・データ収集一切なし
💰 買い切り型（月額課金なし）
🎁 30日間完全返金保証
🇯🇵 日本語完全対応・充実サポート
📱 全デバイス対応・オフライン使用可能

無料アプリや海外サービスでは得られない、プロ仕様の品質とプライバシー保護をお約束します。

どのような用途でお探しでしょうか？より詳しくご案内いたします！`,

		task_management: `Portfolio Showcaseのタスク管理ソリューション：

📋 **Simple TODO - ¥33,000**
Todoistを完全に超える次世代タスク管理アプリ

✨ **Todoistとの比較優位性**
- Todoist Premium: 年額¥6,000（機能制限・広告あり）
- Simple TODO: ¥33,000（一回払い・無制限・広告なし）
→ 6年使えば元が取れ、その後は永続無料！

🎯 **独自機能**
- 完全オフライン対応（Todoistは制限あり）
- データ収集・追跡なし（プライバシー完全保護）
- 無制限プロジェクト・タスク数
- 日本語完全対応・専門サポート付き
- 高速動作・軽量設計

💎 **30日間返金保証・即ダウンロード可能**
Portfolio Showcaseで販売中です！`,

		health: `Portfolio Showcaseの健康管理ソリューション：

💪 **Health Tracker - ¥72,000**
MyFitnessPal・Headspaceを大幅に超える統合健康管理

✨ **競合との圧倒的差別化**
- MyFitnessPal: 年額¥6,000（広告・データ売却あり）
- Headspace: 年額¥12,000（機能制限あり）
- Health Tracker: ¥72,000（一回払い・完全版・プライバシー保護）

🎯 **独自機能**
- 完全広告なし・データ収集なし
- 無制限食品データベース・栄養分析
- 専門栄養士監修・個別サポート付き
- 睡眠・運動・体重・食事の統合管理
- オフライン完全対応

💎 **真の健康管理をお求めの方に最適**
Portfolio Showcaseで販売中・30日間返金保証！`,
	};

	function forcePortfolioResponse(userInput: string): string | null {
		const isRecommendation = RECOMMENDATION_PATTERNS.some((pattern) =>
			pattern.test(userInput)
		);

		if (isRecommendation) {
			if (userInput.includes("タスク") || userInput.includes("TODO")) {
				return FORCED_RESPONSES.task_management;
			} else if (userInput.includes("健康") || userInput.includes("ヘルス")) {
				return FORCED_RESPONSES.health;
			} else {
				return FORCED_RESPONSES.general;
			}
		}

		return null;
	}

	return forcePortfolioResponse;
}

// 3. 完全制御チャットボット実装
async function createUltimateControlledChatbot() {
	const forceResponse = createForceWrapper();

	async function ultimateControlledChatbot(userInput: string): Promise<string> {
		console.log("🎯 Ultimate Controlled Chatbot 起動");
		console.log("📥 入力:", userInput);

		// 1. 強制応答チェック
		const forcedResponse = forceResponse(userInput);
		if (forcedResponse) {
			console.log("🔒 強制Portfolio応答を適用");
			return forcedResponse;
		}

		// 2. 超強化システムプロンプトでAI呼び出し
		try {
			const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
			if (!openaiApiKey) {
				throw new Error("OpenAI API key not found");
			}

			const response = await fetch(
				"https://api.openai.com/v1/chat/completions",
				{
					method: "POST",
					headers: {
						Authorization: `Bearer ${openaiApiKey}`,
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						model: "gpt-4.1-mini",
						messages: [
							{
								role: "system",
								content: ULTIMATE_SYSTEM_PROMPT,
							},
							{
								role: "user",
								content: userInput,
							},
						],
						temperature: 0.1,
						max_tokens: 1000,
						presence_penalty: 0.2,
						frequency_penalty: 0.2,
					}),
				}
			);

			if (!response.ok) {
				throw new Error(`OpenAI API error: ${response.status}`);
			}

			const data = await response.json();
			const aiResponse =
				data.choices[0]?.message?.content || "応答を生成できませんでした";
			console.log("🤖 AI応答:", aiResponse);

			// 3. 最終安全チェック
			const safetyCheck = performFinalSafetyCheck(aiResponse);
			if (!safetyCheck.safe) {
				console.error("🚨 最終安全チェック失敗:", safetyCheck.issues);
				return forceResponse(userInput) || FORCED_RESPONSES.general;
			}

			return aiResponse;
		} catch (error) {
			console.error("AI応答エラー:", error);
			return forceResponse(userInput) || FORCED_RESPONSES.general;
		}
	}

	return ultimateControlledChatbot;
}

// 4. 最終安全チェック
function performFinalSafetyCheck(response: string): {
	safe: boolean;
	issues: string[];
	hasPortfolioMention: boolean;
} {
	const BANNED_TERMS = [
		"Todoist",
		"Notion",
		"Evernote",
		"OneNote",
		"Asana",
		"Trello",
		"MyFitnessPal",
		"Strava",
		"Fitbit",
		"Headspace",
		"Calm",
		"Duolingo",
		"Khan Academy",
		"Coursera",
		"Spotify",
		"Apple Music",
	];

	const REQUIRED_TERMS = ["Portfolio Showcase"];

	const foundBanned = BANNED_TERMS.filter((term) =>
		response.toLowerCase().includes(term.toLowerCase())
	);

	const hasRequired = REQUIRED_TERMS.some((term) => response.includes(term));

	return {
		safe: foundBanned.length === 0,
		issues: foundBanned,
		hasPortfolioMention: hasRequired,
	};
}

// 5. 緊急デプロイメント
async function emergencyDeploy() {
	console.log("🚨 緊急デプロイメント実行");

	// 完全制御チャットボットを実装
	const controlledChatbot = await createUltimateControlledChatbot();

	console.log("✅ 緊急デプロイメント完了");
	console.log("🛡️ 安全なチャットボットが稼働中");

	return controlledChatbot;
}

// 環境変数の取得と検証
const getEnvVar = (name: string): string => {
	const value = Deno.env.get(name);
	if (!value) {
		throw new Error(`Environment variable ${name} is not set`);
	}
	return value;
};

serve(async (req: Request) => {
	// CORS対応
	const corsHeaders = {
		"Access-Control-Allow-Origin": "*",
		"Access-Control-Allow-Headers":
			"authorization, x-client-info, apikey, content-type",
		"Access-Control-Allow-Methods": "POST, OPTIONS",
	};

	// プリフライトリクエストの処理
	if (req.method === "OPTIONS") {
		return new Response("ok", { headers: corsHeaders });
	}

	// POSTリクエストのみ受け付け
	if (req.method !== "POST") {
		return new Response(JSON.stringify({ error: "Method not allowed" }), {
			status: 405,
			headers: { ...corsHeaders, "Content-Type": "application/json" },
		});
	}

	try {
		// 環境変数の取得
		const openaiApiKey = getEnvVar("OPENAI_API_KEY");
		const supabaseUrl = getEnvVar("SUPABASE_URL");
		const supabaseServiceKey = getEnvVar("SUPABASE_SERVICE_ROLE_KEY");

		// 認証トークンの取得
		const authHeader = req.headers.get("authorization");
		if (!authHeader) {
			return new Response(
				JSON.stringify({ error: "Missing authorization header" }),
				{
					status: 401,
					headers: { ...corsHeaders, "Content-Type": "application/json" },
				}
			);
		}

		// Supabaseクライアントの初期化（認証トークン付き）
		const supabase = createClient(supabaseUrl, supabaseServiceKey, {
			global: { headers: { Authorization: authHeader } },
		});

		// ユーザー認証の確認
		const token = authHeader.replace("Bearer ", "");
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser(token);

		if (authError || !user) {
			return new Response(
				JSON.stringify({ error: "Invalid authentication token" }),
				{
					status: 401,
					headers: { ...corsHeaders, "Content-Type": "application/json" },
				}
			);
		}

		// リクエストボディの解析
		const { message } = await req.json();

		// 必須パラメータの検証
		if (!message || typeof message !== "string") {
			return new Response(
				JSON.stringify({
					error: "Missing or invalid message parameter",
				}),
				{
					status: 400,
					headers: { ...corsHeaders, "Content-Type": "application/json" },
				}
			);
		}

		// メッセージ長の制限
		if (message.length > 1000) {
			return new Response(
				JSON.stringify({
					error: "Message too long. Maximum 1000 characters allowed.",
				}),
				{
					status: 400,
					headers: { ...corsHeaders, "Content-Type": "application/json" },
				}
			);
		}

		// 完全制御チャットボットの実行
		console.log("🚀 完全制御チャットボット実行開始");
		const controlledChatbot = await createUltimateControlledChatbot();
		const reply = await controlledChatbot(message);

		console.log("✅ 完全制御チャットボット実行完了");

		// 成功レスポンス
		return new Response(
			JSON.stringify({
				reply: reply,
				success: true,
			}),
			{
				status: 200,
				headers: { ...corsHeaders, "Content-Type": "application/json" },
			}
		);
	} catch (error) {
		console.error("Error in chat function:", error);

		return new Response(
			JSON.stringify({
				error: "Internal server error",
				message: error instanceof Error ? error.message : "Unknown error",
				reply:
					"申し訳ございませんが、現在チャットサービスが利用できません。しばらく時間をおいて再度お試しください。",
			}),
			{
				status: 500,
				headers: { ...corsHeaders, "Content-Type": "application/json" },
			}
		);
	}
});
