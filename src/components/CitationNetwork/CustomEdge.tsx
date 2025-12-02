/**
 * Custom Edge Component for Citation Network Graph
 *
 * Renders citation relationships between papers as edges in the React Flow visualization.
 * Different styles for "cites" vs "cited-by" relationships.
 *
 * @module components/CitationNetwork/CustomEdge
 */

'use client';

import React, { memo } from 'react';
import { BaseEdge, EdgeLabelRenderer, type EdgeProps, getSmoothStepPath } from 'reactflow';
import type { NetworkEdge } from '@/types/citationNetwork';

/**
 * Data structure for custom edge
 */
export interface CustomEdgeData {
  edge: NetworkEdge;
}

/**
 * Get edge color based on edge type
 */
function getEdgeColor(edge?: NetworkEdge): string {
  if (!edge) return '#94a3b8'; // Default gray

  // If edge has explicit type, use that
  if (edge.edgeType) {
    switch (edge.edgeType) {
      case 'citation':
        return '#4CAF50'; // Green for citations
      case 'reference':
        return '#2196F3'; // Blue for references
      case 'semantic':
        return '#FF9800'; // Orange for semantic connections
      case 'co-citation':
        return '#9C27B0'; // Purple for co-citations
      default:
        return '#94a3b8'; // Gray for unknown
    }
  }

  // Fallback to citation type
  if (edge.citation) {
    return edge.citation.type === 'cites' ? '#4CAF50' : '#2196F3';
  }

  return '#94a3b8';
}

/**
 * Get edge opacity based on semantic similarity
 */
function getEdgeOpacity(edge?: NetworkEdge): number {
  if (!edge || !edge.semanticSimilarity) return 0.6; // Default opacity

  // Map similarity (0-1) to opacity (0.3-1.0)
  return 0.3 + edge.semanticSimilarity * 0.7;
}

/**
 * Get edge stroke width based on weight
 */
function getEdgeWidth(edge?: NetworkEdge): number {
  if (!edge) return 2;

  const weight = edge.weight || 1;
  // Map weight to stroke width (1-4)
  return Math.min(4, Math.max(1, weight * 2));
}

/**
 * Custom Edge Component
 *
 * Renders citation relationships with:
 * - Smooth curved paths
 * - Different colors for citation types
 * - Animated flow on hover
 * - Optional edge labels
 */
export const CustomEdge = memo((props: EdgeProps<CustomEdgeData>) => {
  const {
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
    data,
  } = props;

  const edge = data?.edge;

  // Generate smooth path
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // Get edge visual properties
  const edgeColor = getEdgeColor(edge);
  const edgeOpacity = getEdgeOpacity(edge);
  const edgeWidth = getEdgeWidth(edge);

  // Edge styles
  const edgeStyle = {
    ...style,
    stroke: edgeColor,
    strokeWidth: edgeWidth,
    opacity: edgeOpacity,
  };

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={edgeStyle}
        className="custom-edge"
      />

      {/* Optional: Add edge label */}
      {/* <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            fontSize: 10,
            pointerEvents: 'all',
          }}
          className="edge-label"
        >
          {edge?.citation.type}
        </div>
      </EdgeLabelRenderer> */}
    </>
  );
});

CustomEdge.displayName = 'CustomEdge';

export default CustomEdge;
