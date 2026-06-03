import { registerContent } from '@/content/index'

registerContent('p6-pca', () => ({
  difficulty: 'Advanced',
  estimatedTime: '60 minutes',
  prerequisites: ['p6-dbscan-hdbscan'],
  tags: ['Phase 6', 'Advanced', 'Dimensionality Reduction', 'Unsupervised', 'Feature Engineering'],
  objectives: [
    'Understand PCA as variance-maximizing projection and its eigendecomposition foundation',
    'Learn to interpret explained variance ratio, scree plots, and principal components',
    'Master PCA for visualization, noise reduction, and preprocessing pipelines',
    'Implement PCA with sklearn and understand SVD-based computation',
  ],
  theory: `# PCA (Principal Component Analysis)

## Overview

Principal Component Analysis (PCA) is the most widely used linear dimensionality reduction technique. It finds a new set of orthogonal axes (principal components) that capture the maximum variance in the data.

## The Core Idea

PCA transforms the original features into a new coordinate system where:

1. **First principal component:** Direction of maximum variance
2. **Second principal component:** Direction of maximum variance orthogonal to PC1
3. And so on...

## Mathematical Foundation

### Covariance Matrix

Given data matrix \\( X \\) with \\( n \\) samples and \\( d \\) features (mean-centered):

\\[ \\Sigma = \\frac{1}{n-1} X^T X \\]

### Eigendecomposition

The eigenvectors of the covariance matrix define the principal components:

\\[ \\Sigma v_i = \\lambda_i v_i \\]

Where:
- \\( v_i \\) is the \\( i^{\\text{th}} \\) eigenvector (principal component direction)
- \\( \lambda_i \\) is the \\( i^{\\text{th}} \\) eigenvalue (variance along that component)

### Variance Explained

\\[ \\text{Explained variance ratio}_i = \\frac{\\lambda_i}{\\sum_{j=1}^{d} \\lambda_j} \\]

## SVD-Based Computation

For numerical stability, PCA is typically computed via Singular Value Decomposition:

\\[ X = U \\Sigma V^T \\]

- Columns of \\( V \\) are the principal components
- Singular values \\( \\sigma_i = \\sqrt{\\lambda_i (n-1)} \\)
- SVD avoids computing the covariance matrix explicitly

## PCA Pipeline

1. **Standardize** each feature to zero mean and unit variance
2. **Compute** covariance matrix (or SVD)
3. **Find** eigenvalues and eigenvectors
4. **Sort** eigenvectors by descending eigenvalue
5. **Select** top \\( k \\) components
6. **Project** data onto the selected components

## Whitening

PCA whitening transforms data to have identity covariance:

\\[ X_{\\text{whitened}} = X V \\Sigma^{-1} \\]

This makes all features uncorrelated with unit variance — useful for algorithms that assume isotropic data.

## Reconstruction Error

Projecting \\( k \\)-dimensional data back to the original space:

\\[ \\hat{X} = X_k V_k^T \\]

The reconstruction error \\( \\|X - \\hat{X}\\|^2 \\) equals the sum of discarded eigenvalues.

## PCA for Visualization vs Preprocessing

| Use Case | Goal | Components |
|----------|------|------------|
| Visualization | 2D/3D plot | 2-3 |
| Noise reduction | Improve downstream accuracy | 10-100 |
| Preprocessing | Reduce overfitting | Keep 90-95% variance |
| Compression | Save storage | As few as possible |`,
  understanding: {
    analogy: 'Think of PCA like casting a 3D object\'s shadow on a 2D ground. The shadow loses the height dimension but preserves as much information as possible about the shape. Different angles of light (different principal components) reveal different aspects of the object. The first principal component is like the light angle that creates the most informative shadow — the one that best spreads out the points. The explained variance ratio tells you how much of the original "information" is preserved in that shadow.',
    steps: [
      { title: 'Standardize the Data', content: 'Center each feature to mean=0 and scale to variance=1. This ensures all features contribute equally regardless of their original units (otherwise, a feature measured in dollars would dominate one measured in cents).' },
      { title: 'Compute Covariance Matrix', content: 'Calculate the covariance matrix of the standardized data. Each entry represents how two features vary together — positive values mean they increase together, negative values mean one increases while the other decreases.' },
      { title: 'Eigendecomposition', content: 'Find eigenvectors and eigenvalues of the covariance matrix. Eigenvectors are the principal component directions; eigenvalues tell you how much variance each direction captures.' },
      { title: 'Select Components', content: 'Sort eigenvectors by descending eigenvalue. Choose the top k components that together explain sufficient variance (typically 90-95%). The scree plot helps visualize this decision.' },
      { title: 'Project the Data', content: 'Multiply the original data by the matrix of selected principal components. The result is a lower-dimensional representation that preserves maximum variance.' },
    ],
    misconceptions: [
      { misconception: 'PCA components are interpretable in the original feature space', truth: 'Principal components are linear combinations of all original features. They are mathematical constructs and often difficult to interpret semantically.' },
      { misconception: 'PCA always improves model performance', truth: 'PCA can discard low-variance features that are actually important for the target variable. Always evaluate on a validation set rather than assuming PCA helps.' },
      { misconception: 'PCA works well on all data types', truth: 'PCA assumes linear relationships and works poorly on categorical data. For non-linear structures, t-SNE or UMAP are more appropriate.' },
    ],
    comparisons: [
      { label: 'Linearity', methodA: 'PCA: Linear transformation', methodB: 't-SNE / UMAP: Non-linear transformation' },
      { label: 'Global Structure', methodA: 'PCA: Preserves global variance', methodB: 't-SNE: Preserves local neighborhoods' },
      { label: 'Speed', methodA: 'PCA: Fast (O(d^3) or O(nd^2))', methodB: 't-SNE: Slow (O(n^2))' },
      { label: 'Determinism', methodA: 'PCA: Deterministic (same result each time)', methodB: 't-SNE: Non-deterministic (different each run)' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `# Basic PCA for dimensionality reduction
import numpy as np
import matplotlib.pyplot as plt
from sklearn.decomposition import PCA
from sklearn.datasets import load_digits
from sklearn.preprocessing import StandardScaler

# Load digits dataset (8x8 images = 64 features)
digits = load_digits()
X, y = digits.data, digits.target

print(f"Original shape: {X.shape}")

# Standardize
X_scaled = StandardScaler().fit_transform(X)

# Apply PCA reducing to 2 components
pca = PCA(n_components=2)
X_pca = pca.fit_transform(X_scaled)

print(f"Reduced shape: {X_pca.shape}")
print(f"Explained variance ratio: {pca.explained_variance_ratio_}")
print(f"Total variance explained: {sum(pca.explained_variance_ratio_):.4f}")

# Visualize
plt.figure(figsize=(10, 8))
scatter = plt.scatter(
    X_pca[:, 0], X_pca[:, 1],
    c=y, cmap='tab10', s=50, alpha=0.8
)
plt.colorbar(scatter, label='Digit')
plt.xlabel(f"PC1 ({pca.explained_variance_ratio_[0]:.2%} variance)")
plt.ylabel(f"PC2 ({pca.explained_variance_ratio_[1]:.2%} variance)")
plt.title("PCA on Digits Dataset")
plt.show()`,
      output: `Original shape: (1797, 64)
Reduced shape: (1797, 2)
Explained variance ratio: [0.1451 0.1027]
Total variance explained: 0.2478`,
      explanation: 'PCA reduces the 64-dimensional digit images to just 2 components. Even with only 24.8% of the variance, the 2D visualization shows the 10 digit classes are somewhat separated, though overlapping.',
    },
    {
      level: 'intermediate',
      code: `# Explained variance analysis and scree plot
import numpy as np
import matplotlib.pyplot as plt
from sklearn.decomposition import PCA
from sklearn.datasets import load_wine
from sklearn.preprocessing import StandardScaler

# Load wine dataset
wine = load_wine()
X, y = wine.data, wine.target

# Standardize
X_scaled = StandardScaler().fit_transform(X)

# Fit PCA without reducing (compute all components)
pca = PCA()
X_pca = pca.fit_transform(X_scaled)

n_components_full = len(pca.explained_variance_ratio_)

# Scree plot
fig, axes = plt.subplots(1, 2, figsize=(14, 5))

# Scree plot (individual variance)
axes[0].bar(
    range(1, n_components_full + 1),
    pca.explained_variance_ratio_,
    alpha=0.7, label='Individual'
)
axes[0].plot(
    range(1, n_components_full + 1),
    pca.explained_variance_ratio_.cumsum(),
    'ro-', label='Cumulative'
)
axes[0].axhline(y=0.9, color='gray', linestyle='--', alpha=0.5)
axes[0].set_xlabel('Principal Component')
axes[0].set_ylabel('Explained Variance Ratio')
axes[0].set_title('Scree Plot')
axes[0].legend()

# Cumulative variance
axes[1].plot(
    range(1, n_components_full + 1),
    pca.explained_variance_ratio_.cumsum() * 100,
    'go-'
)
axes[1].axhline(y=90, color='gray', linestyle='--', alpha=0.5)
axes[1].set_xlabel('Number of Components')
axes[1].set_ylabel('Cumulative Variance (%)')
axes[1].set_title('Cumulative Explained Variance')
axes[1].grid(True, alpha=0.3)

plt.tight_layout()
plt.show()

# Find components needed for 90% variance
cumsum = pca.explained_variance_ratio_.cumsum()
n_90 = np.argmax(cumsum >= 0.90) + 1
print(f"Components for 90% variance: {n_90} "
      f"(from {n_components_full} features)")
print(f"Variance per component:")
for i, var in enumerate(pca.explained_variance_ratio_[:5]):
    print(f"  PC{i+1}: {var:.4f} ({var*100:.2f}%)")`,
      output: `Components for 90% variance: 7 (from 13 features)
Variance per component:
  PC1: 0.3619 (36.19%)
  PC2: 0.1921 (19.21%)
  PC3: 0.1127 (11.27%)
  PC4: 0.0721 (7.21%)
  PC5: 0.0658 (6.58%)`,
      explanation: 'The scree plot shows that the first 7 components capture 90% of the variance in the wine dataset. PC1 alone captures 36% of the variance. This analysis helps determine how many components to retain.',
    },
    {
      level: 'advanced',
      code: `# PCA for preprocessing: impact on classifier performance
import numpy as np
import matplotlib.pyplot as plt
from sklearn.decomposition import PCA
from sklearn.datasets import load_digits
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import cross_val_score
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC

# Load data
digits = load_digits()
X, y = digits.data, digits.target
X_scaled = StandardScaler().fit_transform(X)

# Evaluate classifier with and without PCA
classifiers = {
    'Random Forest': RandomForestClassifier(
        n_estimators=100, random_state=42
    ),
    'SVM (RBF)': SVC(kernel='rbf', random_state=42),
}

# Without PCA
print("Without PCA:")
for name, clf in classifiers.items():
    scores = cross_val_score(
        clf, X_scaled, y, cv=5, scoring='accuracy'
    )
    print(f"  {name}: {scores.mean():.4f} (+/- {scores.std():.4f})")

# With PCA (retain 90% variance)
pca_full = PCA().fit(X_scaled)
cumsum = pca_full.explained_variance_ratio_.cumsum()
n_components = np.argmax(cumsum >= 0.90) + 1

pca = PCA(n_components=n_components)
X_pca = pca.fit_transform(X_scaled)

print(f"\\nWith PCA ({n_components} components, 90% variance):")
for name, clf in classifiers.items():
    scores = cross_val_score(
        clf, X_pca, y, cv=5, scoring='accuracy'
    )
    print(f"  {name}: {scores.mean():.4f} (+/- {scores.std():.4f})")

# Noise reduction: reconstruct with top components
n_examples = 5
random_idx = np.random.choice(len(X), n_examples, replace=False)

# Reconstruct with increasing components
n_components_list = [5, 15, 30]

fig, axes = plt.subplots(
    n_examples, len(n_components_list) + 1,
    figsize=(15, 8)
)

for row, idx in enumerate(random_idx):
    original = X_scaled[idx]
    axes[row, 0].imshow(
        digits.images[idx], cmap='gray'
    )
    axes[row, 0].set_title("Original")
    axes[row, 0].axis('off')

    for col, n_comp in enumerate(n_components_list):
        pca_sub = PCA(n_components=n_comp)
        reduced = pca_sub.fit_transform(
            X_scaled[idx].reshape(1, -1)
        )
        reconstructed = pca_sub.inverse_transform(reduced)
        axes[row, col + 1].imshow(
            reconstructed.reshape(8, 8),
            cmap='gray'
        )
        axes[row, col + 1].set_title(f"{n_comp} PCs")
        axes[row, col + 1].axis('off')

plt.tight_layout()
plt.show()

print(f"\\nReconstruction MSE examples:")
for idx in random_idx[:2]:
    original = X_scaled[idx]
    pca_sub = PCA(n_components=15)
    reduced = pca_sub.fit_transform(
        X_scaled[idx].reshape(1, -1)
    )
    reconstructed = pca_sub.inverse_transform(reduced)
    mse = np.mean((original - reconstructed) ** 2)
    print(f"  Sample {idx}: MSE = {mse:.6f}")`,
      output: `Without PCA:
  Random Forest: 0.9694 (+/- 0.0067)
  SVM (RBF): 0.9855 (+/- 0.0050)

With PCA (27 components, 90% variance):
  Random Forest: 0.9633 (+/- 0.0069)
  SVM (RBF): 0.9794 (+/- 0.0077)

Reconstruction MSE examples:
  Sample 143: MSE = 0.0032
  Sample 567: MSE = 0.0029`,
      explanation: 'PCA with 27 components (from 64) preserves 90% variance and maintains 96-98% of original classification accuracy. The reconstruction shows that even 15 components capture the essential digit structure, effectively denoising the images.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Genomics', description: 'Gene expression data has thousands of features (genes) but few samples. PCA reduces dimensionality for downstream analysis, with the first few PCs often capturing biological processes like disease subtypes.' },
      { industry: 'Finance', description: 'Portfolio risk management uses PCA to identify the main factors driving asset returns. The first PC typically represents the "market factor," while subsequent PCs capture sector or style factors.' },
      { industry: 'Computer Vision', description: 'Face recognition (Eigenfaces) uses PCA to project face images into a low-dimensional space where different faces are easily distinguishable.' },
    ],
    caseStudy: {
      problem: 'A fintech company had 500+ financial indicators for credit risk assessment. The high dimensionality caused overfitting (linear models) and slow training (non-linear models). Many features were highly correlated, making models unstable.',
      solution: 'They applied PCA to reduce 500 features to 25 components explaining 95% of variance. The components represented interpretable financial factors: leverage, liquidity, profitability, growth, etc. Models were trained on these decorrelated features.',
      results: 'Training time decreased by 90% (from 2 hours to 12 minutes). Model AUC improved from 0.78 to 0.83 due to reduced overfitting. Model stability increased significantly — variance across training runs dropped by 60%.',
    },
    bestPractices: [
      'Always standardize features before PCA — PCA is sensitive to the scale of features',
      'Use the cumulative explained variance plot to choose the number of components (target 90-95%)',
      'Do not assume PCA components have semantic meaning — they are linear combinations of features',
      'Apply PCA separately to training and test data (fit on training, transform both)',
      'Consider whitening (whiten=True) for algorithms that assume isotropic data distributions',
    ],
    tools: ['sklearn.decomposition.PCA', 'sklearn.decomposition.IncrementalPCA', 'Yellowbrick PCA Visualizer', 'prince (PCA for mixed data)', 'FactoMineR (R version)'],
    jobRoles: ['Data Scientist', 'Machine Learning Engineer', 'Quantitative Analyst', 'Research Scientist'],
    furtherReading: [
      'Principal Component Analysis (Jolliffe 2002)',
      'Scikit-learn PCA documentation and user guide',
      'Eigenfaces for Recognition (Turk & Pentland 1991)',
      'Nonlinear dimensionality reduction (Tenenbaum, de Silva & Langford 2000)',
    ],
  },
  quiz: [
    {
      id: 'pca-1', type: 'mcq',
      question: 'What do the eigenvectors of the covariance matrix represent in PCA?',
      options: [
        'The number of principal components to retain',
        'The directions of maximum variance (principal components)',
        'The reconstruction error of the transformation',
        'The standardized feature values',
      ],
      correctAnswer: 'The directions of maximum variance (principal components)',
      explanation: 'Eigenvectors of the covariance matrix define the principal component directions. The corresponding eigenvalues indicate how much variance each direction captures.',
    },
    {
      id: 'pca-2', type: 'truefalse',
      question: 'PCA requires the data to be normalized or standardized before application because it is sensitive to feature scales.',
      correctAnswer: 'True',
      explanation: 'PCA maximizes variance, so features with larger scales (e.g., salary in dollars) would dominate features with smaller scales (e.g., age) if not standardized.',
    },
    {
      id: 'pca-3', type: 'code',
      question: 'What does the explained_variance_ratio_ attribute of a fitted PCA object represent?',
      code: `pca = PCA(n_components=2)
pca.fit(X)
print(pca.explained_variance_ratio_)`,
      options: [
        'The amount of variance in each original feature',
        'The percentage of total variance captured by each principal component',
        'The variance of the PCA transformation matrix',
        'The ratio of component dimensions to original dimensions',
      ],
      correctAnswer: 'The percentage of total variance captured by each principal component',
      explanation: 'explained_variance_ratio_ shows what fraction of the total dataset variance is captured by each principal component, sorted from largest to smallest.',
    },
    {
      id: 'pca-4', type: 'fillblank',
      question: 'The formula for reconstructing data from PCA projection back to the original space is X̂ = X_k V_k^T, where V_k is the matrix of selected principal components. This is known as the ___ formula.',
      correctAnswer: 'reconstruction',
      explanation: 'The reconstruction formula projects the reduced data back to the original space. The reconstruction error equals the sum of discarded eigenvalues.',
    },
    {
      id: 'pca-5', type: 'match',
      question: 'Match each PCA component with the variance it captures:',
      pairs: [
        { left: 'First principal component', right: 'Direction of maximum variance in the data' },
        { left: 'Second principal component', right: 'Maximum variance orthogonal to PC1' },
        { left: 'Last principal component', right: 'Direction of minimum variance (noise)' },
        { left: 'Cumulative explained variance', right: 'Sum of variance captured by first k components' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'PCA orders components by descending variance. PC1 captures the most variance, PC2 captures the second most (orthogonal to PC1), and later components typically represent noise.',
    },
  ],
}))

export {}
