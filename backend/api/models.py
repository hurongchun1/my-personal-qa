
from pydantic import BaseModel, Field


class SimpleChatRequest(BaseModel):
    '''简单请求查询请求模型'''
    query: str = Field(...,description="问题",min_length=1)
    k: int = Field(3,description="检索文档的数量",ge=3,le=10)
    
class RewrittenChatRequest(BaseModel):
    '''重写问题的请求模型'''
    query: str = Field(...,description="问题",min_length=1)
    conversation_history: str = Field(...,description="对话历史")
    context_info: str = Field(...,description="上下文信息")
    k: int = Field(3,description="检索文档的数量",ge=3,le=10) 

class MehodTypeRequest(BaseModel):
    '''根据类型获取对应文件解析方法'''
    file_type:str = Field()

class AddKnowledgeRequest(BaseModel):
    '''添加知识库'''
    name:str = Field(...,description="知识库名称",min_length=1,max_length=100)
    description:str = Field("",description="知识库描述",max_length=100)
    tags:str = Field("",description="知识库标签",max_length=100)

class DeleteDocumentsRequest(BaseModel):
    '''批量删除文档'''
    ids: list[int] = Field(...,description="文档ID列表",min_length=1)

class ParseDocumentRequest(BaseModel):
    '''解析文档请求模型'''
    document_id : int = Field(...,description="文档ID")
    method: str = Field(...,description="解析方法名称")
    chunk_size : int = Field(...,description="分块大小")
    chunk_overlap : int = Field(...,description="分块重叠大小")
    params : dict = Field(...,description="其他参数")  # pyright: ignore[reportMissingTypeArgument]
