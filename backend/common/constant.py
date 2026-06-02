

from ..parser import PDFLoader, HtmlLoader, MarkdownLoader


class Constant:

    class ResultCode:
        SUCCESS = 200
        BAD_REQUEST = 400
        ERROR = 500
    
    class ResultMsg:
        INVALID_LOGIN_MSG     = "用户名或密码错误."
        INVALID_VALIDATE_CODE = "验证码错误或过期."
        RESULT_ERROR_MSG      = "系统异常..."
        RESULT_NOT_LOGIN_MSG  = "用户未登陆或失效，请重新登陆."
        ACTION_ERROR_MSG      = "操作异常..."
    
    class Storage:
        # 解析器映射字典
        LOADER_MAP = {
            "htm": HtmlLoader,
            "html": HtmlLoader,
            "pdf": PDFLoader,
            "md": MarkdownLoader,
            "markdown": MarkdownLoader
        }
        # 文件后缀名到文件类型的映射
        EXTENSION_MAP = {
            ".pdf": "pdf",
            ".html": "html",
            ".htm": "html",
            ".md": "markdown",
            ".markdown": "markdown",
            ".docx": "word",
            ".doc": "word",
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
