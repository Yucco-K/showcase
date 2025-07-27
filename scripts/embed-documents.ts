#!/usr/bin/env -S deno run --allow-net --allow-read --allow-env

import { OpenAIEmbeddings } from "@langchain/openai";
import { createClient } from "@supabase/supabase-js";

// 対象ドキュメントファイルとタイプ
const DOCS = [
	{ path: "docs/FAQ.md", type: "faq" },
	{ path: "docs/ユーザーガイド_JA.md", type: "guide" },
	{ path: "docs/ユーザーガイド詳細_JA.md", type: "guide_detail" },
	{ path: "docs/PRIVACY_POLICY.md", type: "privacy" },
	{ path: "docs/TERMS_OF_SERVICE.md", type: "terms" },
];

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
const openaiApiKey = Deno.env.get("OPENAI_API_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);
const embeddings = new OpenAIEmbeddings({
	apiKey: openaiApiKey,
	model: "text-embedding-3-small",
});

// チャンク分割（Q&A単位、セクション単位、1000文字程度）
function splitMarkdown(
	text: string,
	type: string
): { title: string; content: string }[] {
	const chunks: { title: string; content: string }[] = [];
	if (type === "faq") {
		// Q&A単位で分割
		const qaBlocks = text.split(/\n---+\n/);
		for (const block of qaBlocks) {
			const qMatch = block.match(/\*\*Q[:：](.*?)\*\*/s);
			const _aMatch = block.match(/\*\*A[:：](.*?)\*\*/s);
			const title = qMatch ? qMatch[1].trim() : block.slice(0, 30);
			const content = block.trim();
			if (content.length > 0) chunks.push({ title, content });
		}
	} else {
		// セクション単位（# or ## 見出しごと）
		const sections = text.split(/\n(?=#+ )/);
		for (const section of sections) {
			const titleMatch = section.match(/^#+\s*(.+)/);
			const title = titleMatch ? titleMatch[1].trim() : section.slice(0, 30);
			const content = section.trim();
			if (content.length > 0) {
				// 1000文字ごとにさらに分割
				for (let i = 0; i < content.length; i += 1000) {
					const chunk = content.slice(i, i + 1000);
					chunks.push({ title, content: chunk });
				}
			}
		}
	}
	return chunks;
}

async function main() {
	console.log("🚀 ドキュメント分割・ベクトル化・Supabase保存を開始...");
	for (const doc of DOCS) {
		const text = await Deno.readTextFile(doc.path);
		const chunks = splitMarkdown(text, doc.type);
		for (const { title, content } of chunks) {
			if (content.length < 10) continue;
			const embedding = await embeddings.embedQuery(content);
			// Supabaseに保存
			const { error } = await supabase.from("doc_embeddings").upsert(
				{
					type: doc.type,
					title,
					content,
					embedding,
				},
				{ onConflict: "type,title" }
			);
			if (error) {
				console.error(`❌ 保存エラー: ${doc.type} - ${title}`, error);
			} else {
				console.log(`✅ 保存: ${doc.type} - ${title}`);
			}
		}
	}
	console.log("🎉 全ドキュメントのベクトル化・保存が完了しました！");
}

if (import.meta.main) {
	main();
}
