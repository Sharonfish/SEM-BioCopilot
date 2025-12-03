/**
 * Graph Controls Component (paper-web-viz style)
 *
 * Minimal floating controls for the citation network visualization:
 * - Zoom in/out
 * - Fit view
 *
 * @module components/CitationNetwork/GraphControls
 */

'use client';

import React from 'react';
import { useReactFlow } from 'reactflow';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

/**
 * Props for GraphControls component
 */
interface GraphControlsProps {
  /** Additional CSS class names */
  className?: string;
}

/**
 * Graph Controls Component (Minimal paper-web-viz style)
 *
 * Simple floating icon buttons for graph manipulation
 */
export function GraphControls({
  className = '',
}: GraphControlsProps) {
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  /**
   * Zoom in by 50%
   */
  const handleZoomIn = () => {
    zoomIn({ duration: 300 });
  };

  /**
   * Zoom out by 50%
   */
  const handleZoomOut = () => {
    zoomOut({ duration: 300 });
  };

  /**
   * Fit the entire graph in view
   */
  const handleFitView = () => {
    fitView({ padding: 0.2, duration: 300 });
  };

  return (
    <div className={`floating-zoom-controls ${className}`}>
      {/* Zoom In */}
      <button
        onClick={handleZoomIn}
        className="zoom-button"
        title="Zoom In"
        aria-label="Zoom in"
      >
        <ZoomIn size={16} />
      </button>

      {/* Zoom Out */}
      <button
        onClick={handleZoomOut}
        className="zoom-button"
        title="Zoom Out"
        aria-label="Zoom out"
      >
        <ZoomOut size={16} />
      </button>

      {/* Fit View */}
      <button
        onClick={handleFitView}
        className="zoom-button"
        title="Fit View"
        aria-label="Fit entire graph in view"
      >
        <Maximize2 size={16} />
      </button>
    </div>
  );
}

export default GraphControls;
