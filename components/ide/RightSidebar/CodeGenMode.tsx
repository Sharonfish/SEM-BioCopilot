/**
 * Code Generation Mode - Generate code with AI and diff viewer
 */

'use client'

import { useState } from 'react'
import { Code2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { useCopilotModeStore } from '@/store/copilotModeStore'
import { useEditorStore } from '@/store/editorStore'
import { useEditorSelectionStore } from '@/store/editorSelectionStore'
import { CodeChange } from '@/types/copilotMode'
import { calculateLineDiff } from '@/lib/diff-utils'

export function CodeGenMode() {
  const { 
    currentChange, 
    addCodeChange, 
    setDiffHunks, 
    loading, 
    setLoading 
  } = useCopilotModeStore()
  const { tabs, activeTabId } = useEditorStore()
  const { text: selectedText, startLine, endLine } = useEditorSelectionStore()
  const [prompt, setPrompt] = useState('')

  const activeTab = tabs.find(tab => tab.id === activeTabId)

  const handleGenerate = async () => {
    if (!prompt.trim() || loading) return
    if (!activeTab) {
      alert('Please open a file first')
      return
    }

    setLoading(true)

    try {
      // Create abort controller for timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 35000) // 35 second timeout

      const response = await fetch('/api/copilot/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          currentCode: selectedText || activeTab.content,
          language: activeTab.language,
          fileName: activeTab.name,
          hasSelection: !!selectedText,
          selectionRange: selectedText ? { startLine, endLine } : null,
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      
      const newChange: CodeChange = {
        id: `change-${Date.now()}`,
        originalCode: selectedText || activeTab.content,
        generatedCode: data.code,
        prompt: prompt.trim(),
        fileName: activeTab.name,
        language: activeTab.language,
        startLine: selectedText ? startLine || undefined : undefined,
        endLine: selectedText ? endLine || undefined : undefined,
        status: 'pending',
        timestamp: new Date(),
      }

      addCodeChange(newChange)
      setPrompt('')
      
      // Calculate diff - will be shown inline in editor
      const hunks = calculateLineDiff(
        selectedText || activeTab.content,
        data.code
      )
      setDiffHunks(hunks)
      // Note: Inline diff is shown automatically via useInlineEditorDiff hook in CodeEditor
    } catch (error: any) {
      console.error('Code generation error:', error)
      
      let errorMessage = 'Failed to generate code. Please try again.'
      
      if (error.name === 'AbortError') {
        errorMessage = '⏱️ Request timeout. The server took too long to respond. Please try:\n\n• A shorter or simpler prompt\n• Selecting less code\n• Checking your internet connection'
      } else if (error.message) {
        errorMessage = `❌ Error: ${error.message}\n\nPlease try again or contact support if the issue persists.`
      }
      
      alert(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-2">
          Generate Code
        </h3>
        <p className="text-xs text-gray-500">
          {selectedText ? 
            `${selectedText.split('\n').length} lines selected` : 
            activeTab ? `Entire file: ${activeTab.name}` : 'No file open'
          }
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Prompt Input */}
        <div className="mb-4">
          <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 block">
            What do you want to do?
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., 'Add error handling', 'Optimize for performance', 'Add docstrings'..."
            className="w-full h-24 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <Button
            onClick={handleGenerate}
            disabled={!prompt.trim() || loading || !activeTab}
            className="w-full mt-2"
          >
            {loading ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Code
              </>
            )}
          </Button>
        </div>

        {/* Status Messages */}
        {currentChange && (
          <div className="text-center text-sm p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            {currentChange.status === 'pending' && (
              <p className="text-blue-600">
                💡 Code generated! Review changes in the diff viewer.
              </p>
            )}
            {currentChange.status === 'accepted' && (
              <p className="text-green-600">
                ✅ Changes applied successfully!
              </p>
            )}
            {currentChange.status === 'rejected' && (
              <p className="text-red-600">
                ❌ Changes rejected. Try a different prompt.
              </p>
            )}
          </div>
        )}

        {/* Help Text */}
        {!currentChange && (
          <div className="text-xs text-gray-500 space-y-2 mt-4">
            <p className="font-medium">💡 Tips:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Select code for targeted changes</li>
              <li>Leave unselected to modify entire file</li>
              <li>Be specific in your prompts</li>
              <li>Review each change carefully</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

