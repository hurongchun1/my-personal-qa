"""
TokenSplitter 单元测试
"""

import pytest

from backend.parser.splitter.token_spliter import TokenSplitter
from backend.parser.splitter.base_splitter import ParamInfo


class TestTokenSplitter:
    """TokenSplitter 测试类"""

    def test_get_name(self):
        """测试获取分割器名称"""
        splitter = TokenSplitter(chunk_size=512, chunk_overlap=20)
        assert splitter.get_name() == "Token"

    def test_get_label(self):
        """测试获取分割器标签"""
        splitter = TokenSplitter(chunk_size=512, chunk_overlap=20)
        assert splitter.get_label() == "按照token切分"

    def test_get_params(self):
        """测试获取分割器参数信息"""
        splitter = TokenSplitter(chunk_size=512, chunk_overlap=20)
        params = splitter.get_params()
        assert isinstance(params, list)
        assert len(params) == 2
        
        # 检查参数信息
        param_names = [p.name for p in params]
        assert "chunk_size" in param_names
        assert "chunk_overlap" in param_names
        
        # 检查参数详情
        for param in params:
            assert isinstance(param, ParamInfo)
            assert param.type == "int"
            assert param.required is True

    def test_split_basic(self, sample_text):
        """测试基本分割功能"""
        splitter = TokenSplitter(chunk_size=100, chunk_overlap=20)
        chunks = splitter.split(sample_text)
        
        assert isinstance(chunks, list)
        assert len(chunks) > 0

    def test_split_short_text(self, short_text):
        """测试分割短文本"""
        splitter = TokenSplitter(chunk_size=100, chunk_overlap=20)
        chunks = splitter.split(short_text)
        
        assert isinstance(chunks, list)
        assert len(chunks) == 1
        assert chunks[0] == short_text

    def test_split_empty_text(self):
        """测试分割空文本"""
        splitter = TokenSplitter(chunk_size=100, chunk_overlap=20)
        chunks = splitter.split("")
        
        assert isinstance(chunks, list)
        assert len(chunks) == 0

    def test_split_large_chunk_size(self, sample_text):
        """测试大chunk_size分割"""
        splitter = TokenSplitter(chunk_size=1000, chunk_overlap=50)
        chunks = splitter.split(sample_text)
        
        assert isinstance(chunks, list)
        # 大chunk_size应该产生较少的chunks
        assert len(chunks) <= 2

    def test_split_small_chunk_size(self, sample_text):
        """测试小chunk_size分割"""
        splitter = TokenSplitter(chunk_size=20, chunk_overlap=5)
        chunks = splitter.split(sample_text)
        
        assert isinstance(chunks, list)
        # 小chunk_size应该产生较多的chunks
        assert len(chunks) > 3

    def test_split_preserves_content(self, sample_text):
        """测试分割后内容完整性"""
        splitter = TokenSplitter(chunk_size=100, chunk_overlap=20)
        chunks = splitter.split(sample_text)
        
        # 合并所有chunks
        merged = "".join(chunks)
        
        # 检查原始文本中的关键内容都被保留
        assert "人工智能" in merged
        assert "机器学习" in merged
        assert "深度学习" in merged

    def test_split_different_chunk_sizes(self, sample_text):
        """测试不同chunk_size产生不同结果"""
        splitter1 = TokenSplitter(chunk_size=50, chunk_overlap=10)
        splitter2 = TokenSplitter(chunk_size=100, chunk_overlap=20)
        
        chunks1 = splitter1.split(sample_text)
        chunks2 = splitter2.split(sample_text)
        
        # 较小的chunk_size应该产生更多的chunks
        assert len(chunks1) >= len(chunks2)

    def test_split_with_chinese_text(self):
        """测试中文文本分割"""
        chinese_text = "人工智能是计算机科学的一个分支。它企图了解智能的实质，并生产出一种新的能以人类智能相似的方式做出反应的智能机器。"
        splitter = TokenSplitter(chunk_size=50, chunk_overlap=10)
        chunks = splitter.split(chinese_text)
        
        assert isinstance(chunks, list)
        assert len(chunks) > 0
        
        # 合并后应该包含原始内容
        merged = "".join(chunks)
        assert "人工智能" in merged
        assert "智能机器" in merged