import type { Product } from "../types/product";
import { ProductCategory } from "../types/product";

export const products: Product[] = [
	{
		id: "prod-budget",
		name: "Household Budgeter",
		description: "収入と支出をシンプルに記録できる家計簿アプリ",
		longDescription:
			"Household Budgeter は、家計簿を付けるための最小限で直感的なアプリです。毎日の収支を入力し、カテゴリ別にグラフで確認できます。",
		price: 48700,
		category: ProductCategory.PRODUCTIVITY,
		imageUrl: "/images/products/budget.jpg",
		screenshots: [],
		features: ["収支入力", "カテゴリ集計", "月次レポート"],
		requirements: ["Webブラウザ"],
		version: "1.0.0",
		lastUpdated: "2025-07-14",
		rating: 4.5,
		reviewCount: 12,
		tags: ["家計簿", "ファイナンス"],
		isPopular: true,
		isFeatured: true,
	},
	{
		id: "prod-health",
		name: "Health Tracker",
		description: "体重・睡眠・食事を記録して健康管理",
		longDescription:
			"Health Tracker は、毎日の体重や睡眠時間、食事内容を簡単に記録し、グラフで確認できるヘルスケアアプリです。",
		price: 72000,
		category: ProductCategory.HEALTH,
		imageUrl: "/images/products/health.jpg",
		screenshots: [],
		features: ["体重グラフ", "睡眠記録", "食事メモ"],
		requirements: ["iOS / Android"],
		version: "1.0.0",
		lastUpdated: "2025-07-14",
		rating: 4.4,
		reviewCount: 8,
		tags: ["健康", "ヘルスケア"],
		isPopular: false,
		isFeatured: true,
	},
	{
		id: "prod-study",
		name: "Study Planner",
		description: "科目ごとの勉強時間を管理する学習プランナー",
		longDescription:
			"Study Planner は、試験勉強や日々の学習を計画的に進めたい人向けのタイムトラッカーです。",
		price: 59500,
		category: ProductCategory.EDUCATION,
		imageUrl: "/images/products/study.jpg",
		screenshots: [],
		features: ["学習タイマー", "進捗レポート", "リマインダー"],
		requirements: ["Webブラウザ"],
		version: "1.0.0",
		lastUpdated: "2025-07-14",
		rating: 4.6,
		reviewCount: 10,
		tags: ["学習", "タイムトラッキング"],
		isPopular: true,
		isFeatured: false,
	},
	{
		id: "prod-todo",
		name: "Simple TODO",
		description: "最小限の機能でサクッと使える TODO アプリ",
		longDescription:
			"Simple TODO は、タスクの追加・完了・削除のみのシンプルさを追求した TODO アプリです。",
		price: 33000,
		category: ProductCategory.PRODUCTIVITY,
		imageUrl: "/images/products/todo.jpg",
		screenshots: [],
		features: ["タスク追加", "ドラッグで並べ替え", "ダークモード"],
		requirements: ["Webブラウザ"],
		version: "1.0.0",
		lastUpdated: "2025-07-14",
		rating: 4.7,
		reviewCount: 25,
		tags: ["タスク", "TODO"],
		isPopular: true,
		isFeatured: false,
	},
	{
		id: "prod-inventory",
		name: "Inventory Lite",
		description: "小規模店舗向けの在庫管理アプリ",
		longDescription:
			"Inventory Lite は、小さなショップや個人事業主が簡単に在庫数を記録・確認できる Web アプリです。",
		price: 91000,
		category: ProductCategory.BUSINESS,
		imageUrl: "/images/products/inventory.jpg",
		screenshots: [],
		features: ["商品登録", "在庫アラート", "CSV エクスポート"],
		requirements: ["Webブラウザ"],
		version: "1.0.0",
		lastUpdated: "2025-07-14",
		rating: 4.3,
		reviewCount: 4,
		tags: ["在庫", "ビジネス"],
		isPopular: false,
		isFeatured: false,
	},
];

// カテゴリー別の商品フィルタリング用ヘルパー関数
export const getProductsByCategory = (category: ProductCategory): Product[] => {
	return products.filter((product) => product.category === category);
};

// 人気商品の取得
export const getPopularProducts = (): Product[] => {
	return products.filter((product) => product.isPopular);
};

// 注目商品の取得
export const getFeaturedProducts = (): Product[] => {
	return products.filter((product) => product.isFeatured);
};

// 商品検索
export const searchProducts = (query: string): Product[] => {
	const searchTerm = query.toLowerCase();
	return products.filter(
		(product) =>
			product.name.toLowerCase().includes(searchTerm) ||
			product.description.toLowerCase().includes(searchTerm) ||
			product.tags.some((tag) => tag.toLowerCase().includes(searchTerm))
	);
};

// 商品IDから商品を取得
export const getProductById = (id: string): Product | undefined => {
	return products.find((product) => product.id === id);
};
