"""
Pytest 共享 fixtures
"""

import os
import sys
import tempfile
import pytest

# 添加项目根目录到 Python 路径（backend 的父目录，使得 `from backend.xxx` 可用）
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, PROJECT_ROOT)


@pytest.fixture
def sample_text():
    """示例文本，用于测试分割器"""
    return """
    这是一个测试文本，用于验证文本分割器的功能。
    
    第一段内容：人工智能（AI）是计算机科学的一个分支，它企图了解智能的实质，
    并生产出一种新的能以人类智能相似的方式做出反应的智能机器。
    
    第二段内容：机器学习是人工智能的一个重要分支，它使计算机能够从数据中学习，
    而无需进行明确的编程。
    
    第三段内容：深度学习是机器学习的一个子集，它使用神经网络来模拟人类大脑的工作方式。
    """


@pytest.fixture
def short_text():
    """短文本，用于测试边界情况"""
    return "这是一个短文本。"


@pytest.fixture
def temp_dir():
    """临时目录，用于测试文件操作"""
    with tempfile.TemporaryDirectory() as tmpdir:
        yield tmpdir


@pytest.fixture
def sample_pdf_path():
    """示例PDF文件路径"""
    pdf_path = os.path.join(PROJECT_ROOT, "backend", "doc", "浦发上海浦东发展银行西安分行个金客户经理考核办法.pdf")
    if os.path.exists(pdf_path):
        return pdf_path
    pytest.skip(f"测试PDF文件不存在: {pdf_path}")


@pytest.fixture
def sample_markdown_content():
    """示例Markdown内容"""
    return """
# 测试标题

## 第一节

这是一个测试段落，包含一些**加粗**文本和*斜体*文本。

## 第二节

- 列表项1
- 列表项2
- 列表项3

```python
def hello():
    print("Hello, World!")
```
"""


@pytest.fixture
def sample_html_content():
    """示例HTML内容"""
    return """
<!DOCTYPE html>
<html>
<head>
    <title>测试页面</title>
</head>
<body>
    <h1>标题</h1>
    <p>这是一个段落。</p>
    <ul>
        <li>列表项1</li>
        <li>列表项2</li>
    </ul>
</body>
</html>
"""


@pytest.fixture
def mock_faiss_path(temp_dir):
    """模拟的FAISS存储路径"""
    return os.path.join(temp_dir, "faiss_test")