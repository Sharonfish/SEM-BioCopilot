/**
 * Inline Editor Diff - Shows diffs directly in Monaco Editor
 * Uses decorations for highlighting and overlay widgets for interactive buttons
 */

'use client'

import { useEffect, useRef } from 'react'
import { editor } from 'monaco-editor'
import { DiffHunk } from '@/lib/diff-utils'

interface InlineEditorDiffProps {
  editorInstance: editor.IStandaloneCodeEditor | null
  hunks: DiffHunk[]
  onAcceptHunk: (hunkId: string) => void
  onRejectHunk: (hunkId: string) => void
  originalCode: string
}

export function useInlineEditorDiff({
  editorInstance,
  hunks,
  onAcceptHunk,
  onRejectHunk,
}: InlineEditorDiffProps) {
  const decorationsRef = useRef<string[]>([])
  const viewZonesRef = useRef<string[]>([])
  const overlayWidgetsRef = useRef<editor.IOverlayWidget[]>([])
  const scrollListenerRef = useRef<any>(null)

  // Function to update widget positions
  const updateWidgetPositions = () => {
    overlayWidgetsRef.current.forEach(widget => {
      if (editorInstance) {
        editorInstance.layoutOverlayWidget(widget)
      }
    })
  }

  useEffect(() => {
    if (!editorInstance || hunks.length === 0) {
      // Clear any existing decorations and zones
      if (editorInstance && decorationsRef.current.length > 0) {
        decorationsRef.current = editorInstance.deltaDecorations(decorationsRef.current, [])
      }
      if (editorInstance && viewZonesRef.current.length > 0) {
        editorInstance.changeViewZones((accessor) => {
          viewZonesRef.current.forEach(id => accessor.removeZone(id))
        })
        viewZonesRef.current = []
      }
      if (editorInstance && overlayWidgetsRef.current.length > 0) {
        overlayWidgetsRef.current.forEach(widget => {
          editorInstance.removeOverlayWidget(widget)
        })
        overlayWidgetsRef.current = []
      }
      return
    }

    const model = editorInstance.getModel()
    if (!model) return

    // Clear previous decorations
    if (decorationsRef.current.length > 0) {
      decorationsRef.current = editorInstance.deltaDecorations(decorationsRef.current, [])
    }

    // Clear previous view zones
    if (viewZonesRef.current.length > 0) {
      editorInstance.changeViewZones((accessor) => {
        viewZonesRef.current.forEach(id => accessor.removeZone(id))
      })
      viewZonesRef.current = []
    }

    // Clear previous overlay widgets
    if (overlayWidgetsRef.current.length > 0) {
      overlayWidgetsRef.current.forEach(widget => {
        editorInstance.removeOverlayWidget(widget)
      })
      overlayWidgetsRef.current = []
    }

    const newDecorations: editor.IModelDeltaDecoration[] = []

    // Process each hunk
    hunks.forEach((hunk) => {
      if (hunk.status !== 'pending') return

      // Decorate deleted lines (red background)
      hunk.deletedLines.forEach((line) => {
        if (line.oldLineNumber && line.oldLineNumber <= model.getLineCount()) {
          newDecorations.push({
            range: {
              startLineNumber: line.oldLineNumber,
              startColumn: 1,
              endLineNumber: line.oldLineNumber,
              endColumn: model.getLineMaxColumn(line.oldLineNumber),
            },
            options: {
              isWholeLine: true,
              className: 'inline-diff-deleted-line',
              linesDecorationsClassName: 'inline-diff-gutter-deleted',
            },
          })
        }
      })

      // Add view zone for added lines (green, shown below deleted lines)
      if (hunk.addedLines.length > 0) {
        const insertAfterLine = hunk.oldEnd || hunk.oldStart

        editorInstance.changeViewZones((accessor) => {
          const domNode = document.createElement('div')
          domNode.className = 'inline-diff-added-zone'
          domNode.style.cssText = `
            background: rgba(34, 197, 94, 0.12);
            border-left: 3px solid #16a34a;
            position: relative;
            padding-left: 0;
            margin-left: 0;
          `

          hunk.addedLines.forEach((line) => {
            const lineDiv = document.createElement('div')
            lineDiv.className = 'inline-diff-added-line-wrapper'
            lineDiv.style.cssText = `
              padding: 2px 8px 2px 8px;
              font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
              font-size: 14px;
              line-height: 19px;
              color: #22c55e;
              white-space: pre;
              position: relative;
              display: flex;
              align-items: center;
              min-height: 19px;
            `

            const prefix = document.createElement('span')
            prefix.textContent = '+ '
            prefix.style.cssText = 'color: #16a34a; font-weight: bold; margin-right: 4px;'
            
            const content = document.createElement('span')
            content.textContent = line.content || ' '
            content.style.cssText = 'color: #d4d4d4; white-space: pre;'
            
            lineDiv.appendChild(prefix)
            lineDiv.appendChild(content)
            domNode.appendChild(lineDiv)
          })

          const zoneId = accessor.addZone({
            afterLineNumber: insertAfterLine,
            heightInLines: hunk.addedLines.length,
            domNode: domNode,
          })
          viewZonesRef.current.push(zoneId)
        })

        // Add overlay widget for buttons (positioned to the right of the first added line)
        const buttonWidget = createButtonOverlayWidget(
          editorInstance,
          insertAfterLine + 1, // Position at first added line
          hunk.id,
          onAcceptHunk,
          onRejectHunk
        )
        editorInstance.addOverlayWidget(buttonWidget)
        overlayWidgetsRef.current.push(buttonWidget)
      } else if (hunk.deletedLines.length > 0) {
        // For delete-only hunks, add buttons at the last deleted line
        const lastDeletedLine = hunk.deletedLines[hunk.deletedLines.length - 1]
        if (lastDeletedLine.oldLineNumber) {
          const buttonWidget = createButtonOverlayWidget(
            editorInstance,
            lastDeletedLine.oldLineNumber,
            hunk.id,
            onAcceptHunk,
            onRejectHunk
          )
          editorInstance.addOverlayWidget(buttonWidget)
          overlayWidgetsRef.current.push(buttonWidget)
        }
      }
    })

    // Apply decorations
    decorationsRef.current = editorInstance.deltaDecorations([], newDecorations)

    // Add scroll listener to update button positions
    if (scrollListenerRef.current) {
      scrollListenerRef.current.dispose()
    }
    scrollListenerRef.current = editorInstance.onDidScrollChange(() => {
      updateWidgetPositions()
    })

    // Also update on layout changes
    const layoutDisposable = editorInstance.onDidLayoutChange(() => {
      updateWidgetPositions()
    })

    // Cleanup
    return () => {
      if (scrollListenerRef.current) {
        scrollListenerRef.current.dispose()
        scrollListenerRef.current = null
      }
      layoutDisposable.dispose()
      if (decorationsRef.current.length > 0) {
        decorationsRef.current = editorInstance?.deltaDecorations(decorationsRef.current, []) || []
      }
      if (viewZonesRef.current.length > 0) {
        editorInstance?.changeViewZones((accessor) => {
          viewZonesRef.current.forEach(id => accessor.removeZone(id))
        })
        viewZonesRef.current = []
      }
      if (overlayWidgetsRef.current.length > 0) {
        overlayWidgetsRef.current.forEach(widget => {
          editorInstance?.removeOverlayWidget(widget)
        })
        overlayWidgetsRef.current = []
      }
    }
  }, [editorInstance, hunks, onAcceptHunk, onRejectHunk])
}

