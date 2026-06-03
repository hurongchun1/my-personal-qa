import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import type { Citation, Message } from '../types'

interface ChatStreamProps {
  messages: Message[]
  isStreaming: boolean
  onCitationClick?: (citation: Citation) => void
}

export function ChatStream({ messages, isStreaming, onCitationClick }: ChatStreamProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.scrollTo({
      top: container.scrollHeight - container.clientHeight,
      behavior: 'smooth',
    })
  }, [messages, isStreaming])

  return (
    <div ref={containerRef} className="h-full overflow-y-auto px-6 py-12">
      <div className="mx-auto flex min-h-full max-w-4xl flex-col gap-12">
        {messages.length === 0 && <EmptyState />}

        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} onCitationClick={onCitationClick} />
        ))}

        {isStreaming && messages.length > 0 && !messages[messages.length - 1].isStreaming && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
            <div className="max-w-[78%] rounded-3xl border-t border-l border-white/10 border-r border-b border-black/20 bg-slate-950/55 px-6 py-5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
              <StreamingIndicator />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

function MessageBubble({
  message,
  onCitationClick,
}: {
  message: Message
  onCitationClick?: (citation: Citation) => void
}) {
  const isUser = message.role === 'user'

  return (
    <motion.article
      initial={{ opacity: 0, y: 24, scale: 0.96, filter: 'blur(8px)' }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`max-w-[78%] ${isUser ? 'text-right' : 'text-left'}`}>
        <div className={`mb-3 flex items-center gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
          {!isUser && <Avatar label="AI" />}
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
            {isUser ? '你' : '数字员工'}
          </span>
          <span className="text-xs text-slate-600">
            {message.timestamp.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
          </span>
          {isUser && <Avatar label="U" muted />}
        </div>

        <div
          className={`rounded-3xl border-t border-l border-white/10 border-r border-b border-black/20 px-6 py-5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl ${
            isUser
              ? 'bg-gradient-to-br from-indigo-500/80 via-violet-500/70 to-fuchsia-500/55 text-white'
              : 'bg-slate-950/55 text-slate-200'
          }`}
        >
          {isUser ? (
            <div className="whitespace-pre-wrap leading-7">{message.content}</div>
          ) : (
            <div className="markdown-content">
              <ReactMarkdown>{message.content}</ReactMarkdown>
              {message.citations && message.citations.length > 0 && (
                <div className="mt-5 border-t border-white/10 pt-4">
                  <div className="mb-3 text-xs text-slate-400">参考来源</div>
                  <div className="flex flex-wrap gap-3">
                    {message.citations.map((citation, index) => (
                      <CitationTag
                        key={citation.id}
                        citation={citation}
                        index={index}
                        onClick={onCitationClick}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {message.isStreaming && (
            <div className="mt-4">
              <StreamingIndicator />
            </div>
          )}
        </div>
      </div>
    </motion.article>
  )
}

function CitationTag({
  citation,
  index,
  onClick,
}: {
  citation: Citation
  index: number
  onClick?: (citation: Citation) => void
}) {
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <span className="relative inline-block">
      <button
        type="button"
        className="citation-tag"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => onClick?.(citation)}
      >
        [{index + 1}]
      </button>

      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            className="absolute bottom-full left-1/2 z-50 mb-3 w-80 -translate-x-1/2 rounded-3xl border-t border-l border-white/10 border-r border-b border-black/20 bg-slate-950/90 p-4 text-left shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl"
          >
            <div className="mb-2 text-xs text-slate-500">
              来源: {citation.docName}
              {citation.pageNumber ? ` / 第 ${citation.pageNumber} 页` : ''}
            </div>
            <div className="text-sm leading-6 text-slate-200">{citation.snippet}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  )
}

function StreamingIndicator() {
  return (
    <div className="flex items-center gap-3 text-sm text-slate-400">
      <div className="flex gap-1.5">
        {[0, 1, 2].map((index) => (
          <motion.span
            key={index}
            className="h-2 w-2 rounded-full bg-gradient-to-r from-indigo-300 to-fuchsia-300"
            animate={{ y: [0, -8, 0], opacity: [0.35, 1, 0.35] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: index * 0.18, ease: 'easeInOut' }}
          />
        ))}
      </div>
      正在思考...
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-1 items-center justify-center py-24">
      <div className="max-w-xl text-center">
        <p className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-4xl font-bold text-transparent">
          数字员工助手
        </p>
        <p className="mt-5 text-base leading-8 text-slate-400">
          把问题、文档和待办交给我。这里会保持安静、居中，只让对话成为焦点。
        </p>
      </div>
    </div>
  )
}

function Avatar({ label, muted = false }: { label: string; muted?: boolean }) {
  return (
    <span
      className={`grid h-8 w-8 place-items-center rounded-2xl text-xs font-bold shadow-[0_20px_50px_rgba(0,0,0,0.5)] ${
        muted
          ? 'bg-white/10 text-slate-300'
          : 'bg-gradient-to-br from-indigo-400 via-violet-500 to-fuchsia-500 text-white'
      }`}
    >
      {label}
    </span>
  )
}
