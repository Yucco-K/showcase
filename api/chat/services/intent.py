"""ユーザーの質問文からクエリの意図（価格比較か否か、件数、並び順）を判定する。"""

import json
import re

from langchain_core.prompts import PromptTemplate

from config import get_logger
from services.chatbot import ChatbotSingleton

logger = get_logger(__name__)

# 件数の明示指定（例: 3つ/5個/商品3つ/トップ3 など）を抽出する共通の正規表現。
# 意図分析結果の上書き判定・キーワードフォールバックの両方で使用する。
_COUNT_PATTERN = re.compile(
    r"(\d+)\s*(つ|個|件)|(?:商品|製品|もの|アプリ)\s*(\d+)\s*(?:つ|個|件)?|トップ\s*(\d+)"
)

_ASC_KEYWORDS = ["安", "低価格", "お手頃", "コスパ", "格安", "リーズナブル"]
_DESC_KEYWORDS = ["高", "高価", "高額", "プレミアム", "高級"]


def extract_count_from_query(query: str) -> int | None:
    """質問文から明示された件数（例: 「3つ」「トップ5」）を抽出する。"""
    match = _COUNT_PATTERN.search(query)
    if not match:
        return None
    try:
        return int(match.group(1) or match.group(3) or match.group(4))
    except (TypeError, ValueError):
        return None


def resolve_sort_order(query: str, llm_sort: str | None) -> str:
    """並び順を決定する。LLMの判定を優先し、無ければキーワードから推定する。"""
    if llm_sort in ("asc", "desc"):
        return llm_sort
    if any(keyword in query for keyword in _ASC_KEYWORDS):
        return "asc"
    if any(keyword in query for keyword in _DESC_KEYWORDS):
        return "desc"
    return "asc"  # デフォルトは安い順


async def analyze_query_intent(chatbot: ChatbotSingleton, query: str) -> dict:
    """LLMを使ってクエリの意図を分析する。

    返り値: {"type": "price_comparison", "sort": "asc/desc", "limit": int} or
            {"type": "none"}
    """
    intent_prompt = PromptTemplate(
        template="""あなたはユーザーの質問を分析するAIです。価格に関する質問かどうかを判定してください。

質問: {query}

以下のキーワードが含まれる場合は必ず価格比較と判定してください：
- 安い、安価、低価格、お手頃、コスパ、予算、格安、リーズナブル
- 高い、高価、高額、プレミアム、高級、値段が張る
- 価格、値段、料金

JSON形式で回答してください：

価格に関する質問の場合:
{{"type": "price_comparison", "sort": "asc or desc", "limit": 数値}}
- sort: "asc"（安い系のキーワード）または "desc"（高い系のキーワード）
- limit: 数値が明示されている場合はその数、なければ1

価格に関係ない質問の場合:
{{"type": "none"}}

例:
「安いアプリ」→ {{"type": "price_comparison", "sort": "asc", "limit": 1}}
「コスパの良いアプリ3つ」→ {{"type": "price_comparison", "sort": "asc", "limit": 3}}
「低価格アプリ5つ」→ {{"type": "price_comparison", "sort": "asc", "limit": 5}}
「一番安いアプリは？」→ {{"type": "price_comparison", "sort": "asc", "limit": 1}}
「使い方を教えて」→ {{"type": "none"}}

JSONのみ回答:
""",
        input_variables=["query"],
    )

    chain = intent_prompt | chatbot.llm
    try:
        response = await chain.ainvoke({"query": query})
    except Exception as e:
        # LLM API呼び出し自体の失敗（クォータ超過・レート制限・ネットワーク等）。
        # ここでは意図的に握りつぶし、呼び出し元のキーワードベースのフォールバックに委ねる。
        logger.warning(f"[Intent Analysis] LLM call failed for '{query}': {e}")
        return {"type": "none"}

    try:
        # JSONを抽出（マークダウンのコードブロックなどを除去）
        content = response.content.strip()
        json_match = re.search(r"\{.*\}", content, re.DOTALL)
        if json_match:
            content = json_match.group(0)

        intent_data = json.loads(content)
        logger.info(f"[Intent Analysis] Query: '{query}' → {intent_data}")
        return intent_data
    except Exception as e:
        # LLMの応答がJSONとしてパースできなかった場合（プロンプト崩れ・想定外の出力形式）。
        logger.warning(f"[Intent Analysis] Failed to parse response for '{query}': {e}")
        logger.warning(f"[Intent Analysis] Raw response: {response.content}")
        return {"type": "none"}
