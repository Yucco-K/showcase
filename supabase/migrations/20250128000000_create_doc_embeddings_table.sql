-- Enable pgvector extension if not already
CREATE EXTENSION IF NOT EXISTS vector;

-- Create doc_embeddings table
CREATE TABLE IF NOT EXISTS public.doc_embeddings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type TEXT NOT NULL, -- faq, guide, guide_detail, privacy, terms など
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    embedding vector(1536), -- OpenAI text-embedding-3-small dimension
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Unique constraint for upsert
CREATE UNIQUE INDEX IF NOT EXISTS idx_doc_embeddings_type_title ON public.doc_embeddings(type, title);

-- Index for vector search
CREATE INDEX IF NOT EXISTS idx_doc_embeddings_embedding ON public.doc_embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_doc_embeddings_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_doc_embeddings_updated_at ON public.doc_embeddings;
CREATE TRIGGER update_doc_embeddings_updated_at
    BEFORE UPDATE ON public.doc_embeddings
    FOR EACH ROW EXECUTE PROCEDURE update_doc_embeddings_updated_at_column();

-- RLS
ALTER TABLE public.doc_embeddings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read doc embeddings" ON public.doc_embeddings
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert doc embeddings" ON public.doc_embeddings
    FOR INSERT WITH CHECK (true);

-- Grant permissions
GRANT SELECT, INSERT ON public.doc_embeddings TO anon, authenticated;
