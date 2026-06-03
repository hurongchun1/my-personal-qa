import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChatBubble, EmptyState } from './ChatBubble'
import type { Citation, Message } from '../types'

interface ChatStreamProps {
  messages: Message[]
  isStreaming: boolean
  onCitationClick?: (citation: Citation) => void
}

/**
 * ChatStream — 对话流容器
 * 
 * 设计协议：
 * - 黄金比例居中 max-w-4xl
 * - auto-scroll 到底部
 * - 消息间大间距 (gap-8) 增强呼吸感
 */
export function ChatStream({ messages, isStreaming, onCitationClick }: ChatStreamProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isStreaming])

  return (
    <div ref={containerRef} className="h-full overflow-y-auto hide-scrollbar px-4 py-10 md:px-6 md:py-14">
      <div className="mx-auto flex min-h-full max-w-4xl flex-col gap-8">
        {messages.length === 0 && <EmptyState />}

        <AnimatePresence mode="popLayout">
          {messages.map((message) => (
            <ChatBubble
              key={message.id}
              message={message}
              onCitationClick={onCitationClick}
            />
          ))}
        </AnimatePresence>

        {/* 流式加载占位 */}
        {isStreaming && messages.length > 0 && !messages[messages.length - 1].isStreaming && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="bubble-ai px-5 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="h-1.5 w-1.5 rounded-full bg-indigo-400"
                      animate={{
                        y: [0, -7, 0],
                        opacity: [0.3, 1, 0.3],
                        boxShadow: [
                          '0 0 0px rgba(99,102,241,0)',
                          '0 0 8px rgba(99,102,241,0.6)',
                          '0 0 0px rgba(99,102,241,0)',
                        ],
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
                <span className="text-xs text-slate-500 typing-cursor">思考中</span>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  )
}
