# 语义理解分词方式

from typing import List, override

from backend.knowledge_base.parser.splitter.base_splitter import ParamInfo, TextSplitter
from langchain_experimental.text_splitter import SemanticChunker


class SemanticSplitter(TextSplitter):

    def __init__(self,embeddings) -> None:
        self.embeddings = embeddings

    @override
    def get_name(self) -> str :
        return "semantic"

    @override
    def get_label(self) ->  str:
        return "基于语义理解进行分割"

    @override
    def get_params(self) -> List[ParamInfo] :
        return []  # 语义分割无需额外参数

    @override
    def split(self, text, **kwargs) -> List[str]:
        '''语义解析的切片实现方法'''
        # 定义语义切割分词器
        splitter = SemanticChunker(
            embeddings= self.embeddings,
            breakpoint_threshold_amount=85,
            breakpoint_threshold_type="percentile"
        )

        return splitter.split_text(text)
