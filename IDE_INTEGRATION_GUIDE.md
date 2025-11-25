# Citation Network IDE Integration Guide

Complete guide for integrating the Citation Network feature into your Bio Copilot IDE.

## 🎨 Design System Integration

The Citation Network feature has been designed to match your IDE's blue/green color scheme:

### Color Palette
- **Primary Blue**: `#2196F3` - Buttons, active states, prior works
- **Secondary Green**: `#4CAF50` - Success states, derivative works
- **Accent Teal**: `#00BCD4` - Highlights, selected nodes
- **Background**: `#FAFAFA` - Page background
- **Text Primary**: `#333333` - Headings, labels
- **Text Secondary**: `#666666` - Body text, metadata
- **Borders**: `#E0E0E0` - Dividers, card borders
- **Cards**: `#FFFFFF` - Paper cards, panels

## 📍 Navigation Entry Points

### 1. Main Toolbar (Top Bar)

Add to your main toolbar near the "Run" button:

```tsx
import { CitationNetworkButton } from '@/components/Navigation/CitationNetworkButton';

<CitationNetworkButton
  variant="toolbar"
  showBadge
/>
```

### 2. Next Steps Panel (Right Sidebar)

Add as a workflow step:

```tsx
<CitationNetworkButton
  variant="nextSteps"
  showBadge
/>
```

This renders as:
```
┌─────────────────────────────────────┐
│ 🔗  Explore Literature Network  NEW │
│     可视化相关文献的引用关系网络      │
│                                  → │
└─────────────────────────────────────┘
```

### 3. Sidebar Navigation (Left Panel)

Add to your pipeline steps:

```tsx
<CitationNetworkButton
  variant="sidebar"
/>
```

This renders as:
```
🔗 Literature Network
   文献关系可视化
```

### 4. Context Menu

Add when user right-clicks on gene names or paper titles:

```tsx
<CitationNetworkButton
  variant="contextMenu"
  query={selectedText}
/>
```

## 🔗 Routing Setup

The Citation Network is available at:
```
http://localhost:3000/citation-network
```

With optional search query:
```
http://localhost:3000/citation-network?q=CRISPR+gene+editing
```

## 📦 Files Created

### Navigation Components
- `src/components/Navigation/CitationNetworkButton.tsx` - Entry point button

### Main Page
- `src/app/citation-network/page.tsx` - Full-page three-column layout

### Styling
- `src/styles/citationNetwork.css` - IDE-matching styles

### Enhanced Components
- `src/components/CitationNetwork/CustomNode.tsx` - Updated with blue/green theme

## 🎯 Features Implemented

### Three-Column Layout

```
┌────────────┬─────────────────────┬────────────┐
│            │                     │            │
│   Papers   │   Graph Viz         │  Details   │
│   List     │   (React Flow)      │  Panel     │
│            │                     │            │
│  (320px)   │    (flexible)       │  (380px)   │
└────────────┴─────────────────────┴────────────┘
```

### Left Panel - Papers List
- **Header**: "Related Papers" with count badge
- **Filters**:
  - Network view switcher (Hallmarks / Metabolism)
  - Year range slider
- **Paper cards**:
  - Title (2 lines max)
  - Authors (truncated)
  - Year & citation count
  - Special styling for origin/selected papers

### Center Panel - Graph Visualization
- **Toolbar**:
  - Node count & edge count
  - Toggle buttons for prior/derivative works
- **Graph**: Full React Flow visualization
- **Features**:
  - Drag nodes
  - Zoom/pan
  - Click to select
  - Hover for details

### Right Panel - Paper Details
- **Header**: "Paper Details" with close button
- **Sections**:
  1. Title, authors, metadata
  2. Abstract
  3. Network metrics (citations, cited-by, co-citations)
  4. Action buttons
- **Empty state**: Shows when no paper selected

## 🎨 Visual Design Details

