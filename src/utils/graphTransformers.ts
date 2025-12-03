/**
 * Graph Transformation Utilities
 *
 * This module provides functions for transforming paper data into graph structures,
 * filtering graphs, calculating layouts, and finding connected papers.
 *
 * @module utils/graphTransformers
 */

import type {
  Paper,
  NetworkGraph,
  NetworkNode,
  NetworkEdge,
  Citation,
  FilterState,
  ForceLayoutConfig,
  NetworkStats,
  BoundingBox,
} from '@/types/citationNetwork';

import { DEFAULT_LAYOUT_CONFIG } from '@/types/citationNetwork';

// ============================================================================
// Graph Building Functions
// ============================================================================

/**
 * Builds a network graph from a list of papers with an origin paper
 *
 * @param papers - Array of papers to include in the graph
 * @param originPaperId - ID of the paper to use as the root/origin
 * @returns NetworkGraph with nodes and edges
 *
 * @example
 * const graph = buildNetworkGraph(papers, 'paper-123');
 */
export function buildNetworkGraph(
  papers: Paper[],
  originPaperId: string
): NetworkGraph {
  const nodes: NetworkNode[] = [];
  const edges: NetworkEdge[] = [];
  const paperMap = new Map<string, Paper>();

  // Create a map for quick lookup
  papers.forEach(paper => paperMap.set(paper.id, paper));

  // Create nodes
  papers.forEach((paper) => {
    const node: NetworkNode = {
      id: paper.id,
      paper,
      isOrigin: paper.id === originPaperId,
      isSelected: false,
      level: 0,
      localCitationCount: 0,
    };
    nodes.push(node);
  });

  // Create edges based on citation relationships
  // This is a simplified version - in reality, you'd need citation data
  // For now, we'll infer potential relationships based on year and citations
  papers.forEach((sourcePaper) => {
    papers.forEach((targetPaper) => {
      if (sourcePaper.id !== targetPaper.id) {
        // Younger papers cite older papers
        if (sourcePaper.year > targetPaper.year) {
          const citation: Citation = {
            sourceId: sourcePaper.id,
            targetId: targetPaper.id,
            type: 'cites',
          };

          const edge: NetworkEdge = {
            id: `${sourcePaper.id}->${targetPaper.id}`,
            source: sourcePaper.id,
            target: targetPaper.id,
            citation,
            weight: 1,
          };

          edges.push(edge);
        }
      }
    });
  });

  // Calculate levels (distance from origin)
  calculateNodeLevels(nodes, edges, originPaperId);

  // Calculate local citation counts
  calculateLocalCitationCounts(nodes, edges);

  return {
    nodes,
    edges,
    originPaperId,
    lastUpdated: Date.now(),
  };
}

/**
 * Calculates the level (distance from origin) for each node using BFS
 *
 * @param nodes - Array of nodes to update
 * @param edges - Array of edges defining connections
 * @param originPaperId - ID of the origin paper
 */
function calculateNodeLevels(
  nodes: NetworkNode[],
  edges: NetworkEdge[],
  originPaperId: string
): void {
  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  const visited = new Set<string>();
  const queue: Array<{ id: string; level: number }> = [{ id: originPaperId, level: 0 }];

  while (queue.length > 0) {
    const { id, level } = queue.shift()!;

    if (visited.has(id)) continue;
    visited.add(id);

    const node = nodeMap.get(id);
    if (node) {
      node.level = level;
    }

    // Find all connected nodes
    edges.forEach(edge => {
      if (edge.source === id && !visited.has(edge.target)) {
        queue.push({ id: edge.target, level: level + 1 });
      }
      if (edge.target === id && !visited.has(edge.source)) {
        queue.push({ id: edge.source, level: level + 1 });
      }
    });
  }
}

/**
 * Calculates how many times each node is cited within the current graph
 *
 * @param nodes - Array of nodes to update
 * @param edges - Array of edges defining citations
 */
