# My Personal QA - 个人知识库问答系统

基于 RAG (Retrieval-Augmented Generation) 技术的个人知识库问答系统，支持多种文档格式的解析和智能问答。

## 功能特性

- **多格式文档支持**：PDF、HTML、Markdown
- **多种分块策略**：
  - 字符分割（RecursiveCharacterTextSplitter）
  - Token 分割（TokenTextSplitter）
  - 语义分割（SemanticChunker）
  - Markdown 格式分割（MarkdownTextSplitter）
  - HTML 结构分割（HTMLHeaderTextSplitter）
- **多向量库支持**：
  - FAISS（本地向量数据库）
  - Elasticsearch（分布式搜索引擎）
- **智能问答**：基于阿里云 DashScope 的大语言模型
- **解耦架构**：策略模式 + 工厂模式，易于扩展

## 项目结构

```
my-personal-qa/
├── config.py              # 配置文件（API Key、模型配置）
├── main.py                # 主程序入口（FastAPI 启动）
├── rag_engine.py          # RAG 引擎
├── query_rewriter.py      # 问题重写器
├── requirements.txt       # 依赖包
├── test_api.py            # API 测试脚本
├── api/                   # FastAPI API 模块
│   ├── __init__.py
│   ├── app.py             # FastAPI 主应用
│   ├── models.py          # 数据模型定义
│   ├── dependencies.py    # 依赖项管理
│   └── routers/           # 路由模块
│       ├── __init__.py
│       └── query.py       # 问答路由
├── doc/                   # 文档存放目录
│   └── *.pdf
├── faiss/                 # FAISS 向量索引
│   ├── index.faiss
│   └── index.pkl
├── parser/                # 文档解析器
│   ├── __init__.py
│   ├── base_loader.py     # 基类
│   ├── pdf_loader.py      # PDF 解析器
│   ├── html_loader.py     # HTML 解析器
│   └── markdown_loader.py # Markdown 解析器
└── storage/               # 存储层
    ├── __init__.py         # 包导出
    ├── base_storage.py     # 向量库抽象基类
    ├── faiss_storage.py    # FAISS 实现
    ├── elasticsearch_storage.py  # Elasticsearch 实现
    └── storage_factory.py  # 向量库工厂类
```

## 核心设计

### 1. 解析器架构

采用策略模式，每种文件类型对应一个解析器类：

```
BaseLoader (基类)
├── PDFLoader
├── HtmlLoader
└── MarkdownLoader
```

### 2. 向量库架构

采用**抽象工厂模式**，支持多种向量库：

```
VectorStorage (抽象基类)
├── FaissStorage (FAISS 实现)
└── ElasticsearchStorage (Elasticsearch 实现)

StorageFactory (工厂类)
```

### 3. 解耦的调度机制

使用双重字典映射，避免 if-else：

```python
# 文件类型 -> 解析器类
LOADER_MAP = {
    "pdf": PDFLoader,
    "markdown": MarkdownLoader,
    "md": MarkdownLoader,      # 别名
    "html": HtmlLoader,
    "htm": HtmlLoader,         # 别名
}

# 文件类型 -> 分块方法 -> 具体实现
METHOD_MAP = {
    "pdf": {
        "default": lambda loader, source, **kw: loader.parse(...),
        "token": lambda loader, source, **kw: loader.token_text_parser(...),
        "semantic": lambda loader, source, **kw: loader.semantic_text_parser(...),
    },
    # ... 其他类型
}
```

### 4. 懒加载 + 缓存

解析器只在首次使用时创建，并缓存后续复用：

```python
def get_loader(self, file_type):
    if file_type in self._loaders:
        return self._loaders[file_type]  # 缓存命中
    loader = LOADER_MAP[file_type]()
    self._loaders[file_type] = loader    # 缓存
    return loader
```

### 5. 工厂模式

通过工厂类创建不同的向量库实例：

```python
from storage import StorageFactory

# 创建 FAISS 向量库
faiss_storage = StorageFactory.create_storage("faiss")

# 创建 Elasticsearch 向量库
es_storage = StorageFactory.create_storage("elasticsearch")

# 使用方式完全相同
faiss_storage.add_chunks("pdf", "default", "test.pdf")
es_storage.add_chunks("pdf", "default", "test.pdf")
```

## 快速开始

### 1. 环境准备

```bash
# 创建虚拟环境
python -m venv venv

# 激活虚拟环境
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt
```

### 2. 配置 API Key

设置环境变量 `DASHSCOPE_API_KEY`：

```bash
# Windows
set DASHSCOPE_API_KEY=your_api_key_here

# Linux/Mac
export DASHSCOPE_API_KEY=your_api_key_here
```

或创建 `.env` 文件：

```
DASHSCOPE_API_KEY=your_api_key_here
```

### 3. 配置 Elasticsearch（可选）

如果使用 Elasticsearch，设置以下环境变量：

```bash
# Windows
set ES_HOST=http://localhost:9200
set ES_INDEX_NAME=my-personal-qa

# Linux/Mac
export ES_HOST=http://localhost:9200
export ES_INDEX_NAME=my-personal-qa
```

### 4. 使用示例

```python
from storage import StorageFactory

# 创建向量库实例（自动选择 FAISS 或 Elasticsearch）
storage = StorageFactory.create_storage("faiss")  # 或 "elasticsearch"

# 添加文档到向量库
storage.add_chunks(
    file_type="pdf",
    method="default",
    source="doc/example.pdf",
    chunk_size=512,
    chunk_overlap=50
)

# 搜索相似内容
results = storage.search("查询内容", k=3)
for doc in results:
    print(doc.page_content)
```

