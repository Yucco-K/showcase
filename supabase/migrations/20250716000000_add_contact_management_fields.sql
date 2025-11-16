-- migration: add management fields to contacts table

-- Add management fields to contacts table
alter table public.contacts
add column if not exists is_checked boolean default false,
add column if not exists is_replied boolean default false,
add column if not exists status text default 'pending' check (status in ('pending', 'in_progress', 'completed', 'closed')),
add column if not exists admin_notes text,
add column if not exists replied_at timestamptz,
add column if not exists checked_at timestamptz,
add column if not exists checked_by uuid references auth.users(id),
add column if not exists replied_by uuid references auth.users(id);

-- Update RLS policies to allow admins to update contacts
create policy "contacts_update_admin" on public.contacts
  for update using (
    auth.role() = 'authenticated'
    and auth.jwt() ->> 'email' = ANY ( string_to_array( current_setting('app.admin_emails', true), ',' ) )
  );

-- Create index for better performance
create index if not exists idx_contacts_status on public.contacts(status);
create index if not exists idx_contacts_created_at on public.contacts(created_at);
create index if not exists idx_contacts_is_checked on public.contacts(is_checked);
create index if not exists idx_contacts_is_replied on public.contacts(is_replied);
