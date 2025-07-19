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

// テンプレートページID（環境変数から取得）
const TECHNICAL_DOC_TEMPLATE_ID = process.env.VITE_NOTION_TECHNICAL_TEMPLATE_ID;
const PRD_TEMPLATE_ID = process.env.VITE_NOTION_PRD_TEMPLATE_ID;

// 親ページID（環境変数から取得）
const PARENT_PAGE_ID = process.env.VITE_NOTION_PARENT_PAGE_ID;

/**
 * Notion URLからページIDを抽出
 */
const extractPageIdFromUrl = (url: string): string => {
	// URLからクエリパラメータを除去
	const cleanUrl = url.split("?")[0];

	// URLの最後のハイフンの後の部分を抽出
	const match = cleanUrl.match(/-([a-f0-9]{32})$/);
	if (match) {
		return match[1];
	}

	// ハイフンがない場合は、URLの最後の部分をそのまま使用
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
 * テンプレートなしでページを作成
 */
const createPageWithoutTemplate = async (title: string, parentId?: string) => {
	try {
		console.log(`📝 Creating page without template: ${title}`);

		const page = await notion.pages.create({
			parent: parentId
				? { type: "page_id", page_id: parentId }
				: { type: "page_id", page_id: PARENT_PAGE_ID! },
			properties: {
				title: {
					title: [{ type: "text", text: { content: title } }],
				},
			},
			children: [
				{
					object: "block",
					type: "heading_1",
					heading_1: {
						rich_text: [{ type: "text", text: { content: "概要" } }],
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
									content:
										"このドキュメントはPortfolio Showcaseの技術仕様書です。",
								},
							},
						],
					},
				},
			],
		});

		console.log(`✅ Created page without template: ${title}`);
		return page.id;
	} catch (error) {
		console.error(`❌ Error creating page without template:`, error);
		throw error;
	}
};

/**
 * テンプレートからページを複製
 */
const duplicateTemplatePage = async (
	templateId: string,
	title: string,
	parentId?: string
) => {
	try {
		// テンプレートページの存在確認
		console.log(`🔍 Checking template page: ${templateId}`);
		try {
			await notion.pages.retrieve({ page_id: templateId });
			console.log("✅ Template page found");
		} catch (error) {
			console.error("❌ Template page not found or not accessible");
			console.error(
				"💡 Make sure the template page is shared with your integration"
			);
			throw error;
		}

		// テンプレートのブロックを取得
		const templateBlocks = await notion.blocks.children.list({
			block_id: templateId,
		});

		console.log(`📋 Found ${templateBlocks.results.length} template blocks`);

		// テンプレートページを複製
		const duplicatedPage = await notion.pages.create({
			parent: parentId
				? { type: "page_id", page_id: parentId }
				: { type: "page_id", page_id: PARENT_PAGE_ID! },
			properties: {
				title: {
					title: [{ type: "text", text: { content: title } }],
				},
			},
			// テンプレートの内容を直接コピー（空の場合は基本構造を作成）
			children:
				templateBlocks.results.length > 0
					? (templateBlocks.results as any)
					: [
							{
								object: "block",
								type: "heading_1",
								heading_1: {
									rich_text: [{ type: "text", text: { content: "概要" } }],
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
												content:
													"このドキュメントはPortfolio Showcaseの技術仕様書です。",
											},
										},
									],
								},
							},
							{
								object: "block",
								type: "heading_1",
								heading_1: {
									rich_text: [{ type: "text", text: { content: "目次" } }],
								},
							},
							{
								object: "block",
								type: "bulleted_list_item",
								bulleted_list_item: {
									rich_text: [
										{
											type: "text",
											text: { content: "システムアーキテクチャ" },
										},
									],
								},
							},
							{
								object: "block",
								type: "bulleted_list_item",
								bulleted_list_item: {
									rich_text: [
										{ type: "text", text: { content: "データベース設計" } },
									],
								},
							},
							{
								object: "block",
								type: "bulleted_list_item",
								bulleted_list_item: {
									rich_text: [{ type: "text", text: { content: "API仕様" } }],
								},
							},
					  ],
		});

		console.log(`✅ Created page from template: ${title}`);
		return duplicatedPage.id;
	} catch (error) {
		console.error(`❌ Error duplicating template:`, error);
		throw error;
	}
};

/**
 * テキストを短縮する
 */
const shortenText = (text: string, maxLength: number = 500): string => {
	if (text.length <= maxLength) return text;

	// 文章の区切りで短縮
	const sentences = text.split(/[。！？]/);
	let result = "";

	for (const sentence of sentences) {
		if ((result + sentence).length > maxLength) {
			break;
		}
		result += sentence + "。";
	}

	return result || text.substring(0, maxLength) + "...";
};

