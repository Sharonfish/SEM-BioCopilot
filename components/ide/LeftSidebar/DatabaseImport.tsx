/**
 * Database Import Component - 数据导入侧边栏组件
 */

'use client'

import { useState } from 'react'
import { Database, FileText, X, ChevronDown, ChevronRight, AlertCircle } from 'lucide-react'
import { FileUpload, FileType } from '@/components/ui/FileUpload'
import { useDataStore, ParsedData } from '@/store/dataStore'
import { parseCSV, parseJSON, parseExcel, analyzeColumns } from '@/lib/fileParser'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'

export function DatabaseImport() {
  const { uploadedFiles, currentFile, addFile, removeFile, setCurrentFile, loading, setLoading, setError } = useDataStore()
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set())
  const [previewExpanded, setPreviewExpanded] = useState(false)

  const handleFileSelect = async (file: File) => {
    setLoading(true)
    setError(null)

    try {
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
      let fileType: 'csv' | 'tsv' | 'excel' | 'json'
      let headers: string[]
      let rows: any[][]

      // Determine file type and parse
      if (fileExtension === '.csv') {
        fileType = 'csv'
        const result = await parseCSV(file, ',')
        headers = result.headers
        rows = result.rows
      } else if (fileExtension === '.tsv') {
        fileType = 'tsv'
        const result = await parseCSV(file, '\t')
        headers = result.headers
        rows = result.rows
      } else if (fileExtension === '.xlsx' || fileExtension === '.xls') {
        fileType = 'excel'
        const result = await parseExcel(file)
        headers = result.headers
        rows = result.rows
      } else if (fileExtension === '.json') {
        fileType = 'json'
        const result = await parseJSON(file)
        headers = result.headers
        rows = result.rows
      } else {
        throw new Error('Unsupported file type')
      }

      // Analyze columns
      const columns = analyzeColumns(headers, rows)

      // Get preview (first 10 rows)
      const previewRows = rows.slice(0, 10)

      // Create parsed data object
      const parsedData: ParsedData = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        fileName: file.name,
        fileType,
        columns,
        rows,
        totalRows: rows.length,
        previewRows,
        uploadedAt: new Date(),
        fileSize: file.size,
      }

      addFile(parsedData)
      setExpandedFiles(prev => new Set([...prev, parsedData.id]))
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to parse file'
      setError(errorMessage)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const toggleFileExpanded = (fileId: string) => {
    setExpandedFiles(prev => {
      const next = new Set(prev)
      if (next.has(fileId)) {
        next.delete(fileId)
      } else {
        next.add(fileId)
      }
      return next
    })
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'number': return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
      case 'boolean': return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
      case 'date': return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-blue-600" />
          <h2 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
            Database Import
          </h2>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Upload and preview data files
        </p>
      </div>

      {/* File Upload */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <FileUpload
          acceptedTypes={['csv', 'tsv', 'excel', 'json']}
          maxSize={50}
          onFileSelect={handleFileSelect}
          disabled={loading}
        />
      </div>

      {/* Uploaded Files List */}
      <div className="flex-1 overflow-y-auto">
        {uploadedFiles.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No files uploaded yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {uploadedFiles.map((file) => {
              const isExpanded = expandedFiles.has(file.id)
              const isCurrent = currentFile?.id === file.id

              return (
                <div
                  key={file.id}
                  className={cn(
                    'transition-colors',
                    isCurrent && 'bg-blue-50 dark:bg-blue-900/20'
                  )}
                >
                  {/* File Header */}
                  <div
                    className="p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                    onClick={() => {
                      toggleFileExpanded(file.id)
                      setCurrentFile(file.id)
                    }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        )}
                        <FileText className="h-4 w-4 text-gray-500 flex-shrink-0" />
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {file.fileName}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {file.fileType.toUpperCase()}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeFile(file.id)
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="mt-1 ml-6 text-xs text-gray-500">
                      {file.totalRows.toLocaleString()} rows × {file.columns.length} columns · {formatFileSize(file.fileSize)}
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="px-3 pb-3 space-y-3">
                      {/* Columns Info */}
                      <div>
                        <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Columns ({file.columns.length})
                        </h4>
                        <div className="space-y-1 max-h-40 overflow-y-auto">
                          {file.columns.map((col, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs"
                            >
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                                  {col.name}
                                </div>
                                <div className="text-gray-500 text-xs mt-0.5">
                                  {col.uniqueCount} unique · {col.nullCount} null
                                </div>
                              </div>
                              <Badge className={cn('text-xs', getTypeColor(col.type))}>
                                {col.type}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Preview Table */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                            Preview (first 10 rows)
                          </h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs"
                            onClick={() => setPreviewExpanded(!previewExpanded)}
                          >
                            {previewExpanded ? 'Collapse' : 'Expand'}
                          </Button>
                        </div>
                        <div className={cn(
                          'overflow-auto border border-gray-200 dark:border-gray-700 rounded',
                          previewExpanded ? 'max-h-96' : 'max-h-48'
                        )}>
                          <table className="w-full text-xs">
                            <thead className="bg-gray-100 dark:bg-gray-800 sticky top-0">
                              <tr>
                                {file.columns.map((col, idx) => (
                                  <th
                                    key={idx}
                                    className="px-2 py-1 text-left font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700 last:border-r-0"
                                  >
                                    {col.name}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {file.previewRows.map((row, rowIdx) => (
                                <tr
                                  key={rowIdx}
                                  className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                                >
                                  {row.map((cell, cellIdx) => (
                                    <td
                                      key={cellIdx}
                                      className="px-2 py-1 text-gray-600 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700 last:border-r-0 max-w-[150px] truncate"
                                      title={String(cell ?? 'null')}
                                    >
                                      {cell === null || cell === undefined ? (
                                        <span className="text-gray-400 italic">null</span>
                                      ) : (
                                        String(cell)
                                      )}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        {file.totalRows > 10 && (
                          <p className="mt-1 text-xs text-gray-500 text-center">
                            Showing 10 of {file.totalRows.toLocaleString()} rows
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

