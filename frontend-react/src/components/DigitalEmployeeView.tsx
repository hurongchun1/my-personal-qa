import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { PanelRightClose, PanelRightOpen } from 'lucide-react'
import { ArtifactsContainer } from './ArtifactsContainer'
import { ChatStream } from './ChatStream'
import { InputNexus } from './InputNexus'
import type {
  ArtifactType,
  Citation,
  Document,
  EmployeeStatus,
  Message,
  SystemStatus,
  Task,
} from '../types'

interface DigitalEmployeeViewProps {
  messages: Message[]
  documents: Document[]
  tasks: Task[]
  systemStatus: SystemStatus
  isStreaming: boolean
  status: EmployeeStatus
  onSendMessage: (content: string) => Promise<void>
  onFileDrop?: (files: FileList) => void
  onArtifactChange?: (artifact: ArtifactType) => void
  onDocumentUpload?: (file: File) => void
  onDocumentDelete?: (id: string) => void
  onDocumentProcess?: (id: string) => void
  onTaskToggle?: (id: string) => void
  onTaskAdd?: (title: string, description?: string, priority?: Task['priority']) => void
}

/**
 * DigitalEmployeeView — 控制台视窗
 * 悬浮岛屿架构：聊天区 + 输入区 + 可选的右侧面板
 */
export function DigitalEmployeeView({
  messages,
  documents,
  tasks,
  systemStatus,
  isStreaming,
  status,
  onSendMessage,
  onFileDrop,
  onArtifactChange,
  onDocumentUpload,
  onDocumentDelete,
  onDocumentProcess,
  onTaskToggle,
  onTaskAdd,
}: DigitalEmployeeViewProps) {
  const [activeArtifact, setActiveArtifact] = useState<ArtifactType>('empty')
  const [showArtifacts, setShowArtifacts] = useState(false)

  const handleCitationClick = (citation: Citation) => {
    console.info('Citation clicked:', citation)
  }

  return (
    <div className="relative h-full overflow-hidden">
      <div className="grid h-full grid-cols-[minmax(0,1fr)_auto] gap-6 p-4 md:p-6">
        {/* 聊天区 — 悬浮岛屿 */}
        <section className="relative min-w-0 overflow-hidden rounded-3xl bg-white/[0.02] backdrop-blur-2xl border border-white/[0.05]">
          {/* 顶部环境光 */}
          <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-[min(52rem,75vw)] -translate-x-1/2 rounded-full bg-indigo-400/[0.06] blur-3xl" />

          <div className="relative flex h-full flex-col">
            {/* 对话流 */}
            <div className="min-h-0 flex-1 pb-36">
              <ChatStream
                messages={messages}
                isStreaming={isStreaming}
                onCitationClick={handleCitationClick}
              />
            </div>

            {/* 输入区 — 固定在底部 */}
            <div className="absolute inset-x-0 bottom-0 px-4 pb-3">
              <div className="mx-auto max-w-4xl">
                <InputNexus
                  onSendMessage={onSendMessage}
                  onFileDrop={onFileDrop}
                  disabled={isStreaming}
                />
                <div className="mt-3 flex justify-center gap-4 text-[11px] text-slate-600">
                  <span>{systemStatus.documentCount} 文档</span>
                  <span>·</span>
                  <span className="capitalize">{status}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 右侧 Artifacts 面板 — 悬浮岛屿 */}
        <AnimatePresence>
          {showArtifacts && (
            <motion.aside
              initial={{ width: 0, opacity: 0, x: 20 }}
              animate={{ width: 400, opacity: 1, x: 0 }}
              exit={{ width: 0, opacity: 0, x: 20 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="island h-full overflow-hidden"
            >
              <ArtifactsContainer
                activeArtifact={activeArtifact}
                documents={documents}
                tasks={tasks}
                onArtifactChange={(artifact) => {
                  setActiveArtifact(artifact)
                  onArtifactChange?.(artifact)
                }}
                onDocumentUpload={onDocumentUpload}
                onDocumentDelete={onDocumentDelete}
                onDocumentProcess={onDocumentProcess}
                onTaskToggle={onTaskToggle}
                onTaskAdd={onTaskAdd}
              />
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* 面板切换按钮 */}
      <button
        type="button"
        onClick={() => setShowArtifacts((v) => !v)}
        className="absolute right-6 bottom-6 z-30 grid h-11 w-11 place-items-center rounded-2xl bg-white/[0.04] border border-white/[0.06] text-slate-400 backdrop-blur-2xl transition-all duration-200 hover:bg-white/[0.1] hover:text-white hover:border-white/[0.12]"
        aria-label={showArtifacts ? '隐藏面板' : '显示面板'}
      >
        {showArtifacts ? (
          <PanelRightClose className="h-5 w-5" />
        ) : (
          <PanelRightOpen className="h-5 w-5" />
        )}
      </button>
    </div>
  )
}
