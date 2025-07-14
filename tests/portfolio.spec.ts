import { test, expect } from "@playwright/test";

test.describe("ポートフォリオサイト包括テスト", () => {
	test.beforeEach(async ({ page }) => {
		// ローカル環境でのテスト実行
		await page.goto("http://localhost:5173");
	});

	test("ホームページの表示確認", async ({ page }) => {
		await expect(page.locator("h1")).toContainText(
			"Welcome to my portfolio site!"
		);

		// ナビゲーションリンクの存在確認
		await expect(page.locator('nav a[href="/"]')).toBeVisible();
		await expect(page.locator('nav a[href="/portfolio"]')).toBeVisible();
		await expect(page.locator('nav a[href="/internship"]')).toBeVisible();
		await expect(page.locator('nav a[href="/payment"]')).toBeVisible();
	});

	test("インターンポートフォリオページの表示確認", async ({ page }) => {
		await page.click('a[href="/internship"]');
		await expect(page).toHaveURL(/.*\/internship$/);

		// ページタイトルの確認
		await expect(page.locator("h1")).toContainText("Internship Portfolio");

		// セクションの存在確認
		await expect(page.locator('h2:has-text("🍀 About")')).toBeVisible();
		await expect(
			page.locator('h2:has-text("🚀 What I Worked On")')
		).toBeVisible();
		await expect(page.locator('h2:has-text("🧑‍💻 Tech Stack")')).toBeVisible();

		// 3Dバブルシーンの確認
		await expect(page.locator("canvas")).toBeVisible();
	});

	test("プロジェクトポートフォリオページの表示確認", async ({ page }) => {
		await page.click('a[href="/portfolio"]');
		await expect(page).toHaveURL(/.*\/portfolio$/);

		// ページタイトルの確認
		await expect(page.locator("h1")).toContainText("Portfolio");

		// プロジェクトリンクの確認
		const projectLinks = [
			"question-app",
			"snapstreamApp",
			"lostiteminfoApp",
			"jutaku-assignment",
		];

		for (const project of projectLinks) {
			await expect(page.locator(`a:has-text("${project}")`)).toBeVisible();
		}

		// Yucco Catコンポーネントの確認
		await expect(page.locator('img[alt*="Yucco"]')).toBeVisible();
	});

	test("レスポンシブデザインの確認", async ({ page }) => {
		// モバイルサイズ
		await page.setViewportSize({ width: 375, height: 667 });
		await expect(page.locator("nav")).toBeVisible();

		// タブレットサイズ
		await page.setViewportSize({ width: 768, height: 1024 });
		await expect(page.locator("nav")).toBeVisible();

		// デスクトップサイズ
		await page.setViewportSize({ width: 1920, height: 1080 });
		await expect(page.locator("nav")).toBeVisible();
	});

	test("ページ遷移のスムーズさ確認", async ({ page }) => {
		// 各ページに遷移して読み込み時間を測定
		const startTime = Date.now();

		await page.click('a[href="/portfolio"]');
		await page.waitForLoadState("networkidle");

		await page.click('a[href="/internship"]');
		await page.waitForLoadState("networkidle");

		await page.click('a[href="/"]');
		await page.waitForLoadState("networkidle");

		const endTime = Date.now();
		const totalTime = endTime - startTime;

		// 5秒以内にすべての遷移が完了することを確認
		expect(totalTime).toBeLessThan(5000);
	});

	test("外部リンクの動作確認", async ({ page }) => {
		await page.click('a[href="/portfolio"]');

		// 新しいタブで開くことを確認
		const [newPage] = await Promise.all([
			page.waitForEvent("popup"),
			page.click('a[href*="github.com"]'),
		]);

		// GitHubページが開くことを確認
		await expect(newPage).toHaveURL(/github\.com/);
		await newPage.close();
	});

	test("アクセシビリティの基本確認", async ({ page }) => {
		// キーボードナビゲーション
		await page.keyboard.press("Tab");
		await page.keyboard.press("Enter");

		// フォーカスの確認
		const focusedElement = await page.evaluate(
			() => document.activeElement?.tagName
		);
		expect(["A", "BUTTON", "INPUT"]).toContain(focusedElement);

		// 画像のalt属性確認
		const images = await page.locator("img").all();
		for (const img of images) {
			const alt = await img.getAttribute("alt");
			expect(alt).toBeTruthy();
		}
	});
});
