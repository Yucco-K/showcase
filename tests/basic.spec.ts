import { test, expect } from "@playwright/test";

test.describe("基本テスト", () => {
	test("ホームページが表示される", async ({ page }) => {
		await page.goto("/");
		await expect(page.locator("h1")).toContainText("Welcome to my Showcase!");
	});

	test("ナビゲーションが機能する", async ({ page }) => {
		await page.goto("/");

		// ポートフォリオページに移動
		await page.click('a[href="/portfolio"]');
		await expect(page).toHaveURL("/portfolio");
		await expect(page.locator("h1")).toContainText("Portfolio");
	});

	test("未ログイン時にマイページにアクセスするとログインが必要", async ({
		page,
	}) => {
		await page.goto("/my-page");
		await expect(page.locator("text=ログインしてください")).toBeVisible();
	});

	test("商品一覧ページが表示される", async ({ page }) => {
		await page.goto("/products");
		await expect(page.locator("h1")).toContainText("Products");

		// 商品カードが表示されることを確認
		await expect(page.locator('[data-testid="product-grid"]')).toBeVisible();
	});

	test("商品詳細ページの基本表示", async ({ page }) => {
		// 商品一覧ページに移動
		await page.goto("/products");

		// 最初の商品の詳細ページに移動
		const firstProductLink = page.locator('a[href*="/products/"]').first();
		await firstProductLink.click();

		// 基本的なナビゲーションボタンの確認
		await expect(
			page.locator('button:has-text("← 商品一覧に戻る")')
		).toBeVisible();

		// 商品情報の基本要素が表示されることを確認
		await expect(page.locator('[data-testid="product-title"]')).toBeVisible();
		await expect(
			page.locator('[data-testid="product-description"]')
		).toBeVisible();
	});
});
