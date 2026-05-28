from typing import Union
from storage.base_storage import VectorStorage
from storage.faiss_storage import FaissStorage
from storage.elasticsearch_storage import ElasticsearchStorage


class StorageFactory:
    """向量库存储工厂类"""
    
    # 支持的存储类型
    SUPPORTED_TYPES = {
        "faiss": FaissStorage,
        "elasticsearch": ElasticsearchStorage,
        "es": ElasticsearchStorage  # 别名
    }
    
    @classmethod
    def create_storage(cls, storage_type: str = "faiss") -> VectorStorage:
        """创建向量库存储实例
        
        Args:
            storage_type: 存储类型，支持 "faiss"、"elasticsearch" 或 "es"
        
        Returns:
            VectorStorage: 向量库存储实例
        
        Raises:
            ValueError: 不支持的存储类型
        """
        storage_type = storage_type.lower().strip()
        
        if storage_type not in cls.SUPPORTED_TYPES:
            raise ValueError(
                f"不支持的存储类型: {storage_type}，"
                f"支持的类型: {list(cls.SUPPORTED_TYPES.keys())}"
            )
        
        storage_class = cls.SUPPORTED_TYPES[storage_type]
        return storage_class()
    
    @classmethod
    def get_supported_types(cls) -> list[str]:
        """获取支持的存储类型列表
        
        Returns:
            list: 支持的存储类型列表
        """
        return list(cls.SUPPORTED_TYPES.keys())
