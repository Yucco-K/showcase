#!/bin/bash

# Gorseサーバーを起動するスクリプト

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

echo "Gorseサーバーを起動しています..."

# プロジェクトディレクトリに移動してDockerコンテナを起動
remote_exec "cd ~/gorse-project && sudo docker-compose -f docker-compose.gorse.yml up -d"

# コンテナの状態を確認
echo "Dockerコンテナの状態を確認中..."
remote_exec "sudo docker ps"

# Gorseサーバーが稼働するまで待機
echo "Gorseサーバーが起動するまで待機中..."
sleep 30  # 初期起動を待機

# エンドポイント情報を表示
echo ""
echo "============ Gorse サーバー情報 ============"
echo "Gorseサーバーが起動しました。"
echo "パブリックIP: ${EC2_IP}"
echo ""
echo "API エンドポイント: http://${EC2_IP}:8087"
echo "管理ダッシュボード: http://${EC2_IP}:8088"
echo ""
echo "APIキー: ${GORSE_API_KEY:-未設定（認証無効化）}"
echo ""
echo "Vercel環境変数として以下を設定してください:"
echo "NEXT_PUBLIC_GORSE_ENDPOINT=http://${EC2_IP}:8087"
echo "GORSE_API_KEY=${GORSE_API_KEY:-}"
echo "============================================"
echo ""
echo "次のステップ: データをGorseに同期してください。"

# Vercel環境変数情報をファイルに保存
cat > vercel-env-vars.txt << EOF
NEXT_PUBLIC_GORSE_ENDPOINT=http://${EC2_IP}:8087
GORSE_API_KEY=${GORSE_API_KEY:-}
EOF

echo "環境変数情報を vercel-env-vars.txt に保存しました。"
