"""
API 依赖项
提供共享的依赖注入
"""

from typing import  AsyncGenerator
from sqlite3 import Connection

from fastapi import HTTPException
from fastapi.exceptions import RequestValidationError

from ..rag.engine import RAGEngine
from ..knowledge_base.database.connection import get_connection, close_connection, init_db
from ..common.logger import logger
from ..common.exceptions import BusinessException


# 全局 rag引擎实例
rag_engine : RAGEngine | None= None


async def get_rag_engine() -> RAGEngine:
    '''获取rag引擎实例'''
    global rag_engine

    if rag_engine is None:
        
        try:
            rag_engine = RAGEngine()
            print("rag_engine 初始化成功")
        except Exception as e :
            print(f"rag_engine 初始化失败，错误信息{e}")
            raise
    return rag_engine
    

async def startup_event():
    '''应用启动时初始化rag引擎,数据库引擎'''
    init_db()
    await get_rag_engine()

async def shutdown_event():
    '''应用结束后释放rag引擎'''
    global rag_engine
    rag_engine = None

# ========= 数据库对 FastAPI 依赖 =========

async def get_db() -> AsyncGenerator[Connection, None]:
    conn: Connection  = get_connection()
    try:
        yield conn
        conn.commit()
    except (BusinessException, HTTPException, RequestValidationError):
        conn.rollback()
        raise
    except Exception :
        logger.exception("请求处理异常，数据库事务已回滚")
        conn.rollback()
        raise
    finally:
        close_connection(conn)
