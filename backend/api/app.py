"""
RAG API 主应用文件
FastAPI 应用入口
"""

from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI

from .dependencies import shutdown_event, startup_event
from .routers import query, documents

# 生命周期管理
@asynccontextmanager
async def lifespan(app : FastAPI):
    # ========= 启动时执行代码 =========
    print("应用启动，初始化资源")
    # 启动全局依赖
    await startup_event()
    # yield之后是关闭
    yield
    print("应用关闭，释放资源")
    await shutdown_event()


# 创建应用
app = FastAPI(
    title="RAG问答系统",
    description="基于检索增强生成的智能问答系统",
    version="1.0.0",
    lifespan = lifespan # 传入生命周期管理
)

# 配置中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# 注册路由
app.include_router(query.router, prefix="/api")
app.include_router(documents.router, prefix="/api")

# 健康查询
@app.get("/health")
async def health():
    return {
        "status":"ok",
        "message":"RAG 问答系统正常运行"
    }

# 根路径——欢迎页面
@app.get("/")
async def root():
    return {
        "message":"欢迎使用RAG问答系统"
    }