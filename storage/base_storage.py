from abc import ABC, abstractmethod
from typing import List, Optional, Any, Dict, Tuple
from langchain_core.documents.base import Document
from parser import PDFLoader, HtmlLoader, MarkdownLoader


# 解析器映射字典
LOADER_MAP = {
    "htm": HtmlLoader,
    "html": HtmlLoader,
    "pdf": PDFLoader,
    "md": MarkdownLoader,
    "markdown": MarkdownLoader
}

# 解析器方法映射字典
METHOD_MAP = {
    "pdf": {
        "default": lambda loader, source, **kv: loader.parse(source, kv.get("chunk_size", 512), kv.get("chunk_overlap", 50)),
        "token": lambda loader, source, **kv: loader.token_text_parser(source, kv.get("file_path"), kv.get("chunk_size"), kv.get("chunk_overlap")),
        "semantic": lambda loader, source, **kv: loader.semantic_text_parser(source, kv.get("file_path"), kv.get("embedding"))
    },
    "html": {
        "character": lambda loader, source, **kv: loader.parse(source, kv.get("file_path"), kv.get("chunk_size"), kv.get("chunk_overlap")),
        "semantic": lambda loader, source, **kv: loader.parse_by_semantic(source, kv.get("url"), kv.get("embedding")),
        "default": lambda loader, source, **kv: loader.parse_by_html_splitter(source, kv.get("url"), kv.get("headers_to_split_on"))
    },
    "htm": {
        "character": lambda loader, source, **kv: loader.parse(source, kv.get("file_path"), kv.get("chunk_size"), kv.get("chunk_overlap")),
        "semantic": lambda loader, source, **kv: loader.parse_by_semantic(source, kv.get("url"), kv.get("embedding")),
        "default": lambda loader, source, **kv: loader.parse_by_html_splitter(source, kv.get("url"), kv.get("headers_to_split_on"))
    },
    "markdown": {
        "default": lambda loader, source, **kv: loader.parse(source, kv.get("file_path"), kv.get("chunk_size"), kv.get("chunk_overlap")),
        "token": lambda loader, source, **kv: loader.token_text_parser(source, kv.get("file_path"), kv.get("chunk_size"), kv.get("chunk_overlap")),
        "semantic": lambda loader, source, **kv: loader.Semantic_text_parser(source, kv.get("file_path"), kv.get("embedding"))
    },
    "md": {
        "default": lambda loader, source, **kv: loader.parse(source, kv.get("file_path"), kv.get("chunk_size"), kv.get("chunk_overlap")),
        "token": lambda loader, source, **kv: loader.token_text_parser(source, kv.get("file_path"), kv.get("chunk_size"), kv.get("chunk_overlap")),
        "semantic": lambda loader, source, **kv: loader.Semantic_text_parser(source, kv.get("file_path"), kv.get("embedding"))
    }
}


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
        
        if file_type not in LOADER_MAP:
            raise ValueError(f"不支持的文件类型: {file_type}，支持的类型: {list(LOADER_MAP.keys())}")
        
        # 查询parser_loader是否已经加载
        if file_type in self._parser_loaders:
            return self._parser_loaders[file_type]
        
        # 加载 parser_loader 实例 这里需要实例化后才能调用
        loader_class = LOADER_MAP[file_type]
        loader = loader_class()
        self._parser_loaders[file_type] = loader
        return loader
    
    def get_all_supported_types(self) -> dict[str, list[str]]:
        """获取所有支持的文件类型及其方法
        
        return 文件类型 -> 方法列表
        """
        result = {}
        for file_type, method in METHOD_MAP.items():
            result[file_type] = list(method.keys())
        
        return result
    
    def get_support_method(self, file_type: str) -> List[str]:
        """根据文件类型获取到具体的方法
        
        return 方法列表
        """
        if not file_type:
            raise ValueError("file_type 不能为空")
        
        file_type = file_type.lower().strip()
        
        # 检查是否支持该文件类型
        if file_type not in METHOD_MAP:
            raise ValueError(f"不支持的文件类型：{file_type}")
        
        return list(METHOD_MAP[file_type].keys())
    
    def _parse_document(self, file_type: str, method: str, source: str, **kv) -> List[str]:
        """根据文件类型，方法名，文件路径解析文档
        
        return 分块后的文本列表
        """
        if not file_type:
            raise ValueError("file_type 不能为空")
        
        file_type = file_type.lower().strip()
        
        # 获取对应文件类型的方法字典
        methods = METHOD_MAP.get(file_type)
        
        if methods is None:
            raise ValueError(f"不支持的文件类型:{file_type},支持的类型：{list(METHOD_MAP.keys())}")
        
        # 检查提供的method是否在methods中
        if method not in methods:
            raise ValueError(f"不支持的解析方法：{method},仅支持的方法：{list(methods.keys())}")
        
        # 获取文件解析器
        loader = self.get_loader(file_type)
        
        # 执行分块操作
        return methods[method](loader, source, **kv)
    
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