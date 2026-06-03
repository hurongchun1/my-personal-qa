import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  CheckCircle,
  Loader,
  Puzzle,
  Upload,
  Search,
  Trash2,
  Play,
} from 'lucide-react'
import type { Document, SystemStatus } from '../types'

interface KnowledgeHubViewProps {
  documents: Document[]
  systemStatus: SystemStatus
  onDocumentUpload?: (file: File) => void
  onDocumentDelete?: (id: string) => void
  onDocumentProcess?: (id: string) => void
}

const fileTypeMeta: Record<string, { icon: string; color: string; bg: string }> = {
  pdf: { icon: '📄', color: '#f87171', bg: 'rgba(248,113,113,0.12)' },
  html: { icon: '🌐', color: '#60a5fa', bg: 'rgba(96,165,250,0.12)' },
  md: { icon: '📝', color: '#34d399', bg: 'rgba(52,211,153,0.12)' },
  txt: { icon: '📃', color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' },
  doc: { icon: '📘', color: '#60a5fa', bg: 'rgba(96,165,250,0.12)' },
  docx: { icon: '📘', color: '#60a5fa', bg: 'rgba(96,165,250,0.12)' },
}

const statusMeta: Record<string, { label: string; color: string }> = {
  pending: { label: '待处理', color: '#fbbf24' },
  processing: { label: '处理中', color: '#60a5fa' },
  completed: { label: '已完成', color: '#34d399' },
  failed: { label: '失败', color: '#f87171' },
}

/* ═══════════════════════════════════════════════
   ProgressRing — SVG 进度光环
   ═══════════════════════════════════════════════ */
function ProgressRing({
  progress,
  size = 44,
  strokeWidth = 3,
}: {
  progress: number
  size?: number
  strokeWidth?: number
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (progress / 100) * circumference

  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <defs>
        <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>
      {/* 背景圆环 */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth={strokeWidth}
      />
      {/* 进度圆环 */}
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="url(#ringGradient)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        style={{ filter: 'drop-shadow(0 0 6px rgba(99,102,241,0.35))' }}
      />
    </svg>
  )
}

/* ═══════════════════════════════════════════════
   KnowledgeHubView
   ═══════════════════════════════════════════════ */
export const KnowledgeHubView: React.FC<KnowledgeHubViewProps> = ({
  documents,
  systemStatus,
  onDocumentUpload,
  onDocumentDelete,
  onDocumentProcess,
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dragCounter = useRef(0)

  const filteredDocs = documents.filter(
    (doc) =>
      doc.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.fileType.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const stats = {
    total: documents.length,
    completed: documents.filter((d) => d.status === 'completed').length,
    processing: documents.filter((d) => d.status === 'processing').length,
    pending: documents.filter((d) => d.status === 'pending').length,
    totalChunks: documents.reduce((sum, doc) => sum + doc.chunkCount, 0),
    totalSize: documents.reduce((sum, doc) => sum + doc.fileSize, 0),
  }

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const units = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`
  }

  const formatDate = (date: Date): string =>
    date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      onDocumentUpload?.(e.target.files[0])
      e.target.value = ''
    }
  }

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation()
    dragCounter.current++
    if (e.dataTransfer.items?.length) setIsDragging(true)
  }
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation()
    dragCounter.current--
    if (dragCounter.current === 0) setIsDragging(false)
  }
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation() }
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation()
    setIsDragging(false); dragCounter.current = 0
    Array.from(e.dataTransfer.files).forEach((f) => onDocumentUpload?.(f))
    e.dataTransfer.clearData()
  }

  /* Bento Grid 统计卡片配置 */
  const statCards = [
    {
      label: '总文档',
      value: stats.total,
      icon: FileText,
      color: 'indigo',
      span: 'col-span-2 row-span-2',
    },
    {
      label: '已完成',
      value: stats.completed,
      icon: CheckCircle,
      color: 'emerald',
      span: 'col-span-1 row-span-1',
    },
    {
      label: '处理中',
      value: stats.processing,
      icon: Loader,
      color: 'blue',
      span: 'col-span-1 row-span-1',
    },
    {
      label: '总分块',
      value: stats.totalChunks,
      icon: Puzzle,
      color: 'violet',
      span: 'col-span-1 row-span-1',
    },
    {
      label: '待处理',
      value: stats.pending,
      color: 'amber',
      span: 'col-span-1 row-span-1',
    },
    {
      label: '总容量',
      value: formatSize(stats.totalSize),
      color: 'slate',
      span: 'col-span-2 row-span-1',
      raw: true,
    },
  ]

  const colorMap: Record<string, string> = {
    indigo: 'text-indigo-400 bg-indigo-500/15',
    emerald: 'text-emerald-400 bg-emerald-500/15',
    blue: 'text-blue-400 bg-blue-500/15',
    violet: 'text-violet-400 bg-violet-500/15',
    amber: 'text-amber-400 bg-amber-500/15',
    slate: 'text-slate-400 bg-slate-500/15',
  }

  const borderMap: Record<string, string> = {
    indigo: 'hover:border-indigo-500/25',
    emerald: 'hover:border-emerald-500/25',
    blue: 'hover:border-blue-500/25',
    violet: 'hover:border-violet-500/25',
    amber: 'hover:border-amber-500/25',
    slate: 'hover:border-slate-500/25',
  }

  const glowMap: Record<string, string> = {
    indigo: '0 0 24px rgba(99,102,241,0.08)',
    emerald: '0 0 24px rgba(52,211,153,0.08)',
    blue: '0 0 24px rgba(96,165,250,0.08)',
    violet: '0 0 24px rgba(139,92,246,0.08)',
    amber: '0 0 24px rgba(251,191,36,0.08)',
    slate: '0 0 24px rgba(148,163,184,0.05)',
  }

  return (
    <div
      className="island h-full flex flex-col overflow-hidden"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* 拖拽遮罩 */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-indigo-500/8 backdrop-blur-sm flex items-center justify-center rounded-3xl"
          >
            <div className="text-center p-8 rounded-2xl bg-slate-950/90 backdrop-blur-xl border-2 border-dashed border-indigo-500/50">
              <Upload className="w-10 h-10 mx-auto mb-3 text-indigo-400" />
              <p className="text-lg font-semibold text-indigo-300 mb-1">
                拖拽文件到此处上传
              </p>
              <p className="text-sm text-slate-400">
                支持 PDF · HTML · Markdown · TXT 格式
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 头部 */}
      <div className="flex-shrink-0 p-6 border-b border-white/[0.06]">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-bold text-white">知识库管理中心</h1>
            <p className="text-[13px] text-slate-400 mt-1">
              {systemStatus.apiStatus === 'running' ? '系统在线' : '系统离线'} ·{' '}
              {stats.total} 个文档
            </p>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-sm font-medium text-white hover:from-indigo-500 hover:to-violet-500 transition-all duration-200 shadow-[0_0_20px_rgba(99,102,241,0.2)] hover:shadow-[0_0_30px_rgba(99,102,241,0.3)]"
          >
            <Upload className="w-4 h-4" />
            上传文档
          </button>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.html,.md,.txt,.doc,.docx"
            className="hidden"
          />
        </div>

        {/* 搜索栏 */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索文档..."
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-white placeholder:text-slate-500 outline-none transition-all duration-200 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/30"
          />
        </div>
      </div>

      {/* Bento Grid 统计区 */}
      <div className="flex-shrink-0 p-6">
        <div className="grid grid-cols-4 gap-3 auto-rows-[64px]">
          {statCards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i, duration: 0.35 }}
              className={`${card.span} bento-card flex items-center justify-between cursor-default ${borderMap[card.color]}`}
              style={{ '--glow': glowMap[card.color] } as React.CSSProperties}
            >
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                  {card.label}
                </p>
                <p className="text-2xl font-bold text-white mt-0.5">
                  {card.raw ? card.value : card.value}
                </p>
              </div>
              {card.icon && (
                <div
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${colorMap[card.color]}`}
                >
                  <card.icon className="w-5 h-5" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* 文档卡片区 */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDocs.map((doc, i) => {
            const ft = fileTypeMeta[doc.fileType] ?? fileTypeMeta.txt
            const st = statusMeta[doc.status] ?? statusMeta.pending
            const progress =
              doc.vectorProgress ??
              (doc.status === 'completed' ? 100 : doc.status === 'processing' ? 50 : 0)

            /* 大卡片（支持跨列） */
            const isLarge = i === 0 || i % 5 === 0

            return (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.35 }}
                className={`bento-card group flex items-start gap-4 ${
                  isLarge ? 'md:col-span-2' : ''
                }`}
              >
                {/* 文件图标 */}
                <div
                  className="grid h-12 w-12 shrink-0 place-items-center rounded-xl text-xl"
                  style={{ backgroundColor: ft.bg }}
                >
                  {ft.icon}
                </div>

                {/* 信息区 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-white truncate">
                      {doc.filename}
                    </h3>
                    <span
                      className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-medium"
                      style={{ color: st.color, background: `${st.color}18` }}
                    >
                      {st.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-500">
                    <span>{formatSize(doc.fileSize)}</span>
                    <span>·</span>
                    <span>{doc.fileType.toUpperCase()}</span>
                    <span>·</span>
                    <span>{formatDate(doc.createdAt)}</span>
                  </div>

                  {/* 分块数与进度 */}
                  <div className="flex items-center gap-3 mt-3">
                    {doc.chunkCount > 0 && (
                      <span className="flex items-center gap-1 text-[11px] text-slate-500">
                        <Puzzle className="w-3 h-3 text-violet-400" />
                        {doc.chunkCount} 分块
                      </span>
                    )}

                    {doc.status === 'processing' && (
                      <div className="flex items-center gap-2">
                        <ProgressRing progress={progress} size={28} strokeWidth={2.5} />
                        <span className="text-[11px] text-blue-400">
                          {Math.round(progress)}%
                        </span>
                      </div>
                    )}

                    {doc.status === 'completed' && (
                      <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> 已就绪
                      </span>
                    )}
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  {doc.status === 'pending' && (
                    <button
                      onClick={() => onDocumentProcess?.(doc.id)}
                      className="p-1.5 rounded-lg bg-indigo-500/15 text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all"
                      title="处理文档"
                    >
                      <Play className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => onDocumentDelete?.(doc.id)}
                    className="p-1.5 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500 hover:text-white transition-all"
                    title="删除文档"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* 空状态 */}
        {filteredDocs.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="grid h-20 w-20 place-items-center rounded-2xl bg-white/[0.03] mb-5">
              <FileText className="w-8 h-8 text-slate-600" />
            </div>
            <p className="text-lg font-semibold text-slate-300 mb-1">
              {searchQuery ? '未找到匹配的文档' : '暂无文档'}
            </p>
            <p className="text-sm text-slate-500">
              {searchQuery
                ? '尝试使用不同的搜索关键词'
                : '上传文档开始构建你的知识库'}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
