import os
from typing import List, Any
from config import dashscope_embedding, ES_HOST, ES_INDEX_NAME
from langchain_community.vectorstores import ElasticsearchStore
from storage.base_storage import VectorStorage


class ElasticsearchStorage(VectorStorage):
    """Elasticsearch向量库存储实现"""
    
    def __init__(self):
        super().__init__()
        # 缓存向量库实例
        self._vector_store = None
    
    def _get_vector_store(self) -> ElasticsearchStore | None:
        """获取Elasticsearch向量库实例"""
        if self._vector_store is not None:
            return self._vector_store
        
        # 创建Elasticsearch向量库实例
        try:
            self._vector_store = ElasticsearchStore(
                es_url=ES_HOST,
                index_name=ES_INDEX_NAME,
                embedding=dashscope_embedding
            )
            return self._vector_store
        except Exception as e:
            print(f"连接Elasticsearch失败: {e}")
            return None
    
    def add_chunks(self, file_type: str, method: str, source: str, **kv) -> ElasticsearchStore:
        """添加分块到Elasticsearch向量库
        
        return ElasticsearchStore向量库实例
        """
        # 解析文档
        chunks = self._parse_document(file_type, method, source, **kv)
        
        # 获取向量库实例
        vector_store = self._get_vector_store()
        
        if vector_store is None:
            raise RuntimeError("无法连接到Elasticsearch")
        
        # 添加文本到向量库
        vector_store.add_texts(chunks)
        
        return vector_store
    
    def search(self, query: str, k: int = 3) -> List[Any]:
        """搜索相似内容
        
        return 搜索结果列表
        """
        # 获取向量库实例
        vector_store = self._get_vector_store()
        
        if vector_store is None:
            return []
        
        # 执行搜索
        return vector_store.similarity_search(query, k=k)
