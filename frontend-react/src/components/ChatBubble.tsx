import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import type { Citation, Message } from '../types'

/* ═══════════════════════════════════════════════
   ChatBubble — 深度进化的对话气泡组件
   - AI 气泡：无边框 / bg-white/[0.05] / 微发光
   - 用户气泡：渐变底色 / purple glow
   - 引用标签：微型胶囊按钮 / hover 提亮
   - 流式指示器：三点弹跳 + typing cursor
   ═══════════════════════════════════════════════ */

interface ChatBubbleProps {
  message: Message
  onCitationClick?: (citation: Citation) => void
}

const messageAnim = {
  initial: { opacity: 0, y: 20, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1 },
  transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
}

export function ChatBubble({ message, onCitationClick }: ChatBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <motion.article
      {...messageAnim}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`max-w-[78%] ${isUser ? 'text-right' : 'text-left'}`}>
        {/* 发送者标识行 */}
        <div
          className={`mb-2.5 flex items-center gap-2.5 ${
            isUser ? 'justify-end flex-row-reverse' : 'justify-start'
          }`}
        >
          {!isUser && (
            <div className="relative grid h-7 w-7 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-indigo-400 via-violet-500 to-fuchsia-500 shadow-[0_0_12px_rgba(99,102,241,0.3)]">
              <span className="text-[10px] font-black text-white">AI</span>
            </div>
          )}
          <span className="text-[11px] font-medium uppercase tracking-[0.15em] text-slate-500">
            {isUser ? '你' : '数字员工'}
          </span>
          <span className="text-[11px] text-slate-600">
            {message.timestamp.toLocaleTimeString('zh-CN', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
          {isUser && (
            <div className="grid h-7 w-7 shrink-0 place-items-center rounded-xl bg-white/10 text-[10px] font-bold text-slate-300">
              U
            </div>
          )}
        </div>

        {/* 气泡主体 */}
        <div className={isUser ? 'bubble-user px-5 py-4 text-white' : 'bubble-ai px-5 py-4 text-slate-200'}>
          {isUser ? (
            <div className="whitespace-pre-wrap leading-7 text-[0.9375rem]">
              {message.content}
            </div>
          ) : (
            <div className="markdown-content">
              <ReactMarkdown
                components={{
                  // 自定义内联引用渲染：将 [n] 替换为胶囊按钮
                  a: ({ href, children, ...props }) => {
                    const text = String(children)
                    const citationMatch = text.match(/^\[(\d+)\]$/)
                    if (citationMatch && message.citations) {
                      const index = parseInt(citationMatch[1], 10) - 1
                      const citation = message.citations[index]
                      if (citation) {
                        return (
                          <CitationCapsule
                            citation={citation}
                            index={index}
                            onClick={onCitationClick}
                          />
                        )
                      }
                    }
                    // 普通链接
                    return (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-400 underline underline-offset-2 decoration-indigo-400/30 hover:decoration-indigo-400 transition-colors"
                        {...props}
                      >
                        {children}
                      </a>
                    )
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>

              {/* 引用来源区 */}
              {message.citations && message.citations.length > 0 && (
                <div className="mt-5 border-t border-white/[0.06] pt-3.5">
                  <div className="mb-2.5 text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500">
                    参考来源
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {message.citations.map((citation, index) => (
                      <CitationCapsule
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

          {/* 流式生成指示器 */}
          {message.isStreaming && (
            <div className="mt-3">
              <StreamingIndicator />
            </div>
          )}
        </div>
      </div>
    </motion.article>
  )
}

/* ═══════════════════════════════════════════════
   CitationCapsule — 微型胶囊引用标签
   - 半透明靛蓝底 + 悬浮提亮
   - Tooltip 展开显示来源详情
   ═══════════════════════════════════════════════ */
function CitationCapsule({
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
        className="citation-capsule"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => onClick?.(citation)}
      >
        [{index + 1}]
      </button>

      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute bottom-full left-1/2 z-50 mb-2 w-72 -translate-x-1/2 rounded-2xl border border-white/[0.08] bg-slate-950/95 p-4 text-left shadow-[0_12px_40px_rgba(0,0,0,0.6)] backdrop-blur-2xl"
          >
            <div className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-indigo-400">
              来源: {citation.docName}
              {citation.pageNumber ? ` · P${citation.pageNumber}` : ''}
            </div>
            <div className="text-[13px] leading-6 text-slate-300">
              {citation.snippet}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  )
}

/* ═══════════════════════════════════════════════
   StreamingIndicator — 流式响应动画
   - 三点弹跳 + 光晕脉冲
   ═══════════════════════════════════════════════ */
function StreamingIndicator() {
  return (
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
  )
}

/* ═══════════════════════════════════════════════
   EmptyState — 空状态引导
   ═══════════════════════════════════════════════ */
export function EmptyState() {
  return (
    <div className="flex flex-1 items-center justify-center py-24">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="max-w-xl text-center"
      >
        {/* 悬浮AI图标 */}
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="mx-auto mb-8 grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br from-indigo-400/20 via-violet-500/20 to-fuchsia-500/20 shadow-[0_0_48px_rgba(99,102,241,0.12)]"
        >
          <span className="text-3xl font-black text-transparent bg-gradient-to-br from-indigo-300 to-fuchsia-300 bg-clip-text">
            AI
          </span>
        </motion.div>

        <h2 className="text-3xl font-bold text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text">
          数字员工助手
        </h2>
        <p className="mt-4 text-[0.9375rem] leading-7 text-slate-400">
          把问题、文档和待办交给我。
          <br />
          这里保持安静与居中，只让对话成为焦点。
        </p>
      </motion.div>
    </div>
  )
}
