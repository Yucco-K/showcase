-- 商品購入履歴テーブル
CREATE TABLE public.product_purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  stripe_payment_intent_id TEXT UNIQUE NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'jpy',
  status TEXT NOT NULL DEFAULT 'pending',
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS (Row Level Security) を有効化
ALTER TABLE public.product_purchases ENABLE ROW LEVEL SECURITY;

-- product_purchases テーブルのポリシー（広い権限設定）
-- 全ユーザーが購入履歴を閲覧可能（公開読み取り）
CREATE POLICY "Anyone can view product purchases" ON public.product_purchases
  FOR SELECT USING (true);

-- 認証済みユーザーが購入履歴を作成可能
CREATE POLICY "Authenticated users can insert product purchases" ON public.product_purchases
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 認証済みユーザーが自分の購入履歴を更新可能
CREATE POLICY "Users can update own product purchases" ON public.product_purchases
  FOR UPDATE USING (auth.uid() = user_id);

-- 認証済みユーザーが自分の購入履歴を削除可能
CREATE POLICY "Users can delete own product purchases" ON public.product_purchases
  FOR DELETE USING (auth.uid() = user_id);

-- 管理者は全操作可能
CREATE POLICY "Admins have full access to product purchases" ON public.product_purchases
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND email IN ('yuki.k@example.com', 'admin@example.com')
    )
  );

-- updated_at トリガーを設定
CREATE TRIGGER handle_product_purchases_updated_at
  BEFORE UPDATE ON public.product_purchases
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- インデックスを作成（パフォーマンス向上のため）
CREATE INDEX idx_product_purchases_user_id ON public.product_purchases(user_id);
CREATE INDEX idx_product_purchases_product_id ON public.product_purchases(product_id);
CREATE INDEX idx_product_purchases_purchased_at ON public.product_purchases(purchased_at);
CREATE INDEX idx_product_purchases_status ON public.product_purchases(status); 