import dashscope
from openai.types.chat import ChatCompletionUserMessageParam
from config import LLM_MODEL, STORAGE_TYPE, CLIENT
from storage.storage_factory import StorageFactory


class RAGEngine:

    def __init__(self) -> None:
        self.storage = StorageFactory.create(STORAGE_TYPE)

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
