# Portfolio Showcase デプロイメントガイド

## 概要

Portfolio Showcase チャットボットの本番環境へのデプロイ手順と運用管理について説明します。

## 現在のシステム構成

### フロントエンド

- **フレームワーク**: React + TypeScript
- **ホスティング**: Vercel/Netlify
- **ビルド**: Vite

### バックエンド

- **チャットボット**: Supabase Edge Functions (Deno)
- **データベース**: Supabase PostgreSQL
- **認証**: Supabase Auth

### AI/ML

- **モデル**: GPT-4.1-mini
- **統合**: OpenAI API

## デプロイメント手順

### 1. コード変更のコミット

```bash
git add .
git commit -m "変更内容の説明"
git push origin main
```

### 2. 自動デプロイの確認

- Vercel/Netlify が自動的にデプロイを開始
- ビルドログでエラーがないことを確認

### 3. Supabase Functions のデプロイ

```bash
supabase functions deploy chat
```

### 4. 環境変数の確認

- `OPENAI_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## 運用管理

### 監視項目

- **チャットボット応答時間**
- **OpenAI API 使用量**
- **エラー率**
- **ユーザー満足度**

### ログ確認

```bash
# Supabase Functions ログ
supabase functions logs chat

# リアルタイムログ
supabase functions logs chat --follow
```

### パフォーマンス最適化

- **モデル選択**: GPT-4.1-mini（コスト効率）
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

### LangChain 統合

- **RAG 機能**: 商品情報検索強化
- **会話履歴**: 文脈保持機能
- **Agent 機能**: 動的応答生成

### スケーラビリティ

- **負荷分散**: 複数インスタンス
- **キャッシュ戦略**: Redis 統合
- **CDN 活用**: 静的コンテンツ配信
