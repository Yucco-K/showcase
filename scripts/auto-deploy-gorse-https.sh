#!/bin/bash
set -e

# GorseサーバーHTTPS化自動デプロイ・実行スクリプト
GORSE_SERVER="52.198.15.232"
SSH_USER="ubuntu"
SSH_KEY="./gorse-key.pem"
DOMAIN_NAME="gorse.showcase.example.com"

echo "🚀 GorseサーバーのHTTPS化を自動実行します..."
echo "サーバー: $GORSE_SERVER"
echo "ドメイン: $DOMAIN_NAME"
echo "SSH鍵: $SSH_KEY"

# 1. スクリプトをサーバーにコピー
echo "📤 HTTPS化スクリプトをサーバーにアップロード中..."
scp -i $SSH_KEY -o StrictHostKeyChecking=no scripts/setup-gorse-https.sh $SSH_USER@$GORSE_SERVER:~/

# 2. サーバー上でスクリプトを実行
echo "⚙️  サーバー上でHTTPS化を実行中..."
ssh -i $SSH_KEY -o StrictHostKeyChecking=no $SSH_USER@$GORSE_SERVER << 'EOF'
chmod +x ~/setup-gorse-https.sh

# ドメイン名を自動入力してスクリプトを実行
echo "gorse.showcase.example.com" | ~/setup-gorse-https.sh

echo "✅ HTTPS化完了!"
echo "🌐 アクセスURL: https://gorse.showcase.example.com"
EOF

echo ""
echo "🎉 自動デプロイ完了!"
echo ""
echo "📝 次のステップ:"
echo "1. Vercelの環境変数を更新:"
echo "   VITE_GORSE_ENDPOINT=https://gorse.showcase.example.com"
echo "   VITE_GORSE_DASHBOARD_URL=https://gorse.showcase.example.com:8088"
echo ""
echo "2. フロントエンドを再デプロイ"
