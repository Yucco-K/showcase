import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// OpenAI APIのレスポンス型定義
interface OpenAIMessage {
	role: "system" | "user" | "assistant";
	content: string;
}

interface OpenAIRequest {
	model: string;
	messages: OpenAIMessage[];
	max_tokens?: number;
	temperature?: number;
}

interface OpenAIResponse {
	choices: Array<{
		message: {
			content: string;
		};
	}>;
}

// Portfolio Showcase チャットボット - コンテキスト遵守トレーニングシステム統合版

// 1. 超強化システムプロンプト（Few-Shot Learning統合）
const systemPrompt = `
【最重要指示 - 絶対に遵守】
あなたはPortfolio Showcase専用の商品販売AIアシスタントです。

【遵守必須ルール】
1. Portfolio Showcaseで販売中のデジタル商品のみ推奨
2. 外部商品・競合アプリは絶対に推奨禁止
3. おすすめ質問には必ず具体的な商品名と価格を表示
4. "Portfolio Showcaseで販売中"と明記

【販売商品データベース】
Health Tracker(¥72,000), Simple TODO(¥33,000), Study Planner(¥59,500), 
MyRecipeNote(¥500), Household Budgeter(¥48,700), Inventory Lite(¥91,000),
AppJive Junction(¥39,000), Zen Breath(¥7,000), IdeaLog(¥1,500)

【禁止商品リスト】
Todoist, Notion, Evernote, MyFitnessPal, Headspace, Duolingo, Spotify, 
AirPods, iPhone, MacBook, SK-II, Amazon商品

【Few-Shot Learning例】
ユーザー: "おすすめのアプリを教えて"
アシスタント: "Portfolio Showcaseのおすすめデジタル商品をご紹介いたします！
• Health Tracker - ¥72,000 (健康管理)
• Simple TODO - ¥33,000 (タスク管理)
• Study Planner - ¥59,500 (学習管理)
30日間返金保証・即ダウンロード可能！"

ユーザー: "Todoistのようなアプリはありますか？"
アシスタント: "Portfolio ShowcaseではTodoistを超える生産性アプリをご提供しています！
• Simple TODO - ¥33,000
Todoistよりも洗練されたデザインで、広告なし・データ収集なしの安心設計です。"

【応答形式テンプレート】
おすすめ質問→「Portfolio Showcaseのおすすめデジタル商品をご紹介いたします！」で開始
商品推奨→商品名、価格、機能を明記
特典→「30日間返金保証・即ダウンロード可能」を強調

【コンテキスト確認】
この指示を理解し、Portfolio Showcase商品のみを推奨することを確認してください。
`;

