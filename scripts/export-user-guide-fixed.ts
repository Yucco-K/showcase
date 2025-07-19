import { Client } from "@notionhq/client";
import * as fs from "fs";
import * as path from "path";

// Notion APIクライアントの初期化
const notion = new Client({
	auth: process.env.VITE_NOTION_TOKEN,
});

// ドキュメントディレクトリ
const DOCS_DIR = path.join(process.cwd(), "docs");

// 既存のページID（ユーザーガイド）
const JAPANESE_PAGE_ID = "234a7adb-d8eb-81e1-bad6-e97608f79dd1";
const ENGLISH_PAGE_ID = "234a7adb-d8eb-8166-bf52-ff135a0dc76d";

/**
 * マークダウンのリンクを修正
 */
const fixMarkdownLinks = (content: string): string => {
	// アンカーリンクを削除（#はじめに など）
	let fixedContent = content.replace(/\[([^\]]+)\]\(#[^)]+\)/g, "$1");

	// その他の無効なリンクを削除
	fixedContent = fixedContent.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1");

	return fixedContent;
};

/**
 * Markdownファイルを読み込み
 */
const readMarkdownFile = (filename: string): string => {
	const filePath = path.join(DOCS_DIR, filename);
	const content = fs.readFileSync(filePath, "utf-8");
	return fixMarkdownLinks(content);
};

/**
 * ページのコンテンツを削除
 */
const clearPageContent = async (pageId: string) => {
	try {
		console.log(`🧹 Clearing content from page: ${pageId}`);

		const existingBlocks = await notion.blocks.children.list({
			block_id: pageId,
		});

		for (const block of existingBlocks.results) {
			await notion.blocks.delete({
				block_id: block.id,
			});
		}

		console.log(`✅ Cleared content from page`);
	} catch (error) {
		console.error(`❌ Error clearing content:`, error);
	}
};

/**
 * コンテンツを追加（シンプルなテキストとして）
 */
const addContent = async (pageId: string, content: string) => {
	try {
		console.log(`📝 Adding content to page...`);

		// コンテンツを段落に分割
		const paragraphs = content.split("\n\n").filter((p) => p.trim());

		// 各段落をブロックとして追加
		for (let i = 0; i < paragraphs.length; i += 100) {
			const chunk = paragraphs.slice(i, i + 100);
			const blocks = chunk.map((paragraph) => ({
				object: "block",
				type: "paragraph",
				paragraph: {
					rich_text: [{ type: "text", text: { content: paragraph.trim() } }],
				},
			}));

			await notion.blocks.children.append({
				block_id: pageId,
				children: blocks,
			});

			console.log(
				`✅ Added chunk ${Math.floor(i / 100) + 1}/${Math.ceil(
					paragraphs.length / 100
				)}`
			);
		}

		console.log(`✅ Added all content to page`);
	} catch (error) {
		console.error(`❌ Error adding content:`, error);
	}
};

/**
 * メイン処理
 */
const main = async () => {
	try {
		console.log("🚀 Starting user guide re-export...");

		// 日本語版ユーザーガイド
		console.log("\n📄 Processing Japanese User Guide...");
		const japaneseContent = readMarkdownFile("USER_GUIDE_JA.md");
		await clearPageContent(JAPANESE_PAGE_ID);
		await addContent(JAPANESE_PAGE_ID, japaneseContent);
		console.log("✅ Japanese User Guide updated successfully");

		// 英語版ユーザーガイド
		console.log("\n📄 Processing English User Guide...");
		const englishContent = readMarkdownFile("USER_GUIDE.md");
		await clearPageContent(ENGLISH_PAGE_ID);
		await addContent(ENGLISH_PAGE_ID, englishContent);
		console.log("✅ English User Guide updated successfully");

		console.log("\n🎉 User guide re-export completed!");
	} catch (error) {
		console.error("❌ Export failed:", error);
		process.exit(1);
	}
};

// スクリプト実行
main();
