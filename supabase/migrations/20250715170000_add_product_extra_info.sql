-- migration: add product extra info columns and seed dummy values

alter table if exists public.products
  add column if not exists features text[],
  add column if not exists requirements text[],
  add column if not exists last_updated date;

-- --- デフォルトのダミーデータを追加 ---
update public.products
  set features = array['ダミー機能 1', 'ダミー機能 2', 'ダミー機能 3']
  where features is null;

update public.products
  set requirements = array['ダミーOS', 'ダミーブラウザ']
  where requirements is null;

update public.products
  set last_updated = coalesce(last_updated, current_date) ; 