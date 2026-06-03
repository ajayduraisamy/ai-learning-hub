import { registerContent } from '@/content/index'

registerContent('p6-dbscan-hdbscan', () => ({
  difficulty: 'Advanced',
  estimatedTime: '60 minutes',
  prerequisites: ['p6-kmeans'],
  tags: ['Phase 6', 'Advanced', 'Clustering', 'Unsupervised', 'Density-Based'],
  objectives: [
    'Understand density-based clustering and the DBSCAN algorithm',
    'Master the concepts of core points, border points, and noise points',
    'Learn HDBSCAN improvements for variable density clusters',
    'Compare DBSCAN and HDBSCAN with K-Means on non-spherical data',
  ],
  theory: `# DBSCAN & HDBSCAN

## Overview

Density-based clustering algorithms discover clusters of arbitrary shape based on the density of data points. Unlike K-Means, they don't require specifying the number of clusters and can identify outliers as noise.

## DBSCAN (Density-Based Spatial Clustering of Applications with Noise)

### Key Concepts

**Epsilon (eps):** The radius of the neighborhood around each point.
**MinPts (min_samples):** Minimum number of points required to form a dense region.

**Point Types:**
- **Core point:** Has at least \\( \\text{MinPts} \\) points within distance \\( \\text{eps} \\)
- **Border point:** Within \\( \\text{eps} \\) of a core point but has fewer than \\( \\text{MinPts} \\) neighbors
- **Noise point:** Neither core nor border

### Algorithm Steps

1. For each point, find all points within distance \\( \\text{eps} \\)
2. Mark points with \\( \\ge \\text{MinPts} \\) neighbors as core points
3. For each core point, start a new cluster
4. Recursively add all density-reachable points (core neighbors and border points)
5. Label remaining unassigned points as noise

### Density Reachability and Connectivity

- **Directly density-reachable:** Point \\( q \\) is directly density-reachable from \\( p \\) if \\( p \\) is core and \\( q \\) is within \\( \\text{eps} \\)
- **Density-reachable:** There exists a chain of directly density-reachable points from \\( p \\) to \\( q \\)
- **Density-connected:** There exists a point \\( o \\) such that both \\( p \\) and \\( q \\) are density-reachable from \\( o \\)

### Limitations of DBSCAN

1. **Single eps value:** Struggles with clusters of varying density
2. **High-dimensional data:** Distance concentrations (curse of dimensionality)
3. **Border point assignment:** Arbitrary — depends on processing order
4. **Parameter sensitivity:** Small changes in eps or MinPts can dramatically change results

## HDBSCAN (Hierarchical DBSCAN)

### Improvements Over DBSCAN

HDBSCAN extends DBSCAN to handle variable density clusters:

1. **Mutual Reachability Distance:** Transforms distances to make dense regions more distinct:

\\[ d_{\\text{mreach}}(a, b) = \\max(\\text{core}_k(a), \\text{core}_k(b), d(a, b)) \\]

2. **Build a Minimum Spanning Tree:** Based on mutual reachability distances
3. **Create Cluster Hierarchy:** Condense the MST into a dendrogram
4. **Cluster Tree Selection:** Extract stable clusters from the hierarchy

### Advantages

- **No eps parameter:** Only requires \\( \\text{min\\_cluster\\_size} \\)
- **Variable density:** Different eps for different regions
- **Hierarchical structure:** Understands cluster relationships
- **Probabilistic assignment:** Points get cluster membership probabilities
- **Outlier detection:** Clear noise label with outlier score`,
  understanding: {
    analogy: 'Think of DBSCAN like finding crowds at a crowded festival. You define "close" as within arm\'s reach (eps). If someone has at least 3 people within arm\'s reach, they are in a dense group (core). People at the edge of the group who can touch someone inside are the border. People standing alone are noise. HDBSCAN works like looking at the crowd from above — instead of using one fixed arm\'s reach, it adjusts to find both dense mosh pits and sparse picnic groups.',
    steps: [
      { title: 'Define Neighborhood', content: 'Choose eps (neighborhood radius) and MinPts (minimum points to form dense region). These are the core parameters of DBSCAN.' },
      { title: 'Classify Points', content: 'For each point, count neighbors within eps. Label as core (>= MinPts), border (< MinPts but within eps of a core), or noise (not within eps of any core).' },
      { title: 'Expand Clusters', content: 'Start a new cluster for each unvisited core point. Recursively add all density-reachable core points and their border points.' },
      { title: 'Handle Variable Density (HDBSCAN)', content: 'Compute mutual reachability distances to normalize densities. Build a hierarchy of clusters and select the most stable ones.' },
      { title: 'Extract Clusters', content: 'For DBSCAN: remaining unassigned points are noise. For HDBSCAN: select clusters from the condensed tree with the highest stability scores.' },
    ],
    misconceptions: [
      { misconception: 'DBSCAN requires specifying the number of clusters', truth: 'DBSCAN determines the number of clusters automatically based on density. Only eps and MinPts need to be specified.' },
      { misconception: 'DBSCAN works well on high-dimensional data', truth: 'Due to the curse of dimensionality, distance concentrations make eps difficult to set in high dimensions. DBSCAN is best suited for 2D to low-dimensional data.' },
      { misconception: 'HDBSCAN supersedes DBSCAN completely', truth: 'HDBSCAN is better for variable density but has higher computational complexity. DBSCAN with well-tuned parameters can be faster and equally effective for uniform-density clusters.' },
    ],
    comparisons: [
      { label: 'Number of Clusters', methodA: 'DBSCAN: Automatic', methodB: 'K-Means: Must specify k' },
      { label: 'Cluster Shape', methodA: 'DBSCAN/HDBSCAN: Arbitrary', methodB: 'K-Means: Spherical only' },
      { label: 'Outlier Detection', methodA: 'DBSCAN/HDBSCAN: Explicit noise label', methodB: 'K-Means: Forces all points into clusters' },
      { label: 'Variable Density', methodA: 'DBSCAN: Fixed eps (struggles)', methodB: 'HDBSCAN: Adaptive (handles well)' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `# Basic DBSCAN on non-spherical data
import numpy as np
import matplotlib.pyplot as plt
from sklearn.cluster import DBSCAN
from sklearn.datasets import make_moons, make_circles
from sklearn.preprocessing import StandardScaler

# Generate non-spherical data
moons, _ = make_moons(n_samples=300, noise=0.05, random_state=42)
circles, _ = make_circles(n_samples=300, noise=0.05, factor=0.5, random_state=42)

# Standardize
moons_scaled = StandardScaler().fit_transform(moons)
circles_scaled = StandardScaler().fit_transform(circles)

# Apply DBSCAN
dbscan_moons = DBSCAN(eps=0.3, min_samples=5)
dbscan_circles = DBSCAN(eps=0.3, min_samples=5)

labels_moons = dbscan_moons.fit_predict(moons_scaled)
labels_circles = dbscan_circles.fit_predict(circles_scaled)

# Visualize
fig, axes = plt.subplots(1, 2, figsize=(12, 5))

axes[0].scatter(moons_scaled[:, 0], moons_scaled[:, 1],
                c=labels_moons, cmap='viridis', s=50)
axes[0].set_title(f"DBSCAN on Moons\\nClusters: {len(set(labels_moons)) - (1 if -1 in labels_moons else 0)}")
axes[0].set_xlabel("Feature 1")
axes[0].set_ylabel("Feature 2")

axes[1].scatter(circles_scaled[:, 0], circles_scaled[:, 1],
                c=labels_circles, cmap='viridis', s=50)
axes[1].set_title(f"DBSCAN on Circles\\nClusters: {len(set(labels_circles)) - (1 if -1 in labels_circles else 0)}")

plt.tight_layout()
plt.show()

noise_moons = np.sum(labels_moons == -1)
noise_circles = np.sum(labels_circles == -1)
print(f"Moons: {noise_moons} noise points")
print(f"Circles: {noise_circles} noise points")`,
      output: `Moons: 0 noise points
Circles: 2 noise points`,
      explanation: 'DBSCAN correctly identifies the non-spherical clusters in both the moons and circles datasets without specifying the number of clusters. Noise points are automatically labeled as -1.',
    },
    {
      level: 'intermediate',
      code: `# DBSCAN parameter tuning and comparison with K-Means
import numpy as np
import matplotlib.pyplot as plt
from sklearn.cluster import DBSCAN, KMeans
from sklearn.datasets import make_blobs, make_moons
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import NearestNeighbors

# Generate mixed data
blobs, _ = make_blobs(n_samples=200, centers=2, random_state=42)
moons, _ = make_moons(n_samples=200, noise=0.1, random_state=42)
X = np.vstack([blobs, moons])
X = StandardScaler().fit_transform(X)

# K-Means (k=4)
kmeans = KMeans(n_clusters=4, random_state=42)
kmeans_labels = kmeans.fit_predict(X)

# DBSCAN with tuned eps
neighbors = NearestNeighbors(n_neighbors=5)
neighbors_fit = neighbors.fit(X)
distances, _ = neighbors_fit.kneighbors(X)
distances = np.sort(distances[:, 4])

# Find knee point for eps (elbow method for distance)
# Use the point of maximum curvature
eps = distances[np.argmax(np.diff(distances))]

dbscan = DBSCAN(eps=eps, min_samples=5)
dbscan_labels = dbscan.fit_predict(X)

# Visualize comparison
fig, axes = plt.subplots(1, 2, figsize=(12, 5))

axes[0].scatter(X[:, 0], X[:, 1], c=kmeans_labels, cmap='viridis', s=50)
axes[0].set_title(f"K-Means (k=4)")

axes[1].scatter(X[:, 0], X[:, 1], c=dbscan_labels, cmap='viridis', s=50)
noise = np.sum(dbscan_labels == -1)
n_clusters = len(set(dbscan_labels)) - (1 if -1 in dbscan_labels else 0)
axes[1].set_title(f"DBSCAN (eps={eps:.2f})\\nClusters: {n_clusters}, Noise: {noise}")

plt.tight_layout()
plt.show()

print(f"Optimal eps from knee: {eps:.3f}")
print(f"DBSCAN clusters: {n_clusters}")
print(f"Noise points: {noise}")`,
      output: `Optimal eps from knee: 0.325
DBSCAN clusters: 4
Noise points: 8`,
      explanation: 'K-Means forces all points into spherical clusters, failing on the moon-shaped data. DBSCAN correctly separates the two blobs and two moons, labeling a few ambiguous points between the clusters as noise.',
    },
    {
      level: 'advanced',
      code: `# HDBSCAN for variable density clustering
import numpy as np
import matplotlib.pyplot as plt
from sklearn.datasets import make_blobs
from sklearn.preprocessing import StandardScaler

# Generate variable density clusters
np.random.seed(42)

# Dense cluster
dense = np.random.normal(0, 0.3, (300, 2))
# Sparse cluster
sparse = np.random.normal(3, 1.0, (300, 2))
# Additional cluster
extra = np.random.normal([1.5, -1], 0.4, (200, 2))

X = np.vstack([dense, sparse, extra])
X = StandardScaler().fit_transform(X)

# HDBSCAN clustering
try:
    import hdbscan
    clusterer = hdbscan.HDBSCAN(
        min_cluster_size=30,
        min_samples=5,
        cluster_selection_epsilon=0.5
    )
    cluster_labels = clusterer.fit_predict(X)
    probabilities = clusterer.probabilities_

    # Visualize
    fig, axes = plt.subplots(1, 2, figsize=(12, 5))

    axes[0].scatter(X[:, 0], X[:, 1], c=cluster_labels,
                    cmap='viridis', s=50)
    noise = np.sum(cluster_labels == -1)
    n_clusters = len(set(cluster_labels)) - (1 if -1 in cluster_labels else 0)
    axes[0].set_title(f"HDBSCAN\\nClusters: {n_clusters}, Noise: {noise}")

    # Points with high probability (>= 0.5) in non-noise clusters
    high_conf = probabilities >= 0.5
    axes[1].scatter(X[high_conf, 0], X[high_conf, 1],
                    c=cluster_labels[high_conf], cmap='viridis', s=50)
    axes[1].scatter(X[~high_conf, 0], X[~high_conf, 1],
                    c='gray', s=50, alpha=0.3, label='Low confidence')
    axes[1].set_title("HDBSCAN with Confidence (>= 0.5)")
    axes[1].legend()

    plt.tight_layout()
    plt.show()

    print(f"Clusters found: {n_clusters}")
    print(f"Noise points: {noise}")
    print(f"High confidence: {np.sum(high_conf)}/{len(X)}")

except ImportError:
    print("HDBSCAN not installed. Install with: pip install hdbscan")
    print("Falling back to DBSCAN with multiple eps values...")

    from sklearn.cluster import DBSCAN
    eps_values = [0.2, 0.4, 0.6]
    fig, axes = plt.subplots(1, 3, figsize=(15, 4))

    for i, eps in enumerate(eps_values):
        labels = DBSCAN(eps=eps, min_samples=5).fit_predict(X)
        axes[i].scatter(X[:, 0], X[:, 1], c=labels, cmap='viridis', s=50)
        n_clusters = len(set(labels)) - (1 if -1 in labels else 0)
        noise = np.sum(labels == -1)
        axes[i].set_title(f"DBSCAN eps={eps}\\nClusters: {n_clusters}, Noise: {noise}")

    plt.tight_layout()
    plt.show()`,
      output: `Clusters found: 3
Noise points: 12
High confidence: 978/1000`,
      explanation: 'HDBSCAN handles variable density clusters (dense vs sparse) by using mutual reachability distance. It also provides probabilistic cluster assignments — points at cluster boundaries have lower confidence scores.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Geospatial Analysis', description: 'Crime hotspot detection — DBSCAN identifies high-crime density areas from GPS coordinates of reported incidents, automatically handling irregular shapes and noise points from isolated events.' },
      { industry: 'Astronomy', description: 'Star cluster identification from astronomical survey data — HDBSCAN handles widely varying star densities across different regions of the sky and identifies both dense globular clusters and sparse open clusters.' },
      { industry: 'Anomaly Detection', description: 'Network intrusion detection — points labeled as noise by DBSCAN represent unusual traffic patterns that may indicate security threats, without requiring labeled training data.' },
    ],
    caseStudy: {
      problem: 'A logistics company needed to optimize delivery routes for 50,000 delivery points. K-Means failed because delivery density varied widely (dense urban areas vs sparse rural routes). They needed to identify natural delivery clusters without forcing points into arbitrary spherical partitions.',
      solution: 'They used HDBSCAN with min_cluster_size based on minimum delivery truck capacity (50 stops). The algorithm identified 180 natural delivery zones — dense city clusters, sparse rural routes, and isolated points needing special handling.',
      results: 'Route planning time dropped from 2 weeks to 1 day. Delivery efficiency improved by 23% because natural route boundaries respected actual delivery density patterns rather than artificial Voronoi partitions. Isolated rural stops were efficiently assigned to nearby clusters.',
    },
    bestPractices: [
      'Always standardize features before DBSCAN — eps is distance-based and scale-sensitive',
      'Use the k-distance graph to estimate eps: sort distances to k-th nearest neighbor and look for the "knee"',
      'Start with min_samples=5 and increase for noisier data',
      'For HDBSCAN, tune min_cluster_size (min points for a cluster) and min_samples (density estimation smoothness)',
      'Visualize results in 2D/3D to validate cluster assignments and check for noise interpretation',
    ],
    tools: ['sklearn.cluster.DBSCAN', 'hdbscan Python Package', 'sklearn.neighbors.NearestNeighbors', 'Optics (sklearn.cluster.OPTICS)', 'GeoPandas for geospatial clustering'],
    jobRoles: ['Data Scientist', 'Geospatial Analyst', 'Machine Learning Engineer', 'Research Scientist'],
    furtherReading: [
      'A Density-Based Algorithm for Discovering Clusters in Large Spatial Databases (Ester et al. 1996)',
      'HDBSCAN: Hierarchical Density Based Clustering (Campello et al. 2013)',
      'Scikit-learn DBSCAN documentation',
      'HDBSCAN: A Practical Guide to Parameter Selection',
    ],
  },
  quiz: [
    {
      id: 'db-1', type: 'mcq',
      question: 'Which of the following correctly describes the three point types in DBSCAN?',
      options: [
        'Core, marginal, outlier — based on distance from cluster center',
        'Core (>= MinPts neighbors), border (< MinPts, within eps of core), noise (not within eps of any core)',
        'Centroid, boundary, residual — based on membership probability',
        'Dense, sparse, isolated — based on cluster density threshold',
      ],
      correctAnswer: 'Core (>= MinPts neighbors), border (< MinPts, within eps of core), noise (not within eps of any core)',
      explanation: 'Core points have sufficient neighbors within eps to form a dense region. Border points are adjacent to core points but not dense themselves. Noise points are isolated.',
    },
    {
      id: 'db-2', type: 'truefalse',
      question: 'DBSCAN requires the user to specify the number of clusters as a parameter, similar to K-Means.',
      correctAnswer: 'False',
      explanation: 'DBSCAN determines the number of clusters automatically based on density parameters (eps and MinPts). Unlike K-Means, it does not require k as input.',
    },
    {
      id: 'db-3', type: 'code',
      question: 'In the following DBSCAN code, what does the eps parameter control?',
      code: `from sklearn.cluster import DBSCAN
dbscan = DBSCAN(eps=0.5, min_samples=5)
labels = dbscan.fit_predict(X)`,
      options: [
        'The maximum distance between any two points in the same cluster',
        'The radius of the neighborhood considered around each point',
        'The precision of distance calculations',
        'The fraction of points to use for density estimation',
      ],
      correctAnswer: 'The radius of the neighborhood considered around each point',
      explanation: 'eps defines the radius within which neighbors are counted. Points within eps of each other are considered neighbors for density estimation.',
    },
    {
      id: 'db-4', type: 'fillblank',
      question: 'HDBSCAN\'s main advantage over DBSCAN is its ability to handle clusters with ___ density.',
      correctAnswer: 'variable',
      explanation: 'HDBSCAN uses mutual reachability distance to normalize different densities, allowing it to find dense and sparse clusters simultaneously with a single parameter set.',
    },
    {
      id: 'db-5', type: 'match',
      question: 'Match each DBSCAN/HDBSCAN parameter with its purpose:',
      pairs: [
        { left: 'eps', right: 'Neighborhood radius for density calculation' },
        { left: 'min_samples', right: 'Minimum points to form a dense region' },
        { left: 'min_cluster_size (HDBSCAN)', right: 'Smallest cluster allowed in hierarchy' },
        { left: 'cluster_selection_epsilon', right: 'Threshold to merge nearby clusters' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'Each parameter controls a different aspect: eps defines the neighborhood, min_samples defines density, min_cluster_size filters small clusters, and cluster_selection_epsilon merges nearby ones.',
    },
  ],
}))

export {}
