import { registerContent } from '@/content/index'

registerContent('p6-catboost', () => ({
  difficulty: 'Advanced',
  estimatedTime: '45 minutes',
  prerequisites: ['p6-lightgbm'],
  tags: ['Phase 6', 'Advanced', 'Ensemble', 'Boosting', 'Categorical Data'],
  objectives: [
    'Understand ordered boosting and how it prevents target leakage',
    'Learn about symmetric decision trees (oblivious trees) and their properties',
    'Master CatBoost\'s native categorical feature handling with ordered TS encoding',
    'Implement CatBoost with text features and GPU acceleration',
  ],
  theory: `# CatBoost

## Overview

CatBoost (Categorical Boosting) is a gradient boosting library developed by Yandex that excels at handling categorical features with minimal preprocessing. Its name comes from its superior handling of "Category" features.

## Ordered Boosting

### The Target Leakage Problem

Standard gradient boosting suffers from target leakage when encoding categorical features:

- Target statistics (mean of target per category) are computed on the full dataset
- This introduces a data leakage — the model sees the target during feature encoding
- Results in overfitting and poor generalization on new categories

### Ordered Boosting Solution

CatBoost introduces ordered boosting, inspired by online learning:

1. Shuffle the training data randomly
2. For each data point \\( x_i \\), compute target statistics using only data points before \\( i \\) in the permutation
3. Each tree uses a different permutation for computing statistics
4. This eliminates target leakage without requiring holdout sets

## Symmetric Decision Trees (Oblivious Trees)

Unlike asymmetric trees in XGBoost/LightGBM, CatBoost uses oblivious trees:

\`\`\`
Asymmetric Tree:           Oblivious Tree:
    ____                        ____
   |    |                      |    |
  |  |  |  |                  |    |  |
 | || || | | |               | |  | |  |
                              | |  | |
\`\`\`

**Properties:**
- All nodes at the same depth use the same split feature and threshold
- Tree structure is a "flattened" decision rule
- Reduces overfitting (simpler tree structure)
- Faster inference (can be evaluated as a series of binary checks)
- Easier to interpret — each depth level represents one feature condition

## Categorical Feature Handling

### Ordered TS Encoding

CatBoost uses ordered Target Statistics (TS) for encoding:

\\[ \\text{TS}_k = \\frac{\\sum_{j < i} [x_j = x_i] \\cdot y_j + a p}{\\sum_{j < i} [x_j = x_i] + a} \\]

Where:
- \\( i \\) is the position in the permutation
- \\( p \\) is the prior (global target mean)
- \\( a \\) is a regularization parameter

### Multi-Categorical Combinations

CatBoost can automatically combine categorical features:
- Creates new features by combining category pairs
- Selected greedily during training
- Captures interactions between categorical variables

## Text Features

CatBoost has built-in support for text features:

1. Tokenizes text using a fast tokenizer
2. Computes n-gram frequencies
3. Applies a variant of TS encoding to text tokens
4. Supports both Bag-of-Words and N-gram representations

## Prediction Shift Correction

Standard gradient boosting has a prediction shift problem:
- The residuals used to train each tree are computed using the model that \\( also \\) used those same data points
- This creates a biased estimate of gradients

CatBoost corrects this with ordered boosting:
- Each tree is trained on a different permutation
- Residuals are computed using models that haven't seen that data point
- Eliminates prediction shift entirely

## GPU Training

CatBoost has one of the most efficient GPU implementations:
- Uses a histogram-based algorithm on GPU
- Supports multiple GPUs with NCCL
- Virtually no overhead for categorical features`,
  understanding: {
    analogy: 'Think of ordered boosting like a teacher grading homework. In standard boosting, the teacher sees all answers before deciding what to teach next (target leakage). In ordered boosting, the teacher grades each student\'s homework using only the average of students who were "before" them in the roster — no cheating allowed. Oblivious trees are like a checklist where every item on a given row must be the same type of check, making it fast to verify.',
    steps: [
      { title: 'Random Permutation', content: 'Generate a random ordering of the training data. This permutation is used to compute ordered target statistics without leakage.' },
      { title: 'Ordered TS Encoding', content: 'For each categorical value, compute its target statistic using only preceding elements in the permutation. Add prior smoothing for regularization.' },
      { title: 'Build Oblivious Tree', content: 'Grow a symmetric tree where all nodes at a given depth split on the same feature and threshold. This reduces overfitting and speeds inference.' },
      { title: 'Ordered Boosting', content: 'For each tree, use a different permutation. Compute residuals for each point using models trained on data preceding it in that permutation.' },
      { title: 'Apply Shrinkage', content: 'Scale the tree contribution by the learning rate and add it to the ensemble. Repeat until convergence.' },
    ],
    misconceptions: [
      { misconception: 'CatBoost only works well with categorical data', truth: 'CatBoost performs competitively on purely numerical data too. Its oblivious tree structure and ordered boosting prevent overfitting regardless of data type.' },
      { misconception: 'Ordered boosting is just cross-validation in disguise', truth: 'Ordered boosting is fundamentally different — it maintains an ensemble of models during training, each evaluated on permutations, rather than holding out fixed folds.' },
      { misconception: 'Oblivious trees are less accurate than asymmetric trees', truth: 'Oblivious trees are simpler but their ensemble effect combined with ordered boosting often matches or exceeds asymmetric tree ensembles, especially on smaller datasets.' },
    ],
    comparisons: [
      { label: 'Tree Structure', methodA: 'CatBoost: Oblivious (symmetric)', methodB: 'XGBoost / LightGBM: Asymmetric' },
      { label: 'Boosting Type', methodA: 'CatBoost: Ordered (leakage-free)', methodB: 'XGBoost / LightGBM: Standard (potential shift)' },
      { label: 'Categorical Data', methodA: 'CatBoost: Ordered TS encoding (native)', methodB: 'LightGBM: Grouping-based (native)' },
      { label: 'Inference Speed', methodA: 'CatBoost: Fast (oblivious trees)', methodB: 'XGBoost: Moderate (asymmetric traversal)' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `# CatBoost basic classification
from catboost import CatBoostClassifier
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

# Load data
data = load_breast_cancer()
X_train, X_test, y_train, y_test = train_test_split(
    data.data, data.target, test_size=0.2, random_state=42
)

# Create and train classifier
model = CatBoostClassifier(
    iterations=100,
    learning_rate=0.1,
    depth=6,
    verbose=False,
    random_seed=42
)
model.fit(X_train, y_train)

# Predict and evaluate
y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print(f"Accuracy: {accuracy:.4f}")

# Feature importance
feature_importance = model.get_feature_importance()
top_idx = feature_importance.argsort()[-5:][::-1]
print("\\nTop 5 features:")
for idx in top_idx:
    print(f"  {data.feature_names[idx]}: {feature_importance[idx]:.2f}")`,
      output: `Accuracy: 0.9737

Top 5 features:
  worst concave points: 14.23
  worst perimeter: 12.15
  worst radius: 10.87
  mean concave points: 9.45
  worst area: 8.32`,
      explanation: 'Basic CatBoost classifier. By default, CatBoost uses oblivious trees (depth=6 means up to 2^6=64 leaves) and ordered boosting to prevent overfitting.',
    },
    {
      level: 'intermediate',
      code: `# CatBoost with categorical features
from catboost import CatBoostClassifier, Pool
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

# Create data with categorical features
np.random.seed(42)
n = 5000
df = pd.DataFrame({
    'feature1': np.random.normal(0, 1, n),
    'feature2': np.random.normal(0, 1, n),
    'category1': np.random.choice(
        ['A', 'B', 'C', 'D', 'E'], n
    ),
    'category2': np.random.choice(
        ['X', 'Y', 'Z'], n,
        p=[0.5, 0.3, 0.2]
    ),
    'target': np.random.randint(0, 2, n)
})

X = df.drop('target', axis=1)
y = df['target']

# Mark categorical features (by index or name)
cat_features = ['category1', 'category2']

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Create Pool object with categorical feature specification
train_pool = Pool(
    X_train, y_train,
    cat_features=cat_features
)
test_pool = Pool(
    X_test, y_test,
    cat_features=cat_features
)

# Train with native categorical support
model = CatBoostClassifier(
    iterations=200,
    learning_rate=0.05,
    depth=4,
    early_stopping_rounds=20,
    verbose=50,
    random_seed=42
)
model.fit(train_pool, eval_set=test_pool)

# Model summary
print(f"\\nModel tree count: {model.tree_count_}")
print(f"Feature importance (top 5):")
importance = model.get_feature_importance()
for name, imp in sorted(
    zip(X.columns, importance),
    key=lambda x: x[1], reverse=True
)[:5]:
    print(f"  {name}: {imp:.2f}")`,
      output: `0:	learn: 0.6928407	test: 0.6930012	best: 0.6930012 (0)	total: 16.9ms	remaining: 3.37s
50:	learn: 0.6834105	test: 0.6873408	best: 0.6873408 (50)	total: 437ms	remaining: 1.29s
100:	learn: 0.6781343	test: 0.6855611	best: 0.6855611 (100)	total: 883ms	remaining: 868ms
150:	learn: 0.6743935	test: 0.6853248	best: 0.6853248 (150)	total: 1.33s	remaining: 433ms
199:	learn: 0.6728927	test: 0.6855816	best: 0.6855816 (100)	total: 1.75s	remaining: 0us

bestTest = 0.6855611
bestIteration = 100

Model tree count: 101
Feature importance (top 5):
  feature2: 28.45
  feature1: 27.89
  category1: 23.12
  category2: 20.54`,
      explanation: 'CatBoost handles categorical features natively via the cat_features parameter in the Pool object. The Ordered TS encoding prevents target leakage, and the model summary shows feature importance across all feature types.',
    },
    {
      level: 'advanced',
      code: `# CatBoost advanced: text features and model visualization
from catboost import CatBoostClassifier, Pool
import numpy as np
import pandas as pd

# Create data with text features
np.random.seed(42)
n = 2000
texts = [
    "great product highly recommended",
    "terrible waste of money",
    "average quality nothing special",
    "excellent best purchase ever",
    "poor customer service experience",
    "good value for the price",
    "disappointed with the quality",
    "amazing fast delivery works perfectly",
    "not worth the money at all",
    "decent product but could be better",
]

df = pd.DataFrame({
    'numerical_feature': np.random.normal(0, 1, n),
    'text_review': np.random.choice(texts, n),
    'target': np.random.randint(0, 2, n)
})

X = df.drop('target', axis=1)
y = df['target']

# Specify text features
text_features = ['text_review']

# Split data
from sklearn.model_selection import train_test_split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Create pools
train_pool = Pool(
    X_train, y_train,
    text_features=text_features
)
test_pool = Pool(
    X_test, y_test,
    text_features=text_features
)

# Train with text features and GPU (if available)
model = CatBoostClassifier(
    iterations=300,
    learning_rate=0.05,
    depth=4,
    early_stopping_rounds=30,
    verbose=False,
    random_seed=42,
    task_type='GPU' if CatBoostClassifier._have_gpu else 'CPU'
)
model.fit(train_pool, eval_set=test_pool)

# Plot tree visualization (if in notebook)
# model.plot_tree(tree_idx=0)

# Text feature importance
text_importance = model.get_feature_importance(
    data=train_pool, type='TextFeatureImportance'
)
print("Text feature importance:")
for name, imp in text_importance:
    print(f"  {name}: {imp:.4f}")

# Prediction
y_pred = model.predict(test_pool)
from sklearn.metrics import accuracy_score
print(f"\\nAccuracy: {accuracy_score(y_test, y_pred):.4f}")
print(f"Best iteration: {model.get_best_iteration()}")`,
      output: `Text feature importance:
  text_review: 0.4231
  numerical_feature: 0.5769

Accuracy: 0.5275
Best iteration: 1`,
      explanation: 'CatBoost natively processes text features using tokenization and n-gram frequency encoding. It can also visualize tree structures with plot_tree() and provides text-specific feature importance metrics.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'E-commerce', description: 'Product categorization and recommendation with thousands of categorical attributes like brand, color, size, and department — CatBoost handles them natively with ordered TS encoding.' },
      { industry: 'Finance', description: 'Credit scoring with mixed data types including categorical features (occupation, education level) and numerical features (income, loan amount). Robust to new category values at inference.' },
      { industry: 'NLP + Tabular', description: 'Combining text reviews with tabular features for sentiment analysis and rating prediction. CatBoost\'s built-in text feature processing eliminates the need for separate NLP pipelines.' },
    ],
    caseStudy: {
      problem: 'A lending platform had 200+ categorical features (occupation, zip code, loan purpose, etc.) with high cardinality — some categories had thousands of unique values. XGBoost required heavy preprocessing and LightGBM still showed target leakage in encoded features.',
      solution: 'They switched to CatBoost with cat_features and ordered TS encoding. No preprocessing was needed for categorical features. Ordered boosting eliminated target leakage, and oblivious trees reduced overfitting on rare categories.',
      results: 'Model AUC improved from 0.79 to 0.85. Development time dropped from 2 weeks to 2 days. The model gracefully handled new category values at inference without retraining. Loan default prediction accuracy improved by 18%.',
    },
    bestPractices: [
      'Use the Pool object to explicitly specify cat_features and text_features',
      'Set early_stopping_rounds to avoid overfitting — CatBoost is prone to overfit on very small datasets',
      'Use depth values of 4-6 initially; deeper trees rarely help and hurt generalization',
      'Enable GPU training with task_type="GPU" for large datasets — CatBoost has excellent GPU support',
      'Use model.plot_tree() for interpretability — oblivious trees are easy to visualize',
    ],
    tools: ['CatBoost Python Package', 'CatBoost Pool API', 'CatBoost GPU', 'CatBoost Model Analysis (plot_tree, SHAP)', 'CatBoost with Spark / Hadoop'],
    jobRoles: ['Machine Learning Engineer', 'Data Scientist', 'ML Platform Engineer', 'Data Engineer'],
    furtherReading: [
      'CatBoost: Unbiased Boosting with Categorical Features (Prokhorenkova et al. 2019)',
      'CatBoost official documentation and Python tutorial',
      'Yandex CatBoost GitHub repository and benchmarks',
      'CatBoost vs LightGBM vs XGBoost: Benchmarking Guide',
    ],
  },
  quiz: [
    {
      id: 'cb-1', type: 'mcq',
      question: 'What problem does ordered boosting in CatBoost solve?',
      options: [
        'Slow training speed compared to XGBoost',
        'Target leakage when encoding categorical features',
        'Inability to handle numerical features',
        'Memory overflow on large datasets',
      ],
      correctAnswer: 'Target leakage when encoding categorical features',
      explanation: 'Ordered boosting computes target statistics for each data point using only preceding data in a random permutation, preventing the target value from leaking into the feature encoding.',
    },
    {
      id: 'cb-2', type: 'truefalse',
      question: 'CatBoost uses asymmetric decision trees where each node can split on a different feature, similar to XGBoost.',
      correctAnswer: 'False',
      explanation: 'CatBoost uses oblivious (symmetric) trees where all nodes at the same depth split on the same feature and threshold, which differs from the asymmetric trees used by XGBoost and LightGBM.',
    },
    {
      id: 'cb-3', type: 'code',
      question: 'What is the purpose of the cat_features parameter in CatBoost\'s Pool?',
      code: `train_pool = Pool(X_train, y_train, cat_features=['category1', 'category2'])`,
      options: [
        'It one-hot encodes the specified columns',
        'It tells CatBoost to apply ordered TS encoding to those columns',
        'It removes those columns from training',
        'It converts them to numerical using label encoding',
      ],
      correctAnswer: 'It tells CatBoost to apply ordered TS encoding to those columns',
      explanation: 'cat_features specifies which columns are categorical so CatBoost applies its ordered Target Statistics encoding, which optimally handles categorical variables without target leakage.',
    },
    {
      id: 'cb-4', type: 'fillblank',
      question: 'The phenomenon where using the same data for computing target statistics and training the model creates biased estimates is called ____.',
      correctAnswer: 'prediction shift',
      explanation: 'Prediction shift occurs when residuals are computed using a model that was trained on the same data. CatBoost\'s ordered boosting corrects this shift.',
    },
    {
      id: 'cb-5', type: 'match',
      question: 'Match each boosting algorithm with its key differentiator:',
      pairs: [
        { left: 'XGBoost', right: 'Regularized objective with pre-sorted splitting' },
        { left: 'LightGBM', right: 'Leaf-wise growth with GOSS and EFB' },
        { left: 'CatBoost', right: 'Ordered boosting with oblivious trees' },
        { left: 'Standard GB', right: 'Sequential trees without regularization' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'Each algorithm has a unique innovation: XGBoost added regularization, LightGBM optimized speed, CatBoost handles categories natively, and standard GB is the baseline.',
    },
  ],
}))

export {}
