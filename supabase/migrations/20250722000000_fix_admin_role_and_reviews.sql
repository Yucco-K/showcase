-- Fix admin role and reviews foreign key issues
-- Migration: 20250722000000_fix_admin_role_and_reviews.sql

-- 1. Add role column to profiles table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'role'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator'));
    END IF;
END $$;

-- 2. Update existing profiles to have proper role
UPDATE public.profiles 
SET role = 'user' 
WHERE role IS NULL;

-- 3. Set specific admin email to admin role
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'yuki2082710@gmail.com';

-- 4. Ensure product_reviews table has proper foreign key
-- First, let's check if there are any orphaned records
DELETE FROM public.product_reviews 
WHERE user_id NOT IN (SELECT id FROM public.profiles);

-- 5. Recreate the foreign key constraint to ensure it's properly set
ALTER TABLE public.product_reviews 
DROP CONSTRAINT IF EXISTS product_reviews_user_id_fkey;

ALTER TABLE public.product_reviews 
ADD CONSTRAINT product_reviews_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 6. Update RLS policies for profiles table
DROP POLICY IF EXISTS "profiles_select_public" ON public.profiles;
CREATE POLICY "profiles_select_public" ON public.profiles
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- 7. Add admin-specific policies
CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 8. Ensure product_reviews has proper RLS policies
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

-- Allow users to view all reviews
CREATE POLICY "Anyone can view product reviews" ON public.product_reviews
    FOR SELECT USING (true);

-- Allow authenticated users to insert their own reviews
CREATE POLICY "Users can insert own reviews" ON public.product_reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own reviews
CREATE POLICY "Users can update own reviews" ON public.product_reviews
    FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to delete their own reviews
CREATE POLICY "Users can delete own reviews" ON public.product_reviews
    FOR DELETE USING (auth.uid() = user_id);

-- Allow admins to manage all reviews
CREATE POLICY "Admins can manage all reviews" ON public.product_reviews
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 9. Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = user_id AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Create function to check if user is moderator
CREATE OR REPLACE FUNCTION public.is_moderator(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = user_id AND role IN ('admin', 'moderator')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_product_reviews_user_id ON public.product_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON public.product_reviews(product_id);

-- 12. Update the profiles trigger to handle role updates
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS handle_profiles_updated_at ON public.profiles;
CREATE TRIGGER handle_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at(); 