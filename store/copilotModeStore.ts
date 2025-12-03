/**
 * Copilot Mode State Management
 */

import { create } from 'zustand'
import { CopilotMode, QAMessage, CodeChange } from '@/types/copilotMode'
import { DiffHunk } from '@/lib/diff-utils'

interface CopilotModeStore {
  mode: CopilotMode
  qaHistory: QAMessage[]
  codeChanges: CodeChange[]
  currentChange: CodeChange | null
  diffHunks: DiffHunk[]
  showDiffViewer: boolean
  loading: boolean
  
  // Actions
  setMode: (mode: CopilotMode) => void
  addQAMessage: (message: QAMessage) => void
  clearQAHistory: () => void
  addCodeChange: (change: CodeChange) => void
  setCurrentChange: (change: CodeChange | null) => void
  updateCodeChangeStatus: (id: string, status: 'accepted' | 'rejected') => void
  setDiffHunks: (hunks: DiffHunk[]) => void
  updateHunkStatus: (hunkId: string, status: 'accepted' | 'rejected') => void
  setShowDiffViewer: (show: boolean) => void
  setLoading: (loading: boolean) => void
}

export const useCopilotModeStore = create<CopilotModeStore>((set, get) => ({
  mode: 'qa',
  qaHistory: [],
  codeChanges: [],
  currentChange: null,
  diffHunks: [],
  showDiffViewer: false,
  loading: false,

  setMode: (mode) => {
    set({ mode })
  },

  addQAMessage: (message) => {
    set({ qaHistory: [...get().qaHistory, message] })
  },

  clearQAHistory: () => {
    set({ qaHistory: [] })
  },

  addCodeChange: (change) => {
    set({ 
      codeChanges: [...get().codeChanges, change],
      currentChange: change,
    })
  },

  setCurrentChange: (change) => {
    set({ currentChange: change })
  },

  updateCodeChangeStatus: (id, status) => {
    set({
      codeChanges: get().codeChanges.map(change =>
        change.id === id ? { ...change, status } : change
      ),
    })
    
    // If the current change is updated, update it
    const currentChange = get().currentChange
    if (currentChange?.id === id) {
      set({ currentChange: { ...currentChange, status } })
    }
  },

  setDiffHunks: (hunks) => {
    set({ diffHunks: hunks })
  },

  updateHunkStatus: (hunkId, status) => {
    set({
      diffHunks: get().diffHunks.map(hunk =>
        hunk.id === hunkId ? { ...hunk, status } : hunk
      ),
    })
  },

  setShowDiffViewer: (show) => {
    set({ showDiffViewer: show })
  },

  setLoading: (loading) => {
    set({ loading })
  },
}))

