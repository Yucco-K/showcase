import { createClient } from "npm:@supabase/supabase-js@2";
import OpenAI from "npm:openai@4";
import "https://deno.land/x/dotenv@v3.2.2/load.ts";

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

// --- 2. ヘルパー関数 ---
async function generateEmbedding(text: string): Promise<number[]> {
	const response = await openai.embeddings.create({
		model: "text-embedding-3-small",
		input: text.replace(/\\n/g, " "), // APIへの入力前に改行をスペースに置換
	});
	return response.data[0].embedding;
}

// --- 3. メインロジック ---
async function regenerateEmbeddings() {
	try {
		console.log(
			"ステップ1: 製品データベースのマークダウンファイルを読み込んでいます..."
		);
		const markdownContent = await Deno.readTextFile(
			"docs/products/products_database.md"
		);
		console.log("  ✅ 読み込み完了");

		console.log("\\nステップ2: マークダウンから製品情報を解析しています...");
		const products = markdownContent.split("### ").slice(1); // 製品ごとのセクションに分割
		console.log(`  ✅ ${products.length}件の製品情報を検出`);

		const documentsToProcess = products
			.map((productMarkdown) => {
				const lines = productMarkdown.split("\\n");
				const title = lines[0].trim();
				const content = productMarkdown.trim(); // タイトルも含めた全文をコンテンツとする
				return { type: "product", title, content };
			})
			.filter((doc) => doc.title);

		console.log(
			"\\nステップ3: 既存の検索索引（doc_embeddings）をクリアしています..."
		);
		const { error: deleteError } = await supabase
			.from("doc_embeddings")
			.delete()
			.neq("id", "00000000-0000-0000-0000-000000000000");
		if (deleteError) {
			throw new Error(`既存索引のクリアに失敗しました: ${deleteError.message}`);
		}
		console.log("  ✅ 既存索引のクリア完了");

		console.log(
			"\\nステップ4: 新しい検索索引を生成し、データベースに保存しています..."
		);
		let successCount = 0;
		for (const doc of documentsToProcess) {
			console.log(`  - 処理中: ${doc.title}`);
			// ベクトル情報を生成
			const embedding = await generateEmbedding(doc.content);

			// データベースに保存
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
		console.log(`  ✅ ${successCount}件の新しい索引の保存が完了しました。`);

		console.log("\\n🎉 全ての処理が正常に完了しました！");
	} catch (error) {
		console.error(`\\n🚨 エラーが発生しました: ${error.message}`);
		Deno.exit(1);
	}
}

// --- 4. スクリプトの実行 ---
regenerateEmbeddings();
