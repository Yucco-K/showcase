-- contact_reply_threads RLS有効化
ALTER TABLE contact_reply_threads ENABLE ROW LEVEL SECURITY;

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
