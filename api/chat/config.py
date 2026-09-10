"""環境変数の読み込み、ロギング設定、アプリ全体で使う定数を管理する。"""

import logging
import os

from dotenv import find_dotenv, load_dotenv

# --- .envファイルのパスを動的に検索して読み込む ---
_dotenv_path = find_dotenv()
if _dotenv_path:
    load_dotenv(dotenv_path=_dotenv_path, override=True)
else:
    load_dotenv(override=True)  # フォールバック

# --- ロギング設定 ---
# Vercelの標準ログ出力に合わせ、フォーマットを指定
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)


def get_logger(name: str) -> logging.Logger:
    return logging.getLogger(name)


logger = get_logger(__name__)

# --- ベクトル検索の設定 ---
MATCH_THRESHOLD = 0.05
MATCH_COUNT = 5

# --- 事前定義された応答 ---
PREDEFINED_RESPONSES = {
    r"ありがとう|どうも": "どういたしまして。他にご不明な点はございますか？",
    r"こんにちは|こんばんは|やあ": "こんにちは！Showcase・コンシェルジュです。ご用の際はお気軽にお声がけください。",
}


def get_allowed_origins() -> list[str]:
    """CORS許可Originのリストを返す。

    環境変数ALLOWED_ORIGINS（カンマ区切り）で上書き可能。
    未設定時は本番ドメインとローカル開発用ポートのみを許可する。
    """
    allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "")
    if allowed_origins_env.strip():
        origins = [
            origin.strip()
            for origin in allowed_origins_env.split(",")
            if origin.strip()
        ]
        if origins:
            return origins
    return [
        "https://showcase-topaz.vercel.app",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]
