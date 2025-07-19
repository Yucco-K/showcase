# Portfolio Showcase - Obsidian ワークスペース

## 📋 このファイルの使い方

1. **Obsidian で開く**: このファイルを Obsidian で開いて編集
2. **リアルタイムプレビュー**: マーメイド図が即座に表示される
3. **編集完了後**: マークダウンファイルとして保存
4. **自動エクスポート**: スクリプトで Notion に送信

---

## 🏗️ システムアーキテクチャ図

### 高レベルアーキテクチャ

```mermaid
graph TB
    subgraph "フロントエンド"
        A[React/TypeScript]
        B[Vercel CDN<br/>エッジネットワーク]
    end

    subgraph "バックエンド"
        C[Supabase]
        D[PostgreSQL<br/>リアルタイム]
    end

    subgraph "外部サービス"
        E[Stripe API]
        F[Notion API]
    end

    A <--> C
    C <--> E
    C <--> F
    A --> B
    C --> D
```

### データフローアーキテクチャ

```mermaid
sequenceDiagram
    participant U as ユーザー
    participant V as Vercel Edge
    participant R as React App
    participant S as Supabase API
    participant P as PostgreSQL
    participant St as Stripe API
    participant N as Notion API
    participant A as 管理者パネル

    U->>V: ユーザーリクエスト
    V->>R: エッジ処理
    R->>S: API呼び出し
    S->>P: データベース操作

    U->>R: 決済アクション
    R->>St: 決済処理
    St-->>R: 決済結果

    A->>N: コンテンツ同期
    N-->>A: 同期完了
```

---

## 🗄️ データベース設計

### エンティティ関係図（ERD）

```mermaid
erDiagram
    auth.users ||--|| profiles : "1:1"
    profiles ||--o{ product_purchases : "1:N"
    profiles ||--o{ blogs : "1:N"
    products ||--o{ product_purchases : "1:N"
    products ||--o{ product_reviews : "1:N"
    products ||--o{ product_likes : "1:N"
    profiles ||--o{ product_reviews : "1:N"
    profiles ||--o{ product_likes : "1:N"
    profiles ||--o{ contacts : "1:N"

    auth.users {
        uuid id PK
        string email
        string encrypted_password
        timestamp created_at
        timestamp updated_at
    }

    profiles {
        uuid id PK,FK
        string email
        string full_name
        string avatar_url
        text biography
        timestamp created_at
        timestamp updated_at
    }

    products {
        uuid id PK
        string name
        text description
        decimal price
        string image_url
        string category
        boolean is_active
        json extra_info
        timestamp created_at
        timestamp updated_at
    }

    product_purchases {
        uuid id PK
        uuid user_id FK
        uuid product_id FK
        string stripe_payment_intent_id
        decimal amount
        string status
        timestamp created_at
    }

    product_reviews {
        uuid id PK
        uuid product_id FK
        uuid user_id FK
        integer rating
        text comment
        timestamp created_at
        timestamp updated_at
    }

    product_likes {
        uuid id PK
        uuid product_id FK
        uuid user_id FK
        timestamp created_at
    }

    blogs {
        uuid id PK
        string title
        text content
        uuid author_id FK
        boolean is_published
        timestamp created_at
        timestamp updated_at
    }

    contacts {
        uuid id PK
        string name
        string email
        text message
        string status
        boolean is_replied
        timestamp created_at
    }
```

---

## 🔄 ワークフロー手順

### Step 1: Obsidian での編集

1. このファイルを Obsidian で開く
2. マーメイド図を編集・調整
3. リアルタイムプレビューで確認
4. 満足いくまで編集

### Step 2: マークダウンファイルへの保存

1. 編集内容を`docs/TECHNICAL_DOCUMENTATION_JA.md`にコピー
2. または、このファイルを直接保存

### Step 3: Notion への自動エクスポート

```bash
npm run export:notion:template
```

### Step 4: Notion での確認

1. 作成されたページを開く
2. マーメイド図が正しく表示されているか確認
3. 必要に応じて調整

---

## 💡 図の編集ヒント

### フローチャート

```mermaid
graph LR
    A[開始] --> B{条件}
    B -->|Yes| C[処理1]
    B -->|No| D[処理2]
    C --> E[終了]
    D --> E
```

### シーケンス図

```mermaid
sequenceDiagram
    participant A as システムA
    participant B as システムB
    A->>B: リクエスト
    B-->>A: レスポンス
```

### クラス図

```mermaid
classDiagram
    class User {
        +String name
        +String email
        +login()
        +logout()
    }
    class Product {
        +String title
        +Number price
        +getDetails()
    }
    User --> Product : purchases
```

---

## 📝 編集履歴

- **2025-01-18**: 初期版作成
- **次回更新**: 図の調整・追加時

---

## 🎯 完了チェックリスト

- [ ] Obsidian で図を編集・確認
- [ ] マークダウンファイルに保存
- [ ] スクリプトで Notion にエクスポート
- [ ] Notion で図の表示確認
- [ ] 必要に応じて調整・再エクスポート
