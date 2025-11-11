/**
 * Pipeline 步骤侧边栏
 */

'use client'

import { CheckCircle2, Circle, Loader2, XCircle } from 'lucide-react'
import { usePipelineStore } from '@/store/pipelineStore'
import { useEditorStore } from '@/store/editorStore'
import { PipelineStatus } from '@/types/pipeline'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'

export function PipelineSteps() {
  const { config } = usePipelineStore()
  const { openFile } = useEditorStore()

  if (!config) {
    return (
      <div className="p-4 text-center text-gray-500 text-sm">
        No Pipeline Configuration
      </div>
    )
  }

  const getStatusIcon = (status: PipelineStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'running':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Circle className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusBadge = (status: PipelineStatus) => {
    const variants = {
      completed: 'success' as const,
      running: 'default' as const,
      error: 'danger' as const,
      pending: 'secondary' as const,
      cancelled: 'warning' as const,
    }
    
    const labels = {
      completed: 'Completed',
      running: 'Running',
      error: 'Error',
      pending: 'Pending',
      cancelled: 'Cancelled',
    }

    return <Badge variant={variants[status]}>{labels[status]}</Badge>
  }

  const handleStepClick = (stepFile: string, stepName: string) => {
    openFile({
      name: stepFile,
      path: stepFile,
      content: `# ${stepName}\n# Loading file content...`,
      language: 'python',
    })
  }

  return (
    <div className="flex flex-col h-full">
      {/* Title */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
          Pipeline Steps
        </h2>
        <div className="mt-2 text-xs text-gray-500">
          Progress: {config.currentStepIndex + 1} / {config.steps.length}
        </div>
        <div className="mt-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
          <div
            className="bg-blue-600 h-1.5 rounded-full transition-all"
            style={{ width: `${config.progress}%` }}
          />
        </div>
      </div>

      {/* Steps List */}
      <div className="flex-1 overflow-y-auto">
        {config.steps.map((step, index) => (
          <div
            key={step.id}
            className={cn(
              'p-3 border-b border-gray-200 dark:border-gray-700 cursor-pointer transition-colors',
              'hover:bg-gray-50 dark:hover:bg-gray-800',
              index === config.currentStepIndex && 'bg-blue-50 dark:bg-blue-900/20'
            )}
            onClick={() => handleStepClick(step.file, step.name)}
          >
            <div className="flex items-start gap-2">
              <div className="mt-0.5">{getStatusIcon(step.status)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                    {step.name}
                  </h3>
                  {getStatusBadge(step.status)}
                </div>
                {step.description && (
                  <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                    {step.description}
                  </p>
                )}
                <div className="mt-1 text-xs text-gray-400">
                  {step.file}
                </div>
                {step.error && (
                  <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded text-xs text-red-600 dark:text-red-400">
                    {step.error}
                  </div>
                )}
                {step.output && (
                  <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                    Data Shape: {step.output.rows.toLocaleString()} × {step.output.cols.toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

