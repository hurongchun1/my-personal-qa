"""
API 依赖项
提供共享的依赖注入
"""

from rag_engine import RAGEngine


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
    '''应用启动时初始化rag引擎'''
    await get_rag_engine()

async def shutdown_event():
    '''应用结束后释放rag引擎'''
    global rag_engine
    rag_engine = None