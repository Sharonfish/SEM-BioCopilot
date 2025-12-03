/**
 * Citation Network Page (Enhanced with Semantic Scholar API)
 *
 * Full-page citation network visualization with real-time paper search.
 * Three-column layout: Papers List | Graph Visualization | Paper Details
 *
 * Features:
 * - Real-time search using Semantic Scholar Academic Graph API
 * - Automatic network graph generation from search results
 * - Influential citation tracking
 * - TL;DR summaries
 * - Advanced filtering (year range, venue, citations)
 * - Paper recommendations
 * - Mock data fallback for testing
 *
 * Navigate to: http://localhost:3000/citation-network
 */

'use client';

import React, { useState, useCallback, Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CitationNetworkGraph } from '@/components/CitationNetwork/CitationNetworkGraph';
import { cancerMockData } from '@/data/mockCancerCellData';
import { buildCitationNetwork, filterNetworkByYearRange } from '@/lib/graph/networkBuilder';
import type { Paper, NetworkGraph } from '@/types/citationNetwork';
import '@/styles/citationNetwork.css';

function CitationNetworkPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams?.get('q') || '';

  // State for search and data
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [searchInput, setSearchInput] = useState(initialQuery);
  const [papers, setPapers] = useState<Paper[]>(cancerMockData.papers);
  const [graph, setGraph] = useState<NetworkGraph>(cancerMockData.hallmarksGraph);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [useRealData, setUseRealData] = useState(false);

  // State for UI
  const [selectedPaperId, setSelectedPaperId] = useState<string | null>(null);
  const [hoveredPaperId, setHoveredPaperId] = useState<string | null>(null);
  const [showPriorWorks, setShowPriorWorks] = useState(true);
  const [showDerivativeWorks, setShowDerivativeWorks] = useState(true);
  const [yearRange, setYearRange] = useState<[number, number]>([1970, 2025]);

  // Perform search on mount if initial query exists
  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      performSearch(initialQuery);
    }
  }, [initialQuery]);

  /**
   * Performs real-time citation search
   */
  const performSearch = async (query: string) => {
    if (!query || query.trim().length === 0) {
      setSearchError('Please enter a search query');
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    setSearchQuery(query);

    try {
      const response = await fetch('/api/citation/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query.trim(),
          maxResults: 30,
          sortBy: 'relevance',
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to search papers');
      }

      if (!data.papers || data.papers.length === 0) {
        setSearchError(`No papers found for "${query}". Try a different search term.`);
        setIsSearching(false);
        return;
      }

      // Update papers and build network graph
      const searchedPapers = data.papers as Paper[];
      setPapers(searchedPapers);
      setUseRealData(true);

      // Build citation network with first paper as origin
      const originPaper = searchedPapers[0];
      const networkResult = buildCitationNetwork(searchedPapers, originPaper.id, {
        maxNodes: 50,
        minCitations: 0,
        includeCoCitations: false,
      });

      setGraph(networkResult.graph);

      console.log(`[Citation Network] Loaded ${searchedPapers.length} papers from search`);
      console.log(`[Citation Network] Built graph with ${networkResult.graph.nodes.length} nodes`);
    } catch (error) {
      console.error('[Citation Network] Search error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setSearchError(errorMessage);
    } finally {
      setIsSearching(false);
    }
  };

  /**
   * Handles search form submission
   */
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchInput);
  };

  /**
   * Switches back to mock data
   */
  const handleUseMockData = () => {
    setUseRealData(false);
    setPapers(cancerMockData.papers);
    setGraph(cancerMockData.hallmarksGraph);
    setSearchError(null);
    setSearchQuery('');
    setSearchInput('');
  };

  const handleBackClick = () => {
    router.back();
  };

  const handleSetOrigin = () => {
    if (selectedPaperId && papers.length > 0) {
      // Rebuild graph with selected paper as origin
      const networkResult = buildCitationNetwork(papers, selectedPaperId, {
        maxNodes: 50,
        minCitations: 0,
      });
      setGraph(networkResult.graph);
      console.log(`[Citation Network] Set new origin: ${selectedPaperId}`);
    }
  };

  const handleExpandNetwork = () => {
    if (selectedPaperId) {
      // Would expand node to show more citations
      // For now, just log
      console.log('Expanding network for:', selectedPaperId);
      // In real implementation: fetch more papers related to this one
    }
  };

  const handleNodeClick = useCallback((paperId: string) => {
    setSelectedPaperId(paperId);
  }, []);

  const handleNodeHover = useCallback((paperId: string | null) => {
    setHoveredPaperId(paperId);
  }, []);

  // Filter papers based on year range and search query
  const filteredPapers = papers.filter((paper) => {
    if (paper.year < yearRange[0] || paper.year > yearRange[1]) return false;
    return true;
  });

  // Update graph when year range changes
  useEffect(() => {
    if (papers.length > 0 && graph.nodes.length > 0) {
      const filteredGraph = filterNetworkByYearRange(graph, papers, yearRange);
      setGraph(filteredGraph);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [yearRange]);

  const selectedPaper = selectedPaperId
    ? papers.find((p) => p.id === selectedPaperId) || null
    : null;

  const formatAuthors = (authors: string[]) => {
    if (authors.length === 0) return 'Unknown authors';
    if (authors.length === 1) return authors[0];
    if (authors.length === 2) return `${authors[0]} and ${authors[1]}`;
    return `${authors[0]}, ${authors[1]}, et al.`;
  };

  const getDirectCitations = (paperId: string) => {
    return graph.edges.filter((e) => e.source === paperId).length;
  };

  const getCitedBy = (paperId: string) => {
    return graph.edges.filter((e) => e.target === paperId).length;
  };

  const getCoCitations = (paperId: string) => {
    const thisPaperCites = graph.edges
      .filter((e) => e.source === paperId)
      .map((e) => e.target);
    return graph.edges.filter(
      (e) => e.source !== paperId && thisPaperCites.includes(e.target)
    ).length;
  };

  return (
    <div className="citation-network-page">
      {/* Loading Overlay */}
      {isSearching && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '20px'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            border: '6px solid #E3F2FD',
            borderTop: '6px solid #2196F3',
            animation: 'spin 1s linear infinite'
          }}></div>
          <div style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#1976D2',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span>Searching Semantic Scholar...</span>
          </div>
          <div style={{
            fontSize: '14px',
            color: '#666',
            maxWidth: '400px',
            textAlign: 'center'
          }}>
            Finding relevant papers for &quot;{searchInput}&quot;
          </div>
        </div>
      )}

      {/* Top Header */}
      <header className="citation-network-header">
        <div className="header-left">
          <button className="back-button" onClick={handleBackClick}>
            ← Back to IDE
          </button>
          <h1>Citation Network Visualization</h1>
          <span className="subtitle">文献关系网络分析</span>
        </div>
        <div className="header-right">
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', alignItems: 'center', position: 'relative' }}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <input
                type="search"
                placeholder="Search papers (e.g., CRISPR gene editing)..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="search-input"
                disabled={isSearching}
                style={{
                  width: '350px',
                  opacity: isSearching ? 0.7 : 1,
                  borderColor: isSearching ? '#2196F3' : undefined,
                  borderWidth: isSearching ? '2px' : undefined,
                  boxShadow: isSearching ? '0 0 0 3px rgba(33, 150, 243, 0.1)' : undefined,
                  transition: 'all 0.3s ease',
                  paddingRight: isSearching ? '140px' : undefined
                }}
              />
              {isSearching && (
                <div style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#2196F3',
                  fontSize: '13px',
                  fontWeight: '600',
                  pointerEvents: 'none'
                }}>
                  <span className="spinner" style={{
                    display: 'inline-block',
                    fontSize: '18px'
                  }}>⟳</span>
                  <span>Searching...</span>
                </div>
              )}
            </div>
            <button
              type="submit"
              className="primary-button"
              disabled={isSearching || !searchInput.trim()}
              style={{
                whiteSpace: 'nowrap',
                background: isSearching ? '#1976D2' : undefined,
                transform: isSearching ? 'scale(0.95)' : 'scale(1)',
                transition: 'all 0.3s ease',
                boxShadow: isSearching ? '0 0 0 3px rgba(33, 150, 243, 0.2)' : undefined
              }}
            >
              {isSearching ? (
                <>
                  <span className="spinner" style={{ marginRight: '6px' }}>⟳</span>
                  Searching...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '4px' }}>
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                  Search
                </>
              )}
            </button>
          </form>
          {useRealData && (
            <button
              className="secondary-button"
              onClick={handleUseMockData}
              title="Switch back to demo data"
            >
              Use Demo Data
            </button>
          )}
        </div>
      </header>

      {/* Search Status / Error Banner */}
      {searchError && (
        <div className="search-status error">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          <span>{searchError}</span>
          <button onClick={() => setSearchError(null)}>×</button>
        </div>
      )}

      {useRealData && !searchError && (
        <div className="search-status success">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M9 12l2 2 4-4" />
          </svg>
          <span>Showing results for: <strong>&quot;{searchQuery}&quot;</strong> ({papers.length} papers found)</span>
        </div>
      )}

      {/* Main Three-Column Layout */}
      <div className="citation-network-content">
        {/* Left Sidebar - Papers List */}
        <aside className="papers-sidebar">
          <div className="sidebar-header">
            <h3>Papers</h3>
            <span className="count-badge">{filteredPapers.length}</span>
          </div>

          <div className="filters">
            <div className="filter-group">
              <label>
                Year Range: {yearRange[0]} - {yearRange[1]}
              </label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="range"
                  min="1970"
                  max="2025"
                  value={yearRange[0]}
                  onChange={(e) => setYearRange([parseInt(e.target.value), yearRange[1]])}
                  className="range-slider"
                  style={{ flex: 1 }}
                />
                <input
                  type="range"
                  min="1970"
                  max="2025"
                  value={yearRange[1]}
                  onChange={(e) => setYearRange([yearRange[0], parseInt(e.target.value)])}
                  className="range-slider"
                  style={{ flex: 1 }}
                />
              </div>
            </div>
          </div>

          <div className="papers-list">
            {filteredPapers.length === 0 ? (
              <div className="empty-state" style={{ padding: '20px', textAlign: 'center' }}>
                <p style={{ color: '#999' }}>No papers in this year range</p>
              </div>
            ) : (
              filteredPapers
                .sort((a, b) => b.citationCount - a.citationCount)
                .map((paper) => (
                  <div
                    key={paper.id}
                    className={`paper-card ${paper.id === graph.originPaperId ? 'origin' : ''} ${
                      paper.id === selectedPaperId ? 'selected' : ''
                    }`}
                    onClick={() => setSelectedPaperId(paper.id)}
                  >
                    <div className="paper-card-title">{paper.title}</div>
                    <div className="paper-card-authors">{formatAuthors(paper.authors)}</div>
                    <div className="paper-card-meta">
                      <span>{paper.year}</span>
                      <span>•</span>
                      <span>{paper.citationCount.toLocaleString()} citations</span>
                    </div>
                  </div>
                ))
            )}
          </div>
        </aside>

        {/* Center - Graph Visualization */}
        <main className="graph-container">
          <div className="graph-toolbar">
            <div className="toolbar-section">
              <div className="graph-info">
                <span className="info-item">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                  {graph.nodes.length} Papers
                </span>
                <span className="info-item">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                  {graph.edges.length} Citations
                </span>
              </div>
            </div>

            <div className="toolbar-section">
              <button
                className={`toggle-button ${showPriorWorks ? 'active' : ''}`}
                onClick={() => setShowPriorWorks(!showPriorWorks)}
                style={{ borderColor: '#2196F3' }}
              >
                <span
                  className="toggle-dot"
                  style={{ background: showPriorWorks ? '#2196F3' : '#ccc' }}
                />
                Prior Works
              </button>
              <button
                className={`toggle-button ${showDerivativeWorks ? 'active' : ''}`}
                onClick={() => setShowDerivativeWorks(!showDerivativeWorks)}
                style={{ borderColor: '#4CAF50' }}
              >
                <span
                  className="toggle-dot"
                  style={{ background: showDerivativeWorks ? '#4CAF50' : '#ccc' }}
                />
                Derivative
              </button>
            </div>
          </div>

          <div className="graph-visualization">
            {graph.nodes.length > 0 ? (
              <CitationNetworkGraph
                graph={graph}
                onNodeClick={handleNodeClick}
                onNodeHover={handleNodeHover}
              />
            ) : (
              <div
                className="empty-state"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  color: '#999',
                }}
              >
                <svg
                  width="64"
                  height="64"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#CCC"
                  strokeWidth="1"
                >
                  <circle cx="12" cy="12" r="10" />
                </svg>
                <p style={{ marginTop: '16px' }}>No papers to display</p>
                <p style={{ fontSize: '14px' }}>Try searching for papers or adjusting filters</p>
              </div>
            )}
          </div>
        </main>

        {/* Right Panel - Paper Details */}
        <aside className="details-panel">
          {selectedPaper ? (
            <>
              <div className="panel-header">
                <h3>Paper Details</h3>
                <button className="close-button" onClick={() => setSelectedPaperId(null)}>
                  ✕
                </button>
              </div>

              <div className="paper-details">
                <div className="detail-section">
                  <div className="paper-title">{selectedPaper.title}</div>
                  <div className="paper-authors">{formatAuthors(selectedPaper.authors)}</div>
                  <div className="paper-meta">
                    <span className="meta-item">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      {selectedPaper.year}
                    </span>
                    <span className="meta-item">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                      </svg>
                      {selectedPaper.source}
                    </span>
                    <span className="meta-item">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                      {selectedPaper.citationCount.toLocaleString()} citations
                    </span>
                  </div>
                </div>

                {/* TL;DR Summary (New from Semantic Scholar) */}
                {selectedPaper.tldr && (
                  <div className="detail-section tldr-section">
                    <h4>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        style={{ marginRight: '6px', verticalAlign: 'middle' }}
                      >
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                      TL;DR Summary
                    </h4>
                    <p className="tldr-text" style={{
                      padding: '12px',
                      background: '#f0f9ff',
                      borderLeft: '3px solid #2196F3',
                      borderRadius: '4px',
                      fontSize: '14px',
                      lineHeight: '1.6',
                      color: '#0277bd',
                      fontStyle: 'italic'
                    }}>
                      {selectedPaper.tldr}
                    </p>
                  </div>
                )}

                <div className="detail-section">
                  <h4>Abstract</h4>
                  <p className="abstract-text">
                    {selectedPaper.abstract || 'No abstract available'}
                  </p>
                </div>

                {/* Venue Information (New from Semantic Scholar) */}
                {selectedPaper.venue && (
                  <div className="detail-section" style={{ paddingTop: '8px', paddingBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                      </svg>
                      <span style={{ fontWeight: 500 }}>Published in:</span>
                      <span style={{ color: '#666' }}>{selectedPaper.venue}</span>
                    </div>
                  </div>
                )}

                <div className="detail-section">
                  <h4>Network Metrics</h4>
                  <div className="metrics-grid">
                    <div className="metric-card" style={{ borderLeftColor: '#2196F3' }}>
                      <div className="metric-value" style={{ color: '#2196F3' }}>
                        {getDirectCitations(selectedPaper.id)}
                      </div>
                      <div className="metric-label">Direct Citations</div>
                    </div>
                    <div className="metric-card" style={{ borderLeftColor: '#4CAF50' }}>
                      <div className="metric-value" style={{ color: '#4CAF50' }}>
                        {getCitedBy(selectedPaper.id)}
                      </div>
                      <div className="metric-label">Cited By</div>
                    </div>
                    <div className="metric-card" style={{ borderLeftColor: '#00BCD4' }}>
                      <div className="metric-value" style={{ color: '#00BCD4' }}>
                        {getCoCitations(selectedPaper.id)}
                      </div>
                      <div className="metric-label">Co-citations</div>
                    </div>
                    {/* Influential Citations (New from Semantic Scholar) */}
                    {selectedPaper.influentialCitationCount !== undefined && (
                      <div className="metric-card" style={{ borderLeftColor: '#FF9800' }}>
                        <div className="metric-value" style={{ color: '#FF9800' }}>
                          {selectedPaper.influentialCitationCount}
                        </div>
                        <div className="metric-label">
                          Influential Citations
                          <span style={{
                            fontSize: '10px',
                            display: 'block',
                            color: '#999',
                            marginTop: '2px'
                          }}>
                            High-impact
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="detail-actions">
                  <button className="action-button primary" onClick={handleSetOrigin}>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    Set as Origin
                  </button>
                  <button className="action-button secondary" onClick={handleExpandNetwork}>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="15 3 21 3 21 9" />
                      <polyline points="9 21 3 21 3 15" />
                      <line x1="21" y1="3" x2="14" y2="10" />
                      <line x1="3" y1="21" x2="10" y2="14" />
                    </svg>
                    Expand Network
                  </button>
                  <button
                    className="action-button secondary"
                    onClick={() => window.open(selectedPaper.url, '_blank')}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                    View Paper
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#CCC"
                strokeWidth="1"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                <line x1="9" y1="9" x2="9.01" y2="9" />
                <line x1="15" y1="9" x2="15.01" y2="9" />
              </svg>
              <p>Select a paper to view details</p>
              <p className="empty-subtitle">Click a node in the graph or a paper in the list</p>
            </div>
          )}
        </aside>
      </div>

      <style jsx>{`
        .spinner {
          display: inline-block;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .search-status {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 24px;
          border-bottom: 1px solid #e0e0e0;
          font-size: 14px;
        }
        .search-status.success {
          background-color: #f0f9ff;
          color: #0277bd;
        }
        .search-status.error {
          background-color: #fff3f3;
          color: #c62828;
        }
        .search-status button {
          margin-left: auto;
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          color: inherit;
          opacity: 0.6;
        }
        .search-status button:hover {
          opacity: 1;
        }
        .secondary-button {
          padding: 8px 16px;
          background: #f5f5f5;
          border: 1px solid #ddd;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          color: #333;
          transition: all 0.2s;
        }
        .secondary-button:hover {
          background: #e0e0e0;
        }
      `}</style>
    </div>
  );
}

export default function CitationNetworkPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CitationNetworkPageContent />
    </Suspense>
  );
}
