-- migration: make sync_product_stars function bypass RLS via SECURITY DEFINER

create or replace function public.sync_product_stars()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
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

grant execute on function public.sync_product_stars() to authenticated; 