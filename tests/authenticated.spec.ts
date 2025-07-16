import { test, expect } from "@playwright/test";

test.describe("認証が必要な機能のテスト", () => {
	// 認証が設定されていない場合は全テストをスキップ
	test.beforeAll(async () => {
		if (!process.env.TEST_USER_EMAIL || !process.env.TEST_USER_PASSWORD) {
			test.skip();
		}
	});

	test.describe("マイページ機能", () => {
		test("マイページの基本レイアウトが正しく表示される", async ({ page }) => {
			await page.goto("/my-page");
			await expect(page.locator("text=👤 プロフィール")).toBeVisible();
			await expect(page.locator("text=🔐 パスワード変更")).toBeVisible();
			await expect(page.locator("text=📧 メールアドレス変更")).toBeVisible();
			await expect(page.locator("text=❤️ いいねしたアプリ")).toBeVisible();
		});

		test("プロフィール情報の表示と編集", async ({ page }) => {
			await page.goto("/my-page");
			await expect(page.locator('input[id="full_name"]')).toBeVisible();
			await expect(page.locator('textarea[id="biography"]')).toBeVisible();
		});
	});

	test.describe("製品レビュー機能", () => {
		test("レビューの投稿", async ({ page }) => {
			await page.goto("/products");
			const firstProductLink = page.locator('a[href*="/products/"]').first();
			await firstProductLink.click();

			await page.click('button:has-text("レビューを書く")');
			await expect(
				page.locator('form[data-testid="review-form"]')
			).toBeVisible();

			await page
				.locator('form[data-testid="review-form"] .StarRow span')
				.nth(4)
				.click();
			await page.fill('textarea[name="comment"]', "This is a test review");
			await page.click('button[type="submit"]');

			await expect(page.locator('text="This is a test review"')).toBeVisible();
		});
	});
});
