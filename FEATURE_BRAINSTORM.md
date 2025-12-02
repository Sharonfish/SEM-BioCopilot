# Citation Network Enhancement Features - Feasibility Analysis

**Date:** 2025-12-01
**Status:** Brainstorming Phase

---

## 🎯 Proposed Features

### 1. Semantic-Based Network / Graph
### 2. Source-Based Filtering (PubMed, Nature, etc.)
### 3. Similarity to Origin Score
### 4. Enhanced Graph UI Based on Relationships

---

## 📊 Feature Analysis & Feasibility

### Feature 1: Semantic-Based Network 🟢 **HIGH FEASIBILITY**

**What:** Build networks based on semantic similarity (keywords, datasets, research goals, impact areas) rather than just citations.

#### ✅ Why This Is Feasible:

**1. Semantic Scholar Already Provides This!**
```typescript
// Available in API response (line 82 in semanticScholarApi.ts)
interface SemanticScholarPaper {
  fieldsOfStudy?: string[];  // ← Keywords/topics like "Biology", "CRISPR", "Genomics"
  // ... other fields
}
```

**2. Recommendation API**
- Already implemented: `getRecommendations()` (line 478)
- Uses ML to find semantically similar papers
- Based on: content similarity, co-citations, author networks

**3. Multiple Similarity Approaches:**

**Approach A: Field-of-Study Matching**
```typescript
function calculateSemanticSimilarity(paper1: Paper, paper2: Paper): number {
  const fields1 = paper1.fieldsOfStudy || [];
  const fields2 = paper2.fieldsOfStudy || [];

  // Jaccard similarity: intersection / union
  const intersection = fields1.filter(f => fields2.includes(f)).length;
  const union = new Set([...fields1, ...fields2]).size;

  return union > 0 ? intersection / union : 0;
}
```

**Approach B: Abstract Embedding Similarity**
```typescript
// Option 1: Use external service (OpenAI, Cohere)
// Option 2: Use Semantic Scholar's recommendations (already ML-based)
// Option 3: TF-IDF on abstracts (client-side, lightweight)
```

**Approach C: Keyword Extraction**
```typescript
// Extract keywords from title + abstract
// Use TF-IDF or simple frequency analysis
// Compare keyword overlap
```

#### 🎯 Implementation Plan:

**Phase 1: Use Existing Data (Easy)**
1. Extract `fieldsOfStudy` from papers
2. Calculate field overlap score
3. Add to graph edges as `semanticWeight`

**Phase 2: Add Recommendations (Medium)**
1. For origin paper, fetch recommendations
2. Add as "semantically similar" nodes
3. Different edge type/color: "semantic" vs "citation"

**Phase 3: Advanced Similarity (Hard - Optional)**
1. Use embedding API for abstract similarity
2. Cache embeddings for performance
3. Calculate cosine similarity

#### 📦 Data Structure Changes:

```typescript
interface NetworkEdge {
  id: string;
  source: string;
  target: string;
  citation: Citation;
  weight?: number;

  // NEW: Semantic similarity fields
  semanticSimilarity?: number;      // 0-1 score
  sharedFieldsOfStudy?: string[];   // Common topics
  edgeType: 'citation' | 'reference' | 'semantic';  // Edge type
}

interface Paper {
  // ... existing fields
  fieldsOfStudy?: string[];         // Already available!

  // NEW: Similarity scores
  similarityToOrigin?: number;      // 0-1 score (Feature #3)
}
```

---

### Feature 2: Source-Based Filtering 🟡 **MEDIUM FEASIBILITY**

**What:** Filter papers by source (PubMed, Nature, Cell, Science, etc.)

#### ✅ Why This Is Feasible:

**1. Venue Field Available**
```typescript
interface SemanticScholarPaper {
  venue?: string;  // "Nature", "Science", "Cell", "PLoS ONE", etc.
  externalIds?: {
    DOI?: string;
    ArXiv?: string;
    PubMed?: string;   // ← PubMed ID available!
  };
}
```

**2. Search API Supports Venue Filtering**
```typescript
// Already implemented in searchPapers (line 299)
if (venue) params.append('venue', venue);
```

#### ⚠️ Challenges:

**Challenge 1: Venue Name Variations**
- "Nature" vs "Nature Medicine" vs "Nature Biotechnology"
- "Science" vs "Science Advances" vs "Science Translational Medicine"
- Need venue normalization/grouping

**Challenge 2: Not All Papers Have Venue**
- Preprints (arXiv, bioRxiv) may not have venue
- Some papers only have "Unknown" venue

**Challenge 3: PubMed vs Venue**
- PubMed is a database, not a journal
- Need to filter by "has PubMed ID" vs "published in PubMed Central journals"

#### 🎯 Implementation Plan:

**Phase 1: Basic Venue Filtering**
```typescript
// Add to UI filter panel
interface FilterOptions {
  venues?: string[];  // Selected venues
  requirePubMedId?: boolean;
  minCitations?: number;
  yearRange?: [number, number];
}

// Venue categories
const VENUE_GROUPS = {
  'Top Tier': ['Nature', 'Science', 'Cell'],
  'Nature Family': ['Nature', 'Nature Medicine', 'Nature Biotechnology', ...],
  'Open Access': ['PLoS ONE', 'eLife', 'Scientific Reports', ...],
  'Preprints': ['bioRxiv', 'medRxiv', 'arXiv'],
};
```

**Phase 2: Smart Venue Grouping**
```typescript
function matchVenueGroup(venue: string, groups: string[][]): boolean {
  return groups.some(group =>
    group.some(v => venue.toLowerCase().includes(v.toLowerCase()))
  );
}
```

**Phase 3: Multi-Source Badge**
```typescript
// Show badges on paper cards
function getPaperBadges(paper: Paper): string[] {
  const badges = [];

  if (paper.externalIds?.PubMed) badges.push('PubMed');
  if (paper.externalIds?.ArXiv) badges.push('arXiv');
  if (paper.venue?.includes('Nature')) badges.push('Nature');
  if (paper.citationCount > 1000) badges.push('Highly Cited');

  return badges;
}
```

#### 📦 UI Changes:

```typescript
// Filter Panel
<VenueFilter>
  <Checkbox value="nature">Nature Family (1,234 papers)</Checkbox>
  <Checkbox value="science">Science Family (567 papers)</Checkbox>
  <Checkbox value="cell">Cell Press (890 papers)</Checkbox>
  <Checkbox value="plos">PLoS (2,345 papers)</Checkbox>
  <Checkbox value="pubmed">Has PubMed ID (3,456 papers)</Checkbox>
</VenueFilter>
```

---

### Feature 3: Similarity to Origin Score 🟢 **HIGH FEASIBILITY**

**What:** Every paper should have a similarity score to the origin paper.

#### ✅ Why This Is Feasible:

**Multiple Similarity Metrics Available:**

**1. Citation-Based Similarity**
```typescript
function calculateCitationSimilarity(paper: Paper, origin: Paper): number {
  let score = 0;

  // Direct citation relationship
  if (isCitedBy(paper, origin)) score += 0.5;
  if (cites(paper, origin)) score += 0.5;

  // Distance in citation graph (BFS)
  const distance = citationDistance(paper, origin);
  if (distance > 0) score += 1 / distance;  // Closer = higher score

  return Math.min(score, 1.0);
}
```

**2. Temporal Similarity**
```typescript
function calculateTemporalSimilarity(paper: Paper, origin: Paper): number {
  const yearDiff = Math.abs(paper.year - origin.year);
  // Papers within 2 years: 1.0
  // Papers within 5 years: 0.6
  // Papers 10+ years apart: 0.1
  return Math.max(0, 1 - yearDiff / 10);
}
```

**3. Author Overlap**
```typescript
function calculateAuthorSimilarity(paper: Paper, origin: Paper): number {
  const authors1 = new Set(paper.authors.map(a => a.toLowerCase()));
  const authors2 = new Set(origin.authors.map(a => a.toLowerCase()));

  const intersection = [...authors1].filter(a => authors2.has(a)).length;
  const union = new Set([...authors1, ...authors2]).size;

  return union > 0 ? intersection / union : 0;
}
```

**4. Field-of-Study Overlap** (from Feature 1)
```typescript
function calculateTopicSimilarity(paper: Paper, origin: Paper): number {
  const fields1 = paper.fieldsOfStudy || [];
  const fields2 = origin.fieldsOfStudy || [];

  const intersection = fields1.filter(f => fields2.includes(f)).length;
  const union = new Set([...fields1, ...fields2]).size;

  return union > 0 ? intersection / union : 0;
}
```

