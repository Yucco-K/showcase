#!/usr/bin/env -S deno run --allow-net --allow-read --allow-env

import { OpenAIEmbeddings } from "@langchain/openai";
import { ChatOpenAI } from "@langchain/openai";
import { createClient } from "@supabase/supabase-js";

// 本番用設定
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
const openaiApiKey = Deno.env.get("OPENAI_API_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const embeddings = new OpenAIEmbeddings({
	apiKey: openaiApiKey,
	model: "text-embedding-3-small",
});

const llm = new ChatOpenAI({
	openAIApiKey: openaiApiKey,
	modelName: "gpt-4.0-turbo",
	temperature: 0.2,
});

/**
 * Supabaseベクトル検索で関連ドキュメントを取得
 */
async function retrieveDocuments(query: string, k: number = 3) {
	try {
		const embedding = await embeddings.embedQuery(query);
		const { data, error } = await supabase.rpc("match_products", {
			query_embedding: embedding,
			match_threshold: 0.2,
			match_count: k,
		});
		if (error) throw error;
		return (data || []).map((row: any) => row.content);
	} catch (err) {
		console.error("[Retriever] 検索エラー:", err);
		return [];
	}
}

/**
 * OpenAI QAチェーンで回答生成
 */
async function generateAnswer(query: string, contextDocs: string[]) {
	try {
		const context = contextDocs.join("\n---\n");
		const systemPrompt = `あなたはPortfolio Showcaseの専門AIアシスタントです。以下のコンテキスト（商品・FAQ）だけを根拠に、ユーザーの質問に日本語で簡潔かつ正確に答えてください。\n\n【コンテキスト】\n${context}`;
		const res = await llm.call([
			{ role: "system", content: systemPrompt },
			{ role: "user", content: query },
		]);
		return res.content;
	} catch (err) {
		console.error("[QAChain] 回答生成エラー:", err);
		return "申し訳ありません。現在回答できません。";
	}
}

/**
 * Retriever+QAチェーンの本番用エントリポイント
 */
export async function answerWithRAG(query: string) {
	console.log(`[RAG] ユーザー質問: ${query}`);
	const docs = await retrieveDocuments(query, 3);
	if (docs.length === 0) {
		return "申し訳ありません。該当する商品・情報が見つかりませんでした。";
	}
	const answer = await generateAnswer(query, docs);
	return answer;
}

// テスト実行例
if (import.meta.main) {
	const testQueries = [
		"おすすめのタスク管理アプリは？",
		"健康管理に役立つサービスは？",
		"料理レシピを整理したい",
		"音楽プレイリストを作りたい",
	];
	for (const q of testQueries) {
		const res = await answerWithRAG(q);
		console.log(`\nQ: ${q}\nA: ${res}\n`);
	}
}
