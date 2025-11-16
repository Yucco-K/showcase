-- Add foreign key relationship between product_reviews and profiles
-- This ensures that product_reviews.user_id references profiles.id

-- First, let's check if the foreign key already exists
DO $$
BEGIN
    -- Add foreign key constraint if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'product_reviews_user_id_fkey'
        AND table_name = 'product_reviews'
    ) THEN
        -- Add foreign key constraint to profiles table
        ALTER TABLE public.product_reviews
        ADD CONSTRAINT product_reviews_user_id_fkey
        FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Enable RLS on profiles table if not already enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Add policy to allow reading profiles for authenticated users
DROP POLICY IF EXISTS "profiles_select_public" ON public.profiles;
CREATE POLICY "profiles_select_public" ON public.profiles
    FOR SELECT USING (true);

-- Update the existing policy to be more specific
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);
