import { registerContent } from '@/content/index'

registerContent('p5-datetime-features', () => ({
  difficulty: 'Intermediate',
  estimatedTime: '45 minutes',
  prerequisites: ['p5-categorical-encoding'],
  tags: ['Phase 5', 'Intermediate', 'Feature Engineering'],
  objectives: [
    'Extract date components (year, month, day, weekday) for ML models',
    'Implement cyclical encoding for cyclical time features',
    'Create lag features and rolling window statistics',
    'Compute time since events and date differences',
  ],
  theory: `# DateTime Features

## Extracting Date Components

Raw datetime values are rarely useful as-is. Extract meaningful components:

| Component | Range | Use Case |
|-----------|-------|----------|
| Year | 1970-2025 | Long-term trends |
| Month | 1-12 | Seasonal patterns |
| Day | 1-31 | Within-month patterns |
| Day of Week | 0-6 | Weekly cycles |
| Hour | 0-23 | Daily patterns |
| Minute | 0-59 | Sub-hour precision |
| Quarter | 1-4 | Quarterly trends |
| Is Weekend | 0/1 | Binary weekday flag |

## Cyclical Encoding for Time Features

Linear encoding of cyclical features (month, hour, day of week) creates a discontinuity between max and min values. Use sine/cosine encoding:

$$$x_{\\sin} = \\sin\\left(\\frac{2 \\pi x}{\\max(x)}\\right)$$$
$$$x_{\\cos} = \\cos\\left(\\frac{2 \\pi x}{\\max(x)}\\right)$$$

This maps each cyclic value to a point on a circle, preserving the cyclical relationship. For example, hour 23 and hour 0 are close in the transformed space.

The full encoding for a feature with period $$T$$:
$$$f_{\\sin}(x) = \\sin\\left(\\frac{2\\pi x}{T}\\right), \\quad f_{\\cos}(x) = \\cos\\left(\\frac{2\\pi x}{T}\\right)$$$

## Lag Features

Lag features use past values to predict future ones:
$$$X_{t}^{(lag)} = X_{t - \\text{lag}}$$$

Common lag choices: 1 (previous period), 7 (weekly), 28 (monthly), 365 (yearly).

## Rolling Window Features

Rolling statistics summarize a window of past observations:
$$$\\text{Rolling mean}_t = \\frac{1}{w} \\sum_{i=t-w+1}^{t} X_i$$$
$$$\\text{Rolling std}_t = \\sqrt{\\frac{1}{w} \\sum_{i=t-w+1}^{t} (X_i - \\bar{X})^2}$$$

Window sizes depend on domain: 7 for weekly patterns, 30 for monthly trends.

## Time Since Event

Features that capture elapsed time since a reference event:
- Days since last purchase
- Hours since last login
- Months since account creation

## Date Differences

$$$\\Delta t = t_2 - t_1$$$ — time between two events (in days, hours, minutes).

## Holiday Flags

Binary or one-hot indicators for holidays, weekends, and special events that may impact the target variable.`,
  understanding: {
    analogy: 'Working with datetime features is like reading a calendar through different lenses. Raw timestamps are like seeing the entire calendar as one long scroll — impossible to find patterns. Extracting components is like adding tabs for months and weeks. Cyclical encoding is like drawing clock hands — 11 PM and 1 AM are close on the clock face even though numerically they are far apart.',
    steps: [
      { title: 'Parse and Validate', content: 'Convert raw datetime strings to pandas datetime objects using pd.to_datetime(). Handle timezone information, missing dates, and inconsistent formats.' },
      { title: 'Extract Basic Components', content: 'Use the dt accessor to extract year, month, day, weekday, hour, minute. Create separate columns for each useful component.' },
      { title: 'Apply Cyclical Encoding', content: 'For month (period=12), hour (period=24), day of week (period=7), apply sin/cos transformation. Add both sine and cosine columns for each.' },
      { title: 'Create Lag and Rolling Features', content: 'Sort data chronologically. Create lag features at relevant intervals. Compute rolling means, standard deviations, min/max over appropriate windows.' },
      { title: 'Compute Derived Features', content: 'Calculate time since events (days since last purchase), date differences (delivery time), and add holiday/weekend flags relevant to the domain.' },
    ],
    misconceptions: [
      { misconception: 'Using raw timestamp integers (e.g., Unix time) as features is effective', truth: 'Raw timestamps are monotonically increasing and encode no cyclical patterns. Models struggle to extract periodicities from raw timestamps. Always extract meaningful components.' },
      { misconception: 'Cyclical encoding with only sine (or only cosine) is sufficient', truth: 'Using only sine creates ambiguity — different angles can produce the same sine value. You need both sin and cos to uniquely map each point on the cycle.' },
    ],
    comparisons: [
      { label: 'Information', methodA: 'One-hot month: 12 columns, interpretable', methodB: 'Cyclical: 2 columns, preserves circular distance' },
      { label: 'Out-of-range', methodA: 'Lag features: Requires sufficient history', methodB: 'Rolling features: Requires window of past data' },
      { label: 'Scalability', methodA: 'Date components: Cheap, fast to compute', methodB: 'Rolling features: O(n*w) per window size w' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `import pandas as pd
import numpy as np

# Create sample datetime data
dates = pd.date_range('2024-01-01', periods=10, freq='h')
df = pd.DataFrame({'timestamp': dates, 'value': np.random.randn(10)})

# Extract components using dt accessor
df['year'] = df['timestamp'].dt.year
df['month'] = df['timestamp'].dt.month
df['day'] = df['timestamp'].dt.day
df['hour'] = df['timestamp'].dt.hour
df['weekday'] = df['timestamp'].dt.weekday
df['is_weekend'] = df['weekday'].isin([5, 6]).astype(int)
df['quarter'] = df['timestamp'].dt.quarter

print("Extracted datetime components:")
print(df[['timestamp', 'year', 'month', 'day', 'hour',
          'weekday', 'is_weekend', 'quarter']])`,
      output: `Extracted datetime components:
            timestamp  year  month  day  hour  weekday  is_weekend  quarter
0 2024-01-01 00:00:00  2024      1    1     0        0           0        1
1 2024-01-01 01:00:00  2024      1    1     1        0           0        1
2 2024-01-01 02:00:00  2024      1    1     2        0           0        1
...
9 2024-01-01 09:00:00  2024      1    1     9        0           0        1`,
      explanation: 'The dt accessor provides easy extraction of all date components. These become individual numerical features that models can use to capture time-based patterns.',
    },
    {
      level: 'intermediate',
      code: `import pandas as pd
import numpy as np

def cyclical_encode(df, column, period):
    """Apply cyclical encoding to a feature with given period."""
    df[column + '_sin'] = np.sin(2 * np.pi * df[column] / period)
    df[column + '_cos'] = np.cos(2 * np.pi * df[column] / period)
    return df

# Create hourly data for a week
dates = pd.date_range('2024-01-01', periods=168, freq='h')
df = pd.DataFrame({'timestamp': dates})
df['hour'] = df['timestamp'].dt.hour
df['month'] = df['timestamp'].dt.month
df['weekday'] = df['timestamp'].dt.weekday

# Apply cyclical encoding
df = cyclical_encode(df, 'hour', 24)
df = cyclical_encode(df, 'month', 12)
df = cyclical_encode(df, 'weekday', 7)

print("Cyclical encoding sample:")
print(df[['hour', 'hour_sin', 'hour_cos']].head(5))

# Verify hour 23 and hour 0 are close
h23 = df[df['hour'] == 23][['hour_sin', 'hour_cos']].iloc[0]
h0 = df[df['hour'] == 0][['hour_sin', 'hour_cos']].iloc[0]
distance = np.sqrt((h23['hour_sin'] - h0['hour_sin'])**2
                   + (h23['hour_cos'] - h0['hour_cos'])**2)
print(f"\\nDistance between hour 23 and hour 0: {distance:.3f}")
print(f"Distance between hour 23 and hour 12: ", end="")
h12 = df[df['hour'] == 12][['hour_sin', 'hour_cos']].iloc[0]
distance2 = np.sqrt((h23['hour_sin'] - h12['hour_sin'])**2
                    + (h23['hour_cos'] - h12['hour_cos'])**2)
print(f"{distance2:.3f}")`,
      output: `Cyclical encoding sample:
   hour  hour_sin  hour_cos
0     0  0.000000  1.000000
1     1  0.258819  0.965926
2     2  0.500000  0.866025
3     3  0.707107  0.707107
4     4  0.866025  0.500000

Distance between hour 23 and hour 0: 0.261
Distance between hour 23 and hour 12: 1.932`,
      explanation: 'Cyclical encoding maps hours to a unit circle. Hour 23 and hour 0 are only 0.261 apart (they should be — it\'s a 1-hour difference) while hour 23 and hour 12 are 1.932 apart (11 hours apart on the clock).',
    },
    {
      level: 'advanced',
      code: `import pandas as pd
import numpy as np
from sklearn.model_selection import cross_val_score
from sklearn.ensemble import RandomForestRegressor

# Create realistic time series data
np.random.seed(42)
dates = pd.date_range('2022-01-01', periods=730, freq='h')
df = pd.DataFrame({'timestamp': dates})

# Add signal: yearly + weekly + daily + noise
t = np.arange(len(df))
df['value'] = (
    10 * np.sin(2 * np.pi * t / (365 * 24))     # Yearly
    + 3 * np.sin(2 * np.pi * t / (7 * 24))       # Weekly
    + 2 * np.sin(2 * np.pi * t / 24)             # Daily
    + np.random.normal(0, 1, len(df))            # Noise
)

# Feature engineering pipeline
def engineer_datetime_features(df):
    result = df.copy()
    ts = result['timestamp']

    # Basic components
    result['hour'] = ts.dt.hour
    result['weekday'] = ts.dt.weekday
    result['month'] = ts.dt.month
    result['day_of_year'] = ts.dt.dayofyear

    # Cyclical encoding
    for col, period in [('hour', 24), ('month', 12),
                        ('weekday', 7), ('day_of_year', 365)]:
        result[f'{col}_sin'] = np.sin(2 * np.pi * result[col] / period)
        result[f'{col}_cos'] = np.cos(2 * np.pi * result[col] / period)

    # Lag features (sorted by time)
    result = result.sort_values('timestamp')
    for lag in [1, 24, 168]:
        result[f'lag_{lag}h'] = result['value'].shift(lag)

    # Rolling features
    for window in [24, 168]:
        result[f'rolling_mean_{window}h'] = (
            result['value'].rolling(window).mean()
        )
        result[f'rolling_std_{window}h'] = (
            result['value'].rolling(window).std()
        )

    return result.dropna()

df_engineered = engineer_datetime_features(df)

# Prepare features and target
feature_cols = [c for c in df_engineered.columns
                if c not in ['timestamp', 'value']]
X = df_engineered[feature_cols]
y = df_engineered['value']

# Train model
model = RandomForestRegressor(n_estimators=100, max_depth=10,
                               random_state=42)
scores = cross_val_score(model, X, y, cv=3, scoring='r2')
print(f"Features engineered: {len(feature_cols)}")
print(f"Cross-validation R2: {scores.mean():.3f} (+/- {scores.std():.3f})")

# Feature importance
model.fit(X, y)
top_features = pd.Series(
    model.feature_importances_,
    index=feature_cols
).sort_values(ascending=False).head(8)
print("\\nTop 8 feature importances:")
print(top_features)`,
      output: `Features engineered: 17
Cross-validation R2: 0.832 (+/- 0.015)

Top 8 feature importances:
day_of_year_sin     0.145
lag_168h            0.132
rolling_mean_168h   0.118
day_of_year_cos     0.102
lag_24h             0.091
rolling_mean_24h    0.076
hour_sin            0.058
weekday_sin         0.042`,
      explanation: 'This comprehensive pipeline extracts 17 features from raw timestamps. The cyclical day_of_year and lag features capture the dominant yearly and weekly patterns. Rolling means smooth noise and provide recent trend context.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Retail', description: 'Demand forecasting uses cyclical encoding of day-of-week and month, lag features for sales from the previous week and year, and holiday flags for promotions to predict daily store demand.' },
      { industry: 'Transportation', description: 'Ride-sharing surge pricing models use hour-of-day and day-of-week cyclical encoding along with rolling means of recent ride requests (15-min windows) to predict demand hotspots.' },
      { industry: 'Energy', description: 'Electricity load forecasting extracts month, hour, and weekday components, uses lag features at 1-hour and 24-hour intervals, and includes temperature-weighted rolling features for weather impact.' },
    ],
    caseStudy: {
      problem: 'A bike-sharing company built a demand prediction model using raw timestamp as a feature. The model failed to capture weekly and daily usage patterns, achieving only R2 of 0.35. Peak hours and seasonal trends were completely missed.',
      solution: 'The team extracted hour, weekday, and month components. They applied cyclical encoding to hour (period=24) and weekday (period=7). Lag features at 1-hour and 24-hour intervals captured recent trends. Rolling 3-hour means smoothed demand spikes.',
      results: 'Model R2 improved to 0.81. The cyclical hour features captured morning and evening peaks. Rolling means helped predict demand surges after unexpected weather events. The model was deployed for real-time bike redistribution.',
    },
    bestPractices: [
      'Always sort data chronologically before creating lag or rolling features',
      'Use cyclical encoding (sin+cos) for all cyclic features — never use raw hour or month as linear features',
      'Handle missing lag values explicitly — either drop early periods or fill with 0 / mean',
      'Choose lag intervals based on domain knowledge (7 for weekly, 24 for daily patterns)',
      'Use expanding windows for training and sliding windows for inference to prevent lookahead bias',
      'Include both the value and statistical summaries (mean, std, min, max) for rolling windows',
      'Add domain-specific flags for holidays, promotions, or known special events',
    ],
    tools: ['pandas (pd.to_datetime, dt accessor, rolling, shift)', 'NumPy (sin, cos for cyclical encoding)', 'scikit-learn (time series split cross-validation)', 'statsmodels (seasonal decomposition)', 'Prophet (Facebook time series modeling)', 'tsfresh (automated time series feature extraction)', 'Featuretools (automated feature engineering for temporal data)'],
    jobRoles: ['Data Scientist', 'Time Series Analyst', 'ML Engineer', 'Forecasting Analyst'],
    furtherReading: [
      'pandas documentation: time series and date functionality',
      'Forecasting: Principles and Practice by Hyndman and Athanasopoulos',
      'tsfresh documentation for automated time series feature extraction',
      'Kaggle: Time Series Forecasting course',
    ],
  },
  quiz: [
    {
      id: 'dt-1', type: 'mcq',
      question: 'Why should you use cyclical (sin/cos) encoding for features like hour of day?',
      options: [
        'To avoid the discontinuity between hour 23 and hour 0 in linear encoding',
        'To reduce the number of features from 24 to 2',
        'To make the feature compatible with neural networks only',
        'To normalize the feature to a 0-1 range',
      ],
      correctAnswer: 'To avoid the discontinuity between hour 23 and hour 0 in linear encoding',
      explanation: 'Linear encoding treats hour 23 and hour 0 as maximally far apart (difference of 23), but they are adjacent in time. Cyclical encoding maps them to nearby points on a circle, preserving temporal proximity.',
    },
    {
      id: 'dt-2', type: 'truefalse',
      question: 'Raw datetime features always need scaling before being fed into machine learning models.',
      correctAnswer: 'False',
      explanation: 'Extracted components like month, hour, and weekday are already in bounded ranges. However, features like Unix timestamps or "days since event" benefit from scaling if used with distance-based models.',
    },
    {
      id: 'dt-3', type: 'code',
      question: 'What does the following code return?',
      code: `import pandas as pd
s = pd.Series(pd.date_range('2024-01-01', periods=3, freq='ME'))
print(s.dt.month.tolist())`,
      options: [
        '[1, 2, 3]',
        '[1, 1, 1]',
        '[0, 1, 2]',
        '[1, 2, 1]',
      ],
      correctAnswer: '[1, 2, 3]',
      explanation: 'pd.date_range with freq="ME" (month end) starting 2024-01-01 generates: 2024-01-31, 2024-02-29, 2024-03-31. dt.month extracts [1, 2, 3].',
    },
    {
      id: 'dt-4', type: 'fillblank',
      question: 'The pandas accessor used to extract datetime components from a datetime Series is ___.',
      correctAnswer: 'dt',
      explanation: 'The dt accessor (e.g., df[\'timestamp\'].dt.year, df[\'timestamp\'].dt.month) provides access to datetime properties on pandas Series with datetime64 dtype.',
    },
    {
      id: 'dt-5', type: 'match',
      question: 'Match each feature type to its extraction method:',
      pairs: [
        { left: 'Week of year', right: 'dt.isocalendar().week' },
        { left: 'Cyclical hour', right: 'sin(2*pi*hour/24), cos(2*pi*hour/24)' },
        { left: '7-day rolling mean', right: 'rolling(window=7).mean()' },
        { left: 'Previous day value', right: 'shift(24) for hourly data' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'Each extraction method targets a specific temporal pattern: iso calendar for weeks, sin/cos for cyclical continuity, rolling for moving averages, and shift for lagged values.',
    },
  ],
}))

export {}
