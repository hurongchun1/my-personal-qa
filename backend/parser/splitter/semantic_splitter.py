# 语义理解分词方式

from re import S
from typing import List, override

from backend.parser.splitter.base_splitter import ParamInfo, TextSplitter
from langchain_experimental.text_splitter import SemanticChunker


class SemanticSplitter(TextSplitter):

    def __init__(self,embeddings) -> None:
        self.embeddings = embeddings

    @override
    def get_name(self) -> str :
        return "Semantic"

    @override
    def get_label(self) ->  str:
        return "基于语义理解进行分割"

    @override
    def get_params(self) -> List[ParamInfo] :
        return [
            ParamInfo(name="embeddins",label="词向量模型",type="embeddings",default="",required = True)
        ]

    @override
    def split(self, text) -> List[str]:
        '''语义解析的切片实现方法'''
        # 定义语义切割分词器
        splitter = SemanticChunker(
            embeddings= self.embeddings,
            breakpoint_threshold_amount=85,
            breakpoint_threshold_type="percentile"
        )

        return splitter.split_text(text)
