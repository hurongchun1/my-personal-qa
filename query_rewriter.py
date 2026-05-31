

import json
from config import LLM_MODEL
import dashscope


class QueryRewriter:

    def __init__(self) -> None:
        # 将模型注入
        self.model = LLM_MODEL

    def __get_completion(self,prompt) :

        messages = [
            {"role":"user","content":prompt}
        ]

        response = dashscope.Generation.call(
            model=self.model,
            messages  = messages,
            temperature = 0.7,
            result_format='message',
        )
        return response.output.choices[0].message.content

    
    def auto_rewrite_query(self,query,conversation_history,context_info):
        '''自动判断重写方法的类型

        Args:
            query：问题
            conversation_history: 对话历史
            context_info：上下文信息

        returns：

        '''
        instruction = """
你是一个智能问题分析专家。请根据用户查询的问题，识别属于以下哪种类型
1.上下文依赖型：包含"还有"、"其他"、省略了主语/宾语等需要上下文理解的词汇
2.对比型：包含"哪个"、"比较"、"更"、"哪个更好"、"和"、"与"等比较词汇
3.模糊指代型：包含"它"、"这个"、"那个"、"此"等指代词
4.多意图型：包含多个独立问问题、用","、"和"、"且"等词分隔
5.反问型： 包含"不会"、"难道"等反问语气
如果同时存在多意图型、模糊指代型，优先级为多意图型> 模糊指代型
其中查询类型只能写：上下文依赖型、对比型、模糊指代型、多意图型、反问型

请返回JSON格式的结果
{
    "type":"查询类型",
    "rewrite_query":"改写的问题",
    "confidence":"置信度"
}
"""
        prompt =f'''
##指令##
{instruction}
##对话历史##
{conversation_history}
##上下文信息##
{context_info}
##原始问题##
{query}
        '''
        
        # 得到对话信息
        try: 
            response = self.__get_completion(prompt)
            return json.loads(response)
        except Exception as e :
            print(e)
            return {
                "type":"未知类型",
                "rewrite_query":query,
                "confidence":"0.5"
            }

    def dependence_rewrite_query(self,query,conversation_history) :
        '''上下文依赖型问题重写

        Args：
            query：问题
            conversation_history: 对话历史
        
        '''
        instruction = """
你是一个上下文依赖型问题重写专家。请根据用户的当前问题以及前文的用户历史对话，判断出当前问题是否依赖于上下文。
如果依赖，请将当前问题改写成一个独立的、包含多有必要上下文信息的完整问题。
如果不依赖，直接返回原问题。    
"""
        prompt = f"""
##指令##
{instruction}
##对话历史##
{conversation_history}
##用户问题##
{query}
        """
        return self.__get_completion(prompt)


    def compare_rewrite_query(self,query,conversation_history):
        '''对比型问题重写方法

        Args:
            query: 问题
            conversation_history: 对话历史
        
        Returns:
            str: 改写后的问题
        '''
        instruction = """
你是一个对比型问题重写专家。请分析用户的输入和相关的对话上下文，识别出问题中需要进行比较的多个对象，
然后，将原问题改写成一个更明确、更适合在知识库中检索的对比查询。
如果不包含对比内容，直接返回原问题。
"""
        prompt = f"""
{instruction}

对话历史：{conversation_history}
用户问题：{query}
"""
        return self.__get_completion(prompt)


    def ambiguous_reference_rewrite_query(self,query,conversation_history,context_info):
        '''模糊指代型问题重写方法

        Args:
            query: 问题
            conversation_history: 对话历史
            context_info: 上下文信息
        
        Returns:
            str: 改写后的问题
        '''
        instruction = """
你是一个模糊指代型问题重写专家。请分析用户问题中的指代词（它、这个、那个、此、该等），
结合对话历史和上下文信息，将指代词替换为具体的内容，使问题变得独立完整。
如果不包含指代词，直接返回原问题。
"""
        prompt = f"""
{instruction}

对话历史：{conversation_history}
上下文信息：{context_info}
用户问题：{query}
"""
        return self.__get_completion(prompt)


    def multi_intent_rewrite_query(self,query,conversation_history) :
        '''多意图型问题重写方法

        Args:
            query: 问题
            conversation_history: 对话历史
        
        Returns:
            list: 拆分后的多个独立问题列表（JSON格式）
        '''
        instruction = """
你是一个多意图型问题重写专家。请分析用户问题中是否包含多个独立的子问题，
如果包含，请将其拆分成多个独立完整的问题，以JSON数组格式返回。
如果不包含多个意图，返回只包含原问题的数组。

返回格式示例：
["问题1", "问题2"]
"""
        prompt = f"""
{instruction}

对话历史：{conversation_history}
用户问题：{query}
"""
        response = self.__get_completion(prompt)
        try:
            return json.loads(response)
        except:
            return [query]


    def rhetorical_rewrite_query(self,query,conversation_history):
        '''反问型问题重写方法

        Args:
            query: 问题
            conversation_history: 对话历史
        
        Returns:
            str: 改写后的正面陈述问题
        '''
        instruction = """
你是一个反问型问题重写专家。请分析用户问题是否为反问句，
如果是反问句，请将其改写为正面的、适合知识库检索的问题。
例如："难道没有处罚吗？" → "处罚措施有哪些？"
如果不是反问句，直接返回原问题。
"""
        prompt = f"""
{instruction}

对话历史：{conversation_history}
用户问题：{query}
"""
        return self.__get_completion(prompt)     


    def auto_rewrite_and_execute(self,query,conversation_history,context_info) :
        
        try: 
            response = self.auto_rewrite_query(query,conversation_history,context_info)
            query_type = response['type']
            if query_type == "上下文依赖型":
                return self.dependence_rewrite_query(query,conversation_history)
            elif query_type == "对比型":
                return self.compare_rewrite_query(query,conversation_history)
            elif query_type == "模糊指代型":
                return self.ambiguous_reference_rewrite_query(query,conversation_history,context_info)
            elif query_type == "多意图型":
                return self.multi_intent_rewrite_query(query,conversation_history)
            elif query_type == "反问型":
                return self.rhetorical_rewrite_query(query,conversation_history)
            else:
                return query
        except Exception as e:
            print(e)
            return query
