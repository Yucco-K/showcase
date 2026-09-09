"""チャットAPIのエンドポイント定義。"""

import traceback

import openai
from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from services.chatbot import ChatbotSingleton
from services.retrieval import generate_final_answer

from config import get_logger

logger = get_logger(__name__)

router = APIRouter()


@router.post("/api/chat")
async def handle_chat(request: Request):
    logger.info("--- handle_chat_invoked ---")
    try:
        chatbot = await ChatbotSingleton.get_instance()

        if chatbot.init_error:
            logger.error(f"!!! Initialization Error Intercepted: {chatbot.init_error}")
            return JSONResponse(status_code=500, content={"error": chatbot.init_error})

        logger.info("1. chatbot_instance_retrieved")

        data = await request.json()
        logger.info(f"2. request_body_parsed: {data}")

        user_query = data.get("message")
        if not user_query:
            logger.warning("!!! 'message' key not found in request")
            return JSONResponse(
                status_code=400, content={"error": "メッセージが必要です。"}
            )

        logger.info(f"3. user_query_extracted: '{user_query}'")

        final_answer = await generate_final_answer(chatbot, user_query)
        logger.info(f"4. final_answer_generated: '{final_answer}'")

        response = JSONResponse(content={"reply": final_answer})
        logger.info("5. response_prepared. returning...")
        return response
    except openai.RateLimitError as e:
        logger.error(f"!!! OpenAI RateLimitError in handle_chat: {e}")
        return JSONResponse(
            status_code=503,
            content={
                "error": "AI機能が現在ご利用いただけません（OpenAI APIの利用上限に達しています）。しばらく経ってから再度お試しください。"
            },
        )
    except Exception as e:
        error_details = traceback.format_exc()
        logger.error("!!! UNHANDLED EXCEPTION in handle_chat !!!")
        logger.error(f"Error: {e}")
        logger.error(f"Traceback:\n{error_details}")
        return JSONResponse(
            status_code=500,
            content={
                "error": "予期せぬ内部サーバーエラーが発生しました。詳細はログを確認してください。"
            },
        )
