#!/bin/bash

# Gorse APIの動作を確認するスクリプト

# IPアドレスを取得
if [ -f "gorse-ec2-ip.txt" ]; then
  EC2_IP=$(cat gorse-ec2-ip.txt)
else
  read -p "EC2インスタンスのIPアドレスを入力してください: " EC2_IP
fi

API_ENDPOINT="http://${EC2_IP}:8087"
API_KEY="${GORSE_API_KEY:-}"

echo "Gorse APIの動作を確認しています..."
echo "API Endpoint: ${API_ENDPOINT}"

# ヘルスチェック
echo "1. ヘルスチェックを実行中..."
health_status=$(curl -s -o /dev/null -w "%{http_code}" ${API_ENDPOINT}/api/health)
if [ "$health_status" == "200" ]; then
  echo "✅ ヘルスチェック成功 (HTTP 200)"
else
  echo "❌ ヘルスチェック失敗 (HTTP ${health_status})"
fi

# 認証テスト（APIキーを使用）
echo "2. APIキー認証テストを実行中..."
auth_status=$(curl -s -o /dev/null -w "%{http_code}" -H "X-API-Key: ${API_KEY}" ${API_ENDPOINT}/api/item)
if [ "$auth_status" == "200" ]; then
  echo "✅ APIキー認証テスト成功 (HTTP 200)"
else
  echo "❌ APIキー認証テスト失敗 (HTTP ${auth_status})"
fi

# 商品一覧取得テスト
echo "3. 商品一覧を取得中..."
items_response=$(curl -s -H "X-API-Key: ${API_KEY}" ${API_ENDPOINT}/api/items?n=5)
echo "商品データサンプル:"
echo "${items_response}" | head -n 20
echo "..."

# ユーザー一覧取得テスト
echo "4. ユーザー一覧を取得中..."
users_response=$(curl -s -H "X-API-Key: ${API_KEY}" ${API_ENDPOINT}/api/users?n=5)
echo "ユーザーデータサンプル:"
echo "${users_response}" | head -n 20
echo "..."

# レコメンデーション取得テスト（最初のユーザーID）
echo "5. 推薦データを取得中..."
first_user=$(echo "${users_response}" | grep -o '"UserId":"[^"]*"' | head -n 1 | cut -d'"' -f4)

if [ -n "$first_user" ]; then
  echo "ユーザー ${first_user} の推薦データを取得中..."
  recommend_response=$(curl -s -H "X-API-Key: ${API_KEY}" "${API_ENDPOINT}/api/recommend/${first_user}?n=5")
  echo "推薦データサンプル:"
  echo "${recommend_response}" | head -n 20
else
  echo "❌ ユーザーIDが見つからないため推薦データテストをスキップします"
fi

echo ""
echo "API検証が完了しました。"
echo ""
echo "Web UIダッシュボード: http://${EC2_IP}:8088"
echo ""
echo "次のステップ: Vercel環境変数を設定してください。"
