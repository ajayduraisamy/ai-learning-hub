# AI Learning Hub

An interactive ML Engineering curriculum with 22 phases, quizzes, search, progress tracking, and an ML playground.

## Features

- **22 Learning Phases** — From binary logic to production MLOps
- **200+ Topics** — Each with Theory, Understanding, Code, and Real-World tabs
- **ML Playground** — Drag-and-drop pipeline builder with React Flow
- **Quiz System** — 5 question types (MCQ, True/False, Code, Fill-blank, Match)
- **Progress Dashboard** — Charts, streaks, achievements, badges
- **Full-Text Search** — Fuzzy search with keyboard navigation (Ctrl+K)
- **Dark Mode** — Persistent theme toggle
- **PWA** — Service worker for offline support

## Tech Stack

- **React 19** + **TypeScript 6.0**
- **Vite 8** with Tailwind CSS v4
- **Framer Motion** — Animations
- **React Flow** — Pipeline builder & architecture diagrams
- **Recharts** — Charts and data visualization
- **Zustand** — State management with localStorage persistence
- **React Router v7** — Client-side routing
- **KaTeX** — LaTeX rendering
- **Lucide React** — Icons

## Getting Started

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Preview the build:

```bash
npm run preview
```

## Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── playground/   # ML Playground builder
│   ├── topics/       # Topic tab components
│   └── visuals/      # Architecture diagrams, charts, algorithm viz
├── content/          # Topic content files (phases 0-21)
├── data/             # Sidebar data, topic content registry
├── pages/            # Route pages (Home, TopicPage, Progress, etc.)
├── store/            # Zustand store
├── utils/            # Search utility
├── App.tsx           # Root component with routing
├── main.tsx          # Entry point
└── index.css         # Tailwind config + global styles
```

## Phases

| Phase | Topics |
|-------|--------|
| 0: Pre-Programming Basics | Computers, Binary, Algorithmic Thinking |
| 1: Programming Fundamentals | Data Types, Control Flow, Functions, OOP |
| 2: Math for ML | Linear Algebra, Calculus, Probability, Statistics |
| 3: Python Data Stack | NumPy, Pandas, Matplotlib, Seaborn |
| 4: Data Preprocessing | EDA, Missing Data, Outliers, Drift |
| 5: Feature Engineering | Numerical, Categorical, DateTime, Scaling, Selection |
| 6: Classical ML | Regression, Trees, SVM, KNN, Clustering |
| 7: Model Evaluation | Metrics, Cross-validation, ROC/AUC |
| 8: Deep Learning | NN, CNN, RNN, Transformers, LLMs |
| 9: Generative AI | GANs, VAEs, Diffusion, ControlNet |
| 10: Agentic AI | Agents, ReAct, Tool Use, LangGraph |
| 11: Computer Vision | Detection, Segmentation, Pose, 3D |
| 12: NLP Advanced | Tokenization, Embeddings, NER, QA |
| 13: Time Series | ARIMA, Prophet, LSTM, Anomaly |
| 14: Recommendations | CF, MF, Neural, Two-Tower, Bandits |
| 15: Training Pipeline | Baseline, Hyperparameter Tuning, Error Analysis |
| 16: MLOps | Experiment Tracking, Docker, K8s, CI/CD, Monitoring |
| 17: Distributed ML | DDP, DeepSpeed, Spark, Ray, Streaming |
| 18: Advanced | RL, Causal, Federated, GNN, XAI, Quantum |
| 19: RAG | Architecture, Chunking, Vector DBs, Evaluation |
| 20: Specialized | FAISS, LangChain, LlamaIndex, Graph RAG |
| 21: End-to-End | 9 complete project pipelines |

## Deployment

Deploy to Vercel:

```bash
npx vercel
```

The `vercel.json` includes SPA rewrites, caching headers, and security headers.
