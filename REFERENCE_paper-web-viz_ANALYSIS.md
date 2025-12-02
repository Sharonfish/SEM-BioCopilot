# Reference: paper-web-viz Analysis

**Repository:** https://github.com/kikyou7777/paper-web-viz.git
**Date Analyzed:** 2025-12-01
**Purpose:** Study UI/UX patterns, visual design, and interactive features for BioCopilot Citation Network

---

## 📊 Technology Stack

### Core Framework
- **React 18.3.1** - Component-based UI
- **TypeScript 5.8.3** - Type safety
- **Vite 5.4.19** - Fast build tool (vs our Next.js)

### Graph Visualization
- **react-force-graph-2d 1.29.0** - Force-directed graph layout
  - Based on D3.js force simulation
  - Provides physics-based node positioning
  - **Different from our ReactFlow** (hierarchical Dagre layout)

### UI Components
- **shadcn-ui** - High-quality, accessible components via Radix UI
- **Tailwind CSS 3.4.17** - Utility-first CSS
- **lucide-react 0.462.0** - Icon library

### Key Differences from BioCopilot
| Feature | paper-web-viz | BioCopilot (Current) |
|---------|---------------|----------------------|
| Framework | React + Vite | Next.js 14 |
| Graph Library | react-force-graph-2d | ReactFlow + Dagre |
| Layout | Force-directed (physics) | Hierarchical (directed) |
| Styling | Tailwind CSS | CSS + Inline styles |
| UI Library | shadcn-ui (Radix) | Custom components |

---

## 🎨 Visual Design Highlights

### 1. HSL Color System

**Location:** `src/index.css`

**Light Mode Graph Colors:**
```css
--node-light: 185 25% 75%;     /* Light teal */
--node-medium: 185 28% 58%;    /* Medium teal */
--node-dark: 185 30% 45%;      /* Dark teal */
--node-darker: 185 32% 35%;    /* Darker teal */
--link-color: 185 15% 85%;     /* Light gray-teal */
--highlight-ring: 330 65% 55%; /* Pink accent */
```

**Dark Mode Graph Colors:**
```css
--node-light: 185 25% 55%;
--node-medium: 185 28% 45%;
--node-dark: 185 30% 35%;
--node-darker: 185 32% 28%;
--link-color: 185 15% 30%;     /* Dark gray-teal */
--highlight-ring: 330 65% 55%; /* Same pink accent */
```

**Benefits:**
- ✅ Consistent color palette across light/dark modes
- ✅ Easy to adjust hue/saturation/lightness independently
- ✅ Better for accessibility (WCAG compliant)
- ✅ Smooth transitions between themes

**How We Can Apply:**
Convert our current color system to HSL-based CSS custom properties for easier theme management.

---

### 2. Node Color Gradation

**Location:** `src/components/NetworkGraph.tsx:137-146`

```typescript
const getNodeColor = (node: Node) => {
  if (node.highlighted) {
    return "hsl(var(--node-dark))";
  }
  // Vary colors based on node size (val = citation count)
  if (node.val > 180) return "hsl(var(--node-darker))";
  if (node.val > 150) return "hsl(var(--node-dark))";
  if (node.val > 130) return "hsl(var(--node-medium))";
  return "hsl(var(--node-light))";
};
```

**Visual Effect:**
- **Higher citations = Darker color** (more visually prominent)
- **4-tier color system** (darker > dark > medium > light)
- **Special highlight** for selected/important nodes

**How We Can Apply:**
We already implement this in Phase 2, but we use recency instead of citation count. We could combine both:
- **Color hue** = Based on recency (as we do now)
- **Color darkness** = Based on citation count (as they do)

---

### 3. Canvas-Based Node Rendering

**Location:** `src/components/NetworkGraph.tsx:208-236`

```typescript
nodeCanvasObject={(node: any, ctx, globalScale) => {
  const label = `${node.name}, ${node.year}`;
  const fontSize = 12 / globalScale;  // ← Scale-aware font size
  ctx.font = `${fontSize}px Inter, sans-serif`;

  const size = Math.sqrt(node.val) * 0.8;  // ← Log-scale sizing

  // Draw node circle
  ctx.beginPath();
  ctx.arc(node.x, node.y, size, 0, 2 * Math.PI);
  ctx.fillStyle = getNodeColor(node);
  ctx.fill();

  // Draw highlight ring if highlighted
  if (node.highlighted) {
    ctx.strokeStyle = "hsl(var(--highlight-ring))";
    ctx.lineWidth = 3 / globalScale;  // ← Scale-aware line width
    ctx.arc(node.x, node.y, size + 4 / globalScale, 0, 2 * Math.PI);
    ctx.stroke();
  }

  // Draw label
  ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
  ctx.fillText(label, node.x, node.y);
}
```

