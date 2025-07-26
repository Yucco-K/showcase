#!/usr/bin/env -S deno run --allow-net --allow-env

/**
 * Portfolio Showcase 商品データ埋め込み生成スクリプト
 *
 * 商品データをOpenAI Embeddings APIでベクトル化し、
 * Supabase pgvectorテーブルに保存する
 */

interface Product {
	id: string;
	name: string;
	description: string;
	long_desc: string;
	price: number;
	category: string;
	tags: string[];
	features: string[];
	requirements: string[];
}

interface EmbeddingResponse {
	data: Array<{
		embedding: number[];
	}>;
}

// 商品データ（全30件）
const PRODUCTS: Product[] = [
	{
		id: "a2471462-9461-48dd-ad52-a5b9318ae0bc",
		name: "AppBuzz Hive",
		description: "ニュースフィードとコメント機能付き情報収集アプリ",
		long_desc:
			"AppBuzz Hive は、ニュースや記事をカテゴリ別にまとめ、コメント・お気に入り機能付きで自分だけの情報ハブにできます。",
		price: 32000,
		category: "business",
		tags: ["ニュース", "コメント", "お気に入り"],
		features: ["コメント", "お気に入り", "通知"],
		requirements: ["ウェブ連携"],
	},
	{
		id: "36f65661-3a74-47df-b4f3-6d5a22b54e17",
		name: "MyRecipeNote",
		description: "オリジナルレシピを簡単に整理・共有",
		long_desc:
			"「MyRecipeNote」は、お気に入りの料理レシピを登録し、写真付きで保存・共有できるアプリです。食材ごとのタグ付けや、調理時間・難易度などの管理も可能。家族や友人にリンクでシェアすることもできます。",
		price: 500,
		category: "レシピ・生活",
		tags: ["料理", "写真", "タグ"],
		features: ["写真付き登録", "材料タグ付け", "レシピ共有機能"],
		requirements: ["会員登録が必要", "ブラウザ環境推奨"],
	},
	{
		id: "12b2111a-f717-4414-adf8-e045d7b9e2cc",
		name: "SnazzySync Apps",
		description: "写真やファイルのクラウド同期アプリ",
		long_desc:
			"SnazzySync Apps は、スマホと PC 間で指定フォルダの写真や書類を自動でクラウド同期し、バージョン管理と履歴確認も可能です。",
		price: 24000,
		category: "productivity",
		tags: ["クラウド", "同期", "写真"],
		features: ["自動同期", "バージョン管理", "履歴"],
		requirements: ["API キー必要"],
	},
	{
		id: "23382510-1131-4ab1-a0d4-af94efc9188c",
		name: "CollabPlanner",
		description: "複数人で予定を立てられるプロジェクト型カレンダー",
		long_desc:
			"飲み会・旅行・チーム作業など、複数人で予定を調整・共有するためのカレンダーアプリ。タスク割り振り、コメント機能、リマインダー送信などを備え、プロジェクト計画をスムーズに進行可能です。",
		price: 1200,
		category: "チーム・スケジュール",
		tags: ["予定", "カレンダー", "共有"],
		features: ["招待機能", "カレンダー共有", "リマインダー付き"],
		requirements: ["メールアドレス登録必須"],
	},
	{
		id: "4087a2e4-0652-43b5-a6e0-01238b4ca740",
		name: "AppJive Junction",
		description: "音楽プレイリスト作成＆共有アプリ",
		long_desc:
			"AppJive Junction は、自分だけの音楽プレイリストを作成し、URL で友人にシェア。ジャンルタグやお気に入り管理で音楽の楽しみを広げます。",
		price: 39000,
		category: "entertainment",
		tags: ["音楽", "プレイリスト", "共有"],
		features: ["共有リンク", "ジャンル分類", "お気に入り"],
		requirements: ["ミュージック API 連携"],
	},
	{
		id: "f731b595-0825-4c62-9cf0-66a8cda744ee",
		name: "ByteBound",
		description: "コードスニペットを管理・共有できるプログラマー向けアプリ",
		long_desc:
			"ByteBound は、よく使うコードスニペットを分類・保存し、チームと共有・検索・タグ管理ができる開発支援ツールです。",
		price: 5000,
		category: "productivity",
		tags: ["コード", "スニペット", "タグ"],
		features: ["タグ管理", "共有", "検索"],
		requirements: ["Git 連携"],
	},
	{
		id: "49f86325-2e78-4013-8a35-6ef9f59c7a39",
		name: "Pixel Pulse Nexus",
		description: "健康データと活動量をグラフ管理するヘルスケアアプリ",
		long_desc:
			"Pixel Pulse Nexus は、歩数・心拍・体重・睡眠をまとめて記録し、傾向グラフで日々の健康を可視化します。",
		price: 22000,
		category: "health",
		tags: ["健康", "歩数", "心拍"],
		features: ["グラフ表示", "歩数追跡", "心拍記録"],
		requirements: ["フィットネス機器連携"],
	},
	{
		id: "325fd6d7-ab34-4952-bf64-f846609a859b",
		name: "AppThrive",
		description: "マインドフル記録と日記機能を持つウェルネスアプリ",
		long_desc:
			"AppThrive は、毎日の気分・感謝・成果を日記形式で記録し、月間モチベーションチャートや通知による振り返りをサポートします。",
		price: 9000,
		category: "health",
		tags: ["日記", "気分", "記録"],
		features: ["モチベーションチャート", "通知", "日記形式"],
		requirements: ["通知許可"],
	},
	{
		id: "9b1df0b9-0ae1-4116-a058-43edd370aeac",
		name: "Study Planner",
		description: "科目ごとの勉強時間を管理する学習プランナー",
		long_desc:
			"Study Planner は、試験勉強や日々の学習を計画的に進めたい人向けのタイムトラッカーアプリです。自分の学習スタイルに合わせて記録・管理ができ、毎日の勉強習慣を「見える化」しながら、無理なくモチベーションを維持します。",
		price: 59500,
		category: "education",
		tags: ["学習", "タイムトラッキング"],
		features: ["テスト"],
		requirements: ["テスト"],
	},
	{
		id: "529ee0ff-6769-4005-98bf-1b0666192c9a",
		name: "Prism Pulse",
		description: "ゲーム進行管理と通知機能を持つゲーマー向けタイマーアプリ",
		long_desc:
			"Prism Pulse は、ゲームプレイタイムを管理し、プレイ時間に応じた休憩リマインダーを送信します。タイトル・スクリーンショット記録も可能で、ゲームライフを健康的にサポート。",
		price: 15000,
		category: "entertainment",
		tags: ["ゲーム", "管理", "タイマー"],
		features: ["休憩通知", "スクリーンショット記録"],
		requirements: ["通知許可"],
	},
	{
		id: "f28a54d2-3c72-4727-8207-36048861863a",
		name: "Zen Breath",
		description: "マインドフルネスと呼吸法をサポートするリラクゼーションアプリ",
		long_desc:
			"Zen Breath は、短時間の呼吸エクササイズと瞑想セッションをガイドし、日々のストレス軽減と集中力向上を支援します。セッション履歴、リマインダー、音声ガイダンス付き。",
		price: 7000,
		category: "health",
		tags: ["瞑想", "呼吸", "ストレスケア"],
		features: ["タイマー", "音声ガイド", "リマインダー"],
		requirements: ["ヘッドホン推奨"],
	},
	{
		id: "b22f8af8-0699-45e3-94ff-c79b200ddd8a",
		name: "Wealth Weave",
		description: "収入・支出の分析ができる個人向け家計簿アプリ",
		long_desc:
			"Wealth Weave は、収入・支出を入力すると自動でグラフ化され、カテゴリー分析・月ごとのトレンド比較が可能。目標設定＆節約達成通知も搭載。",
		price: 10000,
		category: "productivity",
		tags: ["家計簿", "収支", "分析"],
		features: ["グラフ表示", "節約目標", "通知"],
		requirements: ["カレンダー連携"],
	},
	{
		id: "8f0ffaa8-0af2-4fdf-bc90-dd10613a75f9",
		name: "Health Tracker",
		description: "体重・睡眠・食事を記録して健康管理",
		long_desc:
			'Health Tracker は、毎日の体重・睡眠時間・食事内容をシンプルに記録し、健康の"見える化"を叶えるヘルスケアアプリです。',
		price: 72000,
		category: "health",
		tags: ["健康", "ヘルスケア"],
		features: ["なし"],
		requirements: ["なし"],
	},
	{
		id: "13ea5a9c-0400-4102-8e2c-4bcc07210aab",
		name: "Nova Nexus",
		description: "データ同期とノート共有ができるクラウドノートアプリ",
		long_desc:
			"Nova Nexus は、リアルタイム同期・テンプレート共有機能付きのクラウドノート。Markdown・チェックリスト対応で柔軟に使えます。",
		price: 18000,
		category: "productivity",
		tags: ["ノート", "同期", "Markdown"],
		features: ["Markdown", "テンプレ共有", "同期"],
		requirements: ["クラウド登録"],
	},
	{
		id: "ea7117af-fb8e-4547-be46-5b3bd8dac06e",
		name: "AppSpark Safari",
		description: "旅行プランの作成と共有ができる旅行管理アプリ",
		long_desc:
			"AppSpark Safari は、旅行の日程・交通・宿泊をまとめたプランを作成し、地図連携・友人共有ができる旅行計画アプリです。",
		price: 54000,
		category: "entertainment",
		tags: ["旅行", "プラン", "共有"],
		features: ["地図連携", "プラン共有", "日程リマインダー"],
		requirements: ["位置情報許可"],
	},
	{
		id: "79867535-da68-4d94-ae27-1807d0581da0",
		name: "Inventory Lite",
		description: "小規模店舗向けの在庫管理アプリ",
		long_desc:
			"Inventory Lite は、小さなショップや個人事業主向けに設計された、シンプル＆直感的な在庫管理 Web アプリです。スマホ・PC・タブレットなどどのデバイスからでもアクセス可能で、手軽に在庫数の登録・更新・確認ができます。",
		price: 91000,
		category: "business",
		tags: ["在庫", "ビジネス"],
		features: ["なし"],
		requirements: ["テスト 456"],
	},
	{
		id: "0addbe4f-d02d-403b-a350-9093152f2930",
		name: "Mind Craft",
		description: "習慣化をサポートする習慣トラッカーアプリ",
		long_desc:
			"Mind Craft は、習慣を日次・週次で記録し、継続率・達成率グラフ表示。通知でリマインドし、美しい UI で毎日の習慣をサポートします。",
		price: 15000,
		category: "productivity",
		tags: ["習慣", "記録", "通知"],
		features: ["リマインダー", "継続率表示", "通知履歴"],
		requirements: ["通知許可"],
	},
	{
		id: "71338039-c74f-49a1-be87-3f6f318bd0c8",
		name: "Thrive Track",
		description: "セルフケアを助ける習慣記録アプリ",
		long_desc:
			"Thrive Track は、瞑想・運動・睡眠の習慣を記録し、週間レポートや達成バッジでセルフケアを楽しみながら続けられるアプリです。",
		price: 27000,
		category: "health",
		tags: ["習慣", "セルフケア", "レポート"],
		features: ["週間レポート", "バッジ", "通知"],
		requirements: ["通知許可"],
	},
	{
		id: "6a054dbe-51db-43fb-9bc8-8ab83c3f69f2",
		name: "IdeaLog",
		description: "ひらめきを逃さず記録・整理できるノートアプリ",
		long_desc:
			"IdeaLog は、ビジネスアイデア、ブログのネタ、企画の構想など、あらゆるひらめきを逃さずキャッチし、自由に育てられるノート管理アプリです。",
		price: 1500,
		category: "productivity",
		tags: ["アイデア", "メモ", "分類"],
		features: ["AI 提案", "タグ分類", "メモ検索"],
		requirements: ["特になし（無料プランあり）"],
	},
	{
		id: "bf7e12f6-9ab9-4754-8694-769ccc4320e6",
		name: "Runner Tribe",
		description: "ランニング記録とコミュニティ機能付きランニングアプリ",
		long_desc:
			"Runner Tribe は、ランニング距離・ペース・コースを地図上に記録し、他のユーザーと成果をシェアできるコミュニティ機能付きランナー向けアプリです。",
		price: 26000,
		category: "health",
		tags: ["ランニング", "コミュニティ", "記録"],
		features: ["距離追跡", "SNS 共有", "コースマップ表示"],
		requirements: ["位置情報許可"],
	},
	{
		id: "058087df-ec45-403f-9ae9-8a3c2cb5c9c1",
		name: "Lift Atlas",
		description: "フィットネス記録とワークアウトガイドのアプリ",
		long_desc:
			"Lift Atlas は、筋トレや有酸素運動の記録と、部位別トレーニングプランの作成ができるフィットネスアプリです。セット数・休憩時間の自動記録、目標達成率のグラフ化、共有機能も搭載。",
		price: 26000,
		category: "health",
		tags: ["運動", "記録", "プラン"],
		features: ["セット数記録", "休憩タイマー", "プラン共有"],
		requirements: ["アカウント登録必須"],
	},
	{
		id: "37f11358-a507-4225-b3b8-906694167942",
		name: "Household Budgeter",
		description: "収入と支出をシンプルに記録出来る家計簿アプリ",
		long_desc:
			"「Household Budgeter」は、家計管理をシンプルかつスマートに行える家計簿アプリです。毎日の収入・支出を直感的に記録でき、カテゴリー別にグラフやカレンダーで視覚化。予算設定や目標管理も可能で、「貯蓄したい」「浪費を抑えたい」といった目的に合わせたプランニングをサポートします。",
		price: 48700,
		category: "productivity",
		tags: ["家計簿", "ファイナンス"],
		features: ["test1", "test2", "test3"],
		requirements: ["なし"],
	},
	{
		id: "82e16aa5-4f0e-4ed4-b37b-2371bae67a21",
		name: "TapTrack",
		description: "習慣トラッカー＆リマインダーアプリ",
		long_desc:
			"TapTrack は、毎日の習慣をタップで記録し、達成率グラフ・バッジ獲得機能でやる気を支えます。",
		price: 20000,
		category: "productivity",
		tags: ["習慣", "トラッカー", "バッジ"],
		features: ["ステータスバッジ", "達成率グラフ", "通知"],
		requirements: ["通知許可"],
	},
	{
		id: "4fc7c824-22ab-465b-b6d4-8f56597ab5d2",
		name: "ReformMemo",
		description: "自宅の修繕・リフォーム履歴を簡単記録",
		long_desc:
			"壁紙の張り替え、水回りの修理、外構工事など、自宅にまつわる工事・修繕の履歴を時系列で残せるアプリ。費用・業者・写真付きの記録や、次回点検のリマインダーも可能。",
		price: 1000,
		category: "住宅・記録",
		tags: ["修繕", "住宅", "リフォーム"],
		features: ["写真保存", "コスト管理", "リマインダー機能"],
		requirements: ["会員登録必須"],
	},
	{
		id: "700cf9b3-3079-47bd-92c8-2ad767d85283",
		name: "EliteEdge Labs",
		description: "プロジェクト進捗とタスクを可視化するチーム管理アプリ",
		long_desc:
			"EliteEdge Labs は、プロジェクトごとのタスク進行状況・担当者・期限を管理でき、カンバンビュー・ダッシュボードが使いやすい仕様です。",
		price: 23000,
		category: "productivity",
		tags: ["タスク", "進捗", "チーム"],
		features: ["カンバン", "ダッシュボード", "共有"],
		requirements: ["アカウント登録"],
	},
	{
		id: "7050e32a-f699-4954-90bd-8a0d98f58419",
		name: "Simple TODO",
		description: "最小限の機能でサクッと使える TODO アプリ",
		long_desc:
			"Simple TODO は、「タスクの追加・完了・削除」だけに徹底的にこだわった、究極のシンプル TODO アプリです。無駄な機能を削ぎ落とし、必要な操作はワンタップ—直感的に使えて、思考の邪魔をしません。",
		price: 33000,
		category: "productivity",
		tags: ["タスク", "TODO"],
		features: ["テスト"],
		requirements: ["なし"],
	},
	{
		id: "24710e6f-dc52-432b-b180-4aa9a26b66cf",
		name: "PetLog",
		description: "ペットの体調・通院・食事を一元管理",
		long_desc:
			"ワンちゃん・ネコちゃんなどのペットの健康記録をまとめて管理できるアプリ。通院歴、ワクチン接種、食事・体重の記録などを写真付きで保存できます。複数匹の登録も対応し、家族で共有することも可能。",
		price: 980,
		category: "ペット・健康",
		tags: ["ペット", "記録", "健康"],
		features: ["通院記録", "写真付き成長記録", "家族共有機能"],
		requirements: ["ペット登録が必要"],
	},
	{
		id: "67fd65ed-d14e-4840-904f-7376c457604b",
		name: "AppNest",
		description: "ウェブリンクを整理・共有できるブックマークアプリ",
		long_desc:
			"AppNest は、お気に入りのウェブ記事や動画をカテゴリー・タグ付きで保存し、リスト共有やコメント機能で情報収集を効率化します。",
		price: 5000,
		category: "entertainment",
		tags: ["リンク", "整理", "共有"],
		features: ["コメント", "タグ分類", "共有"],
		requirements: ["アカウント登録"],
	},
	{
		id: "c853bf3b-6ff9-4696-89d9-291c7b4c03f8",
		name: "AppWave Revue",
		description: "映画レビュー記録＆評価アプリ",
		long_desc:
			"AppWave Revue は、観た映画の感想と評価を記録し、ジャンル・お気に入りタグで整理。レビューリストの共有機能付きで、映画好き同志の交流も可能です。",
		price: 13000,
		category: "entertainment",
		tags: ["映画", "レビュー", "評価"],
		features: ["評価記録", "ジャンル分類", "共有"],
		requirements: ["SNS 連携"],
	},
	{
		id: "f5ca9558-439a-4909-86d1-c5ce04f78ac4",
		name: "Prosper Path",
		description: "節約と投資記録をサポートするパーソナルファイナンスアプリ",
		long_desc:
			"Prosper Path は、貯蓄・投資の目標を立て、収支を入力すると自動的に目標達成率と資産推移のグラフを生成します。",
		price: 30000,
		category: "business",
		tags: ["貯蓄", "投資", "グラフ"],
		features: ["資産グラフ", "目標設定", "通知"],
		requirements: ["金融 API 連携"],
	},
];

