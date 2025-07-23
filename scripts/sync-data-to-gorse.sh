#!/bin/bash

# SupabaseからGorseにデータを同期するスクリプト

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

echo "データ同期スクリプトをEC2インスタンスに転送しています..."

# 必要なスクリプトを転送
scp -i $KEY_NAME.pem scripts/sync-gorse-products.ts $SSH_USER@$EC2_IP:~/gorse-project/
scp -i $KEY_NAME.pem scripts/generate-gorse-similarities.ts $SSH_USER@$EC2_IP:~/gorse-project/

# EC2インスタンス上にNode.jsをインストール
echo "Node.jsとnpmをインストールしています..."
remote_exec "curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -"
remote_exec "sudo apt-get install -y nodejs"

# 必要なパッケージをインストール
echo "必要なNode.jsパッケージをインストールしています..."
remote_exec "cd ~/gorse-project && npm init -y"
remote_exec "cd ~/gorse-project && npm install typescript ts-node dotenv @supabase/supabase-js gorsejs"

# 環境変数ファイルを作成
echo "環境変数ファイルを作成しています..."
remote_exec "cat > ~/gorse-project/.env << EOF
VITE_SUPABASE_URL=YOUR_SUPABASE_URL
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
NEXT_PUBLIC_GORSE_ENDPOINT=http://localhost:8087
GORSE_API_KEY=kmKLLA5eCveQTVOVDftScxlWJaKmJJVbfSlPMZYSqno=
EOF"

echo "環境変数を設定してください。"
echo "リモートサーバーに接続して以下のコマンドを実行し、Supabase認証情報を設定します："
echo "ssh -i ${KEY_NAME}.pem ${SSH_USER}@${EC2_IP}"
echo "nano ~/gorse-project/.env"

echo ""
echo "環境変数を設定したら、以下のコマンドでデータを同期できます："
echo "1. 製品データの同期:"
echo "   cd ~/gorse-project && npx ts-node sync-gorse-products.ts"
echo ""
echo "2. テストデータと類似性の生成:"
echo "   cd ~/gorse-project && npx ts-node generate-gorse-similarities.ts"

echo ""
echo "次のステップ: Gorse APIの動作を確認してください。" 