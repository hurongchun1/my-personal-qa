# 数字员工工作台 - React前端

## 项目概述

这是一个基于React 18/19 + TypeScript + Tailwind CSS + Framer Motion构建的AI原生"数字员工"工作台。采用"双态视窗"设计，左侧为指令控制台，右侧为成果工作区。

### 设计理念

从简单的文档QA系统升级为真正的智能助手，体现以下核心价值：

| 特性 | 文档QA系统 | 数字员工 |
|------|-----------|----------|
| **交互方式** | 单次问答 | 多轮对话、上下文记忆 |
| **主动性** | 被动响应 | 主动提醒、建议 |
| **能力范围** | 仅文档问答 | 工具调用、任务管理、生活辅助 |
| **个性化** | 通用回答 | 个人偏好学习、定制化服务 |
| **记忆能力** | 无记忆 | 长期记忆、对话历史 |

### 设计原则

- **专业感**: 体现企业级数字员工的专业形象
- **智能化**: 界面能体现AI的主动性和智能交互
- **人性化**: 温暖、友好的交互体验
- **可扩展**: 支持未来功能扩展的模块化设计

## 技术栈

- **前端框架**: React 18/19 + TypeScript
- **状态管理**: 自定义Hook (useDigitalEmployee)
- **UI组件库**: Tailwind CSS + Framer Motion
- **构建工具**: Vite
- **实时通信**: 支持SSE流式响应
- **Markdown渲染**: react-markdown

### 技术选型理由

1. **React**: 组件化开发，适合复杂交互界面
2. **TypeScript**: 类型安全，适合大型项目维护
3. **Tailwind CSS**: 快速UI开发，设计系统友好
4. **Framer Motion**: 流畅的动画效果，提升用户体验
5. **Vite**: 快速的开发服务器和构建工具
6. **自定义Hook**: 轻量级状态管理，适合数字员工的状态逻辑

## 项目结构

```
frontend-react/
├── src/
│   ├── components/          # React组件
│   │   ├── StatusBar.tsx       # 顶部状态栏（带呼吸动画）
│   │   ├── CommandConsole.tsx  # 指令控制台
│   │   ├── ChatStream.tsx      # 对话流组件
│   │   ├── InputNexus.tsx      # 输入框组件（支持拖拽）
│   │   ├── ArtifactsContainer.tsx # 成果工作区容器
│   │   ├── KnowledgeBase.tsx   # 知识库管理
│   │   └── TaskBoard.tsx       # 任务看板
│   ├── hooks/               # 自定义Hooks
│   │   └── useDigitalEmployee.ts # 数字员工核心Hook
│   ├── services/            # API服务层
│   │   └── api.ts              # FastAPI通信封装
│   ├── types/               # TypeScript类型定义
│   │   └── index.ts            # 所有类型定义
│   ├── App.tsx              # 主应用组件
│   ├── main.tsx             # 应用入口
│   └── index.css            # 全局样式
├── tailwind.config.js       # Tailwind配置
├── vite.config.ts           # Vite配置
└── package.json             # 项目依赖
```

## 核心功能

### 1. 状态栏 (StatusBar)
- 实时显示数字员工状态（空闲/思考中/阅读中/执行中/输出中）
- 呼吸动画指示灯
- 当前动作描述
- 系统信息显示

### 2. 指令控制台 (CommandConsole)
- **对话流**: 支持Markdown渲染、引用标签、流式加载
- **输入框**: 多行输入、拖拽上传、快捷指令
- **实时滚动**: 自动滚动到最新消息

### 3. 成果工作区 (ArtifactsContainer)
- **Tab系统**: 知识库和任务看板切换
- **知识库管理**: 文档上传、删除、状态监控
- **任务看板**: 任务创建、状态切换、优先级管理

### 4. 核心Hook (useDigitalEmployee)
- 封装所有数字员工状态逻辑
- 支持流式响应和实时更新
- 集成FastAPI后端API
- 错误处理和回退机制

