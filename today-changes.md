# 2025 年 7 月 25 日〜26 日の変更内容

## 高機能 FAQ チャットボットの実装

### OpenAI API 統合によるインテリジェントチャット機能

- **ファイル**: `src/components/ChatBot.tsx`, `supabase/functions/chat/index.ts`, `src/api/chat.ts`
- **変更内容**:
  - ChatGPT-4 を使用した AI アシスタント機能
  - Supabase Edge Functions でサーバーレス実装
  - OpenAI API との安全な統合
  - ストリーミング対応とエラーハンドリング

```typescript
// OpenAI API呼び出しの実装例
const completion = await openai.chat.completions.create({
	model: "gpt-4",
	messages: [
		{
			role: "system",
			content:
				"あなたは親切で知識豊富なアシスタントです。日本語で回答してください。",
		},
		{
			role: "user",
			content: userMessage,
		},
	],
	max_tokens: 500,
	temperature: 0.7,
});
```

### 5 分間自動タイムアウト機能

- **実装内容**:
  - 5 分間の非活動でチャット自動クローズ
  - 30 秒前の警告表示
  - タイマーリセット機能
  - フェードアウトアニメーション付きクローズ

```typescript
// タイムアウト管理の実装
const resetTimeout = useCallback(() => {
	// 30秒前警告タイマー
	warningTimeoutRef.current = setTimeout(() => {
		setShowTimeoutWarning(true);
	}, 4.5 * 60 * 1000); // 4分30秒後

	// 5分後に自動クローズ
	timeoutRef.current = setTimeout(() => {
		setIsClosing(true);
		setTimeout(() => {
			setIsOpen(false);
		}, 2000);
	}, 5 * 60 * 1000);
}, []);
```

### 人気 FAQ 質問タグのクイックアクセス機能

- **ファイル**: `src/data/faq.ts`
- **変更内容**:
  - 15 個の FAQ 質問データベース
  - 人気度による自動ソート機能
  - ワンクリックで質問と回答を表示
  - カテゴリ別の質問分類

```typescript
// FAQ データ構造
export interface FAQ {
	id: string;
	question: string;
	answer: string;
	category: "basic" | "payment" | "account" | "technical" | "policy";
	popularity: number; // 人気度スコア
}

// 人気FAQの取得
export function getPopularFAQs(limit: number = 5): FAQ[] {
	return faqs.sort((a, b) => b.popularity - a.popularity).slice(0, limit);
}
```

### チャット画面リセット機能

- **実装内容**:
  - チャット閉鎖時の完全な状態リセット
  - メッセージ履歴のクリア
  - タイマー状態のリセット
  - 次回開始時の初期化

### ユーザーアバター表示機能

- **変更内容**:
  - プロフィール画像の動的表示
  - アバター未設定時の人形アイコン表示
  - AuthProvider との連携
  - レスポンシブ対応

```typescript
// アバター表示の実装
<div className="icon">
	{msg.role === "user" ? (
		profile?.avatar_url ? (
			<UserAvatar src={profile.avatar_url} alt="You" />
		) : (
			<IconUser size={18} />
		)
	) : (
		<IconRobot size={18} />
	)}
</div>
```

### メッセージのデータベース保存機能

- **実装内容**:
  - user_id、session_id 付きメッセージ保存
  - 匿名ユーザー対応
  - セッション管理による会話分離
  - エラーハンドリングとフォールバック

### 管理者権限制御

- **変更内容**:
  - 管理者のみアクセス可能
  - 権限チェック機能
  - 非管理者への表示制限

## Information ページの大幅改善

### UI/UX の最適化

- **ファイル**: `src/pages/Information.tsx`
- **変更内容**:
  - 背景シャボン玉の削除（クリーンな見た目）
  - 編集ボタンを薄いオレンジ色に変更
  - 文字色を白からこげ茶色に変更（読みやすさ向上）
  - 編集フォームからタイトル入力欄削除
  - タブの視認性向上
  - 編集入力欄とプレビュー表示の縦拡大

### モバイルパフォーマンス最適化

- **ファイル**: `src/components/BubbleScene.tsx`, `src/pages/Top.tsx`
- **変更内容**:
  - モバイルでアニメーションシャボン玉を静止画版に置換
  - PC 版は変更なしでフルアニメーション維持
  - モバイル Top ページから YuccoCat コンポーネント削除
  - レスポンシブ画面サイズ検出追加

