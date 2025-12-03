/**
 * Copilot Panel - with Q&A and Code Generation modes
 */

'use client'

import { MessageSquare, Code2, Bot } from 'lucide-react'
import { useCopilotModeStore } from '@/store/copilotModeStore'
import { Button } from '@/components/ui/Button'
import { QAMode } from './QAMode'
import { CodeGenMode } from './CodeGenMode'
import { cn } from '@/lib/utils'

export function CopilotPanel() {
  const { mode, setMode } = useCopilotModeStore()

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        {/* Title */}
        <div className="h-14 flex items-center px-4">
          <Bot className="h-5 w-5 text-blue-600 mr-2" />
          <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">
            AI Copilot
          </span>
        </div>

        {/* Mode Tabs */}
        <div className="flex border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setMode('qa')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors',
              'border-b-2',
              mode === 'qa'
                ? 'border-blue-600 text-blue-600 bg-blue-50 dark:bg-blue-900/20'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800'
            )}
          >
            <MessageSquare className="h-4 w-4" />
            Ask Questions
          </button>
          <button
            onClick={() => setMode('codegen')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors',
              'border-b-2',
              mode === 'codegen'
                ? 'border-blue-600 text-blue-600 bg-blue-50 dark:bg-blue-900/20'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800'
            )}
          >
            <Code2 className="h-4 w-4" />
            Generate Code
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {mode === 'qa' ? <QAMode /> : <CodeGenMode />}
      </div>
    </div>
  )
}

