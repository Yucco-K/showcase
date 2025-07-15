import { test, expect } from "@playwright/test";

test.describe.skip("Like count (requires auth)", () => {
	// 詳細ページで Like の増減を確認
	test("clicking heart toggles like count on detail page", async ({ page }) => {
		await page.goto("/products");
		// 最初のカード → 詳細ページへ遷移 (ViewButton リンクをクリック)
		const card = page.locator('[data-testid="product-card"]').first();
		await card.locator('a[href^="/products/"]').first().click();
		await expect(page).toHaveURL(/\/products\//);

		const likeButton = page.locator('[data-testid="like-button-detail"]');
		const countLocator = page.locator('[data-testid="like-count-detail"]');

		// 必要なら likes を 0 にリセット
		let initial = Number(await countLocator.innerText());
		if (initial !== 0) {
			await likeButton.click(); // unlike until 0
			await expect
				.poll(async () => Number(await countLocator.innerText()), {
					timeout: 8000,
				})
				.toBeLessThanOrEqual(initial - 1);
			await expect
				.poll(async () => Number(await countLocator.innerText()), {
					timeout: 8000,
				})
				.toBe(0);
			initial = 0;
		}

		// Like → count should become 1
		await likeButton.click();
		await expect
			.poll(async () => Number(await countLocator.innerText()), {
				timeout: 8000,
			})
			.toBe(initial + 1);

		// Unlike → back to initial
		await likeButton.click();
		await expect
			.poll(async () => Number(await countLocator.innerText()), {
				timeout: 8000,
			})
			.toBe(initial);
	});
});
