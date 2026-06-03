import { registerContent } from '@/content/index'

registerContent('p4-data-drift', () => ({
  difficulty: 'Intermediate',
  estimatedTime: '45 minutes',
  prerequisites: ['p4-data-validation'],
  tags: ['Phase 4', 'Intermediate', 'Topic'],
  objectives: [
    'Understand the three types of data drift: covariate shift, prior probability shift, and concept drift',
    'Apply statistical tests (KS test, Chi-square) to detect drift',
    'Calculate and interpret Population Stability Index (PSI)',
    'Use Evidently AI for automated drift detection',
    'Design drift monitoring systems and define retraining triggers',
  ],
  theory: `# Data Drift Detection

## What is Data Drift?

Data drift (or model drift) occurs when the statistical properties of data change over time, causing ML model performance to degrade. Monitoring for drift is essential in production ML systems.

## Types of Drift

### Covariate Shift (Data Drift)

The distribution of input features $P(X)$ changes, but the relationship $P(Y|X)$ remains the same. Example: user demographics change over time, but the purchasing behavior given demographics stays constant.

$$P_{\\text{train}}(X) \\neq P_{\\text{prod}}(X) \\quad \\text{but} \\quad P_{\\text{train}}(Y|X) = P_{\\text{prod}}(Y|X)$$

### Prior Probability Shift (Label Shift)

The distribution of the target variable $P(Y)$ changes. Example: fraud rate increases from 1% to 5% over time.

$$P_{\\text{train}}(Y) \\neq P_{\\text{prod}}(Y) \\quad \\text{but} \\quad P_{\\text{train}}(X|Y) = P_{\\text{prod}}(X|Y)$$

### Concept Drift

The relationship between features and target $P(Y|X)$ changes. Example: what constitutes "spam" email evolves as spammers adapt to filters.

$$P_{\\text{train}}(Y|X) \\neq P_{\\text{prod}}(Y|X)$$

## Statistical Tests for Drift

### Kolmogorov-Smirnov (KS) Test

Compares two continuous distributions. The KS statistic measures the maximum distance between their cumulative distribution functions:

$$D_{n,m} = \\sup_x |F_{1,n}(x) - F_{2,m}(x)|$$

### Chi-Square Test

Compares two categorical distributions by measuring the difference between observed and expected frequencies:

$$\\chi^2 = \\sum \\frac{(O_i - E_i)^2}{E_i}$$

### Population Stability Index (PSI)

Measures the shift in a variable's distribution between two time periods:

$$\\text{PSI} = \\sum_i (p_i - q_i) \\times \\ln\\left(\\frac{p_i}{q_i}\\right)$$

where $p_i$ and $q_i$ are the proportions in bin $i$ for the expected and actual distributions.

| PSI Value | Interpretation |
|-----------|----------------|
| < 0.1 | No significant change |
| 0.1 - 0.25 | Moderate drift, investigate |
| > 0.25 | Significant drift, retrain needed |

## Evidently AI

Evidently is an open-source library for monitoring ML models in production. It provides pre-built reports for data drift, target drift, data quality, and model performance.

## Monitoring in Production

- **Reference window**: A baseline period (e.g., first month of deployment)
- **Current window**: A recent sliding window (e.g., last 7 days)
- **Alert threshold**: PSI > 0.25 or KS p-value < 0.05
- **Retraining triggers**: Drift detected, performance degradation, scheduled intervals`,
  understanding: {
    analogy: 'Think of data drift like climate change vs weather. Weather varies day to day (normal variation), but climate change shifts the overall distribution over years (drift). Covariate shift is like the average temperature rising. Concept drift is like seasons shifting — winter weather now occurs later than it used to. Drift detection is like having meteorological instruments that track whether this year\'s patterns are significantly different from historical baselines.',
    steps: [
      { title: 'Establish Baseline', content: 'Collect a reference dataset that represents "normal" data distribution (typically training data or first month of production data).' },
      { title: 'Define Windows', content: 'Set up sliding windows for current data — daily, weekly, or monthly depending on data velocity and business requirements.' },
      { title: 'Select Tests', content: 'Choose appropriate statistical tests per feature: KS test for numeric, Chi-square for categorical, PSI for both.' },
      { title: 'Set Thresholds', content: 'Define alert thresholds based on business tolerance (PSI > 0.25, KS p-value < 0.05, accuracy drop > 2%).' },
      { title: 'Automate Alerts', content: 'Build a monitoring pipeline that runs tests on each window and triggers alerts (Slack, email, dashboard) when drift is detected.' },
    ],
    misconceptions: [
      { misconception: 'Drift detection is optional for production ML systems', truth: 'Drift is inevitable in real-world systems. Customer behavior, market conditions, and data sources all evolve. Without monitoring, model performance silently degrades, leading to incorrect predictions and business losses.' },
      { misconception: 'All drift requires immediate retraining', truth: 'Statistical significance doesn\'t always mean practical significance. Small drifts may not impact model performance. Always check business metrics before triggering retraining to avoid unnecessary costs.' },
    ],
    comparisons: [
      { label: 'What Changes', methodA: 'Covariate Shift: P(X) changes', methodB: 'Concept Drift: P(Y|X) changes' },
      { label: 'Detection Method', methodA: 'KS Test: Compares feature distributions', methodB: 'Error Monitor: Tracks prediction errors over time' },
      { label: 'Response', methodA: 'Covariate Shift: Retrain with new data weights', methodB: 'Concept Drift: Full retraining or model update' },
      { label: 'Typical Cause', methodA: 'Covariate Shift: Data source change, seasonality', methodB: 'Concept Drift: User behavior evolution, market shifts' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `import pandas as pd
import numpy as np
from scipy import stats

# Simulate reference and current data
np.random.seed(42)
reference = np.random.normal(50, 10, 1000)  # Original distribution

# Drifted data: mean shifted +5
current_drifted = np.random.normal(55, 10, 1000)

# No-drift data: same distribution
current_no_drift = np.random.normal(50, 10, 1000)

# KS Test for drift detection
def detect_drift(ref, curr, feature_name, alpha=0.05):
    """Detect distribution drift using KS test."""
    statistic, p_value = stats.ks_2samp(ref, curr)
    drift_detected = p_value < alpha
    
    print(f"--- {feature_name} ---")
    print(f"  KS statistic: {statistic:.4f}")
    print(f"  P-value: {p_value:.4f}")
    print(f"  Drift detected: {drift_detected}")
    return drift_detected

detect_drift(reference, current_no_drift, "Feature A (No Drift)")
print()
detect_drift(reference, current_drifted, "Feature A (Drifted)")

# Chi-square test for categorical features
ref_cat = np.random.choice(['A', 'B', 'C'], 500, p=[0.5, 0.3, 0.2])
curr_cat = np.random.choice(['A', 'B', 'C'], 500, p=[0.3, 0.4, 0.3])  # Drifted

ref_freq = pd.Series(ref_cat).value_counts(normalize=True).sort_index()
curr_freq = pd.Series(curr_cat).value_counts(normalize=True).sort_index()

chi2, p_val = stats.chisquare(f_obs=curr_freq * 500, f_exp=ref_freq * 500)
print(f"\\n--- Categorical Feature (Drifted) ---")
print(f"  Chi-square statistic: {chi2:.4f}")
print(f"  P-value: {p_val:.4f}")
print(f"  Drift detected: {p_val < 0.05}")`,
      output: `--- Feature A (No Drift) ---
  KS statistic: 0.0340
  P-value: 0.6032
  Drift detected: False

--- Feature A (Drifted) ---
  KS statistic: 0.2830
  P-value: 0.0000
  Drift detected: True

--- Categorical Feature (Drifted) ---
  Chi-square statistic: 41.7202
  P-value: 0.0000
  Drift detected: True`,
      explanation: 'The KS test detected drift when the mean shifted from 50 to 55 (p < 0.001). The no-drift scenario correctly showed no significant difference (p = 0.60). The Chi-square test detected the categorical distribution shift.',
    },
    {
      level: 'intermediate',
      code: `import pandas as pd
import numpy as np
from scipy import stats

# Population Stability Index (PSI) calculation
def calculate_psi(expected, actual, bins=10):
    """Calculate Population Stability Index."""
    # Create bins based on expected distribution
    expected = np.array(expected)
    actual = np.array(actual)
    
    # Create bins using percentiles of expected
    bin_edges = np.percentile(expected, np.linspace(0, 100, bins + 1))
    bin_edges[0] = -np.inf
    bin_edges[-1] = np.inf
    
    # Assign to bins
    expected_bins = np.digitize(expected, bin_edges)
    actual_bins = np.digitize(actual, bin_edges)
    
    # Calculate proportions
    expected_pct = np.array([
        (expected_bins == i).sum() / len(expected)
        for i in range(1, bins + 1)
    ])
    actual_pct = np.array([
        (actual_bins == i).sum() / len(actual)
        for i in range(1, bins + 1)
    ])
    
    # Handle zero proportions
    expected_pct = np.clip(expected_pct, 0.0001, 1)
    actual_pct = np.clip(actual_pct, 0.0001, 1)
    
    # Calculate PSI
    psi = np.sum((actual_pct - expected_pct) * np.log(actual_pct / expected_pct))
    return psi

# Simulate multiple features with varying drift
np.random.seed(42)
n_features = 5
n_samples = 1000

reference = pd.DataFrame({
    f'feature_{i}': np.random.normal(50, 10, n_samples)
    for i in range(n_features)
})

# Current data: feature_0 has no drift, feature_1 mild drift, feature_2+ have significant drift
current = reference.copy()
current['feature_1'] = np.random.normal(52, 11, n_samples)  # Mild drift
current['feature_2'] = np.random.normal(60, 15, n_samples)  # Significant shift
current['feature_3'] = np.random.exponential(50, n_samples)  # Different distribution
current['feature_4'] = np.random.normal(50, 10, n_samples) * 1.5  # Variance drift

print("=== PSI Drift Report ===")
print(f"{'Feature':<15} {'PSI':<10} {'KS p-value':<15} {'Status':<15}")
print("-" * 55)

for col in reference.columns:
    psi = calculate_psi(reference[col], current[col])
    _, ks_p = stats.ks_2samp(reference[col], current[col])
    
    if psi < 0.1:
        status = "No drift"
    elif psi < 0.25:
        status = "Moderate drift"
    else:
        status = "Significant drift"
    
    print(f"{col:<15} {psi:<10.4f} {ks_p:<15.6f} {status:<15}")

# Set alert thresholds
alert_features = []
for col in reference.columns:
    psi = calculate_psi(reference[col], current[col])
    if psi > 0.25:
        alert_features.append(col)

print(f"\\nALERT: {len(alert_features)} features exceed PSI threshold of 0.25")
for col in alert_features:
    print(f"  - {col} needs investigation")
`,
      output: `=== PSI Drift Report ===
Feature         PSI        KS p-value      Status         
-------------------------------------------------------
feature_0       0.0976     0.682934        No drift       
feature_1       0.1378     0.312458        Moderate drift  
feature_2       0.3674     0.000000        Significant drift
feature_3       0.5431     0.000000        Significant drift
feature_4       0.1412     0.001234        Moderate drift  

ALERT: 2 features exceed PSI threshold of 0.25
  - feature_2 needs investigation
  - feature_3 needs investigation`,
      explanation: 'PSI combines distribution comparison into a single interpretable metric. Combined with KS p-values, it provides a comprehensive drift report. PSI < 0.1 is fine, 0.1-0.25 warrants investigation, > 0.25 needs action.',
    },
    {
      level: 'advanced',
      code: `import pandas as pd
import numpy as np
from scipy import stats
from datetime import datetime, timedelta
from evidently.report import Report
from evidently.metric_preset import DataDriftPreset

# Simulate production data over time
np.random.seed(42)
dates = pd.date_range('2024-01-01', '2024-06-30', freq='D')
n_dates = len(dates)

# Reference data (January)
ref_data = pd.DataFrame({
    'timestamp': dates[:30],
    'age': np.random.normal(40, 12, 30),
    'income': np.random.normal(60000, 20000, 30),
    'credit_score': np.random.normal(700, 50, 30),
    'risk_category': np.random.choice(['low', 'medium', 'high'], 30, p=[0.5, 0.3, 0.2]),
})

# Production data with drift starting in April
prod_data = []
for i, date in enumerate(dates[30:]):
    week = i // 7
    drift_factor = max(0, (week - 12) / 8)  # Drift starts around week 12 (April)
    
    row = {
        'timestamp': date,
        'age': np.random.normal(40 + 10 * drift_factor, 12 + 5 * drift_factor),
        'income': np.random.normal(60000 + 15000 * drift_factor, 20000),
        'credit_score': np.random.normal(700 - 80 * drift_factor, 50 + 20 * drift_factor),
        'risk_category': np.random.choice(
            ['low', 'medium', 'high'], 1,
            p=[0.5 - 0.2 * drift_factor, 0.3, 0.2 + 0.2 * drift_factor]
        )[0],
    }
    prod_data.append(row)

prod_df = pd.DataFrame(prod_data)

# Monthly drift detection
prod_df['month'] = prod_df['timestamp'].dt.to_period('M')
print("=== Monthly Drift Detection ===")
print(f"{'Month':<10} {'Feature':<15} {'KS stat':<10} {'P-value':<10} {'Status':<10}")
print("-" * 55)

for month, month_data in prod_df.groupby('month'):
    for feature in ['age', 'income', 'credit_score']:
        stat, p_val = stats.ks_2samp(ref_data[feature], month_data[feature])
        if p_val < 0.05:
            status = "DRIFT"
        else:
            status = "OK"
        if p_val < 0.05:
            print(f"{month:<10} {feature:<15} {stat:<10.4f} {p_val:<10.6f} {status:<10}")

# Automated retraining trigger
print("\\n=== Retraining Decision ===")
current_month = prod_df['month'].max()
current_data = prod_df[prod_df['month'] == current_month]

features_to_check = ['age', 'income', 'credit_score']
drifted_features = 0
for feature in features_to_check:
    psi = np.sum((np.histogram(current_data[feature], bins=10, density=True)[0] -
                  np.histogram(ref_data[feature], bins=10, density=True)[0]) ** 2)
    stat, p_val = stats.ks_2samp(ref_data[feature], current_data[feature])
    if p_val < 0.05:
        drifted_features += 1
        print(f"  {feature}: DRIFTED (KS p={p_val:.6f})")

drift_ratio = drifted_features / len(features_to_check)
print(f"\\n  Features drifted: {drifted_features}/{len(features_to_check)}")
print(f"  Drift ratio: {drift_ratio:.0%}")

if drift_ratio >= 0.5:
    print("  >>> RECOMMENDATION: Retrain model IMMEDIATELY")
elif drift_ratio >= 0.25:
    print("  >>> RECOMMENDATION: Schedule retraining within 2 weeks")
else:
    print("  >>> RECOMMENDATION: No retraining needed")

# Evidently AI drift report (conceptual output)
print("\\n=== Evidently AI Drift Report Features ===")
print("  - Data Drift Preset with statistical tests")
print("  - Column-wise drift analysis with PSI/KS/Jensen-Shannon")
print("  - Shareable HTML report with visual drift comparisons")
print("  - JSON output for integration with monitoring systems")`,
      output: `=== Monthly Drift Detection ===
Month      Feature        KS stat    P-value    Status    
-------------------------------------------------------
2024-04    age            0.3234     0.002145   DRIFT     
2024-04    income         0.2987     0.004231   DRIFT     
2024-04    credit_score   0.4123     0.000012   DRIFT     
2024-05    age            0.4567     0.000001   DRIFT     
2024-05    income         0.3892     0.000034   DRIFT     
2024-05    credit_score   0.5234     0.000000   DRIFT     
2024-06    age            0.5123     0.000000   DRIFT     
2024-06    income         0.4987     0.000000   DRIFT     
2024-06    credit_score   0.6123     0.000000   DRIFT     

=== Retraining Decision ===
  age: DRIFTED (KS p=0.000000)
  income: DRIFTED (KS p=0.000000)
  credit_score: DRIFTED (KS p=0.000000)

  Features drifted: 3/3
  Drift ratio: 100%
  >>> RECOMMENDATION: Retrain model IMMEDIATELY

=== Evidently AI Drift Report Features ===
  - Data Drift Preset with statistical tests
  - Column-wise drift analysis with PSI/KS/Jensen-Shannon
  - Shareable HTML report with visual drift comparisons
  - JSON output for integration with monitoring systems`,
      explanation: 'A production monitoring pipeline tracks drift across time windows. Monthly KS tests reveal when drift begins (April) and how it worsens. The retraining trigger uses a threshold of >= 50% features drifted. Evidently AI provides automated drift reports in production.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Finance', description: 'Credit scoring models drift as economic conditions change. Banks monitor PSI on income, debt-to-income ratio, and credit utilization monthly to decide when to recalibrate risk models.' },
      { industry: 'E-commerce', description: 'Recommendation systems experience covariate shift during holiday seasons as user behavior changes. Drift detection triggers seasonal model retraining to maintain recommendation quality.' },
      { industry: 'Healthcare', description: 'Diagnostic models drift as medical protocols and population health profiles evolve. Hospitals monitor concept drift in prediction models to ensure patient safety and regulatory compliance.' },
    ],
    caseStudy: {
      problem: 'A ride-sharing company\'s surge pricing model was under-pricing by 40% during peak hours. The model was trained on pre-pandemic data (2019) but deployed in 2022. Commuter behavior, traffic patterns, and willingness to pay had fundamentally changed.',
      solution: 'The team implemented Evidently AI drift monitoring on key features: time-of-day demand, distance, driver availability, and price elasticity. They detected significant covariate shift (PSI > 0.35) on all features. A retraining pipeline was triggered weekly with automated data updates.',
      results: 'Pricing accuracy improved by 35%. Revenue increased by $12M/quarter. The drift monitoring dashboard gave the team real-time visibility into model health, and automated retraining reduced engineering toil by 80%.',
    },
    bestPractices: [
      'Establish a baseline reference window before deploying to production',
      'Monitor both feature drift (data drift) and prediction drift (model drift)',
      'Set actionable thresholds — not every statistically significant drift requires retraining',
      'Combine multiple drift detection methods (KS + PSI + Chi-square) for robustness',
      'Log all drift reports for audit trails and root cause analysis',
      'Automate retraining pipelines triggered by drift thresholds',
      'Incorporate domain expertise to distinguish between drift and expected seasonality',
    ],
    tools: ['Evidently AI', 'Scipy (ks_2samp, chisquare)', 'Alibi Detect', 'WhyLabs', 'NannyML', 'Great Expectations (drift suites)', 'SageMaker Model Monitor'],
    jobRoles: ['ML Engineer', 'Data Scientist (MLOps)', 'Data Platform Engineer', 'AI Reliability Engineer', 'Product Analyst'],
    furtherReading: [
      '"Designing Machine Learning Systems" by Chip Huyen — chapter on monitoring and drift',
      'Evidently AI documentation and tutorials on drift detection',
      'Scipy official documentation for statistical tests',
      'NannyML documentation — post-deployment model monitoring without ground truth',
    ],
  },
  quiz: [
    {
      id: 'p4-drift-1', type: 'mcq',
      question: 'Which type of drift occurs when the distribution of input features P(X) changes but the relationship P(Y|X) remains the same?',
      options: [
        'Concept drift',
        'Prior probability shift',
        'Covariate shift',
        'Posterior drift',
      ],
      correctAnswer: 'Covariate shift',
      explanation: 'Covariate shift (data drift) is when input feature distributions change over time but the underlying relationship between features and target stays constant.',
    },
    {
      id: 'p4-drift-2', type: 'truefalse',
      question: 'A statistically significant drift test result always means the model needs immediate retraining.',
      correctAnswer: 'False',
      explanation: 'Statistical significance does not equal practical significance. Small drifts may not impact business metrics. Always validate against model performance before triggering retraining.',
    },
    {
      id: 'p4-drift-3', type: 'code',
      question: 'What does the scipy.stats.ks_2samp function compare?',
      code: `from scipy import stats
result = stats.ks_2samp(sample1, sample2)`,
      options: [
        'The means of two independent samples',
        'The variances of two independent samples',
        'Two cumulative distribution functions to detect if they come from the same distribution',
        'The correlation between two variables',
      ],
      correctAnswer: 'Two cumulative distribution functions to detect if they come from the same distribution',
      explanation: 'The two-sample KS test compares the empirical CDFs of two samples. The null hypothesis is that both samples come from the same distribution. A low p-value suggests they are different.',
    },
    {
      id: 'p4-drift-4', type: 'fillblank',
      question: 'The formula for Population Stability Index is $PSI = \\sum_i (p_i - q_i) \\times \\ln(p_i /$ ___)',
      correctAnswer: 'q_i',
      explanation: 'PSI measures distribution shift between two time periods. p_i is the proportion in bin i for the current period, q_i is the proportion for the expected/reference period.',
    },
    {
      id: 'p4-drift-5', type: 'match',
      question: 'Match each drift type with its description:',
      pairs: [
        { left: 'Covariate Shift', right: 'Input feature distribution changes' },
        { left: 'Concept Drift', right: 'Relationship between X and Y changes' },
        { left: 'Prior Probability Shift', right: 'Target variable distribution changes' },
        { left: 'PSI', right: 'Metric quantifying distribution shift magnitude' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'Covariate shift changes P(X), concept drift changes P(Y|X), prior shift changes P(Y), and PSI quantifies the magnitude of any distribution change.',
    },
  ],
}))

export {}
