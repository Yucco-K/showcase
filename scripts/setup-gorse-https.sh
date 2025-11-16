#!/bin/bash
set -e

# GorseサーバーHTTPS化自動セットアップスクリプト
echo "🚀 Gorseサーバー HTTPS化セットアップを開始します..."

# ドメイン名の入力
read -p "ドメイン名を入力してください (例: gorse.example.com): " DOMAIN_NAME

if [ -z "$DOMAIN_NAME" ]; then
    echo "❌ ドメイン名が入力されていません。終了します。"
    exit 1
fi

echo "📦 ドメイン名: $DOMAIN_NAME で設定を開始します..."

# 1. NginxとCertbotのインストール
echo "📦 Nginx と Let's Encrypt のインストール中..."
sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx

# 2. Nginxリバースプロキシ設定
echo "⚙️  Nginx リバースプロキシ設定を作成中..."
sudo bash -c "cat > /etc/nginx/sites-available/gorse <<EOF
server {
    listen 80;
    server_name $DOMAIN_NAME;

    location / {
        proxy_pass http://localhost:8086;
        proxy_set_header Host \\\$host;
        proxy_set_header X-Real-IP \\\$remote_addr;
        proxy_set_header X-Forwarded-For \\\$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \\\$scheme;
    }
}
EOF"

# 3. 設定の有効化
echo "🔗 Nginx設定を有効化中..."
sudo ln -sf /etc/nginx/sites-available/gorse /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# 4. Let's EncryptでSSL証明書取得
echo "🔒 SSL証明書を取得中..."
echo "メールアドレスと利用規約への同意が必要です。"
sudo certbot --nginx -d $DOMAIN_NAME --non-interactive --agree-tos --email admin@$DOMAIN_NAME || {
    echo "⚠️  自動SSL証明書取得に失敗しました。手動で実行してください:"
    echo "sudo certbot --nginx -d $DOMAIN_NAME"
}

# 5. ファイアウォール設定
echo "🔥 ファイアウォール設定中..."
sudo ufw allow 'Nginx Full' || echo "⚠️  UFWが無効か、既に設定済みです"
sudo ufw delete allow 8086/tcp || echo "⚠️  8086番ポートは既に閉じているか、UFWが無効です"

# 6. 動作確認
echo "🧪 動作確認中..."
if curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN_NAME/health" | grep -q "200"; then
    echo "✅ HTTPS接続成功! https://$DOMAIN_NAME でアクセス可能です"
else
    echo "⚠️  HTTPS接続の確認に失敗しました。手動で https://$DOMAIN_NAME/health を確認してください"
fi

echo ""
echo "🎉 セットアップ完了!"
echo ""
echo "📝 次のステップ:"
echo "1. .env または Vercel の環境変数で以下を設定してください:"
echo "   VITE_GORSE_ENDPOINT=https://$DOMAIN_NAME"
echo "   VITE_GORSE_DASHBOARD_URL=https://$DOMAIN_NAME:8088"
echo ""
echo "2. フロントエンドを再デプロイしてください"
echo ""
echo "3. ブラウザで https://$DOMAIN_NAME/health にアクセスして動作確認してください"
