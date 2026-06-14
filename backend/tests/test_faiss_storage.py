"""
FaissStorage 单元测试 (pytest风格)
"""

import pytest
import os
import shutil
from unittest.mock import MagicMock, patch

from backend.storage.faiss_storage import FaissStorage


class TestFaissStorage:
    """FaissStorage 测试类"""

    @pytest.fixture
    def mock_faiss_path(self, temp_dir):
        """模拟的FAISS存储路径"""
        return os.path.join(temp_dir, "faiss_test")

    @pytest.fixture
    def storage(self, mock_faiss_path):
        """创建FaissStorage实例"""
        with patch('backend.storage.faiss_storage.FAISS_PATH', mock_faiss_path):
            storage = FaissStorage()
            yield storage

    def test_init(self, storage):
        """测试初始化"""
        assert storage is not None
        assert storage._vector_store is None

    def test_load_vector_store_no_cache(self, storage, mock_faiss_path):
        """测试加载向量库（无缓存）"""
        # 确保路径不存在
        if os.path.exists(mock_faiss_path):
            shutil.rmtree(mock_faiss_path)
        
        result = storage._load_vector_store()
        assert result is None

    def test_load_vector_store_with_cache(self, storage):
        """测试加载向量库（有缓存）"""
        # 模拟已缓存的向量库
        mock_vector_store = MagicMock()
        storage._vector_store = mock_vector_store
        
        result = storage._load_vector_store()
        assert result == mock_vector_store

    @patch('backend.storage.faiss_storage.FAISS')
    @patch('backend.storage.faiss_storage.dashscope_embedding')
    def test_add_chunks_new(self, mock_embedding, mock_faiss, storage, mock_faiss_path):
        """测试添加分块（新建向量库）"""
        # 模拟解析文档
        with patch.object(storage, '_parse_document', return_value=["chunk1", "chunk2"]):
            # 模拟FAISS.from_texts
            mock_vector_store = MagicMock()
            mock_faiss.from_texts.return_value = mock_vector_store
            
            # 执行测试
            result, ids = storage.add_chunks("pdf", "character", "test.pdf")
            
            # 验证
            assert result is not None
            assert len(ids) == 2
            mock_faiss.from_texts.assert_called_once()

    @patch('backend.storage.faiss_storage.FAISS')
    @patch('backend.storage.faiss_storage.dashscope_embedding')
    def test_add_chunks_existing(self, mock_embedding, mock_faiss, storage, mock_faiss_path):
        """测试添加分块（追加到现有向量库）"""
        # 模拟解析文档
        with patch.object(storage, '_parse_document', return_value=["chunk1", "chunk2"]):
            # 模拟已存在的向量库
            mock_vector_store = MagicMock()
            storage._vector_store = mock_vector_store
            
            # 执行测试
            result, ids = storage.add_chunks("pdf", "character", "test.pdf")
            
            # 验证
            assert result is not None
            assert len(ids) == 2
            mock_vector_store.add_texts.assert_called_once()

    def test_delete_chunks_no_vector_store(self, storage):
        """测试删除分块（无向量库）"""
        with patch.object(storage, '_load_vector_store', return_value=None):
            result = storage.delete_chunks(["id1", "id2"])
            assert result is False

    def test_delete_chunks_success(self, storage):
        """测试删除分块成功"""
        mock_vector_store = MagicMock()
        mock_vector_store.delete.return_value = True
        
        with patch.object(storage, '_load_vector_store', return_value=mock_vector_store):
            result = storage.delete_chunks(["id1", "id2"])
            assert result is True
            mock_vector_store.delete.assert_called_once_with(["id1", "id2"])

    def test_delete_chunks_failure(self, storage):
        """测试删除分块失败"""
        mock_vector_store = MagicMock()
        mock_vector_store.delete.return_value = False
        
        with patch.object(storage, '_load_vector_store', return_value=mock_vector_store):
            result = storage.delete_chunks(["id1", "id2"])
            assert result is False

    def test_update_chunks_no_vector_store(self, storage):
        """测试更新分块（无向量库）"""
        with patch.object(storage, '_load_vector_store', return_value=None):
            result = storage.update_chunks(["id1"], ["new_text"], None)
            assert result is False

    def test_update_chunks_success(self, storage):
        """测试更新分块成功"""
        mock_vector_store = MagicMock()
        mock_vector_store.delete.return_value = True
        
        with patch.object(storage, '_load_vector_store', return_value=mock_vector_store):
            result = storage.update_chunks(["id1"], ["new_text"], None)
            assert result is True
            mock_vector_store.delete.assert_called_once_with(ids=["id1"])
            mock_vector_store.add_texts.assert_called_once()

    def test_search_no_vector_store(self, storage):
        """测试搜索（无向量库）"""
        with patch.object(storage, '_load_vector_store', return_value=None):
            results = storage.search("test query")
            assert results == []

    def test_search_success(self, storage):
        """测试搜索成功"""
        mock_vector_store = MagicMock()
        mock_results = [(MagicMock(), 0.9), (MagicMock(), 0.8)]
        mock_vector_store.similarity_search_with_score.return_value = mock_results
        
        with patch.object(storage, '_load_vector_store', return_value=mock_vector_store):
            results = storage.search("test query", k=2)
            assert len(results) == 2
            mock_vector_store.similarity_search_with_score.assert_called_once_with("test query", 2)

    def test_search_with_exception(self, storage):
        """测试搜索异常处理"""
        with patch.object(storage, '_load_vector_store', side_effect=Exception("Test error")):
            results = storage.search("test query")
            assert results == []