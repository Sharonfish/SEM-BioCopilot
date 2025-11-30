/**
 * Editor Selection Store - 管理编辑器选中内容
 */

import { create } from 'zustand'

interface EditorSelection {
  text: string | null
  startLine: number | null
  endLine: number | null
}

interface EditorSelectionStore {
  selection: EditorSelection
  setSelection: (selection: EditorSelection) => void
  clearSelection: () => void
  hasSelection: () => boolean
}

export const useEditorSelectionStore = create<EditorSelectionStore>((set, get) => ({
  selection: {
    text: null,
    startLine: null,
    endLine: null,
  },

  setSelection: (selection) => {
    set({ selection })
  },

  clearSelection: () => {
    set({
      selection: {
        text: null,
        startLine: null,
        endLine: null,
      },
    })
  },

  hasSelection: () => {
    const selection = get().selection
    return selection.text !== null && selection.text.trim().length > 0
  },
}))

