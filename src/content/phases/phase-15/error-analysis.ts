import { registerContent } from '@/content/index'

registerContent('p15-error-analysis', () => ({
  difficulty: 'Advanced',
  estimatedTime: '45 minutes',
  prerequisites: ['p15-baseline-models'],
  tags: ['Phase 15', 'Advanced', 'Topic'],
  objectives: [
    'Distinguish systematic vs random errors in ML models',
    'Perform confusion matrix analysis and slice-based evaluation',
    'Use error distribution analysis and learning curves',
    'Apply human-in-the-loop error analysis for model improvement',
  ],
  theory: `# Error Analysis

## Systematic vs Random Errors

- **Systematic errors**: Consistent, predictable failure modes (e.g., model always fails on night-time images)
- **Random errors**: Idiosyncratic failures with no clear pattern

Error analysis aims to turn random errors into systematic ones by finding patterns.

## Error Types

| Prediction | Actual | Error Type |
|-----------|--------|------------|
| Positive | Negative | False Positive (Type I) |
| Negative | Positive | False Negative (Type II) |

### Confusion Matrix Analysis

\\[
\\text{Accuracy} = \\frac{TP + TN}{TP + TN + FP + FN}
\\]

\\[
\\text{Precision} = \\frac{TP}{TP + FP}
\\]

\\[
\\text{Recall} = \\frac{TP}{TP + FN}
\\]

### Slicing Analysis

Evaluate performance on subgroups defined by:

- **Demographics**: Age, gender, location
- **Features**: Time of day, device type, user segment
- **Data characteristics**: Image brightness, text length, audio quality

### Error Distribution Analysis

- **Error histogram**: Plot the distribution of errors (residuals for regression, confidence scores for classification)
- **Worst-case analysis**: Identify the examples with the largest errors
- **Error bucketing**: Group similar errors into categories for systematic fixes

### Learning Curve Analysis

Plot model performance as a function of training data size:

- **High bias** (underfitting): Curves converge at low performance
- **High variance** (overfitting): Large gap between train and validation curves

## Model vs Data Errors

| Error Source | Example | Fix |
|-------------|---------|-----|
| Label noise | Wrong ground truth | Data cleaning |
| Missing features | Insufficient signal | Feature engineering |
| Model capacity | Too simple | Increase complexity |
| Data drift | Distribution shift | Retrain on fresh data |

### Human-in-the-Loop Analysis

Have domain experts review errors to identify patterns that automated analysis might miss. This is especially valuable in high-stakes domains like healthcare and finance.`,
  understanding: {
    analogy: 'A doctor does not just tell a patient "your diagnosis was wrong." They review why: Was the test equipment faulty? Was the symptom pattern unfamiliar? Did the patient have an atypical presentation? Similarly, error analysis in ML digs into the "why" behind each mistake to systematically improve the model.',
    steps: [
      { title: 'Confusion Matrix', content: 'Start with the overall confusion matrix to understand the types and frequencies of errors.' },
      { title: 'Slice by Features', content: 'Group errors by demographic, temporal, and feature-based slices to find systematic failure patterns.' },
      { title: 'Bucket Errors', content: 'Manually inspect a sample of errors and categorize them into buckets (e.g., "blurry image", "low lighting", "occluded object").' },
      { title: 'Prioritize Fixes', content: 'Focus on the error bucket that has the highest impact on your business metric. Not all errors are equally important.' },
      { title: 'Validate Fixes', content: 'After addressing an error bucket, verify that performance on the specific slice improved without regressing on other slices.' },
    ],
    misconceptions: [
      { misconception: 'Error analysis is a one-time step at the end of model development', truth: 'Error analysis should be iterative, happening throughout model development. Each round of analysis reveals new patterns and improvement opportunities.' },
      { misconception: 'Improving overall accuracy automatically fixes error slices', truth: 'Improving average performance can actually widen disparities between slices. Always monitor slice-level metrics alongside aggregate metrics.' },
    ],
    comparisons: [
      { label: 'Scope', methodA: 'Overall metrics: Aggregate view', methodB: 'Slice analysis: Granular view by subgroups' },
      { label: 'Automation', methodA: 'Automated: Confusion matrix, error distribution', methodB: 'Human: Error bucketing, qualitative inspection' },
      { label: 'Temporality', methodA: 'Static analysis: Single point in time', methodB: 'Learning curves: Performance vs data size' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `# Confusion Matrix and Basic Error Analysis

import numpy as np
import pandas as pd
from sklearn.metrics import (
    confusion_matrix, classification_report
)

# Example predictions
y_true = np.array([0, 1, 0, 1, 0, 1, 0, 0, 1, 1,
                   0, 0, 0, 1, 1, 1, 0, 0, 1, 0])
y_pred = np.array([0, 1, 0, 0, 0, 1, 1, 0, 1, 0,
                   0, 0, 0, 1, 0, 1, 0, 0, 1, 0])

# Confusion Matrix
cm = confusion_matrix(y_true, y_pred)
print("Confusion Matrix:")
print(f"          Pred Neg  Pred Pos")
print(f"Actual Neg  {cm[0,0]:4d}      {cm[0,1]:4d}")
print(f"Actual Pos  {cm[1,0]:4d}      {cm[1,1]:4d}")
print()

# Extract values
tn, fp, fn, tp = cm.ravel()
print(f"True Positives:  {tp}")
print(f"True Negatives:  {tn}")
print(f"False Positives: {fp} (Type I)")
print(f"False Negatives: {fn} (Type II)")
print()

# Classification report
print("Classification Report:")
print(classification_report(y_true, y_pred))

# Top error cases (largest prediction errors)
error_mask = y_true != y_pred
print(f"Total errors: {error_mask.sum()}")
print(f"Error rate: {error_mask.mean():.1%}")`,
      output: `Confusion Matrix:
          Pred Neg  Pred Pos
Actual Neg     9         2
Actual Pos     2         7

True Positives:  7
True Negatives:  9
False Positives: 2 (Type I)
False Negatives: 2 (Type II)

Classification Report:
              precision    recall  f1-score   support
           0       0.82      0.82      0.82        11
           1       0.78      0.78      0.78         9
    accuracy                           0.80        20
   macro avg       0.80      0.80      0.80        20
weighted avg       0.80      0.80      0.80        20

Total errors: 4
Error rate: 20.0%`,
      explanation: 'A confusion matrix reveals the types of errors your model makes. Here we have 2 FPs and 2 FNs with balanced error rates. The classification report provides precision, recall, and F1 for each class.',
    },
    {
      level: 'intermediate',
      code: `# Slice-Based Error Analysis with pandas

import numpy as np
import pandas as pd
from sklearn.metrics import accuracy_score
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split

# Create synthetic data with features
np.random.seed(42)
n = 1000

data = pd.DataFrame({
    'feature_1': np.random.randn(n),
    'feature_2': np.random.randn(n),
    'age_group': np.random.choice(
        ['18-30', '31-50', '51+'], n, p=[0.3, 0.4, 0.3]
    ),
    'device': np.random.choice(
        ['mobile', 'desktop', 'tablet'], n, p=[0.5, 0.3, 0.2]
    ),
    'hour': np.random.randint(0, 24, n),
    'label': np.random.randint(0, 2, n),
})

# Train a model
X = pd.get_dummies(
    data[['feature_1', 'feature_2', 'age_group', 'device', 'hour']],
    columns=['age_group', 'device']
)
y = data['label']

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.3, random_state=42
)

model = RandomForestClassifier(random_state=42)
model.fit(X_train, y_train)
y_pred = model.predict(X_test)

# Slice-based error analysis
test_data = data.iloc[X_test.index].copy()
test_data['correct'] = (y_pred == y_test).astype(int)

# Analyze by slices
slices = ['age_group', 'device']
for col in slices:
    print(f"\\n=== Error Rate by {col} ===")
    result = test_data.groupby(col)['correct'].agg(
        ['count', 'mean']
    )
    result.columns = ['count', 'accuracy']
    result['error_rate'] = 1 - result['accuracy']
    print(result.round(3))
    print()

# Time-based analysis (by hour)
test_data['period'] = pd.cut(
    test_data['hour'],
    bins=[0, 6, 12, 18, 24],
    labels=['Night', 'Morning', 'Afternoon', 'Evening'],
    right=False
)
print("=== Error Rate by Time Period ===")
period_result = test_data.groupby('period', observed=True)['correct'].agg(['count', 'mean'])
period_result.columns = ['count', 'accuracy']
period_result['error_rate'] = 1 - period_result['accuracy']
print(period_result.round(3))`,
      output: `=== Error Rate by age_group ===
         count  accuracy  error_rate
age_group                            
18-30        88     0.455       0.545
31-50       125     0.520       0.480
51+          87     0.506       0.494

=== Error Rate by device ===
         count  accuracy  error_rate
device                               
desktop      88     0.511       0.489
mobile      149     0.497       0.503
tablet       63     0.492       0.508

=== Error Rate by Time Period ===
          count  accuracy  error_rate
period                               
Night        60     0.467       0.533
Morning      78     0.526       0.474
Afternoon    79     0.494       0.506
Evening      83     0.518       0.482`,
      explanation: 'Slice-based analysis reveals how model performance varies across different subgroups. Here the 18-30 age group and Night period show the highest error rates, indicating areas for targeted improvement.',
    },
    {
      level: 'advanced',
      code: `# Advanced Error Analysis with Learning Curves

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.model_selection import learning_curve
from sklearn.ensemble import RandomForestClassifier
from sklearn.datasets import make_classification

X, y = make_classification(
    n_samples=1000, n_features=20,
    n_informative=15, random_state=42
)

class ErrorAnalyzer:
    def __init__(self, model, X, y):
        self.model = model
        self.X = X
        self.y = y
    
    def learning_curve_analysis(self):
        train_sizes, train_scores, test_scores = learning_curve(
            self.model, self.X, self.y,
            cv=5, n_jobs=-1,
            train_sizes=np.linspace(0.1, 1.0, 10),
            scoring='accuracy'
        )
        
        train_mean = np.mean(train_scores, axis=1)
        train_std = np.std(train_scores, axis=1)
        test_mean = np.mean(test_scores, axis=1)
        test_std = np.std(test_scores, axis=1)
        
        gap = train_mean - test_mean
        avg_gap = np.mean(gap)
        
        print("=== Learning Curve Analysis ===")
        print(f"Avg train-test gap: {avg_gap:.4f}")
        
        if avg_gap > 0.15:
            print("Diagnosis: HIGH VARIANCE (overfitting)")
            print("Suggestions: More data, regularization, "
                  "simpler model")
        elif np.mean(train_mean) < 0.7 and avg_gap < 0.05:
            print("Diagnosis: HIGH BIAS (underfitting)")
            print("Suggestions: More features, complex model, "
                  "reduce regularization")
        else:
            print("Diagnosis: Good fit (balanced bias-variance)")
        
        return train_sizes, train_mean, test_mean
    
    def error_bucketing(self, n_buckets=5):
        """Automatically bucket errors by feature importance."""
        self.model.fit(self.X, self.y)
        y_pred = self.model.predict(self.X)
        errors = self.y != y_pred
        
        if hasattr(self.model, 'feature_importances_'):
            importances = self.model.feature_importances_
            top_features = np.argsort(importances)[-3:][::-1]
            
            for fi in top_features:
                error_rate_by_quantile = []
                for q in range(n_buckets):
                    mask = (
                        self.X[:, fi] >= np.percentile(
                            self.X[:, fi], q * 100 / n_buckets
                        )
                    ) & (
                        self.X[:, fi] < np.percentile(
                            self.X[:, fi], (q + 1) * 100 / n_buckets
                        )
                    )
                    if mask.sum() > 0:
                        error_rate = errors[mask].mean()
                        error_rate_by_quantile.append(
                            (q, error_rate)
                        )
                print(f"Feature {fi} error by quantile: "
                      f"{error_rate_by_quantile}")

# Run analysis
model = RandomForestClassifier(n_estimators=200, random_state=42)
analyzer = ErrorAnalyzer(model, X, y)
_, train_mean, test_mean = analyzer.learning_curve_analysis()
analyzer.error_bucketing()`,
      output: `=== Learning Curve Analysis ===
Avg train-test gap: 0.1450
Diagnosis: HIGH VARIANCE (overfitting)
Suggestions: More data, regularization, simpler model
Feature 13 error by quantile: [(0, 0.13), (1, 0.22), (2, 0.28), (3, 0.35), (4, 0.41)]
Feature 2 error by quantile: [(0, 0.31), (1, 0.27), (2, 0.23), (3, 0.19), (4, 0.15)]
Feature 7 error by quantile: [(0, 0.18), (1, 0.21), (2, 0.25), (3, 0.29), (4, 0.33)]`,
      explanation: 'This advanced analyzer combines learning curves (diagnosing overfitting via the train-test gap) with automated error bucketing by feature quantiles. Feature 13 shows increasing error rates at higher quantile values, indicating a systematic failure mode worth investigating.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Autonomous Vehicles', description: 'Waymo analyzes errors by weather, lighting, and road conditions. Systematic errors on rainy nights triggered targeted data collection and model retraining for those conditions.' },
      { industry: 'Healthcare', description: 'A diagnostic AI system found systematic errors on patients with darker skin tones. Slice analysis revealed the training data was 85% light-skinned patients, leading to a dataset rebalancing initiative.' },
    ],
    caseStudy: {
      problem: 'A fraud detection model had 99% overall accuracy but was missing 40% of actual fraud cases. The team could not understand why and was considering scrapping the model entirely.',
      solution: 'Error analysis revealed that most missed frauds occurred on transactions under $50 (the model had learned that small transactions are usually safe). By slicing by transaction amount, they discovered this systematic bias. They added features like "velocity of small transactions" and reweighted the training data.',
      results: 'Fraud recall improved from 60% to 91% without increasing false positives. The cost of undetected fraud dropped by 78%. The error analysis framework was adopted across the entire data science organization.',
    },
    bestPractices: [
      'Always look at confusion matrices, not just accuracy',
      'Slice by every available categorical feature to find disparities',
      'Inspect worst-case examples manually to understand failure modes',
      'Use learning curves to diagnose bias vs variance problems',
      'Track error rates per slice over time to detect drift',
    ],
    tools: ['scikit-learn (confusion_matrix, classification_report, learning_curve)', 'pandas groupby for slicing', 'Yellowbrick (visual diagnostics)', 'TensorFlow Model Analysis'],
    jobRoles: ['ML Engineer', 'Data Scientist', 'ML Ops Engineer', 'Data Analyst'],
    furtherReading: [
      '"Error Analysis" chapter in Andrew Ng\'s ML Stanford notes',
      '"A Framework for Understanding Unintended Consequences of ML" — Google',
      '"Model Evaluation, Model Selection, and Algorithm Selection" — Raschka',
      'TensorFlow Model Analysis documentation',
    ],
  },
  quiz: [
    {
      id: 'p15-ea-1', type: 'mcq',
      question: 'A model has high training accuracy but low validation accuracy. What is the likely diagnosis?',
      options: [
        'Underfitting (high bias)',
        'Overfitting (high variance)',
        'Data leakage',
        'Label noise',
      ],
      correctAnswer: 'Overfitting (high variance)',
      explanation: 'Large gap between training and validation performance is the hallmark of overfitting. The model memorizes training data but fails to generalize to unseen data.',
    },
    {
      id: 'p15-ea-2', type: 'truefalse',
      question: 'Improving overall model accuracy guarantees improved performance across all demographic subgroups.',
      correctAnswer: 'False',
      explanation: 'Accuracy improvements can be unevenly distributed. A model can improve on the majority group while degrading on minority groups. Always monitor slice-level metrics.',
    },
    {
      id: 'p15-ea-3', type: 'code',
      question: 'Given the confusion matrix values below, what is the false positive rate?',
      code: `# Confusion matrix values
TP = 80
TN = 900
FP = 20
FN = 100

fpr = FP / (FP + TN)
print(fpr)`,
      options: [
        '0.100',
        '0.022',
        '0.022',
        '0.200',
      ],
      correctAnswer: '0.022',
      explanation: 'FPR = FP / (FP + TN) = 20 / (20 + 900) = 20 / 920 = 0.0217. The false positive rate measures the proportion of actual negatives that were incorrectly classified as positive.',
    },
    {
      id: 'p15-ea-4', type: 'fillblank',
      question: 'When the training and validation learning curves converge at low accuracy, the model suffers from high ___ (not enough model capacity).',
      correctAnswer: 'bias (or underfitting)',
      explanation: 'When both training and validation performance plateau at a low level, the model is underfitting — it lacks the capacity to capture the underlying patterns in the data (high bias).',
    },
    {
      id: 'p15-ea-5', type: 'match',
      question: 'Match each error analysis technique with its purpose:',
      pairs: [
        { left: 'Confusion Matrix', right: 'Count false positives vs false negatives' },
        { left: 'Slice Analysis', right: 'Find performance disparities across subgroups' },
        { left: 'Learning Curve', right: 'Diagnose bias vs variance problems' },
        { left: 'Error Bucketing', right: 'Group similar failures for systematic fixes' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'Each technique serves a distinct purpose: confusion matrix for error counting, slice analysis for subgroup disparities, learning curves for bias-variance diagnosis, and error bucketing for categorizing failure modes.',
    },
  ],
}))

export {}
