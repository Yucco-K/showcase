-- contactsテーブルにテストデータを挿入
INSERT INTO public.contacts (name, email, message, status, is_checked, is_replied) VALUES
('テスト太郎', 'test1@example.com', 'これはテストメッセージです。', 'new', false, false),
('テスト花子', 'test2@example.com', 'お問い合わせのテストです。', 'new', false, false),
('山田次郎', 'yamada@example.com', 'サービスについて質問があります。', 'new', false, false);

-- 挿入されたデータを確認
SELECT * FROM public.contacts ORDER BY created_at DESC; 