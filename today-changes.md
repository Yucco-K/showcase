# 2025 年 7 月 21 日の変更内容

## 主要な機能強化

### 1. セキュリティの大幅な強化

#### メール認証システムの実装

- **ファイル**: `src/contexts/AuthProvider.tsx`, `api/auth/custom-reset-password.ts`
- **変更内容**:
  - メール認証による本人確認の必須化
  - カスタムリセットパスワードリンクの実装
  - 環境に応じた適切なリダイレクト URL 生成
  - 既存ユーザーチェック機能の追加

#### ログイン試行制限の導入

- **ファイル**: `src/hooks/useLoginAttempts.ts`
- **変更内容**:
  - 同一 IP アドレスからの連続ログイン試行を制限
  - 5 回の失敗で 30 分のクールダウン期間を設定
  - LocalStorage を使用した試行回数の追跡
  - ブルートフォース攻撃の防止

#### Zod による強力なバリデーション

- **ファイル**: `src/lib/validation.ts`
- **変更内容**:
  - 入力値の厳密な型チェック
  - クロスサイトスクリプティング対策
  - SQL インジェクション対策
  - カスタムエラーメッセージの日本語対応

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

### 2. 3 層ネストされた返信機能の実装

#### 階層構造の設計

- **ファイル**: `supabase/migrations/20250716180000_enable_nested_replies.sql`
- **変更内容**:
  - 返信の階層レベルを追跡するカラムを追加
  - 最大 3 階層までの制限を実装
  - 親子関係の整合性を保つ制約を追加

```sql
ALTER TABLE product_reviews
ADD COLUMN reply_level INTEGER DEFAULT 0;

-- 既存の返信のレベルを設定
UPDATE product_reviews
SET reply_level = 1
WHERE parent_id IS NOT NULL;
```

#### 返信フローの実装

- **ファイル**: `src/hooks/useReviews.ts`
- **変更内容**:
  - 階層レベルに基づく返信制御
  - 3 階層を超える返信の防止
  - 返信ツリーの再帰的な構築

```typescript
// 返信の階層チェック例
const addReply = async (parentId: string, comment: string) => {
	const parentLevel = await getReplyLevel(parentId);
	const newLevel = parentLevel + 1;

	if (newLevel > 3) {
		return { error: "返信の階層が深すぎます（3階層まで）" };
	}
	// ... 返信処理
};
```

#### UI の改善

- **ファイル**: `src/components/reviews/ReplyItem.tsx`
- **変更内容**:
  - インデント付きの階層表示
  - 返信ボタンの動的な表示/非表示
  - アコーディオン形式での返信表示
  - モバイル対応のレイアウト

```typescript
// 返信ボタンの表示制御例
{
	canReply && !isEditing && (reply.reply_level ?? 0) < 3 && (
		<ReplyActionButton onClick={startReply} aria-label="reply to reply">
			💬 返信
		</ReplyActionButton>
	);
}
```

## セキュリティ強化のポイント

### 1. 認証フロー

- メール認証による本人確認
- パスワードリセットの安全な実装
- セッション管理の強化

### 2. 入力値の検証

- Zod による型安全性の確保
- XSS 対策の実装
- SQL インジェクション対策

### 3. アクセス制御

- ログイン試行回数の制限
- IP ベースの制限
- レート制限の実装

## 返信機能の特徴

### 1. 階層構造

- 最大 3 階層までの返信
- 視覚的な階層表示
- アコーディオン形式での表示制御

### 2. ユーザビリティ

- 直感的な返信 UI
- モバイル対応
- アクセシビリティ対応

### 3. パフォーマンス

- 効率的なデータ構造
- 最適化されたクエリ
- レスポンシブな表示

## 今後の展望

### セキュリティ面

1. 2 要素認証の導入
2. OAuth 認証の追加
3. セキュリティヘッダーの強化

### 返信機能

1. リアルタイム通知
2. メンション機能
3. 返信のエクスポート機能
