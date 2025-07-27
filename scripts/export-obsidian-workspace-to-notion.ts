import { Client } from "@notionhq/client";
import * as fs from "node:fs";
import * as path from "node:path";
import * as dotenv from "dotenv";

// 型定義
interface NotionRichText {
	type: "text";
	text: { content: string };
	annotations?: {
		bold?: boolean;
		italic?: boolean;
		strikethrough?: boolean;
		underline?: boolean;
		code?: boolean;
		color?: string;
	};
}

interface NotionBlock {
	object: "block";
	type: string;
	[key: string]: unknown;
}

// .envファイルを読み込み
dotenv.config();

// Notion APIクライアントの初期化
const notion = new Client({
	auth: process.env.VITE_NOTION_TOKEN,
});

// Obsidianファイルパス
const TECHNICAL_WORKSPACE_FILE = path.join(
	process.cwd(),
	"obsidian-vault/技術文書_EN.md"
);
const USER_GUIDE_JA_FILE = path.join(
	process.cwd(),
	"obsidian-vault/user-guide.md"
);
const USER_GUIDE_EN_FILE = path.join(
	process.cwd(),
	"obsidian-vault/user-guide-en.md"
);

// 既存のNotionページID
const TECHNICAL_DOC_EN_PAGE_ID = "234a7adb-d8eb-81df-b9b0-df9cdd5f75fa";
const TECHNICAL_DOC_JA_PAGE_ID = "234a7adb-d8eb-81fc-9785-d4bb18f7a67d";
const USER_GUIDE_JA_PAGE_ID = "234a7adb-d8eb-81e1-bad6-e97608f79dd1";
const USER_GUIDE_EN_PAGE_ID = "234a7adb-d8eb-8166-bf52-ff135a0dc76d";

/**
 * 太字やイタリックなどのリッチテキストを解析
 */
const parseRichText = (text: string): unknown[] => {
	const richText: unknown[] = [];
	let currentPos = 0;

	// 太字 **text** を処理
	const boldRegex = /\*\*(.*?)\*\*/g;
	let match: RegExpExecArray | null;

	while ((match = boldRegex.exec(text)) !== null) {
		// 太字の前のテキスト
		if (match.index > currentPos) {
			const beforeText = text.slice(currentPos, match.index);
			if (beforeText) {
				richText.push({ type: "text", text: { content: beforeText } });
			}
		}

		// 太字テキスト
		richText.push({
			type: "text",
			text: { content: match[1] },
			annotations: { bold: true },
		});

		currentPos = match.index + match[0].length;
	}

	// 残りのテキスト
	if (currentPos < text.length) {
		const remainingText = text.slice(currentPos);
		if (remainingText) {
			richText.push({ type: "text", text: { content: remainingText } });
		}
	}

	// リッチテキストが空の場合は元のテキストを返す
	return richText.length > 0
		? richText
		: [{ type: "text", text: { content: text } }];
};

/**
 * MarkdownをNotionブロックに変換
 */
