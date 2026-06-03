import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Task, TaskStatus, TaskPriority } from '../types'

interface TaskBoardProps {
  tasks: Task[]
  onToggle?: (id: string) => void
  onAdd?: (title: string, description?: string, priority?: Task['priority']) => void
}

const statusConfig: Record<TaskStatus, { label: string; color: string; icon: string; bgColor: string }> = {
  todo: {
    label: '待办',
    color: 'text-slate-400',
    icon: '⭕',
    bgColor: 'bg-slate-500/10',
  },
  in_progress: {
    label: '进行中',
    color: 'text-blue-400',
    icon: '🔄',
    bgColor: 'bg-blue-500/10',
  },
  done: {
    label: '已完成',
    color: 'text-emerald-400',
    icon: '✅',
    bgColor: 'bg-emerald-500/10',
  },
}

const priorityConfig: Record<TaskPriority, { label: string; color: string; bgColor: string; borderColor: string }> = {
  low: {
    label: '低',
    color: 'text-slate-400',
    bgColor: 'bg-slate-500/20',
    borderColor: 'border-slate-500/30',
  },
  medium: {
    label: '中',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20',
    borderColor: 'border-yellow-500/30',
  },
  high: {
    label: '高',
    color: 'text-red-400',
    bgColor: 'bg-red-500/20',
    borderColor: 'border-red-500/30',
  },
}

