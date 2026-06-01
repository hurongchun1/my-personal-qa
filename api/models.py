

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


