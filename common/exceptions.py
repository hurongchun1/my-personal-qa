"""
自定义异常类模块
提供统一的异常处理机制
"""

from typing import Optional, Any
from common.constant import Constant


class RAGException(Exception):
    """RAG系统基础异常类"""
    
    def __init__(
        self, 
        code: int = None, 
        message: str = None, 
        detail: Optional[Any] = None
    ):
        """
        初始化异常
        
        Args:
            code: 错误状态码，默认使用 Constant.ResultCode.ERROR
            message: 错误消息
            detail: 错误详情
        """
        self.code = code or Constant.ResultCode.ERROR
        self.message = message or "服务器内部错误"
        self.detail = detail
        super().__init__(self.message)
    
    def to_result_info(self):
        """转换为 ResultInfo 响应对象"""
        from common.result_info import ResultInfo
        return ResultInfo(
            code=self.code,
            message=self.message,
            data=self.detail
        )


class SearchException(RAGException):
    """搜索异常"""
    
    def __init__(self, detail: Optional[str] = None):
        super().__init__(
            code=1001,
            message="搜索失败",
            detail=detail or "无法从知识库中检索到相关内容"
        )


class LLMException(RAGException):
    """LLM调用异常"""
    
    def __init__(self, detail: Optional[str] = None):
        super().__init__(
            code=1002,
            message="LLM调用失败",
            detail=detail or "大模型服务调用异常"
        )


class DocumentParseException(RAGException):
    """文档解析异常"""
    
    def __init__(self, detail: Optional[str] = None):
        super().__init__(
            code=1003,
            message="文档解析失败",
            detail=detail or "无法解析上传的文档"
        )


class ValidationException(RAGException):
    """参数验证异常"""
    
    def __init__(self, detail: Optional[str] = None):
        super().__init__(
            code=Constant.ResultCode.BAD_REQUEST,
            message="参数验证失败",
            detail=detail or "请求参数不符合要求"
        )


class AuthenticationException(RAGException):
    """认证异常"""
    
    def __init__(self, detail: Optional[str] = None):
        super().__init__(
            code=401,
            message="认证失败",
            detail=detail or "用户未登录或登录已过期"
        )


class AuthorizationException(RAGException):
    """授权异常"""
    
    def __init__(self, detail: Optional[str] = None):
        super().__init__(
            code=403,
            message="权限不足",
            detail=detail or "您没有权限执行此操作"
        )


class NotFoundException(RAGException):
    """资源不存在异常"""
    
    def __init__(self, detail: Optional[str] = None):
        super().__init__(
            code=404,
            message="资源不存在",
            detail=detail or "请求的资源不存在"
        )
