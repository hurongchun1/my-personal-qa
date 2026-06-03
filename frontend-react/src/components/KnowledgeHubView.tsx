import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, CheckCircle, Loader, Puzzle } from 'lucide-react'
import type { Document, SystemStatus } from '../types'

interface KnowledgeHubViewProps {
  documents: Document[]
  systemStatus: SystemStatus
  onDocumentUpload?: (file: File) => void
  onDocumentDelete?: (id: string) => void
  onDocumentProcess?: (id: string) => void
}

const fileTypeIcons: Record<string, { icon: string; color: string; bgColor: string }> = {
  pdf: { icon: '📄', color: 'text-red-400', bgColor: 'bg-red-500/20' },
  html: { icon: '🌐', color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
  md: { icon: '📝', color: 'text-emerald-400', bgColor: 'bg-emerald-500/20' },
  txt: { icon: '📃', color: 'text-slate-400', bgColor: 'bg-slate-500/20' },
  doc: { icon: '📘', color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
  docx: { icon: '📘', color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
}

const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  pending: { label: '待处理', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' },
  processing: { label: '处理中', color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
  completed: { label: '已完成', color: 'text-emerald-400', bgColor: 'bg-emerald-500/20' },
  failed: { label: '失败', color: 'text-red-400', bgColor: 'bg-red-500/20' },
}

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
  
  // 过滤文档
  const filteredDocuments = documents.filter(doc => 
    doc.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.fileType.toLowerCase().includes(searchQuery.toLowerCase())
  )
  
  // 统计数据
  const stats = {
    total: documents.length,
    completed: documents.filter(d => d.status === 'completed').length,
    processing: documents.filter(d => d.status === 'processing').length,
    totalChunks: documents.reduce((sum, doc) => sum + doc.chunkCount, 0),
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
  
  // 处理文件上传
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onDocumentUpload?.(e.target.files[0])
      e.target.value = ''
    }
  }
  
  // 拖拽事件处理
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current++
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true)
    }
  }
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current--
    if (dragCounter.current === 0) {
      setIsDragging(false)
    }
  }
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    dragCounter.current = 0
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      Array.from(e.dataTransfer.files).forEach(file => {
        onDocumentUpload?.(file)
      })
      e.dataTransfer.clearData()
    }
  }
  
  return (
    <div 
      className="h-full flex flex-col overflow-hidden"
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
            className="absolute inset-0 z-50 bg-indigo-500/10 backdrop-blur-sm flex items-center justify-center"
          >
            <div className="text-center p-8 rounded-2xl backdrop-blur-xl bg-slate-900/80 border-2 border-dashed border-indigo-500">
              <div className="text-6xl mb-4">📁</div>
              <div className="text-2xl font-semibold text-indigo-400 mb-2">
                拖拽文件到此处上传
              </div>
              <div className="text-slate-400">
                支持 PDF、HTML、Markdown、TXT 格式
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* 顶部：搜索和统计 */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white">知识库管理中心</h1>
            <p className="text-slate-400 mt-1">
              {systemStatus.apiStatus === 'running' ? '系统在线' : '系统离线'} · {systemStatus.documentCount} 个文档
            </p>
          </div>
          
          {/* 上传按钮 */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40 hover:scale-105 active:scale-95"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>上传文档</span>
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.html,.md,.txt,.doc,.docx"
            className="hidden"
          />
        </div>
        
        {/* 搜索框 */}
        <div className="relative">
          <svg 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索文档..."
            className="w-full pl-10 pr-4 py-3 rounded-xl backdrop-blur-xl bg-slate-900/60 border border-white/10 text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-200"
          />
        </div>
      </div>
      
      {/* Bento Grid 统计卡片 */}
      <div className="p-6">
        <div className="grid grid-cols-4 gap-6">
          {/* 总文档数 */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-5 rounded-2xl bg-gradient-to-br from-slate-800/50 to-transparent border border-white/5 backdrop-blur-md hover:border-indigo-500/40 transition-all duration-200 hover:shadow-[0_0_15px_rgba(99,102,241,0.15)]"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                <FileText className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">总文档</p>
                <p className="text-3xl font-bold text-slate-100 mt-1">{stats.total}</p>
              </div>
            </div>
          </motion.div>
          
          {/* 已完成 */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-5 rounded-2xl bg-gradient-to-br from-slate-800/50 to-transparent border border-white/5 backdrop-blur-md hover:border-emerald-500/40 transition-all duration-200 hover:shadow-[0_0_15px_rgba(16,185,129,0.15)]"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">已完成</p>
                <p className="text-3xl font-bold text-slate-100 mt-1">{stats.completed}</p>
              </div>
            </div>
          </motion.div>
          
          {/* 处理中 */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-5 rounded-2xl bg-gradient-to-br from-slate-800/50 to-transparent border border-white/5 backdrop-blur-md hover:border-blue-500/40 transition-all duration-200 hover:shadow-[0_0_15px_rgba(59,130,246,0.15)]"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Loader className="w-6 h-6 text-blue-400 animate-spin" />
              </div>
              <div>
                <p className="text-sm text-slate-400">处理中</p>
                <p className="text-3xl font-bold text-slate-100 mt-1">{stats.processing}</p>
              </div>
            </div>
          </motion.div>
          
          {/* 总分块数 */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-5 rounded-2xl bg-gradient-to-br from-slate-800/50 to-transparent border border-white/5 backdrop-blur-md hover:border-purple-500/40 transition-all duration-200 hover:shadow-[0_0_15px_rgba(139,92,246,0.15)]"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Puzzle className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">总分块</p>
                <p className="text-3xl font-bold text-slate-100 mt-1">{stats.totalChunks}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* 文档列表 */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.map((doc, index) => {
            const fileInfo = fileTypeIcons[doc.fileType] || fileTypeIcons.txt
            const statusInfo = statusConfig[doc.status] || statusConfig.pending
            
            return (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group p-5 rounded-2xl bg-gradient-to-br from-slate-800/50 to-transparent border border-white/5 backdrop-blur-md hover:border-indigo-500/40 transition-all duration-200 hover:shadow-[0_0_15px_rgba(99,102,241,0.15)] hover:bg-slate-800/60"
              >
                <div className="flex items-start justify-between">
                  {/* 文档信息 */}
                  <div className="flex items-start space-x-3 flex-1 min-w-0">
                    {/* 图标 */}
                    <div className={`w-12 h-12 rounded-xl ${fileInfo.bgColor} flex items-center justify-center flex-shrink-0`}>
                      <span className="text-2xl">{fileInfo.icon}</span>
                    </div>
                    
                    {/* 详情 */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-white truncate">
                        {doc.filename}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1 text-xs text-slate-400">
                        <span>{formatFileSize(doc.fileSize)}</span>
                        <span>•</span>
                        <span>{doc.fileType.toUpperCase()}</span>
                        <span>•</span>
                        <span>{formatDate(doc.createdAt)}</span>
                      </div>
                      
                      {/* 向量化进度条 */}
                      {doc.status === 'processing' && doc.vectorProgress !== undefined && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                            <span>向量化进度</span>
                            <span>{Math.round(doc.vectorProgress)}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${doc.vectorProgress}%` }}
                              transition={{ duration: 0.5, ease: 'easeOut' }}
                            />
                          </div>
                        </div>
                      )}
                      
                      {/* 分块数 */}
                      {doc.chunkCount > 0 && (
                        <div className="flex items-center space-x-1 mt-2 text-xs text-slate-500">
                          <span>🧩</span>
                          <span>{doc.chunkCount} 个分块</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* 状态和操作 */}
                  <div className="flex flex-col items-end space-y-2">
                    {/* 状态徽章 */}
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.color} ${statusInfo.bgColor}`}>
                      {statusInfo.label}
                    </span>
                    
                    {/* 操作按钮 */}
                    <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 flex space-x-1.5">
                      {doc.status === 'pending' && onDocumentProcess && (
                        <button
                          onClick={() => onDocumentProcess(doc.id)}
                          className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all duration-200 hover:scale-110 active:scale-90"
                          title="处理文档"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                      )}
                      
                      {onDocumentDelete && (
                        <button
                          onClick={() => onDocumentDelete(doc.id)}
                          className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all duration-200 hover:scale-110 active:scale-90"
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
          })}
        </div>
        
        {/* 空状态 */}
        {filteredDocuments.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📚</div>
            <div className="text-xl font-semibold text-slate-300 mb-2">
              {searchQuery ? '未找到匹配的文档' : '暂无文档'}
            </div>
            <div className="text-slate-400">
              {searchQuery ? '尝试不同的搜索词' : '上传文档开始构建知识库'}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
