import React, { useRef, useEffect } from 'react'
import type { Message } from '../types'
import { ChatStream } from './ChatStream'
import { InputNexus } from './InputNexus'

interface CommandConsoleProps {
  messages: Message[]
  isStreaming: boolean
  onSendMessage: (content: string) => Promise<void>
  onFileDrop?: (files: FileList) => void
}

export const CommandConsole: React.FC<CommandConsoleProps> = ({
  messages,
  isStreaming,
  onSendMessage,
  onFileDrop,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  
  // 自动滚动到底部
  useEffect(() => {
    if (containerRef.current) {
      const { scrollHeight, clientHeight } = containerRef.current
      containerRef.current.scrollTo({
        top: scrollHeight - clientHeight,
        behavior: 'smooth',
      })
    }
  }, [messages])
  
  return (
    <div className="flex flex-col h-full">
      {/* 对话流区域 */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto p-6 space-y-6"
      >
        <ChatStream 
          messages={messages} 
          isStreaming={isStreaming} 
        />
      </div>
      
      {/* 输入区域 */}
      <div className="p-6 border-t border-slate-700/30">
        <InputNexus
          onSendMessage={onSendMessage}
          onFileDrop={onFileDrop}
          disabled={isStreaming}
        />
      </div>
    </div>
  )
}
