# Portfolio Showcase

React・TypeScript で構築されたポートフォリオサイトです。Supabase バックエンド、Stripe 決済、Notion 連携機能を備えています。

## 機能

- 📱 レスポンシブデザイン
- 🔐 Supabase 認証
- 💳 Stripe 決済
- 📝 ブログ機能
- 🛍️ プロダクト管理
- 📞 お問い合わせ管理
- 🔗 Notion 連携

## セットアップ

### 環境変数の設定

`.env`ファイルを作成し、以下の環境変数を設定してください：

```bash
# Supabase設定
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Stripe設定
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here

# Notion設定
VITE_NOTION_TOKEN=your_notion_internal_integration_token_here
VITE_NOTION_DATABASE_ID=your_notion_database_id_here
```

### Notion 連携の設定

1. [Notion Developers](https://developers.notion.com/) でインテグレーションを作成
2. Internal Integration Token を取得
3. 連携したいデータベースをインテグレーションと共有
4. データベース ID を取得（URL から抽出）

### インストールと起動

```bash
npm install
npm run dev
```

## 技術スタック

- **フロントエンド**: React, TypeScript, Vite
- **スタイリング**: Styled Components
- **バックエンド**: Supabase
- **決済**: Stripe
- **CMS**: Notion API
- **デプロイ**: Vercel