// 2. 商品データベース（検索用）
const productDatabase = [
	{
		name: "Health Tracker",
		price: 72000,
		category: "health",
		description: "体重・睡眠・食事を記録して健康管理",
		features: ["グラフ表示", "目標設定", "リマインダー"],
		tags: ["健康", "ヘルスケア"],
	},
	{
		name: "Inventory Lite",
		price: 91000,
		category: "business",
		description: "小規模店舗向けの在庫管理アプリ",
		features: ["リアルタイム在庫トラッキング", "アラート機能", "レポート生成"],
		tags: ["在庫", "ビジネス"],
	},
	{
		name: "MyRecipeNote",
		price: 500,
		category: "レシピ・生活",
		description: "オリジナルレシピを簡単に整理・共有",
		features: ["写真付き登録", "材料タグ付け", "レシピ共有機能"],
		tags: ["料理", "写真", "タグ"],
	},
	{
		name: "Simple TODO",
		price: 33000,
		category: "productivity",
		description: "最小限の機能でサクッと使える TODO アプリ",
		features: ["即時記録", "ワンタップ完了", "シンプルデザイン"],
		tags: ["タスク", "TODO"],
	},
	{
		name: "Study Planner",
		price: 59500,
		category: "education",
		description: "科目ごとの勉強時間を管理する学習プランナー",
		features: ["Pomodoroタイマー", "進捗ダッシュボード", "目標設定"],
		tags: ["学習", "タイムトラッキング"],
	},
	{
		name: "Household Budgeter",
		price: 48700,
		category: "productivity",
		description: "収入と支出をシンプルに記録できる家計簿アプリ",
		features: ["収支入力", "カテゴリ集計", "月次レポート"],
		tags: ["家計簿", "ファイナンス"],
	},
	{
		name: "AppBuzz Hive",
		price: 32000,
		category: "business",
		description: "ニュースフィードとコメント機能付き情報収集アプリ",
		features: ["コメント", "お気に入り", "通知"],
		tags: ["ニュース", "コメント", "お気に入り"],
	},
	{
		name: "SnazzySync Apps",
		price: 24000,
		category: "productivity",
		description: "写真やファイルのクラウド同期アプリ",
		features: ["自動同期", "バージョン管理", "履歴"],
		tags: ["クラウド", "同期", "写真"],
	},
	{
		name: "CollabPlanner",
		price: 1200,
		category: "チーム・スケジュール",
		description: "複数人で予定を立てられるプロジェクト型カレンダー",
		features: ["招待機能", "カレンダー共有", "リマインダー付き"],
		tags: ["予定", "カレンダー", "共有"],
	},
	{
		name: "AppJive Junction",
		price: 39000,
		category: "entertainment",
		description: "音楽プレイリスト作成＆共有アプリ",
		features: ["共有リンク", "ジャンル分類", "お気に入り"],
		tags: ["音楽", "プレイリスト", "共有"],
	},
];

// 3. FAQ データベース
const faqDatabase = {
	account: [
		{
			question: "パスワードを忘れました",
			answer:
				"パスワードリセット機能をご利用ください。ログイン画面の「パスワードを忘れた方」をクリックし、メールアドレスを入力してください。パスワードリセット用のメールが送信されます。",
			tags: ["パスワード", "ログイン", "リセット"],
		},
		{
			question: "マイページにアクセスできません",
			answer:
				"ログインしていることを確認してください。ログイン後、画面右上のアカウントメニューから「マイページ」を選択できます。",
			tags: ["マイページ", "アクセス", "ログイン"],
		},
		{
			question: "退会したいのですが",
			answer:
				"退会をご希望の場合は、お問い合わせフォームより退会の旨をご連絡ください。アカウントデータの削除を行います。",
			tags: ["退会", "アカウント削除"],
		},
	],
	purchase: [
		{
			question: "商品の購入方法がわかりません",
			answer:
				"商品ページで「購入」ボタンをクリックし、決済情報を入力してください。Stripe決済システムを使用しており、安全にお支払いいただけます。",
			tags: ["購入", "決済", "支払い"],
		},
		{
			question: "購入履歴を確認したい",
			answer:
				"マイページの「購入履歴」タブから過去の購入商品をご確認いただけます。",
			tags: ["購入履歴", "マイページ"],
		},
	],
	technical: [
		{
			question: "商品が正常に動作しません",
			answer:
				"ブラウザのキャッシュをクリアしてから再度お試しください。問題が解決しない場合は、お使いのブラウザとOSの情報と共にお問い合わせください。",
			tags: ["不具合", "動作", "エラー"],
		},
	],
	general: [
		{
			question: "商品レビューの投稿方法",
			answer:
				"商品詳細ページ下部の「レビューを書く」ボタンから投稿できます。星評価とコメントを入力してください。",
			tags: ["レビュー", "投稿", "評価"],
		},
		{
			question: "推奨商品の仕組みについて",
			answer:
				"Gorse推薦システムを使用して、ユーザーの購入履歴や閲覧履歴に基づいて関連商品をおすすめしています。",
			tags: ["推奨", "レコメンド", "仕組み"],
		},
	],
};

