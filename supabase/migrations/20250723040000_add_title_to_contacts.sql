-- migration: add title column to contacts table

-- contactsテーブルにtitleカラムを追加
ALTER TABLE public.contacts
ADD COLUMN title text;

-- 既存のレコードにデフォルトのタイトルを設定
UPDATE public.contacts
SET title = 'お問い合わせ'
WHERE title IS NULL;
