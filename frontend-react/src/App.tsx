import { useCallback, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useDigitalEmployee } from './hooks/useDigitalEmployee'
import { Layout } from './components/Layout'
import { DigitalEmployeeView } from './components/DigitalEmployeeView'
import { KnowledgeHubView } from './components/KnowledgeHubView'
import { Sidebar } from './components/Sidebar'
import { StatusBar } from './components/StatusBar'
import type { EmployeeStatus, ViewRoute } from './types'

/**
 * 页面切换动画配置 — 横向滑入 + 微模糊
 * 
 * 根据切换方向决定 slide 方向：
 * - console → knowledge-hub：knowledge-hub 从右侧滑入
 * - knowledge-hub → console：console 从左侧滑入
 */
const slideFromRight = {
  initial: { opacity: 0, x: 60, filter: 'blur(4px)' },
  animate: { opacity: 1, x: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, x: -40, filter: 'blur(4px)' },
}

const slideFromLeft = {
  initial: { opacity: 0, x: -60, filter: 'blur(4px)' },
  animate: { opacity: 1, x: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, x: 40, filter: 'blur(4px)' },
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
  const prevView = useRef<ViewRoute>('console')

  /**
   * 处理视图切换并记录方向
   */
  const handleViewChange = useCallback((view: ViewRoute) => {
    prevView.current = currentView
    setCurrentView(view)
  }, [currentView])

  /**
   * 根据切换方向选择动画
   */
  const isForward = currentView === 'console'
    ? prevView.current === 'knowledge-hub'
    : prevView.current === 'console'

  const pageVariants = isForward
    ? (currentView === 'console' ? slideFromLeft : slideFromRight)
    : (currentView === 'console' ? slideFromRight : slideFromLeft)

  const handleFileDrop = useCallback(
    (files: FileList) => {
      Array.from(files).forEach((file) => {
        void addDocument(file)
      })
    },
    [addDocument]
  )

  return (
    <Layout>
      <div className="grid h-full grid-cols-[auto_minmax(0,1fr)] gap-6">
        {/* 侧边栏 — 独立悬浮岛屿 */}
        <Sidebar
          currentView={currentView}
          onViewChange={handleViewChange}
          status={status}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
        />

        {/* 主内容区 */}
        <section className="min-w-0 flex flex-col gap-5 overflow-hidden">
          {/* 状态栏 — 悬浮岛屿 */}
          <div className="island flex-shrink-0 px-5 py-3">
            <StatusBar
              status={status}
              currentAction={getCurrentAction(status)}
              systemStatus={systemStatus}
            />
          </div>

          {/* 内容视窗 — 悬浮岛屿 + 页面切换 */}
          <div className="island relative min-h-0 flex-1 overflow-hidden">
            <AnimatePresence mode="wait" initial={false}>
              {currentView === 'console' ? (
                <motion.div
                  key="console"
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
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
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full overflow-auto"
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
    </Layout>
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
