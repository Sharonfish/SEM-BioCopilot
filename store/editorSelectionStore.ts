/**
 * Editor Selection Store - for global access to current selection
 */

import { create } from 'zustand'

interface EditorSelection {
  text: string | null
  startLine: number | null
  endLine: number | null
}

interface EditorSelectionStore extends EditorSelection {
  hasSelection: boolean
  setSelection: (selection: EditorSelection) => void
  clearSelection: () => void
}

export const useEditorSelectionStore = create<EditorSelectionStore>((set, get) => ({
  text: null,
  startLine: null,
  endLine: null,
  hasSelection: false,

  setSelection: (selection) => {
    set({
      ...selection,
      hasSelection: !!(selection.text && selection.text.trim().length > 0),
    })
  },

  clearSelection: () => {
    set({ 
      text: null, 
      startLine: null, 
      endLine: null,
      hasSelection: false,
    })
  },
}))
