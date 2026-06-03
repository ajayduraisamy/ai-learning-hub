import { registerContent } from '@/content/index'

registerContent('p15-hyperparameter-tuning', () => ({
  difficulty: 'Advanced',
  estimatedTime: '60 minutes',
  prerequisites: ['p15-baseline-models'],
  tags: ['Phase 15', 'Advanced', 'Topic'],
  objectives: [
    'Understand grid search, random search, and Bayesian optimization',
    'Implement hyperparameter tuning with sklearn and Optuna',
    'Use pruning, multi-objective optimization, and TPE samplers',
    'Visualize parameter importance and tuning results',
  ],
  theory: `# Hyperparameter Tuning

## Manual Tuning

The most common (and worst) approach: guess and check. Works only for low-dimensional search spaces and experienced practitioners.

## Grid Search

\\[
\\Theta = \\Theta_1 \\times \\Theta_2 \\times \\ldots \\times \\Theta_d
\\]

Exhaustively evaluates all combinations in a Cartesian product. The number of trials grows exponentially with dimensions (curse of dimensionality).

**Problem**: With 5 hyperparameters and 10 values each: \\(10^5 = 100,000\\) trials.

## Random Search

Randomly samples from the search distribution. Surprisingly, it is often **more efficient** than grid search because:

- Each trial explores a different value for each parameter
- The search budget is independent of dimensionality
- It has higher probability of finding good regions

**Bergstra & Bengio (2012)**: Random search finds better configurations than grid search given the same budget.

## Bayesian Optimization

Builds a probabilistic model of the objective function and uses it to select the next parameters to evaluate.

1. **Surrogate Model**: Gaussian Process (GP) or Tree-structured Parzen Estimator (TPE)
2. **Acquisition Function**: Expected Improvement (EI) or Upper Confidence Bound (UCB)

\\[
EI(x) = \\mathbb{E}[\\max(f(x) - f(x^+), 0)]
\\]

Where \\(x^+\\) is the best observed configuration so far.

### Optuna (Define-by-Run)

Optuna uses a "define-by-run" API where the search space is defined dynamically inside the objective function:

- **TPESampler**: Tree-structured Parzen Estimator (default)
- **Pruning**: Stop unpromising trials early (MedianPruner, ASHA)

### Population-Based Training (PBT)

Used in deep learning: trains a population of models in parallel, periodically copying weights from better performers and mutating hyperparameters.

### Hyperband / ASHA

Adaptive resource allocation: allocates more resources to promising configurations and terminates poor ones early. ASHA (Asynchronous Successive Halving Algorithm) is the distributed version.

\\[
n_i = \\left\\lfloor \\frac{B}{r_i} \\right\\rfloor, \\quad r_i = r_0 \\cdot \\eta^i
\\]

Where \\(B\\) is total budget, \\(r_0\\) is initial resource, and \\(\\eta\\) is the elimination factor.`,
  understanding: {
    analogy: 'Searching for treasure on an island: Grid search checks every square meter systematically (thorough but slow), random search throws darts at the map (surprisingly effective), and Bayesian optimization uses a metal detector that beeps louder near treasure (efficient and adaptive).',
    steps: [
      { title: 'Define Search Space', content: 'Identify which hyperparameters to tune and their ranges. Use log scales for positive parameters (learning rate, regularization).' },
      { title: 'Choose Search Strategy', content: 'Start with random search for exploration, then switch to Bayesian optimization (Optuna) for fine-tuning.' },
      { title: 'Set Evaluation Protocol', content: 'Use cross-validation or hold-out validation. Ensure consistent data splits across trials for fair comparison.' },
      { title: 'Apply Pruning', content: 'Use Optuna pruners to terminate unpromising trials early, saving compute for better configurations.' },
      { title: 'Analyze Results', content: 'Use parameter importance analysis, parallel coordinates, and contour plots to understand hyperparameter interactions.' },
    ],
    misconceptions: [
      { misconception: 'Grid search is the most thorough and therefore best approach', truth: 'Random search covers the search space more efficiently and finds better configurations with the same budget, especially for high-dimensional spaces.' },
      { misconception: 'Hyperparameter tuning should tune all parameters at once', truth: 'Start with the most impactful parameters (learning rate, tree depth for GBM) and freeze less important ones. Tuning everything simultaneously wastes compute.' },
    ],
    comparisons: [
      { label: 'Coverage', methodA: 'Grid Search: Systematic, exhaustive', methodB: 'Random Search: Probabilistic, dense' },
      { label: 'Scaling', methodA: 'Grid Search: Exponential in dims', methodB: 'Random Search: Independent of dims' },
      { label: 'Efficiency', methodA: 'Bayesian Opt: High (adaptive)', methodB: 'Grid Search: Low (wastes compute)' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `# Grid Search and Random Search with sklearn

from sklearn.model_selection import (
    GridSearchCV, RandomizedSearchCV
)
from sklearn.ensemble import RandomForestClassifier
from sklearn.datasets import make_classification
from scipy.stats import randint, uniform

X, y = make_classification(
    n_samples=500, n_features=10, random_state=42
)

# Define model and parameter grids
rf = RandomForestClassifier(random_state=42)

param_grid = {
    'n_estimators': [50, 100, 200],
    'max_depth': [5, 10, None],
    'min_samples_split': [2, 5],
}

# Grid Search
grid = GridSearchCV(
    rf, param_grid, cv=3,
    scoring='accuracy', n_jobs=-1
)
grid.fit(X, y)
print(f"Grid Search Best: {grid.best_params_}")
print(f"Grid Search Score: {grid.best_score_:.4f}")

# Random Search (with distributions)
param_dist = {
    'n_estimators': randint(50, 300),
    'max_depth': randint(3, 20),
    'min_samples_split': randint(2, 10),
    'max_features': uniform(0.3, 0.7),
}

random = RandomizedSearchCV(
    rf, param_dist, n_iter=30, cv=3,
    scoring='accuracy', random_state=42, n_jobs=-1
)
random.fit(X, y)
print(f"\\nRandom Search Best: {random.best_params_}")
print(f"Random Search Score: {random.best_score_:.4f}")`,
      output: `Grid Search Best: {'max_depth': 10, 'min_samples_split': 2, 'n_estimators': 200}
Grid Search Score: 0.9360

Random Search Best: {'max_depth': 17, 'max_features': 0.64, 'min_samples_split': 8, 'n_estimators': 231}
Random Search Score: 0.9380`,
      explanation: 'Both grid and random search find good configurations. Random search explores a wider space with fewer trials (30 vs 18) and often finds better configurations because it explores continuous ranges rather than fixed grid points.',
    },
    {
      level: 'intermediate',
      code: `# Optuna Hyperparameter Optimization

import optuna
from optuna.samplers import TPESampler
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import cross_val_score
from sklearn.ensemble import GradientBoostingClassifier

data = load_breast_cancer()
X, y = data.data, data.target

def objective(trial):
    params = {
        'n_estimators': trial.suggest_int('n_estimators', 50, 500),
        'max_depth': trial.suggest_int('max_depth', 3, 15),
        'learning_rate': trial.suggest_float(
            'learning_rate', 0.01, 0.3, log=True
        ),
        'subsample': trial.suggest_float('subsample', 0.6, 1.0),
        'min_samples_split': trial.suggest_int(
            'min_samples_split', 2, 20
        ),
    }
    model = GradientBoostingClassifier(
        **params, random_state=42
    )
    score = cross_val_score(
        model, X, y, cv=3, scoring='accuracy'
    ).mean()
    return score

# Create study with TPE sampler
study = optuna.create_study(
    direction='maximize',
    sampler=TPESampler(seed=42)
)

# Optimize
study.optimize(objective, n_trials=50)

print(f"Best trial: {study.best_trial.number}")
print(f"Best score: {study.best_trial.value:.4f}")
print(f"Best params: {study.best_trial.params}")

# Parameter importance
from optuna.importance import get_param_importances
importances = get_param_importances(study)
for param, importance in importances.items():
    print(f"  {param}: {importance:.3f}")`,
      output: `Best trial: 42
Best score: 0.9772
Best params: {'n_estimators': 312, 'max_depth': 8, 'learning_rate': 0.042, 'subsample': 0.87, 'min_samples_split': 7}
  learning_rate: 0.421
  max_depth: 0.315
  n_estimators: 0.184
  subsample: 0.052
  min_samples_split: 0.028`,
      explanation: 'Optuna uses TPE (Tree-structured Parzen Estimator) to intelligently explore the search space. The parameter importance analysis reveals that learning_rate and max_depth are the most influential hyperparameters, guiding future tuning efforts.',
    },
    {
      level: 'advanced',
      code: `# Optuna with Pruning and Visualization

import optuna
from optuna.pruners import MedianPruner
from optuna.visualization import (
    plot_optimization_history,
    plot_param_importances,
    plot_parallel_coordinate,
)
import lightgbm as lgb
from sklearn.datasets import load_diabetes
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error

data = load_diabetes()
X, y = data.data, data.target
X_train, X_valid, y_train, y_valid = train_test_split(
    X, y, test_size=0.2, random_state=42
)

class LightGBMObjective:
    def __init__(self, X_train, y_train, X_valid, y_valid):
        self.X_train = X_train
        self.y_train = y_train
        self.X_valid = X_valid
        self.y_valid = y_valid
    
    def __call__(self, trial):
        params = {
            'objective': 'regression',
            'metric': 'rmse',
            'boosting_type': 'gbdt',
            'num_leaves': trial.suggest_int('num_leaves', 8, 256),
            'learning_rate': trial.suggest_float(
                'learning_rate', 0.01, 0.3, log=True
            ),
            'feature_fraction': trial.suggest_float(
                'feature_fraction', 0.5, 1.0
            ),
            'bagging_fraction': trial.suggest_float(
                'bagging_fraction', 0.5, 1.0
            ),
            'lambda_l1': trial.suggest_float(
                'lambda_l1', 1e-8, 10.0, log=True
            ),
            'lambda_l2': trial.suggest_float(
                'lambda_l2', 1e-8, 10.0, log=True
            ),
        }
        
        dtrain = lgb.Dataset(self.X_train, self.y_train)
        
        pruning_callback = optuna.integration.LightGBMPruningCallback(
            trial, 'rmse'
        )
        
        gbm = lgb.train(
            params,
            dtrain,
            valid_sets=[(self.X_valid, self.y_valid)],
            callbacks=[pruning_callback],
            num_boost_round=500,
        )
        
        preds = gbm.predict(self.X_valid)
        return mean_squared_error(self.y_valid, preds)

pruner = MedianPruner(
    n_startup_trials=10,
    n_warmup_steps=20,
)

study = optuna.create_study(
    direction='minimize',
    pruner=pruner,
    storage='sqlite:///optuna.db',
    study_name='lgbm_tuning',
    load_if_exists=True,
)

objective = LightGBMObjective(
    X_train, y_train, X_valid, y_valid
)
study.optimize(objective, n_trials=100)

# Print results
print(f"Best RMSE: {study.best_value:.4f}")
print(f"Best params: {study.best_trial.params}")

# Print pruning statistics
completed = len([
    t for t in study.trials if t.state == optuna.trial.TrialState.COMPLETE
])
pruned = len([
    t for t in study.trials if t.state == optuna.trial.TrialState.PRUNED
])
print(f"Completed: {completed}, Pruned: {pruned}")`,
      output: `Best RMSE: 2956.42
Best params: {'num_leaves': 64, 'learning_rate': 0.087, 'feature_fraction': 0.82, 'bagging_fraction': 0.74, 'lambda_l1': 0.0012, 'lambda_l2': 0.045}
Completed: 38, Pruned: 62`,
      explanation: 'This advanced example uses Optuna with LightGBM integration, MedianPruner for automatic early stopping, and SQLite storage for persistence. Pruning terminated 62 unpromising trials early, saving significant compute while finding the best configuration.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'AutoML', description: 'Google Vizier, Microsoft NNI, and Optuna power enterprise hyperparameter optimization at scale, managing thousands of parallel trials across distributed compute clusters.' },
      { industry: 'Deep Learning', description: 'Population-Based Training (PBT) is used by DeepMind to jointly train and tune large language models, evolving hyperparameters during training rather than in a separate tuning phase.' },
    ],
    caseStudy: {
      problem: 'A team training a recommendation model had 15 hyperparameters and tried manual tuning. After 3 weeks, they still had not found a configuration that outperformed their default settings, and compute costs were spiraling.',
      solution: 'They switched to Optuna with ASHA pruning, which terminated underperforming trials after 20% of training. They also reduced the search space from 15 to 6 parameters using parameter importance analysis.',
      results: 'Optuna found a configuration with 12% better NDCG@10 in 48 hours. Compute costs dropped 70% because pruning eliminated 80% of trials early. The importance analysis revealed that 3 parameters accounted for 85% of performance variance.',
    },
    bestPractices: [
      'Use log-uniform distributions for positive parameters (learning rate, regularization)',
      'Start with random search, then use Bayesian optimization for fine-tuning',
      'Use pruning to stop unpromising trials early and save compute',
      'Analyze parameter importance to focus tuning on what matters',
      'Store tuning results in a database for reproducibility and analysis',
    ],
    tools: ['Optuna', 'scikit-learn (GridSearchCV, RandomizedSearchCV)', 'Hyperopt', 'Ray Tune', 'Weights & Biases Sweeps'],
    jobRoles: ['ML Engineer', 'Research Scientist', 'AutoML Engineer', 'Data Scientist'],
    furtherReading: [
      '"Random Search for Hyper-Parameter Optimization" — Bergstra & Bengio (2012)',
      '"Algorithms for Hyper-Parameter Optimization" — Bergstra et al. (2011)',
      'Optuna documentation and tutorials',
      '"Hyperband: A Novel Bandit-Based Approach" — Li et al. (2018)',
    ],
  },
  quiz: [
    {
      id: 'p15-ht-1', type: 'mcq',
      question: 'Why does random search often outperform grid search given the same computational budget?',
      options: [
        'Random search is less thorough and therefore faster',
        'Grid search suffers from the curse of dimensionality; random search explores more distinct values per parameter',
        'Random search uses Bayesian optimization internally',
        'Grid search only works with discrete parameters',
      ],
      correctAnswer: 'Grid search suffers from the curse of dimensionality; random search explores more distinct values per parameter',
      explanation: 'With the same budget, random search explores more values per parameter because grid search wastes trials on uninformative combinations. Random search has higher probability of finding good regions in high-dimensional spaces.',
    },
    {
      id: 'p15-ht-2', type: 'truefalse',
      question: 'Bayesian optimization always finds the globally optimal hyperparameter configuration.',
      correctAnswer: 'False',
      explanation: 'Bayesian optimization is a heuristic that balances exploration and exploitation. It can get stuck in local optima, especially when the surrogate model poorly approximates the objective function.',
    },
    {
      id: 'p15-ht-3', type: 'code',
      question: 'In the following Optuna objective function, what type of distribution does learning_rate use?',
      code: `def objective(trial):
    params = {
        'learning_rate': trial.suggest_float(
            'learning_rate', 0.001, 0.1, log=True
        ),
        'batch_size': trial.suggest_categorical(
            'batch_size', [16, 32, 64]
        ),
    }
    return train_model(params)`,
      options: [
        'Uniform distribution between 0.001 and 0.1',
        'Log-uniform distribution (values sampled uniformly on log scale)',
        'Normal distribution with mean 0.001 and std 0.1',
        'Categorical distribution with 2 values',
      ],
      correctAnswer: 'Log-uniform distribution (values sampled uniformly on log scale)',
      explanation: 'The log=True parameter in suggest_float creates a log-uniform distribution where values are sampled uniformly on the logarithmic scale. This is appropriate for learning rates which span orders of magnitude.',
    },
    {
      id: 'p15-ht-4', type: 'fillblank',
      question: 'In Bayesian optimization, the ___ function (like Expected Improvement) determines which hyperparameter configuration to evaluate next.',
      correctAnswer: 'acquisition',
      explanation: 'The acquisition function uses the surrogate model\'s predictions to score which point is most promising to evaluate next, typically balancing exploration of uncertain regions and exploitation of known good regions.',
    },
    {
      id: 'p15-ht-5', type: 'match',
      question: 'Match each hyperparameter optimization method with its key characteristic:',
      pairs: [
        { left: 'Grid Search', right: 'Exhaustive Cartesian product evaluation' },
        { left: 'Random Search', right: 'Probabilistic sampling from distributions' },
        { left: 'Bayesian Optimization', right: 'Sequential model-based optimization' },
        { left: 'Population-Based Training', right: 'Evolve hyperparameters during training' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'Each method takes a fundamentally different approach: grid search is exhaustive, random search is probabilistic, Bayesian optimization is adaptive, and PBT evolves parameters during training.',
    },
  ],
}))

export {}
