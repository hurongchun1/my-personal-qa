import { useState, useEffect, useCallback } from 'react'
import {
  Search, Plus, Database, ArrowRight, Trash2,
  Loader2, AlertTriangle, X,
} from 'lucide-react'
import { getKnowledgeBases, createKnowledgeBase, deleteKnowledgeBase } from '../services/api'
import type { KnowledgeBase, LoadingState } from '../types'

/* ═══════════════════════════════════════════════════════════════
   类型
   ═══════════════════════════════════════════════════════════════ */
interface KnowledgeBaseCenterProps {
  onEnterKB: (kb: KnowledgeBase) => void
}

/* ═══════════════════════════════════════════════════════════════
   工具函数
   ═══════════════════════════════════════════════════════════════ */
function parseTags(tags: string | null): string[] {
  if (!tags) return []
  return tags.split(',').map((t) => t.trim()).filter(Boolean)
}

/* ═══════════════════════════════════════════════════════════════
   知识库卡片
   ═══════════════════════════════════════════════════════════════ */
function KnowledgeCard({
  kb, index, onEnter, onDelete,
}: {
  kb: KnowledgeBase; index: number
  onEnter: (kb: KnowledgeBase) => void
  onDelete: (kb: KnowledgeBase) => void
}) {
  const tags = parseTags(kb.tags)
  return (
    <div
      className="relative bg-[#0f172a]/60 backdrop-blur-md border border-white/10 rounded-2xl p-8 flex flex-col h-full hover:border-[#4f46e5]/40 transition-colors"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex gap-2 mb-4">
        {tags.map((tag, ti) => (
          <span
            key={ti}
            className={`inline-block font-semibold text-[10px] px-3 py-1.5 rounded-full uppercase tracking-tight ${
              ti === 0 ? 'bg-white/10 text-[#94a3b8]' : 'bg-[#4f46e5]/20 text-[#c3c0ff]'
            }`}
          >
            {tag}
          </span>
        ))}
      </div>
      <h3 className="text-xl font-semibold text-[#dce1fb] mb-4">{kb.name}</h3>
      <p className="text-base text-[#94a3b8] flex-1 mb-8 leading-relaxed line-clamp-3">
        {kb.description || '暂无描述'}
      </p>
      <div className="pt-5 border-t border-white/10 flex items-center justify-between">
        <span className="text-[11px] text-[#94a3b8]">
          {kb.create_time ? new Date(kb.create_time).toLocaleDateString('zh-CN') : '—'}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(kb) }}
            className="p-2 rounded-lg text-[#64748b] hover:text-[#f87171] hover:bg-[#f87171]/10 transition-colors"
            title="删除知识库"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => onEnter(kb)}
            className="group/link flex items-center gap-1 text-sm font-medium text-[#94a3b8] hover:text-white transition-colors"
          >
            进入知识库
            <ArrowRight className="h-4 w-4 transition-transform group-hover/link:translate-x-1" />
          </button>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   创建知识库弹窗
   ═══════════════════════════════════════════════════════════════ */
