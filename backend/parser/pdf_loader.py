


from typing import Dict, override
from PyPDF2 import PdfReader
from backend.parser.splitter.base_splitter import  TextSplitter
from backend.parser.base_loader import BaseLoader
from backend.parser.splitter.character_splitter import CharacterSplitter
from backend.parser.splitter.semantic_splitter import SemanticSplitter
from backend.parser.splitter.token_spliter import TokenSplitter


class PDFLoader(BaseLoader):
    
    def __init__(self):
        super().__init__()
    
    
    @override
    def _register_splitter(self):
        self._splitter : Dict[str,TextSplitter] = {
            "character":CharacterSplitter(chunk_size=512,chunk_overlap=20),
            "semantic": SemanticSplitter(embeddings=None),
            "token": TokenSplitter(chunk_size=512,chunk_overlap=20)
        }
    

    @override
    def load(self, file_path: str) -> str:
        '''pdf的方式来实现文件解析'''
        
        # 读取PDF文件
        with open(file_path,"rb") as f:
            reader = PdfReader(f)
            text = ""
            for page in reader.pages:
                text += page.extract_text()
            return text
        
        
