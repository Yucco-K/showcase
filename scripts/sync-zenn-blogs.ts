import { createClient } from "@supabase/supabase-js";

const ZENN_USERNAME = "yucco";
const AUTHOR_NAME = "Komugi";
// Zennの目安(本文の文字数 ÷ 500字/分、最低1分)
const CHARS_PER_MINUTE = 500;

type ZennArticleListItem = {
	slug: string;
	title: string;
	published_at: string;
	body_updated_at: string;
	body_letters_count: number;
};

type ZennTopic = {
	display_name: string;
};

type ZennArticleDetail = {
	topics: ZennTopic[];
};

async function fetchPublishedArticles(): Promise<ZennArticleListItem[]> {
	const articles: ZennArticleListItem[] = [];
	let page = 1;
	for (;;) {
		const res = await fetch(
			`https://zenn.dev/api/articles?username=${ZENN_USERNAME}&order=latest&page=${page}`
		);
		if (!res.ok) {
			throw new Error(`Zenn API error: ${res.status} ${res.statusText}`);
		}
		const data = (await res.json()) as { articles: ZennArticleListItem[] };
		if (data.articles.length === 0) break;
		articles.push(...data.articles);
		if (data.articles.length < 24) break; // Zennのデフォルトページサイズ未満なら最終ページ
		page += 1;
	}
	return articles;
}

async function fetchTopics(slug: string): Promise<string[]> {
	const res = await fetch(`https://zenn.dev/api/articles/${slug}`);
	if (!res.ok) {
		throw new Error(`Zenn API error (article detail): ${res.status} ${slug}`);
	}
	const data = (await res.json()) as { article: ZennArticleDetail };
	return data.article.topics.map((t) => t.display_name);
}

function toReadTime(bodyLettersCount: number): number {
	return Math.max(1, Math.round(bodyLettersCount / CHARS_PER_MINUTE));
}

async function main() {
	const supabaseUrl = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL;
	const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

	if (!supabaseUrl || !serviceKey) {
		throw new Error(
			"Missing env vars: VITE_SUPABASE_URL(or SUPABASE_URL) / SUPABASE_SERVICE_ROLE_KEY"
		);
	}

	const supabaseAdmin = createClient(supabaseUrl, serviceKey);

	console.log(`Fetching published articles for @${ZENN_USERNAME} from Zenn...`);
	const articles = await fetchPublishedArticles();
	console.log(`Found ${articles.length} published articles.`);

	let inserted = 0;
	let updated = 0;

	for (const article of articles) {
		const url = `https://zenn.dev/${ZENN_USERNAME}/articles/${article.slug}`;
		const tags = await fetchTopics(article.slug);
		const readTime = toReadTime(article.body_letters_count);
		const publishedAt = article.published_at;
		const updatedAt =
			article.body_updated_at && article.body_updated_at !== article.published_at
				? article.body_updated_at
				: null;

		const row = {
			title: article.title,
			platform: "Zenn",
			url,
			published_at: publishedAt,
			updated_at: updatedAt,
			author: AUTHOR_NAME,
			read_time: readTime,
			tags,
		};

		const { data: existing, error: selectError } = await supabaseAdmin
			.from("blogs")
			.select("id")
			.eq("url", url)
			.maybeSingle();

		if (selectError) {
			throw new Error(`Failed to look up existing row for ${url}: ${selectError.message}`);
		}

		if (existing) {
			const { error: updateError } = await supabaseAdmin
				.from("blogs")
				.update(row)
				.eq("id", existing.id);
			if (updateError) {
				throw new Error(`Failed to update ${url}: ${updateError.message}`);
			}
			updated += 1;
		} else {
			const { error: insertError } = await supabaseAdmin.from("blogs").insert(row);
			if (insertError) {
				throw new Error(`Failed to insert ${url}: ${insertError.message}`);
			}
			inserted += 1;
		}
	}

	console.log(`Done. inserted=${inserted} updated=${updated}`);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
