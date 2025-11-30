/**
 * Output Panel Component - 显示执行输出和日志
 */

'use client'

import { useEffect, useRef } from 'react'
import { ChevronDown, ChevronUp, X, Trash2, Maximize2, Minimize2 } from 'lucide-react'
import { useOutputStore } from '@/store/outputStore'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

export function OutputPanel() {
  const {
    logs,
    isExpanded,
    height,
    autoScroll,
    clearLogs,
    toggleExpanded,
    setHeight,
    setAutoScroll,
  } = useOutputStore()

  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const resizeRef = useRef<HTMLDivElement>(null)
  const isResizingRef = useRef(false)

  // Auto-scroll to bottom when new logs are added
  useEffect(() => {
    if (autoScroll && contentRef.current && isExpanded) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight
    }
  }, [logs, autoScroll, isExpanded])

  // Handle resize - always have listeners attached, they check the ref
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizingRef.current) return

      const newHeight = window.innerHeight - e.clientY

      if (newHeight >= 100 && newHeight <= 600) {
        setHeight(newHeight)
      }
    }

    const handleMouseUp = () => {
      isResizingRef.current = false
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [setHeight])

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault()
    isResizingRef.current = true
    document.body.style.cursor = 'row-resize'
    document.body.style.userSelect = 'none'
  }

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'error':
      case 'stderr':
        return '🔴'
      case 'info':
        return 'ℹ️'
      default:
        return '📝'
    }
  }

  const getLogColor = (type: string) => {
    switch (type) {
      case 'error':
      case 'stderr':
        return 'text-red-400 dark:text-red-500'
      case 'info':
        return 'text-blue-400 dark:text-blue-500'
      default:
        return 'text-gray-300 dark:text-gray-400'
    }
  }

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3,
    }).format(date)
  }

  if (!isExpanded && logs.length === 0) {
    return null
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        'border-t border-gray-200 dark:border-gray-700 bg-gray-900 text-gray-100',
        'flex flex-col transition-all',
        !isExpanded && 'h-8'
      )}
      style={isExpanded ? { height: `${height}px` } : undefined}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <button
            onClick={toggleExpanded}
            className="flex items-center gap-1.5 text-xs font-medium text-gray-300 hover:text-white transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
            <span>Output</span>
            {logs.length > 0 && (
              <span className="px-1.5 py-0.5 bg-gray-700 rounded text-xs">
                {logs.length}
              </span>
            )}
          </button>
        </div>

        {isExpanded && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setAutoScroll(!autoScroll)}
              className={cn(
                'px-2 py-1 text-xs rounded transition-colors',
                autoScroll
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700'
              )}
              title="Auto-scroll"
            >
              Auto
            </button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={clearLogs}
              title="Clear output"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={toggleExpanded}
              title="Collapse"
            >
              <Minimize2 className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>

      {/* Content */}
      {isExpanded && (
        <>
          <div
            ref={contentRef}
            className="flex-1 overflow-y-auto p-3 font-mono text-sm"
            style={{ maxHeight: `${height - 60}px` }}
          >
            {logs.length === 0 ? (
              <div className="text-gray-500 text-center py-8">
                No output yet. Run your code to see results here.
              </div>
            ) : (
              <div className="space-y-1">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className={cn('flex gap-2 items-start', getLogColor(log.type))}
                  >
                    <span className="text-xs mt-0.5 flex-shrink-0">
                      {getLogIcon(log.type)}
                    </span>
                    <span className="text-xs text-gray-500 flex-shrink-0 min-w-[80px]">
                      {formatTimestamp(log.timestamp)}
                    </span>
                    {log.stepName && (
                      <span className="text-xs text-gray-600 dark:text-gray-400 flex-shrink-0 px-1.5 py-0.5 bg-gray-800 rounded">
                        {log.stepName}
                      </span>
                    )}
                    <pre className="flex-1 whitespace-pre-wrap break-words text-gray-300 dark:text-gray-400">
                      {log.content}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Resize Handle */}
          <div
            ref={resizeRef}
            onMouseDown={handleResizeStart}
            className="h-1 bg-gray-700 hover:bg-gray-600 cursor-row-resize transition-colors"
            title="Drag to resize"
          />
        </>
      )}
    </div>
  )
}

