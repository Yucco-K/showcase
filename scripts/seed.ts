import { createClient } from "@supabase/supabase-js";
import { BLOG_ENTRIES } from "../src/data/blogs.ts";

async function main() {
	const supabaseUrl = Deno.env.get("VITE_SUPABASE_URL");
	const serviceKey = Deno.env.get("SUPABASE_SERVICE_KEY");

	if (!supabaseUrl || !serviceKey) {
		throw new Error(
			"Missing env vars VITE_SUPABASE_URL or SUPABASE_SERVICE_KEY"
		);
	}

	const supabaseAdmin = createClient(supabaseUrl, serviceKey);

	console.log("Seeding blog data...");

	// テーブルのデータを一度空にする
	const { error: deleteError } = await supabaseAdmin
		.from("blogs")
		.delete()
		.neq("id", "00000000-0000-0000-0000-000000000000");
	if (deleteError) {
		console.error("Error deleting existing data:", deleteError);
		return;
	}
	console.log("Cleared existing data from blogs table.");

	// フロントエンドの型からデータベースのスキーマに変換
	const dataToInsert = BLOG_ENTRIES.map((entry) => ({
		title: entry.title,
		platform: entry.platform,
		url: entry.url,
		published_at: entry.publishDate,
		updated_at: entry.updateDate || null,
		read_time: entry.readTime,
		tags: entry.tags,
		// authorはデータにないのでnull
		author: null,
	}));

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { data: _, error } = await supabaseAdmin
		.from("blogs")
		.insert(dataToInsert);

	if (error) {
		console.error("Error seeding data:", error);
	} else {
		console.log(`Successfully seeded ${dataToInsert.length} blog entries.`);
	}
}

main();
