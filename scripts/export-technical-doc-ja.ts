import { Client } from "@notionhq/client";
import * as fs from "fs";
import * as path from "path";

// Notion APIクライアントの初期化
const notion = new Client({
	auth: process.env.VITE_NOTION_TOKEN,
});

// Obsidianベースのドキュメントディレクトリ
const DOCS_DIR = path.join(process.cwd(), "obsidian-vault");

// 親ページID
const PARENT_PAGE_ID = "234a7adbd8eb8090a653db334bb4f5ce";

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
 * 既存のページを削除
 */
const deleteExistingPage = async (title: string) => {
	try {
		// 親ページの子ページを取得
		const response = await notion.blocks.children.list({
			block_id: PARENT_PAGE_ID,
		});

		// タイトルが一致するページを削除
		for (const block of response.results) {
			if ("type" in block && block.type === "child_page") {
				try {
					const page = await notion.pages.retrieve({ page_id: block.id });
					if (
						"properties" in page &&
						page.properties.title?.title?.[0]?.text?.content === title
					) {
						await notion.pages.update({
							page_id: block.id,
							archived: true,
						});
						console.log(`🗑️ Deleted existing page: ${title}`);
						return;
					}
				} catch (error) {
					// ページが見つからない場合は無視
					continue;
				}
			}
		}
	} catch (error) {
		console.log(`📝 No existing page to delete`);
	}
};

/**
 * ページを作成
 */
