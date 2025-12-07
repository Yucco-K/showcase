# Portfolio Showcase - API 仕様書

---

## 🆕 2025 年 7 月 27 日 主な機能追加・改善

- **チャットボット API のリアーキテクチャ**: Deno ベースの Supabase Edge Function から Python + FastAPI + LangChain ベースの Vercel Serverless Function に移行し、応答性能と拡張性を向上。
- **RAG パイプライン強化**: LangChain を導入し、ベクトル検索と知識ベースの拡張性を強化。
- **API 基盤の改善**: FastAPI ルーター、CORS 対応、環境変数管理の安定化。

## 🆕 2025 年 7 月 25 日〜26 日 主な機能追加・改善

- **FAQ チャットボット API**: OpenAI API 統合、Supabase Edge Functions によるサーバーレス実装
- **チャットメッセージ管理**: user_id、session_id 付きメッセージ保存、匿名ユーザー対応
- **FAQ データ管理**: 15 個の FAQ 質問、人気度による自動ソート機能
- **Information ページ API**: UI 最適化、モバイルパフォーマンス向上
- **マーケティングダッシュボード API**: Gorse API 連携、集計ロジック修正
- **依存関係管理**: Zod 競合解決、OpenAI SDK 互換性確保

## 🆕 2025 年 7 月 21 日・22 日 主な機能追加・改善

- お問い合わせ API にカテゴリ（category）、タイトル（title）、ピン留め（is_pinned）機能を追加
- お問い合わせ返信のスレッド化（contact_reply_threads テーブル）
- レビュー API にフィルタ・ソート（星数・日付順・管理者レビュー特別扱い）機能を追加
- レビューの 3 階層ネスト返信機能
- セキュリティ強化（メール認証必須、ログイン試行制限、Zod バリデーション）
- 型定義・フック共通化、UI/UX・アクセシビリティ改善

---

## バージョン 2.0

**文書バージョン:** 2.0
**最終更新:** 2025 年 7 月
**ベース URL:** `https://showcase-topaz.vercel.app`
**API バージョン:** v1
**実装状況:** ✅ 実装済み

---

## 概要

この文書は、Portfolio Showcase Version 2.0 プラットフォームの包括的な API 仕様を提供します。API は Supabase 上に構築され、プラットフォームの全機能に対する RESTful エンドポイントを提供します。

### 実装状況の表記について

本ドキュメントでは、機能の実装状況を以下の記号で表記します：

- ✅ **実装済み**: 本番環境で利用可能な機能
- ⚠️ **部分的実装**: 基本機能のみ実装済みの機能
- 📋 **未実装**: 今後のバージョンアップで実装予定の機能

### 認証

すべての API リクエストには、Supabase Auth を通じて取得した JWT トークンによる認証が必要です。

```http
Authorization: Bearer <jwt_token>
```

### 基本ヘッダー

```http
Content-Type: application/json
Accept: application/json
```

---

## 認証エンドポイント

### ユーザー登録

**POST** `/auth/v1/signup`

新しいユーザーアカウントを登録します。

#### リクエストボディ

```json
{
	"email": "user@example.com",
	"password": "your_password_here"
}
```

#### レスポンス

```json
{
	"user": {
		"id": "uuid",
		"email": "user@example.com",
		"created_at": "2025-01-15T10:30:00Z"
	},
	"session": {
		"access_token": "your_jwt_token_here",
		"refresh_token": "your_refresh_token_here",
		"expires_at": 1642234567
	}
}
```

### ユーザーログイン

**POST** `/auth/v1/token?grant_type=password`

ユーザーを認証し、アクセストークンを取得します。

#### リクエストボディ

```json
{
	"email": "user@example.com",
	"password": "your_password_here"
}
```

#### レスポンス

```json
{
	"access_token": "your_jwt_token_here",
	"refresh_token": "your_refresh_token_here",
	"expires_at": 1642234567,
	"user": {
		"id": "uuid",
		"email": "user@example.com"
	}
}
```

### ユーザーログアウト

**POST** `/auth/v1/logout`

現在のセッションを無効化します。

#### リクエストヘッダー

```http
Authorization: Bearer <your_jwt_token_here>
```

#### レスポンス

```json
{
	"message": "ログアウトが正常に完了しました"
}
```

---

## ユーザー管理

### 現在のユーザー情報取得

**GET** `/rest/v1/profiles?select=*&id=eq.{user_id}`

現在のユーザープロフィール情報を取得します。