function calculateLocalCitationCounts(
  nodes: NetworkNode[],
  edges: NetworkEdge[]
): void {
  const citationCounts = new Map<string, number>();

  // Count incoming edges for each node
  edges.forEach(edge => {
    const count = citationCounts.get(edge.target) || 0;
    citationCounts.set(edge.target, count + 1);
  });

  // Update nodes
  nodes.forEach(node => {
    node.localCitationCount = citationCounts.get(node.id) || 0;
  });
}

// ============================================================================
// Filtering Functions
// ============================================================================

/**
 * Applies filters to a graph and returns a new filtered graph
 *
 * @param graph - The graph to filter
 * @param filters - Filter settings to apply
 * @returns A new NetworkGraph with only nodes/edges that pass the filters
 *
 * @example
 * const filtered = filterGraph(graph, {
 *   yearRange: [2010, 2020],
 *   minCitations: 10,
 *   searchQuery: 'CRISPR'
 * });
 */
export function filterGraph(
  graph: NetworkGraph,
  filters: FilterState
): NetworkGraph {
  const {
    yearRange,
    minCitations,
    searchQuery,
    showPriorWorks,
    showDerivativeWorks,
    maxDepth,
  } = filters;

  // Filter nodes
  const filteredNodes = graph.nodes.filter(node => {
    const paper = node.paper;

    // Year range filter
    if (paper.year < yearRange[0] || paper.year > yearRange[1]) {
      return false;
    }

    // Citation count filter
    if (paper.citationCount < minCitations) {
      return false;
    }

    // Search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchesTitle = paper.title.toLowerCase().includes(query);
      const matchesAuthors = paper.authors.some(author =>
        author.toLowerCase().includes(query)
      );
      const matchesAbstract = paper.abstract.toLowerCase().includes(query);

      if (!matchesTitle && !matchesAuthors && !matchesAbstract) {
        return false;
      }
    }

    // Depth filter
    if (node.level !== undefined && node.level > maxDepth) {
      return false;
    }

    // Always show origin
    if (node.isOrigin) {
      return true;
    }

    // Prior/derivative works filter
    // This is simplified - would need actual citation direction data
    const isOlderThanOrigin = paper.year < (graph.nodes.find(n => n.isOrigin)?.paper.year || 0);
    if (!showPriorWorks && isOlderThanOrigin) {
      return false;
    }
    if (!showDerivativeWorks && !isOlderThanOrigin) {
      return false;
    }

    return true;
  });

  // Create set of filtered node IDs for quick lookup
  const filteredNodeIds = new Set(filteredNodes.map(n => n.id));

  // Filter edges - only keep edges where both nodes are in filtered set
  const filteredEdges = graph.edges.filter(
    edge => filteredNodeIds.has(edge.source) && filteredNodeIds.has(edge.target)
  );

  return {
    nodes: filteredNodes,
    edges: filteredEdges,
    originPaperId: graph.originPaperId,
    lastUpdated: Date.now(),
  };
}

// ============================================================================
// Layout Calculation Functions
// ============================================================================

/**
 * Calculates node positions using a force-directed layout algorithm
 *
 * This is a simplified force-directed layout implementation.
 * For production, consider using D3-force or similar libraries.
 *
 * @param graph - The graph to layout
 * @param config - Configuration for the layout algorithm
 * @returns A new NetworkGraph with calculated positions
 *
 * @example
 * const layoutGraph = calculateNodePositions(graph);
 */
