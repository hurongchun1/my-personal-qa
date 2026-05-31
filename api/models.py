"""
API 数据模型定义
使用 Pydantic 定义请求和响应模型
"""

from typing import Optional
from pydantic import BaseModel, Field


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


class ClassificationResponse(BaseModel):
    """问题分类响应"""
    original_query: str
    classification: dict