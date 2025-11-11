/**
 * Pipeline 相关类型定义
 */

export type PipelineStatus = 'pending' | 'running' | 'completed' | 'error' | 'cancelled'

export interface DataShape {
  rows: number
  cols: number
  features?: string[]
  samples?: string[]
}

export interface PipelineStep {
  id: string
  name: string
  description?: string
  file: string
  status: PipelineStatus
  dependencies: string[]
  output?: DataShape
  startTime?: Date
  endTime?: Date
  error?: string
}

export interface PipelineConfig {
  id: string
  name: string
  description?: string
  steps: PipelineStep[]
  currentStepIndex: number
  progress: number // 0-100
}

export interface ExecutionResult {
  success: boolean
  output?: any
  error?: string
  dataShape?: DataShape
  executionTime?: number
}

