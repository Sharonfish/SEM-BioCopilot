/**
 * AI Copilot 状态管理
 */

import { create } from 'zustand'
import { Suggestion, ExecutionContext, ExecutionError } from '@/types/copilot'

interface CopilotStore {
  isEnabled: boolean
  suggestions: Suggestion[]
  context: ExecutionContext
  loading: boolean
  
  // Actions
  toggleCopilot: () => void
  addSuggestion: (suggestion: Suggestion) => void
  removeSuggestion: (suggestionId: string) => void
  clearSuggestions: () => void
  updateContext: (context: Partial<ExecutionContext>) => void
  addError: (error: ExecutionError) => void
  clearErrors: () => void
  setLoading: (loading: boolean) => void
}

export const useCopilotStore = create<CopilotStore>((set, get) => ({
  isEnabled: true,
  suggestions: [],
  context: {
    currentStep: '',
    currentFile: '',
    variables: {},
    errors: [],
    history: [],
  },
  loading: false,

  toggleCopilot: () => {
    set({ isEnabled: !get().isEnabled })
  },

  addSuggestion: (suggestion) => {
    const suggestions = get().suggestions
    // 避免重复添加相同的建议
    if (suggestions.find(s => s.id === suggestion.id)) return
    
    set({
      suggestions: [...suggestions, suggestion].sort((a, b) => b.priority - a.priority),
    })
  },

  removeSuggestion: (suggestionId) => {
    set({
      suggestions: get().suggestions.filter(s => s.id !== suggestionId),
    })
  },

  clearSuggestions: () => {
    set({ suggestions: [] })
  },

  updateContext: (contextUpdate) => {
    set({
      context: {
        ...get().context,
        ...contextUpdate,
      },
    })
  },

  addError: (error) => {
    const context = get().context
    set({
      context: {
        ...context,
        errors: [...context.errors, error],
      },
    })
  },

  clearErrors: () => {
    const context = get().context
    set({
      context: {
        ...context,
        errors: [],
      },
    })
  },

  setLoading: (loading) => {
    set({ loading })
  },
}))

