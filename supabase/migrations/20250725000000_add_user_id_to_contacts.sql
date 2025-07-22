-- migration: add user_id to contacts table for profile synchronization

-- user_idフィールドを追加（nullable）
alter table public.contacts 
add column if not exists user_id uuid references public.profiles(id) on delete set null;

-- 既存のデータでemailが一致するprofilesテーブルのuser_idを設定
update public.contacts 
set user_id = p.id 
from public.profiles p 
where contacts.email = p.email 
and contacts.user_id is null;

-- user_idが設定されている場合はprofilesテーブルのfull_nameでnameを更新
update public.contacts 
set name = p.full_name 
from public.profiles p 
where contacts.user_id = p.id 
and p.full_name is not null 
and p.full_name != '';

-- インデックスを追加（パフォーマンス向上）
create index if not exists idx_contacts_user_id on public.contacts(user_id);
create index if not exists idx_contacts_email on public.contacts(email); 