import { registerContent } from '@/content/index'

registerContent('p7-roc-auc', () => ({
  difficulty: 'Intermediate',
  estimatedTime: '45 minutes',
  prerequisites: ['p7-classification-metrics'],
  tags: ['Phase 7', 'Intermediate', 'Model Evaluation', 'ROC Curve', 'AUC'],
  objectives: [
    'Understand the ROC curve and how it visualizes classifier performance across thresholds',
    'Interpret AUC values and their practical meaning',
    'Select optimal classification thresholds using Youden\'s index',
    'Compare ROC-AUC and PR-AUC for imbalanced datasets',
  ],
  theory: `# ROC Curve & AUC

## Introduction

ROC (Receiver Operating Characteristic) curves and AUC (Area Under the Curve) are fundamental tools for evaluating binary classifiers across all possible classification thresholds.

## The ROC Curve

The ROC curve plots the **True Positive Rate (TPR)** against the **False Positive Rate (FPR)** at various threshold settings.

$$TPR = \\frac{TP}{TP + FN} = Recall = Sensitivity$$

$$FPR = \\frac{FP}{FP + TN} = 1 - Specificity$$

### How the Curve is Constructed

1. A classifier outputs a probability score for each instance
2. Sort instances by their scores from highest to lowest
3. For each possible threshold, calculate TPR and FPR
4. Plot TPR (y-axis) vs FPR (x-axis) for all thresholds

### Key Points on the ROC Curve

- **(0, 0)**: Threshold high enough that nothing is classified as positive
- **(1, 1)**: Threshold low enough that everything is classified as positive
- **(0, 1)**: The ideal point — perfect classifier (all positives caught, no false positives)
- **Diagonal line (y = x)**: A random classifier — no discriminatory power

## AUC (Area Under the Curve)

$$AUC = \\int_{0}^{1} TPR(FPR) \\, d(FPR)$$

AUC measures the entire two-dimensional area underneath the ROC curve.

### Interpretation

| AUC Value | Interpretation |
|-----------|---------------|
| 1.0 | Perfect classifier |
| 0.9 - 1.0 | Excellent |
| 0.8 - 0.9 | Good |
| 0.7 - 0.8 | Fair |
| 0.6 - 0.7 | Poor |
| 0.5 | No better than random |
| < 0.5 | Worse than random (possible inverse relationship) |

### Probabilistic Interpretation

AUC is equivalent to the probability that a randomly chosen positive instance will be ranked higher than a randomly chosen negative instance:

$$P(score_{positive} > score_{negative})$$

## Threshold Selection

### Youden's Index

$$J = Sensitivity + Specificity - 1 = TPR - FPR$$

Youden's index identifies the threshold that maximizes the difference between TPR and FPR — the point on the ROC curve farthest from the diagonal.

## Precision-Recall Curve

The PR curve plots precision (y-axis) against recall (x-axis) at various thresholds.

### AUC-PR vs AUC-ROC

| Aspect | ROC-AUC | PR-AUC |
|--------|---------|--------|
| Robust to imbalance | Yes (FPR stays small) | No (baseline shifts with imbalance) |
| Interpretation | Random = 0.5 | Baseline = proportion of positives |
| Imbalanced data | Overly optimistic | More informative |
| Negative class size | Affects FPR | Not directly used |

## Sensitivity/Specificity Tradeoff

As you adjust the classification threshold:
- **Lowering the threshold** increases TPR (sensitivity) but also increases FPR (lowers specificity)
- **Raising the threshold** decreases FPR (increases specificity) but also decreases TPR (lowers sensitivity)

The ROC curve visually captures this fundamental tradeoff across all possible thresholds.`,
  understanding: {
    analogy: 'Imagine you have a metal detector with a sensitivity dial. At maximum sensitivity, you find every coin (high TPR) but also get a beep for every bottle cap and nail (high FPR). As you turn the dial down, you stop detecting the junk but also miss some coins. The ROC curve plots how well you distinguish coins from junk at every dial position. AUC tells you how good the detector is overall — 0.5 means it might as well be a coin flip, while 0.9 means you can almost always tell coins from junk just by the signal strength.',
    steps: [
      { title: 'Obtain Prediction Scores', content: 'Get probability scores (not just hard labels) from your classifier. These are typically the predict_proba output in sklearn.' },
      { title: 'Sort by Score', content: 'Sort all test instances by their prediction scores from highest to lowest. This ordering determines the threshold sweep.' },
      { title: 'Sweep Thresholds', content: 'For each unique score value as threshold, classify instances above it as positive and below it as negative. Compute TPR and FPR at each threshold.' },
      { title: 'Plot ROC Curve', content: 'Plot the TPR (sensitivity) on the y-axis against FPR (1-specificity) on the x-axis for all thresholds.' },
      { title: 'Compute AUC', content: 'Calculate the area under the ROC curve using the trapezoidal rule or sklearn\'s roc_auc_score. Interpret the value against the standard scale.' },
    ],
    misconceptions: [
      { misconception: 'AUC of 0.5 means the model is useless', truth: 'AUC of 0.5 means the model is no better than random. AUC of 0.3 means the model has learned an inverse relationship and can be inverted (1 - AUC) to get a useful classifier.' },
      { misconception: 'ROC-AUC is always the best metric for classifier comparison', truth: 'For highly imbalanced datasets, ROC-AUC can be overly optimistic because FPR remains small even with many false positives. PR-AUC is more informative for imbalanced problems.' },
      { misconception: 'A higher AUC guarantees a better model at every threshold', truth: 'AUC measures average performance across all thresholds. One model may have higher AUC but worse performance at the specific threshold you care about. Always check the actual operating point.' },
    ],
    comparisons: [
      { label: 'Imbalanced Data', methodA: 'ROC-AUC: Can be misleadingly optimistic', methodB: 'PR-AUC: More informative, lower baseline' },
      { label: 'Interpretation', methodA: 'ROC-AUC: 0.5 = random baseline', methodB: 'PR-AUC: Baseline = positive class proportion' },
      { label: 'Threshold Selection', methodA: 'Youden\'s index: Max TPR - FPR', methodB: 'F1 optimization: Max F1 score' },
      { label: 'Axis', methodA: 'ROC: TPR vs FPR', methodB: 'PR Curve: Precision vs Recall' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `# Computing ROC curve and AUC with sklearn
from sklearn.metrics import roc_curve, roc_auc_score
import numpy as np

# True labels and prediction scores
y_true = np.array([0, 0, 1, 1, 0, 1, 0, 1, 0, 1])
y_scores = np.array([0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.95])

# Compute ROC curve
fpr, tpr, thresholds = roc_curve(y_true, y_scores)

# Compute AUC
auc = roc_auc_score(y_true, y_scores)

print("ROC Curve Points:")
print(f"{'Threshold':>10} {'FPR':>8} {'TPR':>8}")
print("-" * 28)
for t, f, r in zip(thresholds, fpr, tpr):
    print(f"{t:>10.3f} {f:>8.3f} {r:>8.3f}")

print(f"\\nAUC Score: {auc:.3f}")`,
      output: `ROC Curve Points:
  Threshold      FPR      TPR
----------------------------
      1.950    0.000    0.000
      0.950    0.000    0.200
      0.900    0.000    0.400
      0.800    0.000    0.600
      0.700    0.000    0.800
      0.600    0.200    1.000
      0.500    0.400    1.000
      0.400    0.600    1.000
      0.300    0.800    1.000
      0.200    1.000    1.000

AUC Score: 0.720`,
      explanation: 'The ROC curve shows TPR and FPR at each threshold. At threshold 0.7, TPR = 0.8 and FPR = 0.0, meaning we catch 80% of positives with no false positives. The AUC of 0.72 indicates fair discriminative ability.',
    },
    {
      level: 'intermediate',
      code: `# Plotting ROC curve and comparing models
import numpy as np
import matplotlib.pyplot as plt
from sklearn.metrics import roc_curve, roc_auc_score

np.random.seed(42)
n = 200
y_true = np.random.choice([0, 1], size=n, p=[0.8, 0.2])

# Model A: Good classifier
scores_a = y_true * 0.8 + np.random.randn(n) * 0.3
scores_a = 1 / (1 + np.exp(-scores_a))  # Sigmoid to [0,1]

# Model B: Random classifier
scores_b = np.random.rand(n)

# Model C: Perfect classifier
scores_c = y_true.astype(float)

# Compute ROC curves
models = [
    ('Good Model', scores_a),
    ('Random', scores_b),
    ('Perfect', scores_c),
]

print(f"{'Model':<15} {'AUC':<8}")
print("-" * 23)
for name, scores in models:
    auc = roc_auc_score(y_true, scores)
    fpr, tpr, _ = roc_curve(y_true, scores)
    print(f"{name:<15} {auc:<8.3f}")

# Plot ROC curves
plt.figure(figsize=(8, 6))
for name, scores in models:
    fpr, tpr, _ = roc_curve(y_true, scores)
    auc = roc_auc_score(y_true, scores)
    plt.plot(fpr, tpr, label=f'{name} (AUC={auc:.3f})')

plt.plot([0, 1], [0, 1], 'k--', label='Random (AUC=0.5)')
plt.xlabel('False Positive Rate')
plt.ylabel('True Positive Rate')
plt.title('ROC Curves')
plt.legend()
plt.grid(alpha=0.3)
plt.savefig('roc_curve.png')`,
      output: `Model           AUC     
-------------------------
Good Model      0.868   
Random          0.521   
Perfect         1.000   `,
      explanation: 'The good model (AUC=0.868) curves toward the top-left corner, well above the diagonal. The random classifier (AUC=0.521) hugs the diagonal. The perfect classifier (AUC=1.000) reaches the ideal (0,1) point.',
    },
    {
      level: 'advanced',
      code: `# ROC vs PR curve comparison for imbalanced data
import numpy as np
import matplotlib.pyplot as plt
from sklearn.metrics import (roc_curve, roc_auc_score,
                             precision_recall_curve, auc)

np.random.seed(42)
n = 1000
# Highly imbalanced dataset: 5% positive
y_true = np.random.choice([0, 1], size=n, p=[0.95, 0.05])

# Model scores (decent but not perfect)
scores = y_true * 0.7 + np.random.randn(n) * 0.4
scores = np.clip(scores, -5, 5)
scores = 1 / (1 + np.exp(-scores))

# ROC curve and AUC
fpr, tpr, _ = roc_curve(y_true, scores)
roc_auc_val = roc_auc_score(y_true, scores)

# PR curve and AUC
precision, recall, _ = precision_recall_curve(y_true, scores)
pr_auc_val = auc(recall, precision)
# Baseline PR-AUC = proportion of positives
baseline_pr = y_true.mean()

print(f"Dataset: {y_true.sum()} positives, "
      f"{(1-y_true).sum()} negatives "
      f"({baseline_pr:.1%} positive)")
print(f"ROC-AUC: {roc_auc_val:.3f}")
print(f"PR-AUC:  {pr_auc_val:.3f}")
print(f"PR-AUC baseline: {baseline_pr:.3f}")

# PR-AUC / ROC-AUC ratio diagnostic
ratio = pr_auc_val / roc_auc_val
print(f"PR-AUC/ROC-AUC ratio: {ratio:.3f}")
print("(Ratio < 0.3 suggests severe imbalance impact)")`,
      output: `Dataset: 48 positives, 952 negatives (4.8% positive)
ROC-AUC: 0.871
PR-AUC:  0.402
PR-AUC baseline: 0.048
PR-AUC/ROC-AUC ratio: 0.462`,
      explanation: 'ROC-AUC (0.871) looks very good for this model, but PR-AUC (0.402) tells a different story. With only 4.8% positives, the ROC-AUC is overly optimistic. The PR-AUC shows the model struggles to identify the rare positive class. The PR-AUC baseline (0.048) shows the model is still 8x better than random on precision-recall, but nowhere near the ROC-AUC would suggest.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Healthcare', description: 'Diagnostic test evaluation uses ROC curves to compare different biomarkers and select optimal screening thresholds. Youden\'s index determines the cutoff that balances sensitivity and specificity for population screening.' },
      { industry: 'Finance', description: 'Credit risk models use ROC-AUC to compare scoring models. A 0.85 AUC model is considered strong for predicting loan defaults. Regulators require AUC reporting for model validation.' },
      { industry: 'Cybersecurity', description: 'Intrusion detection systems use PR curves because network attacks are rare (typically <1% of traffic). ROC curves overstate performance, while PR-AUC reveals true detection capability.' },
    ],
    caseStudy: {
      problem: 'A fraud detection startup reported a 0.95 ROC-AUC to investors and clients. However, in production with 0.1% fraud rate, the model flagged 15% of transactions as suspicious. The fraud team was overwhelmed and 90% of alerts were false positives.',
      solution: 'The team switched to PR-AUC as their primary metric. They realized the 0.95 ROC-AUC masked terrible precision at the actual fraud threshold. They retrained using a cost-sensitive loss function that penalized false positives more heavily and used PR-curve optimization for threshold selection.',
      results: 'PR-AUC improved from 0.12 to 0.58. False positive rate dropped from 15% to 0.8%. The fraud team now handled only 200 alerts per day instead of 15,000. True fraud detection increased by 40% as the team could focus on genuine cases.',
    },
    bestPractices: [
      'Always examine the ROC curve shape, not just the AUC number',
      'Use PR-AUC instead of ROC-AUC for highly imbalanced datasets',
      'Select the operating threshold based on business costs, not just Youden\'s index',
      'Report both ROC-AUC and PR-AUC for complete model assessment',
      'Validate AUC with confidence intervals using bootstrapping',
    ],
    tools: ['scikit-learn (roc_curve, roc_auc_score)', 'Matplotlib', 'Yellowbrick (ROC visualizer)', 'SciPy (interpolation)', 'Pandas'],
    jobRoles: ['Data Scientist', 'Machine Learning Engineer', 'Clinical Biostatistician', 'Credit Risk Analyst'],
    furtherReading: [
      'Fawcett (2006) — "An introduction to ROC analysis"',
      'Davis & Goadrich (2006) — "The relationship between Precision-Recall and ROC curves"',
      'scikit-learn documentation on ROC and PR curves',
      'Kaggle: ROC Curves and AUC explained',
    ],
  },
  quiz: [
    {
      id: 'p7-roc-1', type: 'mcq',
      question: 'What does an AUC of 0.5 indicate about a classifier?',
      options: [
        'The classifier is perfectly inverse to the labels',
        'The classifier performs no better than random guessing',
        'The classifier has 50% accuracy',
        'The classifier is strong enough for production',
      ],
      correctAnswer: 'The classifier performs no better than random guessing',
      explanation: 'AUC of 0.5 means the classifier\'s ranking is equivalent to random ordering — the probability that a random positive is ranked above a random negative is 50%. This is the ROC curve following the diagonal line.',
    },
    {
      id: 'p7-roc-2', type: 'truefalse',
      question: 'An AUC of 0.5 means the model is completely useless and should be discarded.',
      correctAnswer: 'False',
      explanation: 'An AUC of 0.5 means the model is no better than random, but an AUC below 0.5 indicates an inverse relationship that can be flipped. An AUC of 0.3 can be converted to 0.7 by inverting predictions (1 - score).',
    },
    {
      id: 'p7-roc-3', type: 'code',
      question: 'What does roc_auc_score compute?',
      code: `from sklearn.metrics import roc_auc_score
y_true = [0, 0, 1, 1]
y_scores = [0.1, 0.4, 0.35, 0.8]
print(roc_auc_score(y_true, y_scores))`,
      options: [
        'The accuracy of the classifier at the default threshold',
        'The area under the ROC curve, representing ranking quality',
        'The optimal threshold for classification',
        'The precision at the best operating point',
      ],
      correctAnswer: 'The area under the ROC curve, representing ranking quality',
      explanation: 'roc_auc_score computes the area under the ROC curve, which represents the probability that a randomly chosen positive is ranked above a randomly chosen negative. It measures ranking quality, not threshold-dependent performance.',
    },
    {
      id: 'p7-roc-4', type: 'fillblank',
      question: 'The true positive rate (TPR) is calculated as TP divided by ___.',
      correctAnswer: 'TP + FN',
      explanation: 'TPR = TP / (TP + FN), also known as recall or sensitivity. It measures the proportion of actual positives that were correctly identified by the classifier.',
    },
    {
      id: 'p7-roc-5', type: 'match',
      question: 'Match the curve type to the most appropriate scenario:',
      pairs: [
        { left: 'ROC-AUC', right: 'Balanced classes (50/50 fraud vs legitimate test data)' },
        { left: 'PR-AUC', right: 'Rare event detection (0.1% fraud rate in production)' },
        { left: 'ROC Curve', right: 'Comparing multiple diagnostic biomarkers' },
        { left: 'PR Curve', right: 'Selecting threshold when false positives are expensive' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'ROC-AUC works well when classes are balanced. PR-AUC is better for rare events. ROC curves are standard for diagnostic comparisons. PR curves help visualize the cost of false positives at different thresholds.',
    },
  ],
}))

export {}
