-- Supabase Database Seed Script
-- This script uses individual 'INSERT ... ON CONFLICT' statements for each record to ensure robustness.

INSERT INTO public.blogs (title, platform, url, published_at, updated_at, read_time, tags, author) VALUES
('PlayWrightとTaskMasterで TODOアプリの自動バグ修正デモ - 驚きの仕組みを試してみた！', 'Zenn', 'https://zenn.dev/yucco/articles/article-2-bug-fix-demo', '2024-12-15', NULL, 12, '{"PlayWright","TaskMaster","AI","自動化","バグ修正","テスト"}', NULL)
ON CONFLICT (url) DO NOTHING;

INSERT INTO public.blogs (title, platform, url, published_at, updated_at, read_time, tags, author) VALUES
('PlayWrightとTaskMasterで TODOアプリの自動構築デモ - 驚きの仕組みを調べてみた！', 'Zenn', 'https://zenn.dev/yucco/articles/article-1-auto-build-demo', '2024-12-10', NULL, 15, '{"PlayWright","TaskMaster","AI","自動化","アプリ構築"}', NULL)
ON CONFLICT (url) DO NOTHING;

INSERT INTO public.blogs (title, platform, url, published_at, updated_at, read_time, tags, author) VALUES
('修行中エンジニアがAIツールを試してみたら想像以上にすごかった体験談', 'Zenn', 'https://zenn.dev/yucco/articles/ai-development-automation-story', '2024-11-28', NULL, 10, '{"AI","開発体験","エンジニア","自動化","体験談"}', NULL)
ON CONFLICT (url) DO NOTHING;

INSERT INTO public.blogs (title, platform, url, published_at, updated_at, read_time, tags, author) VALUES
('1年半の成長を振り返ってストーリーにしてみた件', 'Zenn', 'https://zenn.dev/yucco/articles/2025-06-25-growth-story', '2024-06-25', NULL, 8, '{"成長記録","エンジニア","キャリア","振り返り"}', NULL)
ON CONFLICT (url) DO NOTHING;

INSERT INTO public.blogs (title, platform, url, published_at, updated_at, read_time, tags, author) VALUES
('React + TypeScriptで「保存ボタンを2回押さないと動かない」問題を解決した方法', 'Zenn', 'https://zenn.dev/yucco/articles/e25cdcd6e839b6', '2024-10-15', NULL, 7, '{"React","TypeScript","useState","useEffect","バグ修正"}', NULL)
ON CONFLICT (url) DO NOTHING;

INSERT INTO public.blogs (title, platform, url, published_at, updated_at, read_time, tags, author) VALUES
('ドラッグ＆ドロップでリスト並び替え！@dnd-kitを使った実装の工夫', 'Zenn', 'https://zenn.dev/yucco/articles/26463c7e00b2f6', '2024-09-20', NULL, 9, '{"React","dnd-kit","ドラッグ&ドロップ","UI/UX","ライブラリ"}', NULL)
ON CONFLICT (url) DO NOTHING;

INSERT INTO public.blogs (title, platform, url, published_at, updated_at, read_time, tags, author) VALUES
('1年半の成長を振り返ってストーリーにしてみた件', 'note', 'https://note.com/yukkie_note/n/n9f82b726451c', '2025-06-26', '2025-07-09', 15, '{"キャリア","エンジニア","成長記録"}', NULL)
ON CONFLICT (url) DO NOTHING;

INSERT INTO public.blogs (title, platform, url, published_at, updated_at, read_time, tags, author) VALUES
('PlayWrightとTaskMasterで TODOアプリの自動構築デモ - 驚きの仕組みを調べてみた！', 'Zenn', 'https://zenn.dev/yukkie/articles/c229971fe69213', '2025-07-09', NULL, 10, '{"PlayWright","TaskMaster","自動化","E2Eテスト"}', NULL)
ON CONFLICT (url) DO NOTHING;

INSERT INTO public.blogs (title, platform, url, published_at, updated_at, read_time, tags, author) VALUES
('修行中エンジニアがAIツールを試してみたら想像以上にすごかった体験談', 'Qiita', 'https://qiita.com/Yukkie/items/4531b795d71a6e9a3b68', '2025-07-09', NULL, 8, '{"AI","GitHub Copilot","Cursor","開発効率化"}', NULL)
ON CONFLICT (url) DO NOTHING;

