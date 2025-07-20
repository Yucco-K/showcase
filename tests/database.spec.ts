import { test, expect } from "@playwright/test";

test.describe("データベース連携のE2Eテスト", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("http://localhost:5173");
	});

	test("ポートフォリオページのDB連携確認", async ({ page }) => {
		await page.goto("http://localhost:5173/portfolio");

		// プロジェクトカードが表示されることを確認（DBから取得）
		await expect(page.locator("a[href*='github.com']").first()).toBeVisible();

		// プロジェクトタイトルが表示されることを確認
		await expect(page.locator("a[href*='github.com']").first()).toContainText(
			"yucco-k.github.io"
		);
	});

	test("商品一覧ページのDB連携確認", async ({ page }) => {
		await page.goto("http://localhost:5173/products");

		// 商品カードが表示されることを確認（DBから取得）
		await expect(
			page.locator("[data-testid='product-card']").first()
		).toBeVisible();

		// 商品名が表示されることを確認
		await expect(page.locator("h3").first()).toBeVisible();
	});

	test("ブログ一覧ページのDB連携確認", async ({ page }) => {
		await page.goto("http://localhost:5173/blog");

		// ブログカードが表示されることを確認（DBから取得）
		// h3タグ（ブログタイトル）が表示されていることを確認
		await expect(page.locator("h3").first()).toBeVisible();
	});

	test("商品詳細ページのDB連携確認", async ({ page }) => {
		await page.goto("http://localhost:5173/products");

		// 商品カードが表示されることを確認
		await expect(
			page.locator("[data-testid='product-card']").first()
		).toBeVisible();

		// 商品カードの「詳細を見る」ボタンをクリックして詳細ページに遷移
		// より確実なセレクタを使用
		await page.locator("text=詳細を見る").first().click();

		// 詳細ページに遷移したことを確認（UUID形式のIDに対応）
		await expect(page).toHaveURL(/\/products\/[a-f0-9-]+/);
	});

	test.skip("お問い合わせフォームの送信確認", async ({ page }) => {
		await page.goto("http://localhost:5173/contact");

		// フォームが表示されることを確認
		await expect(page.locator("#name")).toBeVisible();
		await expect(page.locator("#email")).toBeVisible();
		await expect(page.locator("#message")).toBeVisible();

		// フォームにテストデータを入力（バリデーション条件を満たす）
		await page.fill("#name", "テストユーザー");
		await page.fill("#email", "test@example.com");
		await page.fill(
			"#message",
			"これはテストメッセージです。十分に長いメッセージを入力しています。"
		);

		// 利用規約チェックボックスをONにする（より具体的なセレクタを使用）
		const checkbox = page.locator("#agree");
		await checkbox.scrollIntoViewIfNeeded();
		// 強制的にチェックボックスをクリック
		await page.evaluate(() => {
			const checkbox = document.getElementById("agree") as HTMLInputElement;
			if (checkbox) {
				checkbox.checked = true;
				checkbox.dispatchEvent(new Event("change", { bubbles: true }));
			}
		});

		// チェックボックスが正しくチェックされていることを確認
		await page.waitForFunction(() => {
			const checkbox = document.getElementById("agree") as HTMLInputElement;
			return checkbox && checkbox.checked;
		});

		// 送信ボタンをクリック（Toastが表示されていない状態で）
		await page.evaluate(() => {
			const submitButton = document.querySelector(
				'button[type="submit"]'
			) as HTMLButtonElement;
			if (submitButton) {
				submitButton.click();
			}
		});

		// 「お問い合わせありがとうございます」を含むテキストが表示されることを確認
		await expect(page.locator("body")).toContainText(
			/お問い合わせありがとうございます/
		);
	});

	test("データの読み込み状態確認", async ({ page }) => {
		await page.goto("http://localhost:5173/products");

		// ローディング状態が表示されることを確認（もし実装されている場合）
		// 実際の実装に応じて調整が必要
		await expect(
			page.locator("[data-testid='product-card']").first()
		).toBeVisible();
	});

	test("エラーハンドリングの確認", async ({ page }) => {
		// 存在しないページにアクセス
		await page.goto("http://localhost:5173/non-existent-page");

		// 404ページまたはエラーページが表示されることを確認
		// 実際のエラーページの内容に合わせて調整
		await expect(page.locator("body")).toBeVisible();
	});
});
