
from typing import overload, override
from langchain_text_splitters.character import RecursiveCharacterTextSplitter
from typing_extensions import override
from langchain_experimental.text_splitter import SemanticChunker

from backend.common.config import dashscope_embedding
from backend.knowledge_base.parser.splitter.character_splitter import CharacterSplitter
from backend.knowledge_base.parser.splitter.semantic_splitter import SemanticSplitter
from backend.knowledge_base.parser.splitter.token_spliter import TokenSplitter
from .base_loader import BaseLoader
import requests
from bs4 import BeautifulSoup
from langchain_text_splitters.html import HTMLHeaderTextSplitter

# 网页搜索加载成知识库
class HtmlLoader(BaseLoader):
    
    def __init__(self):
        super().__init__()

    @override
    def _register_splitter(self):
        self._splitter = {
            "character": CharacterSplitter(chunk_size=512,chunk_overlap=20),
            "semantic": SemanticSplitter(embeddings=dashscope_embedding),
            "token": TokenSplitter(chunk_size=512,chunk_overlap=20)
        }

    @override
    def load(self,file_path):
        '''加载网页，提取文本（不保留HTML结构）'''
        response = requests.get(file_path)
        soup = BeautifulSoup(response.text,"lxml")

        # 清洗噪音
        for tag in soup.find_all(['nav','footer','script','style']):
            tag.decompose()

        # 提取正文
        artcile = soup.find("article") or soup
        text = artcile.get_text("\n",True)
        return text

    