#### レスポンス

```json
[
	{
		"id": "uuid",
		"email": "user@example.com",
		"full_name": "田中太郎",
		"avatar_url": "https://example.com/avatar.jpg",
		"biography": "5年の経験を持つソフトウェア開発者",
		"created_at": "2025-01-15T10:30:00Z",
		"updated_at": "2025-01-15T10:30:00Z"
	}
]
```

### ユーザープロフィール更新

**PATCH** `/rest/v1/profiles?id=eq.{user_id}`

ユーザープロフィール情報を更新します。

#### リクエストボディ

```json
{
	"full_name": "田中太郎",
	"biography": "更新された自己紹介"
}
```

#### レスポンス

```json
{
	"id": "uuid",
	"full_name": "田中太郎",
	"biography": "更新された自己紹介",
	"updated_at": "2025-01-15T11:00:00Z"
}
```

---

## 商品管理

### デジタルコンテンツ全件取得 ✅

**GET** `/rest/v1/products?select=*&is_active=eq.true&order=created_at.desc`

すべてのアクティブなデジタルコンテンツを取得します。

#### レスポンス

```json
[
	{
		"id": "uuid",
		"name": "プレミアムテンプレート",
		"description": "プロフェッショナルなウェブサイトテンプレート",
		"price": 10000,
		"image_url": "https://example.com/template.jpg",
		"category": "templates",
		"is_active": true,
		"created_at": "2025-01-15T10:30:00Z",
		"updated_at": "2025-01-15T10:30:00Z"
	}
]
```

### 商品 ID による取得

**GET** `/rest/v1/products?select=*&id=eq.{product_id}`

特定の商品詳細を取得します。

#### レスポンス

```json
[
	{
		"id": "uuid",
		"name": "プレミアムテンプレート",
		"description": "高度な機能を備えたプロフェッショナルなウェブサイトテンプレート",
		"price": 10000,
		"image_url": "https://example.com/template.jpg",
		"category": "templates",
		"is_active": true,
		"extra_info": {
			"features": ["レスポンシブデザイン", "SEO最適化"],
			"download_url": "https://example.com/download"
		},
		"created_at": "2025-01-15T10:30:00Z",
		"updated_at": "2025-01-15T10:30:00Z"
	}
]
```

### 商品作成（管理者のみ）

**POST** `/rest/v1/products`

新しい商品を作成します。

#### リクエストボディ

```json
{
	"name": "新商品",
	"description": "商品の説明",
	"price": 20000,
	"category": "software",
	"is_active": true
}
```

#### レスポンス

```json
{
	"id": "uuid",
	"name": "新商品",
	"description": "商品の説明",
	"price": 20000,
	"category": "software",
	"is_active": true,
	"created_at": "2025-01-15T10:30:00Z"
}
```

### 商品更新（管理者のみ）

**PATCH** `/rest/v1/products?id=eq.{product_id}`

商品情報を更新します。

#### リクエストボディ

```json
{
	"name": "更新された商品名",
	"price": 15000
}
```

### 商品削除（管理者のみ）

**DELETE** `/rest/v1/products?id=eq.{product_id}`

商品を削除します。

---

## 購入管理

### 購入作成

**POST** `/rest/v1/product_purchases`

新しい購入記録を作成します。

#### リクエストボディ

```json
{
	"user_id": "uuid",
	"product_id": "uuid",
	"stripe_payment_intent_id": "pi_1234567890",
	"amount": 1,
	"status": "completed"
}
```

#### レスポンス

```json
{
	"id": "uuid",
	"user_id": "uuid",
	"product_id": "uuid",
	"stripe_payment_intent_id": "pi_1234567890",
	"amount": 1,
	"status": "completed",
	"created_at": "2025-01-15T10:30:00Z"
}
```

### ユーザー購入履歴取得

**GET** `/rest/v1/product_purchases?select=*,products(*)&user_id=eq.{user_id}&order=created_at.desc`

ユーザーの購入履歴を取得します。

#### レスポンス

```json
[
	{
		"id": "uuid",
		"user_id": "uuid",
		"product_id": "uuid",
		"amount": 1,
		"status": "completed",
		"created_at": "2025-01-15T10:30:00Z",
		"products": {
			"id": "uuid",
			"name": "プレミアムテンプレート",
			"description": "プロフェッショナルなウェブサイトテンプレート"
		}
	}
]
```

---

## ブログ管理

### 公開済みブログ全件取得

