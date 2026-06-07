from abc import ABC, abstractmethod
from typing import List, Optional, Any, Dict, Tuple
from langchain_core.documents.base import Document
from ..parser.loader_factory import LoaderFactory


class VectorStorage(ABC):
    """向量库存储抽象基类"""
    
    def __init__(self):
        self._parser_loaders = {}
    
    def get_loader(self, file_type: str):
        """获取文件解析器"""
        if not file_type:
            raise ValueError("file_type is empty")
        
        # 转换为小写，去除空格
        file_type = file_type.lower().strip()
        
        # 查询parser_loader是否已经加载
        if file_type in self._parser_loaders:
            return self._parser_loaders[file_type]
        
        # 使用工厂类创建加载器
        loader = LoaderFactory.create(file_type)
        self._parser_loaders[file_type] = loader
        return loader
    
    def get_all_supported_types(self) -> dict[str, list[str]]:
        """获取所有支持的文件类型及其方法
        
        return 文件类型 -> 方法列表
        """
        result = {}
        supported_types = LoaderFactory.get_supported_types()
        for file_type in supported_types:
            try:
                methods_info = LoaderFactory.get_supported_methods(file_type)
                method_names = [method.name for method in methods_info]
                result[file_type] = method_names
            except Exception:
                # 如果获取失败，跳过该类型
                continue
        return result
    
    def get_support_method(self, file_type: str) -> List[str]:
        """根据文件类型获取到具体的方法
        
        return 方法列表
        """
        if not file_type:
            raise ValueError("file_type 不能为空")
        
        file_type = file_type.lower().strip()
        
        try:
            methods_info = LoaderFactory.get_supported_methods(file_type)
            return [method.name for method in methods_info]
        except Exception as e:
            raise ValueError(f"不支持的文件类型：{file_type}，错误: {str(e)}")
    
    def _parse_document(self, file_type: str, method: str, source: str, **kv) -> List[str]:
        """根据文件类型，方法名，文件路径解析文档
        
        return 分块后的文本列表
        """
        if not file_type:
            raise ValueError("file_type 不能为空")
        
        file_type = file_type.lower().strip()
        
        # 获取文件解析器
        loader = self.get_loader(file_type)
        
        # 执行分块操作
        return loader.parse(method, source, **kv)
    
    @abstractmethod
    def add_chunks(self, file_type: str, method: str, source: str, **kv) -> Tuple[Any, List[str]]:
        """添加分块到向量库
        
        Args:
            file_type: 文件类型 (pdf, html, markdown等)
            method: 解析方法 (default, token, semantic等)
            source: 文件路径或内容
            
        Returns:
            Tuple[Any, List[str]]: (向量库实例, 生成的ID列表)
        """
        pass
    
    @abstractmethod
    def delete_chunks(self, ids: List[str]) -> bool:
        """删除指定ID的向量
        
        Args:
            ids: 要删除的向量ID列表
            
        Returns:
            bool: 删除是否成功
        """
        pass
    
    @abstractmethod
    def update_chunks(self, ids: List[str], new_texts: List[str], new_metadatas: Optional[List[Dict[str, Any]]] = None) -> bool:
        """更新指定ID的向量
        
        Args:
            ids: 要更新的向量ID列表
            new_texts: 新的文本内容列表
            new_metadatas: 新的元数据列表（可选）
            
        Returns:
            bool: 更新是否成功
        """
        pass
    
    @abstractmethod
    def search(self, query: str, k: int = 3, **kwargs) -> List[Tuple[Document, float]]:
        """搜索相似内容
        
        Args:
            query: 查询文本
            k: 返回结果数量
            **kwargs: 其他参数
            
        Returns:
            List[Tuple[Document, float]]: 文档和相似度分数的列表
        """
        pass