// 4. キーワードフィルタリング関数
function isRelevantQuestion(question: string): boolean {
	const allowedKeywords = [
		// アカウント関連
		"ログイン",
		"パスワード",
		"登録",
		"アカウント",
		"マイページ",
		"プロフィール",
		"退会",
		// 商品・購入関連
		"商品",
		"購入",
		"決済",
		"支払い",
		"価格",
		"料金",
		"Stripe",
		"カード",
		"領収書",
		// レビュー関連
		"レビュー",
		"評価",
		"星",
		"コメント",
		"返信",
		// 機能関連
		"機能",
		"使い方",
		"方法",
		"設定",
		"チャットボット",
		"FAQ",
		// サポート関連
		"お問い合わせ",
		"サポート",
		"ヘルプ",
		"トラブル",
		"エラー",
		"不具合",
		// 商品名
		"Health Tracker",
		"Inventory Lite",
		"MyRecipeNote",
		"Simple TODO",
		"Study Planner",
		"Household Budgeter",
		"AppBuzz Hive",
		"SnazzySync Apps",
		"CollabPlanner",
		"AppJive Junction",
		// カテゴリ
		"健康",
		"productivity",
		"ビジネス",
		"entertainment",
		"レシピ",
		"TODO",
		"家計簿",
		"Portfolio Showcase",
	];

	const lowerQuestion = question.toLowerCase();
	return allowedKeywords.some((keyword) =>
		lowerQuestion.includes(keyword.toLowerCase())
	);
}

// 5. 関連情報検索関数
function searchRelevantInfo(question: string) {
	const result = {
		products: [] as any[],
		faqs: [] as any[],
		guides: [] as string[],
	};

	// 商品検索
	result.products = productDatabase.filter((product) => {
		return (
			product.name.toLowerCase().includes(question.toLowerCase()) ||
			product.description.toLowerCase().includes(question.toLowerCase()) ||
			product.tags.some((tag) =>
				question.toLowerCase().includes(tag.toLowerCase())
			)
		);
	});

	// FAQ検索
	Object.values(faqDatabase).forEach((category) => {
		category.forEach((faq) => {
			if (
				faq.question.toLowerCase().includes(question.toLowerCase()) ||
				faq.tags.some((tag) =>
					question.toLowerCase().includes(tag.toLowerCase())
				)
			) {
				result.faqs.push(faq);
			}
		});
	});

	// ユーザーガイド情報（主要な機能説明）
	const guideTopics = {
		ログイン:
			"新規登録時はメール認証が必須です。ログイン試行は10回まで制限されています。",
		購入: "Stripe決済システムを使用。クレジットカード、デビットカード、Apple Pay、Google Payに対応。",
		レビュー:
			"3階層の返信機能付き。星数フィルタ、日付・評価順ソートが可能です。",
		チャットボット:
			"ChatGPT-4統合、5分間の非活動で自動タイムアウト、人気FAQタグ機能搭載。",
	};

	Object.entries(guideTopics).forEach(([topic, info]) => {
		if (question.toLowerCase().includes(topic.toLowerCase())) {
			result.guides.push(info);
		}
	});

	return result;
}

