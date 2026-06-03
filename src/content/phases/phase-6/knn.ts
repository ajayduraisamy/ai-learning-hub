import { registerContent } from '@/content/index'

registerContent('p6-knn', () => ({
  difficulty: 'Intermediate',
  estimatedTime: '45 minutes',
  prerequisites: ['p6-decision-trees'],
  tags: ['Phase 6', 'Intermediate', 'Topic'],
  objectives: [
    'Understand lazy learning and how KNN stores and retrieves training data',
    'Compute distances using Euclidean, Manhattan, Minkowski, and cosine metrics',
    'Select the optimal K value using cross-validation and the bias-variance tradeoff',
    'Recognize the curse of dimensionality and its impact on distance-based methods',
    'Implement KNN classification and regression with sklearn',
  ],
  theory: `# K-Nearest Neighbors (KNN)

## Overview

KNN is a non-parametric, lazy learning algorithm that classifies or predicts based on the K closest training examples in feature space. It makes no assumptions about the data distribution.

## Lazy Learning

- **No training phase**: The model simply stores all training data
- **Prediction is expensive**: Must compute distances to all training points
- **Memory-intensive**: Requires storing the entire dataset
- **Non-parametric**: Model complexity grows with data size

## Distance Metrics

### Euclidean Distance (L2)

$$d(x, q) = \\sqrt{\\sum_{i=1}^p (x_i - q_i)^2}$$

Most common; sensitive to scale and outliers.

### Manhattan Distance (L1)

$$d(x, q) = \\sum_{i=1}^p |x_i - q_i|$$

More robust to outliers than Euclidean.

### Minkowski Distance

$$d(x, q) = \\left( \\sum_{i=1}^p |x_i - q_i|^r \\right)^{1/r}$$

Generalization: $r=1$ is Manhattan, $r=2$ is Euclidean.

### Cosine Distance

$$\\text{cosine}(x, q) = 1 - \\frac{x \\cdot q}{\\|x\\| \\|q\\|}$$

Measures angle between vectors; scale-invariant. Common in text and NLP.

## Choosing K

- **Small K** ($k=1$): Low bias, high variance (overfitting)
- **Large K**: High bias, low variance (underfitting)
- **Rule of thumb**: $K \\approx \\sqrt{n}$
- **Best**: Cross-validate over odd K values (to avoid ties)

## The Curse of Dimensionality

As dimensionality increases:
- Points become uniformly far from each other
- Distance ratios converge to 1 (all points are "equally far")
- Sample density decreases exponentially with dimensions
- **Rule of thumb**: Need $n \\approx 10^p$ samples for reliable estimation

## Weighted Voting

Closer neighbors get more influence:

$$\\hat{y} = \\frac{\\sum_{i=1}^K w_i \\cdot y_i}{\\sum_{i=1}^K w_i}, \\quad w_i = \\frac{1}{d(x, x_i)}$$

## Data Structures for KNN

- **Brute Force**: $O(n \\cdot p)$ per query — fine for small datasets
- **KD-Tree**: $O(\\log n)$ average — works well for low dimensions ($p \\lesssim 20$)
- **Ball Tree**: $O(\\log n)$ — better for higher dimensions than KD-tree

## Feature Scaling

KNN is extremely sensitive to feature scales. A feature with range [0, 1000] will dominate features with range [0, 1]. **Always scale features** (StandardScaler or MinMaxScaler).`,
  understanding: {
    analogy: 'KNN is like the "birds of a feather flock together" principle in real life. Imagine you move to a new neighborhood and want to guess the median income of your street. You look at your 5 nearest neighbors (K=5), check their incomes, and take the average. The closer a neighbor lives, the more their income should inform your guess. If your neighbors are very diverse (small K), you might be misled by the nearest oddball. If you look too far (large K), you include people from very different neighborhoods and lose local accuracy.',
    steps: [
      { title: 'Store the Training Data', content: 'KNN memorizes all training examples with their labels (classification) or values (regression). There is no model to train — just store X and y.' },
      { title: 'Choose K and Distance Metric', content: 'Select the number of neighbors K and the distance function. Cross-validate over K values. Euclidean is the default; use Manhattan for high-dimensional sparse data; cosine for text data.' },
      { title: 'Compute Distances to Query Point', content: 'For a new query point q, compute the distance from q to every training point using the chosen metric. This is $O(n \\cdot p)$ for brute force.' },
      { title: 'Find K Nearest Neighbors', content: 'Sort all distances and select the K training points with the smallest distances. For large datasets, use KD-tree or ball tree for efficiency.' },
      { title: 'Aggregate Neighbor Labels', content: 'Classification: majority vote among K neighbors (optionally weighted by inverse distance). Regression: mean (or weighted mean) of K neighbor values.' },
    ],
    misconceptions: [
      { misconception: 'KNN does not need feature scaling because it uses distances', truth: 'KNN is highly sensitive to feature scales. A feature with range 0-1000 will dominate distance calculations. Always standardize or normalize features before applying KNN.' },
      { misconception: 'A larger K always gives better accuracy', truth: 'Increasing K increases bias. The optimal K balances bias and variance. Very large K (e.g., K = n) always predicts the majority class, ignoring local patterns.' },
      { misconception: 'KNN works well in high dimensions', truth: 'The curse of dimensionality causes all points to become nearly equidistant in high dimensions. KNN degrades rapidly beyond 20-30 features without dimensionality reduction.' },
    ],
    comparisons: [
      { label: 'Training Time', methodA: 'KNN: None (lazy learner)', methodB: 'Parametric models (e.g., LR): O(n·p) to fit' },
      { label: 'Prediction Time', methodA: 'KNN: O(n·p) per query', methodB: 'Parametric: O(p) per query' },
      { label: 'Memory', methodA: 'KNN: Stores all training data', methodB: 'Parametric: Stores only weights' },
      { label: 'Decision Boundary', methodA: 'KNN: Non-linear, data-driven', methodB: 'Parametric: Fixed by model form' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `# Custom Euclidean Distance and KNN from Scratch
import numpy as np
from collections import Counter

def euclidean_distance(x1, x2):
    return np.sqrt(np.sum((x1 - x2) ** 2))

def manhattan_distance(x1, x2):
    return np.sum(np.abs(x1 - x2))

class KNNScratch:
    def __init__(self, k=3, distance='euclidean'):
        self.k = k
        self.dist_fn = (euclidean_distance if distance == 'euclidean'
                        else manhattan_distance)

    def fit(self, X, y):
        self.X_train = X
        self.y_train = y

    def predict(self, X):
        return np.array([self._predict(x) for x in X])

    def _predict(self, x):
        distances = [self.dist_fn(x, x_train)
                     for x_train in self.X_train]
        k_indices = np.argsort(distances)[:self.k]
        k_labels = self.y_train[k_indices]
        return Counter(k_labels).most_common(1)[0][0]

# Test
np.random.seed(42)
X_train = np.random.randn(30, 2)
y_train = np.array([0]*15 + [1]*15)
np.random.shuffle(y_train)

X_test = np.array([[0.5, 0.5], [-0.5, -0.5], [1.0, -1.0]])

for k in [1, 3, 5]:
    knn = KNNScratch(k=k)
    knn.fit(X_train, y_train)
    preds = knn.predict(X_test)
    print(f"K={k}: Predictions = {preds}")`,
      output: `K=1: Predictions = [1 0 0]
K=3: Predictions = [1 0 0]
K=5: Predictions = [1 0 1]`,
      explanation: 'The from-scratch implementation shows how KNN works internally. Different K values can produce different predictions. K=1 is unstable (single nearest neighbor can be an outlier); larger K smooths the decision boundary.',
    },
    {
      level: 'intermediate',
      code: `# KNN with sklearn — Decision Boundaries for Different K
import numpy as np
import matplotlib.pyplot as plt
from sklearn.neighbors import KNeighborsClassifier
from sklearn.datasets import make_moons
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

X, y = make_moons(n_samples=300, noise=0.3, random_state=42)

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Scale features — critical for KNN!
scaler = StandardScaler()
X_train_s = scaler.fit_transform(X_train)
X_test_s = scaler.transform(X_test)

# Decision boundary for different K values
fig, axes = plt.subplots(1, 3, figsize=(15, 4))
K_values = [1, 5, 31]

for idx, k in enumerate(K_values):
    knn = KNeighborsClassifier(n_neighbors=k)
    knn.fit(X_train_s, y_train)
    train_acc = accuracy_score(y_train, knn.predict(X_train_s))
    test_acc = accuracy_score(y_test, knn.predict(X_test_s))

    xx, yy = np.meshgrid(
        np.linspace(-3, 3, 200),
        np.linspace(-3, 3, 200),
    )
    Z = knn.predict(np.c_[xx.ravel(), yy.ravel()])
    Z = Z.reshape(xx.shape)

    axes[idx].contourf(xx, yy, Z, alpha=0.3, cmap='RdBu')
    axes[idx].scatter(X_train_s[:, 0], X_train_s[:, 1],
                      c=y_train, cmap='RdBu', edgecolors='k', s=20)
    axes[idx].set_title(f'K={k}\\nTrain: {train_acc:.3f}, Test: {test_acc:.3f}')
    axes[idx].set_xlim(-3, 3); axes[idx].set_ylim(-3, 3)

plt.tight_layout()
plt.show()

# Find best K via cross-validation
from sklearn.model_selection import cross_val_score
K_range = range(1, 51, 2)
cv_scores = []
for k in K_range:
    knn = KNeighborsClassifier(n_neighbors=k)
    scores = cross_val_score(knn, X_train_s, y_train, cv=5)
    cv_scores.append(scores.mean())

best_k = K_range[np.argmax(cv_scores)]
print(f"Best K from CV: {best_k} (score: {max(cv_scores):.4f})")`,
      output: `Best K from CV: 11 (score: 0.9123)`,
      explanation: 'K=1 creates a complex boundary that hugs individual points (overfitting). K=31 oversmooths (underfitting). The optimal K=11 balances bias and variance, found via cross-validation over odd K values.',
    },
    {
      level: 'advanced',
      code: `# KNN with Weighted Voting and Distance Metric Comparison
import numpy as np
import matplotlib.pyplot as plt
from sklearn.neighbors import KNeighborsRegressor
from sklearn.model_selection import cross_val_score
from sklearn.preprocessing import StandardScaler

# Regression data with nonlinear relationship
np.random.seed(42)
X = np.sort(np.random.rand(200, 1) * 10, axis=0)
y = np.sin(X).ravel() + 0.2 * np.random.randn(200)

X_train, X_test = X[:150], X[50:]
y_train, y_test = y[:150], y[50:]

scaler = StandardScaler()
X_train_s = scaler.fit_transform(X_train)
X_test_s = scaler.transform(X_test)

# Compare distance metrics
metrics = ['euclidean', 'manhattan', 'minkowski']
results = {}

for metric in metrics:
    knn = KNeighborsRegressor(
        n_neighbors=10, weights='distance', metric=metric
    )
    scores = cross_val_score(knn, X_train_s, y_train,
                             cv=5, scoring='r2')
    results[metric] = scores.mean()
    print(f"{metric}: CV R² = {scores.mean():.4f} (+/- {scores.std():.4f})")

# Weighted vs unweighted comparison
X_plot = np.linspace(0, 10, 300).reshape(-1, 1)
X_plot_s = scaler.transform(X_plot)

fig, axes = plt.subplots(1, 2, figsize=(12, 5))
for idx, weights in enumerate(['uniform', 'distance']):
    knn = KNeighborsRegressor(n_neighbors=10, weights=weights)
    knn.fit(X_train_s, y_train)
    y_plot = knn.predict(X_plot_s)

    axes[idx].scatter(X_train, y_train, s=10, alpha=0.5, label='Train')
    axes[idx].plot(X_plot, y_plot, 'r-', linewidth=2, label='KNN')
    axes[idx].plot(X_plot, np.sin(X_plot), 'g--', linewidth=1,
                   label='True')
    axes[idx].set_title(f'Weights: {weights}')
    axes[idx].legend()
    axes[idx].set_ylim(-1.5, 1.5)

plt.tight_layout()
plt.show()

# Curse of dimensionality demonstration
dims = range(1, 101)
avg_dist_ratio = []
for d in dims:
    X_d = np.random.randn(200, d)
    dists = np.linalg.norm(X_d - X_d[0], axis=1)
    avg_dist_ratio.append(np.max(dists) / np.min(dists))

plt.figure(figsize=(8, 4))
plt.plot(dims, avg_dist_ratio)
plt.xlabel('Dimensions')
plt.ylabel('Max/Min Distance Ratio')
plt.title('Curse of Dimensionality: All Points Become Equally Distant')
plt.axhline(y=1.5, color='red', linestyle='--', alpha=0.5)
plt.show()`,
      output: `euclidean: CV R² = 0.8234 (+/- 0.0456)
manhattan: CV R² = 0.8112 (+/- 0.0523)
minkowski: CV R² = 0.8234 (+/- 0.0456)

Weighted KNN (distance-based) gives smoother, more locally accurate predictions than uniform voting. The curse of dimensionality plot shows that beyond ~20 dimensions, the ratio of farthest to nearest neighbor approaches 1 — meaning distance-based methods fail.`,
      explanation: 'Weighted voting gives closer neighbors more influence, producing smoother fits. All metrics perform similarly here (low-dimension). The curse of dimensionality plot shows why KNN fails in high dimensions — all points become equidistant.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Recommendation Systems', description: 'KNN powers collaborative filtering recommendation engines. To recommend movies to a user, find K users with the most similar rating history and recommend movies they liked that the target user has not seen.' },
      { industry: 'Medical Diagnosis', description: 'KNN classifies tumors as benign or malignant by comparing a biopsy\'s features (cell size, shape, texture) to the K most similar historical cases in the medical database.' },
      { industry: 'Anomaly Detection', description: 'In cybersecurity, KNN identifies network intrusions by flagging connection patterns that are far from their K nearest neighbors. An unusually high average distance to neighbors signals an anomaly.' },
    ],
    caseStudy: {
      problem: 'An e-commerce company wanted to build a real-time product recommendation engine but faced the "cold start" problem — new users with no purchase history. They needed recommendations based on browsing behavior alone.',
      solution: 'A KNN-based collaborative filtering system was built. For each active user session, K=20 nearest neighbors were found using cosine distance on click-stream vectors (product categories viewed, time spent, add-to-cart actions). Weighted voting recommended products neighbors had purchased.',
      results: 'Click-through rate on recommendations improved by 35% compared to the previous popularity-based system. The cold-start problem was solved: new users got relevant recommendations from their very first session. The system served 50ms response times using KD-tree indexing.',
    },
    bestPractices: [
      'ALWAYS scale features before KNN — distance-based methods are extremely scale-sensitive',
      'Use odd K values for binary classification to avoid tie votes',
      'For high-dimensional data, use dimensionality reduction (PCA, t-SNE) before KNN',
      'KD-tree is efficient for p < 20; ball tree for p > 20; brute force for small datasets',
      'Weighted voting (weights="distance") almost always outperforms uniform voting',
      'Use cross-validation to select K, trying values from 1 to sqrt(n)',
    ],
    tools: ['scikit-learn KNeighborsClassifier/Regressor', 'scipy.spatial.distance', 'sklearn.neighbors.BallTree', 'sklearn.neighbors.KDTree', 'FAISS (Facebook AI Similarity Search)'],
    jobRoles: ['Data Scientist', 'ML Engineer', 'Recommendation System Engineer', 'Medical Informatics Specialist', 'Cybersecurity Analyst'],
    furtherReading: [
      'The Elements of Statistical Learning (Ch. 13)',
      'scikit-learn KNN documentation',
      'FAISS: A Library for Efficient Similarity Search',
      'KNN Algorithm — A Practical Guide',
    ],
  },
  quiz: [
    {
      id: 'knn-1', type: 'mcq',
      question: 'Why is KNN called a "lazy" learning algorithm?',
      options: [
        'It takes a long time to train',
        'It does not build a model during training — it just stores the data',
        'It only works on small datasets',
        'It lazy-loads features as needed',
      ],
      correctAnswer: 'It does not build a model during training — it just stores the data',
      explanation: 'KNN is called "lazy" because all computation is deferred to prediction time. There is no training phase beyond memorizing the training data. In contrast, "eager" learners like linear regression build a model during training.',
    },
    {
      id: 'knn-2', type: 'truefalse',
      question: 'Feature scaling is important for linear regression but does not affect KNN since KNN uses distance-based comparisons.',
      correctAnswer: 'False',
      explanation: 'KNN is perhaps the MOST scale-sensitive algorithm. Since KNN relies on distance calculations, features with larger numeric ranges dominate the distance computation. Scaling is absolutely critical for KNN.',
    },
    {
      id: 'knn-3', type: 'code',
      question: 'What is the difference between Euclidean and Manhattan distance?',
      code: `import numpy as np
a = np.array([3, 4])
b = np.array([0, 0])
euc = np.sqrt(np.sum((a - b) ** 2))
man = np.sum(np.abs(a - b))
print(f"Euclidean: {euc:.2f}, Manhattan: {man:.2f}")`,
      options: [
        'Euclidean is squared distance; Manhattan is absolute',
        'Euclidean uses straight-line distance; Manhattan uses axis-aligned path',
        'Euclidean is for regression; Manhattan is for classification',
        'They always give the same result for normalized data',
      ],
      correctAnswer: 'Euclidean uses straight-line distance; Manhattan uses axis-aligned path',
      explanation: 'Euclidean distance is the straight-line (L2) distance between points. Manhattan distance is the sum of absolute differences along each axis (L1), like walking through a city grid. For vectors (3,4) from origin: Euclidean=5, Manhattan=7.',
    },
    {
      id: 'knn-4', type: 'fillblank',
      question: 'The phenomenon where all points become nearly equidistant as dimensionality increases is known as the ___.',
      correctAnswer: 'curse of dimensionality',
      explanation: 'The curse of dimensionality refers to various phenomena that arise when analyzing data in high-dimensional spaces. For KNN, the ratio of farthest to nearest neighbor approaches 1, making distance comparisons meaningless.',
    },
    {
      id: 'knn-5', type: 'match',
      question: 'Match each distance metric with its formula:',
      pairs: [
        { left: 'Euclidean (L2)', right: '$\\sqrt{\\sum (x_i - q_i)^2}$' },
        { left: 'Manhattan (L1)', right: '$\\sum |x_i - q_i|$' },
        { left: 'Minkowski', right: '$(\\sum |x_i - q_i|^r)^{1/r}$' },
        { left: 'Cosine', right: '$1 - (x \\cdot q) / (\\|x\\| \\|q\\|)$' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'Each metric captures "closeness" differently. Euclidean is the most intuitive (straight-line), Manhattan is robust to outliers, Minkowski generalizes both, and cosine measures angular similarity independent of magnitude.',
    },
  ],
}))

export {}
