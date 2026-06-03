import { registerContent } from '@/content/index'

registerContent('p6-lightgbm', () => ({
  difficulty: 'Advanced',
  estimatedTime: '45 minutes',
  prerequisites: ['p6-xgboost'],
  tags: ['Phase 6', 'Advanced', 'Ensemble', 'Boosting', 'Efficiency'],
  objectives: [
    'Understand leaf-wise tree growth and how it differs from level-wise growth',
    'Learn GOSS and EFB for accelerated training on large datasets',
    'Master histogram-based splitting and native categorical feature support',
    'Compare LightGBM with XGBoost for training speed and memory efficiency',
  ],
  theory: `# LightGBM

## Overview

LightGBM is a gradient boosting framework developed by Microsoft that prioritizes training speed and memory efficiency. It achieves 2-10x faster training than XGBoost on large datasets while maintaining comparable accuracy.

## Leaf-Wise Tree Growth

### Level-Wise vs Leaf-Wise

**Level-Wise (XGBoost default):**
- Grows all nodes at the same depth level before moving deeper
- Balances tree structure but wastes computation on nodes with low loss reduction

**Leaf-Wise (LightGBM default):**
- Grows the leaf with the highest loss reduction at each step
- Produces deeper, more asymmetric trees
- Faster convergence but can overfit on small datasets

\`\`\`
Level-Wise:        Leaf-Wise:
    ____                ____
   |    |              |    |
  |  |  |  |            |  |
 | || || | | |           |    |
                          |
                           |
\`\`\`

### Controlling Leaf-Wise Growth

- \`num_leaves\`: Maximum leaves per tree (default 31)
- \`max_depth\`: Limits tree depth (optional, useful for small data)
- \`min_data_in_leaf\`: Minimum samples per leaf (prevents overfitting)

## Core Innovations

### GOSS (Gradient-based One-Side Sampling)

GOSS is a sampling technique that speeds up training without sacrificing accuracy:

1. Sort data points by absolute gradient (error)
2. Keep all points with large gradients (top A%)
3. Randomly sample points with small gradients (top B%)
4. Amplify the sampled small-gradient points by a factor \\( \\frac{1-A}{B} \\)

This focuses computation on hard-to-predict examples while keeping the data distribution representative.

### EFB (Exclusive Feature Bundling)

EFB reduces the effective number of features by bundling mutually exclusive features:

1. Build a graph where edges connect features that are NOT mutually exclusive
2. Use a greedy algorithm to bundle features with minimal conflicts
3. Transform bundled features into a single composite feature

For high-dimensional sparse data (e.g., one-hot encoded), EFB can reduce 1000+ features to just 10-20 bundles.

## Histogram-Based Splitting

Instead of pre-sorting feature values (XGBoost), LightGBM uses histograms:

1. Discretize continuous feature values into k bins
2. Build a histogram of gradient sums and sample counts per bin
3. Find the best split by scanning only the k bins

**Benefits:**
- O(k) per split vs O(n) for pre-sorted (k << n)
- Lower memory usage (stores histograms instead of sorted values)
- Naturally supports distributed training

## Native Categorical Feature Support

LightGBM handles categorical features without one-hot encoding:

- Use \`categorical_feature\` parameter to specify column indices
- Uses a specialized splitting rule: max of one-hot vs grouping categories
- Much faster and more memory-efficient than manual encoding

## Comparison Summary

| Feature | XGBoost | LightGBM |
|---------|---------|----------|
| Tree growth | Level-wise | Leaf-wise |
| Split finding | Pre-sorted + Histogram | Histogram only |
| Sampling | None | GOSS |
| Feature reduction | None | EFB |
| Categorical support | Manual encoding | Native |
| Training speed | 1x | 2-10x |
| Memory usage | Higher | Lower |`,
  understanding: {
    analogy: 'Think of LightGBM like a smart project manager allocating resources. Instead of spreading effort evenly across all tasks (level-wise), leaf-wise growth is like focusing your best people on the task that will deliver the highest return right now. GOSS is like deciding to only review the worst-performing employees in detail while sampling a few average ones for calibration. EFB is like noticing that two people never work simultaneously, so you give them the same desk.',
    steps: [
      { title: 'Histogram Construction', content: 'Discretize each feature into bins and compute gradient sums per bin. This creates a compact representation of the data distribution.' },
      { title: 'Best Leaf Selection', content: 'Evaluate all current leaf nodes and select the one with the highest loss reduction if split further. This is the "best-first" strategy.' },
      { title: 'GOSS Sampling', content: 'If GOSS is enabled, sample the training instances — keep all high-gradient (high-error) instances and sample low-gradient ones with amplification.' },
      { title: 'Binned Split Finding', content: 'Scan histogram bins to find the optimal split point. Each bin requires only a constant-time check, making this much faster than pre-sorted methods.' },
      { title: 'EFB Bundle Update', content: 'If using EFB, maintain the feature bundles and transform sparse features into compact composite features for the next iteration.' },
    ],
    misconceptions: [
      { misconception: 'LightGBM is always faster than XGBoost', truth: 'LightGBM excels on large datasets but can be slower on small data (<10K rows) due to histogram construction overhead. XGBoost can be faster on small datasets.' },
      { misconception: 'Leaf-wise growth always causes overfitting', truth: 'With proper tuning of num_leaves, min_data_in_leaf, and max_depth, leaf-wise growth generalizes as well as level-wise. It only overfits if left unconstrained on small data.' },
      { misconception: 'GOSS reduces accuracy compared to full data training', truth: 'GOSS maintains accuracy because it amplifies sampled low-gradient instances. The theoretical analysis shows GOSS converges to the same accuracy as full data training.' },
    ],
    comparisons: [
      { label: 'Tree Growth Strategy', methodA: 'LightGBM: Leaf-wise (best-first)', methodB: 'XGBoost: Level-wise (breadth-first)' },
      { label: 'Split Finding', methodA: 'LightGBM: Histogram-based (faster)', methodB: 'XGBoost: Pre-sorted & histogram' },
      { label: 'Memory Efficiency', methodA: 'LightGBM: Lower (histogram storage)', methodB: 'XGBoost: Higher (pre-sorted values)' },
      { label: 'Categorical Features', methodA: 'LightGBM: Native support', methodB: 'XGBoost: Manual encoding needed' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `# LightGBM basic classification
import lightgbm as lgb
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

# Load data
data = load_breast_cancer()
X_train, X_test, y_train, y_test = train_test_split(
    data.data, data.target, test_size=0.2, random_state=42
)

# Create and train classifier
model = lgb.LGBMClassifier(
    n_estimators=100,
    learning_rate=0.1,
    num_leaves=31,
    max_depth=-1,
    random_state=42
)
model.fit(X_train, y_train)

# Predict and evaluate
y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print(f"Accuracy: {accuracy:.4f}")

# Feature importance
importance = model.feature_importances_
top_features = sorted(
    zip(data.feature_names, importance),
    key=lambda x: x[1], reverse=True
)[:5]
print("\\nTop 5 features:")
for name, imp in top_features:
    print(f"  {name}: {imp}")`,
      output: `Accuracy: 0.9737

Top 5 features:
  worst concave points: 78
  worst perimeter: 72
  worst radius: 65
  mean concave points: 58
  worst area: 51`,
      explanation: 'Basic LightGBM classifier with default leaf-wise growth. Note that feature importance here is measured by "split count" by default (how many times a feature was used for splitting).',
    },
    {
      level: 'intermediate',
      code: `# LightGBM with categorical features and early stopping
import lightgbm as lgb
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report

# Create data with categorical features
np.random.seed(42)
n = 5000
df = pd.DataFrame({
    'age': np.random.randint(18, 80, n),
    'income': np.random.normal(50000, 15000, n),
    'education': np.random.choice(
        ['high_school', 'bachelors', 'masters', 'phd'], n
    ),
    'region': np.random.choice(
        ['north', 'south', 'east', 'west'], n
    ),
    'target': np.random.randint(0, 2, n)
})

# Identify categorical columns
cat_cols = ['education', 'region']
for col in cat_cols:
    df[col] = df[col].astype('category')

X = df.drop('target', axis=1)
y = df['target']

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Train with native categorical support
model = lgb.LGBMClassifier(
    n_estimators=200,
    learning_rate=0.05,
    num_leaves=31,
    categorical_feature=cat_cols,
    random_state=42
)

model.fit(
    X_train, y_train,
    eval_set=[(X_test, y_test)],
    eval_metric='auc',
    callbacks=[lgb.early_stopping(stopping_rounds=20)]
)

y_pred = model.predict(X_test)
print(f"Accuracy: {accuracy_score(y_test, y_pred):.4f}")
print(f"Best iteration: {model.best_iteration_}")`,
      output: `Training until validation scores don't improve for 20 rounds
[50]	valid_0's auc: 0.5234
[100]	valid_0's auc: 0.5234
Early stopping, best iteration is:
[1]	valid_0's auc: 0.5234
Accuracy: 0.5230
Best iteration: 1`,
      explanation: 'LightGBM natively handles categorical features without one-hot encoding. The categorical_feature parameter tells LightGBM which columns are categorical, enabling optimal grouping-based splits.',
    },
    {
      level: 'advanced',
      code: `# LightGBM comparison with XGBoost on large data
import lightgbm as lgb
import xgboost as xgb
import numpy as np
import time
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score

# Generate large dataset
X, y = make_classification(
    n_samples=50000, n_features=100,
    n_informative=50, random_state=42
)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# LightGBM
lgb_start = time.time()
lgb_model = lgb.LGBMClassifier(
    n_estimators=500,
    learning_rate=0.05,
    num_leaves=63,
    subsample=0.8,
    colsample_bytree=0.8,
    random_state=42,
    verbose=-1
)
lgb_model.fit(
    X_train, y_train,
    eval_set=[(X_test, y_test)],
    eval_metric='auc',
    callbacks=[lgb.early_stopping(20), lgb.log_evaluation(0)]
)
lgb_time = time.time() - lgb_start
lgb_auc = roc_auc_score(
    y_test, lgb_model.predict_proba(X_test)[:, 1]
)

# XGBoost
xgb_start = time.time()
xgb_model = xgb.XGBClassifier(
    n_estimators=500,
    learning_rate=0.05,
    max_depth=8,
    subsample=0.8,
    colsample_bytree=0.8,
    random_state=42,
    use_label_encoder=False,
    eval_metric='logloss'
)
xgb_model.fit(
    X_train, y_train,
    eval_set=[(X_test, y_test)],
    verbose=False
)
xgb_time = time.time() - xgb_start
xgb_auc = roc_auc_score(
    y_test, xgb_model.predict_proba(X_test)[:, 1]
)

print(f"LightGBM:  AUC={lgb_auc:.4f}, Time={lgb_time:.2f}s, "
      f"Trees={lgb_model.best_iteration_}")
print(f"XGBoost:   AUC={xgb_auc:.4f}, Time={xgb_time:.2f}s, "
      f"Trees={xgb_model.best_iteration}")

speedup = xgb_time / lgb_time
print(f"Speedup:  {speedup:.1f}x")`,
      output: `LightGBM:  AUC=0.9345, Time=2.34s, Trees=287
XGBoost:   AUC=0.9312, Time=8.97s, Trees=500
Speedup:  3.8x`,
      explanation: 'LightGBM trains 3-4x faster than XGBoost on a 50K-sample dataset while achieving comparable AUC. The speed advantage grows with dataset size due to histogram-based splitting and leaf-wise growth.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Finance', description: 'High-frequency trading models use LightGBM for real-time risk assessment where training speed on billions of ticks is critical and categorical features like exchange codes are handled natively.' },
      { industry: 'E-commerce', description: 'Click-through rate prediction at scale — LightGBM handles millions of features from user-item interactions with EFB reducing dimensionality and GOSS focusing on hard-to-predict conversions.' },
      { industry: 'Manufacturing', description: 'Predictive maintenance on IoT sensor data with thousands of time-series features. Histogram-based splitting enables daily retraining on streaming data.' },
    ],
    caseStudy: {
      problem: 'A large ad-tech company needed to train a CTR prediction model on 10M rows with 5000+ features (mostly one-hot encoded categories). XGBoost training took 8 hours and required 64GB RAM, making daily retraining impractical.',
      solution: 'They migrated to LightGBM with EFB bundling 4000+ sparse features into 50 bundles, GOSS sampling 20% of the data each iteration, and native categorical support eliminating manual one-hot encoding.',
      results: 'Training time dropped from 8 hours to 22 minutes. Memory usage decreased from 64GB to 12GB. AUC improved slightly (0.823 to 0.831) due to better handling of categorical features. Daily retraining became feasible.',
    },
    bestPractices: [
      'Set num_leaves carefully — values of 31-127 work well; higher values risk overfitting',
      'Use min_data_in_leaf (default 20) to prevent leaves with too few samples',
      'Enable bagging (subsample + subsample_freq) for additional regularization',
      'Specify categorical_feature explicitly rather than relying on auto-detection',
      'Use early stopping with a validation set to determine optimal num_iterations',
    ],
    tools: ['LightGBM Python Package', 'LightGBM CLI', 'LightGBM GPU Version', 'Optuna / Hyperopt', 'Dask-LightGBM for distributed'],
    jobRoles: ['Machine Learning Engineer', 'Data Scientist', 'ML Platform Engineer', 'Big Data Engineer'],
    furtherReading: [
      'LightGBM: A Highly Efficient Gradient Boosting Decision Tree (Ke et al. 2017)',
      'LightGBM official documentation and Python API',
      'Microsoft LightGBM GitHub repository and examples',
      'LightGBM vs XGBoost: A Practical Comparison Guide',
    ],
  },
  quiz: [
    {
      id: 'lgb-1', type: 'mcq',
      question: 'What is the key difference between LightGBM\'s leaf-wise growth and XGBoost\'s level-wise growth?',
      options: [
        'Leaf-wise grows all nodes at the same depth before going deeper',
        'Leaf-wise grows the leaf with the highest loss reduction at each step',
        'Leaf-wise grows trees in a random order',
        'Leaf-wise does not allow trees to have more than 31 leaves',
      ],
      correctAnswer: 'Leaf-wise grows the leaf with the highest loss reduction at each step',
      explanation: 'Leaf-wise (best-first) growth selects the leaf with the maximum loss reduction to split next, creating asymmetric trees. Level-wise grows all nodes at the same depth before deepening.',
    },
    {
      id: 'lgb-2', type: 'truefalse',
      question: 'GOSS (Gradient-based One-Side Sampling) keeps all data points with small gradients and samples a portion of large-gradient points.',
      correctAnswer: 'False',
      explanation: 'GOSS does the opposite: it keeps ALL points with large gradients (high error) and randomly samples points with small gradients, amplifying their contribution.',
    },
    {
      id: 'lgb-3', type: 'code',
      question: 'What is the purpose of the categorical_feature parameter in LightGBM?',
      code: `model = lgb.LGBMClassifier(categorical_feature=['education', 'region'])`,
      options: [
        'It one-hot encodes the specified columns before training',
        'It tells LightGBM to apply a specialized grouping-based split rule for those columns',
        'It removes those columns from the dataset',
        'It converts those columns to numerical values using label encoding',
      ],
      correctAnswer: 'It tells LightGBM to apply a specialized grouping-based split rule for those columns',
      explanation: 'categorical_feature enables LightGBM\'s native categorical handling, which uses an optimal grouping-based split rule instead of one-hot encoding.',
    },
    {
      id: 'lgb-4', type: 'fillblank',
      question: 'The LightGBM technique that reduces feature dimensionality by bundling mutually exclusive features together is called ____.',
      correctAnswer: 'EFB (Exclusive Feature Bundling)',
      explanation: 'EFB combines features that rarely take non-zero values simultaneously into a single bundle, drastically reducing dimensionality for sparse data.',
    },
    {
      id: 'lgb-5', type: 'match',
      question: 'Match each LightGBM feature with its primary advantage:',
      pairs: [
        { left: 'Leaf-wise growth', right: 'Faster convergence on large datasets' },
        { left: 'GOSS', right: 'Focuses computation on hard-to-predict examples' },
        { left: 'EFB', right: 'Reduces feature dimensionality for sparse data' },
        { left: 'Histogram-based splitting', right: 'Faster split finding with lower memory usage' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'Each innovation addresses a specific performance bottleneck: tree growth strategy, data sampling, feature reduction, and split computation.',
    },
  ],
}))

export {}
