import { Client } from "@notionhq/client";

// Notion APIクライアントの初期化
const notion = new Client({
	auth: process.env.VITE_NOTION_TOKEN,
});

// 親ページID
const PARENT_PAGE_ID = "234a7adbd8eb8090a653db334bb4f5ce";

/**
 * メイン処理
 */
const main = async () => {
	try {
		console.log("🔍 Fetching Notion pages...");

		// 親ページの子ページを取得
		const response = await notion.blocks.children.list({
			block_id: PARENT_PAGE_ID,
		});

		console.log(`📄 Found ${response.results.length} pages:`);
		console.log("");

		// 各ページの情報を表示
		for (const page of response.results) {
			if (page.type === "child_page") {
				const pageId = page.id;
				const title = page.child_page.title;

				// Notion URLを生成
				const notionUrl = `https://notion.so/${title.replace(
					/\s+/g,
					"-"
				)}-${pageId}`;

				console.log(`📋 ${title}`);
				console.log(`🔗 ${notionUrl}`);
				console.log(`🆔 Page ID: ${pageId}`);
				console.log("");
			}
		}

		console.log("✅ Page listing completed!");
	} catch (error) {
		console.error("❌ Error fetching pages:", error);
		process.exit(1);
	}
};

// スクリプト実行
main();
