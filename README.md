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

## 相关链接

- [FastAPI 文档](https://fastapi.tiangolo.com/)
- [React 文档](https://react.dev/)
- [Tailwind CSS 文档](https://tailwindcss.com/)
- [Vite 文档](https://vitejs.dev/)
- [DashScope 文档](https://dashscope.aliyun.com/)

## License

MIT