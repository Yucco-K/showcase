import { createClient } from "@supabase/supabase-js";

const GITHUB_USERNAME = "Yucco-K";
// GitHubの「プロフィールREADMEリポジトリ」（リポジトリ名がユーザー名と同じ）は
// 実プロジェクトではないため同期対象から除外する
const EXCLUDED_REPO_NAMES = new Set([GITHUB_USERNAME]);

type GitHubRepo = {
	name: string;
	html_url: string;
	description: string | null;
	homepage: string | null;
	private: boolean;
	archived: boolean;
	fork: boolean;
};

async function fetchPublicRepos(): Promise<GitHubRepo[]> {
	const repos: GitHubRepo[] = [];
	let page = 1;
	for (;;) {
		const res = await fetch(
			`https://api.github.com/users/${GITHUB_USERNAME}/repos?type=public&per_page=100&page=${page}`,
			{
				headers: {
					Accept: "application/vnd.github+json",
					...(process.env.GITHUB_TOKEN
						? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
						: {}),
				},
			}
		);
		if (!res.ok) {
			throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
		}
		const data = (await res.json()) as GitHubRepo[];
		if (data.length === 0) break;
		repos.push(...data);
		if (data.length < 100) break;
		page += 1;
	}
	// forkはポートフォリオの対象外とする
	return repos.filter(
		(r) => !r.private && !r.archived && !r.fork && !EXCLUDED_REPO_NAMES.has(r.name)
	);
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

	console.log(`Fetching public repositories for ${GITHUB_USERNAME} from GitHub...`);
	const publicRepos = await fetchPublicRepos();
	console.log(`Found ${publicRepos.length} public (non-archived, non-fork) repositories.`);
	const publicUrls = new Set(publicRepos.map((r) => r.html_url));

	const { data: existingProjects, error: selectError } = await supabaseAdmin
		.from("projects")
		.select("id, github_url");

	if (selectError) {
		throw new Error(`Failed to fetch existing projects: ${selectError.message}`);
	}

	const existingUrls = new Set(
		(existingProjects ?? []).map((p) => p.github_url).filter(Boolean)
	);

	let inserted = 0;
	for (const repo of publicRepos) {
		if (existingUrls.has(repo.html_url)) continue;

		// 既存のcuration項目（description/technologies等）を上書きしないよう、
		// 新規追加のみ行う。手動で内容を充実させることを前提とした最小限の初期値。
		const { error: insertError } = await supabaseAdmin.from("projects").insert({
			title: repo.name,
			description: repo.description ?? "",
			technologies: [],
			github_url: repo.html_url,
			demo_url: repo.homepage || null,
			featured: false,
		});
		if (insertError) {
			throw new Error(`Failed to insert ${repo.html_url}: ${insertError.message}`);
		}
		console.log(`  + inserted: ${repo.name}`);
		inserted += 1;
	}

	// 非公開化・削除・archive化されたリポジトリへのリンクをポートフォリオから除外する
	let removed = 0;
	for (const project of existingProjects ?? []) {
		if (!project.github_url) continue;
		if (!project.github_url.startsWith(`https://github.com/${GITHUB_USERNAME}/`)) {
			continue; // 自分以外のGitHubリポジトリを指すリンクは対象外
		}
		if (!publicUrls.has(project.github_url)) {
			const { error: deleteError } = await supabaseAdmin
				.from("projects")
				.delete()
				.eq("id", project.id);
			if (deleteError) {
				throw new Error(
					`Failed to remove ${project.github_url}: ${deleteError.message}`
				);
			}
			console.log(`  - removed (no longer public): ${project.github_url}`);
			removed += 1;
		}
	}

	console.log(`Done. inserted=${inserted} removed=${removed}`);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
