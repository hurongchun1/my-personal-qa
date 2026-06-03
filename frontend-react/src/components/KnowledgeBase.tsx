import React, { useRef } from 'react'
import { motion } from 'framer-motion'
import { FileText, Play, Trash2, Upload } from 'lucide-react'
import type { Document, DocumentStatus } from '../types'

interface KnowledgeBaseProps {
  documents: Document[]
  onUpload?: (file: File) => void
  onDelete?: (id: string) => void
  onProcess?: (id: string) => void
  searchQuery?: string
  onSearch?: (query: string) => void
}

const statusConfig: Record<DocumentStatus, { label: string; color: string }> = {
  pending: { label: '待处理', color: '#fbbf24' },
  processing: { label: '处理中', color: '#60a5fa' },
  completed: { label: '已完成', color: '#34d399' },
  failed: { label: '失败', color: '#f87171' },
}

const fileTypeMeta: Record<string, { icon: string; color: string; bg: string }> = {
  pdf: { icon: '📄', color: '#f87171', bg: 'rgba(248,113,113,0.12)' },
  html: { icon: '🌐', color: '#60a5fa', bg: 'rgba(96,165,250,0.12)' },
  md: { icon: '📝', color: '#34d399', bg: 'rgba(52,211,153,0.12)' },
  txt: { icon: '📃', color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' },
  doc: { icon: '📘', color: '#60a5fa', bg: 'rgba(96,165,250,0.12)' },
  docx: { icon: '📘', color: '#60a5fa', bg: 'rgba(96,165,250,0.12)' },
}

export const KnowledgeBase: React.FC<KnowledgeBaseProps> = ({
  documents,
  onUpload,
  onDelete,
  onProcess,
  searchQuery = '',
  onSearch,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const filteredDocuments = documents.filter(
    (doc) =>
      doc.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.fileType.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      onUpload?.(e.target.files[0])
      e.target.value = ''
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const units = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`
  }

  const formatDate = (date: Date): string =>
    date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })

  return (
    <div className="h-full flex flex-col">
      {/* 上传区域 */}
      <div className="p-4 border-b border-white/[0.06]">
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-white/[0.06] rounded-2xl p-6 text-center cursor-pointer hover:border-indigo-500/30 hover:bg-white/[0.02] transition-all duration-200"
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.html,.md,.txt,.doc,.docx"
            className="hidden"
          />
          <Upload className="w-6 h-6 mx-auto mb-2 text-slate-500" />
          <p className="text-sm text-slate-400 mb-0.5">点击上传文档</p>
          <p className="text-[11px] text-slate-600">PDF · HTML · MD · TXT</p>
        </div>
      </div>

      {/* 搜索框 */}
      {onSearch && (
        <div className="p-4 border-b border-white/[0.06]">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="搜索文档..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-slate-200 placeholder:text-slate-500 outline-none transition-all focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/30"
            />
          </div>
        </div>
      )}

      {/* 文档列表 */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredDocuments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="w-8 h-8 text-slate-600 mb-3" />
            <p className="text-sm text-slate-400">
              {searchQuery ? '未找到匹配的文档' : '暂无文档'}
            </p>
            <p className="text-xs text-slate-600 mt-1">
              {searchQuery ? '尝试不同的搜索词' : '上传文档开始构建知识库'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredDocuments.map((doc, index) => {
              const st = statusConfig[doc.status]
              const ft = fileTypeMeta[doc.fileType] ?? fileTypeMeta.txt

              return (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="bento-card group flex items-center gap-3 py-3 px-4"
                >
                  {/* 图标 */}
                  <div
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-lg"
                    style={{ backgroundColor: ft.bg }}
                  >
                    {ft.icon}
                  </div>

                  {/* 信息 */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[13px] font-medium text-slate-200 truncate">{doc.filename}</h4>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                      <span>{formatFileSize(doc.fileSize)}</span>
                      <span>·</span>
                      <span>{doc.fileType.toUpperCase()}</span>
                      <span>·</span>
                      <span>{formatDate(doc.createdAt)}</span>
                    </div>
                    {doc.chunkCount > 0 && (
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        {doc.chunkCount} 个分块
                      </p>
                    )}
                  </div>

                  {/* 状态徽章 */}
                  <span
                    className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium"
                    style={{ color: st.color, background: `${st.color}18` }}
                  >
                    {st.label}
                  </span>

                  {/* 操作按钮 */}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {doc.status === 'pending' && onProcess && (
                      <button
                        onClick={() => onProcess(doc.id)}
                        className="p-1 rounded-lg bg-indigo-500/15 text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all"
                        title="处理文档"
                      >
                        <Play className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(doc.id)}
                        className="p-1 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500 hover:text-white transition-all"
                        title="删除文档"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