**GET** `/rest/v1/blogs?select=*,profiles(full_name)&is_published=eq.true&order=created_at.desc`

すべての公開済みブログ投稿を取得します。

#### レスポンス

```json
[
	{
		"id": "uuid",
		"title": "React入門",
		"content": "Reactは強力なJavaScriptライブラリです...",
		"author_id": "uuid",
		"is_published": true,
		"created_at": "2025-01-15T10:30:00Z",
		"updated_at": "2025-01-15T10:30:00Z",
		"profiles": {
			"full_name": "田中太郎"
		}
	}
]
```

### ブログ ID による取得

**GET** `/rest/v1/blogs?select=*,profiles(full_name)&id=eq.{blog_id}`

特定のブログ投稿を取得します。

### ブログ作成（管理者のみ）

**POST** `/rest/v1/blogs`

新しいブログ投稿を作成します。

#### リクエストボディ

```json
{
	"title": "新しいブログ投稿",
	"content": "マークダウン形式のブログ内容",
	"author_id": "uuid",
	"is_published": true
}
```

---

## お問い合わせ管理

### お問い合わせフォーム送信 ✅

**POST** `/rest/v1/contacts`

新しいお問い合わせを送信します。

#### リクエストボディ

```json
{
	"name": "田中太郎",
	"email": "tanaka@example.com",
	"title": "退会申請について",
	"category": "account_delete",
	"message": "退会方法を教えてください",
	"is_pinned": true
}
```

#### レスポンス

```json
{
	"id": "uuid",
	"name": "田中太郎",
	"email": "tanaka@example.com",
	"title": "退会申請について",
	"category": "account_delete",
	"message": "退会方法を教えてください",
	"is_pinned": true,
	"status": "new",
	"is_replied": false,
	"created_at": "2025-07-22T10:30:00Z"
}
```

### お問い合わせ返信スレッド取得

**GET** `/rest/v1/contact_reply_threads?contact_id=eq.{contact_id}`

お問い合わせのスレッド形式の返信一覧を取得します。

#### レスポンス

```json
[
	{
		"id": "uuid",
		"contact_id": "uuid",
		"sender_type": "admin",
		"sender_id": "uuid",
		"message": "ご質問ありがとうございます。退会方法は...",
		"created_at": "2025-07-22T11:00:00Z"
	}
]
```

### 全お問い合わせ取得（管理者のみ）

**GET** `/rest/v1/contacts?select=*&order=created_at.desc`

すべてのお問い合わせを取得します。

### お問い合わせステータス更新（管理者のみ）

**PATCH** `/rest/v1/contacts?id=eq.{contact_id}`

お問い合わせのステータスを更新します。

#### リクエストボディ

```json
{
	"status": "in_progress",
	"is_replied": true
}
```

---

## FAQ チャットボット管理 ✅

### FAQ データ取得

**GET** `/rest/v1/faqs?select=*&order=popularity.desc`

人気度順で FAQ データを取得します。

#### レスポンス

```json
[
	{
		"id": "uuid",
		"question": "パスワードを忘れた場合はどうすればよいですか？",
		"answer": "ログイン画面の「パスワードを忘れた方」からリセットできます。",
		"category": "account",
		"popularity": 150,
		"created_at": "2025-07-25T10:30:00Z"
	}
]
```

### 人気 FAQ 取得

**GET** `/rest/v1/faqs?select=*&order=popularity.desc&limit=5`

人気度上位 5 件の FAQ を取得します。

### FAQ 作成（管理者のみ）

**POST** `/rest/v1/faqs`

新しい FAQ を作成します。

#### リクエストボディ

```json
{
	"question": "新しい質問",
	"answer": "新しい回答",
	"category": "basic",
	"popularity": 0
}
```

### FAQ 更新（管理者のみ）

**PATCH** `/rest/v1/faqs?id=eq.{faq_id}`

FAQ 情報を更新します。

#### リクエストボディ

```json
{
	"question": "更新された質問",
	"answer": "更新された回答",
	"popularity": 100
}
```

### チャットメッセージ保存

**POST** `/rest/v1/chat_messages`

チャットメッセージを保存します。

#### リクエストボディ

```json
{
	"user_id": "uuid", // 匿名ユーザーの場合は null
	"session_id": "session_123456",
	"role": "user", // "user" or "assistant"
	"content": "ユーザーの質問内容"
}
```

#### レスポンス

