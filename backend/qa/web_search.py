'''实现联网搜索功能
使用 Serper API 进行 Google 搜索，使用 FireCrawl 进行网页内容抓取

核心逻辑：
1. search(query) -> 调用 Serper API 进行搜索
2. 如果需要内容，使用 FireCrawl /v1/scrape 抓取网页内容
3. 返回统一的 SearchResult 数据结构
'''

import requests
from typing import Optional, List, Dict, Any
from dataclasses import dataclass
from backend.common.logger import logger
from backend.common.config import (
    FIRECRAWL_API_URL, 
    FIRECRAWL_API_KEY, 
    SERPER_API_KEY, 
    SERPER_API_URL
)


# @dataclass 作用是将数据库表映射为一个类
@dataclass
class SearchResult:
    '''搜索结果数据类'''
    title: str
    url: str
    content: str
    description: str


class WebSearch:
    '''联网搜索类'''

    def __init__(self) -> None:
        '''初始化 Serper 和 FireCrawl 客户端'''
        self._serper_available = bool(SERPER_API_KEY)
        self._firecrawl_available = bool(FIRECRAWL_API_KEY)
        
        if self._serper_available:
            logger.info("Serper API 配置成功")
        else:
            logger.warning("Serper API 未配置，搜索功能将不可用")
            
        if self._firecrawl_available:
            logger.info(f"FireCrawl 配置成功, api_url={FIRECRAWL_API_URL}")
        else:
            logger.warning("FireCrawl 未配置，内容抓取功能将不可用")
    
    # 相当于getter方法，获取属性的值，调用的时候直接 web_search.is_available
    @property
    def is_available(self)-> bool:
        '''检查搜索服务是否可用'''
        return self._serper_available or self._firecrawl_available

    def _serper_search(self, query: str, limit: int = 5) -> List[Dict[str, Any]]:
        '''
        使用 Serper API 进行 Google 搜索
        
        Args:
            query: 搜索查询
            limit: 返回结果数量限制
            
        Returns:
            搜索结果列表
        '''
        if not self._serper_available:
            logger.error("Serper API 不可用")
            return []
        
        try:
            headers = {
                'X-API-KEY': SERPER_API_KEY,
                'Content-Type': 'application/json'
            }
            
            payload = {
                'q': query,
                'num': limit
            }
            
            response = requests.post(
                SERPER_API_URL,
                headers=headers,
                json=payload,
                timeout=10
            )
            response.raise_for_status()
            
            data = response.json()
            results = []
            
            # Serper API 返回格式: { "organic": [...] }
            for item in data.get('organic', [])[:limit]:
                results.append({
                    'title': item.get('title', ''),
                    'url': item.get('link', ''),
                    'description': item.get('snippet', ''),
                    'position': item.get('position', 0)
                })
            
            logger.info(f"Serper 搜索完成, query={query}, 结果数量={len(results)}")
            return results
            
        except Exception as e:
            logger.error(f"Serper 搜索失败: {e}")
            return []

    def _firecrawl_scrape(self, url: str) -> Optional[str]:
        '''
        使用 FireCrawl 抓取单个网页内容
        
        Args:
            url: 要抓取的网页URL
            
        Returns:
            网页的 Markdown 内容，失败返回 None
        '''
        if not self._firecrawl_available:
            logger.warning("FireCrawl 不可用，跳过内容抓取")
            return None
        
        try:
            headers = {
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {FIRECRAWL_API_KEY}'
            }
            
            payload = {
                'url': url,
                'formats': ['markdown'],
                'timeout': 10000  # 10秒
            }
            
            response = requests.post(
                f"{FIRECRAWL_API_URL}/v1/scrape",
                headers=headers,
                json=payload,
                timeout=15
            )
            response.raise_for_status()
            
            data = response.json()
            
            # FireCrawl v1 返回格式: { "data": { "markdown": "...", ... } }
            if data.get('success'):
                return data.get('data', {}).get('markdown', '')
            
            return None
            
        except Exception as e:
            logger.error(f"FireCrawl 抓取失败 url={url}: {e}")
            return None

    def search(self, query: str, limit: int = 5, with_content: bool = True) -> list[SearchResult]:
        '''
        快速搜索网页内容

        Args:
            query: 搜索查询
            limit: 搜索的数量限制
            with_content: 是否返回网页内容
        return :
            搜索结果列表
        '''
        if not self._serper_available:
            logger.error("搜索服务不可用：Serper API 未配置")
            return []

        # 第一步：使用 Serper API 搜索
        search_results = self._serper_search(query, limit)
        
        if not search_results:
            logger.warning(f"搜索无结果: {query}")
            return []
        
        results = []
        
        for item in search_results:
            title = item.get('title', '')
            url = item.get('url', '')
            description = item.get('description', '')
            content = ""
            
            # 第二步：如果需要内容，使用 FireCrawl 抓取
            if with_content and self._firecrawl_available:
                scraped_content = self._firecrawl_scrape(url)
                if scraped_content:
                    content = scraped_content
            
            results.append(SearchResult(
                title=title,
                url=url,
                content=content,
                description=description
            ))
        
        logger.info(f"搜索完成, query={query}, 结果数量={len(results)}")
        return results
        
    def get_context_for_query(
        self,
        query:str,
        max_result:int = 3,
        max_per_source: int = 2000, # 单个来源最大字符数
        max_total: int = 6000 # 所有来源总字符上限
        ) -> str: 
        '''
        查询上下文内容，用于 RAG 增强

        Args:
            query: 搜索查询
            max_result: 最大结果数
            max_per_source:  单个来源最大字符数(防止单个网页内容太长，把token都吃掉)
            max_total:  所有来源总字符上限(留够token给prompt和回答)
        
        为什么默认选择这些呢？
        2000字符/源（max_per_source） ≈ 500-800个中文字, 足够覆盖一个网页的核心内容
        6000总字符（max_total） ≈ 3个来源 × 2000字符, 加上 prompt 模板和回答，一般不会超过模型上下文窗口
        
        Returns:
            合并后的上下文文本
        '''
        results = self.search(query=query,limit=max_result,with_content=True)

        if not  results:
            logger.warning(f"联网搜索无结果: query={query}")
            return ""

        # 打印搜索结果摘要
        logger.info(f"=== 联网搜索结果摘要 ===")
        logger.info(f"查询: {query}")
        logger.info(f"结果数量: {len(results)}")
        for i, result in enumerate(results, 1):
            content = result.content if result.content else result.description
            content_preview = content[:100] + "..." if content and len(content) > 100 else content
            logger.info(f"  [{i}] {result.title}")
            logger.info(f"      URL: {result.url}")
            logger.info(f"      内容预览: {content_preview}")
        logger.info(f"========================")

        context_parts = []
        total_length = 0

        for i,result in enumerate(results,1):
            # 如果没有抓取到内容，使用描述作为备选
            content = result.content if result.content else result.description
            
            if not content:
                logger.warning(f"结果 [{i}] 无内容，跳过: {result.title}")
                continue

            # 第一层：单个来源截取
            if len(content) > max_per_source: 
                content = content[:max_per_source] + "..."
            
            # 第二层：总长度控制
            remaining  = max_total - total_length
            if remaining <= 0:
                break
            
            if len(content) > remaining:
                content = content[:remaining] + "..."
            
            context_parts.append(f"[来源{i}: {result.title}]\n{content}")
            total_length += len(content)
        
        context = "\n\n---\n\n".join(context_parts)
        return context

            
# 全局单例
_web_search_instance: Optional[WebSearch] = None

def get_web_search_instance() -> WebSearch:
    '''获取 WebSearch 单例实例'''
    global _web_search_instance
    if _web_search_instance is None:
        _web_search_instance = WebSearch()
    return _web_search_instance