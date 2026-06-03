import { registerContent } from '@/content/index'

registerContent('p6-tsne-umap', () => ({
  difficulty: 'Advanced',
  estimatedTime: '60 minutes',
  prerequisites: ['p6-pca'],
  tags: ['Phase 6', 'Advanced', 'Dimensionality Reduction', 'Unsupervised', 'Visualization'],
  objectives: [
    "Understand t-SNE's probability-based approach and KL divergence minimization",
    "Learn UMAP's theoretical foundation in Riemannian geometry and fuzzy simplicial sets",
    "Master key hyperparameters: perplexity, early exaggeration, n_neighbors, min_dist",
    "Compare t-SNE, UMAP, and PCA for visualization of high-dimensional data",
  ],
  theory: `# t-SNE & UMAP

## t-SNE (t-Distributed Stochastic Neighbor Embedding)

### Overview

t-SNE is a non-linear dimensionality reduction technique primarily used for visualizing high-dimensional data in 2D or 3D. It preserves local structure by modeling pairwise similarities as probabilities.

### How t-SNE Works

#### Step 1: High-Dimensional Similarities

For each pair of high-dimensional points, compute a conditional probability:

\\[ p_{j|i} = \\frac{\\exp(-\\|x_i - x_j\\|^2 / 2\\sigma_i^2)}{\\sum_{k \\neq i} \\exp(-\\|x_i - x_k\\|^2 / 2\\sigma_i^2)} \\]

Where \\( \\sigma_i \\) is determined by the **perplexity** parameter — it controls the effective number of neighbors.

Symmetrize: \\( p_{ij} = (p_{j|i} + p_{i|j}) / 2n \\)

#### Step 2: Low-Dimensional Similarities

Use a Student-t distribution (heavy-tailed) to map pairwise distances in the low-dimensional embedding:

\\[ q_{ij} = \\frac{(1 + \\|y_i - y_j\\|^2)^{-1}}{\\sum_{k \\neq l} (1 + \\|y_k - y_l\\|^2)^{-1}} \\]

The heavy tail prevents the "crowding problem" — moderate distances in high-D become large distances in low-D.

#### Step 3: KL Divergence Minimization

Minimize the Kullback-Leibler divergence between the high-D and low-D distributions:

\\[ \\text{KL}(P \\| Q) = \\sum_{i \\neq j} p_{ij} \\log \\frac{p_{ij}}{q_{ij}} \\]

This focuses the embedding on preserving local neighborhoods (since \\( p_{ij} \\) dominates when \\( p_{ij} \\) is large).

### Key Hyperparameters

| Parameter | Description | Typical Range |
|-----------|-------------|---------------|
| perplexity | Effective number of neighbors | 5-50 |
| early_exaggeration | How tight clusters are initially | 4-12 |
| learning_rate | Gradient descent step size | 10-1000 |
| n_iter | Number of optimization iterations | 250-1000 |

## UMAP (Uniform Manifold Approximation and Projection)

### Overview

UMAP is a more recent technique that is faster and better preserves global structure than t-SNE. It is based on Riemannian geometry and topological data analysis.

### How UMAP Works

#### Step 1: Build Fuzzy Simplicial Set

1. For each point, find its \\( k \\) nearest neighbors (controlled by \\( n\\_neighbors \\))
2. Build a local metric based on distances to neighbors
3. Create a "fuzzy" graph where edge weights represent the probability of connectivity

#### Step 2: Optimize Low-Dimensional Embedding

1. Initialize the embedding (often with spectral embedding)
2. Use cross-entropy as the cost function:
   - Attractive forces: Pull connected points together
   - Repulsive forces: Push unconnected points apart
3. Optimize using stochastic gradient descent

### Advantages Over t-SNE

1. **Faster**: O(n log n) vs O(n²) using approximate nearest neighbors
2. **Better global structure preservation**: Cross-entropy considers both local and global
3. **Deterministic**: UMAP can be made reproducible
4. **Scalable**: Works well on millions of data points
5. **Flexible**: Can be used for general dimensionality reduction, not just visualization

## Comparison with PCA

| Aspect | PCA | t-SNE | UMAP |
|--------|-----|-------|------|
| Type | Linear | Non-linear | Non-linear |
| Speed | Very fast | Slow (O(n²)) | Fast (O(n log n)) |
| Local structure | Poor | Excellent | Excellent |
| Global structure | Excellent | Poor | Good |
| Distances preserved | Yes | No | Partial |
| Interpretable axes | Yes | No | No |
| Deterministic | Yes | No | Approx. yes |

## Interpretation Caveats

1. **Distances are not meaningful**: Absolute distances between points in t-SNE/UMAP plots should not be interpreted
2. **Cluster sizes are arbitrary**: Larger clusters in the plot do not mean larger variance in the data
3. **Multiple runs differ**: t-SNE produces different results each run — run multiple times for consensus
4. **Global structure caution**: t-SNE may tear global structure apart; UMAP is better but still imperfect`,
  understanding: {
    analogy: "Think of t-SNE like creating a map of a city by asking every person who their neighbors are. People close together get high connection scores. The map tries to place people such that connection scores in the map match the real city. It's obsessed with getting neighborhoods right but doesn't care about overall layout. UMAP is like building the same map but using a more sophisticated rule — it considers both local neighborhoods AND the general city structure, preserving both.",
    steps: [
      { title: 'Compute Pairwise Distances (High-D)', content: "For t-SNE: convert distances to conditional probabilities using a Gaussian kernel with perplexity-controlled bandwidth. For UMAP: find k nearest neighbors and build a weighted graph." },
      { title: 'Initialize Embedding', content: "Start with random positions for each point in 2D/3D (t-SNE) or use spectral embedding initialization (UMAP). The quality of initialization affects the final result." },
      { title: 'Iterative Optimization', content: "Gradually adjust low-dimensional positions to minimize the cost function. t-SNE uses KL divergence; UMAP uses cross-entropy with attractive and repulsive forces." },
      { title: 'Early Exaggeration Phase (t-SNE)', content: "In early iterations, multiply high-D probabilities to create tighter clusters. This helps form natural groupings before fine-tuning." },
      { title: 'Final Embedding', content: "After optimization, low-dimensional coordinates represent a map where nearby points in original space remain nearby. Interpret with caution — embedding distances are NOT meaningful in absolute terms." },
    ],
    misconceptions: [
      { misconception: 'Distances in the t-SNE plot are meaningful', truth: "t-SNE preserves neighborhoods, not distances. The size, spacing, and shape of clusters should not be over-interpreted. Only relative closeness matters." },
      { misconception: 't-SNE clusters are guaranteed to exist in the original data', truth: "t-SNE can create apparent clusters even from random noise due to attraction-repulsion dynamics. Always validate clusters with other methods." },
      { misconception: 'Perplexity should always be set to 30', truth: "Perplexity=30 is a common default, but optimal values depend on data density. Larger datasets need higher perplexity (30-50), smaller datasets need lower (5-15)." },
    ],
    comparisons: [
      { label: 'Cost Function', methodA: 't-SNE: KL divergence (focuses local)', methodB: 'UMAP: Cross-entropy (local + global)' },
      { label: 'Distance Preservation', methodA: 't-SNE: Local distances only', methodB: 'PCA: Global distances' },
      { label: 'Computational Complexity', methodA: 't-SNE: O(n²)', methodB: 'UMAP: O(n log n)' },
      { label: 'Scalability', methodA: 't-SNE: Struggles >100K points', methodB: 'UMAP: Handles >1M points' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `# t-SNE visualization of MNIST digits
import numpy as np
import matplotlib.pyplot as plt
from sklearn.manifold import TSNE
from sklearn.datasets import load_digits
from sklearn.preprocessing import StandardScaler

digits = load_digits()
X, y = digits.data, digits.target

X_scaled = StandardScaler().fit_transform(X)

tsne = TSNE(
    n_components=2, perplexity=30,
    learning_rate=200, random_state=42
)
X_tsne = tsne.fit_transform(X_scaled)

print(f"Shape before: {X.shape}, after: {X_tsne.shape}")
print(f"Final KL divergence: {tsne.kl_divergence_:.2f}")

plt.figure(figsize=(10, 8))
scatter = plt.scatter(
    X_tsne[:, 0], X_tsne[:, 1],
    c=y, cmap='tab10', s=30, alpha=0.8
)
plt.colorbar(scatter, label='Digit')
plt.title("t-SNE Visualization of Digits Dataset")
plt.xlabel("t-SNE Component 1")
plt.ylabel("t-SNE Component 2")
plt.show()

print("\\nDigit distribution in visible clusters:")
for digit in range(10):
    center = X_tsne[y == digit].mean(axis=0)
    spread = X_tsne[y == digit].std(axis=0).mean()
    print(f"  Digit {digit}: center=({center[0]:.1f}, {center[1]:.1f}), spread={spread:.1f}")`,
      output: `Shape before: (1797, 64), after: (1797, 2)
Final KL divergence: 0.82

Digit distribution in visible clusters:
  Digit 0: center=(-10.2, 5.1), spread=6.3
  Digit 1: center=(12.8, 8.4), spread=5.8
  Digit 2: center=(2.1, -8.5), spread=7.2
  Digit 3: center=(5.4, -3.2), spread=6.9
  Digit 4: center=(-3.1, -7.8), spread=7.5
  Digit 5: center=(7.9, -6.1), spread=6.4
  Digit 6: center=(-8.5, 3.7), spread=5.9
  Digit 7: center=(11.2, -4.3), spread=6.1
  Digit 8: center=(-1.5, 1.2), spread=7.8
  Digit 9: center=(8.1, 5.9), spread=6.2`,
      explanation: "t-SNE creates a 2D visualization where each digit class forms clear clusters. The spread values indicate intra-class variation, and centers show where each digit is positioned in the embedding.",
    },
    {
      level: 'intermediate',
      code: `# t-SNE perplexity comparison and UMAP
import numpy as np
import matplotlib.pyplot as plt
from sklearn.manifold import TSNE
from sklearn.datasets import load_digits
from sklearn.preprocessing import StandardScaler

digits = load_digits()
X_scaled = StandardScaler().fit_transform(digits.data)
y = digits.target

perplexities = [5, 15, 30, 50]
fig, axes = plt.subplots(2, 2, figsize=(12, 12))

for ax, perplexity in zip(axes.flat, perplexities):
    tsne = TSNE(
        n_components=2, perplexity=perplexity,
        learning_rate=200, random_state=42
    )
    X_tsne = tsne.fit_transform(X_scaled)
    ax.scatter(X_tsne[:, 0], X_tsne[:, 1], c=y, cmap='tab10', s=20, alpha=0.7)
    ax.set_title(f"Perplexity = {perplexity}")
    ax.set_xlabel("Component 1")
    ax.set_ylabel("Component 2")
    ax.set_xticks([])
    ax.set_yticks([])

plt.tight_layout()
plt.show()

# UMAP comparison
try:
    import umap
    fig, axes = plt.subplots(1, 2, figsize=(14, 6))

    tsne = TSNE(
        n_components=2, perplexity=30,
        learning_rate=200, random_state=42
    )
    X_tsne = tsne.fit_transform(X_scaled)
    axes[0].scatter(X_tsne[:, 0], X_tsne[:, 1], c=y, cmap='tab10', s=20, alpha=0.7)
    axes[0].set_title("t-SNE (perp=30)")

    reducer = umap.UMAP(n_neighbors=15, min_dist=0.1, random_state=42)
    X_umap = reducer.fit_transform(X_scaled)
    axes[1].scatter(X_umap[:, 0], X_umap[:, 1], c=y, cmap='tab10', s=20, alpha=0.7)
    axes[1].set_title("UMAP (n_neighbors=15, min_dist=0.1)")

    plt.tight_layout()
    plt.show()

    print(f"t-SNE: {len(X_tsne)} points, KL={tsne.kl_divergence_:.2f}")
    print(f"UMAP: {len(X_umap)} points")
except ImportError:
    print("UMAP not installed. Install with: pip install umap-learn")`,
      output: `t-SNE: 1797 points, KL=0.82
UMAP: 1797 points`,
      explanation: "Lower perplexity (5) creates many small tight clusters. Higher perplexity (50) creates larger looser clusters. UMAP preserves more global structure — digit groups are arranged more coherently than t-SNE.",
    },
    {
      level: 'advanced',
      code: `# Comprehensive comparison: PCA vs t-SNE vs UMAP
import numpy as np
import matplotlib.pyplot as plt
from sklearn.manifold import TSNE
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
from sklearn.datasets import fetch_openml
import time

print("Loading Fashion MNIST...")
X, y = fetch_openml(
    'Fashion-MNIST', version=1,
    return_X_y=True, as_frame=False, parser='pandas'
)

np.random.seed(42)
indices = np.random.choice(len(X), 3000, replace=False)
X_sub = X[indices]
y_sub = y[indices].astype(int)
X_scaled = StandardScaler().fit_transform(X_sub)

pca_start = time.time()
X_pca = PCA(n_components=2).fit_transform(X_scaled)
pca_time = time.time() - pca_start

tsne_start = time.time()
X_tsne = TSNE(
    n_components=2, perplexity=30,
    learning_rate=200, random_state=42
).fit_transform(X_scaled)
tsne_time = time.time() - tsne_start

has_umap = False
try:
    import umap
    umap_start = time.time()
    X_umap = umap.UMAP(
        n_neighbors=15, min_dist=0.1, random_state=42
    ).fit_transform(X_scaled)
    umap_time = time.time() - umap_start
    has_umap = True
except ImportError:
    umap_time = 0

n_plots = 3 if has_umap else 2
fig, axes = plt.subplots(1, n_plots, figsize=(n_plots * 6, 5))

data = [(X_pca, 'PCA', pca_time), (X_tsne, 't-SNE', tsne_time)]
if has_umap:
    data.append((X_umap, 'UMAP', umap_time))

fashion_labels = ['T-shirt', 'Trouser', 'Pullover', 'Dress', 'Coat',
                  'Sandal', 'Shirt', 'Sneaker', 'Bag', 'Boot']

for ax, (X_emb, name, t) in zip(axes, data):
    scatter = ax.scatter(
        X_emb[:, 0], X_emb[:, 1],
        c=y_sub, cmap='tab10', s=10, alpha=0.8
    )
    ax.set_title(f"{name} ({t:.2f}s)")
    ax.set_xlabel("Component 1")
    ax.set_ylabel("Component 2")

plt.tight_layout()
plt.show()

print(f"PCA:    {pca_time:.2f}s - preserves global structure, linear")
print(f"t-SNE:  {tsne_time:.2f}s - preserves local neighborhoods")
if has_umap:
    print(f"UMAP:   {umap_time:.2f}s - preserves local + global")`,
      output: `PCA:    0.12s - preserves global structure, linear
t-SNE:  24.53s - preserves local neighborhoods
UMAP:   3.21s - preserves local + global`,
      explanation: "PCA is fastest but cannot separate non-linear patterns. t-SNE creates well-separated clusters by category but is 200x slower than PCA. UMAP achieves similar separation to t-SNE at 8x speedup, making it the best choice for large-scale visualization.",
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Bioinformatics', description: "Single-cell RNA sequencing data has 20,000+ gene expression features per cell. t-SNE and UMAP visualize cell types and states, revealing biological populations that correspond to known cell types." },
      { industry: 'NLP', description: "Word embedding visualization — t-SNE/UMAP project 300-dimensional word vectors into 2D to reveal semantic relationships, clusters of related words, and analogies in the embedding space." },
      { industry: 'Customer Analytics', description: "High-dimensional customer behavior data (100+ features) reduced to 2D for visual segmentation analysis, helping identify natural customer personas without predefined categories." },
    ],
    caseStudy: {
      problem: "A pharmaceutical company needed to identify novel cell subtypes from single-cell RNA-seq data with 30,000 genes and 100,000 cells. PCA only captured the major cell types, missing rare but biologically important subpopulations.",
      solution: "They applied UMAP with n_neighbors=30 and min_dist=0.3 to the top 50 principal components (denoising step). This revealed 28 distinct cell clusters, including 4 previously unknown subtypes.",
      results: "UMAP identified rare cell subtypes that PCA missed (as few as 0.5% of total cells). The visualization enabled biologists to validate clusters against known marker genes. Two of the novel subtypes were later confirmed as therapeutic targets.",
    },
    bestPractices: [
      "Preprocess with PCA (retain 90% variance) before t-SNE/UMAP to reduce noise and speed computation",
      "Run t-SNE multiple times with different seeds — only trust patterns that appear consistently",
      "For UMAP, tune n_neighbors (small=local focus, large=global focus) and min_dist (tightness of clusters)",
      "Never draw conclusions from absolute distances or cluster sizes in t-SNE plots",
      "Validate t-SNE/UMAP clusters with external validation metrics or domain expert review",
    ],
    tools: ['sklearn.manifold.TSNE', 'umap-learn Python Package', 'OpenTSNE (faster t-SNE)', 'bhtsne (Barnes-Hut t-SNE)', 'Plotly / Datashader for interactive viz'],
    jobRoles: ['Data Scientist', 'Research Scientist', 'Bioinformatician', 'Data Visualization Engineer'],
    furtherReading: [
      "Visualizing Data using t-SNE (Van der Maaten & Hinton 2008)",
      "UMAP: Uniform Manifold Approximation and Projection (McInnes et al. 2018)",
      "How to Use t-SNE Effectively (Wattenberg, Viégas & Johnson 2016)",
      "Distill.pub: A馃崉emakers",
    ],
  },
  quiz: [
    {
      id: 'ts-1', type: 'mcq',
      question: 'What type of structure does t-SNE primarily preserve in its low-dimensional embedding?',
      options: [
        'Global structure and large-scale distances',
        'Local neighborhood structure',
        'Both local and global structure equally',
        'Only the variance of the first principal component',
      ],
      correctAnswer: 'Local neighborhood structure',
      explanation: "t-SNE uses KL divergence which heavily penalizes cases where nearby points in high-D are far apart in low-D. This prioritizes preserving local structure at the expense of global structure.",
    },
    {
      id: 'ts-2', type: 'truefalse',
      question: "Distances between points in a t-SNE plot are meaningful and can be interpreted as relative distances in the original high-dimensional space.",
      correctAnswer: 'False',
      explanation: "t-SNE preserves neighborhoods (ordering), not distances. Absolute distances, cluster sizes, and the overall shape of the plot should not be interpreted as meaningful.",
    },
    {
      id: 'ts-3', type: 'code',
      question: "What does the perplexity parameter control in t-SNE?",
      code: `tsne = TSNE(perplexity=30, random_state=42)
X_tsne = tsne.fit_transform(X)`,
      options: [
        'The number of output dimensions',
        'The effective number of neighbors for each point',
        'The speed of the optimization',
        'The size of the output clusters',
      ],
      correctAnswer: 'The effective number of neighbors for each point',
      explanation: "Perplexity controls the bandwidth of the Gaussian kernel, which determines how many neighbors each point considers. Typical values range from 5 to 50.",
    },
    {
      id: 'ts-4', type: 'fillblank',
      question: "t-SNE minimizes the ___ divergence between the high-dimensional pairwise similarity distribution and the low-dimensional one.",
      correctAnswer: 'KL (Kullback-Leibler)',
      explanation: "KL divergence measures how one probability distribution diverges from another. t-SNE's asymmetric KL divergence focuses on preserving local neighborhoods.",
    },
    {
      id: 'ts-5', type: 'match',
      question: "Match each algorithm with its key feature:",
      pairs: [
        { left: 'PCA', right: 'Linear variance maximization' },
        { left: 't-SNE', right: 'KL divergence with Student-t distribution' },
        { left: 'UMAP', right: 'Fuzzy simplicial sets with cross-entropy' },
        { left: 'PCA + t-SNE', right: 'Noise reduction then local structure preservation' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: "PCA preserves global variance linearly, t-SNE focuses on local neighborhoods non-linearly, UMAP balances both, and combining PCA+t-SNE is a common best practice.",
    },
  ],
}))

export {}
