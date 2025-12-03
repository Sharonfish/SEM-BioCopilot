/**
 * Citation Network Graph Component
 *
 * Main visualization component using React Flow to render the citation network.
 * Converts NetworkGraph to React Flow format and handles user interactions.
 *
 * @module components/CitationNetwork/CitationNetworkGraph
 */

'use client';

import React, { useMemo, useCallback, useState, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  MarkerType,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import dagre from 'dagre';

import type { NetworkGraph } from '@/types/citationNetwork';
import { CustomNode, type CustomNodeData } from './CustomNode';
import { CustomEdge, type CustomEdgeData } from './CustomEdge';
import { GraphControls } from './GraphControls';

import 'reactflow/dist/style.css';

// ============================================================================
// Types
// ============================================================================

/**
 * Props for CitationNetworkGraph component
 */
export interface CitationNetworkGraphProps {
  /** The network graph to visualize */
  graph: NetworkGraph;
  /** Callback when a node is clicked */
  onNodeClick?: (paperId: string) => void;
  /** Callback when a node is hovered */
  onNodeHover?: (paperId: string | null) => void;
  /** Additional CSS class names */
  className?: string;
}

// ============================================================================
// Layout Calculation
// ============================================================================

/**
 * Calculate edge length based on similarity
 * Higher similarity = shorter edge length
 */
function getEdgeLength(edge: any, graph: NetworkGraph): number {
  const baseLength = 150;
  const minLength = 80;
  const maxLength = 300;

  // Get source and target nodes
  const sourceNode = graph.nodes.find((n) => n.id === edge.source);
  const targetNode = graph.nodes.find((n) => n.id === edge.target);

  // Use semantic similarity if available, otherwise use default
  const similarity = edge.semanticSimilarity || 0;

  // If no similarity data, check if target has similarity to origin
  let effectiveSimilarity = similarity;
  if (similarity === 0 && targetNode?.paper?.similarityToOrigin) {
    effectiveSimilarity = targetNode.paper.similarityToOrigin;
  }

  // Map similarity to edge length (inverted: high similarity = short edge)
  // similarity 1.0 → minLength (80)
  // similarity 0.0 → maxLength (300)
  const length = maxLength - effectiveSimilarity * (maxLength - minLength);

  return Math.round(length);
}

/**
 * Calculate node positions using Dagre layout algorithm
 */
function getLayoutedElements(graph: NetworkGraph) {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  // Configure layout
  dagreGraph.setGraph({
    rankdir: 'TB', // Top to bottom
    align: 'UL',
    nodesep: 100,
    ranksep: 150,
    marginx: 50,
    marginy: 50,
  });

  // Add nodes
  graph.nodes.forEach((node) => {
    const citationCount = node.paper?.citationCount || 0;
    const size = Math.max(30, Math.min(80, Math.log10(citationCount + 1) * 20));
    dagreGraph.setNode(node.id, { width: size, height: size });
  });

  // Add edges with dynamic length based on similarity
  graph.edges.forEach((edge) => {
    const edgeLength = getEdgeLength(edge, graph);
    dagreGraph.setEdge(edge.source, edge.target, {
      minlen: Math.round(edgeLength / 50), // Convert to ranksep units
    });
  });

  // Calculate layout
  dagre.layout(dagreGraph);

  // Apply positions to nodes
  const layoutedNodes = graph.nodes.map((node) => {
    const dagreNode = dagreGraph.node(node.id);
    return {
      ...node,
      x: dagreNode.x,
      y: dagreNode.y,
    };
  });

  return {
    ...graph,
    nodes: layoutedNodes,
  };
}

// ============================================================================
// Conversion Functions
// ============================================================================

/**
 * Convert NetworkGraph to React Flow nodes
 */
function convertToReactFlowNodes(
  graph: NetworkGraph,
  onHover?: (paperId: string | null) => void
): Node<CustomNodeData>[] {
  return graph.nodes.map((node) => ({
    id: node.id,
    type: 'customNode',
    position: { x: node.x || 0, y: node.y || 0 },
    data: {
      node,
      onHover,
    },
    draggable: true,
  }));
}

/**
 * Convert NetworkGraph edges to React Flow edges
 */
function convertToReactFlowEdges(graph: NetworkGraph, showEdges: boolean): Edge<CustomEdgeData>[] {
  if (!showEdges) return [];

  return graph.edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    type: 'customEdge',
    data: {
      edge,
    },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 20,
      height: 20,
      color: '#94a3b8',
    },
    animated: false,
  }));
}

// ============================================================================
// Main Component (Internal - wrapped by provider)
// ============================================================================

/**
 * Internal graph component (must be inside ReactFlowProvider)
 */
function CitationNetworkGraphInternal({
  graph,
  onNodeClick,
  onNodeHover,
  className = '',
}: CitationNetworkGraphProps) {
  // Apply layout to graph
  const layoutedGraph = useMemo(() => getLayoutedElements(graph), [graph]);

  // Convert to React Flow format
  const initialNodes = useMemo(
    () => convertToReactFlowNodes(layoutedGraph, onNodeHover),
    [layoutedGraph, onNodeHover]
  );

  const initialEdges = useMemo(
    () => convertToReactFlowEdges(layoutedGraph, true),
    [layoutedGraph]
  );

  // Use React Flow state hooks
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes when graph changes
  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  // Update edges when graph changes
  useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  // Handle node click
  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node<CustomNodeData>) => {
      if (onNodeClick && node.data.node) {
        onNodeClick(node.data.node.id);
      }
    },
    [onNodeClick]
  );

  // Custom node types
  const nodeTypes = useMemo(
    () => ({
      customNode: CustomNode,
    }),
    []
  );

  // Custom edge types
  const edgeTypes = useMemo(
    () => ({
      customEdge: CustomEdge,
    }),
    []
  );

  return (
    <div className={`citation-network-graph ${className}`} style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        attributionPosition="bottom-right"
      >
        <Background color="#cbd5e1" gap={16} />
        <GraphControls />
      </ReactFlow>
    </div>
  );
}

// ============================================================================
// Main Component (with Provider)
// ============================================================================

/**
 * Citation Network Graph Component
 *
 * Visualizes a citation network using React Flow with:
 * - Dagre layout algorithm for positioning
 * - Custom node/edge components
 * - Zoom, pan, and fit controls
 * - Mini-map for navigation
 * - Toggle edge visibility
 *
 * @example
 * <CitationNetworkGraph
 *   graph={graph}
 *   onNodeClick={(id) => console.log('Clicked:', id)}
 *   onNodeHover={(id) => console.log('Hovered:', id)}
 * />
 */
export function CitationNetworkGraph(props: CitationNetworkGraphProps) {
  return (
    <ReactFlowProvider>
      <CitationNetworkGraphInternal {...props} />
    </ReactFlowProvider>
  );
}

export default CitationNetworkGraph;
