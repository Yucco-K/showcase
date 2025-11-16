-- contactsテーブルのRLS有効化
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- INSERT: 認証ユーザーなら誰でも許可
CREATE POLICY "Authenticated users can insert contacts" ON public.contacts
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- UPDATE: 認証ユーザーなら誰でも許可
CREATE POLICY "Authenticated users can update contacts" ON public.contacts
  FOR UPDATE
  TO authenticated
  USING (true);

-- DELETE: 認証ユーザーなら誰でも許可
CREATE POLICY "Authenticated users can delete contacts" ON public.contacts
  FOR DELETE
  TO authenticated
  USING (true);

-- SELECT: 認証ユーザーなら誰でも許可
CREATE POLICY "Authenticated users can select contacts" ON public.contacts
  FOR SELECT
  TO authenticated
  USING (true);
