import { Client } from "@notionhq/client";

// Notion APIクライアントの初期化
const notion = new Client({
	auth: import.meta.env.VITE_NOTION_TOKEN,
});

// データベースID（環境変数から取得）
const DATABASE_ID = import.meta.env.VITE_NOTION_DATABASE_ID;

export interface NotionPage {
	id: string;
	title: string;
	url: string;
	properties: Record<string, any>;
	last_edited_time: string;
}

export interface NotionDatabase {
	id: string;
	title: string;
	properties: Record<string, any>;
}

/**
 * Notionデータベースからページを取得
 */
export const getNotionPages = async (): Promise<NotionPage[]> => {
	try {
		if (!DATABASE_ID) {
			throw new Error("Notion database ID is not configured");
		}

		const response = await notion.databases.query({
			database_id: DATABASE_ID,
			sorts: [
				{
					property: "Last edited time",
					direction: "descending",
				},
			],
		});

		return response.results.map((page: any) => ({
			id: page.id,
			title: page.properties.Title?.title?.[0]?.plain_text || "Untitled",
			url: page.url,
			properties: page.properties,
			last_edited_time: page.last_edited_time,
		}));
	} catch (error) {
		console.error("Error fetching Notion pages:", error);
		throw error;
	}
};

/**
 * 特定のNotionページを取得
 */
export const getNotionPage = async (pageId: string): Promise<any> => {
	try {
		const response = await notion.pages.retrieve({
			page_id: pageId,
		});
		return response;
	} catch (error) {
		console.error("Error fetching Notion page:", error);
		throw error;
	}
};

/**
 * Notionページのブロックを取得
 */
export const getNotionPageBlocks = async (pageId: string): Promise<any[]> => {
	try {
		const response = await notion.blocks.children.list({
			block_id: pageId,
		});
		return response.results;
	} catch (error) {
		console.error("Error fetching Notion page blocks:", error);
		throw error;
	}
};

export default notion;
