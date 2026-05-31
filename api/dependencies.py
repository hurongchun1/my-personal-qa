"""
API 依赖项
提供共享的依赖注入
"""

import os
import sys
from typing import Optional

# 添加项目根目录到 Python 路径
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, PROJECT_ROOT)

from rag_engine import RAGEngine


# 全局 RAG 引擎实例
rag_engine: Optional[RAGEngine] = None


async def get_rag_engine() -> RAGEngine:
    """获取 RAG 引擎实例"""
    global rag_engine
    if rag_engine is None:
        try:
            rag_engine = RAGEngine()
            print("RAG 引擎初始化成功")
        except Exception as e:
            print(f"RAG 引擎初始化失败: {e}")
            raise
    return rag_engine


async def startup_event():
    """应用启动时初始化 RAG 引擎"""
    await get_rag_engine()


async def shutdown_event():
    """应用关闭时清理资源"""
    global rag_engine
    rag_engine = None