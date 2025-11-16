#!/bin/bash

# AWS EC2インスタンスの費用制限設定スクリプト

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

echo "AWS EC2インスタンスの費用制限を設定しています..."

# 1. 自動停止スクリプトをEC2に転送
echo "自動停止スクリプトを作成中..."
cat > auto-shutdown.sh << EOF
#!/bin/bash

# 非アクティブ時に自動停止するスクリプト
# crontabで定期実行する

# 最後のAPIリクエスト時間を確認（Nginxログがある場合）
if [ -f /var/log/nginx/access.log ]; then
  LAST_REQUEST=\$(tail -n 100 /var/log/nginx/access.log | grep -v "health" | tail -n 1 | awk '{print \$4}')
  LAST_REQUEST_TIME=\$(date -d "\${LAST_REQUEST}" +%s 2>/dev/null)
  CURRENT_TIME=\$(date +%s)

  # 最後のリクエストから6時間以上経過していたら停止
  if [ ! -z "\$LAST_REQUEST_TIME" ] && [ \$((\$CURRENT_TIME - \$LAST_REQUEST_TIME)) -gt 21600 ]; then
    sudo shutdown -h now
  fi
fi

# CPU使用率が5%未満で1時間以上経過していたら停止
CPU_USAGE=\$(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - \$1}')
if (( \$(echo "\$CPU_USAGE < 5" | bc -l) )); then
  # 低CPU使用率カウンターファイル
  COUNTER_FILE="/tmp/low_cpu_counter"

  if [ -f \$COUNTER_FILE ]; then
    COUNT=\$(cat \$COUNTER_FILE)
    COUNT=\$((COUNT + 1))
    echo \$COUNT > \$COUNTER_FILE

    # 12回（1時間）以上低CPU使用率が続いたら停止
    if [ \$COUNT -gt 12 ]; then
      sudo shutdown -h now
    fi
  else
    echo "1" > \$COUNTER_FILE
  fi
else
  # CPU使用率が高い場合はカウンターをリセット
  echo "0" > /tmp/low_cpu_counter
fi
EOF

# スクリプトを転送
scp -i $KEY_NAME.pem auto-shutdown.sh $SSH_USER@$EC2_IP:~/

# スクリプトの権限設定
remote_exec "chmod +x ~/auto-shutdown.sh"

# crontabに設定（5分ごとに実行）
remote_exec '(crontab -l 2>/dev/null || echo "") | { cat; echo "*/5 * * * * ~/auto-shutdown.sh"; } | crontab -'

# 2. AWS CLIで予算アラートを設定
echo "AWS予算アラートを設定中..."

# インスタンスIDを取得
INSTANCE_ID=$(aws ec2 describe-instances --filters "Name=ip-address,Values=${EC2_IP}" --query "Reservations[0].Instances[0].InstanceId" --output text)

if [ -z "$INSTANCE_ID" ]; then
  echo "インスタンスIDが見つかりません。AWS予算アラートの設定をスキップします。"
else
  # 予算名を設定
  BUDGET_NAME="Gorse-EC2-Budget-${INSTANCE_ID}"

  # 予算設定JSONファイルを作成
  cat > budget.json << EOF
{
  "BudgetName": "${BUDGET_NAME}",
  "BudgetLimit": {
    "Amount": "25",
    "Unit": "USD"
  },
  "BudgetType": "COST",
  "CostFilters": {
    "Service": ["Amazon Elastic Compute Cloud - Compute"]
  },
  "CostTypes": {
    "IncludeTax": true,
    "IncludeSubscription": true,
    "UseBlended": false,
    "IncludeRefund": false,
    "IncludeCredit": false,
    "IncludeUpfront": true,
    "IncludeRecurring": true,
    "IncludeOtherSubscription": true,
    "IncludeSupport": true,
    "IncludeDiscount": true,
    "UseAmortized": false
  },
  "TimeUnit": "MONTHLY",
  "TimePeriod": {
    "Start": $(date +%s),
    "End": 2147483647
  },
  "NotificationsWithSubscribers": [
    {
      "Notification": {
        "NotificationType": "ACTUAL",
        "ComparisonOperator": "GREATER_THAN",
        "Threshold": 80,
        "ThresholdType": "PERCENTAGE",
        "NotificationState": "ALARM"
      },
      "Subscribers": [
        {
          "SubscriptionType": "EMAIL",
          "Address": "$(aws iam get-user --query 'User.UserName' --output text)@example.com"
        }
      ]
    },
    {
      "Notification": {
        "NotificationType": "ACTUAL",
        "ComparisonOperator": "GREATER_THAN",
        "Threshold": 100,
        "ThresholdType": "PERCENTAGE",
        "NotificationState": "ALARM"
      },
      "Subscribers": [
        {
          "SubscriptionType": "EMAIL",
          "Address": "$(aws iam get-user --query 'User.UserName' --output text)@example.com"
        }
      ]
    }
  ]
}
EOF

  # 通知先メールアドレスを設定
  read -p "予算アラート通知先のメールアドレスを入力してください: " EMAIL
  sed -i "s/@example.com/@${EMAIL#*@}/g" budget.json

  # 予算を作成
  aws budgets create-budget --account-id $(aws sts get-caller-identity --query 'Account' --output text) --budget file://budget.json

  echo "予算アラート「${BUDGET_NAME}」を設定しました。"
  echo "月額$25（約83%）に達すると通知が届きます。"
fi

# 3. インスタンスタイプ変更のガイダンス
echo ""
echo "【費用削減のためのインスタンスタイプ変更】"
echo "現在のインスタンスタイプを確認中..."

CURRENT_TYPE=$(aws ec2 describe-instances --instance-ids $INSTANCE_ID --query 'Reservations[0].Instances[0].InstanceType' --output text)
echo "現在のインスタンスタイプ: $CURRENT_TYPE"

echo ""
echo "費用削減のため、より小さいインスタンスタイプに変更することができます："
echo "- t3.micro: 約$8-10/月 (2 vCPU, 1GB RAM)"
echo "- t3.nano: 約$4-5/月 (2 vCPU, 0.5GB RAM)"
echo ""
echo "インスタンスタイプを変更するには、インスタンスを停止してから以下のコマンドを実行します："
echo "aws ec2 stop-instances --instance-ids $INSTANCE_ID"
echo "aws ec2 modify-instance-attribute --instance-id $INSTANCE_ID --instance-type {new-type}"
echo "aws ec2 start-instances --instance-ids $INSTANCE_ID"
echo ""
echo "注意: t3.nanoはメモリが少ないため、Gorseが正常に動作しない可能性があります。"
echo "     t3.microが最小推奨サイズです。"

echo ""
echo "費用制限の設定が完了しました。"
echo "1. 自動停止スクリプトが設定されました（非アクティブ時に自動停止）"
echo "2. AWS予算アラートが設定されました（月額$25で通知）"
echo "3. インスタンスタイプ変更のガイダンスが表示されました"

# 一時ファイルの削除
rm -f auto-shutdown.sh budget.json