```typescript
// モバイル最適化の実装
const [isMobile, setIsMobile] = useState(false);

useEffect(() => {
	const checkMobile = () => {
		setIsMobile(window.innerWidth <= 768);
	};

	checkMobile();
	window.addEventListener("resize", checkMobile);
	return () => window.removeEventListener("resize", checkMobile);
}, []);
```

### 技術的改善

- **実装内容**:
  - スケルトン表示の追加
  - スクロール位置保持機能
  - モーダルスクロール処理改善
  - 適切な SSR 処理実装

## マーケティングダッシュボードの改善

### 集計ロジック修正と UI 機能追加

- **ファイル**: `src/components/admin/MarketingDashboard.tsx`
- **変更内容**:
  - Gorse API との実データ連携
  - フィードバック統計の正確な集計
  - レコメンデーション指標の改善
  - スクロール位置保持機能の追加

### コード品質向上

- **変更内容**:
  - ESLint エラーの修正
  - any 型の適切な型への変更
  - 未使用変数・import 削除
  - 型ガードの安全性向上

## 依存関係管理

### Zod 依存関係の競合解決

- **ファイル**: `package.json`, `package-lock.json`
- **変更内容**:
  - OpenAI SDK@5.10.2との互換性確保
  - Zod v4.0.5 から v3.25.76 へのダウングレード
  - peer dependency conflict (ERESOLVE)エラー解決
  - TypeScript 型チェック通過確認

```json
// package.json の変更
{
	"dependencies": {
		"openai": "^5.10.2",
		"zod": "^3.23.8" // v4.0.5から変更
	}
}
```

## デプロイメント

### Vercel 本番環境デプロイ

- **実行内容**:
  - プレビュー環境での動作確認
  - 本番環境への正常デプロイ
  - 依存関係エラーの解決
  - パフォーマンス最適化の確認

---

# Gorse 推薦システムの技術詳細

## 🏗️ アーキテクチャ概要

### システム構成

- **フロントエンド**: React + TypeScript + Vite
- **バックエンド**: Supabase (PostgreSQL + Edge Functions)
- **推薦エンジン**: Gorse (Go 言語製)
- **インフラ**: AWS EC2 + Docker + Nginx
- **デプロイ**: Vercel (フロントエンド) + EC2 (Gorse)

## 🚀 AWS EC2 + Docker + Nginx による本番環境構築

### 1. EC2 インスタンスの自動セットアップ

**ファイル**: `scripts/setup-gorse-ec2.sh`

```bash
# インスタンス仕様
INSTANCE_TYPE="t3.small"  # 2vCPU, 2GB RAM
AMI_ID="ami-00ea3690582cf02ee"  # Amazon Linux 2023
SECURITY_GROUP_NAME="gorse-sg"

# セキュリティグループ設定
- SSH (22): 0.0.0.0/0
- Gorse Master (8086): 0.0.0.0/0
- Gorse Server (8087): 0.0.0.0/0
- Gorse Web UI (8088): 0.0.0.0/0
```

### 2. Docker Compose による Gorse 環境構築

**ファイル**: `docker-compose.gorse.yml`

```yaml
services:
  # Redis (キャッシュ)
  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]

  # PostgreSQL (データストレージ)
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: gorse
      POSTGRES_USER: gorse
      POSTGRES_PASSWORD: gorsepassword
    ports: ["5433:5432"]

  # Gorse Master (管理API + Web UI)
  gorse-master:
    image: zhenghaoz/gorse-master:latest
    ports: ["8086:8086", "8088:8088"]

  # Gorse Server (推薦API)
  gorse-server:
    image: zhenghaoz/gorse-server:latest
    ports: ["8087:8087"]

  # Gorse Worker (推薦アルゴリズム実行)
  gorse-worker:
    image: zhenghaoz/gorse-worker:latest
    deploy:
      replicas: 1
```

### 3. Nginx + Let's Encrypt による HTTPS 化

**ファイル**: `scripts/setup-gorse-https.sh`

