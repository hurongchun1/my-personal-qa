"""
异常类统一导出
使用方式：from backend.common.exceptions import BusinessException
"""

from .business_exception import BusinessException

__all__ = [
    "BusinessException"
]
