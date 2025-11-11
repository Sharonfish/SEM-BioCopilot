/**
 * 编辑器相关类型定义
 */

export interface FileTab {
  id: string
  name: string
  path: string
  content: string
  language: string
  isDirty: boolean
  isActive: boolean
}

export interface EditorState {
  tabs: FileTab[]
  activeTabId: string | null
  cursorPosition: { line: number; column: number }
}

export interface EditorAction {
  type: 'open' | 'close' | 'save' | 'switch' | 'update'
  payload?: any
}

