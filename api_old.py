"""
RAG API 服务
提供问答接口，支持简单问答和重写问答
"""

import os
import sys
from typing import Optional, List
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
import uvicorn

# 添加项目根目录到 Python 路径
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, PROJECT_ROOT)

from rag_engine import RAGEngine

# 创建 FastAPI 应用
app = FastAPI(
    title="RAG 问答系统 API",
    description="基于检索增强生成的智能问答系统",
    version="1.0.0"
)

# 全局 RAG 引擎实例
rag_engine: Optional[RAGEngine] = None


# ===== 数据模型 =====

class QueryRequest(BaseModel):
    """查询请求模型"""
    query: str = Field(..., description="用户问题", min_length=1, max_length=1000)
    conversation_history: Optional[str] = Field(None, description="对话历史")
    context_info: Optional[str] = Field(None, description="上下文信息")
    k: int = Field(3, description="检索文档数量", ge=1, le=10)


class QueryResponse(BaseModel):
    """查询响应模型"""
    answer: str = Field(..., description="回答内容")
    query: str = Field(..., description="原始问题")
    rewritten_query: Optional[str] = Field(None, description="重写后的问题")


class HealthResponse(BaseModel):
    """健康检查响应"""
    status: str = "ok"
    message: str = "RAG 问答系统运行正常"


class ErrorResponse(BaseModel):
    """错误响应"""
    error: str
    detail: Optional[str] = None


# ===== 启动事件 =====

@app.on_event("startup")
async def startup_event():
    """应用启动时初始化 RAG 引擎"""
    global rag_engine
    try:
        rag_engine = RAGEngine()
        print("RAG 引擎初始化成功")
    except Exception as e:
        print(f"RAG 引擎初始化失败: {e}")
        raise


# ===== API 端点 =====

@app.get("/health", response_model=HealthResponse, tags=["系统"])
async def health_check():
    """健康检查接口"""
    return HealthResponse()


@app.post("/api/ask", response_model=QueryResponse, tags=["问答"])
async def simple_ask(request: QueryRequest):
    """
    简单问答接口
    
    直接使用原始问题进行检索和问答，不进行问题重写。
    """
    if rag_engine is None:
        raise HTTPException(status_code=500, detail="RAG 引擎未初始化")
    
    try:
        answer = rag_engine.simple_ask(
            query=request.query,
            k=request.k
        )
        
        if not answer:
            raise HTTPException(status_code=404, detail="未找到相关答案")
        
        return QueryResponse(
            answer=answer,
            query=request.query
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"问答失败: {str(e)}")


@app.post("/api/rewrite-ask", response_model=QueryResponse, tags=["问答"])
async def rewritten_query_ask(request: QueryRequest):
    """
    重写问答接口
    
    先对问题进行分类和重写，然后使用重写后的问题进行检索和问答。
    支持5种问题类型：上下文依赖型、对比型、模糊指代型、多意图型、反问型。
    """
    if rag_engine is None:
        raise HTTPException(status_code=500, detail="RAG 引擎未初始化")
    
    try:
        # 获取重写前的原始问题
        original_query = request.query
        
        # 调用重写问答
        answer = rag_engine.rewritten_query_ask(
            query=request.query,
            conversation_history=request.conversation_history or "",
            context_info=request.context_info or "",
            k=request.k
        )
        
        if not answer:
            raise HTTPException(status_code=404, detail="未找到相关答案")
        
        # 注意：这里无法直接获取重写后的问题，因为 rewritten_query_ask 内部处理了
        # 如果需要返回重写后的问题，需要修改 rag_engine 的接口
        return QueryResponse(
            answer=answer,
            query=original_query,
            rewritten_query=None  # 暂时为 None，需要修改 rag_engine 才能获取
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"重写问答失败: {str(e)}")


@app.post("/api/classify", tags=["问题分析"])
async def classify_query(request: QueryRequest):
    """
    问题分类接口
    
    对问题进行分类，返回问题类型和重写后的问题。
    不进行实际的检索和问答。
    """
    if rag_engine is None:
        raise HTTPException(status_code=500, detail="RAG 引擎未初始化")
    
    try:
        # 调用问题分类
        result = rag_engine._query_rewriter.auto_rewrite_query(
            query=request.query,
            conversation_history=request.conversation_history or "",
            context_info=request.context_info or ""
        )
        
        return {
            "original_query": request.query,
            "classification": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"问题分类失败: {str(e)}")


# ===== 启动入口 =====

if __name__ == "__main__":
    uvicorn.run(
        "api:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )