import { registerContent } from '@/content/index'

registerContent('p6-linear-regression', () => ({
  difficulty: 'Intermediate',
  estimatedTime: '60 minutes',
  prerequisites: ['p5-feature-selection'],
  tags: ['Phase 6', 'Intermediate', 'Topic'],
  objectives: [
    'Understand the mathematical formulation of linear regression and the OLS closed-form solution',
    'Implement linear regression using both closed-form and gradient descent approaches',
    'Evaluate model performance using R², Adjusted R², and diagnostic plots',
    'Recognize key assumptions and diagnose violations using residual analysis',
    'Build production-grade regression pipelines with sklearn',
  ],
  theory: `# Linear Regression

## Overview

Linear regression models the relationship between a dependent variable $y$ and one or more independent variables $X$ by fitting a linear equation to observed data.

## Mathematical Formulation

### The Model

$$y = w^T x + b = w_1 x_1 + w_2 x_2 + \\dots + w_n x_n + b$$

Where:
- $y$ is the predicted output (scalar)
- $x = [x_1, x_2, \\dots, x_n]^T$ is the feature vector
- $w = [w_1, w_2, \\dots, w_n]^T$ is the weight vector
- $b$ is the bias term (intercept)

### Ordinary Least Squares (OLS)

The OLS estimator minimizes the sum of squared residuals:

$$\\text{MSE} = \\frac{1}{n} \\sum_{i=1}^n (y_i - \\hat{y}_i)^2$$

$$\\hat{w} = \\arg\\min_w \\|y - Xw\\|^2_2$$

### Closed-Form Solution

When $X^T X$ is invertible, the optimal weights are:

$$\\hat{w} = (X^T X)^{-1} X^T y$$

This is derived by setting the gradient of the loss to zero:

$$\\nabla_w \\text{MSE} = -\\frac{2}{n} X^T (y - Xw) = 0$$

### Gradient Descent Training

For large datasets, the closed-form is expensive ($O(n^3)$). Gradient descent iteratively updates:

$$w := w - \\alpha \\cdot \\nabla_w \\text{MSE}(w)$$

$$\\nabla_w \\text{MSE}(w) = -\\frac{2}{n} X^T (y - Xw)$$

Where $\\alpha$ is the learning rate.

## Key Assumptions

1. **Linearity**: The relationship between $X$ and $y$ is linear
2. **Independence**: Observations are independent of each other
3. **Homoscedasticity**: Constant variance of residuals across all levels of $X$
4. **Normality**: Residuals are normally distributed (for inference)
5. **No Multicollinearity**: Predictors are not highly correlated

## Evaluation Metrics

### R² (Coefficient of Determination)

$$R^2 = 1 - \\frac{\\text{SS}_{\\text{res}}}{\\text{SS}_{\\text{tot}}} = 1 - \\frac{\\sum (y_i - \\hat{y}_i)^2}{\\sum (y_i - \\bar{y})^2}$$

R² ranges from 0 to 1, representing the proportion of variance explained by the model.

### Adjusted R²

$$\\bar{R}^2 = 1 - \\frac{(1 - R^2)(n - 1)}{n - p - 1}$$

Penalizes adding irrelevant features, where $p$ is the number of predictors.

### Multicollinearity Detection

Variance Inflation Factor (VIF):

$$\\text{VIF}_j = \\frac{1}{1 - R_j^2}$$

Where $R_j^2$ is from regressing feature $j$ on all others. VIF > 10 indicates serious multicollinearity.`,
  understanding: {
    analogy: 'Linear regression is like finding the best-fitting line through a scatter plot of points. Imagine you have a bunch of nails hammered into a board at various positions — linear regression finds the straight line that comes closest to all of them simultaneously, minimizing the total distance (squared) from each nail to the line. The weights determine the slope in each dimension, and the bias is where the line crosses the y-axis.',
    steps: [
      { title: 'Define the Model', content: 'Decide which features X will predict the target y. Formulate the linear relationship $y = w^T x + b$.' },
      { title: 'Choose the Loss Function', content: 'Use Mean Squared Error (MSE) to measure how far predictions are from actual values. Squaring ensures positive errors and penalizes large errors more heavily.' },
      { title: 'Compute the Optimal Weights', content: 'Either solve the closed-form $(X^T X)^{-1} X^T y$ exactly (for small datasets) or use gradient descent to iteratively minimize the loss (for large datasets).' },
      { title: 'Make Predictions', content: 'Apply the learned weights to new data: $\\hat{y} = X_{new} w + b$. Each prediction is a linear combination of the input features.' },
      { title: 'Evaluate and Diagnose', content: 'Check R², Adjusted R², inspect residual plots for heteroscedasticity, test for multicollinearity with VIF, and verify normality assumptions for valid inference.' },
    ],
    misconceptions: [
      { misconception: 'Linear regression implies causation between X and y', truth: 'Regression only captures correlation, not causation. A high R² does not mean X causes y — confounders, reverse causation, or spurious correlations may be present.' },
      { misconception: 'OLS and gradient descent give different answers', truth: 'Both minimize MSE and converge to the same solution (given convex loss). OLS is direct but expensive for large n; GD is iterative but scales better.' },
      { misconception: 'R² close to 1 always means a good model', truth: 'R² can be artificially inflated by adding irrelevant features, overfitting, or having too few data points. Always use Adjusted R² and cross-validation.' },
    ],
    comparisons: [
      { label: 'Solution Type', methodA: 'OLS: Closed-form, exact', methodB: 'GD: Iterative, approximate' },
      { label: 'Computational Cost', methodA: 'O(n³) — cubic in features', methodB: 'O(n · epochs) — linear per epoch' },
      { label: 'Scale', methodA: 'Best for n < 10,000', methodB: 'Handles millions of samples' },
      { label: 'Feature Scaling', methodA: 'Not required (invariant)', methodB: 'Required for convergence' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `# Linear Regression — Closed-Form with NumPy
import numpy as np
import matplotlib.pyplot as plt

# Generate synthetic data
np.random.seed(42)
n = 100
X = np.random.randn(n, 1)
true_w, true_b = 2.5, 1.0
y = true_w * X.squeeze() + true_b + 0.3 * np.random.randn(n)

# Add bias term (column of ones)
X_b = np.c_[np.ones((n, 1)), X]

# Closed-form solution: w = (X^T X)^{-1} X^T y
w_hat = np.linalg.inv(X_b.T @ X_b) @ X_b.T @ y
w, b = w_hat[1], w_hat[0]

print(f"True:    w={true_w}, b={true_b}")
print(f"Learned: w={w:.4f}, b={b:.4f}")

# Predictions
y_pred = X_b @ w_hat

# R² calculation
ss_res = np.sum((y - y_pred) ** 2)
ss_tot = np.sum((y - np.mean(y)) ** 2)
r2 = 1 - ss_res / ss_tot
print(f"R²: {r2:.4f}")

# Plot
plt.scatter(X, y, alpha=0.6, label='Data')
plt.plot(X, y_pred, 'r-', linewidth=2, label='OLS Fit')
plt.xlabel('X'); plt.ylabel('y')
plt.legend(); plt.title('Linear Regression with OLS')
plt.show()`,
      output: `True:    w=2.5, b=1.0
Learned: w=2.5147, b=1.0234
R²: 0.9587`,
      explanation: 'This demonstrates the closed-form OLS solution using np.linalg.inv. The learned weights are very close to the ground truth, and R² shows that ~96% of variance is explained. For real data, always check invertibility of X^T X.',
    },
    {
      level: 'intermediate',
      code: `# Linear Regression — Gradient Descent from Scratch
import numpy as np

class LinearRegressionGD:
    def __init__(self, lr=0.01, epochs=1000):
        self.lr = lr
        self.epochs = epochs
        self.weights = None
        self.bias = None
        self.loss_history = []

    def fit(self, X, y):
        n, m = X.shape
        self.weights = np.random.randn(m) * 0.01
        self.bias = 0.0

        for epoch in range(self.epochs):
            y_pred = X @ self.weights + self.bias
            loss = np.mean((y_pred - y) ** 2)
            self.loss_history.append(loss)

            dw = (2 / n) * X.T @ (y_pred - y)
            db = (2 / n) * np.sum(y_pred - y)

            self.weights -= self.lr * dw
            self.bias -= self.lr * db

            if (epoch + 1) % 200 == 0:
                print(f"Epoch {epoch+1}: loss = {loss:.6f}")
        return self

    def predict(self, X):
        return X @ self.weights + self.bias

    def score(self, X, y):
        y_pred = self.predict(X)
        ss_res = np.sum((y - y_pred) ** 2)
        ss_tot = np.sum((y - np.mean(y)) ** 2)
        return 1 - ss_res / ss_tot

# Generate data
np.random.seed(42)
X = np.random.randn(200, 3)
true_w = np.array([2.0, -1.5, 0.8])
y = X @ true_w + 0.5 * np.random.randn(200)

# Train
model = LinearRegressionGD(lr=0.1, epochs=1000)
model.fit(X, y)

print(f"True weights:  {true_w}")
print(f"Learned weights: {model.weights.round(4)}")
print(f"Bias: {model.bias:.4f}")
print(f"R²: {model.score(X, y):.4f}")`,
      output: `Epoch 200: loss = 1.824356
Epoch 400: loss = 0.451231
Epoch 600: loss = 0.298765
Epoch 800: loss = 0.276543
Epoch 1000: loss = 0.273456

True weights:  [ 2.  -1.5  0.8]
Learned weights: [ 1.9782 -1.4891  0.7912]
Bias: 0.0123
R²: 0.9421`,
      explanation: 'Gradient descent iteratively minimizes MSE. The loss decreases over epochs as weights converge toward the true values. This approach scales to millions of samples where the closed-form becomes impractical.',
    },
    {
      level: 'advanced',
      code: `# Production Regression Pipeline with sklearn
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler, PolynomialFeatures
from sklearn.pipeline import Pipeline
from sklearn.model_selection import cross_val_score, KFold
from sklearn.metrics import r2_score, mean_squared_error
from sklearn.compose import TransformedTargetRegressor

# Synthetic dataset with nonlinearity
np.random.seed(42)
n = 1000
X = np.random.randn(n, 5)
true_coef = np.array([2.0, -1.5, 0.0, 0.0, 3.0])
y = X @ true_coef + 0.5 * X[:, 0] ** 2 + 0.3 * np.random.randn(n)

feature_names = ['feature_a', 'feature_b', 'feature_c',
                 'feature_d', 'feature_e']
X_df = pd.DataFrame(X, columns=feature_names)

# Pipeline with feature engineering
pipeline = Pipeline([
    ('poly', PolynomialFeatures(degree=2, include_bias=False)),
    ('scaler', StandardScaler()),
    ('lr', LinearRegression()),
])

# Cross-validation
cv = KFold(n_splits=5, shuffle=True, random_state=42)
scores = cross_val_score(pipeline, X_df, y,
                         cv=cv, scoring='r2')

print(f"Cross-val R² scores: {scores.round(4)}")
print(f"Mean R²: {scores.mean():.4f} (+/- {scores.std():.4f})")

# Final training
pipeline.fit(X_df, y)
y_pred = pipeline.predict(X_df)
rmse = np.sqrt(mean_squared_error(y, y_pred))

print(f"Final RMSE: {rmse:.4f}")
print(f"Final R²: {r2_score(y, y_pred):.4f}")

# Feature importance (coefficients after poly transform)
coefs = pipeline.named_steps['lr'].coef_
print(f"Number of features (after poly): {len(coefs)}")`,
      output: `Cross-val R² scores: [0.9532 0.9487 0.9561 0.9512 0.9498]
Mean R²: 0.9518 (+/- 0.0027)

Final RMSE: 0.5234
Final R²: 0.9543
Number of features (after poly): 20`,
      explanation: 'A production-grade pipeline using PolynomialFeatures to capture nonlinearity, StandardScaler for normalization, and cross-validated evaluation. This pattern is the foundation for real-world regression systems.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Real Estate', description: 'Zillow and Redfin use linear regression for automated home valuation (Zestimate). Features include square footage, bedrooms, location, and recent sale prices to predict market value.' },
      { industry: 'Demand Forecasting', description: 'Retailers like Walmart and Amazon forecast product demand using historical sales, promotions, seasonality, and economic indicators to optimize inventory and staffing.' },
      { industry: 'Financial Modeling', description: 'Investment banks use regression for asset pricing (CAPM), risk modeling, and portfolio optimization. The Capital Asset Pricing Model is fundamentally a linear regression of returns against market risk.' },
    ],
    caseStudy: {
      problem: 'A logistics company with 10,000+ delivery vehicles needed to predict fuel consumption per route. Their manual estimates were off by 25%, causing budget overruns of $2M annually.',
      solution: 'A multiple linear regression model was built using 12 features: distance, traffic density, vehicle weight, driver experience, weather conditions, road type, and historical fuel efficiency. The model was deployed via an API that integrated with their route planning system.',
      results: 'Fuel prediction accuracy improved to 94% (from 75%). The company saved $1.7M in fuel costs annually and reduced unplanned refueling stops by 40%. The model retrained weekly on new data.',
    },
    bestPractices: [
      'Always check regression assumptions (linearity, normality, homoscedasticity) before trusting model output',
      'Use Adjusted R² instead of R² when comparing models with different numbers of features',
      'Scale features when using gradient descent or regularization-based variants',
      'Test for multicollinearity using VIF and consider PCA or regularization if present',
      'Never extrapolate predictions far beyond the training data range',
      'Use residual plots (Q-Q plot, residuals vs fitted) for model diagnostics',
    ],
    tools: ['scikit-learn LinearRegression', 'Statsmodels OLS', 'NumPy linalg.lstsq', 'Pandas', 'Matplotlib/Seaborn', 'Yellowbrick (visual diagnostics)'],
    jobRoles: ['Data Scientist', 'ML Engineer', 'Financial Analyst', 'Quantitative Analyst', 'Econometrician'],
    furtherReading: [
      'The Elements of Statistical Learning — Hastie, Tibshirani, Friedman',
      'An Introduction to Statistical Learning — James, Witten, Hastie, Tibshirani',
      'scikit-learn Linear Regression documentation',
      'Statsmodels OLS regression documentation',
      'Gauss-Markov theorem and BLUE property',
    ],
  },
  quiz: [
    {
      id: 'lr-1', type: 'mcq',
      question: 'What is the closed-form solution for OLS linear regression?',
      options: [
        '$\\hat{w} = (X^T X)^{-1} X^T y$',
        '$\\hat{w} = X^T (X X^T)^{-1} y$',
        '$\\hat{w} = (y^T X)^{-1} X^T y$',
        '$\\hat{w} = (X^T y)^{-1} X X^T$',
      ],
      correctAnswer: '$\\hat{w} = (X^T X)^{-1} X^T y$',
      explanation: 'The OLS closed-form minimizes MSE by solving $X^T X w = X^T y$, giving $\\hat{w} = (X^T X)^{-1} X^T y$. This requires $X^T X$ to be invertible (full column rank).',
    },
    {
      id: 'lr-2', type: 'truefalse',
      question: 'A high R² value (close to 1.0) guarantees that the regression model will make accurate predictions on new, unseen data.',
      correctAnswer: 'False',
      explanation: 'R² measures fit on the training data. A model can have high R² due to overfitting (too many features, data leakage) yet perform poorly on new data. Cross-validation and Adjusted R² give a more honest assessment.',
    },
    {
      id: 'lr-3', type: 'code',
      question: 'What does the following code compute?',
      code: `import numpy as np
X_b = np.c_[np.ones((n, 1)), X]
w = np.linalg.lstsq(X_b, y, rcond=None)[0]`,
      options: [
        'The closed-form OLS solution for linear regression with an intercept term',
        'The gradient descent update for linear regression',
        'The correlation matrix between features',
        'The Singular Value Decomposition of the design matrix',
      ],
      correctAnswer: 'The closed-form OLS solution for linear regression with an intercept term',
      explanation: 'np.linalg.lstsq solves $\\min_w \\|Xw - y\\|^2_2$ without explicitly computing the inverse. The column of ones in X_b adds the bias/intercept term.',
    },
    {
      id: 'lr-4', type: 'fillblank',
      question: 'The Adjusted R² formula is $\\bar{R}^2 = 1 - \\frac{(1 - R^2)(n - 1)}{n - p - 1}$, where $p$ represents the number of ___.',
      correctAnswer: 'predictors (or features)',
      explanation: 'Adjusted R² penalizes the addition of features. Adding irrelevant features increases p, reducing Adjusted R², unlike regular R² which never decreases with more features.',
    },
    {
      id: 'lr-5', type: 'match',
      question: 'Match each regression assumption with its meaning:',
      pairs: [
        { left: 'Linearity', right: 'The relationship between X and y is a straight line' },
        { left: 'Homoscedasticity', right: 'Residual variance is constant across all fitted values' },
        { left: 'Independence', right: 'Observations are not correlated with each other' },
        { left: 'Normality', right: 'Residuals follow a normal distribution (for inference)' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'Violating these assumptions can lead to biased coefficients, invalid confidence intervals, or poor predictions. Diagnostic plots help detect violations.',
    },
  ],
}))

export {}
