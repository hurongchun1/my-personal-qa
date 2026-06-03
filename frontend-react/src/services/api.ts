/**
 * API服务层 - 与FastAPI后端通信
 */

import type { ApiResponse, StreamChunk, Document, SystemStatus } from '../types'

const API_BASE = '/api'

// 数据转换函数：将API返回的下划线命名数据转换为驼峰命名
function convertDocument(apiDoc: Record<string, unknown>): Document {
  return {
    id: apiDoc.id as string,
    filename: apiDoc.file_name as string,
    fileType: apiDoc.file_type as string,
    fileSize: apiDoc.file_size as number,
    status: apiDoc.status as Document['status'],
    chunkCount: apiDoc.chunk_count as number,
    createdAt: new Date(apiDoc.create_time as string),
    updatedAt: new Date(apiDoc.create_time as string), // API没有返回update_time，使用create_time
  }
}

// 通用请求函数
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE}${endpoint}`
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
    },
  }
  
  const response = await fetch(url, { ...defaultOptions, ...options })
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.msg || `HTTP error! status: ${response.status}`)
  }
  
  return response.json()
}

// 流式请求函数
async function* streamRequest(
  endpoint: string,
  body: unknown
): AsyncGenerator<StreamChunk, void, unknown> {
  const url = `${API_BASE}${endpoint}`
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.msg || `HTTP error! status: ${response.status}`)
  }
  
  const reader = response.body?.getReader()
  if (!reader) {
    throw new Error('Response body is not readable')
  }
  
  const decoder = new TextDecoder()
  let buffer = ''
  
  try {
    while (true) {
      const { done, value } = await reader.read()
      
      if (done) {
        break
      }
      
      buffer += decoder.decode(value, { stream: true })
      
      // 处理SSE格式
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6)
          
          if (data === '[DONE]') {
            return
          }
          
          try {
            const chunk: StreamChunk = JSON.parse(data)
            yield chunk
          } catch {
            // 忽略解析错误
          }
        }
      }
    }
  } finally {
    reader.releaseLock()
  }
}

// 文档相关API
export const documentApi = {
  // 获取文档列表
  async getDocuments(): Promise<Document[]> {
    const response = await request<Record<string, unknown>[]>('/documents')
    if (!response.data) return []
    return response.data.map(convertDocument)
  },
  
  // 上传文档
  async uploadDocument(file: File): Promise<Document> {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await fetch(`${API_BASE}/documents/upload`, {
      method: 'POST',
      body: formData,
    })
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.msg || 'Upload failed')
    }
    
    const result = await response.json()
    return result.data
  },
  
  // 删除文档
  async deleteDocument(id: string): Promise<void> {
    await request(`/documents/${id}`, { method: 'DELETE' })
  },
  
  // 处理文档
  async processDocument(id: string): Promise<void> {
    await request(`/documents/${id}/process`, { method: 'POST' })
  },
}

// 查询相关API
export const queryApi = {
  // 简单问答
  async simpleChat(query: string, k: number = 3): Promise<string> {
    const response = await request<string>('/query/simple_chat', {
      method: 'POST',
      body: JSON.stringify({ query, k }),
    })
    return response.data || ''
  },
  
  // 重写问答
  async rewrittenChat(
    query: string,
    conversationHistory?: string[],
    contextInfo?: string,
    k: number = 3
  ): Promise<string> {
    const response = await request<string>('/query/rewritten_chat', {
      method: 'POST',
      body: JSON.stringify({
        query,
        conversation_history: conversationHistory,
        context_info: contextInfo,
        k,
      }),
    })
    return response.data || ''
  },
  
  // 流式问答（需要后端支持SSE）
  async* streamChat(query: string, k: number = 3): AsyncGenerator<StreamChunk, void, unknown> {
    yield* streamRequest('/query/stream_chat', { query, k })
  },
}

// 系统相关API
export const systemApi = {
  // 获取系统状态
  async getStatus(): Promise<SystemStatus> {
    const response = await request<SystemStatus>('/system/status')
    return response.data || {
      documentCount: 0,
      dbStatus: 'normal',
      apiStatus: 'running',
      uptime: 0,
      memoryUsage: 0,
      storageUsage: 0,
    }
  },
  
  // 健康检查
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch('/health')
      return response.ok
    } catch {
      return false
    }
  },
}

// 导出所有API
export const api = {
  document: documentApi,
  query: queryApi,
  system: systemApi,
}