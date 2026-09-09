import { test, expect } from "@playwright/test";

test.describe("認証機能のE2Eテスト", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("http://localhost:5173");
	});

	test("ログインボタンの表示確認", async ({ page }) => {
		// ログインボタンが表示されていることを確認
		await expect(page.locator("text=Login").first()).toBeVisible();
	});

	test("ログインモーダルの表示確認（UIのみ）", async ({ page }) => {
		// ログインボタンをクリック
		await page.click("text=Login");
		// メールアドレス・パスワード入力欄が表示されることを確認
		await expect(
			page.locator("input[placeholder='Email']").first()
		).toBeVisible();
		await expect(
			page.locator("input[placeholder='Password']").first()
		).toBeVisible();
	});

	// 実際のログイン処理は安全のためスキップ

	test("マイページへのアクセスリンクの表示確認", async ({ page }) => {
		// ログインしていない場合はマイページリンクが表示されないことを確認
		const myPageLink = page.locator("text=マイページ");
		await expect(myPageLink).toHaveCount(0);
	});

	test("管理者ページへのアクセス制御確認（UIのみ）", async ({ page }) => {
		// 管理者ページへのリンクが非表示であることを確認
		const adminLinks = [
			page.locator("text=Blog Admin"),
			page.locator("text=Product Admin"),
			page.locator("text=Contact Admin"),
		];
		for (const link of adminLinks) {
			await expect(link).toHaveCount(0);
		}
	});

	// 未ログインユーザーが管理者ページへURLを直接指定してアクセスした場合、
	// リンクが非表示なことだけでなく、実際にアクセス自体が拒否され
	// TOPページへリダイレクトされることを確認する（認可の実効性テスト）。
	const adminOnlyPaths = [
		"/blog-admin",
		"/product-admin",
		"/contact-admin",
		"/marketing-dashboard",
	];

	for (const path of adminOnlyPaths) {
		test(`未ログインでの管理者ページ直接アクセス拒否確認: ${path}`, async ({
			page,
		}) => {
			await page.goto(`http://localhost:5173${path}`);

			// AdminProtectedRouteによりTOPページへリダイレクトされることを確認
			await expect(page).toHaveURL("http://localhost:5173/");

			// 管理者ページ固有のUI（例: Blog Admin等の管理画面見出し）が
			// 表示されていないことも合わせて確認する
			await expect(page.locator("text=Blog Admin")).toHaveCount(0);
			await expect(page.locator("text=Product Admin")).toHaveCount(0);
		});
	}
});
