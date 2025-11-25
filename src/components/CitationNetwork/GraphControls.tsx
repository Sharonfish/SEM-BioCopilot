/**
 * Graph Controls Component
 *
 * Provides UI controls for the citation network visualization:
 * - Zoom in/out
 * - Fit view
 * - Reset view
 * - Toggle edge visibility
 *
 * @module components/CitationNetwork/GraphControls
 */

'use client';

import React from 'react';
import { useReactFlow } from 'reactflow';
import { ZoomIn, ZoomOut, Maximize2, RotateCcw, Eye, EyeOff } from 'lucide-react';

/**
 * Props for GraphControls component
 */
interface GraphControlsProps {
  /** Whether edges are currently visible */
  showEdges?: boolean;
  /** Callback when edge visibility is toggled */
  onToggleEdges?: () => void;
  /** Additional CSS class names */
  className?: string;
}

/**
 * Graph Controls Component
 *
 * Provides interactive controls for manipulating the graph view
 */
export function GraphControls({
  showEdges = true,
  onToggleEdges,
  className = '',
}: GraphControlsProps) {
  const { zoomIn, zoomOut, fitView, setCenter } = useReactFlow();

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

  /**
   * Reset view to center (0, 0)
   */
  const handleReset = () => {
    setCenter(0, 0, { zoom: 1, duration: 300 });
  };

  return (
    <div className={`graph-controls ${className}`}>
      {/* Zoom In */}
      <button
        onClick={handleZoomIn}
        className="control-button"
        title="Zoom In"
        aria-label="Zoom in"
      >
        <ZoomIn size={20} />
      </button>

      {/* Zoom Out */}
      <button
        onClick={handleZoomOut}
        className="control-button"
        title="Zoom Out"
        aria-label="Zoom out"
      >
        <ZoomOut size={20} />
      </button>

      {/* Fit View */}
      <button
        onClick={handleFitView}
        className="control-button"
        title="Fit View"
        aria-label="Fit entire graph in view"
      >
        <Maximize2 size={20} />
      </button>

      {/* Reset View */}
      <button
        onClick={handleReset}
        className="control-button"
        title="Reset View"
        aria-label="Reset view to center"
      >
        <RotateCcw size={20} />
      </button>

      {/* Separator */}
      <div className="control-separator" />

      {/* Toggle Edges */}
      {onToggleEdges && (
        <button
          onClick={onToggleEdges}
          className={`control-button ${showEdges ? 'active' : ''}`}
          title={showEdges ? 'Hide Edges' : 'Show Edges'}
          aria-label={showEdges ? 'Hide citation edges' : 'Show citation edges'}
        >
          {showEdges ? <Eye size={20} /> : <EyeOff size={20} />}
        </button>
      )}
    </div>
  );
}

export default GraphControls;
