# 環境変数設定ガイド

このドキュメントでは、プロジェクトで使用する環境変数について説明します。

## セットアップ

1. プロジェクトルートに `.env` ファイルを作成
2. 以下の環境変数を設定

## 必須の環境変数

### Supabase Configuration

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### Stripe Configuration

```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key-here
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key-here
```

### Admin Configuration

```bash
VITE_ADMIN_EMAILS=admin@example.com,another-admin@example.com
```

### OpenAI Configuration

```bash
OPENAI_API_KEY=sk-your-openai-api-key-here
```

## オプションの環境変数

### Vercel Configuration

```bash
VERCEL_TOKEN=your-vercel-token-here
```

### Notion Configuration

```bash
NOTION_API_KEY=secret_your-notion-api-key-here
NOTION_DATABASE_ID=your-notion-database-id-here
```

### Gorse Recommendation System

```bash
GORSE_API_URL=http://localhost:8087
GORSE_API_KEY=your-gorse-api-key-here
```

### AWS Configuration

```bash
AWS_ACCESS_KEY_ID=AKIA_YOUR_ACCESS_KEY_ID_HERE
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key-here
AWS_REGION=ap-northeast-1
```

### Python API Configuration

```bash
PYTHONUNBUFFERED=1
PORT=8000
```

### Development

```bash
NODE_ENV=development
DEBUG=false
```

## セキュリティに関する注意事項

⚠️ **重要**: 環境変数ファイル（`.env`）は絶対にGitにコミットしないでください。

- `.env` ファイルは `.gitignore` に含まれています
- 機密情報をコードにハードコードしないでください
- 本番環境の認証情報は環境変数経由で設定してください
- GitHub Secretsを使用してCI/CD環境で環境変数を管理してください

## 環境変数の取得方法

### Supabase
1. [Supabaseダッシュボード](https://app.supabase.com/)にログイン
2. プロジェクトを選択
3. Settings > API から `URL` と `anon/public key` を取得

### Stripe
1. [Stripeダッシュボード](https://dashboard.stripe.com/)にログイン
2. Developers > API keys から取得

### OpenAI
1. [OpenAI Platform](https://platform.openai.com/)にログイン
2. API keys から新しいキーを生成

### Vercel
1. [Vercelダッシュボード](https://vercel.com/dashboard)にログイン
2. Settings > Tokens から新しいトークンを生成

### Notion
1. [Notion Integrations](https://www.notion.so/my-integrations)にアクセス
2. 新しいIntegrationを作成してAPIキーを取得
