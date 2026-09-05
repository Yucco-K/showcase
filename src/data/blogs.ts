import type { BlogEntry } from "../types/blog";
import { BlogPlatform } from "../types/blog";

export const BLOG_ENTRIES: BlogEntry[] = [
  {
    id: "claude-code-obsidian-workflow",
    title: "Claude Code × Obsidianで「調査して終わり」にしない開発フローを作る",
    description:
      "AIツールでの調査・実装がその場限りで終わり、学びが定着しない課題に対して、Claude CodeとObsidianを組み合わせてナレッジを蓄積する開発フローの作り方を紹介します。",
    url: "https://zenn.dev/yucco/articles/claude-code-obsidian-workflow",
    publishDate: "2026-09-05",
    tags: ["obsidian", "claudecode", "ai", "開発効率化"],
    readTime: 13,
    platform: BlogPlatform.ZENN,
    isExternal: true,
    author: "Komugi",
  },
  {
    id: "backend-test-last-line-of-defense",
    title:
      "個人開発の「あとで見直そう」が、実務のテストレビューでは通用しなかった話",
    description:
      "個人開発では見過ごしていたテストの甘さが、実務のレビューで何度も指摘された体験談。型制約の不足やモック依存のテスト、バリデーションの抜け穴など、実際に気づけなかった観点を紹介します。",
    url: "https://zenn.dev/yucco/articles/backend-test-last-line-of-defense",
    publishDate: "2026-08-15",
    tags: ["テスト", "claude", "ai", "個人開発", "レビュー"],
    readTime: 10,
    platform: BlogPlatform.ZENN,
    isExternal: true,
    author: "Komugi",
  },
  {
    id: "personal-ai-secretary-automation",
    title:
      "未読1000件から始めた、自分専用の秘書づくり ―― 身近な繰り返し作業を自動化してみた",
    description:
      "Gmailの未読1000件、カレンダー確認、GitHub進捗の手動転記など、身の回りの繰り返し作業をCodexで自動化。「何を自動化しないか」を最初に決めた設計思想を紹介します。",
    url: "https://zenn.dev/yucco/articles/personal-ai-secretary-automation",
    publishDate: "2026-08-11",
    updateDate: "2026-08-15",
    tags: ["ai", "自動化", "gmail", "カレンダー", "github"],
    readTime: 10,
    platform: BlogPlatform.ZENN,
    isExternal: true,
    author: "Komugi",
  },
  {
    id: "claude-design-ui-mockup-story",
    title:
      "「動くプロトタイプ」を作るのをやめて「静止画3枚」にしたら、レビューがスムーズに終わった話",
    description:
      "レビュー用に動くプロトタイプを作ろうとして環境エラーに詰まった経験から、Claude Designで既存画面を踏襲した静止画モックに切り替え、レビューを円滑に進めた工夫を紹介します。",
    url: "https://zenn.dev/yucco/articles/claude-design-ui-mockup-story",
    publishDate: "2026-08-09",
    tags: ["claude", "ai", "デザイン", "ui", "開発効率化"],
    readTime: 4,
    platform: BlogPlatform.ZENN,
    isExternal: true,
    author: "Komugi",
  },
  {
    id: "custom-learning-roadmap",
    title:
      "設計・実装上の課題を抱えたロードマップ機能を引き継ぎ、プロダクト標準に合わせて再構築した話",
    description:
      "前任者から引き継いだカスタム学習ロードマップ機能の設計・実装上の課題を、CMS・API・DB・進捗計算など複数領域にまたがって整理し、プロダクト標準に合わせて再構築した記録です。",
    url: "https://zenn.dev/yucco/articles/custom-learning-roadmap",
    publishDate: "2026-07-31",
    tags: ["react", "typescript", "trpc", "zod", "mantine"],
    readTime: 12,
    platform: BlogPlatform.ZENN,
    isExternal: true,
    author: "Komugi",
  },
  {
    id: "article-2-bug-fix-demo",
    title:
      "PlayWrightとTaskMasterで TODOアプリの自動バグ修正デモ - 驚きの仕組みを試してみた！",
    description:
      "AIツールを使った自動バグ修正の実演デモ。PlayWrightとTaskMasterを組み合わせて、TODOアプリのバグを自動で検出・修正する驚きの仕組みを詳しく解説します。",
    url: "https://zenn.dev/yucco/articles/article-2-bug-fix-demo",
    publishDate: "2025-07-09",
    tags: ["PlayWright", "TaskMaster", "AI", "自動化", "バグ修正", "テスト"],
    readTime: 12,
    platform: BlogPlatform.ZENN,
    isExternal: true,
    author: "Komugi",
  },
  {
    id: "article-1-auto-build-demo",
    title:
      "PlayWrightとTaskMasterで TODOアプリの自動構築デモ - 驚きの仕組みを調べてみた！",
    description:
      "AIを活用したアプリケーション自動構築の実演。PlayWrightとTaskMasterを使ってTODOアプリを自動で構築する過程を実際に試して、その仕組みを詳しく調査しました。",
    url: "https://zenn.dev/yucco/articles/article-1-auto-build-demo",
    publishDate: "2025-07-09",
    tags: ["PlayWright", "TaskMaster", "AI", "自動化", "アプリ構築"],
    readTime: 15,
    platform: BlogPlatform.ZENN,
    isExternal: true,
    author: "Komugi",
  },
  {
    id: "ai-development-automation-story",
    title: "修行中エンジニアがAIツールを試してみたら想像以上にすごかった体験談",
    description:
      "AIツールを初めて本格的に試した経験談。開発効率の向上や新しい気づき、そして今後の可能性について率直にお話しします。実際の使用例も交えて詳しく解説。",
    url: "https://zenn.dev/yucco/articles/ai-development-automation-story",
    publishDate: "2025-07-09",
    tags: ["AI", "開発体験", "エンジニア", "自動化", "体験談"],
    readTime: 10,
    platform: BlogPlatform.ZENN,
    isExternal: true,
    author: "Komugi",
  },
  {
    id: "2025-06-25-growth-story",
    title: "1年半の成長を振り返ってストーリーにしてみた件",
    description:
      "エンジニアとしての1年半の成長記録をストーリー形式で振り返り。技術的な成長だけでなく、考え方や働き方の変化についても率直に綴った成長記録です。",
    url: "https://zenn.dev/yucco/articles/2025-06-25-growth-story",
    publishDate: "2025-06-26",
    tags: ["成長記録", "エンジニア", "キャリア", "振り返り"],
    readTime: 8,
    platform: BlogPlatform.ZENN,
    isExternal: true,
    author: "Komugi",
  },
  {
    id: "react-typescript-save-button-fix",
    title:
      "React + TypeScriptで「保存ボタンを2回押さないと動かない」問題を解決した方法",
    description:
      "Reactでよくある「ボタンを2回押さないと動かない」問題の原因と解決方法を詳しく解説。state更新の非同期性とuseEffectの適切な使い方について実例とともに説明します。",
    url: "https://zenn.dev/yucco/articles/e25cdcd6e839b6",
    publishDate: "2025-06-24",
    tags: ["React", "TypeScript", "useState", "useEffect", "バグ修正"],
    readTime: 7,
    platform: BlogPlatform.ZENN,
    isExternal: true,
    author: "Komugi",
  },
  {
    id: "dnd-kit-drag-drop-implementation",
    title: "ドラッグ＆ドロップでリスト並び替え！@dnd-kitを使った実装の工夫",
    description:
      "@dnd-kitライブラリを使ったドラッグ＆ドロップ機能の実装方法を詳しく解説。リスト並び替えの実装における工夫点やパフォーマンス最適化についても紹介します。",
    url: "https://zenn.dev/yucco/articles/26463c7e00b2f6",
    publishDate: "2025-06-24",
    tags: ["React", "dnd-kit", "ドラッグ&ドロップ", "UI/UX", "ライブラリ"],
    readTime: 9,
    platform: BlogPlatform.ZENN,
    isExternal: true,
    author: "Komugi",
  },
];

// タグの重複を排除して一覧を取得
export const ALL_BLOG_TAGS = Array.from(
  new Set(BLOG_ENTRIES.flatMap((blog) => blog.tags)),
).sort();
