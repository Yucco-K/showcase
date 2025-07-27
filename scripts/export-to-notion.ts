import { Client } from "@notionhq/client";
import * as fs from "node:fs";
import * as path from "node:path";

// Notion APIクライアントの初期化
const notion = new Client({
	auth: process.env.VITE_NOTION_TOKEN,
});

// ドキュメントディレクトリ
const DOCS_DIR = path.join(process.cwd(), "docs");

// 日本語版と英語版のページID（環境変数から取得）
const JAPANESE_PAGE_ID = process.env.VITE_NOTION_JAPANESE_PAGE_ID;
const ENGLISH_PAGE_ID = process.env.VITE_NOTION_ENGLISH_PAGE_ID;

interface DocumentContent {
	title: string;
	content: string;
}

/**
 * Markdownファイルを読み込み
 */
const readMarkdownFile = (filename: string): DocumentContent => {
	const filePath = path.join(DOCS_DIR, filename);
	const content = fs.readFileSync(filePath, "utf-8");

	// タイトルを抽出（最初の#から）
	const titleMatch = content.match(/^#\s+(.+)$/m);
	const title = titleMatch ? titleMatch[1] : filename.replace(".md", "");

	return { title, content };
};

/**
 * Notionページを更新（シンプルなテキストとして）
 */
const updateNotionPage = async (
	pageId: string,
	title: string,
	content: string
) => {
	try {
		// ページのタイトルを更新
		await notion.pages.update({
			page_id: pageId,
			properties: {
				title: {
					title: [{ type: "text", text: { content: title } }],
				},
			},
		});

		// 既存のブロックを削除
		const existingBlocks = await notion.blocks.children.list({
			block_id: pageId,
		});

		for (const block of existingBlocks.results) {
			await notion.blocks.delete({
				block_id: block.id,
			});
		}

		// 新しいブロックを追加（シンプルなテキストとして）
		await notion.blocks.children.append({
			block_id: pageId,
			children: [
				{
					object: "block",
					type: "paragraph",
					paragraph: {
						rich_text: [{ type: "text", text: { content } }],
					},
				},
			],
		});

		console.log(`✅ Updated page: ${title}`);
	} catch (error) {
		console.error(`❌ Error updating page ${title}:`, error);
	}
};

/**
 * メイン処理
 */
const main = async () => {
	try {
		console.log("🚀 Starting Notion export...");

		// 日本語版ドキュメント
		if (JAPANESE_PAGE_ID) {
			console.log("📝 Processing Japanese documentation...");

			const technicalDoc = readMarkdownFile("TECHNICAL_DOCUMENTATION_JA.md");
			await updateNotionPage(
				JAPANESE_PAGE_ID,
				technicalDoc.title,
				technicalDoc.content
			);

			console.log("✅ Japanese documentation exported successfully");
		} else {
			console.warn("⚠️ VITE_NOTION_JAPANESE_PAGE_ID not set");
		}

		// 英語版ドキュメント
		if (ENGLISH_PAGE_ID) {
			console.log("📝 Processing English documentation...");

			const technicalDoc = readMarkdownFile("TECHNICAL_DOCUMENTATION.md");
			await updateNotionPage(
				ENGLISH_PAGE_ID,
				technicalDoc.title,
				technicalDoc.content
			);

			console.log("✅ English documentation exported successfully");
		} else {
			console.warn("⚠️ VITE_NOTION_ENGLISH_PAGE_ID not set");
		}

		console.log("🎉 Notion export completed!");
	} catch (error) {
		console.error("❌ Export failed:", error);
		process.exit(1);
	}
};

// スクリプト実行
main();