**Key Techniques:**
1. **Scale-aware sizing** - Font and line width adjust based on zoom level
2. **Log-scale node sizing** - `Math.sqrt(val)` for better visual distribution
3. **Highlight rings** - Visual feedback for important nodes
4. **Direct canvas rendering** - Better performance than SVG/DOM for many nodes

**How We Can Apply:**
ReactFlow uses SVG rendering, so direct translation isn't possible. However, we can:
- Use similar log-scale sizing formulas
- Add highlight rings via CSS box-shadow (as we do with glow)
- Ensure our styling scales well at different zoom levels

---

## 🎯 Interactive Features

### 1. Zoom Controls

**Location:** `src/components/NetworkGraph.tsx:148-164`

```typescript
const handleZoomIn = () => {
  if (fgRef.current) {
    fgRef.current.zoom(fgRef.current.zoom() * 1.2, 400);  // 20% zoom with 400ms animation
  }
};

const handleZoomOut = () => {
  if (fgRef.current) {
    fgRef.current.zoom(fgRef.current.zoom() * 0.8, 400);  // 80% zoom
  }
};

const handleResetView = () => {
  if (fgRef.current) {
    fgRef.current.zoomToFit(400, 80);  // Fit all nodes with 80px padding
  }
};
```

**UI Implementation:**
```typescript
<div className="absolute top-6 left-6 z-10 flex flex-col gap-2">
  <Button onClick={handleZoomIn} size="icon" variant="secondary">
    <ZoomIn className="h-4 w-4" />
  </Button>
  <Button onClick={handleZoomOut} size="icon" variant="secondary">
    <ZoomOut className="h-4 w-4" />
  </Button>
  <Button onClick={handleResetView} size="icon" variant="secondary">
    <Maximize2 className="h-4 w-4" />
  </Button>
</div>
```

**Visual Design:**
- **Vertical button stack** in top-left corner
- **Icon-only buttons** (clean, minimalist)
- **Shadow elevation** for depth (`shadow-lg`)
- **z-index layering** to stay above graph

**How We Can Apply:**
ReactFlow has built-in zoom controls, but we could enhance them with:
- Custom styled buttons matching this design
- Smooth animations (400ms transition)
- "Fit View" button with padding control

---

### 2. Hover Tooltip

**Location:** `src/components/NetworkGraph.tsx:195-200`

```typescript
{hoveredNode && (
  <div className="absolute top-6 right-6 z-10 bg-card p-4 rounded-lg shadow-lg border border-border">
    <h3 className="font-semibold text-foreground">{hoveredNode.name}</h3>
    <p className="text-sm text-muted-foreground">{hoveredNode.year}</p>
  </div>
)}
```

**Visual Design:**
- **Fixed position** (top-right, not following cursor)
- **Card style** with shadow and border
- **Semantic color tokens** (foreground, muted-foreground)
- **Clean typography** hierarchy

**How We Can Apply:**
We already have hover tooltips in CustomNode, but we could improve:
- Move to fixed position (less jarring than following cursor)
- Use card-style container with shadow
- Show more metadata (citations, similarity, etc.)

---

### 3. Node Click Interaction

**Location:** `src/components/NetworkGraph.tsx:241-246`

```typescript
onNodeClick={(node: any) => {
  if (fgRef.current) {
    fgRef.current.centerAt(node.x, node.y, 1000);  // Center on node
    fgRef.current.zoom(2, 1000);                    // Zoom to 2x
  }
}}
```

**Behavior:**
- Click node → Camera smoothly centers on it
- Automatically zooms in for detail (2x magnification)
- 1000ms animation duration (smooth, not jarring)

**How We Can Apply:**
ReactFlow has similar `fitView` capabilities. We could add:
- Click to center + zoom behavior
- Smooth animations
- Maybe even highlight connected nodes

---

### 4. Force-Directed Layout Parameters

**Location:** `src/components/NetworkGraph.tsx:247-251`

```typescript
<ForceGraph2D
  cooldownTicks={100}        // Simulation duration (100 frames)
  d3VelocityDecay={0.3}     // Friction/damping (0 = no friction, 1 = instant stop)
  enableNodeDrag={true}      // Allow dragging nodes
  enableZoomInteraction={true}   // Allow mouse wheel zoom
  enablePanInteraction={true}    // Allow click-drag pan
/>
```

