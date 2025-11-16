-- doc_embeddings用ベクトル類似検索RPC: match_docs
CREATE OR REPLACE FUNCTION public.match_docs(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  doc_type text DEFAULT NULL
)
RETURNS TABLE(
  id uuid,
  type text,
  title text,
  content text,
  similarity float
) AS $$
BEGIN
  RETURN QUERY
    SELECT
      d.id,
      d.type,
      d.title,
      d.content,
      1 - (d.embedding <=> query_embedding) AS similarity
    FROM public.doc_embeddings d
    WHERE (doc_type IS NULL OR d.type = doc_type)
      AND 1 - (d.embedding <=> query_embedding) > match_threshold
    ORDER BY d.embedding <=> query_embedding
    LIMIT match_count;
END;
$$ LANGUAGE plpgsql STABLE;

GRANT EXECUTE ON FUNCTION public.match_docs(vector, float, int, text) TO anon, authenticated;
