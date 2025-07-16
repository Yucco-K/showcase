-- ストレージのRLSを完全に無効化（開発環境用）
-- 注意: 本番環境では使用しないでください

-- 既存のポリシーを全て削除
DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Full access for authenticated users on avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload to avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete avatars" ON storage.objects;

-- ストレージテーブルのRLSを無効化
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- 確認用のコメント
COMMENT ON TABLE storage.objects IS 'RLS disabled for development - DO NOT USE IN PRODUCTION'; 