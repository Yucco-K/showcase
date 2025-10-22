#!/bin/bash

# EC2インスタンスでのOpenAI API Key更新スクリプト
# 使用方法: ./scripts/update-ec2-openai-key.sh your_new_api_key_here

set -euo pipefail

NEW_API_KEY="$1"

if [[ -z "$NEW_API_KEY" ]]; then
    echo "エラー: 新しいAPIキーを指定してください"
    echo "使用方法: $0 your_new_api_key_here"
    exit 1
fi

# EC2のIPアドレスを取得
if [[ -f "gorse-ec2-ip.txt" ]]; then
    EC2_IP=$(cat gorse-ec2-ip.txt)
else
    read -p "EC2インスタンスのIPアドレスを入力してください: " EC2_IP
fi

KEY_NAME="gorse-key"
SSH_USER="ubuntu"

echo "🖥️  EC2インスタンス ($EC2_IP) でOpenAI API Keyを更新しています..."

# リモート実行関数
remote_exec() {
    ssh -i $KEY_NAME.pem -o StrictHostKeyChecking=no $SSH_USER@$EC2_IP "$1"
}

# 1. 現在の環境変数を確認
echo "📋 現在の環境変数を確認中..."
remote_exec "cd ~/gorse-project && cat .env | grep OPENAI_API_KEY || echo 'OPENAI_API_KEY not found'"

# 2. .env ファイルを更新
echo "📝 .env ファイルを更新中..."
remote_exec "cd ~/gorse-project && sed -i.bak 's/OPENAI_API_KEY=.*/OPENAI_API_KEY=$NEW_API_KEY/' .env"

# 3. 更新を確認
echo "✅ 更新後の環境変数を確認中..."
remote_exec "cd ~/gorse-project && cat .env | grep OPENAI_API_KEY"

# 4. システム環境変数も更新
echo "🔧 システム環境変数を更新中..."
remote_exec "echo 'export OPENAI_API_KEY=\"$NEW_API_KEY\"' >> ~/.bashrc"

# 5. サービス再起動
echo "🔄 サービスを再起動中..."
remote_exec "sudo systemctl restart gorse || echo 'Gorse service not found, trying Docker...'"
remote_exec "docker-compose restart || echo 'Docker Compose not found'"

# 6. 動作確認
echo "🔍 動作確認中..."
remote_exec "echo 'Environment variable: ' && echo \$OPENAI_API_KEY"
remote_exec "sudo systemctl status gorse --no-pager || echo 'Gorse service status not available'"

echo ""
echo "🎉 EC2インスタンスでのOpenAI API Key更新が完了しました！"
echo ""
echo "📋 確認事項:"
echo "1. 環境変数が正しく設定されているか"
echo "2. Gorseサービスが正常に動作しているか"
echo "3. エラーログがないか"
echo ""
echo "🔍 手動確認方法:"
echo "ssh -i gorse-key.pem ubuntu@$EC2_IP"
echo "cd ~/gorse-project && cat .env"
echo "sudo systemctl status gorse"
