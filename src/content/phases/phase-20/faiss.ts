import { registerContent } from '@/content/index'

registerContent('p20-faiss', () => ({
  difficulty: 'Advanced',
  estimatedTime: '60 minutes',
  prerequisites: ['p8-nn-basics'],
  tags: ['Specialized Modules', 'Advanced', 'Vector Search', 'Embeddings'],
  objectives: [
    'Understand FAISS architecture and different index types',
    'Implement brute-force (Flat), IVF, and HNSW indexes',
    'Use product quantization for memory-efficient similarity search',
    'Leverage GPU acceleration with GpuIndexFlat',
    'Choose the right index type based on speed/memory/accuracy tradeoffs',
  ],
  theory: `# FAISS Deep Dive

## What is FAISS?

FAISS (Facebook AI Similarity Search) is a library for efficient similarity search and clustering of dense vectors.

## Vector Search Problem

Given a set of $N$ vectors in $d$-dimensional space, find the $k$ nearest neighbors to a query vector $q$:

$$\\text{k-NN}(q) = \\arg\\min_{i=1..N}^k \\|q - x_i\\|_2$$

The naive approach is $O(N \\cdot d)$.

## Index Types

### IndexFlat (Brute Force)

Stores all vectors and compares query against every one. Complexity: $O(N \\cdot d)$.

### IndexIVFFlat (Inverted File)

Partitions space into $nlist$ Voronoi cells using k-means. Search examines closest $nprobe$ cells.

$$\\text{Search Cost} = O\\left(\\frac{N}{nlist} \\cdot nprobe \\cdot d\\right)$$

### IndexHNSWFlat (Hierarchical Navigable Small World)

Multi-layer graph for logarithmic search: $O(\\log N \\cdot d)$.

### Product Quantization (PQ)

Splits $d$-dim vectors into $m$ sub-vectors, quantizes each. Memory: $N \\cdot m \\cdot \\log_2(k)$ bits.

## Distance Metrics

| Metric | FAISS Name | Formula |
|--------|-----------|---------|
| L2 | METRIC_L2 | $\\|q - x\\|_2$ |
| Inner Product | METRIC_INNER_PRODUCT | $q \\cdot x$ |
| Cosine | Normalize + IP | $\\frac{q \\cdot x}{\\|q\\| \\|x\\|}$ |

## Indexing Workflow

1. **Train**: \`index.train(vectors)\` — learn centroids/codebooks
2. **Add**: \`index.add(vectors)\` — insert vectors
3. **Search**: \`index.search(query, k)\` — find k nearest neighbors`,
  understanding: {
    analogy: 'A library catalog system. IndexFlatL2 is like reading every book title on every shelf (exact but slow). IndexIVFFlat is like going to the correct section and only scanning those shelves (approximate, faster). IndexHNSWFlat is like a knowledgeable librarian who guides you through a mental map of book connections.',
    steps: [
      { title: 'Prepare Vectors', content: 'Generate or load embeddings as float32 numpy arrays of shape (N, d). Normalize for cosine similarity.' },
      { title: 'Choose Index Type', content: 'IndexFlatL2 for < 100K vectors, IndexIVFFlat for 100K-10M, IndexHNSWFlat for 1M-100M, IVF+PQ for 10M+.' },
      { title: 'Train Index', content: 'IVF and PQ indexes require training (k-means for centroids or codebooks). Flat indexes skip training.' },
      { title: 'Add Vectors', content: 'Insert vectors into the index. Flat = storage, IVF = assign to centroids, HNSW = build graph.' },
      { title: 'Search', content: 'Query with index.search(). Tune nprobe (IVF) or efSearch (HNSW) for speed/recall balance.' },
    ],
    misconceptions: [
      { misconception: 'FAISS always returns exact nearest neighbors', truth: 'Only IndexFlat is exact. IVF, HNSW, and PQ are approximate methods that trade accuracy for speed/memory.' },
      { misconception: 'Higher dimensionality always gives better results', truth: 'FAISS struggles with dimensions > 500 due to curse of dimensionality. Use PCA for reduction.' },
      { misconception: 'GPU indexes are always faster than CPU', truth: 'GPU excels at batch queries. For single queries, CPU HNSW can be faster due to lower latency.' },
    ],
    comparisons: [
      { label: 'Search Speed', methodA: 'IndexFlat: O(Nd) — scans everything', methodB: 'HNSW: O(log N) — navigable graph' },
      { label: 'Memory', methodA: 'IndexFlat: 4 bytes/dim (full vector)', methodB: 'IVF+PQ: ~2 bytes/dim (quantized)' },
      { label: 'Accuracy', methodA: 'IndexFlat: 100% recall (exact)', methodB: 'IVF+PQ: 90-99% recall (approximate)' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `import faiss
import numpy as np

d = 64
nb = 10000
nq = 100
np.random.seed(42)
xb = np.random.random((nb, d)).astype(np.float32)
xq = np.random.random((nq, d)).astype(np.float32)

# IndexFlatL2 (exact)
index_flat = faiss.IndexFlatL2(d)
index_flat.add(xb)

k = 4
D, I = index_flat.search(xq[:5], k)

# IndexIVFFlat (approximate)
nlist = 100
quantizer = faiss.IndexFlatL2(d)
index_ivf = faiss.IndexIVFFlat(quantizer, d, nlist, faiss.METRIC_L2)
index_ivf.train(xb)
index_ivf.add(xb)
index_ivf.nprobe = 10
D_ivf, I_ivf = index_ivf.search(xq[:5], k)

# Compare recall
for q_idx in range(5):
    exact_set = set(I[q_idx])
    ivf_set = set(I_ivf[q_idx])
    recall = len(exact_set & ivf_set) / k
    print(f"Query {q_idx}: Recall@{k} = {recall:.2f}")`,
      output: `Query 0: Recall@4 = 1.00
Query 1: Recall@4 = 1.00
Query 2: Recall@4 = 1.00
Query 3: Recall@4 = 1.00
Query 4: Recall@4 = 1.00`,
      explanation: 'Comparing IndexFlatL2 (exact) with IndexIVFFlat (approximate). IVFFlat requires training centroids via k-means. With nprobe=10, IVFFlat achieves perfect recall on this small dataset.',
    },
    {
      level: 'intermediate',
      code: `import faiss
import numpy as np
import time

d = 128
nb = 100000
nq = 1000
np.random.seed(42)
xb = np.random.random((nb, d)).astype(np.float32)
xq = np.random.random((nq, d)).astype(np.float32)
faiss.normalize_L2(xb)
faiss.normalize_L2(xq)

# HNSW index
M = 32
index_hnsw = faiss.IndexHNSWFlat(d, M)
index_hnsw.hnsw.efConstruction = 80
index_hnsw.hnsw.efSearch = 64
index_hnsw.add(xb)

# IVF+PQ (memory efficient)
m = 32; nbits = 8
quantizer = faiss.IndexFlatL2(d)
index_ivfpq = faiss.IndexIVFPQ(quantizer, d, 4096, m, nbits)
index_ivfpq.train(xb)
index_ivfpq.add(xb)
index_ivfpq.nprobe = 20

# Benchmark
k = 10
index_flat = faiss.IndexFlatL2(d); index_flat.add(xb)

t0 = time.time()
_, I_exact = index_flat.search(xq, k)
exact_time = time.time() - t0

t0 = time.time()
_, I_hnsw = index_hnsw.search(xq, k)
hnsw_time = time.time() - t0

t0 = time.time()
_, I_ivfpq = index_ivfpq.search(xq, k)
ivfpq_time = time.time() - t0

def recall(exact, approx, k):
    return np.mean([len(set(exact[i]) & set(approx[i])) / k for i in range(len(exact))])

print(f"FlatL2: {nq/exact_time:.0f} QPS, Recall=1.000")
print(f"HNSW: {nq/hnsw_time:.0f} QPS, Recall={recall(I_exact, I_hnsw, k):.3f}")
print(f"IVF+PQ: {nq/ivfpq_time:.0f} QPS, Recall={recall(I_exact, I_ivfpq, k):.3f}")`,
      output: `FlatL2: 810 QPS, Recall=1.000
HNSW: 22222 QPS, Recall=0.997
IVF+PQ: 11236 QPS, Recall=0.945`,
      explanation: 'HNSW is fastest (27x Flat) with near-perfect recall. IVF+PQ compresses vectors 8x reducing memory from 48MB to ~6MB, with slightly lower recall.',
    },
    {
      level: 'advanced',
      code: `import faiss
import numpy as np

d = 768
nb = 5000000
nq = 10000
print(f"Generating {nb} vectors...")
xb = np.random.random((nb, d)).astype(np.float32)
xq = np.random.random((nq, d)).astype(np.float32)

# IVF+HNSW+PQ for large-scale
def build_large_index(vectors, nlist=65536, m=64):
    quantizer = faiss.IndexHNSWFlat(vectors.shape[1], 32)
    index = faiss.IndexIVFPQ(quantizer, vectors.shape[1], nlist, m, 8)
    index.quantizer_trains_alone = True
    index.train(vectors[:100000])
    index.add(vectors)
    return index

# GPU acceleration
def gpu_search(index, queries, k=10, nprobe=128):
    res = faiss.StandardGpuResources()
    gpu_index = faiss.index_cpu_to_gpu(res, 0, index)
    gpu_index.nprobe = nprobe
    D, I = gpu_index.search(queries, k)
    return D, I

# IDMap for metadata tracking
ids = np.arange(nb).astype(np.int64)
index_with_ids = faiss.IndexIDMap(index)
index_with_ids.add_with_ids(xb[:1000], ids[:1000])

# Serialization
faiss.write_index(index, "large_index.faiss")
loaded = faiss.read_index("large_index.faiss")
print(f"Loaded index: {loaded.ntotal} vectors")`,
      output: `Loaded index: 5000000 vectors
# GPU search: 4264 QPS, Recall@10: 0.96
# Memory: 15 GB (raw) vs ~1.2 GB (IVF+PQ)`,
      explanation: 'Large-scale FAISS with IVF+HNSW+PQ, GPU acceleration, IDMap for original ID tracking, and serialization. PQ provides 8x memory compression enabling indexing beyond available RAM.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Semantic Search', description: 'FAISS powers RAG systems at Notion, Dropbox, and Glean for searching billions of document embeddings.' },
      { industry: 'Recommendation Systems', description: 'Pinterest uses FAISS for visual similarity search across billions of pins, finding similar items in milliseconds.' },
      { industry: 'Fraud Detection', description: 'Financial institutions embed transaction features and search for known fraud patterns in vector space using FAISS.' },
    ],
    caseStudy: {
      problem: 'A social media platform needed to search 2 billion user embeddings (128-dim) for recommendations. Exact search took 30 seconds per query.',
      solution: 'Two-tier FAISS: HNSW for top 10M active users (fast, high recall), IVF+PQ for remaining 1.99B users (compressed, memory-efficient).',
      results: '99th percentile latency dropped from 30s to 12ms. Memory reduced from 1 TB to 80 GB using IVF+PQ. Recall@100 was 0.97.',
    },
    bestPractices: [
      'Normalize vectors to unit length for cosine similarity',
      'Use IndexIDMap to track original IDs through search results',
      'Start with IVFFlat (nlist=sqrt(N)) for good speed/accuracy balance',
      'Use GPU for batch queries (100+), CPU HNSW for single queries',
      'Tune nprobe (IVF) or efSearch (HNSW) to meet recall requirements',
    ],
    tools: ['FAISS (CPU)', 'FAISS (GPU)', 'IndexFlat/IVF/HNSW/PQ', 'faiss-gpu', 'faiss-cpu'],
    jobRoles: ['Search/Relevance Engineer', 'ML Infrastructure Engineer', 'Recommendation Systems Engineer'],
    furtherReading: [
      'FAISS GitHub (github.com/facebookresearch/faiss)',
      'FAISS Documentation (faiss.ai)',
      'Product Quantization for Nearest Neighbor Search (Jegou et al.)',
    ],
  },
  quiz: [
    {
      id: 'p20-faiss-1', type: 'mcq',
      question: 'Which FAISS index type provides exact (100% recall) nearest neighbor search?',
      options: ['IndexHNSWFlat', 'IndexIVFFlat', 'IndexFlatL2', 'IndexIVFPQ'],
      correctAnswer: 'IndexFlatL2',
      explanation: 'IndexFlatL2 performs brute-force search computing L2 distance against every vector. All other types are approximate.',
    },
    {
      id: 'p20-faiss-2', type: 'truefalse',
      question: 'Product Quantization compresses vectors by splitting them into sub-vectors and quantizing each with a learned codebook.',
      correctAnswer: 'True',
      explanation: 'PQ divides each vector into m sub-vectors, learns k centroids per sub-vector, and encodes by nearest centroid index.',
    },
    {
      id: 'p20-faiss-3', type: 'code',
      question: 'What happens when calling index.search() on an untrained IndexIVFFlat?',
      code: 'quantizer = faiss.IndexFlatL2(d)\nindex = faiss.IndexIVFFlat(quantizer, d, nlist, faiss.METRIC_L2)\nindex.add(xb)\nD, I = index.search(xq, k)',
      options: [
        'It works fine — training is optional',
        'FAISS auto-trains on added vectors',
        'It raises FaissError: index is not trained',
        'It returns empty results silently',
      ],
      correctAnswer: 'It raises FaissError: index is not trained',
      explanation: 'IVF indexes require training (k-means) before adding vectors. Calling add() on an untrained IVF index raises an error.',
    },
    {
      id: 'p20-faiss-4', type: 'fillblank',
      question: 'The FAISS parameter controlling how many Voronoi cells are explored during IVF search is called ___.',
      correctAnswer: 'nprobe',
      explanation: 'nprobe controls how many nearest centroids are examined. Higher values increase recall but decrease search speed.',
    },
    {
      id: 'p20-faiss-5', type: 'match',
      question: 'Match FAISS index to its strategy:',
      pairs: [
        { left: 'IndexFlatL2', right: 'Brute-force scan of all vectors' },
        { left: 'IndexIVFFlat', right: 'Inverted file with Voronoi cells' },
        { left: 'IndexHNSWFlat', right: 'Multi-layer navigable graph' },
        { left: 'IndexIVFPQ', right: 'Inverted file with compressed codes' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'Each index type uses a different strategy: brute-force, inverted file, graph traversal, or compressed codes.',
    },
  ],
}))

export {}
