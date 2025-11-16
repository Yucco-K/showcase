-- migration: create products table with likes/stars counters

-- 0. Ensure pgcrypto for gen_random_uuid
create extension if not exists "pgcrypto" with schema public;

-- 1. products table
create table if not exists public.products (
  id            uuid primary key default gen_random_uuid(),
  name          text          not null,
  description   text          not null,
  long_desc     text,
  price         numeric(10,0) not null,
  category      text          not null,
  image_url     text,
  tags          text[],

  is_featured   boolean default false,
  is_popular    boolean default false,

  likes         integer default 0 not null,
  stars_total   integer default 0 not null,
  stars_count   integer default 0 not null,

  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- 2. updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_set_updated_at on public.products;
create trigger trg_set_updated_at before update on public.products
  for each row execute procedure public.set_updated_at();

-- 3. Row Level Security (RLS)
alter table public.products enable row level security;

-- 3a. Allow read for anyone (anon)
create policy "products_select_public" on public.products
  for select using (true);

-- 3b. Allow insert/update/delete only for admin emails
-- Requires setting runtime GUC app.admin_emails to comma-separated list
create policy "products_admin_write" on public.products
  for all using (
    auth.role() = 'authenticated'
    and auth.jwt() ->> 'email' = ANY ( string_to_array( current_setting('app.admin_emails', true), ',' ) )
  );
