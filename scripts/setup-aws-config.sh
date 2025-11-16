#!/bin/bash

# AWSアカウント設定スクリプト

echo "=================================="
echo "AWSアカウント設定"
echo "=================================="
echo ""
echo "このスクリプトはAWS CLIの設定を行います。"
echo "AWSアカウントのアクセスキーとシークレットキーが必要です。"
echo ""

# AWS CLIがインストールされているかチェック
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLIがインストールされていません。"
    echo ""
    echo "インストール方法："
    echo "macOS: brew install awscli"
    echo "Ubuntu: sudo apt-get install awscli"
    echo "Windows: https://aws.amazon.com/cli/"
    echo ""
    exit 1
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

    read -p "設定を変更しますか？(y/n): " change_config
    if [ "$change_config" != "y" ]; then
        echo "設定を変更しません。"
        exit 0
    fi
else
    echo "❌ AWS認証情報が設定されていません"
    echo ""
fi

# 新しい設定を入力
echo "AWS認証情報を設定します..."
echo ""

read -p "AWS Access Key ID: " aws_access_key_id
read -s -p "AWS Secret Access Key: " aws_secret_access_key
echo ""
read -p "Default region (例: ap-northeast-1): " aws_region

# デフォルトリージョンの設定
aws_region=${aws_region:-"ap-northeast-1"}

# AWS CLI設定
echo ""
echo "AWS CLIを設定中..."
aws configure set aws_access_key_id "$aws_access_key_id"
aws configure set aws_secret_access_key "$aws_secret_access_key"
aws configure set default.region "$aws_region"
aws configure set default.output json

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
