/**
 * Citation Network Reducer
 *
 * This module defines the reducer for managing citation network state updates.
 * Uses a reducer pattern for predictable state management.
 *
 * @module reducers/citationNetworkReducer
 */

import type {
  Paper,
  NetworkGraph,
  UIState,
  FilterState,
} from '@/types/citationNetwork';

import { DEFAULT_UI_STATE } from '@/types/citationNetwork';

// ============================================================================
// State Type
// ============================================================================

/**
 * Complete state for the citation network
 */
export interface CitationNetworkState {
  /** The current network graph */
  graph: NetworkGraph | null;
  /** Map of paper ID to paper data for quick lookup */
  papers: Map<string, Paper>;
  /** UI state (loading, errors, selections, filters) */
  uiState: UIState;
}

/**
 * Initial state for the citation network
 */
export const initialState: CitationNetworkState = {
  graph: null,
  papers: new Map(),
  uiState: DEFAULT_UI_STATE,
};

// ============================================================================
// Action Types
// ============================================================================

/**
 * Action type constants
 */
export const ActionTypes = {
  // Data loading actions
  LOAD_START: 'LOAD_START',
  LOAD_SUCCESS: 'LOAD_SUCCESS',
  LOAD_ERROR: 'LOAD_ERROR',

  // Graph manipulation actions
  SET_GRAPH: 'SET_GRAPH',
  ADD_PAPERS: 'ADD_PAPERS',
  MERGE_GRAPH: 'MERGE_GRAPH',

  // UI state actions
  SELECT_PAPER: 'SELECT_PAPER',
  HOVER_PAPER: 'HOVER_PAPER',
  SET_FILTERS: 'SET_FILTERS',
  SET_VIEW_MODE: 'SET_VIEW_MODE',
  SET_ZOOM: 'SET_ZOOM',
  SET_VIEWPORT: 'SET_VIEWPORT',

  // Utility actions
  CLEAR_ERROR: 'CLEAR_ERROR',
  RESET: 'RESET',
} as const;

// ============================================================================
// Action Interfaces
// ============================================================================

interface LoadStartAction {
  type: typeof ActionTypes.LOAD_START;
}

interface LoadSuccessAction {
  type: typeof ActionTypes.LOAD_SUCCESS;
  payload: {
    graph: NetworkGraph;
    papers: Paper[];
  };
}

interface LoadErrorAction {
  type: typeof ActionTypes.LOAD_ERROR;
  payload: {
    error: string;
  };
}

interface SetGraphAction {
  type: typeof ActionTypes.SET_GRAPH;
  payload: {
    graph: NetworkGraph;
  };
}

interface AddPapersAction {
  type: typeof ActionTypes.ADD_PAPERS;
  payload: {
    papers: Paper[];
  };
}

interface MergeGraphAction {
  type: typeof ActionTypes.MERGE_GRAPH;
  payload: {
    graph: NetworkGraph;
    papers: Paper[];
  };
}

interface SelectPaperAction {
  type: typeof ActionTypes.SELECT_PAPER;
  payload: {
    paperId: string | null;
  };
}

interface HoverPaperAction {
  type: typeof ActionTypes.HOVER_PAPER;
  payload: {
    paperId: string | null;
  };
}

interface SetFiltersAction {
  type: typeof ActionTypes.SET_FILTERS;
  payload: {
    filters: Partial<FilterState>;
  };
}

interface SetViewModeAction {
  type: typeof ActionTypes.SET_VIEW_MODE;
  payload: {
    viewMode: 'graph' | 'list' | 'timeline';
  };
}

interface SetZoomAction {
  type: typeof ActionTypes.SET_ZOOM;
  payload: {
    zoomLevel: number;
  };
}

interface SetViewportAction {
  type: typeof ActionTypes.SET_VIEWPORT;
  payload: {
    center: [number, number];
  };
}

interface ClearErrorAction {
  type: typeof ActionTypes.CLEAR_ERROR;
}

interface ResetAction {
  type: typeof ActionTypes.RESET;
}

/**
 * Union type of all possible actions
 */
