-- Allow anyone (anon/public role) to INSERT into public.blogs

alter table public.blogs enable row level security;

create policy "Allow public insert"
  on public.blogs
  for insert
  to public
  with check (true);
