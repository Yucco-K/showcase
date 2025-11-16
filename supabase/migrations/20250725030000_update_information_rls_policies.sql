-- Update RLS policies for information table
-- Drop existing policies
drop policy if exists information_insert_admin on public.information;
drop policy if exists information_update_admin on public.information;
drop policy if exists information_select_public on public.information;

-- Enable RLS
alter table public.information enable row level security;

-- Admin can do everything (CRUD)
create policy information_admin_all
on public.information
for all
to authenticated
using (
  (select role from public.profiles p where p.id = auth.uid()) = 'admin'
)
with check (
  (select role from public.profiles p where p.id = auth.uid()) = 'admin'
);

-- Authenticated users can read
create policy information_select_authenticated
on public.information
for select
to authenticated
using ( true );

-- Anonymous users can also read (optional)
create policy information_select_anon
on public.information
for select
to anon
using ( true );
