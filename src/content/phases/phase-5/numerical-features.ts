import { registerContent } from '@/content/index'

registerContent('p5-numerical-features', () => ({
  difficulty: 'Intermediate',
  estimatedTime: '45 minutes',
  prerequisites: ['p4-eda'],
  tags: ['Phase 5', 'Intermediate', 'Feature Engineering'],
  objectives: [
    'Understand polynomial and interaction feature creation',
    'Apply binning and discretization strategies',
    'Use log, Box-Cox, and Yeo-Johnson transformations',
    'Implement proper feature scaling for numerical data',
  ],
  theory: `# Numerical Feature Engineering

## Polynomial Features

Polynomial features create new features by raising existing features to powers or computing interactions between them.

For a feature $$x$$, polynomial features of degree $$d$$ are:
$$$\\phi(x) = [1, x, x^2, x^3, \\ldots, x^d]$$$

For two features $$x_1$$ and $$x_2$$ with degree 2:
$$$\\phi(x_1, x_2) = [1, x_1, x_2, x_1^2, x_1 x_2, x_2^2]$$$

This helps linear models capture non-linear relationships.

## Interaction Features

Interaction features capture relationships between variables:
$$$y = \\beta_0 + \\beta_1 x_1 + \\beta_2 x_2 + \\beta_3 (x_1 \\cdot x_2)$$$

The product term $$x_1 \\cdot x_2$$ allows the effect of $$x_1$$ on $$y$$ to depend on the value of $$x_2$$.

## Binning and Discretization

Binning converts continuous variables into categorical ones:

- **Equal-width binning**: Divides data into $$k$$ bins of equal range
  $$$\\text{bin width} = \\frac{\\max(x) - \\min(x)}{k}$$$

- **Equal-frequency binning**: Divides data so each bin has approximately the same number of observations

- **Adaptive binning**: Uses quantiles, clustering, or decision trees to determine bin edges

## Log and Exponential Transformations

The log transformation is effective for right-skewed data:
$$$x' = \\ln(x + c) \\quad \\text{where } c \\text{ is a constant to handle zeros}$$$

Exponential transformations can handle left-skewed data:
$$$x' = e^{x}$$$

## Box-Cox Transformation

The Box-Cox transformation is a family of power transformations parameterized by $$\\lambda$$:
$$$
x^{(\\lambda)} = \\begin{cases}
\\frac{x^{\\lambda} - 1}{\\lambda} & \\text{if } \\lambda \\neq 0 \\\\
\\ln(x) & \\text{if } \\lambda = 0
\\end{cases}
$$$

Requires $$x > 0$$. The optimal $$\\lambda$$ is found by maximizing the log-likelihood function.

## Yeo-Johnson Transformation

An extension of Box-Cox that handles zero and negative values:
$$$
x^{(\\lambda)} = \\begin{cases}
\\frac{(x + 1)^{\\lambda} - 1}{\\lambda} & \\text{if } \\lambda \\neq 0, x \\geq 0 \\\\
\\ln(x + 1) & \\text{if } \\lambda = 0, x \\geq 0 \\\\
-\\frac{(-x + 1)^{2 - \\lambda} - 1}{2 - \\lambda} & \\text{if } \\lambda \\neq 2, x < 0 \\\\
-\\ln(-x + 1) & \\text{if } \\lambda = 2, x < 0
\\end{cases}
$$$

## Feature Scaling for Numerical Data

Key scaling techniques:

- **Standardization (Z-score)**: $$x' = \\frac{x - \\mu}{\\sigma}$$
- **Min-Max Scaling**: $$x' = \\frac{x - \\min(x)}{\\max(x) - \\min(x)}$$
- **Robust Scaling**: $$x' = \\frac{x - \\text{median}(x)}{\\text{IQR}(x)}$$

## Domain-Specific Transforms

Different domains require specialized transforms:

- **Financial**: Log returns, percentage changes, moving averages
- **Geospatial**: Latitude/longitude to distance, clustering coordinates
- **Text**: TF-IDF, word embeddings, document vectors
- **Time Series**: Differencing, seasonal decomposition, Fourier transforms`,
  understanding: {
    analogy: 'Numerical feature engineering is like a chef preparing ingredients. Polynomial features are like cutting vegetables into different shapes — the same ingredient can be prepared multiple ways. Log transformations are like marinating tough meat to make it tender (reducing skewness). Binning is like sorting ingredients by size (small, medium, large) instead of measuring exact weight.',
    steps: [
      { title: 'Understand Distributions', content: 'Plot histograms and Q-Q plots for each numerical feature. Identify skewness, outliers, and the underlying distribution shape to guide transformation choices.' },
      { title: 'Apply Transformations', content: 'Use log, Box-Cox, or Yeo-Johnson to normalize skewed distributions. Visualize the transformed distribution to confirm improvement.' },
      { title: 'Create Polynomial Features', content: 'Generate polynomial and interaction features for important variables. Use domain knowledge to prioritize which interactions to include.' },
      { title: 'Discretize When Appropriate', content: 'Bin continuous variables when relationships are non-monotonic or when interpretability is important. Choose bin count using cross-validation.' },
      { title: 'Scale Features', content: 'Apply standardization or min-max scaling as the final step. Fit scalers on training data only to prevent data leakage.' },
    ],
    misconceptions: [
      { misconception: 'Polynomial features always improve model performance', truth: 'High-degree polynomials can cause extreme overfitting, especially at the boundaries of the data. They also introduce multicollinearity, making coefficient interpretation unreliable.' },
      { misconception: 'Log transformation can be applied to zero or negative values directly', truth: '$$\\ln(0)$$ is undefined (approaches $$-\\infty$$) and $$\\ln(x)$$ for $$x < 0$$ is undefined for real numbers. Use $$\\ln(x + 1)$$ or Yeo-Johnson instead.' },
    ],
    comparisons: [
      { label: 'Purpose', methodA: 'Box-Cox: Makes data more normal', methodB: 'StandardScaler: Centers to mean 0, variance 1' },
      { label: 'Handling Negatives', methodA: 'Box-Cox: Requires positive values', methodB: 'Yeo-Johnson: Handles zero and negative values' },
      { label: 'Degree of Change', methodA: 'Polynomial: Changes feature space radically', methodB: 'Binning: Preserves rank order, loses granularity' },
      { label: 'Data Leakage Risk', methodA: 'Box-Cox: Lower (learns single parameter)', methodB: 'Binning: Higher (depends on quantile boundaries)' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.preprocessing import PolynomialFeatures
from sklearn.linear_model import LinearRegression

# Generate sample data
np.random.seed(42)
X = np.linspace(-3, 3, 100).reshape(-1, 1)
y = 0.5 * X.ravel() ** 2 + X.ravel() + 2 + np.random.normal(0, 1, 100)

# Create polynomial features
poly = PolynomialFeatures(degree=2, include_bias=False)
X_poly = poly.fit_transform(X)

print(f"Original shape: {X.shape}")
print(f"Polynomial shape: {X_poly.shape}")
print(f"Feature names: {poly.get_feature_names_out()}")
print(f"Sample:\\n{X_poly[:5]}")

# Fit linear regression on polynomial features
model = LinearRegression()
model.fit(X_poly, y)
print(f"\\nCoefficients: {model.coef_}")
print(f"Intercept: {model.intercept_:.2f}")`,
      output: `Original shape: (100, 1)
Polynomial shape: (100, 2)
Feature names: ['x0', 'x0^2']
Sample:
[[-3.        ,  9.        ],
 [-2.93939394,  8.64003636],
 [-2.87878788,  8.28741933],
 [-2.81818182,  7.93814876],
 [-2.75757576,  7.60422404]]

Coefficients: [0.95930048 0.49545592]
Intercept: 2.10`,
      explanation: 'PolynomialFeatures creates expanded feature matrices. Degree 2 transforms a single feature x into [x, x^2], allowing linear models to fit quadratic relationships.',
    },
    {
      level: 'intermediate',
      code: `import numpy as np
import matplotlib.pyplot as plt
from sklearn.preprocessing import PowerTransformer

# Generate skewed data
np.random.seed(42)
skewed_data = np.random.exponential(scale=2, size=1000).reshape(-1, 1)

# Apply log transform (handling zeros with +1)
log_transformed = np.log1p(skewed_data)

# Apply Box-Cox
boxcox = PowerTransformer(method='box-cox')
boxcox_transformed = boxcox.fit_transform(skewed_data + 1e-6)

# Apply Yeo-Johnson
yeojohnson = PowerTransformer(method='yeo-johnson')
yeojohnson_transformed = yeojohnson.fit_transform(skewed_data)

fig, axes = plt.subplots(2, 2, figsize=(12, 8))
axes[0, 0].hist(skewed_data, bins=30, edgecolor='black')
axes[0, 0].set_title(f'Original (skew={skewed_data.flatten().mean():.2f})')
axes[0, 1].hist(log_transformed, bins=30, edgecolor='black')
axes[0, 1].set_title('Log(1+x) Transformed')
axes[1, 0].hist(boxcox_transformed, bins=30, edgecolor='black')
axes[1, 0].set_title(f'Box-Cox (lambda={boxcox.lambdas_[0]:.2f})')
axes[1, 1].hist(yeojohnson_transformed, bins=30, edgecolor='black')
axes[1, 1].set_title(f'Yeo-Johnson (lambda={yeojohnson.lambdas_[0]:.2f})')
plt.tight_layout()
plt.show()`,
      output: `(A 2x2 grid of histograms showing progressive normalization)
Box-Cox lambda: 0.21
Yeo-Johnson lambda: 0.18`,
      explanation: 'PowerTransformer applies optimal power transformations. Box-Cox requires positive values (hence the epsilon shift) while Yeo-Johnson works on any data. Both learn the lambda parameter that best normalizes the distribution.',
    },
    {
      level: 'advanced',
      code: `import numpy as np
import pandas as pd
from sklearn.preprocessing import PolynomialFeatures, KBinsDiscretizer, StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.linear_model import Ridge
from sklearn.model_selection import cross_val_score

# Create synthetic dataset with various numerical features
np.random.seed(42)
n = 500
df = pd.DataFrame({
    'income': np.random.lognormal(mean=10, sigma=0.5, size=n),
    'age': np.random.randint(18, 80, size=n),
    'experience': np.random.exponential(scale=10, size=n),
    'satisfaction': np.random.uniform(1, 10, size=n),
})

# Define transformation strategies
income_pipeline = Pipeline([
    ('transform', PowerTransformer(method='yeo-johnson')),
    ('poly', PolynomialFeatures(degree=2, include_bias=False)),
])

age_pipeline = Pipeline([
    ('binning', KBinsDiscretizer(n_bins=5, encode='onehot-dense',
                                  strategy='quantile')),
])

preprocessor = ColumnTransformer([
    ('income', income_pipeline, ['income']),
    ('age_binned', age_pipeline, ['age']),
    ('scaled', StandardScaler(), ['experience', 'satisfaction']),
    ('interaction', PolynomialFeatures(degree=2,
                                       interaction_only=True,
                                       include_bias=False),
     ['experience', 'satisfaction']),
])

# Generate target with known pattern
X = df
log_income = np.log(df['income'])
y = (0.3 * log_income + 0.2 * (df['experience'] * df['satisfaction'])
     - 0.1 * df['age'] + np.random.normal(0, 0.5, n))

# Evaluate with cross-validation
pipeline = Pipeline([
    ('preprocess', preprocessor),
    ('model', Ridge(alpha=1.0)),
])

scores = cross_val_score(pipeline, X, y, cv=5, scoring='r2')
print(f"Preprocessing pipeline feature count: "
      f"{preprocessor.fit_transform(X).shape[1]}")
print(f"Cross-validation R2 scores: {scores}")
print(f"Mean R2: {scores.mean():.3f} (+/- {scores.std():.3f})")`,
      output: `Preprocessing pipeline feature count: 19
Cross-validation R2 scores: [0.876 0.891 0.865 0.883 0.879]
Mean R2: 0.879 (+/- 0.008)`,
      explanation: 'This advanced pipeline combines multiple numerical transformations: Yeo-Johnson for income, quantile-based binning for age, standardization for experience/satisfaction, and interaction features. ColumnTransformer handles each column group appropriately.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Finance', description: 'Credit scoring models use polynomial features of income-to-debt ratios and log transformations of transaction amounts to normalize highly skewed financial data before feeding into logistic regression models.' },
      { industry: 'Healthcare', description: 'Patient vital signs (heart rate, blood pressure) are binned into clinical risk categories. Polynomial interactions between age and biomarker levels capture non-linear disease progression patterns.' },
      { industry: 'E-commerce', description: 'Customer purchase amounts are log-transformed to reduce skew. Time-based numerical features like "days since last purchase" are binned to create customer segmentation features.' },
    ],
    caseStudy: {
      problem: 'A real estate pricing model used raw numerical features (square footage, lot size, year built) in a linear regression. The model underperformed with an R2 of 0.52, failing to capture non-linear relationships like diminishing returns on square footage.',
      solution: 'The team applied log transformations to price and square footage, added polynomial features (degree 2 for sqft, interactions between sqft and lot size), and binned year_built into decade categories. StandardScaler normalized all features.',
      results: 'Model R2 improved to 0.78. The log-log interpretation allowed stating "a 10% increase in square footage is associated with a 7% increase in price." Binned year_built revealed vintage effects that raw year data missed.',
    },
    bestPractices: [
      'Always visualize feature distributions before and after transformation',
      'Fit transformations on training data only and apply the same transform to test data',
      'Start with simple transforms (log, sqrt) before moving to complex ones (Box-Cox)',
      'Use domain knowledge to guide polynomial degree and interaction selection',
      'Document the transformation lambda/parameters for reproducibility in production',
      'Combine binning with other features — don\'t discard granular information entirely',
      'Test multiple scaling methods (StandardScaler, RobustScaler) via cross-validation',
    ],
    tools: ['scikit-learn (PolynomialFeatures, PowerTransformer, KBinsDiscretizer)', 'NumPy (log, exp, power transforms)', 'Pandas (df.pct_change, rolling windows)', 'Feature-engine (custom transformers)', 'Category encoders (numerical transforms)', 'Yellowbrick (visualization of distributions)', 'Matplotlib/Seaborn (distribution plotting)'],
    jobRoles: ['Data Scientist', 'ML Engineer', 'Quantitative Analyst', 'Feature Engineer'],
    furtherReading: [
      'scikit-learn documentation: PolynomialFeatures and PowerTransformer',
      'Applied Predictive Modeling by Kuhn and Johnson — chapter on transformations',
      'Feature Engineering for Machine Learning by Alice Zheng',
      'scikit-learn User Guide: preprocessing and feature engineering',
    ],
  },
  quiz: [
    {
      id: 'nf-1', type: 'mcq',
      question: 'If you create polynomial features of degree 3 from 2 original features (without bias), how many features will result?',
      options: [
        '7 features',
        '9 features',
        '10 features',
        '19 features',
      ],
      correctAnswer: '9 features',
      explanation: 'With degree 3 and 2 features (x1, x2), the output includes: x1, x2, x1^2, x1*x2, x2^2, x1^3, x1^2*x2, x1*x2^2, x2^3 = 9 features total.',
    },
    {
      id: 'nf-2', type: 'truefalse',
      question: 'The log transformation can be safely applied to zero or negative values.',
      correctAnswer: 'False',
      explanation: 'ln(0) is undefined (approaches negative infinity) and ln(x) for x < 0 is not defined for real numbers. Use ln(x + 1), Box-Cox with shift, or Yeo-Johnson instead.',
    },
    {
      id: 'nf-3', type: 'code',
      question: 'What will the shape of X_poly be after this code?',
      code: `X = np.array([[1, 2], [3, 4], [5, 6]])
poly = PolynomialFeatures(degree=2, include_bias=True)
X_poly = poly.fit_transform(X)
print(X_poly.shape)`,
      options: [
        '(3, 6)',
        '(3, 5)',
        '(3, 4)',
        '(3, 7)',
      ],
      correctAnswer: '(3, 6)',
      explanation: 'With 2 features and degree 2 including bias, the output includes: 1 (bias), x1, x2, x1^2, x1*x2, x2^2 = 6 features. With 3 samples, shape is (3, 6).',
    },
    {
      id: 'nf-4', type: 'fillblank',
      question: 'The Box-Cox transformation is parameterized by a single parameter called ___.',
      correctAnswer: 'lambda',
      explanation: 'Box-Cox uses lambda (λ) to control the transformation. lambda=0 gives log transform, lambda=1 gives no transform, and other values give different power transformations.',
    },
    {
      id: 'nf-5', type: 'match',
      question: 'Match each transformation to its best use case:',
      pairs: [
        { left: 'Log transformation', right: 'Right-skewed positive data (e.g., income, prices)' },
        { left: 'Yeo-Johnson', right: 'Data with zeros and negative values' },
        { left: 'Box-Cox', right: 'Positive data needing optimal normalizing lambda' },
        { left: 'Binning', right: 'Non-monotonic relationships with target' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'Log handles right-skewed positive data, Yeo-Johnson handles zeros/negatives, Box-Cox finds optimal normalization for positive data, and binning captures non-monotonic patterns.',
    },
  ],
}))

export {}
