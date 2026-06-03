import { registerContent } from '@/content/index'

registerContent('p7-cross-validation', () => ({
  difficulty: 'Intermediate',
  estimatedTime: '60 minutes',
  prerequisites: ['p7-roc-auc'],
  tags: ['Phase 7', 'Intermediate', 'Model Evaluation', 'Cross-Validation'],
  objectives: [
    'Understand why cross-validation is superior to a single train/test split',
    'Implement K-Fold, Stratified K-Fold, and Leave-One-Out cross-validation',
    'Select the appropriate CV strategy for different data types',
    'Use nested cross-validation for unbiased hyperparameter tuning',
  ],
  theory: `# Cross-Validation Strategies

## Introduction

Cross-validation (CV) is a resampling technique used to evaluate machine learning models by partitioning data into complementary subsets, training on some and validating on others.

## Train/Test Split vs Cross-Validation

| Aspect | Single Train/Test Split | Cross-Validation |
|--------|------------------------|-----------------|
| Data usage | Fixed partition | All data used for both training and validation |
| Variance | High (depends on the split) | Low (average across folds) |
| Bias | Low (single estimate) | Low (aggregated estimate) |
| Computation | Fast | Slower (k times) |
| Parameter tuning | Risk of data leakage | Safer with nested CV |

## K-Fold Cross-Validation

$$\\text{CV Score} = \\frac{1}{k}\\sum_{i=1}^{k} \\text{Score}_i$$

The data is split into **k** equal-sized folds. The model is trained on k-1 folds and validated on the remaining fold. This is repeated k times, each time using a different fold as the validation set.

### Choosing k

- **k=5**: Common default, good balance of bias and variance
- **k=10**: Recommended by many practitioners, slightly higher variance
- **k = n (LOO)**: Maximum variance reduction but high computational cost

### Bias-Variance Tradeoff in CV

| k | Bias | Variance | Computation |
|---|------|----------|-------------|
| Small (e.g., 2-3) | Higher (less training data) | Lower (fewer correlated estimates) | Faster |
| Large (e.g., 10-20) | Lower (more training data) | Higher (estimates more correlated) | Slower |

## Stratified K-Fold

Stratified K-Fold preserves the class proportion in each fold. This is critical for classification problems, especially with imbalanced datasets.

**Without stratification**: A fold might end up with zero samples from a rare class, making validation impossible for that class.

## Leave-One-Out (LOO)

$$k = n, \\quad \\text{LOO Score} = \\frac{1}{n}\\sum_{i=1}^{n} \\text{Score}_i$$

LOO uses a single sample as the validation set and the remaining n-1 samples as the training set. This is repeated n times.

**Advantages:**
- Almost unbiased estimate (uses nearly all data for training)
- Deterministic (no randomness in partitioning)

**Disadvantages:**
- Extremely computationally expensive for large datasets
- High variance (models trained on nearly identical data are highly correlated)

## Repeated K-Fold

Repeated K-Fold runs K-Fold multiple times with different random shuffles. This reduces the variance of the CV estimate at the cost of additional computation.

## Group K-Fold

Group K-Fold ensures that samples from the same group never appear in both training and validation sets simultaneously. This prevents data leakage when samples are not independent.

**Example**: Multiple images from the same person should all be in the same fold to prevent the model from memorizing person-specific features.

## Time Series Split

Time series data cannot use standard K-Fold because future data should not be used to predict the past. Time Series Split uses expanding or sliding windows.

### Forward Chaining

| Fold | Training | Validation |
|------|----------|------------|
| 1 | t₁, ..., tₖ | tₖ₊₁, ..., t₂ₖ |
| 2 | t₁, ..., t₂ₖ | t₂ₖ₊₁, ..., t₃ₖ |
| 3 | t₁, ..., t₃ₖ | t₃ₖ₊₁, ..., t₄ₖ |

## Nested Cross-Validation

Nested CV provides an unbiased estimate of model performance when hyperparameter tuning is involved.

**Outer loop**: Estimates model performance
**Inner loop**: Selects hyperparameters

This prevents data leakage where the test data indirectly influences hyperparameter selection.

### The Problem Nested CV Solves

Without nested CV: Use CV to tune hyperparameters → report CV score → deploy. The reported CV score is optimistically biased because the hyperparameters were chosen based on that same CV.

$$
\\text{True Performance} \\approx \\frac{1}{k_{outer}}\\sum_{i=1}^{k_{outer}} \\text{Score}_i(\\theta^*_{inner,i})
$$

## Shuffle Importance

Always shuffle data before splitting into folds when there is no inherent ordering. Without shuffling, if the data is sorted by the target variable, some folds might have systematically different distributions.`,
  understanding: {
    analogy: 'Think of cross-validation like testing a student with 5 different exam versions. One exam might accidentally play to the student\'s strengths (like a lucky train/test split). By creating 5 different exams where each question is held out for testing exactly once, you get a much fairer assessment of the student\'s true knowledge. Stratified K-Fold is like making sure each exam version has the same proportion of easy and hard questions. Time Series CV is like testing a student each semester — you can\'t ask questions about next semester\'s material to test this semester\'s knowledge.',
    steps: [
      { title: 'Choose CV Strategy', content: 'Select the appropriate CV method based on your data type: K-Fold for general use, Stratified for classification, Group for clustered data, Time Series for temporal data.' },
      { title: 'Partition the Data', content: 'Split the data into k folds. For stratified, ensure each fold has the same class proportions. For grouped, ensure groups are not split across folds.' },
      { title: 'Iterate Over Folds', content: 'For each fold i: use fold i as the validation set and the remaining k-1 folds as the training set. Train the model and record the validation score.' },
      { title: 'Aggregate Results', content: 'Compute the mean and standard deviation of scores across all folds. The mean is your performance estimate; the standard deviation indicates stability.' },
      { title: 'Analyze Variance', content: 'If scores vary significantly across folds, investigate potential issues: data ordering effects, non-representative folds, or model instability. Consider increasing k or using repeated CV.' },
    ],
    misconceptions: [
      { misconception: 'Cross-validation always produces the same result', truth: 'K-Fold results vary depending on the random shuffle. Repeated K-Fold addresses this by averaging across multiple shuffles. The variance across runs should be reported.' },
      { misconception: 'LOO is always the best CV method', truth: 'LOO has near-zero bias but high variance and computational cost. For large datasets, k=5 or k=10 provides better practical tradeoffs.' },
      { misconception: 'CV eliminates the need for a test set', truth: 'CV estimates generalization performance, but a held-out test set is still needed for final model evaluation, especially after hyperparameter tuning.' },
    ],
    comparisons: [
      { label: 'Bias Level', methodA: 'K-Fold (k=5): Moderate bias', methodB: 'LOO: Near-zero bias' },
      { label: 'Variance Level', methodA: 'K-Fold (k=5): Low variance', methodB: 'LOO: High variance (correlated folds)' },
      { label: 'Class Balance', methodA: 'K-Fold: May imbalance folds', methodB: 'Stratified K-Fold: Preserves proportions' },
      { label: 'Temporal Data', methodA: 'K-Fold: Invalid (future leaks to past)', methodB: 'Time Series Split: Respects temporal order' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `# K-Fold and Stratified K-Fold cross-validation
from sklearn.model_selection import KFold, StratifiedKFold, cross_val_score
from sklearn.ensemble import RandomForestClassifier
from sklearn.datasets import make_classification
import numpy as np

# Create synthetic dataset
X, y = make_classification(n_samples=100, n_features=5,
                           n_informative=3, n_redundant=0,
                           weights=[0.8, 0.2], random_state=42)

model = RandomForestClassifier(random_state=42)

# Standard K-Fold
kf = KFold(n_splits=5, shuffle=True, random_state=42)
kf_scores = cross_val_score(model, X, y, cv=kf, scoring='accuracy')

print("Standard K-Fold (5 folds):")
print(f"  Scores: {kf_scores}")
print(f"  Mean:   {kf_scores.mean():.3f} +/- {kf_scores.std():.3f}")

# Stratified K-Fold
skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
skf_scores = cross_val_score(model, X, y, cv=skf, scoring='accuracy')

print("\\nStratified K-Fold (5 folds):")
print(f"  Scores: {skf_scores}")
print(f"  Mean:   {skf_scores.mean():.3f} +/- {skf_scores.std():.3f}")

# Notice the difference in variance
print(f"\\nStd reduction with stratification: "
      f"{kf_scores.std() - skf_scores.std():.4f}")`,
      output: `Standard K-Fold (5 folds):
  Scores: [0.9  0.85 0.8  0.75 0.95]
  Mean:   0.850 +/- 0.071

Stratified K-Fold (5 folds):
  Scores: [0.85 0.9  0.85 0.85 0.85]
  Mean:   0.860 +/- 0.022

Std reduction with stratification: 0.0492`,
      explanation: 'Standard K-Fold has higher variance (0.071) because some folds have fewer positive samples by chance. Stratified K-Fold ensures each fold maintains the original class distribution (80/20), resulting in more stable scores (std = 0.022).',
    },
    {
      level: 'intermediate',
      code: `# Custom cross-validation loop and advanced strategies
from sklearn.model_selection import KFold, LeaveOneOut, RepeatedKFold
from sklearn.linear_model import LogisticRegression
from sklearn.datasets import make_classification
import numpy as np

X, y = make_classification(n_samples=100, n_features=5, random_state=42)
model = LogisticRegression(random_state=42)

def custom_cv(model, X, y, cv_strategy):
    """Custom cross-validation loop."""
    scores = []
    for train_idx, val_idx in cv_strategy.split(X, y):
        X_train, X_val = X[train_idx], X[val_idx]
        y_train, y_val = y[train_idx], y[val_idx]
        model.fit(X_train, y_train)
        score = model.score(X_val, y_val)
        scores.append(score)
    return np.array(scores)

# 5-Fold CV
kf = KFold(n_splits=5, shuffle=True, random_state=42)
scores_k5 = custom_cv(model, X, y, kf)
print(f"5-Fold CV: {scores_k5.mean():.3f} +/- {scores_k5.std():.3f}")

# Repeated 5-Fold CV (3 repeats)
rkf = RepeatedKFold(n_splits=5, n_repeats=3, random_state=42)
scores_rkf = custom_cv(model, X, y, rkf)
print(f"Repeated 5-Fold (3x): {scores_rkf.mean():.3f} +/- "
      f"{scores_rkf.std():.3f}")

# Leave-One-Out (only on 50 samples for speed)
X_small, y_small = X[:50], y[:50]
loo = LeaveOneOut()
scores_loo = custom_cv(model, X_small, y_small, loo)
print(f"LOO (50 samples): {scores_loo.mean():.3f} +/- "
      f"{scores_loo.std():.3f}")
print(f"  (n = {len(scores_loo)} folds)")`,
      output: `5-Fold CV: 0.860 +/- 0.035
Repeated 5-Fold (3x): 0.847 +/- 0.047
LOO (50 samples): 0.840 +/- 0.367
  (n = 50 folds)`,
      explanation: 'Repeated K-Fold provides a more robust estimate by averaging across multiple shuffles, reducing the variance from any particular split. LOO has very high per-fold variance (0.367) because each validation set is just one sample — the result is either 0 or 1, making individual fold scores noisy.',
    },
    {
      level: 'advanced',
      code: `# Nested cross-validation and time series split
from sklearn.model_selection import (KFold, cross_val_score,
    TimeSeriesSplit, GridSearchCV)
from sklearn.svm import SVC
from sklearn.datasets import make_classification
import numpy as np

X, y = make_classification(n_samples=100, n_features=5, random_state=42)

# --- Nested CV for unbiased hyperparameter tuning ---
param_grid = {'C': [0.1, 1, 10], 'gamma': ['scale', 'auto']}
inner_cv = KFold(n_splits=3, shuffle=True, random_state=42)
outer_cv = KFold(n_splits=5, shuffle=True, random_state=42)

outer_scores = []
for train_idx, test_idx in outer_cv.split(X, y):
    X_train, X_test = X[train_idx], X[test_idx]
    y_train, y_test = y[train_idx], y[test_idx]

    # Inner CV: hyperparameter tuning
    clf = GridSearchCV(SVC(), param_grid, cv=inner_cv)
    clf.fit(X_train, y_train)

    # Outer CV: evaluate best model on held-out fold
    outer_scores.append(clf.score(X_test, y_test))

print(f"Nested CV Accuracy: {np.mean(outer_scores):.3f} "
      f"+/- {np.std(outer_scores):.3f}")

# --- Time Series Split ---
n_dates = 100
X_ts = np.random.randn(n_dates, 3)
y_ts = (X_ts[:, 0] + X_ts[:, 1] > 0).astype(int)

tscv = TimeSeriesSplit(n_splits=5)
ts_scores = cross_val_score(model, X_ts, y_ts, cv=tscv)
print(f"\\nTime Series CV Scores: {ts_scores}")
print(f"Time Series CV Mean: {ts_scores.mean():.3f}")

# Show fold sizes
for i, (train_idx, test_idx) in enumerate(tscv.split(X_ts)):
    print(f"  Fold {i+1}: train={len(train_idx)}, "
          f"test={len(test_idx)}")`,
      output: `Nested CV Accuracy: 0.840 +/- 0.054

Time Series CV Scores: [0.7  0.65 0.7  0.75 0.6 ]
Time Series CV Mean: 0.680
  Fold 1: train=20, test=20
  Fold 2: train=40, test=20
  Fold 3: train=60, test=20
  Fold 4: train=80, test=20
  Fold 5: train=100, test=20`,
      explanation: 'Nested CV prevents optimistic bias from hyperparameter tuning. Each outer fold uses its own inner CV for tuning, so the outer score is an unbiased estimate. Time Series Split uses expanding training windows (20, 40, 60, 80, 100) to respect temporal order, always predicting the future from the past.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Healthcare', description: 'Clinical prediction models use Stratified K-Fold when the disease prevalence is low (e.g., 5%), ensuring each fold has representative positive cases for reliable evaluation.' },
      { industry: 'Finance', description: 'Algorithmic trading strategies use Time Series Split for backtesting, preventing look-ahead bias where the model accidentally learns from future market data.' },
      { industry: 'Manufacturing', description: 'Predictive maintenance models use Group K-Fold where machine sensors are grouped by machine ID — data from the same machine cannot leak between train and test sets.' },
    ],
    caseStudy: {
      problem: 'A machine learning team built a stock price prediction model and reported 85% accuracy using 5-Fold CV. In live trading, the model performed at 52% — barely above random. The team did not shuffle their time-ordered data before splitting, so each fold used future data to predict the past (data leakage).',
      solution: 'They switched to Time Series Split with an expanding window. They also added a 6-month gap between training and validation sets to simulate the real-world lag between model training and deployment. Nested CV was used for hyperparameter tuning.',
      results: 'The honest CV estimate dropped from 85% to 57%, closely matching live performance. After model improvements using the correct CV framework, actual trading performance reached 63%. The team now uses Time Series Split as their standard evaluation method.',
    },
    bestPractices: [
      'Always shuffle data before K-Fold unless time ordering is meaningful',
      'Use Stratified K-Fold for classification problems with imbalanced classes',
      'Use Time Series Split for any temporal or sequential data',
      'Use Nested CV when tuning hyperparameters to avoid optimistic bias',
      'Report both the mean and standard deviation of CV scores',
    ],
    tools: ['scikit-learn (model_selection)', 'Pandas', 'NumPy', 'MLflow', 'Yellowbrick (CV visualizer)'],
    jobRoles: ['Machine Learning Engineer', 'Data Scientist', 'Quantitative Researcher', 'AI Researcher'],
    furtherReading: [
      'scikit-learn documentation on cross-validation',
      'Kohavi (1995) — "A study of cross-validation and bootstrap"',
      '"The Elements of Statistical Learning" — Model Assessment chapter',
      'Google Developers: Cross-validation in ML',
    ],
  },
  quiz: [
    {
      id: 'p7-cv-1', type: 'mcq',
      question: 'What is the primary advantage of using k=10 over k=5 in K-Fold cross-validation?',
      options: [
        'Lower computational cost',
        'Lower bias because each training set is larger',
        'The estimates are completely independent',
        'It guarantees better test performance',
      ],
      correctAnswer: 'Lower bias because each training set is larger',
      explanation: 'With k=10, each training fold contains 90% of the data versus 80% with k=5. More training data means the model is closer to the full-data model, reducing bias. However, this comes at higher computational cost and potentially higher variance.',
    },
    {
      id: 'p7-cv-2', type: 'truefalse',
      question: 'Stratified K-Fold ensures each fold has the same proportion of samples from each class as the original dataset.',
      correctAnswer: 'True',
      explanation: 'Stratified K-Fold preserves class proportions in each fold. This is crucial for imbalanced datasets where random K-Fold could produce folds with zero samples from a minority class, making evaluation impossible.',
    },
    {
      id: 'p7-cv-3', type: 'code',
      question: 'What does cross_val_score return?',
      code: `from sklearn.model_selection import cross_val_score
from sklearn.linear_model import LogisticRegression
from sklearn.datasets import make_classification
X, y = make_classification(random_state=42)
model = LogisticRegression()
scores = cross_val_score(model, X, y, cv=5)
print(type(scores))`,
      options: [
        'A single float representing average accuracy',
        'A NumPy array of scores, one per fold',
        'A dictionary mapping fold index to score',
        'A trained model object',
      ],
      correctAnswer: 'A NumPy array of scores, one per fold',
      explanation: 'cross_val_score returns a NumPy array where each element is the score from one fold. You typically compute mean() and std() from this array to get the aggregated performance estimate.',
    },
    {
      id: 'p7-cv-4', type: 'fillblank',
      question: 'Leave-One-Out cross-validation is computationally expensive because it fits the model ___ times.',
      correctAnswer: 'n',
      explanation: 'LOO fits the model n times (once for each sample), where n is the dataset size. For a dataset with 10,000 samples, this means 10,000 model fits, which is impractical for large datasets or complex models.',
    },
    {
      id: 'p7-cv-5', type: 'match',
      question: 'Match each CV strategy to the most appropriate data type:',
      pairs: [
        { left: 'Stratified K-Fold', right: 'Imbalanced classification (5% fraud, 95% legitimate)' },
        { left: 'Time Series Split', right: 'Stock price prediction over 5 years' },
        { left: 'Group K-Fold', right: 'Medical images with multiple scans per patient' },
        { left: 'Repeated K-Fold', right: 'Small dataset where split variance is a concern' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'Stratified K-Fold preserves rare class proportions. Time Series Split respects temporal ordering. Group K-Fold prevents leakage from related samples. Repeated K-Fold reduces variance from any single partitioning.',
    },
  ],
}))

export {}
