/**
 * Copilot Mode Types
 */

export type CopilotMode = 'qa' | 'codegen'

export interface QAMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface CodeChange {
  id: string
  originalCode: string
  generatedCode: string
  prompt: string
  fileName: string
  language: string
  startLine?: number
  endLine?: number
  status: 'pending' | 'accepted' | 'rejected'
  timestamp: Date
}

export interface CopilotModeState {
  mode: CopilotMode
  qaHistory: QAMessage[]
  codeChanges: CodeChange[]
  currentChange: CodeChange | null
  loading: boolean
}

