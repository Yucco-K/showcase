import os
import re # 正規表現ライブラリをインポート
import json
import logging  # loggingをインポート
import traceback # スタックトレース出力のためにインポート
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_community.vectorstores import SupabaseVectorStore
from langchain.prompts import PromptTemplate
from supabase.client import create_client, Client
from postgrest import APIError # v2の正式なエラー型をインポート
import asyncio
from logging.handlers import RotatingFileHandler
from dotenv import load_dotenv, find_dotenv
from fastapi import FastAPI, Request, HTTPException
from langchain_core.prompts import ChatPromptTemplate
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from supabase.lib.client_options import ClientOptions
from supabase import create_client, Client

# --- カスタム例外クラス ---
class DatabaseError(Exception):
    """データベース関連のエラー"""
    pass

# --- 設定定数 ---
MATCH_THRESHOLD = 0.05
MATCH_COUNT = 5

# --- .envファイルのパスを動的に検索して読み込む ---
dotenv_path = find_dotenv()
if dotenv_path:
    load_dotenv(dotenv_path=dotenv_path, override=True)
else:
    load_dotenv(override=True) # フォールバック

# --- ロギング設定 ---
log_formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')

# --- ロガーのセットアップ ---
# Vercelの標準ログ出力に合わせ、フォーマットを指定
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# --- 事前定義された応答 ---
PREDEFINED_RESPONSES = {
    r"ありがとう|どうも": "どういたしまして。他にご不明な点はございますか？",
    r"こんにちは|こんばんは|やあ": "こんにちは！Showcase・コンシェルジュです。ご用の際はお気軽にお声がけください。",
}

# --- FastAPIアプリとミドルウェア ---
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- ヘルパー関数: 高度な文字列正規化 ---
def normalize_string(text: str) -> str:
    """スペース、改行、タブなどの空白をすべて除去し、小文字に変換する"""
    if not text:
        return ""
    # \s+ は1つ以上の任意の空白文字（スペース、タブ、改行など）にマッチ
    text = re.sub(r'\s+', '', text)
    return text.lower()

# --- LangChainコンポーネントのシングルトン管理 ---
class ChatbotSingleton:
    _instance = None
    _lock = asyncio.Lock()
    
    llm = None
    emb = None
    supabase_client = None
    init_error = None

    @classmethod
    async def get_instance(cls):
        if cls._instance is None:
            async with cls._lock:
                if cls._instance is None:
                    instance = cls()
                    await instance._initialize()
                    cls._instance = instance
        return cls._instance

    async def _initialize(self):
        try:
            logger.info("--- Chatbot初期化開始 ---")
            SUPABASE_URL = os.environ.get("SUPABASE_URL")
            SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
            OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")

            missing_vars = [v for v in ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "OPENAI_API_KEY"] if not os.environ.get(v)]
            if missing_vars:
                raise ValueError(f"環境変数が未設定です: {', '.join(missing_vars)}")
            logger.info("環境変数チェックOK")

            self.llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.1, openai_api_key=OPENAI_API_KEY)
            self.emb = OpenAIEmbeddings(model="text-embedding-3-small", openai_api_key=OPENAI_API_KEY)
            self.supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
            logger.info("--- Chatbot初期化正常完了 ---")

        except Exception as e:
            self.init_error = f"初期化エラー: {e}"
            logger.error(f"!!! {self.init_error} !!!")
            logger.error(traceback.format_exc()) # トレースバックもログに出力

