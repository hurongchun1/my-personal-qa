"""
RAG 模块异常类
涵盖搜索、LLM调用、文档解析等场景
"""

from typing import Optional, Any


class RAGException(Exception):
    """RAG 系统基础异常类 - 所有业务异常的基类"""

    def __init__(
        self,
        code: int = 500,
        message: str = "服务器内部错误",
        detail: Optional[Any] = None
    ):
        self.code = code
        self.message = message
        self.detail = detail
        super().__init__(self.message)

    def to_dict(self):
        """转为字典格式，方便返回给前端"""
        return {
            "code": self.code,
            "msg": self.message,
            "data": self.detail
        }


class SearchException(RAGException):
    """搜索异常 - 向量检索失败"""

    def __init__(self, detail: Optional[str] = None):
        super().__init__(
            code=1001,
            message="搜索失败",
            detail=detail or "无法从知识库中检索到相关内容"
        )


class LLMException(RAGException):
    """LLM 调用异常 - 大模型服务异常"""

    def __init__(self, detail: Optional[str] = None):
        super().__init__(
            code=1002,
            message="LLM调用失败",
            detail=detail or "大模型服务调用异常"
        )


class DocumentParseException(RAGException):
    """文档解析异常 - 文件格式不支持或内容损坏"""

    def __init__(self, detail: Optional[str] = None):
        super().__init__(
            code=1003,
            message="文档解析失败",
            detail=detail or "无法解析上传的文档"
        )


class ValidationException(RAGException):
    """参数验证异常 - 请求参数不合法"""

    def __init__(self, detail: Optional[str] = None):
        super().__init__(
            code=400,
            message="参数验证失败",
            detail=detail or "请求参数不符合要求"
        )


class NotFoundException(RAGException):
    """资源不存在异常"""

    def __init__(self, detail: Optional[str] = None):
        super().__init__(
            code=404,
            message="资源不存在",
            detail=detail or "请求的资源不存在"
        )
