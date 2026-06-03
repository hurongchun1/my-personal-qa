import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useDigitalEmployee } from './hooks/useDigitalEmployee'
import { Sidebar } from './components/Sidebar'
import { CommandConsole } from './components/CommandConsole'
import { KnowledgeBase } from './components/KnowledgeBase'
import { TaskBoard } from './components/TaskBoard'

function App() {
  const {
    // 状态
    status,
    messages,
    documents,
    tasks,
    systemStatus,
    isStreaming,
    
    // 操作
    sendMessage,
    addDocument,
    deleteDocument,
    processDocument,
    toggleTask,
    addTask,
  } = useDigitalEmployee()
  
  const [activeTab, setActiveTab] = useState<'chat' | 'knowledge' | 'tasks'>('chat')
  
  // 处理文件拖拽
  const handleFileDrop = (files: FileList) => {
    Array.from(files).forEach(file => {
      addDocument(file)
    })
  }
  
  // 根据状态获取当前动作描述
  const getCurrentAction = (): string => {
    switch (status) {
      case 'thinking':
        return '正在思考...'
      case 'reading':
        return '正在阅读文档...'
      case 'executing':
        return '正在执行任务...'
      case 'speaking':
        return '正在回复...'
      default:
        return '等待指令'
    }
  }
  
  // 渲染主内容区域
  const renderContent = () => {
    switch (activeTab) {
      case 'chat':
        return (
          <motion.div
            key="chat"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col"
          >
            <CommandConsole
              messages={messages}
              isStreaming={isStreaming}
              onSendMessage={sendMessage}
              onFileDrop={handleFileDrop}
            />
          </motion.div>
        )
      case 'knowledge':
        return (
          <motion.div
            key="knowledge"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col"
          >
            <KnowledgeBase
              documents={documents}
              onUpload={addDocument}
              onDelete={deleteDocument}
              onProcess={processDocument}
            />
          </motion.div>
        )
      case 'tasks':
        return (
          <motion.div
            key="tasks"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col"
          >
            <TaskBoard
              tasks={tasks}
              onToggle={toggleTask}
              onAdd={addTask}
            />
          </motion.div>
        )
      default:
        return (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-4">🔄</div>
              <div className="text-slate-400">加载中...</div>
            </div>
          </div>
        )
    }
  }
  
  return (
    <div className="h-screen flex overflow-hidden relative z-10">
      {/* 左侧边栏 */}
      <Sidebar
        status={status}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      
      {/* 主内容区域 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 顶部状态栏 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="h-14 px-6 flex items-center justify-between bg-slate-900/80 border-b border-slate-700/50 backdrop-blur-sm"
        >
          <div className="flex items-center space-x-4">
            <h1 className="text-lg font-semibold text-white">数字员工助手</h1>
            <span className="text-sm text-slate-400">{getCurrentAction()}</span>
          </div>
          
          <div className="flex items-center space-x-4 text-xs text-slate-500">
            <span>文档: {systemStatus.documentCount}</span>
            <span>•</span>
            <span>任务: {tasks.length}</span>
            <span>•</span>
            <span>消息: {messages.length}</span>
          </div>
        </motion.div>
        
        {/* 内容区域 */}
        <div className="flex-1 flex overflow-hidden">
          {/* 主面板 */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {renderContent()}
          </div>
          
          {/* 右侧面板 - 仅在聊天模式下显示 */}
          {activeTab === 'chat' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="w-80 flex flex-col bg-slate-900/50 border-l border-slate-700/50"
            >
              <div className="p-4 border-b border-slate-700/50">
                <h3 className="text-sm font-medium text-slate-200">知识库概览</h3>
                <p className="text-xs text-slate-500 mt-1">快速查看文档和状态</p>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {documents.slice(0, 5).map((doc, index) => (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-slate-800/40 rounded-xl p-3 hover:bg-slate-800/60 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-xl">
                        {doc.fileType === 'pdf' ? '📄' : 
                         doc.fileType === 'md' ? '📝' : 
                         doc.fileType === 'html' ? '🌐' : '📃'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-slate-200 truncate">
                          {doc.filename}
                        </h4>
                        <div className="flex items-center space-x-2 mt-1 text-xs text-slate-500">
                          <span>{doc.status === 'completed' ? '✅' : '⏳'}</span>
                          <span>{doc.fileType.toUpperCase()}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                {documents.length === 0 && (
                  <div className="text-center py-8">
                    <div className="text-2xl mb-2">📚</div>
                    <div className="text-sm text-slate-400">暂无文档</div>
                    <div className="text-xs text-slate-500 mt-1">上传文档开始构建知识库</div>
                  </div>
                )}
              </div>
              
              {/* 底部统计 */}
              <div className="p-4 border-t border-slate-700/50">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>总文档: {documents.length}</span>
                  <span>运行时间: {Math.floor(systemStatus.uptime / 3600)}h</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
        
        {/* 底部状态栏 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="h-8 px-4 flex items-center justify-between text-xs text-slate-500 border-t border-slate-700/50 bg-slate-900/80 backdrop-blur-sm"
        >
          <div className="flex items-center space-x-4">
            <span>数字员工系统 v1.0.0</span>
            <span>•</span>
            <span>内存: {Math.round(systemStatus.memoryUsage)} MB</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <span>{new Date().toLocaleTimeString('zh-CN', { 
              hour: '2-digit', 
              minute: '2-digit',
              second: '2-digit'
            })}</span>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default App