export const TaskBoard: React.FC<TaskBoardProps> = ({
  tasks,
  onToggle,
  onAdd,
}) => {
  const [showAddForm, setShowAddForm] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskDescription, setNewTaskDescription] = useState('')
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('medium')
  
  // 按状态分组任务
  const groupedTasks = {
    todo: tasks.filter(t => t.status === 'todo'),
    in_progress: tasks.filter(t => t.status === 'in_progress'),
    done: tasks.filter(t => t.status === 'done'),
  }
  
  // 添加任务
  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return
    
    onAdd?.(newTaskTitle.trim(), newTaskDescription.trim() || undefined, newTaskPriority)
    
    // 重置表单
    setNewTaskTitle('')
    setNewTaskDescription('')
    setNewTaskPriority('medium')
    setShowAddForm(false)
  }
  
  // 格式化日期
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
    })
  }
  
  // 渲染任务卡片
  const renderTaskCard = (task: Task, index: number) => {
    const statusInfo = statusConfig[task.status]
    const priorityInfo = priorityConfig[task.priority]
    
    return (
      <motion.div
        key={task.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        whileHover={{ scale: 1.01, y: -1 }}
        className={`p-5 rounded-2xl bg-gradient-to-br from-slate-800/50 to-transparent border border-white/5 backdrop-blur-md hover:border-indigo-500/40 transition-all group hover:shadow-[0_0_15px_rgba(99,102,241,0.15)] hover:bg-slate-800/60 ${
          task.status === 'done' ? 'opacity-60' : ''
        }`}
      >
        <div className="flex items-start space-x-3">
          {/* 复选框 */}
          <button
            onClick={() => onToggle?.(task.id)}
            className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
              task.status === 'done'
                ? 'bg-emerald-500 border-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                : task.status === 'in_progress'
                ? 'bg-blue-500 border-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]'
                : 'border-slate-600 hover:border-indigo-500 hover:shadow-[0_0_8px_rgba(99,102,241,0.3)]'
            }`}
          >
            {task.status === 'done' && (
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {task.status === 'in_progress' && (
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-2 h-2 rounded-full bg-white"
              />
            )}
          </button>
          
          {/* 任务内容 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h4 className={`text-sm font-medium ${
                task.status === 'done' ? 'line-through text-slate-500' : 'text-slate-200'
              }`}>
                {task.title}
              </h4>
              
              {/* 优先级徽章 */}
              <span className={`px-1.5 py-0.5 rounded text-xs ${priorityInfo.color} ${priorityInfo.bgColor} ${priorityInfo.borderColor} border`}>
                {priorityInfo.label}
              </span>
            </div>
            
            {task.description && (
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                {task.description}
              </p>
            )}
            
            <div className="flex items-center space-x-3 mt-2 text-xs text-slate-500">
              <span className={`${statusInfo.color} ${statusInfo.bgColor} px-1.5 py-0.5 rounded`}>
                {statusInfo.icon} {statusInfo.label}
              </span>
              <span>•</span>
              <span>创建于 {formatDate(task.createdAt)}</span>
              {task.dueDate && (
                <>
                  <span>•</span>
                  <span>截止 {formatDate(task.dueDate)}</span>
                </>
              )}
              {task.completedAt && (
                <>
                  <span>•</span>
                  <span>完成于 {formatDate(task.completedAt)}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    )
  }
  
  return (
    <div className="h-full flex flex-col">
      {/* 头部操作栏 */}
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-100">任务看板</h3>
            <p className="text-xs text-slate-400 mt-1">
              管理你的待办事项和任务
            </p>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm hover:bg-indigo-700 transition-colors shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:shadow-[0_0_20px_rgba(99,102,241,0.5)]"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>添加任务</span>
          </motion.button>
        </div>
        
        {/* 添加任务表单 */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 space-y-3"
            >
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="任务标题"
                className="w-full px-4 py-3 bg-slate-900/40 backdrop-blur-md rounded-xl text-sm text-slate-200 placeholder-slate-500 outline-none border border-white/5 focus:border-indigo-500/40 focus:shadow-[0_0_15px_rgba(99,102,241,0.15)] transition-all"
              />
              
              <textarea
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                placeholder="任务描述（可选）"
                rows={2}
                className="w-full px-4 py-3 bg-slate-900/40 backdrop-blur-md rounded-xl text-sm text-slate-200 placeholder-slate-500 outline-none border border-white/5 focus:border-indigo-500/40 focus:shadow-[0_0_15px_rgba(99,102,241,0.15)] transition-all resize-none"
              />
              
              <div className="flex items-center space-x-3">
                <span className="text-xs text-slate-400">优先级:</span>
                {(['low', 'medium', 'high'] as TaskPriority[]).map((priority) => {
                  const info = priorityConfig[priority]
                  return (
                    <button
                      key={priority}
                      onClick={() => setNewTaskPriority(priority)}
                      className={`px-2 py-1 rounded text-xs transition-all border ${
                        newTaskPriority === priority
                          ? `${info.bgColor} ${info.color} ${info.borderColor}`
                          : 'text-slate-500 hover:text-slate-300 border-transparent hover:border-white/10'
                      }`}
                    >
                      {info.label}
                    </button>
                  )
                })}
                
                <div className="flex-1"></div>
                
                <button
                  onClick={handleAddTask}
                  disabled={!newTaskTitle.trim()}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700 transition-colors shadow-[0_0_10px_rgba(99,102,241,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  添加
                </button>
                
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-400 text-sm hover:text-slate-200 transition-colors hover:bg-slate-800/50"
                >
                  取消
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* 任务列表 */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* 进行中的任务 */}
        {groupedTasks.in_progress.length > 0 && (
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-blue-400"></div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                进行中 ({groupedTasks.in_progress.length})
              </h4>
            </div>
            <div className="space-y-4">
              {groupedTasks.in_progress.map((task, index) => renderTaskCard(task, index))}
            </div>
          </div>
        )}
        
        {/* 待办任务 */}
        {groupedTasks.todo.length > 0 && (
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-slate-400"></div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                待办 ({groupedTasks.todo.length})
              </h4>
            </div>
            <div className="space-y-4">
              {groupedTasks.todo.map((task, index) => renderTaskCard(task, index))}
            </div>
          </div>
        )}
        
        {/* 已完成任务 */}
        {groupedTasks.done.length > 0 && (
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                已完成 ({groupedTasks.done.length})
              </h4>
            </div>
            <div className="space-y-3">
              {groupedTasks.done.map((task, index) => renderTaskCard(task, index))}
            </div>
          </div>
        )}
        
        {/* 空状态 */}
        {tasks.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <div className="text-4xl mb-3">📋</div>
            <div className="text-slate-400">暂无任务</div>
            <div className="text-sm text-slate-500 mt-1">
              点击"添加任务"创建新任务
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}