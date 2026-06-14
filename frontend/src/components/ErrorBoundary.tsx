import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, RotateCcw } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

/**
 * ErrorBoundary — 捕获子组件树中的渲染错误，防止白屏崩溃
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-8">
          <div className="max-w-md w-full bg-[#0f172a] border border-white/10 rounded-2xl p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-[#f87171] mx-auto mb-4" />
            <h2 className="text-xl font-bold text-[#dce1fb] mb-2">页面出现错误</h2>
            <p className="text-sm text-[#94a3b8] mb-6">
              {this.state.error?.message || '渲染过程中发生未知错误'}
            </p>
            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#4f46e5] hover:bg-[#4338ca] text-white text-sm font-medium transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              重试
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
