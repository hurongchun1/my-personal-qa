# 文档解析模块重构方案

## 概述

本模块采用 **策略模式 + 工厂模式** 重构文档解析功能，实现：
- 统一的解析接口
- 可扩展的分割策略
- 自描述的方法参数

## 架构图

```
┌─────────────────────────────────────────────────────────────┐
│                     元信息层（给前端看）                      │
├─────────────────────────────────────────────────────────────┤
│  ParamInfo  ─→  描述参数：名称、类型、默认值                  │
│  MethodInfo ─→  描述方法：名称、标签、需要哪些参数            │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                     策略层（干活的工具）                      │
├─────────────────────────────────────────────────────────────┤
│  TextSplitter（抽象接口）                                    │
│      ├── CharacterSplitter  字符分割                         │
│      ├── TokenSplitter      Token分割                       │
│      └── SemanticSplitter   语义分割                         │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                     加载器层（文档处理）                      │
├─────────────────────────────────────────────────────────────┤
│  BaseLoader（抽象基类）                                       │
│      ├── PDFLoader       处理 PDF 文件                       │
│      ├── HtmlLoader      处理 HTML 文件                      │
│      └── MarkdownLoader  处理 Markdown 文件                  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                     工厂层（创建对象）                        │
├─────────────────────────────────────────────────────────────┤
│  LoaderFactory                                               │
│      create(file_type)           → 创建 Loader 实例          │
│      get_supported_methods(...)  → 查询支持的方法             │
└─────────────────────────────────────────────────────────────┘
```

## 目录结构

```
backend/parser/
├── splitter/                  # 分割策略模块
│   ├── __init__.py
│   ├── base_splitter.py       # 策略接口 + 元信息类
│   ├── character_splitter.py  # 字符分割策略
│   ├── token_splitter.py      # Token分割策略
│   └── semantic_splitter.py   # 语义分割策略
├── base_loader.py             # 加载器基类
├── pdf_loader.py              # PDF加载器
├── html_loader.py             # HTML加载器
├── markdown_loader.py         # Markdown加载器
├── loader_factory.py          # 工厂类
└── README.md                  # 本文档
```

## 核心类说明

### 1. ParamInfo（参数元信息）

描述一个参数的属性，用于告诉前端如何渲染输入框。

```python
class ParamInfo:
    def __init__(self, name, label, type, default, required):
        self.name = name          # 参数名（如 "chunk_size"）
        self.label = label        # 中文标签（如 "分块大小"）
        self.type = type          # 类型（"int", "str", "embedding"）
        self.default = default    # 默认值（如 512）
        self.required = required  # 是否必填
```

**使用场景**：
- 前端根据 `type` 决定显示什么输入框（数字输入框、文本输入框等）
- 前端根据 `default` 显示默认值
- 前端根据 `required` 决定是否必填

### 2. MethodInfo（方法元信息）

描述一个解析方法的属性，用于告诉前端如何渲染下拉框和参数表单。

```python
class MethodInfo:
    def __init__(self, name, label, params):
        self.name = name          # 方法名（如 "character"）
        self.label = label        # 中文标签（如 "字符分割"）
        self.params = params      # 参数列表（List[ParamInfo]）
```

**使用场景**：
- 前端根据 `name` 和 `label` 渲染下拉框选项
- 前端根据 `params` 渲染参数输入表单

### 3. TextSplitter（分割策略接口）

定义分割策略的抽象接口，所有具体策略必须实现。

```python
class TextSplitter(ABC):
    @abstractmethod
    def split(self, text: str) -> List[str]:
        """执行分割，返回文本块列表"""
        pass
    
    @abstractmethod
    def get_name(self) -> str:
        """返回策略名称（如 "character"）"""
        pass
    
    @abstractmethod
    def get_label(self) -> str:
        """返回中文标签（如 "字符分割"）"""
        pass
    
    @abstractmethod
    def get_params(self) -> List[ParamInfo]:
        """返回需要的参数列表"""
        pass
```