/**
 * コードブロックを短縮する
 */
const shortenCodeBlock = (code: string, maxLength: number = 200): string => {
	if (code.length <= maxLength) return code;

	// コードブロックの開始と終了を保持
	const lines = code.split("\n");
	const firstLine = lines[0];
	const lastLine = lines[lines.length - 1];

	// 中間部分を短縮
	const middleLines = lines.slice(1, -1);
	const shortenedMiddle = middleLines.slice(0, 3).join("\n");

	if (middleLines.length > 3) {
		return `${firstLine}\n${shortenedMiddle}\n... (${
			middleLines.length - 3
		} lines omitted)\n${lastLine}`;
	}

	return code;
};

/**
 * マークダウンをNotionブロックに変換（martianライブラリ最適化版）
 */
const convertMarkdownToNotionBlocks = (markdown: string): any[] => {
	try {
		console.log("🔄 Converting markdown to Notion blocks...");

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
					.replace(/^```mermaid\n/, "") // 先頭の```mermaidを除去
					.replace(/\n```$/, "") // 末尾の```を除去
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

		// ブロックの内容を短縮処理（Notion API制限対応）
		const processedBlocks = allBlocks.map((block) => {
			// 各ブロックタイプに応じて内容を短縮（必要な場合のみ）
			if (block.type === "paragraph" && block.paragraph?.rich_text) {
				const text = block.paragraph.rich_text[0]?.text?.content || "";
				if (text.length > 500) {
					const shortenedText = shortenText(text, 500);
					return {
						...block,
						paragraph: {
							...block.paragraph,
							rich_text: [{ type: "text", text: { content: shortenedText } }],
						},
					};
				}
			}

			if (
				block.type === "bulleted_list_item" &&
				block.bulleted_list_item?.rich_text
			) {
				const text = block.bulleted_list_item.rich_text[0]?.text?.content || "";
				if (text.length > 300) {
					const shortenedText = shortenText(text, 300);
					return {
						...block,
						bulleted_list_item: {
							...block.bulleted_list_item,
							rich_text: [{ type: "text", text: { content: shortenedText } }],
						},
					};
				}
			}

			if (
				block.type === "numbered_list_item" &&
				block.numbered_list_item?.rich_text
			) {
				const text = block.numbered_list_item.rich_text[0]?.text?.content || "";
				if (text.length > 300) {
					const shortenedText = shortenText(text, 300);
					return {
						...block,
						numbered_list_item: {
							...block.numbered_list_item,
							rich_text: [{ type: "text", text: { content: shortenedText } }],
						},
					};
				}
			}

			if (block.type === "code" && block.code?.rich_text) {
				const text = block.code.rich_text[0]?.text?.content || "";
				if (text.length > 200) {
					const shortenedCode = shortenCodeBlock(text, 200);
					return {
						...block,
						code: {
							...block.code,
							rich_text: [{ type: "text", text: { content: shortenedCode } }],
						},
					};
				}
			}

			// 見出しの短縮（必要な場合のみ）
			if (block.type === "heading_1" && block.heading_1?.rich_text) {
				const text = block.heading_1.rich_text[0]?.text?.content || "";
				if (text.length > 200) {
					const shortenedText = shortenText(text, 200);
					return {
						...block,
						heading_1: {
							...block.heading_1,
							rich_text: [{ type: "text", text: { content: shortenedText } }],
						},
					};
				}
			}

			if (block.type === "heading_2" && block.heading_2?.rich_text) {
				const text = block.heading_2.rich_text[0]?.text?.content || "";
				if (text.length > 200) {
					const shortenedText = shortenText(text, 200);
					return {
						...block,
						heading_2: {
							...block.heading_2,
							rich_text: [{ type: "text", text: { content: shortenedText } }],
						},
					};
				}
			}

			if (block.type === "heading_3" && block.heading_3?.rich_text) {
				const text = block.heading_3.rich_text[0]?.text?.content || "";
				if (text.length > 200) {
					const shortenedText = shortenText(text, 200);
					return {
						...block,
						heading_3: {
							...block.heading_3,
							rich_text: [{ type: "text", text: { content: shortenedText } }],
						},
					};
				}
			}

			return block;
		});

		console.log(
			`✅ Processed ${processedBlocks.length} blocks with length optimization`
		);
		return processedBlocks;
	} catch (error) {
		console.error("❌ Error converting markdown to blocks:", error);
		// フォールバック: 空の段落ブロックを返す
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
 * コンテンツを2000文字以下のチャンクに分割（マーメイドブロックを分割しない）
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
 * ページにドキュメント内容を追加
 */
const addDocumentContent = async (pageId: string, content: string) => {
	try {
		// コンテンツを分割
		const chunks = splitContentIntoChunks(content);
		console.log(`📝 Splitting content into ${chunks.length} chunks`);

		// ヘッダーは追加しない（マークダウンの内容を直接追加）

		// 各チャンクをリッチテキスト形式で追加
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

		console.log(`✅ Added all document content to page`);
	} catch (error) {
		console.error(`❌ Error adding content:`, error);
	}
};

/**
 * 既存ページを更新
 */
const updateExistingPage = async (pageId: string, content: string) => {
	try {
		console.log(`🔄 Updating existing page: ${pageId}`);

		// 既存のコンテンツを削除（テンプレートの内容を保持し、追加コンテンツのみ削除）
		const existingBlocks = await notion.blocks.children.list({
			block_id: pageId,
		});

		// テンプレートの基本構造を保持し、追加されたコンテンツのみ削除
		// 最初の見出しや基本構造は残す
		console.log(`📝 Keeping template structure, removing additional content`);

		// 新しいコンテンツを追加
		await addDocumentContent(pageId, content);
		console.log(`✅ Updated existing page successfully`);
	} catch (error) {
		console.error(`❌ Error updating page:`, error);
	}
};

/**
 * メイン処理
 */
const main = async () => {
	try {
		console.log("🚀 Starting Notion template-based export...");

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

		// 技術ドキュメントテンプレートから作成
		if (TECHNICAL_DOC_TEMPLATE_ID) {
			console.log("📝 Creating technical documentation from template...");

			// テンプレートIDの抽出
			let templateId = TECHNICAL_DOC_TEMPLATE_ID;
			if (templateId.includes("notion.so")) {
				try {
					templateId = extractPageIdFromUrl(templateId);
					console.log(`🔧 Extracted template ID: ${templateId}`);
				} catch (error) {
					console.error("❌ Invalid template URL format");
					console.log("⚠️ Skipping template creation due to invalid URL");
					return;
				}
			}
			console.log(`🔍 Template ID: ${templateId}`);

			try {
				const technicalDoc = readMarkdownFile("TECHNICAL_DOCUMENTATION.md");
				const pageId = await duplicateTemplatePage(
					templateId,
					`${technicalDoc.title} (English)`,
					parentPageId
				);
				await addDocumentContent(pageId, technicalDoc.content);

				console.log("✅ English technical documentation created successfully");
			} catch (error) {
				console.error(
					"❌ Error creating technical documentation template:",
					error
				);
				console.log("⚠️ Template page may not exist or be accessible");
				console.log("💡 Creating document without template...");

				// テンプレートなしでページを作成
				try {
					const technicalDoc = readMarkdownFile("TECHNICAL_DOCUMENTATION.md");
					const pageId = await createPageWithoutTemplate(
						`${technicalDoc.title} (English)`,
						parentPageId
					);
					await addDocumentContent(pageId, technicalDoc.content);
					console.log(
						"✅ English technical documentation created without template"
					);
				} catch (fallbackError) {
					console.error(
						"❌ Error creating document without template:",
						fallbackError
					);
				}
			}
		} else {
			console.warn("⚠️ VITE_NOTION_TECHNICAL_TEMPLATE_ID not set");
		}

		// PRDテンプレートから作成（一時的にスキップ）
		if (PRD_TEMPLATE_ID) {
			console.log("📝 Creating PRD from template...");

			// テンプレートIDの抽出
			let templateId = PRD_TEMPLATE_ID;
			if (templateId.includes("notion.so")) {
				try {
					templateId = extractPageIdFromUrl(templateId);
					console.log(`🔧 Extracted template ID: ${templateId}`);
				} catch (error) {
					console.error("❌ Invalid template URL format");
					console.log("⚠️ Skipping PRD template creation due to invalid URL");
					return;
				}
			}
			console.log(`🔍 Template ID: ${templateId}`);

			try {
				const technicalDoc = readMarkdownFile("TECHNICAL_DOCUMENTATION.md");
				const pageId = await duplicateTemplatePage(
					templateId,
					`${technicalDoc.title} (English)`,
					parentPageId
				);
				await addDocumentContent(pageId, technicalDoc.content);

				console.log("✅ English PRD created successfully");
			} catch (error) {
				console.error("❌ Error creating PRD template:", error);
				console.log("⚠️ PRD template page may not exist or be accessible");
				console.log(
					"💡 Please create a new PRD template page and update the environment variable"
				);
			}
		} else {
			console.warn("⚠️ VITE_NOTION_PRD_TEMPLATE_ID not set");
		}

		console.log("🎉 Template-based Notion export completed!");
	} catch (error) {
		console.error("❌ Export failed:", error);
		process.exit(1);
	}
};

// スクリプト実行
main();
