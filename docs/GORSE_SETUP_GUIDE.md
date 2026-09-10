# Gorse 推薦システム セットアップガイド

このガイドでは、React + TypeScript + Supabase + Vercel 構成で Gorse 推薦エンジンを導入する手順を説明します。

## 📋 前提条件

- Docker & Docker Compose がインストールされていること
- Node.js 18+ がインストールされていること
- Supabase プロジェクトが設定済みであること

## 🚀 クイックスタート

### 1. 環境変数の設定

`.env` ファイルに以下の環境変数を追加してください：

```env
# Gorse推薦システム設定（開発時のクライアント直接アクセス用）
VITE_GORSE_ENDPOINT=http://localhost:8087

# サーバーサイド用（api/gorse-proxy、本番はこちら経由でアクセスする）
GORSE_ENDPOINT=http://localhost:8087
GORSE_API_KEY=
```

**注意**: このプロジェクトはVite + Reactを使用しているため、クライアント側で使用する環境変数には `VITE_` プレフィックスが必要です。本番環境では `src/lib/gorse.ts` がクライアントから直接Gorseを叩かず、`/gorse-api` 経由でVercel Function（`api/gorse-proxy`）にリクエストします（後述）。

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
   - 環境変数 `VITE_GORSE_ENDPOINT`（開発時）または `GORSE_ENDPOINT`（`api/gorse-proxy`用）が正しく設定されているか確認

### ログの確認

```bash
# 全サービスのログ
docker-compose -f docker-compose.gorse.yml logs -f

# 特定サービスのログ
docker-compose -f docker-compose.gorse.yml logs -f gorse-master
docker-compose -f docker-compose.gorse.yml logs -f gorse-server
```

## 🚀 本番環境への展開

### Vercel Function経由のサーバーサイドプロキシ

本番環境ではクライアントから直接Gorseサーバーへはアクセスせず、`api/gorse-proxy`（Vercel Function）を経由します（[api/gorse-proxy/index.ts](../api/gorse-proxy/index.ts)）。

- `vercel.json`の`/gorse-api/api/:path*`リライトが`api/gorse-proxy`へ転送
- ログイン済みユーザーはSupabaseユーザーID、未ログインはIPアドレスを識別子として、Supabase上でリクエスト数を原子的にカウントし、サーバー側で実効性のあるレート制限をかける（クライアント側のlocalStorageベースの制限だけでは、ユーザーが削除・改ざんして回避できてしまうため）
- Vercelの環境変数に `GORSE_ENDPOINT` / `GORSE_API_KEY` / `SUPABASE_SERVICE_ROLE_KEY` を設定する

> かつて `supabase/functions/gorse-feedback/` というSupabase Edge Functionが存在しましたが、フロントエンドのどこからも呼び出されていない未使用のコードだったため削除済みです。フィードバック送信は `src/lib/gorse.ts` → `/gorse-api` 経由で行われます。

### セキュリティ設定

本番環境では必ず以下を設定してください：

1. **Gorse API Key** の設定
2. **CORS 設定** の制限
3. **PostgreSQL 認証** の強化
4. **Redis 認証** の設定
5. **サーバーサイドレート制限**（`api/gorse-proxy`のSupabaseベースのカウント）の環境変数設定

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
