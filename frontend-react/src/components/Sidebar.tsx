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

const statusConfig: Record<EmployeeStatus, { label: string; color: string; glow: string }> = {
  idle: { label: '空闲', color: 'bg-emerald-400', glow: 'shadow-emerald-400/50' },
  thinking: { label: '思考中', color: 'bg-amber-400', glow: 'shadow-amber-400/50' },
  reading: { label: '阅读中', color: 'bg-sky-400', glow: 'shadow-sky-400/50' },
  executing: { label: '执行中', color: 'bg-violet-400', glow: 'shadow-violet-400/50' },
  speaking: { label: '输出中', color: 'bg-indigo-400', glow: 'shadow-indigo-400/50' },
}

const navItems = [
  {
    id: 'console' as ViewRoute,
    icon: MessageSquareText,
    label: '控制台',
    description: '专注问答与指令',
  },
  {
    id: 'knowledge-hub' as ViewRoute,
    icon: BookOpen,
    label: '知识库',
    description: '文档管理与检索',
  },
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
      animate={{ width: isCollapsed ? 80 : 260 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="island h-full overflow-hidden"
    >
      <div className="flex h-full flex-col gap-8 p-4">
        {/* Logo 区域 */}
        <div className="flex items-center gap-3 px-1">
          <div className="relative grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-indigo-400/20 via-violet-500/20 to-fuchsia-500/20 ring-1 ring-white/[0.06]">
            <span className="text-xs font-black text-transparent bg-gradient-to-br from-indigo-300 to-fuchsia-300 bg-clip-text">
              AI
            </span>
            <motion.span
              className={`absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full ${config.color} ring-[3px] ring-slate-950 ${config.glow} shadow-[0_0_8px]`}
              animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>

          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                className="min-w-0"
              >
                <h1 className="truncate text-sm font-bold text-transparent bg-gradient-to-r from-white to-slate-400 bg-clip-text">
                  数字员工
                </h1>
                <p className="truncate text-[11px] text-slate-500">{config.label}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 导航区 */}
        <nav className="flex flex-1 flex-col gap-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = currentView === item.id

            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`group relative flex min-h-[52px] items-center gap-3 rounded-2xl px-3 text-left transition-all duration-300 ${
                  isActive
                    ? 'bg-indigo-500/[0.12] text-white ring-1 ring-indigo-500/20'
                    : 'bg-transparent text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
                }`}
              >
                <Icon
                  className={`h-5 w-5 shrink-0 transition-colors ${
                    isActive ? 'text-indigo-400' : ''
                  }`}
                />
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.div
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -6 }}
                      className="min-w-0"
                    >
                      <span className="block text-[13px] font-semibold">{item.label}</span>
                      <span className="block truncate text-[11px] text-slate-500">
                        {item.description}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* 激活指示条 */}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-indicator"
                    className="absolute left-0 top-1/2 h-8 w-[3px] -translate-y-1/2 rounded-full bg-indigo-400"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            )
          })}
        </nav>

        {/* 折叠按钮 */}
        <button
          onClick={onToggleCollapse}
          className="mx-1 grid h-10 place-items-center rounded-xl bg-white/[0.03] text-slate-400 transition-all duration-200 hover:bg-white/[0.08] hover:text-white"
          aria-label={isCollapsed ? '展开侧边栏' : '收起侧边栏'}
        >
          <motion.span
            animate={{ rotate: isCollapsed ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronLeft className="h-4 w-4" />
          </motion.span>
        </button>
      </div>
    </motion.aside>
  )
}
