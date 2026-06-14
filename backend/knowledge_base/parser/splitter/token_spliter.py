# 按照token切分

from typing import List, override

from langchain_text_splitters import TokenTextSplitter
from .base_splitter import TextSplitter,ParamInfo

class TokenSplitter(TextSplitter):

    def __init__(self,chunk_size,chunk_overlap) -> None:
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

    @override
    def get_name(self) -> str:
        return "token"

    @override
    def get_label(self) -> str:
        return "按照token切分"

    @override
    def get_params(self) -> List[ParamInfo] :
        return [
            ParamInfo(name = "chunk_size",label = "切片大小",type = "number", default = "512", required = True),
            ParamInfo(name = "chunk_overlap",label = "切片重叠大小",type = "number", default= "20",required = True)
        ]

    @override
    def split(self, text, **kwargs) -> List[str]:
        # 使用传入的参数覆盖默认值（如果提供）
        chunk_size = kwargs.get('chunk_size', self.chunk_size)
        chunk_overlap = kwargs.get('chunk_overlap', self.chunk_overlap)
        
        token_splitter = TokenTextSplitter(
            chunk_size= chunk_size,
            chunk_overlap = chunk_overlap
        )

        return token_splitter.split_text(text)