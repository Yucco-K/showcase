-- レビューの返信機能を追加
-- 既存のproduct_reviewsテーブルにparent_idカラムを追加
ALTER TABLE product_reviews
ADD COLUMN parent_id UUID REFERENCES product_reviews(id) ON DELETE CASCADE;

-- インデックスを追加してパフォーマンスを向上
CREATE INDEX idx_product_reviews_parent_id ON product_reviews(parent_id);

-- RLSポリシーを更新して返信も含める
DROP POLICY IF EXISTS "Users can view all reviews" ON product_reviews;
CREATE POLICY "Users can view all reviews" ON product_reviews
    FOR SELECT USING (true);

-- 返信の挿入ポリシー
CREATE POLICY "Users can insert replies" ON product_reviews
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND
        (parent_id IS NULL OR EXISTS (
            SELECT 1 FROM product_reviews
            WHERE id = parent_id AND product_id = product_reviews.product_id
        ))
    );

-- 返信の更新ポリシー（自分の返信のみ）
CREATE POLICY "Users can update own replies" ON product_reviews
    FOR UPDATE USING (
        auth.uid() = user_id
    );

-- 返信の削除ポリシー（自分の返信または管理者）
CREATE POLICY "Users can delete own replies or admin can delete all" ON product_reviews
    FOR DELETE USING (
        auth.uid() = user_id OR
        (auth.jwt() ->> 'email') = ANY(ARRAY['yuki2082710@gmail.com', 'admin@sample.com'])
    );
