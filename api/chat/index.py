import os
import re # 正規表現ライブラリをインポート
import json
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_community.vectorstores import SupabaseVectorStore
from langchain.prompts import PromptTemplate
from supabase.client import create_client, Client
import asyncio

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
            print("--- Chatbot初期化開始 ---")
            SUPABASE_URL = os.environ.get("SUPABASE_URL")
            SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
            OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")

            missing_vars = [v for v in ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "OPENAI_API_KEY"] if not os.environ.get(v)]
            if missing_vars:
                raise ValueError(f"環境変数が未設定です: {', '.join(missing_vars)}")
            print("環境変数チェックOK")

            self.llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.1, openai_api_key=OPENAI_API_KEY)
            self.emb = OpenAIEmbeddings(model="text-embedding-3-small", openai_api_key=OPENAI_API_KEY)
            self.supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
            print("--- Chatbot初期化正常完了 ---")

        except Exception as e:
            self.init_error = f"初期化エラー: {e}"
            print(f"!!! {self.init_error} !!!")

# --- 回答生成ロジック ---
async def generate_final_answer(chatbot: ChatbotSingleton, query: str):
    try:
        print("\n--- answering_process_started ---")
        print(f"1. raw_query: '{query}'")

        # --- 1. 動的なキーワードベースの製品検索 ---
        product_context = ""
        normalized_query = normalize_string(query)
        print(f"2. normalized_query: '{normalized_query}'")

        # 1a. DBから全商品名を取得
        print("3. fetching_all_product_names_from_db")
        products_response = await chatbot.supabase_client.from_("products").select("name").execute()
        
        matched_product_name = None
        if products_response.data:
            print(f"4. product_names_fetched: {len(products_response.data)}件")
            for i, product in enumerate(products_response.data):
                product_name = product.get('name')
                if not product_name:
                    continue
                
                normalized_name = normalize_string(product_name)
                print(f"  - 4.{i+1} checking: normalized_db_name='{normalized_name}'")
                
                if normalized_name and normalized_name in normalized_query:
                    matched_product_name = product_name
                    print(f"  ✅ 4.{i+1} MATCH_FOUND! product_name='{matched_product_name}'")
                    break
            
            if not matched_product_name:
                print("  ❌ 4. no_keyword_match_found")
        else:
            print("4. no_products_found_in_db")

        # 1b. マッチした場合、その製品の詳細を取得
        if matched_product_name:
            print(f"5. fetching_details_for_matched_product: '{matched_product_name}'")
            details_response = await chatbot.supabase_client.from_("products").select("name, description, price, features").eq("name", matched_product_name).single().execute()
            
            if details_response.data:
                product = details_response.data
                product_context = f"[製品情報]\n商品名: {product.get('name')}\n価格: ¥{product.get('price')}\n説明: {product.get('description')}\n機能: {', '.join(product.get('features', []))}"
                print("  ✅ 5. product_details_fetched_and_context_created")
            else:
                print(f"  ❌ 5. failed_to_fetch_details for '{matched_product_name}'")

        # --- 2. ベクトル検索によるドキュメント検索 ---
        print("6. starting_vector_search")
        query_embedding = chatbot.emb.embed_query(query)
        print("  - 6.1 query_embedding_created")

        rpc_response = await chatbot.supabase_client.rpc("match_docs", {"query_embedding": query_embedding, "match_threshold": 0.05, "match_count": 5}).execute()
        print("  - 6.2 rpc_match_docs_executed")

        if rpc_response.error:
            print(f"  ❌ 6.3 rpc_error: {rpc_response.error.message}")
            raise Exception(f"Supabase RPCエラー: {rpc_response.error.message}")

        semantic_context = "\n---\n".join([doc["content"] for doc in rpc_response.data])
        print(f"  - 6.4 semantic_context_created: found {len(rpc_response.data)} documents")
        
        # --- 3. コンテキストを結合して最終的なプロンプトを作成 ---
        print("7. preparing_final_prompt")
        final_context = f"{product_context}\n\n{semantic_context}".strip()

        if not final_context:
            print("  ❌ 7.1 final_context_is_empty. aborting.")
            return "申し訳ありません、ご質問に関連する情報が見つかりませんでした。"
        
        print(f"  - 7.2 final_context (truncated): '{final_context[:200]}...'")

        prompt_template = """
        あなたは、企業の製品やサービスについて回答する、親切で優秀なAIアシスタント「ポートフォリオ・コンシェルジュ」です。
        以下のルールを厳密に守って、ユーザーの質問に日本語で回答してください。

        # ルール
        - 誠実で、丁寧な言葉遣いを徹底してください。
        - 提供された「コンテキスト情報」に書かれている事実のみに基づいて回答してください。
        - コンテキスト情報に記載のない事柄については、「恐れ入りますが、その件に関する情報は持ち合わせておりません。」と回答してください。
        - 回答は、まず結論から述べ、その後に理由や詳細を簡潔に説明してください。
        - ユーザーを決して混乱させないでください。不明な点があれば、質問して明確化を求めてください。

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

    except Exception as e:
        print(f"!!!回答生成プロセスで予期せぬエラー!!!: {e}")
        return "申し訳ありません、現在回答を生成できません。"

@app.post("/api/chat")
async def handle_chat(request: Request):
    chatbot = await ChatbotSingleton.get_instance()
    
    if chatbot.init_error:
        return JSONResponse(status_code=500, content={"error": chatbot.init_error})
    
    try:
        data = await request.json()
        user_query = data.get("message")
        if not user_query:
            return JSONResponse(status_code=400, content={"error": "メッセージが必要です。"})
        
        final_answer = await generate_final_answer(chatbot, user_query)
        
        return JSONResponse(content={"reply": final_answer})
    except Exception as e:
        print(f"API処理エラー: {e}")
        return JSONResponse(status_code=500, content={"error": "内部サーバーエラーが発生しました。"}) 