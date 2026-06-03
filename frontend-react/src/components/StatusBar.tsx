import { motion } from 'framer-motion'
import { Activity, Clock, Database, HardDrive } from 'lucide-react'
import type { EmployeeStatus, SystemStatus } from '../types'

interface StatusBarProps {
  status: EmployeeStatus
  currentAction?: string
  systemStatus: SystemStatus
}

const statusConfig: Record<EmployeeStatus, { label: string; color: string }> = {
  idle: { label: '空闲', color: 'bg-emerald-400' },
  thinking: { label: '思考中', color: 'bg-amber-400' },
  reading: { label: '阅读中', color: 'bg-sky-400' },
  executing: { label: '执行中', color: 'bg-violet-400' },
  speaking: { label: '输出中', color: 'bg-indigo-400' },
}

export function StatusBar({
  status,
  currentAction = '等待指令',
  systemStatus,
}: StatusBarProps) {
  const config = statusConfig[status]

  return (
    <motion.header
      initial={{ opacity: 0, y: -18, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="min-h-24 rounded-3xl border-t border-l border-white/10 border-r border-b border-black/20 bg-slate-950/40 px-8 py-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl"
    >
      <div className="flex h-full flex-wrap items-center justify-between gap-8">
        <div className="min-w-0">
          <h2 className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-2xl font-bold text-transparent">
            数字员工助手
          </h2>
          <p className="mt-1 text-sm text-slate-400">{currentAction}</p>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
          <div className="flex items-center gap-2 rounded-full border-t border-l border-white/10 border-r border-b border-black/20 bg-white/[0.045] px-4 py-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <motion.span
              className={`h-2.5 w-2.5 rounded-full ${config.color}`}
              animate={{ scale: [1, 1.35, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
            {config.label}
          </div>
          <Metric icon={Database} value={systemStatus.apiStatus === 'running' ? '系统正常' : '系统异常'} />
          <Metric icon={HardDrive} value={`${systemStatus.documentCount} 文档`} />
          <Metric icon={Activity} value={`${Math.round(systemStatus.memoryUsage)} MB`} />
          <Metric icon={Clock} value={formatUptime(systemStatus.uptime)} />
        </div>
      </div>
    </motion.header>
  )
}

function Metric({ icon: Icon, value }: { icon: typeof Activity; value: string }) {
  return (
    <span className="flex items-center gap-2 rounded-full bg-white/[0.035] px-3 py-2 text-xs text-slate-400">
      <Icon className="h-3.5 w-3.5" />
      {value}
    </span>
  )
}

function formatUptime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
}
