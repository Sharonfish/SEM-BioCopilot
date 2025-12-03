/**
 * Code Editor (Monaco Editor) with AI Explanation and Inline Diff
 */

'use client'

import { useEffect, useRef, useState } from 'react'
import Editor, { Monaco } from '@monaco-editor/react'
import { useEditorStore } from '@/store/editorStore'
import { useEditorSelectionStore } from '@/store/editorSelectionStore'
import { useCopilotModeStore } from '@/store/copilotModeStore'
import { editor } from 'monaco-editor'
import { ExplainButton } from './ExplainButton'
import { ExplanationPanel } from './ExplanationPanel'
import { useInlineEditorDiff, injectInlineDiffStyles } from './InlineEditorDiff'
import { applyDiffHunks } from '@/lib/diff-utils'

interface Selection {
  text: string
  startLine: number
  endLine: number
  startColumn: number
  endColumn: number
}

export function CodeEditor() {
  const { tabs, activeTabId, updateTabContent } = useEditorStore()
  const { setSelection: setGlobalSelection } = useEditorSelectionStore()
  const { 
    diffHunks, 
    updateHunkStatus,
    currentChange,
    updateCodeChangeStatus,
  } = useCopilotModeStore()
  
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  const [selection, setSelection] = useState<Selection | null>(null)
  const [buttonPosition, setButtonPosition] = useState<{ top: number; left: number } | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [explanation, setExplanation] = useState('')
  const [loading, setLoading] = useState(false)

  const activeTab = tabs.find(tab => tab.id === activeTabId)

  // Inject inline diff styles on mount
  useEffect(() => {
    injectInlineDiffStyles()
  }, [])

  // Diff Viewer Handlers (defined early for hook usage)
  const handleAcceptHunk = (hunkId: string) => {
    console.log('handleAcceptHunk called with:', hunkId)
    
    if (!activeTab || !currentChange) {
      console.error('No active tab or current change')
      return
    }

    // Mark hunk as accepted (will hide its diff display)
    updateHunkStatus(hunkId, 'accepted')
    
    console.log('Hunk marked as accepted:', hunkId)
  }

  const handleRejectHunk = (hunkId: string) => {
    console.log('handleRejectHunk called with:', hunkId)
    
    // Mark hunk as rejected (will hide its diff display)
    updateHunkStatus(hunkId, 'rejected')
    
    console.log('Hunk marked as rejected:', hunkId)
  }

  // Track if we've already applied changes for this set of hunks
  const appliedChangeRef = useRef<string | null>(null)

  // Apply all accepted changes when user is done reviewing
  useEffect(() => {
    if (!activeTab || !currentChange || diffHunks.length === 0) return

    // Check if all hunks have been reviewed (none are pending)
    const pendingHunks = diffHunks.filter(h => h.status === 'pending')
    const acceptedHunks = diffHunks.filter(h => h.status === 'accepted')
    const rejectedHunks = diffHunks.filter(h => h.status === 'rejected')
    
    // Create a unique key for this set of changes
    const changeKey = `${currentChange.id}-${acceptedHunks.length}-${rejectedHunks.length}`
    
    // If we've already applied this exact set of changes, skip
    if (appliedChangeRef.current === changeKey) {
      return
    }
    
    // If there are no pending hunks, apply changes
    if (pendingHunks.length === 0) {
      if (acceptedHunks.length > 0) {
        console.log('All hunks reviewed, applying accepted changes...')
        
        // Apply all accepted hunks to the original code
        let lines = currentChange.originalCode.split('\n')
        
        // Sort hunks by position (descending) to apply from bottom to top
        const sortedHunks = [...acceptedHunks].sort((a, b) => b.oldStart - a.oldStart)
        
        sortedHunks.forEach(hunk => {
          const deleteStart = hunk.oldStart - 1 // 0-based
          const deleteCount = hunk.deletedLines.length
          const addedContent = hunk.addedLines.map(line => line.content)
          
          // Replace deleted lines with added lines
          const before = lines.slice(0, deleteStart)
          const after = lines.slice(deleteStart + deleteCount)
          lines = [...before, ...addedContent, ...after]
        })
        
        const newContent = lines.join('\n')
        console.log('Applying changes: from', currentChange.originalCode.length, 'to', newContent.length, 'chars')
        
        // Update editor with all changes at once
        updateTabContent(activeTab.id, newContent)
        updateCodeChangeStatus(currentChange.id, 'accepted')
        
        // Mark as applied
        appliedChangeRef.current = changeKey
      } else if (acceptedHunks.length === 0 && rejectedHunks.length > 0) {
        // All hunks rejected
        console.log('All hunks rejected, no changes applied')
        updateCodeChangeStatus(currentChange.id, 'rejected')
        
        // Mark as applied
        appliedChangeRef.current = changeKey
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diffHunks, activeTab, currentChange])

  // Reset applied change ref when current change changes
  useEffect(() => {
    appliedChangeRef.current = null
  }, [currentChange?.id])

  // Use inline diff hook for showing diffs directly in editor
  useInlineEditorDiff({
    editorInstance: editorRef.current,
    hunks: diffHunks,
    onAcceptHunk: handleAcceptHunk,
    onRejectHunk: handleRejectHunk,
    originalCode: currentChange?.originalCode || '',
  })

  const handleEditorDidMount = (editorInstance: editor.IStandaloneCodeEditor, monaco: Monaco) => {
    editorRef.current = editorInstance

    // Configure editor theme
    monaco.editor.defineTheme('biocopilot-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#1e1e1e',
      },
    })

    // Configure Python language support
    monaco.languages.registerCompletionItemProvider('python', {
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position)
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        }

        const suggestions = [
          {
            label: 'import pandas as pd',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'import pandas as pd',
            documentation: 'Import pandas library',
            range: range,
          },
          {
            label: 'import numpy as np',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'import numpy as np',
            documentation: 'Import numpy library',
            range: range,
          },
        ]
        return { suggestions }
      },
    })

    // Listen to selection changes
    editorInstance.onDidChangeCursorSelection((e) => {
      const model = editorInstance.getModel()
      if (!model) return

      const selectedText = model.getValueInRange(e.selection)
      
      if (selectedText && selectedText.trim().length > 0) {
        // Get selection position
        const selectionData: Selection = {
          text: selectedText,
          startLine: e.selection.startLineNumber,
          endLine: e.selection.endLineNumber,
          startColumn: e.selection.startColumn,
          endColumn: e.selection.endColumn,
        }
        setSelection(selectionData)
        
        // Sync to global store for TopBar access
        setGlobalSelection({
          text: selectedText,
          startLine: e.selection.startLineNumber,
          endLine: e.selection.endLineNumber,
        })

        // Calculate button position
        const position = editorInstance.getScrolledVisiblePosition({
          lineNumber: e.selection.endLineNumber,
          column: e.selection.endColumn,
        })

        if (position && containerRef.current) {
          const containerRect = containerRef.current.getBoundingClientRect()
          setButtonPosition({
            top: position.top + position.height + 5,
            left: Math.min(position.left, containerRect.width - 120),
          })
        }
      } else {
        setSelection(null)
        setButtonPosition(null)
        // Clear global selection
        setGlobalSelection({ text: null, startLine: null, endLine: null })
      }
    })
  }

  const handleEditorChange = (value: string | undefined) => {
    if (activeTabId && value !== undefined) {
      updateTabContent(activeTabId, value)
    }
  }

  const handleExplain = async () => {
    if (!selection) return

    setLoading(true)
    setShowExplanation(true)
    setButtonPosition(null) // Hide the button

    try {
      const response = await fetch('/api/explain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: selection.text,
          language: activeTab?.language || 'python',
          context: `From file: ${activeTab?.name || 'unknown'}`,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get explanation')
      }

      const data = await response.json()
      setExplanation(data.explanation)
    } catch (error) {
      console.error('Explanation error:', error)
      setExplanation('Failed to generate explanation. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCloseExplanation = () => {
    setShowExplanation(false)
    setExplanation('')
    setSelection(null)
  }

  // Close explanation panel when clicking outside or changing selection
  useEffect(() => {
    if (!selection && showExplanation) {
      // Keep the explanation visible even if selection is cleared
    }
  }, [selection, showExplanation])

  if (!activeTab) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center text-gray-500">
          <p className="text-lg mb-2">Welcome to bioCopilot IDE</p>
          <p className="text-sm">Open a file to start editing</p>
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="flex-1 overflow-hidden relative">
      <Editor
        height="100%"
        language={activeTab.language}
        value={activeTab.content}
        theme="vs-dark"
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        options={{
          fontSize: 14,
          minimap: { enabled: true },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 4,
          wordWrap: 'on',
          lineNumbers: 'on',
          renderWhitespace: 'selection',
          bracketPairColorization: {
            enabled: true,
          },
        }}
      />

      {/* Floating Explain Button */}
      {selection && buttonPosition && !showExplanation && (
        <ExplainButton
          onClick={handleExplain}
          position={buttonPosition}
        />
      )}

      {/* Explanation Panel */}
      {showExplanation && (
        <ExplanationPanel
          explanation={explanation}
          loading={loading}
          onClose={handleCloseExplanation}
          position={buttonPosition ? {
            top: buttonPosition.top + 40,
            left: buttonPosition.left,
          } : undefined}
        />
      )}

      {/* Inline Diff is now shown directly in the editor via decorations */}
    </div>
  )
}

