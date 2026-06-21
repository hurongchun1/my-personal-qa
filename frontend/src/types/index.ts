/**
 * Hermes AI — 类型定义
 * 对齐后端 FastAPI 响应格式
 */

// ═══ 视图路由 ═══
export type ViewType = 'agents' | 'brain' | 'pipelines' | 'settings'

// ═══ 消息 ═══
export type MessageRole = 'user' | 'assistant' | 'system'

export interface Message {
  id: string
  role: MessageRole
  content: string
  timestamp: Date
  citations?: Citation[]
  isStreaming?: boolean
}

export interface Citation {
  id: string
  docName: string
  snippet: string
  pageNumber?: number
}

// ═══ 后端 API 响应 ═══
export interface ApiResponse<T = unknown> {
  code: number
  msg: string
  data: T
}

// ═══ 知识库（对齐后端 knowledge_bases 表） ═══
export interface KnowledgeBase {
  id: number
  name: string
  description: string | null
  tags: string | null
  create_time: string
}

// ═══ 文档（对齐后端 documents 表） ═══
export interface BackendDocument {
  id: number
  file_name: string
  file_type: string
  file_size: number
  chunk_count: number
  status: string
  parse_method: string
  create_time: string
  kb_id?: number | null
}

// ═══ 解析方式选项（对齐后端 supported-types 接口） ═══
export interface ParamInfo {
  name: string
  label: string
  type: string
  default: string
  required: boolean
}

export interface ParseMethodOption {
  name: string
  label: string
  params: ParamInfo[]
}

// ═══ 系统状态（对齐 GET /api/system/status） ═══
export interface SystemStatusData {
  documentCount: number
  dbStatus: string
  apiStatus: string
  uptime: number
  memoryUsage: number
  storageUsage: number
}

// ═══ 知识库卡片（前端视图层） ═══
export interface KBCard {
  id: string
  name: string
  tags: string[]
  description: string
  fileCount: number
  contributors: number
}

// ═══ 聊天请求 ═══
export interface ChatRequest {
  query: string
  k?: number
}

// ═══ 联网搜索请求（对齐后端 WebSearchChatRequest） ═══
export interface WebSearchChatRequest {
  query: string
  use_web: boolean
  k?: number
}

// ═══ 全局 UI 状态 ═══
export type LoadingState = 'idle' | 'loading' | 'success' | 'error'
