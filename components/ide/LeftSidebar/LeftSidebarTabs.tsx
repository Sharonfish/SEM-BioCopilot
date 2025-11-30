/**
 * Left Sidebar Tabs - 左侧边栏标签切换
 */

'use client'

import { useState } from 'react'
import { GitBranch, Database } from 'lucide-react'
import { PipelineSteps } from './PipelineSteps'
import { DatabaseImport } from './DatabaseImport'
import { cn } from '@/lib/utils'

type TabType = 'pipeline' | 'database'

export function LeftSidebarTabs() {
  const [activeTab, setActiveTab] = useState<TabType>('pipeline')

  return (
    <div className="flex flex-col h-full">
      {/* Tabs Header */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <button
          onClick={() => setActiveTab('pipeline')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium transition-colors',
            'hover:bg-gray-100 dark:hover:bg-gray-700',
            activeTab === 'pipeline'
              ? 'bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-600 dark:text-gray-400'
          )}
        >
          <GitBranch className="h-4 w-4" />
          <span>Pipeline</span>
        </button>
        <button
          onClick={() => setActiveTab('database')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium transition-colors',
            'hover:bg-gray-100 dark:hover:bg-gray-700',
            activeTab === 'database'
              ? 'bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-600 dark:text-gray-400'
          )}
        >
          <Database className="h-4 w-4" />
          <span>Database</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'pipeline' ? <PipelineSteps /> : <DatabaseImport />}
      </div>
    </div>
  )
}

