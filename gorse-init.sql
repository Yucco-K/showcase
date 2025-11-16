-- Gorse推薦エンジン用PostgreSQLデータベース初期化スクリプト

-- データベースとユーザーの作成（既にDocker Composeで作成済み）
-- CREATE DATABASE gorse;
-- CREATE USER gorse WITH PASSWORD 'gorsepassword';
-- GRANT ALL PRIVILEGES ON DATABASE gorse TO gorse;

-- Gorse用の拡張機能を有効化
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- タイムゾーンの設定
SET timezone = 'UTC';

-- 接続確認用テーブル（オプション）
CREATE TABLE IF NOT EXISTS gorse_health_check (
    id SERIAL PRIMARY KEY,
    status VARCHAR(50) NOT NULL DEFAULT 'ok',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 初期データの挿入
INSERT INTO gorse_health_check (status) VALUES ('initialized');

-- インデックスの作成（Gorseが自動で作成するが、パフォーマンス向上のため事前作成）
-- 注意: これらのテーブルはGorseが自動で作成するため、エラーが出る場合があります

-- Gorseのメタデータテーブル用インデックス（Gorseが作成後に実行）
-- CREATE INDEX IF NOT EXISTS idx_items_timestamp ON items(timestamp);
-- CREATE INDEX IF NOT EXISTS idx_users_timestamp ON users(timestamp);
-- CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback(user_id);
-- CREATE INDEX IF NOT EXISTS idx_feedback_item_id ON feedback(item_id);
-- CREATE INDEX IF NOT EXISTS idx_feedback_timestamp ON feedback(timestamp);

-- 開発環境用のサンプルデータ（Gorseが起動してから手動で実行）
-- 注意: これらのSQLはGorseのREST APIまたはSDK経由で実行する必要があります

-- サンプルユーザー
-- INSERT INTO users (user_id, labels) VALUES
-- ('user1', '{}'),
-- ('user2', '{}'),
-- ('user3', '{}');

-- サンプルアイテム
-- INSERT INTO items (item_id, labels, categories, is_hidden, timestamp) VALUES
-- ('item1', '{}', '{"electronics"}', false, NOW()),
-- ('item2', '{}', '{"books"}', false, NOW()),
-- ('item3', '{}', '{"clothing"}', false, NOW());

-- サンプルフィードバック
-- INSERT INTO feedback (feedback_type, user_id, item_id, timestamp) VALUES
-- ('like', 'user1', 'item1', NOW()),
-- ('view', 'user1', 'item2', NOW()),
-- ('purchase', 'user2', 'item1', NOW());

-- データベース統計情報の更新
ANALYZE;
