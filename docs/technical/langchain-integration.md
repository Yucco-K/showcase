# LangChain 統合技術ドキュメント

## 概要

Portfolio Showcase チャットボットへの LangChain 統合による RAG（Retrieval-Augmented Generation）機能の実装計画。

## 現在のシステム

### 完全制御チャットボット

- **モデル**: GPT-4.1-mini
- **環境**: Deno (Supabase Edge Functions)
- **特徴**: 強制的 Portfolio 商品推奨システム

### 既存機能

- 強制応答ラッパー
- 最終安全チェック
- 外部商品排除システム

## LangChain 統合計画

### Phase 1: ベクトルデータベース構築

```typescript
// Supabase pgvector拡張を使用
// 商品情報の埋め込み生成と保存
```

### Phase 2: RAG 機能実装

```typescript
// LangChain Retriever統合
// 商品情報の動的検索
```

### Phase 3: 会話履歴管理

```typescript
// LangGraphによる文脈保持
// ユーザー嗜好の学習
```

## 技術仕様

### 必要な依存関係

- OpenAI Embeddings API
- Supabase pgvector
- LangChain.js (Deno 対応版)

### アーキテクチャ

```
ユーザー入力 → 完全制御チェック → LangChain RAG → 応答生成
```

## 実装タスクリスト

### ✅ 完了済みタスク

1. **商品データの準備**

   - ✅ Supabase products テーブルからデータ取得
   - ✅ `docs/products/products_database.md`として整理
   - ✅ 30 件の商品データを構造化

2. **ベクトルデータベース構築**

   - ✅ Supabase pgvector テーブル設計
   - ✅ `product_embeddings`テーブル作成マイグレーション
   - ✅ 類似商品検索関数`match_products`実装
   - ✅ RLS ポリシー設定

3. **埋め込み生成システム**
   - ✅ 商品データ埋め込み生成スクリプト作成
   - ✅ OpenAI Embeddings API 統合
   - ✅ 商品検索機能テストスクリプト作成

### 🔄 進行中タスク

4. **商品・FAQ データのベクトル化**
   - 🔄 商品データの埋め込み生成実行
   - 🔄 FAQ データの準備とベクトル化
   - 🔄 ベクトル検索の精度テスト

### 📋 未着手タスク

5. **LangChain Retriever/QA チェーンの PoC 実装**

   - 📋 LangChain.js の Deno 環境での動作確認
   - 📋 埋め込み生成システム構築
   - 📋 ベクトル検索機能実装
   - 📋 商品情報検索の精度テスト

6. **チャットボット API への LangChain 統合**

   - 📋 既存チャットボットとの統合
   - 📋 完全制御システムとの連携
   - 📋 応答品質の検証

7. **テスト・品質検証・本番反映**
   - 📋 統合テストの実行
   - 📋 パフォーマンス最適化
   - 📋 本番環境への反映

## 次のステップ

### 即座に実行可能なタスク

1. **商品埋め込みデータの生成実行**

   ```bash
   # 環境変数設定後
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

## 作成されたファイル

### マイグレーション

- `supabase/migrations/20250127000000_create_product_embeddings_table.sql`

### スクリプト

- `scripts/generate-product-embeddings.ts` - 商品埋め込み生成
- `scripts/test-product-search.ts` - 商品検索機能テスト

### ドキュメント

- `docs/products/products_database.md` - 商品データベース
- `docs/technical/langchain-integration.md` - 統合技術ドキュメント

## 注意事項

- 既存の完全制御システムを維持
- 段階的な統合でリスク最小化
- コスト効率の考慮
- 商品推奨の精度向上を最優先
