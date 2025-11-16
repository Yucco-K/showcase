-- migration: add pinned functionality to contacts table

-- contactsテーブルにpinnedカラムとpinned_atカラムを追加
ALTER TABLE public.contacts
ADD COLUMN is_pinned boolean DEFAULT false NOT NULL,
ADD COLUMN pinned_at timestamp with time zone NULL,
ADD COLUMN pinned_by uuid NULL;

-- pinned_byはadminのuser_idを参照
ALTER TABLE public.contacts
ADD CONSTRAINT contacts_pinned_by_fkey
FOREIGN KEY (pinned_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- 既存のレコードのデフォルト値を設定
UPDATE public.contacts SET is_pinned = false WHERE is_pinned IS NULL;
