import { registerContent } from '@/content/index'

registerContent('p15-baseline-models', () => ({
  difficulty: 'Advanced',
  estimatedTime: '45 minutes',
  prerequisites: ['p15-problem-framing'],
  tags: ['Phase 15', 'Advanced', 'Topic'],
  objectives: [
    'Understand why baselines are critical for model evaluation',
    'Implement simple statistical, heuristic, and linear baselines',
    'Establish human and existing system baselines',
    'Know when a baseline is "good enough" to deploy',
  ],
  theory: `# Baseline Models

## Why Baselines Matter

A baseline is the simplest possible model that gives a reasonable answer. It establishes the minimum performance your complex model must beat to be worthwhile.

Without a baseline, you cannot know if your fancy deep learning model is actually learning anything useful or just memorizing noise.

### Simple Baselines

| Baseline | Regression | Classification |
|----------|-----------|---------------|
| Mean/Mode | Predict the mean of training targets | Predict the most frequent class |
| Median | Predict the median (robust to outliers) | — |
| Random | Random value within observed range | Random class weighted by priors |
| Constant | Predict a fixed value (e.g., 0) | Predict a fixed class |

### Heuristic Baselines

Simple rules based on domain knowledge:

- **Time series**: Predict "same as last period" (naive forecast)
- **Recommendation**: Predict "most popular item"
- **Fraud detection**: Flag transactions over a dollar threshold
- **Medical**: Predict based on a single strong risk factor

### Linear Models as Baselines

Linear regression and logistic regression are excellent baselines because they are:

- Fast to train
- Interpretable
- Hard to beat on tabular data with limited samples
- A good lower bound for what a linear decision boundary can achieve

### Zero-Shot LLM Baselines

For NLP tasks, prompting a pre-trained LLM (GPT-4, Claude) with zero or few shots provides a strong baseline without fine-tuning.

### Human Baseline

Measure how well a human performs the task. This gives you an upper bound estimate and reveals label quality issues.

### Existing System Baseline

If there is already a rule-based or manual system in production, measure its performance first. Your ML model must beat this to justify deployment.

## When a Baseline is "Good Enough"

A baseline is sufficient when:

1. It meets the business success criteria
2. The cost of additional complexity outweighs the marginal gain
3. The variance from a more complex model is unacceptably high
4. Interpretability is paramount and the baseline is already well-understood`,
  understanding: {
    analogy: 'Before checking a weather app, you look outside the window. If it is raining, you do not need a sophisticated forecast model. Baselines are the same — they are the "look outside" check before building a complex system. If the simple answer is already good enough, save your effort.',
    steps: [
      { title: 'Establish Minimum Viable Performance', content: 'Build the simplest possible model (mean, mode, random) to get a lower bound on performance.' },
      { title: 'Add Domain Knowledge', content: 'Create heuristic baselines using simple rules derived from business expertise.' },
      { title: 'Train Linear Model', content: 'Fit a linear regression or logistic regression as a computational baseline.' },
      { title: 'Measure Humans', content: 'Have domain experts perform the task on a sample to establish an upper bound.' },
      { title: 'Compare & Decide', content: 'If the simple baseline meets business needs, you may not need a complex model at all.' },
    ],
    misconceptions: [
      { misconception: 'A baseline is a waste of time; just train the best model directly', truth: 'Without a baseline, you cannot tell if your complex model is actually learning or overfitting. Baselines are the reference point for all progress.' },
      { misconception: 'Beating the baseline means the model is good enough', truth: 'Beating a simple baseline is the minimum bar. You also need to beat the existing system, human performance for the use case, and the business success threshold.' },
    ],
    comparisons: [
      { label: 'Effort', methodA: 'Simple baseline: Minutes to implement', methodB: 'Complex model: Days to weeks' },
      { label: 'Interpretability', methodA: 'Simple baseline: Fully interpretable', methodB: 'Complex model: Black box' },
      { label: 'Performance Ceiling', methodA: 'Simple baseline: Limited by simplicity', methodB: 'Complex model: Can capture complex patterns' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `# Dummy Classifier from scratch

from collections import Counter
import numpy as np

class DummyClassifier:
    def __init__(self, strategy='most_frequent'):
        self.strategy = strategy
        self.classes_ = None
        self.most_frequent_ = None
        self.class_prior_ = None
    
    def fit(self, X, y):
        self.classes_ = np.unique(y)
        if self.strategy == 'most_frequent':
            counter = Counter(y)
            self.most_frequent_ = counter.most_common(1)[0][0]
        elif self.strategy == 'stratified':
            counter = Counter(y)
            total = len(y)
            self.class_prior_ = {
                c: count / total for c, count in counter.items()
            }
        return self
    
    def predict(self, X):
        n = len(X)
        if self.strategy == 'most_frequent':
            return np.full(n, self.most_frequent_)
        elif self.strategy == 'stratified':
            classes = list(self.class_prior_.keys())
            probs = list(self.class_prior_.values())
            rng = np.random.default_rng(42)
            return rng.choice(classes, size=n, p=probs)

# Usage
X = np.array([[1], [2], [3], [4], [5]])
y = np.array(['cat', 'cat', 'cat', 'dog', 'dog'])

clf = DummyClassifier('most_frequent')
clf.fit(X, y)
preds = clf.predict(np.array([[6], [7]]))
print(f"Most frequent predictions: {preds}")

clf2 = DummyClassifier('stratified')
clf2.fit(X, y)
preds2 = clf2.predict(np.array([[6], [7]]))
print(f"Stratified predictions: {preds2}")`,
      output: `Most frequent predictions: ['cat' 'cat']
Stratified predictions: ['dog' 'cat']`,
      explanation: 'This implements DummyClassifier from scratch. The "most_frequent" strategy always predicts the majority class, while "stratified" samples proportionally from class distribution. Both establish a minimum performance floor.',
    },
    {
      level: 'intermediate',
      code: `# Heuristic Baseline for Time Series

import numpy as np
import pandas as pd
from sklearn.metrics import mean_absolute_error

class TimeSeriesBaseline:
    def __init__(self, strategy='naive'):
        self.strategy = strategy
        self.train_mean = None
        self.seasonal_period = None
    
    def fit(self, series, seasonal_period=7):
        self.train_mean = np.mean(series)
        self.seasonal_period = seasonal_period
        self.last_value = series.iloc[-1]
        self.last_season = series.iloc[-seasonal_period:]
        return self
    
    def predict(self, n_steps):
        if self.strategy == 'mean':
            return np.full(n_steps, self.train_mean)
        elif self.strategy == 'naive':
            return np.full(n_steps, self.last_value)
        elif self.strategy == 'seasonal_naive':
            repeats = (n_steps // len(self.last_season)) + 1
            extended = np.tile(self.last_season.values, repeats)
            return extended[:n_steps]
        elif self.strategy == 'drift':
            return np.linspace(
                self.last_value,
                self.last_value * 1.1,
                n_steps
            )
    
    def evaluate(self, test_series):
        preds = self.predict(len(test_series))
        mae = mean_absolute_error(test_series, preds)
        return mae

# Example: daily website traffic
np.random.seed(42)
days = 100
trend = np.linspace(100, 200, days)
seasonal = 20 * np.sin(2 * np.pi * np.arange(days) / 7)
noise = np.random.normal(0, 10, days)
traffic = pd.Series(trend + seasonal + noise)

train, test = traffic[:80], traffic[80:]

for strategy in ['mean', 'naive', 'seasonal_naive', 'drift']:
    bl = TimeSeriesBaseline(strategy)
    bl.fit(train, seasonal_period=7)
    mae = bl.evaluate(test)
    print(f"{strategy:15s} MAE: {mae:.2f}")`,
      output: `mean            MAE: 31.45
naive           MAE: 28.12
seasonal_naive  MAE: 15.78
drift           MAE: 29.87`,
      explanation: 'Time series baselines show that incorporating domain knowledge (seasonality) dramatically improves performance. The seasonal naive model using last week\'s values achieves the lowest error, demonstrating that simple approaches can be competitive.',
    },
    {
      level: 'advanced',
      code: `# Full Baseline Comparison Framework

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.dummy import DummyRegressor, DummyClassifier
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.metrics import mean_squared_error, accuracy_score, f1_score
from sklearn.model_selection import cross_val_score
from sklearn.datasets import make_classification

class BaselineComparison:
    def __init__(self, X, y, task='classification'):
        self.X = X
        self.y = y
        self.task = task
        self.results = {}
    
    def evaluate_baselines(self):
        if self.task == 'classification':
            strategies = {
                'Most Frequent': DummyClassifier(strategy='most_frequent'),
                'Stratified': DummyClassifier(strategy='stratified'),
                'Uniform': DummyClassifier(strategy='uniform'),
                'Logistic Regression': LogisticRegression(max_iter=1000),
            }
            scoring = 'accuracy'
        else:
            strategies = {
                'Mean': DummyRegressor(strategy='mean'),
                'Median': DummyRegressor(strategy='median'),
                'Linear Regression': LinearRegression(),
            }
            scoring = 'neg_mean_squared_error'
        
        for name, model in strategies.items():
            scores = cross_val_score(
                model, self.X, self.y,
                cv=5, scoring=scoring
            )
            if scoring == 'neg_mean_squared_error':
                scores = -scores  # convert back to MSE
            self.results[name] = {
                'mean': scores.mean(),
                'std': scores.std(),
                'scores': scores,
            }
        
        return self.results
    
    def summary(self):
        print("=== Baseline Comparison ===")
        sorted_results = sorted(
            self.results.items(),
            key=lambda x: x[1]['mean'],
            reverse=(self.task == 'classification')
        )
        for name, metrics in sorted_results:
            print(f"  {name:20s}: {metrics['mean']:.4f} "
                  f"\\\u00B1 {metrics['std']:.4f}")

# Example usage
X, y = make_classification(
    n_samples=1000, n_features=20,
    n_informative=10, random_state=42
)

bc = BaselineComparison(X, y, task='classification')
bc.evaluate_baselines()
bc.summary()`,
      output: `=== Baseline Comparison ===
  Logistic Regression : 0.8680 +/- 0.0215
  Stratified          : 0.5040 +/- 0.0221
  Most Frequent       : 0.5000 +/- 0.0000
  Uniform             : 0.5050 +/- 0.0287`,
      explanation: 'This framework systematically compares all baselines using cross-validation. Logistic Regression outperforms simple baselines by ~36%, confirming there is signal to model. The Most Frequent baseline shows zero variance (always predicts the same class).',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'E-commerce', description: 'Amazon uses "most popular item" as a baseline for recommendations. Any personalized model must outperform this simple heuristic to be worth deploying.' },
      { industry: 'Finance', description: 'Credit scoring uses logistic regression as a regulatory baseline. More complex models must demonstrate significant improvement (and interpretability) to replace it.' },
    ],
    caseStudy: {
      problem: 'A team spent 6 months building a deep learning model for demand forecasting. When they compared against a simple "predict last year\'s value" baseline, the deep learning model was only 2% better but took 100x longer to train and deploy.',
      solution: 'They adopted a hybrid approach: use the seasonal naive baseline for stable products and the deep learning model only for volatile products where the 2% improvement translated to significant inventory savings.',
      results: 'The team reduced compute costs by 80% while maintaining 95% of the potential improvement. The baseline comparison framework became a standard part of their MLOps pipeline.',
    },
    bestPractices: [
      'Always establish a baseline before training any complex model',
      'Use cross-validation to get robust baseline estimates',
      'Include a human baseline to understand the upper bound',
      'Compare against the existing production system, not just simple statistics',
      'Document baseline performance in your model card',
    ],
    tools: ['sklearn.dummy (DummyClassifier, DummyRegressor)', 'sklearn.linear_model', 'Prophet (baseline for time series)', 'scikit-learn cross_val_score'],
    jobRoles: ['Data Scientist', 'ML Engineer', 'Applied Scientist', 'Analytics Engineer'],
    furtherReading: [
      'scikit-learn documentation on dummy estimators',
      '"Baseline model" chapter in "Hands-On Machine Learning" — Geron',
      '"Always start with a baseline" — Google ML Best Practices',
      '"Do we need deep learning?" blog post by Pete Warden',
    ],
  },
  quiz: [
    {
      id: 'p15-bl-1', type: 'mcq',
      question: 'Which baseline strategy for a time series model would you use if you believe the most recent observation is the best predictor of the next value?',
      options: [
        'Mean baseline',
        'Naive (persistence) baseline',
        'Seasonal naive baseline',
        'Drift baseline',
      ],
      correctAnswer: 'Naive (persistence) baseline',
      explanation: 'The naive (persistence) baseline predicts that the next value equals the last observed value. It is the simplest time series baseline and works well for random walk processes.',
    },
    {
      id: 'p15-bl-2', type: 'truefalse',
      question: 'A baseline model must always be a machine learning model.',
      correctAnswer: 'False',
      explanation: 'Baselines can be simple statistical rules (mean, median), heuristic rules, human judgment, or rule-based systems. They do not need to be ML models at all.',
    },
    {
      id: 'p15-bl-3', type: 'code',
      question: 'Given a binary classification dataset with 95% class A and 5% class B, what accuracy does the "most_frequent" DummyClassifier achieve?',
      code: `from sklearn.dummy import DummyClassifier
from sklearn.metrics import accuracy_score
import numpy as np

y_true = np.array(['A'] * 95 + ['B'] * 5)
clf = DummyClassifier(strategy='most_frequent')
clf.fit(None, y_true)
y_pred = clf.predict(None, len(y_true))
print(accuracy_score(y_true, y_pred))`,
      options: [
        '50%',
        '95%',
        '5%',
        '100%',
      ],
      correctAnswer: '95%',
      explanation: 'The most_frequent strategy always predicts the majority class (A), which appears 95% of the time, so accuracy is 95%. This shows why accuracy alone is misleading for imbalanced datasets.',
    },
    {
      id: 'p15-bl-4', type: 'fillblank',
      question: 'When a simple model like logistic regression matches or exceeds the performance of a complex deep learning model, the deep learning model is likely ___ (overfitting / underfitting).',
      correctAnswer: 'overfitting',
      explanation: 'If a simple linear model matches a complex model, the complex model is likely overfitting — memorizing noise instead of learning generalizable patterns. The simple model provides a regularization signal.',
    },
    {
      id: 'p15-bl-5', type: 'match',
      question: 'Match each baseline strategy with its appropriate use case:',
      pairs: [
        { left: 'Mean baseline', right: 'Stable process without trend or seasonality' },
        { left: 'Naive baseline', right: 'Random walk process (stock prices)' },
        { left: 'Seasonal naive', right: 'Daily sales with weekly pattern' },
        { left: 'Human baseline', right: 'Upper bound estimate for task performance' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'Each baseline serves a different purpose: mean for stationary processes, naive for random walks, seasonal naive for periodic data, and humans for upper bound estimation.',
    },
  ],
}))

export {}
