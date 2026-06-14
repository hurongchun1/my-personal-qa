# My Personal QA - 个人知识库问答系统

基于 RAG (Retrieval-Augmented Generation) 技术的个人知识库问答系统，包含后端 API 服务和 React 前端工作台。

## 项目概述

本项目由两个独立但协同工作的子项目组成：

1. **后端 API 项目** (`backend/`) - 基于 FastAPI 的 RAG 引擎，提供文档解析、向量检索和智能问答能力
2. **React 前端项目** (`frontend-react/`) - 基于 React + TypeScript 的"数字员工"工作台，提供现代化的交互界面

两个项目可以独立开发和部署，通过 API 接口进行通信。

## 项目结构

```
my-personal-qa/
├── backend/               # 后端 API 项目（FastAPI + RAG）
├── frontend-react/        # React 前端项目（TypeScript + Tailwind CSS）
├── README.md              # 本文件（项目总览）
└── venv/                  # Python 虚拟环境
```

## 快速开始

### 后端 API 服务

```bash
# 进入后端目录
cd backend

# 创建并激活虚拟环境
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# 安装依赖
pip install -r requirements.txt

# 配置 API Key
set DASHSCOPE_API_KEY=your_api_key_here  # Windows
# export DASHSCOPE_API_KEY=your_api_key_here  # Linux/Mac

# 启动服务
python main.py
```

后端服务启动后：
- API 文档：http://localhost:8000/docs
- 健康检查：http://localhost:8000/health

### React 前端应用

