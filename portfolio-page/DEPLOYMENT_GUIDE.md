# 📦 GitHub Pages デプロイガイド

このポートフォリオページを GitHub Pages で独立したサイトとして公開する手順です。

## 🌐 公開URL

**https://yucco-k.github.io/showcase/**

## ⚙️ セットアップ（初回のみ）

### 1. GitHubリポジトリの設定

1. GitHubリポジトリ `Yucco-K/showcase` にアクセス
2. **Settings** → **Pages** を開く
3. **Source** を **"GitHub Actions"** に変更

![GitHub Pages Settings](https://docs.github.com/assets/cb-47267/mw-1440/images/help/pages/pages-source-github-actions.webp)

### 2. 環境変数の設定（必要な場合）

GitHub Actionsで環境変数が必要な場合：

1. **Settings** → **Secrets and variables** → **Actions**
2. **New repository secret** をクリック
3. 必要な環境変数を追加

## 🚀 デプロイ方法

### 方法1: 自動デプロイ（推奨）

`portfolio-page/` ディレクトリ内のファイルを変更して `main` ブランチにプッシュすると、自動的にデプロイされます。

```bash
cd /Users/yukig/Documents/dev/showcase
git add portfolio-page/
git commit -m "Update portfolio page"
git push origin main
```

GitHub Actionsが自動的に：
1. ビルドを実行
2. GitHub Pagesにデプロイ
3. 数分後に https://yucco-k.github.io/showcase/ が更新される

### 方法2: 手動デプロイ

```bash
cd portfolio-page
npm run deploy
```

このコマンドは：
1. `npm run build` を実行
2. `dist/` フォルダを `gh-pages` ブランチにプッシュ

### 方法3: GitHub UIから手動トリガー

1. GitHub リポジトリの **Actions** タブを開く
2. 左サイドバーから **"Deploy Portfolio Page to GitHub Pages"** を選択
3. **"Run workflow"** ボタンをクリック

## 📝 デプロイ状況の確認

1. GitHub リポジトリの **Actions** タブを開く
2. 最新のワークフロー実行を確認
3. ✅ グリーンチェックマークが付いたら成功

## 🔧 トラブルシューティング

### デプロイが失敗する場合

1. **ビルドエラー**:
   ```bash
   cd portfolio-page
   npm run build
   ```
   ローカルでビルドが成功するか確認

2. **GitHub Actions の権限エラー**:
   - Settings → Actions → General
   - "Workflow permissions" を "Read and write permissions" に変更

3. **404エラー**:
   - `vite.config.ts` の `base: '/showcase/'` が正しいか確認
   - Settings → Pages で正しいブランチが選択されているか確認

### キャッシュクリア

GitHub Actionsのキャッシュをクリアしたい場合：

1. Actions タブ → 左サイドバー → Caches
2. 古いキャッシュを削除

## 📸 スクリーンショットの追加

画像を追加する場合：

```bash
cd portfolio-page/public/screenshots

# 画像をコピー
cp ~/Downloads/screenshot.png frontend/01-top.png

# コミット＆プッシュ
git add .
git commit -m "Add screenshots"
git push origin main
```

自動的に再デプロイされます。

## 🔄 カスタムドメインの設定（オプション）

カスタムドメインを使用する場合：

1. Settings → Pages → Custom domain
2. ドメイン名を入力（例：`portfolio.yucco.dev`）
3. DNSレコードを設定：
   ```
   Type: CNAME
   Name: portfolio
   Value: yucco-k.github.io
   ```

## 📊 アナリティクス（オプション）

Google Analyticsを追加する場合：

`portfolio-page/index.html` に以下を追加：

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

## 📚 参考リンク

- [GitHub Pages ドキュメント](https://docs.github.com/ja/pages)
- [GitHub Actions ドキュメント](https://docs.github.com/ja/actions)
- [Vite デプロイガイド](https://vitejs.dev/guide/static-deploy.html#github-pages)
