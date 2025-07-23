#!/bin/bash

# AWS EC2インスタンス作成スクリプト - Gorse推薦システム用

# 変数設定
INSTANCE_TYPE="t3.small"
AMI_ID="ami-00ea3690582cf02ee" # Amazon Linux 2023（最新）
KEY_NAME="gorse-key"  # 既存のキーペア名、または新規作成する名前
SECURITY_GROUP_NAME="gorse-sg"
INSTANCE_NAME="gorse-recommendation-server"

echo "Gorseサーバー用のAWS EC2インスタンスをセットアップしています..."

# デフォルトVPCの取得
echo "デフォルトVPCを取得中..."
DEFAULT_VPC_ID=$(aws ec2 describe-vpcs \
  --filters "Name=is-default,Values=true" \
  --query 'Vpcs[0].VpcId' \
  --output text)

if [ "$DEFAULT_VPC_ID" = "None" ] || [ -z "$DEFAULT_VPC_ID" ]; then
  echo "デフォルトVPCが見つかりません。最初のVPCを使用します..."
  DEFAULT_VPC_ID=$(aws ec2 describe-vpcs \
    --query 'Vpcs[0].VpcId' \
    --output text)
fi

if [ "$DEFAULT_VPC_ID" = "None" ] || [ -z "$DEFAULT_VPC_ID" ]; then
  echo "❌ VPCが見つかりません。AWSコンソールでVPCを作成してください。"
  exit 1
fi

echo "使用するVPC: $DEFAULT_VPC_ID"

# セキュリティグループの作成または取得
echo "セキュリティグループを確認中..."
SG_ID=$(aws ec2 describe-security-groups \
  --filters "Name=group-name,Values=$SECURITY_GROUP_NAME" "Name=vpc-id,Values=$DEFAULT_VPC_ID" \
  --query 'SecurityGroups[0].GroupId' \
  --output text)

if [ "$SG_ID" = "None" ] || [ -z "$SG_ID" ]; then
  echo "セキュリティグループを作成中..."
  SG_ID=$(aws ec2 create-security-group \
    --group-name $SECURITY_GROUP_NAME \
    --description "Security group for Gorse recommendation system" \
    --vpc-id $DEFAULT_VPC_ID \
    --query 'GroupId' \
    --output text)
else
  echo "既存のセキュリティグループを使用: $SG_ID"
fi

# セキュリティグループルールの設定
echo "セキュリティグループルールを設定中..."

# SSHポート（22）のルールを追加（エラーは無視）
echo "SSHポート（22）のルールを追加中..."
aws ec2 authorize-security-group-ingress \
  --group-id $SG_ID \
  --protocol tcp \
  --port 22 \
  --cidr 0.0.0.0/0 2>/dev/null || echo "SSHポート（22）のルールは既に存在します"

# Gorseポート（8086-8088）のルールを追加（エラーは無視）
echo "Gorseポート（8086-8088）のルールを追加中..."
aws ec2 authorize-security-group-ingress \
  --group-id $SG_ID \
  --protocol tcp \
  --port 8086-8088 \
  --cidr 0.0.0.0/0 2>/dev/null || echo "Gorseポート（8086-8088）のルールは既に存在します"

# キーペアが存在しなければ作成
if ! aws ec2 describe-key-pairs --key-names $KEY_NAME &> /dev/null; then
  echo "キーペアを作成中..."
  aws ec2 create-key-pair \
    --key-name $KEY_NAME \
    --query 'KeyMaterial' \
    --output text > $KEY_NAME.pem
  
  # パーミッション設定
  chmod 400 $KEY_NAME.pem
  echo "キーペアが作成され、$KEY_NAME.pemとして保存されました"
else
  echo "キーペア $KEY_NAME は既に存在します"
fi

# サブネットの取得
echo "サブネットを取得中..."
SUBNET_ID=$(aws ec2 describe-subnets \
  --filters "Name=vpc-id,Values=$DEFAULT_VPC_ID" "Name=state,Values=available" \
  --query 'Subnets[0].SubnetId' \
  --output text)

echo "使用するサブネット: $SUBNET_ID"

# EC2インスタンスの作成
echo "EC2インスタンスを起動中..."
INSTANCE_ID=$(aws ec2 run-instances \
  --image-id $AMI_ID \
  --count 1 \
  --instance-type $INSTANCE_TYPE \
  --key-name $KEY_NAME \
  --security-group-ids $SG_ID \
  --subnet-id $SUBNET_ID \
  --associate-public-ip-address \
  --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=$INSTANCE_NAME}]" \
  --query 'Instances[0].InstanceId' \
  --output text)

echo "インスタンス $INSTANCE_ID を起動中..."

# インスタンスが実行状態になるのを待機
echo "インスタンスが起動するのを待機中..."
aws ec2 wait instance-running --instance-ids $INSTANCE_ID

# パブリックIPアドレスの取得
PUBLIC_IP=$(aws ec2 describe-instances \
  --instance-ids $INSTANCE_ID \
  --query 'Reservations[0].Instances[0].PublicIpAddress' \
  --output text)

echo "Gorseサーバーのセットアップが完了しました！"
echo "インスタンスID: $INSTANCE_ID"
echo "パブリックIP: $PUBLIC_IP"
echo "SSHコマンド: ssh -i $KEY_NAME.pem ubuntu@$PUBLIC_IP"
echo ""
echo "次のステップ: スクリプトを使ってDockerとGorseをインストールしてください"

# IPアドレスをファイルに保存（後続のスクリプトで使用）
echo $PUBLIC_IP > gorse-ec2-ip.txt 