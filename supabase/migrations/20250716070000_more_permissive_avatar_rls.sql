-- 既存のポリシーを削除
DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;

-- 最も寛容なポリシーを作成
-- 認証ユーザーはavatarsバケットに対して全ての操作が可能
CREATE POLICY "Full access for authenticated users on avatars" ON storage.objects
  FOR ALL USING (
    bucket_id = 'avatars' AND auth.role() = 'authenticated'
  );

-- バックアップとして、個別のポリシーも作成
CREATE POLICY "Users can upload to avatars" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update avatars" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can delete avatars" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' AND auth.role() = 'authenticated'
  );

CREATE POLICY "Anyone can view avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars'); 