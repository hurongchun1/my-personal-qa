"""
问答路由模块
处理问答相关的API端点
"""

from fastapi import APIRouter, HTTPException, Depends
from ..models import QueryRequest, QueryResponse, ClassificationResponse
from ..dependencies import get_rag_engine
from rag_engine import RAGEngine

router = APIRouter(prefix="/api", tags=["问答"])


@router.post("/ask", response_model=QueryResponse)
async def simple_ask(
    request: QueryRequest,
    rag_engine: RAGEngine = Depends(get_rag_engine)
):
    """
    简单问答接口
    
    直接使用原始问题进行检索和问答，不进行问题重写。
    """
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


@router.post("/rewrite-ask", response_model=QueryResponse)
async def rewritten_query_ask(
    request: QueryRequest,
    rag_engine: RAGEngine = Depends(get_rag_engine)
):
    """
    重写问答接口
    
    先对问题进行分类和重写，然后使用重写后的问题进行检索和问答。
    支持5种问题类型：上下文依赖型、对比型、模糊指代型、多意图型、反问型。
    """
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


@router.post("/classify", response_model=ClassificationResponse)
async def classify_query(
    request: QueryRequest,
    rag_engine: RAGEngine = Depends(get_rag_engine)
):
    """
    问题分类接口
    
    对问题进行分类，返回问题类型和重写后的问题。
    不进行实际的检索和问答。
    """
    try:
        # 调用问题分类
        result = rag_engine._query_rewriter.auto_rewrite_query(
            query=request.query,
            conversation_history=request.conversation_history or "",
            context_info=request.context_info or ""
        )
        
        return ClassificationResponse(
            original_query=request.query,
            classification=result
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"问题分类失败: {str(e)}")