-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create product_embeddings table
CREATE TABLE IF NOT EXISTS public.product_embeddings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    embedding vector(1536), -- OpenAI text-embedding-3-small dimension
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for vector similarity search
CREATE INDEX IF NOT EXISTS product_embeddings_embedding_idx
ON public.product_embeddings
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Create index for product_id lookups
CREATE INDEX IF NOT EXISTS product_embeddings_product_id_idx
ON public.product_embeddings (product_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_product_embeddings_updated_at
    BEFORE UPDATE ON public.product_embeddings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS (Row Level Security)
ALTER TABLE public.product_embeddings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow public read access to product embeddings" ON public.product_embeddings
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert for product embeddings" ON public.product_embeddings
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update product embeddings" ON public.product_embeddings
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete product embeddings" ON public.product_embeddings
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create function for similarity search
CREATE OR REPLACE FUNCTION match_products(
    query_embedding vector(1536),
    match_threshold float DEFAULT 0.7,
    match_count int DEFAULT 5
)
RETURNS TABLE (
    id UUID,
    product_id UUID,
    content TEXT,
    similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        pe.id,
        pe.product_id,
        pe.content,
        1 - (pe.embedding <=> query_embedding) as similarity
    FROM public.product_embeddings pe
    WHERE 1 - (pe.embedding <=> query_embedding) > match_threshold
    ORDER BY pe.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.product_embeddings TO anon, authenticated;
GRANT EXECUTE ON FUNCTION match_products TO anon, authenticated;