```nginx
# Nginxリバースプロキシ設定
server {
    listen 80;
    server_name gorse.example.com;

    location / {
        proxy_pass http://localhost:8086;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**自動 SSL 証明書取得**:

```bash
sudo certbot --nginx -d gorse.example.com --non-interactive
```

## 🧠 Gorse 推薦エンジンの設定と最適化

### 1. 推薦アルゴリズム設定

**ファイル**: `gorse-config.toml`

```toml
[recommend.data_source]
positive_feedback_types = ["purchase", "like"]  # 重要度: 高
read_feedback_types = ["view"]                  # 重要度: 低

[recommend.collaborative]
model_fit_period = "10m"        # モデル更新間隔
model_search_period = "60m"     # ハイパーパラメータ探索間隔
model_search_epoch = 5          # 学習エポック数
model_search_trials = 5         # 試行回数

[recommend.offline]
check_recommend_period = "30m"      # 推薦チェック間隔
refresh_recommend_period = "60m"    # 推薦更新間隔
enable_latest_recommend = true      # 最新商品推薦
enable_popular_recommend = true     # 人気商品推薦
enable_user_based_recommend = true  # ユーザーベース推薦
enable_item_based_recommend = true  # アイテムベース推薦
enable_collaborative_recommend = true # 協調フィルタリング
```

### 2. フィードバックタイプの定義

```typescript
export const FEEDBACK_TYPES = {
	PURCHASE: "purchase", // 購入 (重要度: 高)
	LIKE: "like", // いいね (重要度: 中)
	VIEW: "view", // 閲覧 (重要度: 低)
	CART: "cart", // カート追加 (重要度: 中)
} as const;
```

## 🔄 データ同期とフィードバックシステム

### 1. 商品データの自動同期

**ファイル**: `src/hooks/useGorseSync.ts`

```typescript
// 商品をGorseに同期
const syncProductToGorse = async (product: Product) => {
	const labels = [];
	const categories = [product.category];

	// 商品の特徴をラベルに追加
	if (product.isFeatured) labels.push("featured");
	if (product.isPopular) labels.push("popular");
	if (product.tags) labels.push(...product.tags);

	await insertItem(product.id, labels, categories);
};

// 一括同期（レート制限対応）
const syncProductsToGorse = async (products: Product[]) => {
	for (const product of products) {
		await syncProductToGorse(product);
		await new Promise((resolve) => setTimeout(resolve, 100)); // API制限回避
	}
};
```

### 2. リアルタイムフィードバック送信

**ファイル**: `src/hooks/useGorseFeedback.ts`

```typescript
// フィードバック送信の共通ロジック
const sendUserFeedback = async (
	itemId: string,
	feedbackType: FeedbackType,
	silent: boolean = false
) => {
	if (!user?.id) return false;

	try {
		await sendFeedback(user.id, itemId, feedbackType);
		return true;
	} catch (error) {
		console.error("Failed to send feedback:", error);
		return false;
	}
};

// 各種フィードバック送信
const sendPurchaseFeedback = async (productId: string) => {
	return await sendUserFeedback(productId, FEEDBACK_TYPES.PURCHASE);
};

