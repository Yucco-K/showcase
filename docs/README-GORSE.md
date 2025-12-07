# Gorse 推薦システム導入ガイド

このリポジトリには [Gorse](https://github.com/gorse-io/gorse) オープンソース推薦システムの導入・設定に必要なスクリプトと手順が含まれています。

## 概要

Gorse は高性能なオープンソース推薦システムで、ユーザーの行動に基づいて商品やコンテンツをレコメンドする機能を提供します。このプロジェクトでは、以下の機能を実装しています：

- ユーザーへのパーソナライズされた商品レコメンデーション
- 商品詳細ページでの「似た商品」の表示
- ユーザーのフィードバック（購入、いいね、閲覧）の収集と分析

## デプロイ手順

### 事前準備

AWS EC2 にデプロイする前に、以下の準備が必要です：

1. **AWS アカウントの準備**

   - AWS アカウントの作成
   - アクセスキーとシークレットキーの取得
   - 必要な権限の設定

2. **AWS CLI のインストール**

   ```bash
   # macOS
   brew install awscli

   # Ubuntu
   sudo apt-get install awscli

   # Windows
   # https://aws.amazon.com/cli/ からダウンロード
   ```

3. **AWS アカウント設定**
   ```bash
   # AWS認証情報を設定
   ./scripts/setup-aws-config.sh
   ```

### 一括デプロイ（推奨）

すべてのセットアップ手順を自動化するマスタースクリプトを用意しています：

```bash
# スクリプトに実行権限を付与
chmod +x scripts/deploy-gorse-master.sh

# スクリプトを実行
./scripts/deploy-gorse-master.sh
```

このスクリプトは以下の手順を順番に実行します：

1. AWS EC2 インスタンスのセットアップ
2. Docker と Gorse 実行環境のインストール
3. Gorse 設定ファイルの作成と更新
4. Gorse サーバーの起動
5. データの同期
6. API 検証
7. Vercel 環境変数の設定
8. フロントエンドテスト環境の準備
9. AWS 費用制限の設定（$30/月以下）

### 手動デプロイ

各ステップを個別に実行することもできます：

```bash
# 1. AWS EC2インスタンスのセットアップ
./scripts/setup-gorse-ec2.sh

# 2. Dockerのインストール
./scripts/install-docker-gorse.sh

# 3. Gorse設定の更新
./scripts/update-gorse-config.sh

# 4. Gorseサーバーの起動
./scripts/start-gorse-server.sh

# 5. データの同期
./scripts/sync-data-to-gorse.sh

# 6. API検証
./scripts/verify-gorse-api.sh

# 7. Vercel環境変数の設定
./scripts/setup-vercel-env.sh

# 8. フロントエンドテスト
./scripts/test-frontend-gorse.sh

# 8.5. フロントエンド統合テスト
./scripts/test-frontend-integration.sh

# 9. AWS費用制限の設定
./scripts/setup-cost-limit.sh
```

## フロントエンド連携

フロントエンドでの推薦表示には以下のコンポーネントを使用しています：

- `RecommendationList.tsx` - ユーザーごとのパーソナライズされた推薦を表示
- `SimilarProductsList.tsx` - 商品詳細ページで類似商品を表示

### フロントエンド統合テスト

包括的なフロントエンド連携テストを実行できます：

```bash
# 統合テストの実行
./scripts/test-frontend-integration.sh
```

このテストでは以下を確認します：

- 環境変数の設定状況
- Gorse API 接続
- Supabase 接続
- フロントエンドビルド
- 開発サーバー起動
- 推薦システム統合
- エンドツーエンドテスト

テスト結果は色付きで表示され、成功/失敗の詳細なサマリーを提供します。

## 環境変数

Gorse 連携に必要な環境変数：

```
NEXT_PUBLIC_GORSE_ENDPOINT=http://your-server-ip:8087
GORSE_API_KEY=your-api-key
```

## サーバーアクセス

Gorse 管理画面へは以下の URL でアクセスできます：

```
http://your-server-ip:8088
```

## ファイル構成

```
├── docker-compose.gorse.yml         # Gorseサービスのdocker-compose設定
├── gorse-config.toml                # Gorse設定ファイル
├── gorse-init.sql                   # Gorse初期化用SQLスクリプト
├── GORSE_ENV_SETUP.md               # 環境変数セットアップガイド
├── GORSE_SETUP_GUIDE.md             # セットアップガイド
├── scripts/
│   ├── deploy-gorse-master.sh       # 一括デプロイマスタースクリプト
│   ├── setup-gorse-ec2.sh           # EC2セットアップスクリプト
│   ├── install-docker-gorse.sh      # Dockerインストールスクリプト
│   ├── update-gorse-config.sh       # 設定更新スクリプト
│   ├── start-gorse-server.sh        # サーバー起動スクリプト
│   ├── sync-data-to-gorse.sh        # データ同期スクリプト
│   ├── verify-gorse-api.sh          # API検証スクリプト
│   ├── setup-vercel-env.sh          # Vercel環境変数設定スクリプト
│   ├── test-frontend-gorse.sh       # フロントエンドテストスクリプト
│   ├── setup-aws-config.sh          # AWSアカウント設定スクリプト
│   ├── test-frontend-integration.sh # フロントエンド統合テストスクリプト
│   ├── setup-cost-limit.sh          # AWS費用制限設定スクリプト
│   ├── sync-gorse-products.ts       # 製品データ同期スクリプト
│   └── generate-gorse-similarities.ts# 類似性データ生成スクリプト
└── src/
    ├── lib/
    │   └── gorse.ts                 # Gorseクライアントライブラリ
    └── components/
        └── recommendations/
            ├── RecommendationList.tsx # 推薦表示コンポーネント
            └── SimilarProductsList.tsx # 類似商品表示コンポーネント
```

## AWS 費用の見積もりと制限

### 費用見積もり

この構成での予想月額コスト（t3.small、東京リージョン）：

- EC2 (t3.small): 約$15-20/月
- データ転送: 約$5/月（使用量による）

合計: 約$20-25/月

### 費用制限機能

月額$30 を超えないように、以下の費用制限機能を実装しています：

1. **AWS 予算アラート**

   - 月額$25（上限の約 83%）に達すると通知メールが送信されます
   - 予算上限に達した場合も通知されます

2. **自動停止機能**

   - 6 時間以上 API リクエストがない場合に自動停止
   - CPU 使用率が 5%未満で 1 時間以上継続した場合に自動停止
   - これにより、未使用時間の課金を防止します

3. **インスタンスタイプ最適化**
   - 必要に応じて t3.micro に変更可能（約$8-10/月）
   - 変更手順のガイダンスを提供

低コスト代替案として、Render.com、Railway.app、Fly.io などのプラットフォームも検討できます。

## トラブルシューティング

一般的な問題と解決策：

1. **接続エラー**: EC2 セキュリティグループで必要なポート（8086-8088）が開放されているか確認
2. **データ同期エラー**: Supabase 接続情報が正しいか確認
3. **フロントエンド連携エラー**: 環境変数が正しく設定されているか確認
4. **費用超過**: 予算アラートが届いた場合は、自動停止機能が正しく設定されているか確認し、必要に応じてインスタンスタイプを変更

## 更新履歴

- 2023-07-xx: 初期実装
- 2023-07-xx: AWS EC2 デプロイスクリプト追加
- 2023-07-xx: フロントエンド連携機能実装
- 2023-07-xx: AWS 費用制限機能追加

## ライセンス

Gorse は [Apache License 2.0](https://github.com/gorse-io/gorse/blob/master/LICENSE) の下で提供されています。
