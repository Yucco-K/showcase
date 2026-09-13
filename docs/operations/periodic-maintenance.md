# 定期メンテナンス手順

このプロジェクトを継続的に健全な状態に保つために、定期的に確認・実施した方がよい項目をまとめたチェックリストです。

## 推奨頻度: 月次

### 1. 依存関係の脆弱性チェック

```bash
npm audit
cd portfolio-page && npm audit
```

- `high`/`critical`は原則すぐ対応。`moderate`以下は影響範囲（本番コード経由か、devスクリプト限定か）を確認した上で優先度を判断する
- Dependabotの自動PRだけに頼らず、`npm audit`の生の結果も確認する（Dependabotが提案する更新が根本解決になっていないケースがあるため。過去に`@vercel/node`をメジャーアップデートしても内部の`path-to-regexp`/`undici`が古いままだった例あり）

### 2. Supabase migrationの適用漏れ確認

```sql
select version, name from supabase_migrations.schema_migrations
order by version desc limit 5;
```

- ローカルの`supabase/migrations/`ファイル一覧と本番の適用履歴を突き合わせ、未適用のmigrationがないか確認する
- 過去に、機能追加のmigrationがマージされてから本番未適用のまま長期間放置されていた事例があった（気づかないまま関連機能が動作していなかった）

### 3. マージ済み・クローズ済みブランチの整理

```bash
git fetch origin --prune
gh pr list --state merged --limit 100 --json headRefName --jq '.[].headRefName'
```

- マージ済みPRのheadブランチで、ローカル・リモートに残っているものを削除する
- Dependabotが作成し、後から手動対応PRに統合されて自動クローズされなかったブランチも見落としやすいので合わせて確認する

### 4. Copilotレビュー指摘の棚卸し

```bash
gh pr list --state merged --search "created:>=<1ヶ月前の日付>" --json number,title
```

- 各PRのCopilotレビュー（`copilot-pull-request-reviewer[bot]`）で「Changes recommended」だったのに、その後の追加コミットで対応されないままマージされたものがないか確認する
- 見つかった場合はIssue化し、優先度別にPRを分けて対応する

### 5. GitHub Pagesの疎通確認

```bash
curl -sI https://yucco-k.github.io/showcase/
```

- 200が返ることを確認する。Pages設定（Settings → Pages → Source）が意図せず無効化されるケースがあるため、README等の画像リンクも合わせて目視確認する

### 6. EC2インスタンスのコスト状況確認

```bash
aws ec2 describe-instances --profile gorse --query 'Reservations[].Instances[].[InstanceId,State.Name]'
```

- 検証目的でのみ使うインスタンスは、使わない期間はAMIバックアップを取ってterminateし、必要な時だけ復元する運用の方が、stopしたままにするより低コストになる場合が多い（EBSボリューム分の課金は停止中も発生するため）

## 推奨頻度: 四半期

### 7. GitHub ActionsのコミットSHA固定化

現在`actions/checkout`等の多くはバージョンタグ（`@v7`等）で運用しているが、タグは上書き可能なため、サプライチェーンリスクの観点ではコミットSHA固定の方が望ましい。

```yaml
# 例
- uses: actions/checkout@<コミットSHA> # v7
```

- 固定後はDependabotの`github-actions`エコシステム設定がSHAとバージョンコメントの両方を追従して更新PRを作成する
- 全アクションを一度に固定するのは変更量が大きいため、TruffleHogで既に実施済みの手法を横展開する形で、優先度の高いものから段階的に進める

### 8. 構造化セキュリティレビュー

単発のIssue対応ではなく、以下の観点でコードベース全体を棚卸しする。

- Supabase RLSポリシーが全テーブルに正しく設定されているか
- Vercel Functions（`api/`配下）の認証・認可・入力バリデーション
- CORS設定・環境変数の露出・ハードコードされた秘密情報の有無
- 発見事項は「優先度・影響範囲・対応方針・検証手順」を含むTODOリスト形式でIssue化し、対応後は残存リスク（今回は対応しないと判断したもの）も明記して記録に残す

## 実施記録

実施した際は、このファイルの下に日付と概要を追記していく。

<!-- 例:
### 2026-XX-XX 実施分
- npm audit: 新規vulnerability 2件検出、Issue #XX/#YY作成
- migration差分: なし
- ブランチ整理: 3件削除
-->
