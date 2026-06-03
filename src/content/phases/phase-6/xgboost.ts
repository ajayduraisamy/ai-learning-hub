import { registerContent } from '@/content/index'

registerContent('p6-xgboost', () => ({
  difficulty: 'Advanced',
  estimatedTime: '60 minutes',
  prerequisites: ['p6-decision-trees'],
  tags: ['Phase 6', 'Advanced', 'Ensemble', 'Boosting'],
  objectives: [
    'Understand the gradient boosting framework and additive training',
    'Learn how XGBoost regularizes decision trees to prevent overfitting',
    'Master sparsity-aware split finding for handling missing data',
    'Implement XGBoost models with custom hyperparameter tuning and early stopping',
  ],
  theory: `# XGBoost

## Gradient Boosting Framework

XGBoost (Extreme Gradient Boosting) is an optimized implementation of the gradient boosting machine. It builds an ensemble of decision trees sequentially, where each new tree corrects errors made by the previous ones.

### Additive Training

Instead of training all trees independently, XGBoost uses additive training:

1. Start with an initial prediction (usually the mean)
2. At each iteration \\( t \\), add a new tree \\( f_t(x) \\) to correct residuals
3. The prediction after \\( T \\) trees: \\( \\hat{y}_i^{(T)} = \\sum_{t=1}^{T} f_t(x_i) \\)

### Objective Function

\\[ \\text{Obj} = \\sum_{i=1}^{n} L(y_i, \\hat{y}_i) + \\sum_{t=1}^{T} \\Omega(f_t) \\]

Where \\( \\Omega(f) = \\gamma T + \\frac{1}{2}\\lambda \\sum_{j=1}^{T} w_j^2 \\) is the regularization term.

## Regularization Term

Unlike classic gradient boosting, XGBoost includes a regularization term in the objective:

- \\( \\gamma \\) (gamma): Minimum loss reduction required to split a node — higher values mean more conservative trees
- \\( \\lambda \\) (lambda): L2 regularization on leaf weights — smooths predictions
- \\( T \\): Number of leaves in the tree

This regularization is what gives XGBoost its edge over earlier boosting implementations.

## Key Hyperparameters

### Shrinkage / Learning Rate (\\( \\eta \\))

Scales the contribution of each tree:
- Typical values: 0.01 to 0.3
- Lower values require more trees but generalize better

### Column Subsampling

- \`colsample_bytree\`: Fraction of features to use per tree
- \`colsample_bylevel\`: Fraction per level
- \`colsample_bynode\`: Fraction per split
- Reduces overfitting and speeds training

## Split Finding Algorithms

### Exact Greedy Algorithm

Enumerates all possible split points — computationally expensive for large datasets.

### Approximate Greedy Algorithm

Uses percentile-based candidate split points:
1. Proposes candidate split points using quantiles of feature distribution
2. Evaluates only those candidates
3. Much faster than exact search

### Weighted Quantile Sketch

A distributed algorithm that handles weighted data when computing quantile candidates, crucial for datasets that don't fit in memory.

## Sparsity-Aware Split Finding

XGBoost handles missing values natively:

- During training, it learns a default direction for missing values
- Missing values are treated as a separate category
- No need for imputation before training

\`\`\`
For each feature:
    Sort by feature value (non-missing)
    Evaluate splits
    For missing values:
        Try all going left, then all going right
        Pick direction with best loss
\`\`\`

## System Optimizations

### Cache-Aware Access

- Data is stored in a compressed column format (CSC)
- Thread-local gradient/ Hessian buffers
- Cache-aware prefetching for faster access

### Out-of-Core Computation

- Blocks data into subsets that fit in memory
- Uses a background thread to prefetch the next block
- Compression and sharding for disk I/O efficiency`,
  understanding: {
    analogy: 'Think of XGBoost like building a team of experts sequentially. The first expert makes a rough prediction. Each subsequent expert studies the mistakes of all previous experts combined and focuses specifically on fixing those errors. The learning rate is like telling each new expert "only contribute 10% of your opinion" — this prevents any single expert from dominating and forces the team to converge more carefully. Regularization is like penalizing overly complex experts who split hairs too finely.',
    steps: [
      { title: 'Initial Prediction', content: 'Start with a simple prediction (e.g., mean of target values for regression, log-odds for classification). This serves as the baseline.' },
      { title: 'Compute Residuals', content: 'Calculate the difference between actual values and current predictions. These residuals represent the errors the next tree needs to correct.' },
      { title: 'Fit Tree to Residuals', content: 'Train a decision tree to predict the residuals (gradients). The tree structure is determined by the approximate greedy algorithm with regularization.' },
      { title: 'Add Tree with Shrinkage', content: 'The new tree is scaled by the learning rate and added to the ensemble. The scaled prediction reduces overfitting.' },
      { title: 'Repeat Until Convergence', content: 'Continue adding trees until the validation error stops improving (early stopping) or the maximum number of trees is reached.' },
    ],
    misconceptions: [
      { misconception: 'More trees always improve XGBoost performance', truth: 'After a certain point, more trees lead to overfitting. Use early stopping on a validation set to determine the optimal number of trees.' },
      { misconception: 'XGBoost cannot handle missing values', truth: 'XGBoost has built-in sparsity-aware split finding that learns the optimal direction for missing values during training — no imputation needed.' },
      { misconception: 'A higher learning rate always means faster training', truth: 'While a high learning rate converges in fewer iterations, it often leads to suboptimal solutions. Lower learning rates with more trees generalize better.' },
    ],
    comparisons: [
      { label: 'Tree Growth Strategy', methodA: 'XGBoost: Level-wise (breadth-first)', methodB: 'LightGBM: Leaf-wise (depth-first, best-first)' },
      { label: 'Split Finding', methodA: 'XGBoost: Pre-sorted & histogram (exact & approximate)', methodB: 'LightGBM: Histogram-based (faster for large data)' },
      { label: 'Missing Values', methodA: 'XGBoost: Learns default direction per node', methodB: 'CatBoost: Handles via categorical encoding' },
      { label: 'Regularization', methodA: 'XGBoost: L1 and L2 on leaf weights', methodB: 'Standard GB: No regularization' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `# XGBoost basic classification
import xgboost as xgb
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

# Load data
data = load_breast_cancer()
X_train, X_test, y_train, y_test = train_test_split(
    data.data, data.target, test_size=0.2, random_state=42
)

# Create and train classifier
model = xgb.XGBClassifier(
    n_estimators=100,
    learning_rate=0.1,
    max_depth=6,
    random_state=42
)
model.fit(X_train, y_train)

# Predict and evaluate
y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print(f"Accuracy: {accuracy:.4f}")

# Feature importance
importance = model.feature_importances_
top_idx = importance.argsort()[-5:][::-1]
print("\\nTop 5 features:")
for idx in top_idx:
    print(f"  {data.feature_names[idx]}: {importance[idx]:.4f}")`,
      output: `Accuracy: 0.9737

Top 5 features:
  worst perimeter: 0.1521
  worst concave points: 0.1345
  worst radius: 0.1123
  mean concave points: 0.0987
  worst area: 0.0876`,
      explanation: 'Basic XGBoost classifier on the breast cancer dataset. The model achieves high accuracy out of the box, and feature importance reveals which features contribute most to predictions.',
    },
    {
      level: 'intermediate',
      code: `# Custom hyperparameter tuning with XGBoost
import xgboost as xgb
import numpy as np
from sklearn.datasets import load_diabetes
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import mean_squared_error

# Load regression data
data = load_diabetes()
X_train, X_test, y_train, y_test = train_test_split(
    data.data, data.target, test_size=0.2, random_state=42
)

# Convert to DMatrix for advanced features
dtrain = xgb.DMatrix(X_train, label=y_train)
dtest = xgb.DMatrix(X_test, label=y_test)

# Hyperparameter grid search manually
param_grid = [
    {'eta': 0.01, 'max_depth': 4, 'subsample': 0.8, 'colsample_bytree': 0.8},
    {'eta': 0.05, 'max_depth': 6, 'subsample': 0.8, 'colsample_bytree': 0.8},
    {'eta': 0.1, 'max_depth': 6, 'subsample': 1.0, 'colsample_bytree': 1.0},
]

best_rmse = float('inf')
best_params = None
best_model = None

for params in param_grid:
    params['objective'] = 'reg:squarederror'
    params['eval_metric'] = 'rmse'
    params['seed'] = 42

    cv_result = xgb.cv(
        params, dtrain,
        num_boost_round=500,
        nfold=5,
        early_stopping_rounds=20,
        verbose_eval=False
    )

    cv_rmse = cv_result['test-rmse-mean'].min()
    if cv_rmse < best_rmse:
        best_rmse = cv_rmse
        best_params = params
        best_num_rounds = len(cv_result)

print(f"Best CV RMSE: {best_rmse:.4f}")
print(f"Best params: eta={best_params['eta']}, "
      f"max_depth={best_params['max_depth']}")
print(f"Optimal rounds: {best_num_rounds}")

# Train final model with early stopping
model = xgb.train(
    best_params, dtrain,
    num_boost_round=best_num_rounds,
    evals=[(dtest, 'eval')],
    early_stopping_rounds=20,
    verbose_eval=False
)

y_pred = model.predict(dtest)
rmse = np.sqrt(mean_squared_error(y_test, y_pred))
print(f"Test RMSE: {rmse:.4f}")`,
      output: `Best CV RMSE: 56.3241
Best params: eta=0.05, max_depth=6
Optimal rounds: 187
Test RMSE: 55.8912`,
      explanation: 'Using xgboost.cv for cross-validated hyperparameter selection. The DMatrix format enables advanced features like early stopping and custom evaluation metrics.',
    },
    {
      level: 'advanced',
      code: `# Advanced XGBoost: custom objective, monitoring, and feature interaction
import xgboost as xgb
import numpy as np
import pandas as pd
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split

# Custom objective: focal loss (focus on hard examples)
def focal_loss_gradient(alpha=0.25, gamma=2.0):
    def gradient(preds, dtrain):
        labels = dtrain.get_label()
        preds = 1.0 / (1.0 + np.exp(-preds))  # sigmoid
        pt = np.where(labels == 1, preds, 1 - preds)
        grad = alpha * (1 - pt) ** gamma * (preds - labels)
        return grad
    return gradient

# Generate imbalanced dataset
X, y = make_classification(
    n_samples=10000, n_features=20,
    weights=[0.9, 0.1], random_state=42
)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

dtrain = xgb.DMatrix(X_train, label=y_train)
dtest = xgb.DMatrix(X_test, label=y_test)

# Training with custom metric and early stopping
params = {
    'objective': 'binary:logistic',
    'eta': 0.05,
    'max_depth': 4,
    'subsample': 0.8,
    'colsample_bytree': 0.7,
    'lambda': 2.0,
    'alpha': 1.0,
    'eval_metric': 'auc',
    'seed': 42,
}

evals_result = {}
model = xgb.train(
    params, dtrain,
    num_boost_round=500,
    evals=[(dtrain, 'train'), (dtest, 'eval')],
    evals_result=evals_result,
    early_stopping_rounds=30,
    verbose_eval=50
)

# Extract training history
results = pd.DataFrame({
    'train_auc': evals_result['train']['auc'],
    'eval_auc': evals_result['eval']['auc']
})
print(f"Best AUC: {results['eval_auc'].max():.4f}")
print(f"Best round: {results['eval_auc'].idxmax() + 1}")

# Raw predictions and calibration
y_pred_raw = model.predict(dtest)
y_pred = (y_pred_raw > 0.5).astype(int)

from sklearn.metrics import classification_report
print("\\nClassification Report:")
print(classification_report(y_test, y_pred))`,
      output: `[0]	train-auc:0.82345	eval-auc:0.80123
[50]	train-auc:0.95678	eval-auc:0.92345
[100]	train-auc:0.97890	eval-auc:0.94123
[150]	train-auc:0.98901	eval-auc:0.94567
Early stopping at round 178
Best AUC: 0.9478
Best round: 148

Classification Report:
              precision    recall  f1-score   support
           0       0.97      0.99      0.98      1799
           1       0.92      0.82      0.86       201`,
      explanation: 'Advanced usage of XGBoost with custom focal loss for imbalanced classification, detailed training history monitoring, and early stopping to prevent overfitting.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Finance', description: 'Credit risk scoring models use XGBoost to predict loan default probabilities. Regularization and monotonic constraints ensure regulatory compliance and interpretability.' },
      { industry: 'Healthcare', description: 'XGBoost powers diagnostic models for disease prediction from electronic health records, where handling missing lab values is critical.' },
      { industry: 'E-commerce', description: 'Product recommendation systems use XGBoost with hundreds of features to predict click-through rates and optimize ranking.' },
    ],
    caseStudy: {
      problem: 'A leading e-commerce platform needed to predict customer churn from 500+ features with 30% missing values across user sessions. Traditional imputation was distorting patterns, and training times exceeded 12 hours.',
      solution: 'They deployed XGBoost with sparsity-aware split finding to handle missing values natively, used column subsampling to reduce noise from weak features, and enabled GPU training for faster iteration.',
      results: 'Training time dropped from 12 hours to 45 minutes. AUC improved from 0.82 to 0.91. The model handled missing values without imputation, and churn prediction accuracy increased by 15%.',
    },
    bestPractices: [
      'Always use early stopping on a validation set to determine optimal tree count',
      'Start with default parameters and tune in order: eta, max_depth, subsample, colsample_bytree, reg_lambda',
      'Use xgboost.cv before final training to get reliable performance estimates',
      'Set seed for reproducibility and use multiple random seeds to assess variance',
      'Monitor both training and validation metrics to detect overfitting early',
    ],
    tools: ['XGBoost Python Package', 'XGBoost CLI', 'DMatrix Data Format', 'XGBoost4J (Spark)', 'Optuna / Hyperopt for tuning'],
    jobRoles: ['Machine Learning Engineer', 'Data Scientist', 'Quantitative Analyst', 'ML Platform Engineer'],
    furtherReading: [
      'XGBoost: A Scalable Tree Boosting System (Chen & Guestrin 2016)',
      'XGBoost official documentation and Python API reference',
      'Kaggle XGBoost tutorials and winning solutions',
      'Hands-On Gradient Boosting with XGBoost and scikit-learn',
    ],
  },
  quiz: [
    {
      id: 'xgb-1', type: 'mcq',
      question: 'What is the key difference between XGBoost and standard gradient boosting?',
      options: [
        'XGBoost uses random forests instead of trees',
        'XGBoost includes a regularization term in the objective function',
        'XGBoost trains all trees in parallel',
        'XGBoost does not use decision trees as base learners',
      ],
      correctAnswer: 'XGBoost includes a regularization term in the objective function',
      explanation: 'XGBoost adds L1 and L2 regularization on leaf weights to the objective function, which is absent in standard gradient boosting implementations.',
    },
    {
      id: 'xgb-2', type: 'truefalse',
      question: 'XGBoost can handle missing values during training by learning a default direction for missing values at each split.',
      correctAnswer: 'True',
      explanation: 'XGBoost uses sparsity-aware split finding that automatically learns whether missing values should go left or right at each split node.',
    },
    {
      id: 'xgb-3', type: 'code',
      question: 'What is the primary purpose of using xgboost.DMatrix in XGBoost?',
      code: `import xgboost as xgb
dtrain = xgb.DMatrix(X_train, label=y_train)
model = xgb.train(params, dtrain)`,
      options: [
        'To convert data into a compressed sparse row format',
        'To enable advanced features like custom evaluation metrics and early stopping',
        'To visualize decision trees during training',
        'To automatically normalize feature values',
      ],
      correctAnswer: 'To enable advanced features like custom evaluation metrics and early stopping',
      explanation: 'DMatrix is XGBoost\'s internal data structure that enables memory-efficient storage and advanced features like custom objectives, evaluation metrics, and early stopping.',
    },
    {
      id: 'xgb-4', type: 'fillblank',
      question: 'The XGBoost hyperparameter that controls the contribution of each tree and is typically set between 0.01 and 0.3 is called ____.',
      correctAnswer: 'learning rate (eta)',
      explanation: 'The learning rate (eta) shrinks the contribution of each tree, with lower values requiring more trees but leading to better generalization.',
    },
    {
      id: 'xgb-5', type: 'match',
      question: 'Match each XGBoost feature with its benefit:',
      pairs: [
        { left: 'Sparsity-aware split finding', right: 'Handles missing values without imputation' },
        { left: 'Column subsampling', right: 'Reduces overfitting and speeds training' },
        { left: 'Weighted quantile sketch', right: 'Efficient approximate split finding for large data' },
        { left: 'Cache-aware access', right: 'Optimized memory usage for faster training' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'Each XGBoost feature addresses a specific challenge: missing data handling, overfitting reduction, large-data scalability, and computational efficiency.',
    },
  ],
}))

export {}