const sendLikeFeedback = async (productId: string) => {
	return await sendUserFeedback(productId, FEEDBACK_TYPES.LIKE, true);
};
```

## 📊 レコメンデーション機能の実装

### 1. パーソナライズ推薦

**ファイル**: `src/hooks/useRecommendations.ts`

```typescript
// ユーザー向け推薦取得
const fetchRecommendations = async (config?: RecommendationConfig) => {
	if (!user?.id) {
		// ログインしていない場合はフォールバック商品を使用
		return fallbackProducts.slice(0, config?.maxItems || maxItems);
	}

	try {
		const items = await getRecommendations(
			user.id,
			config?.maxItems || maxItems
		);

		// 推薦結果がない場合はフォールバック
		if (items.length === 0 && fallbackProducts.length > 0) {
			return fallbackProducts.slice(0, config?.maxItems || maxItems);
		}

		return items;
	} catch (err) {
		console.error("Failed to fetch recommendations:", err);
		return fallbackProducts.slice(0, config?.maxItems || maxItems);
	}
};
```

### 2. 類似商品推薦

```typescript
// 類似商品取得（API + ローカルフォールバック）
const fetchSimilarItems = async (
	itemId: string,
	allProducts: Product[] = [],
	limit: number = 5
): Promise<string[]> => {
	try {
		const items = await getSimilarItems(itemId, allProducts, limit);
		return items;
	} catch (err) {
		// ローカルフォールバック: 同じカテゴリの商品
		const current = allProducts.find((p) => p.id === itemId);
		if (current) {
			return allProducts
				.filter((p) => p.id !== itemId && p.category === current.category)
				.slice(0, limit)
				.map((p) => p.id);
		}
		return [];
	}
};
```

### 3. 推薦コンポーネント

**ファイル**: `src/components/recommendations/RecommendationList.tsx`

```typescript
export const RecommendationList: React.FC<RecommendationListProps> = ({
	title = "あなたにおすすめ",
	maxItems = 8,
	fallbackProducts = [],
}) => {
	const { recommendations, isLoading, error, metadata } = useRecommendations({
		maxItems,
		fallbackProducts,
	});

	// 推薦されたIDに対応する商品データを取得
	const recommendedProducts = recommendations
		.map((id) => filteredProducts.find((p) => p.id === id))
		.filter((product): product is Product => product !== undefined)
		.slice(0, maxItems);

	return (
		<Container>
			<Title>
				{title}
				{metadata.isPersonalized && <span>(パーソナライズ済み)</span>}
			</Title>
			<Grid>
				{recommendedProducts.map((product) => (
					<ProductCard key={product.id} product={product} />
				))}
			</Grid>
		</Container>
	);
};
```

## 📈 マーケティング機能と分析

### 1. マーケティングダッシュボード

**ファイル**: `src/components/admin/MarketingDashboard.tsx`

```typescript
// Gorse APIとの連携による分析データ取得
const fetchGorseStats = async () => {
	try {
		// フィードバック統計
		const feedbackStats = await gorse.getFeedbackStats();

		// 推薦精度指標
		const recommendationStats = await gorse.getRecommendationStats();

		// ユーザー行動分析
		const userBehaviorStats = await gorse.getUserBehaviorStats();

		return {
			feedbackStats,
			recommendationStats,
			userBehaviorStats,
		};
	} catch (error) {
		console.error("Failed to fetch Gorse stats:", error);
		return null;
	}
};
```

### 2. 主要な分析指標

```typescript
// フィードバック統計
type FeedbackStats = {
	type: string;
	count: number;
};

// 推薦統計
type RecommendationStats = {
	productId: string;
	recommendationCount: number;
	clickCount: number;
	purchaseCount: number;
	clickRate: number;
	conversionRate: number;
};

// 購入時系列データ
type PurchaseTimeSeries = {
	date: string;
	count: number;
};
```

### 3. チャート表示

```typescript
// Chart.jsを使用した可視化
const renderFeedbackChart = (data: FeedbackStats[]) => {
	const chartData: ChartData<"bar"> = {
		labels: data.map((d) => d.type),
		datasets: [
			{
				label: "フィードバック数",
				data: data.map((d) => d.count),
				backgroundColor: "rgba(54, 162, 235, 0.5)",
			},
		],
	};

	return <Bar data={chartData} options={chartOptions} />;
};
```

## 🔧 運用とメンテナンス

### 1. 自動化スクリプト

**ファイル**: `scripts/` 配下の各種スクリプト

```bash
# EC2セットアップ自動化
./scripts/setup-gorse-ec2.sh

# Docker環境構築
./scripts/install-docker-gorse.sh

# HTTPS化
./scripts/setup-gorse-https.sh

# データ同期
./scripts/sync-data-to-gorse.sh

# API接続テスト
./scripts/test-frontend-gorse.sh
```

### 2. 監視とログ

```bash
# Gorseサービスの状態確認
docker-compose -f docker-compose.gorse.yml ps

# ログの確認
docker-compose -f docker-compose.gorse.yml logs -f gorse-master

# ヘルスチェック
curl http://localhost:8087/api/health
```

### 3. バックアップと復旧

```bash
# PostgreSQLデータベースのバックアップ
docker exec gorse-postgres pg_dump -U gorse gorse > backup.sql

