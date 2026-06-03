import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import type { Message, Citation } from '../types'

interface ChatStreamProps {
  messages: Message[]
  isStreaming: boolean
}

// 引用标签组件
const CitationTag: React.FC<{ citation: Citation; index: number }> = ({ citation, index }) => {
  const [showTooltip, setShowTooltip] = useState(false)
  const tooltipRef = useRef<HTMLDivElement>(null)
  
  return (
    <span className="relative inline-block">
      <span
        className="citation-tag cursor-pointer"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        [{index + 1}]
      </span>
      
      {/* 引用摘要气泡 */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            ref={tooltipRef}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-3 rounded-lg bg-slate-800 border border-slate-700 shadow-xl"
          >
            <div className="text-xs text-slate-400 mb-1">来源: {citation.docName}</div>
            <div className="text-sm text-slate-200 leading-relaxed">
              {citation.snippet}
            </div>
            {/* 小箭头 */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-slate-800 border-r border-b border-slate-700 rotate-45"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  )
}

// 流式加载指示器
const StreamingIndicator: React.FC = () => (
  <div className="flex items-center space-x-1.5 p-3">
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full bg-indigo-500"
          animate={{
            y: [0, -8, 0],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: i * 0.2,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
    <span className="text-sm text-slate-400">正在思考...</span>
  </div>
)

// 消息气泡组件
const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
  const isUser = message.role === 'user'
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} group`}
    >
      <div className={`max-w-[80%] ${isUser ? 'order-2' : 'order-1'}`}>
        {/* 发送者信息 */}
        <div className={`flex items-center space-x-2 mb-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
          {!isUser && (
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <span className="text-white text-xs font-bold">AI</span>
            </div>
          )}
          <span className="text-xs text-slate-400 font-medium">
            {isUser ? '你' : '数字员工'}
          </span>
          <span className="text-xs text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
            {message.timestamp.toLocaleTimeString('zh-CN', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
          {isUser && (
            <div className="w-7 h-7 rounded-lg bg-slate-700 flex items-center justify-center shadow-lg shadow-slate-700/20">
              <span className="text-slate-300 text-xs font-bold">U</span>
            </div>
          )}
        </div>
        
        {/* 消息内容 */}
        <div
          className={`rounded-2xl px-4 py-3 transition-all duration-200 hover:shadow-lg ${
            isUser
              ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30'
              : 'bg-gradient-to-br from-slate-800/80 to-slate-800/60 text-slate-200 shadow-lg shadow-slate-900/20 hover:shadow-slate-900/30 backdrop-blur-sm'
          }`}
        >
          {isUser ? (
            <div className="whitespace-pre-wrap">{message.content}</div>
          ) : (
            <div className="markdown-content">
              <ReactMarkdown>{message.content}</ReactMarkdown>
              
              {/* 引用标签 */}
              {message.citations && message.citations.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-700/50">
                  <div className="text-xs text-slate-400 mb-2">参考来源:</div>
                  <div className="flex flex-wrap gap-2">
                    {message.citations.map((citation, index) => (
                      <CitationTag
                        key={citation.id}
                        citation={citation}
                        index={index}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* 流式加载指示器 */}
          {message.isStreaming && (
            <div className="mt-2">
              <StreamingIndicator />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export const ChatStream: React.FC<ChatStreamProps> = ({ messages, isStreaming }) => {
  return (
    <div className="space-y-6">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
      
      {/* 全局流式指示器 */}
      {isStreaming && messages.length > 0 && !messages[messages.length - 1].isStreaming && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-start"
        >
          <div className="max-w-[80%]">
            <div className="flex items-center space-x-2 mb-1">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <span className="text-white text-xs font-semibold">AI</span>
              </div>
              <span className="text-xs text-slate-400">数字员工</span>
            </div>
            <div className="bg-slate-800/60 rounded-2xl px-4 py-3">
              <StreamingIndicator />
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}