function createButtonOverlayWidget(
  editorInstance: editor.IStandaloneCodeEditor,
  lineNumber: number,
  hunkId: string,
  onAccept: (id: string) => void,
  onReject: (id: string) => void
): editor.IOverlayWidget {
  const domNode = document.createElement('div')
  domNode.className = 'inline-diff-button-overlay'
  domNode.style.cssText = `
    display: flex;
    gap: 6px;
    pointer-events: auto;
    z-index: 100000;
    position: absolute;
  `

  // Accept button
  const acceptBtn = document.createElement('button')
  acceptBtn.textContent = 'Accept'
  acceptBtn.className = 'inline-diff-accept-btn'
  acceptBtn.style.cssText = `
    padding: 4px 12px;
    font-size: 12px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    color: white;
    background: #16a34a;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
    box-shadow: 0 1px 3px rgba(0,0,0,0.3);
    transition: all 0.15s;
  `
  
  acceptBtn.addEventListener('mouseenter', () => {
    acceptBtn.style.background = '#15803d'
    acceptBtn.style.transform = 'scale(1.05)'
  })
  acceptBtn.addEventListener('mouseleave', () => {
    acceptBtn.style.background = '#16a34a'
    acceptBtn.style.transform = 'scale(1)'
  })
  acceptBtn.addEventListener('mousedown', (e) => {
    e.preventDefault()
    e.stopPropagation()
    console.log('[Button] Accept mousedown for hunk:', hunkId)
  })
  acceptBtn.addEventListener('click', (e) => {
    e.preventDefault()
    e.stopPropagation()
    console.log('[Button] Accept clicked for hunk:', hunkId)
    onAccept(hunkId)
  }, true)

  // Reject button
  const rejectBtn = document.createElement('button')
  rejectBtn.textContent = 'Reject'
  rejectBtn.className = 'inline-diff-reject-btn'
  rejectBtn.style.cssText = `
    padding: 4px 12px;
    font-size: 12px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    color: white;
    background: #dc2626;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
    box-shadow: 0 1px 3px rgba(0,0,0,0.3);
    transition: all 0.15s;
  `
  
  rejectBtn.addEventListener('mouseenter', () => {
    rejectBtn.style.background = '#b91c1c'
    rejectBtn.style.transform = 'scale(1.05)'
  })
  rejectBtn.addEventListener('mouseleave', () => {
    rejectBtn.style.background = '#dc2626'
    rejectBtn.style.transform = 'scale(1)'
  })
  rejectBtn.addEventListener('mousedown', (e) => {
    e.preventDefault()
    e.stopPropagation()
    console.log('[Button] Reject mousedown for hunk:', hunkId)
  })
  rejectBtn.addEventListener('click', (e) => {
    e.preventDefault()
    e.stopPropagation()
    console.log('[Button] Reject clicked for hunk:', hunkId)
    onReject(hunkId)
  }, true)

  domNode.appendChild(acceptBtn)
  domNode.appendChild(rejectBtn)

  // Update position function
  const updatePosition = () => {
    try {
      const layoutInfo = editorInstance.getLayoutInfo()
      const lineTop = editorInstance.getTopForLineNumber(lineNumber)
      const scrollTop = editorInstance.getScrollTop()
      
      // Position the buttons to the right of the line
      const top = lineTop - scrollTop + 2
      const left = layoutInfo.contentWidth - 160
      
      domNode.style.top = `${top}px`
      domNode.style.left = `${left}px`
      
      // Hide if out of view
      const editorHeight = layoutInfo.height
      if (top < 0 || top > editorHeight) {
        domNode.style.display = 'none'
      } else {
        domNode.style.display = 'flex'
      }
    } catch (e) {
      // Line might not exist anymore
      domNode.style.display = 'none'
    }
  }

  // Initial position
  updatePosition()

  return {
    getId: () => `inline-diff-buttons-${hunkId}`,
    getDomNode: () => domNode,
    getPosition: () => {
      updatePosition()
      return null
    },
  }
}

