/**
 * Citation Network Search API
 *
 * Server-side API route for citation network search using Semantic Scholar API.
 * This keeps the API key secure on the server side and enforces rate limiting.
 */

import { NextRequest, NextResponse } from 'next/server'
import { searchPapers } from '@/src/services/semanticScholarApi'
import type { Paper } from '@/src/types/citationNetwork'

export const dynamic = 'force-dynamic'

interface SearchRequest {
  query: string
  maxResults?: number
  sortBy?: 'relevance' | 'citationCount' | 'publicationDate'
  yearFrom?: number
  yearTo?: number
  venue?: string
  fieldsOfStudy?: string[]
}

interface SearchResponse {
  success: boolean
  papers?: Paper[]
  error?: string
  query?: string
  count?: number
}

export async function POST(request: NextRequest): Promise<NextResponse<SearchResponse>> {
  const startTime = Date.now()

  try {
    const body: SearchRequest = await request.json()
    const { query, maxResults = 20, sortBy = 'relevance', yearFrom, yearTo, venue, fieldsOfStudy } = body

    // Validate input
    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Search query cannot be empty',
        },
        { status: 400 }
      )
    }

    if (query.length > 500) {
      return NextResponse.json(
        {
          success: false,
          error: 'Search query is too long (max 500 characters)',
        },
        { status: 400 }
      )
    }

    console.log(`[Citation Search] Query: "${query}", Max Results: ${maxResults}`)

    // Call Semantic Scholar API service
    const papers = await searchPapers(query, {
      maxResults,
      sortBy,
      yearFrom,
      yearTo,
      venue,
      fieldsOfStudy,
    })

    const executionTime = ((Date.now() - startTime) / 1000).toFixed(2)
    console.log(`[Citation Search] Found ${papers.length} papers in ${executionTime}s`)

    return NextResponse.json({
      success: true,
      papers,
      query,
      count: papers.length,
    })
  } catch (error) {
    console.error('[Citation Search] Error:', error)

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'

    // Handle specific error types
    let statusCode = 500
    let userMessage = errorMessage

    if (errorMessage.includes('API key')) {
      statusCode = 500
      userMessage = 'Citation search is not configured. Please add SEMANTIC_SCHOLAR_API_KEY to .env.local'
    } else if (errorMessage.includes('rate limit')) {
      statusCode = 429
      userMessage = 'API rate limit exceeded (max 1 req/sec). Please try again in a moment.'
    } else if (errorMessage.includes('timeout')) {
      statusCode = 408
      userMessage = 'Search request timed out. Please try again with a more specific query.'
    } else if (errorMessage.includes('Network error')) {
      statusCode = 503
      userMessage = 'Unable to connect to Semantic Scholar. Please check your internet connection.'
    }

    return NextResponse.json(
      {
        success: false,
        error: userMessage,
      },
      { status: statusCode }
    )
  }
}

/**
 * GET endpoint for health check
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Check if Semantic Scholar API key is configured
    const apiKey = process.env.SEMANTIC_SCHOLAR_API_KEY || process.env.NEXT_PUBLIC_SEMANTIC_SCHOLAR_API_KEY

    return NextResponse.json({
      status: 'ok',
      service: 'Citation Search API (Semantic Scholar)',
      configured: !!apiKey,
      rateLimit: '1 request per second',
      message: apiKey
        ? 'Citation search is ready'
        : 'Please configure SEMANTIC_SCHOLAR_API_KEY in .env.local',
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        service: 'Citation Search API (Semantic Scholar)',
        configured: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
