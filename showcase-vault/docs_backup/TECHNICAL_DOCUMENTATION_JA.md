# Portfolio Showcase - 技術文書

## Version 2.0 - 実用版

**ドキュメントバージョン:** 2.0
**最終更新:** 2025 年 1 月
**プロジェクト状況:** 本番稼働準備完了
**対象読者:** ソフトウェアベンダー、実用的なクライアント、技術チーム

---

## エグゼクティブサマリー

Portfolio Showcase Version 2.0 は、Version 1.0 からの大幅な進化を遂げた包括的な E コマース対応ポートフォリオプラットフォームです。このドキュメントでは、実用的なデプロイメントと統合のための詳細な技術仕様、アーキテクチャ決定、実装ガイドラインを提供します。

### Version 1.0 からの主要な改善点

| 機能                   | Version 1.0  | Version 2.0                       |
| ---------------------- | ------------ | --------------------------------- |
| **認証**               | なし         | Supabase Auth with RLS            |
| **データベース**       | 静的データ   | PostgreSQL with Supabase          |
| **決済処理**           | なし         | Stripe 統合                       |
| **デプロイメント**     | GitHub Pages | Vercel with CI/CD                 |
| **コンテンツ管理**     | 静的ファイル | 動的 CMS                          |
| **カスタマーサポート** | なし         | お問い合わせ管理システム          |
| **管理者パネル**       | なし         | マルチレベル管理者ダッシュボード  |
| **セキュリティ**       | 基本         | エンタープライズグレード with RLS |

---

## システムアーキテクチャ

### 高レベルアーキテクチャ

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   フロントエンド │    │   バックエンド   │    │   外部サービス   │
│   (React/TS)    │◄──►│   (Supabase)    │◄──►│   Services      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Vercel CDN    │    │   PostgreSQL    │    │   Stripe API    │
│   Edge Network  │    │   Database      │    │   Payment       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 技術スタック

#### フロントエンドレイヤー

- **フレームワーク:** React 19.1.0 with TypeScript 5.8.3
- **ビルドツール:** Vite 7.0.4 (超高速開発・ビルド)
- **スタイリング:** Styled Components 6.1.19 (CSS-in-JS)
- **ルーティング:** React Router DOM 7.6.3
- **状態管理:** React Context API + カスタムフック
- **UI コンポーネント:** カスタムデザインシステム

#### バックエンドレイヤー

- **データベース:** PostgreSQL 15+ (Supabase)
- **認証:** Supabase Auth with JWT
- **API:** Supabase REST API + リアルタイムサブスクリプション
- **ファイルストレージ:** Supabase Storage with RLS
- **セキュリティ:** Row Level Security (RLS) ポリシー

#### 決済・E コマース

- **決済プロセッサー:** Stripe (カード、デジタルウォレット)
- **商品管理:** カスタム管理者インターフェース
- **注文処理:** 自動化された履行システム
- **顧客管理:** 統合された実用的な CRM（小規模ビジネス向け）機能

#### インフラストラクチャ

- **ホスティング:** Vercel (Edge Network、グローバル CDN)
- **CI/CD:** GitHub Actions + Vercel 統合
- **モニタリング:** Vercel Analytics + カスタムログ
- **セキュリティ:** HTTPS、CSP、CORS ポリシー

---

## データベーススキーマ

### コアテーブル

#### users (Supabase Auth から拡張)

```sql
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    biography TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### products

```sql
CREATE TABLE public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url TEXT,
    category TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### product_purchases

```sql
CREATE TABLE public.product_purchases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id),
    product_id UUID REFERENCES public.products(id),
    stripe_payment_intent_id TEXT,
    amount DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### contacts

```sql
CREATE TABLE public.contacts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'new',
    is_replied BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### セキュリティポリシー (RLS)

```sql
-- Products: 公開読み取り、管理者書き込み
CREATE POLICY "Products are viewable by everyone" ON products
    FOR SELECT USING (true);

CREATE POLICY "Products are insertable by admin" ON products
    FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Purchases: ユーザーは自分の購入のみ閲覧可能
CREATE POLICY "Users can view own purchases" ON product_purchases
    FOR SELECT USING (auth.uid() = user_id);

-- Contacts: 管理者のみ
CREATE POLICY "Contacts are viewable by admin" ON contacts
    FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');
```

---

## 認証・認可

### ユーザーロール

1. **匿名ユーザー:** 商品閲覧、ポートフォリオ表示
2. **認証済みユーザー:** 商品購入、プロフィール管理
3. **管理者ユーザー:** フルシステムアクセス、コンテンツ管理

### セキュリティ機能

- **JWT ベース認証** 自動リフレッシュ付き
- **Row Level Security (RLS)** データ分離
- **CORS ポリシー** API 保護
- **入力検証** とサニタイゼーション
- **レート制限** API エンドポイント

### セッション管理

```typescript
interface AuthContext {
	user: User | null;
	signIn: (email: string, password: string) => Promise<void>;
	signUp: (email: string, password: string) => Promise<void>;
	signOut: () => Promise<void>;
	isAdmin: (user: User) => boolean;
}
```

---

## 決済統合

### Stripe 実装

