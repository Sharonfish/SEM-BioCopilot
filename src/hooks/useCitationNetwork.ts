/**
 * useCitationNetwork Hook
 *
 * Custom hook that provides easy access to the Citation Network Context.
 * This is the primary way components should interact with citation network state.
 *
 * @module hooks/useCitationNetwork
 */

'use client';

import { useContext } from 'react';
import {
  CitationNetworkContext,
  type CitationNetworkContextType,
} from '@/context/CitationNetworkContext';

/**
 * Custom hook to access citation network context
 *
 * @throws {Error} If used outside of CitationNetworkProvider
 * @returns Citation network context value
 *
 * @example
 * function MyComponent() {
 *   const { graph, loadPaperNetwork, selectPaper } = useCitationNetwork();
 *
 *   useEffect(() => {
 *     loadPaperNetwork('CRISPR gene editing');
 *   }, []);
 *
 *   return (
 *     <div>
 *       {graph?.nodes.map(node => (
 *         <button key={node.id} onClick={() => selectPaper(node.id)}>
 *           {node.paper.title}
 *         </button>
 *       ))}
 *     </div>
 *   );
 * }
 */
export function useCitationNetwork(): CitationNetworkContextType {
  const context = useContext(CitationNetworkContext);

  if (!context) {
    throw new Error(
      'useCitationNetwork must be used within a CitationNetworkProvider. ' +
        'Make sure your component is wrapped with <CitationNetworkProvider>.'
    );
  }

  return context;
}

/**
 * Hook to access only the graph data (optimized selector)
 *
 * @returns The current network graph (or null if not loaded)
 *
 * @example
 * function GraphVisualization() {
 *   const graph = useCitationNetworkGraph();
 *
 *   if (!graph) return <div>No graph loaded</div>;
 *
 *   return <GraphRenderer graph={graph} />;
 * }
 */
export function useCitationNetworkGraph() {
  const { graph } = useCitationNetwork();
  return graph;
}

/**
 * Hook to access only the UI state (optimized selector)
 *
 * @returns Current UI state
 *
 * @example
 * function LoadingSpinner() {
 *   const uiState = useCitationNetworkUI();
 *
 *   if (!uiState.isLoading) return null;
 *
 *   return <Spinner />;
 * }
 */
export function useCitationNetworkUI() {
  const { uiState } = useCitationNetwork();
  return uiState;
}

/**
 * Hook to access only the papers map (optimized selector)
 *
 * @returns Map of paper ID to Paper
 *
 * @example
 * function PaperList() {
 *   const papers = useCitationNetworkPapers();
 *   const paperArray = Array.from(papers.values());
 *
 *   return (
 *     <ul>
 *       {paperArray.map(paper => (
 *         <li key={paper.id}>{paper.title}</li>
 *       ))}
 *     </ul>
 *   );
 * }
 */
export function useCitationNetworkPapers() {
  const { papers } = useCitationNetwork();
  return papers;
}

/**
 * Hook to access only the actions (optimized selector)
 *
 * @returns Object with all action functions
 *
 * @example
 * function SearchBar() {
 *   const { loadPaperNetwork } = useCitationNetworkActions();
 *   const [query, setQuery] = useState('');
 *
 *   const handleSearch = () => {
 *     loadPaperNetwork(query);
 *   };
 *
 *   return (
 *     <div>
 *       <input value={query} onChange={e => setQuery(e.target.value)} />
 *       <button onClick={handleSearch}>Search</button>
 *     </div>
 *   );
 * }
 */
export function useCitationNetworkActions() {
  const {
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
  } = useCitationNetwork();

  return {
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
  };
}

/**
 * Hook to access the selected paper
 *
 * @returns The currently selected paper (or null)
 *
 * @example
 * function PaperDetails() {
 *   const selectedPaper = useSelectedPaper();
 *
 *   if (!selectedPaper) return <div>No paper selected</div>;
 *
 *   return (
 *     <div>
 *       <h1>{selectedPaper.title}</h1>
 *       <p>Authors: {selectedPaper.authors.join(', ')}</p>
 *       <p>Year: {selectedPaper.year}</p>
 *     </div>
 *   );
 * }
 */
export function useSelectedPaper() {
  const { selectedPaper } = useCitationNetwork();
  return selectedPaper;
}

/**
 * Hook to access the filtered graph
 *
 * @returns The graph after applying current filters
 *
 * @example
 * function FilteredGraphView() {
 *   const filteredGraph = useFilteredGraph();
 *
 *   if (!filteredGraph) return <div>No data</div>;
 *
 *   return (
 *     <div>
 *       <p>Showing {filteredGraph.nodes.length} papers</p>
 *       <GraphRenderer graph={filteredGraph} />
 *     </div>
 *   );
 * }
 */
export function useFilteredGraph() {
  const { filteredGraph } = useCitationNetwork();
  return filteredGraph;
}

/**
 * Hook to check if data is currently loading
 *
 * @returns True if loading, false otherwise
 *
 * @example
 * function MyComponent() {
 *   const isLoading = useIsLoading();
 *
 *   return (
 *     <div>
 *       {isLoading ? <Spinner /> : <Content />}
 *     </div>
 *   );
 * }
 */
export function useIsLoading() {
  const { uiState } = useCitationNetwork();
  return uiState.isLoading;
}

/**
 * Hook to access the current error message
 *
 * @returns Error message string (or null if no error)
 *
 * @example
 * function ErrorDisplay() {
 *   const error = useError();
 *   const { clearError } = useCitationNetworkActions();
 *
 *   if (!error) return null;
 *
 *   return (
 *     <div className="error">
 *       {error}
 *       <button onClick={clearError}>Dismiss</button>
 *     </div>
 *   );
 * }
 */
export function useError() {
  const { uiState } = useCitationNetwork();
  return uiState.error;
}
