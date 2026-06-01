"""
RAG API 主应用文件
FastAPI 应用入口
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .dependencies import startup_event, shutdown_event
from .routers import query


# 生命周期管理
@asynccontextmanager
async def lifespan(app: FastAPI):
    # 启动时执行
    await startup_event()
    yield
    # 关闭时执行
    await shutdown_event()


# 创建 FastAPI 应用
app = FastAPI(
    title="RAG 问答系统 API",
    description="基于检索增强生成的智能问答系统",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# 添加 CORS 中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 在生产环境中应该限制来源
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(query.router)


# 健康检查端点
@app.get("/health", tags=["系统"])
async def health_check():
    """健康检查接口"""
    return {
        "status": "ok",
        "message": "RAG 问答系统运行正常"
    }


# 根路径
@app.get("/", tags=["系统"])
async def root():
    """根路径"""
    return {
        "message": "欢迎使用 RAG 问答系统 API",
        "docs": "/docs",
        "health": "/health"
    }
