import { Client } from "@notionhq/client";
import { markdownToBlocks } from "@tryfabric/martian";
import * as fs from "fs";
import * as path from "path";

// Notion APIクライアントの初期化
const notion = new Client({
	auth: process.env.VITE_NOTION_TOKEN,
});

// ファイルパス
const OBSIDIAN_FILE = path.join(process.cwd(), "obsidian-workspace.md");
const DOCS_DIR = path.join(process.cwd(), "docs");

// 環境変数
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

/**
 * Obsidianファイルを読み込み
 */
const readObsidianFile = (): string => {
	if (!fs.existsSync(OBSIDIAN_FILE)) {
		throw new Error(`Obsidian workspace file not found: ${OBSIDIAN_FILE}`);
	}
	return fs.readFileSync(OBSIDIAN_FILE, "utf-8");
};

/**
 * マーメイド記法を特別に処理
 */
const convertMarkdownToNotionBlocks = (markdown: string): any[] => {
	try {
		console.log("🔄 Converting Obsidian markdown to Notion blocks...");

		// マーメイド記法を特別に処理
		const mermaidBlocks: any[] = [];
		const lines = markdown.split("\n");
		let inMermaidBlock = false;
		let mermaidContent = "";
		let nonMermaidContent = "";

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];

			// マーメイドブロックの開始を検出
			if (line.trim() === "```mermaid") {
				inMermaidBlock = true;
				mermaidContent = "";
				continue;
			}

			// マーメイドブロックの終了を検出
			if (inMermaidBlock && line.trim() === "```") {
				inMermaidBlock = false;

				// マーメイドコードブロックを作成（```mermaidと```を除去）
				const cleanMermaidContent = mermaidContent
					.replace(/^```mermaid\n/, "")
					.replace(/\n```$/, "")
					.trim();

				mermaidBlocks.push({
					object: "block",
					type: "code",
					code: {
						rich_text: [
							{ type: "text", text: { content: cleanMermaidContent } },
						],
						language: "mermaid",
					},
				});
				continue;
			}

			// マーメイドブロック内のコンテンツ
			if (inMermaidBlock) {
				mermaidContent += line + "\n";
			} else {
				nonMermaidContent += line + "\n";
			}
		}

		// マーメイド以外のコンテンツをmartianで変換
		const regularBlocks = markdownToBlocks(nonMermaidContent) as any[];

		// マーメイドブロックと通常ブロックを結合
		const allBlocks = [...regularBlocks, ...mermaidBlocks];

		console.log(
			`✅ Converted to ${allBlocks.length} blocks (${mermaidBlocks.length} mermaid blocks)`
		);

		return allBlocks;
	} catch (error) {
		console.error("❌ Error converting markdown to blocks:", error);
		return [
			{
				object: "block",
				type: "paragraph",
				paragraph: {
					rich_text: [
						{
							type: "text",
							text: { content: "マークダウンの変換に失敗しました。" },
						},
					],
				},
			},
		];
	}
};

/**
 * コンテンツをチャンクに分割（マーメイドブロックを分割しない）
 */
const splitContentIntoChunks = (
	content: string,
	maxLength: number = 2000
): string[] => {
	const chunks: string[] = [];
	let currentChunk = "";
	let inMermaidBlock = false;
	let mermaidBlockContent = "";

	const lines = content.split("\n");

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];

		// マーメイドブロックの開始を検出
		if (line.trim() === "```mermaid") {
			// 現在のチャンクを保存
			if (currentChunk) {
				chunks.push(currentChunk);
				currentChunk = "";
			}

			inMermaidBlock = true;
			mermaidBlockContent = line + "\n";
			continue;
		}

		// マーメイドブロックの終了を検出
		if (inMermaidBlock && line.trim() === "```") {
			mermaidBlockContent += line + "\n";
			inMermaidBlock = false;

			// マーメイドブロックを独立したチャンクとして追加
			chunks.push(mermaidBlockContent);
			mermaidBlockContent = "";
			continue;
		}

		// マーメイドブロック内のコンテンツ
		if (inMermaidBlock) {
			mermaidBlockContent += line + "\n";
			continue;
		}

		// 通常のコンテンツ
		const potentialChunk = currentChunk + (currentChunk ? "\n" : "") + line;

		if (potentialChunk.length > maxLength) {
			// 現在のチャンクを保存
			if (currentChunk) {
				chunks.push(currentChunk);
			}
			// 新しいチャンクを開始
			currentChunk = line;
		} else {
			currentChunk = potentialChunk;
		}
	}

	// 最後のチャンクを追加
	if (currentChunk) {
		chunks.push(currentChunk);
	}

	// マーメイドブロックが終了していない場合
	if (inMermaidBlock && mermaidBlockContent) {
		chunks.push(mermaidBlockContent);
	}

	return chunks;
};

