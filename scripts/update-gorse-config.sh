#!/bin/bash

# Gorse設定を本番環境用に更新するスクリプト

# IPアドレスを取得
if [ -f "gorse-ec2-ip.txt" ]; then
  EC2_IP=$(cat gorse-ec2-ip.txt)
else
  read -p "EC2インスタンスのIPアドレスを入力してください: " EC2_IP
fi

KEY_NAME="gorse-key"
SSH_USER="ubuntu"

# リモート実行関数
remote_exec() {
  ssh -i $KEY_NAME.pem -o StrictHostKeyChecking=no $SSH_USER@$EC2_IP "$1"
}

# Supabase接続情報入力
read -p "Supabase Database URL (postgresql://postgres.user:password@host:5432/postgres): " SUPABASE_URL
GORSE_API_KEY="[REDACTED_GORSE_API_KEY]="

echo "本番環境用のGorse設定を更新しています..."

# 本番環境用の設定を作成
cat > temp-gorse-config.toml << EOF
# Gorse推薦エンジン設定ファイル（本番環境用）

[database]
data_store = "${SUPABASE_URL}"
cache_store = "redis://localhost:6379/0"

[master]
port = 8086
host = "0.0.0.0"
n_jobs = 2
meta_timeout = "30s"
dashboard_port = 8088
server_host = "0.0.0.0"
server_port = 8086

[server]
api_key = "${GORSE_API_KEY}"
default_n = 10
clock_error = "5s"
host = "0.0.0.0"
port = 8087
master_host = "localhost"
master_port = 8086

[recommend.data_source]
positive_feedback_types = ["purchase", "like"]
read_feedback_types = ["view"]
positive_feedback_ttl = 0
item_ttl = 0

[recommend.popular]
popular_window = "720h"

[recommend.collaborative]
model_fit_period = "60m"
model_search_period = "360m"
model_search_epoch = 100
model_search_trials = 10

[recommend.offline]
check_recommend_period = "30m"
refresh_recommend_period = "120m"
enable_latest_recommend = true
enable_popular_recommend = true
enable_user_based_recommend = true
enable_item_based_recommend = true
enable_collaborative_recommend = true
enable_click_through_prediction = false

[log]
path = "/var/log/gorse/gorse.log"
max_size = 4096
max_age = 168
max_backups = 10
level = "info" 
EOF

# 設定ファイルを転送
scp -i $KEY_NAME.pem temp-gorse-config.toml $SSH_USER@$EC2_IP:~/gorse-project/gorse-config.toml

# 一時ファイル削除
rm temp-gorse-config.toml

# ログディレクトリの作成
remote_exec "sudo mkdir -p /var/log/gorse && sudo chmod 777 /var/log/gorse"

echo "Gorse設定が本番環境用に更新されました。"
echo "Supabase接続URL: ${SUPABASE_URL}"
echo "Gorse API Key: ${GORSE_API_KEY}"
echo ""
echo "次のステップ: Gorseサーバーを起動してください。" 