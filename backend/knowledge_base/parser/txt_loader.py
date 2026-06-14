
from typing import override
from backend.common.config import dashscope_embedding
from backend.knowledge_base.parser.base_loader import BaseLoader
from backend.knowledge_base.parser.splitter.character_splitter import CharacterSplitter
from backend.knowledge_base.parser.splitter.semantic_splitter import SemanticSplitter
from backend.knowledge_base.parser.splitter.token_spliter import TokenSplitter


class TxtLoader(BaseLoader):

    def __init__(self):
        super().__init__()
    
    
    @override
    def _register_splitter(self):
        self._splitter = {
            "character": CharacterSplitter(chunk_size=512, chunk_overlap=20),
            "semantic": SemanticSplitter(embeddings=dashscope_embedding),
            "token": TokenSplitter(chunk_size=512, chunk_overlap=20)
        }
    
    @override
    def load(self, file_path: str) -> str:
        '''txt文件解析方式：直接读取文本内容'''
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
