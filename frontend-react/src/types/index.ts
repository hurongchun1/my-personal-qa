/**
 * 数字员工工作台类型定义
 */

// 数字员工状态
export type EmployeeStatus = 
  | 'idle'        // 空闲
  | 'thinking'    // 思考中
  | 'reading'     // 阅读中
  | 'executing'   // 执行中
  | 'speaking'    // 输出中

// 引用信息
export interface Citation {
  id: string
  snippet: string
  docName: string
}

// 消息角色
export type MessageRole = 'user' | 'assistant' | 'system'

// 消息类型
export interface Message {
  id: string
  role: MessageRole
  content: string
  timestamp: Date
  citations?: Citation[]
  isStreaming?: boolean
}

// 文档状态
export type DocumentStatus = 'pending' | 'processing' | 'completed' | 'failed'

// 文档信息
export interface Document {
  id: string
  filename: string
  fileType: string
  fileSize: number
  status: DocumentStatus
  chunkCount: number
  createdAt: Date
  updatedAt: Date
}

// 任务状态
export type TaskStatus = 'todo' | 'in_progress' | 'done'

// 任务优先级
export type TaskPriority = 'low' | 'medium' | 'high'

// 任务信息
export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  createdAt: Date
  dueDate?: Date
  completedAt?: Date
}

// 工作区类型
export type ArtifactType = 'knowledge_base' | 'task_board' | 'empty'

// 系统状态
export interface SystemStatus {
  documentCount: number
  dbStatus: 'normal' | 'error'
  apiStatus: 'running' | 'stopped'
  uptime: number
  memoryUsage: number
  storageUsage: number
}

// 用户偏好设置
export interface UserPreferences {
  theme: 'dark' | 'light'
  language: 'zh-CN' | 'en-US'
  notifications: boolean
  autoScroll: boolean
  fontSize: 'small' | 'medium' | 'large'
}

// 对话上下文
export interface ConversationContext {
  conversationId: string
  messages: Message[]
  lastActivity: Date
  metadata?: Record<string, unknown>
}

// API响应格式
export interface ApiResponse<T = unknown> {
  code: number
  msg: string
  data?: T
}

// 流式响应数据
export interface StreamChunk {
  content: string
  done: boolean
  citations?: Citation[]
}

// 文件上传状态
export interface UploadProgress {
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error'
  error?: string
}

// 搜索结果
export interface SearchResult {
  id: string
  title: string
  snippet: string
  score: number
  documentId: string
  documentName: string
}

// 快捷指令
export interface QuickCommand {
  id: string
  name: string
  description: string
  command: string
  icon?: string
}