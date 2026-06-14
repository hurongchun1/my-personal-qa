"""
LoaderFactory 单元测试
"""

import pytest

from backend.parser.loader_factory import LoaderFactory
from backend.parser.pdf_loader import PDFLoader
from backend.parser.markdown_loader import MarkdownLoader
from backend.parser.html_loader import HtmlLoader
from backend.common.exceptions.business_exception import BusinessException


class TestLoaderFactory:
    """LoaderFactory 测试类"""

    def test_create_pdf_loader(self):
        """测试创建PDF加载器"""
        loader = LoaderFactory.create("pdf")
        assert isinstance(loader, PDFLoader)

    def test_create_markdown_loader(self):
        """测试创建Markdown加载器"""
        loader = LoaderFactory.create("markdown")
        assert isinstance(loader, MarkdownLoader)

    def test_create_html_loader(self):
        """测试创建HTML加载器"""
        loader = LoaderFactory.create("html")
        assert isinstance(loader, HtmlLoader)

    def test_create_htm_loader(self):
        """测试创建HTM加载器（应该返回HtmlLoader）"""
        loader = LoaderFactory.create("htm")
        assert isinstance(loader, HtmlLoader)

    def test_create_unsupported_type(self):
        """测试创建不支持的文件类型"""
        with pytest.raises(BusinessException) as exc_info:
            LoaderFactory.create("txt")
        assert "文件类型不支持" in str(exc_info.value)

    def test_create_case_insensitive(self):
        """测试文件类型大小写不敏感"""
        loader1 = LoaderFactory.create("PDF")
        loader2 = LoaderFactory.create("Pdf")
        loader3 = LoaderFactory.create("pdf")
        assert isinstance(loader1, PDFLoader)
        assert isinstance(loader2, PDFLoader)
        assert isinstance(loader3, PDFLoader)

    def test_get_supported_types(self):
        """测试获取支持的文件类型列表"""
        supported_types = LoaderFactory.get_supported_types()
        assert isinstance(supported_types, list)
        assert "pdf" in supported_types
        assert "markdown" in supported_types
        assert "html" in supported_types
        assert "htm" in supported_types

    def test_get_supported_methods_for_pdf(self):
        """测试获取PDF支持的方法"""
        methods = LoaderFactory.get_supported_methods("pdf")
        assert isinstance(methods, list)
        # PDFLoader 应该有支持的方法
        assert len(methods) > 0

    def test_get_supported_methods_for_markdown(self):
        """测试获取Markdown支持的方法"""
        methods = LoaderFactory.get_supported_methods("markdown")
        assert isinstance(methods, list)
        assert len(methods) > 0

    def test_get_supported_methods_for_html(self):
        """测试获取HTML支持的方法"""
        methods = LoaderFactory.get_supported_methods("html")
        assert isinstance(methods, list)
        assert len(methods) > 0

    def test_get_supported_methods_unsupported_type(self):
        """测试获取不支持文件类型的方法"""
        with pytest.raises(BusinessException):
            LoaderFactory.get_supported_methods("txt")