"""ユーザーの質問に対する最終的な回答を組み立てるオーケストレーション層。

事前定義応答 → LLM意図分析による価格比較 → キーワードベースの価格比較
（フォールバック）→ 商品名の直接マッチ → ベクトル検索(RAG) → LLM回答生成、
という優先順位で処理する。
"""

import re

from langchain_core.prompts import PromptTemplate
from repositories import product_repository

from config import MATCH_COUNT, MATCH_THRESHOLD, PREDEFINED_RESPONSES, get_logger
from services.chatbot import ChatbotSingleton
from services.intent import (
    analyze_query_intent,
    extract_count_from_query,
    resolve_sort_order,
)

logger = get_logger(__name__)

_FINAL_PROMPT_TEMPLATE = """
    あなたは、企業の製品やサービスについて回答する、親切で優秀なAIアシスタント「Showcase・コンシェルジュ」です。
    以下のルールを厳密に守って、ユーザーの質問に日本語で回答してください。

    # ルール
    - 誠実で、丁寧な言葉遣いを徹底してください。
    - 提供された「コンテキスト情報」に書かれている事実のみに基づいて回答してください。
    - 感謝の言葉や挨拶以外の、定型的な応答（例：「他にご不明な点はございますか？」）は不要です。自然な会話を心がけてください。
    - コンテキスト情報に記載のない事柄については、「恐れ入れますが、その件に関する情報は持ち合わせておりません。」と正直に回答してください。
    - 例外として、「プライバシーポリシー」や「利用規約」に関する情報が見つからなかった場合に限り、「プライバシーポリシーや利用規約については、お問い合わせページをご確認いただけます。」と案内してください。
    - 回答は、まず結論から述べ、その後に理由や詳細を簡潔に説明してください。

    # コンテキスト情報
    {context}

    # ユーザーの質問
    {question}

    # 回答
    """


def normalize_string(text: str) -> str:
    """スペース、改行、タブなどの空白をすべて除去し、小文字に変換する"""
    if not text:
        return ""
    # \s+ は1つ以上の任意の空白文字（スペース、タブ、改行など）にマッチ
    text = re.sub(r"\s+", "", text)
    return text.lower()


def _format_price_comparison_response(products: list[dict], desc: bool) -> str:
    if not products:
        logger.warning("有効な価格データを持つ商品が見つかりませんでした")
        return "申し訳ありません、現在価格情報のある商品が見つかりませんでした。"

    if len(products) == 1:
        product = products[0]
        logger.info(f"商品: {product['name']} - ¥{product['price']}")
        price_desc = "最も価格が高い" if desc else "最も価格が安い"
        response = f"{price_desc}製品は「{product['name']}」で、価格は¥{product['price']:,}です。"
    else:
        logger.info(f"商品{len(products)}件を取得")
        price_desc = "価格が高い順" if desc else "価格が安い順"
        response = f"{price_desc}に{len(products)}件の製品をご紹介します：\n\n"
        for i, product in enumerate(products, 1):
            response += f"{i}. {product['name']} - ¥{product['price']:,}\n"

    response += "\n正確な最新情報については、各製品ページをご確認ください。"
    return response


async def get_price_comparison_response(
    chatbot: ChatbotSingleton, desc: bool, limit: int
) -> str:
    """価格でソートした商品を取得し、案内文を組み立てる。

    LLM意図分析経由・キーワードフォールバック経由の両方から共通で呼び出す
    （従来はほぼ同一のロジックが2箇所に重複していたものを統合）。
    """
    try:
        limit = int(limit)
    except (TypeError, ValueError):
        limit = 1
    limit = min(max(limit, 1), 10)
    products = product_repository.get_products_sorted_by_price(
        chatbot.supabase_client, desc=desc, limit=limit
    )
    return _format_price_comparison_response(products, desc)


def find_matching_product_context(
    supabase_client, query: str
) -> tuple[str | None, str]:
    """質問文に含まれる商品名を検出し、一致した場合は商品情報のコンテキストを返す。"""
    normalized_query = normalize_string(query)
    logger.info(f"2. normalized_query: '{normalized_query}'")

    logger.info("3. fetching_all_product_names_from_db")
    products = product_repository.get_all_product_names(supabase_client)

    matched_product_name = None
    if products:
        logger.info(f"4. product_names_fetched: {len(products)}件")
        for i, product in enumerate(products):
            product_name = product.get("name")
            if not product_name:
                continue
            normalized_name = normalize_string(product_name)
            logger.info(f"  - 4.{i+1} checking: normalized_db_name='{normalized_name}'")
            if normalized_name and normalized_name in normalized_query:
                matched_product_name = product_name
                logger.info(
                    f"  ✅ 4.{i+1} MATCH_FOUND! product_name='{matched_product_name}'"
                )
                break
        if not matched_product_name:
            logger.info("  ❌ 4. no_keyword_match_found")
    else:
        logger.info("4. no_products_found_in_db")

    if not matched_product_name:
        return None, ""

    # 製品名をホワイトリストで検証（matched_product_nameは上記のproducts走査から
    # 得ているため通常は必ず含まれるが、念のための防御的チェックとして維持）
    valid_product_names = [p.get("name") for p in products if p.get("name")]
    if matched_product_name not in valid_product_names:
        logger.error(
            f"  ❌ 5. matched_product_name '{matched_product_name}' is not in the whitelist of valid product names."
        )
        return None, ""

    logger.info(f"5. fetching_details_for_matched_product: '{matched_product_name}'")
    details = product_repository.get_product_details_by_name(
        supabase_client, matched_product_name
    )
    if not details:
        logger.info(f"  ❌ 5. failed_to_fetch_details for '{matched_product_name}'")
        return matched_product_name, ""

    features = details.get("features", [])
    features_str = (
        ", ".join(features)
        if isinstance(features, list)
        else (str(features) if features else "")
    )
    context = (
        f"[製品情報]\n商品名: {details.get('name')}\n価格: ¥{details.get('price')}\n"
        f"説明: {details.get('description')}\n機能: {features_str}"
    )
    logger.info("  ✅ 5. product_details_fetched_and_context_created")
    return matched_product_name, context


