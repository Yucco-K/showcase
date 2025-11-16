#!/usr/bin/env bash

# このスクリプトは .env ファイルから指定した環境変数を読み取り、
# Vercel CLI を使って Production 環境に一括で設定します。
# 事前条件:
#   - Vercel CLI がインストール済み (npm i -g vercel)
#   - vercel login が完了し、対象プロジェクト (showcase) がカレントディレクトリで検出可能
#   - .env ファイルに必要なキーが定義されている

set -euo pipefail

ENV_FILE=".env"
PROJECT_NAME="showcase"
TARGET_ENV="production"

# 一括設定したいキー
VARS=(
  "VITE_SUPABASE_URL"
  "VITE_SUPABASE_ANON_KEY"
  "VITE_STRIPE_PUBLISHABLE_KEY"
  "VITE_ADMIN_EMAILS"
)

if [[ ! -f "$ENV_FILE" ]]; then
  echo "[ERROR] $ENV_FILE が見つかりません" >&2
  exit 1
fi

echo "[INFO] Vercel プロジェクト: $PROJECT_NAME"

echo "[INFO] $ENV_FILE から環境変数を読み込み、Vercel に設定します..."

for VAR in "${VARS[@]}"; do
  VALUE=$(grep -E "^${VAR}=" "$ENV_FILE" | cut -d '=' -f2- | tr -d '\r')
  if [[ -z "$VALUE" ]]; then
    echo "[WARN] $VAR が $ENV_FILE に見つかりません。スキップします。" >&2
    continue
  fi

  echo "[INFO] 設定: $VAR"
  # 既存変数を削除してから追加することで最新値を確実に反映
  vercel env rm "$VAR" "$TARGET_ENV" --yes 2>/dev/null || true
  # 値をパイプで渡して追加（--yes は不要）
  echo -n "$VALUE" | vercel env add "$VAR" "$TARGET_ENV"
  echo ""

done

echo "[INFO] すべての環境変数を設定しました。Vercel の再デプロイを実行してください。"
