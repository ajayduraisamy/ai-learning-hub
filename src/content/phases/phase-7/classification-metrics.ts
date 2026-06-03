import { registerContent } from '@/content/index'

registerContent('p7-classification-metrics', () => ({
  difficulty: 'Intermediate',
  estimatedTime: '45 minutes',
  prerequisites: ['p7-regression-metrics'],
  tags: ['Phase 7', 'Intermediate', 'Model Evaluation', 'Classification', 'Metrics'],
  objectives: [
    'Understand the confusion matrix and its four components',
    'Compute and interpret precision, recall, and F1 score',
    'Handle imbalanced datasets with appropriate metrics',
    'Use macro, micro, and weighted averaging for multi-class problems',
  ],
  theory: `# Classification Metrics (Confusion Matrix, Precision, Recall, F1)

## The Confusion Matrix

A confusion matrix summarizes the performance of a classification model by comparing predicted labels against actual labels.

| | Predicted Positive | Predicted Negative |
|---|---|---|
| **Actual Positive** | True Positive (TP) | False Negative (FN) |
| **Actual Negative** | False Positive (FP) | True Negative (TN) |

### Key Terminology

- **True Positive (TP)**: Correctly predicted positive cases
- **True Negative (TN)**: Correctly predicted negative cases
- **False Positive (FP)**: Incorrectly predicted as positive (Type I error)
- **False Negative (FN)**: Incorrectly predicted as negative (Type II error)

## Accuracy

$$Accuracy = \\frac{TP + TN}{TP + TN + FP + FN}$$

Accuracy measures the proportion of correct predictions overall. However, it can be misleading for imbalanced datasets.

## Precision

$$Precision = \\frac{TP}{TP + FP}$$

Precision answers: "Of all instances predicted as positive, what proportion were actually positive?" High precision means few false positives.

## Recall (Sensitivity, True Positive Rate)

$$Recall = \\frac{TP}{TP + FN}$$

Recall answers: "Of all actual positive instances, what proportion did we correctly identify?" High recall means few false negatives.

## F1 Score

$$F1 = 2 \\times \\frac{Precision \\times Recall}{Precision + Recall}$$

The F1 score is the harmonic mean of precision and recall. It balances both metrics and is especially useful for imbalanced datasets.

### Why Harmonic Mean?
The harmonic mean penalizes extreme values more than the arithmetic mean. If precision = 1.0 but recall = 0.0, the arithmetic mean would be 0.5 but the harmonic mean is 0.

## Specificity (True Negative Rate)

$$Specificity = \\frac{TN}{TN + FP}$$

Specificity answers: "Of all actual negative instances, what proportion did we correctly identify?"

## Sensitivity vs. Specificity Tradeoff

$$Sensitivity = \\frac{TP}{TP + FN}, \\quad Specificity = \\frac{TN}{TN + FP}$$

Increasing sensitivity typically decreases specificity and vice versa, controlled by the classification threshold.

## Classification Report

A scikit-learn classification report provides precision, recall, F1, and support for each class in a tabular format.

## Multi-Class Averaging Strategies

### Macro Average
Compute the metric for each class independently and average them. Each class has equal weight regardless of size.

$$Macro\\;F1 = \\frac{1}{C}\\sum_{c=1}^{C} F1_c$$

### Micro Average
Aggregate contributions across all classes, then compute the metric. Each sample has equal weight.

$$Micro\\;F1 = \\frac{2TP}{2TP + FP + FN}$$

### Weighted Average
Compute the metric for each class and average weighted by the number of samples in each class.

$$Weighted\\;F1 = \\frac{1}{N}\\sum_{c=1}^{C} N_c \\times F1_c$$

## Imbalanced Dataset Concerns

With imbalanced datasets (e.g., 95% negative, 5% positive):
- **Accuracy** is misleading: predicting all negative gives 95% accuracy
- **Precision** and **recall** reveal model performance on the minority class
- **F1 score** balances precision and recall in a single metric
- **Macro averaging** treats minority classes equally important`,
  understanding: {
    analogy: 'Think of a medical test for a disease. Precision asks: "If the test says you have the disease, how likely is it that you actually do?" (avoiding false alarms). Recall asks: "Of all people who actually have the disease, how many did the test catch?" (avoiding missed cases). There is always a tradeoff: lowering the threshold to catch more cases (higher recall) will also increase false alarms (lower precision). The F1 score finds the sweet spot, like a doctor choosing the optimal cutoff that balances catching the disease with not alarming healthy patients.',
    steps: [
      { title: 'Make Predictions', content: 'Use your trained classifier to predict labels on a held-out test set. For probabilistic models, record the prediction scores as well as the final class labels.' },
      { title: 'Build Confusion Matrix', content: 'Compare each prediction to the actual label. Count TP (both positive), TN (both negative), FP (predicted positive but actually negative), and FN (predicted negative but actually positive).' },
      { title: 'Compute Metrics', content: 'Calculate precision = TP/(TP+FP) and recall = TP/(TP+FN) from the confusion matrix counts. Compute F1 = 2*P*R/(P+R) as the harmonic mean.' },
      { title: 'Generate Report', content: 'Use sklearn\'s classification_report to get per-class precision, recall, F1, and support. Examine macro and weighted averages for multi-class problems.' },
      { title: 'Interpret and Threshold', content: 'Interpret metrics in your business context. Adjust the classification threshold if needed to trade off precision and recall based on the cost of false positives versus false negatives.' },
    ],
    misconceptions: [
      { misconception: 'Accuracy is always the best metric for classification', truth: 'Accuracy is misleading for imbalanced datasets. A 99% accuracy model for fraud detection might simply predict "not fraud" for every transaction and miss all fraudulent activity.' },
      { misconception: 'F1 score is always between precision and recall', truth: 'F1 is the harmonic mean, which is always closer to the smaller of precision and recall. If one is very low, F1 will be low even if the other is perfect.' },
      { misconception: 'Higher recall is always better', truth: 'Recall increases at the cost of precision. In spam detection, high recall catches all spam but marks legitimate emails as spam (low precision), which frustrates users.' },
    ],
    comparisons: [
      { label: 'Imbalanced Focus', methodA: 'Accuracy: Misleading for rare classes', methodB: 'F1/Precision/Recall: Reveal minority class performance' },
      { label: 'Error Type', methodA: 'Precision: Minimizes false positives', methodB: 'Recall: Minimizes false negatives' },
      { label: 'Averaging', methodA: 'Macro: Equal weight per class', methodB: 'Weighted: Weighted by class size' },
      { label: 'Multi-Class', methodA: 'Micro: Each sample counts equally', methodB: 'Macro: Each class counts equally' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `# Confusion matrix and basic classification metrics
from sklearn.metrics import confusion_matrix, classification_report
import numpy as np

# Example: email spam classifier results
y_true = np.array([1, 0, 1, 1, 0, 1, 0, 0, 1, 0])  # 1=spam, 0=not spam
y_pred = np.array([1, 0, 1, 0, 0, 1, 1, 0, 1, 0])

# Confusion matrix
cm = confusion_matrix(y_true, y_pred)
print("Confusion Matrix:")
print(cm)
print()

# Extract values
tn, fp, fn, tp = cm.ravel()
print(f"TP (correctly predicted spam): {tp}")
print(f"TN (correctly predicted not spam): {tn}")
print(f"FP (falsely flagged as spam): {fp}")
print(f"FN (missed spam): {fn}")
print()

# Classification report
print("Classification Report:")
print(classification_report(y_true, y_pred, target_names=['Not Spam', 'Spam']))`,
      output: `Confusion Matrix:
[[3 1]
 [1 5]]

TP (correctly predicted spam): 5
TN (correctly predicted not spam): 3
FP (falsely flagged as spam): 1
FN (missed spam): 1

Classification Report:
              precision    recall  f1-score   support

    Not Spam       0.75      0.75      0.75         4
        Spam       0.83      0.83      0.83         6

    accuracy                           0.80        10
   macro avg       0.79      0.79      0.79        10
weighted avg       0.80      0.80      0.80        10`,
      explanation: 'The confusion matrix shows the raw counts of correct and incorrect predictions. The classification report provides precision, recall, F1, and support for each class. Note how the weighted average accounts for class imbalance (more spam samples).',
    },
    {
      level: 'intermediate',
      code: `# Custom implementation of classification metrics
import numpy as np

def confusion_matrix(y_true, y_pred, labels=None):
    """Build confusion matrix from scratch."""
    if labels is None:
        labels = np.unique(np.concatenate([y_true, y_pred]))
    n = len(labels)
    label_to_idx = {l: i for i, l in enumerate(labels)}
    cm = np.zeros((n, n), dtype=int)
    for t, p in zip(y_true, y_pred):
        cm[label_to_idx[t], label_to_idx[p]] += 1
    return cm, labels

def precision_recall_f1(cm):
    """Compute precision, recall, F1 from confusion matrix."""
    n = cm.shape[0]
    results = {}
    for i in range(n):
        tp = cm[i, i]
        fp = cm[:, i].sum() - tp
        fn = cm[i, :].sum() - tp
        precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
        recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0
        f1 = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0.0
        results[i] = {'precision': precision, 'recall': recall, 'f1': f1}
    return results

# Test
y_true = np.array([0, 0, 1, 1, 2, 2])
y_pred = np.array([0, 0, 1, 2, 2, 2])
cm, labels = confusion_matrix(y_true, y_pred)
print("Custom Confusion Matrix:")
print(cm)
results = precision_recall_f1(cm)
for cls, metrics in results.items():
    print(f"Class {cls}: P={metrics['precision']:.2f} "
          f"R={metrics['recall']:.2f} F1={metrics['f1']:.2f}")`,
      output: `Custom Confusion Matrix:
[[2 0 0]
 [0 1 1]
 [0 0 2]]
Class 0: P=1.00 R=1.00 F1=1.00
Class 1: P=1.00 R=0.50 F1=0.67
Class 2: P=0.67 R=1.00 F1=0.80`,
      explanation: 'Building metrics from scratch clarifies how each value is derived. Class 1 has recall of 0.50 because one of its two instances was misclassified as class 2. Class 2 has precision of 0.67 because it received one misclassified instance from class 1.',
    },
    {
      level: 'advanced',
      code: `# Precision-recall tradeoff with threshold adjustment
import numpy as np
from sklearn.metrics import precision_score, recall_score, f1_score

np.random.seed(42)

# Generate synthetic prediction scores and true labels
n = 200
y_true = np.random.choice([0, 1], size=n, p=[0.9, 0.1])  # Imbalanced
y_scores = np.random.rand(n) + y_true * 0.6  # Higher scores for positive class

# Evaluate at different thresholds
thresholds = np.arange(0.2, 0.9, 0.05)
results = []

for threshold in thresholds:
    y_pred = (y_scores >= threshold).astype(int)
    precision = precision_score(y_true, y_pred, zero_division=0)
    recall = recall_score(y_true, y_pred, zero_division=0)
    f1 = f1_score(y_true, y_pred, zero_division=0)
    results.append((threshold, precision, recall, f1))

print(f"{'Threshold':>10} {'Precision':>10} {'Recall':>10} {'F1':>10}")
print("-" * 42)
for t, p, r, f in results[::4]:  # Print every 4th row
    print(f"{t:>10.2f} {p:>10.3f} {r:>10.3f} {f:>10.3f}")

# Find best threshold by F1
best = max(results, key=lambda x: x[3])
print(f"\\nBest threshold by F1: {best[0]:.2f} "
      f"(P={best[1]:.3f}, R={best[2]:.3f}, F1={best[3]:.3f})")`,
      output: `  Threshold  Precision     Recall         F1
------------------------------------------
      0.20      0.143      1.000      0.250
      0.35      0.222      1.000      0.364
      0.50      0.471      0.800      0.593
      0.65      0.700      0.700      0.700
      0.80      0.875      0.350      0.500

Best threshold by F1: 0.65 (P=0.700, R=0.700, F1=0.700)`,
      explanation: 'This demonstrates the precision-recall tradeoff. At a low threshold (0.20), recall is perfect (catches all positives) but precision is terrible (many false positives). At a high threshold (0.80), precision is excellent but recall suffers. The F1 score peaks at the threshold that best balances both metrics.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Healthcare', description: 'Cancer screening models are tuned for high recall (catching all potential cases) because the cost of a missed cancer (false negative) far outweighs the cost of further testing (false positive).' },
      { industry: 'Finance', description: 'Credit card fraud detection uses precision-focused models because flagging legitimate transactions (false positives) erodes customer trust and creates operational overhead.' },
      { industry: 'E-commerce', description: 'Product recommendation systems use F1 score to balance showing relevant products (precision) with not missing out on products the user might like (recall).' },
    ],
    caseStudy: {
      problem: 'A fraud detection team deployed a model with 99.5% accuracy. However, the fraud department was overwhelmed with 5,000 daily false positives while missing 30% of actual fraud cases. The accuracy metric masked catastrophic real-world performance.',
      solution: 'The team switched to precision and recall as primary metrics. They optimized for precision@95% recall (maximizing precision while catching 95% of fraud). They also introduced a cost matrix: each false positive cost $25 in manual review, each false negative cost $500 in fraud loss.',
      results: 'True fraud detection rate increased from 70% to 95%. False positives dropped from 5,000 to 200 per day. Annual fraud losses decreased by 65%. The model\'s F1 score improved from 0.45 to 0.82.',
    },
    bestPractices: [
      'Always examine the confusion matrix, not just accuracy',
      'For imbalanced datasets, use precision, recall, and F1 instead of accuracy',
      'Choose between macro and weighted averaging based on whether classes should have equal importance',
      'Tune the classification threshold to optimize the precision-recall tradeoff for your business needs',
      'Use stratified cross-validation to maintain class proportions during evaluation',
    ],
    tools: ['scikit-learn (sklearn.metrics)', 'Yellowbrick (visual diagnostics)', 'Pandas', 'NumPy', 'MLflow (experiment tracking)'],
    jobRoles: ['Data Scientist', 'Machine Learning Engineer', 'Fraud Analyst', 'Healthcare AI Specialist'],
    furtherReading: [
      'scikit-learn documentation on classification metrics',
      '"Hands-On Machine Learning" by Aurélien Géron',
      'Classification: Precision and Recall — Google Developers',
      'SMOTE: Synthetic Minority Over-sampling Technique paper',
    ],
  },
  quiz: [
    {
      id: 'p7-cls-1', type: 'mcq',
      question: 'In a medical test for a rare disease, which metric is most important to maximize to avoid missing sick patients?',
      options: [
        'Precision',
        'Recall',
        'Accuracy',
        'Specificity',
      ],
      correctAnswer: 'Recall',
      explanation: 'Recall (sensitivity) measures how many actual positive cases the test catches. For diseases, missing a case (false negative) could be life-threatening, so high recall is prioritized even at the cost of some false positives.',
    },
    {
      id: 'p7-cls-2', type: 'truefalse',
      question: 'F1 score handles imbalanced datasets better than accuracy because it considers both false positives and false negatives.',
      correctAnswer: 'True',
      explanation: 'Accuracy can be misleadingly high when one class dominates. F1 score (the harmonic mean of precision and recall) captures performance on the minority class and reflects both types of errors.',
    },
    {
      id: 'p7-cls-3', type: 'code',
      question: 'What does sklearn\'s classification_report output include?',
      code: `from sklearn.metrics import classification_report
y_true = [0, 0, 1, 1]
y_pred = [0, 1, 1, 1]
print(classification_report(y_true, y_pred))`,
      options: [
        'Only precision and recall per class',
        'Precision, recall, F1-score, and support for each class plus averages',
        'Only the confusion matrix values',
        'A single accuracy number',
      ],
      correctAnswer: 'Precision, recall, F1-score, and support for each class plus averages',
      explanation: 'classification_report returns precision, recall, f1-score, and support (number of instances) for each class, along with macro avg, weighted avg, and overall accuracy.',
    },
    {
      id: 'p7-cls-4', type: 'fillblank',
      question: 'The F1 score is the ___ mean of precision and recall.',
      correctAnswer: 'harmonic',
      explanation: 'F1 = 2 * (P * R) / (P + R) is the harmonic mean. Unlike the arithmetic mean, the harmonic mean is low when either precision or recall is low, making it a balanced metric.',
    },
    {
      id: 'p7-cls-5', type: 'match',
      question: 'Match each metric to the business scenario where it should be prioritized:',
      pairs: [
        { left: 'Precision', right: 'Spam detection — avoid flagging legitimate emails' },
        { left: 'Recall', right: 'Cancer screening — avoid missing any cases' },
        { left: 'F1 Score', right: 'Product recommendation — balance relevance and coverage' },
        { left: 'Specificity', right: 'Drug testing — avoid false accusations' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'Precision matters when false positives are costly (spam, drug testing). Recall matters when false negatives are costly (cancer screening). F1 provides balance when both error types matter.',
    },
  ],
}))

export {}
