

class Constant:

    class ResultCode:
        SUCCESS = 200
        BAD_REQUEST = 400
        ERROR = 500
        NOT_FOUND = 404
        UNAUTHORIZED = 401
        FORBIDDEN = 403
        
        # 业务错误码 (1xxx)
        SEARCH_FAILED = 1001
        SEARCH_TIMEOUT = 1002
        LLM_FAILED = 1101
        LLM_TIMEOUT = 1102
        LLM_RATE_LIMIT = 1103
        DOCUMENT_PARSE_FAILED = 1201
        DOCUMENT_TYPE_NOT_SUPPORTED = 1202
        DOCUMENT_NOT_FOUND = 1203
        FILE_SAVE_FAILED = 1301
        FILE_TOO_LARGE = 1302
        FILE_EMPTY = 1303
        DATABASE_ERROR = 1401
        DATABASE_CONNECTION_FAILED = 1402
    
    class ResultMsg:
        INVALID_LOGIN_MSG     = "用户名或密码错误."
        INVALID_VALIDATE_CODE = "验证码错误或过期."
        RESULT_ERROR_MSG      = "系统异常..."
        RESULT_NOT_LOGIN_MSG  = "用户未登陆或失效，请重新登陆."
        ACTION_ERROR_MSG      = "操作异常..."
    
    class Storage:
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
