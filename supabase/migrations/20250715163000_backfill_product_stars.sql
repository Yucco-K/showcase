-- migration: backfill stars_total and stars_count based on existing product_reviews

update public.products
set stars_total = sub.total,
    stars_count = sub.cnt
from (
  select product_id,
         coalesce(sum(rating),0) as total,
         count(*)               as cnt
  from public.product_reviews
  group by product_id
) sub
where sub.product_id = products.id;
