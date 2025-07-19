import { Client } from "@notionhq/client";
import { markdownToBlocks } from "@tryfabric/martian";
import * as fs from "fs";
import * as path from "path";

// Notion APIクライアントの初期化
const notion = new Client({
	auth: process.env.VITE_NOTION_TOKEN,
});

// ドキュメントディレクトリ
const DOCS_DIR = path.join(process.cwd(), "docs");

// 親ページID（環境変数から取得）
const PARENT_PAGE_ID = process.env.VITE_NOTION_PARENT_PAGE_ID;

/**
 * Notion URLからページIDを抽出
 */
const extractPageIdFromUrl = (url: string): string => {
	const cleanUrl = url.split("?")[0];
	const match = cleanUrl.match(/-([a-f0-9]{32})$/);
	if (match) {
		return match[1];
	}
	const lastPart = cleanUrl.split("/").pop();
	if (lastPart && lastPart.length === 32) {
		return lastPart;
	}
	throw new Error(`Invalid Notion URL format: ${url}`);
};

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
 * ページを作成
 */
const createPage = async (title: string, parentId?: string) => {
	try {
		console.log(`📝 Creating page: ${title}`);

		const page = await notion.pages.create({
			parent: parentId
				? { type: "page_id", page_id: parentId }
				: { type: "page_id", page_id: PARENT_PAGE_ID! },
			properties: {
				title: {
					title: [{ type: "text", text: { content: title } }],
				},
			},
		});

		console.log(`✅ Created page: ${title}`);
		return page.id;
	} catch (error) {
		console.error(`❌ Error creating page:`, error);
		throw error;
	}
};

/**
 * コンテンツを追加
 */
const addContent = async (pageId: string, content: string) => {
	try {
		// マークダウンをNotionブロックに変換
		const blocks = markdownToBlocks(content);

		// ブロックを100個ずつに分割
		const blockChunks = [];
		for (let i = 0; i < blocks.length; i += 100) {
			blockChunks.push(blocks.slice(i, i + 100));
		}

		// 各チャンクを追加
		for (let i = 0; i < blockChunks.length; i++) {
			await notion.blocks.children.append({
				block_id: pageId,
				children: blockChunks[i] as unknown[],
			});
			console.log(`✅ Added chunk ${i + 1}/${blockChunks.length}`);
		}

		console.log(`✅ Added all content to page`);
	} catch {
		console.error(`❌ Error adding content`);
	}
};

/**
 * メイン処理
 */
const main = async () => {
	try {
		console.log("🚀 Starting comprehensive Notion export...");

		// 親ページIDの確認と抽出
		let parentPageId = PARENT_PAGE_ID;
		if (!parentPageId) {
			console.error("❌ VITE_NOTION_PARENT_PAGE_ID is not set");
			process.exit(1);
		}

		if (parentPageId.includes("notion.so")) {
			try {
				parentPageId = extractPageIdFromUrl(parentPageId);
				console.log(`🔧 Extracted parent page ID: ${parentPageId}`);
			} catch (error) {
				console.error("❌ Invalid parent page URL format");
				process.exit(1);
			}
		}

		// エクスポートするドキュメントのリスト
		const documents = [
			{ filename: "API_SPECIFICATION.md", title: "API仕様書" },
			{ filename: "USER_GUIDE_JA.md", title: "ユーザーガイド (日本語)" },
			{ filename: "USER_GUIDE.md", title: "ユーザーガイド (英語)" },
			{ filename: "WORKFLOW_GUIDE.md", title: "ワークフローガイド" },
			{ filename: "PRD_TEMPLATE.md", title: "PRDテンプレート" },
		];

		// 各ドキュメントをエクスポート
		for (const doc of documents) {
			try {
				console.log(`\n📄 Processing: ${doc.filename}`);

				const document = readMarkdownFile(doc.filename);
				const pageId = await createPage(document.title, parentPageId);
				await addContent(pageId, document.content);

				console.log(`✅ Successfully exported: ${document.title}`);
			} catch (error) {
				console.error(`❌ Failed to export ${doc.filename}:`, error);
			}
		}

		console.log("\n🎉 Comprehensive Notion export completed!");
	} catch (error) {
		console.error("❌ Export failed:", error);
		process.exit(1);
	}
};

// スクリプト実行
main();
