import { useState } from 'react'
import { AppLayout } from './components/AppLayout'
import { AgentChatView } from './components/AgentChatView'
import { KnowledgeBaseCenter } from './components/KnowledgeBaseCenter'
import { KnowledgeBaseDetail } from './components/KnowledgeBaseDetail'
import { ErrorBoundary } from './components/ErrorBoundary'
import { ToastProvider } from './components/Toast'
import { ConfirmProvider } from './components/ConfirmDialog'
import type { ViewType, Message, SystemStatusData, KnowledgeBase } from './types'

/**
 * App — 根组件
 *
 * 职责：ViewType 路由 + KB 详情页路由 + 全局状态
 */
function App() {
  const [currentView, setCurrentView] = useState<ViewType>('agents')
  const [messages, setMessages] = useState<Message[]>([])
  const [systemStatus, setSystemStatus] = useState<SystemStatusData | null>(null)

  // KB 状态
  const [selectedKB, setSelectedKB] = useState<KnowledgeBase | null>(null)

  const renderView = () => {
    // ── KB 详情页 ──
    if (selectedKB) {
      return (
        <KnowledgeBaseDetail
          kb={selectedKB}
          onBack={() => setSelectedKB(null)}
        />
      )
    }

    switch (currentView) {
      case 'agents':
        return (
          <AgentChatView
            messages={messages}
            onMessagesChange={setMessages}
            systemStatus={systemStatus}
            onSystemStatusChange={setSystemStatus}
          />
        )
      case 'brain':
        return (
          <KnowledgeBaseCenter
            onEnterKB={setSelectedKB}
          />
        )
      case 'pipelines':
        return (
          <div className="h-full flex items-center justify-center bg-[#020617]">
            <div className="text-center">
              <p className="text-[#94a3b8] text-lg mb-2">Pipelines</p>
              <p className="text-sm text-[#64748b]">工作流编排即将上线</p>
            </div>
          </div>
        )
      case 'settings':
        return (
          <div className="h-full flex items-center justify-center bg-[#020617]">
            <div className="text-center">
              <p className="text-[#94a3b8] text-lg mb-2">Settings</p>
              <p className="text-sm text-[#64748b]">设置页面即将上线</p>
            </div>
          </div>
        )
    }
  }

  return (
    <ErrorBoundary>
      <ToastProvider>
        <ConfirmProvider>
          <AppLayout
            currentView={currentView}
            onViewChange={(view) => {
              setSelectedKB(null)
              setCurrentView(view)
            }}
          >
            {renderView()}
          </AppLayout>
        </ConfirmProvider>
      </ToastProvider>
    </ErrorBoundary>
  )
}

export default App
