# Portfolio Showcase デプロイメントガイド

## 概要

Portfolio Showcase チャットボットの本番環境へのデプロイ手順と運用管理について説明します。

## 現在のシステム構成

### フロントエンド

- **フレームワーク**: React + TypeScript
- **ホスティング**: Vercel
- **ビルド**: Vite

### バックエンド

- **チャットボット**: FastAPI (Python) — Vercel Serverless Function
  （`api/chat/`。`config.py`/`main.py`/`schemas/`/`services/`/`repositories/`/`routers/`に責務分割済み。`index.py`はVercelのエントリポイントとして`main.py`の`app`を再exportするのみ）
- **データベース**: Supabase PostgreSQL
- **認証**: Supabase Auth

> 以前は Supabase Edge Functions (Deno) でチャットボットを実装していたが、Python/FastAPI/LangChainへ移行済み。`supabase/functions/chat/`は現在使用されていない。

### AI/ML

- **モデル**: GPT-4o-mini
- **統合**: OpenAI API + LangChain（意図分析・RAG）

## デプロイメント手順

### 1. コード変更のコミット

```bash
git add .
git commit -m "変更内容の説明"
git push origin main
```

### 2. CI/CDパイプラインの確認

`main`へのpushで`.github/workflows/ci.yml`が実行され、以下がすべて成功した場合のみ本番へデプロイされる（テスト失敗時はデプロイされない）：

```text
Type Check → Lint → Build → Unit Test(Vitest) → E2E(Playwright) → Security Scan → Deploy
```

### 3. Vercelデプロイの確認

- GitHub Actionsの`deploy`ジョブがVercelへデプロイ
- `api/chat`（FastAPI）・`api/gorse-proxy`（Gorseプロキシ）ともにVercel Functionsとしてデプロイされる

### 4. 環境変数の確認

- `OPENAI_API_KEY`
- `SUPABASE_URL` / `VITE_SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY`
- `ALLOWED_ORIGINS`（FastAPI CORS許可Origin）
- `GORSE_ENDPOINT` / `GORSE_API_KEY`（`api/gorse-proxy`用）

## 運用管理

### 監視項目

- **チャットボット応答時間**
- **OpenAI API 使用量**
- **エラー率**
- **ユーザー満足度**

### ログ確認

Vercelダッシュボードの「Logs」タブ、またはVercel CLIの`vercel logs`でFunctionのログを確認する（Supabase Edge Functionsは現在使用していない）。

### パフォーマンス最適化

- **モデル選択**: GPT-4o-mini（コスト効率）
- **キャッシュ活用**: 応答キャッシュ
- **エラーハンドリング**: フォールバック応答

## トラブルシューティング

### よくある問題

1. **認証エラー**: トークンの有効性確認
2. **API 制限**: OpenAI API 使用量確認
3. **応答遅延**: モデル変更検討

### 緊急対応

- **強制応答システム**: 外部商品推奨防止
- **フォールバック**: 安全な応答保証
- **ロールバック**: 前バージョンへの復旧

## セキュリティ

### アクセス制御

- **認証必須**: 全 API エンドポイント
- **CORS 設定**: 適切なオリジン制限
- **API 制限**: レート制限実装

### データ保護

- **個人情報**: 暗号化保存
- **ログ管理**: 機密情報除外
- **監査ログ**: アクセス記録

## 今後の改善計画

> LangChainによるRAG機能（商品情報のベクトル検索）は実装済み（`api/chat/services/retrieval.py`）。以下は未実装の今後の検討事項。

- **会話履歴**: 文脈保持機能
- **Agent 機能**: 動的応答生成

### スケーラビリティ

- **負荷分散**: 複数インスタンス
- **キャッシュ戦略**: Redis 統合
- **CDN 活用**: 静的コンテンツ配信
