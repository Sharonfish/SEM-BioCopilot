/**
 * 代码编辑器 (Monaco Editor)
 */

'use client'

import { useEffect, useRef } from 'react'
import Editor, { Monaco } from '@monaco-editor/react'
import { useEditorStore } from '@/store/editorStore'
import { editor } from 'monaco-editor'

export function CodeEditor() {
  const { tabs, activeTabId, updateTabContent } = useEditorStore()
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)

  const activeTab = tabs.find(tab => tab.id === activeTabId)

  const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
    editorRef.current = editor

    // 配置编辑器主题和选项
    monaco.editor.defineTheme('biocopilot-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#1e1e1e',
      },
    })

    // 配置 Python 语言支持
    monaco.languages.registerCompletionItemProvider('python', {
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position)
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        }

        // Simple auto-completion example
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
  }

  const handleEditorChange = (value: string | undefined) => {
    if (activeTabId && value !== undefined) {
      updateTabContent(activeTabId, value)
    }
  }

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
    <div className="flex-1 overflow-hidden">
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
    </div>
  )
}

