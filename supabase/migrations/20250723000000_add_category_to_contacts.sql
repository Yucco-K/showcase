-- migration: add category column to contacts table

-- カテゴリのenum型を作成
CREATE TYPE contact_category AS ENUM (
  'urgent',        -- 緊急
  'account_delete', -- 退会申請
  'feature_request', -- 機能追加の提案
  'account_related', -- アカウント関連
  'billing',       -- 支払いや請求
  'support',       -- サポート依頼
  'other'          -- その他
);

-- contactsテーブルにcategoryカラムを追加
ALTER TABLE public.contacts 
ADD COLUMN category contact_category DEFAULT 'other' NOT NULL;

-- 既存のレコードにデフォルト値を設定（もしあれば）
UPDATE public.contacts SET category = 'other' WHERE category IS NULL; 