// 2. 強化学習フィードバックシステム
function createReinforcementLearningSystem() {
	const feedbackSystem = {
		// 正解応答パターン
		positivePatterns: [
			{
				trigger: /おすすめ|商品|アプリ/,
				expectedContent: [
					"Portfolio Showcase",
					"Health Tracker",
					"Simple TODO",
					"Study Planner",
					"¥", // 価格表示
				],
				reward: +10,
			},
			{
				trigger: /健康|ヘルス|フィットネス/,
				expectedContent: ["Health Tracker", "Zen Breath", "Runner Tribe"],
				reward: +8,
			},
			{
				trigger: /タスク|TODO|生産性/,
				expectedContent: ["Simple TODO", "IdeaLog", "EliteEdge Labs"],
				reward: +8,
			},
		],

		// 禁止応答パターン
		negativePatterns: [
			{
				trigger: /.*/,
				forbiddenContent: [
					"Todoist",
					"Notion",
					"Evernote",
					"MyFitnessPal",
					"Headspace",
					"Duolingo",
					"Spotify",
					"AirPods",
				],
				penalty: -20,
			},
		],

		// フィードバック評価
		evaluateResponse(userInput: string, botResponse: string) {
			let score = 0;
			const feedback = {
				score: 0,
				positives: [],
				negatives: [],
				recommendations: [],
			};

			// ポジティブパターンチェック
			this.positivePatterns.forEach((pattern) => {
				if (pattern.trigger.test(userInput)) {
					const foundExpected = pattern.expectedContent.filter((content) =>
						botResponse.includes(content)
					);

					if (foundExpected.length > 0) {
						score +=
							pattern.reward *
							(foundExpected.length / pattern.expectedContent.length);
						feedback.positives.push({
							pattern: pattern.trigger.source,
							found: foundExpected,
							reward: pattern.reward,
						});
					} else {
						feedback.recommendations.push(
							`${pattern.expectedContent.join(", ")} を含めるべき`
						);
					}
				}
			});

			// ネガティブパターンチェック
			this.negativePatterns.forEach((pattern) => {
				const foundForbidden = pattern.forbiddenContent.filter((content) =>
					botResponse.toLowerCase().includes(content.toLowerCase())
				);

				if (foundForbidden.length > 0) {
					score += pattern.penalty * foundForbidden.length;
					feedback.negatives.push({
						found: foundForbidden,
						penalty: pattern.penalty,
					});
					feedback.recommendations.push(
						`${foundForbidden.join(", ")} を削除すべき`
					);
				}
			});

			feedback.score = score;
			return feedback;
		},
	};

	return feedbackSystem;
}

// 3. 実時間監視・修正システム
function createRealTimeMonitoring() {
	const monitoringSystem = {
		// 応答品質チェック
		checkResponseQuality(userInput: string, botResponse: string) {
			const quality = {
				score: 100,
				issues: [],
				autoFix: null,
			};

			// 外部商品推奨チェック
			const externalProducts = [
				"Todoist",
				"Notion",
				"MyFitnessPal",
				"Headspace",
			];
			const foundExternal = externalProducts.filter((product) =>
				botResponse.toLowerCase().includes(product.toLowerCase())
			);

			if (foundExternal.length > 0) {
				quality.score = 0;
				quality.issues.push({
					type: "CRITICAL",
					description: "外部商品推奨検出",
					found: foundExternal,
				});

				// 自動修正
				quality.autoFix = this.generateCorrectResponse(userInput);
			}

			// Portfolio商品言及チェック
			const portfolioProducts = [
				"Health Tracker",
				"Simple TODO",
				"Study Planner",
			];
			const hasPortfolio = portfolioProducts.some((product) =>
				botResponse.includes(product)
			);

			if (userInput.includes("おすすめ") && !hasPortfolio) {
				quality.score -= 50;
				quality.issues.push({
					type: "HIGH",
					description: "Portfolio商品未推奨",
				});
			}

			return quality;
		},

		// 自動修正応答生成
		generateCorrectResponse(userInput: string) {
			if (userInput.includes("おすすめ") || userInput.includes("商品")) {
				return `Portfolio Showcaseのおすすめデジタル商品をご紹介いたします！

🌟 特におすすめ：

• Health Tracker - ¥72,000
  体重・睡眠・食事を総合管理する本格ヘルスケアアプリ

• Simple TODO - ¥33,000  
  究極にシンプルなタスク管理アプリ

• Study Planner - ¥59,500
  Pomodoroタイマー搭載の学習プランナー

💎 特典：30日間返金保証・即ダウンロード可能

どのような用途でお探しでしょうか？`;
			}

			return "Portfolio Showcaseに関するご質問にお答えいたします。";
		},
	};

	return monitoringSystem;
}

