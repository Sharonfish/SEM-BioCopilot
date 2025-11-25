/**
 * Citation Network Context
 *
 * This module provides React Context for managing global citation network state.
 * It wraps the reducer and provides actions and computed values to child components.
 *
 * @module context/CitationNetworkContext
 */

'use client';

import React, { createContext, useReducer, useMemo, useCallback } from 'react';
import type {
  Paper,
  NetworkGraph,
  UIState,
  FilterState,
} from '@/types/citationNetwork';

import {
  citationNetworkReducer,
  initialState,
  actions,
  type CitationNetworkState,
} from '@/reducers/citationNetworkReducer';

import {
  buildNetworkGraph,
  filterGraph,
  calculateNodePositions,
  findConnectedPapers,
} from '@/utils/graphTransformers';

import { searchPapers } from '@/services/apifyScholarApi';

// ============================================================================
// Context Type Definition
// ============================================================================

/**
 * Context type that will be provided to consumers
 */
export interface CitationNetworkContextType {
  // -------------------------------------------------------------------------
  // Data State
  // -------------------------------------------------------------------------

  /** The current network graph (may be null if not loaded) */
  graph: NetworkGraph | null;

  /** Map of paper ID to paper data for quick lookup */
  papers: Map<string, Paper>;

  // -------------------------------------------------------------------------
  // UI State
  // -------------------------------------------------------------------------

  /** Current UI state (loading, errors, selections, filters) */
  uiState: UIState;

  // -------------------------------------------------------------------------
  // Actions
  // -------------------------------------------------------------------------

  /**
   * Loads a paper network by searching for a paper and building the citation graph
   * @param query - Search query to find the origin paper
   */
  loadPaperNetwork: (query: string) => Promise<void>;

  /**
   * Sets a new origin paper and rebuilds the graph
   * @param paperId - ID of the paper to use as origin
   */
  setOriginPaper: (paperId: string) => void;

  /**
   * Selects a paper (highlights it in the UI)
   * @param paperId - ID of the paper to select, or null to deselect
   */
  selectPaper: (paperId: string | null) => void;

  /**
   * Sets hover state for a paper
   * @param paperId - ID of the paper being hovered, or null
   */
  hoverPaper: (paperId: string | null) => void;

  /**
   * Updates filter settings (partial update)
   * @param filters - Filter values to update
   */
  setFilters: (filters: Partial<FilterState>) => void;

  /**
   * Expands a node by fetching its citations and adding them to the graph
   * @param paperId - ID of the paper to expand
   */
  expandNode: (paperId: string) => Promise<void>;

  /**
   * Changes the view mode
   * @param mode - New view mode
   */
  setViewMode: (mode: 'graph' | 'list' | 'timeline') => void;

  /**
   * Sets the zoom level
   * @param zoom - New zoom level
   */
  setZoom: (zoom: number) => void;

  /**
   * Clears the current error message
   */
  clearError: () => void;

  /**
   * Resets the entire state
   */
  reset: () => void;

  // -------------------------------------------------------------------------
  // Computed Values
  // -------------------------------------------------------------------------

  /**
   * The graph after applying current filters
   */
  filteredGraph: NetworkGraph | null;

  /**
   * The currently selected paper (or null)
   */
  selectedPaper: Paper | null;

  /**
   * The currently hovered paper (or null)
   */
  hoveredPaper: Paper | null;
}

// ============================================================================
// Create Context
// ============================================================================

/**
 * React Context for citation network state
 */
export const CitationNetworkContext = createContext<CitationNetworkContextType | null>(
  null
);

// ============================================================================
// Provider Component
// ============================================================================

/**
 * Props for CitationNetworkProvider
 */
interface CitationNetworkProviderProps {
  children: React.ReactNode;
}

/**
 * Provider component that wraps the app and provides citation network state
 *
 * @example
 * <CitationNetworkProvider>
 *   <App />
 * </CitationNetworkProvider>
 */
