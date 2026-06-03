# AI Learning Hub

An interactive ML Engineering curriculum — 22 phases, 200+ topics, quizzes, progress tracking, and a drag-and-drop ML pipeline playground.

Built with React 19 + TypeScript 6.0 + Vite 8.

---

## Features

- **22 Learning Phases** — From binary logic to production MLOps (266 topics)
- **4-Tab Topic Layout** — Theory, Understanding, Code, Real-World for every topic
- **ML Playground** — Visual drag-and-drop pipeline builder with React Flow
- **Quiz System** — 5 question types: MCQ, True/False, Code Prediction, Fill-blank, Match-the-Pairs
- **Progress Dashboard** — Charts, streaks, 8 achievement badges, per-phase breakdown
- **Full-Text Search** — Fuzzy search with scoring + character-order matching + Levenshtein (Ctrl+K)
- **Algorithm Visualizations** — Gradient Descent, K-Means, Decision Tree, NN Forward Pass
- **Architecture Diagrams** — React Flow diagrams with 5 custom node types
- **Dark Mode** — Persistent theme toggle (localStorage)
- **PWA** — Service worker, manifest, offline support
- **Lazy Loaded Routes** — Code-split by page

---

## Tech Stack

| Layer | Library | Version |
|-------|---------|---------|
| Framework | React | 19.2.6 |
| Language | TypeScript | ~6.0.2 |
| Build | Vite | 8.0.12 |
| Styling | Tailwind CSS | 4.3.0 |
| Routing | React Router DOM | 7.16.0 |
| State | Zustand | 5.0.14 |
| Animation | Framer Motion | 12.40.0 |
| Charts | Recharts | 3.8.1 |
| Diagrams | React Flow | 11.11.4 |
| Markdown | react-markdown + remark-gfm | 10.1.0 |
| LaTeX | KaTeX + rehype-katex | 0.17.0 |
| Code Highlighting | react-syntax-highlighter | 16.1.1 |
| Icons | lucide-react | 1.17.0 |
| Data Viz | D3 | 7.9.0 |

---

## Getting Started

```bash
npm install
npm run dev        # Dev server at localhost:5173
npm run build      # TypeScript check + production build
npm run preview    # Preview production build
npm run lint       # ESLint check
```

---

## Project Structure

