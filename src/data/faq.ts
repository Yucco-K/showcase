export interface FAQ {
	id: string;
	question: string;
	answer: string;
	category:
		| "製品・機能"
		| "アカウント"
		| "購入・決済"
		| "技術的な問題"
		| "その他";
	tags: string[];
	popularity: number; // よく問い合わせされる順位
}

export const FAQ_DATA: FAQ[] = [
	{
		id: "0",
		question: "おすすめ商品はありますか？",
		answer:
			"Portfolio Showcaseでは、AppBuzz Hive（¥32,000）、MyRecipeNote（¥500）、SnazzySync Apps（¥24,000）、CollabPlanner（¥1,200）などの人気商品を提供しています。詳細はチャットボットでお聞きください。",
		category: "製品・機能",
		tags: ["おすすめ", "商品", "紹介"],
		popularity: 1,
	},
	{
		id: "1",
		question: "パスワードを忘れてしまいました",
		answer:
			"パスワードリセット機能をご利用ください。ログイン画面の「パスワードを忘れた方」をクリックし、メールアドレスを入力してください。パスワードリセット用のメールが送信されます。",
		category: "アカウント",
		tags: ["パスワード", "ログイン", "リセット"],
		popularity: 2,
	},
	{
		id: "2",
		question: "商品の購入方法がわかりません",
		answer:
			"商品ページで「購入」ボタンをクリックし、決済情報を入力してください。Stripe決済システムを使用しており、安全にお支払いいただけます。",
		category: "購入・決済",
		tags: ["購入", "決済", "支払い"],
		popularity: 3,
	},
	{
		id: "3",
		question: "マイページにアクセスできません",
		answer:
			"ログインしていることを確認してください。ログイン後、画面右上のアカウントメニューから「マイページ」を選択できます。",
		category: "アカウント",
		tags: ["マイページ", "アクセス", "ログイン"],
		popularity: 4,
	},
	{
		id: "4",
		question: "商品が正常に動作しません",
		answer:
			"ブラウザのキャッシュをクリアしてから再度お試しください。問題が解決しない場合は、お使いのブラウザとOSの情報と共にお問い合わせください。",
		category: "技術的な問題",
		tags: ["不具合", "動作", "エラー"],
		popularity: 5,
	},
	{
		id: "5",
		question: "退会したいのですが",
		answer:
			"退会をご希望の場合は、お問い合わせフォームより退会の旨をご連絡ください。アカウントデータの削除を行います。",
		category: "アカウント",
		tags: ["退会", "アカウント削除"],
		popularity: 6,
	},
	{
		id: "6",
		question: "購入履歴を確認したい",
		answer:
			"マイページの「購入履歴」タブから過去の購入商品をご確認いただけます。",
		category: "購入・決済",
		tags: ["購入履歴", "マイページ"],
		popularity: 7,
	},
	{
		id: "7",
		question: "商品レビューの投稿方法",
		answer:
			"商品詳細ページ下部の「レビューを書く」ボタンから投稿できます。星評価とコメントを入力してください。",
		category: "製品・機能",
		tags: ["レビュー", "投稿", "評価"],
		popularity: 8,
	},
	{
		id: "8",
		question: "推奨商品の仕組みについて",
		answer:
			"Gorse推薦システムを使用して、ユーザーの購入履歴や閲覧履歴に基づいて関連商品をおすすめしています。",
		category: "製品・機能",
		tags: ["推奨", "レコメンド", "仕組み"],
		popularity: 9,
	},
	{
		id: "9",
		question: "プライバシーポリシーはどこに書かれていますか？",
		answer:
			"プライバシーポリシーは、ナビゲーションバーのContactをクリックすると開くお問い合わせ画面でご確認いただけます。",
		category: "その他",
		tags: ["プライバシー", "ポリシー", "規約"],
		popularity: 2,
	},
	{
		id: "10",
		question: "利用規約はどこに書かれていますか？",
		answer:
			"利用規約は、ナビゲーションバーのContactをクリックすると開くお問い合わせ画面でご確認いただけます。",
		category: "その他",
		tags: ["利用規約", "規約", "契約条件"],
		popularity: 3,
	},
];

// よく問い合わせされる上位FAQを取得
export const getPopularFAQs = (count: number = 5): FAQ[] => {
	return FAQ_DATA.sort((a, b) => a.popularity - b.popularity).slice(0, count);
};

// カテゴリのユニークなリストを取得
export const getFAQCategories = (): FAQ["category"][] => {
	const categories = FAQ_DATA.map((faq) => faq.category);
	return [...new Set(categories)];
};

// カテゴリ別FAQを取得
export const getFAQsByCategory = (category: string): FAQ[] => {
	return FAQ_DATA.filter((faq) => faq.category === category);
};

// キーワード検索でFAQを取得
export const searchFAQs = (keyword: string): FAQ[] => {
	const lowercaseKeyword = keyword.toLowerCase();
	return FAQ_DATA.filter(
		(faq) =>
			faq.question.toLowerCase().includes(lowercaseKeyword) ||
			faq.answer.toLowerCase().includes(lowercaseKeyword) ||
			faq.tags.some((tag) => tag.toLowerCase().includes(lowercaseKeyword))
	);
};
