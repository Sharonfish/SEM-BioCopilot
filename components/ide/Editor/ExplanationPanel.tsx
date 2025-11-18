/**
 * Code Explanation Panel - displays AI explanation below selected code
 */

'use client'

import { X, Sparkles, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'

interface ExplanationPanelProps {
  explanation: string
  loading: boolean
  onClose: () => void
  position?: { top: number; left: number }
}

export function ExplanationPanel({ explanation, loading, onClose, position }: ExplanationPanelProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(explanation)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div 
      className="absolute z-50 w-96 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl"
      style={{
        top: position?.top ? `${position.top}px` : '50%',
        left: position?.left ? `${position.left}px` : '50%',
        transform: position ? 'none' : 'translate(-50%, -50%)',
        maxHeight: '400px',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-blue-600" />
          <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
            Code Explanation
          </h3>
        </div>
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={handleCopy}
            disabled={loading}
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 overflow-y-auto" style={{ maxHeight: '320px' }}>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <Spinner size="lg" />
            <p className="text-sm text-gray-500">Analyzing code...</p>
          </div>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            {explanation.split('\n').map((line, index) => {
              // Handle markdown-style bold
              if (line.startsWith('**') && line.endsWith('**')) {
                return (
                  <h4 key={index} className="font-semibold text-gray-900 dark:text-gray-100 mt-3 mb-2">
                    {line.replace(/\*\*/g, '')}
                  </h4>
                )
              }
              
              // Handle bullet points
              if (line.trim().startsWith('- ')) {
                return (
                  <li key={index} className="text-gray-700 dark:text-gray-300 ml-4">
                    {line.trim().substring(2)}
                  </li>
                )
              }
              
              // Handle italic
              if (line.startsWith('*') && line.endsWith('*') && !line.includes('**')) {
                return (
                  <p key={index} className="text-sm text-gray-500 dark:text-gray-400 italic">
                    {line.replace(/\*/g, '')}
                  </p>
                )
              }
              
              // Regular paragraph
              if (line.trim()) {
                return (
                  <p key={index} className="text-gray-700 dark:text-gray-300 mb-2">
                    {line}
                  </p>
                )
              }
              
              return <br key={index} />
            })}
          </div>
        )}
      </div>
    </div>
  )
}

