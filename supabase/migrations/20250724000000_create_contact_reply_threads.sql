-- お問い合わせ返信履歴テーブル
create table if not exists contact_reply_threads (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid references contacts(id) on delete cascade,
  sender_type text not null, -- 'admin' or 'user'
  sender_id uuid references profiles(id),
  message text not null,
  created_at timestamptz not null default now()
);
