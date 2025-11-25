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

  // Determine edge color based on citation type
  const edgeColor = edge?.citation.type === 'cites' ? '#94a3b8' : '#64748b';

  // Edge styles
  const edgeStyle = {
    ...style,
    stroke: edgeColor,
    strokeWidth: 2,
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
