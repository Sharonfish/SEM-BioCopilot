/**
 * Citation Search Panel
 *
 * Sidebar component for searching citation networks from within the IDE.
 * Allows users to search for papers by keywords and open citation network visualization.
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, ExternalLink, TrendingUp, Network, Loader2 } from 'lucide-react'

export function CitationSearch() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  // Quick search presets
  const quickSearches = [
    { label: 'CRISPR Gene Editing', query: 'CRISPR gene editing' },
    { label: 'Cancer Immunotherapy', query: 'cancer immunotherapy' },
    { label: 'Single-Cell Sequencing', query: 'single cell RNA sequencing' },
    { label: 'Machine Learning Biology', query: 'machine learning computational biology' },
    { label: 'Protein Folding', query: 'protein folding AlphaFold' },
  ]

  /**
   * Performs citation search
   */
  const handleSearch = async (query: string) => {
    if (!query || query.trim().length === 0) {
      setError('Please enter a search query')
      return
    }

    setIsSearching(true)
    setError(null)
    setSearchResults([])

    try {
      const response = await fetch('/api/citation/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query.trim(),
          maxResults: 10, // Limit for sidebar preview
          sortBy: 'relevance',
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to search papers')
      }

      if (!data.papers || data.papers.length === 0) {
        setError(`No papers found for "${query}"`)
        return
      }

      setSearchResults(data.papers.slice(0, 10)) // Show top 10 in sidebar
    } catch (err) {
      console.error('[Citation Search] Error:', err)
      const errorMsg = err instanceof Error ? err.message : 'Search failed'
      setError(errorMsg)
    } finally {
      setIsSearching(false)
    }
  }

  /**
   * Opens full citation network view
   */
  const openCitationNetwork = (query: string) => {
    router.push(`/citation-network?q=${encodeURIComponent(query)}`)
  }

  /**
   * Format author names for display
   */
  const formatAuthors = (authors: string[]) => {
    if (!authors || authors.length === 0) return 'Unknown authors'
    if (authors.length === 1) return authors[0]
    return `${authors[0]} et al.`
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Network className="h-4 w-4" />
          Citation Network Search
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Search academic papers and explore citation networks
        </p>
      </div>

      {/* Search Input */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSearch(searchQuery)
          }}
          className="relative"
        >
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search papers..."
            disabled={isSearching}
            className="w-full px-3 py-2 pl-9 text-sm border border-gray-300 dark:border-gray-600 rounded-md
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                     placeholder-gray-400 dark:placeholder-gray-500
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          {isSearching && (
            <Loader2 className="absolute right-3 top-2.5 h-4 w-4 text-blue-500 animate-spin" />
          )}
        </form>

        <button
          type="button"
          onClick={() => openCitationNetwork(searchQuery || 'CRISPR gene editing')}
          className="mt-2 w-full px-3 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700
                   rounded-md transition-colors flex items-center justify-center gap-2"
        >
          <ExternalLink className="h-3 w-3" />
          Open Full Network View
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-4 my-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Quick Search Buttons */}
      {searchResults.length === 0 && !isSearching && (
        <div className="px-4 py-3 flex-1 overflow-y-auto">
          <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Quick Searches
          </h4>
          <div className="space-y-2">
            {quickSearches.map((item) => (
              <button
                key={item.query}
                onClick={() => {
                  setSearchQuery(item.query)
                  handleSearch(item.query)
                }}
                className="w-full px-3 py-2 text-left text-xs rounded-md
                         bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700
                         border border-gray-200 dark:border-gray-700
                         text-gray-700 dark:text-gray-300
                         transition-colors flex items-center gap-2"
              >
                <TrendingUp className="h-3 w-3 text-gray-400" />
                {item.label}
              </button>
            ))}
          </div>

          {/* Info Box */}
          <div className="mt-4 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              💡 <strong>Tip:</strong> Search for papers to build citation networks and discover research connections.
            </p>
          </div>
        </div>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="flex-1 overflow-y-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Results ({searchResults.length})
            </h4>
            <button
              onClick={() => openCitationNetwork(searchQuery)}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              View all
            </button>
          </div>

          <div className="space-y-2">
            {searchResults.map((paper: any, index: number) => (
              <div
                key={paper.id || index}
                className="p-3 rounded-md border border-gray-200 dark:border-gray-700
                         bg-white dark:bg-gray-800 hover:border-blue-400 dark:hover:border-blue-600
                         transition-colors cursor-pointer"
                onClick={() => window.open(paper.url, '_blank')}
              >
                <h5 className="text-xs font-medium text-gray-900 dark:text-gray-100 line-clamp-2 mb-1">
                  {paper.title}
                </h5>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  {formatAuthors(paper.authors)}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                  <span>{paper.year}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {paper.citationCount?.toLocaleString() || 0} citations
                  </span>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => {
              setSearchResults([])
              setSearchQuery('')
            }}
            className="mt-3 w-full px-3 py-2 text-xs text-gray-600 dark:text-gray-400
                     hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
          >
            Clear results
          </button>
        </div>
      )}

      {/* Loading State */}
      {isSearching && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin mx-auto mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Searching papers...</p>
          </div>
        </div>
      )}
    </div>
  )
}
