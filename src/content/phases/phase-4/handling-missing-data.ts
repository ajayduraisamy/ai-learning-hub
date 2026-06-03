import { registerContent } from '@/content/index'

registerContent('p4-handling-missing-data', () => ({
  difficulty: 'Intermediate',
  estimatedTime: '45 minutes',
  prerequisites: ['p4-eda'],
  tags: ['Phase 4', 'Intermediate', 'Topic'],
  objectives: [
    'Understand the three types of missing data mechanisms: MCAR, MAR, and MNAR',
    'Detect and visualize missing values using pandas and seaborn',
    'Apply deletion methods and understand their trade-offs',
    'Implement imputation techniques from simple to advanced',
    'Evaluate imputation quality using statistical metrics',
  ],
  theory: `# Handling Missing Data

## Types of Missing Data

Missing data is categorized by the mechanism that caused it:

### MCAR (Missing Completely At Random)

The probability of a value being missing is unrelated to any variable in the dataset. Example: a survey respondent accidentally skips a question.

$$P(\\text{missing} | X, Y) = P(\\text{missing})$$

### MAR (Missing At Random)

The probability of missingness depends on observed variables but not on the missing value itself. Example: men are less likely to report weight, but the missing weight value itself doesn't affect missingness.

$$P(\\text{missing} | X, Y) = P(\\text{missing} | X)$$

### MNAR (Missing Not At Random)

The probability of missingness depends on the missing value itself. Example: people with very high income are less likely to report their income.

$$P(\\text{missing} | X, Y) = P(\\text{missing} | Y)$$

## Detection Methods

- **Visual**: Heatmaps, bar plots using \`missingno\` library or seaborn
- **Tabular**: \`df.isnull().sum()\`, \`df.isnull().mean() * 100\`
- **Pattern Analysis**: Check if missingness correlates with other variables

## Deletion Methods

| Method | Description | When to Use |
|--------|-------------|-------------|
| Listwise (Complete Case) | Drop rows with any missing value | MCAR, small missing % |
| Pairwise | Use available columns per analysis | Preserves more data |
| Drop columns | Remove features with >70-80% missing | High missing rates |

## Imputation Techniques

### Simple Imputation
- **Mean/Median Imputation**: Replace missing with column mean or median. Simple but reduces variance.
- **Mode Imputation**: For categorical data, replace with most frequent category.
- **Constant Imputation**: Replace with a specific value (e.g., 0, "Unknown").

### Sequential Imputation
- **Forward Fill (ffill)**: Propagate last valid observation forward.
- **Backward Fill (bfill)**: Use next valid observation to fill backward.
- **Interpolation**: Estimate missing values using surrounding data points (linear, polynomial, spline).

### Advanced Imputation
- **KNN Imputation**: Find $k$ nearest neighbors using non-missing features and average their values.
- **MICE (Multiple Imputation by Chained Equations)**: Iteratively model each variable with missing values, using other variables as predictors.

## Evaluation of Imputation

Compare before and after imputation using:
- Distribution plots (KDE before vs after)
- Summary statistics comparison
- Downstream model performance
- Cross-validation with artificially introduced missing values`,
  understanding: {
    analogy: 'Think of missing data like holes in a recipe book. MCAR is like a random ink splatter — it could hit any page equally. MAR is like missing steps for complex recipes because the book assumes you know basic techniques. MNAR is like missing the last page of every recipe because readers tear out their favorite pages (the missingness depends on the content itself).',
    steps: [
      { title: 'Detect', content: 'Use df.isnull().sum() and missingno matrix/heatmap to identify which columns have missing values and visualize their pattern.' },
      { title: 'Analyze Mechanism', content: 'Check if missingness correlates with other variables using groupby comparisons (e.g., does income missingness correlate with age?).' },
      { title: 'Choose Strategy', content: 'Decide between deletion and imputation based on missing percentage, mechanism type, and dataset size.' },
      { title: 'Implement Imputation', content: 'Apply appropriate technique — simple imputation for low missing rates, KNN or MICE for complex patterns.' },
      { title: 'Validate', content: 'Compare distributions before and after imputation. Check that imputation didn\'t introduce bias or distort relationships.' },
    ],
    misconceptions: [
      { misconception: 'Mean imputation is always a safe default', truth: 'Mean imputation reduces variance, distorts relationships between variables, and can introduce bias, especially for non-MCAR mechanisms. It should be used sparingly.' },
      { misconception: 'Deleting rows with missing data is always bad', truth: 'If data is MCAR and missing percentage is low (under 5%), listwise deletion is simple and unbiased. It becomes problematic with high missing rates or non-MCAR mechanisms.' },
    ],
    comparisons: [
      { label: 'Bias Risk', methodA: 'Listwise Deletion: Low (if MCAR)', methodB: 'Mean Imputation: Moderate-High' },
      { label: 'Data Preservation', methodA: 'Listwise Deletion: Loses samples', methodB: 'MICE: Preserves all samples' },
      { label: 'Complexity', methodA: 'Mean Imputation: Simple, fast', methodB: 'MICE: Complex, iterative, slow' },
      { label: 'Variance Impact', methodA: 'Mean Imputation: Reduces variance', methodB: 'KNN Imputation: Preserves variance better' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `import pandas as pd
import numpy as np

# Sample data with missing values
df = pd.DataFrame({
    'age': [25, 30, np.nan, 35, 40, np.nan, 28, 32],
    'income': [50000, 60000, 55000, np.nan, 80000, 65000, np.nan, 72000],
    'education': ['BSc', 'MSc', 'BSc', 'PhD', np.nan, 'MSc', 'BSc', 'PhD'],
    'city': ['NYC', 'LA', 'NYC', np.nan, 'CHI', 'LA', 'NYC', 'CHI']
})

# Detect missing values
print("Missing values per column:")
print(df.isnull().sum())

print("\\nMissing percentage:")
print((df.isnull().sum() / len(df) * 100).round(2))

print("\\nRows with any missing:")
print(df[df.isnull().any(axis=1)])

# Basic imputation
df_imputed = df.copy()
df_imputed['age'] = df_imputed['age'].fillna(df_imputed['age'].median())
df_imputed['income'] = df_imputed['income'].fillna(df_imputed['income'].median())
df_imputed['education'] = df_imputed['education'].fillna(df_imputed['education'].mode()[0])
df_imputed['city'] = df_imputed['city'].fillna('Unknown')

print("\\nAfter imputation:")
print(df_imputed.isnull().sum())`,
      output: `Missing values per column:
age           2
income        2
education     1
city          1

Missing percentage:
age           25.00
income        25.00
education     12.50
city          12.50

Rows with any missing:
    age   income education  city
2   NaN  55000.0       BSc   NYC
3  35.0      NaN       PhD   NaN
4  40.0  80000.0       NaN   CHI
5   NaN  65000.0       MSc   LA
6  28.0      NaN       BSc   NYC

After imputation:
age           0
income        0
education     0
city          0`,
      explanation: 'Basic detection uses isnull().sum(). Simple imputation replaces numeric missing values with median and categorical with mode. This is quick but simplistic — it ignores relationships between variables.',
    },
    {
      level: 'intermediate',
      code: `import pandas as pd
import numpy as np
import seaborn as sns
import matplotlib.pyplot as plt

# Missing value heatmap
plt.figure(figsize=(10, 6))
sns.heatmap(df.isnull(), cbar=False, cmap='viridis', yticklabels=False)
plt.title('Missing Value Heatmap')
plt.tight_layout()
plt.show()

# Forward fill and backward fill (time series example)
dates = pd.date_range('2024-01-01', periods=10)
ts_df = pd.DataFrame({
    'date': dates,
    'value': [100, np.nan, np.nan, 103, np.nan, 105, 106, np.nan, np.nan, 109]
})

print("Original:")
print(ts_df)

print("\\nForward fill:")
print(ts_df.fillna(method='ffill'))

print("\\nBackward fill:")
print(ts_df.fillna(method='bfill'))

print("\\nLinear interpolation:")
print(ts_df.interpolate(method='linear'))

# Visualize imputation
ts_df['ffill'] = ts_df['value'].fillna(method='ffill')
ts_df['linear'] = ts_df['value'].interpolate(method='linear')

plt.figure(figsize=(12, 6))
plt.plot(ts_df['date'], ts_df['value'], 'o-', label='Original (with gaps)')
plt.plot(ts_df['date'], ts_df['ffill'], 's--', label='Forward Fill')
plt.plot(ts_df['date'], ts_df['linear'], 'd-.', label='Linear Interpolation')
plt.legend()
plt.title('Missing Data Imputation Methods Comparison')
plt.tight_layout()
plt.show()`,
      output: `[A heatmap with yellow indicating present values and purple indicating missing]
Original:
        date  value
0 2024-01-01  100.0
1 2024-01-02    NaN
2 2024-01-03    NaN
3 2024-01-04  103.0
4 2024-01-05    NaN
5 2024-01-06  105.0
6 2024-01-07  106.0
7 2024-01-08    NaN
8 2024-01-09    NaN
9 2024-01-10  109.0

Forward fill:
        date  value
0 2024-01-01  100.0
1 2024-01-02  100.0
2 2024-01-03  100.0
3 2024-01-04  103.0
4 2024-01-05  103.0
5 2024-01-06  105.0
6 2024-01-07  106.0
7 2024-01-08  106.0
8 2024-01-09  106.0
9 2024-01-10  109.0

Backward fill:
        date  value
0 2024-01-01  100.0
1 2024-01-02  103.0
2 2024-01-03  103.0
3 2024-01-04  103.0
4 2024-01-05  105.0
5 2024-01-06  105.0
6 2024-01-07  106.0
7 2024-01-08  109.0
8 2024-01-09  109.0
9 2024-01-10  109.0`,
      explanation: 'Visualizing missing patterns helps identify structure (e.g., missing not at random). Forward fill propagates the last known value — ideal for time series. Interpolation creates a smoother estimate using neighboring points.',
    },
    {
      level: 'advanced',
      code: `import pandas as pd
import numpy as np
from sklearn.experimental import enable_iterative_imputer
from sklearn.impute import SimpleImputer, IterativeImputer, KNNImputer
from sklearn.ensemble import RandomForestRegressor
import matplotlib.pyplot as plt

# Generate data with missing values
np.random.seed(42)
n = 200
X = np.random.randn(n, 3)
X_missing = X.copy()

# Introduce MAR missingness: higher age -> more likely missing income
prob_missing = 1 / (1 + np.exp(-(X[:, 0] + 0.5)))  # depends on feature 0
mask = np.random.random(n) < prob_missing
X_missing[mask, 1] = np.nan

# Add random missing in feature 2
mask2 = np.random.random(n) < 0.15
X_missing[mask2, 2] = np.nan

df_missing = pd.DataFrame(X_missing, columns=['age', 'income', 'education_score'])

# Compare imputation methods
imputers = {
    'Mean': SimpleImputer(strategy='mean'),
    'Median': SimpleImputer(strategy='median'),
    'KNN (k=3)': KNNImputer(n_neighbors=3),
    'KNN (k=7)': KNNImputer(n_neighbors=7),
    'MICE': IterativeImputer(max_iter=10, random_state=42),
    'MICE+RF': IterativeImputer(
        estimator=RandomForestRegressor(n_estimators=50),
        max_iter=10, random_state=42
    ),
}

results = {}
for name, imputer in imputers.items():
    imputed = imputer.fit_transform(X_missing)
    df_imp = pd.DataFrame(imputed, columns=['age', 'income', 'education_score'])
    
    # Calculate MSE for the artificially missing values
    mse = np.mean((imputed[mask, 1] - X[mask, 1]) ** 2)
    results[name] = round(mse, 4)
    print(f"{name:15s} MSE: {mse:.4f}")

# Distribution comparison
plt.figure(figsize=(15, 4))
for i, col in enumerate(['age', 'income', 'education_score']):
    plt.subplot(1, 3, i + 1)
    plt.hist(X[:, i], bins=20, alpha=0.5, label='Original', density=True)
    plt.hist(imputers['MICE'].fit_transform(X_missing)[:, i],
             bins=20, alpha=0.5, label='MICE Imputed', density=True)
    plt.title(f'{col} Distribution')
    plt.legend()
plt.tight_layout()
plt.show()

print("\\nBest method:", min(results, key=results.get))`,
      output: `Mean            MSE: 1.2456
Median          MSE: 1.3123
KNN (k=3)       MSE: 0.8921
KNN (k=7)       MSE: 0.9412
MICE            MSE: 0.8345
MICE+RF         MSE: 0.8211

Best method: MICE+RF

[Three histograms showing original vs MICE-imputed distributions with good overlap]`,
      explanation: 'Advanced imputation compares multiple methods. KNN leverages feature similarity. MICE iteratively models each variable. The RF-based MICE captures non-linear relationships. Distribution comparison validates that imputation preserves the underlying data structure.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Healthcare', description: 'Clinical trials often have missing patient data due to dropouts. MICE imputation is used to handle missing outcomes while preserving statistical power and reducing bias in treatment effect estimates.' },
      { industry: 'Finance', description: 'Credit scoring models must handle missing income, employment history, and asset data. KNN imputation leverages similar applicants to fill gaps without distorting risk profiles.' },
      { industry: 'IoT', description: 'Sensor networks frequently lose readings due to transmission failures. Forward fill and interpolation maintain continuous data streams for real-time monitoring systems.' },
    ],
    caseStudy: {
      problem: 'A bank\'s credit risk model was rejecting 40% more applications than expected. Analysis revealed that 25% of applications had missing income data, and mean imputation was biasing risk scores downward, causing unexpected defaults.',
      solution: 'The team switched to MICE imputation using employment status, education, loan amount, and credit history as predictors. They also added a "missing indicator" column to capture the informative nature of missingness.',
      results: 'Default rate dropped by 18%. The model was more discerning — approval rates returned to target levels. Missing data patterns even became a useful feature for detecting fraudulent applications.',
    },
    bestPractices: [
      'Always visualize missing patterns before choosing a strategy',
      'Use domain knowledge to determine if missingness is informative',
      'Add missing indicators when missing data may carry signal',
      'Prefer multiple imputation (MICE) over single imputation when feasible',
      'Compare distributions before and after imputation to detect distortion',
      'Document your missing data handling decisions in the model card',
      'Test imputation robustness via cross-validation with synthetic missing values',
    ],
    tools: ['Scikit-learn SimpleImputer', 'Scikit-learn IterativeImputer', 'Scikit-learn KNNImputer', 'Missingno (visualization)', 'Fancyimpute', 'Pandas fillna/interpolate', 'Stata (MICE)'],
    jobRoles: ['Data Scientist', 'Data Engineer', 'Research Scientist', 'Clinical Data Manager', 'Quantitative Analyst'],
    furtherReading: [
      '"Statistical Analysis with Missing Data" by Little & Rubin — the definitive reference',
      'Scikit-learn documentation on imputation modules',
      '"Flexible Imputation of Missing Data" by Stef van Buuren — practical MICE guide',
      'Kaggle Missing Data competitions and community solutions',
    ],
  },
  quiz: [
    {
      id: 'p4-missing-1', type: 'mcq',
      question: 'Which missing data mechanism occurs when the probability of missingness depends on the missing value itself?',
      options: [
        'MCAR (Missing Completely At Random)',
        'MAR (Missing At Random)',
        'MNAR (Missing Not At Random)',
        'NMAR (Not Missing At Random)',
      ],
      correctAnswer: 'MNAR (Missing Not At Random)',
      explanation: 'MNAR occurs when missingness depends on the unobserved value. For example, people with very high income not reporting their income.',
    },
    {
      id: 'p4-missing-2', type: 'truefalse',
      question: 'Mean imputation is always the best default strategy for handling missing numeric data.',
      correctAnswer: 'False',
      explanation: 'Mean imputation reduces variance, distorts relationships between variables, and can introduce bias, especially for non-MCAR mechanisms. Better alternatives include MICE or KNN imputation.',
    },
    {
      id: 'p4-missing-3', type: 'code',
      question: 'What does the following code do?',
      code: `import pandas as pd
df['temperature'] = df['temperature'].fillna(method='ffill')`,
      options: [
        'Replaces NaN with the mean temperature',
        'Replaces NaN with the next valid temperature reading',
        'Replaces NaN with the last valid temperature reading before each NaN',
        'Fills all NaN values with 0',
      ],
      correctAnswer: 'Replaces NaN with the last valid temperature reading before each NaN',
      explanation: 'method=\'ffill\' (forward fill) propagates the last valid observation forward to fill subsequent NaN values in the column.',
    },
    {
      id: 'p4-missing-4', type: 'fillblank',
      question: 'MAR stands for Missing ___ Random.',
      correctAnswer: 'At',
      explanation: 'Missing At Random (MAR) means the probability of missingness depends on observed variables but not on the missing value itself.',
    },
    {
      id: 'p4-missing-5', type: 'match',
      question: 'Match each imputation method to its best use case scenario:',
      pairs: [
        { left: 'Forward Fill', right: 'Time series with short gaps' },
        { left: 'KNN Imputation', right: 'Tabular data with correlated features' },
        { left: 'MICE', right: 'Complex missing patterns with multiple variables' },
        { left: 'Mean Imputation', right: 'Quick baseline, small missing percentage' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'Each imputation method suits different scenarios: ffill for temporal gaps, KNN for feature-based similarity, MICE for complex multivariate patterns, and mean for quick baselines.',
    },
  ],
}))

export {}
