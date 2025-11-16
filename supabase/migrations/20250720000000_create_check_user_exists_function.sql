-- 既存ユーザーの存在をチェックする関数
CREATE OR REPLACE FUNCTION check_user_exists(email_address TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_exists BOOLEAN;
BEGIN
    -- auth.usersテーブルでメールアドレスをチェック
    SELECT EXISTS(
        SELECT 1
        FROM auth.users
        WHERE email = email_address
    ) INTO user_exists;

    RETURN user_exists;
END;
$$;

-- 匿名ユーザーがこの関数を呼び出せるように権限を設定
GRANT EXECUTE ON FUNCTION check_user_exists(TEXT) TO anon;
