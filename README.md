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
│   └── constant.py          # METHOD_MAP 字典，包含所有解析策略
├── parser/
│   ├── base_loader.py       # 抽象基类，但接口不统一
│   ├── pdf_loader.py        # PDF解析器
│   ├── html_loader.py       # HTML解析器
│   └── markdown_loader.py   # Markdown解析器
└── api/
    └── routers/
        └── documents.py     # 文档API端点
```

### 重构目标

将 METHOD_MAP 字典替换为更清晰的架构：

1. **统一接口**：每个解析器实现统一的 `parse()` 方法
2. **自描述解析器**：每个解析器知道自己的支持方法和参数
3. **工厂模式**：通过 `LoaderFactory` 创建解析器，替代字典查找
4. **动态参数**：前端可以动态获取每种解析方式需要的参数

### 重构后架构

#### 1. BaseLoader 抽象基类（需要修改）

```python
class BaseLoader:
    @abstractmethod
    def parse(self, file_path: str, method: str, **kwargs) -> List[str]:
        """统一解析接口"""
        pass
    
    @abstractmethod
    def get_supported_methods(self) -> List[str]:
        """返回该解析器支持的解析方法"""
        pass
    
    def get_method_params(self, method: str) -> List[Dict[str, Any]]:
        """返回指定方法需要的参数配置"""
        return []
```

#### 2. 具体解析器（需要修改）

每个解析器需要：
- 实现 `parse()` 统一接口
- 实现 `get_supported_methods()` 方法
- 实现 `get_method_params()` 方法（可选）

**PDFLoader 示例**：
```python
class PDFLoader(BaseLoader):
    def parse(self, file_path: str, method: str, **kwargs) -> List[str]:
        if method == "character":
            return self.parse_by_character(file_path, **kwargs)
        elif method == "token":
            return self.parse_by_token(file_path, **kwargs)
        elif method == "semantic":
            return self.parse_by_semantic(file_path, **kwargs)
    
    def get_supported_methods(self) -> List[str]:
        return ["character", "token", "semantic"]
    
    def get_method_params(self, method: str) -> List[Dict[str, Any]]:
        if method == "character":
            return [
                {"name": "chunk_size", "type": "int", "default": 512, "label": "分块大小"},
                {"name": "chunk_overlap", "type": "int", "default": 50, "label": "重叠大小"}
            ]
        # ... 其他方法参数
```

#### 3. LoaderFactory（需要新建）

```python
class LoaderFactory:
    LOADER_MAP = {
        "pdf": PDFLoader,
        "html": HtmlLoader,
        "htm": HtmlLoader,
        "markdown": MarkdownLoader,
        "md": MarkdownLoader,
    }
    
    @classmethod
    def create_loader(cls, file_type: str) -> BaseLoader:
        loader_class = cls.LOADER_MAP.get(file_type)
        if not loader_class:
            raise ValueError(f"不支持的文件类型: {file_type}")
        return loader_class()
```

#### 4. API 接口调整

**后端 API**：
```python
@router.post("/parse/{doc_id}")
async def parse_document(
    doc_id: int,
    method: str,
    params: Dict[str, Any] = {},
    db: Connection = Depends(get_db)
):
    # 1. 获取文档信息
    # 2. 根据文件类型创建解析器
    # 3. 调用解析器统一 parse() 方法
    # 4. 保存解析结果
```

**前端 API**：
```typescript
export async function parseDocument(
    docId: number, 
    method: string, 
    params: Record<string, any>
): Promise<void> {
    await http.post(`/documents/parse/${docId}`, { method, params })
}
```

### 已完成内容

1. **METHOD_MAP 字典实现** ✅
   - 位置：`backend/common/constant.py`
   - 功能：定义各文件类型支持的解析方法

2. **基础解析器实现** ✅
   - PDFLoader、HtmlLoader、MarkdownLoader
   - 每个解析器实现了多种解析方法

3. **前端文档列表组件** ✅
   - 位置：`frontend/src/components/KnowledgeBaseDetail.tsx`
   - 功能：显示文档列表，支持解析方式选择

4. **后端支持类型 API** ✅
   - 位置：`backend/api/routers/documents.py`
   - 功能：返回各文件类型支持的解析方式

### 未完成内容

1. **前端解析 API 调用** ❌
   - 位置：`frontend/src/components/KnowledgeBaseDetail.tsx` 第 187-189 行
   - 状态：TODO，使用 setTimeout 模拟
   - 需要：实现实际 API 调用

2. **重构 BaseLoader 统一接口** ❌
   - 当前：`parse()` 方法参数不一致
   - 目标：统一为 `parse(file_path, method, **kwargs)`

3. **创建 LoaderFactory** ❌
   - 目标：替代 METHOD_MAP 字典查找

4. **后端解析 API 实现** ❌
   - 位置：`backend/api/routers/documents.py` 第 177 行
   - 状态：只有空函数签名
   - 需要：实现完整的文档解析逻辑

5. **移除 METHOD_MAP 字典** ❌
   - 目标：重构完成后删除或最小化使用

### 重构步骤建议

**第一阶段：统一接口（建议优先完成）**
1. 修改 `BaseLoader` 添加统一接口方法
2. 修改各解析器实现统一 `parse()` 方法
3. 添加 `get_supported_methods()` 和 `get_method_params()` 方法

**第二阶段：创建工厂和 API**
1. 创建 `LoaderFactory` 类
2. 实现后端解析 API 端点
3. 前端调用实际 API 替换 TODO

**第三阶段：清理和优化**
1. 重构前端参数配置组件
2. 移除或简化 METHOD_MAP
3. 添加单元测试

### 重构的好处

1. **易于维护**：解析逻辑封装在各个解析器类中
2. **易于扩展**：添加新解析类型只需创建新的解析器类
3. **类型安全**：每个解析器明确自己的支持方法和参数
4. **API 清晰**：统一的解析接口，参数明确

## License

MIT