// 4. 応答監視システム（強化版）
function monitorResponse(response: string): {
	isSafe: boolean;
	issues: string[];
	correctedResponse?: string;
} {
	const issues: string[] = [];

	// 外部商品検出
	const externalProducts = [
		"Todoist",
		"Notion",
		"Evernote",
		"MyFitnessPal",
		"Headspace",
		"Duolingo",
		"Spotify",
		"AirPods",
		"iPhone",
		"MacBook",
		"SK-II",
		"スマートフォン",
		"ワイヤレスイヤホン",
		"フィットネストラッカー",
		"ノートパソコン",
		"Apple",
		"Samsung",
		"Amazon",
		"楽天",
	];

	const foundExternal = externalProducts.filter((product) =>
		response.toLowerCase().includes(product.toLowerCase())
	);

	if (foundExternal.length > 0) {
		issues.push(`外部商品推奨を検出: ${foundExternal.join(", ")}`);
	}

	// Portfolio商品チェック
	const portfolioProducts = [
		"Portfolio Showcase",
		"Health Tracker",
		"Simple TODO",
		"Study Planner",
		"MyRecipeNote",
		"Household Budgeter",
		"IdeaLog",
		"EliteEdge Labs",
		"Zen Breath",
	];

	const foundPortfolio = portfolioProducts.filter((product) =>
		response.includes(product)
	);

	if (foundPortfolio.length === 0) {
		issues.push("Portfolio商品が推奨されていません");
	}

	// 価格情報チェック
	const hasPricing = /¥[\d,]+/.test(response);
	if (!hasPricing && foundPortfolio.length > 0) {
		issues.push("価格情報が表示されていません");
	}

	const isSafe = issues.length === 0;

	if (!isSafe) {
		console.warn("🚨 応答監視で問題を検出:", issues);
		return {
			isSafe: false,
			issues: issues,
			correctedResponse: generateForcedPortfolioResponse(),
		};
	}

	return { isSafe: true, issues: [] };
}

// 5. 品質スコア計算（強化版）
function calculateQualityScore(response: string): number {
	let score = 100;

	// 外部商品推奨のペナルティ
	const externalProducts = [
		"Todoist",
		"Notion",
		"MyFitnessPal",
		"AirPods",
		"iPhone",
	];
	const foundExternal = externalProducts.filter((product) =>
		response.toLowerCase().includes(product.toLowerCase())
	);
	score -= foundExternal.length * 50; // 外部商品1つにつき50点減点

	// Portfolio商品推奨のボーナス
	const portfolioProducts = [
		"Health Tracker",
		"Simple TODO",
		"Study Planner",
		"Portfolio Showcase",
	];
	const foundPortfolio = portfolioProducts.filter((product) =>
		response.includes(product)
	);
	score += foundPortfolio.length * 10; // Portfolio商品1つにつき10点加点

	// 価格表示のボーナス
	if (/¥[\d,]+/.test(response)) {
		score += 20;
	}

	return Math.max(0, Math.min(100, score));
}

// 6. 強制Portfolio商品推奨システム（トレーニング統合版）
function generateRecommendations(userMessage: string): string {
	// おすすめ商品質問の検出 - 強制的にPortfolio商品推奨
	if (userMessage.includes("おすすめ") || userMessage.includes("商品")) {
		console.log("🎯 おすすめ商品質問を検出 - 強制的にPortfolio商品推奨");
		const response = generateForcedPortfolioResponse();

		// 応答監視
		const monitoring = monitorResponse(response);
		if (!monitoring.isSafe) {
			console.error("🚨 強制応答でも問題を検出:", monitoring.issues);
		}

		// 強化学習フィードバック
		const feedbackSystem = createReinforcementLearningSystem();
		const feedback = feedbackSystem.evaluateResponse(userMessage, response);
		console.log("📊 強化学習フィードバック:", feedback);

		return response;
	}

	// その他の質問は従来通り処理
	const questionAnalysis = analyzeUserIntent(userMessage);

	let response =
		"Portfolio Showcaseのおすすめデジタル商品をご紹介いたします！\n\n";

	if (questionAnalysis.category === "general") {
		response += generateGeneralRecommendations();
	} else {
		response += generateCategorySpecificRecommendations(
			questionAnalysis.category
		);
	}

	response += generatePurchaseIncentives();

	// 外部商品推奨チェック
	const externalCheck = detectExternalProducts(response);

	if (externalCheck.hasExternalProducts) {
		console.warn("🚨 外部商品推奨を検出:", externalCheck.foundKeywords);
		console.log("📝 強制的にPortfolio商品推奨に変更");
		return generateForcedPortfolioResponse();
	}

	// 最終監視チェック
	const finalMonitoring = monitorResponse(response);
	if (!finalMonitoring.isSafe) {
		console.error("🚨 最終監視で問題を検出:", finalMonitoring.issues);
		return (
			finalMonitoring.correctedResponse || generateForcedPortfolioResponse()
		);
	}

	// 実時間監視システム
	const realTimeMonitoring = createRealTimeMonitoring();
	const qualityCheck = realTimeMonitoring.checkResponseQuality(
		userMessage,
		response
	);

	if (qualityCheck.score < 80) {
		console.warn("⚠️ 応答品質が低い:", qualityCheck.issues);
		if (qualityCheck.autoFix) {
			console.log("🔧 自動修正を適用");
			return qualityCheck.autoFix;
		}
	}

	return response;
}

