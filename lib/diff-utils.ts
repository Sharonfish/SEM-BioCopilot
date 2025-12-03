/**
 * Diff calculation utilities for line-by-line code comparison
 */

export interface LineDiff {
  lineNumber: number
  type: 'added' | 'deleted' | 'unchanged'
  content: string
  oldLineNumber?: number
  newLineNumber?: number
}

export interface DiffHunk {
  id: string
  oldStart: number
  oldEnd: number
  newStart: number
  newEnd: number
  deletedLines: LineDiff[]
  addedLines: LineDiff[]
  contextBefore: LineDiff[]
  contextAfter: LineDiff[]
  status: 'pending' | 'accepted' | 'rejected'
}

/**
 * Calculate line-by-line differences between two code strings
 */
export function calculateLineDiff(originalCode: string, newCode: string): DiffHunk[] {
  const originalLines = originalCode.split('\n')
  const newLines = newCode.split('\n')
  
  const hunks: DiffHunk[] = []
  let hunkId = 0
  
  let i = 0
  let j = 0
  
  while (i < originalLines.length || j < newLines.length) {
    // Find unchanged lines (context)
    let contextStart = i
    while (i < originalLines.length && j < newLines.length && originalLines[i] === newLines[j]) {
      i++
      j++
    }
    
    // If we found differences, create a hunk
    if (i < originalLines.length || j < newLines.length) {
      const deletedStart = i
      const addedStart = j
      
      // Collect deleted lines
      const deletedLines: LineDiff[] = []
      while (i < originalLines.length && (j >= newLines.length || originalLines[i] !== newLines[j])) {
        // Look ahead to see if this line appears later in new code
        const foundLater = newLines.slice(j).indexOf(originalLines[i])
        if (foundLater === -1 || foundLater > 5) {
          deletedLines.push({
            lineNumber: i + 1,
            type: 'deleted',
            content: originalLines[i],
            oldLineNumber: i + 1,
          })
          i++
        } else {
          break
        }
      }
      
      // Collect added lines
      const addedLines: LineDiff[] = []
      while (j < newLines.length && (i >= originalLines.length || originalLines[i] !== newLines[j])) {
        // Look ahead to see if this line appears later in original code
        const foundLater = originalLines.slice(i).indexOf(newLines[j])
        if (foundLater === -1 || foundLater > 5) {
          addedLines.push({
            lineNumber: j + 1,
            type: 'added',
            content: newLines[j],
            newLineNumber: j + 1,
          })
          j++
        } else {
          break
        }
      }
      
      // Only create hunk if there are actual changes
      if (deletedLines.length > 0 || addedLines.length > 0) {
        // Get context lines (3 lines before)
        const contextBefore: LineDiff[] = []
        for (let k = Math.max(0, contextStart - 3); k < contextStart; k++) {
          contextBefore.push({
            lineNumber: k + 1,
            type: 'unchanged',
            content: originalLines[k],
            oldLineNumber: k + 1,
          })
        }
        
        // Get context lines (3 lines after)
        const contextAfter: LineDiff[] = []
        const afterStart = Math.min(i, originalLines.length)
        for (let k = afterStart; k < Math.min(afterStart + 3, originalLines.length); k++) {
          contextAfter.push({
            lineNumber: k + 1,
            type: 'unchanged',
            content: originalLines[k],
            oldLineNumber: k + 1,
          })
        }
        
        hunks.push({
          id: `hunk-${hunkId++}`,
          oldStart: deletedStart + 1,
          oldEnd: i,
          newStart: addedStart + 1,
          newEnd: j,
          deletedLines,
          addedLines,
          contextBefore,
          contextAfter,
          status: 'pending',
        })
      }
    }
  }
  
  return hunks
}

/**
 * Apply accepted hunks to original code
 */
export function applyDiffHunks(originalCode: string, hunks: DiffHunk[]): string {
  const originalLines = originalCode.split('\n')
  const acceptedHunks = hunks.filter(h => h.status === 'accepted')
  
  // Sort hunks by position (descending) to apply from bottom to top
  const sortedHunks = [...acceptedHunks].sort((a, b) => b.oldStart - a.oldStart)
  
  let result = [...originalLines]
  
  for (const hunk of sortedHunks) {
    // Remove deleted lines
    const deleteStart = hunk.oldStart - 1
    const deleteCount = hunk.deletedLines.length
    
    // Insert added lines
    const addedContent = hunk.addedLines.map(line => line.content)
    
    result.splice(deleteStart, deleteCount, ...addedContent)
  }
  
  return result.join('\n')
}

/**
 * Get summary of diff changes
 */
export function getDiffSummary(hunks: DiffHunk[]): {
  totalHunks: number
  linesAdded: number
  linesDeleted: number
  pending: number
  accepted: number
  rejected: number
} {
  return {
    totalHunks: hunks.length,
    linesAdded: hunks.reduce((sum, h) => sum + h.addedLines.length, 0),
    linesDeleted: hunks.reduce((sum, h) => sum + h.deletedLines.length, 0),
    pending: hunks.filter(h => h.status === 'pending').length,
    accepted: hunks.filter(h => h.status === 'accepted').length,
    rejected: hunks.filter(h => h.status === 'rejected').length,
  }
}