# --- 回答生成ロジック ---
async def generate_final_answer(chatbot: ChatbotSingleton, query: str):
    # この関数内のエラーは呼び出し元(handle_chat)に伝播させ、そこで一元的に処理します。
    logger.info("--- answering_process_started ---")
    logger.info(f"1. raw_query: '{query}'")

    # --- 0. 事前定義された応答のチェック ---
    normalized_query_for_greeting = normalize_string(query)
    for regex, response in PREDEFINED_RESPONSES.items():
        if re.search(regex, normalized_query_for_greeting):
            logger.info(f"✅ Predefined response found for '{query}'")
            return response

    # --- 1. 価格比較のチェック ---
    # 高い/安いのキーワードを幅広く拾うように修正
    if any(keyword in query for keyword in ["一番高い", "最も高い", "高い"]):
        logger.info("価格比較クエリ（最高値）を検出")
        products = chatbot.supabase_client.from_("products").select("name, price").execute().data
        if products:
            highest_product = max(products, key=lambda p: p['price'])
            response = f"最も価格が高い製品は「{highest_product['name']}」で、価格は¥{highest_product['price']:,}です。"
            response += "\n\n正確な最新情報については、各製品ページをご確認ください。"
            return response
    
    if any(keyword in query for keyword in ["一番安い", "最も安い", "安い"]):
        logger.info("価格比較クエリ（最安値）を検出")
        products = chatbot.supabase_client.from_("products").select("name, price").execute().data
        if products:
            lowest_product = min(products, key=lambda p: p['price'])
            response = f"最も価格が安い製品は「{lowest_product['name']}」で、価格は¥{lowest_product['price']:,}です。"
            response += "\n\n正確な最新情報については、各製品ページをご確認ください。"
            return response


    # --- 2. 動的なキーワードベースの製品検索 ---
    product_context = ""
    normalized_query = normalize_string(query)
    logger.info(f"2. normalized_query: '{normalized_query}'")

    # 1a. DBから全商品名を取得
    logger.info("3. fetching_all_product_names_from_db")
    products_response = chatbot.supabase_client.from_("products").select("name").execute()
    
    matched_product_name = None
    if products_response.data:
        logger.info(f"4. product_names_fetched: {len(products_response.data)}件")
        for i, product in enumerate(products_response.data):
            product_name = product.get('name')
            if not product_name:
                continue
            
            normalized_name = normalize_string(product_name)
            logger.info(f"  - 4.{i+1} checking: normalized_db_name='{normalized_name}'")
            
            if normalized_name and normalized_name in normalized_query:
                matched_product_name = product_name
                logger.info(f"  ✅ 4.{i+1} MATCH_FOUND! product_name='{matched_product_name}'")
                break
        
        if not matched_product_name:
            logger.info("  ❌ 4. no_keyword_match_found")
    else:
        logger.info("4. no_products_found_in_db")

    # 1b. マッチした場合、その製品の詳細を取得
    if matched_product_name:
        # 製品名をホワイトリストで検証
        valid_product_names = [product.get('name') for product in products_response.data if product.get('name')]
        if matched_product_name not in valid_product_names:
            logger.error(f"  ❌ 5. matched_product_name '{matched_product_name}' is not in the whitelist of valid product names.")
            matched_product_name = None  # 無効な製品名の場合はリセット
        else:
            logger.info(f"5. fetching_details_for_matched_product: '{matched_product_name}'")
            details_response = chatbot.supabase_client.from_("products").select("name, description, price, features").eq("name", matched_product_name).single().execute()
            
            if details_response.data:
                product = details_response.data
                product_context = f"[製品情報]\n商品名: {product.get('name')}\n価格: ¥{product.get('price')}\n説明: {product.get('description')}\n機能: {', '.join(product.get('features', []))}"
                logger.info("  ✅ 5. product_details_fetched_and_context_created")
            else:
                logger.info(f"  ❌ 5. failed_to_fetch_details for '{matched_product_name}'")

    # --- 2. ベクトル検索によるドキュメント検索 ---
    logger.info("6. starting_vector_search")
    query_embedding = chatbot.emb.embed_query(query)
    logger.info("  - 6.1 query_embedding_created")

    try:
        rpc_response = chatbot.supabase_client.rpc("match_docs", {"query_embedding": query_embedding, "match_threshold": MATCH_THRESHOLD, "match_count": MATCH_COUNT}).execute()
        logger.info("  - 6.2 rpc_match_docs_executed")

        # Supabase-py v2では、成功すると.dataに、失敗するとAPIErrorがraiseされる
        semantic_context = "\n---\n".join([doc["content"] for doc in rpc_response.data])
        logger.info(f"  - 6.3 semantic_context_created: found {len(rpc_response.data)} documents")

    except APIError as e:
        logger.error(f"  ❌ Supabase RPC 'match_docs' failed: {e.message}")
        # このエラーを上位のhandle_chatに伝播させて500エラーを返させる
        raise DatabaseError(f"ベクトル検索中にデータベースエラーが発生しました: {e.message}") from e

    # --- 3. コンテキストを結合して最終的なプロンプトを作成 ---
    logger.info("7. preparing_final_prompt")
    final_context = f"{product_context}\n\n{semantic_context}".strip()

    if not final_context:
        logger.warning("  ⚠️ 7.1 final_context_is_empty. returning friendly message.")
        return "申し訳ありません、ご質問に関連する情報が見つかりませんでした。"
    
    logger.info(f"  - 7.2 final_context (truncated): '{final_context[:200]}...'")

    prompt_template = """
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
    prompt = PromptTemplate(
        template=prompt_template, input_variables=["context", "question"]
    )
    
    response_chain = prompt | chatbot.llm
    answer = await response_chain.ainvoke({"context": final_context, "question": query})
    
    return answer.content

@app.post("/api/chat")
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
            return JSONResponse(status_code=400, content={"error": "メッセージが必要です。"})
        
        logger.info(f"3. user_query_extracted: '{user_query}'")

        final_answer = await generate_final_answer(chatbot, user_query)
        logger.info(f"4. final_answer_generated: '{final_answer}'")
        
        response = JSONResponse(content={"reply": final_answer})
        logger.info("5. response_prepared. returning...")
        return response
    except Exception as e:
        error_details = traceback.format_exc()
        logger.error("!!! UNHANDLED EXCEPTION in handle_chat !!!")
        logger.error(f"Error: {e}")
        logger.error(f"Traceback:\n{error_details}")
        return JSONResponse(status_code=500, content={"error": "予期せぬ内部サーバーエラーが発生しました。詳細はログを確認してください。"})