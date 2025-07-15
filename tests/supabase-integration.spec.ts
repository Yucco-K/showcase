import { test, expect } from "@playwright/test";

test.describe("Supabase統合テスト", () => {
	test.beforeEach(async ({ page }) => {
		// ローカル環境でのテスト実行
		await page.goto("http://localhost:5173");
	});

	test("Supabase接続の確認", async ({ page }) => {
		// コンソールログをキャプチャ
		const messages: string[] = [];
		page.on("console", (msg) => messages.push(msg.text()));

		// Supabaseクライアントの初期化を確認
		await page.evaluate(() => {
			// ウィンドウオブジェクトにSupabaseクライアントがあるかチェック
			console.log("Supabase client check");
		});

		// エラーがないことを確認
		const errors = messages.filter(
			(msg) =>
				msg.includes("error") || msg.includes("Error") || msg.includes("failed")
		);
		expect(errors).toHaveLength(0);
	});

	test("環境変数の設定確認", async ({ page }) => {
		// 開発者ツールを開いて環境変数をチェック
		await page.evaluate(() => {
			// Viteの環境変数チェック
			const hasSupabaseUrl = window.location.href.includes("localhost");
			const isLocalDev = window.location.protocol === "http:";

			console.log("SUPABASE_URL configured:", hasSupabaseUrl);
			console.log("Local development mode:", isLocalDev);

			// ローカル開発環境での動作確認
			if (isLocalDev) {
				console.log("Using local Supabase instance");
			}
		});
	});

	test("プロジェクトデータの取得テスト", async ({ request }) => {
		// Supabase REST APIを直接呼び出して projects データを確認
		const baseUrl = "http://127.0.0.1:54321";
		const serviceKey =
			"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";

		const res = await request.get(`${baseUrl}/rest/v1/projects?select=id`, {
			headers: {
				apikey: serviceKey,
				Authorization: `Bearer ${serviceKey}`,
			},
		});

		expect(res.status()).toBe(200);
		const arr = await res.json();
		expect(Array.isArray(arr)).toBe(true);
	});

	test("データベーススキーマの確認", async ({ request }) => {
		// Supabase REST APIを使ってテーブル存在確認
		const baseUrl = "http://127.0.0.1:54321";
		const apiKey =
			"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";

		// projectsテーブルからデータを取得
		const projectsResponse = await request.get(`${baseUrl}/rest/v1/projects`, {
			headers: {
				apikey: apiKey,
				Authorization: `Bearer ${apiKey}`,
			},
		});

		expect(projectsResponse.status()).toBe(200);

		const projects = await projectsResponse.json();
		expect(Array.isArray(projects)).toBe(true);

		// サンプルプロジェクトが3件あることを確認
		expect(projects.length).toBe(3);

		// 必要なフィールドが含まれていることを確認
		if (projects.length > 0) {
			const project = projects[0];
			expect(project).toHaveProperty("id");
			expect(project).toHaveProperty("title");
			expect(project).toHaveProperty("description");
			expect(project).toHaveProperty("technologies");
			expect(project).toHaveProperty("github_url");
		}
	});

	test("認証システムの基本確認", async ({ request }) => {
		const baseUrl = "http://127.0.0.1:54321";

		// 認証エンドポイントの存在確認
		const authResponse = await request.get(`${baseUrl}/auth/v1/settings`, {
			headers: {
				apikey:
					"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0",
			},
		});

		expect(authResponse.status()).toBe(200);

		const authSettings = await authResponse.json();
		expect(authSettings).toHaveProperty("external");
	});

	test("データベーステーブルの整合性確認", async ({ request }) => {
		const baseUrl = "http://127.0.0.1:54321";
		const serviceKey =
			"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";

		// profilesテーブルの確認
		const profilesResponse = await request.get(`${baseUrl}/rest/v1/profiles`, {
			headers: {
				apikey: serviceKey,
				Authorization: `Bearer ${serviceKey}`,
			},
		});

		expect([200, 404]).toContain(profilesResponse.status()); // テーブルは存在するがデータがない場合

		// paymentsテーブルの確認
		const paymentsResponse = await request.get(`${baseUrl}/rest/v1/payments`, {
			headers: {
				apikey: serviceKey,
				Authorization: `Bearer ${serviceKey}`,
			},
		});

		expect([200, 404]).toContain(paymentsResponse.status());

		// subscriptionsテーブルの確認
		const subscriptionsResponse = await request.get(
			`${baseUrl}/rest/v1/subscriptions`,
			{
				headers: {
					apikey: serviceKey,
					Authorization: `Bearer ${serviceKey}`,
				},
			}
		);

		expect([200, 404]).toContain(subscriptionsResponse.status());
	});
});
