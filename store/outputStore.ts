/**
 * Output Store - 管理执行输出和日志
 */

import { create } from 'zustand'

export interface OutputLog {
  id: string
  timestamp: Date
  type: 'stdout' | 'stderr' | 'error' | 'info'
  content: string
  stepId?: string
  stepName?: string
}

interface OutputStore {
  logs: OutputLog[]
  isExpanded: boolean
  height: number // in pixels
  autoScroll: boolean

  // Actions
  addLog: (log: Omit<OutputLog, 'id' | 'timestamp'>) => void
  clearLogs: () => void
  setExpanded: (expanded: boolean) => void
  setHeight: (height: number) => void
  toggleExpanded: () => void
  setAutoScroll: (autoScroll: boolean) => void
}

const DEFAULT_HEIGHT = 200

export const useOutputStore = create<OutputStore>((set, get) => ({
  logs: [],
  isExpanded: false,
  height: DEFAULT_HEIGHT,
  autoScroll: true,

  addLog: (log) => {
    const newLog: OutputLog = {
      ...log,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    }
    
    set({
      logs: [...get().logs, newLog],
    })
  },

  clearLogs: () => {
    set({ logs: [] })
  },

  setExpanded: (expanded) => {
    set({ isExpanded: expanded })
  },

  setHeight: (height) => {
    set({ height: Math.max(100, Math.min(600, height)) }) // Clamp between 100 and 600px
  },

  toggleExpanded: () => {
    set({ isExpanded: !get().isExpanded })
  },

  setAutoScroll: (autoScroll) => {
    set({ autoScroll })
  },
}))