// CSS styles to inject
export function injectInlineDiffStyles() {
  if (typeof document === 'undefined') return

  const styleId = 'inline-diff-styles'
  if (document.getElementById(styleId)) return

  const style = document.createElement('style')
  style.id = styleId
  style.textContent = `
    /* Deleted lines - red background */
    .inline-diff-deleted-line {
      background-color: rgba(220, 38, 38, 0.15) !important;
      border-left: 3px solid #dc2626 !important;
    }
    
    .inline-diff-gutter-deleted {
      background-color: rgba(220, 38, 38, 0.25) !important;
      width: 5px !important;
    }
    
    .inline-diff-gutter-deleted::before {
      content: "−";
      color: #dc2626 !important;
      font-weight: bold;
      font-size: 16px;
      line-height: 1;
    }
    
    /* Added zone - green background */
    .inline-diff-added-zone {
      font-family: 'Menlo', 'Monaco', 'Courier New', monospace !important;
    }
    
    .inline-diff-added-line-wrapper {
      border-bottom: 1px solid rgba(34, 197, 94, 0.1);
    }
    
    .inline-diff-added-line-wrapper:last-child {
      border-bottom: none;
    }
    
    /* Button overlay */
    .inline-diff-button-overlay {
      pointer-events: auto !important;
    }
    
    .inline-diff-button-overlay button {
      pointer-events: auto !important;
    }
    
    .inline-diff-button-overlay button:hover {
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4) !important;
    }
    
    .inline-diff-button-overlay button:active {
      transform: scale(0.98) !important;
    }
  `
  document.head.appendChild(style)
}
