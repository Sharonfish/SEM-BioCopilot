/**
 * TypeScript type definitions for Citation Network Visualization
 *
 * This module contains all the core data types and interfaces used throughout
 * the citation network visualization system.
 *
 * @module types/citationNetwork
 */

// ============================================================================
// Core Data Types
// ============================================================================

/**
 * Represents a scholarly paper with all its metadata
 */
export interface Paper {
  /** Unique identifier for the paper (usually the URL or DOI) */
  id: string;
  /** Full title of the paper */
  title: string;
  /** List of author names */
  authors: string[];
  /** Publication year */
  year: number;
  /** Number of times this paper has been cited */
  citationCount: number;
  /** URL to the paper (Google Scholar, arXiv, etc.) */
  url: string;
  /** Abstract or summary of the paper */
  abstract: string;
  /** Source of the paper data (e.g., "Google Scholar", "arXiv") */
  source: string;
}

/**
 * Represents a citation relationship between two papers
 */
export interface Citation {
  /** ID of the paper that cites another paper */
  sourceId: string;
  /** ID of the paper being cited */
  targetId: string;
  /** Type of citation relationship */
  type: 'cites' | 'cited-by';
}

// ============================================================================
// Graph Visualization Types
// ============================================================================

/**
 * Represents a node in the citation network graph
 * Each node corresponds to a paper and includes position data for visualization
 */
export interface NetworkNode {
  /** Unique identifier (matches Paper.id) */
  id: string;
  /** Reference to the full paper data */
  paper: Paper;
  /** X coordinate for graph visualization (calculated by layout algorithm) */
  x?: number;
  /** Y coordinate for graph visualization (calculated by layout algorithm) */
  y?: number;
  /** X velocity for force-directed layout */
  vx?: number;
  /** Y velocity for force-directed layout */
  vy?: number;
  /** True if this is the origin/root paper of the network */
  isOrigin?: boolean;
  /** True if this node is currently selected by the user */
  isSelected?: boolean;
  /** Distance from the origin paper (0 = origin, 1 = direct citation, etc.) */
  level?: number;
  /** Number of citations this node has within the current graph */
  localCitationCount?: number;
}

/**
 * Represents an edge (connection) in the citation network graph
 * Each edge corresponds to a citation relationship
 */
export interface NetworkEdge {
  /** Unique identifier for this edge */
  id: string;
  /** ID of the source node (paper that cites) */
  source: string;
  /** ID of the target node (paper being cited) */
  target: string;
  /** Reference to the full citation data */
  citation: Citation;
  /** Visual weight/thickness of the edge (based on citation importance) */
  weight?: number;
}

/**
 * Represents the complete citation network graph
 */
export interface NetworkGraph {
  /** All nodes in the graph */
  nodes: NetworkNode[];
  /** All edges connecting the nodes */
  edges: NetworkEdge[];
  /** ID of the origin/root paper */
  originPaperId: string;
  /** Timestamp when this graph was last updated */
  lastUpdated?: number;
}

// ============================================================================
// UI State Types
// ============================================================================

/**
 * Filter settings for displaying the citation network
 */
export interface FilterState {
  /** Range of publication years to include [min, max] */
  yearRange: [number, number];
  /** Minimum number of citations a paper must have to be displayed */
  minCitations: number;
  /** Search query to filter papers by title/author/abstract */
  searchQuery: string;
  /** Whether to show papers that the origin paper cites (prior works) */
  showPriorWorks: boolean;
  /** Whether to show papers that cite the origin paper (derivative works) */
  showDerivativeWorks: boolean;
  /** Maximum depth of citation traversal (how many hops from origin) */
  maxDepth: number;
}

/**
 * Default filter values
 */
export const DEFAULT_FILTERS: FilterState = {
  yearRange: [1900, new Date().getFullYear()],
  minCitations: 0,
  searchQuery: '',
  showPriorWorks: true,
  showDerivativeWorks: true,
  maxDepth: 2,
};

/**
 * UI state for the citation network visualization
 */
export interface UIState {
  /** True when data is being loaded from the API */
  isLoading: boolean;
  /** Error message if something went wrong, null otherwise */
  error: string | null;
  /** ID of the currently selected paper, null if none selected */
  selectedPaperId: string | null;
  /** ID of the paper currently being hovered over, null if none */
  hoveredPaperId: string | null;
  /** Current filter settings */
  filters: FilterState;
  /** View mode for the visualization */
  viewMode: 'graph' | 'list' | 'timeline';
  /** Zoom level for the graph visualization */
  zoomLevel: number;
  /** Center position of the viewport [x, y] */
  viewportCenter: [number, number];
}

/**
 * Default UI state values
 */
export const DEFAULT_UI_STATE: UIState = {
  isLoading: false,
  error: null,
  selectedPaperId: null,
  hoveredPaperId: null,
  filters: DEFAULT_FILTERS,
  viewMode: 'graph',
  zoomLevel: 1,
  viewportCenter: [0, 0],
};

// ============================================================================
// Layout and Positioning Types
// ============================================================================

/**
 * Configuration for force-directed graph layout
 */
export interface ForceLayoutConfig {
  /** Strength of attraction between connected nodes */
  linkStrength: number;
  /** Distance between connected nodes */
  linkDistance: number;
  /** Strength of repulsion between all nodes */
  chargeStrength: number;
  /** Number of iterations to run the layout algorithm */
  iterations: number;
  /** Alpha (temperature) decay rate */
  alphaDecay: number;
}

/**
 * Default layout configuration
 */
export const DEFAULT_LAYOUT_CONFIG: ForceLayoutConfig = {
  linkStrength: 0.5,
  linkDistance: 100,
  chargeStrength: -300,
  iterations: 300,
  alphaDecay: 0.02,
};

// ============================================================================
// API Response Types
// ============================================================================

/**
 * Response from searching for papers
 */
export interface SearchResponse {
  /** List of papers matching the search query */
  papers: Paper[];
  /** Total number of results available */
  totalCount: number;
  /** Query that was executed */
  query: string;
}

/**
 * Response from expanding a node (fetching citations)
 */
export interface ExpandNodeResponse {
  /** The paper that was expanded */
  paperId: string;
  /** Papers that cite this paper */
  citedBy: Paper[];
  /** Papers that this paper cites */
  references: Paper[];
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Statistics about the citation network
 */
export interface NetworkStats {
  /** Total number of papers in the network */
  totalPapers: number;
  /** Total number of citation relationships */
  totalCitations: number;
  /** Average citations per paper */
  avgCitationsPerPaper: number;
  /** Year range of papers in the network */
  yearRange: [number, number];
  /** Most cited paper in the network */
  mostCitedPaper: Paper | null;
  /** Maximum depth from origin */
  maxDepth: number;
}

/**
 * Position in 2D space
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * Bounding box for the graph
 */
export interface BoundingBox {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  width: number;
  height: number;
}
