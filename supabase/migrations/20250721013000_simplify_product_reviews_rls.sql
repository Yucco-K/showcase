-- 20250721013000_simplify_product_reviews_rls.sql
-- Simplify product_reviews RLS to avoid infinite recursion

-- Enable RLS (in case not enabled)
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies on product_reviews
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname='public' AND tablename='product_reviews'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.product_reviews', pol.policyname);
  END LOOP;
END$$;

-- 1. Anyone can read reviews
CREATE POLICY product_reviews_select_public ON public.product_reviews
  FOR SELECT
  USING (true);

-- 2. Authenticated user can insert review for themselves
CREATE POLICY product_reviews_insert_user ON public.product_reviews
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 3. Owners can update/delete their own reviews
CREATE POLICY product_reviews_update_owner ON public.product_reviews
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY product_reviews_delete_owner ON public.product_reviews
  FOR DELETE
  USING (auth.uid() = user_id);

-- 4. Admins (profiles.role='admin') can do all operations
CREATE POLICY product_reviews_admin_all ON public.product_reviews
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  ); 