'''
文档解析模块
处理不同类型文档解析的API端点
'''
from sqlite3 import Connection
import uuid
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
import os

from ..dependencies import get_db
from ...common.result_info import ResultInfo
from ...config import UPLOAD_DIR
from ...storage.base_storage import LOADER_MAP

# 注册路由
router = APIRouter(prefix="/documents",tags=["文档解析"])

@router.get("supported-types")
async def supported_types():
    '''获取项目中支持的文件类型'''
    methods = [key for key in LOADER_MAP.keys()]
    return ResultInfo.success(methods)

@router.get("")
async def list_documents(db: Connection = Depends(get_db)):
    '''获取文档列表
    
    Args：
        db：数据库连接
    
    Returns：
        文档列表，包含id、文件名、文件类型、文件大小、状态、创建时间等
    '''
    try:
        sql = "SELECT id, file_name, file_type, file_size, chunk_count, status, create_time FROM documents ORDER BY create_time DESC"
        cursor = db.cursor()
        cursor.execute(sql)
        documents = cursor.fetchall()
        
        # 转换为字典列表
        doc_list = []
        for doc in documents:
            doc_dict = {
                "id": doc[0],
                "file_name": doc[1],
                "file_type": doc[2],
                "file_size": doc[3],
                "chunk_count": doc[4],
                "status": doc[5],
                "create_time": doc[6]
            }
            doc_list.append(doc_dict)
        
        return ResultInfo.success(doc_list)
    except Exception as e:
        raise HTTPException(500, f"获取文档列表失败: {str(e)}")

@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    db: Connection = Depends(get_db)
):
    '''上传文档
    
    Args：
        file：上传的文件
        db：数据库连接

    '''
    # 获取文件的扩展名，生成文件唯一名
    if  file.filename is None:
        raise HTTPException(400,"文件名不能为空")

    file_ext = os.path.splitext(file.filename)[1]
    unique_file_name = uuid.uuid4().hex + file_ext

    # 确保上传目录存在
    os.makedirs(UPLOAD_DIR, exist_ok=True)

    # 构建完整的文件保存路径
    file_path = os.path.join(UPLOAD_DIR, unique_file_name)

    # 保存文件到磁盘
    try:
        file_content = await file.read()

        with open(file_path, "wb") as f:
            f.write(file_content)

        print(f"文件保存成功: {file_path}")
    except Exception as e:
        print(f"文件保存失败: {e}")
        raise HTTPException(500, f"文件保存失败: {str(e)}")

    # 将文件信息保存到数据库中
    try:
        sql = "INSERT INTO documents(file_name, file_path, file_type, file_size, status) VALUES (?, ?, ?, ?, ?)"

        cursor = db.cursor()
        cursor.execute(sql, (
            file.filename,
            file_path,
            file_ext,
            len(file_content),
            "pending"
        ))

        document_id = cursor.lastrowid
        db.commit()
        print(f"元数据保存成功，文档ID: {document_id}")
        return ResultInfo.success(document_id)

    except Exception as e:
        print(f"元数据保存失败: {e}")
        db.rollback()
        # 保存失败时删除已上传的文件
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(500, f"文件上传失败: {str(e)}")
