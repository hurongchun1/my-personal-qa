"""
RAG 问答系统主入口
启动 FastAPI 应用
"""

import sys
import os


# 将 backend 的上级目录（项目根目录）加入 sys.path，确保 backend 包可被找到
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


import uvicorn
if __name__ == "__main__":
    uvicorn.run(
        # api.app 是因为 app.py 文件在 api目录下，app 是 app.py 文件中的 app 对象
        app="backend.api.app:app",
        host="0.0.0.0",
        port=8000,
        reload=False,
        log_level="info"
    )