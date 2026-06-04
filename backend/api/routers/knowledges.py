


# 注册路由
from sqlite3 import Connection
from fastapi import APIRouter, Depends

from ...common.logger import logger

from ..dependencies import get_db
from ..models import AddKnowledgeRequest
from ...common.exceptions import BusinessException
from ...common.result_info import ResultInfo


router = APIRouter(prefix="/knowledges",tags=["文档解析"])


@router.get("/list_knowledges")
async def list_knowledges(db: Connection = Depends(get_db)):
    '''获取知识库列表
    
    Args:
        db:数据库连接
    
    Returns:
        知识库列表，包含id、名称、描述、标签、创建时间等
    '''
    try:
        sql = "SELECT id,name,description,tags,create_time FROM knowledge_bases ORDER BY create_time DESC"
        cursor = db.cursor()
        cursor.execute(sql)
        knowledges = cursor.fetchall()

        # 转换为字典列表
        knowledge_list = []
        for knowledge in knowledges:
            knowledge_dict = {
                "id": knowledge[0],
                "name": knowledge[1],
                "description": knowledge[2],
                "tags": knowledge[3],
                "create_time": knowledge[4]
            }
            knowledge_list.append(knowledge_dict)
        return ResultInfo.success(knowledge_list)
    except Exception as e:
        logger.error(f"获取知识库列表失败：{str(e)}")
        raise BusinessException.database_error(f"获取知识库列表失败")


@router.post("/add_knowledges")
async def add_knowledges(
    request : AddKnowledgeRequest,
    db: Connection = Depends(get_db)
    ):
    '''添加知识库列表
    
    Args:
        db:数据库连接
    
    Returns:
        成功或失败
    '''
    try:
        sql = "INSERT INTO knowledge_bases(name,description,tags) VALUES(?,?,?)"
        cursor = db.cursor()
        cursor.execute(sql,(request.name,request.description,request.tags))
        db.commit()
        return ResultInfo.success("ok")
    except Exception as e:
        logger.error(f"添加知识库失败: {str(e)}")
        raise BusinessException.database_error(f"添加知识库失败")


@router.delete("/{kb_id}")
async def delete_knowledges(
    kb_id : int,
    db: Connection = Depends(get_db)
):
    '''删除知识库及其关联文档
    
    Args: 
        kb_id：知识库id
        db：数据库连接

    returns：
        成功或失败
    '''
    try:
        sql = "DELETE FROM knowledge_bases WHERE id = ?"
        cursor = db.cursor()
        cursor.execute(sql,(kb_id,))

        sql = "DELETE FROM documents WHERE kb_id = ?"
        cursor.execute(sql,(kb_id,))

        db.commit()
        return ResultInfo.success("OK")
    except Exception as e:
        logger.error(f"删除知识库失败：{str(e)}")
        raise BusinessException.database_error("删除知识库失败")

    