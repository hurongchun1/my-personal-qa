import React from 'react'
import { motion } from 'framer-motion'
import type { EmployeeStatus } from '../types'

interface SidebarProps {
  status: EmployeeStatus
  onTabChange?: (tab: 'chat' | 'knowledge' | 'tasks') => void
  activeTab?: 'chat' | 'knowledge' | 'tasks'
}

const statusConfig: Record<EmployeeStatus, { icon: string; label: string; color: string }> = {
  idle: {
    icon: '☕',
    label: '空闲',
    color: 'bg-emerald-500',
  },
  thinking: {
    icon: '🤔',
    label: '思考中',
    color: 'bg-yellow-500',
  },
  reading: {
    icon: '📖',
    label: '阅读中',
    color: 'bg-blue-500',
  },
  executing: {
    icon: '⚡',
    label: '执行中',
    color: 'bg-purple-500',
  },
  speaking: {
    icon: '💬',
    label: '输出中',
    color: 'bg-indigo-500',
  },
}

export const Sidebar: React.FC<SidebarProps> = ({
  status,
  onTabChange,
  activeTab = 'chat',
}) => {
  const config = statusConfig[status]

  const tabs = [
    {
      id: 'chat' as const,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      label: '对话',
    },
    {
      id: 'knowledge' as const,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      label: '知识库',
    },
    {
      id: 'tasks' as const,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      label: '任务',
    },
  ]

  return (
    <div className="w-16 flex flex-col items-center py-4 bg-slate-900/80 border-r border-slate-700/50">
      {/* 数字员工标识 */}
      <div className="relative mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
          <span className="text-white text-sm font-bold">AI</span>
        </div>
        
        {/* 状态指示灯 */}
        <motion.div
          className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full ${config.color} border-2 border-slate-900`}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [1, 0.7, 1],
            boxShadow: [
              '0 0 0 0 rgba(129, 140, 248, 0)',
              '0 0 0 4px rgba(129, 140, 248, 0.3)',
              '0 0 0 0 rgba(129, 140, 248, 0)',
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* 导航标签 */}
      <nav className="flex-1 flex flex-col items-center space-y-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange?.(tab.id)}
            className={`relative p-3 rounded-xl transition-all duration-200 group ${
              activeTab === tab.id
                ? 'bg-indigo-500/20 text-indigo-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
            title={tab.label}
          >
            {tab.icon}
            
            {/* 活动指示器 */}
            {activeTab === tab.id && (
              <motion.div
                layoutId="sidebarActiveTab"
                className="absolute inset-0 bg-indigo-500/10 rounded-xl -z-10"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
            
            {/* 工具提示 */}
            <div className="absolute left-full ml-3 px-2 py-1 bg-slate-800 text-slate-200 text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
              {tab.label}
            </div>
          </button>
        ))}
      </nav>

      {/* 底部信息 */}
      <div className="mt-auto flex flex-col items-center space-y-3">
        {/* 状态标签 */}
        <div className="flex flex-col items-center">
          <span className="text-lg">{config.icon}</span>
          <span className="text-[10px] text-slate-500 mt-1">{config.label}</span>
        </div>
        
        {/* 分隔线 */}
        <div className="w-8 h-px bg-slate-700/50"></div>
        
        {/* 版本信息 */}
        <span className="text-[10px] text-slate-600">v1.0</span>
      </div>
    </div>
  )
}