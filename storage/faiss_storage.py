import os
from typing import List, Any
from config import dashscope_embedding, FAISS_PATH
from langchain_community.vectorstores import FAISS
from storage.base_storage import VectorStorage


class FaissStorage(VectorStorage):
    """FAISS向量库存储实现"""
    
    def __init__(self):
        super().__init__()
        # 缓存向量库实例
        self._vector_store = None
    
    def _load_vector_store(self) -> FAISS | None:
        """加载向量库，如果已缓存则直接返回"""
        if self._vector_store is not None:
            return self._vector_store
        
        # 加载向量库，检查文件是否存在
        if os.path.exists(FAISS_PATH):
            # 从磁盘加载
            self._vector_store = FAISS.load_local(FAISS_PATH, dashscope_embedding)
        else:
            # 文件不存在，返回None
            self._vector_store = None
        
        return self._vector_store
    
    def add_chunks(self, file_type: str, method: str, source: str, **kv) -> FAISS:
        """添加分块到FAISS向量库
        
        return FAISS向量库实例
        """
        # 解析文档
        chunks = self._parse_document(file_type, method, source, **kv)
        
        # 加载或创建向量库
        self._vector_store = self._load_vector_store()
        
        if self._vector_store is None:
            # 第一次创建向量库
            self._vector_store = FAISS.from_texts(chunks, dashscope_embedding)
        else:
            # 追加到已有向量库
            self._vector_store.add_texts(chunks)
        
        # 保存到磁盘
        if self._vector_store is not None:
            self._vector_store.save_local(FAISS_PATH)
        else:
            raise RuntimeError("向量库创建失败")
        
        return self._vector_store
    
    def search(self, query: str, k: int = 3) -> List[Any]:
        """搜索相似内容
        
        return 搜索结果列表
        """
        # 加载向量库
        vector_store = self._load_vector_store()
        
        if vector_store is None:
            return []
        
        # 执行搜索
        return vector_store.similarity_search(query, k=k)
