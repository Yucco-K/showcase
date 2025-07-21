# セキュリティと機能強化アップデート（2025 年 7 月 21 日）

## セキュリティ強化

### メール認証システム

- メール認証による本人確認の必須化
- カスタムリセットパスワードリンクの実装
- 環境に応じた適切なリダイレクト URL 生成
- 既存ユーザーチェック機能の追加

### ログイン試行制限

- 同一 IP アドレスからの連続ログイン試行を制限（5 回の失敗で 30 分のクールダウン）
- LocalStorage を使用した試行回数の追跡
- ブルートフォース攻撃の防止

### Zod によるバリデーション

```typescript
// バリデーションスキーマの例
const reviewSchema = z.object({
	comment: z
		.string()
		.min(1, "コメントを入力してください")
		.max(1000, "コメントは1000文字以内で入力してください")
		.regex(/^[^<>]*$/, "HTMLタグは使用できません"),
	rating: z
		.number()
		.min(1, "評価は1以上を選択してください")
		.max(5, "評価は5以下を選択してください"),
});
```

## 3 層ネストされた返信機能

### データベース設計

```sql
-- 返信の階層レベルを追跡
ALTER TABLE product_reviews
ADD COLUMN reply_level INTEGER DEFAULT 0;

-- 既存の返信のレベルを設定
UPDATE product_reviews
SET reply_level = 1
WHERE parent_id IS NOT NULL;
```

### 返信フロー制御

```typescript
// 返信の階層チェック
const addReply = async (parentId: string, comment: string) => {
	const parentLevel = await getReplyLevel(parentId);
	const newLevel = parentLevel + 1;

	if (newLevel > 3) {
		return { error: "返信の階層が深すぎます（3階層まで）" };
	}
	// ... 返信処理
};
```

### UI 実装

- インデント付き階層表示
- アコーディオン形式での返信表示
- モバイル対応レイアウト
- アクセシビリティ対応

## 実装の詳細

### セキュリティ関連ファイル

- `src/contexts/AuthProvider.tsx`
- `api/auth/custom-reset-password.ts`
- `src/hooks/useLoginAttempts.ts`
- `src/lib/validation.ts`

### 返信機能関連ファイル

- `supabase/migrations/20250716180000_enable_nested_replies.sql`
- `src/hooks/useReviews.ts`
- `src/components/reviews/ReplyItem.tsx`

## 今後の展望

### セキュリティ強化

1. 2 要素認証の導入
2. OAuth 認証の追加
3. セキュリティヘッダーの強化

### 返信機能拡張

1. リアルタイム通知
2. メンション機能
3. 返信のエクスポート機能

## 技術スタック

- Frontend: React, TypeScript
- Backend: Supabase
- バリデーション: Zod
- スタイリング: styled-components
- 認証: Supabase Auth

## パフォーマンスと制限

- 返信の最大深さ: 3 階層
- ログイン試行制限: 5 回/30 分
- コメント文字数制限: 1000 文字

## エラーハンドリング

- バリデーションエラーの日本語表示
- 階層制限超過時のエラーメッセージ
- ログイン試行制限時のフィードバック

## アクセシビリティ

- ARIA 属性の適切な使用
- キーボードナビゲーション対応
- スクリーンリーダー対応

## モバイル対応

- レスポンシブデザイン
- タッチ操作の最適化
- モバイルでの表示調整
