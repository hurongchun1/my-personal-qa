"""
RAGEngine 单元测试 (pytest风格)
"""

import pytest
from unittest.mock import MagicMock, patch

from backend.rag_engine import RAGEngine


class TestRAGEngine:
    """RAGEngine 测试类"""

    @pytest.fixture
    def mock_storage(self):
        """模拟存储"""
        return MagicMock()

    @pytest.fixture
    def engine(self, mock_storage):
        """创建RAGEngine实例"""
        with patch('backend.rag_engine.StorageFactory.create', return_value=mock_storage):
            with patch('backend.rag_engine.LLM_MODEL', 'test-model'):
                engine = RAGEngine()
                yield engine

    def test_init(self, engine, mock_storage):
        """测试初始化"""
        assert engine is not None
        assert engine.storage == mock_storage
        assert hasattr(engine, '_query_rewriter')

    def test_prompt_template(self, engine):
        """测试提示词模板生成"""
        query = "考核办法有哪些？"
        documents = "文档内容测试"
        
        prompt = engine._RAGEngine__prompt_template(query, documents)
        
        assert query in prompt
        assert documents in prompt
        assert "知识库内容" in prompt
        assert "问题" in prompt

    def test_simple_ask(self, engine, mock_storage):
        """测试简单问答功能"""
        # 模拟搜索结果
        mock_doc = MagicMock()
        mock_doc.page_content = "测试文档内容"
        mock_storage.search.return_value = [(mock_doc, 0.9)]
        
        # 模拟dashscope响应
        mock_response = MagicMock()
        mock_response.output.choices = [MagicMock()]
        mock_response.output.choices[0].message.content = "测试答案"
        
        with patch('backend.rag_engine.dashscope.Generation.call', return_value=mock_response):
            answer = engine.simple_ask("测试问题", k=3)
            
            assert answer == "测试答案"
            mock_storage.search.assert_called_once_with("测试问题", k=3)

    def test_simple_ask_no_results(self, engine, mock_storage):
        """测试简单问答（无搜索结果）"""
        mock_storage.search.return_value = []
        
        mock_response = MagicMock()
        mock_response.output.choices = [MagicMock()]
        mock_response.output.choices[0].message.content = "无答案"
        
        with patch('backend.rag_engine.dashscope.Generation.call', return_value=mock_response):
            answer = engine.simple_ask("测试问题", k=3)
            
            assert answer == "无答案"
            mock_storage.search.assert_called_once()

    def test_rewritten_query_ask(self, engine, mock_storage):
        """测试重写问题问答功能"""
        # 模拟查询重写器
        mock_rewriter = MagicMock()
        mock_rewriter.auto_rewrite_and_execute.return_value = "重写后的问题"
        engine._query_rewriter = mock_rewriter
        
        # 模拟搜索结果
        mock_doc = MagicMock()
        mock_doc.page_content = "测试文档内容"
        mock_storage.search.return_value = [(mock_doc, 0.9)]
        
        # 模拟dashscope响应
        mock_response = MagicMock()
        mock_response.output.choices = [MagicMock()]
        mock_response.output.choices[0].message.content = "重写问答答案"
        
        with patch('backend.rag_engine.dashscope.Generation.call', return_value=mock_response):
            answer = engine.rewritten_query_ask(
                query="原始问题",
                conversation_history="对话历史",
                context_info="上下文信息",
                k=3
            )
            
            assert answer == "重写问答答案"
            mock_rewriter.auto_rewrite_and_execute.assert_called_once()
            mock_storage.search.assert_called_once_with("重写后的问题", 3)

    def test_rewritten_query_ask_with_list(self, engine, mock_storage):
        """测试重写问题问答（返回列表）"""
        # 模拟查询重写器返回列表
        mock_rewriter = MagicMock()
        mock_rewriter.auto_rewrite_and_execute.return_value = ["重写问题1", "重写问题2"]
        engine._query_rewriter = mock_rewriter
        
        # 模拟搜索结果
        mock_doc = MagicMock()
        mock_doc.page_content = "测试文档内容"
        mock_storage.search.return_value = [(mock_doc, 0.9)]
        
        # 模拟dashscope响应
        mock_response = MagicMock()
        mock_response.output.choices = [MagicMock()]
        mock_response.output.choices[0].message.content = "列表重写问答答案"
        
        with patch('backend.rag_engine.dashscope.Generation.call', return_value=mock_response):
            answer = engine.rewritten_query_ask(
                query="原始问题",
                conversation_history="对话历史",
                context_info="上下文信息",
                k=3
            )
            
            assert answer == "列表重写问答答案"
            mock_storage.search.assert_called_once_with("重写问题1", 3)

    def test_rewritten_query_ask_empty_list(self, engine, mock_storage):
        """测试重写问题问答（返回空列表）"""
        # 模拟查询重写器返回空列表
        mock_rewriter = MagicMock()
        mock_rewriter.auto_rewrite_and_execute.return_value = []
        engine._query_rewriter = mock_rewriter
        
        # 模拟搜索结果
        mock_doc = MagicMock()
        mock_doc.page_content = "测试文档内容"
        mock_storage.search.return_value = [(mock_doc, 0.9)]
        
        # 模拟dashscope响应
        mock_response = MagicMock()
        mock_response.output.choices = [MagicMock()]
        mock_response.output.choices[0].message.content = "空列表重写问答答案"
        
        with patch('backend.rag_engine.dashscope.Generation.call', return_value=mock_response):
            answer = engine.rewritten_query_ask(
                query="原始问题",
                conversation_history="对话历史",
                context_info="上下文信息",
                k=3
            )
            
            assert answer == "空列表重写问答答案"
            # 空列表时应该使用原始问题
            mock_storage.search.assert_called_once_with("原始问题", 3)