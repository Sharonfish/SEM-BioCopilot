# Citation Network State Management

This document describes the complete state management system for the citation network visualization feature.

## Architecture Overview

The state management system follows a **unidirectional data flow** pattern using React Context + useReducer:

```
User Action → Dispatch Action → Reducer → New State → Re-render Components
```

## File Structure

```
src/
├── types/
│   └── citationNetwork.ts          # TypeScript type definitions
├── reducers/
│   └── citationNetworkReducer.ts   # State reducer and actions
├── utils/
│   └── graphTransformers.ts        # Graph manipulation utilities
├── context/
│   └── CitationNetworkContext.tsx  # React Context provider
├── hooks/
│   └── useCitationNetwork.ts       # Custom hooks for state access
└── services/
    └── apifyScholarApi.ts          # API integration
```

## Core Components

### 1. Type Definitions (`types/citationNetwork.ts`)

Defines all TypeScript interfaces used throughout the system:

#### Data Types
- **`Paper`** - Scholarly paper with metadata
- **`Citation`** - Citation relationship between papers
- **`NetworkNode`** - Graph node representing a paper
- **`NetworkEdge`** - Graph edge representing a citation
- **`NetworkGraph`** - Complete citation network

#### State Types
- **`FilterState`** - Filter settings for the graph
- **`UIState`** - UI state (loading, errors, selections)
- **`NetworkStats`** - Statistics about the network

### 2. Reducer (`reducers/citationNetworkReducer.ts`)

Manages all state updates through actions:

#### State Structure
```typescript
{
  graph: NetworkGraph | null,        // Current citation network
  papers: Map<string, Paper>,        // All papers (quick lookup)
  uiState: UIState                   // UI state
}
```

#### Available Actions
- **`LOAD_START`** - Start loading data
- **`LOAD_SUCCESS`** - Data loaded successfully
- **`LOAD_ERROR`** - Loading failed
- **`SET_GRAPH`** - Set new graph
- **`ADD_PAPERS`** - Add papers to map
- **`MERGE_GRAPH`** - Merge new graph with existing
- **`SELECT_PAPER`** - Select/deselect a paper
- **`HOVER_PAPER`** - Set hover state
- **`SET_FILTERS`** - Update filters
- **`SET_VIEW_MODE`** - Change view mode
- **`SET_ZOOM`** - Update zoom level
- **`CLEAR_ERROR`** - Clear error message
- **`RESET`** - Reset to initial state

### 3. Graph Transformers (`utils/graphTransformers.ts`)

Utility functions for graph manipulation:

#### Main Functions
- **`buildNetworkGraph(papers, originId)`** - Builds graph from papers
- **`filterGraph(graph, filters)`** - Applies filters to graph
- **`calculateNodePositions(graph)`** - Force-directed layout
- **`findConnectedPapers(paperId, papers)`** - Find citations/references
- **`calculateNetworkStats(graph)`** - Calculate statistics
- **`mergeGraphs(graph1, graph2)`** - Combine two graphs

### 4. Context Provider (`context/CitationNetworkContext.tsx`)

React Context that wraps the app and provides state to all components.

#### Provided Values

**State:**
- `graph` - Current network graph
- `papers` - Map of all papers
- `uiState` - UI state

**Actions:**
- `loadPaperNetwork(query)` - Load papers by search query
- `setOriginPaper(paperId)` - Change origin paper
- `selectPaper(paperId)` - Select a paper
- `hoverPaper(paperId)` - Set hover state
- `setFilters(filters)` - Update filters
- `expandNode(paperId)` - Expand a node (fetch citations)
- `setViewMode(mode)` - Change view mode
- `setZoom(zoom)` - Update zoom
- `clearError()` - Clear error
- `reset()` - Reset state

**Computed Values:**
- `filteredGraph` - Graph after applying filters
- `selectedPaper` - Currently selected paper
- `hoveredPaper` - Currently hovered paper

### 5. Custom Hooks (`hooks/useCitationNetwork.ts`)

Convenient hooks for accessing state in components:

- **`useCitationNetwork()`** - Access full context
- **`useCitationNetworkGraph()`** - Access only graph
- **`useCitationNetworkUI()`** - Access only UI state
- **`useCitationNetworkPapers()`** - Access only papers
- **`useCitationNetworkActions()`** - Access only actions
- **`useSelectedPaper()`** - Access selected paper
- **`useFilteredGraph()`** - Access filtered graph
- **`useIsLoading()`** - Check loading state
- **`useError()`** - Access error message

## Usage Guide

### Step 1: Wrap Your App with Provider

```tsx
// app/layout.tsx or _app.tsx
import { CitationNetworkProvider } from '@/context/CitationNetworkContext';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <CitationNetworkProvider>
          {children}
        </CitationNetworkProvider>
      </body>
    </html>
  );
}
```

### Step 2: Use Hooks in Components

#### Example: Search Component

```tsx
'use client';

import { useState } from 'react';
import { useCitationNetworkActions, useIsLoading } from '@/hooks/useCitationNetwork';

export function SearchBar() {
  const [query, setQuery] = useState('');
  const { loadPaperNetwork } = useCitationNetworkActions();
  const isLoading = useIsLoading();

  const handleSearch = async () => {
    await loadPaperNetwork(query);
  };

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for papers..."
      />
      <button onClick={handleSearch} disabled={isLoading}>
        {isLoading ? 'Searching...' : 'Search'}
      </button>
    </div>
  );
}
```

