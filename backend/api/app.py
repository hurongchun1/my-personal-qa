"""
RAG API 主应用文件
FastAPI 应用入口
"""

from ..common.logger import logger
import os
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI,Request
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from ..common.exceptions import BusinessException
from .dependencies import shutdown_event, startup_event
from .routers import query, documents, knowledges

# 生命周期管理
@asynccontextmanager
async def lifespan(app : FastAPI):
    # ========= 启动时执行代码 =========
    print("应用启动，初始化资源")
    # 启动全局依赖
    logger.info("应用启动，logger handlers=%s", logger.handlers)
    await startup_event()
    # yield之后是关闭
    yield
    print("应用关闭，释放资源")
    logger.info("应用关闭，释放资源")
    await shutdown_event()


# 创建应用
app = FastAPI(
    title="RAG问答系统",
    description="基于检索增强生成的智能问答系统",
    version="1.0.0",
    lifespan = lifespan # 传入生命周期管理
)



# 配置中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# 注册路由
app.include_router(query.router, prefix="/api")
app.include_router(documents.router, prefix="/api")
app.include_router(knowledges.router, prefix="/api")

# 注册异常处理器
@app.exception_handler(BusinessException)
async def handle_business_exception(request: Request, exc: BusinessException):
    '''处理业务异常 只处理BusinessException 异常'''
    logger.error("业务异常：%s", request.url, exc_info=(type(exc), exc, exc.__traceback__))
    return JSONResponse(
        status_code = 200, # 业务已知异常返回 200
        content= exc.to_dict()
    )

@app.exception_handler(Exception)
async def handle_global_exception(request: Request, exc: Exception):
    '''处理全局异常 能处理所有异常'''
    logger.error("未知异常：%s", request.url, exc_info=(type(exc), exc, exc.__traceback__))
    return JSONResponse(
        status_code= 500, # 未知异常返回 500
        content = {
            "code": 500,
            "message": "服务器内部错误",
            "data":str(exc)
        }
    )

# 健康查询
@app.get("/health")
async def health():
    # raise BusinessException.not_found("测试异常")  # 测试代码，已注释
    return {
        "status":"ok",
        "message":"RAG 问答系统正常运行"
    }

# 系统状态端点
@app.get("/api/system/status")
async def system_status():
    """获取系统状态信息"""
    import psutil
    import time
    
    # 获取数据库状态
    db_status = "normal"
    try:
        # 这里可以添加数据库连接检查
        pass
    except Exception:
        db_status = "error"
    
    # 获取文档数量
    document_count = 0
    try:
        from ..knowledge_base.database.connection import get_connection
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM documents")
        document_count = cursor.fetchone()[0]
        conn.close()
    except Exception:
        pass
    
    # 获取系统信息
    memory_usage = psutil.virtual_memory().percent if hasattr(psutil, 'virtual_memory') else 0
    storage_usage = psutil.disk_usage('/').percent if hasattr(psutil, 'disk_usage') else 0
    
    return {
        "code": 200,
        "msg": "success",
        "data": {
            "documentCount": document_count,
            "dbStatus": db_status,
            "apiStatus": "running",
            "uptime": int(time.time() - psutil.boot_time()) if hasattr(psutil, 'boot_time') else 0,
            "memoryUsage": memory_usage,
            "storageUsage": storage_usage
        }
    }

# 根路径——欢迎页面
@app.get("/")
async def root():
    return {
        "message":"欢迎使用RAG问答系统"
    }

# React前端路由
@app.get("/app")
async def react_app():
    """返回React前端应用"""
    react_app_path = os.path.join(os.path.dirname(__file__), "..", "..", "frontend-react", "dist", "index.html")
    if os.path.exists(react_app_path):
        return FileResponse(react_app_path)
    else:
        # 如果未构建，返回开发服务器提示
        return JSONResponse(
            status_code=200,
            content={
                "message": "React前端未构建，请运行: cd frontend-react && npm run build",
                "dev_url": "http://localhost:5173"
            }
        )

# React静态文件服务
react_static_dir = os.path.join(os.path.dirname(__file__), "..", "..", "frontend-react", "dist")
if os.path.exists(react_static_dir):
    app.mount("/assets", StaticFiles(directory=os.path.join(react_static_dir, "assets")), name="react-assets")
