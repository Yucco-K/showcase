-- migration: auto insert profiles on signup

-- 1. ensure profiles table exists (simple example structure)
create table if not exists public.profiles (
  id uuid primary key,
  email text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. updated_at trigger helper (reuse if already exists)
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_set_updated_at on public.profiles;
create trigger trg_set_updated_at before update on public.profiles
  for each row execute procedure public.set_updated_at();

-- 3. function to handle new auth.users
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles(id, email, created_at)
  values (new.id, new.email, now())
  on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists trg_on_auth_user_created on auth.users;
create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
