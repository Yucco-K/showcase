/// <reference types="https://deno.land/x/types/deno.d.ts" />

declare module "@langchain/openai" {
	export interface OpenAIEmbeddingsParams {
		apiKey?: string;
		model?: string;
	}

	export class OpenAIEmbeddings {
		constructor(options?: OpenAIEmbeddingsParams);
		embedQuery(text: string): Promise<number[]>;
	}
}

declare module "@langchain/community/vectorstores/supabase" {
	import { SupabaseClient } from "@supabase/supabase-js";

	export class SupabaseVectorStore {
		constructor(
			embeddings: any,
			options: {
				client: SupabaseClient;
				tableName: string;
				queryName: string;
			}
		);

		similaritySearch(
			query: string,
			k?: number
		): Promise<
			Array<{
				pageContent: string;
				metadata: Record<string, any>;
			}>
		>;
	}
}

// Deno環境変数の型定義
declare namespace Deno {
	const env: {
		get(key: string): string | undefined;
	};
}

// グローバル環境の型拡張
interface ImportMeta {
	main?: boolean;
}

// Supabaseクライアントの型拡張
declare module "@supabase/supabase-js" {
	interface SupabaseClient {
		rpc(
			fn: string,
			params?: Record<string, any>
		): Promise<{
			data: any;
			error: any;
		}>;
		from(table: string): {
			select(columns?: string): Promise<{
				data: any[] | null;
				error: any;
			}>;
		};
	}
}

// 既存の型定義に追加

declare module "openai" {
	export class OpenAI {
		constructor(options: { apiKey?: string });

		chat: {
			completions: {
				create(params: {
					model: string;
					messages: Array<{
						role: "system" | "user" | "assistant";
						content: string;
					}>;
					max_tokens?: number;
					temperature?: number;
				}): Promise<{
					choices: Array<{
						message: {
							content: string | null;
						};
					}>;
				}>;
			};
		};
	}
}

// Denoの環境変数型定義の拡張
declare namespace Deno {
	const env: {
		get(key: string): string | undefined;
	};
}

// ImportMetaの型拡張
interface ImportMeta {
	main?: boolean;
}

// Supabaseクライアントの型拡張
declare module "@supabase/supabase-js" {
	interface SupabaseClient {
		from(table: string): {
			select(columns?: string): Promise<{
				data: any[] | null;
				error: any;
			}>;
			upsert(
				data: any,
				options?: {
					onConflict?: string;
				}
			): Promise<{
				error: any;
			}>;
		};
	}
}