/**
 * 商品データをテキスト形式に変換
 */
function productToText(product: Product): string {
	return `
商品名: ${product.name}
価格: ¥${product.price.toLocaleString()}
カテゴリ: ${product.category}
説明: ${product.description}
詳細: ${product.long_desc}
タグ: ${product.tags.join(", ")}
機能: ${product.features.join(", ")}
要件: ${product.requirements.join(", ")}
`.trim();
}

/**
 * OpenAI Embeddings APIでテキストをベクトル化
 */
async function generateEmbedding(text: string): Promise<number[]> {
	const apiKey = Deno.env.get("OPENAI_API_KEY");
	if (!apiKey) {
		throw new Error("OPENAI_API_KEY environment variable is required");
	}

	const response = await fetch("https://api.openai.com/v1/embeddings", {
		method: "POST",
		headers: {
			Authorization: `Bearer ${apiKey}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			input: text,
			model: "text-embedding-3-small",
		}),
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(`OpenAI API error: ${response.status} ${error}`);
	}

	const data: EmbeddingResponse = await response.json();
	return data.data[0].embedding;
}

/**
 * Supabaseに埋め込みデータを保存
 */
async function saveEmbeddingToSupabase(
	productId: string,
	text: string,
	embedding: number[]
): Promise<void> {
	const supabaseUrl = Deno.env.get("SUPABASE_URL");
	const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY");

	if (!supabaseUrl || !supabaseKey) {
		throw new Error("Supabase environment variables are required");
	}

	const response = await fetch(`${supabaseUrl}/rest/v1/product_embeddings`, {
		method: "POST",
		headers: {
			apikey: supabaseKey,
			Authorization: `Bearer ${supabaseKey}`,
			"Content-Type": "application/json",
			Prefer: "return=minimal",
		},
		body: JSON.stringify({
			product_id: productId,
			content: text,
			embedding: embedding,
			created_at: new Date().toISOString(),
		}),
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(`Supabase error: ${response.status} ${error}`);
	}
}

/**
 * メイン処理
 */
async function main() {
	console.log("🚀 Portfolio Showcase 商品埋め込み生成を開始...");

	try {
		for (const product of PRODUCTS) {
			console.log(`📦 処理中: ${product.name}`);

			// 商品データをテキストに変換
			const text = productToText(product);

			// 埋め込み生成
			console.log(`  🔄 埋め込み生成中...`);
			const embedding = await generateEmbedding(text);

			// Supabaseに保存
			console.log(`  💾 Supabaseに保存中...`);
			await saveEmbeddingToSupabase(product.id, text, embedding);

			console.log(`  ✅ 完了: ${product.name}`);

			// API制限を考慮して少し待機
			await new Promise((resolve) => setTimeout(resolve, 1000));
		}

		console.log("🎉 全ての商品の埋め込み生成が完了しました！");
	} catch (error) {
		console.error("❌ エラーが発生しました:", error);
		Deno.exit(1);
	}
}

// スクリプト実行
if (import.meta.main) {
	main();
}