export type CitationNetworkAction =
  | LoadStartAction
  | LoadSuccessAction
  | LoadErrorAction
  | SetGraphAction
  | AddPapersAction
  | MergeGraphAction
  | SelectPaperAction
  | HoverPaperAction
  | SetFiltersAction
  | SetViewModeAction
  | SetZoomAction
  | SetViewportAction
  | ClearErrorAction
  | ResetAction;

// ============================================================================
// Action Creators
// ============================================================================

/**
 * Action creators for dispatching actions
 */
export const actions = {
  /**
   * Starts loading data (shows loading state)
   */
  loadStart: (): LoadStartAction => ({
    type: ActionTypes.LOAD_START,
  }),

  /**
   * Successfully loaded data
   */
  loadSuccess: (graph: NetworkGraph, papers: Paper[]): LoadSuccessAction => ({
    type: ActionTypes.LOAD_SUCCESS,
    payload: { graph, papers },
  }),

  /**
   * Error occurred while loading
   */
  loadError: (error: string): LoadErrorAction => ({
    type: ActionTypes.LOAD_ERROR,
    payload: { error },
  }),

  /**
   * Sets the current graph
   */
  setGraph: (graph: NetworkGraph): SetGraphAction => ({
    type: ActionTypes.SET_GRAPH,
    payload: { graph },
  }),

  /**
   * Adds new papers to the paper map
   */
  addPapers: (papers: Paper[]): AddPapersAction => ({
    type: ActionTypes.ADD_PAPERS,
    payload: { papers },
  }),

  /**
   * Merges a new graph with the existing graph
   */
  mergeGraph: (graph: NetworkGraph, papers: Paper[]): MergeGraphAction => ({
    type: ActionTypes.MERGE_GRAPH,
    payload: { graph, papers },
  }),

  /**
   * Selects a paper (or deselects if null)
   */
  selectPaper: (paperId: string | null): SelectPaperAction => ({
    type: ActionTypes.SELECT_PAPER,
    payload: { paperId },
  }),

  /**
   * Hovers over a paper (or clears hover if null)
   */
  hoverPaper: (paperId: string | null): HoverPaperAction => ({
    type: ActionTypes.HOVER_PAPER,
    payload: { paperId },
  }),

  /**
   * Updates filter settings (partial update)
   */
  setFilters: (filters: Partial<FilterState>): SetFiltersAction => ({
    type: ActionTypes.SET_FILTERS,
    payload: { filters },
  }),

  /**
   * Changes the view mode
   */
  setViewMode: (viewMode: 'graph' | 'list' | 'timeline'): SetViewModeAction => ({
    type: ActionTypes.SET_VIEW_MODE,
    payload: { viewMode },
  }),

  /**
   * Sets the zoom level
   */
  setZoom: (zoomLevel: number): SetZoomAction => ({
    type: ActionTypes.SET_ZOOM,
    payload: { zoomLevel },
  }),

  /**
   * Sets the viewport center position
   */
  setViewport: (center: [number, number]): SetViewportAction => ({
    type: ActionTypes.SET_VIEWPORT,
    payload: { center },
  }),

  /**
   * Clears the current error message
   */
  clearError: (): ClearErrorAction => ({
    type: ActionTypes.CLEAR_ERROR,
  }),

  /**
   * Resets the entire state to initial values
   */
  reset: (): ResetAction => ({
    type: ActionTypes.RESET,
  }),
};

// ============================================================================
// Reducer Function
// ============================================================================

/**
 * Main reducer function for citation network state
 *
 * @param state - Current state
 * @param action - Action to apply
 * @returns New state after applying the action
 */