# Redisデータの永続化
# docker-compose.ymlでvolumes設定済み
```

## 🚀 パフォーマンス最適化

### 1. キャッシュ戦略

- **Redis**: 推薦結果のキャッシュ
- **ブラウザキャッシュ**: 静的アセットの最適化
- **CDN**: Vercel Edge Network

### 2. レート制限とエラーハンドリング

```typescript
// API呼び出しのリトライ機能
private async retryRequest(
  path: string,
  options?: RequestInit,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<unknown> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await this.request(path, options);
    } catch (error) {
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
        continue;
      }
      throw error;
    }
  }
}
```

### 3. フォールバック機能

```typescript
// API失敗時のローカルフォールバック
const getLocalSimilarItems = (
	itemId: string,
	allProducts: Product[],
	limit: number = 5
): string[] => {
	const current = allProducts.find((p) => p.id === itemId);
	if (!current) return [];

	// 同じカテゴリの商品を優先
	const sameCategory = allProducts.filter(
		(p) => p.id !== itemId && p.category === current.category
	);

	return sameCategory.slice(0, limit).map((p) => p.id);
};
```

## 📊 成果と効果

### 1. 推薦精度の向上

- **協調フィルタリング**: ユーザー間の類似性に基づく推薦
- **コンテンツベースフィルタリング**: 商品の特徴に基づく推薦
- **ハイブリッド推薦**: 複数アルゴリズムの組み合わせ

### 2. ユーザーエンゲージメント

- **パーソナライズ推薦**: ユーザー固有の嗜好に基づく商品提案
- **類似商品表示**: 商品詳細ページでの関連商品推薦
- **リアルタイムフィードバック**: ユーザー行動の即座な反映

### 3. ビジネス指標

- **コンバージョン率**: 推薦商品の購入率向上
- **滞在時間**: 関連商品閲覧によるサイト滞在時間延長
- **リピート率**: パーソナライズ体験による再訪問率向上

---

# 2025 年 7 月 22 日のリファクタリング作業内容

## 大規模リファクタリング・構造整理

- **hooks の共通化・責務分離**
  - useSupabaseQuery を全データ取得系 hook で共通利用（useProducts, useBlogs, useProjects, useProfile 等）
  - お気に入り管理（useFavorites）、購入履歴管理（usePurchaseHistory）を共通 hook 化
- **型定義の一元管理**
  - types/配下に型を整理（Product, BlogEntry, Purchase, Profile 等）
  - 重複型・冗長な型定義を排除
- **フィルタ・日付整形などの共通ユーティリティ化**
  - filterProducts, filterBlogs, formatDate 等を utils/配下に実装
  - 各 hook/コンポーネントで共通関数を利用するようリファクタ
- **命名規則・型・ファイル構成の統一**
  - PascalCase/camelCase の統一、import 整理
- **ESLint エラー・型エラーの全解消**
  - any 型・未使用変数・依存配列・型不一致などを全て修正
- **CI での lint 警告ゼロを達成**
- **主要な UI の日付表示・フィルタロジックの統一**
  - 商品・ブログ・決済などの画面で formatDate を利用
- **冗長なローカル関数・未使用 state/import の削除**
- **コミット・プッシュ済み（PR 作成は未実行）**

---

# 2025 年 7 月 21 日の変更内容

## 主要な機能強化

### 1. レビューフィルタリング・ソート機能の実装

#### レビューフィルター機能

- **ファイル**: `src/hooks/useReviews.ts`, `src/pages/ProductDetail.tsx`
- **変更内容**:
  - 星数による絞り込み機能（★ 以上の評価）
  - 日付順・星数順での並び替え機能
  - 昇順・降順での表示切り替え
  - 管理者レビューの特別扱い（常に最後に表示）

```typescript
// フィルター機能の実装例
export interface ReviewFilter {
	rating?: number; // 指定した星数以上のレビューのみ表示
	sortBy?: "date" | "rating"; // 日付順 or 星数順
	sortOrder?: "asc" | "desc"; // 昇順 or 降順
}

const filteredAndSortedReviews = useMemo(() => {
	let result = [...reviews];
	if (filter.rating !== undefined) {
		result = result.filter((review) => {
			if (review.profiles?.role === "admin") return true;
			return review.rating !== null && review.rating >= filter.rating!;
		});
	}
	// ... ソート処理
}, [reviews, filter]);
```

#### レビューソート機能

- **日付順**: 古い順/新しい順での表示
- **星数順**: 低評価/高評価順での表示
- **管理者レビュー**: 星数順の場合は常に最後に表示

### 2. コンタクトフォーム機能の大幅強化

#### カテゴリ選択機能の実装

- **ファイル**: `supabase/migrations/20250723000000_add_category_to_contacts.sql`
- **変更内容**:
  - `contact_category` ENUM 型の追加
  - 7 つのカテゴリを定義（緊急、退会申請、機能提案など）
  - デフォルト値'other'の設定

```sql
-- カテゴリのenum型を作成
CREATE TYPE contact_category AS ENUM (
  'urgent',        -- 緊急
  'account_delete', -- 退会申請
  'feature_request', -- 機能追加の提案
  'account_related', -- アカウント関連
  'billing',       -- 支払いや請求
  'support',       -- サポート依頼
  'other'
);

