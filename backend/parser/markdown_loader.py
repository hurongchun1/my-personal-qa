



from typing import override
from unittest import loader
from backend.parser.base_loader import BaseLoader
from backend.parser.splitter.character_splitter import CharacterSplitter
from backend.parser.splitter.semantic_splitter import SemanticSplitter
from backend.parser.splitter.token_spliter import TokenSplitter
from langchain_community.document_loaders import UnstructuredMarkdownLoader

class MarkdownLoader(BaseLoader):

    def __init__(self):
        super().__init__()
    
    
    @override
    def _register_splitter(self):
        self._splitter = {
            "character": CharacterSplitter(chunk_size=512,chunk_overlap=20),
            "semantic": SemanticSplitter(embeddings=None),
            "token": TokenSplitter(chunk_size=512,chunk_overlap=20)
        }
    
    @override
    def load(self,file_path :str) -> str:
        '''markdown解析文档方式'''
        
        loader = UnstructuredMarkdownLoader(file_path)
        docs = loader.load()
        return docs[0].page_content

