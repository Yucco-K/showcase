-- 1. 既存ポリシーを全て削除
DROP POLICY IF EXISTS "Admins can select all contact threads" ON contact_reply_threads;
DROP POLICY IF EXISTS "Admins can update all contact threads" ON contact_reply_threads;
DROP POLICY IF EXISTS "Admins can delete all contact threads" ON contact_reply_threads;
DROP POLICY IF EXISTS "Users can read their own contact threads" ON contact_reply_threads;
DROP POLICY IF EXISTS "Users can insert their own contact threads" ON contact_reply_threads;
DROP POLICY IF EXISTS "Users can update their own contact threads" ON contact_reply_threads;
DROP POLICY IF EXISTS "Users can delete their own contact threads" ON contact_reply_threads;

-- 2. 必要なポリシーだけ再作成
-- ユーザー用
CREATE POLICY "Users can read their own contact threads"
ON contact_reply_threads
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM contacts
    WHERE contacts.id = contact_reply_threads.contact_id
      AND contacts.email = auth.email()
  )
);

CREATE POLICY "Users can insert their own contact threads"
ON contact_reply_threads
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM contacts
    WHERE contacts.id = contact_reply_threads.contact_id
      AND contacts.email = auth.email()
  )
);

CREATE POLICY "Users can update their own contact threads"
ON contact_reply_threads
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM contacts
    WHERE contacts.id = contact_reply_threads.contact_id
      AND contacts.email = auth.email()
  )
);

CREATE POLICY "Users can delete their own contact threads"
ON contact_reply_threads
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM contacts
    WHERE contacts.id = contact_reply_threads.contact_id
      AND contacts.email = auth.email()
  )
);

-- 管理者用
CREATE POLICY "Admins can select all contact threads"
ON contact_reply_threads
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admins can update all contact threads"
ON contact_reply_threads
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admins can delete all contact threads"
ON contact_reply_threads
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
  )
); 