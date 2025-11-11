/**
 * Copilot 右侧面板
 */

'use client'

import { Bot, Settings } from 'lucide-react'
import { useCopilotStore } from '@/store/copilotStore'
import { Button } from '@/components/ui/Button'
import { WorkflowStatus } from './WorkflowStatus'
import { NextSteps } from './NextSteps'
import { Badge } from '@/components/ui/Badge'

export function CopilotPanel() {
  const { isEnabled, toggleCopilot } = useCopilotStore()

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700">
      {/* Title Bar */}
      <div className="h-14 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-blue-600" />
          <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">
            Context-Aware Copilot
          </span>
          <Badge variant={isEnabled ? 'success' : 'secondary'} className="text-xs">
            {isEnabled ? 'Enabled' : 'Disabled'}
          </Badge>
        </div>
        <Button
          size="icon"
          variant="ghost"
          onClick={toggleCopilot}
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      {/* Workflow Status */}
      <WorkflowStatus />

      {/* Next Steps */}
      <NextSteps />
    </div>
  )
}

