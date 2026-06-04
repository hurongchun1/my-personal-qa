import { type ReactNode } from 'react'
import { Bot, BrainCircuit, Workflow, Settings, Plus } from 'lucide-react'
import type { ViewType } from '../types'

interface AppLayoutProps {
  currentView: ViewType
  onViewChange: (view: ViewType) => void
  children: ReactNode
}

/**
 * AppLayout — 顶层全局外壳
 * 左侧固定 Sidebar (w-64) + 右侧主工作区 (flex-1)
 * 所有颜色均为 hex 硬编码，杜绝配置失效
 */
export function AppLayout({ currentView, onViewChange, children }: AppLayoutProps) {
  const navItems: { id: ViewType; label: string; icon: ReactNode }[] = [
    { id: 'agents',     label: 'Agents',    icon: <Bot className="h-5 w-5" /> },
    { id: 'brain',      label: 'Brain/KB',  icon: <BrainCircuit className="h-5 w-5" /> },
    { id: 'pipelines',  label: 'Pipelines', icon: <Workflow className="h-5 w-5" /> },
    { id: 'settings',   label: 'Settings',  icon: <Settings className="h-5 w-5" /> },
  ]

  return (
    <div className="flex h-screen w-screen bg-[#020617] overflow-hidden">
      {/* ═══ 左侧固定 Sidebar ═══ */}
      <aside className="hidden md:flex flex-col h-full w-64 bg-[#0f172a]/50 backdrop-blur-xl border-r border-white/5 p-4 gap-1 shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="h-8 w-8 rounded-lg bg-[#4f46e5] flex items-center justify-center">
            <Bot className="h-5 w-5 text-[#dad7ff]" />
          </div>
          <h1 className="text-xl font-bold text-[#c3c0ff] tracking-tight">
            Admin Console
          </h1>
        </div>

        {/* 导航菜单 */}
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const isActive = currentView === item.id
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`
                  flex items-center gap-3 w-full text-left rounded-lg px-4 py-2.5 transition-all duration-200
                  ${isActive
                    ? 'bg-[#4f46e5] text-[#dad7ff] shadow-lg'
                    : 'text-[#94a3b8] hover:bg-white/5 hover:translate-x-1'
                  }
                `}
              >
                {item.icon}
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            )
          })}
        </nav>

        {/* 用户区 + 按钮 */}
        <div className="mt-auto space-y-3">
          {/* Profile */}
          <div className="p-4 bg-white/5 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#4f46e5] flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-[#dad7ff]">AC</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium text-[#dce1fb] truncate">Alex Chen</span>
              <span className="text-xs text-[#94a3b8]">AI Director</span>
            </div>
          </div>

          {/* 宽大扁平操作按钮 */}
          <button className="w-full bg-[#c3c0ff] text-[#1d00a5] py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
            <Plus className="h-4 w-4" />
            New Asset
          </button>
        </div>
      </aside>

      {/* ═══ 右侧主工作区 ═══ */}
      <main className="flex-1 min-w-0 h-full overflow-hidden">
        {children}
      </main>
    </div>
  )
}
