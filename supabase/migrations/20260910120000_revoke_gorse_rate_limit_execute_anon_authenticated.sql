-- 前回のmigration(20260910090000)でPUBLICからのEXECUTE権限は剥奪したが、
-- Supabaseのデフォルト設定によりanon/authenticatedロールには別途明示的に
-- EXECUTE権限が付与されており(ALTER DEFAULT PRIVILEGES経由)、
-- REVOKE ... FROM PUBLICだけでは削除されないことが本番確認で判明した。
-- anon/authenticatedから個別にREVOKEする。

revoke execute on function public.increment_gorse_rate_limit(text, text, timestamptz) from anon, authenticated;
revoke execute on function public.cleanup_gorse_rate_limits() from anon, authenticated;