export function calculateNodePositions(
  graph: NetworkGraph,
  config: ForceLayoutConfig = DEFAULT_LAYOUT_CONFIG
): NetworkGraph {
  const nodes = graph.nodes.map(n => ({ ...n }));
  const edges = graph.edges;

  // Initialize random positions if not set
  nodes.forEach((node, i) => {
    if (node.x === undefined || node.y === undefined) {
      const angle = (i / nodes.length) * 2 * Math.PI;
      const radius = 200;
      node.x = Math.cos(angle) * radius;
      node.y = Math.sin(angle) * radius;
    }
    node.vx = 0;
    node.vy = 0;
  });

  // Place origin at center
  const originNode = nodes.find(n => n.isOrigin);
  if (originNode) {
    originNode.x = 0;
    originNode.y = 0;
  }

  // Run force simulation
  let alpha = 1.0;

  for (let iteration = 0; iteration < config.iterations; iteration++) {
    // Apply forces
    applyLinkForce(nodes, edges, config.linkStrength, config.linkDistance);
    applyChargeForce(nodes, config.chargeStrength);
    applyCenteringForce(nodes);

    // Update positions
    nodes.forEach(node => {
      if (!node.isOrigin) {
        node.x = (node.x || 0) + (node.vx || 0) * alpha;
        node.y = (node.y || 0) + (node.vy || 0) * alpha;
      }
      node.vx = (node.vx || 0) * 0.8; // Damping
      node.vy = (node.vy || 0) * 0.8;
    });

    // Decrease alpha
    alpha *= 1 - config.alphaDecay;
  }

  return {
    ...graph,
    nodes,
  };
}

/**
 * Applies attractive force between connected nodes
 */
function applyLinkForce(
  nodes: NetworkNode[],
  edges: NetworkEdge[],
  strength: number,
  distance: number
): void {
  const nodeMap = new Map(nodes.map(n => [n.id, n]));

  edges.forEach(edge => {
    const source = nodeMap.get(edge.source);
    const target = nodeMap.get(edge.target);

    if (!source || !target) return;

    const dx = (target.x || 0) - (source.x || 0);
    const dy = (target.y || 0) - (source.y || 0);
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;

    const force = (dist - distance) * strength;
    const fx = (dx / dist) * force;
    const fy = (dy / dist) * force;

    source.vx = (source.vx || 0) + fx;
    source.vy = (source.vy || 0) + fy;
    target.vx = (target.vx || 0) - fx;
    target.vy = (target.vy || 0) - fy;
  });
}

/**
 * Applies repulsive force between all nodes
 */
function applyChargeForce(nodes: NetworkNode[], strength: number): void {
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const nodeA = nodes[i];
      const nodeB = nodes[j];

      const dx = (nodeB.x || 0) - (nodeA.x || 0);
      const dy = (nodeB.y || 0) - (nodeA.y || 0);
      const distSq = dx * dx + dy * dy || 1;
      const dist = Math.sqrt(distSq);

      const force = strength / distSq;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;

      nodeA.vx = (nodeA.vx || 0) - fx;
      nodeA.vy = (nodeA.vy || 0) - fy;
      nodeB.vx = (nodeB.vx || 0) + fx;
      nodeB.vy = (nodeB.vy || 0) + fy;
    }
  }
}

/**
 * Applies force to center the graph
 */
function applyCenteringForce(nodes: NetworkNode[]): void {
  let cx = 0;
  let cy = 0;

  nodes.forEach(node => {
    cx += node.x || 0;
    cy += node.y || 0;
  });

  cx /= nodes.length || 1;
  cy /= nodes.length || 1;

  nodes.forEach(node => {
    if (!node.isOrigin) {
      node.vx = (node.vx || 0) - cx * 0.01;
      node.vy = (node.vy || 0) - cy * 0.01;
    }
  });
}

// ============================================================================
// Paper Discovery Functions
// ============================================================================

/**
 * Finds papers connected to a given paper (citations and references)
 *
 * This is a helper function for expanding nodes in the graph.
 * In a real implementation, this would make API calls to fetch citation data.
 *
 * @param paperId - ID of the paper to find connections for
 * @param papers - All available papers
 * @returns Object with prior works (references) and derivative works (citations)
 *
 * @example
 * const { prior, derivative } = findConnectedPapers('paper-123', allPapers);
 */