export function citationNetworkReducer(
  state: CitationNetworkState,
  action: CitationNetworkAction
): CitationNetworkState {
  switch (action.type) {
    // ------------------------------------------------------------------------
    // Loading Actions
    // ------------------------------------------------------------------------

    case ActionTypes.LOAD_START:
      return {
        ...state,
        uiState: {
          ...state.uiState,
          isLoading: true,
          error: null,
        },
      };

    case ActionTypes.LOAD_SUCCESS: {
      const { graph, papers } = action.payload;
      const paperMap = new Map(state.papers);

      // Add new papers to the map
      papers.forEach(paper => paperMap.set(paper.id, paper));

      return {
        ...state,
        graph,
        papers: paperMap,
        uiState: {
          ...state.uiState,
          isLoading: false,
          error: null,
        },
      };
    }

    case ActionTypes.LOAD_ERROR:
      return {
        ...state,
        uiState: {
          ...state.uiState,
          isLoading: false,
          error: action.payload.error,
        },
      };

    // ------------------------------------------------------------------------
    // Graph Manipulation Actions
    // ------------------------------------------------------------------------

    case ActionTypes.SET_GRAPH:
      return {
        ...state,
        graph: action.payload.graph,
      };

    case ActionTypes.ADD_PAPERS: {
      const paperMap = new Map(state.papers);
      action.payload.papers.forEach(paper => paperMap.set(paper.id, paper));

      return {
        ...state,
        papers: paperMap,
      };
    }

    case ActionTypes.MERGE_GRAPH: {
      const { graph: newGraph, papers } = action.payload;

      if (!state.graph) {
        // No existing graph, just set the new one
        const paperMap = new Map();
        papers.forEach(paper => paperMap.set(paper.id, paper));

        return {
          ...state,
          graph: newGraph,
          papers: paperMap,
        };
      }

      // Merge graphs
      const nodeMap = new Map(state.graph.nodes.map(n => [n.id, n]));
      const edgeMap = new Map(state.graph.edges.map(e => [e.id, e]));
      const paperMap = new Map(state.papers);

      // Add new nodes
      newGraph.nodes.forEach(node => {
        if (!nodeMap.has(node.id)) {
          nodeMap.set(node.id, node);
        }
      });

      // Add new edges
      newGraph.edges.forEach(edge => {
        if (!edgeMap.has(edge.id)) {
          edgeMap.set(edge.id, edge);
        }
      });

      // Add new papers
      papers.forEach(paper => paperMap.set(paper.id, paper));

      return {
        ...state,
        graph: {
          nodes: Array.from(nodeMap.values()),
          edges: Array.from(edgeMap.values()),
          originPaperId: state.graph.originPaperId,
          lastUpdated: Date.now(),
        },
        papers: paperMap,
      };
    }

    // ------------------------------------------------------------------------
    // UI State Actions
    // ------------------------------------------------------------------------

    case ActionTypes.SELECT_PAPER: {
      const { paperId } = action.payload;

      // Update selection state in nodes
      const updatedGraph = state.graph
        ? {
            ...state.graph,
            nodes: state.graph.nodes.map(node => ({
              ...node,
              isSelected: node.id === paperId,
            })),
          }
        : null;

      return {
        ...state,
        graph: updatedGraph,
        uiState: {
          ...state.uiState,
          selectedPaperId: paperId,
        },
      };
    }

    case ActionTypes.HOVER_PAPER:
      return {
        ...state,
        uiState: {
          ...state.uiState,
          hoveredPaperId: action.payload.paperId,
        },
      };

    case ActionTypes.SET_FILTERS:
      return {
        ...state,
        uiState: {
          ...state.uiState,
          filters: {
            ...state.uiState.filters,
            ...action.payload.filters,
          },
        },
      };

    case ActionTypes.SET_VIEW_MODE:
      return {
        ...state,
        uiState: {
          ...state.uiState,
          viewMode: action.payload.viewMode,
        },
      };

    case ActionTypes.SET_ZOOM:
      return {
        ...state,
        uiState: {
          ...state.uiState,
          zoomLevel: action.payload.zoomLevel,
        },
      };

    case ActionTypes.SET_VIEWPORT:
      return {
        ...state,
        uiState: {
          ...state.uiState,
          viewportCenter: action.payload.center,
        },
      };

    // ------------------------------------------------------------------------
    // Utility Actions
    // ------------------------------------------------------------------------

    case ActionTypes.CLEAR_ERROR:
      return {
        ...state,
        uiState: {
          ...state.uiState,
          error: null,
        },
      };

    case ActionTypes.RESET:
      return initialState;

    default:
      return state;
  }
}
