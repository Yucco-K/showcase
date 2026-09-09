"""LangChain/OpenAI/SupabaseクライアントをまとめたChatbotのシングルトン管理。"""

import asyncio
import os
import traceback

from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from supabase.client import create_client

from config import get_logger

logger = get_logger(__name__)


class ChatbotSingleton:
    _instance = None
    _lock = asyncio.Lock()

    llm = None
    emb = None
    supabase_client = None
    init_error = None

    @classmethod
    async def get_instance(cls) -> "ChatbotSingleton":
        if cls._instance is None:
            async with cls._lock:
                if cls._instance is None:
                    instance = cls()
                    await instance._initialize()
                    cls._instance = instance
        return cls._instance

    async def _initialize(self) -> None:
        try:
            logger.info("--- Chatbot初期化開始 ---")
            supabase_url = os.environ.get("SUPABASE_URL")
            supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
            openai_api_key = os.environ.get("OPENAI_API_KEY")

            missing_vars = [
                v
                for v in ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "OPENAI_API_KEY"]
                if not os.environ.get(v)
            ]
            if missing_vars:
                raise ValueError(f"環境変数が未設定です: {', '.join(missing_vars)}")
            logger.info("環境変数チェックOK")

            self.llm = ChatOpenAI(
                model="gpt-4o-mini", temperature=0.1, openai_api_key=openai_api_key
            )
            self.emb = OpenAIEmbeddings(
                model="text-embedding-3-small", openai_api_key=openai_api_key
            )
            self.supabase_client = create_client(supabase_url, supabase_key)
            logger.info("--- Chatbot初期化正常完了 ---")

        except Exception as e:
            self.init_error = f"初期化エラー: {e}"
            logger.error(f"!!! {self.init_error} !!!")
            logger.error(traceback.format_exc())  # トレースバックもログに出力
