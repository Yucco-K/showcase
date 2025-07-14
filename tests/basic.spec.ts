import { test, expect } from "@playwright/test";

test.describe("基本テスト", () => {
	test("ホームページが表示される", async ({ page }) => {
		await page.goto("/");
		await expect(page.locator("h1")).toContainText(
			"Welcome to my portfolio site!"
		);
	});

	test("ナビゲーションが機能する", async ({ page }) => {
		await page.goto("/");

		// ポートフォリオページに移動
		await page.click('a[href="/portfolio"]');
		await expect(page).toHaveURL("/portfolio");
		await expect(page.locator("h1")).toContainText("Portfolio");
	});
});
