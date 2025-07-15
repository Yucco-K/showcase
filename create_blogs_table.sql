-- blogsテーブルの作成
CREATE TABLE IF NOT EXISTS blogs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    platform TEXT NOT NULL,
    url TEXT NOT NULL,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    author TEXT,
    read_time INTEGER DEFAULT 5,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- サンプルデータの挿入
INSERT INTO blogs (title, platform, url, author, read_time, tags) VALUES
('PlayWrightとTaskMasterで TODOアプリの自動バグ修正デモ', 'ZENN', 'https://zenn.dev/yucco/articles/article-2-bug-fix-demo', 'yucco', 12, ARRAY['PlayWright', 'TaskMaster', 'AI', '自動化', 'バグ修正', 'テスト']),
('PlayWrightとTaskMasterで TODOアプリの自動構築デモ', 'ZENN', 'https://zenn.dev/yucco/articles/article-1-auto-build-demo', 'yucco', 15, ARRAY['PlayWright', 'TaskMaster', 'AI', '自動化', 'アプリ構築']),
('1年半の成長を振り返ってストーリーにしてみた件', 'QIITA', 'https://qiita.com/yucco/items/example', 'yucco', 8, ARRAY['成長', '振り返り', 'エンジニア']);

-- RLSポリシーの設定（全ユーザーが読み取り可能）
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON blogs
    FOR SELECT USING (true); 