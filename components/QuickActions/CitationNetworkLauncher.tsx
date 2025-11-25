/**
 * Citation Network Quick Launch Component
 * 
 * Floating launcher button for quick access to Citation Network feature
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function CitationNetworkLauncher() {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const quickSearches = [
    { label: 'CRISPR Gene Editing', query: 'CRISPR gene editing' },
    { label: 'Cancer Immunotherapy', query: 'cancer immunotherapy' },
    { label: 'Single-Cell Sequencing', query: 'single cell RNA sequencing' },
    { label: 'Machine Learning Biology', query: 'machine learning computational biology' },
  ]

  if (!isOpen) {
    return (
      <button
        className="floating-launcher"
        onClick={() => setIsOpen(true)}
        title="Quick Launch Citation Network"
        aria-label="Quick Launch Citation Network"
      >
        🔗
      </button>
    )
  }

  return (
    <div className="launcher-panel">
      <div className="launcher-header">
        <h3>Citation Network</h3>
        <button onClick={() => setIsOpen(false)} aria-label="Close">×</button>
      </div>

      <div className="launcher-content">
        <p>Quick start with popular topics:</p>
        <div className="quick-searches">
          {quickSearches.map(({ label, query }) => (
            <button
              key={query}
              className="quick-search-btn"
              onClick={() => {
                router.push(`/citation-network?q=${encodeURIComponent(query)}`)
                setIsOpen(false)
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <button
          className="custom-search-btn"
          onClick={() => {
            router.push('/citation-network')
            setIsOpen(false)
          }}
        >
          Custom Search →
        </button>
      </div>
    </div>
  )
}

