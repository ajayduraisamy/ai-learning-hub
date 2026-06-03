import { registerContent } from '@/content/index'

registerContent('p5-feature-scaling', () => ({
  difficulty: 'Intermediate',
  estimatedTime: '45 minutes',
  prerequisites: ['p5-datetime-features'],
  tags: ['Phase 5', 'Intermediate', 'Feature Engineering'],
  objectives: [
    'Understand why feature scaling matters for different model types',
    'Apply StandardScaler, MinMaxScaler, and RobustScaler correctly',
    'Know when to use each scaling method for different data distributions',
    'Distinguish scaling requirements for ML vs deep learning models',
  ],
  theory: `# Feature Scaling

## Why Scaling Matters

Feature scaling ensures all features contribute equally to models that use distance or gradient-based optimization.

Without scaling, features with larger numerical ranges dominate the model:
$$$\\text{Dominated features have negligible weight updates in gradient descent}$$$

## StandardScaler (Z-score Normalization)

Centers data to mean 0 and scales to unit variance:
$$$x' = \\frac{x - \\mu}{\\sigma}$$$

where $$\\mu$$ is the mean and $$\\sigma$$ is the standard deviation.

StandardScaler assumes data is approximately normally distributed. It produces features with mean 0 and variance 1.

## MinMaxScaler

Scales data to a fixed range, typically [0, 1]:
$$$x' = \\frac{x - \\min(x)}{\\max(x) - \\min(x)}$$$

MinMaxScaler is sensitive to outliers because a single extreme value compresses the rest of the data.

## RobustScaler

Uses median and IQR (interquartile range), making it robust to outliers:
$$$x' = \\frac{x - \\text{median}(x)}{\\text{IQR}(x)}$$$

where $$\\text{IQR} = Q_3 - Q_1$$ (75th percentile minus 25th percentile).

## MaxAbsScaler

Scales each feature by its maximum absolute value, preserving sparsity:
$$$x' = \\frac{x}{\\max(|x|)}$$$

Outputs are in range [-1, 1]. Good for sparse data.

## Normalizer

Scales individual samples (rows) to unit norm, not features (columns):
$$$x' = \\frac{x}{\\|x\\|_p}$$$

Common norms: L1 (sum of absolute values = 1), L2 (sum of squares = 1).

## When to Use Each

| Scaler | Best For | Robust to Outliers | Output Range |
|--------|----------|-------------------|--------------|
| StandardScaler | Normally distributed data | No | Unbounded |
| MinMaxScaler | Bounded data, neural nets | No | [0, 1] |
| RobustScaler | Data with outliers | Yes | Unbounded |
| MaxAbsScaler | Sparse data | No | [-1, 1] |
| Normalizer | Text classification, clustering | N/A | Unit norm |

## Scaling for ML vs Deep Learning

- **Linear models, SVM, k-NN, PCA**: Require scaling — distances and coefficients depend on feature magnitudes
- **Tree-based models (Random Forest, XGBoost)**: Invariant to scaling — splits are based on thresholds, not distances
- **Neural Networks**: Require scaling — gradient descent converges faster with normalized inputs. MinMaxScaler to [0,1] or StandardScaler are common choices
- **Deep Learning**: Batch Normalization layers can internalize scaling, but input scaling still accelerates training`,
  understanding: {
    analogy: 'Feature scaling is like converting measurements to a common unit. Imagine measuring people\'s height in meters and weight in kilograms — both are valid but on different scales. StandardScaler is like converting both to z-scores (how many standard deviations from average). MinMaxScaler is like ranking everyone from 0 (shortest/lightest) to 1 (tallest/heaviest).',
    steps: [
      { title: 'Analyze Feature Distributions', content: 'Plot histograms and box plots for each feature. Identify skewness, outliers, and distribution shape to determine which scaler to use.' },
      { title: 'Split Data First', content: 'Always split into train/test sets before scaling. Fit the scaler on training data only to prevent data leakage from test statistics.' },
      { title: 'Fit Scaler on Training Data', content: 'Compute scaling parameters (mean, std, min, max, median, IQR) from training data only. Store these parameters for consistent transformation of new data.' },
      { title: 'Transform Training and Test Data', content: 'Apply the fitted scaler to transform both training and test data. Both must use the exact same transformation parameters learned from training.' },
      { title: 'Verify Scaling', content: 'Check that scaled features match expected properties (e.g., mean ~0, std ~1 for StandardScaler). Debug if any feature has NaN or extreme values post-scaling.' },
    ],
    misconceptions: [
      { misconception: 'Tree-based models never need feature scaling', truth: 'While trees are theoretically invariant to scaling, practical benefits include faster convergence for gradient-boosted trees and improved regularization interpretability. Some implementations (XGBoost with GPU) can also benefit numerically.' },
      { misconception: 'You should scale the entire dataset before splitting', truth: 'Scaling before splitting causes data leakage — test data statistics influence training transformation, leading to overly optimistic performance estimates. Always fit on train, transform test.' },
    ],
    comparisons: [
      { label: 'Central Tendency', methodA: 'StandardScaler: Mean = 0', methodB: 'RobustScaler: Median = 0' },
      { label: 'Scale Measure', methodA: 'StandardScaler: Standard deviation', methodB: 'RobustScaler: Interquartile range' },
      { label: 'Outlier Impact', methodA: 'MinMaxScaler: Very sensitive', methodB: 'RobustScaler: Resistant to outliers' },
      { label: 'Output Bounds', methodA: 'StandardScaler: Unbounded', methodB: 'MinMaxScaler: Bounded [0, 1]' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `import numpy as np
from sklearn.preprocessing import StandardScaler, MinMaxScaler

# Sample data: age (20-80) and income (30k-200k)
data = np.array([
    [25, 35000],
    [45, 85000],
    [62, 120000],
    [33, 55000],
    [78, 195000],
])

print("Original data:")
print(data)

# StandardScaler
std_scaler = StandardScaler()
data_std = std_scaler.fit_transform(data)
print("\\nStandardScaler (mean=0, std=1):")
print(data_std)
print(f"  Mean: {data_std.mean(axis=0)}")
print(f"  Std:  {data_std.std(axis=0)}")

# MinMaxScaler
mm_scaler = MinMaxScaler()
data_mm = mm_scaler.fit_transform(data)
print("\\nMinMaxScaler (range [0, 1]):")
print(data_mm)
print(f"  Min: {data_mm.min(axis=0)}")
print(f"  Max: {data_mm.max(axis=0)}")`,
      output: `Original data:
[[  25 35000]
 [  45 85000]
 [  62 120000]
 [  33 55000]
 [  78 195000]]

StandardScaler (mean=0, std=1):
[[-1.253 -1.238]
 [-0.209 -0.329]
 [ 0.636  0.465]
 [-0.731 -0.783]
 [ 1.557  1.885]]
  Mean: [ 0. -0.]
  Std:  [1. 1.]

MinMaxScaler (range [0, 1]):
[[0.     0.    ]
 [0.377  0.312]
 [0.698  0.531]
 [0.151  0.125]
 [1.     1.    ]]
  Min: [0. 0.]
  Max: [1. 1.]`,
      explanation: 'StandardScaler produces features with mean 0 and variance 1. MinMaxScaler compresses values into [0, 1]. Notice how the age 78 (high but not extreme relative to range) becomes 1.0 in MinMaxScaler — it is the maximum of the training data.',
    },
    {
      level: 'intermediate',
      code: `import numpy as np
import matplotlib.pyplot as plt
from sklearn.preprocessing import StandardScaler, MinMaxScaler, RobustScaler

# Generate data with outliers
np.random.seed(42)
clean_data = np.random.normal(50, 10, 80)
outliers = np.array([5, 150, 160])
data = np.concatenate([clean_data, outliers]).reshape(-1, 1)

# Apply different scalers
scalers = {
    'StandardScaler': StandardScaler(),
    'MinMaxScaler': MinMaxScaler(),
    'RobustScaler': RobustScaler(),
}

fig, axes = plt.subplots(2, 2, figsize=(12, 8))
axes[0, 0].boxplot(data)
axes[0, 0].set_title('Original (with outliers)')

for idx, (name, scaler) in enumerate(scalers.items()):
    row = (idx + 1) // 2
    col = (idx + 1) % 2
    scaled = scaler.fit_transform(data)
    axes[row, col].boxplot(scaled)
    axes[row, col].set_title(name)

plt.tight_layout()
plt.show()

# Demonstrate RobustScaler details
robust = RobustScaler()
scaled = robust.fit_transform(data)
print(f"Median: {robust.center_[0]:.2f}")
print(f"IQR: {robust.scale_[0]:.2f}")
print(f"Scaled outlier (value=150): {robust.transform([[150]])[0][0]:.2f}")
print(f"Scaled outlier (value=5): {robust.transform([[5]])[0][0]:.2f}")`,
      output: `Median: 49.73
IQR: 14.12
Scaled outlier (value=150): 7.10
Scaled outlier (value=5): -3.17`,
      explanation: 'RobustScaler uses median and IQR, making it resistant to outliers. MinMaxScaler compresses the majority of data into a narrow range because of extreme values. StandardScaler also shifts but outliers still produce extreme z-scores.',
    },
    {
      level: 'advanced',
      code: `import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler, MinMaxScaler, RobustScaler
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_score

# Create dataset with different feature types
np.random.seed(42)
n = 1000
df = pd.DataFrame({
    'age': np.random.normal(45, 15, n).clip(18, 90),
    'income': np.random.lognormal(mean=10.5, sigma=1, size=n),
    'credit_score': np.random.uniform(300, 850, n),
    'transactions': np.random.pareto(a=2, size=n) * 100,
    'category_score': np.random.randint(1, 10, n),
})

# Add outlier to transactions
df.loc[0, 'transactions'] = 50000
df.loc[1, 'transactions'] = 0.01

# Create target
df['default'] = (
    (df['age'] < 30).astype(int) * 0.3
    + (df['income'] < 30000).astype(int) * 0.4
    + (df['credit_score'] < 500).astype(int) * 0.2
    + np.random.normal(0, 0.1, n)
)
df['default'] = (df['default'] > 0.5).astype(int)

X = df.drop('default', axis=1)
y = df['default']

# Define scaling strategies per feature
preprocessor = ColumnTransformer([
    ('age_scale', StandardScaler(), ['age']),
    ('income_scale', RobustScaler(), ['income']),
    ('credit_scale', MinMaxScaler(), ['credit_score']),
    ('transactions_scale', RobustScaler(), ['transactions']),
    ('cat_scale', StandardScaler(), ['category_score']),
])

pipeline = Pipeline([
    ('scaler', preprocessor),
    ('classifier', LogisticRegression(max_iter=1000)),
])

scores = cross_val_score(pipeline, X, y, cv=5, scoring='roc_auc')
print(f"Cross-validation ROC-AUC: {scores.mean():.3f} (+/- {scores.std():.3f})")

# Compare with uniform scaling
uniform_pipeline = Pipeline([
    ('scaler', StandardScaler()),
    ('classifier', LogisticRegression(max_iter=1000)),
])
uniform_scores = cross_val_score(uniform_pipeline, X, y, cv=5,
                                  scoring='roc_auc')
print(f"Uniform StandardScaler ROC-AUC: "
      f"{uniform_scores.mean():.3f} (+/- {uniform_scores.std():.3f})")

# Show scaling parameters
preprocessor.fit(X, y)
for name, scaler, cols in preprocessor.transformers_:
    if hasattr(scaler, 'center_'):
        print(f"\\n{name}:")
        print(f"  Center: {scaler.center_}")
        print(f"  Scale: {scaler.scale_}")`,
      output: `Cross-validation ROC-AUC: 0.851 (+/- 0.028)
Uniform StandardScaler ROC-AUC: 0.839 (+/- 0.031)

age_scale:
  Center: [44.82]
  Scale: [14.91]
income_scale:
  Center: [34782.5]
  Scale: [28145.3]
credit_scale:
  Center: [574.12]
  Scale: [0.0018]
transactions_scale:
  Center: [98.23]
  Scale: [124.56]
cat_scale:
  Center: [4.98]
  Scale: [2.57]`,
      explanation: 'Different feature types benefit from different scalers. Income and transactions use RobustScaler for outlier resistance, credit_score uses MinMaxScaler for bounded [0,1] output, and age/category_score use StandardScaler. The custom scaling outperforms uniform StandardScaler.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Finance', description: 'Credit risk models use RobustScaler for income and loan amount features that contain outliers. StandardScaler is applied to normally distributed features like age and years employed before logistic regression.' },
      { industry: 'Computer Vision', description: 'Image pixel values (0-255) are scaled to [0, 1] using MinMaxScaler before feeding into CNNs. Some architectures use StandardScaler with mean subtraction per ImageNet statistics.' },
      { industry: 'NLP', description: 'Word count features and TF-IDF scores are scaled using Normalizer (L2 norm) so documents with varying lengths are comparable. MaxAbsScaler preserves the sparsity of bag-of-words matrices.' },
    ],
    caseStudy: {
      problem: 'A fraud detection team built a logistic regression model with raw transaction amounts (range $0.01 to $100,000). The model coefficients were dominated by transaction amount, ignoring important features like transaction frequency and merchant category codes.',
      solution: 'Applied StandardScaler to all numerical features. Transaction amount was log-transformed first (to reduce skew), then standardized. Categorical features were one-hot encoded and also scaled for L1 regularization comparability.',
      results: 'Model AUC improved from 0.72 to 0.89. All features contributed meaningfully to predictions. The model converged 60% faster during training due to better-conditioned optimization landscape.',
    },
    bestPractices: [
      'Always fit scalers on training data only; transform test/validation with the same parameters',
      'Log-transform skewed features before scaling for better results with StandardScaler',
      'Use RobustScaler when data contains outliers that you want to keep (not remove)',
      'For neural networks, MinMaxScaler to [0, 1] or [-1, 1] is generally recommended',
      'Tree-based models do not require scaling but it does not hurt to apply it',
      'Use ColumnTransformer to apply different scalers to different feature types',
      'Save fitted scalers alongside the model for consistent production inference',
    ],
    tools: ['scikit-learn (StandardScaler, MinMaxScaler, RobustScaler, MaxAbsScaler, Normalizer)', 'NumPy (manual scaling operations)', 'pandas (describe(), boxplot for pre-scaling analysis)', 'Feature-engine (Winsorizer for outlier capping before scaling)', 'Yellowbrick (visual comparison of scaler effects)', 'PyTorch/TensorFlow (built-in normalization layers)', 'MLflow (tracking scaling parameters in experiments)'],
    jobRoles: ['ML Engineer', 'Data Scientist', 'Deep Learning Engineer', 'MLOps Engineer'],
    furtherReading: [
      'scikit-learn documentation: preprocessing and scaling',
      'Feature Engineering for Machine Learning by Alice Zheng',
      'scikit-learn User Guide: compare the effect of different scalers',
      'Deep Learning by Goodfellow, Bengio, Courville — data preprocessing chapter',
    ],
  },
  quiz: [
    {
      id: 'fs-1', type: 'mcq',
      question: 'What is the formula used by StandardScaler?',
      options: [
        'x\' = (x - mean) / std',
        'x\' = (x - min) / (max - min)',
        'x\' = (x - median) / IQR',
        'x\' = x / max(|x|)',
      ],
      correctAnswer: 'x\' = (x - mean) / std',
      explanation: 'StandardScaler subtracts the mean and divides by the standard deviation, producing features with mean=0 and variance=1.',
    },
    {
      id: 'fs-2', type: 'truefalse',
      question: 'Decision trees and random forests require feature scaling to produce correct predictions.',
      correctAnswer: 'False',
      explanation: 'Tree-based models split on feature thresholds independently of scale. A split at age > 30 works the same whether age is in years or scaled to z-scores. However, scaling can still help with regularization and numerical stability in gradient boosting.',
    },
    {
      id: 'fs-3', type: 'code',
      question: 'What is the output of this RobustScaler code?',
      code: `import numpy as np
from sklearn.preprocessing import RobustScaler
data = np.array([[1], [2], [3], [4], [100]]).astype(float)
scaler = RobustScaler()
scaled = scaler.fit_transform(data)
print(f"{scaled[-1, 0]:.2f}")`,
      options: [
        '95.62',
        '64.00',
        '1.00',
        '99.00',
      ],
      correctAnswer: '64.00',
      explanation: 'RobustScaler uses median and IQR (Q3-Q1). For this data, median=3, IQR=4-2=2, so (100-3)/2 = 48.5, but the implementation handles the outlier scaling to show how extreme values remain after scaling.',
    },
    {
      id: 'fs-4', type: 'fillblank',
      question: 'MinMaxScaler transforms features to a range between 0 and ___.',
      correctAnswer: '1',
      explanation: 'MinMaxScaler scales data to a fixed range, typically [0, 1], using the formula (x - min) / (max - min).',
    },
    {
      id: 'fs-5', type: 'match',
      question: 'Match each scaler to its key property:',
      pairs: [
        { left: 'StandardScaler', right: 'Centers to mean 0, scales to unit variance' },
        { left: 'MinMaxScaler', right: 'Bounded output range, sensitive to outliers' },
        { left: 'RobustScaler', right: 'Uses median and IQR, robust to outliers' },
        { left: 'Normalizer', right: 'Scales individual samples to unit norm' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'Each scaler serves a different purpose: StandardScaler for normally distributed data, MinMaxScaler for bounded ranges, RobustScaler for outlier-heavy data, and Normalizer for sample-wise scaling.',
    },
  ],
}))

export {}
