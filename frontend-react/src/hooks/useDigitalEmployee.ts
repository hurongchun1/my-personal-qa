import { useState, useCallback, useEffect, useRef } from 'react'
import type { 
  EmployeeStatus, 
  Message, 
  Document, 
  Task, 
  ArtifactType,
  SystemStatus,
  UserPreferences,
  Citation,
  StreamChunk
} from '../types'
import { api } from '../services/api'

// 生成唯一ID
const generateId = () => Math.random().toString(36).substr(2, 9)

// 模拟数据（后备）
const mockDocuments: Document[] = [
  {
    id: '1',
    filename: '项目需求文档.pdf',
    fileType: 'pdf',
    fileSize: 2048576,
    status: 'completed',
    chunkCount: 45,
    createdAt: new Date('2026-06-01'),
    updatedAt: new Date('2026-06-01'),
  },
  {
    id: '2',
    filename: '技术架构设计.md',
    fileType: 'md',
    fileSize: 512000,
    status: 'completed',
    chunkCount: 23,
    createdAt: new Date('2026-06-02'),
    updatedAt: new Date('2026-06-02'),
  },
  {
    id: '3',
    filename: 'API接口文档.html',
    fileType: 'html',
    fileSize: 1024000,
    status: 'processing',
    chunkCount: 0,
    createdAt: new Date('2026-06-03'),
    updatedAt: new Date('2026-06-03'),
  },
]

const mockTasks: Task[] = [
  {
    id: '1',
    title: '完成用户认证模块',
    description: '实现JWT认证和OAuth2.0集成',
    status: 'in_progress',
    priority: 'high',
    createdAt: new Date('2026-06-01'),
    dueDate: new Date('2026-06-10'),
  },
  {
    id: '2',
    title: '优化数据库查询性能',
    description: '分析慢查询并添加索引',
    status: 'todo',
    priority: 'medium',
    createdAt: new Date('2026-06-02'),
  },
  {
    id: '3',
    title: '编写单元测试',
    description: '为核心模块编写测试用例',
    status: 'done',
    priority: 'low',
    createdAt: new Date('2026-05-28'),
    completedAt: new Date('2026-06-01'),
  },
]

const mockSystemStatus: SystemStatus = {
  documentCount: 3,
  dbStatus: 'normal',
  apiStatus: 'running',
  uptime: 7200,
  memoryUsage: 128,
  storageUsage: 256,
}

// Hook返回类型
interface UseDigitalEmployeeReturn {
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
  clearMessages: () => void
  updatePreferences: (prefs: Partial<UserPreferences>) => void
}

