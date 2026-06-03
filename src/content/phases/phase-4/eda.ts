import { registerContent } from '@/content/index'

registerContent('p4-eda', () => ({
  difficulty: 'Intermediate',
  estimatedTime: '45 minutes',
  prerequisites: ['p3-pandas'],
  tags: ['Phase 4', 'Intermediate', 'Topic'],
  objectives: [
    'Understand what EDA is and why it is critical in ML pipelines',
    'Master summary statistics and data type inspection techniques',
    'Visualize missing values, correlations, and distributions',
    'Perform univariate, bivariate, and multivariate analysis',
    'Identify outliers and patterns using visual tools',
  ],
  theory: `# EDA (Exploratory Data Analysis)

## What is EDA?

Exploratory Data Analysis is the process of investigating datasets to summarize their main characteristics, often using visual methods. Coined by John Tukey, EDA helps data scientists understand patterns, spot anomalies, test hypotheses, and check assumptions before formal modeling.

## Summary Statistics

Summary statistics provide a quick numerical overview of your data:

- **Central Tendency**: Mean, median, mode
- **Dispersion**: Standard deviation, variance, range, IQR
- **Shape**: Skewness and kurtosis

For a dataset with $n$ values $x_1, x_2, ..., x_n$:

$$\\bar{x} = \\frac{1}{n}\\sum_{i=1}^{n} x_i$$

$$\\sigma = \\sqrt{\\frac{1}{n}\\sum_{i=1}^{n} (x_i - \\bar{x})^2}$$

## Data Types Inspection

Understanding data types is crucial:

| Type | Description | Pandas dtype |
|------|-------------|-------------|
| Numeric | Continuous or discrete | float64, int64 |
| Categorical | Fixed set of values | object, category |
| DateTime | Temporal data | datetime64 |
| Text | Free-form text | object |

## Missing Value Visualization

Missing data patterns reveal data quality issues. Heatmaps and bar charts of null values help decide imputation strategies.

## Correlation Analysis

Correlation measures the strength of a linear relationship between two variables:

$$r = \\frac{\\sum (x_i - \\bar{x})(y_i - \\bar{y})}{\\sqrt{\\sum (x_i - \\bar{x})^2 \\sum (y_i - \\bar{y})^2}}$$

Values near $\\pm 1$ indicate strong correlation; values near $0$ indicate weak or no linear relationship.

## Distribution Analysis

Understanding how each variable is distributed helps detect skewness, modality (unimodal, bimodal), and potential outliers. Common plots: histograms, KDE plots, box plots.

## Outlier Visualization

Box plots and scatter plots naturally highlight extreme values. The IQR method defines outliers as points below $Q1 - 1.5 \\times IQR$ or above $Q3 + 1.5 \\times IQR$.

## Bivariate and Multivariate Analysis

- **Bivariate**: Examine relationships between two variables (scatter plots, bar charts, cross-tabulations)
- **Multivariate**: Examine interactions among three or more variables (pairplots, 3D scatter plots, parallel coordinates)`,
  understanding: {
    analogy: 'Think of EDA like a doctor performing a health checkup on a patient. Summary statistics are vital signs (temperature, heart rate). Visualizations are like X-rays and MRIs revealing hidden issues. Correlation analysis checks how organs interact. Just as a doctor diagnoses before treating, you explore before modeling.',
    steps: [
      { title: 'Load & Inspect', content: 'Load the dataset and inspect its shape, columns, dtypes, and first/last rows using df.head(), df.info(), and df.shape.' },
      { title: 'Summarize', content: 'Generate summary statistics with df.describe() for numeric columns and value_counts() for categorical columns to understand distributions.' },
      { title: 'Visualize Univariate', content: 'Plot histograms, box plots, and KDE for each numeric variable. Use bar charts for categorical variables to see frequency distributions.' },
      { title: 'Visualize Relationships', content: 'Create scatter plots, correlation heatmaps, and pairplots to explore relationships between variables.' },
      { title: 'Document Insights', content: 'Record observations: missing values, skewness, outliers, correlations, and potential feature engineering ideas. This guides your preprocessing decisions.' },
    ],
    misconceptions: [
      { misconception: 'EDA is optional if you already know the data well', truth: 'EDA always reveals surprises — hidden missing data, unexpected distributions, data entry errors, or drift. Skipping it leads to flawed models and incorrect conclusions.' },
      { misconception: 'Correlation implies causation', truth: 'Two variables may be highly correlated without one causing the other. Spurious correlations (e.g., ice cream sales and drowning incidents) are common examples of this fallacy.' },
    ],
    comparisons: [
      { label: 'Goal', methodA: 'EDA: Understand data patterns and quality', methodB: 'Modeling: Predict or classify' },
      { label: 'Approach', methodA: 'EDA: Open-ended exploration, visual', methodB: 'Hypothesis Testing: Confirmatory, statistical' },
      { label: 'Output', methodA: 'EDA: Insights, plots, summary tables', methodB: 'Reporting: Dashboards, automated pipelines' },
      { label: 'Tools', methodA: 'EDA: Pandas, matplotlib, seaborn, plotly', methodB: 'ETL: SQL, Spark, Airflow' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `import pandas as pd
import numpy as np

# Load a sample dataset
df = pd.read_csv('data.csv')

# Basic inspection
print("Shape:", df.shape)
print("\\nColumns:", df.columns.tolist())
print("\\nData types:")
print(df.dtypes)

# Summary statistics
print("\\nSummary statistics:")
print(df.describe())

# Categorical value counts
for col in df.select_dtypes(include='object').columns:
    print(f"\\n{col} value counts:")
    print(df[col].value_counts())

# Check for missing values
print("\\nMissing values:")
print(df.isnull().sum())`,
      output: `Shape: (1000, 12)

Columns: ['age', 'income', 'education', 'occupation', 'hours_per_week', 'gender', 'marital_status', 'race', 'native_country', 'target']

Data types:
age               int64
income           float64
education         object
occupation        object
hours_per_week    int64
gender            object
target            object

Summary statistics:
             age        income  hours_per_week
count  1000.00000    987.00000     1000.00000
mean     38.54000  52340.25000       40.42000
std      13.64000  30450.18000       12.53000
min      17.00000   2500.00000        1.00000
25%      28.00000  28000.00000       32.00000
50%      37.00000  45000.00000       40.00000
75%      48.00000  72000.00000       45.00000
max      82.00000  150000.00000      99.00000

Missing values:
age               0
income           13
education         0
occupation        5
hours_per_week    0
gender            0`,
      explanation: 'Basic EDA starts with shape, dtypes, describe(), value_counts(), and null checks. This gives you a rapid high-level understanding of dataset structure and quality.',
    },
    {
      level: 'intermediate',
      code: `import pandas as pd
import numpy as np
import seaborn as sns
import matplotlib.pyplot as plt

# Correlation matrix heatmap
plt.figure(figsize=(10, 8))
numeric_df = df.select_dtypes(include=[np.number])
corr = numeric_df.corr()
sns.heatmap(corr, annot=True, fmt='.2f', cmap='RdBu_r',
            center=0, square=True, linewidths=0.5)
plt.title('Correlation Matrix Heatmap')
plt.tight_layout()
plt.show()

# Pairplot of key features
sns.pairplot(df, vars=['age', 'income', 'hours_per_week'],
             hue='target', diag_kind='kde',
             palette='husl')
plt.suptitle('Pairplot: Age, Income, Hours per Week', y=1.02)
plt.show()

# Distribution analysis with KDE overlay
fig, axes = plt.subplots(1, 3, figsize=(15, 4))
for i, col in enumerate(['age', 'income', 'hours_per_week']):
    sns.histplot(df[col].dropna(), kde=True, ax=axes[i], bins=30)
    axes[i].set_title(f'Distribution of {col}')
plt.tight_layout()
plt.show()`,
      output: `[A heatmap showing correlation values between numeric columns with color intensity indicating strength]
[A pairplot with scatter plots on off-diagonal and KDE on diagonal, colored by target class]
[Three histograms with KDE overlays showing distribution shapes for age, income, and hours_per_week]`,
      explanation: 'Correlation heatmaps quickly reveal multicollinearity issues. Pairplots show relationships between multiple variables simultaneously. Distribution plots reveal skewness, modality, and outliers.',
    },
    {
      level: 'advanced',
      code: `import pandas as pd
import numpy as np
import seaborn as sns
import matplotlib.pyplot as plt
from pandas.plotting import parallel_coordinates
from sklearn.preprocessing import LabelEncoder

def comprehensive_eda_report(df, target_col=None):
    """Generate a comprehensive EDA report."""
    n_cols = len(df.columns)
    n_numeric = len(df.select_dtypes(include=[np.number]).columns)
    n_categorical = len(df.select_dtypes(include=['object', 'category']).columns)
    
    print("=" * 60)
    print("COMPREHENSIVE EDA REPORT")
    print("=" * 60)
    print(f"\\nDataset: {df.shape[0]} rows x {df.shape[1]} columns")
    print(f"Numeric: {n_numeric}, Categorical: {n_categorical}")
    
    # Missing data analysis
    missing = df.isnull().sum()
    missing_pct = (missing / len(df) * 100).round(2)
    missing_df = pd.DataFrame({'Missing': missing, 'Percent': missing_pct})
    missing_df = missing_df[missing_df['Missing'] > 0].sort_values('Missing', ascending=False)
    if len(missing_df) > 0:
        print(f"\\n--- Missing Data ---")
        print(missing_df.to_string())
    else:
        print("\\nNo missing values found.")
    
    # Outlier detection using IQR
    print(f"\\n--- Outlier Detection (IQR method) ---")
    for col in df.select_dtypes(include=[np.number]).columns:
        Q1 = df[col].quantile(0.25)
        Q3 = df[col].quantile(0.75)
        IQR = Q3 - Q1
        lower = Q1 - 1.5 * IQR
        upper = Q3 + 1.5 * IQR
        outliers = df[(df[col] < lower) | (df[col] > upper)].shape[0]
        pct = (outliers / df.shape[0]) * 100
        print(f"  {col}: {outliers} outliers ({pct:.1f}%)")
    
    # Skewness analysis
    print(f"\\n--- Skewness ---")
    for col in df.select_dtypes(include=[np.number]).columns:
        skew = df[col].skew()
        direction = "right (positive)" if skew > 0.5 else "left (negative)" if skew < -0.5 else "approx symmetric"
        print(f"  {col}: {skew:.3f} ({direction})")
    
    # Correlation with target (if provided)
    if target_col and target_col in df.columns:
        print(f"\\n--- Correlation with Target: {target_col} ---")
        le = LabelEncoder()
        if df[target_col].dtype == 'object':
            y = le.fit_transform(df[target_col].fillna('missing'))
        else:
            y = df[target_col].fillna(y.mean())
        for col in df.select_dtypes(include=[np.number]).columns:
            if col != target_col:
                corr_val = np.corrcoef(df[col].fillna(df[col].median()), y)[0, 1]
                print(f"  {col}: {corr_val:.3f}")
    
    # Parallel coordinates plot for multivariate view
    if target_col and n_numeric >= 2:
        sample_df = df.select_dtypes(include=[np.number]).copy()
        if target_col in sample_df.columns:
            sample_df = sample_df.drop(columns=[target_col])
        sample_df['target'] = le.fit_transform(df[target_col].fillna('missing'))
        sample_df = sample_df.sample(min(200, len(sample_df)))
        plt.figure(figsize=(12, 6))
        parallel_coordinates(sample_df, 'target', colormap='viridis', alpha=0.5)
        plt.title('Parallel Coordinates Plot')
        plt.tight_layout()
        plt.show()
    
    print("\\n" + "=" * 60)
    print("EDA REPORT COMPLETE")
    print("=" * 60)

# Run comprehensive EDA
comprehensive_eda_report(df, target_col='target')`,
      output: `============================================================
COMPREHENSIVE EDA REPORT
============================================================

Dataset: 1000 rows x 12 columns
Numeric: 3, Categorical: 9

--- Missing Data ---
            Missing  Percent
income           13     1.30
occupation        5     0.50

--- Outlier Detection (IQR method) ---
  age: 8 outliers (0.8%)
  income: 15 outliers (1.5%)
  hours_per_week: 12 outliers (1.2%)

--- Skewness ---
  age: 0.558 (right)
  income: 0.892 (right)
  hours_per_week: 0.310 (approx symmetric)

--- Correlation with Target: target ---
  age: -0.042
  income: 0.123
  hours_per_week: 0.087

============================================================
EDA REPORT COMPLETE
============================================================`,
      explanation: 'An automated EDA report pipeline combines multiple analyses: missing data audit, IQR-based outlier detection, skewness measurement, target correlation analysis, and parallel coordinates for multivariate patterns.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Finance', description: 'Banks use EDA to detect fraudulent transactions by exploring transaction amount distributions, frequency patterns, and geolocation anomalies before building fraud detection models.' },
      { industry: 'Healthcare', description: 'Medical researchers explore patient data to understand treatment effectiveness across demographics, identify confounding variables, and validate data collection quality before clinical trials.' },
      { industry: 'E-commerce', description: 'Online retailers analyze customer purchase patterns, browsing behavior, and product associations to optimize recommendations, pricing, and inventory management.' },
    ],
    caseStudy: {
      problem: 'A retail company noticed declining sales but had no clear cause. Their dataset contained 500+ features across 2 million transactions, making manual analysis impossible.',
      solution: 'Data scientists performed comprehensive EDA using correlation heatmaps, distribution analysis, and time-series decomposition. They discovered that 30% of features had >60% missing values and that sales data had strong seasonality masked by data entry errors.',
      results: 'Removing low-quality features improved model accuracy by 22%. Seasonal patterns informed inventory planning, saving $2M annually in carrying costs. Data entry validation rules were implemented, reducing errors by 85%.',
    },
    bestPractices: [
      'Always start with df.info() and df.describe() before any visualization',
      'Use a consistent random seed sample when datasets are too large to explore in full',
      'Save EDA visualizations to a dedicated reports folder for team review',
      'Document every finding in a structured EDA notebook or markdown report',
      'Check for data leakage by examining time-based splits and target-related features',
      'Use log transformations for highly skewed features before modeling',
      'Separate EDA into univariate, bivariate, and multivariate sections for clarity',
    ],
    tools: ['Pandas Profiling (ydata-profiling)', 'Seaborn', 'Matplotlib', 'Plotly', 'Sweetviz', 'D-Tale', 'Pandas'],
    jobRoles: ['Data Scientist', 'Data Analyst', 'Machine Learning Engineer', 'Research Scientist', 'Business Intelligence Analyst'],
    furtherReading: [
      '"Naked Statistics" by Charles Wheelan — accessible introduction to statistical concepts',
      '"Python for Data Analysis" by Wes McKinney — Pandas creator\'s definitive guide',
      'Seaborn official documentation and gallery for visualization best practices',
      'Kaggle EDA kernels for real-world examples across diverse domains',
    ],
  },
  quiz: [
    {
      id: 'p4-eda-1', type: 'mcq',
      question: 'What does df.describe() return by default?',
      options: [
        'Summary statistics for all columns including categorical ones',
        'Summary statistics for numeric columns only (count, mean, std, min, quartiles, max)',
        'The first 5 rows of the DataFrame',
        'The number of missing values in each column',
      ],
      correctAnswer: 'Summary statistics for numeric columns only (count, mean, std, min, quartiles, max)',
      explanation: 'By default, describe() computes summary statistics for numeric columns. Use include="all" to include categorical columns.',
    },
    {
      id: 'p4-eda-2', type: 'truefalse',
      question: 'A high correlation coefficient between two variables proves that one variable causes changes in the other.',
      correctAnswer: 'False',
      explanation: 'Correlation does not imply causation. Two variables may be correlated due to a third confounding variable or pure coincidence. Additional experiments are needed to establish causation.',
    },
    {
      id: 'p4-eda-3', type: 'code',
      question: 'What will df.describe(include="all") output if the DataFrame has both numeric and categorical columns?',
      code: `import pandas as pd
df = pd.DataFrame({
    'age': [25, 30, 35, 40],
    'city': ['NYC', 'LA', 'NYC', 'CHI']
})
print(df.describe(include='all'))`,
      options: [
        'Only numeric column statistics because city is object dtype',
        'Numeric stats for age and separate stats (count, unique, top, freq) for city',
        'An error because include="all" is not valid',
        'Only the city column statistics',
      ],
      correctAnswer: 'Numeric stats for age and separate stats (count, unique, top, freq) for city',
      explanation: 'include="all" forces describe() to include all columns. For categorical columns, it shows count, unique, top (most frequent), and freq (frequency of most frequent value).',
    },
    {
      id: 'p4-eda-4', type: 'fillblank',
      question: 'The formula for the interquartile range (IQR) is IQR = ___ - Q1.',
      correctAnswer: 'Q3',
      explanation: 'IQR measures the spread of the middle 50% of data. It is calculated as Q3 (75th percentile) minus Q1 (25th percentile).',
    },
    {
      id: 'p4-eda-5', type: 'match',
      question: 'Match each EDA technique with its primary purpose:',
      pairs: [
        { left: 'df.describe()', right: 'Summary statistics for numeric columns' },
        { left: 'Correlation heatmap', right: 'Visualize relationships between numeric variables' },
        { left: 'Pairplot', right: 'Multivariate scatter plot matrix' },
        { left: 'value_counts()', right: 'Frequency distribution of categorical data' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'Each EDA technique serves a specific purpose: describe() summarizes, correlation heatmaps show relationships, pairplots show multivariable interactions, and value_counts() reveals categorical distributions.',
    },
  ],
}))

export {}