```typescript
// Stripe決済処理
const processPayment = async (amount: number, currency: string) => {
	const paymentIntent = await stripe.paymentIntents.create({
		amount,
		currency,
		automatic_payment_methods: {
			enabled: true,
		},
	});

	return paymentIntent;
};
```

### 決済フロー

1. **商品選択** → ユーザーが商品を選択
2. **決済開始** → Stripe Payment Intent 作成
3. **決済処理** → クライアントサイドで決済完了
4. **注文記録** → データベースに購入記録保存
5. **デジタル配信** → 即座にデジタルコンテンツアクセス提供

---

## API 設計

### RESTful API

#### 商品管理

```http
GET /api/products          # 商品一覧取得
GET /api/products/:id       # 商品詳細取得
POST /api/products          # 商品作成（管理者）
PUT /api/products/:id       # 商品更新（管理者）
DELETE /api/products/:id    # 商品削除（管理者）
```

#### ユーザー管理

```http
GET /api/profile            # プロフィール取得
PUT /api/profile            # プロフィール更新
POST /api/avatar            # アバターアップロード
```

#### 決済処理

```http
POST /api/payments/create   # 決済Intent作成
POST /api/payments/confirm  # 決済確認
GET /api/purchases          # 購入履歴取得
```

### リアルタイム機能

```typescript
// Supabaseリアルタイムサブスクリプション
const subscription = supabase
	.channel("products")
	.on(
		"postgres_changes",
		{ event: "*", schema: "public", table: "products" },
		(payload) => {
			console.log("商品更新:", payload);
		}
	)
	.subscribe();
```

---

## デプロイメント

### Vercel 設定

```json
{
	"version": 2,
	"builds": [
		{
			"src": "package.json",
			"use": "@vercel/static-build",
			"config": {
				"distDir": "dist"
			}
		}
	],
	"routes": [
		{
			"src": "/(.*)",
			"dest": "/index.html"
		}
	]
}
```

### 環境変数

```bash
# Supabase設定
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe設定
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# Notion設定
VITE_NOTION_TOKEN=your_notion_token
VITE_NOTION_PARENT_PAGE_ID=your_notion_parent_page_id
```

### CI/CD パイプライン

1. **コードプッシュ** → GitHub リポジトリ
2. **自動テスト** → Playwright テスト実行
3. **ビルド** → Vite ビルドプロセス
4. **デプロイ** → Vercel 自動デプロイ
5. **検証** → 本番環境テスト

---

## セキュリティ考慮事項

### データ保護

- **暗号化:** 転送時・保存時の暗号化
- **アクセス制御:** RLS による行レベルセキュリティ
- **入力検証:** クライアント・サーバーサイド両方での検証
- **セッション管理:** 安全な JWT トークン管理

### 監査とログ

```typescript
// セキュリティログ
const logSecurityEvent = (event: string, userId?: string) => {
	console.log(
		`[SECURITY] ${event} - User: ${userId} - Time: ${new Date().toISOString()}`
	);
};
```

---

## パフォーマンス最適化

### フロントエンド最適化

- **コード分割:** React.lazy()による遅延読み込み
- **画像最適化:** WebP 形式、遅延読み込み
- **キャッシュ戦略:** Service Worker、HTTP キャッシュ
- **バンドル最適化:** Tree shaking、minification

### バックエンド最適化

- **データベース:** インデックス最適化、クエリ最適化
- **CDN:** Vercel Edge Network 活用
- **キャッシュ:** Redis、メモリキャッシュ
- **非同期処理:** バックグラウンドジョブ

---

## 監視とメトリクス

### パフォーマンス監視

```typescript
// パフォーマンスメトリクス
const trackPerformance = (metric: string, value: number) => {
	// Vercel Analytics送信
	analytics.track(metric, { value });
};
```

### エラー監視

- **フロントエンド:** エラーバウンダリー、コンソールログ
- **バックエンド:** Supabase ログ、カスタムエラーハンドリング
- **外部サービス:** Stripe Webhook、Notion API 監視

---

## 今後の拡張計画

### 短期目標（3 ヶ月）

- [ ] 多言語対応の拡張
- [ ] モバイルアプリ開発
- [ ] 高度な分析機能
- [ ] 自動化されたマーケティング機能

### 中期目標（6 ヶ月）

- [ ] AI 機能の統合
- [ ] サブスクリプション機能
- [ ] 高度な CRM 機能
- [ ] マルチテナント対応

### 長期目標（12 ヶ月）

- [ ] エンタープライズ機能
- [ ] 高度なセキュリティ機能
- [ ] グローバル展開
- [ ] パートナーエコシステム

---

## 結論

Portfolio Showcase Version 2.0 は、最新の技術スタックとベストプラクティスを採用した、スケーラブルで安全な E コマースプラットフォームです。この技術文書に基づいて、実用的なデプロイメントと運用を実現できます。

### 技術サポート

- **開発チーム:** dev@your-domain.com
- **技術ドキュメント:** [技術文書リポジトリ]
- **API 仕様書:** [API 仕様書]
- **ユーザーガイド:** [ユーザーガイド]

---

**ドキュメントバージョン:** 2.0
**最終更新:** 2025 年 1 月
**次回更新予定:** 機能追加時
