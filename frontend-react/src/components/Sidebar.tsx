import { AnimatePresence, motion } from 'framer-motion'
import { BookOpen, ChevronLeft, MessageSquareText } from 'lucide-react'
import type { EmployeeStatus, ViewRoute } from '../types'

interface SidebarProps {
  currentView: ViewRoute
  onViewChange: (view: ViewRoute) => void
  status: EmployeeStatus
  isCollapsed: boolean
  onToggleCollapse: () => void
}

const statusConfig: Record<EmployeeStatus, { label: string; color: string }> = {
  idle: { label: '空闲', color: 'bg-emerald-400' },
  thinking: { label: '思考中', color: 'bg-amber-400' },
  reading: { label: '阅读中', color: 'bg-sky-400' },
  executing: { label: '执行中', color: 'bg-violet-400' },
  speaking: { label: '输出中', color: 'bg-indigo-400' },
}

const navItems = [
  { id: 'console' as ViewRoute, icon: MessageSquareText, label: '对话', description: '专注问答与指令' },
  { id: 'knowledge-hub' as ViewRoute, icon: BookOpen, label: '知识库', description: '文档管理与检索' },
]

export function Sidebar({
  currentView,
  onViewChange,
  status,
  isCollapsed,
  onToggleCollapse,
}: SidebarProps) {
  const config = statusConfig[status]

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 88 : 280 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="h-full overflow-hidden rounded-3xl border-t border-l border-white/10 border-r border-b border-black/20 bg-slate-950/45 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl"
    >
      <div className="flex h-full flex-col gap-12 p-6">
        <div className="flex items-center gap-4">
          <div className="relative grid h-12 w-12 shrink-0 place-items-center rounded-3xl bg-gradient-to-br from-white/20 via-indigo-400/30 to-fuchsia-500/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <span className="text-sm font-black text-white">AI</span>
            <motion.span
              className={`absolute -right-0.5 -bottom-0.5 h-3.5 w-3.5 rounded-full ${config.color} ring-4 ring-slate-950/80`}
              animate={{ scale: [1, 1.25, 1], opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>

          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                className="min-w-0"
              >
                <h1 className="truncate bg-gradient-to-r from-white to-slate-400 bg-clip-text text-lg font-bold text-transparent">
                  数字员工
                </h1>
                <p className="truncate text-xs text-slate-400">{config.label}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <nav className="flex flex-1 flex-col gap-4">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = currentView === item.id

            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`group relative flex min-h-16 items-center gap-4 rounded-3xl border-t border-l border-white/10 border-r border-b border-black/20 px-4 text-left shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition ${
                  isActive
                    ? 'bg-gradient-to-br from-indigo-500/30 via-violet-500/20 to-fuchsia-500/20 text-white'
                    : 'bg-white/[0.035] text-slate-400 hover:bg-white/[0.07] hover:text-slate-100'
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      className="min-w-0"
                    >
                      <span className="block text-sm font-semibold">{item.label}</span>
                      <span className="block truncate text-xs text-slate-400">{item.description}</span>
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            )
          })}
        </nav>

        <button
          onClick={onToggleCollapse}
          className="grid h-12 place-items-center rounded-full border-t border-l border-white/10 border-r border-b border-black/20 bg-white/[0.04] text-slate-300 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition hover:bg-white/[0.08] hover:text-white"
          aria-label={isCollapsed ? '展开侧边栏' : '收起侧边栏'}
        >
          <ChevronLeft className={`h-5 w-5 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>
    </motion.aside>
  )
}
