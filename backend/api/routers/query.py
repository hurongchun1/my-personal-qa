"""
问答路由模块
处理问答相关的API端点
"""
from fastapi import Depends, HTTPException
from fastapi.routing import APIRouter
from ...common.result_info import ResultInfo

from ..dependencies import get_rag_engine
from ..models import RewrittenChatRequest, SimpleChatRequest


# 创建路由
router = APIRouter(prefix="/query",tags=["问答"])


@router.post("/simple_chat")
async def simple_chat(
    request: SimpleChatRequest,
    rag_engine = Depends(get_rag_engine)
):
    """
    简单聊天接口

    直接使用原始问题进行检索和回答，不进行问题改写
    """
    try:
        answer = rag_engine.simple_ask(request.query,request.k)

        if not answer :
            
            raise HTTPException(status_code=404, detail="未找到相关答案")
        
        return ResultInfo.success(answer).to_dict()

    except Exception :
        raise HTTPException(status_code=500,detail="服务器内部错误")

@router.post("/rewritten_chat")
async def rewritten_chat(
    request: RewrittenChatRequest,
    rag_engine = Depends(get_rag_engine)
):
    '''
    重写问题接口

    先进行问题重写，再继续检索和回答
    '''
    try:
        answer = rag_engine.rewritten_query_ask(request.query,request.conversation_history,request.context_info,request.k)

        if not answer :
            raise HTTPException(status_code=404,detail="未找到相关答案")
        
        return ResultInfo.success(answer).to_dict()
    
    except Exception :
        raise HTTPException(status_code=500,detail="服务器内部错误")

