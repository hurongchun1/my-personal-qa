import { useState, useRef, useEffect, useCallback } from 'react'
import {
  Wrench, HelpCircle, Send,
  Globe, Zap, Clock, FileText, Loader2, AlertTriangle,
  Search,
} from 'lucide-react'
import { sendMessage, sendRewrittenMessage, sendWebSearchMessage, getSystemStatus } from '../services/api'
import type { Message, SystemStatusData, LoadingState } from '../types'

interface AgentChatViewProps {
  messages: Message[]
  onMessagesChange: (messages: Message[]) => void
  systemStatus: SystemStatusData | null
  onSystemStatusChange: (status: SystemStatusData) => void
}

/**
 * AgentChatView — 真实后端对话联调
 */
export function AgentChatView({
  messages,
  onMessagesChange,
  systemStatus,
  onSystemStatusChange,
}: AgentChatViewProps) {
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [statusState, setStatusState] = useState<LoadingState>('idle')
  const [statusError, setStatusError] = useState<string | null>(null)
  const [useWebSearch, setUseWebSearch] = useState(false)

  const chatEndRef = useRef<HTMLDivElement>(null)

  // ── 自动滚到底部 ──
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── 定期拉取系统状态 ──
  const fetchStatus = useCallback(async () => {
    setStatusState('loading')
    try {
      const status = await getSystemStatus()
      onSystemStatusChange(status)
      setStatusError(null)
      setStatusState('success')
    } catch (err) {
      const msg = err instanceof Error ? err.message : '获取系统状态失败'
      console.warn('[Agent] 系统状态获取失败', msg)
      setStatusError(msg)
      setStatusState('error')
    }
  }, [onSystemStatusChange])

  useEffect(() => {
    fetchStatus()
    const timer = setInterval(fetchStatus, 30000) // 每30秒刷新
    return () => clearInterval(timer)
  }, [fetchStatus])

  // ── 发送消息 ──
  const handleSend = useCallback(async () => {
    const trimmed = input.trim()
    if (!trimmed || isStreaming) return
    setInput('')
    setIsStreaming(true)

    // 追加用户消息
    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    }
    onMessagesChange([...messages, userMsg])

    // 调后端 API
    try {
      // 构造对话历史字符串
      const conversationHistory = messages.map(msg => {
        const role = msg.role === 'user' ? '用户' : '助手'
        return `${role}: ${msg.content}`
      }).join('\n')
      
      // 构造上下文信息（目前为空，可扩展）
      const contextInfo = ''
      
      let answer: string
      if (useWebSearch) {
        answer = await sendWebSearchMessage(trimmed, true, 3)
      } else {
        answer = await sendRewrittenMessage(trimmed, conversationHistory, contextInfo, 3)
      }
      
      const aiMsg: Message = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: answer,
        timestamp: new Date(),
      }
      onMessagesChange([...messages, userMsg, aiMsg])
    } catch (err) {
      const msg = err instanceof Error ? err.message : '对话请求失败'
      console.warn('[Agent] 发送消息失败', msg)
      const errMsg: Message = {
        id: `e-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ 抱歉，请求失败：${msg}。请确认后端服务已启动。`,
        timestamp: new Date(),
      }
      onMessagesChange([...messages, userMsg, errMsg])
    } finally {
      setIsStreaming(false)
      // 消息发送后刷新系统状态
      fetchStatus()
    }
  }, [input, isStreaming, messages, onMessagesChange, fetchStatus])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // ── 文件上传（已移至知识库详情页） ──

  // ── 派生数据 ──
  const uptimeHours = systemStatus ? Math.floor(systemStatus.uptime / 3600) : 0
  const uptimeMinutes = systemStatus ? Math.floor((systemStatus.uptime % 3600) / 60) : 0
  const apiRunning = systemStatus?.apiStatus === 'running'

  return (
    <div className="relative h-full flex flex-col overflow-hidden" style={{
      background: 'radial-gradient(circle at center, #1e293b 0%, #0c1324 100%)',
    }}>
      {/* ═══ Header ═══ */}
      <header className="flex-shrink-0 flex items-center justify-between px-8 py-4 border-b border-white/5 bg-[#0c1324]/50 backdrop-blur-md z-40">
        <div className="flex flex-col">
          <h2 className="text-2xl font-bold text-[#dce1fb]">数字员工助手</h2>
          <span className="text-xs text-[#94a3b8] font-medium tracking-wide">
            {isStreaming ? '思考中...' : '等待指令'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* 空闲 / 思考中 */}
          <div className="flex items-center gap-2 bg-[#0f172a]/40 border border-white/5 px-3 py-1.5 rounded-full">
            <span
              className={`w-2 h-2 rounded-full ${
                isStreaming ? 'bg-[#fbbf24] animate-pulse' : 'bg-[#4ade80]'
              }`}
              style={isStreaming ? {} : { boxShadow: '0 0 8px #4ade80' }}
            />
            <span className={`text-xs font-medium ${isStreaming ? 'text-[#fbbf24]' : 'text-[#4ade80]'}`}>
              {isStreaming ? '思考中' : '空闲'}
            </span>
          </div>

          {/* 系统正常 */}
          <div className="flex items-center gap-2 bg-[#0f172a]/40 border border-white/5 px-3 py-1.5 rounded-full">
            {statusState === 'loading' ? (
              <Loader2 className="h-3.5 w-3.5 text-[#94a3b8] animate-spin" />
            ) : statusError ? (
              <AlertTriangle className="h-3.5 w-3.5 text-[#f87171]" />
            ) : (
              <Globe className="h-3.5 w-3.5 text-[#94a3b8]" />
            )}
            <span className={`text-xs ${statusError ? 'text-[#f87171]' : 'text-[#94a3b8]'}`}>
              {statusError ? '状态异常' : apiRunning ? '系统正常' : '系统离线'}
            </span>
          </div>

          {/* 文档数 */}
          <div className="flex items-center gap-2 bg-[#0f172a]/40 border border-white/5 px-3 py-1.5 rounded-full">
            <FileText className="h-3.5 w-3.5 text-[#94a3b8]" />
            <span className="text-xs text-[#94a3b8]">
              {systemStatus?.documentCount ?? '—'} 文档
            </span>
          </div>

          {/* 内存 */}
          <div className="flex items-center gap-2 bg-[#0f172a]/40 border border-white/5 px-3 py-1.5 rounded-full">
            <Zap className="h-3.5 w-3.5 text-[#94a3b8]" />
            <span className="text-xs text-[#94a3b8]">
              {systemStatus ? `${systemStatus.memoryUsage}%` : '—'}
            </span>
          </div>

          {/* 运行时间 */}
          <div className="flex items-center gap-2 bg-[#0f172a]/40 border border-white/5 px-3 py-1.5 rounded-full">
            <Clock className="h-3.5 w-3.5 text-[#94a3b8]" />
            <span className="text-xs text-[#94a3b8]">
              {systemStatus ? `${uptimeHours}h ${uptimeMinutes}m` : '—'}
            </span>
          </div>
        </div>
      </header>

      {/* ═══ 对话流 ═══ */}
      <section className="flex-1 overflow-y-auto px-8 flex flex-col gap-10 pb-32">
        {/* 系统欢迎语 —— 仅无消息时显示 */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center text-center max-w-2xl mx-auto my-12">
            <div
              className="w-16 h-16 rounded-2xl bg-[#4f46e5]/20 flex items-center justify-center mb-6"
              style={{ boxShadow: '0 20px 60px rgba(79,70,229,0.1)' }}
            >
              <span className="text-3xl">🤖</span>
            </div>
            <h3 className="text-2xl font-semibold text-[#dce1fb] mb-2">欢迎回来, 架构师</h3>
            <p className="text-base text-[#94a3b8]/70 leading-relaxed">
              我已准备就绪。您可以让我执行复杂的数据分析、处理已连接的知识库资产，或者为您生成新的数字资产蓝图。
            </p>
            {/* 加载状态提示 */}
            {statusState === 'loading' && (
              <div className="mt-6 flex items-center gap-2 text-sm text-[#94a3b8]">
                <Loader2 className="h-4 w-4 animate-spin text-[#c3c0ff]" />
                正在连接后端服务...
              </div>
            )}
            {statusError && (
              <div className="mt-4 bg-[#7f1d1d]/20 border border-[#ef4444]/30 rounded-lg px-4 py-2 text-xs text-[#fca5a5]">
                {statusError} — 请确认后端已启动 (cd backend && python main.py)
              </div>
            )}
          </div>
        )}

        {/* 消息列表 */}
        {messages.map((msg) => {
          const isAI = msg.role === 'assistant'
          return (
            <div
              key={msg.id}
              className={`flex gap-4 items-start max-w-4xl ${isAI ? '' : 'flex-row-reverse self-end'}`}
              style={{ animation: 'fadeIn 0.5s ease-out forwards' }}
            >
              {/* 头像 */}
              <div
                className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center overflow-hidden ${
                  isAI
                    ? 'border-2 border-[#c3c0ff]/50 bg-[#0f172a]'
                    : 'border border-white/10 bg-[#1e293b]'
                }`}
                style={isAI ? { boxShadow: '0 0 15px rgba(195,192,255,0.3)' } : {}}
              >
                <span className={`text-sm font-bold ${isAI ? 'text-[#c3c0ff]' : 'text-[#cbd5e1]'}`}>
                  {isAI ? 'AI' : 'AC'}
                </span>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className={`flex items-center gap-2 ${isAI ? '' : 'flex-row-reverse'}`}>
                  <span className="text-sm font-medium text-[#dce1fb]">
                    {isAI ? '数字员工' : 'Alex Chen'}
                  </span>
                  <span className="text-[10px] text-[#64748b] font-medium">
                    {msg.timestamp.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div
                  className={`p-5 text-base leading-relaxed max-w-3xl whitespace-pre-wrap ${
                    isAI
                      ? 'bg-[#1e293b]/40 border border-[#334155]/50 rounded-2xl rounded-tl-none'
                      : 'bg-[#4f46e5] text-[#dad7ff] rounded-2xl rounded-tr-none border border-[#c3c0ff]/20'
                  }`}
                  style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}
                >
                  {msg.content}
                </div>

                {isAI && msg.content && !msg.content.startsWith('⚠️') && (
                  <div className="flex gap-1 mt-1">
                    {['👍', '👎', '复制'].map((label) => (
                      <button
                        key={label}
                        className="px-3 py-1 rounded-full border border-white/5 bg-white/5 text-[11px] text-[#94a3b8] hover:bg-white/10 transition-colors"
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {/* 流式输出 typing 指示器 */}
        {isStreaming && (
          <div className="flex gap-4 items-start max-w-4xl" style={{ animation: 'fadeIn 0.5s ease-out forwards' }}>
            <div className="w-10 h-10 rounded-full shrink-0 border-2 border-[#c3c0ff]/30 bg-[#0f172a] flex items-center justify-center">
              <span className="text-sm font-bold text-[#c3c0ff]/40">AI</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-[#dce1fb]">数字员工</span>
              <div className="bg-[#1e293b]/40 border border-[#334155]/50 rounded-2xl rounded-tl-none p-4 flex items-center gap-2">
                <Loader2 className="h-4 w-4 text-[#c3c0ff] animate-spin" />
                <span className="text-sm text-[#94a3b8]">正在思考...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </section>

      {/* ═══ 底部输入栏 ═══ */}
      <div className="absolute bottom-0 left-0 right-0 p-8 flex justify-center pointer-events-none">
        <div className="w-full max-w-4xl pointer-events-auto">
          <div
            className="bg-[#1e293b]/30 backdrop-blur-2xl border border-[#334155]/50 rounded-full px-6 py-4 flex items-center gap-4"
            style={{ boxShadow: '0 25px 50px rgba(0,0,0,0.4)' }}
          >
            <div className="flex items-center gap-3 pr-4 border-r border-white/10 shrink-0">
              {/* 联网搜索开关 */}
              <button
                onClick={() => setUseWebSearch(!useWebSearch)}
                className={`transition-colors ${useWebSearch ? 'text-[#4ade80]' : 'text-[#94a3b8] hover:text-[#c3c0ff]'}`}
                title={useWebSearch ? '联网搜索已开启' : '联网搜索已关闭'}
              >
                <Search className="h-5 w-5" />
              </button>
              <button className="text-[#94a3b8] hover:text-[#c3c0ff] transition-colors" title="工具">
                <Wrench className="h-5 w-5" />
              </button>
              <button className="text-[#94a3b8] hover:text-[#c3c0ff] transition-colors" title="帮助">
                <HelpCircle className="h-5 w-5" />
              </button>
            </div>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={useWebSearch ? '输入问题，将联网搜索...' : '输入问题或指令...'}
              className="flex-1 bg-transparent border-none focus:ring-0 text-[#dce1fb] placeholder-[#64748b] text-base outline-none"
              disabled={isStreaming}
            />

            <button
              onClick={handleSend}
              disabled={!input.trim() || isStreaming}
              className="w-10 h-10 bg-[#c3c0ff]/10 hover:bg-[#c3c0ff]/20 text-[#c3c0ff] rounded-full flex items-center justify-center transition-all group disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {isStreaming ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              )}
            </button>
          </div>

          <p className="text-center mt-3 text-[10px] text-[#64748b]/60 uppercase tracking-widest font-semibold">
            Hermes AI Engine v2.5.0 • {useWebSearch ? 'Web Search Enabled' : 'RAG Backend Connected'}
          </p>
        </div>
      </div>
    </div>
  )
}
