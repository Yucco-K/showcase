-- Enable Row Level Security (RLS) for the 'blogs' table
alter table public.blogs enable row level security;

-- Create a policy to allow public read access to everyone
create policy "Allow public read-only access"
  on public.blogs
  for select
  using (true);
