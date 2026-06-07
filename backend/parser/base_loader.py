

from abc import abstractmethod,ABC
from typing import Dict, List
from backend.common.exceptions.business_exception import BusinessException
from backend.parser.splitter.base_splitter import MethodInfo, TextSplitter


class BaseLoader(ABC):
    def __init__(self):
        # 初始化 splitter
        self._splitter: Dict[str,TextSplitter] = {}
        self._register_splitter()


    @abstractmethod
    def _register_splitter(self):
        '''子类必须实现：注册自己支持的策略'''
        pass

    @abstractmethod
    def load(self,file_path: str) -> str :
        '''子类必须实现：获取文件的内容'''
        pass

    
    def parse(self,method:str,source: str,**kwargs):
        '''统一的解析方法，单纯对文档解析的方法'''
        # 加载文本
        text = self.load(file_path=source)
        # 检查文本是否支持
        if method not in self._splitter:
            raise BusinessException.method_not_supported("解析方法不支持")


        # 取出策略并执行
        splitter = self._splitter[method]
        return splitter.split(text,**kwargs)

    def get_supported_methods(self) -> List[MethodInfo]:
        '''获取该 Loader支持的所有方法，比如这里支持pdf、markdown、text文件格式'''
        result = []
        for s  in self._splitter.values():
            info = MethodInfo(
                name = s.get_name(),
                label = s.get_label(),
                params = s.get_params()
            )
            result.append(info)
        return result