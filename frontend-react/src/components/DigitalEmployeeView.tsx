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
      <div className="grid h-full grid-cols-[minmax(0,1fr)_auto] gap-12 p-8 lg:p-12">
        <section className="relative min-w-0 overflow-hidden">
          <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-[min(56rem,80vw)] -translate-x-1/2 rounded-full bg-indigo-400/10 blur-3xl" />

          <div className="relative flex h-full flex-col">
            <div className="min-h-0 flex-1 pb-40">
              <ChatStream
                messages={messages}
                isStreaming={isStreaming}
                onCitationClick={handleCitationClick}
              />
            </div>

            <div className="absolute inset-x-0 bottom-0 px-6 pb-2">
              <div className="mx-auto max-w-4xl">
                <InputNexus
                  onSendMessage={onSendMessage}
                  onFileDrop={onFileDrop}
                  disabled={isStreaming}
                />
                <div className="mt-4 flex justify-center gap-4 text-xs text-slate-600">
                  <span>{systemStatus.documentCount} documents</span>
                  <span>{status}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <AnimatePresence>
          {showArtifacts && (
            <motion.aside
              initial={{ width: 0, opacity: 0, scale: 0.96, filter: 'blur(12px)' }}
              animate={{ width: 420, opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ width: 0, opacity: 0, scale: 0.96, filter: 'blur(12px)' }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="h-full overflow-hidden rounded-3xl border-t border-l border-white/10 border-r border-b border-black/20 bg-slate-950/55 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl"
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

      <button
        type="button"
        onClick={() => setShowArtifacts((value) => !value)}
        className="absolute right-8 bottom-8 z-30 grid h-12 w-12 place-items-center rounded-full border-t border-l border-white/10 border-r border-b border-black/20 bg-slate-950/70 text-slate-300 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl transition hover:bg-white/[0.08] hover:text-white"
        aria-label={showArtifacts ? '隐藏面板' : '显示面板'}
      >
        {showArtifacts ? <PanelRightClose className="h-5 w-5" /> : <PanelRightOpen className="h-5 w-5" />}
      </button>
    </div>
  )
}
