import { defineConfig } from "@playwright/test";

export default defineConfig({
	testDir: "tests",
	timeout: 60000,
	webServer: {
		command: "npm run dev",
		url: "http://localhost:5175",
		reuseExistingServer: !process.env.CI,
		timeout: 120000,
	},
	use: {
		baseURL: "http://localhost:5175",
		headless: true,
	},
	reporter: process.env.CI
		? [["html", { outputFolder: "playwright-report" }], ["list"]]
		: "list",
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	outputDir: "test-results",
});
