# 🔐 機密情報スキャンガイド

このプロジェクトでは、機密情報の漏洩を防ぐために3層のセキュリティチェックシステムを導入しています。

## 📊 3層防御システム

### 1️⃣ **ローカル環境** - pre-commit hooks
コミット前に自動的にチェック

### 2️⃣ **GitHub Actions** - CI/CD Pipeline
プッシュ・プルリクエスト時に自動スキャン

### 3️⃣ **手動スキャン** - Docker/npm scripts
必要に応じて手動で実行

---

## 🚀 初期セットアップ

### 1. pre-commitのインストール

#### macOS (Homebrew)
```bash
brew install pre-commit
```

#### pip
```bash
pip install pre-commit
```

### 2. pre-commitフックの有効化

```bash
cd /path/to/showcase
pre-commit install
```

### 3. 初回スキャン

```bash
# 全ファイルをスキャン
pre-commit run --all-files
```

---

## 📝 使い方

### 自動チェック（推奨）

pre-commitをインストール後、`git commit`を実行すると自動的にスキャンが実行されます。

```bash
git add .
git commit -m "feat: 新機能追加"
# ← このタイミングで自動スキャン実行
```

機密情報が検出された場合、コミットが自動的にブロックされます。

### 手動スキャン

#### npm スクリプト経由（Docker必要）

```bash
# 全ファイルをスキャン
npm run security:scan

# コミットされていない変更のみスキャン
npm run security:scan-uncommitted

# pre-commitを使った全チェック
npm run security:check
```

#### Docker直接実行

```bash
# Gitleaksイメージの取得
docker pull zricethezav/gitleaks:latest

# 全ファイルをスキャン
docker run -v $(pwd):/path zricethezav/gitleaks:latest detect \
  --source /path -v -c /path/.gitleaks.toml

# 未コミットの変更のみスキャン
docker run -v $(pwd):/path zricethezav/gitleaks:latest protect \
  --source /path -v -c /path/.gitleaks.toml
```

---

## 🔍 検出される機密情報

以下のような機密情報が自動的に検出されます：

- ✅ Supabase Anon Keys
- ✅ Stripe API Keys (test/live)
- ✅ Vercel Tokens
- ✅ OpenAI API Keys
- ✅ AWS Access Keys
- ✅ GitHub Tokens
- ✅ Notion API Keys
- ✅ プライベートキー（RSA、SSH等）
- ✅ その他の一般的な機密情報

---

## ⚙️ GitHub Actions

プッシュやプルリクエスト時に、GitHub Actionsで以下のスキャンが自動実行されます：

1. **Gitleaks** - 機密情報スキャン
2. **TruffleHog** - セカンダリスキャン（検証済みのシークレットのみ）

### ワークフローファイル

`.github/workflows/secrets-scan.yml`

---

## 🛡️ ホワイトリスト

誤検知を防ぐため、以下のパターンはスキャン対象外です：

### 除外ファイル
- `.env.example`, `.env.template`
- `README.md`, `docs/*.md`
- `dist/`, `node_modules/`, `.git/`

### 除外パターン
- `dummy`, `example`, `test`, `your-*-here`
- 環境変数参照: `process.env.*`, `Deno.env.get()`
- コメント内のサンプルコード

### カスタマイズ

ホワイトリストを追加する場合は、`.gitleaks.toml` の `[allowlist]` セクションを編集してください。

```toml
[allowlist]
paths = [
  '''path/to/your/file\.ts''',
]

[[allowlist.regexes]]
description = "Custom pattern"
regex = '''your-custom-regex'''
```

---

## ❌ 機密情報が検出された場合

### 1. コミット前に検出された場合

```bash
# 機密情報を削除または環境変数に移動
# 例: ハードコードされたAPIキーを削除
-const API_KEY = "sk-abc123..."
+const API_KEY = Deno.env.get("API_KEY") || ""

# 再度コミット
git add .
git commit -m "fix: APIキーを環境変数に移行"
```

### 2. すでにコミット済みの場合

```bash
# コミット履歴から完全削除（慎重に！）
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch path/to/file" \
  --prune-empty --tag-name-filter cat -- --all

# または、最新のコミットのみ修正
git reset --soft HEAD~1
# ファイルを修正
git add .
git commit -m "fix: 機密情報を削除"
```

### 3. すでにプッシュ済みの場合

⚠️ **重要**: 機密情報が公開リポジトリにプッシュされた場合、以下の手順を実行してください：

1. **即座にキーを無効化**
   - Supabase、Stripe、OpenAIなどのダッシュボードで該当のキーを無効化

2. **新しいキーを生成**
   - 新しいキーを生成し、環境変数として設定

3. **履歴から削除**
   ```bash
   # BFG Repo-Cleanerを使用（推奨）
   brew install bfg
   bfg --replace-text passwords.txt
   git reflog expire --expire=now --all
   git gc --prune=now --aggressive
   git push --force
   ```

4. **チームに通知**
   - セキュリティインシデントとしてチームに報告

---

## 🎯 ベストプラクティス

### ✅ DO（推奨）

- 環境変数を使用する
- `.env` ファイルは `.gitignore` に含める
- GitHub Secretsを使用してCI/CD環境で管理
- 定期的に `npm run security:scan` を実行
- pre-commitフックを有効化

### ❌ DON'T（禁止）

- APIキーをコードにハードコード
- `.env` ファイルをコミット
- 機密情報をコメントに記載
- テスト用の本番キーを使用

---

## 📚 参考リンク

- [Gitleaks Documentation](https://github.com/gitleaks/gitleaks)
- [pre-commit Documentation](https://pre-commit.com/)
- [TruffleHog Documentation](https://github.com/trufflesecurity/trufflehog)
- [環境変数設定ガイド](./ENVIRONMENT_VARIABLES.md)

---

## 🆘 トラブルシューティング

### pre-commitがインストールできない

```bash
# Pythonが必要です
python3 --version

# pipをアップグレード
python3 -m pip install --upgrade pip

# 再度インストール
pip install pre-commit
```

### Dockerが動作しない

```bash
# Dockerがインストールされているか確認
docker --version

# Dockerが起動しているか確認
docker ps

# Docker Desktopを起動してから再実行
```

### GitHub Actionsでスキャンが失敗する

- `.github/workflows/secrets-scan.yml` を確認
- Gitleaksのバージョンが最新か確認
- `.gitleaks.toml` の設定を確認

---

## 📞 サポート

問題が解決しない場合は、以下を確認してください：

1. [Issues](https://github.com/Yucco-K/showcase/issues)で既知の問題を検索
2. 新しいIssueを作成して質問
3. セキュリティに関する重大な問題は直接連絡

**重要**: セキュリティに関する脆弱性を発見した場合、公開Issueではなく、非公開で報告してください。

