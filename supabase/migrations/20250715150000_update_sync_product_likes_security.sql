-- migration: make sync_product_likes function bypass RLS via SECURITY DEFINER

-- Ensure function exists, then recreate with SECURITY DEFINER and search_path
create or replace function public.sync_product_likes()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
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

-- Grant EXECUTE on function to authenticated role for safety
grant execute on function public.sync_product_likes() to authenticated; 