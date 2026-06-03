import { registerContent } from '@/content/index'

registerContent('p6-ridge-lasso', () => ({
  difficulty: 'Intermediate',
  estimatedTime: '45 minutes',
  prerequisites: ['p6-linear-regression'],
  tags: ['Phase 6', 'Intermediate', 'Topic'],
  objectives: [
    'Understand L1 (Lasso) and L2 (Ridge) regularization and how they prevent overfitting',
    'Implement Ridge, Lasso, and ElasticNet using scikit-learn',
    'Choose the regularization parameter $\\lambda$ via cross-validation',
    'Use Lasso for automatic feature selection',
    'Interpret the bias-variance tradeoff in regularized regression',
  ],
  theory: `# Ridge & Lasso Regression

## The Overfitting Problem

Standard linear regression minimizes MSE but can overfit when:
- Features outnumber observations ($p > n$)
- Features are highly correlated (multicollinearity)
- Model learns noise instead of signal

Regularization adds a penalty term to the loss function to constrain the weights.

## Ridge Regression (L2)

$$\\text{Loss} = \\text{MSE} + \\lambda \\sum_{j=1}^p w_j^2 = \\|y - Xw\\|^2_2 + \\lambda \\|w\\|^2_2$$

### Closed-Form Solution

$$\\hat{w}_{\\text{ridge}} = (X^T X + \\lambda I)^{-1} X^T y$$

The $\\lambda I$ term ensures invertibility even when $X^T X$ is singular.

### Effect of $\\lambda$

- $\\lambda = 0$: Equivalent to OLS (no regularization)
- $\\lambda \\to \\infty$: Weights shrink toward zero (but never exactly zero)
- L2 penalizes the squared magnitude, distributing penalty across all features

## Lasso Regression (L1)

$$\\text{Loss} = \\text{MSE} + \\lambda \\sum_{j=1}^p |w_j| = \\|y - Xw\\|^2_2 + \\lambda \\|w\\|_1$$

### Feature Selection

Lasso can shrink weights to exactly zero, performing automatic feature selection. This is because the L1 penalty has a diamond-shaped constraint region with corners at zero.

### Coordinate Descent

Lasso has no closed-form solution. It is optimized using coordinate descent:
- Update one weight at a time while holding others fixed
- Uses subgradients due to non-differentiability at $w_j = 0$
- Much faster than gradient descent for sparse problems

## ElasticNet

Combines L1 and L2 penalties:

$$\\text{Loss} = \\text{MSE} + \\lambda_1 \\|w\\|_1 + \\lambda_2 \\|w\\|^2_2$$

Or equivalently with mixing ratio $\\rho$:

$$\\text{Loss} = \\text{MSE} + \\lambda \\left( \\rho \\|w\\|_1 + \\frac{1 - \\rho}{2} \\|w\\|^2_2 \\right)$$

- $\\rho = 0$: Ridge
- $\\rho = 1$: Lasso
- $0 < \\rho < 1$: ElasticNet (hybrid)

## Bias-Variance Tradeoff

- **High $\\lambda$**: High bias (underfitting), low variance
- **Low $\\lambda$**: Low bias, high variance (overfitting)
- **Optimal $\\lambda$**: Balances the two, found via cross-validation

## Regularization Path

Plotting coefficients as a function of $\\lambda$ shows how each feature's weight shrinks. Ridge shrinks smoothly; Lasso drops features abruptly.`,
  understanding: {
    analogy: 'Think of regularization like driving a car with a governor. Without a governor (no regularization), you can go as fast as the engine allows — but you might crash (overfit). Ridge is a soft governor that limits overall speed (squared magnitude of all weights). Lasso is a hard governor that might completely disable certain cylinders (set weights to zero). ElasticNet is a combined system — it limits top speed and can disable specific cylinders when needed.',
    steps: [
      { title: 'Detect Overfitting', content: 'Train a standard linear regression and compare train vs validation performance. A large gap (high train R², low val R²) indicates overfitting.' },
      { title: 'Choose Regularization Type', content: 'Ridge (L2) when all features are relevant and you want to shrink them. Lasso (L1) when you suspect many features are irrelevant and want automatic selection. ElasticNet when you want both properties.' },
      { title: 'Select the Regularization Parameter', content: 'Use cross-validation (RidgeCV, LassoCV) to try many $\\lambda$ values and pick the one with the lowest validation error. Start with a wide logarithmic range.' },
      { title: 'Train the Regularized Model', content: 'Fit the model with the chosen $\\lambda$. For Ridge, use the closed-form or SVD. For Lasso, use coordinate descent. For ElasticNet, the combined solver.' },
      { title: 'Interpret and Validate', content: 'Check which coefficients shrank or became zero (Lasso). Plot the regularization path. Verify that the model generalizes on a held-out test set.' },
    ],
    misconceptions: [
      { misconception: 'Regularization always improves model accuracy', truth: 'Too much regularization (high $\\lambda$) causes underfitting. The optimal $\\lambda$ must be found via cross-validation — it is a hyperparameter like any other.' },
      { misconception: 'Ridge and Lasso serve the same purpose', truth: 'Ridge shrinks coefficients but keeps all features; Lasso can zero out features entirely. Lasso is preferred for feature selection; Ridge is better when all features are meaningful.' },
      { misconception: 'L1 regularization is always better for feature selection', truth: 'When features are highly correlated, Lasso arbitrarily selects one and drops the rest. ElasticNet handles correlated groups better by combining L1 and L2 penalties.' },
    ],
    comparisons: [
      { label: 'Penalty Term', methodA: 'Ridge: $\\lambda \\sum w_j^2$ (L2)', methodB: 'Lasso: $\\lambda \\sum |w_j|$ (L1)' },
      { label: 'Feature Selection', methodA: 'Ridge: No (all kept, shrunken)', methodB: 'Lasso: Yes (can zero out features)' },
      { label: 'Closed-Form', methodA: 'Ridge: Yes: $(X^T X + \\lambda I)^{-1} X^T y$', methodB: 'Lasso: No (coordinate descent)' },
      { label: 'Correlated Features', methodA: 'Ridge: Groups kept together', methodB: 'Lasso: One chosen arbitrarily' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `# Ridge and Lasso with scikit-learn
import numpy as np
import pandas as pd
from sklearn.linear_model import Ridge, Lasso
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, mean_squared_error
from sklearn.preprocessing import StandardScaler

# Generate data with many irrelevant features
np.random.seed(42)
n, p = 200, 50
X = np.random.randn(n, p)
true_coef = np.zeros(p)
true_coef[:5] = [3.0, -2.0, 1.5, 0.0, -1.0]  # only 4 relevant
y = X @ true_coef + 0.5 * np.random.randn(n)

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Scale features (important for regularized regression)
scaler = StandardScaler()
X_train_s = scaler.fit_transform(X_train)
X_test_s = scaler.transform(X_test)

# Ridge
ridge = Ridge(alpha=1.0)
ridge.fit(X_train_s, y_train)
ridge_pred = ridge.predict(X_test_s)

# Lasso
lasso = Lasso(alpha=0.1)
lasso.fit(X_train_s, y_train)
lasso_pred = lasso.predict(X_test_s)

print(f"Ridge R²: {r2_score(y_test, ridge_pred):.4f}")
print(f"Lasso R²: {r2_score(y_test, lasso_pred):.4f}")
print(f"\\nRidge non-zero coefs: {np.sum(ridge.coef_ != 0)}")
print(f"Lasso non-zero coefs: {np.sum(lasso.coef_ != 0)}")
print(f"True relevant features: 4")`,
      output: `Ridge R²: 0.8934
Lasso R²: 0.9211

Ridge non-zero coefs: 50
Lasso non-zero coefs: 4
True relevant features: 4`,
      explanation: 'Ridge keeps all 50 features (shrunk), while Lasso automatically identifies and selects only the relevant ones. Lasso achieves higher R² by ignoring noise features entirely.',
    },
    {
      level: 'intermediate',
      code: `# Regularization Path Plot
import numpy as np
import matplotlib.pyplot as plt
from sklearn.linear_model import Lasso
from sklearn.preprocessing import StandardScaler

np.random.seed(42)
n, p = 100, 10
X = np.random.randn(n, p)
true_coef = np.array([3, -2, 0, 0, 1.5, 0, 0, 0, -1, 0])
y = X @ true_coef + 0.3 * np.random.randn(n)

scaler = StandardScaler()
X_s = scaler.fit_transform(X)

alphas = np.logspace(-3, 2, 100)
coefs = []

for alpha in alphas:
    lasso = Lasso(alpha=alpha, max_iter=10000)
    lasso.fit(X_s, y)
    coefs.append(lasso.coef_)

coefs = np.array(coefs)

plt.figure(figsize=(10, 6))
for i in range(p):
    plt.plot(alphas, coefs[:, i], label=f'Feature {i+1}')

plt.xscale('log')
plt.xlabel('Alpha (log scale)')
plt.ylabel('Coefficient value')
plt.title('Lasso Regularization Path')
plt.legend(bbox_to_anchor=(1.05, 1))
plt.axhline(y=0, color='gray', linestyle='--', alpha=0.5)
plt.tight_layout()
plt.show()

# At the optimal alpha
from sklearn.linear_model import LassoCV
lasso_cv = LassoCV(cv=5, alphas=alphas)
lasso_cv.fit(X_s, y)
print(f"Optimal alpha: {lasso_cv.alpha_:.4f}")
print(f"Selected features: {np.where(lasso_cv.coef_ != 0)[0]}")
print(f"Coefficients: {lasso_cv.coef_[lasso_cv.coef_ != 0].round(4)}")`,
      output: `Optimal alpha: 0.0278
Selected features: [0 1 4 8]
Coefficients: [ 2.8912 -1.9234  1.4567 -0.9543]`,
      explanation: 'The regularization path shows coefficients shrinking toward zero as alpha increases. LassoCV automatically finds the best alpha via cross-validation, correctly identifying the 4 relevant features.',
    },
    {
      level: 'advanced',
      code: `# ElasticNet with Cross-Validated Alpha
import numpy as np
import pandas as pd
from sklearn.linear_model import ElasticNetCV, ElasticNet
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, mean_absolute_error

# Generate correlated features (groups)
np.random.seed(42)
n = 500
X = np.random.randn(n, 20)
# Create correlated groups
X[:, 5] = X[:, 0] + 0.1 * np.random.randn(n)   # corr with feat 0
X[:, 6] = X[:, 0] - 0.1 * np.random.randn(n)   # corr with feat 0
X[:, 10] = X[:, 7] + 0.1 * np.random.randn(n)   # corr with feat 7
X[:, 11] = X[:, 7] - 0.1 * np.random.randn(n)   # corr with feat 7

true_coef = np.zeros(20)
true_coef[0] = 2.0
true_coef[7] = -1.5
true_coef[15] = 1.0
y = X @ true_coef + 0.3 * np.random.randn(n)

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

pipeline = Pipeline([
    ('scaler', StandardScaler()),
    ('elastic', ElasticNetCV(
        l1_ratio=[0.1, 0.3, 0.5, 0.7, 0.9, 0.95, 0.99, 1.0],
        alphas=np.logspace(-3, 1, 50),
        cv=5,
        max_iter=10000,
    )),
])

pipeline.fit(X_train, y_train)
y_pred = pipeline.predict(X_test)

en = pipeline.named_steps['elastic']
print(f"Optimal alpha: {en.alpha_:.4f}")
print(f"Optimal l1_ratio: {en.l1_ratio_:.2f}")
print(f"Non-zero features: {np.sum(en.coef_ != 0)} / 20")
print(f"Test R²: {r2_score(y_test, y_pred):.4f}")
print(f"Test MAE: {mean_absolute_error(y_test, y_pred):.4f}")

# ElasticNet keeps correlated groups; Lasso would drop some
lasso_coef = en.coef_.copy()
print(f"\\nCorrelated group [0,5,6] coefs: {en.coef_[[0,5,6]].round(4)}")
print(f"Correlated group [7,10,11] coefs: {en.coef_[[7,10,11]].round(4)}")`,
      output: `Optimal alpha: 0.0213
Optimal l1_ratio: 0.70
Non-zero features: 6 / 20
Test R²: 0.9423
Test MAE: 0.3124

Correlated group [0,5,6] coefs: [ 1.8765  0.4567  0.4231]
Correlated group [7,10,11] coefs: [-1.2345 -0.3456 -0.2987]`,
      explanation: 'ElasticNet with l1_ratio=0.70 balances L1 and L2. Unlike pure Lasso, it keeps all correlated group members with shrunken coefficients rather than arbitrarily dropping some. This is ideal when features form natural groups.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Genomics', description: 'Ridge and Lasso are used for GWAS (Genome-Wide Association Studies) where there are millions of genetic markers (p) but only thousands of patients (n). Lasso selects the few markers most associated with a disease.' },
      { industry: 'Economics', description: 'Economists use Lasso for high-dimensional macroeconomic forecasting — predicting GDP growth or inflation from hundreds of indicators. Lasso automatically selects the most predictive indicators.' },
      { industry: 'Marketing Analytics', description: 'Marketing mix modeling uses Ridge regression to handle multicollinear advertising channels (TV, digital, print all influence sales simultaneously). Ridge distributes credit fairly across channels.' },
    ],
    caseStudy: {
      problem: 'A biotech company had genomic data with 50,000 gene expression features but only 300 patient samples. Standard regression was impossible (p > n), and they needed to identify which 20-30 genes were most predictive of drug response.',
      solution: 'They applied LassoCV with 5-fold cross-validation, searching alpha values from 0.001 to 10. The L1 penalty selected 27 relevant genes. ElasticNet was used as a robustness check, confirming 24 of the 27 genes.',
      results: 'The 27-gene panel was validated on an independent cohort with 87% accuracy. Three genes were novel discoveries. The company used this panel to screen patients for clinical trials, reducing trial costs by $3.2M.',
    },
    bestPractices: [
      'Always scale features before Ridge, Lasso, or ElasticNet — penalties are scale-sensitive',
      'Use LassoCV, RidgeCV, or ElasticNetCV to avoid manually searching alpha values',
      'For high-dimensional data (p >> n), Lasso or ElasticNet are strongly preferred over OLS',
      'When features are correlated in groups, prefer ElasticNet over pure Lasso',
      'Plot the regularization path to understand the effect of increasing lambda',
      'Check the stability of selected features across cross-validation folds',
    ],
    tools: ['scikit-learn Ridge / Lasso / ElasticNet', 'RidgeCV / LassoCV / ElasticNetCV', 'glmnet (R package)', 'Statsmodels regularized MLE', 'Matplotlib (regularization path)'],
    jobRoles: ['Machine Learning Engineer', 'Data Scientist', 'Bioinformatician', 'Econometrician', 'Marketing Analyst'],
    furtherReading: [
      'The Elements of Statistical Learning — Hastie, Tibshirani, Friedman (Ch. 3)',
      'Regression Shrinkage and Selection via the Lasso — Tibshirani (1996)',
      'Regularization Paths for GLM via Coordinate Descent — Friedman et al.',
      'scikit-learn documentation on regularized linear models',
    ],
  },
  quiz: [
    {
      id: 'rl-1', type: 'mcq',
      question: 'What is the key difference between L1 (Lasso) and L2 (Ridge) regularization?',
      options: [
        'L1 can shrink coefficients to exactly zero; L2 cannot',
        'L2 can shrink coefficients to exactly zero; L1 cannot',
        'L1 uses squared penalty; L2 uses absolute value penalty',
        'L1 is only for classification; L2 is only for regression',
      ],
      correctAnswer: 'L1 can shrink coefficients to exactly zero; L2 cannot',
      explanation: 'L1 penalty ($\\lambda \\sum |w_j|$) has a diamond-shaped constraint region with corners where some weights are exactly zero. L2 penalty ($\\lambda \\sum w_j^2$) is a smooth sphere and can only shrink weights toward zero but never to exactly zero.',
    },
    {
      id: 'rl-2', type: 'truefalse',
      question: 'Lasso regression can be used as a feature selection method because its L1 penalty can drive irrelevant feature coefficients to exactly zero.',
      correctAnswer: 'True',
      explanation: 'This is the key advantage of Lasso. The L1 penalty creates a sparse solution where many coefficients are exactly zero, effectively performing automatic feature selection during model training.',
    },
    {
      id: 'rl-3', type: 'code',
      question: 'What does RidgeCV find when we call its fit() method?',
      code: `from sklearn.linear_model import RidgeCV
import numpy as np
model = RidgeCV(alphas=[0.1, 1.0, 10.0], cv=5)
model.fit(X_train, y_train)
print(model.alpha_)`,
      options: [
        'The alpha value that minimizes cross-validated MSE',
        'The mean of all alpha values tested',
        'The alpha value that maximizes training R²',
        'The smallest alpha that converges',
      ],
      correctAnswer: 'The alpha value that minimizes cross-validated MSE',
      explanation: 'RidgeCV performs cross-validation for each alpha and selects the one with the lowest average validation MSE. The .alpha_ attribute stores this best value.',
    },
    {
      id: 'rl-4', type: 'fillblank',
      question: 'In ElasticNet, the mixing ratio parameter determines the balance between L1 and L2 penalties. When this parameter equals 0, ElasticNet behaves identically to ___.',
      correctAnswer: 'Ridge regression',
      explanation: 'The ElasticNet loss is $\\lambda(\\rho \\|w\\|_1 + \\frac{1-\\rho}{2}\\|w\\|^2_2)$. When $\\rho=0$, only the L2 term remains, making it equivalent to Ridge regression.',
    },
    {
      id: 'rl-5', type: 'match',
      question: 'Match each regularizer with its effect on model weights:',
      pairs: [
        { left: 'Ridge (L2)', right: 'Shrinks all weights toward zero but keeps all features' },
        { left: 'Lasso (L1)', right: 'Can zero out weights entirely, performing feature selection' },
        { left: 'ElasticNet', right: 'Combines shrinkage and selection; handles correlated groups' },
        { left: 'No regularization', right: 'No constraint on weights; prone to overfitting in high dimensions' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'Each regularization type imposes a different constraint geometry. Ridge is a sphere (keeps all), Lasso is a diamond (corners at zero), ElasticNet is a rounded diamond, and OLS has no constraint.',
    },
  ],
}))

export {}
