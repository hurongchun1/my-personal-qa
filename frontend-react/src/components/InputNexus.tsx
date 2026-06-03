import { useCallback, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { FilePlus2, HelpCircle, Library, ListTodo, SendHorizontal } from 'lucide-react'
import type { QuickCommand } from '../types'

interface InputNexusProps {
  onSendMessage: (content: string) => Promise<void>
  onFileDrop?: (files: FileList) => void
  disabled?: boolean
  quickCommands?: QuickCommand[]
}

const defaultQuickCommands: QuickCommand[] = [
  { id: 'documents', name: '文档', description: '查看知识库文档', command: '请帮我查看知识库中的文档。', category: 'document' },
  { id: 'tasks', name: '任务', description: '创建新任务', command: '请帮我创建一个新任务。', category: 'task' },
  { id: 'help', name: '帮助', description: '获取帮助信息', command: '你能帮我做什么？', category: 'general' },
]

const commandIcons = {
  document: Library,
  task: ListTodo,
  system: FilePlus2,
  general: HelpCircle,
}

export function InputNexus({
  onSendMessage,
  onFileDrop,
  disabled = false,
  quickCommands = defaultQuickCommands,
}: InputNexusProps) {
  const [message, setMessage] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const dragCounter = useRef(0)

  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.style.height = 'auto'
    textarea.style.height = `${Math.min(textarea.scrollHeight, 132)}px`
  }, [])

  const handleSend = async () => {
    if (!message.trim() || disabled) return
    const content = message.trim()
    setMessage('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    await onSendMessage(content)
  }

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault(); event.stopPropagation()
      setIsDragging(false); dragCounter.current = 0
      if (event.dataTransfer.files.length > 0) {
        onFileDrop?.(event.dataTransfer.files)
        event.dataTransfer.clearData()
      }
    },
    [onFileDrop],
  )

  return (
    <div
      className="relative"
      onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); dragCounter.current++; if (e.dataTransfer.items.length > 0) setIsDragging(true) }}
      onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); dragCounter.current--; if (dragCounter.current === 0) setIsDragging(false) }}
      onDragOver={(e) => { e.preventDefault(); e.stopPropagation() }}
      onDrop={handleDrop}
    >
      {/* 拖拽覆盖层 */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="absolute inset-0 z-20 grid place-items-center rounded-3xl border-2 border-dashed border-indigo-300/60 bg-indigo-500/10 text-sm font-medium text-indigo-200 backdrop-blur-xl"
          >
            松开以上传文档
          </motion.div>
        )}
      </AnimatePresence>

      {/* 输入容器 — 悬浮玻璃风格 */}
      <motion.div
        animate={{
          boxShadow: isFocused
            ? '0 0 0 1px rgba(99,102,241,0.25), 0 0 48px rgba(99,102,241,0.08), 0 8px 32px rgba(0,0,0,0.4)'
            : '0 0 0 1px rgba(255,255,255,0.06), 0 4px 24px rgba(0,0,0,0.3)',
        }}
        className={`rounded-2xl bg-white/[0.03] backdrop-blur-2xl px-4 py-3 transition-all ${
          disabled ? 'opacity-50' : ''
        }`}
      >
        <div className="flex items-end gap-3">
          {/* 快捷指令 */}
          <div className="hidden shrink-0 gap-1.5 xl:flex">
            {quickCommands.map((cmd) => {
              const Icon = commandIcons[cmd.category ?? 'general']
              return (
                <button
                  key={cmd.id}
                  type="button"
                  onClick={() => { setMessage(cmd.command); requestAnimationFrame(adjustTextareaHeight) }}
                  disabled={disabled}
                  className="grid h-10 w-10 place-items-center rounded-xl bg-white/[0.03] border border-white/[0.05] text-slate-400 transition-all hover:bg-white/[0.08] hover:text-white hover:border-white/[0.1] disabled:cursor-not-allowed"
                  title={cmd.name}
                >
                  <Icon className="h-4 w-4" />
                </button>
              )
            })}
          </div>

          {/* 输入框 */}
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => { setMessage(e.target.value); adjustTextareaHeight() }}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void handleSend() } }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="输入问题或指令..."
            disabled={disabled}
            rows={1}
            className="max-h-32 min-h-10 flex-1 resize-none bg-transparent py-2 text-sm leading-7 text-slate-100 outline-none placeholder:text-slate-500 disabled:cursor-not-allowed"
          />

          {/* 发送按钮 */}
          <button
            type="button"
            onClick={() => void handleSend()}
            disabled={!message.trim() || disabled}
            className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl transition-all duration-200 ${
              message.trim() && !disabled
                ? 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:scale-105'
                : 'bg-white/[0.04] text-slate-600 border border-white/[0.04]'
            }`}
            aria-label="发送"
          >
            <SendHorizontal className="h-5 w-5" />
          </button>
        </div>
      </motion.div>
    </div>
  )
}
