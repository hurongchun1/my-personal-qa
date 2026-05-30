import os
from langchain_community.embeddings import DashScopeEmbeddings
from openai import OpenAI

# ===== API配置 ======

DASHSCOPE_API_KEY = os.getenv("DASHSCOPE_API_KEY")
BASE_URL = "https://dashscope.aliyuncs.com/compatible-mode/v1"



if not DASHSCOPE_API_KEY:
    raise ValueError("DASHSCOPE_API_KEY is not set")

# ===== 模型配置 ======

EMBEDDING_MODEL = "text-embedding-v1"
LLM_MODEL = "qwen-turbo"

# ===== 模型初始化 ======
dashscope_embedding = DashScopeEmbeddings(
    dashscope_api_key  = DASHSCOPE_API_KEY,
    model = "text-embedding-v1",
)

# ===== 客户端初始化 =====
CLIENT = OpenAI(
    api_key=DASHSCOPE_API_KEY,
    base_url=BASE_URL
)

# ===== 存储路径 ======
FAISS_PATH = os.path.join(os.path.dirname(__file__),"faiss")

# ===== Elasticsearch配置 ======
ES_HOST = os.getenv("ES_HOST", "http://localhost:9200")
ES_INDEX_NAME = os.getenv("ES_INDEX_NAME", "my-personal-qa")

# ===== 文档路径 ======
DOC_PATH = os.path.join(os.path.dirname(__file__),'doc')

# ===== 存储类型 ======
STORAGE_TYPE = "faiss"