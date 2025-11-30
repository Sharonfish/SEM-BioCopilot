/**
 * 编辑器状态管理
 */

import { create } from 'zustand'
import { FileTab } from '@/types/editor'

interface EditorStore {
  tabs: FileTab[]
  activeTabId: string | null
  
  // Actions
  openFile: (file: Omit<FileTab, 'id' | 'isDirty' | 'isActive'>) => void
  closeTab: (tabId: string) => void
  switchTab: (tabId: string) => void
  updateTabContent: (tabId: string, content: string) => void
  insertCodeAtCursor: (code: string) => void
  appendCode: (code: string) => void
  saveTab: (tabId: string) => void
  markDirty: (tabId: string, isDirty: boolean) => void
}

export const useEditorStore = create<EditorStore>((set, get) => ({
  tabs: [],
  activeTabId: null,

  openFile: (file) => {
    const tabs = get().tabs
    
    // 检查文件是否已经打开
    const existingTab = tabs.find(tab => tab.path === file.path)
    if (existingTab) {
      set({ activeTabId: existingTab.id })
      return
    }

    // 创建新标签
    const newTab: FileTab = {
      ...file,
      id: `tab-${Date.now()}`,
      isDirty: false,
      isActive: true,
    }

    set({
      tabs: [...tabs.map(t => ({ ...t, isActive: false })), newTab],
      activeTabId: newTab.id,
    })
  },

  closeTab: (tabId) => {
    const tabs = get().tabs.filter(tab => tab.id !== tabId)
    const activeTabId = get().activeTabId

    if (activeTabId === tabId) {
      // 如果关闭的是当前标签，切换到最后一个标签
      const newActiveTab = tabs[tabs.length - 1]
      set({
        tabs,
        activeTabId: newActiveTab?.id || null,
      })
    } else {
      set({ tabs })
    }
  },

  switchTab: (tabId) => {
    set({
      tabs: get().tabs.map(tab => ({
        ...tab,
        isActive: tab.id === tabId,
      })),
      activeTabId: tabId,
    })
  },

  updateTabContent: (tabId, content) => {
    set({
      tabs: get().tabs.map(tab =>
        tab.id === tabId
          ? { ...tab, content, isDirty: true }
          : tab
      ),
    })
  },

  insertCodeAtCursor: (code) => {
    // This will be handled by the CodeEditor component
    // We'll use a custom event to trigger insertion
    window.dispatchEvent(new CustomEvent('editor:insertCode', { detail: { code } }))
  },

  appendCode: (code) => {
    const activeTabId = get().activeTabId
    if (!activeTabId) return

    const tabs = get().tabs
    const activeTab = tabs.find(tab => tab.id === activeTabId)
    if (!activeTab) return

    const newContent = activeTab.content + '\n\n' + code
    set({
      tabs: tabs.map(tab =>
        tab.id === activeTabId
          ? { ...tab, content: newContent, isDirty: true }
          : tab
      ),
    })
  },

  saveTab: (tabId) => {
    set({
      tabs: get().tabs.map(tab =>
        tab.id === tabId ? { ...tab, isDirty: false } : tab
      ),
    })
  },

  markDirty: (tabId, isDirty) => {
    set({
      tabs: get().tabs.map(tab =>
        tab.id === tabId ? { ...tab, isDirty } : tab
      ),
    })
  },
}))

