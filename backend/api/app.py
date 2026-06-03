"""
RAG API 主应用文件
FastAPI 应用入口
"""

import traceback
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from ..common.exceptions import RAGException
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

# 全局异常处理器 - 开发阶段显示详细错误信息
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """捕获所有未处理的异常，返回详细错误信息"""
    error_detail = traceback.format_exc()
    print(f"未捕获的异常: {error_detail}")
    return JSONResponse(
        status_code=500,
        content={
            "code": 500,
            "msg": str(exc),
            "detail": error_detail
        }
    )

# RAG 业务异常处理器
@app.exception_handler(RAGException)
async def rag_exception_handler(request: Request, exc: RAGException):
    """处理 RAG 业务异常"""
    return JSONResponse(
        status_code=exc.code,
        content=exc.to_dict()
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