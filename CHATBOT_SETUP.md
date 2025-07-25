# チャットボット機能のセットアップガイド

## 概要

このプロジェクトには ChatGPT ベースの AI チャットボット機能が組み込まれています。管理者ユーザーは Information page の右下にあるチャットアイコンからアクセスできます。

## 必要な設定

### 1. OpenAI API キーの設定

Supabase Edge Functions 用に OpenAI API キーを設定してください：

```bash
npx supabase secrets set OPENAI_API_KEY=your_openai_api_key_here
```

### 2. Supabase Edge Function のデプロイ

チャットボットは Supabase Edge Functions を使用して OpenAI API を呼び出します：

```bash
npx supabase functions deploy chat
```

### 3. アクセス権限

チャットボットは管理者ユーザーのみがアクセス可能です。管理者権限は profiles テーブルの role カラムで管理されています。

### 4. Supabase マイグレーションの実行

messages テーブルを作成するマイグレーションを実行してください：

```bash
npx supabase db push
```

## 機能仕様

### チャット機能

- **アクセス**: Information page 右下のチャットアイコンをクリック
- **履歴保存**: 会話履歴は Supabase の messages テーブルに保存
- **レスポンシブ**: モバイル・デスクトップ両対応
- **セキュリティ**: Row Level Security (RLS) で適切なアクセス制御

### UI 特徴

- 右下に固定されたフローティングチャットウィンドウ
- クリックで展開/収納可能
- ユーザーと AI のメッセージを区別して表示
- ローディングインジケーター付き
- モバイルフレンドリーなレスポンシブデザイン

### データベース構造

```sql
-- messagesテーブル
CREATE TABLE public.messages (
    id BIGSERIAL PRIMARY KEY,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id),
    session_id UUID DEFAULT gen_random_uuid()
);
```

## セキュリティ対策

1. **API キーの保護**: Supabase Edge Functions でのみ OpenAI API キーを使用
2. **管理者制限**: 管理者ユーザーのみアクセス可能
3. **入力検証**: メッセージ長制限（1000 文字）
4. **RLS 有効**: Supabase で行レベルセキュリティ適用
5. **認証統合**: Supabase 認証システムと連携

## トラブルシューティング

### よくある問題

1. **チャットボットが表示されない**

   - 管理者ユーザーでログインしているか確認
   - profiles テーブルの role が "admin" に設定されているか確認

2. **チャット履歴の取得に失敗しました**

   - Supabase マイグレーションが実行されているか確認
   - RLS ポリシーが正しく設定されているか確認

3. **チャットボットの応答に失敗しました**
   - Supabase Edge Function が正常にデプロイされているか確認
   - OpenAI API キーが正しく設定されているか確認: `npx supabase secrets list`
   - ネットワークエラーがないか確認

## 今後の拡張可能性

- 複数の会話セッション管理
- ファイルアップロード対応
- 音声入力・出力機能
- カスタムプロンプト設定
- 管理画面での会話履歴管理
