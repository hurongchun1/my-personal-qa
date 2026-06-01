

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
