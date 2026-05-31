# RAG API 项目结构说明

## 目录结构

```
api/
├── __init__.py          # 包初始化文件
├── app.py               # FastAPI 主应用文件
├── models.py            # 数据模型定义
├── dependencies.py      # 依赖项和共享资源
└── routers/             # 路由模块
    ├── __init__.py
    └── query.py         # 问答相关路由
```

## 文件说明

### 1. `app.py` - 主应用文件
- 创建 FastAPI 应用实例
- 配置中间件（CORS等）
- 注册路由
- 定义启动/关闭事件

### 2. `models.py` - 数据模型
- 使用 Pydantic 定义请求和响应模型
- 提供数据验证和文档生成

### 3. `dependencies.py` - 依赖项
- 管理共享资源（如 RAG 引擎实例）
- 提供依赖注入函数

### 4. `routers/` - 路由模块
- 按功能模块组织 API 端点
- 每个路由文件负责一个功能领域

## 如何添加新的 API 端点

### 步骤 1：在 `models.py` 中定义数据模型
```python
class NewRequest(BaseModel):
    """新请求模型"""
    field: str = Field(..., description="字段说明")

class NewResponse(BaseModel):
    """新响应模型"""
    result: str = Field(..., description="结果")
```

### 步骤 2：在 `routers/` 中创建新路由文件
```python
# routers/new_feature.py
from fastapi import APIRouter, Depends
from ..models import NewRequest, NewResponse
from ..dependencies import get_rag_engine

router = APIRouter(prefix="/api/new", tags=["新功能"])

@router.post("/endpoint", response_model=NewResponse)
async def new_endpoint(
    request: NewRequest,
    rag_engine = Depends(get_rag_engine)
):
    # 实现逻辑
    return NewResponse(result="结果")
```

### 步骤 3：在 `app.py` 中注册路由
```python
from .routers import new_feature

app.include_router(new_feature.router)
```

## 启动方式

### 方式 1：使用主入口文件（推荐）
```bash
python main.py
```

### 方式 2：直接运行
```bash
python -m uvicorn api.app:app --host 0.0.0.0 --port 8000 --reload
```

### 方式 3：使用模块语法
```bash
python -m api.app
```

## 测试 API

### 使用测试脚本
```bash
python test_api.py
```

### 使用 curl
```bash
# 健康检查
curl http://localhost:8000/health

# 简单问答
curl -X POST http://localhost:8000/api/ask \
  -H "Content-Type: application/json" \
  -d '{"query": "考核办法有哪些？", "k": 3}'

# 重写问答
curl -X POST http://localhost:8000/api/rewrite-ask \
  -H "Content-Type: application/json" \
  -d '{"query": "还有其他的吗？", "conversation_history": "对话历史", "context_info": "上下文"}'
```

## 依赖管理

### 安装依赖
```bash
pip install -r requirements.txt
```

### 主要依赖
- `fastapi` - Web 框架
- `uvicorn` - ASGI 服务器
- `pydantic` - 数据验证
- `rag_engine` - RAG 引擎（项目内部模块）

## 开发建议

1. **模块化设计**：每个路由文件负责一个功能领域
2. **依赖注入**：使用 FastAPI 的依赖注入系统管理共享资源
3. **错误处理**：统一使用 HTTPException 处理错误
4. **数据验证**：使用 Pydantic 模型验证请求和响应
5. **文档生成**：FastAPI 自动生成 API 文档（访问 /docs）

## FastAPI 学习指南

### 核心概念

#### 1. **Pydantic 模型（数据验证）**
```python
from pydantic import BaseModel, Field
from typing import Optional

class UserRequest(BaseModel):
    """用户请求模型"""
    name: str = Field(..., min_length=1, max_length=50, description="用户名")
    age: int = Field(..., ge=0, le=150, description="年龄")
    email: Optional[str] = Field(None, description="邮箱（可选）")

# 使用
request = UserRequest(name="张三", age=25)  # 自动验证
request = UserRequest(name="", age=200)     # 抛出验证错误
```

#### 2. **依赖注入（Dependencies）**
```python
from fastapi import Depends

# 定义依赖
async def get_database():
    db = Database()
    try:
        yield db
    finally:
        db.close()

# 使用依赖
@router.get("/users")
async def get_users(db = Depends(get_database)):
    return db.query_users()
```

