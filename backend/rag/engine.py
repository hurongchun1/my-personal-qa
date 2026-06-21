import dashscope

from ..common.config import LLM_MODEL, STORAGE_TYPE
from ..common.logger import logger
from ..qa.query_rewriter import QueryRewriter
from ..qa.web_search import get_web_search_instance
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


    # 添加联网搜索方式
    def web_search_ask(self,query : str,use_web:bool = True, k : int = 3):
        '''联网搜索问答'''

        context_parts = []

        # 本地知识库检索
        local_results = self.storage.search(query,k)

        if local_results:
            local_context = "\n".join([doc.page_content for doc,_ in local_results])
            context_parts.append("**本地知识库**\n" + local_context)

        # 联网搜索
        if use_web:
            try:
                web_search = get_web_search_instance()
                if web_search.is_available:
                    web_context = web_search.get_context_for_query(query)
                    if web_context:
                        context_parts.append(f"【网络搜索】\n{web_context}")
            except Exception as e:
                logger.error(f"联网搜索失败: {e}")
        
        # 合并上下文 + 调用LLM
        context = "\n\n".join(context_parts) if context_parts else "暂无相关信息"
        prompt = self.__prompt_template(query,context)
        messages = [
            {"role":"user","content":prompt}
        ]

        response = dashscope.Generation.call(
            model = LLM_MODEL,
            messages = messages,
            result_format = "message",
            temperature = 0.7
        )

        return response.output.choices[0].message.content

