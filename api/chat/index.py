import os
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_community.vectorstores import SupabaseVectorStore
from langchain.chains import LLMChain, RetrievalQA
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

# --- LangChainコンポーネントのシングルトン管理 ---
class ChatbotSingleton:
    _instance = None
    _lock = asyncio.Lock()
    
    llm = None
    vector_store = None
    rag_qa = None
    kw_chain = None
    intent_chain = None
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
        """非同期で実行される初期化処理"""
        try:
            print("--- Chatbot初期化開始 ---")
            
            # 1. 環境変数のチェック
            SUPABASE_URL = os.environ.get("SUPABASE_URL")
            SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
            OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")

            missing_vars = [v for v in ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "OPENAI_API_KEY"] if not os.environ.get(v)]
            if missing_vars:
                raise ValueError(f"環境変数が未設定です: {', '.join(missing_vars)}")
            print("環境変数チェックOK")

            # 2. LangChain & Supabase 初期化
            self.llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.1, openai_api_key=OPENAI_API_KEY)
            self.emb = OpenAIEmbeddings(model="text-embedding-3-small", openai_api_key=OPENAI_API_KEY)
            supabase_client: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
            print("クライアント初期化OK")

            self.vector_store = SupabaseVectorStore(
                client=supabase_client, embedding=self.emb, table_name="doc_embeddings", query_name="match_docs"
            )
            print("VectorStore初期化OK")
            
            # 3. 各種Chainの初期化
            kw_prompt = PromptTemplate.from_template("ユーザーの質問から商品名や重要語を3つ以内で抽出してください: {question}")
            self.kw_chain = LLMChain(llm=self.llm, prompt=kw_prompt)

            intent_prompt = PromptTemplate.from_template("質問を次のカテゴリから1つ選んで出力: 製品, FAQ, 技術情報, その他\n質問: {question}")
            self.intent_chain = LLMChain(llm=self.llm, prompt=intent_prompt)

            self.rag_qa = RetrievalQA.from_chain_type(
                llm=self.llm, chain_type="stuff", retriever=self.vector_store.as_retriever(search_kwargs={"k": 5})
            )
            print("--- Chatbot初期化正常完了 ---")

        except Exception as e:
            self.init_error = f"初期化エラー: {e}"
            print(f"!!! {self.init_error} !!!")

def create_enhanced_query(chatbot_instance, original_query: str) -> str:
    try:
        keywords = chatbot_instance.kw_chain.invoke({"question": original_query})["text"]
        intent = chatbot_instance.intent_chain.invoke({"question": original_query})["text"]
        return f"{original_query}\n\n[補足情報]\n重要キーワード: {keywords}\n推論された意図: {intent}"
    except Exception as e:
        print(f"クエリ強化エラー: {e}")
        return original_query

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
        
        enhanced_query = create_enhanced_query(chatbot, user_query)
        result = chatbot.rag_qa.invoke({"query": enhanced_query})
        
        return JSONResponse(content={"reply": result.get("result", "回答を生成できませんでした。")})
    except Exception as e:
        print(f"API処理エラー: {e}")
        return JSONResponse(status_code=500, content={"error": "内部サーバーエラーが発生しました。"}) 