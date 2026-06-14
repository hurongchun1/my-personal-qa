# 基于字符进行分割

from typing import List, override

from langchain_text_splitters import RecursiveCharacterTextSplitter
from backend.knowledge_base.parser.splitter.base_splitter import ParamInfo, TextSplitter


class CharacterSplitter(TextSplitter):

    def __init__(self,chunk_size,chunk_overlap):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
    
    @override
    def get_name(self) -> str:
        return "character"

    @override
    def get_label(self) -> str:
        return "基于字符进行分割"

    @override
    def get_params(self) -> List[ParamInfo]:

        return [
            ParamInfo(name = "chunk_size",label = "切片大小",type = "number", default = "512", required = True),
            ParamInfo(name = "chunk_overlap",label = "切片重叠大小",type = "number", default= "20",required = True)
        ]
    
    @override
    def split(self, text, **kwargs) -> List[str]:
        '''字符切分的实现方法'''
        # 使用传入的参数覆盖默认值（如果提供）
        chunk_size = kwargs.get('chunk_size', self.chunk_size)
        chunk_overlap = kwargs.get('chunk_overlap', self.chunk_overlap)
        
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size = chunk_size,
            chunk_overlap = chunk_overlap,
            separators=["\n\n", "\n", "。", "！", "？", ".", " ", ""]
        )

        return text_splitter.split_text(text)
        