**Physics Parameters:**
- **cooldownTicks: 100** - How long the simulation runs before stabilizing
- **d3VelocityDecay: 0.3** - Low value = nodes "float" more (organic movement)

**How We Can Apply:**
We use Dagre (deterministic hierarchical layout), which is different. However:
- We could add drag-and-drop to manually adjust node positions
- Could implement a "relax" mode using force simulation temporarily
- Could add smooth animations when rebuilding graph

---

## 🎓 Key Learnings

### 1. Force-Directed vs Hierarchical Layouts

**Force-Directed (react-force-graph-2d):**
- ✅ **Organic, natural-looking** network
- ✅ **Shows clustering** automatically (connected nodes group together)
- ✅ **Physics-based** (feels "alive", interactive)
- ❌ **Unpredictable positioning** (different each time)
- ❌ **Can be messy** with many nodes
- ❌ **Harder to see hierarchy** (who cites whom)

**Hierarchical (ReactFlow + Dagre):**
- ✅ **Predictable, consistent** layout
- ✅ **Clear hierarchy** (citation direction)
- ✅ **Better for directed graphs** (A → B → C)
- ✅ **Easier to follow** citation chains
- ❌ **Less organic** looking
- ❌ **Clustering not automatic** (must be designed in)

**Recommendation:**
- **Keep Dagre for citation network** (better for showing citation flow)
- **Consider force-directed for semantic network** (better for showing topic clusters)
- **Maybe offer both** as toggle option?

---

### 2. HSL-Based Design System

**What They Do Well:**
- Single color hue (185° = teal) with varying lightness
- Consistent across components
- Easy dark mode (just adjust lightness values)
- CSS custom properties for reusability

**How We Can Apply:**
```css
/* Current BioCopilot (inline RGB) */
style={{ background: '#4CAF50' }}

/* Proposed (HSL custom properties) */
style={{ background: 'hsl(var(--similarity-high))' }}
```

**Benefits:**
- Easier to maintain consistent color palette
- Better dark mode support
- Smoother theme transitions
- More accessible (easier to ensure contrast ratios)

---

### 3. Canvas Rendering vs DOM/SVG

**Canvas Rendering (react-force-graph-2d):**
- ✅ **Better performance** for 100+ nodes
- ✅ **Smooth animations** even with complex visuals
- ✅ **Fine-grained control** over rendering
- ❌ **More complex code** (manual drawing)
- ❌ **Accessibility challenges** (no DOM elements for screen readers)

**SVG Rendering (ReactFlow):**
- ✅ **Better accessibility** (DOM elements)
- ✅ **Easier styling** (CSS, classes)
- ✅ **Better for UI integration** (overlays, tooltips, etc.)
- ❌ **Performance limits** at 200+ nodes
- ❌ **Browser rendering bottleneck**

**Recommendation:**
- Keep ReactFlow/SVG for now (30-50 nodes is fine)
- If we scale to 200+ nodes, consider canvas rendering
- Could hybrid approach: SVG for UI elements, canvas for nodes/edges

---

### 4. Minimal UI Design

