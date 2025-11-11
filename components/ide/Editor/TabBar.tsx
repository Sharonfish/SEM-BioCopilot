/**
 * 文件标签栏
 */

'use client'

import { X } from 'lucide-react'
import { useEditorStore } from '@/store/editorStore'
import { cn } from '@/lib/utils'

export function TabBar() {
  const { tabs, activeTabId, switchTab, closeTab } = useEditorStore()

  if (tabs.length === 0) {
    return null
  }

  return (
    <div className="h-10 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center overflow-x-auto">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={cn(
            'flex items-center gap-2 px-4 h-full border-r border-gray-200 dark:border-gray-700 cursor-pointer transition-colors',
            'hover:bg-gray-200 dark:hover:bg-gray-700',
            tab.isActive
              ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100'
              : 'text-gray-600 dark:text-gray-400'
          )}
          onClick={() => switchTab(tab.id)}
        >
          <span className="text-sm whitespace-nowrap">
            {tab.isDirty && <span className="mr-1">•</span>}
            {tab.name}
          </span>
          <button
            className="p-0.5 hover:bg-gray-300 dark:hover:bg-gray-600 rounded"
            onClick={(e) => {
              e.stopPropagation()
              closeTab(tab.id)
            }}
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}
    </div>
  )
}

