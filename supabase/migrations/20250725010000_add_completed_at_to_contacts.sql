-- migration: add completed_at to contacts table for tracking completion time

-- completed_atフィールドを追加（nullable）
alter table public.contacts 
add column if not exists completed_at timestamptz;

-- 既存の完了ステータスのデータでcompleted_atがnullの場合は現在時刻を設定
update public.contacts 
set completed_at = now() 
where status = 'completed' 
and completed_at is null;

-- インデックスを追加（パフォーマンス向上）
create index if not exists idx_contacts_completed_at on public.contacts(completed_at); 