def _format_product_context(product: dict) -> str:
    features = product.get("features", [])
    features_str = (
        ", ".join(features)
        if isinstance(features, list)
        else (str(features) if features else "")
    )
    return (
        f"[製品情報]\n商品名: {product.get('name')}\n価格: ¥{product.get('price')}\n"
        f"説明: {product.get('description')}\n機能: {features_str}"
    )


def build_semantic_context(
    chatbot: ChatbotSingleton, query_embedding: list[float], skip_product_search: bool
) -> str:
    """ドキュメント・商品のベクトル検索結果を結合したコンテキストを組み立てる。"""
    logger.info("6. starting_vector_search")
    semantic_context = ""

    docs = product_repository.match_docs(
        chatbot.supabase_client, query_embedding, MATCH_THRESHOLD, MATCH_COUNT
    )
    logger.info(f"  - 6.2 rpc_match_docs_executed: found {len(docs)} documents")
    if docs:
        semantic_context += "\n---\n".join([doc["content"] for doc in docs])

    # 商品検索（キーワードマッチがない場合のみ）
    if not skip_product_search:
        matched_products = product_repository.match_products(
            chatbot.supabase_client, query_embedding, MATCH_THRESHOLD, 3
        )
        logger.info(
            f"  - 6.3 rpc_match_products_executed: found {len(matched_products)} products"
        )
        if matched_products:
            product_ids = [p["product_id"] for p in matched_products]
            details_list = product_repository.get_product_details_by_ids(
                chatbot.supabase_client, product_ids
            )
            if details_list:
                product_contexts = [_format_product_context(p) for p in details_list]
                if semantic_context:
                    semantic_context += "\n---\n"
                semantic_context += "\n---\n".join(product_contexts)
                logger.info(
                    f"  - 6.4 vector_search_product_context_added: {len(product_contexts)} products"
                )

    logger.info(
        f"  - 6.5 semantic_context_created: total length {len(semantic_context)}"
    )
    return semantic_context


async def generate_final_answer(chatbot: ChatbotSingleton, query: str) -> str:
    # この関数内のエラーは呼び出し元(handle_chat)に伝播させ、そこで一元的に処理します。
    logger.info("--- answering_process_started ---")
    logger.info(f"1. raw_query: '{query}'")

    # --- 0. 事前定義された応答のチェック ---
    normalized_query_for_greeting = normalize_string(query)
    for regex, response in PREDEFINED_RESPONSES.items():
        if re.search(regex, normalized_query_for_greeting):
            logger.info(f"✅ Predefined response found for '{query}'")
            return response

    # --- 1. LLMによる意図分析 ---
    intent = await analyze_query_intent(chatbot, query)
    logger.info(f"[Intent] Detected: {intent}")

    if intent.get("type") == "price_comparison":
        logger.info("価格比較クエリを検出（LLM分析）")
        extracted_count = extract_count_from_query(query)
        limit = intent.get("limit") or extracted_count or 1
        sort_order = resolve_sort_order(query, intent.get("sort"))
        return await get_price_comparison_response(
            chatbot, desc=(sort_order == "desc"), limit=limit
        )

    # --- 2. 従来のキーワードベースの価格比較（フォールバック） ---
    if any(
        keyword in query
        for keyword in ["一番高い", "最も高い", "高い", "高価格", "高額"]
    ):
        logger.info("価格比較クエリ（最高値）を検出")
        limit = extract_count_from_query(query) or 1
        return await get_price_comparison_response(chatbot, desc=True, limit=limit)

    if any(keyword in query for keyword in ["一番安い", "最も安い", "安い", "低価格"]):
        logger.info("価格比較クエリ（最安値）を検出")
        limit = extract_count_from_query(query) or 1
        return await get_price_comparison_response(chatbot, desc=False, limit=limit)

    # --- 3. 動的なキーワードベースの製品検索 ---
    matched_product_name, product_context = find_matching_product_context(
        chatbot.supabase_client, query
    )

    # --- 4. ベクトル検索（ドキュメント + 商品） ---
    query_embedding = chatbot.emb.embed_query(query)
    logger.info("  - 6.1 query_embedding_created")
    semantic_context = build_semantic_context(
        chatbot, query_embedding, skip_product_search=bool(matched_product_name)
    )

    # --- 5. コンテキストを結合して最終的なプロンプトを作成 ---
    logger.info("7. preparing_final_prompt")
    final_context = f"{product_context}\n\n{semantic_context}".strip()

    if not final_context:
        logger.warning("  ⚠️ 7.1 final_context_is_empty. returning friendly message.")
        return "申し訳ありません、ご質問に関連する情報が見つかりませんでした。"

    logger.info(f"  - 7.2 final_context (truncated): '{final_context[:200]}...'")

    prompt = PromptTemplate(
        template=_FINAL_PROMPT_TEMPLATE, input_variables=["context", "question"]
    )
    response_chain = prompt | chatbot.llm
    answer = await response_chain.ainvoke({"context": final_context, "question": query})

    return answer.content
