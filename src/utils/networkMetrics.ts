/**
 * Network Metrics Calculator
 *
 * Calculates various metrics for papers in the citation network.
 *
 * @module utils/networkMetrics
 */

import type { Paper, NetworkGraph } from '@/types/citationNetwork';

/**
 * Metrics calculated for a paper in the network
 */
export interface PaperMetrics {
  /** Number of papers this paper directly cites */
  directCitations: number;
  /** Number of papers that cite this paper */
  citedBy: number;
  /** Number of papers that share citations with this paper */
  coCitations: number;
  /** Calculated influence score based on various factors */
  influenceScore: number;
  /** Total number of connections (in + out) */
  totalConnections: number;
  /** Papers that this paper cites (prior works) */
  priorWorks: Paper[];
  /** Papers that cite this paper (derivative works) */
  derivativeWorks: Paper[];
  /** Citation trend indicator */
  citationTrend?: 'up' | 'down' | 'stable';
  /** Cited-by trend indicator */
  citedByTrend?: 'up' | 'down' | 'stable';
}

/**
 * Calculate comprehensive metrics for a paper in the network
 *
 * @param paperId - ID of the paper to analyze
 * @param graph - The complete network graph
 * @returns Calculated metrics
 */
export function calculatePaperMetrics(
  paperId: string,
  graph: NetworkGraph
): PaperMetrics {
  const edges = graph.edges;
  const nodes = graph.nodes;

  // Find papers this paper cites (outgoing edges)
  const outgoingEdges = edges.filter((e) => e.source === paperId);
  const directCitations = outgoingEdges.length;
  const priorWorkIds = outgoingEdges.map((e) => e.target);
  const priorWorks = nodes
    .filter((n) => priorWorkIds.includes(n.id))
    .map((n) => n.paper)
    .sort((a, b) => b.citationCount - a.citationCount); // Sort by impact

  // Find papers that cite this paper (incoming edges)
  const incomingEdges = edges.filter((e) => e.target === paperId);
  const citedBy = incomingEdges.length;
  const derivativeWorkIds = incomingEdges.map((e) => e.source);
  const derivativeWorks = nodes
    .filter((n) => derivativeWorkIds.includes(n.id))
    .map((n) => n.paper)
    .sort((a, b) => b.citationCount - a.citationCount); // Sort by impact

  // Calculate co-citations (papers that cite the same papers)
  const coCitations = calculateCoCitations(paperId, graph);

  // Calculate influence score
  const paper = nodes.find((n) => n.id === paperId)?.paper;
  const influenceScore = calculateInfluenceScore(
    paper,
    directCitations,
    citedBy,
    coCitations
  );

  // Calculate trends (simplified - would need historical data for accuracy)
  const citationTrend = calculateTrend(paper, 'citations');
  const citedByTrend = calculateTrend(paper, 'citedBy');

  return {
    directCitations,
    citedBy,
    coCitations,
    influenceScore,
    totalConnections: directCitations + citedBy,
    priorWorks,
    derivativeWorks,
    citationTrend,
    citedByTrend,
  };
}

/**
 * Calculate co-citations (papers that share citations with this paper)
 */
function calculateCoCitations(paperId: string, graph: NetworkGraph): number {
  // Get papers that this paper cites
  const myPriorWorks = new Set(
    graph.edges.filter((e) => e.source === paperId).map((e) => e.target)
  );

  if (myPriorWorks.size === 0) return 0;

  let coCitationCount = 0;

  // Check each other paper
  graph.nodes.forEach((node) => {
    if (node.id === paperId) return;

    // Get papers that this other paper cites
    const theirPriorWorks = new Set(
      graph.edges.filter((e) => e.source === node.id).map((e) => e.target)
    );

    // Count shared citations
    const sharedCitations = new Set(
      [...myPriorWorks].filter((x) => theirPriorWorks.has(x))
    );

    if (sharedCitations.size > 0) {
      coCitationCount++;
    }
  });

  return coCitationCount;
}

/**
 * Calculate influence score based on multiple factors
 */
function calculateInfluenceScore(
  paper: Paper | undefined,
  directCitations: number,
  citedBy: number,
  coCitations: number
): number {
  if (!paper) return 0;

  // Weighted formula:
  // - Global citation count (40% weight)
  // - Papers citing this one (30% weight)
  // - Direct citations (20% weight)
  // - Co-citations (10% weight)

  const citationScore = Math.min(paper.citationCount / 100, 100) * 0.4;
  const citedByScore = Math.min(citedBy * 10, 100) * 0.3;
  const directScore = Math.min(directCitations * 5, 100) * 0.2;
  const coScore = Math.min(coCitations * 2, 100) * 0.1;

  return Math.round(citationScore + citedByScore + directScore + coScore);
}

/**
 * Calculate trend for a metric (simplified)
 */
function calculateTrend(
  paper: Paper | undefined,
  metric: 'citations' | 'citedBy'
): 'up' | 'down' | 'stable' {
  if (!paper) return 'stable';

  const currentYear = new Date().getFullYear();
  const paperAge = currentYear - paper.year;

  if (metric === 'citations') {
    // Recent papers with many citations are trending up
    if (paperAge < 5 && paper.citationCount > 500) return 'up';
    if (paperAge > 15 && paper.citationCount < 100) return 'down';
  }

  return 'stable';
}

/**
 * Find most influential papers in a set
 */
export function findMostInfluential(papers: Paper[], limit = 5): Paper[] {
  return [...papers]
    .sort((a, b) => b.citationCount - a.citationCount)
    .slice(0, limit);
}

/**
 * Calculate network density (how connected the graph is)
 */
export function calculateNetworkDensity(graph: NetworkGraph): number {
  const n = graph.nodes.length;
  if (n <= 1) return 0;

  const maxPossibleEdges = (n * (n - 1)) / 2;
  return graph.edges.length / maxPossibleEdges;
}

/**
 * Find shortest path between two papers (simplified BFS)
 */
export function findShortestPath(
  fromId: string,
  toId: string,
  graph: NetworkGraph
): string[] | null {
  if (fromId === toId) return [fromId];

  const visited = new Set<string>();
  const queue: Array<{ id: string; path: string[] }> = [
    { id: fromId, path: [fromId] },
  ];

  while (queue.length > 0) {
    const current = queue.shift()!;

    if (current.id === toId) {
      return current.path;
    }

    if (visited.has(current.id)) continue;
    visited.add(current.id);

    // Find connected papers
    const connections = graph.edges
      .filter((e) => e.source === current.id || e.target === current.id)
      .map((e) => (e.source === current.id ? e.target : e.source))
      .filter((id) => !visited.has(id));

    connections.forEach((id) => {
      queue.push({
        id,
        path: [...current.path, id],
      });
    });
  }

  return null; // No path found
}
