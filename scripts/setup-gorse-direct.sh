#!/bin/bash
set -e

# GorseサーバーHTTPS化（EC2直接実行）
INSTANCE_ID=$(aws ec2 describe-instances \
  --filters "Name=ip-address,Values=52.198.15.232" \
  --query "Reservations[*].Instances[*].InstanceId" \
  --output text)

echo "🔍 EC2インスタンスID: $INSTANCE_ID"

# EC2インスタンスにコマンドを送信
aws ec2-instance-connect send-ssh-public-key \
  --instance-id "$INSTANCE_ID" \
  --availability-zone "ap-northeast-1a" \
  --instance-os-user "ubuntu" \
  --ssh-public-key "$(cat ~/.ssh/id_rsa.pub)"

# SSHコマンドを生成
SSH_COMMAND=$(cat << 'EOF'
sudo apt update && \
sudo apt install -y nginx certbot python3-certbot-nginx && \
sudo bash -c 'cat > /etc/nginx/sites-available/gorse << NGINX_EOF
server {
    listen 80;
    server_name gorse.showcase.example.com;
    location / {
        proxy_pass http://localhost:8086;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
NGINX_EOF' && \
sudo ln -sf /etc/nginx/sites-available/gorse /etc/nginx/sites-enabled/ && \
sudo nginx -t && \
sudo systemctl reload nginx && \
sudo certbot --nginx -d gorse.showcase.example.com --non-interactive --agree-tos --email admin@showcase.example.com || true && \
sudo ufw allow 'Nginx Full' || true && \
sudo ufw delete allow 8086/tcp || true && \
echo '✅ HTTPS setup completed!'
EOF
)

# SSHでコマンドを実行
ssh -o StrictHostKeyChecking=no ubuntu@52.198.15.232 "$SSH_COMMAND"

echo ""
echo "🎉 HTTPS化を開始しました!"
echo ""
echo "📝 次のステップ:"
echo "1. Vercelの環境変数を更新:"
echo "   VITE_GORSE_ENDPOINT=https://gorse.showcase.example.com"
echo "   VITE_GORSE_DASHBOARD_URL=https://gorse.showcase.example.com:8088"
echo ""
echo "2. フロントエンドを再デプロイ"
