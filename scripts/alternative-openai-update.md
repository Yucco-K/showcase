# EC2 接続不可時の代替環境変数更新方法

## 🚨 現在の状況

- EC2 インスタンス (35.78.174.80) への接続がタイムアウト
- インスタンスが停止している可能性
- セキュリティグループの設定問題の可能性

## 🔧 代替更新方法

### 1. AWS コンソールでの確認

1. [AWS EC2 コンソール](https://console.aws.amazon.com/ec2/)にアクセス
2. インスタンスの状態を確認
3. セキュリティグループの設定を確認
4. パブリック IP アドレスを確認

### 2. インスタンス再起動

```bash
# AWS CLIでインスタンスを再起動
aws ec2 reboot-instances --instance-ids i-xxxxxxxxx

# または、AWSコンソールから再起動
```

### 3. セキュリティグループの確認

- SSH (ポート 22) が許可されているか
- 自分の IP アドレスからのアクセスが許可されているか
- 0.0.0.0/0 からのアクセスが許可されているか

### 4. 新しいインスタンスの起動

EC2 インスタンスが完全に停止している場合：

1. 新しいインスタンスを起動
2. Gorse を再セットアップ
3. 環境変数を設定

### 5. ローカル環境でのテスト

EC2 にアクセスできない間は、ローカル環境でテスト：

```bash
# ローカルでGorseを起動
docker-compose up -d

# 環境変数を設定
export OPENAI_API_KEY="your_new_api_key_here"

# テスト実行
npm run dev
```

## 📋 次のステップ

1. **AWS コンソールでインスタンス状態を確認**
2. **必要に応じてインスタンスを再起動**
3. **セキュリティグループの設定を確認**
4. **接続可能になったら環境変数を更新**

## 🔍 確認コマンド

```bash
# インスタンスの状態確認
aws ec2 describe-instances --instance-ids i-xxxxxxxxx

# セキュリティグループの確認
aws ec2 describe-security-groups --group-ids sg-xxxxxxxxx
```