**5. Venue Similarity**
```typescript
function calculateVenueSimilarity(paper: Paper, origin: Paper): number {
  if (paper.venue === origin.venue) return 1.0;
  if (sameVenueFamily(paper.venue, origin.venue)) return 0.7;
  return 0.0;
}
```

#### 🎯 Composite Similarity Score:

```typescript
function calculateOverallSimilarity(paper: Paper, origin: Paper): number {
  const weights = {
    citation: 0.35,      // Most important: citation relationship
    topic: 0.25,         // Semantic similarity
    temporal: 0.15,      // Publication time
    author: 0.15,        // Author overlap
    venue: 0.10,         // Venue similarity
  };

  const scores = {
    citation: calculateCitationSimilarity(paper, origin),
    topic: calculateTopicSimilarity(paper, origin),
    temporal: calculateTemporalSimilarity(paper, origin),
    author: calculateAuthorSimilarity(paper, origin),
    venue: calculateVenueSimilarity(paper, origin),
  };

  return Object.entries(weights).reduce(
    (total, [key, weight]) => total + scores[key] * weight,
    0
  );
}
```

#### 📦 Data Structure:

```typescript
interface Paper {
  // ... existing fields

  // NEW: Similarity metrics
  similarityToOrigin: number;           // Overall score (0-1)
  similarityBreakdown?: {
    citation: number;
    topic: number;
    temporal: number;
    author: number;
    venue: number;
  };
}

interface NetworkNode {
  id: string;
  paper: Paper;

  // NEW: Visual properties based on similarity
  similarityRank?: number;              // 1 = most similar
  similarityColor?: string;             // Color based on similarity
}
```

#### 📊 UI Display:

```typescript
// Paper card
<PaperCard>
  <SimilarityBadge score={0.87}>87% Similar</SimilarityBadge>
  <BreakdownTooltip>
    Citation: ████████░░ 0.92
    Topic:    ███████░░░ 0.85
    Temporal: ████░░░░░░ 0.45
    Author:   █████████░ 0.95
    Venue:    ██████████ 1.00
  </BreakdownTooltip>
</PaperCard>

// Sort options
<SortDropdown>
  <option>Highest Similarity First</option>
  <option>Most Citations First</option>
  <option>Most Recent First</option>
</SortDropdown>
```

---

### Feature 4: Enhanced Graph UI Based on Relationships 🟢 **HIGH FEASIBILITY**

**What:** Improve graph visualization using similarity and metrics.

#### Visual Enhancements:

**1. Edge Length ∝ 1/Similarity** ✅ **Easy**
```typescript
// In networkBuilder.ts
function calculateEdgeLength(source: Paper, target: Paper): number {
  const similarity = calculateOverallSimilarity(source, target);

  // High similarity (0.9) → short edge (50px)
  // Low similarity (0.1) → long edge (300px)
  const minLength = 50;
  const maxLength = 300;

  return maxLength - (similarity * (maxLength - minLength));
}

// In Dagre layout
dagreGraph.setEdge(edge.source, edge.target, {
  minlen: calculateEdgeLength(sourceNode.paper, targetNode.paper) / 50,  // Dagre units
});
```

**2. Node Size ∝ Citation Count** ✅ **Already Implemented!**
```typescript
// CustomNode.tsx line 27-33 (already done!)
function getNodeSize(citationCount: number): number {
  const minSize = 30;
  const maxSize = 80;
  const logScale = Math.log10(citationCount + 1);
  return Math.min(Math.max(normalizedSize, minSize), maxSize);
}
```

**3. Node Color Darkness ∝ Recency** ✅ **Easy to Adjust**
```typescript
// CustomNode.tsx - modify getNodeColor function
function getNodeColor(year: number, isOrigin: boolean, isSelected: boolean): string {
  if (isOrigin) return '#2196F3';
  if (isSelected) return '#00BCD4';

  const currentYear = new Date().getFullYear();
  const age = currentYear - year;

  // Recent papers: Darker/more vibrant
  // Older papers: Lighter/more faded

  if (age <= 2) return '#1A237E';      // Very dark blue (recent)
  if (age <= 5) return '#283593';      // Dark blue
  if (age <= 10) return '#3949AB';     // Medium blue
  if (age <= 15) return '#5C6BC0';     // Light blue
  return '#9FA8DA';                     // Very light blue (old)
}
```

