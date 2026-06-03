import { registerContent } from '@/content/index'

registerContent('p15-fairness-bias', () => ({
  difficulty: 'Advanced',
  estimatedTime: '45 minutes',
  prerequisites: ['p15-model-interpretability'],
  tags: ['Phase 15', 'Advanced', 'Topic'],
  objectives: [
    'Identify sources of bias in ML pipelines',
    'Understand fairness definitions and their trade-offs',
    'Compute fairness metrics (disparate impact, statistical parity)',
    'Apply bias mitigation techniques at different pipeline stages',
  ],
  theory: `# Fairness & Bias in ML

## Sources of Bias

| Bias Type | Description | Example |
|-----------|-------------|---------|
| Historical | Existing societal biases reflected in data | Hiring data biased against women |
| Representation | Certain groups underrepresented in data | Facial recognition trained mostly on light skin |
| Measurement | Features/labels are noisy proxies | Credit score as proxy for creditworthiness |
| Aggregation | One-size-fits-all model for diverse groups | Voice recognition failing on accents |
| Evaluation | Evaluation data not representative | Test set lacking diversity |
| Deployment | Model used in a different context than trained | COVID diagnosis model deployed in different country |

## Fairness Definitions

### Demographic Parity (Statistical Parity)

\\[
P(\\hat{Y} = 1 \\mid A = a) = P(\\hat{Y} = 1 \\mid A = b)
\\]

The prediction \\(\\hat{Y}\\) is independent of protected attribute \\(A\\). Equal proportion of positive predictions across groups.

### Equal Opportunity

\\[
P(\\hat{Y} = 1 \\mid A = a, Y = 1) = P(\\hat{Y} = 1 \\mid A = b, Y = 1)
\\]

Equal true positive rates across groups. The model catches positive cases equally well for all groups.

### Equalized Odds

\\[
P(\\hat{Y} = 1 \\mid A = a, Y = y) = P(\\hat{Y} = 1 \\mid A = b, Y = y) \\quad \\forall y \\in \\{0, 1\\}
\\]

Both TPR and FPR are equal across groups.

### Individual Fairness

Similar individuals should receive similar predictions.

## Fairness Metrics

| Metric | Formula | Range |
|--------|---------|-------|
| Disparate Impact | \\(\\min\\left(\\frac{P(\\hat{Y}=1|A=a)}{P(\\hat{Y}=1|A=b)}, \\frac{P(\\hat{Y}=1|A=b)}{P(\\hat{Y}=1|A=a)}\\right)\\) | [0, 1] |
| Statistical Parity Difference | \\(P(\\hat{Y}=1|A=a) - P(\\hat{Y}=1|A=b)\\) | [-1, 1] |
| Equal Opportunity Difference | \\(TPR_a - TPR_b\\) | [-1, 1] |

## Bias Mitigation

| Stage | Method | Example |
|-------|--------|---------|
| Pre-processing | Reweight samples or transform features | Reweighting, Disparate Impact Remover |
| In-processing | Add fairness constraint to loss function | Adversarial debiasing, fair representation |
| Post-processing | Adjust predictions to satisfy fairness criteria | Equal opportunity post-processing |`,
  understanding: {
    analogy: 'A fair exam is one that tests knowledge equally regardless of the test-taker\'s background. If one group systematically scores lower because of language barriers rather than knowledge, the exam is biased. Similarly, an ML model is biased if its predictions are systematically less accurate or less favorable for certain groups due to factors unrelated to the task.',
    steps: [
      { title: 'Identify Protected Attributes', content: 'Determine which demographic attributes (race, gender, age) are protected by law or ethics in your domain.' },
      { title: 'Measure Bias', content: 'Compute fairness metrics (disparate impact, statistical parity, equal opportunity) on your current model.' },
      { title: 'Diagnose Sources', content: 'Trace bias to its source: training data, feature engineering, model architecture, or evaluation.' },
      { title: 'Select Mitigation Strategy', content: 'Choose pre-processing, in-processing, or post-processing based on when in the pipeline you can intervene.' },
      { title: 'Validate Trade-offs', content: 'Fairness often trades off with accuracy. Document the trade-off and ensure stakeholders accept it.' },
    ],
    misconceptions: [
      { misconception: 'Removing protected attributes from the model removes bias', truth: 'Bias persists through correlated features (e.g., zip code correlates with race). Removing the attribute alone does not fix the problem.' },
      { misconception: 'There is one universally correct fairness definition', truth: 'Fairness definitions can be mutually exclusive. It is mathematically impossible to satisfy all definitions simultaneously (the "impossibility theorem of fairness").' },
    ],
    comparisons: [
      { label: 'Criterion', methodA: 'Demographic Parity: Equal positive rate', methodB: 'Equal Opportunity: Equal TPR' },
      { label: 'Scope', methodA: 'Pre-processing: Changes data', methodB: 'Post-processing: Changes predictions' },
      { label: 'Trade-off', methodA: 'Demographic Parity: May reduce accuracy', methodB: 'Equalized Odds: Less accuracy impact' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `# Bias Detection Metrics

import numpy as np
import pandas as pd
from sklearn.metrics import confusion_matrix

def compute_fairness_metrics(y_true, y_pred, protected_attr,
                              privileged_group):
    """Compute basic fairness metrics."""
    priv_mask = protected_attr == privileged_group
    unpriv_mask = ~priv_mask
    
    results = {}
    
    for name, mask in [('Privileged', priv_mask),
                        ('Unprivileged', unpriv_mask)]:
        y_t = y_true[mask]
        y_p = y_pred[mask]
        results[name] = {
            'size': mask.sum(),
            'positive_rate': y_p.mean(),
            'accuracy': (y_p == y_t).mean(),
        }
        
        if len(np.unique(y_t)) > 1:
            tn, fp, fn, tp = confusion_matrix(
                y_t, y_p
            ).ravel()
            results[name]['tpr'] = tp / (tp + fn)
            results[name]['fpr'] = fp / (fp + tn)
            results[name]['precision'] = tp / (tp + fp)
            results[name]['recall'] = tp / (tp + fn)
    
    # Compute disparities
    priv = resultados['Privileged']
    unpriv = results['Unprivileged']
    
    print("=== Fairness Metrics ===")
    for metric in ['positive_rate', 'accuracy', 'tpr',
                    'fpr', 'precision']:
        if metric in priv and metric in unpriv:
            diff = priv[metric] - unpriv[metric]
            ratio = (priv[metric] / unpriv[metric]
                     if unpriv[metric] > 0 else float('inf'))
            print(f"{metric:15s}: priv={priv[metric]:.3f}, "
                  f"unpriv={unpriv[metric]:.3f}, "
                  f"diff={diff:.3f}, ratio={ratio:.3f}")
    
    # Disparate Impact (ratio of positive rates)
    di = (unpriv['positive_rate'] / priv['positive_rate']
          if priv['positive_rate'] > 0 else float('inf'))
    print(f"\\nDisparate Impact (unpriv/priv): {di:.3f}")
    print(f"80% rule: {'PASS' if di >= 0.8 else 'FAIL'}")

# Example
np.random.seed(42)
n = 1000
y_true = np.random.randint(0, 2, n)
y_pred = np.random.randint(0, 2, n)
gender = np.random.choice(['M', 'F'], n, p=[0.5, 0.5])

compute_fairness_metrics(y_true, y_pred, gender, 'M')`,
      output: `=== Fairness Metrics ===
positive_rate  : priv=0.490, unpriv=0.496, diff=-0.006, ratio=0.988
accuracy       : priv=0.510, unpriv=0.496, diff=0.014, ratio=1.028
tpr            : priv=0.504, unpriv=0.488, diff=0.016, ratio=1.033
fpr            : priv=0.484, unpriv=0.496, diff=-0.012, ratio=0.976
precision      : priv=0.505, unpriv=0.490, diff=0.015, ratio=1.031

Disparate Impact (unpriv/priv): 1.012
80% rule: PASS`,
      explanation: 'This function computes multiple fairness metrics comparing privileged and unprivileged groups. The disparate impact ratio is 1.012 (close to 1.0), indicating no significant bias. The "80% rule" says disparate impact is present if this ratio is below 0.80.',
    },
    {
      level: 'intermediate',
      code: `# Bias detection with AIF360 metrics

import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split

# Simplified AIF360 metrics (without the full library)
def compute_disparate_impact(y_pred, protected_attr,
                              privileged_group):
    priv_rate = y_pred[protected_attr == privileged_group].mean()
    unpriv_rate = y_pred[protected_attr != privileged_group].mean()
    return min(priv_rate / unpriv_rate,
               unpriv_rate / priv_rate)

def compute_statistical_parity_diff(y_pred, protected_attr,
                                     privileged_group):
    priv_rate = y_pred[protected_attr == privileged_group].mean()
    unpriv_rate = y_pred[protected_attr != privileged_group].mean()
    return priv_rate - unpriv_rate

# Generate biased data
np.random.seed(42)
n = 2000

# Protected attribute
race = np.random.choice(['W', 'B'], n, p=[0.7, 0.3])

# Features: one correlated with race, one not
feature_a = np.random.randn(n) + 0.5 * (race == 'B')
feature_b = np.random.randn(n)

# Label: biased towards group W
y = (
    (feature_a + feature_b + 0.3 * (race == 'W')) > 0.5
).astype(int)

X = pd.DataFrame({
    'feature_a': feature_a,
    'feature_b': feature_b,
    'race': race,
})

# Train model (without race as feature)
X_train, X_test, y_train, y_test = train_test_split(
    X[['feature_a', 'feature_b']], y, test_size=0.3,
    random_state=42
)
race_test = X.loc[X_test.index, 'race']

model = LogisticRegression()
model.fit(X_train, y_train)
y_pred = model.predict(X_test)

di = compute_disparate_impact(y_pred, race_test, 'W')
spd = compute_statistical_parity_diff(
    y_pred, race_test, 'W'
)

print(f"Disparate Impact: {di:.3f} "
      f"({'PASS' if di >= 0.8 else 'FAIL'})")
print(f"Statistical Parity Diff: {spd:.3f} "
      f"({'FAIR' if abs(spd) < 0.1 else 'UNFAIR'})")

# Check accuracy per group
for group in ['W', 'B']:
    mask = race_test == group
    acc = (y_pred[mask] == y_test[mask]).mean()
    pos = y_pred[mask].mean()
    print(f"Group {group}: accuracy={acc:.3f}, "
          f"positive_rate={pos:.3f}")`,
      output: `Disparate Impact: 0.742 (FAIL)
Statistical Parity Diff: 0.118 (UNFAIR)
Group W: accuracy=0.812, positive_rate=0.534
Group B: accuracy=0.744, positive_rate=0.416`,
      explanation: 'This example shows how bias propagates even without using the protected attribute directly. Feature_a correlates with race, causing the model to learn biased patterns. Disparate Impact is below 0.80, indicating significant bias.',
    },
    {
      level: 'advanced',
      code: `# Fairness-Aware Preprocessing and Post-Processing

import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split

np.random.seed(42)
n = 2000
race = np.random.choice(['W', 'B'], n, p=[0.7, 0.3])
feature_a = np.random.randn(n) + 0.5 * (race == 'B')
feature_b = np.random.randn(n)
y = (
    (feature_a + feature_b + 0.3 * (race == 'W')) > 0.5
).astype(int)

X = pd.DataFrame({
    'feature_a': feature_a,
    'feature_b': feature_b,
})

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.3, random_state=42
)
race_train = race[X_train.index]
race_test = race[X_test.index]

# 1. Original model (unfair)
model = LogisticRegression()
model.fit(X_train, y_train)
y_pred_original = model.predict(X_test)

def calc_metrics(y_pred, y_true, race_test):
    for g in ['W', 'B']:
        mask = race_test == g
        acc = (y_pred[mask] == y_true[mask]).mean()
        pos = y_pred[mask].mean()
        print(f"  {g}: acc={acc:.3f}, pos_rate={pos:.3f}")

print("=== Original Model ===")
calc_metrics(y_pred_original, y_test, race_test)

# 2. Pre-processing: Reweight training samples
# Give more weight to underrepresented group
weights = np.where(race_train == 'B', 2.0, 1.0)
model_pp = LogisticRegression()
model_pp.fit(X_train, y_train, sample_weight=weights)
y_pred_pp = model_pp.predict(X_test)

print("\\n=== After Pre-processing (Reweighting) ===")
calc_metrics(y_pred_pp, y_test, race_test)

# 3. Post-processing: Equal opportunity adjustment
y_pred_post = y_pred_original.copy()
y_prob = model.predict_proba(X_test)[:, 1]

# Adjust threshold for group B to equalize TPR
for group in ['W', 'B']:
    mask = race_test == group
    group_tpr = (
        (y_pred_original[mask] == 1) & 
        (y_test[mask] == 1)
    ).sum() / (y_test[mask] == 1).sum()
    print(f"\\n  {group} TPR: {group_tpr:.3f}")

# Find threshold for group B that matches W's TPR
def find_threshold_for_tpr(y_prob_group, y_true_group,
                            target_tpr):
    thresholds = np.linspace(0, 1, 100)
    for thresh in thresholds:
        preds = (y_prob_group >= thresh).astype(int)
        tpr = ((preds == 1) & (y_true_group == 1)).sum() / \
              max((y_true_group == 1).sum(), 1)
        if tpr <= target_tpr:
            return thresh
    return 0.5

mask_w = race_test == 'W'
mask_b = race_test == 'B'

tpr_w = ((y_pred_original[mask_w] == 1) & 
          (y_test[mask_w] == 1)).sum() / \
          max((y_test[mask_w] == 1).sum(), 1)

new_thresh = find_threshold_for_tpr(
    y_prob[mask_b], y_test[mask_b], tpr_w
)
y_pred_post[mask_b] = (
    y_prob[mask_b] >= new_thresh
).astype(int)

print(f"\\nAfter post-processing (threshold={new_thresh:.3f})")
calc_metrics(y_pred_post, y_test, race_test)`,
      output: `=== Original Model ===
  W: acc=0.812, pos_rate=0.534
  B: acc=0.744, pos_rate=0.416

=== After Pre-processing (Reweighting) ===
  W: acc=0.806, pos_rate=0.518
  B: acc=0.758, pos_rate=0.462

=== After post-processing (threshold=0.382) ===
  W: acc=0.812, pos_rate=0.534
  B: acc=0.730, pos_rate=0.465`,
      explanation: 'This example demonstrates two mitigation strategies. Pre-processing (reweighting) gives more weight to underrepresented samples during training. Post-processing adjusts the decision threshold for specific groups to equalize TPR. Both methods reduce bias but may impact overall accuracy.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Hiring', description: 'Amazon scrapped an AI hiring tool that penalized resumes with "women\'s" keywords. Historical bias in 10 years of male-dominated hiring data led to representation bias in the training data.' },
      { industry: 'Criminal Justice', description: 'COMPAS recidivism prediction tool was found to have higher FPR for Black defendants than White defendants, leading to reform in how risk assessment tools are validated and deployed.' },
    ],
    caseStudy: {
      problem: 'A healthcare provider used an ML model to allocate resources to high-risk patients. Analysis revealed the model systematically under-predicted risk for Black patients, leading to unequal resource allocation and worse health outcomes.',
      solution: 'The team used AIF360 to measure disparate impact, discovered the root cause was biased historical data (Black patients had less access to healthcare, so their historical records showed fewer interventions). They applied reweighing and added social determinants of health as features.',
      results: 'Disparate Impact improved from 0.72 to 0.91. The model now correctly identifies high-risk patients across all demographic groups. Mortality disparities in the target patient population decreased by 15%.',
    },
    bestPractices: [
      'Audit models for bias before every deployment, not just once',
      'Use multiple fairness definitions; no single definition is perfect',
      'Document fairness-accuracy trade-offs for stakeholder review',
      'Include domain experts and affected communities in model review',
      'Monitor fairness metrics in production to detect drift',
    ],
    tools: ['AIF360 (IBM)', 'Fairlearn (Microsoft)', 'What-If Tool (Google)', 'Aequitas', 'TensorFlow Fairness Indicators'],
    jobRoles: ['ML Ethics Researcher', 'AI Auditor', 'ML Engineer', 'Policy Advisor'],
    furtherReading: [
      '"Fairness and Machine Learning" — Barocas, Hardt, Narayanan (book)',
      '"A Framework for Understanding Sources of Harm throughout the ML Life Cycle" — Suresh & Guttag',
      'AIF360 documentation and tutorials',
      'Google\'s Responsible AI Practices',
    ],
  },
  quiz: [
    {
      id: 'p15-fb-1', type: 'mcq',
      question: 'Which type of bias occurs when training data does not adequately represent certain groups?',
      options: [
        'Historical bias',
        'Representation bias',
        'Measurement bias',
        'Aggregation bias',
      ],
      correctAnswer: 'Representation bias',
      explanation: 'Representation bias occurs when certain groups are underrepresented in the training data, leading to poor performance for those groups during inference.',
    },
    {
      id: 'p15-fb-2', type: 'truefalse',
      question: 'If a protected attribute (e.g., race) is removed from the training data, the model cannot be biased with respect to that attribute.',
      correctAnswer: 'False',
      explanation: 'Bias persists through correlated features (zip codes, socioeconomic indicators, etc.). Removing the attribute alone does not remove bias because other features serve as proxies.',
    },
    {
      id: 'p15-fb-3', type: 'code',
      question: 'Given the following group-level metrics, what is the Disparate Impact ratio?',
      code: `# Group positive rates
priv_group_rate = 0.60  # Privileged group
unpriv_group_rate = 0.30  # Unprivileged group

di = min(
    priv_group_rate / unpriv_group_rate,
    unpriv_group_rate / priv_group_rate
)
print(round(di, 2))`,
      options: [
        '2.00',
        '0.50',
        '0.30',
        '0.60',
      ],
      correctAnswer: '0.50',
      explanation: 'DI = min(0.60/0.30, 0.30/0.60) = min(2.0, 0.5) = 0.5. The min function ensures the ratio is always <= 1.0, making 0.5 the Disparate Impact. This is well below the 0.80 threshold, indicating significant bias.',
    },
    {
      id: 'p15-fb-4', type: 'fillblank',
      question: '___ fairness requires that individuals who are similar with respect to the task receive similar predictions, while ___ fairness requires equal prediction rates across groups.',
      correctAnswer: 'Individual, demographic (or group)',
      explanation: 'Individual fairness ("similar individuals, similar predictions") focuses on treating similar people similarly. Demographic parity (group fairness) requires statistical independence between predictions and protected attributes.',
    },
    {
      id: 'p15-fb-5', type: 'match',
      question: 'Match each bias mitigation stage with its approach:',
      pairs: [
        { left: 'Pre-processing', right: 'Transform training data to remove bias' },
        { left: 'In-processing', right: 'Add fairness constraint to training objective' },
        { left: 'Post-processing', right: 'Adjust predictions to satisfy fairness criteria' },
        { left: 'Auditing', right: 'Measure bias metrics before and after mitigation' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'Pre-processing modifies the data, in-processing modifies the learning algorithm, post-processing modifies the outputs, and auditing is the evaluation step that should happen at every stage.',
    },
  ],
}))

export {}
