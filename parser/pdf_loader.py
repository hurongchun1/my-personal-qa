
from typing_extensions import override
from PyPDF2 import PdfReader
from parser.base_loader import BaseLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter, TokenTextSplitter
from langchain_experimental.text_splitter import SemanticChunker


class PDFLoader(BaseLoader):
    
    def __init__(self):
        super().__init__()
    
    # 加载文件,得到纯文本
    @override
    def load(self,file_path):
        with open(file_path,"rb") as f:
            reader = PdfReader(f)
            text = ""
            for page in reader.pages:
                text += page.extract_text()
        return text

    # 基础分割器，按照字符数进行分割
    @override
    def parse(self,file_path,chunk_size,chunk_overlap) -> list[str]:
        '''读取文档，按照字符数进行分割，解析后返回向量集'''
        
        text =self.load(file_path)
        
        # 这里进行基于 字符分割的文本解析方式
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size, 
            chunk_overlap=chunk_overlap,
            separators=["\n\n", "\n", "。", "！", "？", ".", " ", ""] 
        )
        chunks: list[str] = text_splitter.split_text(text)
        print(f"文本被分割{len(chunks)}个块")
        return chunks
    
    # 基于token分割器
    def token_text_parser(self,file_path,chunk_size,chunk_overlap):
        '''读取文档，按照token数量进行分割，解析文档，返回向量集'''

        text =self.load(file_path)
        
        # 这里进行基于 token分割的文本解析方式
        text_splitter = TokenTextSplitter(
            chunk_size = chunk_size,
            chunk_overlap = chunk_overlap
        )

        chunks: list[str] = text_splitter.split_text(text)
        print(f"文本被分割{len(chunks)}个块")
        return chunks

    # 按照语义理解进行分割
    def semantic_text_parser(self,file_path,embedding):
        '''读取文档，按照语义理解进行分割，解析文档，返回向量集'''
        text = self.load(file_path)

        # 这里进行基于语义理解的文本解析方式
        semantic_splitter =  SemanticChunker(
            embeddings =  embedding, # 嵌入模型
            breakpoint_threshold_type= "percentile", # 基于百分位数
            breakpoint_threshold_amount=85 #阈值
        )

        chunks  =  semantic_splitter.split_text(text)
        print(f"文本被分割{len(chunks)}个块")
        return chunks
        