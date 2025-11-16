#!/bin/bash

# AWSアカウント設定自動化スクリプト

echo "=================================="
echo "AWSアカウント設定（自動化版）"
echo "=================================="
echo ""

# AWS CLIがインストールされているかチェック
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLIがインストールされていません。"
    echo "インストール中..."
    if command -v brew &> /dev/null; then
        brew install awscli
    else
        echo "Homebrewがインストールされていません。手動でAWS CLIをインストールしてください。"
        exit 1
    fi
fi

echo "✅ AWS CLIがインストールされています"
echo ""

# 現在の設定を確認
echo "現在のAWS設定を確認中..."
if aws sts get-caller-identity &> /dev/null; then
    echo "✅ AWS認証情報が設定されています"
    echo ""
    echo "現在の設定："
    aws sts get-caller-identity
    echo ""
    echo "設定は既に完了しています。"
    exit 0
else
    echo "❌ AWS認証情報が設定されていません"
    echo ""
fi

# 環境変数から認証情報を取得
if [ -n "$AWS_ACCESS_KEY_ID" ] && [ -n "$AWS_SECRET_ACCESS_KEY" ]; then
    echo "環境変数からAWS認証情報を取得中..."
    aws_access_key_id="$AWS_ACCESS_KEY_ID"
    aws_secret_access_key="$AWS_SECRET_ACCESS_KEY"
    aws_region="${AWS_DEFAULT_REGION:-ap-northeast-1}"

    # AWS CLI設定
    echo "AWS CLIを設定中..."
    aws configure set aws_access_key_id "$aws_access_key_id"
    aws configure set aws_secret_access_key "$aws_secret_access_key"
    aws configure set default.region "$aws_region"
    aws configure set default.output json

    echo "✅ 環境変数から設定完了"
else
    echo "環境変数にAWS認証情報が設定されていません。"
    echo ""
    echo "以下の環境変数を設定してください："
    echo "export AWS_ACCESS_KEY_ID=your-access-key-id"
    echo "export AWS_SECRET_ACCESS_KEY=your-secret-access-key"
    echo "export AWS_DEFAULT_REGION=ap-northeast-1"
    echo ""
    echo "または、手動で設定する場合は以下を実行してください："
    echo "./scripts/setup-aws-config.sh"
    echo ""
    exit 1
fi

# 設定の確認
echo ""
echo "設定を確認中..."
if aws sts get-caller-identity &> /dev/null; then
    echo "✅ AWS認証情報の設定が完了しました"
    echo ""
    echo "設定内容："
    aws sts get-caller-identity
    echo ""
    echo "リージョン: $aws_region"
    echo ""

    # 必要な権限の確認
    echo "権限の確認中..."

    # EC2権限の確認
    if aws ec2 describe-regions &> /dev/null; then
        echo "✅ EC2権限: OK"
    else
        echo "❌ EC2権限: 不足"
    fi

    # 予算権限の確認
    if aws budgets describe-budgets &> /dev/null; then
        echo "✅ 予算権限: OK"
    else
        echo "⚠️ 予算権限: 不足（費用制限機能が利用できません）"
    fi

    echo ""
    echo "設定が完了しました！"
    echo "次に './scripts/deploy-gorse-master.sh' を実行してください。"

else
    echo "❌ AWS認証情報の設定に失敗しました"
    echo "アクセスキーとシークレットキーを確認してください。"
    exit 1
fi