export function CitationNetworkProvider({ children }: CitationNetworkProviderProps) {
  const [state, dispatch] = useReducer(citationNetworkReducer, initialState);

  // -------------------------------------------------------------------------
  // Actions
  // -------------------------------------------------------------------------

  /**
   * Loads a paper network by searching for papers and building a graph
   */
  const loadPaperNetwork = useCallback(async (query: string) => {
    try {
      dispatch(actions.loadStart());

      // Search for papers using Apify API
      const papers = await searchPapers(query, { maxResults: 20 });

      if (papers.length === 0) {
        dispatch(actions.loadError('No papers found for this query'));
        return;
      }

      // Use the first paper as the origin
      const originPaper = papers[0];

      // Build the network graph
      let graph = buildNetworkGraph(papers, originPaper.id);

      // Calculate node positions
      graph = calculateNodePositions(graph);

      // Dispatch success
      dispatch(actions.loadSuccess(graph, papers));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to load paper network';
      dispatch(actions.loadError(errorMessage));
    }
  }, []);

  /**
   * Sets a new origin paper and rebuilds the graph
   */
  const setOriginPaper = useCallback(
    (paperId: string) => {
      if (!state.graph) return;

      const papers = Array.from(state.papers.values());
      let newGraph = buildNetworkGraph(papers, paperId);
      newGraph = calculateNodePositions(newGraph);

      dispatch(actions.setGraph(newGraph));
    },
    [state.graph, state.papers]
  );

  /**
   * Selects a paper
   */
  const selectPaper = useCallback((paperId: string | null) => {
    dispatch(actions.selectPaper(paperId));
  }, []);

  /**
   * Sets hover state
   */
  const hoverPaper = useCallback((paperId: string | null) => {
    dispatch(actions.hoverPaper(paperId));
  }, []);

  /**
   * Updates filters
   */
  const setFilters = useCallback((filters: Partial<FilterState>) => {
    dispatch(actions.setFilters(filters));
  }, []);

  /**
   * Expands a node by fetching related papers
   *
   * In a real implementation, this would make API calls to fetch citations.
   * For now, it's a placeholder that simulates expansion.
   */
  const expandNode = useCallback(
    async (paperId: string) => {
      try {
        dispatch(actions.loadStart());

        // In a real implementation, fetch citations from API
        // For now, we'll just use existing papers
        const allPapers = Array.from(state.papers.values());
        const { prior, derivative } = findConnectedPapers(paperId, allPapers);

        // Add newly discovered papers (if any)
        const newPapers = [...prior, ...derivative].filter(
          p => !state.papers.has(p.id)
        );

        if (newPapers.length > 0) {
          dispatch(actions.addPapers(newPapers));

          // Rebuild graph with new papers
          const allPapersNow = [...Array.from(state.papers.values()), ...newPapers];
          let newGraph = buildNetworkGraph(
            allPapersNow,
            state.graph?.originPaperId || paperId
          );
          newGraph = calculateNodePositions(newGraph);

          dispatch(actions.setGraph(newGraph));
        }

        dispatch(actions.clearError());
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to expand node';
        dispatch(actions.loadError(errorMessage));
      }
    },
    [state.papers, state.graph]
  );

  /**
   * Sets view mode
   */
  const setViewMode = useCallback((mode: 'graph' | 'list' | 'timeline') => {
    dispatch(actions.setViewMode(mode));
  }, []);

  /**
   * Sets zoom level
   */
  const setZoom = useCallback((zoom: number) => {
    dispatch(actions.setZoom(zoom));
  }, []);

  /**
   * Clears error
   */
  const clearError = useCallback(() => {
    dispatch(actions.clearError());
  }, []);

  /**
   * Resets state
   */
  const reset = useCallback(() => {
    dispatch(actions.reset());
  }, []);

  // -------------------------------------------------------------------------
  // Computed Values (Memoized)
  // -------------------------------------------------------------------------

  /**
   * Filtered graph based on current filter settings
   */
  const filteredGraph = useMemo(() => {
    if (!state.graph) return null;
    return filterGraph(state.graph, state.uiState.filters);
  }, [state.graph, state.uiState.filters]);

  /**
   * Currently selected paper
   */
  const selectedPaper = useMemo(() => {
    if (!state.uiState.selectedPaperId) return null;
    return state.papers.get(state.uiState.selectedPaperId) || null;
  }, [state.uiState.selectedPaperId, state.papers]);

  /**
   * Currently hovered paper
   */
  const hoveredPaper = useMemo(() => {
    if (!state.uiState.hoveredPaperId) return null;
    return state.papers.get(state.uiState.hoveredPaperId) || null;
  }, [state.uiState.hoveredPaperId, state.papers]);

  // -------------------------------------------------------------------------
  // Context Value
  // -------------------------------------------------------------------------

  const contextValue: CitationNetworkContextType = useMemo(
    () => ({
      // State
      graph: state.graph,
      papers: state.papers,
      uiState: state.uiState,

      // Actions
      loadPaperNetwork,
      setOriginPaper,
      selectPaper,
      hoverPaper,
      setFilters,
      expandNode,
      setViewMode,
      setZoom,
      clearError,
      reset,

      // Computed
      filteredGraph,
      selectedPaper,
      hoveredPaper,
    }),
    [
      state,
      loadPaperNetwork,
      setOriginPaper,
      selectPaper,
      hoverPaper,
      setFilters,
      expandNode,
      setViewMode,
      setZoom,
      clearError,
      reset,
      filteredGraph,
      selectedPaper,
      hoveredPaper,
    ]
  );

  return (
    <CitationNetworkContext.Provider value={contextValue}>
      {children}
    </CitationNetworkContext.Provider>
  );
}