```
src/
├── main.tsx                          # Entry: StrictMode > App
├── App.tsx                           # Router + ErrorBoundary + ToastProvider + lazy routes
├── index.css                         # Tailwind v4 import, @theme tokens, dark variant, custom scrollbar
│
├── store/
│   └── useStore.ts                   # Zustand store (persisted to localStorage)
│       State: sidebarOpen, darkMode, completedTopics[], bookmarkedTopics[],
│              searchQuery, searchResults[], isSearching, toast
│       Actions: toggleSidebar, toggleDarkMode, completeTopic(id), toggleBookmark(id),
│                setSearchQuery(q), setSearchResults(r), setIsSearching(v), showToast(msg, type)
│
├── data/
│   ├── sidebarData.ts                # 22 phases, 266 topics (id, title, phase index)
│   └── topicContent.ts               # TopicContent interface + fallback generators
│       Exports: QuizQuestion, CodeExample, getTopicContent(id), getDifficulty(s), getEstimatedTime(s)
│
├── utils/
│   └── search.ts                     # Search engine
│       Exports: searchTopics(query) → SearchResult[] (scored & sorted),
│                getSearchSuggestions(query) → top 5,
│                highlightText(text, query) → JSX with <mark>,
│                getFuzzyScore(s1, s2), levenshteinDistance(s1, s2),
│                fuzzyMatch(text, query), normalizeText(text)
│
├── content/
│   ├── index.ts                      # Registry: registerContent(id, factory), getContent(id)
│   └── phases/                       # 135 topic content files (phase-0 through phase-21)
│       Each file: registerContent('pN-slug', () => ({ difficulty, theory, understanding,
│                  codeExamples[], realWorld, quiz[] })) + export {} at end
│
├── components/
│   ├── Layout.tsx                    # Root layout shell
│   │   Props: children               # Wraps page in Navbar + Sidebar + MainContent
│   │   Dark mode: reads theme from store, applies .dark class on html
│   │
│   ├── Navbar.tsx                    # Top navigation bar
│   │   State: searchOpen             # Ctrl+K opens search modal
│   │   Renders: logo, search bar, progress ring (% circle), theme toggle,
│   │            GitHub link, playground link (flask icon), hamburger menu
│   │   Behavior: Ctrl+K / Cmd+K keyboard shortcut for search
│   │
│   ├── Sidebar.tsx                   # Left side collapsible tree
│   │   Props: none (reads store)     # Phase accordions with topic list
│   │   Each topic: click to navigate, checkmark if completed, bookmark toggle
│   │   Each phase: progress bar showing completed / total topics
│   │
│   ├── MainContent.tsx               # Central content area
│   │   Props: children               # AnimatePresence wrapper for page transitions
│   │   Adjusts left margin when sidebar collapses
│   │
│   ├── SearchModal.tsx               # Full-screen search overlay (Ctrl+K)
│   │   Props: open, onClose          # 150ms debounce, keyboard nav (↑↓ Enter)
│   │   Renders: search input, recent searches, results with highlighted title
│   │   Suggests: "No results" with alt queries
│   │
│   ├── ErrorBoundary.tsx             # React error boundary
│   │   Props: children, fallback?    # Catches runtime errors, shows message + Go Home
│   │
│   ├── Toast.tsx                     # Toast notification system
│   │   ToastProvider wraps app       # Context-based, 4 types (success/error/warning/info)
│   │   useToast() hook returns { toast(type, msg) }
│   │   Auto-dismiss after 4s, stacked at bottom-right
│   │
│   ├── Confetti.tsx                  # Celebration particle effect
│   │   Props: active                 # 60 particles, random colors, 3s duration
│   │   Used when: quiz passed with ≥60%
│   │
│   ├── topics/
│   │   ├── TheoryTab.tsx             # Topic theory content
│   │   │   Props: theory (markdown), objectives[], prerequisites[]
│   │   │   Renders: learning objectives card, clickable prerequisite links,
│   │   │            "Why This Matters" callout, key definitions grid,
│   │   │            full markdown with KaTeX LaTeX rendering
│   │   │
│   │   ├── UnderstandingTab.tsx      # Conceptual understanding
│   │   │   Props: analogy, steps[], misconceptions[], comparisons[]?
│   │   │   Renders: analogy card, React Flow architecture diagram (toggle),
│   │   │            step-by-step walkthrough, comparison table,
│   │   │            misconceptions truth-bombs, AlgorithmVizCarousel
│   │   │
│   │   ├── CodeTab.tsx               # Code examples & common errors
│   │   │   Props: examples[] (CodeExample[])
│   │   │   Renders: 3-level tabs (Basic / Intermediate / Advanced),
│   │   │            syntax-highlighted code, copy/download buttons,
│   │   │            "Run Code" simulates terminal output,
│   │   │            expandable "Common Errors" with before/after fix
│   │   │
│   │   ├── RealWorldTab.tsx          # Industry applications
│   │   │   Props: useCases[], caseStudy, bestPractices[], tools[],
│   │   │          jobRoles[], furtherReading[]
│   │   │   Renders: industry cards with icons, case study (problem/solution/results),
│   │   │            interactive training progress demo, best practices checklist,
│   │   │            tools badges, job roles list, further reading links
│   │   │
│   │   └── QuizModal.tsx             # Quiz engine (modal overlay)
│   │       Props: topicId, questions[], onClose
│   │       5 question types:
│   │         mcq:       radio buttons, single correctAnswer
│   │         truefalse: True/False buttons, correctAnswer 'True'|'False'
│   │         code:      syntax-highlighted code + radio choices
│   │         fillblank: text input, case-insensitive match
│   │         match:     dropdown selects for pairs {left, right}[]
│   │       Results: animated circular score gauge (SVG),
│   │                per-question expandable review (green/red),
│   │                Retry / Next Topic / Back buttons
│   │       Threshold: 60% to pass; calls completeTopic + fires confetti
│   │
│   ├── visuals/
│   │   ├── ArchitectureDiagram.tsx    # React Flow diagram system
│   │   │   5 custom node types:
│   │   │     InputNode   — blue rounded, source handle bottom
│   │   │     ProcessNode — purple, target top + source bottom
│   │   │     OutputNode  — green rounded, target top
│   │   │     DecisionNode — amber diamond, target top + 3 sources
│   │   │     DataNode    — cyan cylinder, source bottom
│   │   │   Export: customNodeTypes (memoized registry for React Flow)
│   │   │
│   │   ├── AlgorithmViz.tsx           # Interactive algorithm visualizations
│   │   │   4 visualizers: GradientDescentViz (points + regression line + convergence),
│   │   │     KMeansViz (12 points × 3 clusters, animated centroid movement),
│   │   │     DecisionTreeViz (depth-wise expanding tree),
│   │   │     NNForwardPassViz (layered nodes lighting up sequentially)
│   │   │   Controls: Play, Pause, Reset, Step, Speed slider
│   │   │   AlgorithmVizCarousel: tab switcher across all 4 algorithms
│   │   │
│   │   ├── DataGraphs.tsx             # Recharts chart wrappers
│   │   │   6 chart types: LossCurveChart, MultiLineChart, BarChartGraph,
│   │   │     ScatterPlot, PieChartGraph, HeatmapGrid (custom SVG)
│   │   │   All support: dark prop, tooltips, responsive containers
│   │   │
│   │   └── index.ts                   # Barrel export for all visuals
│   │
│   └── playground/
│       ├── types.ts                   # 14 component definitions with static params
│       │   4 categories:
│       │     Data Source:  CSV Upload, Database, Synthetic Data
│       │     Preprocessing: Scaling, Encoding, Imputation, Train/Test Split
│       │     Model: Linear Regression, Random Forest, SVM, Neural Network, K-Means, PCA
│       │     Evaluation: Classification Metrics, Regression Metrics, Clustering Metrics
│       │   Each: type, category, label, color, icon, params[] (number/string/select/boolean),
│       │          inputs/outputs count
│       │   Exports: COMPONENTS[], getComponent(type), getDefaultParams(type)
│       │
│       ├── templates.ts               # 5 pre-built pipeline templates
│       │   Linear Regression, Classification, Clustering, NLP, RAG
│       │   Each: nodes[] (id, type, position, params), edges[] (source, target)
│       │
│       └── PipelineNode.tsx           # Custom React Flow node for playground
│           Renders: category label, component name, color-coded background,
│                   dynamic handles (inputs=left, outputs=right)
│           Memoized for performance
│
└── pages/
    ├── Home.tsx                       # Landing page / Dashboard
    │   Renders: hero section with gradient text + CTA,
    │            4 animated stat counters (Phases, Topics, Code Examples, Quiz Questions),
    │            9-card "What You'll Learn" grid (ML fundamentals, Deep Learning, etc.),
    │            Roadmap timeline (6 milestones),
    │            circular progress + quick actions (Search, Bookmarks, Progress, Playground),
    │            8 featured topic cards with difficulty badges,
    │            footer with links
    │
    ├── TopicPage.tsx                  # Topic detail view
    │   Route: /topic/:topicId
    │   Renders: 4-tab interface (Theory, Understanding, Code, Real-World),
    │            markdown + LaTeX content from registry or fallback generator,
    │            quiz modal trigger (only after topic marked complete),
    │            topic not found handling
    │
    ├── SearchResults.tsx              # Dedicated search page
    │   Route: /search?q=
    │   Renders: pre-filled search input, result count,
    │            filter by Phase / Difficulty, sort controls,
    │            result cards with highlighted title + badges + tags + time estimate,
    │            staggered framer-motion entrance animations
    │
    ├── Bookmarks.tsx                  # Bookmarked topics
    │   Renders: grid of bookmarked topics with progress badges,
    │            remove bookmark button,
    │            link to each topic page
    │
    ├── Progress.tsx                  # Progress dashboard
    │   Renders: 4 stat cards (overall %, streak, learning time, current phase),
    │            large circular SVG completion ring,
    │            difficulty breakdown bars,
    │            recharts pie chart (completed vs remaining by difficulty),
    │            activity timeline bar chart,
    │            per-phase horizontal progress bars,
    │            expandable phase cards with individual topic lists,
    │            search/filter/sort topic list view,
    │            achievements tab with 8 milestone badges
    │
    ├── PlaygroundPage.tsx            # Interactive ML Playground
    │   Route: /playground
    │   Layout: left sidebar (draggable components), center React Flow canvas,
    │           right properties panel (selected component params),
    │           bottom results panel (collapsible, shows after run)
    │   Features: drag-and-drop from sidebar onto canvas,
    │             connect components with animated edges,
    │             5 template buttons (top bar) that populate the canvas,
    │             "Run Pipeline" simulates training (metrics + confusion matrix + artifacts),
    │             clear canvas / remove selected component,
    │             MiniMap + Controls for navigation
    │
    └── NotFound.tsx                   # 404 page
        Renders: animated "404" that wobbles on hover,
                 "Page not found" message,
                 3 CTA buttons: Go Home, Search Topics, ML Playground
                 Staggered framer-motion entrance animations
```

