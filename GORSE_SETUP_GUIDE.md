# Gorse 推薦システム セットアップガイド

このガイドでは、React + TypeScript + Supabase + Vercel 構成で Gorse 推薦エンジンを導入する手順を説明します。

## 📋 前提条件

- Docker & Docker Compose がインストールされていること
- Node.js 18+ がインストールされていること
- Supabase プロジェクトが設定済みであること

## 🚀 クイックスタート

### 1. 環境変数の設定

`.env.local` ファイルを作成し、以下の環境変数を設定してください：

```env
# Gorse推薦システム設定
NEXT_PUBLIC_GORSE_ENDPOINT=http://localhost:8087
GORSE_API_KEY=

# Supabase Edge Function用（本番環境のみ）
GORSE_ENDPOINT=http://localhost:8087
```

### 2. Gorse 環境の起動

```bash
# Gorse Docker環境の起動
docker-compose -f docker-compose.gorse.yml up -d

# ログの確認
docker-compose -f docker-compose.gorse.yml logs -f

# ヘルスチェック
curl http://localhost:8088/api/health
```

### 3. 初期データの同期

React アプリケーションを起動後、開発者ツールのコンソールで以下を実行：

```javascript
// 商品データをGorseに同期
import { useGorseSync } from "./src/hooks/useGorseSync";
const { syncAllProductsToGorse } = useGorseSync();
await syncAllProductsToGorse();
```

## 🔧 サービス構成

### ポート配置

| サービス     | ポート | 用途             |
| ------------ | ------ | ---------------- |
| Gorse Master | 8086   | 管理 API         |
| Gorse Server | 8087   | 推薦 API         |
| Gorse Web UI | 8088   | 管理画面         |
| Redis        | 6379   | キャッシュ       |
| PostgreSQL   | 5433   | データストレージ |

### アクセス URL

- **Gorse Web UI**: http://localhost:8088
- **推薦 API**: http://localhost:8087/api
- **管理 API**: http://localhost:8086/api

## 📚 使用方法

### 1. 推薦の取得

```typescript
import { useRecommendations } from "./src/hooks/useRecommendations";

const { recommendations, isLoading } = useRecommendations({
	maxItems: 10,
	autoFetch: true,
});
```

### 2. フィードバックの送信

```typescript
import { useGorseFeedback } from "./src/hooks/useGorseFeedback";

const { sendPurchaseFeedback, sendLikeFeedback } = useGorseFeedback();

// 購入フィードバック
await sendPurchaseFeedback("product-id");

// いいねフィードバック
await sendLikeFeedback("product-id");
```

### 3. 類似商品の表示

```typescript
import { SimilarProductsList } from "./src/components/recommendations/SimilarProductsList";

<SimilarProductsList productId="product-id" title="関連商品" maxItems={4} />;
```

## 🎯 推薦コンポーネント

### RecommendationList

ユーザー向けパーソナライズ推薦を表示：

```tsx
import { RecommendationList } from "./src/components/recommendations/RecommendationList";

<RecommendationList
	title="あなたにおすすめ"
	maxItems={8}
	fallbackProducts={popularProducts}
/>;
```

### SimilarProductsList

特定商品の類似商品を表示：

```tsx
<SimilarProductsList productId={product.id} title="類似商品" maxItems={4} />
```

## ⚙️ 設定のカスタマイズ

### Gorse 設定ファイル

`gorse-config.toml` で推薦アルゴリズムの設定をカスタマイズできます：

```toml
[recommend.data_source]
positive_feedback_types = ["purchase", "like"]
read_feedback_types = ["view"]

[recommend.collaborative]
model_fit_period = "60m"  # モデル更新間隔
```

### フィードバックタイプ

以下のフィードバックタイプがサポートされています：

- `purchase`: 購入（重要度: 高）
- `like`: いいね（重要度: 中）
- `view`: 閲覧（重要度: 低）
- `cart`: カート追加（重要度: 中）

## 🛠️ トラブルシューティング

### よくある問題

1. **Gorse が起動しない**

   ```bash
   # コンテナの状態確認
   docker-compose -f docker-compose.gorse.yml ps

   # ログの確認
   docker-compose -f docker-compose.gorse.yml logs gorse-master
   ```

2. **推薦が返ってこない**

   - フィードバックデータが不足している可能性があります
   - Gorse Web UI (http://localhost:8088) でデータを確認してください

3. **CORS エラー**
   - 環境変数 `NEXT_PUBLIC_GORSE_ENDPOINT` が正しく設定されているか確認

### ログの確認

```bash
# 全サービスのログ
docker-compose -f docker-compose.gorse.yml logs -f

# 特定サービスのログ
docker-compose -f docker-compose.gorse.yml logs -f gorse-master
docker-compose -f docker-compose.gorse.yml logs -f gorse-server
```

## 🚀 本番環境への展開

### Supabase Edge Function

本番環境では Supabase Edge Function を使用してフィードバックを送信：

```bash
# Edge Functionのデプロイ
supabase functions deploy gorse-feedback

# 環境変数の設定
supabase secrets set GORSE_ENDPOINT=https://your-gorse-server.com
supabase secrets set GORSE_API_KEY=your-api-key
```

### セキュリティ設定

本番環境では必ず以下を設定してください：

1. **Gorse API Key** の設定
2. **CORS 設定** の制限
3. **PostgreSQL 認証** の強化
4. **Redis 認証** の設定

## 📊 モニタリング

### Gorse Web UI での確認項目

- フィードバック数の推移
- 推薦精度の指標
- システムリソースの使用量
- エラーログの確認

### API ヘルスチェック

```bash
# Gorse Server
curl http://localhost:8087/api/health

# Gorse Master
curl http://localhost:8086/api/health
```

## 📖 参考資料

- [Gorse 公式ドキュメント](https://gorse.io/)
- [gorsejs TypeScript SDK](https://github.com/gorse-io/gorse-js)
- [Docker Compose リファレンス](https://docs.docker.com/compose/)

---

何か問題が発生した場合は、まずログを確認し、必要に応じてコンテナを再起動してください。
