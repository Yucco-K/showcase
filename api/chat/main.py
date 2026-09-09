"""FastAPIアプリケーション本体の構築（ミドルウェア設定・ルーター登録）。"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import get_allowed_origins
from routers.chat import router as chat_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_allowed_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router)
