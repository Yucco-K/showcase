-- 管理者がお問い合わせ返信を作成できるINSERTポリシーを追加
CREATE POLICY "Admins can insert all contact threads"
ON contact_reply_threads
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
  )
);
