

from common import constant
from common.constant import Constant


class ResultInfo:
    """统一响应结果类"""
    
    def __init__(self, code, msg=None, data=None):
        """
        初始化响应结果
        
        Args:
            code: 状态码
            msg: 响应消息
            data: 响应数据
        """
        self.code = code
        self.msg = msg
        self.data = data
    
    @classmethod
    def success(cls, data=None, msg=None):
        """
        创建成功响应
        
        Args:
            data: 响应数据
            msg: 成功消息，默认使用常量中的 SUCCESS 消息
            
        Returns:
            ResultInfo: 成功响应实例
        """
        return cls(
            code=Constant.ResultCode.SUCCESS,
            msg=msg or "操作成功",
            data=data
        )
    
    @classmethod
    def error(cls, msg=None, data=None):
        """
        创建错误响应
        
        Args:
            msg: 错误消息，默认使用常量中的 RESULT_ERROR_MSG
            data: 错误详情数据
            
        Returns:
            ResultInfo: 错误响应实例
        """
        return cls(
            code=Constant.ResultCode.ERROR,
            msg=msg or Constant.ResultMsg.RESULT_ERROR_MSG,
            data=data
        )
    
    @classmethod
    def fail(cls, msg=None, data=None, code=None):
        """
        创建失败响应（业务逻辑失败）
        
        Args:
            msg: 失败消息
            data: 失败详情数据
            code: 自定义状态码，默认使用 BAD_REQUEST
            
        Returns:
            ResultInfo: 失败响应实例
        """
        return cls(
            code=code or Constant.ResultCode.BAD_REQUEST,
            msg=msg or "请求失败",
            data=data
        )
    
    def to_dict(self):
        """转换为字典格式"""
        return {
            "code": self.code,
            "msg": self.msg,
            "data": self.data
        }
