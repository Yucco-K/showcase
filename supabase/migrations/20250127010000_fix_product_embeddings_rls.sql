-- Fix RLS policies for product_embeddings table
-- Allow public insert for product embeddings

DROP POLICY IF EXISTS "Allow authenticated users to insert product embeddings" ON public.product_embeddings;

CREATE POLICY "Allow public insert for product embeddings" ON public.product_embeddings
    FOR INSERT WITH CHECK (true); 