/**
 * Citation Network Page
 *
 * Full-page citation network visualization matching Bio Copilot IDE design.
 * Three-column layout: Papers List | Graph Visualization | Paper Details
 *
 * Navigate to: http://localhost:3000/citation-network
 */

'use client';

import React, { useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CitationNetworkGraph } from '@/src/components/CitationNetwork/CitationNetworkGraph';
import { cancerMockData } from '@/src/data/mockCancerCellData';
import type { Paper, NetworkGraph } from '@/src/types/citationNetwork';
import '@/src/styles/citationNetwork.css';

function CitationNetworkPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams?.get('q') || '';

  const [selectedGraph, setSelectedGraph] = useState<'hallmarks' | 'metabolism'>('hallmarks');
  const [selectedPaperId, setSelectedPaperId] = useState<string | null>(null);
  const [hoveredPaperId, setHoveredPaperId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [showPriorWorks, setShowPriorWorks] = useState(true);
  const [showDerivativeWorks, setShowDerivativeWorks] = useState(true);
  const [yearRange, setYearRange] = useState<[number, number]>([1970, 2025]);

  const graph: NetworkGraph =
    selectedGraph === 'hallmarks'
      ? cancerMockData.hallmarksGraph
      : cancerMockData.metabolismGraph;

  const selectedPaper = selectedPaperId
    ? cancerMockData.papers.find((p) => p.id === selectedPaperId) || null
    : null;

  const hoveredPaper = hoveredPaperId
    ? cancerMockData.papers.find((p) => p.id === hoveredPaperId) || null
    : null;

  // Filter papers based on current settings
  const filteredPapers = cancerMockData.papers.filter((paper) => {
    if (paper.year < yearRange[0] || paper.year > yearRange[1]) return false;
    if (searchQuery && !paper.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const handleNodeClick = useCallback((paperId: string) => {
    setSelectedPaperId(paperId);
  }, []);

  const handleNodeHover = useCallback((paperId: string | null) => {
    setHoveredPaperId(paperId);
  }, []);

  const handleBackClick = () => {
    router.push('/ide');
  };

  const handleSetOrigin = () => {
    if (selectedPaperId) {
      // Would rebuild graph with new origin
      console.log('Setting origin to:', selectedPaperId);
    }
  };

  const handleExpandNetwork = () => {
    if (selectedPaperId) {
      // Would expand node to show more citations
      console.log('Expanding network for:', selectedPaperId);
    }
  };

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
    // Simplified: papers that cite the same papers as this one
    const thisPaperCites = graph.edges
      .filter((e) => e.source === paperId)
      .map((e) => e.target);
    return graph.edges.filter(
      (e) => e.source !== paperId && thisPaperCites.includes(e.target)
    ).length;
  };

  return (
    <div className="citation-network-page">
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
          <input
            type="search"
            placeholder="Search papers, authors, topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button className="primary-button">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export
          </button>
          <button className="icon-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v6m0 6v6M1 12h6m6 0h6" />
            </svg>
          </button>
        </div>
      </header>

      {/* Main Three-Column Layout */}
      <div className="citation-network-content">
        {/* Left Sidebar - Papers List */}
        <aside className="papers-sidebar">
          <div className="sidebar-header">
            <h3>Related Papers</h3>
            <span className="count-badge">{filteredPapers.length}</span>
          </div>

          <div className="filters">
            <div className="filter-group">
              <label>Network View</label>
              <div className="button-group-vertical">
                <button
                  onClick={() => setSelectedGraph('hallmarks')}
                  className={`filter-button ${selectedGraph === 'hallmarks' ? 'active' : ''}`}
                >
                  Hallmarks of Cancer
                </button>
                <button
                  onClick={() => setSelectedGraph('metabolism')}
                  className={`filter-button ${selectedGraph === 'metabolism' ? 'active' : ''}`}
                >
                  Metabolic Reprogramming
                </button>
              </div>
            </div>

            <div className="filter-group">
              <label>Year Range: {yearRange[0]} - {yearRange[1]}</label>
              <input
                type="range"
                min="1970"
                max="2025"
                value={yearRange[0]}
                onChange={(e) => setYearRange([parseInt(e.target.value), yearRange[1]])}
                className="range-slider"
              />
            </div>
          </div>

          <div className="papers-list">
            {filteredPapers.map((paper) => (
              <div
                key={paper.id}
                className={`paper-card ${
                  paper.id === graph.originPaperId ? 'origin' : ''
                } ${paper.id === selectedPaperId ? 'selected' : ''}`}
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
            ))}
          </div>
        </aside>

        {/* Center - Graph Visualization */}
        <main className="graph-container">
          <div className="graph-toolbar">
            <div className="toolbar-section">
              <div className="graph-info">
                <span className="info-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                  {graph.nodes.length} Papers
                </span>
                <span className="info-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                <span className="toggle-dot" style={{ background: showPriorWorks ? '#2196F3' : '#ccc' }} />
                Prior Works
              </button>
              <button
                className={`toggle-button ${showDerivativeWorks ? 'active' : ''}`}
                onClick={() => setShowDerivativeWorks(!showDerivativeWorks)}
                style={{ borderColor: '#4CAF50' }}
              >
                <span className="toggle-dot" style={{ background: showDerivativeWorks ? '#4CAF50' : '#ccc' }} />
                Derivative
              </button>
            </div>
          </div>

          <div className="graph-visualization">
            <CitationNetworkGraph
              graph={graph}
              onNodeClick={handleNodeClick}
              onNodeHover={handleNodeHover}
            />
          </div>
        </main>

        {/* Right Panel - Paper Details */}
        <aside className="details-panel">
          {selectedPaper ? (
            <>
              <div className="panel-header">
                <h3>Paper Details</h3>
                <button
                  className="close-button"
                  onClick={() => setSelectedPaperId(null)}
                >
                  ✕
                </button>
              </div>

              <div className="paper-details">
                <div className="detail-section">
                  <div className="paper-title">{selectedPaper.title}</div>
                  <div className="paper-authors">{formatAuthors(selectedPaper.authors)}</div>
                  <div className="paper-meta">
                    <span className="meta-item">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      {selectedPaper.year}
                    </span>
                    <span className="meta-item">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                      </svg>
                      {selectedPaper.source}
                    </span>
                    <span className="meta-item">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                      {selectedPaper.citationCount.toLocaleString()} citations
                    </span>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Abstract</h4>
                  <p className="abstract-text">{selectedPaper.abstract}</p>
                </div>

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
                  </div>
                </div>

                <div className="detail-actions">
                  <button className="action-button primary" onClick={handleSetOrigin}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    Set as Origin
                  </button>
                  <button className="action-button secondary" onClick={handleExpandNetwork}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#CCC" strokeWidth="1">
                <circle cx="12" cy="12" r="10" />
                <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                <line x1="9" y1="9" x2="9.01" y2="9" />
                <line x1="15" y1="9" x2="15.01" y2="9" />
              </svg>
              <p>Select a paper to view details</p>
              <p className="empty-subtitle">点击节点查看论文详情</p>
            </div>
          )}
        </aside>
      </div>
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

