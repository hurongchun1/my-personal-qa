# 策略接口

# 方法里的参数信息
from abc import abstractmethod
import re
from typing import List


# 参数元信息
class ParamInfo:
    '''
    参数的说明书，告诉前端这个参数怎么填
    '''
    def __init__(self,name,label,type,default,required) -> None:
        # 参数名称
        self.name : str = name
        # 参数标签名
        self.label : str = label
        # 参数类型
        self.type : str = type
        # 参数默认值
        self.default : str = default
        # 参数是否必填
        self.required : bool = required

# 方法元信息
class MethodInfo:
    '''
    解析方法的说明书，告诉前端这个方法怎么用，需要哪些参数
    '''
    def __init__(self,name,label,params) -> None:
        # 方法名称
        self.name : str = name
        # 方法标签名 
        self.label : str = label
        # 方法参数
        self.params : List[ParamInfo] = params
    

# 分词元信息
class TextSplitter:
    '''
    实际执行分割的工具，不是说明书，主要用来干活的，完整流程
    前端请求："用字符分割解析这个 PDF"
    ↓
后端调用：loader.parse(method="character", source="xxx.pdf", chunk_size=1024)
    ↓
BaseLoader.parse()：
    1. text = self.load(source)  # 加载 PDF 文本
    2. splitter = self._splitter["character"]  # 取出 CharacterSplitter 对象
    3. return splitter.split(text)  # 调用 split() 方法执行分割
    ↓
CharacterSplitter.split(text)：
    # 用 chunk_size=1024 分割文本
    return ["第一块", "第二块", ...]
    ↓
返回给前端：["第一块", "第二块", ...]
    '''
    @abstractmethod
    def split(self,text) -> List[str]:
        '''执行分割后的切片内容'''
        pass

    @abstractmethod
    def get_name(self)-> str:
        '''对应实现类中名称'''
        pass

    @abstractmethod
    def get_label(self)-> str:
        '''对应实现类中名称描述'''
        pass

    @abstractmethod
    def get_params(self) -> List[ParamInfo]:
        '''对应实现类中的实例化需要的参数'''
        pass
    
    