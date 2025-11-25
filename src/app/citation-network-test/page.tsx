/**
 * Citation Network Test Page
 *
 * Test page for visualizing the citation network graph component
 * with realistic cancer biology data.
 *
 * Navigate to: http://localhost:3000/citation-network-test
 */

'use client';

import React, { useState } from 'react';
import { CitationNetworkGraph } from '@/components/CitationNetwork/CitationNetworkGraph';
import { cancerMockData } from '@/data/mockCancerCellData';
import type { Paper } from '@/types/citationNetwork';

import '@/styles/citationGraph.css';

export default function CitationNetworkTestPage() {
  const [selectedGraph, setSelectedGraph] = useState<'hallmarks' | 'metabolism'>('hallmarks');
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);
  const [hoveredPaper, setHoveredPaper] = useState<Paper | null>(null);

  const graph =
    selectedGraph === 'hallmarks'
      ? cancerMockData.hallmarksGraph
      : cancerMockData.metabolismGraph;

  const handleNodeClick = (paperId: string) => {
    const paper = cancerMockData.papers.find((p) => p.id === paperId);
    setSelectedPaper(paper || null);
  };

  const handleNodeHover = (paperId: string | null) => {
    if (paperId) {
      const paper = cancerMockData.papers.find((p) => p.id === paperId);
      setHoveredPaper(paper || null);
    } else {
      setHoveredPaper(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Citation Network Visualization
          </h1>
          <p className="text-gray-600">
            Interactive graph visualization of cancer biology research papers
          </p>
        </div>

        {/* Controls */}
        <div className="mb-4 flex gap-4 items-center">
          <label className="text-sm font-medium text-gray-700">
            Network View:
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedGraph('hallmarks')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedGraph === 'hallmarks'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Hallmarks of Cancer
            </button>
            <button
              onClick={() => setSelectedGraph('metabolism')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedGraph === 'metabolism'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Metabolic Reprogramming
            </button>
          </div>
        </div>

        {/* Graph Stats */}
        <div className="mb-4 bg-white rounded-lg p-4 shadow-sm grid grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-gray-600">Total Papers</div>
            <div className="text-2xl font-bold text-gray-900">
              {graph.nodes.length}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Total Citations</div>
            <div className="text-2xl font-bold text-gray-900">
              {graph.edges.length}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Origin Paper</div>
            <div className="text-sm font-medium text-gray-900">
              {graph.nodes.find((n) => n.isOrigin)?.paper.title.substring(0, 40)}...
            </div>
          </div>
        </div>

        {/* Layout */}
        <div className="grid grid-cols-3 gap-6" style={{ height: 'calc(100vh - 400px)' }}>
          {/* Graph Visualization */}
          <div className="col-span-2 bg-white rounded-lg shadow-lg overflow-hidden">
            <CitationNetworkGraph
              graph={graph}
              onNodeClick={handleNodeClick}
              onNodeHover={handleNodeHover}
            />
          </div>

          {/* Paper Details Panel */}
          <div className="bg-white rounded-lg shadow-lg p-6 overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {selectedPaper ? 'Selected Paper' : 'Paper Details'}
            </h2>

            {selectedPaper ? (
              <div>
                <h3 className="text-md font-semibold text-gray-900 mb-3 leading-tight">
                  {selectedPaper.title}
                </h3>

                <div className="space-y-3 text-sm">
                  <div>
                    <div className="text-gray-600 font-medium mb-1">Authors</div>
                    <div className="text-gray-900">
                      {selectedPaper.authors.join(', ')}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-gray-600 font-medium mb-1">Year</div>
                      <div className="text-gray-900">{selectedPaper.year}</div>
                    </div>
                    <div>
                      <div className="text-gray-600 font-medium mb-1">Citations</div>
                      <div className="text-gray-900">
                        {selectedPaper.citationCount.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-gray-600 font-medium mb-1">Source</div>
                    <div className="text-gray-900">{selectedPaper.source}</div>
                  </div>

                  <div>
                    <div className="text-gray-600 font-medium mb-1">Abstract</div>
                    <div className="text-gray-900 text-sm leading-relaxed">
                      {selectedPaper.abstract}
                    </div>
                  </div>

                  <div>
                    <a
                      href={selectedPaper.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      View Paper
                    </a>
                  </div>
                </div>
              </div>
            ) : hoveredPaper ? (
              <div className="text-sm text-gray-600">
                <div className="font-medium text-gray-900 mb-2">
                  {hoveredPaper.title}
                </div>
                <div className="text-xs">Hover over nodes to see details</div>
              </div>
            ) : (
              <div className="text-sm text-gray-600">
                Click on a node to view paper details
              </div>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 bg-white rounded-lg p-4 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 mb-3">Legend</h3>
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-600 border-4 border-blue-900"></div>
              <span className="text-gray-700">Origin Paper</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gray-600"></div>
              <span className="text-gray-700">Regular Paper</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gray-400"></div>
              <div className="w-8 h-8 rounded-full bg-gray-600"></div>
              <span className="text-gray-700">Size = Citations</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gray-800"></div>
              <span className="text-gray-400">→</span>
              <div className="w-6 h-6 rounded-full bg-gray-400"></div>
              <span className="text-gray-700">Color = Year</span>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h3 className="text-sm font-bold text-blue-900 mb-2">How to Use</h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc ml-5">
            <li>Click and drag nodes to rearrange the layout</li>
            <li>Use mouse wheel to zoom in/out</li>
            <li>Click on controls in the top-right to zoom or fit view</li>
            <li>Hover over nodes to see paper titles</li>
            <li>Click on nodes to view full paper details</li>
            <li>Toggle edge visibility with the eye icon</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
