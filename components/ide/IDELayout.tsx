/**
 * IDE 主布局组件 - 三栏布局
 */

'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from './TopBar'
import { LeftSidebarTabs } from './LeftSidebar/LeftSidebarTabs'
import { TabBar } from './Editor/TabBar'
import { CodeEditor } from './Editor/CodeEditor'
import { CopilotPanel } from './RightSidebar/CopilotPanel'
import { CitationNetworkLauncher } from '@/components/QuickActions/CitationNetworkLauncher'
import { OutputPanel } from './OutputPanel'
import { usePipelineStore } from '@/store/pipelineStore'
import { useEditorStore } from '@/store/editorStore'
import { useEditorSelectionStore } from '@/store/editorSelectionStore'
import { useOutputStore } from '@/store/outputStore'
import { apiClient } from '@/lib/api-client'

interface IDELayoutProps {
  projectName?: string
}

export function IDELayout({ projectName }: IDELayoutProps) {
  const router = useRouter()
  const [isRunning, setIsRunning] = useState(false)
  const stopRequested = useRef(false)
  
  const { config, updateStepStatus, setCurrentStep, updateProgress, setStepError, updateStepOutput } = usePipelineStore()
  const { tabs } = useEditorStore()
  const { hasSelection, text: selectionText, startLine: selectionStartLine, endLine: selectionEndLine } = useEditorSelectionStore()
  const { addLog, setExpanded } = useOutputStore()

  // Keyboard shortcut: Ctrl+Shift+C to open Citation Network
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        e.preventDefault()
        router.push('/citation-network')
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [router])

  const handleRunByStep = async () => {
    if (!config) return
    
    setIsRunning(true)
    stopRequested.current = false
    setExpanded(true) // Auto-expand output panel when running

    // Clear previous output and add start message
    addLog({
      type: 'info',
      content: `Starting pipeline execution: ${config.name}`,
    })

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

        addLog({
          type: 'info',
          content: `[${i + 1}/${config.steps.length}] Executing step: ${step.name}`,
          stepId: step.id,
          stepName: step.name,
        })

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
            
            // Add stdout output
            if (result.output?.stdout) {
              addLog({
                type: 'stdout',
                content: result.output.stdout,
                stepId: step.id,
                stepName: step.name,
              })
            }

            // Add stderr output if present
            if (result.output?.stderr) {
              addLog({
                type: 'stderr',
                content: result.output.stderr,
                stepId: step.id,
                stepName: step.name,
              })
            }

            // Log execution time
            if (result.executionTime) {
              addLog({
                type: 'info',
                content: `✓ Step completed in ${result.executionTime.toFixed(2)}s`,
                stepId: step.id,
                stepName: step.name,
              })
            }
            
            // Update step output if data shape info available
            if (result.dataShape) {
              updateStepOutput(step.id, result.dataShape)
              addLog({
                type: 'info',
                content: `Data shape: ${result.dataShape.rows.toLocaleString()} rows × ${result.dataShape.cols.toLocaleString()} columns`,
                stepId: step.id,
                stepName: step.name,
              })
            }
          } else {
            // Execution failed
            const errorMsg = result.error || 'Execution failed'
            setStepError(step.id, errorMsg)
            addLog({
              type: 'error',
              content: `✗ Error: ${errorMsg}`,
              stepId: step.id,
              stepName: step.name,
            })
            break
          }
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Unknown error'
          console.error(`Step ${step.name} execution error:`, error)
          setStepError(step.id, errorMsg)
          addLog({
            type: 'error',
            content: `✗ Execution error: ${errorMsg}`,
            stepId: step.id,
            stepName: step.name,
          })
          break
        }

        // Update progress
        const completedSteps = config.steps.filter(s => s.status === 'completed').length
        const progress = Math.round((completedSteps / config.steps.length) * 100)
        updateProgress(progress)

        // Delay between steps
        await new Promise(resolve => setTimeout(resolve, 800))
      }

      // Final status
      if (!stopRequested.current) {
        addLog({
          type: 'info',
          content: 'Pipeline execution completed successfully',
        })
      } else {
        addLog({
          type: 'info',
          content: 'Pipeline execution stopped by user',
        })
      }
    } finally {
      setIsRunning(false)
      stopRequested.current = false
    }
  }

  const handleRunHighlighted = async () => {
    if (!selectionText || !selectionText.trim()) {
      addLog({
        type: 'error',
        content: 'No code selected. Please select a code block to run.',
      })
      setExpanded(true)
      return
    }

    setIsRunning(true)
    stopRequested.current = false
    setExpanded(true)

    const selectedCode = selectionText.trim()
    const activeTab = tabs.find(tab => tab.isActive)

    addLog({
      type: 'info',
      content: `Executing selected code block (lines ${selectionStartLine}–${selectionEndLine})...`,
    })

    try {
      const result = await apiClient.executeCode({
        code: selectedCode,
        language: activeTab?.language || 'python',
        context: {
          type: 'highlighted',
          fileName: activeTab?.name || 'unknown',
          startLine: selectionStartLine,
          endLine: selectionEndLine,
        },
      })

      if (stopRequested.current) return

      if (result.success) {
            // Add stdout output
            if (result.output?.stdout) {
              addLog({
                type: 'stdout',
                content: result.output.stdout,
              })
            }

            // Add stderr output if present
            if (result.output?.stderr) {
              addLog({
                type: 'stderr',
                content: result.output.stderr,
              })
            }

            // Log execution time
            if (result.executionTime) {
              addLog({
                type: 'info',
                content: `✓ Code block executed in ${result.executionTime.toFixed(2)}s`,
              })
            }

        // Log data shape if available
        if (result.dataShape) {
          addLog({
            type: 'info',
            content: `Data shape: ${result.dataShape.rows.toLocaleString()} rows × ${result.dataShape.cols.toLocaleString()} columns`,
          })
        }
      } else {
        const errorMsg = result.error || 'Execution failed'
        addLog({
          type: 'error',
          content: `✗ Error: ${errorMsg}`,
        })
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      console.error('Highlighted code execution error:', error)
      addLog({
        type: 'error',
        content: `✗ Execution error: ${errorMsg}`,
      })
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
        onRunByStep={handleRunByStep}
        onRunHighlighted={handleRunHighlighted}
        onStop={handleStop}
        isRunning={isRunning}
        hasSelection={hasSelection}
      />

      {/* Main Content Area - Three Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Tabs (Pipeline Steps / Database Import) */}
        <div className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 overflow-hidden">
          <LeftSidebarTabs />
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

      {/* Output Panel */}
      <OutputPanel />

      {/* Floating Citation Network Launcher */}
      <CitationNetworkLauncher />
    </div>
  )
}