```json
{
	"id": "uuid",
	"user_id": "uuid",
	"session_id": "session_123456",
	"role": "user",
	"content": "ユーザーの質問内容",
	"created_at": "2025-07-25T10:30:00Z"
}
```

### チャットメッセージ履歴取得

**GET** `/rest/v1/chat_messages?session_id=eq.{session_id}&order=created_at.asc`

特定セッションのチャット履歴を取得します。

#### レスポンス

```json
[
	{
		"id": "uuid",
		"user_id": "uuid",
		"session_id": "session_123456",
		"role": "user",
		"content": "ユーザーの質問",
		"created_at": "2025-07-25T10:30:00Z"
	},
	{
		"id": "uuid",
		"user_id": null,
		"session_id": "session_123456",
		"role": "assistant",
		"content": "AI の回答",
		"created_at": "2025-07-25T10:30:05Z"
	}
]
```

---

## OpenAI API 統合 ✅

### チャット補完

**POST** `/api/chat`

OpenAI API と RAG (Retrieval-Augmented Generation) を使用して、知識ベースに基づいたチャット補完を実行します。

#### リクエストボディ

```json
{
	"message": "ユーザーの質問",
	"session_id": "session_123456",
	"user_id": "uuid" // オプション
}
```

#### レスポンス

```json
{
	"response": "AI の回答内容",
	"session_id": "session_123456",
	"message_id": "uuid"
}
```

### システムプロンプト設定

```typescript
const systemPrompt = {
	role: "system",
	content:
		"あなたは親切で知識豊富なアシスタントです。日本語で回答してください。",
};
```

### チャット設定

```typescript
const chatConfig = {
	model: "gpt-4o-mini",
	max_tokens: 500,
	temperature: 0.7,
	stream: true,
};
```

---

## 決済統合

### 決済インテント作成 ✅

**POST** `/api/create-payment-intent`

デジタルコンテンツ購入のための Stripe 決済インテントを作成します。

#### リクエストボディ

```json
{
	"productId": "uuid",
	"amount": 1
}
```

#### レスポンス

```json
{
	"clientSecret": "pi_your_payment_intent_secret_here",
	"paymentIntentId": "pi_your_payment_intent_id_here"
}
```

### Stripe Webhook

**POST** `/api/webhooks/stripe`

Stripe webhook イベントを処理します。

#### リクエストヘッダー

```http
Stripe-Signature: t=1234567890,v1=abc123...
```

#### リクエストボディ

```json
{
	"type": "payment_intent.succeeded",
	"data": {
		"object": {
			"id": "pi_your_payment_intent_id_here",
			"amount": 1,
			"status": "succeeded"
		}
	}
}
```

---

## リアルタイムサブスクリプション

### デジタルコンテンツ更新 ✅

デジタルコンテンツ更新のリアルタイムサブスクリプション。

```javascript
const subscription = supabase
	.channel("products")
	.on(
		"postgres_changes",
		{ event: "*", schema: "public", table: "products" },
		(payload) => {
			console.log("商品が更新されました:", payload);
		}
	)
	.subscribe();
```

### 購入更新

購入更新のリアルタイムサブスクリプション。

```javascript
const subscription = supabase
	.channel("purchases")
	.on(
		"postgres_changes",
		{ event: "*", schema: "public", table: "product_purchases" },
		(payload) => {
			console.log("購入が更新されました:", payload);
		}
	)
	.subscribe();
```

### チャットメッセージ更新 ✅

チャットメッセージのリアルタイムサブスクリプション。

```javascript
const subscription = supabase
	.channel("chat_messages")
	.on(
		"postgres_changes",
		{ event: "*", schema: "public", table: "chat_messages" },
		(payload) => {
			console.log("チャットメッセージが更新されました:", payload);
		}
	)
	.subscribe();
```

---

## エラーハンドリング

### 標準エラーレスポンス

```json
{
	"error": {
		"code": "ERROR_CODE",
		"message": "人間が読めるエラーメッセージ",
		"details": "追加のエラー詳細"
	}
}
```

### 一般的なエラーコード

| コード                     | 説明                             |
| -------------------------- | -------------------------------- |
| `AUTH_REQUIRED`            | 認証が必要です                   |
| `INSUFFICIENT_PERMISSIONS` | ユーザーに必要な権限がありません |
| `VALIDATION_ERROR`         | リクエストの検証に失敗しました   |
| `NOT_FOUND`                | リソースが見つかりません         |
| `INTERNAL_ERROR`           | 内部サーバーエラー               |
| `OPENAI_API_ERROR`         | OpenAI API エラー                |
| `CHAT_TIMEOUT`             | チャットタイムアウト             |