---

## Routing

| Path | Page | Lazy |
|------|------|------|
| `/` | Home | Direct import |
| `/topic/:topicId` | TopicPage | `lazy()` |
| `/search` | SearchResults | `lazy()` |
| `/bookmarks` | Bookmarks | `lazy()` |
| `/progress` | Progress | `lazy()` |
| `/playground` | PlaygroundPage | `lazy()` |
| `*` | NotFound | `lazy()` |

All routes wrapped in `<ErrorBoundary>` > `<ToastProvider>` > `<Layout>` > `<Suspense fallback={<Spinner />}>`.

---

## State Management (Zustand Store)

Persisted to `localStorage` key `ai-learning-hub-store`.

### State

| Property | Type | Default | Purpose |
|----------|------|---------|---------|
| `sidebarOpen` | `boolean` | `true` | Left sidebar visibility |
| `darkMode` | `boolean` | `true` | Dark/light theme |
| `completedTopics` | `string[]` | `[]` | Passed quiz topic IDs |
| `bookmarkedTopics` | `string[]` | `[]` | Bookmarked topic IDs |
| `searchQuery` | `string` | `''` | Current search text |
| `searchResults` | `SearchResult[]` | `[]` | Current results |
| `isSearching` | `boolean` | `false` | Loading flag |
| `toast` | `null \| { message, type }` | `null` | Toast data |

