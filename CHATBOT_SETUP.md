# チャットボット機能のセットアップガイド

## 概要

このプロジェクトには ChatGPT ベースの AI チャットボット機能が組み込まれています。ユーザーは Information page の右下にあるチャットアイコンからアクセスできます。

## 必要な設定

### 1. 環境変数の設定

`.env.local` ファイルに以下の環境変数を追加してください：

```env
VITE_CHATBOT_ENDPOINT=https://your-api-gateway-url/chat
```

### 2. バックエンド API の準備

チャットボットが動作するには、OpenAI API を呼び出すバックエンドエンドポイントが必要です。

#### 必要なエンドポイント仕様

- **URL**: `VITE_CHATBOT_ENDPOINT` で指定した URL
- **Method**: POST
- **Request Body**:
  ```json
  {
  	"message": "ユーザーからのメッセージ"
  }
  ```
- **Response Body**:
  ```json
  {
  	"reply": "AIからの応答メッセージ"
  }
  ```

#### AWS Lambda 関数の例

```javascript
exports.handler = async (event) => {
	const { message } = JSON.parse(event.body);

	// OpenAI APIの呼び出し
	const response = await fetch("https://api.openai.com/v1/chat/completions", {
		method: "POST",
		headers: {
			Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			model: "gpt-4o",
			messages: [
				{
					role: "system",
					content:
						"あなたは親切で知識豊富なAIアシスタントです。日本語で回答してください。",
				},
				{
					role: "user",
					content: message,
				},
			],
			max_tokens: 500,
			temperature: 0.7,
		}),
	});

	const data = await response.json();
	const reply = data.choices[0].message.content;

	return {
		statusCode: 200,
		headers: {
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Headers": "Content-Type",
			"Access-Control-Allow-Methods": "POST, OPTIONS",
		},
		body: JSON.stringify({
			reply: reply,
		}),
	};
};
```

### 3. Supabase マイグレーションの実行

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

1. **API キーの保護**: バックエンドでのみ OpenAI API キーを使用
2. **入力検証**: メッセージ長制限（500 文字）
3. **RLS 有効**: Supabase で行レベルセキュリティ適用
4. **CORS 設定**: 適切なオリジン制限

## トラブルシューティング

### よくある問題

1. **チャットエンドポイントが設定されていません**

   - `.env.local`に`VITE_CHAT_ENDPOINT`が設定されているか確認

2. **チャット履歴の取得に失敗しました**

   - Supabase マイグレーションが実行されているか確認
   - RLS ポリシーが正しく設定されているか確認

3. **チャットボットの応答に失敗しました**
   - バックエンド API が正常に動作しているか確認
   - OpenAI API キーが有効か確認
   - CORS 設定が正しいか確認

## 今後の拡張可能性

- 複数の会話セッション管理
- ファイルアップロード対応
- 音声入力・出力機能
- カスタムプロンプト設定
- 管理画面での会話履歴管理
