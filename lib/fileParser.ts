/**
 * File Parser Utilities - 解析各种格式的数据文件
 */

import { ColumnType, ColumnInfo } from '@/store/dataStore'

/**
 * Detect column type from sample values
 */
export function detectColumnType(values: any[]): ColumnType {
  if (values.length === 0) return 'string'

  const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== '')
  if (nonNullValues.length === 0) return 'string'

  let numberCount = 0
  let booleanCount = 0
  let dateCount = 0

  for (const value of nonNullValues) {
    // Check for boolean
    if (typeof value === 'boolean' || 
        (typeof value === 'string' && /^(true|false|yes|no|1|0)$/i.test(value.trim()))) {
      booleanCount++
    }
    // Check for number
    else if (typeof value === 'number' || !isNaN(Number(value)) && value !== '') {
      numberCount++
    }
    // Check for date
    else if (typeof value === 'string' && !isNaN(Date.parse(value))) {
      dateCount++
    }
  }

  const threshold = nonNullValues.length * 0.8 // 80% threshold

  if (booleanCount >= threshold) return 'boolean'
  if (numberCount >= threshold) return 'number'
  if (dateCount >= threshold) return 'date'
  
  return 'string'
}

/**
 * Parse CSV/TSV file
 */
export async function parseCSV(file: File, delimiter: string = ','): Promise<{ headers: string[], rows: any[][] }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const lines = text.split(/\r?\n/).filter(line => line.trim())
        
        if (lines.length === 0) {
          reject(new Error('File is empty'))
          return
        }

        // Parse headers
        const headers = lines[0].split(delimiter).map(h => h.trim().replace(/^["']|["']$/g, ''))
        
        // Parse rows
        const rows: any[][] = []
        for (let i = 1; i < lines.length; i++) {
          // Simple CSV parsing (handles quoted values)
          const row: any[] = []
          let current = ''
          let inQuotes = false
          
          for (let j = 0; j < lines[i].length; j++) {
            const char = lines[i][j]
            
            if (char === '"' || char === "'") {
              inQuotes = !inQuotes
            } else if (char === delimiter && !inQuotes) {
              row.push(current.trim())
              current = ''
            } else {
              current += char
            }
          }
          row.push(current.trim()) // Add last column
          
          // Pad row if needed
          while (row.length < headers.length) {
            row.push(null)
          }
          
          rows.push(row.slice(0, headers.length))
        }
        
        resolve({ headers, rows })
      } catch (error) {
        reject(error)
      }
    }
    
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}

/**
 * Parse JSON file
 */
export async function parseJSON(file: File): Promise<{ headers: string[], rows: any[][] }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const data = JSON.parse(text)
        
        // Handle array of objects
        if (Array.isArray(data)) {
          if (data.length === 0) {
            reject(new Error('JSON array is empty'))
            return
          }
          
          const headers = Object.keys(data[0])
          const rows = data.map(obj => headers.map(key => obj[key] ?? null))
          
          resolve({ headers, rows })
        }
        // Handle object with array property
        else if (typeof data === 'object' && data !== null) {
          const keys = Object.keys(data)
          const arrayKey = keys.find(key => Array.isArray(data[key]))
          
          if (!arrayKey) {
            reject(new Error('JSON must contain an array'))
            return
          }
          
          const array = data[arrayKey]
          if (array.length === 0) {
            reject(new Error('JSON array is empty'))
            return
          }
          
          const headers = Object.keys(array[0])
          const rows = array.map((obj: any) => headers.map(key => obj[key] ?? null))
          
          resolve({ headers, rows })
        } else {
          reject(new Error('Invalid JSON format'))
        }
      } catch (error) {
        reject(error instanceof Error ? error : new Error('Failed to parse JSON'))
      }
    }
    
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}

/**
 * Parse Excel file (requires xlsx library)
 */
export async function parseExcel(file: File): Promise<{ headers: string[], rows: any[][] }> {
  // Dynamic import to avoid bundling xlsx if not needed
  const XLSX = await import('xlsx')
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result as ArrayBuffer
        const workbook = XLSX.read(data, { type: 'array' })
        
        // Get first sheet
        const sheetName = workbook.SheetNames[0]
        if (!sheetName) {
          reject(new Error('Excel file has no sheets'))
          return
        }
        
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null })
        
        if (jsonData.length === 0) {
          reject(new Error('Excel sheet is empty'))
          return
        }
        
        // First row as headers
        const headers = (jsonData[0] as any[]).map((h: any) => String(h ?? ''))
        const rows = jsonData.slice(1) as any[][]
        
        resolve({ headers, rows })
      } catch (error) {
        reject(error instanceof Error ? error : new Error('Failed to parse Excel file'))
      }
    }
    
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsArrayBuffer(file)
  })
}

/**
 * Analyze columns and detect types
 */
export function analyzeColumns(headers: string[], rows: any[][]): ColumnInfo[] {
  return headers.map((header, colIndex) => {
    const columnValues = rows.map(row => row[colIndex])
    const nonNullValues = columnValues.filter(v => v !== null && v !== undefined && v !== '')
    const uniqueValues = new Set(nonNullValues.map(v => String(v)))
    
    // Get sample values (first 5 non-null values)
    const sampleValues = nonNullValues.slice(0, 5)
    
    return {
      name: header || `Column ${colIndex + 1}`,
      type: detectColumnType(columnValues),
      sampleValues,
      nullCount: columnValues.length - nonNullValues.length,
      uniqueCount: uniqueValues.size,
    }
  })
}

