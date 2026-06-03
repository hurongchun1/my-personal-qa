# 反攻指令 - 上下文唤醒词

**使用方法**：开启新对话时，直接复制粘贴以下内容：

---

我是数字员工项目的开发者。项目路径：`d:\pythonProject\case-project\my-personal-qa`

**当前状态**：
- 后端FastAPI已完成，API端点已联调（文档CRUD、BGE-M3问答、系统状态）
- 前端React+TS+Tailwind处于V1.0草稿态，只是"打补丁"式的样式修改
- 已有开发日志：`DEVELOPMENT_LOG.md`（记录了所有State名称和API路径）

**我的目标**：
重构前端为"图2风格"的现代SaaS界面，核心是**独立知识库页面**。

**具体要求**：
1. 使用`react-router-dom`实现真正的页面路由（不是useState切换Tab）
2. 知识库页面采用**Bento Grid**网格布局（卡片式、不规则网格）
3. 左侧保留图标侧边栏，点击切换路由
4. 知识库页面要展示：文档卡片、统计信息、最近活动、搜索框
5. 使用Framer Motion做进入/退出动画

**技术栈**：React 19 + TypeScript 6 + Tailwind CSS 4 + Framer Motion 12

**参考风格**：Linear、Notion、Vercel Dashboard那种现代SaaS设计

请先读取`DEVELOPMENT_LOG.md`了解当前技术细节，然后从零开始重构前端架构。

---