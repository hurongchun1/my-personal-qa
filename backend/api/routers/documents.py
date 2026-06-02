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

    # 构建完整的文件保存路径
    file_path = os.path.join(UPLOAD_DIR,unique_file_name)

    # 保存文件到磁盘
    try:
        # 读取上传文件的内容
        file_content = await file.read()

        # 写入文件
        with open(file_path,"wb") as f:
            f.write(file_content)

        print(f"文件保存成功:{file_path}")
    except Exception as e:
        print(f"文件保存失败：{e}")
        raise

    # 将文件信息保存到数据库中

    try:
        # 构建SQL插入语句
        sql = "INSERT INTO documents(file_name,file_path,file_type,file_size,status)VALUES(?,?,?,?,?)"

        # 执行SQL(使用参数化查询防止SQL注入)
        cursor = db.cursor()
        cursor.execute(sql,(
            file.filename,
            file_path,
            file_ext,
            len(file_content),
            "pending"
        ))

        # 获取插入的记录ID
        document_id = cursor.lastrowid
        db.commit()
        print(f"元数据保存成功，文档ID: {document_id}")
        # 返回上传结果
        return ResultInfo.success(document_id) 
    
    except Exception as e:
        print(f"元数据保存失败:{e}")
        db.rollback()
        raise HTTPException(500,"文件上传失败")
