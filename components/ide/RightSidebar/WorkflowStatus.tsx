/**
 * Workflow 状态显示
 */

'use client'

import { usePipelineStore } from '@/store/pipelineStore'
import { useCopilotStore } from '@/store/copilotStore'
import { Badge } from '@/components/ui/Badge'

export function WorkflowStatus() {
  const { config, currentDataShape } = usePipelineStore()
  const { context } = useCopilotStore()

  if (!config) {
    return null
  }

  const currentStep = config.steps[config.currentStepIndex]

  return (
    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
      <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-3">
        Workflow Status
      </h3>
      
      <div className="space-y-3">
        {/* Current Step */}
        <div>
          <div className="text-xs text-gray-500 mb-1">Current Stage</div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {currentStep?.name || 'Not Started'}
            </span>
            {currentStep && (
              <Badge variant={
                currentStep.status === 'running' ? 'default' :
                currentStep.status === 'completed' ? 'success' :
                currentStep.status === 'error' ? 'danger' : 'secondary'
              }>
                {currentStep.status === 'running' ? 'Running' :
                 currentStep.status === 'completed' ? 'Completed' :
                 currentStep.status === 'error' ? 'Error' : 'Pending'}
              </Badge>
            )}
          </div>
        </div>

        {/* Progress */}
        <div>
          <div className="text-xs text-gray-500 mb-1">Progress</div>
          <div className="text-sm text-gray-900 dark:text-gray-100">
            {config.currentStepIndex + 1} / {config.steps.length}
          </div>
        </div>

        {/* Data Shape */}
        {currentDataShape && (
          <div>
            <div className="text-xs text-gray-500 mb-1">Data Shape</div>
            <div className="text-sm font-mono text-gray-900 dark:text-gray-100">
              {currentDataShape.rows.toLocaleString()} × {currentDataShape.cols.toLocaleString()}
            </div>
          </div>
        )}

        {/* Quality Control Suggestion */}
        {currentDataShape && currentDataShape.rows > 10000 && (
          <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-xs text-yellow-800 dark:text-yellow-300">
            Recommend quality control to filter low-quality data
          </div>
        )}
      </div>
    </div>
  )
}

