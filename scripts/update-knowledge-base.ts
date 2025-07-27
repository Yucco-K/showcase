import { createClient } from "npm:@supabase/supabase-js@2";
import OpenAI from "npm:openai@4";
import "https://deno.land/x/dotenv@v3.2.2/load.ts";

// --- 設定可能なパス ---
const CONFIG_PATHS = {
	PRODUCTS_DATABASE:
		Deno.env.get("PRODUCTS_DATABASE_PATH") ||
		"./docs/products/products_database.md",
	WORKFLOW_GUIDE:
		Deno.env.get("WORKFLOW_GUIDE_PATH") || "./docs/workflow-guide.md",
	TECHNICAL_DOC:
		Deno.env.get("TECHNICAL_DOC_PATH") || "./docs/technical-documentation.md",
	FAQ_DOC: Deno.env.get("FAQ_DOC_PATH") || "./docs/faq.md",
	PRICING_DOC: Deno.env.get("PRICING_DOC_PATH") || "./docs/pricing.md",
};

// --- 自前のパーサー関数 ---

/**
 * テキストを指定された最大長で分割します。
 * @param text 分割するテキスト
 * @param options 分割オプション
 * @returns 分割されたテキストの配列
 */
function splitText(
	text: string,
	options: { maxLength: number; chunkOverlap: number; delimiter: string }
): string[] {  const { maxLength, _chunkOverlap, delimiter } = options;
	const chunks: string[] = [];
	let currentChunk = "";

	const sentences = text.split(delimiter);

	for (const sentence of sentences) {
		const potentialChunk =
			currentChunk.length === 0
				? sentence
				: currentChunk + delimiter + sentence;

		if (potentialChunk.length > maxLength) {
			if (currentChunk.length > 0) {
				chunks.push(currentChunk);
			}
			currentChunk = sentence;
			// 長すぎる単一の文も分割する必要があるかもしれないが、今回は単純化のため省略
		} else {
			currentChunk = potentialChunk;
		}
	}

	if (currentChunk.length > 0) {
		chunks.push(currentChunk);
	}

	// オーバーラップ処理は複雑になるため、この簡易版では省略
	return chunks;
}

/**
 * TypeScriptファイルからFAQの質問と回答を抽出します。
 * @param content ファイルの内容
 * @returns 抽出されたFAQの配列
 */
function _extractFAQ(content: string): { question: string; answer: string }[] {
	const faqs: { question: string; answer: string }[] = [];
	// より柔軟な正規表現（空白や改行に対応）
	const faqRegex =
		/{\s*question:\s*`([\s\S]+?)`,\s*answer:\s*`([\s\S]+?)`\s*}/g;
	let match: RegExpExecArray | null;
	while ((match = faqRegex.exec(content))) {
		faqs.push({
			question: match[1].trim(),
			answer: match[2].trim().replace(/\s+/g, " "),
		});
	}
	return faqs;
}

/**
 * Markdownをセクションに分割します。
 * @param content Markdownの内容
 * @param options 分割オプション
 * @returns 分割されたセクションの配列
 */
function parseMarkdown(
	content: string,
	options: { sectionDelimiter: string }
): { title: string; content: string }[] {
	return content
		.split(options.sectionDelimiter)
		.slice(1)
		.map((section) => {
			const lines = section.trim().split("\n");
			const title = lines[0].trim();
			return { title, content: section.trim() };
		});
}

// --- 1. 環境変数のセットアップ ---
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const openaiApiKey = Deno.env.get("OPENAI_API_KEY");

