export interface FAQ {
	id: string;
	question: string;
	answer: string;
	category: "technical" | "billing" | "general" | "account";
	tags: string[];
	popularity: number; // よく問い合わせされる順位
}

export const FAQ_DATA: FAQ[] = [
	{
		id: "0",
		question: "おすすめ商品はありますか？",
		answer:
			"Portfolio Showcaseでは、AppBuzz Hive（¥32,000）、MyRecipeNote（¥500）、SnazzySync Apps（¥24,000）、CollabPlanner（¥1,200）などの優秀な商品を提供しています。詳細はチャットボットでお聞きください。",
		category: "general",
		tags: ["おすすめ", "商品", "紹介"],
		popularity: 1,
	},
	{
		id: "1",
		question: "パスワードを忘れてしまいました",
		answer:
			"パスワードリセット機能をご利用ください。ログイン画面の「パスワードを忘れた方」をクリックし、メールアドレスを入力してください。パスワードリセット用のメールが送信されます。",
		category: "account",
		tags: ["パスワード", "ログイン", "リセット"],
		popularity: 2,
	},
	{
		id: "2",
		question: "商品の購入方法がわかりません",
		answer:
			"商品ページで「購入」ボタンをクリックし、決済情報を入力してください。Stripe決済システムを使用しており、安全にお支払いいただけます。",
		category: "billing",
		tags: ["購入", "決済", "支払い"],
		popularity: 3,
	},
	{
		id: "3",
		question: "マイページにアクセスできません",
		answer:
			"ログインしていることを確認してください。ログイン後、画面右上のアカウントメニューから「マイページ」を選択できます。",
		category: "account",
		tags: ["マイページ", "アクセス", "ログイン"],
		popularity: 4,
	},
	{
		id: "4",
		question: "商品が正常に動作しません",
		answer:
			"ブラウザのキャッシュをクリアしてから再度お試しください。問題が解決しない場合は、お使いのブラウザとOSの情報と共にお問い合わせください。",
		category: "technical",
		tags: ["不具合", "動作", "エラー"],
		popularity: 5,
	},
	{
		id: "5",
		question: "退会したいのですが",
		answer:
			"退会をご希望の場合は、お問い合わせフォームより退会の旨をご連絡ください。アカウントデータの削除を行います。",
		category: "account",
		tags: ["退会", "アカウント削除"],
		popularity: 6,
	},
	{
		id: "6",
		question: "購入履歴を確認したい",
		answer:
			"マイページの「購入履歴」タブから過去の購入商品をご確認いただけます。",
		category: "billing",
		tags: ["購入履歴", "マイページ"],
		popularity: 7,
	},
	{
		id: "7",
		question: "商品レビューの投稿方法",
		answer:
			"商品詳細ページ下部の「レビューを書く」ボタンから投稿できます。星評価とコメントを入力してください。",
		category: "general",
		tags: ["レビュー", "投稿", "評価"],
		popularity: 8,
	},
	{
		id: "8",
		question: "推奨商品の仕組みについて",
		answer:
			"Gorse推薦システムを使用して、ユーザーの購入履歴や閲覧履歴に基づいて関連商品をおすすめしています。",
		category: "general",
		tags: ["推奨", "レコメンド", "仕組み"],
		popularity: 9,
	},
];

// よく問い合わせされる上位FAQを取得
export const getPopularFAQs = (count: number = 5): FAQ[] => {
	return FAQ_DATA.sort((a, b) => a.popularity - b.popularity).slice(0, count);
};

// カテゴリ別FAQを取得
export const getFAQsByCategory = (category: FAQ["category"]): FAQ[] => {
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
