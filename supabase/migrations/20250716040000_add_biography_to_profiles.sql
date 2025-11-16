-- profilesテーブルにbiographyカラムを追加
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS biography TEXT;
