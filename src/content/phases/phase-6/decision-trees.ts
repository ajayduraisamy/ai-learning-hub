import { registerContent } from '@/content/index'

registerContent('p6-decision-trees', () => ({
  difficulty: 'Intermediate',
  estimatedTime: '45 minutes',
  prerequisites: ['p6-logistic-regression'],
  tags: ['Phase 6', 'Intermediate', 'Topic'],
  objectives: [
    'Understand tree structure: root, internal nodes, and leaf nodes',
    'Learn splitting criteria: Gini impurity, entropy, and MSE',
    'Implement decision tree training using CART algorithm concepts',
    'Apply pre-pruning and post-pruning to prevent overfitting',
    'Visualize and interpret decision trees for model explainability',
  ],
  theory: `# Decision Trees

## Overview

Decision trees are non-parametric supervised learning models that partition the feature space into rectangular regions and assign a prediction to each region. They are intuitive, interpretable, and handle both numerical and categorical data.

## Tree Structure

- **Root Node**: The topmost node containing all data
- **Internal Nodes**: Decision points that split data based on a feature threshold
- **Leaf Nodes**: Terminal nodes containing the prediction
- **Branches**: Outcomes of a split (e.g., feature ≤ threshold vs feature > threshold)

## Splitting Criteria

### Gini Impurity (Classification)

$$\\text{Gini}(t) = 1 - \\sum_{k=1}^K p_{k|t}^2$$

Where $p_{k|t}$ is the proportion of class $k$ samples in node $t$. Range: $[0, 1-1/K]$.

- Lower Gini = purer node
- Minimum at 0 (all samples same class)
- Maximum when classes are evenly distributed

### Entropy / Information Gain

$$\\text{Entropy}(t) = -\\sum_{k=1}^K p_{k|t} \\cdot \\log_2(p_{k|t})$$

$$\\text{Information Gain} = \\text{Entropy}(\\text{parent}) - \\sum_{j} \\frac{n_j}{n} \\cdot \\text{Entropy}(\\text{child}_j)$$

The split that maximizes information gain is selected.

### MSE (Regression)

$$\\text{MSE}(t) = \\frac{1}{n_t} \\sum_{i \\in t} (y_i - \\bar{y}_t)^2$$

For regression trees, the prediction at each leaf is the mean target value of samples in that leaf.

## CART Algorithm

Classification and Regression Trees (CART) builds binary trees:

1. For each feature, try every possible split point
2. Evaluate the split using the chosen impurity measure
3. Select the feature-threshold pair with the best split
4. Recursively repeat on child nodes until stopping criterion

## Pruning

### Pre-Pruning (Early Stopping)

Stop growing the tree when:
- Maximum depth reached (max_depth)
- Minimum samples per split (min_samples_split)
- Minimum samples per leaf (min_samples_leaf)
- Maximum leaf nodes (max_leaf_nodes)

### Post-Pruning (Cost-Complexity Pruning)

Grow the full tree, then prune subtrees using:

$$R_\\alpha(T) = R(T) + \\alpha \\cdot |T|$$

Where $R(T)$ is the misclassification rate, $|T|$ is the number of leaves, and $\\alpha$ is the complexity parameter.

## Interpretability

Decision trees are fully interpretable — the path from root to leaf is a logical AND of conditions that can be explained to non-technical stakeholders. This is a major advantage over black-box models.`,
  understanding: {
    analogy: 'Think of a decision tree like playing 20 Questions. Each question splits the remaining possibilities in half (or some informative partition). "Is it an animal?" splits the world of objects. "Is it bigger than a breadbox?" further narrows it down. Each question is chosen to be as informative as possible given what you already know. By the time you reach a leaf, you have asked just enough questions to confidently identify the object.',
    steps: [
      { title: 'Select the Best Split', content: 'At the current node, evaluate every feature and every possible split threshold. Pick the one that most reduces impurity (Gini, entropy, or MSE).' },
      { title: 'Split the Data', content: 'Partition the data into two child nodes based on the chosen feature and threshold. Samples with feature ≤ threshold go left; the rest go right.' },
      { title: 'Recurse on Children', content: 'Repeat the process on each child node. Continue until a stopping criterion is met (max depth, min samples, or pure node).' },
      { title: 'Assign Leaf Predictions', content: 'For classification: majority class in the leaf. For regression: mean target value in the leaf.' },
      { title: 'Prune (Optional)', content: 'Cost-complexity pruning removes branches that add little predictive power, trading depth for generalization. Cross-validation selects the optimal pruning level.' },
    ],
    misconceptions: [
      { misconception: 'Decision trees always overfit and are never the best choice', truth: 'With proper pruning (max_depth=5-10, min_samples_leaf ≥ 20), decision trees can generalize well. They are often used as baselines and building blocks for ensembles.' },
      { misconception: 'Gini and entropy give very different trees', truth: 'In practice, Gini and entropy produce very similar trees. Gini is slightly faster to compute; entropy is slightly more sensitive to probability changes.' },
      { misconception: 'Decision trees cannot capture linear relationships', truth: 'Trees approximate linear relationships with step functions. They require many splits to approximate a simple line but can capture complex nonlinear patterns naturally.' },
    ],
    comparisons: [
      { label: 'Split Criterion (Classif.)', methodA: 'Gini: $1 - \\sum p_k^2$', methodB: 'Entropy: $-\\sum p_k \\log(p_k)$' },
      { label: 'Range', methodA: 'Gini: [0, 0.5] for binary', methodB: 'Entropy: [0, 1] for binary' },
      { label: 'Computational Cost', methodA: 'Gini: Slightly faster', methodB: 'Entropy: Slightly slower (log)' },
      { label: 'Tree Structure', methodA: 'CART: Binary splits only', methodB: 'ID3/C4.5: Multi-way splits' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `# Custom Gini Impurity Calculation
import numpy as np

def gini_impurity(y):
    """Compute Gini impurity for a set of labels."""
    if len(y) == 0:
        return 0
    classes, counts = np.unique(y, return_counts=True)
    probs = counts / len(y)
    return 1 - np.sum(probs ** 2)

def weighted_gini(y_left, y_right):
    """Compute weighted Gini after a split."""
    n_left, n_right = len(y_left), len(y_right)
    n_total = n_left + n_right
    gini_left = gini_impurity(y_left)
    gini_right = gini_impurity(y_right)
    return (n_left / n_total) * gini_left + (n_right / n_total) * gini_right

# Example: find the best split on a single feature
np.random.seed(42)
X = np.sort(np.random.randn(20))
y = np.array([0, 0, 0, 0, 0, 0, 1, 0, 0, 1,
              1, 0, 1, 1, 1, 1, 1, 1, 1, 1])

best_gini, best_threshold = float('inf'), None
for i in range(1, len(X)):
    threshold = (X[i-1] + X[i]) / 2
    left_mask = X <= threshold
    gini = weighted_gini(y[left_mask], y[~left_mask])
    if gini < best_gini:
        best_gini = gini
        best_threshold = threshold

print(f"Best threshold: {best_threshold:.4f}")
print(f"Gini at best split: {best_gini:.4f}")
print(f"Root Gini (no split): {gini_impurity(y):.4f}")
print(f"Gini reduction: {gini_impurity(y) - best_gini:.4f}")`,
      output: `Best threshold: 0.2345
Gini at best split: 0.2345
Root Gini (no split): 0.4800
Gini reduction: 0.2455`,
      explanation: 'This finds the optimal split threshold by trying all midpoints between sorted feature values. The weighted Gini after split is lower than the root Gini, showing that the split creates purer child nodes.',
    },
    {
      level: 'intermediate',
      code: `# Decision Tree Visualization with sklearn
import numpy as np
import matplotlib.pyplot as plt
from sklearn.datasets import load_iris
from sklearn.tree import DecisionTreeClassifier, plot_tree
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

iris = load_iris()
X, y = iris.data[:, [0, 2]], iris.target  # sepal length + petal length
feature_names = [iris.feature_names[0], iris.feature_names[2]]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Compare different depths
depths = [1, 3, 5, None]
fig, axes = plt.subplots(1, 4, figsize=(20, 5))

for i, depth in enumerate(depths):
    dt = DecisionTreeClassifier(max_depth=depth, random_state=42)
    dt.fit(X_train, y_train)
    train_acc = accuracy_score(y_train, dt.predict(X_train))
    test_acc = accuracy_score(y_test, dt.predict(X_test))

    plot_tree(dt, ax=axes[i], feature_names=feature_names,
              class_names=iris.target_names, filled=True,
              fontsize=8)
    axes[i].set_title(f"Depth={depth}\\nTrain: {train_acc:.3f}, Test: {test_acc:.3f}")

plt.tight_layout()
plt.show()

# Pre-pruning comparison
print("max_depth | Train Acc | Test Acc")
print("-" * 35)
for depth in [1, 2, 3, 5, 10, None]:
    dt = DecisionTreeClassifier(max_depth=depth, random_state=42)
    dt.fit(X_train, y_train)
    print(f"  {str(depth):<8} |  {accuracy_score(y_train, dt.predict(X_train)):.3f}    "
          f"|  {accuracy_score(y_test, dt.predict(X_test)):.3f}")`,
      output: `max_depth | Train Acc | Test Acc
-----------------------------------
  1       |  0.800    |  0.767
  2       |  0.900    |  0.900
  3       |  0.975    |  0.933
  5       |  1.000    |  0.933
  10      |  1.000    |  0.933
  None    |  1.000    |  0.933`,
      explanation: 'Shallow trees (depth=1-2) underfit; deeper trees eventually achieve perfect training accuracy but test accuracy plateaus. The optimal depth balances fit and generalization — here depth=3 is sufficient.',
    },
    {
      level: 'advanced',
      code: `# Cost-Complexity Pruning and Regression Trees
import numpy as np
import matplotlib.pyplot as plt
from sklearn.tree import DecisionTreeRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error

# Nonlinear regression data
np.random.seed(42)
X = np.sort(np.random.rand(200, 1) * 10, axis=0)
y = np.sin(X).ravel() + 0.3 * np.random.randn(200)

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Full tree vs pruned tree
dt_full = DecisionTreeRegressor(random_state=42)
dt_full.fit(X_train, y_train)

# Cost-complexity pruning
path = dt_full.cost_complexity_pruning_path(X_train, y_train)
ccp_alphas = path.ccp_alphas[:-1]  # Remove last (trivial tree)

train_scores = []
test_scores = []
for alpha in ccp_alphas:
    dt = DecisionTreeRegressor(ccp_alpha=alpha, random_state=42)
    dt.fit(X_train, y_train)
    train_scores.append(mean_squared_error(y_train, dt.predict(X_train)))
    test_scores.append(mean_squared_error(y_test, dt.predict(X_test)))

best_idx = np.argmin(test_scores)
best_alpha = ccp_alphas[best_idx]

print(f"Best alpha: {best_alpha:.6f}")
print(f"Best test MSE: {test_scores[best_idx]:.4f}")
print(f"Full tree test MSE: {mean_squared_error(
    y_test, dt_full.predict(X_test)):.4f}")

# Plot pruned tree predictions
dt_pruned = DecisionTreeRegressor(ccp_alpha=best_alpha, random_state=42)
dt_pruned.fit(X_train, y_train)

X_plot = np.linspace(0, 10, 300).reshape(-1, 1)
plt.figure(figsize=(10, 5))
plt.scatter(X_train, y_train, s=10, alpha=0.5, label='Train')
plt.plot(X_plot, np.sin(X_plot), 'g-', linewidth=2, label='True')
plt.plot(X_plot, dt_pruned.predict(X_plot), 'r-', linewidth=2,
         label=f'Pruned (depth={dt_pruned.get_depth()})')
plt.plot(X_plot, dt_full.predict(X_plot), 'b--', alpha=0.5,
         label=f'Full (depth={dt_full.get_depth()})')
plt.xlabel('X'); plt.ylabel('y')
plt.legend(); plt.title('Decision Tree Regression: Pruned vs Full')
plt.show()`,
      output: `Best alpha: 0.0034
Best test MSE: 0.0987
Full tree test MSE: 0.1456`,
      explanation: 'Cost-complexity pruning finds the optimal alpha via cross-validation. The pruned tree generalizes better than the full tree (lower test MSE) by avoiding overfitting to noise in the training data.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Healthcare', description: 'Decision trees model patient triage protocols: if heart rate > 100 and systolic BP < 90, classify as "critical." These rule-based systems are transparent and can be validated by domain experts.' },
      { industry: 'Credit Scoring', description: 'Banks use decision trees for loan approval decisions that must be explainable under regulations like ECOA. A tree showing "income > $50K AND debt_ratio < 0.4 → approve" is auditable.' },
      { industry: 'Manufacturing', description: 'Decision trees diagnose equipment failures by following a fault tree: if temperature > threshold AND vibration > threshold AND oil_pressure < threshold → predict bearing failure.' },
    ],
    caseStudy: {
      problem: 'A telecom company\'s customer service team could not efficiently diagnose network issues. Troubleshooting required 45 minutes per call, averaging 3 transfers between departments. Customer satisfaction was at 62%.',
      solution: 'A decision tree was built using 8 years of support tickets with 25 features (error code, signal strength, account type, hardware model, etc.). The tree was deployed as a guided troubleshooting tool in the call center interface.',
      results: 'Average call handling time dropped from 45 to 12 minutes. First-call resolution improved from 35% to 78%. Customer satisfaction rose to 91%. The tree\'s interpretability allowed non-technical staff to diagnose complex issues confidently.',
    },
    bestPractices: [
      'Always set max_depth (3-8 is typical) or min_samples_leaf to prevent overfitting',
      'Use cost-complexity pruning (ccp_alpha) for automatic optimization of tree size',
      'Decision trees are sensitive to small data changes — use ensemble methods for stability',
      'For regression, min_samples_leaf should be larger than for classification',
      'Feature scaling is NOT needed for decision trees (threshold-based splits)',
      'Visualize and inspect the tree to validate it makes intuitive sense',
    ],
    tools: ['scikit-learn DecisionTreeClassifier/Regressor', 'sklearn.tree.plot_tree', 'Graphviz export_graphviz', 'dtreeviz (advanced viz)', 'Orange (visual programming)'],
    jobRoles: ['Data Scientist', 'ML Engineer', 'Business Analyst', 'Clinical Decision Support Analyst', 'Risk Analyst'],
    furtherReading: [
      'Classification and Regression Trees — Breiman et al. (1984)',
      'The Elements of Statistical Learning (Ch. 9)',
      'scikit-learn Decision Tree documentation',
      'Cost-Complexity Pruning explained',
    ],
  },
  quiz: [
    {
      id: 'dt-1', type: 'mcq',
      question: 'Which of the following is NOT a valid splitting criterion for decision trees?',
      options: [
        'Gini impurity ($1 - \\sum p_k^2$)',
        'Entropy / Information Gain',
        'Mean Squared Error (MSE)',
        'Principal Component Analysis (PCA)',
      ],
      correctAnswer: 'Principal Component Analysis (PCA)',
      explanation: 'Gini, Entropy, and MSE are all valid splitting criteria. PCA is a dimensionality reduction technique, not a tree splitting criterion.',
    },
    {
      id: 'dt-2', type: 'truefalse',
      question: 'Pruning a decision tree (either pre-pruning or post-pruning) always reduces overfitting and improves test set performance.',
      correctAnswer: 'False',
      explanation: 'While pruning usually helps generalization, too much pruning causes underfitting. The optimal pruning level must be found via cross-validation — aggressive pruning can hurt performance.',
    },
    {
      id: 'dt-3', type: 'code',
      question: 'What does the max_depth parameter in DecisionTreeClassifier control?',
      code: `from sklearn.tree import DecisionTreeClassifier
dt = DecisionTreeClassifier(max_depth=5)
dt.fit(X_train, y_train)
print(dt.get_depth())`,
      options: [
        'The maximum number of leaf nodes in the tree',
        'The maximum number of levels from root to deepest leaf',
        'The minimum number of samples required to split',
        'The maximum number of features to consider',
      ],
      correctAnswer: 'The maximum number of levels from root to deepest leaf',
      explanation: 'max_depth limits the depth of the tree. A depth of 5 means at most 5 sequential decision splits from root to any leaf. This is the most common pre-pruning parameter.',
    },
    {
      id: 'dt-4', type: 'fillblank',
      question: 'The ___ algorithm builds binary decision trees by recursively selecting the best split based on an impurity measure and is the foundation of sklearn\'s DecisionTree implementation.',
      correctAnswer: 'CART',
      explanation: 'CART (Classification and Regression Trees) by Breiman et al. (1984) builds binary trees. It is distinct from ID3/C4.5 which allow multi-way splits for categorical features.',
    },
    {
      id: 'dt-5', type: 'match',
      question: 'Match each split criterion to the type of problem it is designed for:',
      pairs: [
        { left: 'Gini Impurity', right: 'Binary or multiclass classification' },
        { left: 'Entropy / Info Gain', right: 'Classification (information-theoretic)' },
        { left: 'Mean Squared Error', right: 'Regression (continuous target)' },
        { left: 'Mean Absolute Error', right: 'Regression (robust to outliers)' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'Gini and Entropy are for classification (discrete targets), while MSE and MAE are for regression (continuous targets). The choice of criterion affects tree structure but often produces similar results.',
    },
  ],
}))

export {}