#### Example: Graph Visualization

```tsx
'use client';

import { useFilteredGraph, useCitationNetworkActions } from '@/hooks/useCitationNetwork';

export function GraphView() {
  const graph = useFilteredGraph();
  const { selectPaper } = useCitationNetworkActions();

  if (!graph) return <div>No graph loaded</div>;

  return (
    <svg width="800" height="600">
      {/* Render edges */}
      {graph.edges.map(edge => (
        <line
          key={edge.id}
          x1={graph.nodes.find(n => n.id === edge.source)?.x}
          y1={graph.nodes.find(n => n.id === edge.source)?.y}
          x2={graph.nodes.find(n => n.id === edge.target)?.x}
          y2={graph.nodes.find(n => n.id === edge.target)?.y}
          stroke="#ccc"
        />
      ))}

      {/* Render nodes */}
      {graph.nodes.map(node => (
        <circle
          key={node.id}
          cx={node.x}
          cy={node.y}
          r={node.isOrigin ? 15 : 10}
          fill={node.isSelected ? 'blue' : 'gray'}
          onClick={() => selectPaper(node.id)}
          style={{ cursor: 'pointer' }}
        />
      ))}
    </svg>
  );
}
```

#### Example: Paper Details Panel

```tsx
'use client';

import { useSelectedPaper, useCitationNetworkActions } from '@/hooks/useCitationNetwork';

export function PaperDetails() {
  const paper = useSelectedPaper();
  const { expandNode } = useCitationNetworkActions();

  if (!paper) return <div>No paper selected</div>;

  return (
    <div>
      <h2>{paper.title}</h2>
      <p>Authors: {paper.authors.join(', ')}</p>
      <p>Year: {paper.year}</p>
      <p>Citations: {paper.citationCount}</p>
      <p>{paper.abstract}</p>
      <button onClick={() => expandNode(paper.id)}>
        Expand Citations
      </button>
    </div>
  );
}
```

#### Example: Filter Controls

```tsx
'use client';

import { useCitationNetworkUI, useCitationNetworkActions } from '@/hooks/useCitationNetwork';

export function FilterPanel() {
  const { filters } = useCitationNetworkUI();
  const { setFilters } = useCitationNetworkActions();

  return (
    <div>
      <label>
        Min Citations:
        <input
          type="number"
          value={filters.minCitations}
          onChange={(e) => setFilters({ minCitations: parseInt(e.target.value) })}
        />
      </label>

      <label>
        Year Range:
        <input
          type="range"
          min={1900}
          max={new Date().getFullYear()}
          value={filters.yearRange[0]}
          onChange={(e) => setFilters({
            yearRange: [parseInt(e.target.value), filters.yearRange[1]]
          })}
        />
        to
        <input
          type="range"
          min={1900}
          max={new Date().getFullYear()}
          value={filters.yearRange[1]}
          onChange={(e) => setFilters({
            yearRange: [filters.yearRange[0], parseInt(e.target.value)]
          })}
        />
      </label>

      <label>
        <input
          type="checkbox"
          checked={filters.showPriorWorks}
          onChange={(e) => setFilters({ showPriorWorks: e.target.checked })}
        />
        Show Prior Works
      </label>

      <label>
        <input
          type="checkbox"
          checked={filters.showDerivativeWorks}
          onChange={(e) => setFilters({ showDerivativeWorks: e.target.checked })}
        />
        Show Derivative Works
      </label>
    </div>
  );
}
```

## Best Practices

### 1. Use Specific Hooks
Instead of using `useCitationNetwork()` everywhere, use specific hooks:
```tsx
// ❌ Less optimal
const { graph } = useCitationNetwork();

// ✅ Better - only subscribes to graph changes
const graph = useCitationNetworkGraph();
```

### 2. Memoize Expensive Computations
```tsx
const stats = useMemo(() => {
  return calculateNetworkStats(graph);
}, [graph]);
```

### 3. Handle Loading and Error States
```tsx
const isLoading = useIsLoading();
const error = useError();

if (isLoading) return <Spinner />;
if (error) return <ErrorMessage message={error} />;
```

### 4. Batch State Updates
Instead of multiple dispatches, update filters together:
```tsx
// ✅ Good - single update
setFilters({
  yearRange: [2010, 2020],
  minCitations: 10,
  searchQuery: 'CRISPR'
});
```

## Performance Considerations

1. **Memoization** - All computed values are memoized using `useMemo`
2. **Selective Re-renders** - Use specific hooks to minimize re-renders
3. **Map for Papers** - Quick O(1) lookup by paper ID
4. **Filtered Graph** - Filters applied once, cached until dependencies change

## Testing the System

See `APIFY_SETUP.md` for testing the API integration.

To test the state management:

```tsx
// Create a test component
function TestComponent() {
  const { loadPaperNetwork } = useCitationNetworkActions();
  const graph = useFilteredGraph();

  useEffect(() => {
    loadPaperNetwork('machine learning');
  }, []);

  return <pre>{JSON.stringify(graph, null, 2)}</pre>;
}
```

## Next Steps

1. ✅ Implement graph visualization component
2. ✅ Add timeline view
3. ✅ Implement search and filter UI
4. ✅ Add node expansion (fetch citations)
5. ✅ Implement zoom and pan controls
6. ✅ Add export functionality