### Actions

| Action | Params | Effect |
|--------|--------|--------|
| `toggleSidebar()` | — | Toggles sidebar open/closed |
| `toggleDarkMode()` | — | Toggles theme, persists |
| `completeTopic(id)` | `string` | Adds topic to completed |
| `toggleBookmark(id)` | `string` | Adds/removes bookmark |
| `setSearchQuery(q)` | `string` | Updates query |
| `setSearchResults(r)` | `SearchResult[]` | Sets results |
| `setIsSearching(v)` | `boolean` | Sets loading state |
| `showToast(msg, type)` | `string, 'success'\|'error'\|'info'` | Shows toast, auto-clears in 3s |

---

## Search Engine

Located in `src/utils/search.ts`. The search index is built once in memory from all 266 sidebar topics.

### Algorithm

1. **Normalize** query and topic text (lowercase, trim, collapse whitespace)
2. **Score each topic** against query using multi-criteria:
   - `100` — Exact title match
   - `80` — Title starts with query
   - `60` — Query is contained in title
   - `40` — All query words found in title
   - `30` — Fuzzy match (per-character, allowing up to 2 wildcards)
   - `15` — Low Levenshtein distance (typo tolerance)
3. **Filter** by minimum score (≥15)
4. **Sort** descending by score
5. **Return** `SearchResult[]` with `{ topic, phase, score, matches }`

