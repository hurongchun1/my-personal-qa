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
- **文档管理**：支持文档上传、解析、存储
- **解耦架构**：策略模式 + 工厂模式，易于扩展

## 项目结构

```
my-personal-qa/
├── frontend/              # 前端项目（待开发）
├── backend/               # 后端 API 项目
│   ├── api/               # FastAPI API 模块
│   │   ├── __init__.py
│   │   ├── app.py         # FastAPI 主应用
│   │   ├── models.py      # 数据模型定义
│   │   ├── dependencies.py # 依赖项管理（RAGEngine 单例、数据库连接）
│   │   └── routers/       # 路由模块
│   │       ├── __init__.py
│   │       ├── query.py       # 问答路由（简单问答、重写问答）
│   │       └── documents.py   # 文档管理路由（上传、类型查询）
│   ├── common/            # 公共模块
│   │   ├── __init__.py
│   │   ├── constant.py    # 常量定义（Storage、ResultCode、ResultMsg）
│   │   ├── result_info.py # 统一响应格式
│   │   └── exceptions/        # 异常类子包
│   │       ├── __init__.py    # 统一导出
│   │       └── rag.py         # RAG 模块异常类
│   ├── database/          # 数据库模块
│   │   ├── __init__.py
│   │   └── connection.py  # SQLite 数据库连接管理
│   ├── storage/           # 存储层
│   │   ├── __init__.py
│   │   ├── base_storage.py       # 向量库抽象基类
│   │   ├── faiss_storage.py      # FAISS 向量存储
│   │   ├── elasticsearch_storage.py # Elasticsearch 向量存储
│   │   └── storage_factory.py    # 向量库工厂类
│   ├── parser/            # 文档解析器
│   │   ├── __init__.py
│   │   ├── base_loader.py      # 解析器基类
│   │   ├── pdf_loader.py       # PDF 解析
│   │   ├── html_loader.py      # HTML 解析
│   │   └── markdown_loader.py  # Markdown 解析
│   ├── sql/
│   │   └── ddl.sql        # 数据库建表语句
│   ├── doc/               # 文档存放目录
│   ├── faiss/             # FAISS 向量索引
│   ├── tests/             # 测试模块
│   ├── config.py          # 配置文件（API Key、模型配置、数据库路径）
│   ├── main.py            # 主程序入口
│   ├── rag_engine.py      # RAG 引擎
│   ├── query_rewriter.py  # 问题重写器
│   └── requirements.txt   # 依赖包
├── README.md
└── venv/                  # Python 虚拟环境
```

## 快速开始

### 1. 环境准备

```bash
# 进入项目根目录
cd my-personal-qa

# 创建虚拟环境
python -m venv venv

# 激活虚拟环境
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

# 安装依赖
pip install -r backend/requirements.txt
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

### 3. 启动服务

```bash
# 方式一：在 backend 目录启动
cd backend
python main.py

# 方式二：在项目根目录启动
python -m backend.main
```

启动后访问：
- `http://localhost:8000/` — 欢迎页面
- `http://localhost:8000/health` — 健康检查
- `http://localhost:8000/docs` — Swagger API 文档

## API 接口

### 问答接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/query/simple_chat` | 简单问答（直接检索回答） |
| POST | `/api/query/rewritten_chat` | 重写问答（先改写问题再检索） |

### 文档管理接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/documents/supported-types` | 获取支持的文件类型 |
| POST | `/api/documents/upload` | 上传文档到知识库 |

### 系统接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/` | 欢迎页面 |
| GET | `/health` | 健康检查 |

## 核心设计

### 1. 包导入规范

项目统一使用**相对导入**，`main.py` 负责设置 `sys.path`：

```python
# main.py - 唯一的路径入口
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
```

相对导入层级规则（从当前文件往上数包层级）：

```
backend/storage/xxx.py    → 用 .. 回到 backend
backend/api/xxx.py        → 用 .. 回到 backend
backend/api/routers/xxx.py → 用 ... 回到 backend
```

### 2. 解析器架构

采用策略模式，每种文件类型对应一个解析器类：

```
BaseLoader (基类)
├── PDFLoader
├── HtmlLoader
└── MarkdownLoader
```

