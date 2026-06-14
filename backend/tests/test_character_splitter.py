"""
CharacterSplitter 单元测试
"""

import pytest

from backend.parser.splitter.character_splitter import CharacterSplitter
from backend.parser.splitter.base_splitter import ParamInfo


class TestCharacterSplitter:
    """CharacterSplitter 测试类"""

    def test_get_name(self):
        """测试获取分割器名称"""
        splitter = CharacterSplitter(chunk_size=512, chunk_overlap=20)
        assert splitter.get_name() == "character"

    def test_get_label(self):
        """测试获取分割器标签"""
        splitter = CharacterSplitter(chunk_size=512, chunk_overlap=20)
        assert splitter.get_label() == "基于字符进行分割"

    def test_get_params(self):
        """测试获取分割器参数信息"""
        splitter = CharacterSplitter(chunk_size=512, chunk_overlap=20)
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
        splitter = CharacterSplitter(chunk_size=100, chunk_overlap=20)
        chunks = splitter.split(sample_text)
        
        assert isinstance(chunks, list)
        assert len(chunks) > 0
        
        # 检查每个chunk的大小
        for chunk in chunks:
            assert len(chunk) <= 100 + 20  # 允许一些重叠

    def test_split_short_text(self, short_text):
        """测试分割短文本"""
        splitter = CharacterSplitter(chunk_size=100, chunk_overlap=20)
        chunks = splitter.split(short_text)
        
        assert isinstance(chunks, list)
        assert len(chunks) == 1
        assert chunks[0] == short_text

    def test_split_empty_text(self):
        """测试分割空文本"""
        splitter = CharacterSplitter(chunk_size=100, chunk_overlap=20)
        chunks = splitter.split("")
        
        assert isinstance(chunks, list)
        assert len(chunks) == 0

    def test_split_large_chunk_size(self, sample_text):
        """测试大chunk_size分割"""
        splitter = CharacterSplitter(chunk_size=1000, chunk_overlap=50)
        chunks = splitter.split(sample_text)
        
        assert isinstance(chunks, list)
        # 大chunk_size应该产生较少的chunks
        assert len(chunks) <= 2

    def test_split_small_chunk_size(self, sample_text):
        """测试小chunk_size分割"""
        splitter = CharacterSplitter(chunk_size=20, chunk_overlap=5)
        chunks = splitter.split(sample_text)
        
        assert isinstance(chunks, list)
        # 小chunk_size应该产生较多的chunks
        assert len(chunks) > 3

    def test_split_overlap(self):
        """测试重叠功能"""
        text = "A" * 100  # 100个A
        splitter = CharacterSplitter(chunk_size=30, chunk_overlap=10)
        chunks = splitter.split(text)
        
        assert isinstance(chunks, list)
        assert len(chunks) > 1
        
        # 检查重叠
        for i in range(len(chunks) - 1):
            # 相邻chunks应该有重叠
            assert chunks[i][-10:] == chunks[i+1][:10]

    def test_split_preserves_content(self, sample_text):
        """测试分割后内容完整性"""
        splitter = CharacterSplitter(chunk_size=100, chunk_overlap=20)
        chunks = splitter.split(sample_text)
        
        # 合并所有chunks
        merged = "".join(chunks)
        
        # 检查原始文本中的关键内容都被保留
        assert "人工智能" in merged
        assert "机器学习" in merged
        assert "深度学习" in merged