## 开发路线图

### 第一阶段：知识库Q&A前端（当前）
**目标**: 完成文档管理和基础问答界面

**功能**:
- [x] 基础对话界面
- [ ] 文档上传和管理界面
- [ ] 系统状态监控
- [ ] 流式响应支持（SSE）
- [ ] 对话历史记录

**UI设计重点**:
- 专业的数字员工形象
- 流畅的对话体验
- 清晰的文档管理界面

### 第二阶段：多轮对话增强
**目标**: 实现上下文感知的多轮对话

**功能**:
- 对话上下文管理
- 对话历史搜索
- 快捷指令系统
- 主题切换、个性化设置

**UI设计重点**:
- 对话分支可视化
- 上下文引用展示
- 智能输入提示

### 第三阶段：工具调用集成
**目标**: 实现数字员工的工具使用能力

**功能**:
- 日程管理界面
- 外部API集成（天气、新闻等）
- 任务创建和跟踪
- 工具调用结果可视化

**UI设计重点**:
- 工具调用过程展示
- 任务状态看板
- 多模态结果展示

### 第四阶段：主动智能能力
**目标**: 实现数字员工的主动性和智能建议

**功能**:
- 主动提醒系统
- 智能建议引擎
- 工作模式识别
- 个性化推荐

**UI设计重点**:
- 主动交互界面
- 智能建议卡片
- 工作流程可视化

## 快速开始

### 1. 安装依赖

```bash
cd frontend-react
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

开发服务器将启动在 http://localhost:5173

### 3. 构建生产版本

```bash
npm run build
```

构建完成后，可以通过后端访问：http://localhost:8000/app

## API集成

### 后端代理配置

Vite开发服务器已配置代理，将 `/api` 请求转发到 `http://localhost:8000`：

```typescript
// vite.config.ts
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8000',
      changeOrigin: true,
    },
  },
},
```

### 支持的API端点

1. **文档管理**
   - `GET /api/documents` - 获取文档列表
   - `POST /api/documents/upload` - 上传文档
   - `DELETE /api/documents/{id}` - 删除文档
   - `POST /api/documents/{id}/process` - 处理文档

2. **智能问答**
   - `POST /api/query/simple_chat` - 简单问答
   - `POST /api/query/rewritten_chat` - 重写问答
   - `POST /api/query/stream_chat` - 流式问答（需要后端支持）

3. **系统状态**
   - `GET /api/system/status` - 获取系统状态
   - `GET /health` - 健康检查

## 自定义配置

### Tailwind CSS配置

在 `tailwind.config.js` 中自定义数字员工主题：

```javascript
theme: {
  extend: {
    colors: {
      'digital-primary': '#0f172a',
      'digital-secondary': 'rgba(30, 41, 59, 0.4)',
      'digital-accent': '#818cf8',
      'digital-accent-dark': '#4f46e5',
    },
  },
},
```

### 动画配置

在 `index.css` 中定义自定义动画：

```css
@keyframes pulse-glow {
  0%, 100% {
    opacity: 1;
    box-shadow: 0 0 5px rgba(129, 140, 248, 0.5);
  }
  50% {
    opacity: 0.7;
    box-shadow: 0 0 15px rgba(129, 140, 248, 0.8);
  }
}
```

## 开发指南

### 添加新组件

1. 在 `src/components/` 目录创建新组件
2. 使用TypeScript定义组件Props
3. 使用Tailwind CSS进行样式设计
4. 使用Framer Motion添加动画

### 添加新API

1. 在 `src/services/api.ts` 中添加新的API函数
2. 在 `useDigitalEmployee` Hook中集成新API
3. 添加错误处理和回退机制

### 状态管理

所有状态通过 `useDigitalEmployee` Hook管理：

