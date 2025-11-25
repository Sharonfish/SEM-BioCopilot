/**
 * Custom Node Component for Citation Network Graph
 *
 * Renders individual paper nodes in the React Flow visualization.
 * Shows paper info with dynamic sizing and coloring based on metrics.
 *
 * @module components/CitationNetwork/CustomNode
 */

'use client';

import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import type { NetworkNode } from '@/types/citationNetwork';

/**
 * Data structure for custom node
 */
export interface CustomNodeData {
  node: NetworkNode;
  onHover?: (paperId: string | null) => void;
}

/**
 * Calculate node size based on citation count
 */
function getNodeSize(citationCount: number): number {
  const minSize = 30;
  const maxSize = 80;
  const logScale = Math.log10(citationCount + 1);
  const normalizedSize = (logScale / Math.log10(50000)) * (maxSize - minSize) + minSize;
  return Math.min(Math.max(normalizedSize, minSize), maxSize);
}

/**
 * Get color based on publication year and node type
 * Uses Bio Copilot IDE blue/green color scheme
 */
function getNodeColor(
  year: number,
  isOrigin: boolean,
  isSelected: boolean,
  isPriorWork?: boolean
): string {
  // Origin node: Blue-to-teal gradient (#2196F3 to #00BCD4)
  if (isOrigin) return '#2196F3';

  // Selected node: Teal accent (#00BCD4)
  if (isSelected) return '#00BCD4';

  const currentYear = new Date().getFullYear();
  const oldestYear = 1970;
  const normalized = (year - oldestYear) / (currentYear - oldestYear);

  // Prior works (older papers): Blue tones (#2196F3, #64B5F6)
  // Derivative works (newer papers): Green tones (#4CAF50, #81C784)
  if (isPriorWork !== undefined) {
    if (isPriorWork) {
      // Blue gradient for prior works
      const lightness = 45 + normalized * 25; // 45% to 70%
      return `hsl(207, 90%, ${lightness}%)`; // Blue hue
    } else {
      // Green gradient for derivative works
      const lightness = 45 + normalized * 25; // 45% to 70%
      return `hsl(122, 39%, ${lightness}%)`; // Green hue
    }
  }

  // Default: Blue-green gradient
  const hue = 200 + normalized * 20; // 200 to 220 (blue to cyan)
  return `hsl(${hue}, 70%, 55%)`;
}

/**
 * Get shortened author names for display
 */
function getShortAuthors(authors: string[]): string {
  if (authors.length === 0) return 'Unknown';
  if (authors.length === 1) return authors[0].split(' ').pop() || authors[0];
  if (authors.length === 2) {
    return `${authors[0].split(' ').pop()} & ${authors[1].split(' ').pop()}`;
  }
  return `${authors[0].split(' ').pop()} et al.`;
}

/**
 * Custom Node Component
 *
 * Renders a paper as a circular node with:
 * - Size based on citation count
 * - Color based on publication year
 * - Label showing authors and year
 * - Tooltip on hover
 */
export const CustomNode = memo(({ data }: NodeProps<CustomNodeData>) => {
  const { node, onHover } = data;
  const { paper, isOrigin, isSelected } = node;

  const size = getNodeSize(paper.citationCount);
  const color = getNodeColor(paper.year, isOrigin || false, isSelected || false);
  const authors = getShortAuthors(paper.authors);

  return (
    <div
      className="custom-node"
      onMouseEnter={() => onHover?.(node.id)}
      onMouseLeave={() => onHover?.(null)}
      style={{
        width: size,
        height: size,
      }}
    >
      {/* Connection handles */}
      <Handle type="target" position={Position.Top} className="handle" />
      <Handle type="source" position={Position.Bottom} className="handle" />

      {/* Node circle */}
      <div
        className={`node-circle ${isOrigin ? 'origin' : ''} ${isSelected ? 'selected' : ''}`}
        style={{
          width: size,
          height: size,
          backgroundColor: color,
        }}
        title={`${paper.title}\n${paper.authors.join(', ')}\n${paper.year} • ${paper.citationCount} citations`}
      >
        {/* Show citation count inside larger nodes */}
        {size > 50 && (
          <div className="node-citation-count">
            {paper.citationCount > 1000
              ? `${(paper.citationCount / 1000).toFixed(1)}k`
              : paper.citationCount}
          </div>
        )}
      </div>

      {/* Node label */}
      <div className="node-label">
        <div className="node-label-authors">{authors}</div>
        <div className="node-label-year">{paper.year}</div>
      </div>

      {/* Hover tooltip */}
      <div className="node-tooltip">
        <div className="tooltip-title">{paper.title}</div>
        <div className="tooltip-authors">{paper.authors.join(', ')}</div>
        <div className="tooltip-meta">
          {paper.year} • {paper.citationCount} citations • {paper.source}
        </div>
      </div>
    </div>
  );
});

CustomNode.displayName = 'CustomNode';

export default CustomNode;