INSERT INTO public.blogs (title, platform, url, published_at, updated_at, read_time, tags, author) VALUES
('PlayWrightとTaskMasterで TODOアプリの自動バグ修正デモ - 驚きの仕組みを試してみた！', 'Zenn', 'https://zenn.dev/yukkie/articles/8f8a1e389b5c3f', '2025-07-09', NULL, 12, '{"PlayWright","TaskMaster","AI","バグ修正"}', NULL)
ON CONFLICT (url) DO NOTHING;

INSERT INTO public.blogs (title, platform, url, published_at, updated_at, read_time, tags, author) VALUES
('React + TypeScriptで「保存ボタンを2回押さないと動かない」問題を解決した方法', 'Qiita', 'https://qiita.com/Yukkie/items/d745a570c878950c4c4a', '2025-06-24', NULL, 7, '{"React","TypeScript","useState","非同期処理"}', NULL)
ON CONFLICT (url) DO NOTHING;

INSERT INTO public.blogs (title, platform, url, published_at, updated_at, read_time, tags, author) VALUES
('ドラッグ＆ドロップでリスト並び替え！@dnd-kitを使った実装の工夫', 'Zenn', 'https://zenn.dev/yukkie/articles/f3a093b1e9d16a', '2025-06-24', NULL, 9, '{"React","TypeScript","@dnd-kit","UI"}', NULL)
ON CONFLICT (url) DO NOTHING;

-- Seed products table ---------------------------------------------------
INSERT INTO public.products (name, description, long_desc, price, category, image_url, tags, is_featured, is_popular)
VALUES (
  'Household Budgeter',
  '収入と支出をシンプルに記録できる家計簿アプリ',
  'Household Budgeter は、家計簿を付けるための最小限で直感的なアプリです。毎日の収支を入力し、カテゴリ別にグラフで確認できます。',
  48700,
  'productivity',
  '/images/products/budget.jpg',
  ARRAY['家計簿','ファイナンス'],
  true,
  true
) ON CONFLICT DO NOTHING;

INSERT INTO public.products (name, description, long_desc, price, category, image_url, tags, is_featured, is_popular)
VALUES (
  'Health Tracker',
  '体重・睡眠・食事を記録して健康管理',
  'Health Tracker は、毎日の体重や睡眠時間、食事内容を簡単に記録し、グラフで確認できるヘルスケアアプリです。',
  72000,
  'health',
  '/images/products/health.jpg',
  ARRAY['健康','ヘルスケア'],
  true,
  false
) ON CONFLICT DO NOTHING;

INSERT INTO public.products (name, description, long_desc, price, category, image_url, tags, is_featured, is_popular)
VALUES (
  'Study Planner',
  '科目ごとの勉強時間を管理する学習プランナー',
  'Study Planner は、試験勉強や日々の学習を計画的に進めたい人向けのタイムトラッカーです。',
  59500,
  'education',
  '/images/products/study.jpg',
  ARRAY['学習','タイムトラッキング'],
  false,
  true
) ON CONFLICT DO NOTHING;

INSERT INTO public.products (name, description, long_desc, price, category, image_url, tags, is_featured, is_popular)
VALUES (
  'Simple TODO',
  '最小限の機能でサクッと使える TODO アプリ',
  'Simple TODO は、タスクの追加・完了・削除のみのシンプルさを追求した TODO アプリです。',
  33000,
  'productivity',
  '/images/products/todo.jpg',
  ARRAY['タスク','TODO'],
  false,
  true
) ON CONFLICT DO NOTHING;

INSERT INTO public.products (name, description, long_desc, price, category, image_url, tags, is_featured, is_popular)
VALUES (
  'Inventory Lite',
  '小規模店舗向けの在庫管理アプリ',
  'Inventory Lite は、小さなショップや個人事業主が簡単に在庫数を記録・確認できる Web アプリです。',
  91000,
  'business',
  '/images/products/inventory.jpg',
  ARRAY['在庫','ビジネス'],
  false,
  false
) ON CONFLICT DO NOTHING;

-- Seed contacts table ---------------------------------------------------
INSERT INTO public.contacts (name, email, message, status, is_checked, is_replied) VALUES
('テスト太郎', 'test1@example.com', 'これはテストメッセージです。', 'pending', false, false)
ON CONFLICT DO NOTHING;

INSERT INTO public.contacts (name, email, message, status, is_checked, is_replied) VALUES
('テスト花子', 'test2@example.com', 'お問い合わせのテストです。', 'pending', false, false)
ON CONFLICT DO NOTHING;

INSERT INTO public.contacts (name, email, message, status, is_checked, is_replied) VALUES
('山田次郎', 'yamada@example.com', 'サービスについて質問があります。', 'pending', false, false)
ON CONFLICT DO NOTHING;
