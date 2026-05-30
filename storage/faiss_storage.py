from langchain_core.documents.base import Document
import os
from typing import List, Optional, Tuple
from typing_extensions import override
import uuid
from langchain_community.vectorstores import FAISS
from config import FAISS_PATH, dashscope_embedding
from storage.base_storage import VectorStorage


class FaissStorage(VectorStorage):
    
    # 初始化后的参数配置
    def __init__(self):
        super().__init__()
        self._vector_store: Optional[FAISS] = None
        

    # 加载向量库
    def _load_vector_store(self):

        # 加载向量库缓存，如果已缓存直接返回
        if self._vector_store is not None:
            return self._vector_store
        
        # 没有缓存，需要加载向量库
        if os.path.exists(FAISS_PATH):
            try:
                self._vector_store = FAISS.load_local(
                    FAISS_PATH, 
                    dashscope_embedding,
                    allow_dangerous_deserialization=True # 允许反序列化
                )
            except Exception as e:
                print(f"加载向量库失败: {e}")
                self._vector_store = None
        
        else:
            self._vector_store = None

        return self._vector_store

    # 添加分块到向量库中
    def add_chunks(self, file_type, method, source, **kv):
        
        try:
            # 调用父类的解析方法获取分块
            chunks = self._parse_document(file_type, method, source, **kv)

            # 生成唯一ID
            ids = [str(uuid.uuid4()) for _ in chunks]

            # 加载向量库
            self._vector_store = self._load_vector_store()

            if self._vector_store is None:
                # 首次创建
                self._vector_store = FAISS.from_texts(
                    texts=chunks,
                    embedding=dashscope_embedding,
                    ids=ids
                )
            
            else:
                # 说明存在向量库，追加内容
                self._vector_store.add_texts(
                    texts=chunks,
                    ids=ids
                )

            # 保存到本地
            self._vector_store.save_local(FAISS_PATH)

            # 返回（向量库实例，ID列表）
            return self._vector_store, ids
            
        except Exception as e:
            print(f"添加分块失败: {e}")
            return None, []

        
    def delete_chunks(self, ids):
        '''删除指定ID的向量

        Args:
            ids: 要删除的向量ID列表

        Returns:
            bool: 删除是否成功
        '''
        try:
            # 加载向量库
            self._vector_store = self._load_vector_store()

            # 检查向量库是否存在
            if self._vector_store is None:
                return False

            # 调用删除方法删除
            result = self._vector_store.delete(ids)

            # 保存到本地
            if result:
                self._vector_store.save_local(FAISS_PATH)

            # 返回 True/False
            return result
            
        except Exception as e:
            print(f"删除向量失败: {e}")
            return False

    
    def update_chunks(self, ids, new_texts, new_metadatas, **kv):
        '''更新指定ID的向量
        
        Args:
            ids: 要更新的向量ID列表
            new_texts: 新的分块内容
            new_metadatas: 新的元信息
        
        Returns:
            bool: 更新是否成功
        '''
        try:
            # 加载向量库
            self._vector_store = self._load_vector_store()

            # 检查向量库是否存在
            if self._vector_store is None:
                return False

            # 更新向量库,需要先删除后更新
            is_deleted = self._vector_store.delete(ids=ids)

            if not is_deleted:
                return False
            
            self._vector_store.add_texts(
                texts=new_texts,
                metadatas=new_metadatas,
                ids=ids
            )
            
            # 保存到本地
            self._vector_store.save_local(FAISS_PATH)
            
            return True
            
        except Exception as e:
            print(f"更新向量失败: {e}")
            return False

    def search(self, query: str, k: int = 3, **kwargs) -> List[Tuple[Document, float]]:
        '''搜索相似内容
        
        Args:
            query: 问题
            k: 返回的数量
            **kwargs: 其他参数，如 filter, fetch_k 等
        
        Returns:
            List[Tuple[Document, float]]: 文档和相似度分数的列表
        '''
        try:
            self._vector_store = self._load_vector_store()
            
            # 检查向量库是否存在
            if not self._vector_store:
                return []
            
            return self._vector_store.similarity_search_with_score(query, k, **kwargs)
            
        except Exception as e:
            print(f"搜索失败: {e}")
            return []