function CreateKBModal({
  open, onClose, onCreate,
}: {
  open: boolean
  onClose: () => void
  onCreate: (name: string, description: string, tags: string) => Promise<void>
}) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!open) return null

  const handleSubmit = async () => {
    if (!name.trim()) return
    setSubmitting(true)
    try {
      await onCreate(name.trim(), description.trim(), tagsInput.trim())
      setName(''); setDescription(''); setTagsInput('')
      onClose()
    } catch (err) {
      console.warn('[CreateKB] 创建失败', err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-[#0f172a] border border-white/10 rounded-2xl p-8 shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-[#94a3b8] hover:text-white transition-colors">
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-xl font-bold text-[#dce1fb] mb-6">新建知识库</h2>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#94a3b8] mb-1.5">知识库名称 *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="知识库名称"
              className="w-full bg-[#1e293b]/50 border border-white/10 rounded-xl py-3 px-4 text-[#dce1fb] placeholder:text-[#64748b] outline-none focus:ring-2 focus:ring-[#4f46e5]/50"
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#94a3b8] mb-1.5">描述</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="简要描述该知识库的用途..."
              rows={3}
              className="w-full bg-[#1e293b]/50 border border-white/10 rounded-xl py-3 px-4 text-[#dce1fb] placeholder:text-[#64748b] outline-none focus:ring-2 focus:ring-[#4f46e5]/50 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#94a3b8] mb-1.5">标签（逗号分隔）</label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="售前线, 价格调研"
              className="w-full bg-[#1e293b]/50 border border-white/10 rounded-xl py-3 px-4 text-[#dce1fb] placeholder:text-[#64748b] outline-none focus:ring-2 focus:ring-[#4f46e5]/50"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-white/10 text-sm font-medium text-[#94a3b8] hover:bg-white/5 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name.trim() || submitting}
            className="px-5 py-2.5 rounded-xl bg-[#4f46e5] hover:bg-[#4338ca] text-white text-sm font-medium transition-all active:scale-95 disabled:opacity-40"
          >
            {submitting ? '创建中...' : '创建知识库'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   KnowledgeBaseCenter — 主组件
   ═══════════════════════════════════════════════════════════════ */
export function KnowledgeBaseCenter({ onEnterKB }: KnowledgeBaseCenterProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [state, setState] = useState<LoadingState>('idle')
  const [error, setError] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [kbList, setKbList] = useState<KnowledgeBase[]>([])

  // ── 拉取知识库列表 ──
  const loadData = useCallback(async () => {
    setState('loading')
    setError(null)
    try {
      const list = await getKnowledgeBases()
      setKbList(list)
      setState('success')
    } catch (err) {
      const msg = err instanceof Error ? err.message : '获取知识库数据失败'
      setError(msg)
      setState('error')
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // ── 创建知识库 ──
  const handleCreateKB = async (name: string, description: string, tags: string) => {
    await createKnowledgeBase({ name, description, tags })
    await loadData() // 刷新列表
  }

  // ── 删除知识库 ──
  const handleDeleteKB = async (kb: KnowledgeBase) => {
    if (!window.confirm(`确定删除知识库「${kb.name}」吗？\n该操作会同时删除其下所有文档，且不可恢复。`)) return
    try {
      await deleteKnowledgeBase(kb.id)
      await loadData()
    } catch (err) {
      console.warn('[DeleteKB] 删除失败', err)
      alert('删除失败，请稍后重试')
    }
  }

  // ── 进入知识库 ──
  const handleEnter = (kb: KnowledgeBase) => {
    onEnterKB(kb)
  }

  // ── 派生数据 ──
  const filteredKBs = searchQuery
    ? kbList.filter(
        (kb) =>
          kb.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (kb.tags || '').toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : kbList

  return (
    <div className="min-h-screen bg-[#020617] overflow-y-auto">
      <div className="p-10 w-full max-w-[1600px] mx-auto">
        {/* ═══ Header ═══ */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-bold text-[#dce1fb] mb-2 tracking-tight">Hermes AI</h1>
            <p className="text-base text-[#94a3b8]">AI Workforce Hub（智能员工管理中心）</p>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748b]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search knowledge bases..."
                className="w-full bg-[#1e293b]/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-[#dce1fb] placeholder:text-[#64748b] outline-none focus:ring-2 focus:ring-[#4f46e5]/50"
              />
            </div>

            {/* ★ 新建知识库按钮 */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-[#4f46e5] hover:bg-[#4338ca] text-white px-6 py-3 rounded-xl text-sm font-medium transition-all active:scale-95 whitespace-nowrap flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create New KB
            </button>
          </div>
        </header>

        {/* 创建弹窗 */}
        <CreateKBModal
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateKB}
        />

        {/* ═══ 错误提示 ═══ */}
        {state === 'error' && (
          <div className="mb-8 bg-[#7f1d1d]/20 border border-[#ef4444]/30 rounded-xl p-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-[#f87171] shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-[#fca5a5] font-medium">数据加载失败</p>
              <p className="text-xs text-[#f87171]/70 mt-0.5">{error}</p>
            </div>
            <button onClick={loadData} className="text-xs text-[#fca5a5] hover:text-white underline shrink-0">重试</button>
          </div>
        )}

        {/* ═══ 知识库网格 ═══ */}
        {state === 'loading' ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Loader2 className="h-10 w-10 text-[#c3c0ff] animate-spin mb-4" />
            <p className="text-[#94a3b8] text-sm">正在加载知识库数据...</p>
          </div>
        ) : filteredKBs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Database className="h-16 w-16 text-[#334155] mb-6" />
            <p className="text-xl font-semibold text-[#94a3b8] mb-2">暂无知识库</p>
            <p className="text-sm text-[#64748b]">
              点击右上角 <span className="text-[#c3c0ff]">Create New KB</span> 创建你的第一个知识库
            </p>
          </div>
        ) : (
          <section className="grid grid-cols-3 gap-10">
            {filteredKBs.map((kb, i) => (
              <KnowledgeCard key={kb.id} kb={kb} index={i} onEnter={handleEnter} onDelete={handleDeleteKB} />
            ))}
          </section>
        )}

        <div className="h-16" />
      </div>
    </div>
  )
}