**What They Do Well:**
- **Icon-only buttons** (no text clutter)
- **Fixed-position overlays** (not blocking graph)
- **Subtle shadows** for depth
- **Consistent spacing** (Tailwind's `gap-2`, `p-4`, etc.)

**How We Can Apply:**
Our current UI is good, but we could simplify:
- Move zoom controls to floating buttons (like theirs)
- Use more shadcn-ui components (Button, Card, etc.)
- Reduce visual noise in toolbar
- More whitespace, better spacing

---

## 🔄 Recommended Integrations

### Priority 1: HSL Color System
**Effort:** Medium
**Impact:** High

Convert our color system to HSL-based CSS custom properties:

```css
/* Add to globals.css or citationNetwork.css */
:root {
  /* Similarity colors */
  --similarity-high: 122 47% 45%;      /* Green */
  --similarity-medium: 45 100% 51%;    /* Amber */
  --similarity-low: 4 90% 58%;         /* Red */

  /* Recency colors */
  --node-recent: 207 90% 35%;          /* Dark blue */
  --node-medium: 207 90% 55%;          /* Medium blue */
  --node-old: 207 90% 75%;             /* Light blue */

  /* Edge colors */
  --edge-citation: 122 47% 45%;        /* Green */
  --edge-semantic: 24 100% 50%;        /* Orange */
  --edge-reference: 207 90% 54%;       /* Blue */
}

.dark {
  /* Adjust for dark mode */
  --similarity-high: 122 47% 60%;      /* Lighter green */
  --node-recent: 207 90% 45%;          /* Lighter blue */
  /* ... */
}
```

---

### Priority 2: Improved Zoom Controls
**Effort:** Low
**Impact:** Medium

Add floating zoom buttons styled like paper-web-viz:

```typescript
<div className="absolute top-6 left-6 z-50 flex flex-col gap-2">
  <button
    onClick={handleZoomIn}
    className="p-2 bg-white rounded-lg shadow-lg border hover:bg-gray-50"
  >
    <ZoomInIcon />
  </button>
  <button
    onClick={handleZoomOut}
    className="p-2 bg-white rounded-lg shadow-lg border hover:bg-gray-50"
  >
    <ZoomOutIcon />
  </button>
  <button
    onClick={handleFitView}
    className="p-2 bg-white rounded-lg shadow-lg border hover:bg-gray-50"
  >
    <MaximizeIcon />
  </button>
</div>
```

---

### Priority 3: Consider shadcn-ui Migration
**Effort:** High
**Impact:** High

Benefits of using shadcn-ui:
- Pre-built, accessible components
- Consistent design system
- Dark mode support out-of-the-box
- Better TypeScript support
- Active community and documentation

**Gradual Migration Path:**
1. Install shadcn-ui alongside existing components
2. Replace Button component first
3. Gradually replace other components (Card, Tooltip, etc.)
4. Keep custom components where needed (graph-specific)

---

### Priority 4: Force-Directed Semantic View (Bonus)
**Effort:** High
**Impact:** Medium-High

**Idea:** Add alternate view mode using react-force-graph-2d for semantic network

**Use Case:**
- Citation network: Use Dagre (hierarchical, shows citation flow)
- Semantic network: Use force-directed (shows topic clusters)

**Implementation:**
```typescript
const [layoutMode, setLayoutMode] = useState<'hierarchical' | 'force'>('hierarchical');

{layoutMode === 'hierarchical' ? (
  <ReactFlow nodes={nodes} edges={edges} />  // Current
) : (
  <ForceGraph2D graphData={graphData} />     // New
)}
```

---

## 📊 Performance Comparison

### Node Capacity

| Library | Performant | Max Recommended |
|---------|------------|-----------------|
| react-force-graph-2d (Canvas) | 50-500 | 1,000+ |
| ReactFlow (SVG) | 20-100 | 200 |

**Current BioCopilot:** 30-50 nodes (well within ReactFlow limits) ✅

**Recommendation:** Keep ReactFlow for now, monitor performance if scaling up

---

## 🎨 Visual Design Checklist

What we can adopt from paper-web-viz:

- [ ] HSL-based color system with CSS custom properties
- [ ] Dark mode support for graph visualization
- [ ] Floating zoom control buttons (icon-only)
- [ ] Fixed-position hover tooltip (not cursor-following)
- [ ] Highlight rings for selected nodes
- [ ] Log-scale node sizing formula
- [ ] shadcn-ui components for consistent UI
- [ ] Better spacing and whitespace
- [ ] Subtle shadows for depth
- [ ] Smooth zoom/pan animations (400-1000ms)

---

## ✅ Conclusion

**paper-web-viz strengths:**
- Clean, minimalist design
- Excellent HSL-based color system
- Smooth, physics-based interactions
- Well-organized codebase
- Great dark mode support

**What we should adopt:**
1. **HSL color system** (high priority)
2. **Improved zoom controls** (medium priority)
3. **Design patterns** (spacing, shadows, cards)
4. **Consider shadcn-ui** (long-term)

**What we should keep from BioCopilot:**
1. **Hierarchical layout** (better for citation flow)
2. **Rich similarity features** (Phase 1-3 work)
3. **Semantic Scholar integration** (real data)
4. **Three-column layout** (more information density)

**Hybrid Approach:**
- Keep our data layer and features (Phases 1-3)
- Adopt their visual design patterns (colors, spacing, UI)
- Consider force-directed view as alternate mode
- Gradually integrate shadcn-ui components

---

**Repository Cloned To:** `/Users/limingye/Documents/2025Fall/SEM/Biocopilot/paper-web-viz/`
**Can be run with:** `cd paper-web-viz && npm install && npm run dev`