if (!supabaseUrl || !supabaseServiceKey || !openaiApiKey) {
	console.error(
		"エラー: 必要な環境変数（SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY）が設定されていません。"
	);
	Deno.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const openai = new OpenAI({ apiKey: openaiApiKey });

// --- 2. 型定義 ---
interface Document {
	type: "product" | "faq" | "guide" | "doc";
	title: string;
	content: string;
}

// --- 3. ヘルパー関数 ---
async function generateEmbedding(text: string): Promise<number[]> {
	const response = await openai.embeddings.create({
		model: "text-embedding-3-small",
		input: text.replace(/\n/g, " "),
	});
	return response.data[0].embedding;
}

// --- 4. ドキュメント解析ロジック ---
async function parseDocuments(): Promise<Document[]> {
	const allDocuments: Document[] = [];

	// 全てのパスをプロジェクトルートからの相対パスで指定

	// 4.1 製品情報 (Markdown)
	const productContent = await Deno.readTextFile(
		CONFIG_PATHS.PRODUCTS_DATABASE
	);
	const products = parseMarkdown(productContent, { sectionDelimiter: "###" });
	products.forEach((p) => {
		if (p.title) {
			allDocuments.push({
				type: "product",
				title: p.title,
				content: p.content,
			});
		}
	});
	console.log(`✅ 製品情報: ${products.length}件`);

	// 4.2 FAQ (Markdownファイルから読み込み)
	const faqContent = await Deno.readTextFile(CONFIG_PATHS.FAQ_DOC);
	const faqs = parseMarkdown(faqContent, { sectionDelimiter: "###" });
	faqs.forEach((faq) => {
		if (faq.title) {
			allDocuments.push({
				type: "faq",
				title: faq.title,
				content: `Q: ${faq.title}\nA: ${faq.content
					.replace(faq.title, "")
					.trim()}`,
			});
		}
	});
	console.log(`✅ FAQ情報: ${faqs.length}件`);

	// 4.3 ユーザーガイド (Markdown)
	const guideContent = await Deno.readTextFile(CONFIG_PATHS.WORKFLOW_GUIDE);
	const guideSections = splitText(guideContent, {
		maxLength: 500,
		chunkOverlap: 50,
		delimiter: "\n",
	});
	guideSections.forEach((section, i) => {
		allDocuments.push({
			type: "guide",
			title: `ユーザーガイドセクション ${i + 1}`,
			content: section,
		});
	});
	console.log(`✅ ユーザーガイド: ${guideSections.length}セクション`);

	// 4.4 技術ドキュメント (Markdown)
	const techDocContent = await Deno.readTextFile(CONFIG_PATHS.TECHNICAL_DOC);
	const techDocSections = splitText(techDocContent, {
		maxLength: 500,
		chunkOverlap: 50,
		delimiter: "\n",
	});
	techDocSections.forEach((section, i) => {
		allDocuments.push({
			type: "doc",
			title: `技術ドキュメントセクション ${i + 1}`,
			content: section,
		});
	});
	console.log(`✅ 技術ドキュメント: ${techDocSections.length}セクション`);

	return allDocuments;
}

// --- 5. メインロジック ---
async function updateKnowledgeBase() {
	try {
		console.log("ステップ1: 全ドキュメントを解析しています...");
		const documentsToProcess = await parseDocuments();
		console.log(`\n✅ 合計 ${documentsToProcess.length}件の知識を検出`);

		console.log("\nステップ2: 既存の検索索引をクリアしています...");
		const { error: deleteError } = await supabase
			.from("doc_embeddings")
			.delete()
			.neq("id", "00000000-0000-0000-0000-000000000000"); // ダミー条件で全削除
		if (deleteError) {
			throw new Error(`既存索引のクリアに失敗: ${deleteError.message}`);
		}
		console.log("  ✅ 既存索引のクリア完了");

		console.log("\nステップ3: 新しい検索索引を生成し、DBに保存しています...");
		let successCount = 0;
		for (const doc of documentsToProcess) {
			console.log(`  - 処理中 (${doc.type}): ${doc.title.substring(0, 50)}...`);
			const embedding = await generateEmbedding(doc.content);

			const { error: insertError } = await supabase
				.from("doc_embeddings")
				.insert({
					type: doc.type,
					title: doc.title,
					content: doc.content,
					embedding: embedding,
				});

			if (insertError) {
				console.error(`  ❌ 保存エラー "${doc.title}": ${insertError.message}`);
			} else {
				successCount++;
			}
		}
		console.log(`\n✅ ${successCount}件の新しい索引の保存が完了しました。`);
		console.log("\n🎉 全ての処理が正常に完了しました！");
	} catch (error) {
		console.error(`\n🚨 エラーが発生しました: ${error.message}`);
		Deno.exit(1);
	}
}

// --- 6. スクリプトの実行 ---
updateKnowledgeBase();
