#!/bin/bash

# OpenAI API Key更新スクリプト
# 使用方法: ./scripts/update-openai-key.sh your_new_api_key_here

set -euo pipefail

NEW_API_KEY="$1"

if [[ -z "$NEW_API_KEY" ]]; then
    echo "エラー: 新しいAPIキーを指定してください"
    echo "使用方法: $0 your_new_api_key_here"
    exit 1
fi

echo "🔑 OpenAI API Keyを更新しています..."

# 1. ローカル .env ファイルの更新
if [[ -f ".env" ]]; then
    echo "📝 ローカル .env ファイルを更新中..."
    if grep -q "OPENAI_API_KEY=" .env; then
        sed -i.bak "s/OPENAI_API_KEY=.*/OPENAI_API_KEY=$NEW_API_KEY/" .env
        echo "✅ .env ファイルを更新しました"
    else
        echo "OPENAI_API_KEY=$NEW_API_KEY" >> .env
        echo "✅ .env ファイルにOPENAI_API_KEYを追加しました"
    fi
else
    echo "⚠️  .env ファイルが見つかりません。手動で作成してください"
fi

# 2. Vercel環境変数の更新
echo ""
echo "🚀 Vercel環境変数を更新中..."

# Vercel CLIがインストールされているか確認
if command -v vercel &> /dev/null; then
    echo "Vercel CLIが見つかりました。環境変数を更新します..."
    
    # 既存の環境変数を削除（エラーを無視）
    echo "既存の環境変数を削除中..."
    vercel env rm OPENAI_API_KEY production 2>/dev/null || true
    vercel env rm OPENAI_API_KEY development 2>/dev/null || true
    vercel env rm OPENAI_API_KEY preview 2>/dev/null || true
    
    # 本番環境
    echo "本番環境を更新中..."
    echo -n "$NEW_API_KEY" | vercel env add OPENAI_API_KEY production
    
    # 開発環境
    echo "開発環境を更新中..."
    echo -n "$NEW_API_KEY" | vercel env add OPENAI_API_KEY development
    
    # プレビュー環境
    echo "プレビュー環境を更新中..."
    echo -n "$NEW_API_KEY" | vercel env add OPENAI_API_KEY preview
    
    echo "✅ Vercel環境変数を更新しました"
else
    echo "⚠️  Vercel CLIがインストールされていません"
    echo "手動でVercelダッシュボードから更新してください:"
    echo "1. https://vercel.com/dashboard にアクセス"
    echo "2. プロジェクト 'showcase' を選択"
    echo "3. Settings > Environment Variables"
    echo "4. OPENAI_API_KEY を更新"
fi

# 3. Supabase環境変数の更新
echo ""
echo "🗄️  Supabase環境変数を更新中..."

if command -v npx &> /dev/null; then
    echo "Supabase CLIで環境変数を更新中..."
    npx supabase secrets set OPENAI_API_KEY="$NEW_API_KEY"
    echo "✅ Supabase環境変数を更新しました"
else
    echo "⚠️  npxが見つかりません。手動でSupabaseから更新してください"
fi

echo ""
echo "🎉 OpenAI API Keyの更新が完了しました！"
echo ""
echo "📋 次のステップ:"
echo "1. アプリケーションを再デプロイしてください"
echo "2. チャットボット機能をテストしてください"
echo "3. エラーがないかログを確認してください"
echo ""
echo "🔍 確認方法:"
echo "- ローカル: npm run dev でローカルサーバーを起動"
echo "- 本番: Vercelダッシュボードで再デプロイ"
echo "- Supabase: Edge Functionsのログを確認"
