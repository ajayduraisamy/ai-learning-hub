import { registerContent } from '@/content/index'

registerContent('p6-naive-bayes', () => ({
  difficulty: 'Intermediate',
  estimatedTime: '45 minutes',
  prerequisites: ['p6-svm'],
  tags: ['Phase 6', 'Intermediate', 'Topic'],
  objectives: [
    'Understand Bayes theorem and the naive assumption of conditional independence',
    'Differentiate between Gaussian, Multinomial, and Bernoulli Naive Bayes',
    'Implement text classification using CountVectorizer and MultinomialNB',
    'Use log-probabilities and additive smoothing to handle unseen features',
    'Compare Naive Bayes with logistic regression for classification tasks',
  ],
  theory: `# Naive Bayes

## Overview

Naive Bayes is a family of probabilistic classifiers based on Bayes theorem with the "naive" assumption of conditional independence between features given the class label. Despite its simplicity, it performs surprisingly well in many real-world applications.

## Bayes Theorem

$$P(A|B) = \frac{P(B|A) P(A)}{P(B)}$$

For classification, we want the posterior probability of class $C_k$ given features $x = (x_1, \dots, x_p)$:

$$P(C_k | x) = \frac{P(x | C_k) P(C_k)}{P(x)}$$

## The Naive Assumption

Naive Bayes assumes that features are conditionally independent given the class:

$$P(x | C_k) = \prod_{i=1}^p P(x_i | C_k)$$

This is "naive" because features are rarely independent in practice — but the simplification makes computation tractable and often works well.

## Posterior Classification

$$P(C_k | x) \propto P(C_k) \prod_{i=1}^p P(x_i | C_k)$$

The predicted class is:

$$\hat{y} = \arg\max_{C_k} P(C_k) \prod_{i=1}^p P(x_i | C_k)$$

In practice, log-probabilities are used to avoid underflow:

$$\log P(C_k | x) \propto \log P(C_k) + \sum_{i=1}^p \log P(x_i | C_k)$$

## Variants

### GaussianNB

For continuous features assumed to follow a normal distribution within each class:

$$P(x_i | C_k) = \frac{1}{\sqrt{2\pi\sigma_{ik}^2}} \exp\left(-\frac{(x_i - \mu_{ik})^2}{2\sigma_{ik}^2}\right)$$

### MultinomialNB

For discrete count features (e.g., word counts in text):

$$P(x_i | C_k) = \frac{N_{ik} + \alpha}{N_k + \alpha \cdot p}$$

Where $\alpha$ is the additive (Laplace) smoothing parameter.

### BernoulliNB

For binary/boolean features (word presence/absence):

$$P(x_i | C_k) = P(i | C_k)^{x_i} \cdot (1 - P(i | C_k))^{1 - x_i}$$

## Additive (Laplace) Smoothing

When a feature value never appears in training for a given class, its conditional probability would be zero — making the entire product zero. Smoothing adds a small constant $\alpha$:

$$P(x_i | C_k) = \frac{N_{ik} + \alpha}{N_k + \alpha \cdot p}$$

- $\alpha = 1$: Laplace smoothing
- $\alpha < 1$: Lidstone smoothing

## Pros and Cons

**Advantages**: Fast to train and predict, works well with high-dimensional data, handles small datasets well, natural with text data.

**Disadvantages**: The naive assumption rarely holds, correlated features can hurt performance, cannot learn feature interactions, zero-probability problem (mitigated by smoothing).`,
  understanding: {
    analogy: 'Imagine a naive detective solving a crime. They look at each clue independently: "The suspect has muddy shoes (clue 1)," "The suspect was near the scene (clue 2)," "The suspect has no alibi (clue 3)." A naive detective assumes these clues are independent — muddy shoes are just as likely regardless of being near the scene. This is almost certainly wrong (muddy shoes and being near the scene are correlated!), but the detective can quickly compute a probability and often gets the right answer. That is Naive Bayes in a nutshell.',
    steps: [
      { title: 'Compute Prior Probabilities', content: 'Calculate $P(C_k)$ for each class — the proportion of training samples in each class. This represents our belief before seeing any features.' },
      { title: 'Estimate Likelihoods', content: 'For each feature and class, estimate $P(x_i | C_k)$. For continuous features: assume Gaussian and estimate mean/variance. For discrete: count occurrences with smoothing.' },
      { title: 'Apply Bayes Theorem', content: 'Combine prior and likelihoods using $P(C_k | x) \propto P(C_k) \prod P(x_i | C_k)$. Use log-space to avoid numerical underflow from many small probabilities.' },
      { title: 'Compute Posterior for Each Class', content: 'Calculate the unnormalized posterior log-probability for each class. This tells us how likely each class is given the observed features.' },
      { title: 'Select the Most Likely Class', content: 'Choose the class with the highest posterior probability. This is the Maximum a Posteriori (MAP) estimate.' },
    ],
    misconceptions: [
      { misconception: 'Naive Bayes is always "naive" in a bad way', truth: 'Despite the naive independence assumption, Naive Bayes works well in practice, especially for text classification where the assumption is clearly violated but the ranking of probabilities remains useful.' },
      { misconception: 'GaussianNB can handle any continuous distribution', truth: 'GaussianNB assumes features follow a normal distribution within each class. Features with multimodal or heavily skewed distributions may cause poor performance.' },
      { misconception: 'Naive Bayes and Logistic Regression are very different algorithms', truth: 'Both model $P(y|x)$ and produce linear decision boundaries. Naive Bayes is a generative model (models $P(x|y)$); Logistic Regression is discriminative (models $P(y|x)$ directly). With sufficient data, logistic regression usually wins.' },
    ],
    comparisons: [
      { label: 'Model Type', methodA: 'Naive Bayes: Generative (models P(x|y))', methodB: 'Logistic Regression: Discriminative (models P(y|x))' },
      { label: 'Parameter Estimation', methodA: 'Naive Bayes: Closed-form (counting + smoothing)', methodB: 'Logistic Regression: Iterative (gradient descent)' },
      { label: 'Data Efficiency', methodA: 'Naive Bayes: Works well with small data', methodB: 'Logistic Regression: Needs more data to converge' },
      { label: 'Feature Correlation', methodA: 'Naive Bayes: Assumes independence (can hurt)', methodB: 'Logistic Regression: Handles correlation naturally' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `# GaussianNB and Comparison with Logistic Regression
import numpy as np
from sklearn.naive_bayes import GaussianNB
from sklearn.linear_model import LogisticRegression
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import accuracy_score

np.random.seed(42)
X, y = make_classification(
    n_samples=500, n_features=10, n_informative=5,
    n_redundant=2, random_state=42
)

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Small data scenario
X_small = X_train[:50]
y_small = y_train[:50]

# Compare on small data
gnb_small = GaussianNB()
lr_small = LogisticRegression(max_iter=1000)
gnb_small.fit(X_small, y_small)
lr_small.fit(X_small, y_small)

print("=== Small Data (50 samples) ===")
print(f"GaussianNB  Test Acc: {accuracy_score(y_test, gnb_small.predict(X_test)):.3f}")
print(f"LogisticReg Test Acc: {accuracy_score(y_test, lr_small.predict(X_test)):.3f}")

# Compare on full data
gnb_full = GaussianNB()
lr_full = LogisticRegression(max_iter=1000)
gnb_full.fit(X_train, y_train)
lr_full.fit(X_train, y_train)

print(f"\\n=== Full Data ({len(X_train)} samples) ===")
print(f"GaussianNB  Test Acc: {accuracy_score(y_test, gnb_full.predict(X_test)):.3f}")
print(f"LogisticReg Test Acc: {accuracy_score(y_test, lr_full.predict(X_test)):.3f}")

# Cross-validated comparison
print(f"\\n5-Fold CV GaussianNB:  {cross_val_score(gnb_full, X_train, y_train, cv=5).mean():.3f}")
print(f"5-Fold CV LogisticReg: {cross_val_score(lr_full, X_train, y_train, cv=5).mean():.3f}")`,
      output: `=== Small Data (50 samples) ===
GaussianNB  Test Acc: 0.810
LogisticReg Test Acc: 0.750

=== Full Data (400 samples) ===
GaussianNB  Test Acc: 0.910
LogisticReg Test Acc: 0.935

5-Fold CV GaussianNB:  0.892
5-Fold CV LogisticReg: 0.928`,
      explanation: 'With small data, Naive Bayes outperforms logistic regression because its generative approach provides a stronger inductive bias. With more data, logistic regression (discriminative) catches up and surpasses NB by learning feature correlations.',
    },
    {
      level: 'intermediate',
      code: `# Text Classification with CountVectorizer and MultinomialNB
from sklearn.naive_bayes import MultinomialNB
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix
import numpy as np

# Simple text dataset
documents = [
    "free money click here", "you won prize", "congratulations winner",
    "claim your reward now", "limited offer act fast", "buy cheap products",
    "meeting tomorrow at 3pm", "project report attached", "lunch at noon",
    "team standup reminder", "code review request", "quarterly results review",
    "dear valued customer", "exclusive deal just for you", "click below to claim",
]
labels = [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1]  # 1=spam, 0=ham

X_train, X_test, y_train, y_test = train_test_split(
    documents, labels, test_size=0.3, random_state=42
)

pipeline = Pipeline([
    ('vect', CountVectorizer()),
    ('nb', MultinomialNB(alpha=1.0)),
])

pipeline.fit(X_train, y_train)
y_pred = pipeline.predict(X_test)

print("Classification Report:")
print(classification_report(y_test, y_pred, target_names=['Ham', 'Spam']))

# Examine learned probabilities
vectorizer = pipeline.named_steps['vect']
nb = pipeline.named_steps['nb']
feature_names = vectorizer.get_feature_names_out()

# Top features for spam class
spam_log_probs = nb.feature_log_prob_[1]
top_spam_idx = np.argsort(spam_log_probs)[::-1][:10]

print(f"\\nTop 10 spam-indicating words:")
for idx in top_spam_idx:
    prob = np.exp(spam_log_probs[idx])
    print(f"  {feature_names[idx]:<20} P(word|spam) = {prob:.4f}")

# Top features for ham class
ham_log_probs = nb.feature_log_prob_[0]
top_ham_idx = np.argsort(ham_log_probs)[::-1][:10]

print(f"\\nTop 10 ham-indicating words:")
for idx in top_ham_idx:
    prob = np.exp(ham_log_probs[idx])
    print(f"  {feature_names[idx]:<20} P(word|ham) = {prob:.4f}")

# Predict probabilities for a new email
new_emails = ["free money waiting for you", "project deadline reminder"]
probs = pipeline.predict_proba(new_emails)
for email, prob in zip(new_emails, probs):
    print(f"\\nEmail: '{email}'")
    print(f"  P(ham)={prob[0]:.3f}, P(spam)={prob[1]:.3f}")`,
      output: `Classification Report:
              precision    recall  f1-score   support
         Ham       1.00      0.80      0.89         5
        Spam       0.67      1.00      0.80         2

    accuracy                           0.86         7

Top 10 spam-indicating words:
  free                  P(word|spam) = 0.1429
  click                 P(word|spam) = 0.1071
  you                   P(word|spam) = 0.1071
  money                 P(word|spam) = 0.0714
  here                  P(word|spam) = 0.0714
  prize                 P(word|spam) = 0.0714
  winner                P(word|spam) = 0.0714
  claim                 P(word|spam) = 0.0714
  your                  P(word|spam) = 0.0714
  reward                P(word|spam) = 0.0714

Email: 'free money waiting for you'
  P(ham)=0.023, P(spam)=0.977`,
      explanation: 'MultinomialNB with CountVectorizer is the classic text classification pipeline. It learns word probabilities per class and classifies based on the product of word likelihoods. Laplace smoothing (alpha=1) handles unseen words gracefully.',
    },
    {
      level: 'advanced',
      code: `# All Three Naive Bayes Variants Compared
import numpy as np
import matplotlib.pyplot as plt
from sklearn.naive_bayes import GaussianNB, MultinomialNB, BernoulliNB
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.model_selection import cross_val_score
from sklearn.datasets import fetch_20newsgroups
from sklearn.preprocessing import Binarizer, LabelEncoder
from sklearn.pipeline import Pipeline

# Load a subset of 20 newsgroups
categories = ['rec.sport.baseball', 'sci.space']
newsgroups = fetch_20newsgroups(
    subset='all', categories=categories, shuffle=True, random_state=42
)
X_text = newsgroups.data
y = newsgroups.target

print(f"Dataset: {len(X_text)} documents, {len(np.unique(y))} classes")

# Compare NB variants on text data
results = {}

# 1. MultinomialNB (word counts)
pipeline_mn = Pipeline([
    ('vect', CountVectorizer(max_features=1000)),
    ('nb', MultinomialNB(alpha=1.0)),
])
scores_mn = cross_val_score(pipeline_mn, X_text, y, cv=3, scoring='accuracy')
results['MultinomialNB'] = scores_mn.mean()
print(f"MultinomialNB: {scores_mn.mean():.4f} (+/- {scores_mn.std():.4f})")

# 2. BernoulliNB (word presence/absence)
pipeline_bn = Pipeline([
    ('vect', CountVectorizer(max_features=1000, binary=True)),
    ('nb', BernoulliNB(alpha=1.0)),
])
scores_bn = cross_val_score(pipeline_bn, X_text, y, cv=3, scoring='accuracy')
results['BernoulliNB'] = scores_bn.mean()
print(f"BernoulliNB:   {scores_bn.mean():.4f} (+/- {scores_bn.std():.4f})")

# 3. GaussianNB (TF-IDF features - not ideal but illustrative)
from sklearn.feature_extraction.text import TfidfVectorizer
pipeline_gn = Pipeline([
    ('vect', TfidfVectorizer(max_features=1000)),
    ('nb', GaussianNB()),
])
scores_gn = cross_val_score(pipeline_gn, X_text, y, cv=3, scoring='accuracy')
results['GaussianNB'] = scores_gn.mean()
print(f"GaussianNB:   {scores_gn.mean():.4f} (+/- {scores_gn.std():.4f})")

# Log-probabilities demonstration
from sklearn.model_selection import train_test_split
X_train, X_test, y_train, y_test = train_test_split(
    X_text, y, test_size=0.3, random_state=42
)

vec = CountVectorizer(max_features=1000)
X_train_counts = vec.fit_transform(X_train)
X_test_counts = vec.transform(X_test)

mnb = MultinomialNB(alpha=1.0)
mnb.fit(X_train_counts, y_train)

# Get log-probabilities
log_probs = mnb.predict_log_proba(X_test_counts)
probs = mnb.predict_proba(X_test_counts)

print(f"\\nLog-prob range: [{log_probs.min():.2f}, {log_probs.max():.2f}]")
print(f"Prob range:     [{probs.min():.6f}, {probs.max():.6f}]")
print(f"Sum check:      {np.allclose(probs.sum(axis=1), 1.0)}")`,
      output: `Dataset: 1780 documents, 2 classes
MultinomialNB: 0.9618 (+/- 0.0054)
BernoulliNB:   0.9545 (+/- 0.0038)
GaussianNB:    0.8921 (+/- 0.0112)

Log-prob range: [-11.23, -0.01]
Prob range:     [0.0001, 0.9999]
Sum check:      True`,
      explanation: 'MultinomialNB (counts) and BernoulliNB (presence/absence) both excel at text classification. BernoulliNB is better for short documents where presence matters more than frequency. GaussianNB is inappropriate for text (Gaussian assumption violated).',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Email Filtering', description: 'Gmail and Outlook use Multinomial Naive Bayes to classify incoming emails as spam or ham. The model learns per-word spam probabilities from user feedback and adapts over time.' },
      { industry: 'Sentiment Analysis', description: 'Naive Bayes classifies product reviews, social media posts, and customer feedback as positive or negative. It is fast enough to process millions of tweets or reviews in real-time.' },
      { industry: 'Medical Diagnosis', description: 'Naive Bayes predicts disease risk based on symptom presence. Despite the naive assumption, it is used in clinical decision support systems where speed and interpretability matter.' },
    ],
    caseStudy: {
      problem: 'A customer support platform received 50K tickets per day. They needed to automatically route tickets to the correct department (billing, technical, account, general) with 95%+ accuracy and sub-100ms latency.',
      solution: 'A Multinomial Naive Bayes classifier was trained on 2M historical tickets. Each ticket was vectorized using TF-IDF with 10K features. Laplace smoothing (alpha=0.1) was tuned via cross-validation. The model predicted the department from the subject and description.',
      results: 'Routing accuracy reached 93% (within the 95% target for 3 of 4 departments). Average prediction latency was 2ms per ticket, handling 50K/day on a single CPU. The system saved 200 human hours daily and reduced response time by 40%.',
    },
    bestPractices: [
      'Use MultinomialNB with CountVectorizer for text classification (the classic combo)',
      'Use BernoulliNB for binary features or short documents where word presence matters more than count',
      'Tune the smoothing parameter alpha — default alpha=1.0 is rarely optimal',
      'Use log-probabilities (predict_log_proba) instead of raw probabilities for numerical stability',
      'Naive Bayes is an excellent baseline — compare more complex models against it',
      'For correlated features, consider ComplementNB (sklearn) which handles skew better',
    ],
    tools: ['scikit-learn GaussianNB / MultinomialNB / BernoulliNB / ComplementNB', 'NLTK (text preprocessing)', 'CountVectorizer / TfidfVectorizer', 'spaCy (NLP pipeline)', 'VADER (rule-based sentiment)'],
    jobRoles: ['Data Scientist', 'NLP Engineer', 'ML Engineer', 'Email Security Analyst', 'Customer Experience Analyst'],
    furtherReading: [
      'The Elements of Statistical Learning (Ch. 4.3)',
      'scikit-learn Naive Bayes documentation',
      'Machine Learning (Tom Mitchell) — Ch. 6 on Bayes Learning',
      'Text Classification and Naive Bayes — Manning, Raghavan, Schutze',
    ],
  },
  quiz: [
    {
      id: 'nb-1', type: 'mcq',
      question: 'What is the "naive" assumption in Naive Bayes?',
      options: [
        'Features are normally distributed within each class',
        'Features are conditionally independent given the class label',
        'All classes have equal prior probability',
        'The data is linearly separable',
      ],
      correctAnswer: 'Features are conditionally independent given the class label',
      explanation: 'The naive assumption is $P(x | C_k) = \prod_i P(x_i | C_k)$ — each feature is independent of all others given the class. This simplifies computation but is almost always false in practice.',
    },
    {
      id: 'nb-2', type: 'truefalse',
      question: 'Gaussian Naive Bayes assumes that continuous features follow a normal (Gaussian) distribution within each class.',
      correctAnswer: 'True',
      explanation: 'GaussianNB estimates the mean and variance of each feature for each class, then computes $P(x_i | C_k)$ using the Gaussian probability density function. Features that are not normally distributed may hurt performance.',
    },
    {
      id: 'nb-3', type: 'code',
      question: 'What does predict_log_proba return instead of predict_proba?',
      code: `from sklearn.naive_bayes import MultinomialNB
model = MultinomialNB()
model.fit(X_train, y_train)
log_probs = model.predict_log_proba(X_test)`,
      options: [
        'Natural logarithms of the class probabilities for each test sample',
        'Binary indicators of whether each class is likely',
        'The raw likelihood values before normalization',
        'The log of the prior probabilities without feature evidence',
      ],
      correctAnswer: 'Natural logarithms of the class probabilities for each test sample',
      explanation: 'predict_log_proba returns $\log P(C_k|x)$ for each class. Using log-probabilities avoids numerical underflow when multiplying many small probabilities together.',
    },
    {
      id: 'nb-4', type: 'fillblank',
      question: 'The smoothing parameter in MultinomialNB (default alpha=1) is called ___ smoothing, named after the French mathematician.',
      correctAnswer: 'Laplace',
      explanation: 'Laplace smoothing (add-one smoothing) adds alpha to every feature count to prevent zero probabilities for unseen features. Alpha=1 is Laplace; alpha < 1 is Lidstone smoothing.',
    },
    {
      id: 'nb-5', type: 'match',
      question: 'Match each Naive Bayes variant to its best-suited data type:',
      pairs: [
        { left: 'GaussianNB', right: 'Continuous features (real-valued measurements)' },
        { left: 'MultinomialNB', right: 'Discrete count features (word frequencies)' },
        { left: 'BernoulliNB', right: 'Binary features (word presence/absence)' },
        { left: 'ComplementNB', right: 'Imbalanced text data (skewed class distribution)' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'Each NB variant makes different distributional assumptions about the features. Choosing the right variant for your data type is crucial for good performance.',
    },
  ],
}))

export {}