const createPage = async (title: string) => {
	try {
		console.log(`📝 Creating new page: ${title}`);

		const page = await notion.pages.create({
			parent: { type: "page_id", page_id: PARENT_PAGE_ID },
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
 * マークダウンをNotionブロックに変換（改善版）
 */
const parseMarkdownToBlocks = (content: string) => {
	const lines = content.split("\n");
	const blocks: any[] = [];
	let currentList: any[] = [];
	let inCodeBlock = false;
	let codeBlockContent = "";
	let codeBlockLanguage = "";
	let currentParagraph = "";

	// 段落を適切に処理する関数
	const flushParagraph = () => {
		if (currentParagraph.trim()) {
			// 太字の処理
			let richText = [
				{ type: "text" as const, text: { content: currentParagraph.trim() } },
			];

			// 太字の置換
			if (currentParagraph.includes("**")) {
				const parts = currentParagraph.split("**");
				richText = [];
				for (let j = 0; j < parts.length; j++) {
					if (j % 2 === 1) {
						// 太字部分
						richText.push({
							type: "text" as const,
							text: { content: parts[j] },
							annotations: { bold: true },
						});
					} else if (parts[j]) {
						// 通常テキスト
						richText.push({
							type: "text" as const,
							text: { content: parts[j] },
						});
					}
				}
			}

			blocks.push({
				object: "block" as const,
				type: "paragraph" as const,
				paragraph: {
					rich_text: richText,
				},
			});
			currentParagraph = "";
		}
	};

	// リストをフラッシュする関数
	const flushList = () => {
		if (currentList.length > 0) {
			blocks.push(...currentList);
			currentList = [];
		}
	};

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		const trimmedLine = line.trim();

		// コードブロックの処理
		if (line.startsWith("```")) {
			flushParagraph();
			flushList();

			if (!inCodeBlock) {
				// コードブロック開始
				inCodeBlock = true;
				codeBlockLanguage = line.slice(3).trim();
				codeBlockContent = "";
			} else {
				// コードブロック終了
				inCodeBlock = false;
				// Notionでサポートされている言語かチェック
				const supportedLanguages = [
					"abc",
					"abap",
					"agda",
					"arduino",
					"ascii art",
					"assembly",
					"bash",
					"basic",
					"bnf",
					"c",
					"c#",
					"c++",
					"clojure",
					"coffeescript",
					"coq",
					"css",
					"dart",
					"dhall",
					"diff",
					"docker",
					"ebnf",
					"elixir",
					"elm",
					"erlang",
					"f#",
					"flow",
					"fortran",
					"gherkin",
					"glsl",
					"go",
					"graphql",
					"groovy",
					"haskell",
					"hcl",
					"html",
					"idris",
					"java",
					"javascript",
					"json",
					"julia",
					"kotlin",
					"latex",
					"less",
					"lisp",
					"livescript",
					"llvm ir",
					"lua",
					"makefile",
					"markdown",
					"markup",
					"matlab",
					"mathematica",
					"mermaid",
					"nix",
					"notion formula",
					"objective-c",
					"ocaml",
					"pascal",
					"perl",
					"php",
					"plain text",
					"powershell",
					"prolog",
					"protobuf",
					"purescript",
					"python",
					"r",
					"racket",
					"reason",
					"ruby",
					"rust",
					"sass",
					"scala",
					"scheme",
					"scss",
					"shell",
					"smalltalk",
					"solidity",
					"sql",
					"swift",
					"toml",
					"typescript",
					"vb.net",
					"verilog",
					"vhdl",
					"visual basic",
					"webassembly",
					"xml",
					"yaml",
					"java/c/c++/c#",
					"notionscript",
				];

				const language = supportedLanguages.includes(codeBlockLanguage)
					? codeBlockLanguage
					: "plain text";

				blocks.push({
					object: "block" as const,
					type: "code" as const,
					code: {
						rich_text: [
							{
								type: "text" as const,
								text: { content: codeBlockContent.trim() },
							},
						],
						language: language,
					},
				});
			}
			continue;
		}

		if (inCodeBlock) {
			codeBlockContent += line + "\n";
			continue;
		}

		// ヘッダーの処理
		if (line.startsWith("#")) {
			flushParagraph();
			flushList();

			const level = line.match(/^#+/)[0].length;
			const text = line.replace(/^#+\s*/, "");

			if (level === 1) {
				blocks.push({
					object: "block" as const,
					type: "heading_1" as const,
					heading_1: {
						rich_text: [{ type: "text" as const, text: { content: text } }],
					},
				});
			} else if (level === 2) {
				blocks.push({
					object: "block" as const,
					type: "heading_2" as const,
					heading_2: {
						rich_text: [{ type: "text" as const, text: { content: text } }],
					},
				});
			} else if (level === 3) {
				blocks.push({
					object: "block" as const,
					type: "heading_3" as const,
					heading_3: {
						rich_text: [{ type: "text" as const, text: { content: text } }],
					},
				});
			}
			continue;
		}

		// リストの処理
		if (trimmedLine.startsWith("- ") || trimmedLine.startsWith("* ")) {
			flushParagraph();
			const text = trimmedLine.slice(2);
			currentList.push({
				object: "block" as const,
				type: "bulleted_list_item" as const,
				bulleted_list_item: {
					rich_text: [{ type: "text" as const, text: { content: text } }],
				},
			});
			continue;
		}

		// 番号付きリストの処理
		if (/^\d+\.\s/.test(trimmedLine)) {
			flushParagraph();
			const text = trimmedLine.replace(/^\d+\.\s/, "");
			currentList.push({
				object: "block" as const,
				type: "numbered_list_item" as const,
				numbered_list_item: {
					rich_text: [{ type: "text" as const, text: { content: text } }],
				},
			});
			continue;
		}

		// 水平線の処理
		if (trimmedLine === "---" || trimmedLine === "***") {
			flushParagraph();
			flushList();
			blocks.push({
				object: "block" as const,
				type: "divider" as const,
				divider: {},
			});
			continue;
		}

		// 空行の処理
		if (trimmedLine === "") {
			flushParagraph();
			flushList();
			continue;
		}

		// 通常のテキスト行の処理
		if (currentParagraph) {
			currentParagraph += " " + trimmedLine;
		} else {
			currentParagraph = trimmedLine;
		}
	}

	// 最後の段落とリストをフラッシュ
	flushParagraph();
	flushList();

	return blocks;
};

/**
 * コンテンツを追加
 */
const addContent = async (pageId: string, content: string) => {
	try {
		console.log(`📝 Adding content to page...`);

		// 既存のコンテンツを削除
		try {
			const existingBlocks = await notion.blocks.children.list({
				block_id: pageId,
			});
			for (const block of existingBlocks.results) {
				await notion.blocks.delete({ block_id: block.id });
			}
			console.log(`🗑️ Cleared existing content`);
		} catch (error) {
			console.log(`📝 No existing content to clear`);
		}

		// マークダウンをブロックに変換
		const blocks = parseMarkdownToBlocks(content);

		// ブロックを100個ずつに分割して追加
		for (let i = 0; i < blocks.length; i += 100) {
			const chunk = blocks.slice(i, i + 100);

			await notion.blocks.children.append({
				block_id: pageId,
				children: chunk,
			});

			console.log(
				`✅ Added chunk ${Math.floor(i / 100) + 1}/${Math.ceil(
					blocks.length / 100
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
		console.log("🚀 Starting Japanese technical documentation export...");

		// 日本語版技術文書
		console.log("\n📄 Processing Japanese Technical Documentation...");
		const content = readMarkdownFile("技術文書_JA.md");

		// 既存のページを削除
		await deleteExistingPage("Portfolio Showcase - 技術文書 (日本語版)");

		// 新しいページを作成
		const pageId = await createPage("Portfolio Showcase - 技術文書 (日本語版)");
		await addContent(pageId, content);
		console.log("✅ Japanese Technical Documentation exported successfully");

		console.log("\n🎉 Japanese technical documentation export completed!");
	} catch (error) {
		console.error("❌ Export failed:", error);
		process.exit(1);
	}
};

// スクリプト実行
main();
