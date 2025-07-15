-- migration: create product_reviews table and rating sync

-- 0. Ensure pgcrypto extension for UUID generation
create extension if not exists "pgcrypto" with schema public;

-- 1. product_reviews table -------------------------------------------------
create table if not exists public.product_reviews (
  id           uuid primary key default gen_random_uuid(),
  product_id   uuid not null references public.products(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,
  rating       smallint not null check (rating between 1 and 5),
  comment      text,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now(),
  constraint unique_product_user unique(product_id, user_id)
);

-- 2. updated_at trigger ----------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_set_updated_at on public.product_reviews;
create trigger trg_set_updated_at before update on public.product_reviews
  for each row execute procedure public.set_updated_at();

-- 3. trigger to sync products.stars_total & stars_count --------------------
create or replace function public.sync_product_stars()
returns trigger language plpgsql as $$
begin
  if tg_op = 'INSERT' then
    update public.products
      set stars_total = stars_total + new.rating,
          stars_count = stars_count + 1
      where id = new.product_id;
    return new;
  elsif tg_op = 'UPDATE' then
    if new.rating is distinct from old.rating then
      update public.products
        set stars_total = stars_total + new.rating - old.rating
        where id = new.product_id;
    end if;
    return new;
  elsif tg_op = 'DELETE' then
    update public.products
      set stars_total = stars_total - old.rating,
          stars_count = stars_count - 1
      where id = old.product_id;
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists trg_sync_product_stars on public.product_reviews;
create trigger trg_sync_product_stars
  after insert or update or delete on public.product_reviews
  for each row execute procedure public.sync_product_stars();

-- 4. Row Level Security ----------------------------------------------------
alter table public.product_reviews enable row level security;

-- 4a. Anyone can read reviews
create policy "product_reviews_select_public" on public.product_reviews
  for select using (true);

-- 4b. Insert: authenticated user can create review for themselves
create policy "product_reviews_insert_user" on public.product_reviews
  for insert with check (
    auth.role() = 'authenticated' and user_id = auth.uid()
  );

-- 4c. Update/Delete: owner or admin emails
create policy "product_reviews_modify_owner_or_admin" on public.product_reviews
  for update using (
    (user_id = auth.uid())
    or (auth.role() = 'authenticated' and auth.jwt() ->> 'email' = ANY ( string_to_array( current_setting('app.admin_emails', true), ',' ) ))
  ) with check (
    (user_id = auth.uid())
    or (auth.role() = 'authenticated' and auth.jwt() ->> 'email' = ANY ( string_to_array( current_setting('app.admin_emails', true), ',' ) ))
  );

create policy "product_reviews_delete_owner_or_admin" on public.product_reviews
  for delete using (
    (user_id = auth.uid())
    or (auth.role() = 'authenticated' and auth.jwt() ->> 'email' = ANY ( string_to_array( current_setting('app.admin_emails', true), ',' ) ))
  ); 