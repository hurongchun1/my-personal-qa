"""
异常类统一导出
使用方式：from backend.common.exceptions import RAGException, NotFoundException
"""

from .rag import (
    RAGException,
    SearchException,
    LLMException,
    DocumentParseException,
    ValidationException,
    NotFoundException
)

__all__ = [
    "RAGException",
    "SearchException",
    "LLMException",
    "DocumentParseException",
    "ValidationException",
    "NotFoundException"
]