### レート制限

- **レート制限:** ユーザーあたり 1 分間に 100 リクエスト
- **ヘッダー:** `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`
- **チャットボット制限:** 1 分間に 10 回の質問

---

## レスポンスコード

| コード | 説明                   |
| ------ | ---------------------- |
| 200    | 成功                   |
| 201    | 作成完了               |
| 400    | 不正なリクエスト       |
| 401    | 認証が必要             |
| 403    | アクセス拒否           |
| 404    | 見つかりません         |
| 422    | 検証エラー             |
| 429    | リクエストが多すぎます |
| 500    | 内部サーバーエラー     |

---

## SDK 例

### JavaScript/TypeScript

```typescript
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
	"https://your-project.supabase.co",
	"your-anon-key"
);

// 商品取得
const { data: products, error } = await supabase
	.from("products")
	.select("*")
	.eq("is_active", true);

// 購入作成
const { data: purchase, error } = await supabase
	.from("product_purchases")
	.insert({
		user_id: user.id,
		product_id: productId,
		amount: 1,
		status: "completed",
	});

// FAQ 取得
const { data: faqs, error } = await supabase
	.from("faqs")
	.select("*")
	.order("popularity", { ascending: false })
	.limit(5);

// チャットメッセージ保存
const { data: message, error } = await supabase.from("chat_messages").insert({
	user_id: user?.id || null,
	session_id: sessionId,
	role: "user",
	content: userMessage,
});

// OpenAI API 呼び出し
const response = await fetch("/api/chat", {
	method: "POST",
	headers: {
		"Content-Type": "application/json",
		Authorization: `Bearer ${supabase.auth.session()?.access_token}`,
	},
	body: JSON.stringify({
		message: userMessage,
		session_id: sessionId,
		user_id: user?.id,
	}),
});
const chatResponse = await response.json();
```

### cURL 例

```bash
# 商品取得
curl -X GET "https://your-project.supabase.co/rest/v1/products?select=*&is_active=eq.true" \
  -H "apikey: your-anon-key" \
  -H "Authorization: Bearer your_jwt_token_here"

# 商品作成（管理者のみ）
curl -X POST "https://your-project.supabase.co/rest/v1/products" \
  -H "apikey: your-anon-key" \
  -H "Authorization: Bearer your_jwt_token_here" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "新商品",
    "description": "商品の説明",
    "price": 20000,
    "category": "software"
  }'

# FAQ 取得
curl -X GET "https://your-project.supabase.co/rest/v1/faqs?select=*&order=popularity.desc&limit=5" \
  -H "apikey: your-anon-key"

# チャットメッセージ保存
curl -X POST "https://your-project.supabase.co/rest/v1/chat_messages" \
  -H "apikey: your-anon-key" \
  -H "Authorization: Bearer your_jwt_token_here" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "uuid",
    "session_id": "session_123456",
    "role": "user",
    "content": "ユーザーの質問"
  }'

# チャット補完 (OpenAI API)
curl -X POST "https://your-project.supabase.co/api/chat" \
  -H "apikey: your-anon-key" \
  -H "Authorization: "Bearer your_jwt_token_here" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "こんにちは",
    "session_id": "session_123456"
  }'
```

---

## バージョニング

API バージョニングは URL パスで処理されます。現在のバージョンは v1 です。

- **現在のバージョン:** v1
- **非推奨ポリシー:** 破壊的変更の 6 ヶ月前通知
- **後方互換性:** 12 ヶ月間維持

- **サポートメール:** api-support@your-domain.com

---

## 技術サポート

- **開発者:** dev@your-domain.com
- **技術ドキュメント:** [技術文書\_JA.md](https://github.com/Yucco-K/showcase-docs/blob/main/%E6%8A%80%E8%A1%93%E6%96%87%E6%9B%B8_JA.md)
- **ユーザーガイド:** [user-guide_JA.md](https://github.com/Yucco-K/showcase-docs/blob/main/user-guide_JA.md)
- **ユーザーガイド詳細:** [ユーザーガイド詳細\_JA.md](https://github.com/Yucco-K/showcase-docs/blob/main/%E3%83%A6%E3%83%BC%E3%82%B6%E3%83%BC%E3%82%AC%E3%82%A4%E3%83%89%E8%A9%B3%E7%B4%B0_JA.md)
