import { useCallback, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useDigitalEmployee } from './hooks/useDigitalEmployee'
import { DigitalEmployeeView } from './components/DigitalEmployeeView'
import { KnowledgeHubView } from './components/KnowledgeHubView'
import { Sidebar } from './components/Sidebar'
import { StatusBar } from './components/StatusBar'
import type { EmployeeStatus, ViewRoute } from './types'

const pageVariants = {
  initial: { opacity: 0, scale: 0.985, filter: 'blur(14px)' },
  animate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
  exit: { opacity: 0, scale: 1.015, filter: 'blur(14px)' },
}

function App() {
  const {
    status,
    messages,
    documents,
    tasks,
    systemStatus,
    isStreaming,
    sendMessage,
    addDocument,
    deleteDocument,
    processDocument,
    toggleTask,
    addTask,
    setActiveArtifact,
  } = useDigitalEmployee()

  const [currentView, setCurrentView] = useState<ViewRoute>('console')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const handleFileDrop = useCallback((files: FileList) => {
    Array.from(files).forEach((file) => {
      void addDocument(file)
    })
  }, [addDocument])

  return (
    <main className="relative h-screen overflow-hidden bg-[#0f172a] text-slate-100">
      <div className="ambient-mesh" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.08),transparent_36%),linear-gradient(120deg,rgba(255,255,255,0.05),transparent_28%,rgba(0,0,0,0.25))] pointer-events-none" />

      <div className="relative z-10 h-full p-8 md:p-10 xl:p-12">
        <div className="grid h-full grid-cols-[auto_minmax(0,1fr)] gap-12">
          <Sidebar
            currentView={currentView}
            onViewChange={setCurrentView}
            status={status}
            isCollapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed((value) => !value)}
          />

          <section className="min-w-0 flex flex-col gap-12 overflow-hidden">
            <StatusBar
              status={status}
              currentAction={getCurrentAction(status)}
              systemStatus={systemStatus}
            />

            <div className="relative min-h-0 flex-1 overflow-hidden rounded-3xl border-t border-l border-white/10 border-r border-b border-black/20 bg-slate-950/35 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
              <AnimatePresence mode="wait">
                {currentView === 'console' ? (
                  <motion.div
                    key="console"
                    variants={pageVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full"
                  >
                    <DigitalEmployeeView
                      messages={messages}
                      documents={documents}
                      tasks={tasks}
                      systemStatus={systemStatus}
                      isStreaming={isStreaming}
                      status={status}
                      onSendMessage={sendMessage}
                      onFileDrop={handleFileDrop}
                      onArtifactChange={setActiveArtifact}
                      onDocumentUpload={addDocument}
                      onDocumentDelete={deleteDocument}
                      onDocumentProcess={processDocument}
                      onTaskToggle={toggleTask}
                      onTaskAdd={addTask}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="knowledge-hub"
                    variants={pageVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full"
                  >
                    <KnowledgeHubView
                      documents={documents}
                      systemStatus={systemStatus}
                      onDocumentUpload={addDocument}
                      onDocumentDelete={deleteDocument}
                      onDocumentProcess={processDocument}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}

function getCurrentAction(status: EmployeeStatus): string {
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

export default App
