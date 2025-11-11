/**
 * Pipeline 状态管理
 */

import { create } from 'zustand'
import { PipelineStep, PipelineConfig, DataShape } from '@/types/pipeline'

interface PipelineStore {
  config: PipelineConfig | null
  currentDataShape: DataShape | null
  
  // Actions
  setPipeline: (config: PipelineConfig) => void
  updateStepStatus: (stepId: string, status: PipelineStep['status']) => void
  setCurrentStep: (stepIndex: number) => void
  updateDataShape: (shape: DataShape) => void
  updateProgress: (progress: number) => void
  setStepError: (stepId: string, error: string) => void
  updateStepOutput: (stepId: string, output: DataShape) => void
}

export const usePipelineStore = create<PipelineStore>((set, get) => ({
  config: null,
  currentDataShape: null,

  setPipeline: (config) => {
    set({ config })
  },

  updateStepStatus: (stepId, status) => {
    const config = get().config
    if (!config) return

    set({
      config: {
        ...config,
        steps: config.steps.map(step =>
          step.id === stepId
            ? { ...step, status, startTime: status === 'running' ? new Date() : step.startTime, endTime: status === 'completed' || status === 'error' ? new Date() : step.endTime }
            : step
        ),
      },
    })
  },

  setCurrentStep: (stepIndex) => {
    const config = get().config
    if (!config) return

    set({
      config: {
        ...config,
        currentStepIndex: stepIndex,
      },
    })
  },

  updateDataShape: (shape) => {
    set({ currentDataShape: shape })
  },

  updateProgress: (progress) => {
    const config = get().config
    if (!config) return

    set({
      config: {
        ...config,
        progress,
      },
    })
  },

  setStepError: (stepId, error) => {
    const config = get().config
    if (!config) return

    set({
      config: {
        ...config,
        steps: config.steps.map(step =>
          step.id === stepId
            ? { ...step, status: 'error', error, endTime: new Date() }
            : step
        ),
      },
    })
  },

  updateStepOutput: (stepId, output) => {
    const config = get().config
    if (!config) return

    set({
      config: {
        ...config,
        steps: config.steps.map(step =>
          step.id === stepId
            ? { ...step, output }
            : step
        ),
      },
    })
  },
}))

