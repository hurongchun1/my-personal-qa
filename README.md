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
- **联网搜索问答**（基于 Serper API + FireCrawl）
- 文档管理 API

### 前端功能
- 数字员工工作台界面
- 实时状态监控
- 对话流交互
- 联网搜索开关（支持知识库 + 网络搜索混合问答）
- 知识库管理
- 任务看板

## 技术栈

### 后端
- **FastAPI** - Web 框架
- **LangChain** - 文本分割与嵌入
- **FAISS/Elasticsearch** - 向量存储
- **DashScope** - AI 服务
- **Serper API** - Google 搜索（联网搜索）
- **FireCrawl** - 网页内容抓取（联网搜索）
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

### 2026-06-21 联网搜索重构（Serper API + FireCrawl）

#### 重构背景

原 FireCrawl 自部署版本的 `/v1/search` 端点依赖 SearXNG，导致搜索返回空结果。为了实现稳定的联网搜索功能，将搜索和抓取功能解耦：

- **搜索阶段**：使用 Serper API（Google 搜索）
- **抓取阶段**：使用 FireCrawl `/v1/scrape` 端点（网页内容提取）

#### 架构设计

```
用户查询 → Serper API (搜索) → 返回搜索结果列表
                                        ↓
                              FireCrawl (抓取) → 网页 Markdown 内容
                                        ↓
                              上下文拼接 → LLM 生成回答
```

#### 技术实现

1. **配置更新**（`backend/common/config.py`）
   - 新增 `SERPER_API_KEY` - Serper API 密钥
   - 新增 `SERPER_API_URL` - Serper API 地址（https://google.serper.dev/search）
   - 保留 FireCrawl 配置（用于网页抓取）

2. **WebSearch 类重构**（`backend/qa/web_search.py`）
   - **移除**：FireCrawl SDK 依赖
   - **新增**：`_serper_search()` 方法 - 调用 Serper API 进行搜索
   - **新增**：`_firecrawl_scrape()` 方法 - 调用 FireCrawl `/v1/scrape` 端点
   - **优化**：`get_context_for_query()` 方法 - 当抓取失败时使用搜索描述作为备选
   - **新增**：搜索结果日志打印功能

3. **关键代码片段**

```python
# Serper API 搜索
def _serper_search(self, query: str, limit: int = 5) -> List[Dict[str, Any]]:
    headers = {
        'X-API-KEY': SERPER_API_KEY,
        'Content-Type': 'application/json'
    }
    payload = {
        'q': query,
        'num': limit
    }
    response = requests.post(SERPER_API_URL, headers=headers, json=payload, timeout=10)
    return response.json().get('organic', [])[:limit]

# FireCrawl 网页抓取
def _firecrawl_scrape(self, url: str) -> Optional[str]:
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {FIRECRAWL_API_KEY}'
    }
    payload = {
        'url': url,
        'formats': ['markdown'],
        'timeout': 10000
    }
    response = requests.post(f"{FIRECRAWL_API_URL}/v1/scrape", headers=headers, json=payload, timeout=15)
    if response.json().get('success'):
        return response.json().get('data', {}).get('markdown', '')
    return None
```

4. **容错机制**
   - 当 FireCrawl 抓取失败时，自动使用 Serper 搜索结果的 `description` 作为上下文
   - 确保即使抓取失败，LLM 仍能获得足够的信息生成回答

#### 使用说明

1. **配置 API Key**
   ```bash
   # 设置 Serper API Key（环境变量方式）
   set SERPER_API_KEY=your_serper_api_key  # Windows
   # export SERPER_API_KEY=your_serper_api_key  # Linux/Mac
   ```

2. **Serper API 免费额度**
   - 注册即赠 2,500 次搜索（一次性）
   - 预付费充值制，无月度订阅
   - 点数有效期 6 个月
   - 官网：https://serper.dev/

3. **日志输出**
   - 搜索结果会打印到日志中，方便调试
   - 日志文件位置：`backend/logs/rag_app_*.jsonl`

#### 测试验证

```bash
# 测试搜索功能
python -c "
from backend.qa.web_search import WebSearch
ws = WebSearch()
results = ws.search('Python编程', limit=3)
print(f'搜索结果数量: {len(results)}')
for r in results:
    print(f'  - {r.title}')
"
```

---

### 2026-06-20 联网搜索功能实现（初版）

#### 后端（Backend）

1. **Firecrawl 集成配置**
   - 添加 `FIRECRAWL_API_URL`、`FIRECRAWL_API_KEY`、`FIRECRAWL_TIMEOUT` 配置
   - 支持本地部署的 Firecrawl 服务（默认端口 3002）

2. **WebSearch 类实现**
   - 位置：`backend/qa/web_search.py`
   - 功能：封装 Firecrawl SDK 的搜索和内容抓取能力
   - 特性：
     - `search(query)` - 搜索网页内容，支持 `with_content` 参数控制是否抓取完整内容
     - `get_context_for_query(query)` - 获取查询的上下文内容，用于 RAG 增强
     - 按各来源内容长度比例分配总预算的上下文截取策略
     - 单例模式管理 Firecrawl 客户端实例