const parseMarkdownToBlocks = (markdown: string): unknown[] => {
	const lines = markdown.split("\n");
	const blocks: unknown[] = [];
	let i = 0;

	while (i < lines.length) {
		const line = lines[i];

		// 空行をスキップ
		if (!line.trim()) {
			i++;
			continue;
		}

		// ヘッダー
		if (line.startsWith("#")) {
			const level = line.match(/^#+/)?.[0].length || 1;
			const text = line.replace(/^#+\s*/, "");

			if (level === 1) {
				blocks.push({
					object: "block",
					type: "heading_1",
					heading_1: {
						rich_text: parseRichText(text),
					},
				});
			} else if (level === 2) {
				blocks.push({
					object: "block",
					type: "heading_2",
					heading_2: {
						rich_text: parseRichText(text),
					},
				});
			} else {
				blocks.push({
					object: "block",
					type: "heading_3",
					heading_3: {
						rich_text: parseRichText(text),
					},
				});
			}
		}
		// 水平線
		else if (line.trim() === "---") {
			blocks.push({
				object: "block",
				type: "divider",
				divider: {},
			});
		}
		// コードブロック（Mermaidを含む）
		else if (line.startsWith("```")) {
			const language = line.replace("```", "").trim();
			i++; // 次の行へ
			let codeContent = "";

			// コードブロックの終わりまで読み取り
			while (i < lines.length && !lines[i].startsWith("```")) {
				codeContent += lines[i] + "\n";
				i++;
			}

			// Mermaidの場合は特別な処理
			if (language === "mermaid") {
				blocks.push({
					object: "block",
					type: "code",
					code: {
						language: "mermaid",
						rich_text: [
							{ type: "text", text: { content: codeContent.trim() } },
						],
					},
				});
			} else {
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

				const safeLanguage = supportedLanguages.includes(language)
					? language
					: "plain text";

				blocks.push({
					object: "block",
					type: "code",
					code: {
						language: safeLanguage,
						rich_text: [
							{ type: "text", text: { content: codeContent.trim() } },
						],
					},
				});
			}
		}
		// リスト項目
		else if (line.match(/^\s*[-*+]\s/)) {
			const text = line.replace(/^\s*[-*+]\s/, "");
			blocks.push({
				object: "block",
				type: "bulleted_list_item",
				bulleted_list_item: {
					rich_text: parseRichText(text),
				},
			});
		}
		// 番号付きリスト
		else if (line.match(/^\s*\d+\.\s/)) {
			const text = line.replace(/^\s*\d+\.\s/, "");
			blocks.push({
				object: "block",
				type: "numbered_list_item",
				numbered_list_item: {
					rich_text: parseRichText(text),
				},
			});
		}
		// チェックボックス
		else if (line.match(/^\s*-\s\[\s?\]\s/)) {
			const text = line.replace(/^\s*-\s\[\s?\]\s/, "");
			blocks.push({
				object: "block",
				type: "to_do",
				to_do: {
					rich_text: parseRichText(text),
					checked: false,
				},
			});
		}
		// チェック済みボックス
		else if (line.match(/^\s*-\s\[x\]\s/i)) {
			const text = line.replace(/^\s*-\s\[x\]\s/i, "");
			blocks.push({
				object: "block",
				type: "to_do",
				to_do: {
					rich_text: parseRichText(text),
					checked: true,
				},
			});
		}
		// テーブル行
		else if (
			line.includes("|") &&
			line.trim().startsWith("|") &&
			line.trim().endsWith("|")
		) {
			// テーブルの検出と処理
			const tableRows = [];
			let currentLine = i;

			// テーブル行を収集
			while (
				currentLine < lines.length &&
				lines[currentLine].includes("|") &&
				lines[currentLine].trim().startsWith("|") &&
				lines[currentLine].trim().endsWith("|")
			) {
				// 区切り行（---|---）をスキップ
				if (!lines[currentLine].match(/^\|\s*[-:]+\s*\|/)) {
					tableRows.push(lines[currentLine]);
				}
				currentLine++;
			}

			// テーブルを段落ブロックとして追加（Notionのテーブルブロックは複雑なため）
			if (tableRows.length > 0) {
				tableRows.forEach((row) => {
					const cells = row
						.split("|")
						.slice(1, -1)
						.map((cell) => cell.trim())
						.join(" | ");
					blocks.push({
						object: "block",
						type: "paragraph",
						paragraph: {
							rich_text: parseRichText(cells),
						},
					});
				});
			}

			i = currentLine - 1; // ループの最後でi++されるので-1
		}
		// 通常の段落
		else if (line.trim()) {
			// 複数行の段落を結合
			let paragraphText = line;
			let nextLine = i + 1;

			while (
				nextLine < lines.length &&
				lines[nextLine].trim() &&
				!lines[nextLine].startsWith("#") &&
				!lines[nextLine].startsWith("```") &&
				!lines[nextLine].match(/^\s*[-*+\d]\s/) &&
				!lines[nextLine].includes("|") &&
				lines[nextLine].trim() !== "---"
			) {
				paragraphText += " " + lines[nextLine];
				nextLine++;
				i++;
			}

			// 太字とリッチテキストを処理
			const richText = parseRichText(paragraphText);

			blocks.push({
				object: "block",
				type: "paragraph",
				paragraph: {
					rich_text: richText,
				},
			});
		}

		i++;
	}

	return blocks;
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
 * Notionブロックを追加
 */
const addBlocks = async (pageId: string, blocks: unknown[]) => {
	try {
		console.log(`📝 Adding ${blocks.length} blocks to page...`);

		// ブロックを100個ずつに分割して追加（Notion APIの制限）
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

			// API制限を避けるため少し待機
			if (i + 100 < blocks.length) {
				await new Promise((resolve) => setTimeout(resolve, 500));
			}
		}

		console.log(`✅ Added all blocks to page`);
	} catch (error) {
		console.error(`❌ Error adding blocks:`, error);
		throw error;
	}
};

/**
 * ファイルを読み込んでブロックに変換
 */
const loadAndParseFile = (filePath: string, fileName: string) => {
	try {
		const content = fs.readFileSync(filePath, "utf-8");
		console.log(`📄 Read ${fileName}: ${content.length} characters`);

		const blocks = parseMarkdownToBlocks(content);
		console.log(`🔄 Converted ${fileName} to ${blocks.length} Notion blocks`);

		return { content, blocks };
	} catch (error) {
		console.error(`❌ Error reading ${fileName}:`, error);
		return null;
	}
};

/**
 * メイン処理
 */
const main = async () => {
	try {
		console.log("🚀 Starting Obsidian documents export to Notion...");

		// 各ファイルを読み込み
		const technicalDoc = loadAndParseFile(
			TECHNICAL_WORKSPACE_FILE,
			"Technical Documentation"
		);
		const userGuideJa = loadAndParseFile(
			USER_GUIDE_JA_FILE,
			"User Guide (Japanese)"
		);
		const userGuideEn = loadAndParseFile(
			USER_GUIDE_EN_FILE,
			"User Guide (English)"
		);

		if (!technicalDoc || !userGuideJa || !userGuideEn) {
			throw new Error("Failed to load one or more files");
		}

		// ページとコンテンツのマッピング
		const pageUpdates = [
			{
				id: TECHNICAL_DOC_EN_PAGE_ID,
				name: "Technical Documentation (English)",
				blocks: technicalDoc.blocks,
				stats: {
					characters: technicalDoc.content.length,
					blocks: technicalDoc.blocks.length,
				},
			},
			{
				id: TECHNICAL_DOC_JA_PAGE_ID,
				name: "技術文書 (日本語版)",
				blocks: technicalDoc.blocks,
				stats: {
					characters: technicalDoc.content.length,
					blocks: technicalDoc.blocks.length,
				},
			},
			{
				id: USER_GUIDE_JA_PAGE_ID,
				name: "ユーザーガイド (日本語)",
				blocks: userGuideJa.blocks,
				stats: {
					characters: userGuideJa.content.length,
					blocks: userGuideJa.blocks.length,
				},
			},
			{
				id: USER_GUIDE_EN_PAGE_ID,
				name: "User Guide (English)",
				blocks: userGuideEn.blocks,
				stats: {
					characters: userGuideEn.content.length,
					blocks: userGuideEn.blocks.length,
				},
			},
		];

		// 各Notionページを更新
		for (const page of pageUpdates) {
			console.log(`\n📄 Processing: ${page.name}`);
			console.log(
				`   Content: ${page.stats.characters} characters → ${page.stats.blocks} blocks`
			);

			await clearPageContent(page.id);
			await addBlocks(page.id, page.blocks);
			console.log(`✅ Updated: ${page.name}`);
		}

		console.log("\n🎉 All documents export completed!");
		console.log("\n📋 Updated pages:");
		pageUpdates.forEach((page) => {
			console.log(`   - ${page.name} (${page.stats.blocks} blocks)`);
		});

		console.log(`\n📊 Total Statistics:`);
		const totalBlocks = pageUpdates.reduce(
			(sum, page) => sum + page.stats.blocks,
			0
		);
		console.log(`   - Total blocks updated: ${totalBlocks}`);
		console.log(`   - Pages updated: ${pageUpdates.length}`);
		console.log(`   - Technical docs: 2 pages`);
		console.log(`   - User guides: 2 pages`);
	} catch (error) {
		console.error("❌ Export failed:", error);
		process.exit(1);
	}
};

// スクリプト実行
main();