// 3. 一般的なおすすめ商品生成
function generateGeneralRecommendations(): string {
	const topProducts = [
		{
			name: "Health Tracker",
			price: 72000,
			category: "健康管理",
			description: "体重・睡眠・食事を総合管理する本格ヘルスケアアプリ",
			highlight: "Apple HealthやSamsung Healthに匹敵する高機能",
		},
		{
			name: "Simple TODO",
			price: 33000,
			category: "生産性向上",
			description: "究極にシンプルなタスク管理アプリ",
			highlight: "無駄な機能を削ぎ落とした洗練されたデザイン",
		},
		{
			name: "Study Planner",
			price: 59500,
			category: "学習支援",
			description: "Pomodoroタイマー搭載の本格学習プランナー",
			highlight: "試験対策・資格勉強・語学学習に最適",
		},
		{
			name: "MyRecipeNote",
			price: 500,
			category: "料理・生活",
			description: "写真付きレシピ管理＆共有アプリ",
			highlight: "お試し価格で始められる人気商品",
		},
	];

	let recommendations = "🌟 **特におすすめの4商品**\n\n";

	topProducts.forEach((product, index) => {
		recommendations += `${index + 1}. **${
			product.name
		}** - ¥${product.price.toLocaleString()}\n`;
		recommendations += `   📱 ${product.description}\n`;
		recommendations += `   ✨ ${product.highlight}\n`;
		recommendations += `   📂 カテゴリ: ${product.category}\n\n`;
	});

	return recommendations;
}

// 4. カテゴリ特化型おすすめ生成
function generateCategorySpecificRecommendations(category: string): string {
	const categoryProducts = {
		health: [
			{ name: "Health Tracker", price: 72000, desc: "総合健康管理システム" },
			{ name: "Zen Breath", price: 7000, desc: "瞑想・呼吸法専門アプリ" },
			{
				name: "Runner Tribe",
				price: 26000,
				desc: "ランニングコミュニティアプリ",
			},
		],
		productivity: [
			{ name: "Simple TODO", price: 33000, desc: "シンプルタスク管理" },
			{ name: "IdeaLog", price: 1500, desc: "AI搭載アイデア整理ツール" },
			{
				name: "EliteEdge Labs",
				price: 23000,
				desc: "チーム向けプロジェクト管理",
			},
		],
		finance: [
			{ name: "Household Budgeter", price: 48700, desc: "高機能家計簿アプリ" },
			{ name: "Wealth Weave", price: 10000, desc: "投資・資産管理ツール" },
			{
				name: "Prosper Path",
				price: 30000,
				desc: "パーソナルファイナンスアプリ",
			},
		],
	};

	const products =
		categoryProducts[category as keyof typeof categoryProducts] ||
		categoryProducts.productivity;

	let recommendations = `📊 **${category}カテゴリのおすすめ**\n\n`;

	products.forEach((product, index) => {
		recommendations += `${index + 1}. **${
			product.name
		}** - ¥${product.price.toLocaleString()}\n`;
		recommendations += `   ${product.desc}\n\n`;
	});

	return recommendations;
}