/**
 * ページにコンテンツを追加
 */
const addContentToPage = async (pageId: string, content: string) => {
	try {
		// コンテンツを分割
		const chunks = splitContentIntoChunks(content);
		console.log(`📝 Splitting content into ${chunks.length} chunks`);

		// 各チャンクを追加
		for (let i = 0; i < chunks.length; i++) {
			const chunk = chunks[i];
			const blockTitle =
				chunks.length > 1 ? `Part ${i + 1}/${chunks.length}` : "Content";

			// マークダウンをNotionブロックに変換
			const notionBlocks = convertMarkdownToNotionBlocks(chunk);

			// ヘッダーを先に追加
			await notion.blocks.children.append({
				block_id: pageId,
				children: [
					{
						object: "block",
						type: "heading_3",
						heading_3: {
							rich_text: [{ type: "text", text: { content: blockTitle } }],
						},
					},
				],
			});

			// ブロックを100個ずつに分割
			const blockChunks = [];
			for (let j = 0; j < notionBlocks.length; j += 100) {
				blockChunks.push(notionBlocks.slice(j, j + 100));
			}

			// 各チャンクを追加
			for (let k = 0; k < blockChunks.length; k++) {
				await notion.blocks.children.append({
					block_id: pageId,
					children: blockChunks[k],
				});
			}

			console.log(
				`✅ Added chunk ${i + 1}/${chunks.length} with ${
					notionBlocks.length
				} blocks (${blockChunks.length} API calls)`
			);
		}

		console.log(`✅ Added all content to page`);
	} catch (error) {
		console.error(`❌ Error adding content:`, error);
	}
};

/**
 * 新しいページを作成
 */
const createNewPage = async (title: string, parentId: string) => {
	try {
		console.log(`📝 Creating new page: ${title}`);

		const page = await notion.pages.create({
			parent: { type: "page_id", page_id: parentId },
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
 * メイン処理
 */
const main = async () => {
	try {
		console.log("🚀 Starting Obsidian to Notion export...");

		// 親ページIDの確認と抽出
		let parentPageId = PARENT_PAGE_ID;
		if (!parentPageId) {
			console.error("❌ VITE_NOTION_PARENT_PAGE_ID is not set");
			console.log("💡 Please set VITE_NOTION_PARENT_PAGE_ID in your .env file");
			process.exit(1);
		}

		// URLの場合はIDを抽出
		if (parentPageId.includes("notion.so")) {
			try {
				parentPageId = extractPageIdFromUrl(parentPageId);
				console.log(`🔧 Extracted parent page ID: ${parentPageId}`);
			} catch (error) {
				console.error("❌ Invalid parent page URL format");
				process.exit(1);
			}
		}

		// Obsidianファイルを読み込み
		console.log("📖 Reading Obsidian workspace file...");
		const obsidianContent = readObsidianFile();
		console.log(`✅ Read ${obsidianContent.length} characters`);

		// 新しいページを作成
		const pageId = await createNewPage(
			"Portfolio Showcase - Obsidian Workspace",
			parentPageId
		);

		// コンテンツを追加
		await addContentToPage(pageId, obsidianContent);

		console.log("🎉 Obsidian to Notion export completed!");
		console.log(
			`📄 Page created: https://notion.so/${pageId.replace(/-/g, "")}`
		);
	} catch (error) {
		console.error("❌ Export failed:", error);
		process.exit(1);
	}
};

// スクリプト実行
main();
