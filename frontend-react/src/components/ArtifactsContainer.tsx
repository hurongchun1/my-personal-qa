import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Document, Task, ArtifactType } from '../types'
import { KnowledgeBase } from './KnowledgeBase'
import { TaskBoard } from './TaskBoard'

interface ArtifactsContainerProps {
  activeArtifact: ArtifactType
  documents: Document[]
  tasks: Task[]
  onArtifactChange: (artifact: ArtifactType) => void
  onDocumentUpload?: (file: File) => void
  onDocumentDelete?: (id: string) => void
  onDocumentProcess?: (id: string) => void
  onTaskToggle?: (id: string) => void
  onTaskAdd?: (title: string, description?: string, priority?: Task['priority']) => void
}

const tabs = [
  { id: 'knowledge_base' as ArtifactType, label: '知识库', icon: '📂' },
  { id: 'task_board' as ArtifactType, label: '任务', icon: '📊' },
]

export const ArtifactsContainer: React.FC<ArtifactsContainerProps> = ({
  activeArtifact,
  documents,
  tasks,
  onArtifactChange,
  onDocumentUpload,
  onDocumentDelete,
  onDocumentProcess,
  onTaskToggle,
  onTaskAdd,
}) => {
  const [activeTab, setActiveTab] = useState<ArtifactType>(
    activeArtifact === 'empty' ? 'knowledge_base' : activeArtifact,
  )

  const handleTabChange = (tab: ArtifactType) => {
    setActiveTab(tab)
    onArtifactChange(tab)
  }

  const docStats = {
    total: documents.length,
    completed: documents.filter((d) => d.status === 'completed').length,
  }

  const taskStats = {
    total: tasks.length,
    todo: tasks.filter((t) => t.status === 'todo').length,
  }

  return (
    <div className="flex flex-col h-full">
      {/* Tab 头部 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`relative flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'text-white bg-white/[0.06]'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.03]'
              }`}
            >
              <span className="text-sm">{tab.icon}</span>
              <span>{tab.label}</span>

              {tab.id === 'knowledge_base' && docStats.total > 0 && (
                <span className="ml-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-indigo-500/20 px-1 text-[10px] font-medium text-indigo-400">
                  {docStats.total}
                </span>
              )}
              {tab.id === 'task_board' && taskStats.total > 0 && (
                <span className="ml-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-500/20 px-1 text-[10px] font-medium text-emerald-400">
                  {taskStats.total}
                </span>
              )}

              {activeTab === tab.id && (
                <motion.div
                  layoutId="artifactActiveTab"
                  className="absolute inset-0 rounded-xl bg-white/[0.06] ring-1 ring-white/[0.04]"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab 内容 */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === 'knowledge_base' ? (
            <motion.div
              key="knowledge_base"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.25 }}
              className="h-full"
            >
              <KnowledgeBase
                documents={documents}
                onUpload={onDocumentUpload}
                onDelete={onDocumentDelete}
                onProcess={onDocumentProcess}
              />
            </motion.div>
          ) : (
            <motion.div
              key="task_board"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.25 }}
              className="h-full"
            >
              <TaskBoard tasks={tasks} onToggle={onTaskToggle} onAdd={onTaskAdd} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
