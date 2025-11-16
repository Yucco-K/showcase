-- auth.usersテーブルのメールアドレス変更を監視し、profilesテーブルも更新するファンクション
CREATE OR REPLACE FUNCTION public.handle_email_change()
RETURNS TRIGGER AS $$
BEGIN
  -- メールアドレスが変更された場合のみ処理
  IF OLD.email IS DISTINCT FROM NEW.email THEN
    -- profilesテーブルのメールアドレスを更新
    UPDATE public.profiles
    SET email = NEW.email, updated_at = NOW()
    WHERE id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- auth.usersテーブルにトリガーを追加
DROP TRIGGER IF EXISTS on_auth_user_email_change ON auth.users;
CREATE TRIGGER on_auth_user_email_change
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_email_change();

-- 既存のユーザーでメールアドレスが同期されていない場合の修正
-- このクエリは一度だけ実行されることを想定
UPDATE public.profiles
SET email = auth.users.email, updated_at = NOW()
FROM auth.users
WHERE profiles.id = auth.users.id
  AND profiles.email IS DISTINCT FROM auth.users.email;
