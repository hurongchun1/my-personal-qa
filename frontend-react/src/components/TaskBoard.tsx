import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Task, TaskStatus, TaskPriority } from '../types'

interface TaskBoardProps {
  tasks: Task[]
  onToggle?: (id: string) => void
  onAdd?: (title: string, description?: string, priority?: Task['priority']) => void
}

const statusConfig: Record<TaskStatus, { label: string; color: string }> = {
  todo: { label: '待办', color: '#94a3b8' },
  in_progress: { label: '进行中', color: '#60a5fa' },
  done: { label: '已完成', color: '#34d399' },
}

const priorityConfig: Record<TaskPriority, { label: string; color: string }> = {
  low: { label: '低', color: '#94a3b8' },
  medium: { label: '中', color: '#fbbf24' },
  high: { label: '高', color: '#f87171' },
}

export const TaskBoard: React.FC<TaskBoardProps> = ({ tasks, onToggle, onAdd }) => {
  const [showAddForm, setShowAddForm] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskDescription, setNewTaskDescription] = useState('')
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('medium')

  const groupedTasks = {
    in_progress: tasks.filter((t) => t.status === 'in_progress'),
    todo: tasks.filter((t) => t.status === 'todo'),
    done: tasks.filter((t) => t.status === 'done'),
  }

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return
    onAdd?.(newTaskTitle.trim(), newTaskDescription.trim() || undefined, newTaskPriority)
    setNewTaskTitle(''); setNewTaskDescription(''); setNewTaskPriority('medium')
    setShowAddForm(false)
  }

  const formatDate = (date: Date): string =>
    date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })

  const renderTaskCard = (task: Task, _index: number) => {
    const st = statusConfig[task.status]
    const pri = priorityConfig[task.priority]

    return (
      <motion.div
        key={task.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bento-card group py-3 px-4 ${task.status === 'done' ? 'opacity-50' : ''}`}
      >
        <div className="flex items-start gap-3">
          {/* 复选框 */}
          <button
            onClick={() => onToggle?.(task.id)}
            className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-white/[0.12] transition-all hover:border-indigo-400/50"
            style={
              task.status === 'done'
                ? { background: '#34d399', borderColor: '#34d399', boxShadow: '0 0 8px rgba(52,211,153,0.4)' }
                : task.status === 'in_progress'
                ? { background: '#60a5fa', borderColor: '#60a5fa', boxShadow: '0 0 8px rgba(96,165,250,0.4)' }
                : {}
            }
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
                className="h-2 w-2 rounded-full bg-white"
              />
            )}
          </button>

          {/* 内容 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className={`text-[13px] font-medium ${task.status === 'done' ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                {task.title}
              </h4>
              <span
                className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium border"
                style={{ color: pri.color, borderColor: `${pri.color}30`, background: `${pri.color}10` }}
              >
                {pri.label}
              </span>
            </div>
            {task.description && (
              <p className="mt-0.5 text-[11px] text-slate-500 line-clamp-2">{task.description}</p>
            )}
            <div className="mt-1.5 flex items-center gap-2 text-[10px] text-slate-600">
              <span style={{ color: st.color, background: `${st.color}12` }} className="rounded px-1.5 py-0.5">
                {st.label}
              </span>
              <span>·</span>
              <span>{formatDate(task.createdAt)}</span>
              {task.dueDate && (
                <>
                  <span>·</span>
                  <span>截止 {formatDate(task.dueDate)}</span>
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
      {/* 头部 */}
      <div className="px-4 py-3 border-b border-white/[0.06]">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-100">任务看板</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">管理你的待办事项</p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-500 transition-colors shadow-[0_0_16px_rgba(99,102,241,0.3)]"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            添加
          </button>
        </div>

        {/* 添加表单 */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 space-y-2 overflow-hidden"
            >
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="任务标题"
                className="w-full rounded-xl bg-white/[0.03] border border-white/[0.06] px-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              <textarea
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                placeholder="描述（可选）"
                rows={2}
                className="w-full rounded-xl bg-white/[0.03] border border-white/[0.06] px-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 outline-none resize-none focus:ring-2 focus:ring-indigo-500/20"
              />
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500">优先级:</span>
                {(['low', 'medium', 'high'] as TaskPriority[]).map((p) => {
                  const info = priorityConfig[p]
                  return (
                    <button
                      key={p}
                      onClick={() => setNewTaskPriority(p)}
                      className="rounded px-2 py-0.5 text-[10px] border transition-all"
                      style={
                        newTaskPriority === p
                          ? { color: info.color, borderColor: `${info.color}40`, background: `${info.color}12` }
                          : { color: '#64748b', borderColor: 'transparent' }
                      }
                    >
                      {info.label}
                    </button>
                  )
                })}
                <div className="flex-1" />
                <button
                  onClick={handleAddTask}
                  disabled={!newTaskTitle.trim()}
                  className="rounded-lg bg-indigo-600 px-3 py-1 text-[11px] text-white hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  确认
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="rounded-lg px-3 py-1 text-[11px] text-slate-500 hover:text-slate-300 hover:bg-white/[0.04] transition-colors"
                >
                  取消
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 任务列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="text-3xl mb-2">📋</div>
            <p className="text-sm text-slate-400">暂无任务</p>
            <p className="text-[11px] text-slate-600 mt-0.5">点击"添加"创建新任务</p>
          </div>
        ) : (
          <>
            {groupedTasks.in_progress.length > 0 && (
              <Section label="进行中" count={groupedTasks.in_progress.length} color="#60a5fa">
                {groupedTasks.in_progress.map((t, i) => renderTaskCard(t, i))}
              </Section>
            )}
            {groupedTasks.todo.length > 0 && (
              <Section label="待办" count={groupedTasks.todo.length} color="#94a3b8">
                {groupedTasks.todo.map((t, i) => renderTaskCard(t, i))}
              </Section>
            )}
            {groupedTasks.done.length > 0 && (
              <Section label="已完成" count={groupedTasks.done.length} color="#34d399">
                {groupedTasks.done.map((t, i) => renderTaskCard(t, i))}
              </Section>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function Section({
  label,
  count,
  color,
  children,
}: {
  label: string
  count: number
  color: string
  children: React.ReactNode
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div className="h-2 w-2 rounded-full" style={{ background: color }} />
        <h4 className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          {label} ({count})
        </h4>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  )
}
