-- increment_gorse_rate_limit / cleanup_gorse_rate_limits はSECURITY DEFINERで
-- 定義されているが、PostgreSQLの既定動作によりPUBLIC(anon/authenticated含む)に
-- EXECUTE権限が付与されたままだった。RLSをすり抜けて任意のidentifierの
-- カウンタを操作できてしまうため、PUBLICから権限を剥奪し、
-- api/gorse-proxyが使用するservice_roleにのみ実行を許可する。

revoke execute on function public.increment_gorse_rate_limit(text, text, timestamptz) from public;
revoke execute on function public.cleanup_gorse_rate_limits() from public;

grant execute on function public.increment_gorse_rate_limit(text, text, timestamptz) to service_role;
grant execute on function public.cleanup_gorse_rate_limits() to service_role;