```bash
# 进入前端目录
cd frontend-react

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端应用启动后：
- 开发服务器：http://localhost:5173
- 通过后端访问（需先构建）：http://localhost:8000/app

## 主要功能

### 后端功能
- 多格式文档解析（PDF、HTML、Markdown）
- 多种文本分块策略
- 多向量库支持（FAISS、Elasticsearch）
- 智能问答（基于 DashScope）
- 文档管理 API

### 前端功能
- 数字员工工作台界面
- 实时状态监控
- 对话流交互
- 知识库管理
- 任务看板

## 技术栈

### 后端
- **FastAPI** - Web 框架
- **LangChain** - 文本分割与嵌入
- **FAISS/Elasticsearch** - 向量存储
- **DashScope** - AI 服务
- **SQLite** - 元数据存储

### 前端
- **React 18/19** + **TypeScript**
- **Tailwind CSS** + **Framer Motion**
- **Vite** - 构建工具
- **SSE** - 实时通信

## 详细文档

每个子项目都有独立的 README 文件，包含更详细的文档：

- **后端项目文档**：[backend/README.md](backend/README.md)
- **前端项目文档**：[frontend-react/README.md](frontend-react/README.md)

## 开发指南

### 独立开发

两个项目可以完全独立开发：

1. **后端开发**：专注于 RAG 引擎、API 接口、文档处理
2. **前端开发**：专注于用户界面、交互体验、状态管理

### 联调测试

1. 启动后端服务：`cd backend && python main.py`
2. 启动前端开发服务器：`cd frontend-react && npm run dev`
3. 前端开发服务器会代理 `/api` 请求到后端

### 生产部署

1. 构建前端：`cd frontend-react && npm run build`
2. 启动后端服务：`cd backend && python main.py`
3. 访问 http://localhost:8000/app

## 更新日志

### 2026-06-14 项目结构重构

#### 后端（Backend）

1. **文件结构调整**
   - RAG核心模块 → `backend/rag/`（engine、storage）
   - 知识库模块 → `backend/knowledge_base/`（parser、database、sql）
   - 问答模块 → `backend/qa/`（query_rewriter、web_search）
   - 公共配置 → `backend/common/config.py`

2. **导入路径统一**
   - 所有模块的导入路径已更新并测试通过
   - 配置文件统一从 `backend.common.config` 导入

### 2026-06-04 功能更新

#### 后端（Backend）

1. **修复文档列表接口路由**
   - 将 `GET /documents` 改为 `GET /documents/list_documents`，解决前端 404 问题

2. **新增解析方式支持接口**
   - 新增 `GET /documents/supported-types?file_type=xxx`，根据文件类型返回可用的解析方式列表
   - 返回格式：`[{value: "default", label: "默认分块"}, ...]`

3. **数据库表结构更新**
   - `documents` 表新增 `parse_method` 字段（TEXT，默认值 `'default'`），用于存储每个文档使用的解析方式

4. **上传文档时设置默认解析方式**
   - 上传文档时明确设置 `parse_method = 'default'`，确保数据库中有值

5. **解析方式映射配置（`constant.py`）**
   - `METHOD_MAP`：定义各文件类型支持的解析方法（pdf、html、htm、markdown、md、txt）
   - `METHOD_LABEL`：解析方法中文名称映射（默认分块、Token 分割、语义分割、字符分割）

#### 前端（Frontend）

1. **修复 API 路由**
   - `getDocuments` 调用 `/documents/list_documents` 而非 `/documents`

2. **知识库创建弹窗优化**
   - 创建知识库时，输入框 placeholder 从"例如：天翼云价格知识库"改为"知识库名称"

3. **文档列表新增解析方式列**
   - 每行显示解析方式下拉选择框，支持切换
   - 下拉选项从后端 `supported-types` 接口动态获取，按文件类型显示不同选项

4. **新增启动解析按钮**
   - 每行右侧添加绿色"启动"按钮
   - 点击后弹出参数配置弹窗，支持配置解析参数（分块大小、重叠大小等）
   - 不同解析方式显示不同的参数输入框（语义分割无需参数）

5. **动态解析方式选项获取**
   - `fetchMethodOptions` 函数：根据文件类型从后端获取可用解析方式
   - 缓存机制：已获取的文件类型选项不会重复请求
   - 容错处理：API 失败或返回空时使用默认选项"默认分块"

6. **类型定义更新**
   - `BackendDocument` 接口新增 `parse_method` 字段
   - 新增 `ParseMethodOption` 接口（value + label）

## 相关链接

- [FastAPI 文档](https://fastapi.tiangolo.com/)
- [React 文档](https://react.dev/)
- [Tailwind CSS 文档](https://tailwindcss.com/)
- [Vite 文档](https://vitejs.dev/)
- [DashScope 文档](https://dashscope.aliyun.com/)

## 文档解析重构计划

### 当前实现分析

目前文档解析使用 `METHOD_MAP` 字典（位于 `backend/common/constant.py`），采用策略模式，但存在以下问题：

1. **维护困难**：每个文件类型的解析方法都使用 lambda 函数，参数不一致
2. **可读性差**：lambda 函数内部参数提取复杂，难以理解
3. **扩展性差**：添加新的解析方式需要修改多个地方
4. **参数不一致**：不同解析方法需要不同的参数，导致接口混乱

### 当前架构

```
backend/
├── common/
│   └── constant.py          # METHOD_MAP 字典（待移除）
├── parser/
│   ├── splitter/
│   │   └── base_splitter.py # 元数据类和策略接口
│   ├── base_loader.py       # 抽象基类，统一 parse() 接口
│   ├── pdf_loader.py        # PDF解析器
│   ├── html_loader.py       # HTML解析器
│   ├── markdown_loader.py   # Markdown解析器
│   └── loader_factory.py    # 工厂类，创建解析器实例
├── api/
│   └── routers/
│       └── documents.py     # 文档API端点
└── storage/
    └── base_storage.py      # 存储层，使用 LoaderFactory
