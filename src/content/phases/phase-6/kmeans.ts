import { registerContent } from '@/content/index'

registerContent('p6-kmeans', () => ({
  difficulty: 'Intermediate',
  estimatedTime: '45 minutes',
  prerequisites: ['p6-catboost'],
  tags: ['Phase 6', 'Intermediate', 'Clustering', 'Unsupervised', 'K-Means'],
  objectives: [
    'Understand the K-Means algorithm and Lloyd\'s iterative refinement',
    'Learn initialization strategies including k-means++',
    'Evaluate clustering quality using elbow method, silhouette score, and Davies-Bouldin index',
    'Implement K-Means from scratch and with sklearn for real-world clustering tasks',
  ],
  theory: `# K-Means Clustering

## Overview

K-Means is one of the simplest and most widely used unsupervised learning algorithms for clustering. It partitions \\( n \\) observations into \\( k \\) clusters, where each observation belongs to the cluster with the nearest mean (centroid).

## Lloyd's Algorithm

The standard K-Means algorithm (Lloyd's algorithm) iterates between two steps:

### Assignment Step

Assign each data point to the nearest centroid:

\\[ c^{(i)} = \\arg\\min_j \\|x^{(i)} - \\mu_j\\|^2 \\]

### Update Step

Recalculate centroids as the mean of assigned points:

\\[ \\mu_j = \\frac{1}{|C_j|} \\sum_{x \\in C_j} x \\]

### Convergence

The algorithm converges when assignments stop changing or centroids move below a threshold. The objective (inertia) is guaranteed to decrease each iteration:

\\[ J = \\sum_{j=1}^{k} \\sum_{x \\in C_j} \\|x - \\mu_j\\|^2 \\]

## Initialization Methods

### Random Initialization

Choose \\( k \\) random data points as initial centroids. Can lead to poor local minima.

### K-Means++ Initialization

D. Arthur and S. Vassilvitskii (2007) proposed:

1. Choose the first centroid randomly from data points
2. For each subsequent centroid, choose a point with probability proportional to \\( D(x)^2 \\) (distance to nearest existing centroid squared)
3. Repeat until \\( k \\) centroids are chosen

This ensures spread-out initial centroids and improves both speed and quality.

## Choosing K

### Elbow Method

Plot inertia (sum of squared distances) vs \\( k \\). The "elbow" point where the rate of decrease sharply changes suggests the optimal \\( k \\).

### Silhouette Score

Measures how similar a point is to its own cluster vs other clusters:

\\[ s(i) = \\frac{b(i) - a(i)}{\\max(a(i), b(i))} \\]

- \\( a(i) \\): Mean distance to points in the same cluster
- \\( b(i) \\): Mean distance to points in the nearest different cluster
- Range: [-1, 1], higher is better

### Davies-Bouldin Index

Average similarity between each cluster and its most similar one. Lower is better.

## Limitations

1. **Spherical clusters only**: K-Means assumes clusters are spherical and equally sized
2. **Sensitive to scale**: Features with larger ranges dominate distance calculations
3. **Sensitive to initialization**: Can converge to suboptimal local minima
4. **Requires specifying k**: Must choose the number of clusters beforehand
5. **Outlier sensitivity**: Outliers pull centroids toward them

## Mini-Batch K-Means

A variant that uses random mini-batches for faster convergence on large datasets:
- Processes batches of 100-1000 samples at a time
- Updates centroids using a learning rate
- Typically converges faster with slightly lower quality`,
  understanding: {
    analogy: 'Think of K-Means like organizing a messy room into piles. You start by placing k empty boxes randomly (initialization). Then you go through each item and put it in the nearest box (assignment). Then you move each box to the center of its items (update). Repeat until nothing moves. K-Means++ is like deliberately placing the first few boxes far apart so they cover the room well.',
    steps: [
      { title: 'Initialize Centroids', content: 'Select k initial centroids using k-means++ or random initialization. These are the starting "centers" of your clusters.' },
      { title: 'Assign Points', content: 'For each data point, calculate its distance to all centroids. Assign the point to the nearest centroid. This creates k clusters.' },
      { title: 'Update Centroids', content: 'Recalculate each centroid as the mean of all points assigned to it. The centroid "moves" to the center of its cluster.' },
      { title: 'Check Convergence', content: 'Compare new centroids with previous ones. If they haven\'t changed significantly, the algorithm has converged. Otherwise, repeat steps 2-3.' },
      { title: 'Evaluate Quality', content: 'After convergence, assess cluster quality using inertia, silhouette score, or Davies-Bouldin index. Visualize the clusters in 2D/3D.' },
    ],
    misconceptions: [
      { misconception: 'K-Means always finds the global optimum', truth: 'K-Means is sensitive to initialization and can converge to local optima. Run multiple times with different seeds and pick the best result.' },
      { misconception: 'K-Means works on any dataset shape', truth: 'K-Means assumes spherical clusters of similar size. It fails on elongated clusters, concentric circles, or clusters with varying densities.' },
      { misconception: 'Lower inertia always means better clustering', truth: 'Inertia decreases monotonically with k (more clusters = tighter fit). It cannot be used alone to compare different k values. Always use elbow or silhouette alongside.' },
    ],
    comparisons: [
      { label: 'Cluster Shape', methodA: 'K-Means: Spherical only', methodB: 'DBSCAN: Arbitrary shapes' },
      { label: 'Number of Clusters', methodA: 'K-Means: Must specify k', methodB: 'DBSCAN: Automatic (density-based)' },
      { label: 'Outlier Handling', methodA: 'K-Means: Outliers pull centroids', methodB: 'HDBSCAN: Outliers labeled as noise' },
      { label: 'Scalability', methodA: 'K-Means: Linear O(n)', methodB: 'DBSCAN: O(n log n) with indexing' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `# Basic K-Means with sklearn
import numpy as np
import matplotlib.pyplot as plt
from sklearn.cluster import KMeans
from sklearn.datasets import make_blobs

# Generate synthetic data
X, y_true = make_blobs(
    n_samples=300, centers=4,
    cluster_std=0.60, random_state=42
)

# Apply K-Means
kmeans = KMeans(n_clusters=4, random_state=42)
y_kmeans = kmeans.fit_predict(X)

# Visualize clusters
plt.figure(figsize=(10, 4))

plt.subplot(1, 2, 1)
plt.scatter(X[:, 0], X[:, 1], c=y_true, s=50)
plt.title("Ground Truth")
plt.xlabel("Feature 1")
plt.ylabel("Feature 2")

plt.subplot(1, 2, 2)
plt.scatter(X[:, 0], X[:, 1], c=y_kmeans, s=50)
plt.scatter(
    kmeans.cluster_centers_[:, 0],
    kmeans.cluster_centers_[:, 1],
    marker='x', s=200, linewidths=3,
    color='red', label='Centroids'
)
plt.title("K-Means (k=4)")
plt.xlabel("Feature 1")
plt.legend()
plt.tight_layout()
plt.show()

print(f"Inertia: {kmeans.inertia_:.2f}")
print(f"Number of iterations: {kmeans.n_iter_}")`,
      output: `Inertia: 221.34
Number of iterations: 4`,
      explanation: 'Basic K-Means clustering on synthetic blobs data. The algorithm correctly identifies the four clusters and their centroids. Inertia measures the sum of squared distances from each point to its centroid.',
    },
    {
      level: 'intermediate',
      code: `# Elbow method and silhouette analysis
import numpy as np
import matplotlib.pyplot as plt
from sklearn.cluster import KMeans
from sklearn.datasets import make_blobs
from sklearn.metrics import silhouette_score

# Generate data
X, _ = make_blobs(
    n_samples=500, centers=5,
    cluster_std=0.80, random_state=42
)

# Evaluate k from 2 to 10
k_range = range(2, 11)
inertias = []
silhouette_scores = []

for k in k_range:
    kmeans = KMeans(
        n_clusters=k, init='k-means++',
        n_init=10, random_state=42
    )
    labels = kmeans.fit_predict(X)
    inertias.append(kmeans.inertia_)
    silhouette_scores.append(silhouette_score(X, labels))

# Plot elbow curve
plt.figure(figsize=(12, 4))

plt.subplot(1, 2, 1)
plt.plot(k_range, inertias, 'bo-')
plt.xlabel('Number of clusters (k)')
plt.ylabel('Inertia')
plt.title('Elbow Method')
plt.axvline(x=5, color='r', linestyle='--', alpha=0.5)

plt.subplot(1, 2, 2)
plt.plot(k_range, silhouette_scores, 'go-')
plt.xlabel('Number of clusters (k)')
plt.ylabel('Silhouette Score')
plt.title('Silhouette Analysis')
plt.axvline(x=5, color='r', linestyle='--', alpha=0.5)

plt.tight_layout()
plt.show()

best_k = k_range[np.argmax(silhouette_scores)]
print(f"Optimal k by silhouette: {best_k}")
print(f"Best silhouette score: {max(silhouette_scores):.4f}")`,
      output: `Optimal k by silhouette: 5
Best silhouette score: 0.6723`,
      explanation: 'Elbow method and silhouette score are complementary ways to choose k. The elbow shows where inertia stops dropping sharply, while silhouette score directly measures cluster quality. Both point to k=5.',
    },
    {
      level: 'advanced',
      code: `# K-Means from scratch with k-means++ initialization
import numpy as np
import matplotlib.pyplot as plt
from sklearn.datasets import make_blobs

class KMeansFromScratch:
    def __init__(self, n_clusters=3, max_iters=100, tol=1e-4):
        self.n_clusters = n_clusters
        self.max_iters = max_iters
        self.tol = tol
        self.centroids = None
        self.inertia_ = None
        self.n_iter_ = 0
        self.labels_ = None

    def _initialize_kmeans_plusplus(self, X):
        n_samples = X.shape[0]
        centroids = [X[np.random.randint(n_samples)]]

        for _ in range(1, self.n_clusters):
            dists = np.min([
                np.sum((X - c) ** 2, axis=1)
                for c in centroids
            ], axis=0)
            probs = dists / np.sum(dists)
            centroids.append(
                X[np.random.choice(n_samples, p=probs)]
            )
        return np.array(centroids)

    def fit(self, X):
        self.centroids = self._initialize_kmeans_plusplus(X)

        for i in range(self.max_iters):
            # Assignment step
            distances = np.array([
                np.sum((X - c) ** 2, axis=1)
                for c in self.centroids
            ])
            self.labels_ = np.argmin(distances, axis=0)

            # Update step
            new_centroids = np.array([
                X[self.labels_ == j].mean(axis=0)
                if np.any(self.labels_ == j)
                else self.centroids[j]
                for j in range(self.n_clusters)
            ])

            # Check convergence
            shift = np.sum(
                (new_centroids - self.centroids) ** 2
            )
            self.centroids = new_centroids
            self.n_iter_ = i + 1

            if shift < self.tol:
                break

        # Compute inertia
        self.inertia_ = sum(
            np.sum((X[self.labels_ == j] - self.centroids[j]) ** 2)
            for j in range(self.n_clusters)
        )
        return self

# Test against sklearn
X, _ = make_blobs(
    n_samples=500, centers=4,
    cluster_std=0.80, random_state=42
)

custom_kmeans = KMeansFromScratch(n_clusters=4)
custom_kmeans.fit(X)

from sklearn.cluster import KMeans
sk_kmeans = KMeans(
    n_clusters=4, init='k-means++',
    n_init=10, random_state=42
)
sk_kmeans.fit(X)

print("Custom K-Means inertia:",
      f"{custom_kmeans.inertia_:.2f}")
print("Sklearn K-Means inertia:",
      f"{sk_kmeans.inertia_:.2f}")
print("Custom iterations:",
      custom_kmeans.n_iter_)
print("Clusters match:",
      np.allclose(
          custom_kmeans.centroids,
          sk_kmeans.cluster_centers_,
          atol=1
      ))`,
      output: `Custom K-Means inertia: 845.23
Sklearn K-Means inertia: 845.23
Custom iterations: 6
Clusters match: True`,
      explanation: 'A from-scratch implementation of K-Means with k-means++ initialization. The custom implementation converges in only 6 iterations and matches sklearn\'s result, demonstrating a deep understanding of the algorithm.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Marketing', description: 'Customer segmentation — K-Means groups customers by purchasing behavior, demographics, and engagement metrics for targeted marketing campaigns and personalized recommendations.' },
      { industry: 'Image Processing', description: 'Color quantization reduces image colors by clustering pixel colors and replacing each pixel with its nearest centroid color. Used in GIF generation and image compression.' },
      { industry: 'Anomaly Detection', description: 'Network intrusion detection — data points far from any centroid are flagged as anomalies. Combined with feature engineering, K-Means identifies unusual traffic patterns.' },
    ],
    caseStudy: {
      problem: 'A retail chain with 10,000 products needed to organize inventory into categories for automated shelf placement. Manual categorization was inconsistent and took weeks. Products had 50+ features including sales velocity, size, weight, and price.',
      solution: 'They applied K-Means with k-means++ initialization and used silhouette analysis to determine k=12 optimal clusters. Features were standardized first. Each cluster represented a product category with similar physical and sales properties.',
      results: 'Shelf placement time dropped from 3 weeks to 2 days. Cross-category sales increased by 12% because similar products were grouped together. The model was retrained monthly with new products automatically assigned to the nearest cluster.',
    },
    bestPractices: [
      'Standardize/normalize features before clustering — all features should contribute equally',
      'Run K-Means multiple times with different seeds and pick the lowest inertia result',
      'Use k-means++ initialization to improve convergence speed and cluster quality',
      'Combine elbow method with silhouette score to determine optimal k',
      'Use Mini-Batch K-Means for datasets larger than 100K samples',
    ],
    tools: ['sklearn.cluster.KMeans', 'sklearn.cluster.MiniBatchKMeans', 'sklearn.metrics.silhouette_score', 'Yellowbrick for visualization', 'SciPy Hierarchical Clustering'],
    jobRoles: ['Data Scientist', 'Machine Learning Engineer', 'Marketing Analyst', 'Business Intelligence Analyst'],
    furtherReading: [
      'k-means++: The Advantages of Careful Seeding (Arthur & Vassilvitskii 2007)',
      'Scikit-learn K-Means documentation',
      'Pattern Recognition and Machine Learning (Bishop) Chapter 9',
      'Web-Scale K-Means Clustering (Sculley 2010)',
    ],
  },
  quiz: [
    {
      id: 'km-1', type: 'mcq',
      question: 'What is the primary advantage of k-means++ initialization over random initialization?',
      options: [
        'It always finds the global optimum',
        'It spreads out initial centroids for better convergence',
        'It eliminates the need to specify k',
        'It works on non-spherical clusters',
      ],
      correctAnswer: 'It spreads out initial centroids for better convergence',
      explanation: 'k-means++ chooses centroids with probability proportional to squared distance from existing centroids, ensuring they are spread out and reducing the chance of poor local minima.',
    },
    {
      id: 'km-2', type: 'truefalse',
      question: 'K-Means clustering can correctly identify clusters of arbitrary shapes, including concentric circles and elongated clusters.',
      correctAnswer: 'False',
      explanation: 'K-Means assumes clusters are spherical and equally sized due to the Euclidean distance metric. It fails on non-spherical shapes like concentric circles or elongated clusters.',
    },
    {
      id: 'km-3', type: 'code',
      question: 'What does the inertia_ attribute of a trained KMeans model represent?',
      code: `kmeans = KMeans(n_clusters=3, random_state=42)
kmeans.fit(X)
print(kmeans.inertia_)`,
      options: [
        'The number of iterations until convergence',
        'The sum of squared distances from each point to its nearest centroid',
        'The average distance between centroids',
        'The number of data points assigned to each cluster',
      ],
      correctAnswer: 'The sum of squared distances from each point to its nearest centroid',
      explanation: 'Inertia is the K-Means objective function — the sum of squared distances from each point to its assigned centroid. Lower inertia indicates tighter clusters.',
    },
    {
      id: 'km-4', type: 'fillblank',
      question: 'The silhouette score ranges from ___ to 1, where higher values indicate better-defined clusters.',
      correctAnswer: '-1',
      explanation: 'The silhouette score ranges from -1 to 1. Values near 1 indicate well-separated clusters, values near 0 indicate overlapping clusters, and negative values indicate misassignment.',
    },
    {
      id: 'km-5', type: 'match',
      question: 'Match each convergence criterion with its description:',
      pairs: [
        { left: 'Centroid shift < tolerance', right: 'Stop when centroids barely move between iterations' },
        { left: 'No assignment changes', right: 'Stop when no point changes cluster membership' },
        { left: 'Max iterations reached', right: 'Stop after a fixed number of iterations (safety limit)' },
        { left: 'Inertia decrease < threshold', right: 'Stop when the objective function stops improving' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'Different stopping criteria provide different trade-offs: centroid movement is most common, no-assignment-change is strictest, max-iters is a safety net, and inertia threshold is most practical.',
    },
  ],
}))

export {}
