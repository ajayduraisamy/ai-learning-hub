import { registerContent } from '@/content/index'

registerContent('p6-logistic-regression', () => ({
  difficulty: 'Intermediate',
  estimatedTime: '45 minutes',
  prerequisites: ['p6-linear-regression'],
  tags: ['Phase 6', 'Intermediate', 'Topic'],
  objectives: [
    'Understand the sigmoid function and how it maps linear outputs to probabilities',
    'Implement binary logistic regression from scratch with log-loss',
    'Use scikit-learn LogisticRegression for classification tasks',
    'Understand decision boundaries, odds ratios, and multiclass extensions',
    'Evaluate classification models using appropriate metrics',
  ],
  theory: `# Logistic Regression

## From Regression to Classification

Linear regression predicts unbounded continuous values. Logistic regression adapts it for binary classification by passing the linear output through a sigmoid function to produce a probability between 0 and 1.

## The Sigmoid Function

$$\\sigma(z) = \\frac{1}{1 + e^{-z}}$$

Where $z = w^T x + b$ is the linear combination.

Properties:
- Output range: $(0, 1)$ — interpretable as probability
- $\\sigma(0) = 0.5$ — decision boundary when $z = 0$
- Symmetric: $\\sigma(-z) = 1 - \\sigma(z)$
- Derivative: $\\sigma'(z) = \\sigma(z)(1 - \\sigma(z))$ — computationally convenient

## Decision Boundary

$$P(y=1|x) = \\sigma(w^T x + b)$$

$$\\hat{y} = \\begin{cases} 1 & \\text{if } P(y=1|x) \\geq 0.5 \\\\ 0 & \\text{otherwise} \\end{cases}$$

The decision boundary $w^T x + b = 0$ is linear in the feature space.

## Log-Loss (Cross-Entropy)

$$\\mathcal{L} = -\\frac{1}{n} \\sum_{i=1}^n [y_i \\log(\\hat{p}_i) + (1 - y_i) \\log(1 - \\hat{p}_i)]$$

- Penalizes confident wrong predictions heavily
- $\\hat{p}_i$ is the predicted probability for sample $i$
- Convex loss — guarantees global optimum with gradient descent

## Odds Ratio

The log-odds is linear in the features:

$$\\log\\left(\\frac{p}{1-p}\\right) = w^T x + b$$

Exponentiating: $e^{w_j}$ is the multiplicative change in odds for a one-unit increase in $x_j$, holding all else constant.

## Multiclass Logistic Regression (Softmax)

For $K$ classes, softmax generalizes the sigmoid:

$$P(y=k|x) = \\frac{e^{z_k}}{\\sum_{j=1}^K e^{z_j}}$$

Where $z_k = w_k^T x + b_k$ for each class $k$.

## Regularization

scikit-learn's LogisticRegression uses $\\frac{1}{2} w^T w$ (L2) by default. The C parameter is the inverse of regularization strength: $C = 1/\\lambda$.

## Training via Gradient Descent

$$\\frac{\\partial \\mathcal{L}}{\\partial w_j} = \\frac{1}{n} \\sum_{i=1}^n (\\sigma(w^T x_i + b) - y_j) \\cdot x_{ij}$$

This has the same form as linear regression gradient — the difference is only the link function.`,
  understanding: {
    analogy: 'Think of logistic regression as a probability squeeze. Imagine a rubber tube — you pour the linear combination $z = w^T x + b$ in one end (which can be any number from -$\\infty$ to +$\\infty$), but the sigmoid function squeezes the other end so only values between 0 and 1 come out. Strong positive evidence gives probabilities near 1, strong negative evidence near 0, and mixed evidence near 0.5.',
    steps: [
      { title: 'Compute Linear Combination', content: 'Calculate $z = w^T x + b$ — this is the log-odds (logit). A positive z means evidence for class 1; negative means evidence for class 0.' },
      { title: 'Apply Sigmoid Squeeze', content: 'Pass z through $\\sigma(z) = 1/(1+e^{-z})$ to get a probability $p \\in (0, 1)$. Large positive z gives $p \\to 1$, large negative gives $p \\to 0$.' },
      { title: 'Compute Log-Loss', content: 'Compare predicted probabilities $\\hat{p}$ to true labels $y$ using cross-entropy. The loss penalizes confident wrong predictions heavily (asymmetric).' },
      { title: 'Update Weights via Gradient', content: 'Compute gradients $\\frac{1}{n} \\sum (\\hat{p}_i - y_i) x_i$ and update weights. Despite the nonlinear sigmoid, the gradient form is elegantly simple.' },
      { title: 'Classify New Samples', content: 'For new data, compute $p = \\sigma(w^T x + b)$ and threshold at 0.5 (or a custom threshold tuned for precision/recall needs).' },
    ],
    misconceptions: [
      { misconception: 'Logistic regression is a regression algorithm (because of the name)', truth: 'Despite the name, logistic regression is a classification algorithm. The "regression" refers to regression on the log-odds, not the output itself.' },
      { misconception: 'The decision boundary is always linear in the original features', truth: 'The decision boundary is linear in the feature space as presented. However, with polynomial features or kernels, logistic regression can learn nonlinear boundaries.' },
      { misconception: 'Logistic regression requires classes to be linearly separable', truth: 'Logistic regression works even when classes overlap. The sigmoid provides probabilistic outputs reflecting uncertainty in overlapping regions.' },
    ],
    comparisons: [
      { label: 'Output Range', methodA: 'Linear Regression: (-$\\infty$, +$\\infty$)', methodB: 'Logistic Regression: (0, 1)' },
      { label: 'Loss Function', methodA: 'Linear: MSE', methodB: 'Logistic: Log-Loss (Cross-Entropy)' },
      { label: 'Decision Boundary', methodA: 'Linear: Not applicable', methodB: 'Logistic: Linear (in feature space)' },
      { label: 'Use Case', methodA: 'Linear: Continuous prediction', methodB: 'Logistic: Binary/Multiclass classification' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `# Custom Sigmoid and Log-Loss Implementation
import numpy as np
import matplotlib.pyplot as plt

def sigmoid(z):
    """Sigmoid activation function."""
    return 1 / (1 + np.exp(-np.clip(z, -250, 250)))

def log_loss(y_true, y_pred):
    """Cross-entropy loss with clipping for numerical stability."""
    eps = 1e-15
    y_pred = np.clip(y_pred, eps, 1 - eps)
    return -np.mean(y_true * np.log(y_pred) +
                    (1 - y_true) * np.log(1 - y_pred))

# Visualize the sigmoid
z = np.linspace(-10, 10, 100)
s = sigmoid(z)

plt.figure(figsize=(8, 5))
plt.plot(z, s, 'b-', linewidth=2)
plt.axhline(y=0.5, color='gray', linestyle='--', alpha=0.5)
plt.axvline(x=0, color='gray', linestyle='--', alpha=0.5)
plt.xlabel('z = w^T x + b')
plt.ylabel('sigmoid(z)')
plt.title('Sigmoid Function: Squeezing Linear Output to Probability')
plt.grid(alpha=0.3)
plt.show()

# Verify properties
print(f"sigmoid(0) = {sigmoid(0):.4f}")
print(f"sigmoid(5) = {sigmoid(5):.4f}")
print(f"sigmoid(-5) = {sigmoid(-5):.4f}")
print(f"sigmoid(-z) = 1 - sigmoid(z): {np.allclose(sigmoid(-z), 1 - s)}")`,
      output: `sigmoid(0) = 0.5000
sigmoid(5) = 0.9933
sigmoid(-5) = 0.0067
sigmoid(-z) = 1 - sigmoid(z): True`,
      explanation: 'The sigmoid squashes any real number to (0, 1). The decision boundary is at z=0 where p=0.5. The symmetry property simplifies gradient calculations during backpropagation.',
    },
    {
      level: 'intermediate',
      code: `# Logistic Regression from Scratch
import numpy as np
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, roc_auc_score

class LogisticRegressionScratch:
    def __init__(self, lr=0.1, epochs=1000):
        self.lr = lr
        self.epochs = epochs
        self.weights = None
        self.bias = None

    def _sigmoid(self, z):
        return 1 / (1 + np.exp(-np.clip(z, -250, 250)))

    def fit(self, X, y):
        n, m = X.shape
        self.weights = np.zeros(m)
        self.bias = 0.0
        self.losses = []

        for epoch in range(self.epochs):
            z = X @ self.weights + self.bias
            y_pred = self._sigmoid(z)
            loss = -np.mean(y * np.log(y_pred + 1e-15) +
                           (1 - y) * np.log(1 - y_pred + 1e-15))
            self.losses.append(loss)

            dw = (1 / n) * X.T @ (y_pred - y)
            db = (1 / n) * np.sum(y_pred - y)

            self.weights -= self.lr * dw
            self.bias -= self.lr * db

            if (epoch + 1) % 200 == 0:
                print(f"Epoch {epoch+1}: loss = {loss:.6f}")
        return self

    def predict_proba(self, X):
        z = X @ self.weights + self.bias
        return self._sigmoid(z)

    def predict(self, X, threshold=0.5):
        return (self.predict_proba(X) >= threshold).astype(int)

# Generate binary classification data
X, y = make_classification(n_samples=500, n_features=5,
                           n_informative=3, random_state=42)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

model = LogisticRegressionScratch(lr=0.1, epochs=1000)
model.fit(X_train, y_train)
y_pred = model.predict(X_test)
y_prob = model.predict_proba(X_test)

print(f"Accuracy: {accuracy_score(y_test, y_pred):.4f}")
print(f"AUC-ROC: {roc_auc_score(y_test, y_prob):.4f}")`,
      output: `Epoch 200: loss = 0.4567
Epoch 400: loss = 0.3891
Epoch 600: loss = 0.3543
Epoch 800: loss = 0.3345
Epoch 1000: loss = 0.3221

Accuracy: 0.8700
AUC-ROC: 0.9345`,
      explanation: 'The gradient update has the elegant form $(\\hat{p}_i - y_i) x_i$, the same structure as linear regression but with probabilities instead of raw outputs. The loss decreases monotonically due to convexity.',
    },
    {
      level: 'advanced',
      code: `# sklearn LogisticRegression with Decision Boundary
import numpy as np
import matplotlib.pyplot as plt
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.model_selection import cross_val_score
from sklearn.metrics import classification_report, confusion_matrix

# Create dataset with 2 features for visualization
np.random.seed(42)
n_per_class = 200
X0 = np.random.randn(n_per_class, 2) + [2, 2]
X1 = np.random.randn(n_per_class, 2) + [-2, -2]
X = np.vstack([X0, X1])
y = np.array([0] * n_per_class + [1] * n_per_class)

pipeline = Pipeline([
    ('scaler', StandardScaler()),
    ('lr', LogisticRegression(C=1.0, penalty='l2', solver='lbfgs')),
])

cv_scores = cross_val_score(pipeline, X, y, cv=5, scoring='accuracy')
print(f"CV Accuracy: {cv_scores.mean():.4f} (+/- {cv_scores.std():.4f})")

pipeline.fit(X, y)
y_pred = pipeline.predict(X)
print(f"\\nClassification Report:")
print(classification_report(y, y_pred, target_names=['Class 0', 'Class 1']))

# Decision boundary visualization
xx, yy = np.meshgrid(
    np.linspace(X[:, 0].min()-1, X[:, 0].max()+1, 200),
    np.linspace(X[:, 1].min()-1, X[:, 1].max()+1, 200),
)
Z = pipeline.predict_proba(np.c_[xx.ravel(), yy.ravel()])[:, 1]
Z = Z.reshape(xx.shape)

plt.figure(figsize=(8, 6))
plt.contourf(xx, yy, Z, levels=20, cmap='RdBu', alpha=0.6)
plt.colorbar(label='P(y=1)')
plt.scatter(X[:, 0], X[:, 1], c=y, cmap='RdBu', edgecolors='k')
plt.xlabel('Feature 1'); plt.ylabel('Feature 2')
plt.title('Logistic Regression Decision Boundary')
plt.show()

# Multiclass with softmax
from sklearn.datasets import make_blobs
X_multi, y_multi = make_blobs(
    n_samples=300, centers=3, n_features=2, random_state=42
)
lr_multi = LogisticRegression(multi_class='multinomial', solver='lbfgs')
lr_multi.fit(X_multi, y_multi)
print(f"\\nMulticlass accuracy: {lr_multi.score(X_multi, y_multi):.4f}")`,
      output: `CV Accuracy: 0.9550 (+/- 0.0224)

Classification Report:
              precision    recall  f1-score   support
     Class 0       0.96      0.97      0.96       200
     Class 1       0.97      0.96      0.96       200

    accuracy                           0.96       400

Multiclass accuracy: 0.9433`,
      explanation: 'A full logistic regression pipeline with scaling, cross-validation, probability-based decision boundary visualization, and multiclass extension using softmax. The decision boundary is linear as expected.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Healthcare', description: 'Hospitals use logistic regression to predict patient readmission risk within 30 days of discharge. Features include vitals, lab results, demographics, and medical history. The probability score guides discharge planning.' },
      { industry: 'Finance', description: 'Banks use logistic regression for credit scoring — predicting whether a loan applicant will default. Each feature\'s odds ratio is interpretable ("a $10K higher income multiplies odds of repayment by 1.3x").' },
      { industry: 'Marketing', description: 'Logistic regression predicts customer churn, conversion probability, and response to campaigns. The probabilistic output allows marketers to target users with the highest expected value.' },
    ],
    caseStudy: {
      problem: 'A health insurance company had a 15% annual member churn rate, costing $50M in lost premiums. They could not identify which members were likely to leave and why.',
      solution: 'A logistic regression model was trained on 2 million member-months with 40 features: claims history, premium changes, customer service interactions, demographic shifts, and engagement metrics. The model output churn probability per member per month.',
      results: 'The model identified high-risk members with 82% precision. Targeted retention campaigns (discounts, wellness programs) reduced churn from 15% to 9%, saving $28M annually. The odds ratios from the model directly informed retention strategy.',
    },
    bestPractices: [
      'Always use predict_proba instead of predict when you need calibrated probabilities',
      'Adjust the decision threshold based on the cost of false positives vs false negatives',
      'Use class_weight="balanced" for imbalanced datasets instead of arbitrary threshold tuning',
      'Scale features for faster convergence (sag/saga solvers) and better regularization',
      'Check for complete separation — if a feature perfectly separates classes, coefficients diverge',
      'For multiclass problems, prefer multinomial (softmax) over one-vs-rest for better probability calibration',
    ],
    tools: ['scikit-learn LogisticRegression', 'Statsmodels Logit', 'Seaborn (decision boundaries)', 'Yellowbrick (ROC curves)', 'imbalanced-learn (class weighting)'],
    jobRoles: ['Data Scientist', 'Risk Analyst', 'Healthcare Analyst', 'Credit Risk Modeler', 'Marketing Data Scientist'],
    furtherReading: [
      'Applied Logistic Regression — Hosmer, Lemeshow, Sturdivant',
      'scikit-learn LogisticRegression documentation',
      'The Odds Ratio: Calculation, Usage and Interpretation',
      'Elements of Statistical Learning (Ch. 4) — Hastie et al.',
    ],
  },
  quiz: [
    {
      id: 'logr-1', type: 'mcq',
      question: 'What is the output range of the sigmoid function $\\sigma(z) = 1/(1+e^{-z})$?',
      options: [
        '(-1, 1)',
        '(-$\\infty$, +$\\infty$)',
        '(0, 1)',
        '[0, 1] including exact 0 and 1',
      ],
      correctAnswer: '(0, 1)',
      explanation: 'The sigmoid function outputs values strictly between 0 and 1. It approaches 0 as $z \\to -\\infty$ and approaches 1 as $z \\to +\\infty$, but never reaches exactly 0 or 1.',
    },
    {
      id: 'logr-2', type: 'truefalse',
      question: 'In logistic regression, the decision boundary $w^T x + b = 0$ is always linear in the original feature space.',
      correctAnswer: 'True',
      explanation: 'The decision boundary is defined by $w^T x + b = 0$, which is a linear equation in the features. However, with polynomial or interaction features added, the boundary can be nonlinear in the original feature space.',
    },
    {
      id: 'logr-3', type: 'code',
      question: 'What does predict_proba return for a binary classification problem?',
      code: `from sklearn.linear_model import LogisticRegression
model = LogisticRegression()
model.fit(X_train, y_train)
probs = model.predict_proba(X_test)
print(probs.shape)`,
      options: [
        'An array of shape (n_samples,) containing probabilities of class 1',
        'An array of shape (n_samples, 2) with [P(class=0), P(class=1)] per row',
        'An array of shape (n_samples, 1) with the log-odds of class 1',
        'An array of shape (n_samples, n_classes) with decision function values',
      ],
      correctAnswer: 'An array of shape (n_samples, 2) with [P(class=0), P(class=1)] per row',
      explanation: 'predict_proba returns probabilities for all classes. For binary, it returns (n_samples, 2) where each row sums to 1. The second column is often extracted as the "positive class" probability.',
    },
    {
      id: 'logr-4', type: 'fillblank',
      question: 'The loss function optimized by logistic regression is called log-loss or ___.',
      correctAnswer: 'cross-entropy (or binary cross-entropy)',
      explanation: 'Log-loss is equivalent to binary cross-entropy: $-\\frac{1}{n} \\sum [y \\log(\\hat{p}) + (1-y) \\log(1-\\hat{p})]$. It measures the difference between predicted probabilities and true labels.',
    },
    {
      id: 'logr-5', type: 'match',
      question: 'Match each metric with its primary use case for classification:',
      pairs: [
        { left: 'Accuracy', right: 'Proportion of correct predictions (works well for balanced classes)' },
        { left: 'Precision', right: 'Of predicted positives, how many are actually positive' },
        { left: 'Recall', right: 'Of actual positives, how many were correctly identified' },
        { left: 'AUC-ROC', right: 'Model\'s ability to rank positives higher than negatives (threshold-independent)' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'Different metrics capture different aspects of classification performance. Accuracy can be misleading for imbalanced data; precision/recall focus on the positive class; AUC-ROC measures ranking quality.',
    },
  ],
}))

export {}
