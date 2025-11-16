-- 20250721021500_update_profiles_column_grant.sql
-- Allow anon & authenticated to read role column for profiles

-- Revoke existing and grant new
REVOKE ALL ON TABLE public.profiles FROM anon, authenticated;

-- grant select on id, avatar_url, full_name, biography, role
GRANT SELECT (id, avatar_url, full_name, biography, role)
  ON TABLE public.profiles
  TO anon, authenticated;

-- keep update grant unchanged
GRANT UPDATE (avatar_url, full_name, biography)
  ON TABLE public.profiles
  TO authenticated;
