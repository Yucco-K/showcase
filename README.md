# App Showcase

架空のアプリストアという題材を通じて、**複数の外部サービス（Supabase / OpenAI / Stripe / Gorse）をどう統合し、どう品質を担保するか**を実践したフルスタックWebアプリケーションです。

<div align="center">

[![Portfolio Page](https://img.shields.io/badge/🖼️%20%E3%83%9D%E3%83%BC%E3%83%88%E3%83%95%E3%82%A9%E3%83%AA%E3%82%AA%E3%83%9A%E3%83%BC%E3%82%B8%E3%82%92%E8%A6%8B%E3%82%8B-7c3aed?style=for-the-badge&logo=github&logoColor=white)](https://yucco-k.github.io/showcase/)
[![Live Demo](https://img.shields.io/badge/🚀%20Live%20Demo-showcase--topaz.vercel.app-0ea5e9?style=for-the-badge&logo=vercel&logoColor=white)](https://showcase-topaz.vercel.app/)

<br/>

[<img src="https://yucco-k.github.io/showcase/screenshots/frontend/frontend-hero-welcome.png?v=2" width="640" alt="App Showcase スクリーンショット" />](https://yucco-k.github.io/showcase/)

**▲ 画像をクリックするとポートフォリオページへ移動します**

</div>

## 📱 何を作ったか

「App Showcase」は、**架空のアプリストアを通じてポートフォリオを紹介するフルスタックWebアプリケーション**です。ECサイトのようなUI/UXの中に、AIチャットボット・推薦システム・決済・管理画面といった、実務でよく求められる要素を一通り実装しています。

- 🛍️ 製品カタログ（検索・フィルタ・レビュー）
- 💳 Stripe決済
- 🤖 AIチャットボット（RAG構成）
- 🎯 Gorseによる推薦システム
- 👤 Supabase Authによる認証・RLSによる認可
- ⚙️ 管理画面（商品・ブログ・お問い合わせ・マーケティング分析）
- 🔄 Zenn記事の自動同期（GitHub Actions）

## 🎯 どんな問題を扱ったか、どう設計したか

複数の外部サービスを繋ぐだけなら難しくありません。難しいのは、**それぞれの境界で何を信用し、何を検証し、失敗した時にどう振る舞うか**を設計することです。このリポジトリでは特に以下の4点を意識しました。

### 1. AI / RAG — 単なるAPI呼び出しで終わらせない

```text
Frontend → FastAPI → LangChain → OpenAI → Supabase（pgvector）
```

チャットボットは単純にOpenAIへ質問を投げるだけの実装にせず、以下の段階を踏む構成にしています。

1. 定型的な挨拶は即座に返す（LLM呼び出し自体を避けるコスト最適化）
2. LLMでクエリの意図を判定（価格比較の質問かどうか等）
3. 意図に応じてDBへの直接クエリ（価格順ソート等）またはベクトル検索(RAG)に分岐
4. 検索結果をコンテキストとしてLLMに渡し、最終的な回答を生成

サーバー側のコードは`config` / `schemas` / `services`（chatbot・intent・retrieval） / `repositories` / `routers`に責務分割しており（[api/chat/](./api/chat/)）、意図分析ロジックとDB問い合わせロジックが混在しないようにしています。

### 2. Authentication / Authorization — UIだけでなくDB側でも制御する

```text
Browser → Supabase Auth → Application(RLS-aware queries) → PostgreSQL(RLS)
```

管理者専用ページはフロントエンドでリンクを隠すだけでなく、未ログイン・非管理者が直接URLへアクセスした場合にも実際にリダイレクトされることをE2Eテストで検証しています（[tests/auth.spec.ts](./tests/auth.spec.ts)）。加えてPostgreSQL側でもRow Level Security（RLS）を有効化し、UIの制御を迂回した直接アクセスに対しても防御しています（[supabase/migrations/](./supabase/migrations/)）。

### 3. Recommendation — フィードバックベースの推薦とその課題

Gorseに「閲覧・お気に入り・購入」のフィードバックを送信し、パーソナライズされた推薦（類似商品・人気順・ユーザーごとのランキング）を行う構成です（[src/lib/gorse.ts](./src/lib/gorse.ts)）。クライアント側にはキャッシュ・重複リクエスト防止・タイムアウト・レート制限を実装していますが、レート制限が完全にクライアント側で完結しているとユーザーがlocalStorageを操作すれば回避できてしまうため、**サーバー側のプロキシ（[api/gorse-proxy/](./api/gorse-proxy/)）でユーザーID/IPごとのリクエスト数をSupabase上で原子的にカウントし、実効性のある制限をかける**構成に改善しました。

Gorse自体はAWS EC2上にDocker Composeで構築しています（Postgres/Redis/Gorse master・server・workerの4種のコンテナ構成）。API自体に到達できない場合にはフロントエンド側でローカルフォールバック（同カテゴリ商品の提示）に切り替わるようにし、外部サービス障害時でもUIが破綻しないようにしています。

### 4. CI/CD — 「テストが通ったことにする」ではなく実際に通す

```text
Type Check → Lint → Build → Unit Test(Vitest) → E2E(Playwright) → Security Scan → Deploy
```

以前はCI内でPlaywrightがポート競合により実行前にエラー終了し、その失敗を`|| echo "continuing"`で握りつぶして常にCIが成功扱いになっていました。テスト失敗が正しくCI失敗として扱われるよう修正し、その過程で実際に検出された不具合（本番で機能していなかったパスワードリセットAPIのルーティング不備など）も合わせて修正しています。詳細は[.github/workflows/ci.yml](./.github/workflows/ci.yml)を参照してください。

## 🧪 テストへのアプローチ

「動いているように見える」ではなく「何が壊れたら困るか」を基準にテストしています。

- **E2E（Playwright）**: 認可（管理者ページへの直接URLアクセス拒否）、DB連携（実データの内容まで検証、単なる要素の表示確認では終わらせない）
- **Unit（Vitest）**: 決済カードのLuhnアルゴリズム検証・ブランド判定、Zodバリデーションスキーマ、商品/ブログのフィルタリングロジックなど、E2Eに向かない純粋関数を中心にカバー

## 🛠️ 技術スタック

- **フロントエンド**: React 19, TypeScript, Vite, Styled Components, Mantine UI
- **バックエンド**: Supabase (PostgreSQL + Auth + RLS + Storage), FastAPI (Python), Vercel Functions
- **AI**: OpenAI GPT-4o-mini, LangChain, pgvector
- **推薦**: Gorse
- **決済**: Stripe
- **インフラ / CI**: Vercel, GitHub Actions, AWS (EC2), Docker
- **テスト**: Playwright (E2E), Vitest (Unit)
- **セキュリティ**: Gitleaks, TruffleHog, pre-commit, Dependabot

## 🔄 ブログ自動同期（Zenn連携）

Zenn（[zenn.dev/yucco](https://zenn.dev/yucco)）に公開した記事を、GitHub Actionsが毎日自動でSupabaseの`blogs`テーブルへ反映します。

- **ワークフロー**: [`.github/workflows/sync-zenn-blogs.yml`](./.github/workflows/sync-zenn-blogs.yml)（毎日03:00 JST定期実行 / 手動実行も可）
- **スクリプト**: [`scripts/sync-zenn-blogs.ts`](./scripts/sync-zenn-blogs.ts)
- **データ取得元**: Zenn公開API（`zenn.dev/api/articles`）からタイトル・タグ・公開日・本文文字数（読了時間の算出元）を取得
- **反映方法**: 記事URLをキーに既存行があれば更新、なければ新規追加（upsert）

手動で同期したい場合:

```bash
npm run sync:zenn-blogs
```

（`.env`に`VITE_SUPABASE_URL`と`SUPABASE_SERVICE_ROLE_KEY`が必要です）

## 📚 ドキュメント

詳細なドキュメントは [`docs/`](./docs/) ディレクトリにあります：

- [セキュリティスキャンガイド](./docs/SECURITY_SCANNING.md)
- [環境変数設定](./docs/ENVIRONMENT_VARIABLES.md)
- [チャットボットセットアップ](./docs/CHATBOT_SETUP.md)
- [Gorse セットアップガイド](./docs/GORSE_SETUP_GUIDE.md)
- [FAQ](./docs/FAQ.md)
- [利用規約](./docs/TERMS_OF_SERVICE.md)
- [プライバシーポリシー](./docs/PRIVACY_POLICY.md)

## 🚀 クイックスタート

### 前提条件

- Node.js 18+
- Docker & Docker Compose
- Python 3.9+ (チャットボット用)
- Supabase アカウント
- OpenAI API キー
- Stripe アカウント

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/Yucco-K/showcase.git
cd showcase

# 依存関係をインストール
npm install

# Python 依存関係をインストール（チャットボット用）
cd api/chat
pip install -r requirements.txt
cd ../..

# 環境変数を設定
cp .env.example .env
# .env ファイルを編集して必要な環境変数を設定
```

### 開発環境の起動

```bash
# フロントエンドの起動
npm run dev

# Python API の起動（別ターミナル）
cd api/chat
python -m uvicorn index:app --reload --port 8001

# Gorse の起動（別ターミナル）
docker-compose -f docker-compose.gorse.yml up -d
```

### テスト

```bash
# ユニットテスト（Vitest）
npm run test:unit

# E2Eテスト（Playwright）
npm run test

# 型チェック・Lint・ビルド・テストを一括実行
npm run ci
```

### ビルド

```bash
# 本番用ビルド
npm run build

# プレビュー
npm run preview
```