### 4. 具体分割策略

#### CharacterSplitter（字符分割）
```python
class CharacterSplitter(TextSplitter):
    def __init__(self, chunk_size=512, chunk_overlap=50):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
    
    def split(self, text):
        # 使用 RecursiveCharacterTextSplitter 分割
        pass
    
    def get_name(self):
        return "character"
    
    def get_label(self):
        return "字符分割"
    
    def get_params(self):
        return [
            ParamInfo("chunk_size", "分块大小", "int", 512, False),
            ParamInfo("chunk_overlap", "重叠大小", "int", 50, False),
        ]
```

#### TokenSplitter（Token分割）
```python
class TokenSplitter(TextSplitter):
    def __init__(self, chunk_size=512, chunk_overlap=50):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
    
    def split(self, text):
        # 使用 TokenTextSplitter 分割
        pass
    
    def get_name(self):
        return "token"
    
    def get_label(self):
        return "Token分割"
    
    def get_params(self):
        return [
            ParamInfo("chunk_size", "分块大小", "int", 512, False),
            ParamInfo("chunk_overlap", "重叠大小", "int", 50, False),
        ]
```

#### SemanticSplitter（语义分割）
```python
class SemanticSplitter(TextSplitter):
    def __init__(self, embedding=None):
        self.embedding = embedding
    
    def split(self, text):
        # 使用 SemanticChunker 分割
        pass
    
    def get_name(self):
        return "semantic"
    
    def get_label(self):
        return "语义分割"
    
    def get_params(self):
        return [
            ParamInfo("embedding", "词向量模型", "embedding", None, True),
        ]
```

### 5. BaseLoader（加载器基类）

文档加载器的抽象基类，提供统一的解析接口。

```python
class BaseLoader(ABC):
    def __init__(self):
        self._splitter: Dict[str, TextSplitter] = {}
        self._register_splitter()
    
    @abstractmethod
    def _register_splitter(self):
        """子类必须实现：注册自己支持的分割策略"""
        pass
    
    @abstractmethod
    def load(self, file_path: str) -> str:
        """子类必须实现：加载文档，返回纯文本"""
        pass
    
    def parse(self, method: str, source: str, **kwargs):
        """统一解析方法"""
        # 1. 加载文本
        text = self.load(source)
        
        # 2. 检查方法是否支持
        if method not in self._splitter:
            raise ValueError(f"不支持的解析方法: {method}")
        
        # 3. 取出策略并执行
        splitter = self._splitter[method]
        return splitter.split(text, **kwargs)
    
    def get_supported_methods(self) -> List[MethodInfo]:
        """获取该 Loader 支持的所有解析方法"""
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

### 6. 具体加载器

#### PDFLoader
```python
class PDFLoader(BaseLoader):
    def __init__(self):
        super().__init__()
    
    def _register_splitter(self):
        self._splitter = {
            "character": CharacterSplitter(chunk_size=512, chunk_overlap=50),
            "token": TokenSplitter(chunk_size=512, chunk_overlap=50),
            "semantic": SemanticSplitter(embedding=None),
        }
    
    def load(self, file_path: str) -> str:
        # 使用 PyPDF2 读取 PDF
        pass
```

#### HtmlLoader
```python
class HtmlLoader(BaseLoader):
    def __init__(self):
        super().__init__()
    
    def _register_splitter(self):
        self._splitter = {
            "character": CharacterSplitter(chunk_size=512, chunk_overlap=50),
            "html_splitter": HTMLSplitter(),
            "semantic": SemanticSplitter(embedding=None),
        }
    
    def load(self, file_path: str) -> str:
        # 使用 BeautifulSoup 读取 HTML
        pass
