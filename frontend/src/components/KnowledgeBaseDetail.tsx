import { useState, useEffect, useCallback, useRef } from 'react'
import {
  ArrowLeft, Upload, FileText, Trash2, Loader2, AlertTriangle, Database, Play, X,
} from 'lucide-react'
import { getDocuments, uploadDocument, deleteKnowledgeBase, deleteDocuments, getSupportedMethods } from '../services/api'
import type { BackendDocument, KnowledgeBase, LoadingState, ParseMethodOption } from '../types'

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
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── 弹窗文档的文件类型 ──
  const parseModalFileType = parseModal.docId
    ? (documents.find((d) => d.id === parseModal.docId)?.file_type || '').replace('.', '').toLowerCase()
    : ''

  // ── 加载文件类型对应的解析方式选项 ──
  const fetchMethodOptions = useCallback(async (docs: BackendDocument[]) => {
    const fileTypes = [...new Set(docs.map((d) => (d.file_type || '').replace('.', '').toLowerCase()).filter(Boolean))]
    const newOptions: Record<string, ParseMethodOption[]> = {}
    for (const ft of fileTypes) {
      try {
        const methods = await getSupportedMethods(ft)
        // 如果API返回空数组，也使用默认选项
        newOptions[ft] = methods.length > 0 ? methods : [{ value: 'default', label: '默认分块' }]
      } catch {
        // 该类型不支持时给默认选项
        newOptions[ft] = [{ value: 'default', label: '默认分块' }]
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

  // ── 每种解析方式需要的参数配置 ──
  const METHOD_PARAMS: Record<string, { key: string; label: string; type: string; placeholder: string; default: string }[]> = {
    default: [
      { key: 'chunk_size', label: '分块大小', type: 'number', placeholder: '默认 512', default: '512' },
      { key: 'chunk_overlap', label: '重叠大小', type: 'number', placeholder: '默认 50', default: '50' },
    ],
    token: [
      { key: 'chunk_size', label: '分块大小', type: 'number', placeholder: '默认 512', default: '512' },
      { key: 'chunk_overlap', label: '重叠大小', type: 'number', placeholder: '默认 50', default: '50' },
    ],
    character: [
      { key: 'chunk_size', label: '分块大小', type: 'number', placeholder: '默认 512', default: '512' },
      { key: 'chunk_overlap', label: '重叠大小', type: 'number', placeholder: '默认 50', default: '50' },
    ],
    semantic: [], // 语义分割无需额外参数
  }

  const fetchDocs = useCallback(async () => {
    setState('loading')
    setError(null)
    try {
      const docs = await getDocuments(kb.id)
      setDocuments(docs)
      setState('success')
      // 加载各文件类型对应的解析方式选项
      fetchMethodOptions(docs)
      // 为新文档设置默认解析方式
      setParseMethods((prev) => {
        const next = { ...prev }
        docs.forEach((doc) => {
          if (!next[doc.id]) next[doc.id] = doc.parse_method || 'default'
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
    if (!window.confirm(`确定删除知识库「${kb.name}」吗？\n该操作会同时删除其下所有文档，且不可恢复。`)) return
    try {
      await deleteKnowledgeBase(kb.id)
      onBack()
    } catch (err) {
      console.warn('[KB Detail] 删除失败', err)
      alert('删除失败，请稍后重试')
    }
  }, [kb.id, kb.name, onBack])

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

  // ── 点击启动 → 打开参数配置弹窗 ──
  const handleParse = useCallback((docId: number, docName: string) => {
    const method = parseMethods[docId] || 'default'
    const params = METHOD_PARAMS[method] || []
    // 重置参数为默认值
    const defaults: Record<string, string> = {}
    params.forEach((p) => { defaults[p.key] = p.default })
    setParseParams(defaults)
    setParseModal({ open: true, docId, docName })
  }, [parseMethods])

  // ── 弹窗确认 → 调用后端解析接口 ──
  const handleParseConfirm = useCallback(async () => {
    if (!parseModal.docId) return
    const method = parseMethods[parseModal.docId] || 'default'
    setParsingId(parseModal.docId)
    setParseModal({ open: false, docId: null, docName: '' })
    try {
      // TODO: 调用后端解析接口，替换为实际 API
      // await parseDocument(parseModal.docId, method, parseParams)
      await new Promise((resolve) => setTimeout(resolve, 1500)) // 模拟请求
      alert(`文档解析启动成功！\n解析方式：${method}\n参数：${JSON.stringify(parseParams)}`)
      await fetchDocs()
    } catch (err) {
      console.warn('[KB Detail] 启动解析失败', err)
      alert('启动解析失败，请稍后重试')
    } finally {
      setParsingId(null)
    }
  }, [parseModal, parseMethods, parseParams, fetchDocs])

  // ── 批量删除文档 ──
  const handleDeleteDocs = useCallback(async () => {
    const ids = Array.from(selectedIds)
    if (ids.length === 0) return
    if (!window.confirm(`确定删除选中的 ${ids.length} 个文档吗？`)) return
    try {
      await deleteDocuments(ids)
      setSelectedIds(new Set())
      await fetchDocs()
    } catch (err) {
      console.warn('[KB Detail] 删除文档失败', err)
      alert('删除失败，请稍后重试')
    }
  }, [selectedIds, fetchDocs])

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
                {/* 解析方式下拉选择 */}
                <select
                  value={parseMethods[doc.id] || 'default'}
                  onChange={(e) => handleMethodChange(doc.id, e.target.value)}
                  disabled={parsingId === doc.id}
                  className="bg-[#1e293b]/50 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-[#dce1fb] outline-none focus:ring-2 focus:ring-[#4f46e5]/50 disabled:opacity-50 cursor-pointer"
                >
                  {(methodOptions[(doc.file_type || '').replace('.', '').toLowerCase()] || [{ value: 'default', label: '默认分块' }]).map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
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
                  value={parseMethods[parseModal.docId] || 'default'}
                  onChange={(e) => {
                    const method = e.target.value
                    handleMethodChange(parseModal.docId!, method)
                    // 切换方式时重置参数
                    const params = METHOD_PARAMS[method] || []
                    const defaults: Record<string, string> = {}
                    params.forEach((p) => { defaults[p.key] = p.default })
                    setParseParams(defaults)
                  }}
                  className="w-full bg-[#1e293b]/50 border border-white/10 rounded-xl py-3 px-4 text-[#dce1fb] outline-none focus:ring-2 focus:ring-[#4f46e5]/50 cursor-pointer"
                >
                  {(methodOptions[parseModalFileType] || [{ value: 'default', label: '默认分块' }]).map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* 动态参数输入框 */}
              {(METHOD_PARAMS[parseMethods[parseModal.docId] || 'default'] || []).map((param) => (
                <div key={param.key}>
                  <label className="block text-sm font-medium text-[#94a3b8] mb-1.5">{param.label}</label>
                  <input
                    type={param.type}
                    value={parseParams[param.key] || ''}
                    onChange={(e) => setParseParams((prev) => ({ ...prev, [param.key]: e.target.value }))}
                    placeholder={param.placeholder}
                    className="w-full bg-[#1e293b]/50 border border-white/10 rounded-xl py-3 px-4 text-[#dce1fb] placeholder:text-[#64748b] outline-none focus:ring-2 focus:ring-[#4f46e5]/50"
                  />
                </div>
              ))}

              {/* 语义分割提示 */}
              {parseMethods[parseModal.docId] === 'semantic' && (
                <div className="bg-[#4f46e5]/10 border border-[#4f46e5]/20 rounded-xl p-4">
                  <p className="text-xs text-[#c3c0ff]">
                    语义分割将使用内置的 Embedding 模型进行智能分块，无需额外参数配置。
                  </p>
                </div>
              )}
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
