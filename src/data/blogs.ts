import type { BlogEntry } from "../types/blog";
import { BlogPlatform } from "../types/blog";

export const BLOG_ENTRIES: BlogEntry[] = [
	{
		id: "article-2-bug-fix-demo",
		title:
			"PlayWrightとTaskMasterで TODOアプリの自動バグ修正デモ - 驚きの仕組みを試してみた！",
		description:
			"AIツールを使った自動バグ修正の実演デモ。PlayWrightとTaskMasterを組み合わせて、TODOアプリのバグを自動で検出・修正する驚きの仕組みを詳しく解説します。",
		url: "https://zenn.dev/yucco/articles/article-2-bug-fix-demo",
		publishDate: "2024-12-15",
		tags: ["PlayWright", "TaskMaster", "AI", "自動化", "バグ修正", "テスト"],
		readTime: 12,
		platform: BlogPlatform.ZENN,
		isExternal: true,
	},
	{
		id: "article-1-auto-build-demo",
		title:
			"PlayWrightとTaskMasterで TODOアプリの自動構築デモ - 驚きの仕組みを調べてみた！",
		description:
			"AIを活用したアプリケーション自動構築の実演。PlayWrightとTaskMasterを使ってTODOアプリを自動で構築する過程を実際に試して、その仕組みを詳しく調査しました。",
		url: "https://zenn.dev/yucco/articles/article-1-auto-build-demo",
		publishDate: "2024-12-10",
		tags: ["PlayWright", "TaskMaster", "AI", "自動化", "アプリ構築"],
		readTime: 15,
		platform: BlogPlatform.ZENN,
		isExternal: true,
	},
	{
		id: "ai-development-automation-story",
		title: "修行中エンジニアがAIツールを試してみたら想像以上にすごかった体験談",
		description:
			"AIツールを初めて本格的に試した経験談。開発効率の向上や新しい気づき、そして今後の可能性について率直にお話しします。実際の使用例も交えて詳しく解説。",
		url: "https://zenn.dev/yucco/articles/ai-development-automation-story",
		publishDate: "2024-11-28",
		tags: ["AI", "開発体験", "エンジニア", "自動化", "体験談"],
		readTime: 10,
		platform: BlogPlatform.ZENN,
		isExternal: true,
	},
	{
		id: "2025-06-25-growth-story",
		title: "1年半の成長を振り返ってストーリーにしてみた件",
		description:
			"エンジニアとしての1年半の成長記録をストーリー形式で振り返り。技術的な成長だけでなく、考え方や働き方の変化についても率直に綴った成長記録です。",
		url: "https://zenn.dev/yucco/articles/2025-06-25-growth-story",
		publishDate: "2024-06-25",
		tags: ["成長記録", "エンジニア", "キャリア", "振り返り"],
		readTime: 8,
		platform: BlogPlatform.ZENN,
		isExternal: true,
	},
	{
		id: "react-typescript-save-button-fix",
		title:
			"React + TypeScriptで「保存ボタンを2回押さないと動かない」問題を解決した方法",
		description:
			"Reactでよくある「ボタンを2回押さないと動かない」問題の原因と解決方法を詳しく解説。state更新の非同期性とuseEffectの適切な使い方について実例とともに説明します。",
		url: "https://zenn.dev/yucco/articles/e25cdcd6e839b6",
		publishDate: "2024-10-15",
		tags: ["React", "TypeScript", "useState", "useEffect", "バグ修正"],
		readTime: 7,
		platform: BlogPlatform.ZENN,
		isExternal: true,
	},
	{
		id: "dnd-kit-drag-drop-implementation",
		title: "ドラッグ＆ドロップでリスト並び替え！@dnd-kitを使った実装の工夫",
		description:
			"@dnd-kitライブラリを使ったドラッグ＆ドロップ機能の実装方法を詳しく解説。リスト並び替えの実装における工夫点やパフォーマンス最適化についても紹介します。",
		url: "https://zenn.dev/yucco/articles/26463c7e00b2f6",
		publishDate: "2024-09-20",
		tags: ["React", "dnd-kit", "ドラッグ&ドロップ", "UI/UX", "ライブラリ"],
		readTime: 9,
		platform: BlogPlatform.ZENN,
		isExternal: true,
	},
	{
		id: "1",
		title: "1年半の成長を振り返ってストーリーにしてみた件",
		description:
			"未経験からエンジニアに転職して1年半。これまでの学びや失敗、今後の目標をストーリー形式でまとめました。",
		platform: BlogPlatform.NOTE,
		url: "https://note.com/yukkie_note/n/n9f82b726451c",
		tags: ["キャリア", "エンジニア", "成長記録"],
		isExternal: true,
		readTime: 15,
		publishDate: "2025-06-26",
		updateDate: "2025-07-09",
	},
	{
		id: "2",
		title:
			"PlayWrightとTaskMasterで TODOアプリの自動構築デモ - 驚きの仕組みを調べてみた！",
		description:
			"ノーコードでE2Eテストを自動化するPlayWrightと、タスク管理ツールTaskMasterを連携させ、TODOアプリの自動構築に挑戦した記録です。",
		platform: BlogPlatform.ZENN,
		url: "https://zenn.dev/yukkie/articles/c229971fe69213",
		tags: ["PlayWright", "TaskMaster", "自動化", "E2Eテスト"],
		isExternal: true,
		readTime: 10,
		publishDate: "2025-07-09",
	},
	{
		id: "3",
		title: "修行中エンジニアがAIツールを試してみたら想像以上にすごかった体験談",
		description:
			"GitHub CopilotやCursorなど、話題のAIコーディングツールを普段の開発に取り入れてみた感想と、生産性がどう変わったかを共有します。",
		platform: BlogPlatform.QIITA,
		url: "https://qiita.com/Yukkie/items/4531b795d71a6e9a3b68",
		tags: ["AI", "GitHub Copilot", "Cursor", "開発効率化"],
		isExternal: true,
		readTime: 8,
		publishDate: "2025-07-09",
	},
	{
		id: "4",
		title:
			"PlayWrightとTaskMasterで TODOアプリの自動バグ修正デモ - 驚きの仕組みを試してみた！",
		description:
			"Playwright Recorderで記録した操作を元に、TaskMasterが自動でバグを修正する。そんな未来の技術をいち早く試してみました。",
		platform: BlogPlatform.ZENN,
		url: "https://zenn.dev/yukkie/articles/8f8a1e389b5c3f",
		tags: ["PlayWright", "TaskMaster", "AI", "バグ修正"],
		isExternal: true,
		readTime: 12,
		publishDate: "2025-07-09",
	},
	{
		id: "5",
		title:
			"React + TypeScriptで「保存ボタンを2回押さないと動かない」問題を解決した方法",
		description:
			"Reactの非同期なstate更新が原因で起こりがちなこの問題。原因の特定から具体的な解決策までを丁寧に解説します。",
		platform: BlogPlatform.QIITA,
		url: "https://qiita.com/Yukkie/items/d745a570c878950c4c4a",
		tags: ["React", "TypeScript", "useState", "非同期処理"],
		isExternal: true,
		readTime: 7,
		publishDate: "2025-06-24",
	},
	{
		id: "6",
		title: "ドラッグ＆ドロップでリスト並び替え！@dnd-kitを使った実装の工夫",
		description:
			"多機能でアクセシブルなドラッグ＆ドロップライブラリ「@dnd-kit」の基本的な使い方から、実践的なカスタマイズ方法までを紹介します。",
		platform: BlogPlatform.ZENN,
		url: "https://zenn.dev/yukkie/articles/f3a093b1e9d16a",
		tags: ["React", "TypeScript", "@dnd-kit", "UI"],
		isExternal: true,
		readTime: 9,
		publishDate: "2025-06-24",
	},
];

// タグの重複を排除して一覧を取得
export const ALL_BLOG_TAGS = Array.from(
	new Set(BLOG_ENTRIES.flatMap((blog) => blog.tags))
).sort();