export function useDigitalEmployee(): UseDigitalEmployeeReturn {
  // 核心状态
  const [status, setStatus] = useState<EmployeeStatus>('idle')
  const [messages, setMessages] = useState<Message[]>([
    {
      id: generateId(),
      role: 'assistant',
      content: '你好！我是你的数字员工助手。我可以帮你处理文档、管理任务，或者回答你的问题。有什么我可以帮助你的吗？',
      timestamp: new Date(),
    },
  ])
  const [documents, setDocuments] = useState<Document[]>(mockDocuments)
  const [tasks, setTasks] = useState<Task[]>(mockTasks)
  const [activeArtifact, setActiveArtifact] = useState<ArtifactType>('empty')
  const [systemStatus, setSystemStatus] = useState<SystemStatus>(mockSystemStatus)
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    theme: 'dark',
    language: 'zh-CN',
    notifications: true,
    autoScroll: true,
    fontSize: 'medium',
  })
  const [isStreaming, setIsStreaming] = useState(false)
  
  // 引用
  const streamRef = useRef<boolean>(false)
  
  // 加载初始数据
  useEffect(() => {
    const loadData = async () => {
      try {
        // 尝试从API加载文档
        const docs = await api.document.getDocuments()
        if (docs.length > 0) {
          setDocuments(docs)
        }
        
        // 尝试从API加载系统状态
        const status = await api.system.getStatus()
        setSystemStatus(status)
      } catch (error) {
        console.warn('Failed to load data from API, using mock data:', error)
      }
    }
    
    loadData()
  }, [])
  
  // 发送消息（支持流式响应）
  const sendMessage = useCallback(async (content: string): Promise<void> => {
    if (!content.trim() || isStreaming) return
    
    // 添加用户消息
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    }
    
    setMessages(prev => [...prev, userMessage])
    setStatus('thinking')
    setIsStreaming(true)
    streamRef.current = true
    
    try {
      // 尝试使用流式API
      let fullContent = ''
      let citations: Citation[] = []
      
      // 添加助手消息（开始流式）
      const assistantMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        isStreaming: true,
      }
      
      setMessages(prev => [...prev, assistantMessage])
      setStatus('speaking')
      
      try {
        // 尝试流式API
        for await (const chunk of api.query.streamChat(content)) {
          if (!streamRef.current) break
          
          fullContent += chunk.content
          if (chunk.citations) {
            citations = chunk.citations
          }
          
          setMessages(prev => prev.map(msg => 
            msg.id === assistantMessage.id 
              ? { ...msg, content: fullContent, citations }
              : msg
          ))
        }
      } catch (streamError) {
        console.warn('Stream API failed, falling back to simple chat:', streamError)
        
        // 回退到简单问答
        const answer = await api.query.simpleChat(content)
        fullContent = answer
        
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMessage.id 
            ? { ...msg, content: fullContent }
            : msg
        ))
      }
      
      // 完成流式
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessage.id 
          ? { ...msg, isStreaming: false }
          : msg
      ))
      
    } catch (error) {
      console.error('Failed to send message:', error)
      
      // 添加错误消息
      const errorMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: '抱歉，处理您的请求时出现了错误。请稍后重试。',
        timestamp: new Date(),
      }
      
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setStatus('idle')
      setIsStreaming(false)
      streamRef.current = false
      
      // 根据查询内容自动切换工作区
      if (content.includes('文档') || content.includes('知识库')) {
        setActiveArtifact('knowledge_base')
      } else if (content.includes('任务') || content.includes('待办')) {
        setActiveArtifact('task_board')
      }
    }
  }, [isStreaming])
  
  // 添加文档
  const addDocument = useCallback(async (file: File): Promise<void> => {
    setStatus('reading')
    
    try {
      // 尝试通过API上传
      await api.document.uploadDocument(file)
      
      // 上传成功后重新加载文档列表
      const docs = await api.document.getDocuments()
      setDocuments(docs)
      
      // 更新系统状态
      const status = await api.system.getStatus()
      setSystemStatus(status)
    } catch (error) {
      console.warn('Failed to upload via API, using mock:', error)
      
      // 使用模拟数据
      const newDocument: Document = {
        id: generateId(),
        filename: file.name,
        fileType: file.name.split('.').pop() || 'unknown',
        fileSize: file.size,
        status: 'processing',
        chunkCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      
      setDocuments(prev => [...prev, newDocument])
      
      // 模拟处理时间
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setDocuments(prev => prev.map(doc => 
        doc.id === newDocument.id 
          ? { 
              ...doc, 
              status: 'completed', 
              chunkCount: Math.floor(Math.random() * 50) + 10,
              updatedAt: new Date() 
            }
          : doc
      ))
      
      // 更新系统状态
      setSystemStatus(prev => ({
        ...prev,
        documentCount: prev.documentCount + 1,
      }))
    }
    
    setStatus('idle')
  }, [])
  
  // 删除文档
  const deleteDocument = useCallback(async (id: string): Promise<void> => {
    try {
      await api.document.deleteDocument(id)
    } catch (error) {
      console.warn('Failed to delete via API:', error)
    }
    
    setDocuments(prev => prev.filter(doc => doc.id !== id))
    setSystemStatus(prev => ({
      ...prev,
      documentCount: prev.documentCount - 1,
    }))
  }, [])
  
  // 处理文档
  const processDocument = useCallback(async (id: string): Promise<void> => {
    setDocuments(prev => prev.map(doc => 
      doc.id === id 
        ? { ...doc, status: 'processing', updatedAt: new Date() }
        : doc
    ))
    
    try {
      await api.document.processDocument(id)
    } catch (error) {
      console.warn('Failed to process via API:', error)
    }
    
    // 模拟处理时间
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    setDocuments(prev => prev.map(doc => 
      doc.id === id 
        ? { 
            ...doc, 
            status: 'completed', 
            chunkCount: Math.floor(Math.random() * 50) + 10,
            updatedAt: new Date() 
          }
        : doc
    ))
  }, [])
  
  // 切换任务状态
  const toggleTask = useCallback((id: string): void => {
    setTasks(prev => prev.map(task => {
      if (task.id !== id) return task
      
      const newStatus: Task['status'] = 
        task.status === 'done' ? 'todo' : 
        task.status === 'todo' ? 'in_progress' : 'done'
      
      return {
        ...task,
        status: newStatus,
        completedAt: newStatus === 'done' ? new Date() : undefined,
      }
    }))
  }, [])
  
  // 添加任务
  const addTask = useCallback((title: string, description?: string, priority: Task['priority'] = 'medium'): void => {
    const newTask: Task = {
      id: generateId(),
      title,
      description,
      status: 'todo',
      priority,
      createdAt: new Date(),
    }
    
    setTasks(prev => [...prev, newTask])
  }, [])
  
  // 清空消息
  const clearMessages = useCallback((): void => {
    setMessages([{
      id: generateId(),
      role: 'assistant',
      content: '你好！我是你的数字员工助手。我可以帮你处理文档、管理任务，或者回答你的问题。有什么我可以帮助你的吗？',
      timestamp: new Date(),
    }])
  }, [])
  
  // 更新偏好设置
  const updatePreferences = useCallback((prefs: Partial<UserPreferences>): void => {
    setUserPreferences(prev => ({ ...prev, ...prefs }))
  }, [])
  
  // 定期更新系统状态（模拟）
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const status = await api.system.getStatus()
        setSystemStatus(status)
      } catch {
        // 使用模拟数据
        setSystemStatus(prev => ({
          ...prev,
          uptime: prev.uptime + 60,
          memoryUsage: prev.memoryUsage + Math.random() * 10 - 5,
        }))
      }
    }, 60000) // 每分钟更新
    
    return () => clearInterval(interval)
  }, [])
  
  return {
    // 状态
    status,
    messages,
    documents,
    tasks,
    activeArtifact,
    systemStatus,
    userPreferences,
    isStreaming,
    
    // 操作
    sendMessage,
    setStatus,
    setActiveArtifact,
    addDocument,
    deleteDocument,
    processDocument,
    toggleTask,
    addTask,
    clearMessages,
    updatePreferences,
  }
}