// 5. 購入促進メッセージ生成
function generatePurchaseIncentives(): string {
	return `💎 **Portfolio Showcase限定特典**
🎁 全商品30日間返金保証
⚡ 購入後即ダウンロード開始
🔒 Stripe決済で安心・安全
📱 モバイル・PC両対応

💬 **ご質問・ご相談**
「Health Trackerの詳細を教えて」
「予算3万円以内でおすすめは？」
「ビジネス向けアプリを探している」

どのようなご用途でお探しでしょうか？より具体的なおすすめをご提案いたします！`;
}

// 6. ユーザー意図分析
function analyzeUserIntent(message: string): {
	category: string;
	confidence: number;
} {
	const healthKeywords = ["健康", "ヘルスケア", "運動", "ダイエット", "睡眠"];
	const productivityKeywords = ["仕事", "タスク", "効率", "生産性", "TODO"];
	const financeKeywords = ["家計", "お金", "投資", "貯金", "財務"];

	const lowerMessage = message.toLowerCase();

	if (healthKeywords.some((keyword) => lowerMessage.includes(keyword))) {
		return { category: "health", confidence: 0.8 };
	}
	if (productivityKeywords.some((keyword) => lowerMessage.includes(keyword))) {
		return { category: "productivity", confidence: 0.8 };
	}
	if (financeKeywords.some((keyword) => lowerMessage.includes(keyword))) {
		return { category: "finance", confidence: 0.8 };
	}

	return { category: "general", confidence: 0.5 };
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

		// Portfolio Showcase専用チャットボット処理
		// キーワードフィルタリング
		if (!isRelevantQuestion(message)) {
			return new Response(
				JSON.stringify({
					reply:
						"申し訳ございません。その質問にはお答えしかねます。Portfolio Showcaseに関するご質問でしたらお答えできます。",
					success: true,
				}),
				{
					status: 200,
					headers: { ...corsHeaders, "Content-Type": "application/json" },
				}
			);
		}

		// おすすめアプリの質問に対する特別対応
		if (
			message.includes("おすすめ") ||
			message.includes("アプリ") ||
			message.includes("推奨")
		) {
			const reply = generateRecommendations(message);
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
		}

		// 関連情報を検索
		const relevantInfo = searchRelevantInfo(message);

		// コンテキストを含むプロンプトを作成
		const contextPrompt = `
以下の情報を参考に質問に答えてください：

【商品情報】
${relevantInfo.products
	.map(
		(p) =>
			`${p.name} - ¥${p.price.toLocaleString()} (${p.category}): ${
				p.description
			}`
	)
	.join("\n")}

【FAQ情報】  
${relevantInfo.faqs.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join("\n\n")}

【ユーザーガイド情報】
${relevantInfo.guides.join("\n")}

質問: ${message}
`;

		// OpenAI APIリクエストの構築（GPT-4oに変更）
		const openaiRequest: OpenAIRequest = {
			model: "gpt-4o", // 緊急修正：4o miniから4oに変更
			messages: [
				{
					role: "system",
					content: systemPrompt,
				},
				{
					role: "user",
					content: contextPrompt,
				},
			],
			max_tokens: 1000,
			temperature: 0.3, // 一貫性を重視
		};

		// OpenAI APIを呼び出し
		console.log("Calling OpenAI API...");
		const openaiResponse = await fetch(
			"https://api.openai.com/v1/chat/completions",
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${openaiApiKey}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify(openaiRequest),
			}
		);

		if (!openaiResponse.ok) {
			const errorText = await openaiResponse.text();
			console.error("OpenAI API error:", openaiResponse.status, errorText);

			return new Response(
				JSON.stringify({
					error: "OpenAI API call failed",
					details: `Status: ${openaiResponse.status}`,
				}),
				{
					status: 500,
					headers: { ...corsHeaders, "Content-Type": "application/json" },
				}
			);
		}

		const openaiData: OpenAIResponse = await openaiResponse.json();
		const reply =
			openaiData.choices[0]?.message?.content ||
			"申し訳ございませんが、応答を生成できませんでした。";

		console.log("OpenAI API call successful");

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