### Exported Functions

- `searchTopics(query)` — Main search, returns sorted results
- `getSearchSuggestions(query)` — Top 5 matches for typeahead
- `highlightText(text, query)` — Wraps matches in `<mark>` tags (case-insensitive)
- `getFuzzyScore(s1, s2)` — 0–1 normalized similarity
- `levenshteinDistance(s1, s2)` — Classic edit distance
- `fuzzyMatch(text, query)` — Regex per character with wildcards
- `normalizeText(text)` — Clean + lowercase

---

## Quiz System

Located in `src/components/topics/QuizModal.tsx`.

### Question Types

| Type | Data Shape | UI |
|------|-----------|-----|
| `mcq` | `{ question, options: string[], correctAnswer }` | Radio buttons |
| `truefalse` | `{ question, correctAnswer: 'True'\|'False' }` | Two labeled buttons |
| `code` | `{ question, code, options: string[], correctAnswer }` | Syntax-highlighted code + radio buttons |
| `fillblank` | `{ question (with ___), correctAnswer }` | Text input |
| `match` | `{ question, pairs: { left, right }[], correctAnswer }` | Dropdown per pair |

### Flow

1. Questions displayed one at a time with progress dots
2. Next button enables only after answering
3. On submit: auto-graded, score calculated
4. **Pass ≥ 60%**: `completeTopic(id)` called, confetti fires
5. Results screen: animated circular SVG gauge, per-question expandable cards (green ✓ / red ✗), Retry / Next Topic / Back buttons
6. Already-completed topics show "You've already completed this quiz!" badge

---

## Playground System

Located in `src/pages/PlaygroundPage.tsx` + `src/components/playground/`.

### Component Types (14)

| Type | Category | Key Params |
|------|----------|------------|
| CSV Upload | Data Source | delimiter, hasHeader, sampleRows |
| Database | Data Source | table, batchSize, sampling |
| Synthetic Data | Data Source | nSamples, nFeatures, noise, randomState |
| Scaling | Preprocessing | method (standard/minmax/robust/maxabs) |
| Encoding | Preprocessing | method (onehot/label/ordinal/target) |
| Imputation | Preprocessing | method (mean/median/mode/knn) |
| Train/Test Split | Preprocessing | testSize, stratify, shuffle |
| Linear Regression | Model | fitIntercept |
| Random Forest | Model | nEstimators, maxDepth |
| SVM | Model | kernel, C, gamma |
| Neural Network | Model | hiddenLayers, activation, lr, epochs |
| K-Means | Model | nClusters, maxIter |
| PCA | Model | nComponents, whiten |
| Classification Metrics | Evaluation | showConfusion, average |
| Regression Metrics | Evaluation | showResiduals |
| Clustering Metrics | Evaluation | showSilhouette |

### Interaction

- **Drag-and-drop**: HTML5 native drag from sidebar to React Flow canvas
- **Connect**: Drag between node handles to create animated edges with arrow markers
- **Configure**: Click a node to open properties panel (right side) showing type-specific params
- **Templates**: 5 pre-built pipelines load via top bar buttons
- **Run Pipeline**: Simulates training (1.5–2.5s delay), shows metrics grid (Accuracy, Precision, Recall, F1, AUC-ROC, times), confusion matrix, feature importance bar chart, and artifact files
- **Clear / Remove**: Clear all or delete selected component

### Templates

| Template | Pipeline |
|----------|----------|
| Linear Regression | Synthetic → Scaling → Split → Linear Regression → Regression Metrics |
| Classification | Synthetic → Scaling → Split → Random Forest → Classification Metrics |
| Clustering | Synthetic → Scaling → K-Means → Clustering Metrics |
| NLP | Synthetic → Encoding → Split → Neural Network → Classification Metrics |
| RAG | Database → Encoding → Split → Neural Network → Classification Metrics |