#### 3. **路由组织（APIRouter）**
```python
from fastapi import APIRouter

# 创建路由器
router = APIRouter(
    prefix="/api/users",  # 路径前缀
    tags=["用户"]         # 文档标签
)

@router.get("/")         # 实际路径：/api/users/
async def list_users():
    pass

@router.get("/{id}")     # 实际路径：/api/users/{id}
async def get_user(id: int):
    pass
```

#### 4. **请求处理**
```python
from fastapi import Query, Path, Body

@router.get("/search")
async def search(
    q: str = Query(..., description="搜索关键词"),  # 查询参数
    page: int = Query(1, ge=1, description="页码")
):
    pass

@router.get("/items/{item_id}")
async def get_item(
    item_id: int = Path(..., description="商品ID")  # 路径参数
):
    pass

@router.post("/items")
async def create_item(
    item: ItemRequest = Body(..., description="商品信息")  # 请求体
):
    pass
```

#### 5. **错误处理**
```python
from fastapi import HTTPException

@router.get("/items/{item_id}")
async def get_item(item_id: int):
    item = find_item(item_id)
    if not item:
        raise HTTPException(
            status_code=404,
            detail=f"商品 {item_id} 不存在"
        )
    return item
```

#### 6. **中间件（Middleware）**
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],           # 允许的来源
    allow_credentials=True,
    allow_methods=["*"],           # 允许的HTTP方法
    allow_headers=["*"],           # 允许的请求头
)
```

### 学习路径

#### **阶段 1：基础入门**
1. **理解 Pydantic 模型**
   - 学习 `BaseModel` 和 `Field`
   - 理解数据验证和类型提示
   - 练习：定义用户注册请求模型

2. **创建简单路由**
   - 学习 `APIRouter` 和装饰器
   - 理解 GET、POST 请求
   - 练习：创建用户 CRUD 接口

#### **阶段 2：进阶使用**
3. **依赖注入系统**
   - 学习 `Depends` 函数
   - 理解依赖的作用域
   - 练习：创建数据库连接依赖

4. **错误处理和验证**
   - 学习 `HTTPException`
   - 理解请求验证
   - 练习：添加统一的错误处理

#### **阶段 3：高级特性**
5. **中间件和安全**
   - 学习 CORS 中间件
   - 理解认证和授权
   - 练习：添加 JWT 认证

6. **测试和文档**
   - 学习使用 `TestClient`
   - 理解自动生成的文档
   - 练习：编写单元测试

### 常见问题

#### **Q1: 如何返回文件？**
```python
from fastapi.responses import FileResponse

@router.get("/download")
async def download_file():
    return FileResponse(
        path="file.pdf",
        filename="document.pdf",
        media_type="application/pdf"
    )
```

#### **Q2: 如何处理表单数据？**
```python
from fastapi import Form

@router.post("/login")
async def login(
    username: str = Form(...),
    password: str = Form(...)
):
    pass
```

#### **Q3: 如何上传文件？**
```python
from fastapi import File, UploadFile

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    content = await file.read()
    return {"filename": file.filename}
```

#### **Q4: 如何添加认证？**
```python
from fastapi import Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

@router.get("/protected")
async def protected_route(
    credentials: HTTPAuthorizationCredentials = Security(security)
):
    token = credentials.credentials
    # 验证 token
    return {"message": "访问成功"}
```

### 学习资源

1. **官方文档**：https://fastapi.tiangolo.com/
2. **Pydantic 文档**：https://docs.pydantic.dev/
3. **Uvicorn 文档**：https://www.uvicorn.org/
4. **FastAPI 最佳实践**：https://fastapi.tiangolo.com/best-practices/

### 练习项目建议

1. **Todo API**：简单的待办事项 CRUD
2. **用户系统**：注册、登录、权限管理
3. **文件管理**：上传、下载、预览
4. **博客系统**：文章、评论、标签

## 生产部署

### 使用 Gunicorn
```bash
pip install gunicorn
gunicorn api.app:app -w 4 -k uvicorn.workers.UvicornWorker
```

### 使用 Docker
```dockerfile
FROM python:3.12
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "api.app:app", "--host", "0.0.0.0", "--port", "8000"]
```