ALTER TABLE contacts
ADD COLUMN category contact_category DEFAULT 'other';
```

#### タイトル機能の追加

- **ファイル**: `supabase/migrations/20250723040000_add_title_to_contacts.sql`
- **変更内容**:
  - `title` VARCHAR(200)カラムの追加
  - お問い合わせの件名機能を実装

#### ピン留め機能の実装

- **ファイル**: `supabase/migrations/20250723010000_add_pinning_to_contacts.sql`
- **変更内容**:
  - `is_pinned` boolean 型カラムの追加
  - `pinned_at` TIMESTAMP 型カラムの追加
  - `pinned_by` UUID 型カラムの追加
  - 緊急カテゴリの自動ピン留め機能

### 3. ContactAdmin UI/UX の大幅改善

#### レスポンシブデザインの最適化

- **ファイル**: `src/pages/ContactAdmin.tsx`
- **変更内容**:
  - タイトル表示の 1 行制限（スマホ対応）
  - 全バッジ・タグ・ボタンの 1 行表示統一
  - テーブル列幅の最適化

```typescript
// タイトル1行表示の実装
const CardTitle = styled.h3`
	color: white;
	margin: 0;
	font-size: 1.1rem;
	font-weight: 600;
	flex: 1;
	min-width: 0;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;

	@media (max-width: 768px) {
		font-size: 1rem;
	}

	@media (max-width: 480px) {
		font-size: 0.95rem;
	}
`;
```

#### ピン留め機能 UI

- **変更内容**:
  - ピン留めボタンの視覚的フィードバック
  - 緊急カテゴリの自動ピン留め表示
  - ピン留め状態のアニメーション効果

#### テーブルレイアウトの最適化

- **変更内容**:
  - ステータス列の固定幅設定（86px）
  - min-width 設定によるレイアウト安定性確保
  - レスポンシブ対応の幅調整

## セキュリティ・パフォーマンス改善

### 1. UI 要素の 1 行表示統一

- 全てのボタン、バッジ、タグに`white-space: nowrap`を適用
- `text-overflow: ellipsis`による省略表示
- レイアウト崩れの防止

### 2. アクセシビリティの向上

- `aria-label`属性の追加
- `title`属性による補足情報
- キーボードナビゲーション対応

### 3. データベーススキーマの改善

- ENUM 型による型安全性の確保
- 適切なデフォルト値の設定
- 外部キー制約による整合性確保

## 技術的な改善点

### 1. TypeScript 型定義の強化

```typescript
export interface Contact {
	id: string;
	name: string;
	email: string;
	title?: string; // 新規追加
	message: string;
	category: ContactCategory; // ENUM型対応
	created_at: string;
	is_checked: boolean;
	is_replied: boolean;
	status: "pending" | "in_progress" | "completed" | "closed";
	admin_notes: string | null;
	replied_at: string | null;
	checked_at: string | null;
	checked_by: string | null;
	replied_by: string | null;
	is_pinned: boolean; // 新規追加
	pinned_at: string | null; // 新規追加
	pinned_by: string | null; // 新規追加
}
```

### 2. Styled Components の最適化

- 共通スタイルパターンの統一
- レスポンシブブレークポイントの標準化
- パフォーマンス向上のための memo 化

### 3. フック関数の改善

- `useMemo`によるパフォーマンス最適化
- `useCallback`による関数の安定化
- 状態管理の効率化

## 今後の展望

### 短期的な改善予定

1. コンタクトフォームのリアルタイム検索
2. バルク操作機能の実装
3. エクスポート機能の追加

### 中長期的な機能拡張

1. 通知システムの実装
2. ワークフロー管理機能
3. 分析・レポート機能

---

# 2025 年 7 月 21 日の変更内容

## 主要な機能強化

### 1. セキュリティの大幅な強化

#### メール認証システムの実装

- **ファイル**: `src/contexts/AuthProvider.tsx`, `api/auth/custom-reset-password.ts`
- **変更内容**:
  - メール認証による本人確認の必須化
  - カスタムリセットパスワードリンクの実装
  - 環境に応じた適切なリダイレクト URL 生成
  - 既存ユーザーチェック機能の追加

#### ログイン試行制限の導入

- **ファイル**: `src/hooks/useLoginAttempts.ts`
- **変更内容**:
  - 同一 IP アドレスからの連続ログイン試行を制限
  - 5 回の失敗で 30 分のクールダウン期間を設定
  - LocalStorage を使用した試行回数の追跡
  - ブルートフォース攻撃の防止

#### Zod による強力なバリデーション

- **ファイル**: `src/lib/validation.ts`
- **変更内容**:
  - 入力値の厳密な型チェック
  - クロスサイトスクリプティング対策
  - SQL インジェクション対策
  - カスタムエラーメッセージの日本語対応

```typescript
// バリデーションスキーマの例
const reviewSchema = z.object({
	comment: z
		.string()
		.min(1, "コメントを入力してください")
		.max(1000, "コメントは1000文字以内で入力してください")
		.regex(/^[^<>]*$/, "HTMLタグは使用できません"),
	rating: z
		.number()
		.min(1, "評価は1以上を選択してください")
		.max(5, "評価は5以下を選択してください"),
});
```

### 2. 3 層ネストされた返信機能の実装

#### 階層構造の設計

- **ファイル**: `supabase/migrations/20250716180000_enable_nested_replies.sql`
- **変更内容**:
  - 返信の階層レベルを追跡するカラムを追加
  - 最大 3 階層までの制限を実装
  - 親子関係の整合性を保つ制約を追加

```sql
ALTER TABLE product_reviews
ADD COLUMN reply_level INTEGER DEFAULT 0;

