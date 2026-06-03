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
  {
    id: 'documents',
    name: '文档',
    description: '查看知识库文档',
    command: '请帮我查看知识库中的文档。',
    category: 'document',
  },
  {
    id: 'tasks',
    name: '任务',
    description: '创建新任务',
    command: '请帮我创建一个新任务。',
    category: 'task',
  },
  {
    id: 'help',
    name: '帮助',
    description: '获取帮助信息',
    command: '你能帮我做什么？',
    category: 'general',
  },
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

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.stopPropagation()
    setIsDragging(false)
    dragCounter.current = 0

    if (event.dataTransfer.files.length > 0) {
      onFileDrop?.(event.dataTransfer.files)
      event.dataTransfer.clearData()
    }
  }, [onFileDrop])

  return (
    <div
      className="relative"
      onDragEnter={(event) => {
        event.preventDefault()
        event.stopPropagation()
        dragCounter.current += 1
        if (event.dataTransfer.items.length > 0) setIsDragging(true)
      }}
      onDragLeave={(event) => {
        event.preventDefault()
        event.stopPropagation()
        dragCounter.current -= 1
        if (dragCounter.current === 0) setIsDragging(false)
      }}
      onDragOver={(event) => {
        event.preventDefault()
        event.stopPropagation()
      }}
      onDrop={handleDrop}
    >
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="absolute inset-0 z-20 grid place-items-center rounded-full border-2 border-dashed border-indigo-300/70 bg-indigo-500/15 text-sm font-medium text-indigo-100 backdrop-blur-xl"
          >
            松开以上传文档
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        animate={{
          boxShadow: isFocused
            ? '0 24px 70px rgba(79,70,229,0.36), 0 20px 50px rgba(0,0,0,0.5)'
            : '0 20px 50px rgba(0,0,0,0.5)',
        }}
        className={`rounded-full border-t border-l border-white/10 border-r border-b border-black/20 bg-slate-950/70 px-4 py-3 backdrop-blur-2xl transition ${
          disabled ? 'opacity-55' : ''
        }`}
      >
        <div className="flex items-end gap-4">
          <div className="hidden shrink-0 gap-2 xl:flex">
            {quickCommands.map((command) => {
              const Icon = commandIcons[command.category ?? 'general']
              return (
                <button
                  key={command.id}
                  type="button"
                  onClick={() => {
                    setMessage(command.command)
                    requestAnimationFrame(adjustTextareaHeight)
                  }}
                  disabled={disabled}
                  className="grid h-11 w-11 place-items-center rounded-full border-t border-l border-white/10 border-r border-b border-black/20 bg-white/[0.045] text-slate-400 transition hover:bg-white/[0.08] hover:text-white disabled:cursor-not-allowed"
                  title={command.name}
                >
                  <Icon className="h-4 w-4" />
                </button>
              )
            })}
          </div>

          <textarea
            ref={textareaRef}
            value={message}
            onChange={(event) => {
              setMessage(event.target.value)
              adjustTextareaHeight()
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault()
                void handleSend()
              }
            }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="输入问题或指令..."
            disabled={disabled}
            rows={1}
            className="max-h-32 min-h-11 flex-1 resize-none bg-transparent py-2 text-base leading-7 text-slate-100 outline-none placeholder:text-slate-500 disabled:cursor-not-allowed"
          />

          <button
            type="button"
            onClick={() => void handleSend()}
            disabled={!message.trim() || disabled}
            className={`grid h-12 w-12 shrink-0 place-items-center rounded-full transition ${
              message.trim() && !disabled
                ? 'bg-gradient-to-br from-white via-indigo-200 to-fuchsia-300 text-slate-950 shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:scale-105'
                : 'bg-white/[0.06] text-slate-600'
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
