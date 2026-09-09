-- Gorse APIのサーバーサイドレート制限用テーブル
-- api/gorse-proxy がユーザーID(ログイン時)またはIPアドレスごとに
-- 時間/日単位のリクエスト数を記録するために使用する。
-- クライアント側(localStorage)のみのレート制限はユーザーが回避できるため、
-- サーバー側で実効性のある制限をかける目的で追加。

create table if not exists public.gorse_rate_limits (
	identifier text not null,
	window_type text not null check (window_type in ('hour', 'day')),
	window_start timestamptz not null,
	count integer not null default 0,
	updated_at timestamptz not null default now(),
	primary key (identifier, window_type, window_start)
);

-- RLSを有効化し、anon/authenticatedからの直接アクセスは一切許可しない。
-- api/gorse-proxy はSupabase Service Role Keyを使ってアクセスするため
-- RLSは自動的にバイパスされる。
alter table public.gorse_rate_limits enable row level security;

-- 古いウィンドウのレコードを検索・削除しやすくするインデックス
create index if not exists idx_gorse_rate_limits_window_start
	on public.gorse_rate_limits (window_start);

-- 同一identifier×window_typeの組み合わせに対して原子的にカウントを
-- インクリメントし、更新後のカウントを返す関数。
-- SECURITY DEFINERにより、RLSに関係なく実行できる。
create or replace function public.increment_gorse_rate_limit(
	p_identifier text,
	p_window_type text,
	p_window_start timestamptz
) returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
	new_count integer;
begin
	insert into public.gorse_rate_limits (identifier, window_type, window_start, count, updated_at)
	values (p_identifier, p_window_type, p_window_start, 1, now())
	on conflict (identifier, window_type, window_start)
	do update set
		count = public.gorse_rate_limits.count + 1,
		updated_at = now()
	returning count into new_count;

	return new_count;
end;
$$;

-- 期限切れウィンドウのレコードを削除するクリーンアップ関数。
-- 定期実行（例: Supabase Cron等）は別途設定する想定。未設定でも
-- テーブルの肥大化は緩やかなため、当面は手動/将来対応で問題ない。
create or replace function public.cleanup_gorse_rate_limits() returns void
language plpgsql
security definer
set search_path = public
as $$
begin
	delete from public.gorse_rate_limits
	where window_start < now() - interval '2 days';
end;
$$;
