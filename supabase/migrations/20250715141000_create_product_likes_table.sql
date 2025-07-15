-- migration: create product_likes table for 1-user-1-like system and sync products.likes counter

-- 0. Ensure pgcrypto extension for UUID generation (if not already enabled)
create extension if not exists "pgcrypto" with schema public;

-- 1. product_likes table ---------------------------------------------------
--    Composite primary key (product_id, user_id) enforces one like per user
create table if not exists public.product_likes (
  product_id uuid not null references public.products(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  constraint product_likes_pkey primary key (product_id, user_id)
);

-- 2. Trigger procedure to keep products.likes in sync ---------------------
create or replace function public.sync_product_likes()
returns trigger language plpgsql as $$
begin
  if tg_op = 'INSERT' then
    update public.products
      set likes = likes + 1
      where id = new.product_id;
    return new;
  elsif tg_op = 'DELETE' then
    update public.products
      set likes = greatest(likes - 1, 0)
      where id = old.product_id;
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists trg_sync_product_likes on public.product_likes;
create trigger trg_sync_product_likes
  after insert or delete on public.product_likes
  for each row execute procedure public.sync_product_likes();

-- 3. Row Level Security ----------------------------------------------------
alter table public.product_likes enable row level security;

-- 3a. Anyone (anon) can read likes (aggregate counts, etc.)
create policy "product_likes_select_public" on public.product_likes
  for select using (true);

-- 3b. Insert: authenticated user can like a product (their own user_id)
create policy "product_likes_insert_user" on public.product_likes
  for insert with check (
    auth.role() = 'authenticated' and user_id = auth.uid()
  );

-- 3c. Delete: owner or admin can remove like
create policy "product_likes_delete_owner_or_admin" on public.product_likes
  for delete using (
    (user_id = auth.uid())
    or (auth.role() = 'authenticated' and auth.jwt() ->> 'email' = ANY ( string_to_array( current_setting('app.admin_emails', true), ',' ) ))
  ); 