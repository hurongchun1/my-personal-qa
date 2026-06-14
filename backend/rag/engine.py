import dashscope
from ..common.config import LLM_MODEL, STORAGE_TYPE
from ..qa.query_rewriter import QueryRewriter
from .storage.storage_factory import StorageFactory


class RAGEngine:

    def __init__(self) -> None:
        self.storage = StorageFactory.create(STORAGE_TYPE)
        self._query_rewriter = QueryRewriter()

    def __prompt_template(self, query: str, documents: str) -> str:
        prompt = f"""你是一个聊天专家，你擅长根据得到的知识库内容，回答用户的问题。
**知识库内容**
{documents}
**问题**
{query}
"""
        return prompt

    def simple_ask(self, query: str, k: int = 3):
        # 1. 检索相关文档
        results = self.storage.search(query, k=k)

        # 2. 拼接上下文
        context = "\n".join([doc.page_content for doc, _ in results])

        # 3. 构造prompt
        prompt = self.__prompt_template(query, context)

        messages =  [
            {"role":"user","content":prompt}
        ]

        response = dashscope.Generation.call(
            model=LLM_MODEL,
            messages = messages,
            result_format = "message",
            temperature = 0.7
        )

        return response.output.choices[0].message.content

    
    def rewritten_query_ask(self,query,conversation_history,context_info,k = 3):
        '''重写问题并回答问题

        Args：
            query：原始问题
            conversation_history：对话历史
            context_info：上下文信息
            k：检索文档的数量
        '''
        rewritten_query = self._query_rewriter.auto_rewrite_and_execute(query,conversation_history,context_info)

        # 获取知识库文档
        # 处理返回类型：如果是list，取第一个元素
        if isinstance(rewritten_query, list):
            search_query = rewritten_query[0] if rewritten_query else query
        else:
            search_query = rewritten_query
        documents = self.storage.search(search_query, k)

        # 拼接上下文
        context = "\n".join([doc.page_content for doc, _ in documents])

        prompt = self.__prompt_template(search_query,context)

        messages = [
            {"role":"user","content":prompt}
        ]

        response  = dashscope.Generation.call(
            model = LLM_MODEL,
            messages = messages,
            result_format ="message",
            temperature = 0.7
        )

        return response.output.choices[0].message.content