```

### 重构目标

将 METHOD_MAP 字典替换为更清晰的架构：

1. **统一接口**：每个解析器实现统一的 `parse()` 方法
2. **自描述解析器**：每个解析器知道自己的支持方法和参数
3. **工厂模式**：通过 `LoaderFactory` 创建解析器，替代字典查找
4. **动态参数**：前端可以动态获取每种解析方式需要的参数

### 重构后架构

#### 1. 元数据类（已实现）

```python
class ParamInfo:
    """参数元信息，用于描述参数配置"""
    name: str          # 参数名称
    label: str         # 参数中文标签
    type: str          # 参数类型（int、string、float）
    default: Any       # 默认值
    required: bool     # 是否必需

class MethodInfo:
    """方法元信息，用于描述解析方法"""
    name: str          # 方法名称
    label: str         # 方法中文标签
    params: List[ParamInfo]  # 参数列表
```

#### 2. TextSplitter 策略接口（已实现）

```python
class TextSplitter(ABC):
    """文本分割策略接口"""
    @abstractmethod
    def split(self, text: str, **kwargs) -> List[str]: pass
    
    @abstractmethod
    def get_name(self) -> str: pass
    
    @abstractmethod
    def get_label(self) -> str: pass
    
    @abstractmethod
    def get_params(self) -> List[ParamInfo]: pass
```

#### 3. BaseLoader 抽象基类（已实现）

```python
class BaseLoader(ABC):
    def __init__(self):
        self._splitter: Dict[str, TextSplitter] = {}
        self._register_splitter()
    
    @abstractmethod
    def _register_splitter(self): pass
    
    @abstractmethod
    def load(self, file_path: str) -> str: pass
    
    def parse(self, method: str, source: str, **kwargs):
        """统一解析接口"""
        text = self.load(file_path=source)
        if method not in self._splitter:
            raise BusinessException.method_not_supported("解析方法不支持")
        splitter = self._splitter[method]
        return splitter.split(text, **kwargs)
    
    def get_supported_methods(self) -> List[MethodInfo]:
        """返回支持的方法列表"""
        result = []
        for s in self._splitter.values():
            info = MethodInfo(
                name=s.get_name(),
                label=s.get_label(),
                params=s.get_params()
            )
            result.append(info)
        return result
```

#### 4. LoaderFactory 工厂类（已实现）

```python
class LoaderFactory:
    _loaders = {
        "pdf": PDFLoader,
        "markdown": MarkdownLoader,
        "html": HtmlLoader,
        "htm": HtmlLoader
    }
    
    @classmethod
    def create(cls, file_type: str) -> BaseLoader:
        """根据文件类型创建解析器实例"""
        if file_type.lower() not in cls._loaders:
            raise BusinessException.file_type_not_supported("文件类型不支持")
        loader_class = cls._loaders[file_type.lower()]
        return loader_class()
    
    @classmethod
    def get_supported_methods(cls, file_type: str):
        """获取文件类型支持的方法"""
        loader = cls.create(file_type)
        return loader.get_supported_methods()
    
    @classmethod
    def get_supported_types(cls):
        """获取支持的文件类型"""
        return list(cls._loaders.keys())
```

#### 5. API 接口（已实现）

**后端 API**：
```python
@router.get("/supported-types")
async def supported_types(file_type: str):
    """获取文件类型支持的解析方法"""
    methods = LoaderFactory.get_supported_methods(file_type)
    # 转换为前端需要的格式
    return ResultInfo.success(data)

@router.post("/parse")
async def parse_document(request: ParseDocumentRequest, db: Connection = Depends(get_db)):
    """执行文档解析"""
    # 1. 获取文档信息
    # 2. 根据文件类型创建解析器
    # 3. 调用解析器统一 parse() 方法
    # 4. 保存解析结果
