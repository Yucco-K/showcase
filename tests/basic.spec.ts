import { test, expect } from "@playwright/test";

test.describe("基本的なE2Eテスト", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("http://localhost:5173");
	});

	test("トップページの表示確認", async ({ page }) => {
		await expect(page).toHaveTitle(/Yucco's Portfolio/);
		await expect(page.locator("text=Top").first()).toBeVisible();
		await expect(page.locator("text=Portfolio").first()).toBeVisible();
		await expect(page.locator("text=Products").first()).toBeVisible();
		await expect(page.locator("text=Blog").first()).toBeVisible();
	});

	test("ポートフォリオページの表示確認", async ({ page }) => {
		await page.goto("http://localhost:5173/portfolio");
		await expect(page.locator("h1")).toContainText("WEB App Portfolio");
		await expect(page.locator("a[href*='github.com']").first()).toBeVisible();
	});

	test("商品一覧ページの表示確認", async ({ page }) => {
		await page.goto("http://localhost:5173/products");
		await expect(
			page.locator("[data-testid='product-card']").first()
		).toBeVisible();
		await expect(page.locator("h3").first()).toBeVisible();
	});

	test("ブログ一覧ページの表示確認", async ({ page }) => {
		await page.goto("http://localhost:5173/blog");
		await expect(page.locator("h3").first()).toBeVisible();
	});

	test("お問い合わせページの表示確認", async ({ page }) => {
		await page.goto("http://localhost:5173/contact");
		await expect(page.locator("form")).toBeVisible();
		await expect(page.locator("#name").first()).toBeVisible();
		await expect(page.locator("#email").first()).toBeVisible();
		await expect(page.locator("#message").first()).toBeVisible();
	});

	test("ナビゲーションの動作確認", async ({ page }) => {
		await page.goto("http://localhost:5173");
		await page.click("text=Portfolio");
		await expect(page).toHaveURL(/.*\/portfolio/);
		await page.click("text=Products");
		await expect(page).toHaveURL(/.*\/products/);
		await page.click("text=Blog");
		await expect(page).toHaveURL(/.*\/blog/);
	});

	test("レスポンシブデザインの確認", async ({ page }) => {
		await page.setViewportSize({ width: 375, height: 667 });
		await page.goto("http://localhost:5173");
		const mobileMenuBtn = page.locator("button:has-text('☰')");
		if ((await mobileMenuBtn.count()) > 0) {
			await expect(mobileMenuBtn.first()).toBeVisible();
		}
		await page.setViewportSize({ width: 1280, height: 720 });
		await page.reload();
		await expect(page.locator("text=Top").first()).toBeVisible();
	});

	test("エラーハンドリングの確認", async ({ page }) => {
		await page.goto("http://localhost:5173/non-existent-page");
		await expect(page.locator("body")).toBeVisible();
	});
});
