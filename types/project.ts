/**
 * 项目相关类型定义
 */

export interface Project {
  id: string
  name: string
  description?: string
  type: 'genomics' | 'transcriptomics' | 'proteomics' | 'general'
  createdAt: Date
  updatedAt: Date
  owner: string
}

export interface FileNode {
  id: string
  name: string
  path: string
  type: 'file' | 'directory'
  children?: FileNode[]
  size?: number
  modifiedAt?: Date
}

export interface ProjectState {
  current: Project | null
  files: FileNode[]
  loading: boolean
}

