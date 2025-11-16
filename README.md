# Portfolio Showcase

モダンなポートフォリオ・ショーケースサイト。Supabase、Stripe、Gorse 推薦システム、AI チャットボットを統合したフルスタックアプリケーションです。

## 📱 プロジェクト概要

「App Showcase」は、**架空のアプリストアを通じてポートフォリオを紹介するフルスタックWebアプリケーション**です。ECサイトのようなUI/UXを持ちながら、ユーザー管理、レビューシステム、AIチャットボット、マーケティング分析ダッシュボードなど、**多彩な機能**を実装しています。

<div align="center">

### 👉 [詳しくはこちら](https://yucco-k.github.io/showcase/)

</div>

<table>
  <tr>
    <td align="center" width="50%">
      <b>🛒 フロントエンド</b><br>
      検索・フィルタ・レビュー・チャットボット統合
    </td>
    <td align="center" width="50%">
      <b>⚙️ 管理画面</b><br>
      商品・ブログ・お問い合わせ・マーケティング管理
    </td>
  </tr>
  <tr>
    <td align="center">
      <b>👤 マイページ</b><br>
      購入履歴・お気に入り・プロフィール管理
    </td>
    <td align="center">
      <b>🤖 AI機能</b><br>
      チャットボットによる商品推薦・FAQ対応
    </td>
  </tr>
</table>

## ✨ 主な機能

- 🛍️ **製品カタログ**: 製品の閲覧、検索、フィルタリング
- 💳 **Stripe 決済**: セキュアな決済処理
- 🤖 **AI チャットボット**: OpenAI GPT-4o-mini を使用したインテリジェントなカスタマーサポート
- 🎯 **推薦システム**: Gorse を使用したパーソナライズされた製品推薦
- 👤 **ユーザー認証**: Supabase Auth による安全な認証
- 📝 **レビューシステム**: 製品レビューと評価
- 📞 **お問い合わせ**: 管理者への直接メッセージ機能

## 🛠️ 技術スタック

### フロントエンド
- React 19 + TypeScript
- Vite
- Styled Components
- Framer Motion
- Mantine UI

### バックエンド
- Supabase (PostgreSQL + Auth + Storage)
- FastAPI (Python) - AI チャットボット API
- Vercel - ホスティング

### 外部サービス
- OpenAI GPT-4o-mini - AI チャット
- Stripe - 決済処理
- Gorse - 推薦エンジン

## 📚 ドキュメント

詳細なドキュメントは [`docs/`](./docs/) ディレクトリにあります：

- [セキュリティスキャンガイド](./docs/SECURITY_SCANNING.md)
- [環境変数設定](./docs/ENVIRONMENT_VARIABLES.md)
- [チャットボットセットアップ](./CHATBOT_SETUP.md)
- [Gorse セットアップガイド](./GORSE_SETUP_GUIDE.md)
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

### ビルド

```bash
# 本番用ビルド
npm run build

# プレビュー
npm run preview
```
