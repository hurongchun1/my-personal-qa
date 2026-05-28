
from tkinter import SEPARATOR
from typing import overload
from langchain_text_splitters.character import RecursiveCharacterTextSplitter
from typing_extensions import override
from langchain_experimental.text_splitter import SemanticChunker
from parser.base_loader import BaseLoader
import requests
from bs4 import BeautifulSoup
from langchain_text_splitters.html import HTMLHeaderTextSplitter

# 网页搜索加载成知识库
class HtmlLoader(BaseLoader):
    
    def __init__(self):
        super().__init__()

    @override
    def load(self,file_path) :
        '''加载网页，清洗噪音，返回保留结构的HTML'''
        response = requests.get(file_path)
        soup = BeautifulSoup(response.text,"lxml")
        
        # 清洗：删除噪音标签
        for tag in soup.find_all(['nav','footer','script','style']):
            tag.decompose()
        
        # 提取正文(保留标签结构)
        article = soup.find("article") or soup.find("main") or soup.find("body")
        clean_html = str(article)
        return clean_html
    
    def load_url_as_text(self,url):
        '''加载网页，提取文本（不保留HTML结构）'''
        response = requests.get(url)
        soup = BeautifulSoup(response.text,"lxml")

        # 清洗噪音
        for tag in soup.find_all(['nav','footer','script','style']):
            tag.decompose()

        # 提取正文
        artcile = soup.find("article") or soup
        text = artcile.get_text("\n",True)
        return text

    @override
    def parse(self,file_path,chunk_size,chunk_overlap):
        text = self.load_url_as_text(file_path)
        '''简单的按照字符分割方式'''
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size, 
            chunk_overlap=chunk_overlap,
            separators=["\n\n", "\n", "。", "！", "？", ".", " ", ""] 
        )

        return text_splitter.split_text(text)


    def parse_by_html_splitter(self,url,headers_to_split_on = None):
        '''
        方案1：HTML解析器分割
        
        优势：保留HTML结构，不需要Embedding，速度快
        缺点：通用性差，需要配置标签
        '''
        if headers_to_split_on is None:
            headers_to_split_on = [('h1','标题1'),('h2','标题2'),('h3','标题3')]

        # 获取干净的HTML
        clean_html = self.load(url)

        # 用 HTMLHeaderTextSplitter 分割
        splitter = HTMLHeaderTextSplitter(headers_to_split_on)
        chunks = splitter.split_text(clean_html)
        return chunks
    
    def parse_by_semantic(self,url,embedding):
        '''
        方案2：使用 SemanticChunker语义分割

        优点：简单通用，自动识别内容边界
        缺点：丢失标题结构，需要 Embedding，速度慢
        '''
        # 1. 获取文本
        text = self.load_url_as_text(url)

        # 2. 用SemanticChunker 语义分割
        splitter = SemanticChunker(
            embeddings=embedding,
            breakpoint_threshold_type="percentile",
            breakpoint_threshold_amount=85
        )

        chunks = splitter.split_text(text)
        return chunks


