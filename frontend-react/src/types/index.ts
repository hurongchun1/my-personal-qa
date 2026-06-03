/**
 * 数字员工工作台 V2.0 类型定义
 * 旗舰级 UI 架构 - 类型安全
 */

// ==================== 核心枚举 ====================

// 数字员工状态
export type EmployeeStatus = 
  | 'idle'        // 空闲
  | 'thinking'    // 思考中
  | 'reading'     // 阅读中
  | 'executing'   // 执行中
  | 'speaking'    // 输出中

// 消息角色
export type MessageRole = 'user' | 'assistant' | 'system'

// 文档状态
export type DocumentStatus = 'pending' | 'processing' | 'completed' | 'failed'

// 任务状态
export type TaskStatus = 'todo' | 'in_progress' | 'done'

// 任务优先级
export type TaskPriority = 'low' | 'medium' | 'high'

// 工作区类型
export type ArtifactType = 'knowledge_base' | 'task_board' | 'empty'

// 视图路由
export type ViewRoute = 'console' | 'knowledge-hub'

// ==================== 数据接口 ====================

// 引用信息
export interface Citation {
  id: string
  snippet: string
  docName: string
  pageNumber?: number
  relevanceScore?: number
}

// 消息类型
export interface Message {
  id: string
  role: MessageRole
  content: string
  timestamp: Date
  citations?: Citation[]
  isStreaming?: boolean
  artifacts?: ArtifactData[]
}

// 成果数据
export interface ArtifactData {
  type: 'code' | 'chart' | 'table' | 'image'
  title: string
  content: string
  language?: string
}

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
  vectorProgress?: number
  tags?: string[]
  description?: string
}

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
  tags?: string[]
}

// ==================== 系统接口 ====================

// 系统状态
export interface SystemStatus {
  documentCount: number
  dbStatus: 'normal' | 'error'
  apiStatus: 'running' | 'stopped'
  uptime: number
  memoryUsage: number
  storageUsage: number
  vectorDbStatus?: 'connected' | 'disconnected'
  embeddingModel?: string
}

// 用户偏好设置
export interface UserPreferences {
  theme: 'dark' | 'light'
  language: 'zh-CN' | 'en-US'
  notifications: boolean
  autoScroll: boolean
  fontSize: 'small' | 'medium' | 'large'
  sidebarCollapsed: boolean
}

// ==================== API 接口 ====================

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
  artifacts?: ArtifactData[]
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
  pageNumber?: number
}

// 快捷指令
export interface QuickCommand {
  id: string
  name: string
  description: string
  command: string
  icon?: string
  category?: 'document' | 'task' | 'system' | 'general'
}

// ==================== 组件 Props 接口 ====================

// Sidebar 组件 Props
export interface SidebarProps {
  currentView: ViewRoute
  onViewChange: (view: ViewRoute) => void
  status: EmployeeStatus
  isCollapsed: boolean
  onToggleCollapse: () => void
}

// StatusBar 组件 Props
export interface StatusBarProps {
  status: EmployeeStatus
  currentAction?: string
  systemStatus: SystemStatus
}

// ChatStream 组件 Props
export interface ChatStreamProps {
  messages: Message[]
  isStreaming: boolean
  onCitationClick?: (citation: Citation) => void
}

// InputNexus 组件 Props
export interface InputNexusProps {
  onSendMessage: (content: string) => Promise<void>
  onFileDrop?: (files: FileList) => void
  disabled?: boolean
  quickCommands?: QuickCommand[]
}

// ArtifactsContainer 组件 Props
export interface ArtifactsContainerProps {
  activeArtifact: ArtifactType
  documents: Document[]
  tasks: Task[]
  onArtifactChange: (artifact: ArtifactType) => void
  onDocumentUpload?: (file: File) => void
  onDocumentDelete?: (id: string) => void
  onDocumentProcess?: (id: string) => void
  onTaskToggle?: (id: string) => void
  onTaskAdd?: (title: string, description?: string, priority?: Task['priority']) => void
}

// KnowledgeBase 组件 Props
export interface KnowledgeBaseProps {
  documents: Document[]
  onUpload?: (file: File) => void
  onDelete?: (id: string) => void
  onProcess?: (id: string) => void
  searchQuery?: string
  onSearch?: (query: string) => void
}

// TaskBoard 组件 Props
export interface TaskBoardProps {
  tasks: Task[]
  onToggle?: (id: string) => void
  onAdd?: (title: string, description?: string, priority?: Task['priority']) => void
  onDelete?: (id: string) => void
}

// KnowledgeHub 组件 Props
export interface KnowledgeHubProps {
  documents: Document[]
  systemStatus: SystemStatus
  onDocumentUpload?: (file: File) => void
  onDocumentDelete?: (id: string) => void
  onDocumentProcess?: (id: string) => void
  onSearch?: (query: string) => void
}

// DigitalEmployee 组件 Props
export interface DigitalEmployeeProps {
  messages: Message[]
  documents: Document[]
  tasks: Task[]
  systemStatus: SystemStatus
  isStreaming: boolean
  status: EmployeeStatus
  onSendMessage: (content: string) => Promise<void>
  onFileDrop?: (files: FileList) => void
  onArtifactChange?: (artifact: ArtifactType) => void
  onDocumentUpload?: (file: File) => void
  onDocumentDelete?: (id: string) => void
  onDocumentProcess?: (id: string) => void
  onTaskToggle?: (id: string) => void
  onTaskAdd?: (title: string, description?: string, priority?: Task['priority']) => void
}

// ==================== Hook 返回类型 ====================

export interface UseDigitalEmployeeReturn {
  // 状态
  status: EmployeeStatus
  messages: Message[]
  documents: Document[]
  tasks: Task[]
  activeArtifact: ArtifactType
  systemStatus: SystemStatus
  userPreferences: UserPreferences
  isStreaming: boolean
  
  // 操作
  sendMessage: (content: string) => Promise<void>
  setStatus: (status: EmployeeStatus) => void
  setActiveArtifact: (artifact: ArtifactType) => void
  addDocument: (file: File) => Promise<void>
  deleteDocument: (id: string) => Promise<void>
  processDocument: (id: string) => Promise<void>
  toggleTask: (id: string) => void
  addTask: (title: string, description?: string, priority?: Task['priority']) => void
  deleteTask: (id: string) => void
  clearMessages: () => void
  updatePreferences: (prefs: Partial<UserPreferences>) => void
  searchDocuments: (query: string) => Promise<SearchResult[]>
}

// ==================== 工具类型 ====================

// 状态配置
export interface StatusConfig {
  icon: string
  label: string
  color: string
  bgColor: string
  glowColor: string
}

// 文件类型图标映射
export type FileTypeIconMap = Record<string, string>

// 统计数据
export interface DashboardStats {
  totalDocuments: number
  completedDocuments: number
  processingDocuments: number
  totalChunks: number
  totalTasks: number
  completedTasks: number
  pendingTasks: number
  inProgressTasks: number
  uptime: number
  memoryUsage: number
  storageUsage: number
}

// 最近活动
export interface RecentActivity {
  id: string
  type: 'document_upload' | 'document_process' | 'document_delete' | 'task_create' | 'task_complete' | 'chat_message'
  title: string
  description: string
  timestamp: Date
  metadata?: Record<string, unknown>
}