import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <div className="min-h-dvh flex flex-col items-center justify-center p-6 bg-slate-50">
          <h1 className="text-xl font-semibold text-slate-800 mb-2">한-중 가계부</h1>
          <p className="text-slate-600 mb-4">화면을 불러오는 중 오류가 났어요.</p>
          <p className="text-sm text-red-600 mb-6 max-w-md break-all">
            {this.state.error.message}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="py-2 px-4 rounded-lg bg-primary text-white"
          >
            새로고침
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
