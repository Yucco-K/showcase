# チャットボット機能のセットアップガイド

## 概要

このプロジェクトには ChatGPT ベースの AI チャットボット機能が組み込まれています。全てのページの右下にあるチャットアイコンからアクセスできます。

## 必要な設定

### 1. OpenAI API キーの設定

チャットボットは Vercel Python API（`api/chat/index.py`）を使用して OpenAI API を呼び出します。

環境変数に OpenAI API キーを設定してください：

```bash
# .env ファイルに追加
OPENAI_API_KEY=your_openai_api_key_here
```

Vercel にデプロイする場合は、Vercel の環境変数として設定：

```bash
vercel env add OPENAI_API_KEY
```

### 2. Supabase 設定

ベクトル検索機能のために以下の環境変数が必要です：

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### 3. アクセス権限

チャットボットは**全ユーザー**がアクセス可能です。ただし、レート制限が適用されます：

- **認証済みユーザー**: 1時間あたり50回、1日あたり100回
- **未認証ユーザー**: 1時間あたり10回、1日あたり10回

### 4. Python API のセットアップ

ローカル開発環境でチャットボットをテストする場合：

```bash
cd api/chat
pip install -r requirements.txt
python -m uvicorn index:app --reload --port 8001
```

## 機能仕様

### チャット機能

- **アクセス**: 全ページ右下のチャットアイコンをクリック
- **FAQ 機能**: よくある質問へのクイックアクセス
- **AI 応答**: OpenAI GPT-4o-mini を使用した自然な会話
- **ベクトル検索**: Supabase Vector Store を使用した関連情報検索
- **レート制限**: クライアント側でのレート制限管理
- **レスポンシブ**: モバイル・デスクトップ両対応

### UI 特徴

- 右下に固定されたフローティングチャットウィンドウ
- クリックで展開/収納可能
- ユーザーと AI のメッセージを区別して表示
- FAQ カテゴリーボタンによるクイックアクセス
- リアルタイムのレート制限表示
- ローディングインジケーター付き
- モバイルフレンドリーなレスポンシブデザイン
- Markdown 形式のレスポンス表示

### 技術スタック

- **フロントエンド**: React + TypeScript + Styled Components
- **バックエンド**: FastAPI (Python) on Vercel
- **AI**: OpenAI GPT-4o-mini + text-embedding-3-small
- **ベクトル検索**: Supabase Vector Store (pgvector)
- **フレームワーク**: LangChain for Python

### データベース構造

チャットボットは以下のテーブルを使用します：

```sql
-- product_embeddings テーブル（製品情報の埋め込みベクトル）
CREATE TABLE public.product_embeddings (
    id BIGSERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id),
    embedding vector(1536),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- doc_embeddings テーブル（ドキュメントの埋め込みベクトル）
CREATE TABLE public.doc_embeddings (
    id BIGSERIAL PRIMARY KEY,
    doc_type TEXT NOT NULL,
    embedding vector(1536),
    content TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**注意**: 会話履歴はデータベースに保存されません。各会話はセッションごとに独立しています。

## セキュリティ対策

1. **API キーの保護**: Vercel 環境変数でのみ OpenAI API キーを使用
2. **レート制限**: クライアント側でレート制限を実装
3. **入力検証**: メッセージ長制限と入力サニタイゼーション
4. **CORS 設定**: 適切な CORS ポリシーの適用
5. **認証統合**: Supabase 認証システムと連携してレート制限を調整

## トラブルシューティング

### よくある問題

1. **チャットボットが表示されない**

   - ブラウザのコンソールでエラーを確認
   - JavaScript が有効になっているか確認
   - ネットワーク接続を確認

2. **レート制限を超過しました**

   - 認証済みユーザーの場合: 1時間または1日の制限に達しています
   - 未認証ユーザーの場合: ログインするか、時間をおいて再試行してください

3. **チャットボットの応答に失敗しました**

   - Python API が起動しているか確認（ローカル開発の場合）:
     ```bash
     cd api/chat && python -m uvicorn index:app --reload --port 8001
     ```
   - 環境変数が正しく設定されているか確認:
     ```bash
     # .env ファイルを確認
     cat .env | grep -E "OPENAI|SUPABASE"
     ```
   - OpenAI API の利用状況・クォータを確認
   - ネットワークエラーがないか確認

4. **開発環境でのCORSエラー**

   - Python API が localhost:8001 で起動しているか確認
   - フロントエンドが localhost:5173 で起動しているか確認

## API エンドポイント

### ローカル開発

```
POST http://localhost:8001/api/chat
Content-Type: application/json

{
  "message": "こんにちは"
}
```

### 本番環境

```
POST /api/chat
Content-Type: application/json

{
  "message": "こんにちは"
}
```

## 今後の拡張可能性

- 会話履歴の永続化
- 複数の会話セッション管理
- ファイルアップロード対応
- 音声入力・出力機能
- カスタムプロンプト設定
- 管理画面での統計情報表示
- GPT-4への切り替えオプション