```

#### MarkdownLoader
```python
class MarkdownLoader(BaseLoader):
    def __init__(self):
        super().__init__()
    
    def _register_splitter(self):
        self._splitter = {
            "character": CharacterSplitter(chunk_size=512, chunk_overlap=50),
            "token": TokenSplitter(chunk_size=512, chunk_overlap=50),
            "semantic": SemanticSplitter(embedding=None),
            "markdown": MarkdownSplitter(),
        }
    
    def load(self, file_path: str) -> str:
        # 使用 UnstructuredMarkdownLoader 读取 Markdown
        pass
```

### 7. LoaderFactory（工厂类）

根据文件类型创建对应的 Loader 实例。

```python
class LoaderFactory:
    _loaders = {
        "pdf": PDFLoader,
        "html": HtmlLoader,
        "htm": HtmlLoader,
        "markdown": MarkdownLoader,
        "md": MarkdownLoader,
    }
    
    @classmethod
    def create(cls, file_type: str) -> BaseLoader:
        """根据文件类型创建 Loader 实例"""
        loader_class = cls._loaders.get(file_type.lower())
        if not loader_class:
            raise ValueError(f"不支持的文件类型: {file_type}")
        return loader_class()
    
    @classmethod
    def get_supported_methods(cls, file_type: str) -> List[MethodInfo]:
        """获取指定文件类型支持的解析方法"""
        loader = cls.create(file_type)
        return loader.get_supported_methods()
    
    @classmethod
    def get_supported_types(cls) -> List[str]:
        """获取所有支持的文件类型"""
        return list(cls._loaders.keys())
```

## 完整调用流程

### 场景1：前端查询支持的解析方法

```
1. 前端请求：GET /documents/supported-types?file_type=pdf

2. 后端处理：
   methods = LoaderFactory.get_supported_methods("pdf")

3. 内部流程：
   LoaderFactory.create("pdf")
       → 创建 PDFLoader 实例
       → PDFLoader.__init__()
       → 调用 _register_splitter()
       → 注册 character、token、semantic 策略
   
   loader.get_supported_methods()
       → 遍历 _splitter 字典
       → 调用每个策略的 get_name()、get_label()、get_params()
       → 组装成 MethodInfo 列表

4. 返回给前端：
   [
     {"name": "character", "label": "字符分割", "params": [...]},
     {"name": "token", "label": "Token分割", "params": [...]},
     {"name": "semantic", "label": "语义分割", "params": [...]}
   ]

5. 前端渲染：
   - 显示下拉框：字符分割、Token分割、语义分割
   - 选择后显示对应的参数输入框
```

### 场景2：前端执行文档解析

```
1. 前端请求：POST /documents/parse/123
   Body: {"method": "character", "params": {"chunk_size": 1024, "chunk_overlap": 100}}

2. 后端处理：
   # 获取文档信息
   doc = get_document(123)  # 返回 {"file_type": "pdf", "file_path": "/uploads/xxx.pdf"}
   
   # 创建 Loader
   loader = LoaderFactory.create(doc["file_type"])
   
   # 执行解析
   chunks = loader.parse(
       method="character",
       source=doc["file_path"],
       chunk_size=1024,
       chunk_overlap=100
   )

3. 内部流程：
   BaseLoader.parse(method="character", source="/uploads/xxx.pdf", chunk_size=1024, chunk_overlap=100)
       → text = self.load(source)  # 调用 PDFLoader.load() 读取 PDF 文本
       → 检查 "character" 是否在 self._splitter 中
       → splitter = self._splitter["character"]  # 取出 CharacterSplitter 对象
       → return splitter.split(text, chunk_size=1024, chunk_overlap=100)
   
   CharacterSplitter.split(text, chunk_size=1024, chunk_overlap=100)
       → 使用 RecursiveCharacterTextSplitter 分割
       → 返回 ["第一块", "第二块", ...]

4. 返回给前端：
   {"chunk_count": 10, "chunks": ["第一块", "第二块", ...]}