### 3. 向量库架构

采用**抽象工厂模式**，支持多种向量库：

```
VectorStorage (抽象基类)
├── FaissStorage (FAISS 实现)
└── ElasticsearchStorage (Elasticsearch 实现)

StorageFactory (工厂类)
```

### 4. 数据库层

使用 SQLite 存储文档元数据：

```sql
-- 文档表
CREATE TABLE documents (
    id TEXT PRIMARY KEY,
    filename TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    chunk_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
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

- **FastAPI**：Web 框架
- **LangChain**：文本分割、嵌入模型
- **FAISS**：本地向量数据库
- **Elasticsearch**：分布式搜索引擎
- **DashScope**：阿里云 AI 服务（嵌入 + LLM）
- **SQLite**：文档元数据存储
- **PyPDF2**：PDF 解析
- **BeautifulSoup**：HTML 解析
- **python-multipart**：文件上传支持

## 开发进度

### 已完成（2026-06-02）

- [x] **文档解析器** (`parser/`)
  - [x] `BaseLoader` 基类定义
  - [x] `PDFLoader` - PDF 文档解析
  - [x] `HtmlLoader` - HTML 网页解析
  - [x] `MarkdownLoader` - Markdown 文档解析

- [x] **存储层** (`storage/`)
  - [x] `VectorStorage` - 向量库抽象基类
  - [x] `FaissStorage` - FAISS 向量存储管理
  - [x] `ElasticsearchStorage` - Elasticsearch 向量存储管理
  - [x] `StorageFactory` - 向量库工厂类

- [x] **公共模块** (`common/`)
  - [x] `constant.py` - 常量集中管理
  - [x] `result_info.py` - 统一响应格式
  - [x] `exceptions/` - 异常类子包（RAG、API、验证等）

- [x] **数据库模块** (`database/`)
  - [x] `connection.py` - SQLite 连接管理
  - [x] `ddl.sql` - 数据库建表语句

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

- [x] **FastAPI API** (`api/`)
  - [x] 数据模型定义 (`models.py`)
  - [x] 依赖项管理 (`dependencies.py`) - 单例模式
  - [x] 问答路由 (`routers/query.py`)
    - [x] `/query/simple_chat` - 简单问答
    - [x] `/query/rewritten_chat` - 重写问答
  - [x] 文档管理路由 (`routers/documents.py`)
    - [x] `/documents/supported-types` - 支持类型查询
    - [x] `/documents/upload` - 文档上传
  - [x] FastAPI 主应用 (`app.py`)
  - [x] 健康检查接口 (`/health`)

- [x] **包结构修复**
  - [x] 创建所有 `__init__.py` 文件
  - [x] 统一相对导入规范
  - [x] `main.py` sys.path 自动修复
  - [x] `requirements.txt` 补充 python-multipart

### 待完成

#### 文档管理完善

- [ ] 文档列表查询接口（GET `/api/documents`）
- [ ] 文档详情查询接口（GET `/api/documents/{id}`）
- [ ] 文档删除接口（DELETE `/api/documents/{id}`）
- [ ] 上传文档时自动解析并建立向量索引
- [ ] 文档重复上传检测

#### 问答功能完善

- [ ] 对话历史记录存储
- [ ] 多轮对话上下文管理
- [ ] 回答来源追溯（引用原文片段）
- [ ] 流式响应（SSE）

#### 前端项目 (`frontend/`)

- [ ] 用户界面设计
- [ ] 聊天对话界面
- [ ] 文档管理界面
- [ ] 调用后端 API

#### 高级功能

- [ ] 用户认证和权限管理
- [ ] 接口限流和缓存
- [ ] 回答质量评估
- [ ] 系统监控和日志

## 扩展指南

### 添加新的文件类型

1. 在 `parser/` 下创建新的解析器类，继承 `BaseLoader`
2. 在 `common/constant.py` 的 `Constant.Storage` 中添加映射

### 添加新的向量库

1. 在 `storage/` 下创建新的存储类，继承 `VectorStorage`
2. 实现 `add_chunks()` 和 `search()` 方法
3. 在 `storage/storage_factory.py` 的 `SUPPORTED_TYPES` 中添加映射

## License

MIT
