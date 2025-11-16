-- migration: create information table for editable content

create table if not exists public.information (
  id            text primary key default 'default',
  title         text not null,
  content       text not null,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- 初期データを挿入
insert into public.information (id, title, content)
values (
  'default',
  'Information',
  '# Information

## セクション1

テキストテキスト

## セクション2

テキストテキスト

### サブセクション

テキストテキスト

## リストの例

- リスト項目1
- リスト項目2
- リスト項目3

## 強調の例

**太字テキスト** と *斜体テキスト* が使用できます。

## コードの例

`インラインコード` も使用できます。

> 引用文の例です。

'
) on conflict (id) do nothing;

-- RLS (Row Level Security) を有効化
alter table public.information enable row level security;

-- 誰でも読み取り可能
create policy "information_select_public" on public.information
  for select using (true);

-- 管理者のみ更新可能
create policy "information_update_admin" on public.information
  for update using (
    auth.role() = 'authenticated'
    and auth.jwt() ->> 'email' = ANY ( string_to_array( current_setting('app.admin_emails', true), ',' ) )
  );

-- 管理者のみ挿入可能
create policy "information_insert_admin" on public.information
  for insert with check (
    auth.role() = 'authenticated'
    and auth.jwt() ->> 'email' = ANY ( string_to_array( current_setting('app.admin_emails', true), ',' ) )
  );
