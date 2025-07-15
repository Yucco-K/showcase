-- blogsテーブルの存在確認
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'blogs'
);

-- テーブルが存在する場合の構造確認
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'blogs'
ORDER BY ordinal_position;

-- 既存データの確認
SELECT COUNT(*) as total_blogs FROM blogs;

-- サンプルデータの表示
SELECT * FROM blogs LIMIT 3; 