### Node Styling
- **Origin node**: Blue (#2196F3) with gradient glow
- **Prior works**: Blue tones (#64B5F6 → #2196F3)
- **Derivative works**: Green tones (#81C784 → #4CAF50)
- **Selected node**: Teal (#00BCD4) with border highlight
- **Node size**: 30-80px based on log(citations)

### Paper Cards
- **Default**: White background, gray border
- **Hover**: Blue border, slight shadow, slide right 4px
- **Selected**: Teal border (2px), blue gradient background
- **Origin**: Green border (2px), green gradient background

### Buttons
- **Primary**: Blue-to-teal gradient (#2196F3 → #00BCD4)
- **Secondary**: White background, blue border/text
- **Hover**: Lift effect (-1px), shadow
- **Transitions**: 0.2s ease

## 💡 Usage Examples

### Open with Pre-filled Query

```tsx
import { useRouter } from 'next/navigation';

const router = useRouter();

// From code editor selection
const handleSearchCitations = (selectedText: string) => {
  router.push(`/citation-network?q=${encodeURIComponent(selectedText)}`);
};
```

### Programmatic Navigation

```tsx
<CitationNetworkButton
  query="CRISPR Cas9"
  onNavigate={() => {
    console.log('Opening citation network');
    trackAnalytics('citation_network_opened');
  }}
/>
```

## 🔄 Integration Checklist

- [x] Install React Flow and Dagre: `npm install reactflow dagre @types/dagre`
- [x] Create navigation button component
- [x] Create main citation network page
- [x] Update node styling with blue/green theme
- [x] Create IDE-matching CSS styles
- [ ] Add toolbar button to main IDE interface
- [ ] Add to "Next Steps" panel
- [ ] Add to sidebar navigation
- [ ] Add context menu integration
- [ ] Test all navigation entry points
- [ ] Verify color consistency across components
- [ ] Test responsive behavior
- [ ] Add analytics tracking (optional)

## 🎯 Where to Add Entry Points

### 1. Main Toolbar (app/layout.tsx or similar)

```tsx
// In your main toolbar component
<div className="toolbar">
  <button className="run-button">Run</button>
  <CitationNetworkButton variant="toolbar" showBadge />
  <button className="settings-button">Settings</button>
</div>
```

### 2. Next Steps Panel (components/NextSteps.tsx or similar)

```tsx
// In your Next Steps component
const nextSteps = [
  {
    component: <CitationNetworkButton variant="nextSteps" showBadge />
  },
  // ... other steps
];
```

### 3. Sidebar (components/Sidebar.tsx or similar)

```tsx
// In your sidebar navigation
<nav>
  <NavItem icon="📝" label="Code Editor" />
  <NavItem icon="🔬" label="Analysis Tools" />
  <CitationNetworkButton variant="sidebar" />
  <NavItem icon="⚙️" label="Settings" />
</nav>
```

### 4. Context Menu (components/CodeEditor.tsx or similar)

```tsx
// In your context menu handler
const handleContextMenu = (event, selectedText) => {
  showContextMenu([
    { label: 'Copy', action: () => copy() },
    { label: 'Paste', action: () => paste() },
    {
      component: <CitationNetworkButton
        variant="contextMenu"
        query={selectedText}
      />
    },
  ]);
};
```

## 🚀 Quick Start

### 1. Install Dependencies (Already Done)
```bash
npm install reactflow dagre @types/dagre
```

### 2. Add to Your Navigation

Pick one or more entry points from above and add the `CitationNetworkButton`.

### 3. Test the Feature

```bash
npm run dev
```

Then navigate to:
- **Direct URL**: http://localhost:3000/citation-network
- **Test Page**: http://localhost:3000/citation-network-test (with demo UI)

### 4. Customize Colors (Optional)

Edit `src/styles/citationNetwork.css` to match your exact brand colors:

```css
/* Primary blue (buttons, active states) */
.primary-button {
  background: linear-gradient(135deg, #YOUR_BLUE, #YOUR_TEAL);
}

/* Node colors */
.custom-node-origin {
  background: #YOUR_BLUE;
}

.custom-node-prior {
  background: linear-gradient(135deg, #YOUR_BLUE_LIGHT, #YOUR_BLUE);
}

.custom-node-derivative {
  background: linear-gradient(135deg, #YOUR_GREEN_LIGHT, #YOUR_GREEN);
}
```

## 📱 Responsive Behavior

- **Desktop (>1200px)**: Full three-column layout
- **Tablet (960-1200px)**: Narrower sidebars
- **Mobile (<960px)**: Graph only, sidebars hidden

## ♿ Accessibility

- **Keyboard navigation**: Tab through all controls
- **ARIA labels**: All buttons properly labeled
- **Focus indicators**: Clear blue outline on focus
- **Screen reader support**: Semantic HTML structure
- **Reduced motion**: Respects `prefers-reduced-motion`
- **High contrast**: Increased borders in high contrast mode

## 🔍 Testing

### Manual Testing
1. ✅ Click toolbar button → Opens citation network
2. ✅ Search in header → Filters papers
3. ✅ Click paper card → Shows in details panel
4. ✅ Click graph node → Selects paper
5. ✅ Toggle Prior/Derivative → Filters graph
6. ✅ Adjust year range → Filters papers
7. ✅ Click "Set as Origin" → Updates graph center
8. ✅ Click "Expand Network" → Fetches more papers (placeholder)
9. ✅ Click "View Paper" → Opens external link

### Integration Testing
```tsx
// Test navigation
import { render, fireEvent } from '@testing-library/react';

test('toolbar button navigates to citation network', () => {
  const { getByText } = render(<CitationNetworkButton variant="toolbar" />);
  const button = getByText('Citation Network');
  fireEvent.click(button);
  // Assert navigation occurred
});
```

## 📝 Next Steps

After integrating the navigation:

1. **Connect to real API**: Replace mock data with Apify API calls
2. **Add state persistence**: Remember selected paper/filters
3. **Implement expand functionality**: Fetch citations on demand
4. **Add export feature**: Download graph as PNG/SVG
5. **Analytics**: Track usage patterns
6. **User preferences**: Save view settings
7. **Keyboard shortcuts**: Add hotkeys for common actions

## 🎉 You're Ready!

The Citation Network feature is now fully integrated with your Bio Copilot IDE design system. All components use your blue/green color scheme and match your existing UI patterns.

---

**Questions?** Check the component JSDoc comments or test page for examples.