```

### 已完成内容

#### 第一阶段：统一接口 ✅

1. **元数据类实现** ✅
   - 位置：`backend/parser/splitter/base_splitter.py`
   - 功能：`ParamInfo` 和 `MethodInfo` 类，用于描述参数和方法
   - 作用：前端可动态渲染 UI（输入框、下拉菜单）

2. **TextSplitter 策略接口** ✅
   - 位置：`backend/parser/splitter/base_splitter.py`
   - 功能：抽象策略接口，定义 `split()` 方法
   - 实现：`CharacterSplitter`、`TokenSplitter`、`SemanticSplitter` 具体策略

3. **BaseLoader 抽象基类重构** ✅
   - 位置：`backend/parser/base_loader.py`
   - 功能：统一 `parse()` 接口，集成策略模式
   - 特性：`_splitter` 字典存储策略，`get_supported_methods()` 返回方法信息

4. **具体解析器实现** ✅
   - `PDFLoader`（`backend/parser/pdf_loader.py`）
   - `HtmlLoader`（`backend/parser/html_loader.py`）
   - `MarkdownLoader`（`backend/parser/markdown_loader.py`）
   - 每个解析器实现 `_register_splitter()` 注册支持的策略

5. **LoaderFactory 工厂类** ✅
   - 位置：`backend/parser/loader_factory.py`
   - 功能：根据文件类型创建对应的解析器实例
   - 替代：原 `METHOD_MAP` 字典查找

6. **后端 API 端点实现** ✅
   - `GET /documents/supported-types`：返回文件类型支持的解析方法
   - `POST /documents/parse`：执行文档解析
   - 位置：`backend/api/routers/documents.py`

7. **请求/响应模型** ✅
   - `ParseDocumentRequest`：解析请求模型
   - 位置：`backend/api/models.py`

8. **存储层更新** ✅
   - 更新 `backend/storage/base_storage.py` 使用 `LoaderFactory`
   - 移除对 `METHOD_MAP`、`METHOD_LABEL` 的依赖

9. **文档更新** ✅
   - 位置：`backend/parser/README.md`
   - 内容：完整架构说明、类图、调用流程、API 示例

### 未完成内容

#### 第二阶段：前端集成

1. **前端解析 API 调用** ❌
   - 位置：`frontend/src/components/KnowledgeBaseDetail.tsx` 第 187-189 行
   - 状态：TODO，使用 setTimeout 模拟
   - 需要：实现实际 API 调用

2. **前端参数配置组件** ❌
   - 需要：根据 `MethodInfo` 动态渲染参数输入框
   - 目标：支持不同类型参数（int、string、float）

#### 第三阶段：清理和优化

3. **移除 METHOD_MAP 字典** ❌
   - 位置：`backend/common/constant.py`
   - 目标：重构完成后删除或最小化使用

4. **添加单元测试** ❌
   - 需要：为 LoaderFactory、BaseLoader、具体解析器编写测试
   - 目标：确保解析逻辑的正确性和稳定性

5. **错误处理优化** ❌
   - 需要：统一异常处理，提供友好的错误信息
   - 目标：提升用户体验

### 重构步骤建议

**第一阶段：统一接口 ✅ 已完成**
1. ✅ 修改 `BaseLoader` 添加统一接口方法
2. ✅ 修改各解析器实现统一 `parse()` 方法
3. ✅ 添加 `get_supported_methods()` 和 `get_method_params()` 方法
4. ✅ 创建 `LoaderFactory` 类
5. ✅ 实现后端解析 API 端点

**第二阶段：前端集成（待完成）**
1. ❌ 前端调用实际 API 替换 TODO
2. ❌ 实现动态参数配置组件
3. ❌ 集成解析状态显示

**第三阶段：清理和优化（待完成）**
1. ❌ 移除或简化 METHOD_MAP
2. ❌ 添加单元测试
3. ❌ 优化错误处理

### 重构的好处

1. **易于维护**：解析逻辑封装在各个解析器类中
2. **易于扩展**：添加新解析类型只需创建新的解析器类
3. **类型安全**：每个解析器明确自己的支持方法和参数
4. **API 清晰**：统一的解析接口，参数明确

## License

MIT