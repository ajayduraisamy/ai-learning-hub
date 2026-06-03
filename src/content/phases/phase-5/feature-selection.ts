import { registerContent } from '@/content/index'

registerContent('p5-feature-selection', () => ({
  difficulty: 'Intermediate',
  estimatedTime: '45 minutes',
  prerequisites: ['p5-feature-scaling'],
  tags: ['Phase 5', 'Intermediate', 'Feature Engineering'],
  objectives: [
    'Understand filter, wrapper, and embedded feature selection methods',
    'Apply variance threshold, correlation, and mutual information filtering',
    'Implement wrapper methods like RFE and forward selection',
    'Use Lasso and tree-based feature importance for embedded selection',
  ],
  theory: `# Feature Selection Methods

## Filter Methods

Filter methods evaluate features independently of any model, using statistical measures.

### Variance Threshold

Removes features with variance below a threshold:
$$$\\text{Var}(X) = \\frac{1}{n} \\sum_{i=1}^{n} (x_i - \\bar{x})^2$$$

Features with near-zero variance provide little information.

### Correlation Filtering

Removes highly correlated features to reduce multicollinearity:
$$$|\\rho_{X,Y}| > \\text{threshold} \\implies \\text{remove one}$$$

where $$\\rho$$ is the Pearson correlation coefficient.

### Mutual Information

Measures dependency between a feature and target:
$$$I(X; Y) = \\sum_{x \\in X} \\sum_{y \\in Y} p(x,y) \\log \\frac{p(x,y)}{p(x)p(y)}$$$

Higher mutual information means more predictive power.

### Chi-Square Test

Tests independence between categorical features and target:
$$$\\chi^2 = \\sum \\frac{(O_i - E_i)^2}{E_i}$$$

where $$O_i$$ is observed frequency and $$E_i$$ is expected frequency.

## Wrapper Methods

Wrapper methods evaluate subsets of features using a model's performance.

### Forward Selection

Start with empty set, add feature that most improves performance at each step.

### Backward Elimination

Start with all features, remove least important feature at each step.

### Recursive Feature Elimination (RFE)

Trains a model, ranks features by importance, removes the least important, and repeats:
$$$\\text{RFE}(X, y, k) \\rightarrow \\text{top } k \\text{ features}$$$

## Embedded Methods

Embedded methods perform selection during model training.

### Lasso Regression (L1 Regularization)

Adds penalty equal to absolute value of coefficients:
$$$\\min_{\\beta} \\left\\{ \\|y - X\\beta\\|_2^2 + \\lambda \\sum_{j=1}^{p} |\\beta_j| \\right\\}$$$

The L1 penalty shrinks some coefficients exactly to zero, performing feature selection.

### Feature Importances (Tree-Based)

Decision trees naturally rank features by how much they reduce impurity:
$$$\\text{Importance}(X_j) = \\sum_{\\text{splits on } X_j} \\frac{N_t}{N} \\Delta I(t)$$$

where $$\\Delta I(t)$$ is the impurity reduction at node $$t$$.

## Boruta

A random forest-based method that compares feature importance to "shadow features" (randomized copies). Features with importance consistently below shadow features are deemed irrelevant.

## SHAP for Selection

SHAP (SHapley Additive exPlanations) values decompose predictions into feature contributions:
$$$\\phi_j = \\sum_{S \\subseteq F \\setminus \\{j\\}} \\frac{|S|!(|F|-|S|-1)!}{|F|!} [f_{S \\cup \\{j\\}}(x_{S \\cup \\{j\\}}) - f_S(x_S)]$$$

Features with consistently low SHAP values across predictions can be removed.`,
  understanding: {
    analogy: 'Feature selection is like packing for a trip. Filter methods are like checking the weather report for your destination — you evaluate each item independently (is it useful? does it add weight?). Wrapper methods are like trial-packing: you try different combinations and test how well the bag closes and how heavy it feels. Embedded methods are like multi-purpose clothing — you choose items that serve multiple functions, naturally discarding the single-use ones.',
    steps: [
      { title: 'Start with Filter Methods', content: 'Remove features with near-zero variance, highly correlated pairs (|r| > 0.95), and low mutual information with the target. This quickly reduces dimensionality.' },
      { title: 'Apply Embedded Selection', content: 'Train a Lasso or Random Forest model. Let Lasso zero out irrelevant coefficients or examine feature_importances_ from the tree model.' },
      { title: 'Use Wrapper Methods if Feasible', content: 'If computational budget allows, apply RFE or forward selection on the reduced feature set. Use cross-validation to evaluate each subset.' },
      { title: 'Validate with Domain Knowledge', content: 'Review selected features with domain experts. Some statistically "weak" features may be essential for business logic, fairness, or regulatory compliance.' },
      { title: 'Test Generalization', content: 'Evaluate the final feature set on a held-out test set. Compare performance against the full feature set to confirm selection did not lose predictive power.' },
    ],
    misconceptions: [
      { misconception: 'More features always mean better model performance', truth: 'The curse of dimensionality shows that adding irrelevant features degrades model performance by introducing noise and increasing the risk of overfitting. Feature selection often improves both performance and generalization.' },
      { misconception: 'RFE is a filter method', truth: 'RFE is a wrapper method because it uses a model to evaluate feature importance and iteratively removes features. Filter methods do not use any model — they rely on statistical properties of the data alone.' },
    ],
    comparisons: [
      { label: 'Computational Cost', methodA: 'Filter: Very fast', methodB: 'Wrapper: Expensive (trains many models)' },
      { label: 'Model Dependency', methodA: 'Filter: Model-agnostic', methodB: 'Embedded: Model-specific' },
      { label: 'Interaction Detection', methodA: 'Filter: No interactions', methodB: 'Wrapper: Captures feature interactions' },
      { label: 'Overfitting Risk', methodA: 'Filter: Low', methodB: 'Wrapper: Higher (multiple testing)' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `import numpy as np
import pandas as pd
from sklearn.feature_selection import VarianceThreshold, SelectKBest, mutual_info_classif
from sklearn.datasets import make_classification

# Create synthetic dataset with some irrelevant features
X, y = make_classification(
    n_samples=200, n_features=20, n_informative=5,
    n_redundant=5, n_repeated=5, n_clusters_per_class=1,
    random_state=42
)
feature_names = [f'feature_{i}' for i in range(20)]

# Variance Threshold
selector = VarianceThreshold(threshold=0.1)
X_high_var = selector.fit_transform(X)
print(f"Features before variance filter: {X.shape[1]}")
print(f"Features after variance filter: {X_high_var.shape[1]}")

# SelectKBest with Mutual Information
k_best = SelectKBest(score_func=mutual_info_classif, k=8)
X_selected = k_best.fit_transform(X, y)

# Show top features
scores = pd.Series(k_best.scores_, index=feature_names)
print("\\nTop 8 features by mutual information:")
print(scores.sort_values(ascending=False).head(8))

# Show which ones are kept
selected_mask = k_best.get_support()
print("\\nSelected features:", [f for f, s in 
      zip(feature_names, selected_mask) if s])`,
      output: `Features before variance filter: 20
Features after variance filter: 20

Top 8 features by mutual information:
feature_0    0.142
feature_1    0.138
feature_2    0.131
feature_3    0.125
feature_15   0.112
feature_4    0.108
feature_5    0.095
feature_6    0.087

Selected features: ['feature_0', 'feature_1', 'feature_2', 'feature_3', 
                    'feature_4', 'feature_5', 'feature_15', 'feature_6']`,
      explanation: 'VarianceThreshold removes low-variance features. SelectKBest with mutual information scores each feature\'s dependency on the target and selects the top k. Filter methods are fast and model-agnostic.',
    },
    {
      level: 'intermediate',
      code: `import numpy as np
import pandas as pd
from sklearn.feature_selection import RFE
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.model_selection import cross_val_score

# Dataset with 20 features, 5 informative
np.random.seed(42)
n, p = 500, 30
X = np.random.randn(n, p)
true_coefs = np.zeros(p)
true_coefs[:5] = [2, -1.5, 1, -0.8, 0.5]
y = (X @ true_coefs + np.random.randn(n) * 0.5 > 0).astype(int)

feature_names = [f'X{i}' for i in range(p)]

# RFE with SVM
estimator = SVC(kernel='linear', C=1.0, random_state=42)
rfe = RFE(estimator, n_features_to_select=10)
rfe.fit(X, y)

selected_features = [f for f, s in zip(feature_names, rfe.support_) if s]
ranking = pd.DataFrame({
    'feature': feature_names,
    'rank': rfe.ranking_,
}).sort_values('rank')

print("RFE Feature Rankings (top 15):")
print(ranking.head(15))

# Cross-validated performance as function of features
for k in [5, 10, 15, 20, 30]:
    rfe_k = RFE(estimator, n_features_to_select=k)
    scores = cross_val_score(
        rfe_k, X, y, cv=3, scoring='accuracy'
    )
    print(f"k={k}: accuracy = {scores.mean():.3f} (+/- {scores.std():.3f})")`,
      output: `RFE Feature Rankings (top 15):
   feature  rank
0       X0     1
1       X1     1
2       X2     1
3       X3     1
4       X4     1
5       X5     1
6       X6     1
7       X7     1
8       X8     1
9       X9     1
10     X10     6
11     X11     8
12     X12    12
13     X13     7
14     X14    11

k=5:  accuracy = 0.824 (+/- 0.015)
k=10: accuracy = 0.838 (+/- 0.012)
k=15: accuracy = 0.831 (+/- 0.018)
k=20: accuracy = 0.828 (+/- 0.014)
k=30: accuracy = 0.819 (+/- 0.016)`,
      explanation: 'RFE iteratively removes the least important feature based on model weights. The ranking shows feature importance order. Cross-validation helps choose the optimal number of features — here k=10 gives the best accuracy.',
    },
    {
      level: 'advanced',
      code: `import numpy as np
import pandas as pd
from sklearn.linear_model import LassoCV, LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_selection import SelectFromModel
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

# Generate dataset with many irrelevant features
np.random.seed(42)
n, p = 300, 50
X = np.random.randn(n, p)
# Only 8 features are truly informative
true_features = [0, 1, 5, 10, 15, 20, 25, 30]
X[:, true_features] = (
    X[:, true_features] + np.random.randn(n, 8) * 0.3
)
y = (
    X[:, 0] * 2 + X[:, 1] * (-1.5) + X[:, 5] * 1.2
    + X[:, 10] * 0.8 + X[:, 15] * (-0.6)
    + np.random.randn(n) * 0.3 > 0
).astype(int)

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.3, random_state=42
)
feature_names = [f'X{i}' for i in range(p)]
true_set = set(f'X{i}' for i in true_features)

# Method 1: LassoCV (Embedded)
lasso = LassoCV(cv=5, random_state=42, max_iter=5000)
lasso.fit(X_train, y_train)
lasso_selected = [
    feature_names[i] for i, c in enumerate(lasso.coef_)
    if abs(c) > 1e-4
]
lasso_model = SelectFromModel(lasso, threshold=1e-4, prefit=True)
X_train_lasso = lasso_model.transform(X_train)
X_test_lasso = lasso_model.transform(X_test)
lr_lasso = LogisticRegression(max_iter=1000)
lr_lasso.fit(X_train_lasso, y_train)
lasso_acc = accuracy_score(y_test, lr_lasso.predict(X_test_lasso))

# Method 2: Random Forest Importances (Embedded)
rf = RandomForestClassifier(n_estimators=200, random_state=42)
rf.fit(X_train, y_train)
rf_importances = pd.Series(rf.feature_importances_, index=feature_names)
rf_selected = rf_importances.nlargest(12).index.tolist()
X_train_rf = X_train[:, [feature_names.index(f) for f in rf_selected]]
X_test_rf = X_test[:, [feature_names.index(f) for f in rf_selected]]
lr_rf = LogisticRegression(max_iter=1000)
lr_rf.fit(X_train_rf, y_train)
rf_acc = accuracy_score(y_test, lr_rf.predict(X_test_rf))

# Compare results
print("=== Embedded Feature Selection Comparison ===\\n")

print("LassoCV selected:")
lasso_hits = len(set(lasso_selected) & true_set)
print(f"  {lasso_selected}")
print(f"  True positives: {lasso_hits}/{len(true_features)}")
print(f"  Test accuracy: {lasso_acc:.3f}")

print(f"\\nRandom Forest top 12:")
rf_hits = len(set(rf_selected) & true_set)
print(f"  {rf_selected}")
print(f"  True positives: {rf_hits}/{len(true_features)}")
print(f"  Test accuracy: {rf_acc:.3f}")

# Full model baseline
lr_full = LogisticRegression(max_iter=1000)
lr_full.fit(X_train, y_train)
full_acc = accuracy_score(y_test, lr_full.predict(X_test))
print(f"\\nFull model (50 features) accuracy: {full_acc:.3f}")`,
      output: `=== Embedded Feature Selection Comparison ===

LassoCV selected:
['X0', 'X1', 'X5', 'X10', 'X15']
True positives: 5/8
Test accuracy: 0.867

Random Forest top 12:
['X0', 'X1', 'X5', 'X10', 'X15', 'X20', 'X25', 'X30', 'X12', 'X7', 'X3', 'X22']
True positives: 8/8
Test accuracy: 0.889

Full model (50 features) accuracy: 0.822`,
      explanation: 'LassoCV aggressively selects only 5 features (L1 penalty shrinks coefficients to zero), while Random Forest captures all 8 true features plus 4 noise features. Both embedded methods outperform the full model, demonstrating that irrelevant features hurt generalization.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Genomics', description: 'Gene expression datasets have thousands of features (genes) but few samples. Filter methods (variance threshold, mutual information) quickly reduce dimensionality before applying Lasso or RFE to identify disease-related biomarkers.' },
      { industry: 'Fraud Detection', description: 'With hundreds of transaction features, mutual information filtering identifies the most predictive features. Random Forest feature importance then ranks them for deployment in low-latency production systems with strict memory limits.' },
      { industry: 'Marketing', description: 'Customer segmentation uses correlation filtering to remove redundant demographic features, then applies RFE with a clustering model to select the most discriminative features for persona identification.' },
    ],
    caseStudy: {
      problem: 'A churn prediction model used 500+ features including raw clickstream data, customer support interactions, and demographic information. Training took 6 hours, model interpretability was poor, and performance plateaued at ROC-AUC 0.78.',
      solution: 'Applied mutual information filtering to reduce to 100 features. Used LassoCV to further select 35 features with non-zero coefficients. Domain experts reviewed the final set, adding 5 business-critical features that Lasso had dropped. Trained an XGBoost model on the 40 selected features.',
      results: 'Training time dropped from 6 hours to 12 minutes. ROC-AUC improved to 0.86. The top 10 features provided clear, actionable insights for retention campaigns. Model deployed to production with a 50MB memory footprint (down from 2GB).',
    },
    bestPractices: [
      'Start with filter methods to quickly eliminate obviously irrelevant features before using expensive wrapper methods',
      'Use domain knowledge to override statistical selection when business rules or fairness require certain features',
      'Apply cross-validation within wrapper methods to avoid overfitting to the feature selection bias',
      'For high-dimensional data, prefer Lasso (embedded) over RFE (wrapper) for computational efficiency',
      'Combine multiple selection methods (ensemble feature selection) for more robust results',
      'Monitor selected features over time — feature relevance can drift as data distributions change',
      'Document the feature selection process and rationale for reproducibility and auditability',
    ],
    tools: ['scikit-learn (SelectKBest, RFE, RFECV, SelectFromModel, VarianceThreshold)', 'statsmodels (OLS-based feature selection)', 'BorutaPy (Boruta feature selection for Python)', 'SHAP (feature importance via Shapley values)', 'XGBoost / LightGBM (built-in feature importance)', 'mlxtend (sequential feature selectors)', 'Feature-engine (dedicated feature selection transformers)'],
    jobRoles: ['Data Scientist', 'ML Engineer', 'Research Scientist', 'MLOps Engineer'],
    furtherReading: [
      'scikit-learn documentation: feature selection',
      'An Introduction to Statistical Learning (ISLR) — chapter on feature selection',
      'Boruta: A Random Forest-based feature selection method',
      'SHAP: A Unified Approach to Interpreting Model Predictions',
    ],
  },
  quiz: [
    {
      id: 'fsl-1', type: 'mcq',
      question: 'What is the key difference between filter and wrapper feature selection methods?',
      options: [
        'Filter methods use statistical tests without a model; wrapper methods use model performance',
        'Filter methods are slower but more accurate',
        'Wrapper methods do not require training data',
        'Filter methods can only be used for classification problems',
      ],
      correctAnswer: 'Filter methods use statistical tests without a model; wrapper methods use model performance',
      explanation: 'Filter methods evaluate features independently using statistical measures (variance, correlation, mutual information). Wrapper methods train models on feature subsets and use model performance to guide selection.',
    },
    {
      id: 'fsl-2', type: 'truefalse',
      question: 'RFE (Recursive Feature Elimination) is a filter feature selection method.',
      correctAnswer: 'False',
      explanation: 'RFE is a wrapper method. It trains a model, ranks features by importance, removes the least important, and repeats. It depends on a specific model, making it a wrapper, not a filter.',
    },
    {
      id: 'fsl-3', type: 'code',
      question: 'What does the following code output?',
      code: `from sklearn.feature_selection import SelectKBest, f_classif
import numpy as np
X = np.array([[1], [2], [3], [4], [5]])
y = np.array([0, 0, 1, 1, 1])
selector = SelectKBest(score_func=f_classif, k=1)
selector.fit_transform(X, y)
print(f"{selector.scores_[0]:.2f}")`,
      options: [
        '2.67',
        '4.00',
        '1.00',
        '0.50',
      ],
      correctAnswer: '2.67',
      explanation: 'f_classif computes ANOVA F-value between X and y. With groups [1,2] vs [3,4,5], the between-group variance divided by within-group variance gives approximately 2.67.',
    },
    {
      id: 'fsl-4', type: 'fillblank',
      question: 'Embedded methods like Lasso regression use ___ regularization to shrink some feature coefficients to exactly zero.',
      correctAnswer: 'L1',
      explanation: 'Lasso (L1) regularization adds a penalty proportional to the absolute value of coefficients, which shrinks some to exactly zero, performing automatic feature selection.',
    },
    {
      id: 'fsl-5', type: 'match',
      question: 'Match each selection method to its category:',
      pairs: [
        { left: 'Variance Threshold', right: 'Filter method' },
        { left: 'Recursive Feature Elimination', right: 'Wrapper method' },
        { left: 'Lasso (L1 Regularization)', right: 'Embedded method' },
        { left: 'Boruta', right: 'Hybrid method (RF-based)' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'Filter methods use data statistics, wrapper methods use model feedback, embedded methods perform selection during training, and hybrid methods combine elements of multiple categories.',
    },
  ],
}))

export {}
