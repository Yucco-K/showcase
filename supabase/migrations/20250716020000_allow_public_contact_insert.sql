-- お問い合わせフォームからのINSERTを認証なしでも許可
CREATE POLICY "Public can insert contacts" ON public.contacts
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- 既存の認証ユーザー用ポリシーは残す（管理画面用）
-- 認証ユーザーは引き続き全ての操作が可能
