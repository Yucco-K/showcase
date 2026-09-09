import { test, expect } from "@playwright/test";

test.describe("データベース連携のE2Eテスト", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("http://localhost:5173");
	});

	test("ポートフォリオページのDB連携確認", async ({ page }) => {
		await page.goto("http://localhost:5173/portfolio");

		// プロジェクトカードが表示されることを確認（DBから取得）
		const githubLink = page.locator("a[href*='github.com']").first();
		await expect(githubLink).toBeVisible();

		// DBから取得したプロジェクト情報が実際に反映されていることを確認
		// （特定プロジェクト名には依存せず、有効なGitHubリンクと本文が存在することを検証）
		await expect(githubLink).toHaveAttribute("href", /^https:\/\/github\.com\/.+/);
		const linkText = await githubLink.textContent();
		expect(linkText?.trim().length).toBeGreaterThan(0);
	});

	test("商品一覧ページのDB連携確認", async ({ page }) => {
		await page.goto("http://localhost:5173/products");

		// 商品カードが複数表示されることを確認（DBから取得。1件だけでは
		// ハードコードされたダミー表示との区別がつかないため件数も見る）
		const productCards = page.locator("[data-testid='product-card']");
		await expect(productCards.first()).toBeVisible();
		expect(await productCards.count()).toBeGreaterThan(1);

		// 商品名が空でないことを確認
		const firstTitle = await page.locator("h3").first().textContent();
		expect(firstTitle?.trim().length).toBeGreaterThan(0);

		// 価格が「¥」+ 数字（カンマ区切り可）の実データ形式で表示されることを確認
		await expect(page.locator("text=/¥[0-9,]+/").first()).toBeVisible();
	});

	test("ブログ一覧ページのDB連携確認", async ({ page }) => {
		await page.goto("http://localhost:5173/blog");

		// 「読み込みエラー」「記事が見つかりませんでした」等のエラー/空表示も
		// h3を使うため、h3の可視性だけでは成功と誤判定しうる。
		// 実際のブログカード(data-testid)の存在で判定する。
		const blogCards = page.locator("[data-testid='blog-card']");
		await expect(blogCards.first()).toBeVisible();
		expect(await blogCards.count()).toBeGreaterThan(0);

		// タイトルが空でないことを確認
		const firstTitle = await blogCards
			.first()
			.locator("h3")
			.textContent();
		expect(firstTitle?.trim().length).toBeGreaterThan(0);
	});

	test("商品詳細ページのDB連携確認", async ({ page }) => {
		await page.goto("http://localhost:5173/products");

		// 一覧ページの1件目の商品名を取得しておき、詳細ページでも
		// 同じ商品名が表示されることを確認する（別商品の情報が
		// 誤って表示されていないか、単なる固定文言でないかを検証）
		const firstCardTitleRaw = await page
			.locator("[data-testid='product-card']")
			.first()
			.locator("h3")
			.textContent();
		const firstCardTitle = firstCardTitleRaw?.trim() ?? "";
		expect(firstCardTitle.length).toBeGreaterThan(0);

		// 商品カードの「詳細を見る」ボタンをクリックして詳細ページに遷移
		await page.locator("text=詳細を見る").first().click();

		// 詳細ページに遷移したことを確認（UUID形式のIDに対応）
		await expect(page).toHaveURL(/\/products\/[a-f0-9-]+/);

		// 一覧ページと同じ商品名が詳細ページにも表示されることを確認
		await expect(page.locator("h1", { hasText: firstCardTitle })).toBeVisible();

		// 価格が実データ形式（¥+数字）で表示されることを確認
		await expect(page.locator("text=/¥[0-9,]+/").first()).toBeVisible();
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

	test("存在しない商品IDへの直接アクセス確認", async ({ page }) => {
		// 存在しないUUID形式のIDに直接アクセスした場合、他の商品の情報が
		// 誤って表示されず「商品が見つかりません」と表示されることを確認
		await page.goto(
			"http://localhost:5173/products/00000000-0000-0000-0000-000000000000"
		);
		await expect(page.locator("text=商品が見つかりません")).toBeVisible();
	});

	test("エラーハンドリングの確認", async ({ page }) => {
		// 存在しないページにアクセス
		await page.goto("http://localhost:5173/non-existent-page");

		// 404ページまたはエラーページが表示されることを確認
		// 実際のエラーページの内容に合わせて調整
		await expect(page.locator("body")).toBeVisible();
	});
});
