/**
 * Hermes AI — 统一 API 请求层
 * 基于 Axios，对齐后端 FastAPI 接口规范
 */
import axios, { type AxiosInstance, type AxiosError } from 'axios'
import type { ApiResponse, BackendDocument, KnowledgeBase, SystemStatusData, ChatRequest, ParseMethodOption } from '../types'

/* ═══════════════════════════════════════════════
   Axios 实例
   ═══════════════════════════════════════════════ */
const http: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

/* ═══════════════════════════════════════════════
   全局拦截器
   ═══════════════════════════════════════════════ */
http.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResponse>) => {
    const msg = error.response?.data?.msg || error.message || '网络请求失败'
    console.warn('[API Error]', msg, error.config?.url)
    return Promise.reject(new Error(msg))
  },
)

/* ═══════════════════════════════════════════════
   系统状态
   ═══════════════════════════════════════════════ */
export async function getSystemStatus(): Promise<SystemStatusData> {
  const { data } = await http.get<ApiResponse<SystemStatusData>>('/system/status')
  return data.data
}

/* ═══════════════════════════════════════════════
   知识库管理
   ═══════════════════════════════════════════════ */
export async function getKnowledgeBases(): Promise<KnowledgeBase[]> {
  const { data } = await http.get<ApiResponse<KnowledgeBase[]>>('/knowledges/list_knowledges')
  return data.data
}

export async function createKnowledgeBase(body: {
  name: string
  description: string
  tags: string
}): Promise<string> {
  const { data } = await http.post<ApiResponse<string>>('/knowledges/add_knowledges', body)
  return data.data
}

export async function deleteKnowledgeBase(kbId: number): Promise<string> {
  const { data } = await http.delete<ApiResponse<string>>(`/knowledges/${kbId}`)
  return data.data
}

/* ═══════════════════════════════════════════════
   文档管理
   ═══════════════════════════════════════════════ */
export async function getDocuments(kbId: number): Promise<BackendDocument[]> {
  const { data } = await http.get<ApiResponse<BackendDocument[]>>('/documents/list_documents', {
    params: { kb_id: kbId },
  })
  return data.data
}

export async function uploadDocument(file: File, kbId: number): Promise<number> {
  const form = new FormData()
  form.append('file', file)
  form.append('kb_id', String(kbId))
  const { data } = await http.post<ApiResponse<number>>('/documents/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data.data
}

export async function deleteDocuments(ids: number[]): Promise<string> {
  const { data } = await http.post<ApiResponse<string>>('/documents/delete_documents', { ids })
  return data.data
}

export async function getSupportedMethods(fileType: string): Promise<ParseMethodOption[]> {
  const { data } = await http.get<ApiResponse<ParseMethodOption[]>>('/documents/supported-types', {
    params: { file_type: fileType },
  })
  return data.data
}

/* ═══════════════════════════════════════════════
   对话问答
   ═══════════════════════════════════════════════ */
export async function sendMessage(params: ChatRequest): Promise<string> {
  const { data } = await http.post<ApiResponse<string>>('/query/simple_chat', {
    query: params.query,
    k: params.k ?? 3,
  })
  return data.data
}

/**
 * 重写问答（支持对话历史 + 上下文）
 */
export async function sendRewrittenMessage(
  query: string,
  conversationHistory: string,
  contextInfo: string,
  k = 3,
): Promise<string> {
  const { data } = await http.post<ApiResponse<string>>('/query/rewritten_chat', {
    query,
    conversation_history: conversationHistory,
    context_info: contextInfo,
    k,
  })
  return data.data
}

export default http
