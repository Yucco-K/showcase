import os
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_community.vectorstores import SupabaseVectorStore
from langchain.chains import LLMChain, RetrievalQA
from langchain.prompts import PromptTemplate
from supabase.client import create_client, Client

# --- FastAPIアプリ ---
app = FastAPI()

# デバッグ用ミドルウェア: リクエストパスをログに出力
@app.middleware("http")
async def log_requests(request: Request, call_next):
    print(f"受信リクエスト: {request.method} {request.url.path}")
    response = await call_next(request)
    return response

# --- CORSミドルウェアの設定 ---
# すべてのオリジンからのリクエストを許可
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # 本番環境では特定のドメインに制限することが望ましい
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 環境変数 ---
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") # VercelではANON_KEYではなくSERVICE_ROLE_KEYが推奨される
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")

# --- LangChain & Supabase 初期化 ---
try:
    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.1, openai_api_key=OPENAI_API_KEY)
    emb = OpenAIEmbeddings(model="text-embedding-3-small", openai_api_key=OPENAI_API_KEY)
    supabase_client: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

    vector_store = SupabaseVectorStore(
        client=supabase_client,
        embedding=emb,
        table_name="doc_embeddings",
        query_name="match_docs",
    )
except Exception as e:
    print(f"初期化エラー: {e}")
    llm = None
    vector_store = None

# 1. キーワード抽出チェーン
kw_prompt = PromptTemplate.from_template("ユーザーの質問から商品名や重要語を3つ以内で抽出してください: {question}")
kw_chain = LLMChain(llm=llm, prompt=kw_prompt) if llm else None

# 2. 意図分類チェーン
intent_prompt = PromptTemplate.from_template("質問を次のカテゴリから1つ選んで出力: 製品, FAQ, 技術情報, その他\n質問: {question}")
intent_chain = LLMChain(llm=llm, prompt=intent_prompt) if llm else None

# 3. RAG 検索＋生成
rag_qa = RetrievalQA.from_chain_type(
    llm=llm,
    chain_type="stuff",
    retriever=vector_store.as_retriever(search_kwargs={"k": 5}),
) if llm and vector_store else None

def create_enhanced_query(original_query: str) -> str:
    """キーワードと意図を付加してクエリを強化する"""
    if not kw_chain or not intent_chain:
        return original_query

    try:
        keywords = kw_chain.invoke({"question": original_query})["text"]
        intent = intent_chain.invoke({"question": original_query})["text"]
        enhanced_query = f"{original_query}\n\n[補足情報]\n重要キーワード: {keywords}\n推論された意図: {intent}"
        return enhanced_query
    except Exception as e:
        print(f"クエリ強化エラー: {e}")
        return original_query

# --- APIエンドポイントの修正 ---
@app.post("/api/chat")
async def handle_chat(request: Request):
    """チャットボットのエンドポイント。Vercelが /api/chat をこの関数にルーティングする"""
    if not all([llm, vector_store, rag_qa, kw_chain, intent_chain]):
        return JSONResponse(status_code=500, content={"error": "サーバーが正しく初期化されていません。"})

    try:
        data = await request.json()
        user_query = data.get("message")

        if not user_query:
            return JSONResponse(status_code=400, content={"error": "メッセージが必要です。"})

        # クエリを強化
        enhanced_query = create_enhanced_query(user_query)

        # RAGを実行して回答を生成
        result = rag_qa.invoke({"query": enhanced_query})
        
        return JSONResponse(content={"reply": result.get("result", "回答を生成できませんでした。")})

    except Exception as e:
        print(f"APIエラー: {e}")
        return JSONResponse(status_code=500, content={"error": "内部サーバーエラーが発生しました。"}) 