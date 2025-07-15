-- migration: add last_updated, features, requirements fields to products table

-- Add new columns to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS last_updated date,
ADD COLUMN IF NOT EXISTS features text[],
ADD COLUMN IF NOT EXISTS requirements text[];

-- Update existing records with default values
UPDATE public.products 
SET 
  last_updated = COALESCE(last_updated, created_at::date),
  features = COALESCE(features, ARRAY[]::text[]),
  requirements = COALESCE(requirements, ARRAY[]::text[])
WHERE last_updated IS NULL OR features IS NULL OR requirements IS NULL; 