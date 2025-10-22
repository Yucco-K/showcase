# AWS コスト最適化ガイド - Gorse 推薦システム

## 💰 料金概算

### 現在の構成（t3.small）

| 項目               | 単価         | 月額            | 備考               |
| ------------------ | ------------ | --------------- | ------------------ |
| **EC2 (t3.small)** | $0.0272/時間 | **$19.78**      | 2GB RAM, 2 vCPU    |
| **EBS (30GB)**     | $0.12/GB/月  | **$3.60**       | ストレージ         |
| **データ転送**     | $0.114/GB    | **~$1-5**       | 出力データのみ課金 |
| **合計**           | -            | **約$24-28/月** | **約 3,500 円**    |

### 1 リクエストあたりのコスト

| 項目                   | コスト             |
| ---------------------- | ------------------ |
| **コンピューティング** | 0.0075 円          |
| **データ転送 (2KB)**   | 0.0002 円          |
| **合計**               | **約 0.008 円/回** |

**月間 10,000 リクエストで約 80 円のコスト**

---

## 🎯 コスト削減策

### 1. ✅ キャッシュ機能（実装済み）

**効果**: 同じリクエストを 5 分間キャッシュ → **最大 90%削減**

```typescript
// src/lib/gorse.ts に実装済み
- キャッシュ時間: 5分
- 重複リクエスト防止
- メモリベースの高速キャッシュ
```

**節約額**: 月間 10,000 リクエスト → 実質 1,000 リクエスト = **約 72 円削減**

### 1-2. ✅ レート制限（実装済み）

**効果**: 悪意のあるユーザーによる大量アクセスを防止

```typescript
// 1ユーザーあたりの制限
- 1時間あたり: 30リクエスト
- 1日あたり: 100リクエスト
- ユーザー識別: ログインユーザーIDまたはブラウザフィンガープリント
```

**動作**:

- 制限を超えたユーザーには警告メッセージを表示
- 他のユーザーには影響なし
- LocalStorage を使用してクライアント側で管理

**カスタマイズ**:

```typescript
// src/lib/gorse.ts で調整可能
private maxRequestsPerDay = 100;   // 1日の上限
private maxRequestsPerHour = 30;   // 1時間の上限
```

**節約額**: 不正アクセス防止により**無制限のコスト増加を防止**

### 1-3. ✅ チャットボットのレート制限（実装済み）

**効果**: チャットボットの大量利用を防止（OpenAI API コスト削減）

```typescript
// 1ユーザーあたりの制限
- 1時間あたり: 50リクエスト
- 1日あたり: 100リクエスト
- ユーザー識別: ブラウザフィンガープリント
```

**動作**:

- チャットウィンドウに残りのリクエスト数を表示
- 制限超過時は明確なエラーメッセージを表示
- 20 回以下で警告色（黄色）、10 回以下で危険色（赤）

**OpenAI API コスト**:

```
GPT-4: $0.03/1,000トークン（入力）
平均的なチャット: 約500トークン = $0.015/回

制限なし: 無制限 → 最悪数万円
制限あり: 100回/日 × 100ユーザー = 月額約$450 (約65,000円)
```

**カスタマイズ**:

```typescript
// src/api/chat.ts で調整可能
private maxRequestsPerDay = 100;   // 1日の上限
private maxRequestsPerHour = 50;   // 1時間の上限
```

**節約額**: OpenAI API の不正利用防止により**数万円のコスト増加を防止**

### 2. 🛑 インスタンスの停止

**本番以外では必ず停止してください！**

```bash
# EC2インスタンスを停止
aws ec2 stop-instances --instance-ids i-030b78b382d5290c6

# 起動
aws ec2 start-instances --instance-ids i-030b78b382d5290c6
```

**節約額**:

- 停止時間: 1 日 12 時間 → **月額$9.89 削減 (約 1,400 円)**
- 停止時間: 週末 48 時間 → **月額$6.70 削減 (約 950 円)**

### 3. 💡 より小さいインスタンスタイプ

