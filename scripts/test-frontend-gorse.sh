#!/bin/bash

# フロントエンドとGorseの連携をテストするスクリプト

# IPアドレスを取得
if [ -f "gorse-ec2-ip.txt" ]; then
  EC2_IP=$(cat gorse-ec2-ip.txt)
else
  read -p "EC2インスタンスのIPアドレスを入力してください: " EC2_IP
fi

GORSE_ENDPOINT="http://${EC2_IP}:8087"
GORSE_API_KEY="kmKLLA5eCveQTVOVDftScxlWJaKmJJVbfSlPMZYSqno="

echo "フロントエンドとGorseの連携をテストしています..."

# 環境変数をローカル開発用に設定
echo "ローカル開発環境用の.env.localを作成しています..."
cat > .env.local << EOF
# Gorse推薦システム設定
NEXT_PUBLIC_GORSE_ENDPOINT=${GORSE_ENDPOINT}
GORSE_API_KEY=${GORSE_API_KEY}
EOF

echo ".env.localを作成しました。"

# フロントエンドテスト用のユーティリティを作成
echo "フロントエンドテストユーティリティを作成中..."
cat > scripts/test-gorse-frontend-connection.ts << EOF
/**
 * Gorse API接続テストスクリプト
 * 
 * 使用方法: npx ts-node scripts/test-gorse-frontend-connection.ts
 */

import { gorse, getSimilarItems, getRecommendations } from '../src/lib/gorse';

// ヘッダー出力関数
const printHeader = (text: string) => {
  console.log('\n' + '='.repeat(50));
  console.log(text);
  console.log('='.repeat(50));
};

// テスト実行
async function runTests() {
  try {
    // 設定情報の表示
    printHeader('Gorse API設定');
    console.log('Endpoint:', (gorse as any).config.endpoint);
    console.log('API Key:', (gorse as any).config.secret ? '設定済み' : '未設定');
    
    // サーバー接続テスト
    printHeader('サーバー接続テスト');
    try {
      const items = await gorse.getItems({n: 1});
      console.log('✅ サーバー接続成功');
      console.log('アイテム数:', items.length);
    } catch (err) {
      console.error('❌ サーバー接続エラー:', err);
    }
    
    // 類似アイテムテスト
    printHeader('類似アイテムテスト');
    try {
      // 最初のアイテムIDを取得
      const items = await gorse.getItems({n: 10});
      if (items.length > 0) {
        const firstItemId = items[0].ItemId;
        console.log('テスト対象アイテムID:', firstItemId);
        
        const similarItems = await getSimilarItems(firstItemId, 5);
        console.log('類似アイテム:', similarItems);
      } else {
        console.log('❌ テスト用アイテムがありません');
      }
    } catch (err) {
      console.error('❌ 類似アイテムテストエラー:', err);
    }
    
    // レコメンデーションテスト
    printHeader('レコメンデーションテスト');
    try {
      // 最初のユーザーIDを取得
      const users = await gorse.getUsers({n: 10});
      if (users.length > 0) {
        const firstUserId = users[0].UserId;
        console.log('テスト対象ユーザーID:', firstUserId);
        
        const recommendations = await getRecommendations(firstUserId, 5);
        console.log('レコメンデーション:', recommendations);
      } else {
        console.log('❌ テスト用ユーザーがありません');
      }
    } catch (err) {
      console.error('❌ レコメンデーションテストエラー:', err);
    }
    
    printHeader('テスト完了');
  } catch (err) {
    console.error('テスト実行中にエラーが発生しました:', err);
  }
}

// テスト実行
runTests();
EOF

echo "テストスクリプトを作成しました。以下のコマンドを実行してテストしてください："
echo "npx ts-node scripts/test-gorse-frontend-connection.ts"

echo ""
echo "またローカルでフロントエンドを起動して、実際のUIで確認することもできます："
echo "npm run dev"
echo ""
echo "ブラウザで製品詳細ページにアクセスして「似たアプリ」セクションが表示されるか確認してください。"
echo ""

echo "すべてのタスクが完了しました！"
echo ""
echo "【まとめ】"
echo "1. AWS EC2にGorseサーバーをデプロイ: http://${EC2_IP}:8088"
echo "2. Supabaseとの連携を設定"
echo "3. フロントエンドに推薦システムを統合"
echo "4. Vercel環境変数を設定"
echo ""
echo "これでGorse推薦システムの導入が完了しました！" 