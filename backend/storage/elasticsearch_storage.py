import os
from typing import List, Any, Optional, Dict
from uuid import uuid4
from ..config import dashscope_embedding, ES_HOST, ES_INDEX_NAME
from langchain_community.vectorstores import ElasticsearchStore
from .base_storage import VectorStorage


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
    
    def add_chunks(self, file_type: str, method: str, source: str, **kv) -> tuple[ElasticsearchStore, List[str]]:
        """添加分块到Elasticsearch向量库
        
        return (ElasticsearchStore向量库实例, 生成的ID列表)
        """
        # 解析文档
        chunks = self._parse_document(file_type, method, source, **kv)
        
        # 为每个chunk生成唯一ID
        chunk_ids = [str(uuid4()) for _ in range(len(chunks))]
        
        # 获取向量库实例
        vector_store = self._get_vector_store()
        
        if vector_store is None:
            raise RuntimeError("无法连接到Elasticsearch")
        
        # 添加文本到向量库
        vector_store.add_texts(chunks, ids=chunk_ids)
        
        return vector_store, chunk_ids
    
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
    
    def delete_chunks(self, ids: List[str]) -> bool:
        """删除指定ID的向量
        
        Args:
            ids: 要删除的向量ID列表
            
        Returns:
            bool: 删除是否成功
        """
        # 获取向量库实例
        vector_store = self._get_vector_store()
        
        if vector_store is None:
            return False
        
        try:
            # 执行删除操作
            vector_store.delete(ids)
            return True
        except Exception as e:
            print(f"删除向量失败: {e}")
            return False
    
    def update_chunks(self, ids: List[str], new_texts: List[str], new_metadatas: Optional[List[Dict[str, Any]]] = None) -> bool:
        """更新指定ID的向量（先删除后添加）
        
        Args:
            ids: 要更新的向量ID列表
            new_texts: 新的文本内容列表
            new_metadatas: 新的元数据列表（可选）
            
        Returns:
            bool: 更新是否成功
        """
        # 获取向量库实例
        vector_store = self._get_vector_store()
        
        if vector_store is None:
            return False
        
        try:
            # 1. 删除旧向量
            vector_store.delete(ids)
            
            # 2. 添加新向量（生成新的ID）
            new_ids = [str(uuid4()) for _ in range(len(new_texts))]
            
            if new_metadatas:
                vector_store.add_texts(new_texts, metadatas=new_metadatas, ids=new_ids)
            else:
                vector_store.add_texts(new_texts, ids=new_ids)
            
            return True
        except Exception as e:
            print(f"更新向量失败: {e}")
            return False
    
    def get_all_ids(self) -> List[str]:
        """获取所有向量的ID
        
        Returns:
            List[str]: 所有向量的ID列表
        """
        # 获取向量库实例
        vector_store = self._get_vector_store()
        
        if vector_store is None:
            return []
        
        try:
            # Elasticsearch 需要使用特殊的查询来获取所有文档ID
            # 这里简化处理，实际实现可能需要更复杂的查询
            # 或者维护一个单独的ID索引
            return []  # 需要根据实际需求实现
        except Exception as e:
            print(f"获取所有ID失败: {e}")
            return []
