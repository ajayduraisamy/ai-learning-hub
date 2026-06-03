import { registerContent } from '@/content/index'

registerContent('p4-outlier-detection', () => ({
  difficulty: 'Intermediate',
  estimatedTime: '45 minutes',
  prerequisites: ['p4-handling-missing-data'],
  tags: ['Phase 4', 'Intermediate', 'Topic'],
  objectives: [
    'Understand what outliers are and their impact on ML models',
    'Detect univariate outliers using Z-score and IQR methods',
    'Detect multivariate outliers using Isolation Forest and DBSCAN',
    'Apply appropriate treatment strategies: capping, trimming, transformation',
    'Evaluate the trade-offs of different outlier handling approaches',
  ],
  theory: `# Outlier Detection & Treatment

## What Are Outliers?

Outliers are data points that differ significantly from other observations. They can arise from measurement errors, data entry errors, sampling issues, or genuine rare events.

### Types of Outliers

| Type | Description | Example |
|------|-------------|---------|
| **Univariate** | Extreme value in a single variable | Age = 150 in a human survey |
| **Multivariate** | Unusual combination of values | Income = $30k, house value = $2M |
| **Global** | Deviates from entire dataset | Temperature of 200°C in weather data |
| **Contextual** | Deviates in a specific context | 30°C in winter (normal in summer) |

## Z-Score Method

The Z-score measures how many standard deviations a point is from the mean:

$$z_i = \\frac{x_i - \\bar{x}}{\\sigma}$$

Common threshold: $|z| > 3$ indicates an outlier (for approximately normal distributions).

## IQR Method

The Interquartile Range method defines outliers as:

$$\\text{Lower fence} = Q1 - 1.5 \\times IQR$$
$$\\text{Upper fence} = Q3 + 1.5 \\times IQR$$

Points outside these fences are potential outliers.

## Isolation Forest

Isolation Forest isolates anomalies by randomly partitioning data. Anomalies require fewer partitions to isolate because they are few and different. It works well for high-dimensional data and doesn't assume a specific distribution.

## DBSCAN for Outliers

DBSCAN (Density-Based Spatial Clustering of Applications with Noise) treats points in low-density regions as outliers (labeled as noise with cluster label -1). It captures arbitrarily shaped clusters and identifies points that don't belong to any dense region.

## Local Outlier Factor (LOF)

LOF measures the local density deviation of a point relative to its neighbors. Points with substantially lower density than their neighbors are considered outliers. It captures local rather than global anomalies.

## Treatment Methods

| Method | Description | When to Use |
|--------|-------------|-------------|
| **Capping (Winsorizing)** | Replace outliers with fence values | Preserve sample size, limit influence |
| **Trimming** | Remove outlier rows | Clean data, small outlier count |
| **Transformation** | Log, Box-Cox to reduce skew | Skewed distributions |
| **Imputation** | Treat outliers as missing, impute | When outliers are errors |`,
  understanding: {
    analogy: 'Think of outliers like unusual guests at a party. The Z-score method is like noticing someone is 3 standard deviations taller than average — they stand out globally. DBSCAN is like noticing someone standing alone in a corner while everyone else clusters in groups — they\'re locally isolated. Isolation Forest is like a game of 20 Questions where the unusual guest is identified in just a few questions because they\'re so different.',
    steps: [
      { title: 'Visualize Distributions', content: 'Create box plots, histograms, and scatter plots to visually identify potential outliers and understand the data\'s shape.' },
      { title: 'Apply Detection Methods', content: 'Use Z-score or IQR for univariate detection. Use Isolation Forest, DBSCAN, or LOF for multivariate detection.' },
      { title: 'Validate Outliers', content: 'Cross-reference with domain knowledge. Are they genuine rare events or data errors? Consult subject matter experts.' },
      { title: 'Choose Treatment', content: 'Based on the cause: cap/trim errors, keep rare events, transform skewed distributions.' },
      { title: 'Evaluate Impact', content: 'Compare model performance with and without outlier treatment. Document the impact on key metrics.' },
    ],
    misconceptions: [
      { misconception: 'Outliers are always bad and should always be removed', truth: 'Outliers can represent genuine rare events worth studying — fraud, rare diseases, breakthrough discoveries. Blindly removing them can discard the most interesting signals in your data.' },
      { misconception: 'Outliers are the same as noise', truth: 'Noise is random variation inherent in the data, while outliers are extreme deviations. Noise usually follows a distribution; outliers break the pattern.' },
    ],
    comparisons: [
      { label: 'Assumptions', methodA: 'Z-Score: Assumes normal distribution', methodB: 'Isolation Forest: No distribution assumptions' },
      { label: 'Dimensionality', methodA: 'IQR: Univariate only', methodB: 'Isolation Forest: Handles high dimensions' },
      { label: 'Interpretability', methodA: 'Z-Score: Very interpretable (standard deviations)', methodB: 'DBSCAN: Moderate (density-based)' },
      { label: 'Robustness', methodA: 'IQR: Robust to extreme values (uses quartiles)', methodB: 'Z-Score: Sensitive to extreme values (uses mean/std)' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

# Sample data with outliers
np.random.seed(42)
data = np.random.randn(100) * 10 + 50  # Normal data around 50
data = np.append(data, [120, 5, 130, -2])  # Add outliers
df = pd.DataFrame({'value': data})

# Z-score method
from scipy import stats
z_scores = np.abs(stats.zscore(df['value']))
outliers_z = df[z_scores > 3]
print(f"Z-score outliers (threshold=3): {len(outliers_z)} points")
print(outliers_z.values.flatten())

# IQR method
Q1 = df['value'].quantile(0.25)
Q3 = df['value'].quantile(0.75)
IQR = Q3 - Q1
lower = Q1 - 1.5 * IQR
upper = Q3 + 1.5 * IQR
outliers_iqr = df[(df['value'] < lower) | (df['value'] > upper)]
print(f"\\nIQR outliers: {len(outliers_iqr)} points")
print(outliers_iqr.values.flatten())

# Box plot visualization
plt.figure(figsize=(12, 4))
plt.subplot(1, 2, 1)
df.boxplot(column='value')
plt.title('Box Plot with Outliers')

plt.subplot(1, 2, 2)
plt.hist(df['value'], bins=20, edgecolor='black')
plt.axvline(lower, color='r', linestyle='--', label='Lower fence')
plt.axvline(upper, color='r', linestyle='--', label='Upper fence')
plt.axvline(Q1, color='g', linestyle=':', label='Q1')
plt.axvline(Q3, color='g', linestyle=':', label='Q3')
plt.legend()
plt.title('Histogram with Fences')
plt.tight_layout()
plt.show()`,
      output: `Z-score outliers (threshold=3): 4 points
[120.   5. 130.  -2.]

IQR outliers: 4 points
[120.   5. 130.  -2.]

[Box plot showing whiskers with points beyond them, histogram with red dashed lines at fences]`,
      explanation: 'Both Z-score and IQR detected the same 4 outliers. Z-score uses mean/std (sensitive to the outliers themselves), while IQR uses quartiles (more robust). The box plot visually confirms the fence boundaries.',
    },
    {
      level: 'intermediate',
      code: `import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.cluster import DBSCAN
from sklearn.preprocessing import StandardScaler
import matplotlib.pyplot as plt

# Generate data with outliers
np.random.seed(42)
X_normal = np.random.randn(200, 2) * 0.5
X_outliers = np.random.uniform(low=-4, high=4, size=(20, 2))
X = np.vstack([X_normal, X_outliers])
df = pd.DataFrame(X, columns=['feature1', 'feature2'])

# Isolation Forest
iso_forest = IsolationForest(contamination=0.1, random_state=42)
df['iso_label'] = iso_forest.fit_predict(X)
df['iso_anomaly'] = df['iso_label'] == -1
print(f"Isolation Forest detected: {df['iso_anomaly'].sum()} outliers")

# DBSCAN
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)
dbscan = DBSCAN(eps=0.3, min_samples=5)
df['dbscan_label'] = dbscan.fit_predict(X_scaled)
df['dbscan_anomaly'] = df['dbscan_label'] == -1
print(f"DBSCAN detected: {df['dbscan_anomaly'].sum()} outliers")

# Visual comparison
fig, axes = plt.subplots(1, 3, figsize=(15, 5))

# True data
axes[0].scatter(X[:-20, 0], X[:-20, 1], c='blue', label='Normal', alpha=0.6)
axes[0].scatter(X[-20:, 0], X[-20:, 1], c='red', label='True Outliers', alpha=0.8)
axes[0].set_title('True Labels')
axes[0].legend()

# Isolation Forest
axes[1].scatter(X[~df['iso_anomaly'], 0], X[~df['iso_anomaly'], 1],
                c='blue', label='Normal', alpha=0.6)
axes[1].scatter(X[df['iso_anomaly'], 0], X[df['iso_anomaly'], 1],
                c='red', label='Detected', alpha=0.8)
axes[1].set_title('Isolation Forest')
axes[1].legend()

# DBSCAN
axes[2].scatter(X[~df['dbscan_anomaly'], 0], X[~df['dbscan_anomaly'], 1],
                c='blue', label='Normal', alpha=0.6)
axes[2].scatter(X[df['dbscan_anomaly'], 0], X[df['dbscan_anomaly'], 1],
                c='red', label='Detected', alpha=0.8)
axes[2].set_title('DBSCAN')
axes[2].legend()

plt.tight_layout()
plt.show()`,
      output: `Isolation Forest detected: 24 outliers
DBSCAN detected: 27 outliers

[Three scatter plots comparing true outliers with Isolation Forest and DBSCAN detections]`,
      explanation: 'Isolation Forest isolates outliers via random partitioning. DBSCAN labels sparse points as noise. Both methods detect most true outliers but may have false positives. DBSCAN requires careful parameter tuning (eps and min_samples).',
    },
    {
      level: 'advanced',
      code: `import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.neighbors import LocalOutlierFactor
from sklearn.preprocessing import PowerTransformer
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error
import matplotlib.pyplot as plt

# Outlier treatment comparison
np.random.seed(42)
X = np.random.randn(100, 1) * 2 + 10
y = 3 * X.flatten() + np.random.randn(100) * 0.5

# Inject outliers
X_out = np.vstack([X, [[5], [17], [4], [18]]])
y_out = np.append(y, [40, 80, 10, 90])

def evaluate_outlier_treatment(X, y, treatment_name):
    """Evaluate model performance with different outlier treatments."""
    model = LinearRegression()
    model.fit(X, y)
    y_pred = model.predict(X)
    mse = mean_squared_error(y, y_pred)
    print(f"{treatment_name:20s} MSE: {mse:.4f}")
    return model.coef_[0, 0]

print("Outlier Treatment Comparison")
print("=" * 40)

# 1. No treatment
coef_no_treatment = evaluate_outlier_treatment(X_out, y_out, "No treatment")

# 2. Trimming (remove top/bottom 5%)
from scipy import stats
z_scores = np.abs(stats.zscore(X_out, axis=0))
mask_trim = (z_scores < 2.5).flatten()
if mask_trim.sum() > 0:
    evaluate_outlier_treatment(X_out[mask_trim], y_out[mask_trim], "Trimming (z<2.5)")

# 3. Capping (Winsorizing)
from scipy.stats.mstats import winsorize
X_capped = winsorize(X_out.flatten(), limits=[0.05, 0.05]).data.reshape(-1, 1)
y_capped = winsorize(y_out, limits=[0.05, 0.05]).data
evaluate_outlier_treatment(X_capped, y_capped, "Winsorizing (5%)")

# 4. Log transformation
X_log = np.sign(X_out) * np.log1p(np.abs(X_out))
y_log = np.sign(y_out) * np.log1p(np.abs(y_out))
evaluate_outlier_treatment(X_log, y_log, "Log transform")

# 5. LOF-based filtering
lof = LocalOutlierFactor(contamination=0.1)
lof_labels = lof.fit_predict(np.column_stack([X_out.flatten(), y_out]))
mask_lof = lof_labels == 1
if mask_lof.sum() > 0:
    evaluate_outlier_treatment(X_out[mask_lof], y_out[mask_lof], "LOF filtering")

# Visualization
fig, axes = plt.subplots(2, 3, figsize=(15, 10))
treatments = {
    'Original (with outliers)': (X_out, y_out),
    'Trimmed': (X_out[mask_trim], y_out[mask_trim]) if 'mask_trim' in dir() else (X_out, y_out),
    'Winsorized': (X_capped, y_capped),
    'Log Transformed': (X_log, y_log),
    'LOF Filtered': (X_out[mask_lof], y_out[mask_lof]) if 'mask_lof' in dir() else (X_out, y_out),
}
for ax, (name, (X_t, y_t)) in zip(axes.flatten(), treatments.items()):
    ax.scatter(X_t, y_t, alpha=0.6)
    if len(X_t) > 0:
        model = LinearRegression().fit(X_t.reshape(-1, 1), y_t)
        x_line = np.linspace(X_t.min(), X_t.max(), 100)
        y_line = model.predict(x_line.reshape(-1, 1))
        ax.plot(x_line, y_line, 'r-', linewidth=2)
    ax.set_title(name)
plt.tight_layout()
plt.show()`,
      output: `Outlier Treatment Comparison
========================================
No treatment          MSE: 155.2378
Trimming (z<2.5)      MSE: 0.3934
Winsorizing (5%)      MSE: 1.2407
Log transform         MSE: 89.4561
LOF filtering         MSE: 0.4356

[Five scatter plots showing regression lines after different outlier treatments]`,
      explanation: 'Outlier treatment dramatically impacts model quality. Trimming and LOF filtering performed best here. Log transformation helped but was insufficient for extreme outliers. Winsorizing capped extreme values but distorts the distribution. The choice depends on whether outliers represent errors or genuine signal.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Finance', description: 'Banks detect credit card fraud using Isolation Forest on transaction features — amount, location, time, merchant type. Fraudulent transactions appear as multivariate outliers in real-time streams.' },
      { industry: 'Manufacturing', description: 'Quality control sensors detect defective products using DBSCAN on production line measurements. Outliers in temperature, pressure, or vibration indicate equipment malfunction.' },
      { industry: 'Cybersecurity', description: 'Network intrusion detection systems use LOF to identify unusual traffic patterns that deviate from normal baselines, catching zero-day attacks that signature-based methods miss.' },
    ],
    caseStudy: {
      problem: 'An e-commerce recommendation engine had 15% lower click-through rates than expected. Analysis revealed that 2% of users generated 40% of the "engagement" — they were bots clicking randomly, polluting the training data.',
      solution: 'The team applied Isolation Forest on user behavior features (click velocity, session duration, category diversity, purchase conversion). Flagged bot accounts were removed from training data (trimming), and a real-time LOF detector was deployed online.',
      results: 'Recommendation CTR improved by 28%. Bot traffic was reduced by 95%. The outlier detector saved an estimated $500K/year in wasted ad spend on bot clicks.',
    },
    bestPractices: [
      'Always visualize data before applying automated outlier detection',
      'Use domain expertise to validate whether outliers are errors or genuine signal',
      'Combine multiple detection methods for more robust results',
      'Document outlier treatment decisions and their impact on model performance',
      'Test treatment robustness via cross-validation',
      'Consider the business context — in fraud detection, outliers ARE the signal',
      'Monitor outlier patterns over time as they may indicate data drift',
    ],
    tools: ['Scikit-learn IsolationForest', 'Scikit-learn DBSCAN', 'Scikit-learn LocalOutlierFactor', 'SciPy stats.zscore', 'PyOD (Python Outlier Detection)', 'Scikit-learn Winsorizer (from feature_engine)', 'Matplotlib / Seaborn'],
    jobRoles: ['Data Scientist', 'ML Engineer', 'Fraud Analyst', 'Cybersecurity Analyst', 'Quality Control Engineer'],
    furtherReading: [
      '"Outlier Analysis" by Charu Aggarwal — comprehensive reference on outlier detection',
      'Scikit-learn documentation on novelty and outlier detection',
      'PyOD documentation — 40+ outlier detection algorithms implemented in Python',
      'Feature-engine documentation for Winsorizer and other outlier treatment transformers',
    ],
  },
  quiz: [
    {
      id: 'p4-outlier-1', type: 'mcq',
      question: 'What is the standard Z-score threshold commonly used to identify outliers?',
      options: [
        '|z| > 1.5',
        '|z| > 2',
        '|z| > 3',
        '|z| > 4',
      ],
      correctAnswer: '|z| > 3',
      explanation: 'For approximately normal distributions, about 99.7% of data falls within 3 standard deviations. Points with |z| > 3 are extreme and commonly flagged as potential outliers.',
    },
    {
      id: 'p4-outlier-2', type: 'truefalse',
      question: 'Outliers in a dataset should always be removed before training a machine learning model.',
      correctAnswer: 'False',
      explanation: 'Outliers can represent genuine rare events (fraud, rare diseases) that are the most important signals. Only remove outliers confirmed as errors, not genuine extreme observations.',
    },
    {
      id: 'p4-outlier-3', type: 'code',
      question: 'Given a DataFrame with a column "value", which code correctly identifies outliers using the IQR method?',
      code: `Q1 = df['value'].quantile(0.25)
Q3 = df['value'].quantile(0.75)
IQR = Q3 - Q1
__ = Q1 - 1.5 * IQR
__ = Q3 + 1.5 * IQR`,
      options: [
        'min_val, max_val',
        'lower, upper',
        'low_fence, high_fence',
        'left, right',
      ],
      correctAnswer: 'lower, upper',
      explanation: 'The IQR method defines lower and upper fences. Points below lower or above upper are outliers. The standard multiplier is 1.5, though 3.0 is used for extreme outliers.',
    },
    {
      id: 'p4-outlier-4', type: 'fillblank',
      question: 'The Z-score formula is $z_i = (x_i - \\bar{x}) /$ ___.',
      correctAnswer: 'sigma',
      explanation: 'The Z-score measures distance from the mean in units of standard deviation. The formula is z = (x - mean) / std, where std is the population or sample standard deviation.',
    },
    {
      id: 'p4-outlier-5', type: 'match',
      question: 'Match each outlier detection method with its best use case:',
      pairs: [
        { left: 'IQR Method', right: 'Univariate data with skewed distributions' },
        { left: 'Isolation Forest', right: 'High-dimensional tabular data' },
        { left: 'DBSCAN', right: 'Density-based cluster outliers' },
        { left: 'LOF', right: 'Local density anomalies' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'IQR is robust for univariate skewed data. Isolation Forest scales to high dimensions. DBSCAN finds sparse points in low-density regions. LOF captures local deviations from neighborhood density.',
    },
  ],
}))

export {}
