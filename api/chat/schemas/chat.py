"""チャットAPIのリクエスト/レスポンス形状の定義（ドキュメント目的の型情報）。

既存フロントエンド(src/api/chat.ts)との互換性を保つため、実際のバリデーション
（メッセージ必須チェック）はrouters/chat.pyで従来通り手動で行い、ここでは
型の可視化のみを目的とする。
"""

from typing import TypedDict


class ChatRequest(TypedDict, total=False):
    message: str


class ChatErrorResponse(TypedDict):
    error: str


class ChatSuccessResponse(TypedDict):
    reply: str