```typescript
const {
  status,           // 数字员工状态
  messages,         // 对话消息
  documents,        // 文档列表
  tasks,            // 任务列表
  activeArtifact,   // 当前活动工作区
  isStreaming,      // 是否正在流式输出
  sendMessage,      // 发送消息
  addDocument,      // 添加文档
  toggleTask,       // 切换任务状态
} = useDigitalEmployee()
```

## 设计参考

### 优秀案例参考
1. **ChatGPT**: 对话界面设计、流式响应体验
2. **Notion AI**: 文档内AI助手集成方式
3. **Microsoft Copilot**: 企业级AI助手界面
4. **Claude**: 长文本处理、上下文理解展示

### 设计风格建议
- **色彩**: 深色主题为主，体现科技感和专业感
- **布局**: 左侧导航 + 中间内容 + 右侧辅助面板
- **交互**: 微动画、渐进式披露、上下文感知
- **字体**: 现代无衬线字体，代码等宽字体

### 核心界面需求

#### 主对话界面
- **对话区域**: 支持富文本、代码高亮、表格展示
- **输入区域**: 多行输入、快捷指令、附件上传
- **侧边栏**: 对话历史、常用功能入口
- **状态栏**: 数字员工状态、系统信息

#### 知识库管理
- **文档管理**: 上传、删除、状态监控
- **知识图谱**: 可视化知识结构（可选）
- **搜索功能**: 文档内容搜索、筛选

#### 任务管理中心
- **待办事项**: 任务创建、跟踪、完成
- **日程管理**: 日历视图、提醒设置
- **工作看板**: 任务状态可视化

#### 个人设置
- **偏好设置**: 语言、主题、通知偏好
- **历史记录**: 对话历史、知识库使用记录
- **系统配置**: API配置、模型选择

### 交互设计要点
1. **智能提示**: 输入时的智能补全、命令提示
2. **上下文感知**: 根据对话内容推荐相关操作
3. **主动交互**: 数字员工主动提供帮助、提醒
4. **多模态支持**: 文本、语音、图像输入输出

## 部署说明

### 开发环境

1. 启动后端服务：`cd backend && python main.py`
2. 启动前端开发服务器：`cd frontend-react && npm run dev`
3. 访问 http://localhost:5173

### 生产环境

1. 构建前端：`cd frontend-react && npm run build`
2. 启动后端服务：`cd backend && python main.py`
3. 访问 http://localhost:8000/app

## 故障排除

### 1. API代理不工作

检查Vite配置中的代理设置，确保后端服务正在运行。

### 2. 流式响应不工作

确保后端支持SSE（Server-Sent Events）流式响应。

### 3. 样式问题

检查Tailwind CSS配置，确保所有自定义类名正确。

### 4. TypeScript错误

运行 `npm run build` 检查TypeScript错误，确保所有类型定义正确。

## 扩展功能

### 1. 添加新的工作区

在 `ArtifactsContainer.tsx` 中添加新的Tab和对应组件。

### 2. 添加新的快捷指令

在 `InputNexus.tsx` 中的 `quickCommands` 数组添加新指令。

### 3. 添加新的状态类型

在 `types/index.ts` 中扩展 `EmployeeStatus` 类型。

## 性能优化

1. **虚拟滚动**: 对于大量消息，考虑使用虚拟滚动
2. **懒加载**: 对于大型组件，使用React.lazy进行懒加载
3. **缓存**: 使用React Query或SWR进行API缓存
4. **图片优化**: 使用WebP格式和懒加载

## 安全注意事项

1. **输入验证**: 所有用户输入需要验证
2. **XSS防护**: 使用React的自动转义和DOMPurify
3. **CSRF防护**: 实现CSRF令牌
4. **内容安全策略**: 配置CSP头

## 相关链接

- [React文档](https://react.dev/)
- [TypeScript文档](https://www.typescriptlang.org/)
- [Tailwind CSS文档](https://tailwindcss.com/)
- [Framer Motion文档](https://www.framer.com/motion/)
- [Vite文档](https://vitejs.dev/)