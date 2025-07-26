-- 既存のRLSポリシーを修正し、ユニーク制約を追加

-- 既存のテーブル定義を変更
ALTER TABLE public.product_embeddings 
ADD CONSTRAINT unique_product_embedding UNIQUE (product_id);

-- RLSポリシーを更新
DROP POLICY IF EXISTS "Allow public insert for product embeddings" ON public.product_embeddings;

CREATE POLICY "Allow public insert for product embeddings" ON public.product_embeddings
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update their own embeddings" ON public.product_embeddings
    FOR UPDATE USING (auth.uid() IS NOT NULL)
    WITH CHECK (true);

-- 既存のデータを削除して再挿入を可能にする
TRUNCATE TABLE public.product_embeddings; 