# 按照token切分

from calendar import c
from typing import List, override

from langchain_text_splitters import TokenTextSplitter
from .base_splitter import TextSplitter,ParamInfo

class TokenSplitter(TextSplitter):

    def __init__(self,chunk_size,chunk_overlap) -> None:
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

    @override
    def get_name(self) -> str:
        return "Token"

    @override
    def get_label(self) -> str:
        return "按照token切分"

    @override
    def get_params(self) -> List[ParamInfo] :
        return [
            ParamInfo(name = "chunk_size",label = "切片大小",type = "int", default = "512", required = True),
            ParamInfo(name = "chunk_overlap",label = "切片重叠大小",type = "int", default= "20",required = True)
        ]

    @override
    def split(self, text) -> List[str]:
        
        token_splitter = TokenTextSplitter(
            chunk_size= self.chunk_size,
            chunk_overlap = self.chunk_overlap
        )

        return token_splitter.split_text(text)