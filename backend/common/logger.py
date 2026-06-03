from logging import Logger


from datetime import datetime
import logging
import os


def setup_logger(name: str = "rag_app", log_dir: str | None = None):
    '''配置日志，同时输出到控制台和文件'''

    # 创建日志目录
    if log_dir is None:
        # 从 logger.py 往上2层到 backend 目录
        backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        log_dir = os.path.join(backend_dir, "logs")

    if not os.path.exists(log_dir):
        os.makedirs(log_dir)
    
    # logger 日志记录器,用于接收日志
    # 生成日志文件名（按天）
    today = datetime.now().strftime("%Y-%m-%d")
    log_file = os.path.join(log_dir,f"{name}_{today}.jsonl")
    
    # 创建日志记录器
    logger: Logger = logging.getLogger(name)
    # 记录debug及以上级别的日志
    logger.setLevel(logging.DEBUG)
    
    # 避免重复添加处理器,handler决定了日志信息去哪
    if not logger.handlers:
        # 文件处理 —— 保存到文件
        file_handler = logging.FileHandler(log_file,encoding="utf-8")
        file_handler.setLevel(logging.DEBUG)

        # 控制台处理器 —— 打印到屏幕
        console_handler = logging.StreamHandler()
        console_handler.setLevel(logging.INFO)

        # 日志格式
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            datefmt="%Y-%m-%d %H:%M:%S"
        )

        file_handler.setFormatter(formatter)
        console_handler.setFormatter(formatter)

        # 添加处理器
        logger.addHandler(file_handler)
        logger.addHandler(console_handler)
        logger.info("Logger initialized, log_file=%s", os.path.abspath(log_file))
    
    return logger

# 创建全局日志记录器
logger = setup_logger()
