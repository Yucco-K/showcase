-- doc_embeddings RLSポリシー修正

DROP POLICY IF EXISTS "Allow public insert doc embeddings" ON public.doc_embeddings;
DROP POLICY IF EXISTS "Allow public read doc embeddings" ON public.doc_embeddings;

CREATE POLICY "Allow public read doc embeddings" ON public.doc_embeddings
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert doc embeddings" ON public.doc_embeddings
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update doc embeddings" ON public.doc_embeddings
    FOR UPDATE USING (true) WITH CHECK (true);

-- すべてのユーザーがINSERT/UPDATE/SELECT可能 