```

## 设计优势

### 1. 符合开闭原则
- 新增分割策略：只需新建 TextSplitter 子类
- 新增文件类型：只需新建 BaseLoader 子类
- 无需修改现有代码

### 2. 自描述性
- 每个策略知道自己支持什么方法、需要什么参数
- 前端可以动态获取参数配置

### 3. 统一接口
- 所有 Loader 使用相同的 `parse()` 方法
- 所有 Splitter 使用相同的 `split()` 方法

### 4. 易于测试
- 每个组件职责单一
- 可以独立测试各个策略

## 与旧架构对比

| 项目 | 旧架构 | 新架构 |
|------|--------|--------|
| 调用方式 | METHOD_MAP[file_type][method](...) | loader.parse(method, source, **params) |
| 新增文件类型 | 修改 METHOD_MAP + 添加 lambda | 新建 Loader 类 |
| 新增解析方法 | 修改 METHOD_MAP + 添加 lambda | 新建 Splitter 类 |
| 获取参数配置 | 无法获取 | loader.get_supported_methods() |
| 代码可读性 | lambda 难以理解 | 清晰的方法定义 |

## 注意事项

1. **参数传递**：前端传入的参数会通过 `**kwargs` 传递给 Splitter 的 `split()` 方法
2. **默认值**：Splitter 构造函数中的参数作为默认值，前端传入的参数会覆盖默认值
3. **错误处理**：不支持的文件类型或解析方法会抛出异常
4. **扩展性**：如需支持新的分割方式，只需新建 TextSplitter 子类并在 Loader 中注册

## API 端点使用说明

### 1. 获取支持的解析方法

**请求**：
```
GET /documents/supported-types?file_type=pdf
```

**响应**：
```json
{
  "code": 200,
  "msg": "success",
  "data": [
    {
      "name": "character",
      "label": "字符分割",
      "params": [
        {"name": "chunk_size", "label": "分块大小", "type": "int", "default": "512", "required": false},
        {"name": "chunk_overlap", "label": "重叠大小", "type": "int", "default": "50", "required": false}
      ]
    },
    {
      "name": "token",
      "label": "Token分割",
      "params": [
        {"name": "chunk_size", "label": "分块大小", "type": "int", "default": "512", "required": false},
        {"name": "chunk_overlap", "label": "重叠大小", "type": "int", "default": "50", "required": false}
      ]
    },
    {
      "name": "semantic",
      "label": "语义分割",
      "params": [
        {"name": "embedding", "label": "词向量模型", "type": "embedding", "default": null, "required": true}
      ]
    }
  ]
}
```

### 2. 解析文档

**请求**：
```
POST /documents/parse
Content-Type: application/json

{
  "document_id": 123,
  "method": "character",
  "chunk_size": 1024,
  "chunk_overlap": 100,
  "params": {}
}
```

**响应**：
```json
{
  "code": 200,
  "msg": "success",
  "data": "ok"
}
```

### 3. 前端集成示例

```javascript
// 1. 获取支持的解析方法
const response = await fetch('/documents/supported-types?file_type=pdf');
const methods = await response.json();

// 2. 渲染下拉框
methods.data.forEach(method => {
  console.log(`${method.label} (${method.name})`);
  // 渲染参数表单
  method.params.forEach(param => {
    console.log(`  ${param.label}: ${param.type} (默认: ${param.default})`);
  });
});

// 3. 提交解析请求
const parseResponse = await fetch('/documents/parse', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    document_id: 123,
    method: 'character',
    chunk_size: 1024,
    chunk_overlap: 100,
    params: {}
  })
});
```

## 后续优化方向

1. **参数验证**：添加参数类型验证和范围检查
2. **缓存机制**：缓存 Loader 实例，避免重复创建
3. **异步支持**：支持异步加载和解析大文件
4. **进度回调**：支持解析进度通知
5. **错误处理**：完善异常处理和错误码
6. **单元测试**：添加完整的单元测试覆盖