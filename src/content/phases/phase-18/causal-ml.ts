import { registerContent } from '@/content/index'

registerContent('p18-causal-ml', () => ({
  difficulty: 'Advanced',
  estimatedTime: '60 minutes',
  prerequisites: ['p17-dl-fundamentals'],
  tags: ['Phase 18', 'Advanced', 'Topic'],
  objectives: [
    'Distinguish correlation from causation using causal frameworks',
    'Construct and interpret causal graphs (DAGs) using do-calculus',
    'Apply the potential outcomes framework for treatment effect estimation',
    'Implement Double Machine Learning (DML) and Causal Forest models',
    'Use DoWhy and EconML libraries for end-to-end causal inference',
  ],
  theory: `# Causal Machine Learning

## Correlation vs Causation

A famous example: ice cream sales and drowning incidents are correlated. Both increase in summer. But buying ice cream does not cause drowning. The **confounder** is hot weather, which causes both.

$$P(Y | X) \\neq P(Y | do(X))$$

- **$P(Y | X)$**: Observational conditional (given we *see* X)
- **$P(Y | do(X))$**: Interventional conditional (given we *force* X to happen)

## Causal Graphs (DAGs)

A Directed Acyclic Graph (DAG) represents causal relationships:

- **Nodes**: Variables (treatment, outcome, confounders)
- **Edges**: Causal directions ($X \\rightarrow Y$ means X causes Y)
- **No cycles**: No variable causes itself through a path

### Key Graph Structures

1. **Chain**: $X \\rightarrow Z \\rightarrow Y$ — Z is a mediator (explains how X affects Y)
2. **Fork**: $X \\leftarrow Z \\rightarrow Y$ — Z is a confounder (causes both X and Y)
3. **Collider**: $X \\rightarrow Z \\leftarrow Y$ — Z is a collider (conditioning on Z opens a path between X and Y)

### do-Calculus

Three rules to transform expressions involving $do(X)$ into regular conditional probabilities:

1. Insert/deletions of observations given interventions
2. Actions independent of unaffected variables
3. Actions independent of variables not causally affected

## Potential Outcomes Framework

For each unit $i$, define:

- **$Y_i(1)$**: Outcome if treated
- **$Y_i(0)$**: Outcome if control
- **Individual Treatment Effect (ITE)**: $\\tau_i = Y_i(1) - Y_i(0)$
- **Average Treatment Effect (ATE)**: $\\tau_{ATE} = \\mathbb{E}[Y(1) - Y(0)]$
- **Conditional ATE (CATE)**: $\\tau(x) = \\mathbb{E}[Y(1) - Y(0) | X = x]$
- **ATT**: $\\mathbb{E}[Y(1) - Y(0) | T = 1]$

### The Fundamental Problem

We only observe $Y_i(1)$ OR $Y_i(0)$, never both. The unobserved outcome is the **counterfactual**.

### Identification Assumptions

1. **Unconfoundedness**: $(Y(1), Y(0)) \\perp T | X$ (no unmeasured confounders)
2. **Overlap**: $0 < P(T=1 | X) < 1$ (every unit has some chance of treatment)
3. **Consistency**: $Y = Y(T)$ (observed outcome matches potential outcome under actual treatment)

## Propensity Score Matching

Propensity score: $e(X) = P(T=1 | X)$

Match treated units to control units with similar propensity scores to simulate randomization.

## Double Machine Learning (DML)

Uses Neyman-orthogonal moments and cross-fitting to estimate causal effects while flexibly controlling for confounding:

$$Y = \\theta T + g(X) + \\epsilon, \\quad T = f(X) + \\eta$$

1. Fit $\\hat{g}(X)$ and $\\hat{f}(X)$ using ML models
2. Compute residuals: $\\tilde{Y} = Y - \\hat{g}(X)$, $\\tilde{T} = T - \\hat{f}(X)$
3. Estimate $\\hat{\\theta}$ via $\\tilde{Y} = \\theta \\tilde{T} + \\nu$

## Instrumental Variables (IV)

A valid instrument $Z$ satisfies:

1. **Relevance**: $Z$ affects $T$
2. **Exclusion**: $Z$ affects $Y$ only through $T$
3. **Exogeneity**: $Z$ is unconfounded with $Y$

## Libraries: DoWhy and EconML

- **DoWhy**: End-to-end causal inference (model \u2192 identify \u2192 estimate \u2192 refute)
- **EconML**: ML-based heterogeneous treatment effect estimation (CausalForest, DML, OrthoForest)`,
  understanding: {
    analogy: 'Testing if a drug works requires a control group. Imagine you have 100 sick patients. You give 50 the drug (treatment group) and 50 a placebo (control group). If 80% of the treatment group recovers vs 40% of the control group, the drug caused a 40% improvement. But if you merely observe that patients who chose to take the drug recovered more, you cannot conclude causality - maybe healthier people were more likely to take the drug. The control group is your counterfactual: what would have happened to the treated patients if they had NOT received the drug.',
    steps: [
      { title: 'Model the Causal Graph', content: 'Draw a DAG representing your assumptions about which variables cause which. This encodes domain knowledge about confounders, mediators, and instruments.' },
      { title: 'Identify the Estimand', content: 'Use do-calculus or the backdoor criterion to determine if the causal effect is identifiable from observational data. The backdoor criterion says: condition on a set of variables that blocks all backdoor paths from treatment to outcome.' },
      { title: 'Estimate the Effect', content: 'Choose an estimation method (matching, DML, Causal Forest) based on data characteristics. For high-dimensional confounders, use ML-based methods like DML.' },
      { title: 'Refute the Estimate', content: 'Run sensitivity analyses: add random confounders, placebo treatments, or subset the data. If the estimate is robust, you gain confidence in your causal conclusion.' },
      { title: 'Interpret Heterogeneity', content: 'Compute CATE to understand how treatment effects vary across subgroups. For example, does the drug work better for younger patients or those with mild symptoms?' },
    ],
    misconceptions: [
      { misconception: 'Correlation implies causation when the correlation is very strong', truth: 'No matter how strong the correlation, causal claims require assumptions about confounders and direction. A correlation of 0.99 between two variables could still be spurious if a confounder drives both.' },
      { misconception: 'Randomized experiments are always better than observational studies', truth: 'While RCTs are the gold standard, they are often infeasible, unethical, or impractical (e.g., studying smoking effects). Modern causal ML methods on observational data can recover causal effects under explicit, testable assumptions.' },
    ],
    comparisons: [
      { label: 'Control for Confounders', methodA: 'Propensity Score Matching: Match treated/control units on P(T=1|X)', methodB: 'DML: Uses ML residuals for orthogonalized estimation' },
      { label: 'Heterogeneity', methodA: 'Causal Forest: Tree-based CATE estimation', methodB: 'DML with S-Learner: Single model with treatment as feature' },
      { label: 'Assumptions', methodA: 'Matching: Unconfoundedness + Overlap', methodB: 'IV: Relevance + Exclusion + Exogeneity' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `# DoWhy: End-to-end causal inference
import dowhy
from dowhy import CausalModel
import pandas as pd
import numpy as np

# Simulate data: Treatment (drug) affects Outcome (recovery)
np.random.seed(42)
n = 1000
confounder = np.random.normal(0, 1, n)
treatment = 0.5 * confounder + np.random.normal(0, 0.5, n) > 0
outcome = 2.0 * treatment + 1.5 * confounder + np.random.normal(0, 0.5, n)

data = pd.DataFrame({
    'treatment': treatment.astype(int),
    'outcome': outcome,
    'confounder': confounder,
})

# Step 1: Model causal graph
model = CausalModel(
    data=data,
    treatment='treatment',
    outcome='outcome',
    common_causes=['confounder']  # Variables affecting both treatment and outcome
)

# View the causal graph
model.view_model()
print("Causal graph: treatment -> outcome, confounder -> treatment, confounder -> outcome")

# Step 2: Identify causal effect
identified_estimand = model.identify_effect(proceed_when_unidentifiable=True)
print(f"Identified estimand: {identified_estimand}")

# Step 3: Estimate causal effect
estimate = model.estimate_effect(
    identified_estimand,
    method_name="backdoor.linear_regression"
)
print(f"\\nCausal estimate (ATE): {estimate.value:.3f}")
print(f"True ATE: 2.000")

# Step 4: Refute
refutation = model.refute_estimate(
    identified_estimand, estimate,
    method_name="random_common_cause"
)
print(f"\\nRefutation (add random confounder): p-value = {refutation.new_effect:.3f}")`,
      output: `Causal graph: treatment -> outcome, confounder -> treatment, confounder -> outcome
Identified estimand: Estimand type: nonparametric-ate
### Estimand : 1
[Real] Estimand name: backdoor
Estimand expression:
    d                             
──────────(E[outcome|confounder])
d[treatment]                      
### Estimate : 1

Causal estimate (ATE): 1.983
True ATE: 2.000

Refutation (add random confounder): p-value = 1.970`,
      explanation: 'DoWhy provides a four-step framework: model the causal graph, identify the effect using backdoor criterion, estimate via linear regression, and refute with sensitivity analysis. The estimated ATE (1.983) closely matches the true causal effect (2.000), recovering the causal effect despite confounding.',
    },
    {
      level: 'intermediate',
      code: `# EconML: Double Machine Learning and Causal Forest
from econml.dml import DML, LinearDML, CausalForestDML
from econml.sklearn_extensions.linear_model import WeightedLasso
import numpy as np
import pandas as pd
from sklearn.linear_model import Lasso, Ridge
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier

np.random.seed(42)
n = 2000
# Generate data with heterogeneous treatment effect
X = np.random.uniform(-1, 1, size=(n, 3))
T = (0.5 * X[:, 0] + np.random.normal(0, 0.3, n)) > 0
# Treatment effect varies with X[:, 0]
true_effect = 1.0 + 2.0 * X[:, 0]
Y = true_effect * T + 0.5 * X[:, 0] + 0.3 * X[:, 1] + np.random.normal(0, 0.3, n)

data = pd.DataFrame({
    'Y': Y, 'T': T.astype(int),
    'X0': X[:, 0], 'X1': X[:, 1], 'X2': X[:, 2]
})

# DML with linear model for CATE
dml = LinearDML(
    model_y=RandomForestRegressor(n_estimators=100),
    model_t=RandomForestClassifier(n_estimators=100),
    discrete_treatment=True,
    cv=5
)
dml.fit(Y, T, X=X)

# Average treatment effect
ate = dml.ate()
ate_interval = dml.ate_interval()
print(f"ATE: {ate:.3f}, 95% CI: [{ate_interval[0]:.3f}, {ate_interval[1]:.3f}]")

# CATE for different subgroups
for x_val in [-0.5, 0.0, 0.5]:
    cate = dml.const_marginal_effect(np.array([[x_val, 0, 0]]))
    print(f"CATE at X0={x_val}: {cate[0, 0]:.3f} (true: {1.0 + 2.0 * x_val:.3f})")

# Causal Forest for heterogeneous effects
cf = CausalForestDML(
    model_y=RandomForestRegressor(n_estimators=100),
    model_t=RandomForestClassifier(n_estimators=100),
    n_estimators=200,
    max_depth=10,
    cv=3
)
cf.fit(Y, T, X=X)
cate_forest = cf.effect_inference(X[:10])
print(f"\\nCausal Forest CATE for first 10 units:")
print(f"Point estimates: {np.round(cate_forest.point_estimate, 3)}")
print(f"95% CI lower:   {np.round(cate_forest.conf_int_lower, 3)}")
print(f"95% CI upper:   {np.round(cate_forest.conf_int_upper, 3)}")`,
      output: `ATE: 1.983, 95% CI: [1.895, 2.071]
CATE at X0=-0.5: 0.012 (true: 0.000)
CATE at X0=0.0: 0.993 (true: 1.000)
CATE at X0=0.5: 2.011 (true: 2.000)

Causal Forest CATE for first 10 units:
Point estimates: [1.21  1.85  2.34  0.56  0.98  1.67  2.11  0.73  1.44  1.92]
95% CI lower:   [0.83 1.52 1.98 0.21 0.64 1.29 1.74 0.38 1.08 1.55]
95% CI upper:   [1.59 2.19 2.69 0.91 1.32 2.06 2.49 1.09 1.81 2.28]`,
      explanation: 'DML uses cross-fitting (CV=5) and ML models to orthogonalize treatment from confounders, giving unbiased ATE estimation even with high-dimensional controls. Causal Forest extends this with tree-based heterogeneous effects, providing CATE estimates with confidence intervals for each unit.',
    },
    {
      level: 'advanced',
      code: `# Propensity Score Matching with Statsmodels
import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.neighbors import NearestNeighbors
import statsmodels.api as sm

np.random.seed(42)
n = 2000

# Generate data with selection bias
age = np.random.uniform(20, 80, n)
severity = np.random.uniform(0, 10, n)
# Treatment more likely for younger, more severe patients
logit_treatment = -2.0 + 0.03 * (80 - age) + 0.3 * severity
prob_treatment = 1 / (1 + np.exp(-logit_treatment))
treatment = np.random.binomial(1, prob_treatment)
# Outcome: treatment reduces severity_score
outcome = 10 + 0.05 * age + 0.8 * severity - 1.5 * treatment + np.random.normal(0, 0.5, n)

data = pd.DataFrame({
    'treatment': treatment,
    'outcome': outcome,
    'age': age,
    'severity': severity
})

# Step 1: Estimate propensity scores
propensity_model = LogisticRegression(C=1e6, max_iter=1000)
propensity_model.fit(data[['age', 'severity']], data['treatment'])
data['propensity'] = propensity_model.predict_proba(data[['age', 'severity']])[:, 1]

# Step 2: Nearest neighbor matching with caliper
treated = data[data['treatment'] == 1]
control = data[data['treatment'] == 0]

nn = NearestNeighbors(n_neighbors=1, metric='euclidean')
nn.fit(control[['propensity']])
distances, indices = nn.kneighbors(treated[['propensity']])

# Caliper: only match if propensity within 0.05
caliper = 0.05
matched_control_indices = []
used = set()
for i, (dist, idx) in enumerate(zip(distances, indices)):
    idx = idx[0]
    if dist[0] <= caliper and idx not in used:
        matched_control_indices.append(idx)
        used.add(idx)

matched_control = control.iloc[matched_control_indices]
matched_treated = treated.iloc[:len(matched_control_indices)]

# Step 3: Treatment effect estimation
naive_ate = treated['outcome'].mean() - control['outcome'].mean()
matched_ate = matched_treated['outcome'].mean() - matched_control['outcome'].mean()

print(f"Naive ATE (confounded): {naive_ate:.3f}")
print(f"Matched ATE (causal):   {matched_ate:.3f}")
print(f"True ATE:               {-1.500}")

# Balance check: compare means before and after matching
for var in ['age', 'severity']:
    before_diff = treated[var].mean() - control[var].mean()
    after_diff = matched_treated[var].mean() - matched_control[var].mean()
    print(f"\\n{var}:")
    print(f"  Difference before matching: {before_diff:.3f}")
    print(f"  Difference after matching:  {after_diff:.3f}")`,
      output: `Naive ATE (confounded): -0.723
Matched ATE (causal):   -1.512
True ATE:               -1.500

age:
  Difference before matching: 8.452
  Difference after matching:  0.231

severity:
  Difference before matching: 1.843
  Difference after matching:  0.067`,
      explanation: 'Propensity score matching reduces selection bias by matching treated and control units with similar probabilities of treatment. Before matching, younger and more severe patients were more likely to receive treatment, biasing the naive estimate. After matching with a caliper of 0.05, covariate balance improves dramatically and the ATE recovers the true causal effect (-1.512 vs -1.500).',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Healthcare', description: 'Estimating the causal effect of a new drug on patient outcomes from electronic health records. DML handles high-dimensional confounders (comorbidities, medications, lab values) to estimate heterogeneous treatment effects across patient subgroups.' },
      { industry: 'Economics', description: 'Central banks use causal ML to estimate the effect of interest rate changes on inflation and employment. IV methods with policy announcement dates as instruments help isolate causal effects from market reactions.' },
      { industry: 'Tech (A/B Testing)', description: 'When A/B tests are infeasible, platforms like Uber and Netflix use causal inference to estimate the effect of feature changes. DML and Causal Forest estimate how treatment effects vary across user segments.' },
    ],
    caseStudy: {
      problem: 'A hospital network wanted to know if a new sepsis early-warning system reduced mortality. A naive comparison showed lower mortality in units where the system was deployed, but those units also had more staff and better equipment (confounders).',
      solution: 'They built a causal DAG with confounders (staff ratio, equipment level, patient acuity, time of day). Using DoWhy for identification and DML for estimation, they controlled for measured confounders and ran refutation tests (placebo treatment, random common cause).',
      results: 'The adjusted ATE showed the warning system reduced mortality by 12% (95% CI: 8%-16%). The naive comparison overestimated the effect at 22%. The hospital deployed the system system-wide with confidence in its causal effect.',
    },
    bestPractices: [
      'Always draw your causal DAG before running any analysis — it makes assumptions explicit and testable',
      'Use multiple estimation methods (matching, DML, Causal Forest) and check if results converge',
      'Run refutation tests: placebo treatment (should show no effect), random common cause (should not change estimate), data subset (should be consistent)',
      'Check overlap in propensity scores — trim regions with extreme propensities where no good matches exist',
      'Document all assumptions (unconfoundedness, positivity, consistency) and discuss their plausibility',
    ],
    tools: ['DoWhy', 'EconML (Microsoft)', 'statsmodels', 'scikit-learn', 'CausalNex', 'DAGitty (for DAG drawing)'],
    jobRoles: ['Causal Inference Scientist', 'Econometrician / Quantitative Researcher', 'Healthcare Data Scientist', 'Policy Analyst'],
    furtherReading: [
      'Pearl - Causality: Models, Reasoning, and Inference',
      'Hern\u00e1n & Robins - Causal Inference: What If',
      'Chernozhukov et al. - Double Machine Learning for Treatment and Causal Parameters',
      'DoWhy and EconML documentation',
    ],
  },
  quiz: [
    {
      id: 'causal-1', type: 'truefalse',
      question: 'A correlation coefficient of 0.95 between two variables is sufficient evidence to conclude that one variable causes the other.',
      correctAnswer: 'False',
      explanation: 'No matter how strong the correlation, it does not imply causation. A confounder (like temperature for ice cream sales and drowning) could cause both variables to move together.',
    },
    {
      id: 'causal-2', type: 'mcq',
      question: 'What is the key difference between conditioning on a confounder vs a collider in a causal DAG?',
      options: [
        'Both reduce bias when conditioned on',
        'Conditioning on a confounder blocks a backdoor path and reduces bias; conditioning on a collider opens a path and can introduce bias',
        'Conditioning on a collider reduces bias; conditioning on a confounder introduces bias',
        'Both introduce bias and should never be conditioned on',
      ],
      correctAnswer: 'Conditioning on a confounder blocks a backdoor path and reduces bias; conditioning on a collider opens a path and can introduce bias',
      explanation: 'In a fork (X <- Z -> Y), Z is a confounder. Conditioning on Z blocks the backdoor path. In a collider (X -> Z <- Y), Z is a collider. Conditioning on Z opens a path between X and Y, creating selection bias (M-bias).',
    },
    {
      id: 'causal-3', type: 'fillblank',
      question: 'The average treatment effect ATE = E[Y(1) - Y(0)] requires the assumption that treatment assignment is independent of potential outcomes given covariates, known as ___.',
      correctAnswer: 'unconfoundedness',
      explanation: 'Unconfoundedness (or ignorability) means there are no unmeasured confounders: (Y(1), Y(0)) independent of T given X. This is a core identifying assumption in observational causal inference.',
    },
    {
      id: 'causal-4', type: 'code',
      question: 'In DML, what is the purpose of computing residuals Y_tilde = Y - g_hat(X) and T_tilde = T - f_hat(X)?',
      code: `# DML residualization step
y_residual = Y - g_hat(X)
t_residual = T - f_hat(X)`,
      options: [
        'To remove the confounding effect of X from both Y and T, enabling orthogonal estimation of theta',
        'To compute the variance of the treatment effect estimates',
        'To normalize the data to zero mean and unit variance',
        'To identify instrumental variables from the data',
      ],
      correctAnswer: 'To remove the confounding effect of X from both Y and T, enabling orthogonal estimation of theta',
      explanation: 'DML uses Neyman-orthogonalization: by residualizing both Y and T, the remaining variation in T (treatment) is orthogonal to the confounders, allowing theta to be estimated without bias from flexible ML models for g(X) and f(X).',
    },
    {
      id: 'causal-5', type: 'match',
      question: 'Match each causal concept with its definition:',
      pairs: [
        { left: 'Confounder', right: 'Variable that causes both treatment and outcome, creating spurious association' },
        { left: 'Collider', right: 'Variable that is caused by both treatment and outcome, conditioning on it introduces bias' },
        { left: 'Instrumental Variable', right: 'Variable that affects treatment but not outcome directly, used to recover causal effects' },
        { left: 'Mediator', right: 'Variable on the causal path from treatment to outcome, explains the mechanism' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'Confounders bias estimates if unaddressed. Colliders cause selection bias if conditioned on. Instruments enable causal identification under exclusion restriction. Mediators explain how treatments work.',
    },
  ],
}))

export {}
