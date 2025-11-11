/**
 * AI Copilot 相关类型定义
 */

export type SuggestionType = 'code' | 'fix' | 'optimization' | 'next_step'

export interface Suggestion {
  id: string
  type: SuggestionType
  title: string
  description: string
  code?: string
  priority: number
  contextRelevance: number
  createdAt: Date
}

export interface ExecutionContext {
  currentStep: string
  currentFile: string
  dataShape?: {
    rows: number
    cols: number
  }
  variables: Record<string, any>
  errors: ExecutionError[]
  history: ExecutionHistory[]
}

export interface ExecutionError {
  type: 'syntax' | 'runtime' | 'logic'
  message: string
  line?: number
  column?: number
  file?: string
}

export interface ExecutionHistory {
  id: string
  stepId: string
  code: string
  result: any
  timestamp: Date
}

export interface CopilotState {
  isEnabled: boolean
  suggestions: Suggestion[]
  context: ExecutionContext
  loading: boolean
}

