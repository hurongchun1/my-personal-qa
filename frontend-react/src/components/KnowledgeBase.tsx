import React, { useRef } from 'react'
import { motion } from 'framer-motion'
import type { Document, DocumentStatus } from '../types'

interface KnowledgeBaseProps {
  documents: Document[]
  onUpload?: (file: File) => void
  onDelete?: (id: string) => void
  onProcess?: (id: string) => void
}

const statusConfig: Record<DocumentStatus, { label: string; color: string; bgColor: string }> = {
  pending: {
    label: '待处理',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20',
  },
  processing: {
    label: '处理中',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
  },
  completed: {
    label: '已完成',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/20',
  },
  failed: {
    label: '失败',
    color: 'text-red-400',
    bgColor: 'bg-red-500/20',
  },
}

const fileTypeIcons: Record<string, string> = {
  pdf: '📄',
  html: '🌐',
  md: '📝',
  txt: '📃',
  doc: '📘',
  docx: '📘',
}

export const KnowledgeBase: React.FC<KnowledgeBaseProps> = ({
  documents,
  onUpload,
  onDelete,
  onProcess,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // 处理文件上传
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUpload?.(e.target.files[0])
      e.target.value = ''
    }
  }
  
  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }
  
  // 格式化日期
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }
  
  return (
    <div className="h-full flex flex-col">
      {/* 上传区域 */}
      <div className="p-4 border-b border-slate-700/50">
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-700/50 rounded-xl p-6 text-center cursor-pointer hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/10 hover:scale-[1.02] active:scale-[0.98]"
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.html,.md,.txt,.doc,.docx"
            className="hidden"
          />
          <div className="text-3xl mb-2">📁</div>
          <div className="text-sm text-slate-300 mb-1">
            点击或拖拽文件到此处上传
          </div>
          <div className="text-xs text-slate-500">
            支持 PDF、HTML、Markdown、TXT 格式
          </div>
        </div>
      </div>
      
      {/* 文档列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {documents.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">📚</div>
            <div className="text-slate-400">暂无文档</div>
            <div className="text-sm text-slate-500 mt-1">
              上传文档开始构建知识库
            </div>
          </div>
        ) : (
          documents.map((doc, index) => {
            const statusInfo = statusConfig[doc.status]
            const fileIcon = fileTypeIcons[doc.fileType] || '📄'
            
            return (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-gradient-to-br from-slate-800/60 to-slate-800/40 rounded-xl p-4 hover:from-slate-800/80 hover:to-slate-800/60 transition-all duration-200 group hover:shadow-lg hover:shadow-slate-900/20 hover:scale-[1.02] active:scale-[0.98] backdrop-blur-sm"
              >
                <div className="flex items-start justify-between">
                  {/* 文档信息 */}
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl mt-0.5">{fileIcon}</div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-slate-200 truncate">
                        {doc.filename}
                      </h4>
                      <div className="flex items-center space-x-3 mt-1 text-xs text-slate-500">
                        <span>{formatFileSize(doc.fileSize)}</span>
                        <span>•</span>
                        <span>{doc.fileType.toUpperCase()}</span>
                        <span>•</span>
                        <span>{formatDate(doc.createdAt)}</span>
                      </div>
                      {doc.chunkCount > 0 && (
                        <div className="text-xs text-slate-500 mt-1">
                          分块数: {doc.chunkCount}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* 状态和操作 */}
                  <div className="flex items-center space-x-2">
                    {/* 状态徽章 */}
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.color} ${statusInfo.bgColor} shadow-sm`}>
                      {statusInfo.label}
                    </span>
                    
                    {/* 操作按钮 */}
                    <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 flex space-x-1.5">
                      {doc.status === 'pending' && onProcess && (
                        <button
                          onClick={() => onProcess(doc.id)}
                          className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all duration-200 hover:shadow-md hover:shadow-indigo-500/20 hover:scale-110 active:scale-90"
                          title="处理文档"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                      )}
                      
                      {onDelete && (
                        <button
                          onClick={() => onDelete(doc.id)}
                          className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all duration-200 hover:shadow-md hover:shadow-red-500/20 hover:scale-110 active:scale-90"
                          title="删除文档"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })
        )}
      </div>
    </div>
  )
}