-- 既存の返信のレベルを設定
UPDATE product_reviews
SET reply_level = 1
WHERE parent_id IS NOT NULL;
```

#### 返信フローの実装

- **ファイル**: `src/hooks/useReviews.ts`
- **変更内容**:
  - 階層レベルに基づく返信制御
  - 3 階層を超える返信の防止
  - 返信ツリーの再帰的な構築

```typescript
// 返信の階層チェック例
const addReply = async (parentId: string, comment: string) => {
	const parentLevel = await getReplyLevel(parentId);
	const newLevel = parentLevel + 1;

	if (newLevel > 3) {
		return { error: "返信の階層が深すぎます（3階層まで）" };
	}
	// ... 返信処理
};
```

#### UI の改善

- **ファイル**: `src/components/reviews/ReplyItem.tsx`
- **変更内容**:
  - インデント付きの階層表示
  - 返信ボタンの動的な表示/非表示
  - アコーディオン形式での返信表示
  - モバイル対応のレイアウト

```typescript
// 返信ボタンの表示制御例
{
	canReply && !isEditing && (reply.reply_level ?? 0) < 3 && (
		<ReplyActionButton onClick={startReply} aria-label="reply to reply">
			💬 返信
		</ReplyActionButton>
	);
}
```

## セキュリティ強化のポイント

### 1. 認証フロー

- メール認証による本人確認
- パスワードリセットの安全な実装
- セッション管理の強化

### 2. 入力値の検証

- Zod による型安全性の確保
- XSS 対策の実装
- SQL インジェクション対策

### 3. アクセス制御

- ログイン試行回数の制限
- IP ベースの制限
- レート制限の実装

## 返信機能の特徴

### 1. 階層構造

- 最大 3 階層までの返信
- 視覚的な階層表示
- アコーディオン形式での表示制御

### 2. ユーザビリティ

- 直感的な返信 UI
- モバイル対応
- アクセシビリティ対応

### 3. パフォーマンス

- 効率的なデータ構造
- 最適化されたクエリ
- レスポンシブな表示

## 今後の展望

### セキュリティ面

1. 2 要素認証の導入
2. OAuth 認証の追加
3. セキュリティヘッダーの強化

### 返信機能

1. リアルタイム通知
2. メンション機能
3. 返信のエクスポート機能

## 2025 年 7 月 21 日・22 日の主な機能追加・改善

- コンタクト管理のスレッド返信機能追加（DB・RLS・UI）
- ピン留め・カテゴリ・タイトル機能の追加
- コンタクトアドミン UI/UX の大幅改善（レイアウト・アクセシビリティ・レスポンシブ）
- メール認証・ログイン試行制限・Zod バリデーションによるセキュリティ強化
- レビューのフィルタ・ソート・3 階層ネスト返信機能の追加
- 型定義・Styled Components・フック関数の最適化

## 2025 年 7 月 25 日〜26 日の主な機能追加・改善

- **高機能 FAQ チャットボット**: OpenAI API 統合、自動タイムアウト、FAQ タグ、画面リセット、アバター表示
- **Information ページ改善**: UI 最適化、モバイルパフォーマンス向上、レスポンシブ対応
- **マーケティングダッシュボード**: Gorse API 連携、スクロール位置保持、集計ロジック修正
- **依存関係管理**: Zod 競合解決、OpenAI SDK 互換性確保
- **本番デプロイ**: Vercel 環境での正常稼働確認

## Gorse 推薦システムの技術詳細

### 🏗️ アーキテクチャ概要

- **フロントエンド**: React + TypeScript + Vite
- **バックエンド**: Supabase (PostgreSQL + Edge Functions)
- **推薦エンジン**: Gorse (Go 言語製)
- **インフラ**: AWS EC2 + Docker + Nginx
- **デプロイ**: Vercel (フロントエンド) + EC2 (Gorse)

### 🚀 AWS EC2 + Docker + Nginx による本番環境構築

- **EC2 インスタンス**: t3.small (2vCPU, 2GB RAM)
- **Docker Compose**: Redis + PostgreSQL + Gorse Master/Server/Worker
- **Nginx**: リバースプロキシ + Let's Encrypt SSL 証明書
- **セキュリティ**: セキュリティグループ + ファイアウォール設定

### 🧠 Gorse 推薦エンジンの設定と最適化

- **推薦アルゴリズム**: 協調フィルタリング + コンテンツベース + ハイブリッド
- **フィードバックタイプ**: purchase (高) > like/cart (中) > view (低)
- **モデル更新**: 10 分間隔で学習、60 分間隔でハイパーパラメータ探索
- **推薦更新**: 30 分間隔でチェック、60 分間隔で更新

### 🔄 データ同期とフィードバックシステム

- **商品同期**: カテゴリ・タグ・人気度をラベルとして自動同期
- **フィードバック送信**: リアルタイムでユーザー行動を Gorse に送信
- **レート制限**: API 制限を考慮した 100ms 間隔での一括処理
- **エラーハンドリング**: リトライ機能 + ローカルフォールバック

### 📊 レコメンデーション機能の実装

- **パーソナライズ推薦**: ユーザー固有の嗜好に基づく商品提案
- **類似商品推薦**: 商品詳細ページでの関連商品表示
- **フォールバック機能**: API 失敗時のローカル推薦（カテゴリベース）
- **メタデータ**: 推薦精度・パーソナライズ度・フォールバック使用状況

### 📈 マーケティング機能と分析

- **マーケティングダッシュボード**: Gorse API 連携による分析データ表示
- **主要指標**: フィードバック統計・推薦精度・ユーザー行動分析
- **可視化**: Chart.js によるグラフ表示（棒グラフ・折れ線グラフ）
- **リアルタイム更新**: スクロール位置保持 + 自動データ更新

### 🔧 運用とメンテナンス

- **自動化スクリプト**: EC2 セットアップ・Docker 構築・HTTPS 化・データ同期
- **監視**: ヘルスチェック・ログ監視・パフォーマンス監視
- **バックアップ**: PostgreSQL データベース・Redis 永続化
- **スケーリング**: Docker Compose による水平スケーリング対応

### 🚀 パフォーマンス最適化

- **キャッシュ戦略**: Redis + ブラウザキャッシュ + CDN
- **レート制限**: API 呼び出しの指数バックオフリトライ
- **フォールバック**: ローカル推薦による可用性確保
- **エラーハンドリング**: 詳細なエラーメッセージ + 自動復旧

### 📊 成果と効果

- **推薦精度**: 協調フィルタリング + コンテンツベース + ハイブリッド推薦
- **ユーザーエンゲージメント**: パーソナライズ体験による滞在時間延長
- **ビジネス指標**: コンバージョン率向上・リピート率向上・売上増加
