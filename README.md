# Portfolio Showcase

現代的なポートフォリオ・ショーケースサイト。Supabase、Stripe、Gorse 推薦システムを統合したフルスタックアプリケーションです。

## ⚠️ セキュリティ注意事項

**このリポジトリを使用する前に必ずお読みください：**

### 環境変数の管理

- ✅ `.env` ファイルに機密情報を保存してください（Git で追跡されません）
- ❌ **絶対に**実際の API キーやパスワードをコード内にハードコードしないでください
- ❌ **絶対に** `.env` ファイルを Git にコミットしないでください

### VITE\_ プレフィックスについて

```typescript
// ⚠️ VITE_ で始まる環境変数はブラウザに公開されます
VITE_SUPABASE_URL=https://...        // ✅ 安全（公開URL）
VITE_SUPABASE_ANON_KEY=eyJ...        // ✅ 安全（RLSで保護）

// ❌ 以下は絶対に VITE_ を使用しないでください
OPENAI_API_KEY=sk-proj-...           // ✅ 正しい（サーバー側のみ）
VITE_OPENAI_API_KEY=sk-proj-...      // ❌ 危険（ブラウザに露出）
```

### 詳細なセキュリティガイド

- 📄 [SECURITY_GUIDE.md](./SECURITY_GUIDE.md) - 環境変数管理のベストプラクティス
- 📄 [SECURITY_AUDIT_REPORT.md](./SECURITY_AUDIT_REPORT.md) - セキュリティ監査レポート

---

## 📚 ドキュメント

完全なドキュメントは以下の専用リポジトリで管理しています。

👉 https://github.com/Yucco-K/showcase-docs