export function findConnectedPapers(
  paperId: string,
  papers: Paper[]
): { prior: Paper[]; derivative: Paper[] } {
  const targetPaper = papers.find(p => p.id === paperId);

  if (!targetPaper) {
    return { prior: [], derivative: [] };
  }

  // Prior works: papers published before this one (simplified heuristic)
  const prior = papers.filter(
    p => p.id !== paperId && p.year < targetPaper.year
  );

  // Derivative works: papers published after this one (simplified heuristic)
  const derivative = papers.filter(
    p => p.id !== paperId && p.year > targetPaper.year
  );

  return { prior, derivative };
}

// ============================================================================
// Statistics and Analysis Functions
// ============================================================================

/**
 * Calculates statistics about the citation network
 *
 * @param graph - The graph to analyze
 * @returns NetworkStats object with various metrics
 *
 * @example
 * const stats = calculateNetworkStats(graph);
 * console.log(`Average citations: ${stats.avgCitationsPerPaper}`);
 */
export function calculateNetworkStats(graph: NetworkGraph): NetworkStats {
  const papers = graph.nodes.map(n => n.paper);

  if (papers.length === 0) {
    return {
      totalPapers: 0,
      totalCitations: 0,
      avgCitationsPerPaper: 0,
      yearRange: [0, 0],
      mostCitedPaper: null,
      maxDepth: 0,
    };
  }

  const totalCitations = papers.reduce(
    (sum, p) => sum + p.citationCount,
    0
  );

  const years = papers.map(p => p.year).filter(y => y > 0);
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);

  const mostCitedPaper = papers.reduce((max, p) =>
    p.citationCount > max.citationCount ? p : max
  );

  const maxDepth = Math.max(...graph.nodes.map(n => n.level || 0));

  return {
    totalPapers: papers.length,
    totalCitations: graph.edges.length,
    avgCitationsPerPaper: totalCitations / papers.length,
    yearRange: [minYear, maxYear],
    mostCitedPaper,
    maxDepth,
  };
}

/**
 * Calculates the bounding box of the graph
 *
 * @param graph - The graph to measure
 * @returns BoundingBox with min/max coordinates
 */
export function calculateBoundingBox(graph: NetworkGraph): BoundingBox {
  const positions = graph.nodes
    .filter(n => n.x !== undefined && n.y !== undefined)
    .map(n => ({ x: n.x!, y: n.y! }));

  if (positions.length === 0) {
    return { minX: 0, maxX: 0, minY: 0, maxY: 0, width: 0, height: 0 };
  }

  const minX = Math.min(...positions.map(p => p.x));
  const maxX = Math.max(...positions.map(p => p.x));
  const minY = Math.min(...positions.map(p => p.y));
  const maxY = Math.max(...positions.map(p => p.y));

  return {
    minX,
    maxX,
    minY,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

/**
 * Merges two graphs by combining their nodes and edges
 *
 * @param graph1 - First graph
 * @param graph2 - Second graph
 * @returns Combined graph with unique nodes and edges
 */
export function mergeGraphs(
  graph1: NetworkGraph,
  graph2: NetworkGraph
): NetworkGraph {
  const nodeMap = new Map<string, NetworkNode>();
  const edgeMap = new Map<string, NetworkEdge>();

  // Add all nodes from both graphs
  [...graph1.nodes, ...graph2.nodes].forEach(node => {
    if (!nodeMap.has(node.id)) {
      nodeMap.set(node.id, { ...node });
    }
  });

  // Add all edges from both graphs
  [...graph1.edges, ...graph2.edges].forEach(edge => {
    if (!edgeMap.has(edge.id)) {
      edgeMap.set(edge.id, { ...edge });
    }
  });

  return {
    nodes: Array.from(nodeMap.values()),
    edges: Array.from(edgeMap.values()),
    originPaperId: graph1.originPaperId,
    lastUpdated: Date.now(),
  };
}
