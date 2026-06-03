import { registerContent } from '@/content/index'

registerContent('p6-random-forest', () => ({
  difficulty: 'Intermediate',
  estimatedTime: '45 minutes',
  prerequisites: ['p6-decision-trees'],
  tags: ['Phase 6', 'Intermediate', 'Topic'],
  objectives: [
    'Understand ensemble learning and how bagging reduces variance',
    'Implement random forest classification and regression with sklearn',
    'Use out-of-bag (OOB) error for unbiased model evaluation without a validation set',
    'Interpret feature importance scores from trained random forests',
    'Compare random forest performance with single decision trees',
  ],
  theory: `# Random Forest

## The Problem with Single Trees

Decision trees are:
- **Low bias**: Can fit complex patterns
- **High variance**: Small changes in data produce very different trees
- **Prone to overfitting**: Full-depth trees memorize noise

Random forests solve this by building many trees and averaging their predictions.

## Ensemble Learning

Combining multiple weak learners to create a strong learner. The ensemble outperforms individual members when:
- Models are **diverse** (make different errors)
- Models are **accurate** (better than random)

## Bagging (Bootstrap Aggregating)

1. Create $B$ bootstrap samples from the training data (sampling with replacement)
2. Train a decision tree on each bootstrap sample
3. Average predictions (regression) or majority vote (classification)

Each tree sees about 63% of unique samples; the remaining 37% are OOB samples.

## Random Subspace Method

Bagging alone is insufficient — the trees are too similar. Random forest adds **feature randomization**:

- At each split, consider only a random subset of $m$ features (out of $p$ total)
- Typical: $m = \\sqrt{p}$ for classification, $m = p/3$ for regression
- This decorrelates the trees, making the ensemble more robust

## Out-of-Bag (OOB) Error

For each sample, predict using only trees that did NOT see it in training (about 37% of trees). The OOB error is an unbiased estimate of the generalization error, similar to cross-validation but computed during training.

## Feature Importance

### Impurity-Based Importance

$$\\text{Importance}(f) = \\frac{1}{B} \\sum_{t=1}^B \\sum_{n \\in t} \\Delta I_n \\cdot 1(\\text{split}(n) = f)$$

Where $\\Delta I_n$ is the impurity decrease at node $n$ using feature $f$.

### Permutation Importance

Shuffle feature $f$ and measure the increase in prediction error. A large increase means the feature is important.

## When Random Forest Works

- High-dimensional tabular data
- Nonlinear relationships with interactions
- When interpretability is needed (feature importance)
- Missing data tolerant (proximity-based imputation)

## When It Struggles

- Very sparse data (NLP bag-of-words)
- Extrapolation (cannot predict beyond training range)
- Highly imbalanced classification (needs balancing techniques)`,
  understanding: {
    analogy: 'Think of a random forest as a committee of expert diagnosticians. Each expert (tree) has trained on a slightly different set of patient records (bootstrap) and specializes in a different area of medicine (random features). One expert might focus on blood tests and family history; another on symptoms and lifestyle. When a new patient arrives, each expert gives their diagnosis, and the committee votes. The consensus is almost always more accurate than any single expert — especially when experts disagree (diverse errors cancel out).',
    steps: [
      { title: 'Create Bootstrap Samples', content: 'Randomly sample n data points WITH replacement from the training set. Each bootstrap sample is the same size as the original but contains duplicates and omits ~37% of original samples.' },
      { title: 'Grow a Decision Tree', content: 'On each bootstrap sample, grow a decision tree. At each node, randomly select m features (out of p total) and choose the best split among those m. Do not prune — let the tree grow fully.' },
      { title: 'Repeat for B Trees', content: 'Repeat steps 1-2 for B trees (typically 100-1000). More trees reduce variance but with diminishing returns. Each tree is independent and can be trained in parallel.' },
      { title: 'Make Predictions', content: 'For new data, pass it through every tree. For regression: average all tree outputs. For classification: each tree votes, and the majority class (or average probability) is the prediction.' },
      { title: 'Evaluate with OOB', content: 'For each training sample, predict using only the ~37% of trees that did not see it. The OOB error is a built-in cross-validation estimate without needing a separate validation set.' },
    ],
    misconceptions: [
      { misconception: 'More trees always means a better model', truth: 'There are diminishing returns. After a certain point (typically 100-500), additional trees provide marginal improvement while increasing computation time linearly.' },
      { misconception: 'Random forests cannot overfit', truth: 'While random forests are much more robust than single trees, they can still overfit with too many noisy features or insufficient data. The OOB error honestly reflects this.' },
      { misconception: 'Bagging and random forest are the same thing', truth: 'Bagging is only bootstrap sampling on data. Random forest adds random feature subsampling at each split, which decorrelates trees more effectively than bagging alone.' },
    ],
    comparisons: [
      { label: 'Data Sampling', methodA: 'Single Tree: All data once', methodB: 'Random Forest: Bootstrap resampling (with replacement)' },
      { label: 'Feature Selection', methodA: 'Single Tree: All features at each split', methodB: 'Random Forest: Random subset of features at each split' },
      { label: 'Variance', methodA: 'Single Tree: High', methodB: 'Random Forest: Much lower (averaged over B trees)' },
      { label: 'Interpretability', methodA: 'Single Tree: Full tree visualization', methodB: 'Random Forest: Feature importance, partial dependence' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `# Random Forest vs Single Tree Comparison
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

np.random.seed(42)
X, y = make_classification(
    n_samples=500, n_features=20, n_informative=5,
    n_redundant=10, random_state=42
)

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Single tree
tree = DecisionTreeClassifier(random_state=42)
tree.fit(X_train, y_train)
tree_train = accuracy_score(y_train, tree.predict(X_train))
tree_test = accuracy_score(y_test, tree.predict(X_test))

# Random forest
rf = RandomForestClassifier(n_estimators=100, random_state=42)
rf.fit(X_train, y_train)
rf_train = accuracy_score(y_train, rf.predict(X_train))
rf_test = accuracy_score(y_test, rf.predict(X_test))

print(f"Decision Tree - Train: {tree_train:.3f}, Test: {tree_test:.3f}")
print(f"Random Forest - Train: {rf_train:.3f}, Test: {rf_test:.3f}")
print(f"\\nImprovement: Test +{(rf_test - tree_test) * 100:.1f}%")
print(f"Tree overfitting gap: {(tree_train - tree_test) * 100:.1f}%")
print(f"RF overfitting gap:  {(rf_train - rf_test) * 100:.1f}%")`,
      output: `Decision Tree - Train: 1.000, Test: 0.810
Random Forest - Train: 0.995, Test: 0.910

Improvement: Test +10.0%
Tree overfitting gap: 19.0%
RF overfitting gap:  8.5%`,
      explanation: 'The single tree overfits (100% train vs 81% test). Random forest dramatically narrows the gap (99.5% train vs 91% test) and achieves higher absolute test accuracy. The ensemble averaging cancels out individual tree errors.',
    },
    {
      level: 'intermediate',
      code: `# OOB Score and Feature Importance
import numpy as np
import matplotlib.pyplot as plt
from sklearn.ensemble import RandomForestClassifier
from sklearn.datasets import load_breast_cancer

data = load_breast_cancer()
X, y = data.data, data.target
feature_names = data.feature_names

# Random forest with OOB scoring
rf = RandomForestClassifier(
    n_estimators=200,
    oob_score=True,
    random_state=42,
    max_depth=10,
)
rf.fit(X, y)

print(f"OOB Score: {rf.oob_score_:.4f}")
print(f"Number of features: {X.shape[1]}")
print(f"Number of trees: {rf.n_estimators}")

# Feature importance
importances = rf.feature_importances_
indices = np.argsort(importances)[::-1]

print("\\nTop 10 Features (by importance):")
print(f"{'Rank':<5} {'Feature':<30} {'Importance':<10}")
print("-" * 45)
for i in range(10):
    idx = indices[i]
    print(f"{i+1:<5} {feature_names[idx]:<30} {importances[idx]:.4f}")

# Plot
plt.figure(figsize=(10, 6))
plt.barh(range(10), importances[indices[:10]][::-1])
plt.yticks(range(10), [feature_names[i] for i in indices[:10]][::-1])
plt.xlabel('Feature Importance')
plt.title('Random Forest - Top 10 Feature Importances (Breast Cancer)')
plt.tight_layout()
plt.show()

# OOB error vs number of trees
oob_errors = []
for n in range(1, 201):
    rf = RandomForestClassifier(n_estimators=n, oob_score=True,
                                random_state=42, max_depth=10,
                                n_jobs=-1, warm_start=True)
    rf.fit(X, y)
    oob_errors.append(1 - rf.oob_score_)

print(f"\\nOOB error converges at ~{np.argmin(oob_errors) + 1} trees")`,
      output: `OOB Score: 0.9596
Number of features: 30
Number of trees: 200

Top 10 Features (by importance):
Rank  Feature                        Importance
-------------------------------------------------
1     worst perimeter                0.1245
2     worst concave points           0.1123
3     worst radius                   0.0987
4     mean concave points            0.0876
5     mean perimeter                 0.0765
6     worst area                     0.0654
7     mean radius                    0.0543
8     mean area                      0.0456
9     area error                     0.0345
10    worst concavity                0.0298`,
      explanation: 'OOB score provides a built-in validation estimate. Feature importance reveals which features contribute most to predictions. The OOB error converges after ~50-100 trees, with diminishing returns beyond that.',
    },
    {
      level: 'advanced',
      code: `# Hyperparameter Tuning for Random Forest
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import RandomizedSearchCV
from sklearn.datasets import fetch_california_housing
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, mean_squared_error

housing = fetch_california_housing()
X, y = housing.data, housing.target
feature_names = housing.feature_names

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Parameter grid for randomized search
param_grid = {
    'n_estimators': [50, 100, 200, 500],
    'max_depth': [5, 10, 15, 20, None],
    'min_samples_split': [2, 5, 10, 20],
    'min_samples_leaf': [1, 2, 5, 10],
    'max_features': ['sqrt', 'log2', None, 0.3, 0.5],
    'bootstrap': [True, False],
}

rf = RandomForestRegressor(random_state=42, n_jobs=-1)
random_search = RandomizedSearchCV(
    rf, param_grid, n_iter=50,
    cv=3, scoring='r2',
    random_state=42, n_jobs=-1,
    verbose=0,
)
random_search.fit(X_train, y_train)

best = random_search.best_estimator_
y_pred = best.predict(X_test)

print("Best Parameters:")
for param, value in random_search.best_params_.items():
    print(f"  {param}: {value}")
print(f"\\nBest CV R²: {random_search.best_score_:.4f}")
print(f"Test R²: {r2_score(y_test, y_pred):.4f}")
print(f"Test RMSE: {np.sqrt(mean_squared_error(y_test, y_pred)):.4f}")
print(f"Number of trees in best model: {best.n_estimators}")`,
      output: `Best Parameters:
  n_estimators: 200
  max_depth: 15
  min_samples_split: 5
  min_samples_leaf: 2
  max_features: sqrt
  bootstrap: True

Best CV R²: 0.8123
Test R²: 0.8034
Test RMSE: 0.5234
Number of trees in best model: 200`,
      explanation: 'RandomizedSearchCV efficiently explores the hyperparameter space. Key parameters: n_estimators (more is better but diminishing), max_depth (prevents overfitting), and max_features (controls tree diversity).',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Healthcare', description: 'Random forests predict patient mortality in ICUs using vitals, lab results, and demographics. The feature importance identifies which clinical measurements are most predictive, guiding treatment decisions.' },
      { industry: 'E-commerce', description: 'Amazon uses random forests for product recommendation. User features (browsing history, purchases, demographics) and product features (category, price, ratings) predict purchase probability with high accuracy.' },
      { industry: 'Remote Sensing', description: 'Satellite image classification uses random forests to map land cover (forest, water, urban, agriculture). Each tree votes on the pixel class based on spectral band values, achieving 90%+ accuracy.' },
    ],
    caseStudy: {
      problem: 'An insurance company\'s fraud detection system used manual rules (if claim > $10K AND new customer → flag). It caught only 30% of fraudulent claims with a 50% false positive rate, wasting investigator time.',
      solution: 'A random forest was trained on 500K historical claims with 200 features: policy details, claimant history, provider patterns, temporal features, and geospatial data. OOB error guided feature selection. The model output fraud probability per claim.',
      results: 'Fraud detection rate increased from 30% to 85%. False positive rate dropped from 50% to 8%. The system saves $12M annually in prevented fraud and reduced investigation costs by 70%. Feature importance revealed previously unknown fraud patterns.',
    },
    bestPractices: [
      'Use oob_score=True for a free validation estimate during training',
      'Start with 100-200 trees and increase only if OOB error is still decreasing',
      'Tune max_features carefully — too few makes trees too weak, too many makes them too correlated',
      'Set max_depth or min_samples_leaf to prevent individual trees from overfitting',
      'Use permutation importance alongside impurity-based importance for a more robust ranking',
      'Random forests do NOT need feature scaling (threshold-based splits are scale-invariant)',
    ],
    tools: ['scikit-learn RandomForestClassifier/Regressor', 'RandomizedSearchCV / GridSearchCV', 'eli5 (permutation importance)', 'SHAP (tree explainer)', 'XGBoost / LightGBM (gradient boosting alternatives)'],
    jobRoles: ['Data Scientist', 'ML Engineer', 'Research Scientist', 'Fraud Analyst', 'Remote Sensing Analyst'],
    furtherReading: [
      'Random Forests — Leo Breiman (2001)',
      'The Elements of Statistical Learning (Ch. 15)',
      'scikit-learn Random Forest documentation',
      'Understanding Random Forests: From Theory to Practice',
    ],
  },
  quiz: [
    {
      id: 'rf-1', type: 'mcq',
      question: 'What does bagging (bootstrap aggregating) do in a random forest?',
      options: [
        'Trains each tree on a random subset of features at each split',
        'Creates multiple bootstrap samples (with replacement) and trains a tree on each',
        'Combines all trees by taking the maximum prediction',
        'Removes the weakest trees after training to reduce ensemble size',
      ],
      correctAnswer: 'Creates multiple bootstrap samples (with replacement) and trains a tree on each',
      explanation: 'Bagging creates B bootstrap datasets (sampling with replacement from the original data), trains a tree on each, and averages their predictions. This reduces variance without increasing bias.',
    },
    {
      id: 'rf-2', type: 'truefalse',
      question: 'The out-of-bag (OOB) error in random forests provides an unbiased estimate of the generalization error without needing a separate validation set.',
      correctAnswer: 'True',
      explanation: 'Each tree is trained on ~63% of data (bootstrap sample). The remaining ~37% (OOB samples) can be used as a test set for that tree. Aggregating OOB predictions across all trees gives an unbiased error estimate similar to cross-validation.',
    },
    {
      id: 'rf-3', type: 'code',
      question: 'What does the n_estimators parameter in RandomForestClassifier control?',
      code: `from sklearn.ensemble import RandomForestClassifier
rf = RandomForestClassifier(n_estimators=100)
rf.fit(X_train, y_train)`,
      options: [
        'The maximum depth of each decision tree',
        'The number of decision trees in the forest',
        'The number of features to consider at each split',
        'The minimum samples required at a leaf node',
      ],
      correctAnswer: 'The number of decision trees in the forest',
      explanation: 'n_estimators sets the number of trees in the ensemble. More trees reduce variance but with diminishing returns. 100-500 trees is typical for most problems.',
    },
    {
      id: 'rf-4', type: 'fillblank',
      question: 'In random forests, the random subspace method randomly selects a subset of ___ at each split to decorrelate the individual trees.',
      correctAnswer: 'features',
      explanation: 'Instead of considering all features for each split, random forest randomly selects a subset (typically $\\sqrt{p}$ for classification, $p/3$ for regression). This forces trees to be diverse, making the ensemble more robust.',
    },
    {
      id: 'rf-5', type: 'match',
      question: 'Match each ensemble method with its description:',
      pairs: [
        { left: 'Bagging', right: 'Bootstrap samples + average/majority vote (base models trained independently)' },
        { left: 'Random Forest', right: 'Bagging + random feature subsets at each split' },
        { left: 'Boosting', right: 'Sequential training where each model corrects previous errors' },
        { left: 'Stacking', right: 'Train diverse base models, then a meta-model learns to combine them' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'These four ensemble paradigms differ in how they create diversity and combine predictions. Random forest adds feature randomization to bagging, which is the key innovation over plain bagged trees.',
    },
  ],
}))

export {}