**4. Edge Color/Thickness Based on Relationship Type**
```typescript
interface EdgeStyle {
  color: string;
  width: number;
  dashArray?: string;
}

function getEdgeStyle(edge: NetworkEdge): EdgeStyle {
  switch (edge.edgeType) {
    case 'citation':
      return {
        color: '#4CAF50',      // Green: derivative work
        width: 2,
      };

    case 'reference':
      return {
        color: '#2196F3',      // Blue: prior work
        width: 2,
      };

    case 'semantic':
      return {
        color: '#FF9800',      // Orange: semantically similar
        width: 1.5,
        dashArray: '5,5',      // Dashed line
      };

    default:
      return {
        color: '#94a3b8',
        width: 1,
      };
  }
}
```

**5. Node Opacity/Glow Based on Similarity**
```typescript
function getNodeOpacity(similarityToOrigin: number): number {
  // High similarity: fully opaque + glow
  // Low similarity: semi-transparent
  return 0.3 + (similarityToOrigin * 0.7);  // 0.3 to 1.0
}

function getNodeGlow(similarityToOrigin: number): string {
  if (similarityToOrigin > 0.8) {
    return '0 0 20px rgba(33, 150, 243, 0.8)';  // Strong glow
  } else if (similarityToOrigin > 0.5) {
    return '0 0 10px rgba(33, 150, 243, 0.4)';  // Medium glow
  }
  return 'none';
}
```

#### 📦 Complete Visual System:

```typescript
// In CustomNode.tsx
<div
  className="node-circle"
  style={{
    width: getNodeSize(paper.citationCount),           // Size by citations ✅
    height: getNodeSize(paper.citationCount),
    backgroundColor: getNodeColor(paper.year, ...),    // Color by year ✅
    opacity: getNodeOpacity(paper.similarityToOrigin), // Opacity by similarity
    boxShadow: getNodeGlow(paper.similarityToOrigin),  // Glow by similarity
  }}
/>

// In CustomEdge.tsx
<path
  d={edgePath}
  stroke={getEdgeStyle(edge).color}                    // Color by type
  strokeWidth={getEdgeStyle(edge).width}               // Width by type
  strokeDasharray={getEdgeStyle(edge).dashArray}       // Dash by type
  markerEnd={markerEnd}
/>
```

---

## 🎯 Implementation Priority & Effort

| Feature | Feasibility | Effort | Impact | Priority |
|---------|------------|--------|--------|----------|
| **Similarity Score** | 🟢 High | Medium | High | **P0** (Do First) |
| **Enhanced Graph UI** | 🟢 High | Low-Medium | High | **P0** (Do First) |
| **Semantic Network** | 🟢 High | Medium-High | High | **P1** (Do Second) |
| **Source Filtering** | 🟡 Medium | Medium | Medium | **P2** (Do Third) |

---

## 📋 Recommended Implementation Order

### Phase 1: Foundation (1-2 days)
1. ✅ Add `similarityToOrigin` calculation
2. ✅ Update `Paper` and `NetworkNode` interfaces
3. ✅ Calculate similarity scores in `buildCitationNetwork`

### Phase 2: Visual Improvements (1 day)
1. ✅ Modify node color function (darker = newer)
2. ✅ Add edge length based on similarity
3. ✅ Add node opacity/glow based on similarity
4. ✅ Add similarity badges to paper cards

### Phase 3: Semantic Network (2-3 days)
1. ✅ Extract `fieldsOfStudy` from API
2. ✅ Calculate topic similarity
3. ✅ Add recommendation-based edges
4. ✅ Different edge types/colors

### Phase 4: Source Filtering (1-2 days)
1. ✅ Create venue categorization system
2. ✅ Add filter UI with checkboxes
3. ✅ Add PubMed badge display
4. ✅ Filter graph by selected sources

---

## 🚀 Quick Win: Minimal Viable Version (4-6 hours)

**What to implement first for maximum impact:**

