#!/bin/bash

# EC2インスタンスにDockerとGorseをセットアップするスクリプト

# IPアドレスを取得
if [ -f "gorse-ec2-ip.txt" ]; then
  EC2_IP=$(cat gorse-ec2-ip.txt)
else
  read -p "EC2インスタンスのIPアドレスを入力してください: " EC2_IP
fi

KEY_NAME="gorse-key"
SSH_USER="ubuntu"

echo "EC2インスタンス $EC2_IP にDockerとGorseをセットアップしています..."

# リモート実行関数
remote_exec() {
  ssh -i $KEY_NAME.pem -o StrictHostKeyChecking=no $SSH_USER@$EC2_IP "$1"
}

# SSHが有効になるまで待機
echo "SSHが有効になるまで待機中..."
until remote_exec "echo SSH接続完了" &> /dev/null; do
  echo -n "."
  sleep 5
done
echo ""

# システムアップデート
echo "システムをアップデート中..."
remote_exec "sudo apt-get update && sudo apt-get upgrade -y"

# Dockerインストール
echo "Dockerをインストール中..."
remote_exec "sudo apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release"
remote_exec "curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg"
remote_exec 'echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null'
remote_exec "sudo apt-get update && sudo apt-get install -y docker-ce docker-ce-cli containerd.io"

# Dockerユーザー設定
echo "Dockerユーザー権限を設定中..."
remote_exec "sudo usermod -aG docker $USER"

# Docker Composeインストール
echo "Docker Composeをインストール中..."
remote_exec 'sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose'
remote_exec "sudo chmod +x /usr/local/bin/docker-compose"

# プロジェクトディレクトリ作成
echo "Gorseプロジェクトディレクトリを作成中..."
remote_exec "mkdir -p ~/gorse-project"

# ファイル転送
echo "設定ファイルを転送中..."
scp -i $KEY_NAME.pem docker-compose.gorse.yml $SSH_USER@$EC2_IP:~/gorse-project/
scp -i $KEY_NAME.pem gorse-config.toml $SSH_USER@$EC2_IP:~/gorse-project/

echo "Dockerのインストールが完了しました。"
echo "次のステップ: Gorse設定ファイルを本番環境用に更新してください。"
