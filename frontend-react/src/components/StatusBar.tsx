import React from 'react'
import { motion } from 'framer-motion'
import type { EmployeeStatus } from '../types'

interface StatusBarProps {
  status: EmployeeStatus
  currentAction?: string
  progress?: number
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

export const StatusBar: React.FC<StatusBarProps> = ({ 
  status, 
  currentAction = '等待指令',
  progress 
}) => {
  const config = statusConfig[status]
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-effect h-14 px-6 flex items-center justify-between"
    >
      {/* 左侧：数字员工标识 */}
      <div className="flex items-center space-x-3">
        <div className="relative">
          {/* 头像 */}
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <span className="text-white text-sm font-semibold">AI</span>
          </div>
          
          {/* 状态指示灯 */}
          <motion.div
            className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ${config.color} border-2 border-slate-900`}
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
        
        <div>
          <h1 className="text-sm font-semibold text-white">数字员工助手</h1>
          <p className="text-xs text-slate-400">v1.0.0</p>
        </div>
      </div>
      
      {/* 中间：当前状态 */}
      <div className="flex items-center space-x-4">
        {/* 状态标签 */}
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-800/60">
          <span className="text-base">{config.icon}</span>
          <span className="text-sm text-slate-300">{config.label}</span>
        </div>
        
        {/* 当前动作 */}
        <div className="flex items-center space-x-2 max-w-md">
          <span className="text-sm text-slate-400">状态:</span>
          <motion.span
            className="text-sm text-white truncate"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            key={currentAction}
          >
            {currentAction}
          </motion.span>
          
          {/* 进度条 */}
          {progress !== undefined && (
            <div className="flex items-center space-x-2">
              <div className="w-20 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-indigo-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
              <span className="text-xs text-slate-400">({Math.round(progress)}%)</span>
            </div>
          )}
        </div>
      </div>
      
      {/* 右侧：系统信息 */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          <span className="text-xs text-slate-400">系统正常</span>
        </div>
        
        <div className="text-xs text-slate-500">
          {new Date().toLocaleTimeString('zh-CN', { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit' 
          })}
        </div>
      </div>
    </motion.div>
  )
}