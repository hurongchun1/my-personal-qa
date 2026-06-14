'''
文档解析模块
处理不同类型文档解析的API端点
'''
from typing import List
from sqlite3 import Connection
import uuid
from fastapi import APIRouter, Depends, File, Form, UploadFile
import os

from backend.knowledge_base.parser.loader_factory import LoaderFactory
from backend.knowledge_base.parser.splitter.base_splitter import MethodInfo

from ..dependencies import get_db
from ..models import DeleteDocumentsRequest, ParseDocumentRequest
from ...common.logger import logger
from ...common.result_info import ResultInfo
from ...common.exceptions import BusinessException
from ...common.config import UPLOAD_DIR

# 注册路由
router = APIRouter(prefix="/documents",tags=["文档解析"])

@router.get("/supported-types")
async def supported_types(file_type:str):
    '''获取项目中支持的文件类型'''
    methods: List[MethodInfo] = LoaderFactory.get_supported_methods(file_type)
    data = []
    for method in methods:
        method_dict = {
            "name" : method.name,
            "label": method.label,
            "params": [{"name" : param.name,"label":param.label,"type":param.type,"default":param.default,"required":param.required }for param in method.params]
        }
        data.append(method_dict)
    return ResultInfo.success(data)


@router.get("/list_documents")
async def list_documents(kb_id : int ,db: Connection = Depends(get_db)):
    '''获取文档列表
    
    Args：
        db：数据库连接
    
    Returns：
        文档列表，包含id、文件名、文件类型、文件大小、状态、创建时间等
    '''
    try:
        sql = "SELECT id, file_name, file_type, file_size, chunk_count, status, parse_method, create_time FROM documents WHERE kb_id= ?  ORDER BY create_time DESC"
        cursor = db.cursor()
        cursor.execute(sql,(kb_id,))
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
                "parse_method": doc[6],
                "create_time": doc[7]
            }
            doc_list.append(doc_dict)
        
        return ResultInfo.success(doc_list)
    except Exception as e:
        logger.error(f"获取文档列表失败：{str(e)}")
        raise BusinessException.database_error(f"获取文档列表失败")

@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    kb_id : int = Form(...),
    db: Connection = Depends(get_db)
):
    '''上传文档
    
    Args：
        file：上传的文件
        db：数据库连接

    '''
    # raise BusinessException.not_found("测试异常")
    # 获取文件的扩展名，生成文件唯一名
    logger.info("开始上传文件，filename=%s", file.filename)
    if  file.filename is None:
        raise BusinessException.validation_error("文件名不能为空")

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

        logger.info("文件保存成功，file_path=%s, size=%s", file_path, len(file_content))
    except Exception as e:
        logger.error("文件保存失败，filename=%s, file_path=%s，失败原因=%s", file.filename, file_path, str(e))
        raise BusinessException.file_save_failed("文件保存失败")

    # 将文件信息保存到数据库中
    try:
        sql = "INSERT INTO documents(file_name, file_path, file_type, file_size, status, parse_method, kb_id) VALUES (?, ?, ?, ?, ?, ?, ?)"

        cursor = db.cursor()
        cursor.execute(sql, (
            file.filename,
            file_path,
            file_ext,
            len(file_content),
            "pending",
            "default",
            kb_id
        ))

        document_id = cursor.lastrowid
        db.commit()
        logger.info("文档元数据保存成功，document_id=%s, filename=%s", document_id, file.filename)
        return ResultInfo.success(document_id)

    except Exception as e:
        logger.error("文档元数据保存失败，filename=%s, file_path=%s, 失败原因=%s", file.filename, file_path, str(e))
        db.rollback()
        # 保存失败时删除已上传的文件
        if os.path.exists(file_path):
            os.remove(file_path)
        raise BusinessException.database_error(f"文件上传失败")


@router.post("/delete_documents")
async def delete_document_by_id(
    request: DeleteDocumentsRequest,
    db: Connection = Depends(get_db)
):
    '''批量删除文档
    
    Args：
        request：包含 ids 列表的请求体
        db：数据库连接
    
    Returns：
        成功或失败
    '''
    ids = request.ids
    try:
        # 1. 先查询要删除的文件路径
        placeholders = ','.join(['?'] * len(ids))
        query_sql = f"SELECT file_path FROM documents WHERE id IN ({placeholders})"
        cursor = db.cursor()
        cursor.execute(query_sql, ids)
        rows = cursor.fetchall()
        file_paths = [row[0] for row in rows]

        # 2. 删除数据库记录
        delete_sql = f"DELETE FROM documents WHERE id IN ({placeholders})"
        cursor.execute(delete_sql, ids)
        db.commit()
        
        # 3. 删除磁盘上的文件
        for file_path in file_paths:
            if file_path and os.path.exists(file_path):
                os.remove(file_path)
                logger.info("已删除文件: %s", file_path)

        return ResultInfo.success("ok")
    except Exception as e:
        logger.error(f"批量删除文档失败：{str(e)}")
        raise BusinessException.database_error("批量删除文档失败")

@router.post("/parse")
async def parse_document(
    request: ParseDocumentRequest,
    db :Connection =Depends(get_db)):
    '''解析文档'''
    try:
        # 从数据库获取文档信息
        sql = "SELECT file_path,file_type FROM documents WHERE id = ?"
        cursor = db.cursor()
        cursor.execute(sql,(request.document_id,))
        doc = cursor.fetchone()

        if not doc:
            raise BusinessException.not_found("文档不存在")
        
        file_path,file_type = doc

        # 使用工厂类创建加载器
        loader = LoaderFactory.create(file_type=file_type)

        # 根据解析方式构建参数
        parse_kwargs = {}
        
        # 获取该解析方法的参数信息
        supported_methods = loader.get_supported_methods()
        method_info = next((m for m in supported_methods if m.name == request.method), None)
        
        if method_info:
            # 检查该方法是否需要chunk_size和chunk_overlap参数
            param_names = [p.name for p in method_info.params]
            if 'chunk_size' in param_names:
                parse_kwargs['chunk_size'] = request.chunk_size
            if 'chunk_overlap' in param_names:
                parse_kwargs['chunk_overlap'] = request.chunk_overlap
            
            # 添加其他参数
            for param in method_info.params:
                if param.name not in ['chunk_size', 'chunk_overlap'] and param.name in request.params:
                    parse_kwargs[param.name] = request.params[param.name]
        
        logger.info(f"开始解析文档, 方法: {request.method}, 参数: {parse_kwargs}")
        # 调用解析方法
        chunks = loader.parse(
            method=request.method,
            source=file_path,
            **parse_kwargs
        )
        chunk_count = len(chunks) if chunks else 0
        logger.info(f"文档解析完成, 分块数量: {chunk_count}")

        # 更新文档状态和分块数量
        update_sql = "UPDATE documents SET status = 'parsed', parse_method = ?, chunk_count = ? WHERE id = ? "
        cursor.execute(update_sql,(request.method, chunk_count, request.document_id))
        db.commit()

        logger.info("文档解析成功，document_id=%s, method=%s",request.document_id,request.method)
        return ResultInfo.success("ok")
    except Exception as e:
        logger.error(f"文档解析失败：{str(e)}")
        raise BusinessException.database_error("文档解析失败")