---

## Architecture Diagram System

Located in `src/components/visuals/ArchitectureDiagram.tsx`.

### Custom Node Types (5)

| Type | Shape | Handles | Color |
|------|-------|---------|-------|
| `InputNode` | Rounded rectangle | Source (bottom) | Blue |
| `ProcessNode` | Rectangle | Target (top) + Source (bottom) | Purple |
| `OutputNode` | Rounded rectangle | Target (top) | Green |
| `DecisionNode` | Diamond (clipPath) | Target (top) + 3 Sources (bottom, left, right) | Amber |
| `DataNode` | Cylinder (border-radius trick) | Source (bottom) | Cyan |

All nodes memoized. Exported as `customNodeTypes` registry for React Flow.

---

## Algorithm Visualizations

Located in `src/components/visuals/AlgorithmViz.tsx`.

| Visualizer | Description |
|-----------|-------------|
| `GradientDescentViz` | SVG scatter plot + regression line, animated convergence ball along cost curve |
| `KMeansViz` | 12 data points across 3 clusters, colored centroids animating to convergence |
| `DecisionTreeViz` | Depth-wise expanding tree from root → depth-3 splits with feature labels |
| `NNForwardPassViz` | Layered nodes (input → hidden → output) lighting up sequentially, edges pulse on activation |

All have Play / Pause / Reset / Step / Speed controls. `AlgorithmVizCarousel` provides tab switching.

---

## Charts & Data Graphs

Located in `src/components/visuals/DataGraphs.tsx`.

| Component | Chart Type | Built With |
|-----------|-----------|------------|
| `LossCurveChart` | Training/validation loss over epochs | Recharts LineChart |
| `MultiLineChart` | Multiple metrics over time | Recharts LineChart |
| `BarChartGraph` | Categorical comparisons | Recharts BarChart |
| `ScatterPlot` | 2D distribution | Recharts ScatterChart |
| `PieChartGraph` | Proportion breakdown | Recharts PieChart |
| `HeatmapGrid` | 2D intensity matrix | Custom SVG |

All accept a `dark` boolean prop and render tooltips.

---

## Content System

### Dual Architecture

1. **Content Registry** (`src/content/index.ts` + `src/content/phases/`):
   - `registerContent(id, factory)` — Each file calls this at module scope
   - `getContent(id)` — Returns the factory result for a topic ID
   - 135 topic files across phases 0–21, each with hand-crafted theory, code examples, quiz questions

2. **Fallback Generator** (`src/data/topicContent.ts`):
   - `getTopicContent(id)` — Called by TopicPage, first checks registry via `getContent()`, falls back to auto-generated content
   - Generates generic but phase-appropriate theory, examples, quiz questions

### Content File Pattern

```typescript
import { registerContent } from '@/content/index'

registerContent('pN-slug', () => ({
  difficulty: 'Beginner | Intermediate | Advanced',
  estimatedTime: 'N minutes',
  prerequisites: ['pN-other-topic'],
  tags: ['Category', 'Difficulty', 'Type'],
  objectives: ['Learn X', 'Understand Y', 'Implement Z'],
  theory: '# Title\n\nMarkdown with $$LaTeX$$ ...',
  understanding: {
    analogy: 'Think of it like...',
    steps: [{ title, content }],
    misconceptions: [{ misconception, truth }],
    comparisons: [{ label, methodA, methodB }],
  },
  codeExamples: [
    { level: 'basic|intermediate|advanced', code, output, explanation },
  ],
  realWorld: {
    useCases: [{ industry, description }],
    caseStudy: { problem, solution, results },
    bestPractices: [...],
    tools: [...],
    jobRoles: [...],
    furtherReading: [...],
  },
  quiz: [
    { id, type: 'mcq'|'truefalse'|'code'|'fillblank'|'match', question, ... },
  ],
}))

export {}
```

