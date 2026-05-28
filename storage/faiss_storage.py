from multiprocessing import Value
from requests import get
from  parser import PDFLoader,HtmlLoader,MarkdownLoader


# 解析器映射字典
LOADER_MAP = {
    "htm":HtmlLoader,
    "html":HtmlLoader,
    "pdf":PDFLoader,
    "md":MarkdownLoader,
    "markdown":MarkdownLoader
}

# 解析器方法映射字典
METHOD_MAP = {
    "pdf":{
        "default": lambda loader,source,**kv:loader.parse(source,kv.get("chunk_size",512),kv.get("chunk_overlap",50)),
        "token": lambda loader,source,**kv:loader.token_text_parser(source,kv.get("file_path"),kv.get("chunk_size"),kv.get("chunk_overlap")),
        "semantic": lambda loader,source,**kv:loader.semantic_text_parser(source,kv.get("file_path"),kv.get("embedding"))
    },
    "html":{
        "character": lambda loader,source,**kv:loader.parse(source,kv.get("file_path"),kv.get("chunk_size"),kv.get("chunk_overlap")),
        "semantic": lambda loader,source,**kv:loader.parse_by_semantic(source,kv.get("url"),kv.get("embedding")),
        "default": lambda loader,source,**kv:loader.parse_by_html_splitter(source,kv.get("url"),kv.get("headers_to_split_on"))
    },
    "htm":{
        "character": lambda loader,source,**kv:loader.parse(source,kv.get("file_path"),kv.get("chunk_size"),kv.get("chunk_overlap")),
        "semantic": lambda loader,source,**kv:loader.parse_by_semantic(source,kv.get("url"),kv.get("embedding")),
        "default": lambda loader,source,**kv:loader.parse_by_html_splitter(source,kv.get("url"),kv.get("headers_to_split_on"))
    },
    "markdown":{
        "default": lambda loader,source,**kv:loader.parse(source,kv.get("file_path"),kv.get("chunk_size"),kv.get("chunk_overlap")),
        "token": lambda loader,source,**kv:loader.token_text_parser(source,kv.get("file_path"),kv.get("chunk_size"),kv.get("chunk_overlap")),
        "semantic": lambda loader,source,**kv:loader.Semantic_text_parser(source,kv.get("file_path"),kv.get("embedding"))
    },
    "md":{
        "default": lambda loader,source,**kv:loader.parse(source,kv.get("file_path"),kv.get("chunk_size"),kv.get("chunk_overlap")),
        "token": lambda loader,source,**kv:loader.token_text_parser(source,kv.get("file_path"),kv.get("chunk_size"),kv.get("chunk_overlap")),
        "semantic": lambda loader,source,**kv:loader.Semantic_text_parser(source,kv.get("file_path"),kv.get("embedding"))
    }
}

class FaissStorage:

    def __init__(self):
        self._parser_loaders = {}
        self._vector_store = None
        

    def get_loader(self,file_type):
        if not file_type:
            raise ValueError("file_type is empty")
        
        # 转换为小写，去除空格
        file_type = file_type.lower().strip()

        if file_type not in LOADER_MAP:
            raise ValueError("file_type is not supported")
        

        # 查询parser_loader是有已经加载
        if file_type in self._parser_loaders:
            return self._parser_loaders[file_type]
        
        # 加载 parser_loader
        loader = LOADER_MAP.get(file_type)
        self._parser_loaders[file_type] = loader
        return loader
