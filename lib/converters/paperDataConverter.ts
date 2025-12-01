/**
 * Paper Data Converter
 *
 * Converts various paper data formats to the standard Paper type
 * for use in citation network visualization.
 */

import type { Paper } from '@/src/types/citationNetwork'

/**
 * CSV/Excel column mapping interface
 */
export interface PaperDataMapping {
  titleColumn: string
  authorsColumn: string
  yearColumn: string
  citationCountColumn: string
  urlColumn?: string
  abstractColumn?: string
  sourceColumn?: string
  doiColumn?: string
}

/**
 * Generic paper data row from CSV/Excel
 */
export interface RawPaperData {
  [key: string]: string | number | null | undefined
}

/**
 * Result of conversion process
 */
export interface ConversionResult {
  success: boolean
  papers: Paper[]
  errors: string[]
  warnings: string[]
  stats: {
    totalRows: number
    successfulConversions: number
    failedConversions: number
    skippedRows: number
  }
}

/**
 * Converts raw paper data to Paper[] format
 */
export function convertPaperData(
  rawData: RawPaperData[],
  mapping: PaperDataMapping
): ConversionResult {
  const papers: Paper[] = []
  const errors: string[] = []
  const warnings: string[] = []
  let successCount = 0
  let failCount = 0
  let skippedCount = 0

  for (let i = 0; i < rawData.length; i++) {
    const row = rawData[i]
    const rowNumber = i + 1

    try {
      // Skip empty rows
      if (isEmptyRow(row)) {
        skippedCount++
        continue
      }

      // Extract and validate required fields
      const title = extractString(row, mapping.titleColumn)
      if (!title) {
        errors.push(`Row ${rowNumber}: Missing title`)
        failCount++
        continue
      }

      const year = extractYear(row, mapping.yearColumn)
      if (!year) {
        warnings.push(`Row ${rowNumber}: Invalid or missing year for "${title.substring(0, 50)}..."`)
      }

      const citationCount = extractNumber(row, mapping.citationCountColumn) || 0
      const authors = extractAuthors(row, mapping.authorsColumn)
      const url = mapping.urlColumn ? extractString(row, mapping.urlColumn) : ''
      const abstract = mapping.abstractColumn ? extractString(row, mapping.abstractColumn) : ''
      const source = mapping.sourceColumn ? extractString(row, mapping.sourceColumn) : 'Imported Database'

      // Generate unique ID
      const id = generatePaperId(title, year)

      const paper: Paper = {
        id,
        title: title.trim(),
        authors: authors.length > 0 ? authors : ['Unknown Author'],
        year: year || new Date().getFullYear(),
        citationCount,
        url: url || `https://scholar.google.com/scholar?q=${encodeURIComponent(title)}`,
        abstract: abstract || '',
        source,
      }

      papers.push(paper)
      successCount++
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      errors.push(`Row ${rowNumber}: ${errorMsg}`)
      failCount++
    }
  }

  return {
    success: errors.length === 0 || (successCount > 0 && successCount > failCount),
    papers,
    errors,
    warnings,
    stats: {
      totalRows: rawData.length,
      successfulConversions: successCount,
      failedConversions: failCount,
      skippedRows: skippedCount,
    },
  }
}

/**
 * Auto-detects column mapping from CSV/Excel headers
 */
export function autoDetectMapping(headers: string[]): Partial<PaperDataMapping> {
  const mapping: Partial<PaperDataMapping> = {}

  const lowerHeaders = headers.map((h) => h.toLowerCase().trim())

  // Title detection
  const titlePatterns = ['title', 'paper title', 'article title', 'name']
  mapping.titleColumn = findColumn(headers, lowerHeaders, titlePatterns)

  // Authors detection
  const authorPatterns = ['author', 'authors', 'author name', 'writers', 'researchers']
  mapping.authorsColumn = findColumn(headers, lowerHeaders, authorPatterns)

  // Year detection
  const yearPatterns = ['year', 'publication year', 'date', 'published', 'pub year']
  mapping.yearColumn = findColumn(headers, lowerHeaders, yearPatterns)

  // Citation count detection
  const citationPatterns = [
    'citation',
    'citations',
    'cited by',
    'times cited',
    'citation count',
    'num citations',
  ]
  mapping.citationCountColumn = findColumn(headers, lowerHeaders, citationPatterns)

  // URL detection
  const urlPatterns = ['url', 'link', 'doi', 'web link', 'paper url']
  mapping.urlColumn = findColumn(headers, lowerHeaders, urlPatterns)

  // Abstract detection
  const abstractPatterns = ['abstract', 'summary', 'description']
  mapping.abstractColumn = findColumn(headers, lowerHeaders, abstractPatterns)

  // Source detection
  const sourcePatterns = ['source', 'journal', 'publication', 'venue', 'conference']
  mapping.sourceColumn = findColumn(headers, lowerHeaders, sourcePatterns)

  return mapping
}

