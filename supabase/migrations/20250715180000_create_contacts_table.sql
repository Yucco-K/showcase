-- migration: create contacts table for contact form

create table if not exists public.contacts (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  email         text not null,
  message       text not null,
  created_at    timestamptz default now()
);

-- RLS (Row Level Security) を有効化
alter table public.contacts enable row level security;

-- 誰でも insert 可能（お問い合わせフォーム用）
create policy "contacts_insert_public" on public.contacts
  for insert with check (true);

-- 管理者のみ select 可能
create policy "contacts_select_admin" on public.contacts
  for select using (
    auth.role() = 'authenticated'
    and auth.jwt() ->> 'email' = ANY ( string_to_array( current_setting('app.admin_emails', true), ',' ) )
  );

-- 既存のポリシーを削除して再作成（修正用）
drop policy if exists "contacts_insert_public" on public.contacts;
create policy "contacts_insert_public" on public.contacts
  for insert with check (true); 