3. **RAG 引擎增强**
   - 位置：`backend/rag/engine.py`
   - 新增 `web_search_ask()` 方法，支持联网搜索问答
   - 混合搜索：本地知识库 + 网络搜索结果
   - 可通过 `use_web` 参数控制是否启用联网搜索

4. **API 端点**
   - 新增 `POST /query/web_search_chat` 联网搜索问答接口
   - 请求模型：`WebSearchChatRequest`（query、use_web、k）

5. **依赖更新**
   - 添加 `firecrawl-py>=1.0.0` 依赖

6. **前端实现**
   - 在 `AgentChatView` 组件中添加联网搜索开关（Search 图标按钮）
   - 开关状态控制是否调用 `/query/web_search_chat` 接口
   - 根据开关状态动态显示不同的 placeholder 提示
   - 版本号更新为 v2.5.0，显示 `Web Search Enabled` 或 `RAG Backend Connected`
   - 添加 `WebSearchChatRequest` 类型定义（对齐后端模型）
   - 添加 `sendWebSearchMessage` API 函数

**注意**：此版本依赖 FireCrawl SDK 的搜索功能，但自部署版本存在 SearXNG 依赖问题，已于 2026-06-21 重构为 Serper API + FireCrawl 方案。

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

### 已完成内容

#### 第二阶段：前端集成

1. **前端解析 API 调用** ✅
   - 位置：`frontend/src/components/KnowledgeBaseDetail.tsx` 第 258 行
   - 状态：已实现，调用 `parseDocument` API

2. **前端参数配置组件** ✅
   - 状态：已实现，解析参数配置弹窗
   - 支持：动态渲染参数输入框（int、string、float）

#### 第三阶段：清理和优化

3. **移除 METHOD_MAP 字典** ✅
   - 状态：代码中不存在，已移除

4. **添加单元测试** ✅
   - 状态：已有 test_loader_factory.py 等单元测试

5. **错误处理优化** ✅
   - 状态：已实现 BusinessException 和全局异常处理

### 重构步骤建议

**第一阶段：统一接口 ✅ 已完成**
1. ✅ 修改 `BaseLoader` 添加统一接口方法
2. ✅ 修改各解析器实现统一 `parse()` 方法
3. ✅ 添加 `get_supported_methods()` 和 `get_method_params()` 方法
4. ✅ 创建 `LoaderFactory` 类
5. ✅ 实现后端解析 API 端点

**第二阶段：前端集成（已完成）**
1. ✅ 前端调用实际 API 替换 TODO
2. ✅ 实现动态参数配置组件
3. ✅ 集成解析状态显示

**第三阶段：清理和优化（已完成）**
1. ✅ 移除或简化 METHOD_MAP（代码中不存在）
2. ✅ 添加单元测试（已有 test_loader_factory.py 等）
3. ✅ 优化错误处理（已实现 BusinessException 和全局异常处理）

### 重构的好处

1. **易于维护**：解析逻辑封装在各个解析器类中
2. **易于扩展**：添加新解析类型只需创建新的解析器类
3. **类型安全**：每个解析器明确自己的支持方法和参数
4. **API 清晰**：统一的解析接口，参数明确

## 项目演进路线

### 项目愿景

**初心**：打造一个能帮你管理知识、提高效率的个人数字助理

**最终目标**：从基础问答系统进化成智能的个人数字助理，能够理解你的需求，主动提供帮助，协助完成日常工作。

### 演进阶段图

```
基础问答系统（当前）
    ↓
知识管理助手（下一阶段）
    ↓
个人数字助理（目标）
    ↓
个人AI伙伴（未来）
```

### 阶段一：知识问答助手（已完成 ✅）

**核心能力**：
- ✅ 基于文档的问答（RAG系统）
- ✅ 联网搜索功能（Serper API + FireCrawl）
- ✅ 知识库管理（文档上传、分类、检索）
- ✅ 基础任务管理（任务看板）

**解决的问题**：
- 从无到有：实现了基本的问答功能
- 信息检索：能够快速查找文档中的信息
- 知识整合：结合本地知识和网络信息

**技术实现**：
- 后端：FastAPI + RAG引擎 + DashScope
- 前端：React + TypeScript + Tailwind CSS
- 存储：FAISS/Elasticsearch + SQLite

### 阶段二：知识管理助手（下一阶段）

**核心能力**：
- 🎯 智能文档处理（OCR、版面分析、表格识别）
- 🎯 结构化分块（层次结构、父子节点分块）
- 🎯 混合检索（向量检索 + 关键词检索）
- 🎯 重排序机制（最相关结果优先）
- 🎯 知识关联（自动建立知识图谱）

**解决的问题**：
- 从有到好：提升文档处理质量
- 信息过载：智能整理和组织知识
- 检索效率：提高检索准确性和速度