```typescript
// 1. Calculate simple similarity (30 min)
function calculateSimilarity(paper: Paper, origin: Paper): number {
  let score = 0;

  // Citation relationship
  if (paper.id === origin.id) return 1.0;
  // Add more logic based on citations array

  // Topic overlap
  const topicSim = jaccardSimilarity(
    paper.fieldsOfStudy || [],
    origin.fieldsOfStudy || []
  );
  score += topicSim * 0.5;

  // Temporal proximity
  const yearDiff = Math.abs(paper.year - origin.year);
  score += Math.max(0, 1 - yearDiff / 10) * 0.3;

  // Author overlap
  const authorSim = jaccardSimilarity(paper.authors, origin.authors);
  score += authorSim * 0.2;

  return Math.min(score, 1.0);
}

// 2. Update node colors (30 min)
function getNodeColor(year: number): string {
  const age = currentYear - year;
  const hue = 210;  // Blue
  const lightness = 70 - (age * 2);  // Darker = newer
  return `hsl(${hue}, 80%, ${Math.max(20, Math.min(70, lightness))}%)`;
}

// 3. Update edge lengths (1 hour)
// Modify Dagre config in CitationNetworkGraph.tsx

// 4. Add similarity badges (1 hour)
<PaperCard>
  <Badge color={getSimilarityColor(similarity)}>
    {(similarity * 100).toFixed(0)}% Match
  </Badge>
</PaperCard>

// 5. Add sorting by similarity (30 min)
const sortedPapers = papers.sort((a, b) =>
  b.similarityToOrigin - a.similarityToOrigin
);
```

---

## 📊 Expected Results

**After Implementation:**

```
Graph Visualization:
- Most similar papers: Large, dark, close to origin, glowing
- Moderately similar: Medium size, medium color, medium distance
- Low similarity: Small, light, far from origin, faint

Paper List:
- Sorted by similarity by default
- Each paper shows similarity badge
- Filter by similarity threshold (e.g., "Show only >70% similar")

Network Types:
- Citation network (existing)
- Semantic network (topic-based)
- Hybrid network (both)

Source Filtering:
- "Nature Family" checkbox → only Nature journals
- "PubMed" checkbox → only papers with PubMed ID
- Venue badges on each paper card
```

---

## 🎨 UI Mockup Concept

```
┌─────────────────────────────────────────────────────────────┐
│ Citation Network                                 [Filters ▼]│
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Filters:                                                    │
│  ☑ Citation Network  ☑ Semantic Network                     │
│  ☑ Nature  ☑ Science  ☑ Cell  ☐ PLoS  ☑ PubMed            │
│  Sort: [Similarity ▼]                                        │
│                                                               │
│  Graph:                                                      │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                       │   │
│  │        ●───────●                                     │   │
│  │       /│\      │ \                                   │   │
│  │      ● │ ●     ●  ●                                  │   │
│  │       \│/     /│                                     │   │
│  │        ●─────● │                                     │   │
│  │              \ │                                     │   │
│  │               ●                                      │   │
│  │                                                       │   │
│  │  Legend:                                             │   │
│  │  ● Size = Citations                                  │   │
│  │  ● Darkness = Recency                                │   │
│  │  ─ Length = 1/Similarity                             │   │
│  │  ─ Green = Cites origin                              │   │
│  │  ─ Blue = Cited by origin                            │   │
│  │  ╌ Orange = Semantically similar                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
│  Papers (sorted by similarity):                              │
│  ┌─────────────────────────────────────────┐                │
│  │ [95%] CRISPR-Cas9 Genome Editing  🏷Nature │              │
│  │ [89%] Cas9 Targeting Specificity  🏷Cell   │              │
│  │ [82%] Off-Target Effects          🏷Science│              │
│  │ [76%] Base Editing Applications   🏷PubMed │              │
│  └─────────────────────────────────────────┘                │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ Conclusion

**All proposed features are feasible!**

**Recommended Approach:**
1. Start with **Similarity Scoring** (foundation)
2. Add **Enhanced Graph UI** (visual impact)
3. Implement **Semantic Network** (advanced)
4. Add **Source Filtering** (polish)

**Estimated Timeline:**
- Quick MVP: 4-6 hours
- Full implementation: 5-8 days
- Polish & testing: 2-3 days

**Total: 1-2 weeks for complete implementation**

Would you like to start with Phase 1 (Similarity Scoring)?
