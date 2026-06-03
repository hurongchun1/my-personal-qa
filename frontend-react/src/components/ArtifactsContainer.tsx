import React, { useState } from 'react'
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
    activeArtifact === 'empty' ? 'knowledge_base' : activeArtifact
  )
  
  // 处理Tab切换
  const handleTabChange = (tab: ArtifactType) => {
    setActiveTab(tab)
    onArtifactChange(tab)
  }
  
  // 计算任务统计
  const taskStats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    done: tasks.filter(t => t.status === 'done').length,
  }
  
  // 计算文档统计
  const docStats = {
    total: documents.length,
    completed: documents.filter(d => d.status === 'completed').length,
    processing: documents.filter(d => d.status === 'processing').length,
  }
  
  return (
    <div className="flex flex-col h-full">
      {/* Tab头部 */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
        <div className="flex space-x-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`relative flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              
              {/* 统计徽章 */}
              {tab.id === 'knowledge_base' && docStats.total > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-indigo-500/20 text-indigo-400">
                  {docStats.total}
                </span>
              )}
              {tab.id === 'task_board' && taskStats.total > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-emerald-500/20 text-emerald-400">
                  {taskStats.total}
                </span>
              )}
              
              {/* 活动指示器 */}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-slate-800/60 rounded-lg -z-10"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          ))}
        </div>
        
        {/* 快速统计 */}
        <div className="flex items-center space-x-4 text-xs text-slate-400">
          {activeTab === 'knowledge_base' && (
            <>
              <span>已完成: {docStats.completed}</span>
              <span>处理中: {docStats.processing}</span>
            </>
          )}
          {activeTab === 'task_board' && (
            <>
              <span>待办: {taskStats.todo}</span>
              <span>进行中: {taskStats.inProgress}</span>
              <span>已完成: {taskStats.done}</span>
            </>
          )}
        </div>
      </div>
      
      {/* Tab内容 */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === 'knowledge_base' ? (
            <motion.div
              key="knowledge_base"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
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
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <TaskBoard
                tasks={tasks}
                onToggle={onTaskToggle}
                onAdd={onTaskAdd}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}