**技术实现**：
- 文档解析：集成OCR（Tesseract/PaddleOCR）
- 分块策略：实现结构化分块和父子节点分块
- 检索优化：混合检索 + 重排序
- 知识图谱：自动提取实体和关系

**实施计划**（2-3个月）：
1. **第1-2周**：增强PDF解析，添加OCR支持
2. **第3-4周**：实现结构化分块和父子节点分块
3. **第5-6周**：集成混合检索和重排序机制
4. **第7-8周**：构建知识图谱，实现知识关联
5. **第9-12周**：优化用户体验，完善前端界面

### 阶段三：个人数字助理（目标）

**核心能力**：
- 🚀 理解用户需求（自然语言理解）
- 🚀 主动提供帮助（智能推荐和提醒）
- 🚀 协助任务完成（工作流自动化）
- 🚀 持续学习优化（用户行为分析）

**解决的问题**：
- 从好到智：系统变得智能、自适应
- 效率提升：自动化重复性工作
- 个性化：根据用户习惯提供定制服务

**技术实现**：
- Agent架构：引入LangChain/LlamaIndex
- 工具集成：OCR、表格识别、版面分析等
- 任务管理：工作流引擎
- 学习系统：用户行为分析和推荐

**实施计划**（4-6个月）：
1. **第1-4周**：设计Agent架构，实现基础Agent
2. **第5-8周**：集成文档处理工具，实现智能解析
3. **第9-12周**：实现多轮对话和任务协助
4. **第13-16周**：添加学习功能，优化用户体验
5. **第17-24周**：系统集成和全面测试

### 阶段四：个人AI伙伴（未来愿景）

**核心能力**：
- 💡 深度理解用户（习惯、偏好、需求）
- 💡 主动建议和提醒（基于上下文感知）
- 💡 多模态交互（文本、语音、图像）
- 💡 持续进化（从用户反馈中学习）

**技术展望**：
- 多模态模型：支持文本、语音、图像
- 情感计算：理解用户情绪和状态
- 上下文感知：理解工作环境和场景
- 自主学习：从交互中不断优化

### 下一阶段具体实施计划

#### 第一步：巩固现有基础（1-2周）
1. **优化文档解析**
   - 提高PDF解析质量
   - 支持更多文档格式
   - 优化文本提取准确性

2. **改进问答质量**
   - 优化检索算法
   - 改进答案生成
   - 添加答案置信度评估

3. **完善用户体验**
   - 优化界面设计
   - 添加使用引导
   - 改进错误处理

#### 第二步：增强知识管理（3-6周）
1. **智能文档处理**
   - 集成OCR支持扫描件
   - 实现版面分析
   - 添加表格识别

2. **结构化分块**
   - 实现基于标题层级的分块
   - 添加父子节点分块
   - 优化分块质量评估

3. **混合检索优化**
   - 实现向量检索 + 关键词检索
   - 添加重排序机制
   - 优化检索性能

#### 第三步：引入智能助理（7-12周）
1. **Agent架构设计**
   - 设计Agent工作流程
   - 实现工具注册中心
   - 添加任务规划能力

2. **智能工具集成**
   - 集成文档处理工具
   - 添加信息提取工具
   - 实现知识关联工具

3. **用户体验优化**
   - 实现多轮对话
   - 添加主动推荐
   - 优化响应速度

### 成功标准

#### 阶段二成功标准：
- 文档问答准确率 > 85%
- 支持扫描件OCR识别
- 检索响应时间 < 2秒
- 用户满意度 > 80%

#### 阶段三成功标准：
- 任务完成效率提升 > 50%
- 答案相关性提升 > 40%
- 系统自学习能力 > 70%
- 用户留存率 > 85%

### 技术演进路径

```
当前技术栈：
├── FastAPI：Web框架
├── RAG：检索增强生成
├── DashScope：大语言模型
├── FAISS：向量存储
└── React：前端界面

技术扩展路径：
├── 文档处理：OCR + 版面分析 + 表格识别
├── 检索优化：混合检索 + 重排序
├── Agent架构：LangChain/LlamaIndex
├── 工具集成：多种工具调用
└── 学习系统：用户行为分析
```

### 项目价值

#### 短期价值（1-3个月）：
- 解决个人知识管理问题
- 提高信息检索效率
- 学习RAG技术实践

#### 中期价值（3-6个月）：
- 构建智能知识管理系统
- 提升工作效率
- 积累AI应用开发经验

#### 长期价值（6个月以上）：
- 开发个人数字助理
- 探索AI应用前沿
- 可能发展为商业产品

### 总结

**项目演进路径**：问答系统 → 知识管理助手 → 个人数字助理 → 个人AI伙伴

**关键突破**：
1. 从被动到主动：系统开始主动提供帮助
2. 从简单到智能：系统开始理解上下文
3. 从工具到伙伴：系统开始理解你的需求

**实施原则**：
1. 需求驱动：从实际需求出发
2. 分步实现：每个阶段有明确目标
3. 持续优化：根据使用反馈调整方向

**下一步行动**：开始阶段二的实施，重点优化文档处理和检索质量。

## License

MIT