### Phase File Count

| Phase | Files | Topics |
|-------|-------|--------|
| 0: Pre-Programming Basics | 3 | How Computers Work, Binary & Logic, Algorithmic Thinking |
| 1: Programming Fundamentals | 0 | (6 topics, fallback-generated) |
| 2: Math for ML | 0 | (9 topics, fallback-generated) |
| 3: Python Data Stack | 0 | (6 topics, fallback-generated) |
| 4: Data Preprocessing | 5 | EDA, Missing Data, Outliers, Validation, Drift |
| 5: Feature Engineering | 5 | Numerical, Categorical, DateTime, Scaling, Selection |
| 6: Classical ML | 15 | Regression, Trees, SVM, KNN, Clustering, Ensemble, Dim. Reduction |
| 7: Model Evaluation | 4 | Metrics, CV, ROC/AUC |
| 8: Deep Learning | 17 | NN, CNN, RNN, Transformers, BERT, GPT, LoRA, RLHF |
| 9: Generative AI | 7 | GANs, VAEs, Diffusion, StyleGAN, ControlNet |
| 10: Agentic AI | 6 | Agents, ReAct, LangChain, LangGraph, Multi-Agent |
| 11: Computer Vision | 5 | Detection, Segmentation, Pose, 3D, Video |
| 12: NLP Advanced | 6 | Tokenization, Embeddings, NER, QA, Semantic Search |
| 13: Time Series | 5 | ARIMA, Prophet, LSTM, Anomaly Detection |
| 14: Recommendation Systems | 5 | CF, MF, Neural CF, Two-Tower, Bandits |
| 15: Training Pipeline | 8 | Problem Framing, Baseline, HPO, Error Analysis, Calibration, Interpretability, Fairness, Robustness |
| 16: MLOps | 10 | Experiment Tracking, Docker, K8s, CI/CD, Monitoring, Serving, A/B Testing, Data Versioning, Feature Stores, Cloud |
| 17: Distributed ML | 5 | DDP, DeepSpeed, Spark, Ray, Streaming |
| 18: Advanced | 8 | RL, Causal, Federated, GNN, Meta-Learning, XAI, Safety, Quantum |
| 19: RAG | 8 | Architecture, Chunking, Vector DBs, Retrieval, Reranking, Evaluation, Production, Advanced |
| 20: Specialized | 4 | FAISS, LangChain, LlamaIndex, Graph RAG |
| 21: End-to-End | 9 | House Price, Churn, Sentiment, Document QA, Research Agent, Image Classification, Object Detection, Chatbot, MLOps Pipeline |

---

## Deployment

```bash
npx vercel
```

`vercel.json` includes:
- **SPA rewrites**: all paths → `/index.html`
- **Cache headers**: `assets/*` → 1 year immutable
- **Security headers**: X-Content-Type-Options, X-Frame-Options, Referrer-Policy

### Environment Variables

Copy `.env.example` to `.env.local` for local development:

```
VITE_API_URL=https://api.example.com
```

---

## PWA

- **Service worker** (`public/sw.js`): cache-first for GET requests, precaches `/` and `/index.html`, cleans old caches on activate
- **Manifest** (`public/manifest.json`): standalone display, theme color `#6366f1`, SVG icon
- **Registration**: auto-registered in `index.html` on page load

---

## Accessibility

- ARIA labels on all interactive elements (buttons, links, drag handles)
- Keyboard navigation: Ctrl+K for search, ↑↓ + Enter for results, Tab through content
- Focus indicators on all interactive elements
- Dark mode with WCAG-compliant contrast ratios
- Screen reader announcements via toast system

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit changes (`git commit -m 'Add my feature'`)
4. Push to branch (`git push origin feature/my-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code conventions (TypeScript strict mode, Tailwind classes, etc.)
- Run `npm run build` before submitting to verify 0 errors
- Quiz questions must include all 5 types where applicable
- New phases: add to `sidebarData.ts` + create content files in `src/content/phases/phase-N/`
