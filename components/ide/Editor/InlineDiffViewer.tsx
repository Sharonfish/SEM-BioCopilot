/**
 * Inline Diff Viewer - GitHub-style line-by-line diff with accept/reject
 */

'use client'

import { Check, X, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { DiffHunk } from '@/lib/diff-utils'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface InlineDiffViewerProps {
  hunks: DiffHunk[]
  onAcceptHunk: (hunkId: string) => void
  onRejectHunk: (hunkId: string) => void
  onAcceptAll: () => void
  onRejectAll: () => void
  onClose: () => void
}

export function InlineDiffViewer({
  hunks,
  onAcceptHunk,
  onRejectHunk,
  onAcceptAll,
  onRejectAll,
  onClose,
}: InlineDiffViewerProps) {
  const [expandedHunks, setExpandedHunks] = useState<Set<string>>(
    new Set(hunks.map(h => h.id))
  )

  const toggleHunk = (hunkId: string) => {
    const newExpanded = new Set(expandedHunks)
    if (newExpanded.has(hunkId)) {
      newExpanded.delete(hunkId)
    } else {
      newExpanded.add(hunkId)
    }
    setExpandedHunks(newExpanded)
  }

  const pendingHunks = hunks.filter(h => h.status === 'pending')
  const acceptedCount = hunks.filter(h => h.status === 'accepted').length
  const rejectedCount = hunks.filter(h => h.status === 'rejected').length

  return (
    <div className="absolute inset-0 z-50 bg-gray-900/50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Review Code Changes
            </h3>
            <Button size="sm" variant="ghost" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-green-600 dark:text-green-400">
              +{hunks.reduce((sum, h) => sum + h.addedLines.length, 0)} added
            </span>
            <span className="text-red-600 dark:text-red-400">
              -{hunks.reduce((sum, h) => sum + h.deletedLines.length, 0)} deleted
            </span>
            <span className="text-gray-500">
              {hunks.length} change{hunks.length !== 1 ? 's' : ''}
            </span>
            {acceptedCount > 0 && (
              <span className="text-green-600">
                ✓ {acceptedCount} accepted
              </span>
            )}
            {rejectedCount > 0 && (
              <span className="text-red-600">
                ✗ {rejectedCount} rejected
              </span>
            )}
          </div>
        </div>

        {/* Diff Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {hunks.map((hunk, index) => {
            const isExpanded = expandedHunks.has(hunk.id)
            const isPending = hunk.status === 'pending'
            
            return (
              <div
                key={hunk.id}
                className={cn(
                  'border rounded-lg overflow-hidden',
                  hunk.status === 'accepted' && 'border-green-500 bg-green-50 dark:bg-green-900/20',
                  hunk.status === 'rejected' && 'border-red-500 bg-red-50 dark:bg-red-900/20',
                  hunk.status === 'pending' && 'border-gray-300 dark:border-gray-600'
                )}
              >
                {/* Hunk Header */}
                <div
                  className={cn(
                    'flex items-center justify-between p-3 cursor-pointer',
                    hunk.status === 'accepted' && 'bg-green-100 dark:bg-green-900/30',
                    hunk.status === 'rejected' && 'bg-red-100 dark:bg-red-900/30',
                    hunk.status === 'pending' && 'bg-gray-100 dark:bg-gray-800'
                  )}
                  onClick={() => toggleHunk(hunk.id)}
                >
                  <div className="flex items-center gap-2">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronUp className="h-4 w-4" />
                    )}
                    <span className="font-mono text-sm text-gray-700 dark:text-gray-300">
                      Change #{index + 1}
                    </span>
                    <span className="text-xs text-gray-500">
                      Lines {hunk.oldStart}-{hunk.oldEnd}
                    </span>
                  </div>
                  
                  {isPending && (
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-green-600 border-green-600 hover:bg-green-50"
                        onClick={() => onAcceptHunk(hunk.id)}
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-red-600 border-red-600 hover:bg-red-50"
                        onClick={() => onRejectHunk(hunk.id)}
                      >
                        <X className="h-3 w-3 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}
                  
                  {hunk.status === 'accepted' && (
                    <span className="text-sm text-green-600 font-medium">
                      ✓ Accepted
                    </span>
                  )}
                  
                  {hunk.status === 'rejected' && (
                    <span className="text-sm text-red-600 font-medium">
                      ✗ Rejected
                    </span>
                  )}
                </div>

                {/* Hunk Content */}
                {isExpanded && (
                  <div className="bg-gray-900 font-mono text-sm">
                    {/* Context Before */}
                    {hunk.contextBefore.map((line, i) => (
                      <div
                        key={`before-${i}`}
                        className="flex border-b border-gray-800"
                      >
                        <div className="w-12 text-right px-2 py-1 text-gray-500 bg-gray-800 border-r border-gray-700">
                          {line.oldLineNumber}
                        </div>
                        <div className="flex-1 px-3 py-1 text-gray-400">
                          {line.content || ' '}
                        </div>
                      </div>
                    ))}

                    {/* Deleted Lines */}
                    {hunk.deletedLines.map((line, i) => (
                      <div
                        key={`del-${i}`}
                        className="flex border-b border-gray-800 bg-red-900/30"
                      >
                        <div className="w-12 text-right px-2 py-1 text-red-400 bg-red-900/50 border-r border-red-700">
                          {line.oldLineNumber}
                        </div>
                        <div className="w-8 px-2 py-1 text-red-400 bg-red-900/40">
                          -
                        </div>
                        <div className="flex-1 px-3 py-1 text-red-200 line-through">
                          {line.content || ' '}
                        </div>
                      </div>
                    ))}

                    {/* Added Lines */}
                    {hunk.addedLines.map((line, i) => (
                      <div
                        key={`add-${i}`}
                        className="flex border-b border-gray-800 bg-green-900/30"
                      >
                        <div className="w-12 text-right px-2 py-1 text-green-400 bg-green-900/50 border-r border-green-700">
                          {line.newLineNumber}
                        </div>
                        <div className="w-8 px-2 py-1 text-green-400 bg-green-900/40">
                          +
                        </div>
                        <div className="flex-1 px-3 py-1 text-green-200">
                          {line.content || ' '}
                        </div>
                      </div>
                    ))}

                    {/* Context After */}
                    {hunk.contextAfter.map((line, i) => (
                      <div
                        key={`after-${i}`}
                        className="flex border-b border-gray-800"
                      >
                        <div className="w-12 text-right px-2 py-1 text-gray-500 bg-gray-800 border-r border-gray-700">
                          {line.oldLineNumber}
                        </div>
                        <div className="flex-1 px-3 py-1 text-gray-400">
                          {line.content || ' '}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <div className="flex gap-2">
            {pendingHunks.length > 0 && (
              <>
                <Button
                  variant="outline"
                  className="text-red-600 border-red-600"
                  onClick={onRejectAll}
                >
                  <X className="h-4 w-4 mr-2" />
                  Reject All
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={onAcceptAll}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Accept All
                </Button>
              </>
            )}
            {pendingHunks.length === 0 && acceptedCount > 0 && (
              <Button onClick={onClose}>
                Done
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

