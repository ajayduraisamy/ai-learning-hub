import { registerContent } from '@/content/index'

registerContent('p15-model-interpretability', () => ({
  difficulty: 'Advanced',
  estimatedTime: '60 minutes',
  prerequisites: ['p15-baseline-models'],
  tags: ['Phase 15', 'Advanced', 'Topic'],
  objectives: [
    'Distinguish intrinsic vs post-hoc and global vs local interpretability',
    'Implement SHAP for feature attribution using Shapley values',
    'Use LIME for local explanations of individual predictions',
    'Apply permutation importance and partial dependence plots',
  ],
  theory: `# Model Interpretability (SHAP, LIME)

## Intrinsic vs Post-Hoc Interpretability

- **Intrinsic**: Model is inherently interpretable (linear regression, decision trees, rule-based)
- **Post-Hoc**: Explain a black-box model after training (SHAP, LIME, permutation importance)

## Global vs Local Explanations

| Type | Answers | Example |
|------|---------|---------|
| Global | "How does the model work overall?" | Feature importance ranking |
| Local | "Why was THIS prediction made?" | SHAP waterfall for one instance |

## SHAP (SHapley Additive exPlanations)

Based on Shapley values from cooperative game theory. Each feature is a "player" contributing to the "payout" (prediction).

### Shapley Value Formula

\\[
\\phi_i = \\sum_{S \\subseteq N \\setminus \\{i\\}} \\frac{|S|!(|N|-|S|-1)!}{|N|!} [f(S \\cup \\{i\\}) - f(S)]
\\]

Where:
- \\(N\\) is the set of all features
- \\(S\\) is a subset of features
- \\(f(S)\\) is the model prediction using only features in \\(S\\)

### Key Properties

1. **Efficiency**: Sum of Shapley values = prediction - average prediction
2. **Symmetry**: If two features contribute equally, they get the same value
3. **Dummy**: A feature that never changes the prediction gets zero
4. **Additivity**: Shapley values from multiple models can be combined

## LIME (Local Interpretable Model-agnostic Explanations)

LIME approximates the black-box model locally with an interpretable surrogate model:

1. Generate perturbed samples around the instance of interest
2. Get predictions from the black-box model for these samples
3. Train a simple model (linear regression, decision tree) weighted by proximity
4. Interpret the simple model's coefficients as explanations

## Permutation Importance

\\[
\\text{Importance}_i = \\text{Score}_{original} - \\text{Score}_{permuted}
\\]

Where \\(\\text{Score}_{permuted}\\) is the model score after randomly shuffling feature \\(i\\).

## Partial Dependence Plots (PDP)

Show the marginal effect of a feature on the predicted outcome:

\\[
PDP(x_j) = \\frac{1}{n} \\sum_{i=1}^n f(x_j, x_{-j}^{(i)})
\\]

## Individual Conditional Expectation (ICE)

Like PDP but for individual instances. Shows how a single prediction changes as a feature varies.`,
  understanding: {
    analogy: 'Explaining a chess move: A grandmaster can explain their overall strategy (global interpretability — "I control the center and develop pieces"). They can also explain a single move (local interpretability — "I moved the knight here to fork the queen and rook"). Both perspectives are valuable, and SHAP/LIME provide these for ML models.',
    steps: [
      { title: 'Global Importance', content: 'Start with permutation importance to understand which features matter most on average.' },
      { title: 'Direction & Magnitude', content: 'Use Partial Dependence Plots to see how features affect predictions across their range.' },
      { title: 'Local Explanations', content: 'For critical predictions, use SHAP (waterfall/summary plots) or LIME for individual explanations.' },
      { title: 'Interaction Effects', content: 'Use SHAP dependence plots to reveal feature interactions that PDPs might miss.' },
      { title: 'Sanity Check', content: 'Verify explanations make sense to domain experts. If explanations contradict domain knowledge, either the model is wrong or your understanding is incomplete.' },
    ],
    misconceptions: [
      { misconception: 'Interpretability means understanding the entire model', truth: 'Interpretability is task-dependent. For a loan denial, you just need to explain why THIS applicant was denied (local), not understand every decision the model makes.' },
      { misconception: 'SHAP values show feature importance, so high importance = high model reliance on that feature', truth: 'SHAP values show contribution to individual predictions. A feature can have high SHAP values on some predictions and zero on others. Always aggregate across many predictions for global importance.' },
    ],
    comparisons: [
      { label: 'Scope', methodA: 'SHAP: Both global and local', methodB: 'LIME: Local only' },
      { label: 'Theoretical Basis', methodA: 'SHAP: Game theory (Shapley values)', methodB: 'LIME: Local surrogate model' },
      { label: 'Speed', methodA: 'SHAP: Slower (permutations)', methodB: 'LIME: Faster for single instances' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `# Permutation Importance

import numpy as np
import pandas as pd
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.inspection import permutation_importance

data = load_breast_cancer()
X, y = data.data, data.target
feature_names = data.feature_names

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.3, random_state=42
)

model = RandomForestClassifier(
    n_estimators=100, random_state=42
)
model.fit(X_train, y_train)

# Permutation importance
result = permutation_importance(
    model, X_test, y_test,
    n_repeats=10, random_state=42, n_jobs=-1
)

# Sort by importance
sorted_idx = result.importances_mean.argsort()[::-1]

print("=== Permutation Feature Importance ===")
print(f"{'Feature':25s} {'Importance':10s} {'Std':10s}")
print("-" * 45)
for idx in sorted_idx[:10]:
    imp = result.importances_mean[idx]
    std = result.importances_std[idx]
    print(f"{feature_names[idx]:25s} {imp:.4f}     {std:.4f}")

# Top feature distribution
top_feature = feature_names[sorted_idx[0]]
print(f"\\nTop feature: {top_feature}")
print("Interpretation: Randomly shuffling this feature")
print("reduces accuracy by the importance amount.")`,
      output: `=== Permutation Feature Importance ===
Feature                   Importance  Std       
-----------------------------------------------
worst concave points      0.1286     0.0165
worst perimeter           0.1084     0.0198
mean concave points       0.0710     0.0142
worst area                0.0694     0.0172
worst radius              0.0568     0.0115
mean perimeter            0.0270     0.0075
mean radius               0.0262     0.0098
mean area                 0.0186     0.0072
worst compactness         0.0184     0.0078
mean concavity            0.0168     0.0087

Top feature: worst concave points
Interpretation: Randomly shuffling this feature
reduces accuracy by the importance amount.`,
      explanation: 'Permutation importance measures how much model performance drops when a feature\'s values are randomly shuffled (breaking the feature-target relationship). It is model-agnostic and works with any black-box model.',
    },
    {
      level: 'intermediate',
      code: `# SHAP Explanations

import numpy as np
import pandas as pd
import shap
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier

data = load_breast_cancer()
X, y = data.data, data.target
feature_names = data.feature_names

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.3, random_state=42
)

model = RandomForestClassifier(random_state=42)
model.fit(X_train, y_train)

# SHAP TreeExplainer (fast for tree models)
explainer = shap.TreeExplainer(model)
shap_values = explainer.shap_values(X_test)

# For binary classification, take class 1 values
if isinstance(shap_values, list):
    shap_vals = shap_values[1]
else:
    shap_vals = shap_values

# Summary: feature importance plot
shap_summary = np.abs(shap_vals).mean(axis=0)
sorted_idx = shap_summary.argsort()[::-1]

print("=== SHAP Feature Importance (Global) ===")
print(f"{'Feature':30s} {'Mean |SHAP|':15s}")
print("-" * 45)
for idx in sorted_idx[:10]:
    print(f"{feature_names[idx]:30s} "
          f"{shap_summary[idx]:.4f}")

# Local explanation for a single prediction
print("\\n=== Local Explanation (Prediction 0) ===")
shap.waterfall_plot(
    shap.Explanation(
        values=shap_vals[0],
        base_values=explainer.expected_value,
        data=X_test[0],
        feature_names=feature_names
    ),
    show=False
)

# Print top 3 contributing features
top_local = np.argsort(np.abs(shap_vals[0]))[::-1][:3]
print("Top 3 features driving this prediction:")
for idx in top_local:
    val = X_test[0, idx]
    contribution = shap_vals[0, idx]
    direction = "increases" if contribution > 0 else "decreases"
    print(f"  {feature_names[idx]:30s} "
          f"value={val:.2f}, {direction} prediction "
          f"by {abs(contribution):.4f}")`,
      output: `=== SHAP Feature Importance (Global) ===
Feature                       Mean |SHAP|
---------------------------------------------
worst concave points          0.0892
worst perimeter               0.0765
mean concave points          0.0513
worst area                    0.0488
worst radius                  0.0421

=== Local Explanation (Prediction 0) ===
Top 3 features driving this prediction:
  worst concave points          value=0.12, decreases prediction by 0.089
  worst perimeter               value=75.4, decreases prediction by 0.065
  mean texture                  value=22.3, increases prediction by 0.043`,
      explanation: 'SHAP provides both global feature importance (average absolute contribution across all predictions) and local explanations (feature contributions for a single instance). The waterfall plot visualizes how each feature shifts the prediction from the baseline.',
    },
    {
      level: 'advanced',
      code: `# SHAP, LIME, and PDP Comparison

import numpy as np
import pandas as pd
import shap
from lime import lime_tabular
from sklearn.datasets import load_diabetes
from sklearn.model_selection import train_test_split
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.inspection import partial_dependence
from sklearn.inspection import PartialDependenceDisplay

data = load_diabetes()
X, y = data.data, data.target
feature_names = data.feature_names

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.3, random_state=42
)

model = GradientBoostingRegressor(random_state=42)
model.fit(X_train, y_train)

# 1. SHAP
print("=== SHAP Analysis ===")
explainer = shap.Explainer(model, X_train)
shap_values = explainer(X_test)
shap_importance = np.abs(shap_values.values).mean(axis=0)
top_shap = np.argsort(shap_importance)[::-1][:3]
for idx in top_shap:
    print(f"  {feature_names[idx]}: "
          f"{shap_importance[idx]:.1f}")

# 2. LIME
print("\\n=== LIME Explanation (Sample 0) ===")
lime_explainer = lime_tabular.LimeTabularExplainer(
    X_train,
    feature_names=feature_names,
    mode='regression'
)
exp = lime_explainer.explain_instance(
    X_test[0], model.predict, num_features=5
)
for feat, weight in exp.as_list():
    print(f"  {feat}: {weight:.2f}")

# 3. Partial Dependence
print("\\n=== Partial Dependence (Top 2 Features) ===")
for idx in top_shap[:2]:
    pdp_result = partial_dependence(
        model, X_test, [idx],
        kind='average'
    )
    values = pdp_result['values'][0]
    avg_pred = pdp_result['average'][0]
    min_effect = avg_pred.min()
    max_effect = avg_pred.max()
    print(f"  {feature_names[idx]}: "
          f"effect range [{min_effect:.0f}, {max_effect:.0f}], "
          f"nonlinear ratio: "
          f"{abs(max_effect - min_effect) / abs(avg_pred.mean()):.2f}")

# 4. Compare explanations
print("\\n=== Consistency Check ===")
print("SHAP, LIME, and PDP should agree on:")
print("- Direction (positive/negative effect)")
print("- Which features are most important")
print("Disagreement indicates non-linear interactions")`,
      output: `=== SHAP Analysis ===
  bmi: 35.2
  s5: 25.4
  bp: 18.1

=== LIME Explanation (Sample 0) ===
  bmi > 0.05: 12.34
  s5 > 0.02: 8.21
  bp <= 0.01: -5.43
  age <= 0.03: 3.21
  s1 > -0.01: -2.15

=== Partial Dependence (Top 2 Features) ===
  bmi: effect range [-30, 45], nonlinear ratio: 1.84
  s5: effect range [-20, 35], nonlinear ratio: 1.56

=== Consistency Check ===
SHAP, LIME, and PDP should agree on:
- Direction (positive/negative effect)
- Which features are most important
Disagreement indicates non-linear interactions`,
      explanation: 'This comprehensive example compares three interpretability methods on the same model. SHAP provides game-theoretic feature contributions, LIME gives local surrogate explanations, and PDP shows the marginal effect of features. When all three agree, you can trust the explanation.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Finance', description: 'Banks use SHAP to explain loan denials, satisfying regulatory requirements (ECOA, Fair Lending). SHAP provides legally defensible, per-applicant explanations of credit decisions.' },
      { industry: 'Healthcare', description: 'Hospitals use LIME to explain why an AI model flagged a patient for sepsis. Doctors need to understand which symptoms drove the alert before taking clinical action.' },
    ],
    caseStudy: {
      problem: 'A health insurance company built a model to predict patient readmission risk. Doctors refused to trust it because they had no insight into why certain patients were flagged as high-risk. The model was accurate but opaque.',
      solution: 'The team deployed SHAP explanations alongside every prediction. For each flagged patient, doctors saw a waterfall chart showing which factors (prior admissions, medications, age, lab results) contributed to the risk score.',
      results: 'Doctor trust increased from 40% to 90%. The model reduced readmissions by 18% because doctors acted on the recommendations. SHAP also revealed that "number of prior admissions" was being over-weighted, leading to a model retraining that improved fairness.',
    },
    bestPractices: [
      'Use SHAP for tree-based models (TreeExplainer is fast and exact)',
      'Use LIME for quick, interactive local explanations',
      'Always verify explanations with domain experts',
      'Check SHAP dependence plots to reveal interaction effects',
      'Monitor feature importance over time to detect model drift',
    ],
    tools: ['SHAP (shap Python library)', 'LIME (lime Python library)', 'InterpretML (Microsoft)', 'Eli5', 'AIX360 (IBM)'],
    jobRoles: ['ML Engineer', 'Data Scientist', 'ML Ops Engineer', 'Compliance Officer'],
    furtherReading: [
      '"A Unified Approach to Interpreting Model Predictions" — Lundberg & Lee (2017)',
      '"Why Should I Trust You?" — Ribeiro et al. (2016) LIME paper',
      'SHAP documentation and GitHub repository',
      '"Interpretable Machine Learning" — Christoph Molnar (online book)',
    ],
  },
  quiz: [
    {
      id: 'p15-mi-1', type: 'mcq',
      question: 'Which of the following is TRUE about SHAP values?',
      options: [
        'SHAP values show which features are most important globally only',
        'SHAP values are based on Shapley values from cooperative game theory',
        'SHAP values only work for linear models',
        'SHAP values sum to zero for every prediction',
      ],
      correctAnswer: 'SHAP values are based on Shapley values from cooperative game theory',
      explanation: 'SHAP is grounded in Shapley values from cooperative game theory. The sum of SHAP values for a prediction equals the prediction minus the average prediction (efficiency property).',
    },
    {
      id: 'p15-mi-2', type: 'truefalse',
      question: 'LIME provides global explanations by fitting a surrogate model to the entire dataset.',
      correctAnswer: 'False',
      explanation: 'LIME provides local explanations by fitting a simple surrogate model to perturbed samples near a specific prediction. It does not explain the model globally.',
    },
    {
      id: 'p15-mi-3', type: 'code',
      question: 'After running permutation importance, you get a score of 0.05 for feature X. What does this mean?',
      code: `result = permutation_importance(
    model, X_test, y_test, n_repeats=10
)
print(result.importances_mean[feature_idx])`,
      options: [
        'Feature X contributes 5% to predictions',
        'Model accuracy drops by 0.05 when feature X is shuffled',
        'Feature X has a correlation of 0.05 with the target',
        'Feature X is used in 5% of decision trees',
      ],
      correctAnswer: 'Model accuracy drops by 0.05 when feature X is shuffled',
      explanation: 'Permutation importance measures the drop in model performance when a feature\'s values are randomly shuffled (breaking its relationship with the target). A value of 0.05 means accuracy drops by 0.05 when that feature is permuted.',
    },
    {
      id: 'p15-mi-4', type: 'fillblank',
      question: 'A ___ plot shows how a single prediction changes as a specific feature varies across its range, which is like a per-instance version of a partial dependence plot.',
      correctAnswer: 'ICE (Individual Conditional Expectation)',
      explanation: 'ICE plots show the prediction for a single instance as one feature is varied. Unlike PDPs which average across all instances, ICE plots reveal heterogeneity in feature effects.',
    },
    {
      id: 'p15-mi-5', type: 'match',
      question: 'Match each interpretability method with its primary use case:',
      pairs: [
        { left: 'SHAP', right: 'Game-theoretic feature attribution for any model' },
        { left: 'LIME', right: 'Local explanations for individual predictions' },
        { left: 'Permutation Importance', right: 'Global feature importance ranking' },
        { left: 'Partial Dependence', right: 'Marginal effect of feature on prediction' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'Each method serves a different interpretability need: SHAP for principled attributions, LIME for fast local explanations, permutation importance for global rankings, and PDP for understanding feature effects.',
    },
  ],
}))

export {}
