/**
 * AI 建议的下一步操作
 */

'use client'

import { Code2, Lightbulb, Sparkles } from 'lucide-react'
import { useCopilotStore } from '@/store/copilotStore'
import { useEditorStore } from '@/store/editorStore'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'

export function NextSteps() {
  const { suggestions, isEnabled } = useCopilotStore()
  const { activeTabId, updateTabContent, tabs } = useEditorStore()

  if (!isEnabled) {
    return (
      <div className="p-4 text-center text-gray-500 text-sm">
        Context-Aware Copilot Disabled
      </div>
    )
  }

  const handleInsertCode = (code: string) => {
    if (!activeTabId) return
    
    const activeTab = tabs.find(tab => tab.id === activeTabId)
    if (!activeTab) return

    // 在当前内容末尾插入代码
    const newContent = activeTab.content + '\n\n' + code
    updateTabContent(activeTabId, newContent)
  }

  const getIconForType = (type: string) => {
    switch (type) {
      case 'code':
        return <Code2 className="h-4 w-4" />
      case 'fix':
        return <Sparkles className="h-4 w-4" />
      default:
        return <Lightbulb className="h-4 w-4" />
    }
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
          Next Steps
        </h3>
      </div>

      {suggestions.length === 0 ? (
        <div className="p-4 text-center text-gray-500 text-sm">
          No suggestions available
        </div>
      ) : (
        <div className="p-4 space-y-3">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-start gap-2 mb-2">
                <div className="mt-0.5 text-blue-600 dark:text-blue-400">
                  {getIconForType(suggestion.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">
                      {suggestion.title}
                    </h4>
                    <Badge variant="secondary" className="text-xs">
                      {suggestion.type}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {suggestion.description}
                  </p>
                </div>
              </div>

              {suggestion.code && (
                <div className="mt-2">
                  <pre className="p-2 bg-gray-900 dark:bg-black rounded text-xs text-gray-100 overflow-x-auto">
                    <code>{suggestion.code}</code>
                  </pre>
                  <div className="flex gap-2 mt-2">
                    <Button
                      size="sm"
                      onClick={() => handleInsertCode(suggestion.code!)}
                      className="flex-1"
                    >
                      <Code2 className="h-3 w-3 mr-1" />
                      Insert Code
                    </Button>
                    <Button size="sm" variant="outline">
                      Explain
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

