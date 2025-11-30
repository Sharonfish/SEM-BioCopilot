/**
 * File Upload Component - 支持拖拽上传的文件上传组件
 */

'use client'

import { useCallback, useState, useRef, DragEvent } from 'react'
import { Upload, File, X, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from './Button'
import { cn } from '@/lib/utils'

export type FileType = 'csv' | 'tsv' | 'excel' | 'json'

export interface FileUploadProps {
  acceptedTypes?: FileType[]
  maxSize?: number // in MB
  onFileSelect: (file: File) => Promise<void>
  disabled?: boolean
  className?: string
}

const FILE_TYPE_MAP: Record<FileType, { extensions: string[], mimeTypes: string[] }> = {
  csv: {
    extensions: ['.csv'],
    mimeTypes: ['text/csv', 'application/csv'],
  },
  tsv: {
    extensions: ['.tsv'],
    mimeTypes: ['text/tab-separated-values', 'text/tsv'],
  },
  excel: {
    extensions: ['.xlsx', '.xls'],
    mimeTypes: [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ],
  },
  json: {
    extensions: ['.json'],
    mimeTypes: ['application/json', 'text/json'],
  },
}

export function FileUpload({
  acceptedTypes = ['csv', 'tsv', 'excel', 'json'],
  maxSize = 50, // 50MB default
  onFileSelect,
  disabled = false,
  className,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Get accepted extensions and MIME types
  const acceptedExtensions = acceptedTypes.flatMap(type => FILE_TYPE_MAP[type].extensions)
  const acceptedMimeTypes = acceptedTypes.flatMap(type => FILE_TYPE_MAP[type].mimeTypes)

  const validateFile = (file: File): string | null => {
    // Check file size
    const fileSizeMB = file.size / (1024 * 1024)
    if (fileSizeMB > maxSize) {
      return `File size exceeds ${maxSize}MB limit`
    }

    // Check file extension
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!acceptedExtensions.includes(fileExtension)) {
      return `File type not supported. Accepted types: ${acceptedTypes.join(', ').toUpperCase()}`
    }

    // Check MIME type (optional, as some browsers may not report it correctly)
    if (file.type && !acceptedMimeTypes.includes(file.type)) {
      // Don't fail on MIME type mismatch if extension is valid
      console.warn(`MIME type mismatch: ${file.type}`)
    }

    return null
  }

  const handleFile = useCallback(async (file: File) => {
    setError(null)
    setSuccess(false)

    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    setUploading(true)
    try {
      await onFileSelect(file)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process file')
    } finally {
      setUploading(false)
    }
  }, [onFileSelect, maxSize, acceptedTypes])

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) {
      setIsDragging(true)
    }
  }, [disabled])

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (disabled) return

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFile(files[0])
    }
  }, [handleFile, disabled])

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFile(files[0])
    }
    // Reset input to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [handleFile])

  const handleClick = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }, [disabled])

  return (
    <div className={cn('w-full', className)}>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={cn(
          'relative border-2 border-dashed rounded-lg p-8 transition-all cursor-pointer',
          'hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/10',
          isDragging && 'border-blue-500 bg-blue-50 dark:bg-blue-900/20',
          disabled && 'opacity-50 cursor-not-allowed',
          error && 'border-red-300 bg-red-50 dark:bg-red-900/10',
          success && 'border-green-300 bg-green-50 dark:bg-green-900/10'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedExtensions.join(',')}
          onChange={handleFileInputChange}
          disabled={disabled || uploading}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center gap-4 text-center">
          {uploading ? (
            <>
              <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Processing file...
              </div>
            </>
          ) : success ? (
            <>
              <CheckCircle2 className="h-12 w-12 text-green-500" />
              <div className="text-sm font-medium text-green-700 dark:text-green-300">
                File uploaded successfully!
              </div>
            </>
          ) : (
            <>
              <Upload className="h-12 w-12 text-gray-400" />
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {isDragging ? 'Drop file here' : 'Drag and drop file here'}
                </div>
                <div className="text-xs text-gray-500">
                  or click to browse
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  Supported: {acceptedTypes.join(', ').toUpperCase()} (max {maxSize}MB)
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-3 flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto h-6 w-6"
            onClick={() => setError(null)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  )
}

