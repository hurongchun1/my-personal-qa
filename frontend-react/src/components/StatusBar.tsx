import { motion } from 'framer-motion'
import { Activity, Clock, Database, HardDrive } from 'lucide-react'
import type { EmployeeStatus, SystemStatus } from '../types'

interface StatusBarProps {
  status: EmployeeStatus
  currentAction?: string
  systemStatus: SystemStatus
}

const statusConfig: Record<EmployeeStatus, { label: string; color: string; glow: string }> = {
  idle: { label: '空闲', color: 'bg-emerald-400', glow: 'shadow-emerald-400/40' },
  thinking: { label: '思考中', color: 'bg-amber-400', glow: 'shadow-amber-400/40' },
  reading: { label: '阅读中', color: 'bg-sky-400', glow: 'shadow-sky-400/40' },
  executing: { label: '执行中', color: 'bg-violet-400', glow: 'shadow-violet-400/40' },
  speaking: { label: '输出中', color: 'bg-indigo-400', glow: 'shadow-indigo-400/40' },
}

export function StatusBar({
  status,
  currentAction = '等待指令',
  systemStatus,
}: StatusBarProps) {
  const config = statusConfig[status]

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      {/* 左侧：标题 */}
      <div className="min-w-0">
        <h2 className="text-lg font-bold text-transparent bg-gradient-to-r from-white to-slate-400 bg-clip-text">
          数字员工助手
        </h2>
        <p className="mt-0.5 text-xs text-slate-500">{currentAction}</p>
      </div>

      {/* 右侧：指标 */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
        {/* 状态指示 */}
        <span className="flex items-center gap-1.5 rounded-lg bg-white/[0.03] px-3 py-1.5 border border-white/[0.05]">
          <motion.span
            className={`h-2 w-2 rounded-full ${config.color}`}
            animate={{ scale: [1, 1.35, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
          {config.label}
        </span>

        <Metric icon={Database} value={systemStatus.apiStatus === 'running' ? '系统正常' : '系统异常'} />
        <Metric icon={HardDrive} value={`${systemStatus.documentCount} 文档`} />
        <Metric icon={Activity} value={`${Math.round(systemStatus.memoryUsage)} MB`} />
        <Metric icon={Clock} value={formatUptime(systemStatus.uptime)} />
      </div>
    </div>
  )
}

function Metric({ icon: Icon, value }: { icon: typeof Activity; value: string }) {
  return (
    <span className="flex items-center gap-1.5 rounded-lg bg-white/[0.03] px-3 py-1.5 border border-white/[0.05]">
      <Icon className="h-3 w-3 text-slate-500" />
      {value}
    </span>
  )
}

function formatUptime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
}
