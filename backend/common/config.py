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

# ===== 基础目录（backend根目录） ======
BASE_DIR = os.path.dirname(os.path.dirname(__file__))

# ===== 存储路径 ======
FAISS_PATH = os.path.join(BASE_DIR, "faiss")

# ===== Elasticsearch配置 ======
ES_HOST = os.getenv("ES_HOST", "http://localhost:9200")
ES_INDEX_NAME = os.getenv("ES_INDEX_NAME", "my-personal-qa")

# ===== 文档路径 ======
DOC_PATH = os.path.join(BASE_DIR, 'doc')
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")

# ===== 存储类型 ======
STORAGE_TYPE = "faiss"

# ===== 数据库位置 =====
DATABASE_DIR = os.path.join(BASE_DIR, "data")
DATABASE_PATH = os.path.join(DATABASE_DIR, "database.db")
SQL_DIR = os.path.join(BASE_DIR, "knowledge_base", "sql")
SQL_PATH = os.path.join(SQL_DIR, "ddl.sql")