/**
 * Validates that a mapping has all required fields
 */
export function validateMapping(mapping: Partial<PaperDataMapping>): {
  valid: boolean
  missingFields: string[]
} {
  const required = ['titleColumn', 'authorsColumn', 'yearColumn', 'citationCountColumn']
  const missingFields: string[] = []

  for (const field of required) {
    if (!mapping[field as keyof PaperDataMapping]) {
      missingFields.push(field.replace('Column', ''))
    }
  }

  return {
    valid: missingFields.length === 0,
    missingFields,
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

function isEmptyRow(row: RawPaperData): boolean {
  return Object.values(row).every((val) => val === null || val === undefined || val === '')
}

function extractString(row: RawPaperData, columnName: string): string {
  const value = row[columnName]
  if (value === null || value === undefined) return ''
  return String(value).trim()
}

function extractNumber(row: RawPaperData, columnName: string): number | null {
  const value = row[columnName]
  if (value === null || value === undefined || value === '') return null

  const num = typeof value === 'number' ? value : parseFloat(String(value).replace(/,/g, ''))
  return isNaN(num) ? null : num
}

function extractYear(row: RawPaperData, columnName: string): number | null {
  const value = row[columnName]
  if (value === null || value === undefined || value === '') return null

  // Handle various year formats
  const str = String(value).trim()

  // Try to extract 4-digit year
  const yearMatch = str.match(/\b(19|20)\d{2}\b/)
  if (yearMatch) {
    const year = parseInt(yearMatch[0])
    if (year >= 1900 && year <= new Date().getFullYear() + 5) {
      return year
    }
  }

  // Try direct number conversion
  const num = parseInt(str)
  if (!isNaN(num) && num >= 1900 && num <= new Date().getFullYear() + 5) {
    return num
  }

  return null
}

function extractAuthors(row: RawPaperData, columnName: string): string[] {
  const value = extractString(row, columnName)
  if (!value) return []

  // Split by common delimiters
  const authors = value
    .split(/[;,&]|and\b/i)
    .map((author) => author.trim())
    .filter((author) => author.length > 0)

  // Limit to reasonable number of authors
  return authors.slice(0, 20)
}

function findColumn(
  originalHeaders: string[],
  lowerHeaders: string[],
  patterns: string[]
): string {
  for (const pattern of patterns) {
    const index = lowerHeaders.findIndex((h) => h.includes(pattern))
    if (index !== -1) {
      return originalHeaders[index]
    }
  }
  return ''
}

function generatePaperId(title: string, year: number | null): string {
  // Create a simple hash-like ID from title and year
  const cleanTitle = title
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 30)

  const yearStr = year ? `${year}` : 'unknown'
  const hash = simpleHash(cleanTitle)

  return `paper-${yearStr}-${hash}`
}

function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36).substring(0, 8)
}

/**
 * Example usage and preset mappings
 */
export const COMMON_MAPPINGS = {
  googleScholar: {
    titleColumn: 'Title',
    authorsColumn: 'Authors',
    yearColumn: 'Year',
    citationCountColumn: 'Cited By',
    urlColumn: 'URL',
    abstractColumn: 'Abstract',
    sourceColumn: 'Source',
  } as PaperDataMapping,

  pubmed: {
    titleColumn: 'Title',
    authorsColumn: 'Authors',
    yearColumn: 'Publication Year',
    citationCountColumn: 'Times Cited',
    urlColumn: 'PMID',
    abstractColumn: 'Abstract',
    sourceColumn: 'Journal',
  } as PaperDataMapping,

  scopus: {
    titleColumn: 'Title',
    authorsColumn: 'Authors',
    yearColumn: 'Year',
    citationCountColumn: 'Cited by',
    urlColumn: 'Link',
    abstractColumn: 'Abstract',
    sourceColumn: 'Source title',
  } as PaperDataMapping,
}
