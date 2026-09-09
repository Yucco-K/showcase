import { describe, expect, it } from "vitest";
import type { BlogEntry } from "../types/blog";
import { BlogPlatform } from "../types/blog";
import type { Product } from "../types/product";
import { ProductCategory } from "../types/product";
import { filterBlogs, filterProducts } from "./filter";

const makeProduct = (overrides: Partial<Product>): Product => ({
	id: "1",
	name: "Product",
	description: "",
	longDescription: "",
	price: 1000,
	category: ProductCategory.PRODUCTIVITY,
	imageUrl: "",
	screenshots: [],
	features: [],
	requirements: [],
	version: "1.0",
	lastUpdated: "2026-01-01",
	rating: 4,
	reviewCount: 0,
	tags: [],
	...overrides,
});

describe("filterProducts", () => {
	const products = [
		makeProduct({
			id: "1",
			name: "デザインツール",
			price: 500,
			category: ProductCategory.DESIGN,
			rating: 3,
			tags: ["ui"],
		}),
		makeProduct({
			id: "2",
			name: "開発ツール",
			price: 2000,
			category: ProductCategory.DEVELOPMENT,
			rating: 5,
			tags: ["cli"],
		}),
		makeProduct({
			id: "3",
			name: "生産性アプリ",
			price: 1000,
			category: ProductCategory.PRODUCTIVITY,
			rating: 4,
			description: "タスク管理に便利",
			tags: ["task"],
		}),
	];

	it("フィルタなしの場合は全件返す", () => {
		expect(filterProducts(products, {})).toHaveLength(3);
	});

	it("カテゴリで絞り込む", () => {
		const result = filterProducts(products, {
			category: ProductCategory.DESIGN,
		});
		expect(result.map((p) => p.id)).toEqual(["1"]);
	});

	it("価格の下限・上限で絞り込む（境界値を含む）", () => {
		const result = filterProducts(products, { minPrice: 500, maxPrice: 1000 });
		expect(result.map((p) => p.id).sort()).toEqual(["1", "3"]);
	});

	it("最低評価で絞り込む", () => {
		const result = filterProducts(products, { minRating: 4 });
		expect(result.map((p) => p.id).sort()).toEqual(["2", "3"]);
	});

	it("検索クエリで商品名・説明・タグを横断検索する（大文字小文字を区別しない）", () => {
		expect(
			filterProducts(products, { searchQuery: "タスク" }).map((p) => p.id)
		).toEqual(["3"]);
		expect(
			filterProducts(products, { searchQuery: "CLI" }).map((p) => p.id)
		).toEqual(["2"]);
	});

	it("複数条件はAND条件で適用される", () => {
		const result = filterProducts(products, {
			category: ProductCategory.PRODUCTIVITY,
			minPrice: 2000,
		});
		expect(result).toHaveLength(0);
	});

	it("元の配列を変更しない", () => {
		const original = [...products];
		filterProducts(products, { category: ProductCategory.DESIGN });
		expect(products).toEqual(original);
	});
});

const makeBlog = (overrides: Partial<BlogEntry>): BlogEntry => ({
	id: "1",
	title: "Title",
	description: "",
	url: "https://example.com",
	platform: BlogPlatform.ZENN,
	publishDate: "2026-01-01",
	readTime: 5,
	tags: [],
	isExternal: true,
	...overrides,
});

describe("filterBlogs", () => {
	const blogs = [
		makeBlog({ id: "1", platform: BlogPlatform.ZENN, tags: ["React"], title: "React入門" }),
		makeBlog({ id: "2", platform: BlogPlatform.QIITA, tags: ["Vue"], title: "Vue入門" }),
		makeBlog({
			id: "3",
			platform: BlogPlatform.ZENN,
			tags: ["TypeScript"],
			title: "型安全な設計",
			description: "TypeScriptで堅牢に",
		}),
	];

	it("プラットフォームで絞り込む", () => {
		const result = filterBlogs(blogs, { platform: BlogPlatform.ZENN });
		expect(result.map((b) => b.id).sort()).toEqual(["1", "3"]);
	});

	it("タグのいずれかに一致すれば含める", () => {
		const result = filterBlogs(blogs, { tags: ["Vue", "TypeScript"] });
		expect(result.map((b) => b.id).sort()).toEqual(["2", "3"]);
	});

	it("検索クエリでタイトル・説明・タグを横断検索する", () => {
		expect(
			filterBlogs(blogs, { searchQuery: "堅牢" }).map((b) => b.id)
		).toEqual(["3"]);
	});

	it("空白のみの検索クエリは無視する", () => {
		expect(filterBlogs(blogs, { searchQuery: "   " })).toHaveLength(3);
	});

	it("元の配列を変更しない", () => {
		const original = [...blogs];
		filterBlogs(blogs, { platform: BlogPlatform.ZENN });
		expect(blogs).toEqual(original);
	});
});
