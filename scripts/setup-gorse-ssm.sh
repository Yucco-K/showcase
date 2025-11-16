#!/bin/bash
set -e

# GorseサーバーHTTPS化（SSM経由）
INSTANCE_ID=$(aws ec2 describe-instances \
  --filters "Name=ip-address,Values=52.198.15.232" \
  --query "Reservations[*].Instances[*].InstanceId" \
  --output text)

echo "🔍 EC2インスタンスID: $INSTANCE_ID"

# SSMコマンドドキュメント作成
DOCUMENT_CONTENT=$(cat << 'EOF'
{
  "schemaVersion": "2.2",
  "description": "Gorse Server HTTPS Setup",
  "mainSteps": [
    {
      "action": "aws:runShellScript",
      "name": "setupGorseHTTPS",
      "inputs": {
        "runCommand": [
          "#!/bin/bash",
          "set -e",
          "apt update",
          "apt install -y nginx certbot python3-certbot-nginx",
          "cat > /etc/nginx/sites-available/gorse << 'NGINX_EOF'",
          "server {",
          "    listen 80;",
          "    server_name gorse.showcase.example.com;",
          "    location / {",
          "        proxy_pass http://localhost:8086;",
          "        proxy_set_header Host $host;",
          "        proxy_set_header X-Real-IP $remote_addr;",
          "        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;",
          "        proxy_set_header X-Forwarded-Proto $scheme;",
          "    }",
          "}",
          "NGINX_EOF",
          "ln -sf /etc/nginx/sites-available/gorse /etc/nginx/sites-enabled/",
          "nginx -t",
          "systemctl reload nginx",
          "certbot --nginx -d gorse.showcase.example.com --non-interactive --agree-tos --email admin@showcase.example.com || true",
          "ufw allow 'Nginx Full' || true",
          "ufw delete allow 8086/tcp || true",
          "echo '✅ HTTPS setup completed!'"
        ]
      }
    }
  ]
}
EOF
)

# 既存のドキュメントを削除（存在する場合）
aws ssm delete-document --name "GorseHTTPSSetup" || true

# 新しいドキュメントを作成
echo "$DOCUMENT_CONTENT" | aws ssm create-document \
  --name "GorseHTTPSSetup" \
  --content file:///dev/stdin \
  --document-type "Command"

# コマンド実行
aws ssm send-command \
  --document-name "GorseHTTPSSetup" \
  --targets "Key=InstanceIds,Values=$INSTANCE_ID" \
  --comment "Setup HTTPS for Gorse server"

echo ""
echo "🎉 SSM経由でHTTPS化を開始しました!"
echo ""
echo "📝 次のステップ:"
echo "1. Vercelの環境変数を更新:"
echo "   VITE_GORSE_ENDPOINT=https://gorse.showcase.example.com"
echo "   VITE_GORSE_DASHBOARD_URL=https://gorse.showcase.example.com:8088"
echo ""
echo "2. フロントエンドを再デプロイ"
