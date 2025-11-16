-- RPC関数を追加して、product_embeddingsテーブルのupsertを可能にする

-- 既存のテーブルにインデックスを追加
CREATE INDEX IF NOT EXISTS idx_product_embeddings_product_id ON public.product_embeddings (product_id);

-- upsert関数の作成
CREATE OR REPLACE FUNCTION public.upsert_product_embedding(
  p_product_id UUID,
  p_content TEXT,
  p_embedding vector
)
RETURNS VOID AS $$
BEGIN
  -- 既存のレコードを削除
  DELETE FROM public.product_embeddings
  WHERE product_id = p_product_id;

  -- 新しいレコードを挿入
  INSERT INTO public.product_embeddings (
    product_id,
    content,
    embedding
  ) VALUES (
    p_product_id,
    p_content,
    p_embedding
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 関数の実行権限を設定
GRANT EXECUTE ON FUNCTION public.upsert_product_embedding(UUID, TEXT, vector) TO anon, authenticated;

-- RLSポリシーを更新
ALTER TABLE public.product_embeddings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public insert for product_embeddings" ON public.product_embeddings;
DROP POLICY IF EXISTS "Allow authenticated users to update their own embeddings" ON public.product_embeddings;

CREATE POLICY "Allow authenticated upsert product embeddings" ON public.product_embeddings
    FOR ALL
    TO authenticated
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);
