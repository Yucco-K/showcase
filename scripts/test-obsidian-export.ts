import { Client } from "@notionhq/client";
import * as fs from "node:fs";
import * as path from "node:path";

// Notion APIクライアントの初期化
const notion = new Client({
	auth: process.env.VITE_NOTION_TOKEN,
});

// Obsidianワークスペースファイル
const OBSIDIAN_WORKSPACE_FILE = path.join(
	process.cwd(),
	"obsidian-vault/obsidian-workspace.md"
);

// テスト用の1つのページID
const TEST_PAGE_ID = "234a7adb-d8eb-81df-b9b0-df9cdd5f75fa";

/**
 * メイン処理
 */
const main = async () => {
	try {
		console.log("🚀 Testing Obsidian workspace export...");

		// Obsidianワークスペースファイルを読み込み
		const workspaceContent = fs.readFileSync(OBSIDIAN_WORKSPACE_FILE, "utf-8");
		console.log(
			`📄 Read workspace file: ${workspaceContent.length} characters`
		);

		// ページの存在確認
		console.log(`🔍 Checking page: ${TEST_PAGE_ID}`);
		const page = await notion.pages.retrieve({ page_id: TEST_PAGE_ID });
		console.log(
			`✅ Page found: ${
				page.properties?.title?.title?.[0]?.text?.content || "Untitled"
			}`
		);

		// 簡単なテキストブロックを追加
		console.log(`📝 Adding test content...`);
		await notion.blocks.children.append({
			block_id: TEST_PAGE_ID,
			children: [
				{
					object: "block",
					type: "heading_1",
					heading_1: {
						rich_text: [
							{
								type: "text",
								text: { content: "Obsidian Workspace Export Test" },
							},
						],
					},
				},
				{
					object: "block",
					type: "paragraph",
					paragraph: {
						rich_text: [
							{
								type: "text",
								text: {
									content: "This is a test export from Obsidian workspace.",
								},
							},
						],
					},
				},
			],
		});

		console.log("✅ Test export completed successfully!");
	} catch (error) {
		console.error("❌ Test failed:", error);
		process.exit(1);
	}
};

// スクリプト実行
main();