| タイプ              | 時間単価 | 月額  | 節約額                     |
| ------------------- | -------- | ----- | -------------------------- |
| **t3.micro**        | $0.0136  | $9.93 | **$9.85 削減 (1,400 円)**  |
| **t4g.micro** (ARM) | $0.0109  | $7.96 | **$11.82 削減 (1,680 円)** |

**変更方法**:

```bash
# インスタンスを停止
aws ec2 stop-instances --instance-ids i-030b78b382d5290c6

# インスタンスタイプを変更
aws ec2 modify-instance-attribute \
  --instance-id i-030b78b382d5290c6 \
  --instance-type "{\"Value\": \"t3.micro\"}"

# 起動
aws ec2 start-instances --instance-ids i-030b78b382d5290c6
```

### 4. 🔒 IP ベースのアクセス制限

開発者の IP アドレスのみ許可:

```bash
# セキュリティグループIDを取得
SG_ID=$(aws ec2 describe-instances \
  --instance-ids i-030b78b382d5290c6 \
  --query 'Reservations[0].Instances[0].SecurityGroups[0].GroupId' \
  --output text)

# 現在の8087ポートルールを削除
aws ec2 revoke-security-group-ingress \
  --group-id $SG_ID \
  --protocol tcp \
  --port 8087 \
  --cidr 0.0.0.0/0

# 自分のIPのみ許可
MY_IP=$(curl -s ifconfig.me)
aws ec2 authorize-security-group-ingress \
  --group-id $SG_ID \
  --protocol tcp \
  --port 8087 \
  --cidr ${MY_IP}/32
```

### 5. ⏰ スケジュール起動/停止

**Lambda + EventBridge で自動化**:

```bash
# 平日9時起動、18時停止を自動化
# → 月額コストを約40%削減 ($8削減)
```

スクリプト: `scripts/setup-auto-shutdown.sh` を実行

### 6. 📊 予算アラートの設定

**月額$30 の予算を超えたら通知**:

```bash
# AWS Budgetsでアラート設定
aws budgets create-budget \
  --account-id YOUR_ACCOUNT_ID \
  --budget file://budget-config.json
```

---

## 🚀 推奨構成

### 開発環境

```yaml
インスタンスタイプ: t3.micro
稼働時間: 平日10-18時のみ (8時間/日)
月額コスト: 約$4 (約560円)
```

### 本番環境

```yaml
インスタンスタイプ: t3.small
稼働時間: 24時間
キャッシュ: 有効 (5分)
月額コスト: 約$20 (約2,800円)
```

---

## 📈 コスト監視

### CloudWatch メトリクス確認

```bash
# EC2のCPU使用率を確認
aws cloudwatch get-metric-statistics \
  --namespace AWS/EC2 \
  --metric-name CPUUtilization \
  --dimensions Name=InstanceId,Value=i-030b78b382d5290c6 \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Average
```

### 月次コストレポート

```bash
# 今月のEC2コストを確認
aws ce get-cost-and-usage \
  --time-period Start=$(date +%Y-%m-01),End=$(date +%Y-%m-%d) \
  --granularity MONTHLY \
  --metrics BlendedCost \
  --filter file://ec2-filter.json
```

---

## ⚡ 即座に実行できる節約策

### 今すぐできること（所要時間: 5 分）

1. **インスタンスを停止** → 即座に課金停止

   ```bash
   aws ec2 stop-instances --instance-ids i-030b78b382d5290c6
   ```

2. **予算アラート設定** → 超過を防止

   - AWS コンソール → Budgets → Create budget

3. **不要なスナップショット削除** → ストレージコスト削減
   ```bash
   aws ec2 describe-snapshots --owner-ids self
   ```

---

## 💡 ベストプラクティス

1. **開発中はローカルで Gorse を起動**

   ```bash
   docker-compose -f docker-compose.gorse.yml up
   ```

2. **本番デプロイ前のみ EC2 を使用**

3. **キャッシュ機能を活用** (実装済み)

4. **定期的にコストレポートを確認**

---

## 📞 サポート

質問や不明点があれば、以下を確認してください:

- [AWS Pricing Calculator](https://calculator.aws/)
- [AWS Cost Explorer](https://console.aws.amazon.com/cost-management/)
- [Gorse Documentation](https://gorse.io/)
