#!/bin/bash

# Vercel環境変数を設定するスクリプト

# IPアドレスを取得
if [ -f "gorse-ec2-ip.txt" ]; then
  EC2_IP=$(cat gorse-ec2-ip.txt)
else
  read -p "EC2インスタンスのIPアドレスを入力してください: " EC2_IP
fi

GORSE_ENDPOINT="http://${EC2_IP}:8087"
GORSE_API_KEY="${GORSE_API_KEY:-}"  # 環境変数から取得（空の場合はGorseサーバーで認証無効化が必要）

echo "Vercel環境変数を設定しています..."

# Vercel CLIがインストールされているか確認
if ! command -v vercel &> /dev/null; then
  echo "Vercel CLIがインストールされていません。インストールしています..."
  npm install -g vercel
fi

# ログイン確認
echo "Vercelにログインしていることを確認しています..."
vercel whoami &> /dev/null || vercel login

# プロジェクト名を取得
read -p "Vercelプロジェクト名を入力してください: " PROJECT_NAME

# 環境変数を設定
echo "Gorse API環境変数を設定しています..."
vercel env add NEXT_PUBLIC_GORSE_ENDPOINT production <<< "${GORSE_ENDPOINT}"
vercel env add GORSE_API_KEY production <<< "${GORSE_API_KEY}"

echo "開発環境用の環境変数も設定しています..."
vercel env add NEXT_PUBLIC_GORSE_ENDPOINT development <<< "${GORSE_ENDPOINT}"
vercel env add GORSE_API_KEY development <<< "${GORSE_API_KEY}"

echo "プレビュー環境用の環境変数も設定しています..."
vercel env add NEXT_PUBLIC_GORSE_ENDPOINT preview <<< "${GORSE_ENDPOINT}"
vercel env add GORSE_API_KEY preview <<< "${GORSE_API_KEY}"

echo ""
echo "Vercel環境変数の設定が完了しました。"
echo "NEXT_PUBLIC_GORSE_ENDPOINT=${GORSE_ENDPOINT}"
echo "GORSE_API_KEY=${GORSE_API_KEY}"
echo ""
echo "次のステップ: フロントエンドとの連携をテストしてください。"

# 別の方法として手動で設定するための情報を保存
cat > vercel-env-setup.md << EOF
# Vercel環境変数設定

Vercelダッシュボードで以下の環境変数を設定してください：

## Production / Preview / Development 環境すべてに設定

| 環境変数名 | 値 |
|------------|-----|
| NEXT_PUBLIC_GORSE_ENDPOINT | ${GORSE_ENDPOINT} |
| GORSE_API_KEY | ${GORSE_API_KEY} |

## 設定方法

1. [Vercelダッシュボード](https://vercel.com/dashboard)にアクセス
2. プロジェクト "${PROJECT_NAME}" を選択
3. "Settings" > "Environment Variables" に移動
4. 上記の変数を追加
5. "Save" をクリック
6. プロジェクトを再デプロイ
EOF

echo "手動設定用のガイドを vercel-env-setup.md に保存しました。" 