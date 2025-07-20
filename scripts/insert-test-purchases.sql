-- product_purchasesテーブルにテストデータを挿入
-- 既存のデータをクリア（オプション）
-- DELETE FROM product_purchases;

-- テストデータの挿入
INSERT INTO product_purchases (user_id, product_id, purchase_date, amount, status) VALUES
-- ユーザー1の購入履歴
('550e8400-e29b-41d4-a716-446655440001', 'prod_001', '2024-01-15', 1500, 'completed'),
('550e8400-e29b-41d4-a716-446655440001', 'prod_003', '2024-02-20', 2500, 'completed'),

-- ユーザー2の購入履歴
('550e8400-e29b-41d4-a716-446655440002', 'prod_002', '2024-01-20', 2000, 'completed'),
('550e8400-e29b-41d4-a716-446655440002', 'prod_004', '2024-03-10', 1800, 'completed'),

-- ユーザー3の購入履歴
('550e8400-e29b-41d4-a716-446655440003', 'prod_001', '2024-02-05', 1500, 'completed'),
('550e8400-e29b-41d4-a716-446655440003', 'prod_005', '2024-03-15', 3000, 'completed'),

-- ユーザー4の購入履歴
('550e8400-e29b-41d4-a716-446655440004', 'prod_003', '2024-01-30', 2500, 'completed'),

-- ユーザー5の購入履歴
('550e8400-e29b-41d4-a716-446655440005', 'prod_002', '2024-02-10', 2000, 'completed'),
('550e8400-e29b-41d4-a716-446655440005', 'prod_006', '2024-03-20', 1200, 'completed'),

-- ユーザー6の購入履歴
('550e8400-e29b-41d4-a716-446655440006', 'prod_001', '2024-03-01', 1500, 'completed');

-- 挿入結果の確認
SELECT 
    pp.id,
    pp.user_id,
    pp.product_id,
    p.name as product_name,
    pp.purchase_date,
    pp.amount,
    pp.status
FROM product_purchases pp
LEFT JOIN products p ON pp.product_id = p.id
ORDER BY pp.purchase_date DESC; 