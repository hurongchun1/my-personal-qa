import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Task, TaskStatus, TaskPriority } from '../types'

interface TaskBoardProps {
  tasks: Task[]
  onToggle?: (id: string) => void
  onAdd?: (title: string, description?: string, priority?: Task['priority']) => void
}

const statusConfig: Record<TaskStatus, { label: string; color: string; icon: string }> = {
  todo: {
    label: '待办',
    color: 'text-slate-400',
    icon: '⭕',
  },
  in_progress: {
    label: '进行中',
    color: 'text-blue-400',
    icon: '🔄',
  },
  done: {
    label: '已完成',
    color: 'text-emerald-400',
    icon: '✅',
  },
}

const priorityConfig: Record<TaskPriority, { label: string; color: string; bgColor: string }> = {
  low: {
    label: '低',
    color: 'text-slate-400',
    bgColor: 'bg-slate-500/20',
  },
  medium: {
    label: '中',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20',
  },
  high: {
    label: '高',
    color: 'text-red-400',
    bgColor: 'bg-red-500/20',
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className={`bg-slate-800/40 rounded-xl p-4 hover:bg-slate-800/60 transition-colors group ${
          task.status === 'done' ? 'opacity-60' : ''
        }`}
      >
        <div className="flex items-start space-x-3">
          {/* 复选框 */}
          <button
            onClick={() => onToggle?.(task.id)}
            className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
              task.status === 'done'
                ? 'bg-emerald-500 border-emerald-500'
                : task.status === 'in_progress'
                ? 'bg-blue-500 border-blue-500'
                : 'border-slate-600 hover:border-indigo-500'
            }`}
          >
            {task.status === 'done' && (
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {task.status === 'in_progress' && (
              <div className="w-2 h-2 rounded-full bg-white"></div>
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
              <span className={`px-1.5 py-0.5 rounded text-xs ${priorityInfo.color} ${priorityInfo.bgColor}`}>
                {priorityInfo.label}
              </span>
            </div>
            
            {task.description && (
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                {task.description}
              </p>
            )}
            
            <div className="flex items-center space-x-3 mt-2 text-xs text-slate-500">
              <span>{statusInfo.icon} {statusInfo.label}</span>
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
      <div className="p-4 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-slate-200">任务看板</h3>
            <p className="text-xs text-slate-500 mt-1">
              管理你的待办事项和任务
            </p>
          </div>
          
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>添加任务</span>
          </button>
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
                className="w-full px-3 py-2 bg-slate-800/60 rounded-lg text-sm text-slate-200 placeholder-slate-500 outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
              
              <textarea
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                placeholder="任务描述（可选）"
                rows={2}
                className="w-full px-3 py-2 bg-slate-800/60 rounded-lg text-sm text-slate-200 placeholder-slate-500 outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
              />
              
              <div className="flex items-center space-x-3">
                <span className="text-xs text-slate-400">优先级:</span>
                {(['low', 'medium', 'high'] as TaskPriority[]).map((priority) => {
                  const info = priorityConfig[priority]
                  return (
                    <button
                      key={priority}
                      onClick={() => setNewTaskPriority(priority)}
                      className={`px-2 py-1 rounded text-xs transition-colors ${
                        newTaskPriority === priority
                          ? `${info.bgColor} ${info.color}`
                          : 'text-slate-500 hover:text-slate-300'
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
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  添加
                </button>
                
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-400 text-sm hover:text-slate-200 transition-colors"
                >
                  取消
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* 任务列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* 进行中的任务 */}
        {groupedTasks.in_progress.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              进行中 ({groupedTasks.in_progress.length})
            </h4>
            <div className="space-y-3">
              {groupedTasks.in_progress.map((task, index) => renderTaskCard(task, index))}
            </div>
          </div>
        )}
        
        {/* 待办任务 */}
        {groupedTasks.todo.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              待办 ({groupedTasks.todo.length})
            </h4>
            <div className="space-y-3">
              {groupedTasks.todo.map((task, index) => renderTaskCard(task, index))}
            </div>
          </div>
        )}
        
        {/* 已完成任务 */}
        {groupedTasks.done.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              已完成 ({groupedTasks.done.length})
            </h4>
            <div className="space-y-3">
              {groupedTasks.done.map((task, index) => renderTaskCard(task, index))}
            </div>
          </div>
        )}
        
        {/* 空状态 */}
        {tasks.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">📋</div>
            <div className="text-slate-400">暂无任务</div>
            <div className="text-sm text-slate-500 mt-1">
              点击"添加任务"创建新任务
            </div>
          </div>
        )}
      </div>
    </div>
  )
}