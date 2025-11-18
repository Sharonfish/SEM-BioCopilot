/**
 * Code Editor (Monaco Editor) with AI Explanation
 */

'use client'

import { useEffect, useRef, useState } from 'react'
import Editor, { Monaco } from '@monaco-editor/react'
import { useEditorStore } from '@/store/editorStore'
import { editor } from 'monaco-editor'
import { ExplainButton } from './ExplainButton'
import { ExplanationPanel } from './ExplanationPanel'

interface Selection {
  text: string
  startLine: number
  endLine: number
  startColumn: number
  endColumn: number
}

export function CodeEditor() {
  const { tabs, activeTabId, updateTabContent } = useEditorStore()
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  const [selection, setSelection] = useState<Selection | null>(null)
  const [buttonPosition, setButtonPosition] = useState<{ top: number; left: number } | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [explanation, setExplanation] = useState('')
  const [loading, setLoading] = useState(false)

  const activeTab = tabs.find(tab => tab.id === activeTabId)

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
          <p className="text-lg mb-2">Welcome to BioCopilot IDE</p>
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
    </div>
  )
}

