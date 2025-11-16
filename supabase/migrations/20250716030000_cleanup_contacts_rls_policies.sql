-- 既存のポリシーを全て削除
DROP POLICY IF EXISTS "Authenticated users can insert contacts" ON public.contacts;
DROP POLICY IF EXISTS "Authenticated users can update contacts" ON public.contacts;
DROP POLICY IF EXISTS "Authenticated users can delete contacts" ON public.contacts;
DROP POLICY IF EXISTS "Authenticated users can select contacts" ON public.contacts;
DROP POLICY IF EXISTS "contacts_insert_public" ON public.contacts;
DROP POLICY IF EXISTS "contacts_select_admin" ON public.contacts;
DROP POLICY IF EXISTS "contacts_update_admin" ON public.contacts;
DROP POLICY IF EXISTS "Public can insert contacts" ON public.contacts;

-- 新しいシンプルなポリシーを作成

-- 1. お問い合わせフォーム用: 認証なしでもINSERT可能
CREATE POLICY "Allow public contact insert" ON public.contacts
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- 2. 管理画面用: 認証ユーザーは全ての操作が可能
CREATE POLICY "Allow authenticated users all operations" ON public.contacts
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
