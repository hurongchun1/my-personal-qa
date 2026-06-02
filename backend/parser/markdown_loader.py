
from cgitb import text
from typing import overload
from typing_extensions import override

from langchain_experimental.text_splitter import SemanticChunker
from langchain_text_splitters import RecursiveCharacterTextSplitter, TokenTextSplitter,MarkdownTextSplitter
from .base_loader import BaseLoader
from langchain_community.document_loaders import UnstructuredMarkdownLoader


class MarkdownLoader(BaseLoader):

    def __init__(self):
        super().__init__()
    
    # 加载markdown文件,得到纯文本
    @override
    def load(self,file_path):
        loader = UnstructuredMarkdownLoader(file_path)
        docs = loader.load()
        return docs[0].page_content

        
    
    # 基础按照字符解析文件
    @override
    def parse(self,file_path,chunk_size,chunk_overlap):
        text = self.load(file_path)

        # 生成一个分词器
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size = chunk_size,
            chunk_overlap = chunk_overlap,
            separators = ["\n\n", "\n", "。", "！", "？", ".", " ", ""]
        )
        chunks = text_splitter.split_text(text)
        print(f"文本被分割{len(chunks)}个块")
        return chunks

    # 基础按照token解析方式
    def token_text_parser(self,file_path,chunk_size,chunk_overlap):
        text = self.load(file_path)

        text_splitter = TokenTextSplitter(
            chunk_size = chunk_size,
            chunk_overlap = chunk_overlap
        )

        chunks = text_splitter.split_text(text)
        return chunks

    # 按照语义理解的解析方式
    def Semantic_text_parser(self,file_path,embedding):
        text = self.load(file_path)

        text_splitter = SemanticChunker(
            embeddings = embedding,
            breakpoint_threshold_type = "percentile",
            breakpoint_threshold_amount = 85
        )
        chunks = text_splitter.split_text(text)
        return chunks

    # 按照markdown格式进行解析
    def markdown_text_parser(self,file_path):
        text = self.load(file_path)
        text_splitter = MarkdownTextSplitter()
        chunks = text_splitter.split_text(text)
        return chunks
        


