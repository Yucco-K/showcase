import os
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
        # 1. クエリをベクトル化
        query_embedding = chatbot.emb.embed_query(query)

        # 2. Supabaseで関連ドキュメントを検索
        response = await chatbot.supabase_client.rpc(
            "match_docs",
            {
                "query_embedding": query_embedding,
                "match_threshold": 0.1,
                "match_count": 5,
            },
        ).execute()

        if response.error:
            raise Exception(f"Supabase RPCエラー: {response.error.message}")

        context_text = "\n---\n".join([doc["content"] for doc in response.data])
        
        # 3. LLMにコンテキストと質問を渡して最終的な回答を生成
        prompt_template = """
        あなたはPortfolio Showcaseの専門AIアシスタントです。
        以下のコンテキスト情報のみを元に、ユーザーの質問に日本語で回答してください。
        
        コンテキスト:
        {context}
        
        質問: {question}
        
        回答:
        """
        prompt = PromptTemplate(
            template=prompt_template, input_variables=["context", "question"]
        )
        
        response_chain = prompt | chatbot.llm
        answer = await response_chain.ainvoke({"context": context_text, "question": query})
        
        return answer.content

    except Exception as e:
        print(f"回答生成エラー: {e}")
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