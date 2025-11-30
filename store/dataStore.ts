/**
 * Data Store - 管理上传的数据文件
 */

import { create } from 'zustand'

export type ColumnType = 'string' | 'number' | 'boolean' | 'date' | 'mixed'

export interface ColumnInfo {
  name: string
  type: ColumnType
  sampleValues: any[]
  nullCount: number
  uniqueCount: number
}

export interface ParsedData {
  id: string
  fileName: string
  fileType: 'csv' | 'tsv' | 'excel' | 'json'
  filePath?: string // Server-side file path for code generation
  columns: ColumnInfo[]
  rows: any[][]
  totalRows: number
  previewRows: any[][] // First 10 rows
  uploadedAt: Date
  fileSize: number
}

interface DataStore {
  uploadedFiles: ParsedData[]
  currentFile: ParsedData | null
  loading: boolean
  error: string | null

  // Actions
  addFile: (data: ParsedData) => void
  removeFile: (id: string) => void
  setCurrentFile: (id: string | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
  clearAll: () => void
}

export const useDataStore = create<DataStore>((set, get) => ({
  uploadedFiles: [],
  currentFile: null,
  loading: false,
  error: null,

  addFile: (data) => {
    const files = get().uploadedFiles
    set({
      uploadedFiles: [...files, data],
      currentFile: data,
      error: null,
    })
  },

  removeFile: (id) => {
    const files = get().uploadedFiles
    const currentFile = get().currentFile
    const updatedFiles = files.filter(f => f.id !== id)
    
    set({
      uploadedFiles: updatedFiles,
      currentFile: currentFile?.id === id ? (updatedFiles[0] || null) : currentFile,
    })
  },

  setCurrentFile: (id) => {
    if (!id) {
      set({ currentFile: null })
      return
    }
    
    const file = get().uploadedFiles.find(f => f.id === id)
    if (file) {
      set({ currentFile: file })
    }
  },

  setLoading: (loading) => {
    set({ loading })
  },

  setError: (error) => {
    set({ error })
  },

  clearError: () => {
    set({ error: null })
  },

  clearAll: () => {
    set({
      uploadedFiles: [],
      currentFile: null,
      error: null,
    })
  },
}))

