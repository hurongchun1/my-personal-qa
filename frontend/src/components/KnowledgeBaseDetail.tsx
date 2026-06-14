import { useState, useEffect, useCallback, useRef } from 'react'
import {
  ArrowLeft, Upload, FileText, Trash2, Loader2, AlertTriangle, Database, Play, X,
} from 'lucide-react'
import { getDocuments, uploadDocument, deleteKnowledgeBase, deleteDocuments, getSupportedMethods, parseDocument } from '../services/api'
import { useToast } from './Toast'
import { useConfirm } from './ConfirmDialog'
import type { BackendDocument, KnowledgeBase, LoadingState, ParseMethodOption, ParamInfo } from '../types'

interface KnowledgeBaseDetailProps {
  kb: KnowledgeBase
  onBack: () => void
}

function formatSize(bytes: number): string {
  if (!bytes) return '0 B'
  const u = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${u[i]}`
}

/**
 * KnowledgeBaseDetail — 知识库详情页
 *
 * 职责：展示该知识库下所有文档，并支持上传新文件
 * "进入知识库" 后才有上传入口
 */
export function KnowledgeBaseDetail({ kb, onBack }: KnowledgeBaseDetailProps) {
  const toast = useToast()
  const confirm = useConfirm()
  const [documents, setDocuments] = useState<BackendDocument[]>([])
  const [state, setState] = useState<LoadingState>('idle')
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [parseMethods, setParseMethods] = useState<Record<number, string>>({})
  const [methodOptions, setMethodOptions] = useState<Record<string, ParseMethodOption[]>>({})
  const [parsingId, setParsingId] = useState<number | null>(null)
  const [parseModal, setParseModal] = useState<{ open: boolean; docId: number | null; docName: string }>({
    open: false, docId: null, docName: '',
  })
  const [parseParams, setParseParams] = useState<Record<string, string>>({
    chunk_size: '512',
    chunk_overlap: '50',
  })
  // 弹窗中当前解析方式对应的参数列表（独立 state，不依赖 methodOptions 查询）
  const [currentMethodParams, setCurrentMethodParams] = useState<ParamInfo[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── 弹窗文档的文件类型 ──
  const parseModalFileType = parseModal.docId
    ? (documents.find((d) => d.id === parseModal.docId)?.file_type || '').replace('.', '').toLowerCase()
    : ''

  // ── 加载文件类型对应的解析方式选项 ──
  const fetchMethodOptions = useCallback(async (docs: BackendDocument[]) => {
    const fileTypes = [...new Set(docs.map((d) => (d.file_type || '').replace('.', '').toLowerCase()).filter(Boolean))]
    console.log('[KB Detail] fetchMethodOptions fileTypes:', fileTypes)
    const newOptions: Record<string, ParseMethodOption[]> = {}
    for (const ft of fileTypes) {
      try {
        const methods = await getSupportedMethods(ft)
        console.log(`[KB Detail] getSupportedMethods(${ft}):`, methods)
        // 如果API返回空数组，也使用默认选项
        newOptions[ft] = methods.length > 0 ? methods : [{ name: 'character', label: '字符分割', params: [] }]
      } catch (err) {
        console.warn(`[KB Detail] getSupportedMethods(${ft}) failed:`, err)
        // 该类型不支持时给默认选项
        newOptions[ft] = [{ name: 'character', label: '字符分割', params: [] }]
      }
    }
    if (Object.keys(newOptions).length > 0) {
      setMethodOptions((prev) => {
        // 只添加之前不存在的选项，避免覆盖已有缓存
        const updated = { ...prev }
        for (const ft in newOptions) {
          if (!updated[ft]) {
            updated[ft] = newOptions[ft]
          }
        }
        return updated
      })
    }
  }, [])

  // ── 从后端动态获取指定解析方式的参数列表 ──
  const getMethodParams = useCallback((method: string): ParamInfo[] => {
    for (const options of Object.values(methodOptions)) {
      const found = options.find((opt) => opt.name === method)
      if (found) return found.params || []
    }
    return []
  }, [methodOptions])

  const fetchDocs = useCallback(async () => {
    setState('loading')
    setError(null)
    try {
      const docs = await getDocuments(kb.id)
      setDocuments(docs)
      setState('success')
      // 加载各文件类型对应的解析方式选项（必须 await，否则弹窗参数为空）
      await fetchMethodOptions(docs)
      // 为新文档设置默认解析方式
      setParseMethods((prev) => {
        const next = { ...prev }
        docs.forEach((doc) => {
          if (!next[doc.id]) {
            // 将数据库中的"default"映射为前端的"character"
            const method = doc.parse_method === 'default' ? 'character' : (doc.parse_method || 'character')
            next[doc.id] = method
          }
        })
        return next
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : '获取文档列表失败'
      setError(msg)
      setState('error')
    }
  }, [kb.id, fetchMethodOptions])

  useEffect(() => {
    fetchDocs()
  }, [fetchDocs])

  // ── 上传文件 ──
  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      await uploadDocument(file, kb.id)
      await fetchDocs()
    } catch (err) {
      console.warn('[KB Detail] 上传失败', err)
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }, [fetchDocs, kb.id])

  // ── 删除知识库 ──
  const handleDelete = useCallback(async () => {
    const confirmed = await confirm({
      title: '确认删除',
      message: `确定删除知识库「${kb.name}」吗？该操作会同时删除其下所有文档，且不可恢复。`,
      confirmText: '删除',
    })
    if (!confirmed) return
    try {
      await deleteKnowledgeBase(kb.id)
      onBack()
    } catch (err) {
      console.warn('[KB Detail] 删除失败', err)
      toast('error', '删除失败，请稍后重试')
    }
  }, [kb.id, kb.name, onBack, confirm, toast])

  // ── 切换单个选中 ──
  const toggleSelect = useCallback((id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  // ── 全选/取消全选 ──
  const toggleSelectAll = useCallback(() => {
    setSelectedIds((prev) => {
      if (prev.size === documents.length) return new Set()
      return new Set(documents.map((d) => d.id))
    })
  }, [documents])

  // ── 切换解析方式 ──
  const handleMethodChange = useCallback((docId: number, method: string) => {
    setParseMethods((prev) => ({ ...prev, [docId]: method }))
  }, [])

  // ── 从 methodOptions 中查找指定方法的参数 ──
  const findMethodParams = useCallback((method: string, ft: string): ParamInfo[] => {
    const options = methodOptions[ft]
    if (!options) return []
    const found = options.find((opt) => opt.name === method)
    return found?.params || []
  }, [methodOptions])

  // ── 点击启动 → 打开参数配置弹窗 ──
  const handleParse = useCallback(async (docId: number, docName: string) => {
    const method = parseMethods[docId] || 'character'

    // 获取文件类型
    const doc = documents.find((d) => d.id === docId)
    const ft = (doc?.file_type || '').replace('.', '').toLowerCase()

    console.log(`[KB Detail] handleParse: docId=${docId}, method=${method}, ft=${ft}`)
    console.log(`[KB Detail] methodOptions[${ft}]:`, methodOptions[ft])

    // 确保该文件类型的解析方法选项已加载
    let optionsForType = methodOptions[ft]
    if (ft && !optionsForType) {
      try {
        const methods = await getSupportedMethods(ft)
        console.log(`[KB Detail] fetched optionsForType:`, methods)
        optionsForType = methods.length > 0 ? methods : [{ name: 'character', label: '字符分割', params: [] } as ParseMethodOption]
        setMethodOptions((prev) => ({ ...prev, [ft]: optionsForType! }))
      } catch (err) {
        console.warn(`[KB Detail] fetch optionsForType failed:`, err)
        optionsForType = [{ name: 'character', label: '字符分割', params: [] } as ParseMethodOption]
        setMethodOptions((prev) => ({ ...prev, [ft]: optionsForType! }))
      }
    }

    // 直接从 optionsForType 中取参数（不依赖 state 更新）
    const found = optionsForType?.find((opt) => opt.name === method)
    const params = found?.params || []
    console.log(`[KB Detail] found params:`, params)

    // 同时设置 currentMethodParams、parseParams 和 parseModal
    // React 18 会批量处理这些 state 更新，弹窗渲染时 currentMethodParams 已就绪
    setCurrentMethodParams(params)
    const defaults: Record<string, string> = {}
    params.forEach((p) => { defaults[p.name] = p.default })
    setParseParams(defaults)
    setParseModal({ open: true, docId, docName })
  }, [parseMethods, documents, methodOptions])

  // ── 弹窗确认 → 调用后端解析接口 ──
  const handleParseConfirm = useCallback(async () => {
    if (!parseModal.docId) return
    const method = parseMethods[parseModal.docId] || 'character'
    setParsingId(parseModal.docId)
    setParseModal({ open: false, docId: null, docName: '' })
    try {
      // 根据当前解析方式决定参数
      const methodParams = findMethodParams(method, parseModalFileType)
      const hasChunkParams = methodParams.some(p => p.name === 'chunk_size' || p.name === 'chunk_overlap')
      
      let chunkSize = 512
      let chunkOverlap = 50
      let restParams = { ...parseParams }
      
      // 只有方法需要这些参数时才使用
      if (hasChunkParams) {
        const { chunk_size, chunk_overlap, ...remainingParams } = parseParams
        chunkSize = parseInt(chunk_size) || 512
        chunkOverlap = parseInt(chunk_overlap) || 50
        restParams = remainingParams
      } else {
        // 对于不需要chunk参数的解析方式（如语义解析），从parseParams中移除这些字段
        const { chunk_size, chunk_overlap, ...remainingParams } = parseParams
        restParams = remainingParams
      }
      
      await parseDocument({
        documentId: parseModal.docId,
        method,
        chunkSize,
        chunkOverlap,
        params: restParams,
      })
      toast('success', '文档解析启动成功！')
      await fetchDocs()
    } catch (err) {
      console.warn('[KB Detail] 启动解析失败', err)
      toast('error', '启动解析失败，请稍后重试')
    } finally {
      setParsingId(null)
    }
  }, [parseModal, parseMethods, parseParams, findMethodParams, parseModalFileType, fetchDocs, toast])

  // ── 批量删除文档 ──
  const handleDeleteDocs = useCallback(async () => {
    const ids = Array.from(selectedIds)
    if (ids.length === 0) return
    const confirmed = await confirm({
      title: '确认删除',
      message: `确定删除选中的 ${ids.length} 个文档吗？`,
      confirmText: '删除',
    })
    if (!confirmed) return
    try {
      await deleteDocuments(ids)
      setSelectedIds(new Set())
      await fetchDocs()
    } catch (err) {
      console.warn('[KB Detail] 删除文档失败', err)
      toast('error', '删除失败，请稍后重试')
    }
  }, [selectedIds, fetchDocs, confirm, toast])

  return (
    <div className="min-h-screen bg-[#020617] overflow-y-auto">
      <div className="p-10 w-full max-w-[1600px] mx-auto">
        {/* ═══ 面包屑 ═══ */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-[#94a3b8] hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          返回知识库列表
        </button>

        {/* ═══ KB 头部 ═══ */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <div className="flex gap-2 mb-3">
              {(kb.tags || '').split(',').filter(Boolean).map((tag) => (
                <span key={tag} className="inline-block bg-[#4f46e5]/20 text-[#c3c0ff] font-semibold text-[10px] px-3 py-1.5 rounded-full uppercase tracking-tight">
                  {tag.trim()}
                </span>
              ))}
            </div>
            <h1 className="text-3xl font-bold text-[#dce1fb] tracking-tight">{kb.name}</h1>
            {kb.description && (
              <p className="text-base text-[#94a3b8] mt-2">{kb.description}</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* ★ 删除知识库按钮 */}
            <button
              onClick={handleDelete}
              className="border border-[#ef4444]/30 hover:bg-[#ef4444]/10 text-[#f87171] px-5 py-3 rounded-xl text-sm font-medium transition-all active:scale-95 whitespace-nowrap flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              删除知识库
            </button>
            {/* ★ 上传文件按钮 —— 只在详情页 */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="bg-[#4f46e5] hover:bg-[#4338ca] text-white px-6 py-3 rounded-xl text-sm font-medium transition-all active:scale-95 whitespace-nowrap flex items-center gap-2 disabled:opacity-60"
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              {uploading ? '上传中...' : 'Upload Document'}
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleUpload}
            accept=".pdf,.html,.md,.txt,.doc,.docx"
            className="hidden"
          />
        </header>

        {/* ═══ 错误提示 ═══ */}
        {state === 'error' && (
          <div className="mb-8 bg-[#7f1d1d]/20 border border-[#ef4444]/30 rounded-xl p-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-[#f87171] shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-[#fca5a5] font-medium">加载失败</p>
              <p className="text-xs text-[#f87171]/70 mt-0.5">{error}</p>
            </div>
            <button onClick={fetchDocs} className="text-xs text-[#fca5a5] hover:text-white underline shrink-0">重试</button>
          </div>
        )}

        {/* ═══ 文档列表 ═══ */}
        {state === 'loading' ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Loader2 className="h-10 w-10 text-[#c3c0ff] animate-spin mb-4" />
            <p className="text-[#94a3b8] text-sm">正在加载文档...</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Database className="h-16 w-16 text-[#334155] mb-6" />
            <p className="text-xl font-semibold text-[#94a3b8] mb-2">暂无文档</p>
            <p className="text-sm text-[#64748b]">
              点击右上角 <span className="text-[#c3c0ff]">Upload Document</span> 上传文件到该知识库
            </p>
          </div>
        ) : (
          <section className="space-y-4">
            {/* 批量操作栏 */}
            {selectedIds.size > 0 && (
              <div className="flex items-center gap-4 px-6 py-3 bg-[#1e293b]/50 border border-white/10 rounded-xl">
                <span className="text-sm text-[#94a3b8]">已选 {selectedIds.size} 项</span>
                <button
                  onClick={handleDeleteDocs}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#ef4444]/20 hover:bg-[#ef4444]/30 text-[#f87171] text-sm font-medium transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  删除选中
                </button>
              </div>
            )}

            {/* 表头 */}
            <div className="grid grid-cols-[40px_1fr_140px_100px_100px_100px_140px_100px] gap-4 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[#64748b] border-b border-white/5">
              <span className="flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={selectedIds.size === documents.length}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 accent-[#4f46e5] cursor-pointer"
                />
              </span>
              <span>文件名</span>
              <span>解析方式</span>
              <span>类型</span>
              <span>大小</span>
              <span>分块数</span>
              <span>上传时间</span>
              <span>操作</span>
            </div>

            {/* 行 */}
            {documents.map((doc) => (
              <div
                key={doc.id}
                className={`grid grid-cols-[40px_1fr_140px_100px_100px_100px_140px_100px] gap-4 px-6 py-4 bg-[#0f172a]/40 border rounded-xl items-center transition-colors ${
                  selectedIds.has(doc.id) ? 'border-[#4f46e5]/40 bg-[#4f46e5]/5' : 'border-white/5 hover:border-white/10'
                }`}
              >
                <span className="flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(doc.id)}
                    onChange={() => toggleSelect(doc.id)}
                    className="w-4 h-4 accent-[#4f46e5] cursor-pointer"
                  />
                </span>
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="h-5 w-5 text-[#94a3b8] shrink-0" />
                  <span className="text-sm text-[#dce1fb] truncate">{doc.file_name}</span>
                </div>
                {/* 解析方式只读显示 */}
                <div className="bg-[#1e293b]/50 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-[#dce1fb]">
                  {(methodOptions[(doc.file_type || '').replace('.', '').toLowerCase()] || [{ name: 'character', label: '字符分割', params: [] }]).find(
                    (opt) => opt.name === (parseMethods[doc.id] || 'character')
                  )?.label || '字符分割'}
                </div>
                <span className="text-sm text-[#94a3b8] uppercase">{doc.file_type || '—'}</span>
                <span className="text-sm text-[#94a3b8]">{formatSize(doc.file_size)}</span>
                <span className="text-sm text-[#94a3b8]">{doc.chunk_count}</span>
                <span className="text-sm text-[#94a3b8]">
                  {doc.create_time ? new Date(doc.create_time).toLocaleDateString('zh-CN') : '—'}
                </span>
                {/* 启动按钮 */}
                <button
                  onClick={() => handleParse(doc.id, doc.file_name)}
                  disabled={parsingId === doc.id}
                  className="flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#22c55e]/20 hover:bg-[#22c55e]/30 text-[#4ade80] text-xs font-medium transition-colors disabled:opacity-50"
                >
                  {parsingId === doc.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Play className="h-3.5 w-3.5" />
                  )}
                  {parsingId === doc.id ? '解析中...' : '启动'}
                </button>
              </div>
            ))}
          </section>
        )}

        <div className="h-16" />
      </div>

      {/* ═══ 解析参数配置弹窗 ═══ */}
      {parseModal.open && parseModal.docId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-[#0f172a] border border-white/10 rounded-2xl p-8 shadow-2xl">
            <button
              onClick={() => setParseModal({ open: false, docId: null, docName: '' })}
              className="absolute top-4 right-4 text-[#94a3b8] hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-xl font-bold text-[#dce1fb] mb-2">配置解析参数</h2>
            <p className="text-sm text-[#64748b] mb-6 truncate">
              文件：{parseModal.docName}
            </p>

            <div className="space-y-5">
              {/* 解析方式选择 */}
              <div>
                <label className="block text-sm font-medium text-[#94a3b8] mb-1.5">解析方式</label>
                <select
                  value={parseMethods[parseModal.docId] || 'character'}
                  onChange={(e) => {
                    const method = e.target.value
                    handleMethodChange(parseModal.docId!, method)
                    // 切换方式时同步更新 currentMethodParams
                    const params = findMethodParams(method, parseModalFileType)
                    setCurrentMethodParams(params)
                    // 重置参数
                    const defaults: Record<string, string> = {}
                    params.forEach((p) => { defaults[p.name] = p.default })
                    setParseParams(defaults)
                  }}
                  className="w-full bg-[#1e293b]/50 border border-white/10 rounded-xl py-3 px-4 text-[#dce1fb] outline-none focus:ring-2 focus:ring-[#4f46e5]/50 cursor-pointer"
                >
                  {(methodOptions[parseModalFileType] || [{ name: 'character', label: '字符分割', params: [] }]).map((opt) => (
                    <option key={opt.name} value={opt.name}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* 动态参数输入框 — 从 currentMethodParams 动态渲染（独立 state，不依赖 methodOptions 查询） */}
              {currentMethodParams.map((param) => (
                <div key={param.name}>
                  <label className="block text-sm font-medium text-[#94a3b8] mb-1.5">{param.label}</label>
                  <input
                    type={param.type}
                    value={parseParams[param.name] || ''}
                    onChange={(e) => setParseParams((prev) => ({ ...prev, [param.name]: e.target.value }))}
                    placeholder={`默认 ${param.default}`}
                    className="w-full bg-[#1e293b]/50 border border-white/10 rounded-xl py-3 px-4 text-[#dce1fb] placeholder:text-[#64748b] outline-none focus:ring-2 focus:ring-[#4f46e5]/50"
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setParseModal({ open: false, docId: null, docName: '' })}
                className="px-5 py-2.5 rounded-xl border border-white/10 text-sm font-medium text-[#94a3b8] hover:bg-white/5 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleParseConfirm}
                className="px-5 py-2.5 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-white text-sm font-medium transition-all active:scale-95 flex items-center gap-2"
              >
                <Play className="h-4 w-4" />
                启动解析
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
