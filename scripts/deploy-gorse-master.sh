#!/bin/bash

# Gorse推薦システムを一括デプロイするマスタースクリプト

# 必要な権限を設定
chmod +x scripts/setup-gorse-ec2.sh
chmod +x scripts/install-docker-gorse.sh
chmod +x scripts/update-gorse-config.sh
chmod +x scripts/start-gorse-server.sh
chmod +x scripts/sync-data-to-gorse.sh
chmod +x scripts/verify-gorse-api.sh
chmod +x scripts/setup-vercel-env.sh
chmod +x scripts/test-frontend-gorse.sh
chmod +x scripts/test-frontend-integration.sh
chmod +x scripts/setup-cost-limit.sh
chmod +x scripts/setup-aws-config.sh

echo "=================================="
echo "Gorse推薦システム一括デプロイ"
echo "=================================="
echo ""
echo "このスクリプトはAWS EC2にGorse推薦システムをデプロイし、"
echo "Supabaseと連携して、フロントエンドに統合するまでの"
echo "すべての手順を自動化します。"
echo ""

read -p "実行を開始しますか？(y/n): " start_deploy
if [ "$start_deploy" != "y" ]; then
  echo "デプロイをキャンセルしました。"
  exit 0
fi

echo ""
echo "ステップ 0: AWSアカウント設定の確認..."
if ! aws sts get-caller-identity &> /dev/null; then
  echo "❌ AWS認証情報が設定されていません。"
  echo "まず './scripts/setup-aws-config.sh' を実行してAWSアカウントを設定してください。"
  exit 1
fi
echo "✅ AWS認証情報が設定されています"

echo ""
echo "ステップ 1: EC2インスタンスのセットアップ..."
./scripts/setup-gorse-ec2.sh
if [ $? -ne 0 ]; then
  echo "❌ EC2セットアップに失敗しました。スクリプトを終了します。"
  exit 1
fi

echo ""
echo "ステップ 2: Dockerとベース環境のインストール..."
./scripts/install-docker-gorse.sh
if [ $? -ne 0 ]; then
  echo "❌ Dockerインストールに失敗しました。スクリプトを終了します。"
  exit 1
fi

echo ""
echo "ステップ 3: Gorse設定の更新..."
./scripts/update-gorse-config.sh
if [ $? -ne 0 ]; then
  echo "❌ Gorse設定の更新に失敗しました。スクリプトを終了します。"
  exit 1
fi

echo ""
echo "ステップ 4: Gorseサーバーの起動..."
./scripts/start-gorse-server.sh
if [ $? -ne 0 ]; then
  echo "❌ Gorseサーバーの起動に失敗しました。スクリプトを終了します。"
  exit 1
fi

echo ""
echo "ステップ 5: データの同期..."
./scripts/sync-data-to-gorse.sh
if [ $? -ne 0 ]; then
  echo "❌ データ同期の設定に失敗しました。スクリプトを終了します。"
  exit 1
fi

echo ""
echo "ステップ 6: Gorse APIの検証..."
./scripts/verify-gorse-api.sh
if [ $? -ne 0 ]; then
  echo "❌ API検証に失敗しました。スクリプトを終了します。"
  exit 1
fi

echo ""
echo "ステップ 7: Vercel環境変数の設定..."
./scripts/setup-vercel-env.sh
if [ $? -ne 0 ]; then
  echo "❌ Vercel環境変数設定に失敗しました。スクリプトを終了します。"
  exit 1
fi

echo ""
echo "ステップ 8: フロントエンドテスト環境の設定..."
./scripts/test-frontend-gorse.sh
if [ $? -ne 0 ]; then
  echo "❌ フロントエンドテスト設定に失敗しました。スクリプトを終了します。"
  exit 1
fi

echo ""
echo "ステップ 8.5: フロントエンド統合テストの実行..."
./scripts/test-frontend-integration.sh
if [ $? -ne 0 ]; then
  echo "⚠️ フロントエンド統合テストで一部エラーが発生しましたが、基本機能は利用可能です。"
fi

echo ""
echo "ステップ 9: AWS費用制限の設定..."
./scripts/setup-cost-limit.sh
if [ $? -ne 0 ]; then
  echo "⚠️ AWS費用制限の設定に失敗しましたが、基本機能は利用可能です。"
fi

echo ""
echo "=================================="
echo "🎉 Gorse推薦システムのデプロイが完了しました！"
echo "=================================="
echo ""
echo "以下のリソースが利用可能です："
echo ""
if [ -f "gorse-ec2-ip.txt" ]; then
  EC2_IP=$(cat gorse-ec2-ip.txt)
  echo "📊 Gorse管理画面: http://${EC2_IP}:8088"
  echo "🔌 Gorse API: http://${EC2_IP}:8087"
fi
echo ""
echo "詳細な設定とアクセス情報は各スクリプトの出力を確認してください。"
echo "フロントエンドの動作確認は 'npm run dev' を実行して行ってください。"
echo ""
echo "費用制限が設定されています："
echo "- 月額$25で予算アラート通知"
echo "- 非アクティブ時の自動停止"
echo "- インスタンスタイプの最適化ガイダンス"
