"""
统一业务异常类
所有业务异常都使用这个类，通过错误码区分不同类型的错误
"""

from email import message
from typing import Optional, Any, Self
from ..constant import Constant


class BusinessException(Exception):
    """统一业务异常类"""

    def __init__(
        self,
        code: int = Constant.ResultCode.ERROR,
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

    @classmethod
    def not_found(cls, detail: Optional[str] = None):
        """资源不存在异常"""
        return cls(
            code=Constant.ResultCode.NOT_FOUND,
            message="资源不存在",
            detail=detail or "请求的资源不存在"
        )

    @classmethod
    def validation_error(cls, detail: Optional[str] = None):
        """参数验证异常"""
        return cls(
            code=Constant.ResultCode.BAD_REQUEST,
            message="参数验证失败",
            detail=detail or "请求参数不符合要求"
        )

    @classmethod
    def search_failed(cls, detail: Optional[str] = None):
        """搜索异常"""
        return cls(
            code=Constant.ResultCode.SEARCH_FAILED,
            message="搜索失败",
            detail=detail or "无法从知识库中检索到相关内容"
        )

    @classmethod
    def llm_failed(cls, detail: Optional[str] = None):
        """LLM 调用异常"""
        return cls(
            code=Constant.ResultCode.LLM_FAILED,
            message="LLM调用失败",
            detail=detail or "大模型服务调用异常"
        )

    @classmethod
    def document_parse_failed(cls, detail: Optional[str] = None):
        """文档解析异常"""
        return cls(
            code=Constant.ResultCode.DOCUMENT_PARSE_FAILED,
            message="文档解析失败",
            detail=detail or "无法解析上传的文档"
        )

    @classmethod
    def file_save_failed(cls, detail: Optional[str] = None):
        """文件保存异常"""
        return cls(
            code=Constant.ResultCode.FILE_SAVE_FAILED,
            message="文件保存失败",
            detail=detail or "无法保存上传的文件"
        )

    @classmethod
    def database_error(cls, detail: Optional[str] = None):
        """数据库操作异常"""
        return cls(
            code=Constant.ResultCode.DATABASE_ERROR,
            message="数据库操作失败",
            detail=detail or "数据库操作出现错误"
        )
    
    @classmethod
    def document_parse_error(cls,detail : Optional[str] = None) -> Self:
        '''文档解析失败'''
        return cls(
            code = Constant.ResultCode.DOCUMENT_PARSE_FAILED,
            message = "文档解析失败",
            detail = detail or "文档中方法不支持"
        )
    
    @classmethod
    def method_not_supported(cls,detail : Optional[str] = None) -> Self:
        '''方法不支持'''
        return cls(
            code = Constant.ResultCode.BAD_REQUEST,
            message = "方法不支持",
            detail = detail or "文档中方法不支持"
        )

    @classmethod
    def file_type_not_supported(cls,detail : Optional[str] = None) -> Self:
        '''文件类型不支持'''
        return cls(
            code = Constant.ResultCode.BAD_REQUEST,
            message = "文件类型不支持",
            detail = detail or "文件类型不支持"
        )