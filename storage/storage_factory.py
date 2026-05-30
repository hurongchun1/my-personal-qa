
from storage.elasticsearch_storage import ElasticsearchStorage
from storage.faiss_storage import FaissStorage


class StorageFactory:
    def __init__(self):
        pass

    # 注册表：字符串 ——> 存储类
    _registry ={
        "faiss" : FaissStorage,
        "elasticsearch" : ElasticsearchStorage
    }

    @classmethod
    def create(cls,storage_type):
        '''基于存储的类型，来得到对应的向量库

            Args：
                storage_type: 存储类型，可以是 faiss 或者 elasticsearch

            return:
                返回对应的向量库实例
            '''

        if not storage_type :
            
            raise ValueError("storage_type 不能为空")

        # 判断输入的类型是否再注册表中
        if storage_type not in cls._registry.keys():
            raise ValueError(f"仅支持:{[cls._registry.keys()]}这些向量库存储")

        class_name = cls._registry[storage_type]
        
        return class_name()

            
            
