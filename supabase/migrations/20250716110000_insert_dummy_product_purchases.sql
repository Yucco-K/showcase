-- 商品購入履歴テーブルにダミーデータを挿入
-- 注意: このマイグレーションは開発・テスト用です

-- ダミーユーザーID（実際のユーザーIDに置き換える必要があります）
-- 既存のユーザーがいる場合は、実際のユーザーIDを使用してください
DO $$
DECLARE
    dummy_user_id UUID;
    product_ids UUID[];
    i INTEGER;
    purchase_id UUID;
    stripe_payment_id TEXT;
BEGIN
    -- 既存のユーザーから1つ取得（いない場合はダミーIDを使用）
    SELECT id INTO dummy_user_id FROM public.profiles LIMIT 1;
    
    -- ユーザーがいない場合はダミーIDを作成
    IF dummy_user_id IS NULL THEN
        dummy_user_id := gen_random_uuid();
        INSERT INTO public.profiles (id, email, full_name) 
        VALUES (dummy_user_id, 'dummy@example.com', 'ダミーユーザー');
    END IF;
    
    -- 既存の商品IDを取得
    SELECT array_agg(id) INTO product_ids FROM public.products;
    
    -- 商品がない場合はダミー商品を作成
    IF product_ids IS NULL OR array_length(product_ids, 1) = 0 THEN
        INSERT INTO public.products (name, description, price, category) 
        VALUES 
        ('ダミー商品1', 'テスト用商品1', 1000, 'productivity'),
        ('ダミー商品2', 'テスト用商品2', 2000, 'design'),
        ('ダミー商品3', 'テスト用商品3', 1500, 'development')
        RETURNING array_agg(id) INTO product_ids;
    END IF;
    
    -- ダミー購入履歴を挿入
    FOR i IN 1..10 LOOP
        -- ランダムな商品を選択
        purchase_id := gen_random_uuid();
        stripe_payment_id := 'pi_dummy_' || i || '_' || extract(epoch from now())::text;
        
        INSERT INTO public.product_purchases (
            id,
            user_id,
            product_id,
            stripe_payment_intent_id,
            amount,
            currency,
            status,
            purchased_at
        ) VALUES (
            purchase_id,
            dummy_user_id,
            product_ids[1 + (i % array_length(product_ids, 1))],
            stripe_payment_id,
            1000 + (i * 500), -- 1000円から500円ずつ増加
            'jpy',
            CASE 
                WHEN i <= 3 THEN 'completed'
                WHEN i <= 6 THEN 'pending'
                ELSE 'failed'
            END,
            now() - (i * interval '1 day') -- 過去の日付で段階的に
        );
    END LOOP;
    
    RAISE NOTICE 'ダミー購入履歴を10件挿入しました。ユーザーID: %, 商品数: %', 
        dummy_user_id, array_length(product_ids, 1);
END $$; 