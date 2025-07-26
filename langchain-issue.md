# LangChain 統合による商品推奨精度向上機能の実装

## 概要

Portfolio Showcase チャットボットに LangChain 統合による RAG（Retrieval-Augmented Generation）機能を実装し、商品推奨の精度向上を図ります。

## 背景

現在のチャットボットは強制的な商品推奨システムを採用していますが、ユーザーの具体的なニーズに応じた適切な商品推奨ができていません。LangChain 統合により、商品データのベクトル検索機能を追加し、より精度の高い商品推奨を実現します。

## 実装内容

### Phase 1: ベクトルデータベース構築 ✅

- [x] Supabase pgvector テーブル設計
- [x] `product_embeddings`テーブル作成マイグレーション
- [x] 類似商品検索関数`match_products`実装
- [x] RLS ポリシー設定

### Phase 2: 埋め込み生成システム ✅

- [x] 商品データ埋め込み生成スクリプト作成
- [x] OpenAI Embeddings API 統合
- [x] 商品検索機能テストスクリプト作成

### Phase 3: 商品・FAQ データのベクトル化 🔄

- [ ] 商品データの埋め込み生成実行
- [ ] FAQ データの準備とベクトル化
- [ ] ベクトル検索の精度テスト

### Phase 4: LangChain Retriever/QA チェーンの PoC 実装 📋

- [ ] LangChain.js の Deno 環境での動作確認
- [ ] 埋め込み生成システム構築
- [ ] ベクトル検索機能実装
- [ ] 商品情報検索の精度テスト

### Phase 5: チャットボット API への LangChain 統合 📋

- [ ] 既存チャットボットとの統合
- [ ] 完全制御システムとの連携
- [ ] 応答品質の検証

### Phase 6: テスト・品質検証・本番反映 📋

- [ ] 統合テストの実行
- [ ] パフォーマンス最適化
- [ ] 本番環境への反映

## 技術仕様

### 必要な依存関係

- OpenAI Embeddings API
- Supabase pgvector
- LangChain.js (Deno 対応版)

### アーキテクチャ

```
ユーザー入力 → 完全制御チェック → LangChain RAG → 応答生成
```

## 作成されたファイル

### マイグレーション

- `supabase/migrations/20250127000000_create_product_embeddings_table.sql`

### スクリプト

- `scripts/generate-product-embeddings.ts` - 商品埋め込み生成
- `scripts/test-product-search.ts` - 商品検索機能テスト

### ドキュメント

- `docs/products/products_database.md` - 商品データベース
- `docs/technical/langchain-integration.md` - 統合技術ドキュメント

## 次のステップ

1. **商品埋め込みデータの生成実行**

   ```bash
   deno run --allow-net --allow-env scripts/generate-product-embeddings.ts
   ```

2. **Supabase マイグレーション実行**

   ```bash
   supabase db push
   ```

3. **商品検索機能のテスト実行**
   ```bash
   deno run --allow-net --allow-env scripts/test-product-search.ts
   ```

## 期待される効果

- ユーザーの具体的なニーズに応じた商品推奨
- 商品推奨の精度向上
- チャットボットの応答品質向上
- 売上向上への貢献

## 注意事項

- 既存の完全制御システムを維持
- 段階的な統合でリスク最小化
- コスト効率の考慮
- 商品推奨の精度向上を最優先
