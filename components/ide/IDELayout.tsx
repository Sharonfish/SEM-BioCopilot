/**
 * IDE 主布局组件 - 三栏布局
 */

'use client'

import { useState, useRef } from 'react'
import { TopBar } from './TopBar'
import { PipelineSteps } from './LeftSidebar/PipelineSteps'
import { TabBar } from './Editor/TabBar'
import { CodeEditor } from './Editor/CodeEditor'
import { CopilotPanel } from './RightSidebar/CopilotPanel'
import { usePipelineStore } from '@/store/pipelineStore'
import { useEditorStore } from '@/store/editorStore'
import { apiClient } from '@/lib/api-client'

interface IDELayoutProps {
  projectName?: string
}

export function IDELayout({ projectName }: IDELayoutProps) {
  const [isRunning, setIsRunning] = useState(false)
  const stopRequested = useRef(false)
  
  const { config, updateStepStatus, setCurrentStep, updateProgress, setStepError, updateStepOutput } = usePipelineStore()
  const { tabs } = useEditorStore()

  const handleRun = async () => {
    if (!config) return
    
    setIsRunning(true)
    stopRequested.current = false

    try {
      // Find the first uncompleted step
      let startIndex = config.steps.findIndex(step => step.status === 'pending')
      if (startIndex === -1) {
        // If all steps completed, start from beginning
        startIndex = 0
        // Reset all step statuses
        config.steps.forEach(step => {
          updateStepStatus(step.id, 'pending')
        })
      }

      // Execute steps one by one
      for (let i = startIndex; i < config.steps.length; i++) {
        if (stopRequested.current) break

        const step = config.steps[i]
        
        // Update current step
        setCurrentStep(i)
        updateStepStatus(step.id, 'running')

        try {
          // Get current file content
          const currentTab = tabs.find(tab => tab.path === step.file)
          const code = currentTab?.content || `# ${step.name} code`

          // Call execution API
          const result = await apiClient.executeCode({
            code,
            language: 'python',
            context: { stepId: step.id, stepName: step.name },
          })

          if (stopRequested.current) break

          if (result.success) {
            // Execution successful
            updateStepStatus(step.id, 'completed')
            
            // Update step output if data shape info available
            if (result.dataShape) {
              updateStepOutput(step.id, result.dataShape)
            }
          } else {
            // Execution failed
            setStepError(step.id, result.error || 'Execution failed')
            break
          }
        } catch (error) {
          console.error(`Step ${step.name} execution error:`, error)
          setStepError(step.id, error instanceof Error ? error.message : 'Unknown error')
          break
        }

        // Update progress
        const completedSteps = config.steps.filter(s => s.status === 'completed').length
        const progress = Math.round((completedSteps / config.steps.length) * 100)
        updateProgress(progress)

        // Delay between steps
        await new Promise(resolve => setTimeout(resolve, 800))
      }
    } finally {
      setIsRunning(false)
      stopRequested.current = false
    }
  }

  const handleStop = () => {
    stopRequested.current = true
    setIsRunning(false)
    console.log('Stopping execution...')
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Top Toolbar */}
      <TopBar
        projectName={projectName}
        onRun={handleRun}
        onStop={handleStop}
        isRunning={isRunning}
      />

      {/* Main Content Area - Three Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Pipeline Steps */}
        <div className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 overflow-hidden">
          <PipelineSteps />
        </div>

        {/* Center Area - Editor */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <TabBar />
          <CodeEditor />
        </div>

        {/* Right Sidebar - Copilot */}
        <div className="w-80 overflow-hidden">
          <CopilotPanel />
        </div>
      </div>
    </div>
  )
}

