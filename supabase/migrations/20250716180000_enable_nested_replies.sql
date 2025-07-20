-- 既存のparent_id制約を削除
ALTER TABLE product_reviews DROP CONSTRAINT IF EXISTS product_reviews_parent_id_fkey;

-- 新しい制約を追加（レビューまたは返信を参照可能）
ALTER TABLE product_reviews 
ADD CONSTRAINT product_reviews_parent_id_fkey 
FOREIGN KEY (parent_id) REFERENCES product_reviews(id) ON DELETE CASCADE;

-- 階層レベルを追跡するカラムを追加（オプション）
ALTER TABLE product_reviews 
ADD COLUMN reply_level INTEGER DEFAULT 0;

-- 既存の返信のレベルを設定
UPDATE product_reviews 
SET reply_level = 1 
WHERE parent_id IS NOT NULL;

-- インデックスを追加
CREATE INDEX idx_product_reviews_reply_level ON product_reviews(reply_level); 