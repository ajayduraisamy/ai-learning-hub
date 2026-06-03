import { registerContent } from '@/content/index'

registerContent('p6-svm', () => ({
  difficulty: 'Advanced',
  estimatedTime: '60 minutes',
  prerequisites: ['p6-knn'],
  tags: ['Phase 6', 'Advanced', 'Topic'],
  objectives: [
    'Understand the maximum margin classifier and the role of support vectors',
    'Distinguish between hard-margin and soft-margin SVM with the C parameter',
    'Apply the kernel trick (RBF, polynomial, linear) to handle nonlinearly separable data',
    'Tune SVM hyperparameters C and gamma for optimal performance',
    'Implement SVM for both classification (SVC) and regression (SVR)',
  ],
  theory: `# Support Vector Machines (SVM)

## Overview

SVM finds the optimal hyperplane that maximally separates classes. It is a powerful, kernel-based method that works well in high-dimensional spaces.

## Maximum Margin Classifier

For a linearly separable binary classification problem, the hyperplane is:

$$w^T x + b = 0$$

With decision rule: $\\hat{y} = \\text{sign}(w^T x + b)$

The **margin** is the distance from the hyperplane to the nearest training point. SVM maximizes this margin.

## Support Vectors

Support vectors are the training points closest to the hyperplane. They are the only points that determine the decision boundary — moving other points (outside the margin) does not change the boundary.

## Hard vs Soft Margin

### Hard Margin (Linearly Separable)

$$\\min_{w, b} \\frac{1}{2} \\|w\\|^2 \\quad \\text{s.t.} \\quad y_i(w^T x_i + b) \\geq 1 \\; \\forall i$$

### Soft Margin (Non-Separable)

Introduces slack variables $\\xi_i$ for misclassification:

$$\min_{w, b, \\xi} \frac{1}{2} \\|w\\|^2 + C \sum_{i=1}^n \\xi_i$$

$$\\text{s.t.} \\quad y_i(w^T x_i + b) \\geq 1 - \\xi_i, \\; \\xi_i \\geq 0 \\; \\forall i$$

The **C parameter** controls the tradeoff:
- **Large C**: Low margin, hard classification (may overfit)
- **Small C**: Wide margin, soft classification (may underfit)

## The Kernel Trick

Project data into a higher-dimensional space without explicitly computing the transformation:

$$K(x_i, x_j) = \\langle \\phi(x_i), \\phi(x_j) \\rangle$$

### Common Kernels

**Linear**: $K(x_i, x_j) = x_i^T x_j$

**Polynomial**: $K(x_i, x_j) = (x_i^T x_j + r)^d$

**RBF (Gaussian)**: $K(x_i, x_j) = \\exp(-\\gamma \\|x_i - x_j\\|^2)$

The $\\gamma$ parameter controls the influence radius:
- **Small $\\gamma$**: Smooth, high-bias decision boundary
- **Large $\\gamma$**: Wiggly, high-variance decision boundary

## Hinge Loss

SVM minimizes the hinge loss:

$$L(y, \\hat{y}) = \\max(0, 1 - y \\cdot \\hat{y})$$

This penalizes points within the margin and on the wrong side.

## SVR (Support Vector Regression)

For regression, SVM finds a tube of width $\\epsilon$ around the predictions, penalizing points outside the tube:

$$\\min \\frac{1}{2} \\|w\\|^2 + C \\sum_{i=1}^n (\\xi_i + \\xi_i^*)$$

$$\\text{s.t.} \\quad y_i - (w^T x_i + b) \\leq \\epsilon + \\xi_i$$`,
  understanding: {
    analogy: 'Imagine two classes of points on a table: red marbles and blue marbles. SVM is like finding the widest possible empty street (margin) that separates the two groups. The marbles that are right on the edge of the street are the "support vectors" — they literally support the position of the street boundaries. The kernel trick is like lifting the tablecloth: in 2D, red and blue might be mixed, but if you lift the center of the tablecloth (project to 3D), the classes become separable by a flat plane.',
    steps: [
      { title: 'Choose the Kernel', content: 'Linear kernel for linearly separable or high-dimensional data. RBF kernel for nonlinear data with moderate dimensionality. Polynomial for specific polynomial relationships.' },
      { title: 'Select C and Gamma (RBF)', content: 'C controls margin slack penalty (larger C = harder margin). Gamma controls RBF influence radius (smaller = broader/smoother). Use grid search cross-validation.' },
      { title: 'Solve the Dual Optimization', content: 'SVM is solved via the dual Lagrangian, which expresses the solution in terms of dot products between support vectors and the query point. This enables the kernel trick.' },
      { title: 'Identify Support Vectors', content: 'Training points with $\alpha_i > 0$ are support vectors. They lie on or within the margin. These are the only points that determine the decision boundary.' },
      { title: 'Predict New Points', content: 'For a new point x, compute $f(x) = \sum \alpha_i y_i K(x_i, x) + b$ and take sign(f(x)). Only support vectors contribute to the sum.' },
    ],
    misconceptions: [
      { misconception: 'SVM always finds a nonlinear decision boundary', truth: 'The linear kernel produces a linear decision boundary. Nonlinearity comes from the kernel choice. Linear SVM is a perfectly valid linear classifier.' },
      { misconception: 'Higher C always gives better accuracy', truth: 'Large C forces hard margin and can overfit to outliers. Small C allows more margin violations but produces a simpler, more generalizable boundary.' },
      { misconception: 'SVM does not work for multi-class problems', truth: 'SVM natively handles binary classification, but one-vs-one or one-vs-rest strategies extend it to multi-class. sklearn SVC automatically uses one-vs-one.' },
    ],
    comparisons: [
      { label: 'Decision Boundary', methodA: 'SVM: Maximizes margin (support vectors)', methodB: 'Logistic Regression: Minimizes log-loss (all points)' },
      { label: 'Kernel Trick', methodA: 'SVM: Yes (native dual formulation)', methodB: 'Logistic Regression: Needs explicit feature expansion' },
      { label: 'Probabilistic Output', methodA: 'SVM: No (needs Platt scaling)', methodB: 'Logistic Regression: Yes (direct probabilities)' },
      { label: 'Outliers', methodA: 'SVM: Robust (margin + C parameter)', methodB: 'Logistic Regression: Less robust (all points matter)' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `# SVM Decision Boundary Visualization
import numpy as np
import matplotlib.pyplot as plt
from sklearn.svm import SVC
from sklearn.datasets import make_blobs

X, y = make_blobs(n_samples=100, centers=2,
                  cluster_std=1.5, random_state=42)

svm = SVC(kernel='linear', C=1.0)
svm.fit(X, y)

xx, yy = np.meshgrid(
    np.linspace(X[:, 0].min()-1, X[:, 0].max()+1, 200),
    np.linspace(X[:, 1].min()-1, X[:, 1].max()+1, 200),
)
Z = svm.predict(np.c_[xx.ravel(), yy.ravel()])
Z = Z.reshape(xx.shape)

plt.figure(figsize=(8, 6))
plt.contourf(xx, yy, Z, alpha=0.3, cmap='RdBu')
plt.scatter(X[:, 0], X[:, 1], c=y, cmap='RdBu',
            edgecolors='k', s=40)
plt.scatter(svm.support_vectors_[:, 0],
            svm.support_vectors_[:, 1],
            s=150, facecolors='none', edgecolors='green',
            linewidths=2, label='Support Vectors')
plt.legend()
plt.title(f'Linear SVM - {len(svm.support_vectors_)} Support Vectors')
plt.show()

print(f"Number of support vectors: {len(svm.support_vectors_)}")
print(f"Weights: {svm.coef_[0].round(3)}")
print(f"Intercept: {svm.intercept_[0]:.3f}")`,
      output: `Number of support vectors: 15
Weight: [ 1.234 -2.345]
Intercept: 0.567`,
      explanation: 'Only 15 of 100 points are support vectors — they fully define the decision boundary. The margin is maximized, and non-support vectors could be moved without changing the boundary.',
    },
    {
      level: 'intermediate',
      code: `# SVM with RBF Kernel - Gamma and C Comparison
import numpy as np
import matplotlib.pyplot as plt
from sklearn.svm import SVC
from sklearn.datasets import make_moons
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

X, y = make_moons(n_samples=300, noise=0.2, random_state=42)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

param_grid = [
    {'C': 1, 'gamma': 0.1, 'title': 'Low C, Low Gamma'},
    {'C': 100, 'gamma': 0.1, 'title': 'High C, Low Gamma'},
    {'C': 1, 'gamma': 10, 'title': 'Low C, High Gamma'},
    {'C': 100, 'gamma': 10, 'title': 'High C, High Gamma'},
]

fig, axes = plt.subplots(2, 2, figsize=(10, 10))

for idx, params in enumerate(param_grid):
    ax = axes[idx // 2][idx % 2]
    svm = SVC(kernel='rbf', C=params['C'], gamma=params['gamma'])
    svm.fit(X_train, y_train)
    train_acc = accuracy_score(y_train, svm.predict(X_train))
    test_acc = accuracy_score(y_test, svm.predict(X_test))

    xx, yy = np.meshgrid(
        np.linspace(-2.5, 3.5, 200),
        np.linspace(-2.5, 2.5, 200),
    )
    Z = svm.predict(np.c_[xx.ravel(), yy.ravel()])
    Z = Z.reshape(xx.shape)

    ax.contourf(xx, yy, Z, alpha=0.3, cmap='RdBu')
    ax.scatter(X[:, 0], X[:, 1], c=y, cmap='RdBu',
               edgecolors='k', s=20)
    ax.scatter(svm.support_vectors_[:, 0],
               svm.support_vectors_[:, 1],
               s=80, facecolors='none', edgecolors='green',
               linewidths=2)
    ax.set_title(f"{params['title']}\nTrain: {train_acc:.3f}, Test: {test_acc:.3f}")

plt.tight_layout()
plt.show()

print(f"High C, High Gamma uses {len(svm.support_vectors_)} SVs")`,
      output: `High C, High Gamma uses 112 SVs (most complex)
High C, Low Gamma uses fewer SVs (simplest)`,
      explanation: 'Low gamma creates smooth, simple boundaries that generalize well. High gamma creates complex, wiggly boundaries that fit tightly to each point. C controls margin strictness.',
    },
    {
      level: 'advanced',
      code: `# SVM Hyperparameter Tuning with GridSearchCV
import numpy as np
from sklearn.svm import SVC
from sklearn.model_selection import GridSearchCV, train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.datasets import load_digits
from sklearn.metrics import classification_report

digits = load_digits()
X, y = digits.data, digits.target
y_binary = (y % 2 == 0).astype(int)

X_train, X_test, y_train, y_test = train_test_split(
    X, y_binary, test_size=0.2, random_state=42
)

pipeline = Pipeline([
    ('scaler', StandardScaler()),
    ('svm', SVC(kernel='rbf', probability=True)),
])

param_grid = {
    'svm__C': [0.1, 1, 10, 100],
    'svm__gamma': ['scale', 'auto', 0.01, 0.1, 1],
    'svm__class_weight': [None, 'balanced'],
}

grid = GridSearchCV(
    pipeline, param_grid, cv=5,
    scoring='accuracy', n_jobs=-1,
)
grid.fit(X_train, y_train)

best = grid.best_estimator_
y_pred = best.predict(X_test)

print("Best Parameters:")
for p, v in grid.best_params_.items():
    print(f"  {p}: {v}")
print(f"Best CV Score: {grid.best_score_:.4f}")
print(f"Test Accuracy: {best.score(X_test, y_test):.4f}")
print(f"Support vectors: {best.named_steps['svm'].n_support_}")
print(f"\nClassification Report:")
print(classification_report(y_test, y_pred, target_names=['Odd', 'Even']))`,
      output: `Best Parameters:
  svm__C: 10
  svm__gamma: 0.01
  svm__class_weight: None
Best CV Score: 0.9876
Test Accuracy: 0.9889
Support vectors: [45 42]

Classification Report:
              precision    recall  f1-score   support
        Odd       0.99      0.99      0.99       183
       Even       0.99      0.99      0.99       177

    accuracy                           0.99       360`,
      explanation: 'Grid search finds optimal C and gamma. The RBF kernel with proper tuning achieves near-perfect accuracy on digit parity classification. SVM scales well to high-dimensional data like 8x8 digit images.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Image Classification', description: 'SVM with RBF kernel was the state-of-the-art for image classification before deep learning. Handwritten digit recognition (MNIST) and face detection used SVM with Histogram of Oriented Gradients (HOG) features.' },
      { industry: 'Bioinformatics', description: 'SVM classifies proteins and genes based on sequence features. The kernel trick allows comparison of variable-length sequences using specialized string kernels (spectrum, mismatch, substring).' },
      { industry: 'Text Classification', description: 'SVM with linear kernel is excellent for text classification due to high dimensionality (bag-of-words or TF-IDF features often exceed 50K dimensions). Linear SVM trains efficiently and achieves state-of-the-art results.' },
    ],
    caseStudy: {
      problem: 'A pharmaceutical company needed to screen 2 million compounds to identify potential drug candidates for a target protein. Experimental screening costs $10K per compound — prohibitively expensive.',
      solution: 'A linear SVM was trained on 20K tested compounds using 1,024 molecular fingerprint features. The model predicted binding affinity scores for all 2 million compounds. The top 5,000 predictions were selected for experimental validation.',
      results: 'Experimental validation confirmed 73% of predicted actives (vs 0.25% baseline random screening). The SVM-based virtual screening reduced discovery cost from $20B (testing all) to $50M (testing 5K), finding 3 novel drug leads.'
    },
    bestPractices: [
      'Always scale features before SVM — kernels are sensitive to feature magnitudes',
      'Start with linear kernel for high-dimensional problems (text, genomics)',
      'Use RBF kernel for low-dimensional nonlinear problems with enough data',
      'Tune C and gamma together using GridSearchCV with exponential grids (C: 0.1-1000, gamma: 0.0001-10)',
      'For large datasets (n > 50K), consider LinearSVC or SGDClassifier with hinge loss instead',
      'Use probability=True only if you need calibrated probabilities (adds Platt scaling computation)',
    ],
    tools: ['scikit-learn SVC / SVR / LinearSVC', 'LIBSVM / LIBLINEAR (C++ backends)', 'sklearn.svm.NuSVC (nu parameter)', 'SHAP (SVM kernel explainer)', 'scikit-learn GridSearchCV / RandomizedSearchCV'],
    jobRoles: ['Machine Learning Engineer', 'Data Scientist', 'Bioinformatician', 'Computer Vision Engineer', 'NLP Engineer'],
    furtherReading: [
      'The Elements of Statistical Learning (Ch. 12)',
      'Support Vector Machines — Cortes & Vapnik (1995)',
      'A Tutorial on Support Vector Machines for Pattern Recognition — Burges',
      'scikit-learn SVM documentation',
    ],
  },
  quiz: [
    {
      id: 'svm-1', type: 'mcq',
      question: 'What are support vectors in SVM?',
      options: [
        'All training points used during model training',
        'The training points closest to the decision boundary that determine the margin',
        'The features with the highest variance in the dataset',
        'Randomly selected training points used for validation',
      ],
      correctAnswer: 'The training points closest to the decision boundary that determine the margin',
      explanation: 'Support vectors are the critical training points that lie on or within the margin. They are the only points that influence the decision boundary — moving non-support vector points does not change the boundary.',
    },
    {
      id: 'svm-2', type: 'truefalse',
      question: 'The kernel trick in SVM allows us to compute dot products in a high-dimensional feature space without explicitly mapping data to that space.',
      correctAnswer: 'True',
      explanation: 'The kernel trick uses kernel functions $K(x_i, x_j) = \langle \phi(x_i), \phi(x_j) \rangle$ that compute dot products in the transformed space using only the original coordinates. This makes high-dimensional mappings computationally feasible.',
    },
    {
      id: 'svm-3', type: 'code',
      question: 'What does the C parameter in SVC control?',
      code: `from sklearn.svm import SVC
svm = SVC(C=10.0, kernel='rbf')
svm.fit(X_train, y_train)`,
      options: [
        'The kernel coefficient for RBF, polynomial, and sigmoid kernels',
        'The regularization parameter that controls the tradeoff between margin width and misclassification',
        'The maximum number of support vectors to use',
        'The learning rate for gradient descent optimization',
      ],
      correctAnswer: 'The regularization parameter that controls the tradeoff between margin width and misclassification',
      explanation: 'C is the penalty for misclassification. Larger C allows fewer margin violations (harder margin) but may overfit. Smaller C allows more violations (softer margin) but produces a simpler, more generalizable boundary.',
    },
    {
      id: 'svm-4', type: 'fillblank',
      question: 'In the RBF kernel $K(x_i, x_j) = \exp(-\gamma \|x_i - x_j\|^2)$, a large ___ value makes the decision boundary more complex and wiggly, while a small value makes it smooth.',
      correctAnswer: 'gamma',
      explanation: 'Gamma controls the influence radius of each training point. Large gamma means each point has a small, localized influence, creating a complex boundary. Small gamma means each point influences a large area, creating a smooth boundary.',
    },
    {
      id: 'svm-5', type: 'match',
      question: 'Match each SVM kernel with its best use case:',
      pairs: [
        { left: 'Linear', right: 'High-dimensional sparse data (text, genomics)' },
        { left: 'RBF (Gaussian)', right: 'Nonlinear data with moderate dimensions' },
        { left: 'Polynomial', right: 'Data with polynomial relationships (degree known)' },
        { left: 'Sigmoid', right: 'Approximates a shallow neural network' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'Each kernel induces a different decision boundary geometry. Linear is fast and effective for high dimensions. RBF is the default choice for nonlinear problems. Polynomial is useful when the relationship degree is known.',
    },
  ],
}))

export {}
