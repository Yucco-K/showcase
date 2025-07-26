-- Products Table Data Export
-- Generated on: 2025-01-25
-- Table: public.products

-- テーブル構造の確認
-- CREATE TABLE public.products (
--   id            uuid primary key default gen_random_uuid(),
--   name          text          not null,
--   description   text          not null,
--   long_desc     text,
--   price         numeric(10,0) not null,
--   category      text          not null,
--   image_url     text,
--   tags          text[],
--   is_featured   boolean default false,
--   is_popular    boolean default false,
--   likes         integer default 0 not null,
--   stars_total   integer default 0 not null,
--   stars_count   integer default 0 not null,
--   features      text[],
--   requirements  text[],
--   last_updated  date,
--   created_at    timestamptz default now(),
--   updated_at    timestamptz default now()
-- );

-- データの挿入
-- 注意: idは自動生成されるため、INSERT文では指定しません
-- 既存データを削除してから挿入する場合は、以下のコマンドを実行してください：
-- DELETE FROM public.products;

-- Product 1: Household Budgeter
INSERT INTO public.products (
    name,
    description,
    long_desc,
    price,
    category,
    image_url,
    tags,
    is_featured,
    is_popular,
    likes,
    stars_total,
    stars_count,
    features,
    requirements,
    last_updated
) VALUES (
    'Household Budgeter',
    '収入と支出をシンプルに記録できる家計簿アプリ',
    'Household Budgeter は、家計簿を付けるための最小限で直感的なアプリです。毎日の収支を入力し、カテゴリ別にグラフで確認できます。',
    48700,
    'productivity',
    '/images/products/budget.jpg',
    ARRAY['家計簿','ファイナンス'],
    true,
    true,
    0,
    0,
    0,
    ARRAY['収支入力', 'カテゴリ集計', '月次レポート'],
    ARRAY['Webブラウザ'],
    '2025-07-14'
) ON CONFLICT DO NOTHING;

-- Product 2: Health Tracker
INSERT INTO public.products (
    name,
    description,
    long_desc,
    price,
    category,
    image_url,
    tags,
    is_featured,
    is_popular,
    likes,
    stars_total,
    stars_count,
    features,
    requirements,
    last_updated
) VALUES (
    'Health Tracker',
    '体重・睡眠・食事を記録して健康管理',
    'Health Tracker は、毎日の体重や睡眠時間、食事内容を簡単に記録し、グラフで確認できるヘルスケアアプリです。',
    72000,
    'health',
    '/images/products/health.jpg',
    ARRAY['健康','ヘルスケア'],
    true,
    false,
    0,
    0,
    0,
    ARRAY['体重グラフ', '睡眠記録', '食事メモ'],
    ARRAY['iOS / Android'],
    '2025-07-14'
) ON CONFLICT DO NOTHING;

-- Product 3: Study Planner
INSERT INTO public.products (
    name,
    description,
    long_desc,
    price,
    category,
    image_url,
    tags,
    is_featured,
    is_popular,
    likes,
    stars_total,
    stars_count,
    features,
    requirements,
    last_updated
) VALUES (
    'Study Planner',
    '科目ごとの勉強時間を管理する学習プランナー',
    'Study Planner は、試験勉強や日々の学習を計画的に進めたい人向けのタイムトラッカーです。',
    59500,
    'education',
    '/images/products/study.jpg',
    ARRAY['学習','タイムトラッキング'],
    false,
    true,
    0,
    0,
    0,
    ARRAY['学習タイマー', '進捗レポート', 'リマインダー'],
    ARRAY['Webブラウザ'],
    '2025-07-14'
) ON CONFLICT DO NOTHING;

-- Product 4: Simple TODO
INSERT INTO public.products (
    name,
    description,
    long_desc,
    price,
    category,
    image_url,
    tags,
    is_featured,
    is_popular,
    likes,
    stars_total,
    stars_count,
    features,
    requirements,
    last_updated
) VALUES (
    'Simple TODO',
    '最小限の機能でサクッと使える TODO アプリ',
    'Simple TODO は、タスクの追加・完了・削除のみのシンプルさを追求した TODO アプリです。',
    33000,
    'productivity',
    '/images/products/todo.jpg',
    ARRAY['タスク','TODO'],
    false,
    true,
    0,
    0,
    0,
    ARRAY['タスク追加', 'ドラッグで並べ替え', 'ダークモード'],
    ARRAY['Webブラウザ'],
    '2025-07-14'
) ON CONFLICT DO NOTHING;

-- Product 5: Inventory Lite
INSERT INTO public.products (
    name,
    description,
    long_desc,
    price,
    category,
    image_url,
    tags,
    is_featured,
    is_popular,
    likes,
    stars_total,
    stars_count,
    features,
    requirements,
    last_updated
) VALUES (
    'Inventory Lite',
    '小規模店舗向けの在庫管理アプリ',
    'Inventory Lite は、小さなショップや個人事業主が簡単に在庫数を記録・確認できる Web アプリです。',
    91000,
    'business',
    '/images/products/inventory.jpg',
    ARRAY['在庫','ビジネス'],
    false,
    false,
    0,
    0,
    0,
    ARRAY['商品登録', '在庫アラート', 'CSV エクスポート'],
    ARRAY['Webブラウザ'],
    '2025-07-14'
) ON CONFLICT DO NOTHING;

-- データ確認用クエリ
-- SELECT 
--     id,
--     name,
--     description,
--     price,
--     category,
--     is_featured,
--     is_popular,
--     likes,
--     stars_total,
--     stars_count,
--     features,
--     requirements,
--     last_updated,
--     created_at,
--     updated_at
-- FROM public.products 
-- ORDER BY created_at;

-- 統計情報
-- SELECT 
--     COUNT(*) as total_products,
--     COUNT(CASE WHEN is_featured = true THEN 1 END) as featured_products,
--     COUNT(CASE WHEN is_popular = true THEN 1 END) as popular_products,
--     AVG(price) as average_price,
--     SUM(price) as total_value
-- FROM public.products;

-- カテゴリ別統計
-- SELECT 
--     category,
--     COUNT(*) as product_count,
--     AVG(price) as average_price,
--     SUM(price) as total_value
-- FROM public.products 
-- GROUP BY category 
-- ORDER BY product_count DESC; 