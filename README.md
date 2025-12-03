# BioCopilot 🧬

BioCopilot is an intelligent bioinformatics research assistant platform with **Context-Aware IDE**, **Citation Network Visualization**, **Pipeline Management**, and **AI-Powered Code Assistance**.

> **New Feature! 🎉** Interactive Citation Network with intelligent journal filtering - Explore research connections with physics-based visualization!

![BioCopilot Banner](https://img.shields.io/badge/BioCopilot-v0.2.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Core Features

### 🔬 Citation Network Visualization (NEW!)
- **Interactive Force-Directed Graph** - Physics-based network visualization using react-force-graph-2d
- **Real-time Paper Search** - Search biomedical literature via Semantic Scholar API with autocomplete
- **Intelligent Journal Filtering** - Group journals by family (Nature, Science, Cell, JAMA, Lancet, etc.)
  - Expandable journal families with impact factors
  - One-click family selection
  - Paper count badges
  - Brand colors and icons
- **Semantic Similarity Visualization** - Color-coded nodes based on relevance to origin paper
- **Year Range Filtering** - Dynamic timeline slider to filter papers by publication year
- **Paper Details Panel** - View abstracts, citations, authors, and venue information
- **Network Statistics** - Real-time metrics of nodes, edges, and graph density
- **Export Capabilities** - Save network data for further analysis

### 🎯 Intelligent IDE
- **Monaco Editor Integration** - VS Code-level editing experience
- **Multi-file Tab Management** - Easily switch between multiple files
- **Syntax Highlighting** - Support for Python, R, Shell, etc.
- **Real-time Code Execution** - See results instantly
- **AI Code Explanation** - Select code to get intelligent explanations

### 📊 Pipeline Management
- **Visual Workflow** - Clear display of analysis steps
- **Status Tracking** - Real-time monitoring of each step's execution status
- **Data Flow Monitoring** - Automatic tracking of data shape changes
- **Error Handling** - Quick location and fixing of issues

### 🤖 AI Copilot
- **Context-Aware** - Provide suggestions based on current workflow stage
- **Intelligent Code Generation** - AI-assisted bioinformatics code writing
- **Quality Control Suggestions** - Automatic detection of data quality issues
- **One-Click Code Insertion** - Quick application of AI suggestions

### 🎨 Modern UI
- **Dark Mode Support**
- **Responsive Three-Column Layout**
- **Smooth Physics Animations**
- **Intuitive Navigation**

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm / yarn / pnpm

### Install Dependencies

```bash
npm install
```

### Start Development Server

```bash
npm run dev
```

Open your browser and visit [http://localhost:3000](http://localhost:3000)

### Explore Citation Networks

1. Click **"Citation Network"** from the homepage
2. Search for any biomedical topic (e.g., "CRISPR", "cancer immunotherapy")
3. Explore the interactive network visualization
4. Filter by journal families, years, or specific papers
5. Click nodes to view paper details and related work

### Launch IDE

Click the **"Launch IDE"** button on the homepage to enter the BioCopilot IDE interface.

### Try Code Explanation

1. Open any file in the IDE
2. Select a code snippet with your mouse
3. Click the floating "Explain" button
4. Get AI-powered explanation instantly!

### Configuration

**Optional**: Add API keys in `.env.local` for full features:
```bash
# Semantic Scholar API (for citation network)
SEMANTIC_SCHOLAR_API_KEY=your_api_key_here

# OpenAI API (for AI features)
OPENAI_API_KEY=sk-your-api-key-here
```

## 📁 Project Structure

```
BioCopilot/
├── app/                                    # Next.js App Router
│   ├── page.tsx                           # Homepage
│   ├── ide/                               # IDE Page
│   │   └── page.tsx
│   ├── citation-network/                  # Citation Network Page (NEW!)
│   │   └── page.tsx
│   ├── api/                               # API Routes
│   │   ├── execute/                       # Code execution
│   │   ├── copilot/                       # AI Copilot
│   │   └── citation/                      # Citation network APIs (NEW!)
│   │       ├── search/                    # Paper search
│   │       ├── citations/                 # Citation fetching
│   │       └── references/                # Reference fetching
│   ├── layout.tsx                         # Root layout
│   └── globals.css                        # Global styles
│
├── components/                             # React Components
│   ├── ui/                                # Base UI Components
│   │   ├── Button.tsx
│   │   ├── Badge.tsx
│   │   ├── Input.tsx
│   │   ├── Tooltip.tsx
│   │   └── Spinner.tsx
│   ├── ide/                               # IDE Components
│   │   ├── IDELayout.tsx
│   │   ├── TopBar.tsx
│   │   ├── LeftSidebar/
│   │   │   └── PipelineSteps.tsx
│   │   ├── Editor/
│   │   │   ├── CodeEditor.tsx
│   │   │   └── TabBar.tsx
│   │   └── RightSidebar/
│   │       ├── CopilotPanel.tsx
│   │       ├── WorkflowStatus.tsx
│   │       └── NextSteps.tsx
│   └── CitationNetwork/                   # Citation Network Components (NEW!)
│       ├── ForceGraphVisualization.tsx    # Force-directed graph
│       ├── PaperDetailsPanel.tsx          # Paper info sidebar
│       ├── SearchBar.tsx                  # Search interface
│       ├── FilterControls.tsx             # Journal & year filters
│       ├── GraphControls.tsx              # Zoom & navigation
│       └── NetworkStats.tsx               # Graph statistics
│
├── src/
│   ├── data/                              # Data Definitions (NEW!)
│   │   └── journalFamilies.ts            # Journal family groupings
│   ├── types/                             # TypeScript Types
│   │   ├── editor.ts
│   │   ├── pipeline.ts
│   │   ├── copilot.ts
│   │   ├── project.ts
│   │   └── citationNetwork.ts            # Citation network types (NEW!)
│   └── lib/                               # Utilities
│       ├── graph/                         # Graph algorithms (NEW!)
│       │   ├── networkBuilder.ts
│       │   └── layoutAlgorithms.ts
│       └── api/
│           └── semanticScholar.ts         # Semantic Scholar client (NEW!)
│
├── store/                                  # Zustand State Management
│   ├── editorStore.ts
│   ├── pipelineStore.ts
│   ├── copilotStore.ts
│   └── projectStore.ts
│
└── public/                                 # Static Assets
```

## 🛠️ Tech Stack

### Frontend
- **[Next.js 14](https://nextjs.org/)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[Tailwind CSS](https://tailwindcss.com/)** - Styling framework
- **[Monaco Editor](https://microsoft.github.io/monaco-editor/)** - Code editor
- **[react-force-graph-2d](https://github.com/vasturiano/react-force-graph)** - Force-directed graph visualization (NEW!)
- **[D3.js](https://d3js.org/)** - Data visualization and physics simulation (NEW!)
- **[Zustand](https://zustand-demo.pmnd.rs/)** - State management
- **[Lucide React](https://lucide.dev/)** - Icon library
- **[Framer Motion](https://www.framer.com/motion/)** - Animation library

### Backend/APIs
- **Next.js API Routes** - Server-side API endpoints
- **[Semantic Scholar API](https://www.semanticscholar.org/product/api)** - Academic paper search (NEW!)
- **OpenAI API** - AI-powered code assistance

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting

## 🎮 Usage Guide

### Citation Network Visualization

#### 1. Search for Papers
- Enter keywords in the search bar (e.g., "CRISPR gene editing")
- Real-time autocomplete shows relevant papers as you type
- Select a paper or press Enter to search
- View up to 30 most relevant papers

#### 2. Explore the Network
- **Nodes** represent papers (size = citation count, color = relevance)
- **Edges** show citation relationships (gray) and semantic similarity (orange)
- **Green node** is the origin paper
- **Blue gradient** indicates similarity to origin (darker = more similar)
- Drag nodes to rearrange the graph
- Zoom with mouse wheel
- Click nodes to view paper details

#### 3. Filter by Journal Family
- Click the **Filter** button (📊 icon)
- Journal families are automatically grouped:
  - 🔬 **Nature** family (Nature, Nature Methods, Nature Biotechnology...)
  - 🧪 **Science** family (Science, Science Translational Medicine...)
  - 🧬 **Cell** family (Cell, Cell Stem Cell, Molecular Cell...)
  - 🏥 **NEJM** (New England Journal of Medicine)
  - 💉 **Lancet** family (The Lancet, Lancet Oncology...)
  - 🩺 **JAMA** family (JAMA, JAMA Internal Medicine...)
- Click family checkbox to select all journals in that family
- Expand families (▶/▼) to see individual journals
- View impact factors and paper counts
- Close with × button

#### 4. Filter by Year
- Use the year range slider to focus on recent publications
- Dynamically updates the network in real-time
- View publication year distribution

#### 5. View Paper Details
- Click any node to open the details panel
- See: title, authors, year, abstract, citations, venue
- Navigate to related papers
- Access external links to full text

### IDE Features

#### 1. View Pipeline Steps
Left sidebar shows all pipeline steps:
- ✅ **Completed** - Green checkmark
- 🔄 **Running** - Blue spinner
- ⏸️ **Pending** - Gray circle
- ❌ **Error** - Red X

#### 2. Edit Code
Click pipeline steps to open corresponding files:
- Multi-file tabs
- Syntax highlighting
- Auto-save (• indicates unsaved)

#### 3. Run Code
Click **"Run"** button in top toolbar:
- Real-time output
- Automatic data shape updates
- Error notifications

#### 4. Use AI Copilot
Right sidebar provides intelligent suggestions:
- **Workflow Status** - Current workflow state
- **Next Steps** - AI-recommended actions
- **Insert Code** - One-click code insertion
- **Explain** - Code explanation

## 🔧 Configuration

### Environment Variables

Create `.env.local` file:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Semantic Scholar API (optional, for higher rate limits)
SEMANTIC_SCHOLAR_API_KEY=your_semantic_scholar_key

# OpenAI API (optional, for AI features)
OPENAI_API_KEY=sk-your_openai_key
```

### Semantic Scholar API
- Free tier: 100 requests per 5 minutes
- Sign up at: https://www.semanticscholar.org/product/api
- Add API key to `.env.local` for higher limits

## 📈 Development Roadmap

### Phase 1: Citation Network ✅
- [x] Semantic Scholar API integration
- [x] Force-directed graph visualization
- [x] Interactive node exploration
- [x] Intelligent journal filtering with family grouping
- [x] Year range filtering
- [x] Real-time search with autocomplete
- [x] Paper details panel
- [x] Network statistics
- [x] Semantic similarity computation

### Phase 2: IDE Enhancement (In Progress)
- [x] Monaco Editor integration
- [x] Multi-file tabs
- [x] AI code explanation
- [x] Real code execution (Python/Jupyter)
- [ ] WebSocket real-time communication
- [x] File system integration
- [ ] Git version control

### Phase 3: AI Integration
- [x] Advanced OpenAI/Claude integration
- [x] Context-aware suggestion engine
- [x] Code auto-completion
- [x] Intelligent error fixing
- [ ] Literature-to-code generation

### Phase 4: Advanced Features
- [ ] Collaborative citation network exploration
- [ ] Export network visualizations
- [ ] Custom layout algorithms
- [ ] Integration with reference managers (Zotero, Mendeley)
- [ ] Citation impact analysis
- [ ] Research trend detection
- [ ] Plugin system

## 🎯 Key Changes in v0.2.0

### New Files Created (3)
1. **`src/data/journalFamilies.ts`** - Journal family data structure with 10 major families (125+ journals)
2. **`src/components/CitationNetwork/ForceGraphVisualization.tsx`** - Main graph component with intelligent filtering
3. **`app/citation-network/page.tsx`** - Citation network page with search and visualization

### Major Features Added
- Interactive citation network with physics-based force simulation
- Intelligent journal family filtering (Nature, Science, Cell, JAMA, Lancet, etc.)
- Real-time paper search with autocomplete
- Semantic similarity computation and visualization
- Year range filtering with dynamic updates
- Expandable journal families with impact factors and paper counts
- Close button for filter panel
- Fixed positioning to prevent panel overlap

## 🤝 Contributing

Issues and Pull Requests are welcome!

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - Powerful React framework
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - VS Code editor core
- [Tailwind CSS](https://tailwindcss.com/) - Excellent CSS framework
- [Semantic Scholar](https://www.semanticscholar.org/) - Academic paper database and API
- [react-force-graph](https://github.com/vasturiano/react-force-graph) - Force-directed graph visualization
- [D3.js](https://d3js.org/) - Data visualization library

---

**Built with ❤️ for the Bioinformatics Research Community**