## 支持的分块方法

| 文件类型 | 方法名 | 说明 |
|---------|--------|------|
| PDF | `default` | 按字符数分割（默认） |
| PDF | `token` | 按 Token 数量分割 |
| PDF | `semantic` | 基于语义理解分割 |
| HTML | `default` | HTML 结构分割（默认） |
| HTML | `character` | 按字符数分割 |
| HTML | `semantic` | 语义分割 |
| Markdown | `default` | 按字符数分割（默认） |
| Markdown | `token` | 按 Token 数量分割 |
| Markdown | `semantic` | 语义分割 |

## 技术栈

- **LangChain**：文本分割、嵌入模型
- **FAISS**：本地向量数据库
- **Elasticsearch**：分布式搜索引擎
- **DashScope**：阿里云 AI 服务（嵌入 + LLM）
- **PyPDF2**：PDF 解析
- **BeautifulSoup**：HTML 解析
- **Rich**：终端美化输出

## 开发进度

### 已完成

- [x] **文档解析器** (`parser/`)
  - [x] `BaseLoader` 基类定义
  - [x] `PDFLoader` - PDF 文档解析
  - [x] `HtmlLoader` - HTML 网页解析
  - [x] `MarkdownLoader` - Markdown 文档解析
  - [x] `__init__.py` - 统一导入管理

- [x] **存储层** (`storage/`)
  - [x] `VectorStorage` - 向量库抽象基类
  - [x] `FaissStorage` - FAISS 向量存储管理（add/delete/update/search）
  - [x] `ElasticsearchStorage` - Elasticsearch 向量存储管理
  - [x] `StorageFactory` - 向量库工厂类
  - [x] 懒加载 + 缓存机制
  - [x] 解耦的分块方法调度（字典映射）

- [x] **RAG 引擎** (`rag_engine.py`)
  - [x] 向量检索逻辑
  - [x] 上下文组装
  - [x] Prompt 模板设计
  - [x] LLM 调用封装（DashScope）

- [x] **查询改写** (`query_rewriter.py`)
  - [x] 问题类型分类（5种类型）
  - [x] 上下文依赖型重写
  - [x] 对比型重写
  - [x] 模糊指代型重写
  - [x] 多意图型重写
  - [x] 反问型重写
  - [x] 自动判断调度器

- [x] **FastAPI API** (`api/`)
  - [x] FastAPI 应用配置 (`app.py`)
  - [x] 数据模型定义 (`models.py`)
  - [x] 依赖项管理 (`dependencies.py`)
  - [x] 问答路由 (`routers/query.py`)
  - [x] 简单问答接口 (`/api/ask`)
  - [x] 重写问答接口 (`/api/rewrite-ask`)
  - [x] 问题分类接口 (`/api/classify`)
  - [x] 健康检查接口 (`/health`)
  - [x] API 文档自动生成 (`/docs`)

- [x] **配置** (`config.py`)
  - [x] API Key 配置
  - [x] 模型配置（Embedding + LLM）
  - [x] 路径配置
  - [x] Elasticsearch 配置
  - [x] 存储类型配置

- [x] **测试** (`tests/`)
  - [x] `test_faiss_storage.py` - FAISS 存储集成测试
  - [x] `test_rag_engine.py` - RAG 引擎集成测试
  - [x] `test_api.py` - API 接口测试

- [x] **文档**
  - [x] README.md
  - [x] API 结构说明 (`api/README.md`)

### 待完成

- [ ] **主程序** (`main.py`)
  - [ ] 交互式问答界面
  - [ ] 命令行参数支持
  - [ ] 文档导入流程
  - [ ] 问答流程整合

- [ ] **知识库管理**
  - [ ] 文档增删改查
  - [ ] 向量索引更新
  - [ ] 文档元数据管理
  - [ ] 分块内容与ID关联存储（数据库）

- [ ] **高级功能**
  - [ ] 多轮对话支持
  - [ ] 对话历史管理
  - [ ] 检索结果排序优化
  - [ ] 回答质量评估
  - [ ] 用户认证和权限管理
  - [ ] 接口限流和缓存

## 扩展指南

### 添加新的文件类型

1. 在 `parser/` 下创建新的解析器类，继承 `BaseLoader`
2. 在 `storage/base_storage.py` 的 `LOADER_MAP` 中添加映射
3. 在 `METHOD_MAP` 中添加对应的分块方法

```python
# 示例：添加 Word 文档支持
from parser.word_loader import WordLoader

LOADER_MAP["docx"] = WordLoader

METHOD_MAP["docx"] = {
    "default": lambda loader, source, **kw: loader.parse(...),
    # ... 其他方法
}
```

### 添加新的向量库

1. 在 `storage/` 下创建新的存储类，继承 `VectorStorage`
2. 实现 `add_chunks()` 和 `search()` 方法
3. 在 `storage/storage_factory.py` 的 `SUPPORTED_TYPES` 中添加映射

```python
# 示例：添加 Milvus 支持
from storage.milvus_storage import MilvusStorage

SUPPORTED_TYPES = {
    "faiss": FaissStorage,
    "elasticsearch": ElasticsearchStorage,
    "es": ElasticsearchStorage,
    "milvus": MilvusStorage,  # 新增
}
```

## License

MIT
