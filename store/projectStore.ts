/**
 * 项目状态管理
 */

import { create } from 'zustand'
import { Project, FileNode } from '@/types/project'

interface ProjectStore {
  current: Project | null
  files: FileNode[]
  loading: boolean
  
  // Actions
  setProject: (project: Project) => void
  setFiles: (files: FileNode[]) => void
  addFile: (file: FileNode, parentPath?: string) => void
  removeFile: (path: string) => void
  setLoading: (loading: boolean) => void
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  current: null,
  files: [],
  loading: false,

  setProject: (project) => {
    set({ current: project })
  },

  setFiles: (files) => {
    set({ files })
  },

  addFile: (file, parentPath) => {
    const files = get().files
    
    if (!parentPath) {
      // 添加到根目录
      set({ files: [...files, file] })
      return
    }

    // 递归查找父目录并添加文件
    const addToParent = (nodes: FileNode[]): FileNode[] => {
      return nodes.map(node => {
        if (node.path === parentPath && node.type === 'directory') {
          return {
            ...node,
            children: [...(node.children || []), file],
          }
        }
        if (node.children) {
          return {
            ...node,
            children: addToParent(node.children),
          }
        }
        return node
      })
    }

    set({ files: addToParent(files) })
  },

  removeFile: (path) => {
    const files = get().files
    
    const removeFromTree = (nodes: FileNode[]): FileNode[] => {
      return nodes.filter(node => {
        if (node.path === path) return false
        if (node.children) {
          node.children = removeFromTree(node.children)
        }
        return true
      })
    }

    set({ files: removeFromTree(files) })
  },

  setLoading: (loading) => {
    set({ loading })
  },
}))

