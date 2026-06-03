import React, { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface InputNexusProps {
  onSendMessage: (content: string) => Promise<void>
  onFileDrop?: (files: FileList) => void
  disabled?: boolean
}

export const InputNexus: React.FC<InputNexusProps> = ({
  onSendMessage,
  onFileDrop,
  disabled = false,
}) => {
  const [message, setMessage] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const dragCounter = useRef(0)
  
  // 自动调整文本框高度
  const adjustTextareaHeight = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      const scrollHeight = textareaRef.current.scrollHeight
      const maxHeight = 150 // 最大高度
      textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`
    }
  }, [])
  
  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)
    adjustTextareaHeight()
  }
  
  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }
  
  // 发送消息
  const handleSend = async () => {
    if (!message.trim() || disabled) return
    
    const messageToSend = message.trim()
    setMessage('')
    
    // 重置文本框高度
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
    
    await onSendMessage(messageToSend)
  }
  
  // 拖拽事件处理
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current++
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true)
    }
  }, [])
  
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current--
    if (dragCounter.current === 0) {
      setIsDragging(false)
    }
  }, [])
  
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    dragCounter.current = 0
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileDrop?.(e.dataTransfer.files)
      e.dataTransfer.clearData()
    }
  }, [onFileDrop])
  
  // 焦点事件
  const handleFocus = () => setIsFocused(true)
  const handleBlur = () => setIsFocused(false)
  
  // 快捷指令
  const quickCommands = [
    { icon: '📄', label: '文档', action: () => setMessage('请帮我查看知识库中的文档') },
    { icon: '✅', label: '任务', action: () => setMessage('请帮我创建一个新任务') },
    { icon: '❓', label: '帮助', action: () => setMessage('你能帮我做什么？') },
  ]
  
  return (
    <div className="relative">
      {/* 拖拽遮罩 */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 bg-indigo-500/10 border-2 border-dashed border-indigo-500 rounded-2xl flex items-center justify-center backdrop-blur-sm"
          >
            <div className="text-center">
              <div className="text-4xl mb-2">📁</div>
              <div className="text-lg font-semibold text-indigo-400">
                拖拽文件到此处上传
              </div>
              <div className="text-sm text-slate-400 mt-1">
                支持 PDF、HTML、Markdown、TXT 格式
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* 输入框容器 */}
      <div
        className={`relative rounded-2xl transition-all duration-200 backdrop-blur-sm ${
          isFocused
            ? 'bg-gradient-to-br from-slate-800/90 to-slate-800/70 ring-2 ring-indigo-500/50 shadow-lg shadow-indigo-500/10'
            : 'bg-gradient-to-br from-slate-800/80 to-slate-800/60 shadow-lg shadow-slate-900/20'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* 快捷指令 */}
        <div className="flex items-center space-x-2 px-4 pt-3 pb-1">
          {quickCommands.map((cmd, index) => (
            <button
              key={index}
              onClick={cmd.action}
              disabled={disabled}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 transition-all duration-200 hover:shadow-md hover:shadow-slate-900/20 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-sm">{cmd.icon}</span>
              <span className="font-medium">{cmd.label}</span>
            </button>
          ))}
        </div>
        
        {/* 输入区域 */}
        <div className="flex items-end p-4 pt-2">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder="输入你的问题或指令... (Shift+Enter 换行)"
            disabled={disabled}
            rows={1}
            className="flex-1 bg-transparent text-slate-200 placeholder-slate-500 resize-none outline-none disabled:cursor-not-allowed"
            style={{ minHeight: '24px', maxHeight: '150px' }}
          />
          
          {/* 发送按钮 */}
          <button
            onClick={handleSend}
            disabled={!message.trim() || disabled}
            className={`ml-3 p-2.5 rounded-xl transition-all duration-200 ${
              message.trim() && !disabled
                ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40 hover:scale-105 active:scale-95'
                : 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
            </svg>
          </button>
        </div>
        
        {/* 底部提示 */}
        <div className="px-4 pb-3 pt-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>数字员工可以帮你处理文档、管理任务、回答问题</span>
            <span>{message.length}/2000</span>
          </div>
        </div>
      </div>
    </div>
  )
}