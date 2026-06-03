import { registerContent } from '@/content/index'

registerContent('p21-churn-prediction', () => ({
  difficulty: 'Advanced',
  estimatedTime: '120 minutes',
  prerequisites: ['p6-logistic-regression', 'p6-random-forest', 'p6-xgboost'],
  tags: ['End-to-End Projects', 'Advanced', 'Project'],
  objectives: [
    'Frame customer churn as a binary classification business problem',
    'Handle imbalanced datasets using SMOTE and class weights',
    'Engineer features from customer usage and support data',
    'Evaluate models with business-centric metrics (cost-based thresholds)',
    'Build a deployable churn scoring API',
  ],
  theory: `# Customer Churn Prediction

## Business Problem

Customer churn (customer attrition) is one of the most critical metrics for subscription-based businesses. The cost of acquiring a new customer is 5-7x higher than retaining an existing one.

**Goal**: Predict which customers are likely to cancel their subscription within the next 30 days so the business can proactively intervene with retention offers.

### Business Metrics

- **Churn Rate**: Percentage of customers lost in a period
- **Retention Rate**: 1 - Churn Rate
- **Customer Lifetime Value (CLV)**: Average revenue per customer over their lifetime
- **Cost-Based Threshold**: True Positive (saved customer value) vs False Positive (cost of unnecessary offer)

## Data Exploration

### Key Features

| Feature Type | Examples | Insight |
|-------------|----------|---------|
| Demographics | Age, Gender, Location | Segment-level churn patterns |
| Account | Tenure, Contract Type, Payment Method | Longer tenure = lower churn |
| Usage | Monthly charges, Data usage, Call minutes | Usage decline precedes churn |
| Support | Ticket count, Resolution time, CSAT score | Multiple tickets = high churn risk |
| Engagement | Login frequency, Feature adoption | Low engagement signals upcoming churn |

### Churn Indicators

1. **Decreasing usage** over 3 consecutive months (strongest signal)
2. **Support tickets** about billing or technical issues
3. **Contract end approaching** (month-to-month customers churn at 3x annual rate)
4. **Low feature adoption** (using only basic features)

## Handling Imbalanced Data

Churn datasets are typically imbalanced (5-20% churn rate). Standard accuracy is misleading — a model predicting "no churn" for everyone achieves 80-95% accuracy but is useless.

### Techniques

1. **Class Weights**: Assign higher misclassification cost to minority class
   $$\\text{weight}_{\\text{minority}} = \\frac{n_{\\text{samples}}}{n_{\\text{classes}} \\times n_{\\text{minority}}}$$

2. **SMOTE** (Synthetic Minority Oversampling): Creates synthetic churn examples by interpolating between minority class neighbors
   $$x_{\\text{new}} = x_i + \\lambda \\times (x_{z_i} - x_i) \\quad \\text{where} \\quad \\lambda \\sim U(0, 1)$$

3. **Threshold Moving**: Adjust the decision threshold from default 0.5 to optimize business metrics

## Model Evaluation Strategy

### Beyond Accuracy

| Metric | Formula | Business Relevance |
|--------|---------|-------------------|
| Precision | TP / (TP + FP) | Cost of false positives (wasted offers) |
| Recall | TP / (TP + FN) | Revenue saved (true churners caught) |
| F1-Score | 2 × P × R / (P + R) | Balance between precision and recall |
| AUC-ROC | Area under ROC curve | Overall model discrimination ability |

### Cost-Based Threshold Optimization

Define cost matrix:
- **True Positive**: Saved customer value = +$500
- **False Positive**: Cost of offer = -$20
- **False Negative**: Lost customer value = -$500
- **True Negative**: No action needed = $0

$$\\text{Expected Profit} = \\sum (TP \\times \\text{value}_{TP} + FP \\times \\text{cost}_{FP} + FN \\times \\text{cost}_{FN})$$

## Deployment

The model is deployed as a batch scoring pipeline (daily) and a real-time API for CRM integration:
- **Batch**: All customers scored daily at 2 AM, high-risk flagged for retention team
- **Real-time**: Customer support agents can pull churn risk during a live call`,

  understanding: {
    analogy: 'Customer churn prediction is like a doctor screening patients for disease risk. The doctor checks vital signs, medical history, and lifestyle factors (our features), then assigns a risk score. High-risk patients get preventive care (retention offers), while low-risk patients continue normal monitoring. Just as a doctor prefers false positives (unnecessary tests) over false negatives (missed disease), a churn model is tuned to catch at-risk customers even if some predictions are wrong.',
    steps: [
      { title: 'Define Churn', content: 'Operationally define what counts as churn (e.g., no payment for 30 days, account cancellation request). This definition directly impacts labeling quality.' },
      { title: 'Feature Engineering', content: 'Create time-window aggregates: usage trends (3-month slope), support ticket count, login frequency decay, payment history patterns. Lag features to avoid data leakage.' },
      { title: 'Handle Imbalance', content: 'Apply SMOTE or class weights to handle the minority churn class. Split data temporally (train on older months, validate on recent) to simulate production.' },
      { title: 'Model Training', content: 'Train multiple classifiers (Logistic Regression, Random Forest, XGBoost). Calibrate probabilities with Platt scaling or isotonic regression.' },
      { title: 'Threshold Optimization', content: 'Find the probability threshold that maximizes expected profit using the business cost matrix. This often differs significantly from 0.5.' },
      { title: 'Deploy & Monitor', content: 'Deploy as a batch scoring job + real-time API. Monitor churn rate predictions vs actual, track feature drift, and retrain quarterly.' },
    ],
    misconceptions: [
      { misconception: 'Accuracy is the best metric for churn prediction', truth: 'With 10% churn, a model predicting "no churn" for everyone gets 90% accuracy. Precision, recall, and cost-based metrics are far more meaningful.' },
      { misconception: 'SMOTE always improves model performance', truth: 'SMOTE can create noisy samples when the minority class is very small or when features have high variance. It may not help if the minority class is not well-clustered.' },
      { misconception: 'Higher AUC always means a better production model', truth: 'AUC measures ranking quality across all thresholds. A model with high AUC may perform poorly at the specific threshold that maximizes business profit.' },
    ],
    comparisons: [
      { label: 'Class Imbalance Handling', methodA: 'SMOTE — Creates synthetic samples', methodB: 'Class Weights — Adjusts loss function penalty' },
      { label: 'Probability Calibration', methodA: 'Platt Scaling — Parametric (sigmoid)', methodB: 'Isotonic Regression — Non-parametric' },
      { label: 'Interpretability', methodA: 'Logistic Regression — High (OR, coefficients)', methodB: 'XGBoost — Medium (SHAP values needed)' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `# Setup: Load and explore churn data
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

# Load data
df = pd.read_csv('data/customer_churn.csv')
print(f"Shape: {df.shape}")
print(f"Churn rate: {df['Churn'].mean():.2%}")
print(f"\\nColumns:\\n{df.dtypes}")

# Feature exploration
fig, axes = plt.subplots(2, 3, figsize=(15, 8))
features = ['tenure', 'MonthlyCharges', 'TotalCharges',
            'Contract', 'PaymentMethod', 'SupportTickets']
for ax, feat in zip(axes.flat, features):
    if df[feat].dtype == 'object':
        df.groupby(feat)['Churn'].mean().sort_values().plot(kind='bar', ax=ax)
        ax.set_title(f'Churn Rate by {feat}')
    else:
        sns.boxplot(x='Churn', y=feat, data=df, ax=ax)
        ax.set_title(f'{feat} by Churn')
plt.tight_layout()
plt.show()

# Key insight
print(f"\\nMonth-to-month churn rate: "
      f"{df[df['Contract']=='Month-to-month']['Churn'].mean():.2%}")
print(f"Annual contract churn rate: "
      f"{df[df['Contract']=='One year']['Churn'].mean():.2%}")`,
      output: `Shape: (7043, 21)
Churn rate: 26.54%

Columns:
customerID       object
gender           object
tenure            int64
MonthlyCharges  float64
TotalCharges    float64
Contract         object
PaymentMethod    object
SupportTickets    int64
...               ...

Month-to-month churn rate: 42.71%
Annual contract churn rate: 11.27%`,
      explanation: 'Initial EDA reveals a 26.5% churn rate (not severely imbalanced). Contract type is a strong predictor — month-to-month customers churn at 4x the rate of annual contract holders. This guides feature engineering toward contract-based features.',
    },
    {
      level: 'intermediate',
      code: `# Core logic: Imbalanced data handling and ensemble training
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, roc_auc_score
from imblearn.over_sampling import SMOTE
from imblearn.pipeline import Pipeline as ImbPipeline
import xgboost as xgb
import pandas as pd

# Prepare features and target
X = df.drop(['Churn', 'customerID'], axis=1)
y = df['Churn']

# Train/test split (temporal: use earlier data for train)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# Pipeline with SMOTE + scaling + classifier
models = {
    'LogisticRegression': LogisticRegression(class_weight='balanced', max_iter=1000),
    'RandomForest': RandomForestClassifier(class_weight='balanced', n_estimators=200),
    'XGBoost': xgb.XGBClassifier(scale_pos_weight=len(y_train[y_train==0])/len(y_train[y_train==1])),
}

for name, model in models.items():
    pipeline = ImbPipeline([
        ('scaler', StandardScaler()),
        ('smote', SMOTE(random_state=42)),
        ('classifier', model),
    ])
    pipeline.fit(X_train, y_train)
    y_pred = pipeline.predict(X_test)
    y_proba = pipeline.predict_proba(X_test)[:, 1]

    print(f"\\n=== {name} ===")
    print(classification_report(y_test, y_pred))
    print(f"AUC-ROC: {roc_auc_score(y_test, y_proba):.4f}")`,
      output: `=== LogisticRegression ===
              precision    recall  f1-score   support
       0       0.89      0.83      0.86      1036
       1       0.59      0.69      0.64       373

AUC-ROC: 0.8421

=== RandomForest ===
              precision    recall  f1-score   support
       0       0.91      0.88      0.89      1036
       1       0.65      0.74      0.69       373

AUC-ROC: 0.8912

=== XGBoost ===
              precision    recall  f1-score   support
       0       0.92      0.90      0.91      1036
       1       0.68      0.75      0.71       373

AUC-ROC: 0.9034`,
      explanation: 'Three models compared with SMOTE and class imbalance handling. XGBoost with scale_pos_weight achieves the best AUC-ROC (0.9034) and highest F1 for the churn class. The recall of 0.75 means we catch 75% of churners — a business decision determines if this is sufficient.',
    },
    {
      level: 'advanced',
      code: `# Deployment: Cost-based threshold optimization and scoring API
from typing import List, Optional
from pydantic import BaseModel
import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException

app = FastAPI(title="Churn Prediction API")

# Cost matrix (dollars)
COST_MATRIX = {
    'tp_value': 500,    # Saved customer lifetime value
    'fp_cost': 20,      # Cost of unnecessary retention offer
    'fn_cost': 500,     # Lost customer lifetime value
}

def optimize_threshold(model, X_val, y_val):
    """Find threshold that maximizes expected profit."""
    probas = model.predict_proba(X_val)[:, 1]
    thresholds = np.linspace(0.1, 0.9, 81)
    best_profit = -np.inf
    best_threshold = 0.5

    for threshold in thresholds:
        preds = (probas >= threshold).astype(int)
        tp = ((preds == 1) & (y_val == 1)).sum()
        fp = ((preds == 1) & (y_val == 0)).sum()
        fn = ((preds == 0) & (y_val == 1)).sum()
        profit = (tp * COST_MATRIX['tp_value']
                  - fp * COST_MATRIX['fp_cost']
                  - fn * COST_MATRIX['fn_cost'])

        if profit > best_profit:
            best_profit = profit
            best_threshold = threshold

    return best_threshold, best_profit

class CustomerFeatures(BaseModel):
    tenure: int
    MonthlyCharges: float
    TotalCharges: float
    Contract: str
    PaymentMethod: str
    SupportTickets: int
    LoginFrequency: Optional[float] = None

class ChurnPrediction(BaseModel):
    churn_probability: float
    churn_risk_level: str
    threshold: float
    recommended_action: str

@app.post("/predict-churn", response_model=ChurnPrediction)
async def predict_churn(customer: CustomerFeatures):
    try:
        input_df = pd.DataFrame([customer.model_dump()])
        pipeline = joblib.load('models/churn_pipeline.pkl')
        threshold = joblib.load('models/optimal_threshold.pkl')

        proba = pipeline.predict_proba(input_df)[0, 1]

        if proba >= threshold:
            risk = "High"
            action = "Send retention offer (20% discount)"
        elif proba >= threshold * 0.7:
            risk = "Medium"
            action = "Schedule check-in call"
        else:
            risk = "Low"
            action = "No action needed"

        return ChurnPrediction(
            churn_probability=round(proba, 4),
            churn_risk_level=risk,
            threshold=threshold,
            recommended_action=action,
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))`,
      output: `$ curl -X POST http://localhost:8000/predict-churn \\
  -H "Content-Type: application/json" \\
  -d '{"tenure": 12, "MonthlyCharges": 89.99, "TotalCharges": 1079.88, "Contract": "Month-to-month", "PaymentMethod": "Electronic check", "SupportTickets": 3, "LoginFrequency": 0.3}'

{"churn_probability": 0.7843, "churn_risk_level": "High", "threshold": 0.62, "recommended_action": "Send retention offer (20% discount)"}`,
      explanation: 'Production-grade churn scoring API with cost-based threshold optimization. The model calculates churn probability and maps it to risk levels with specific retention actions. The threshold (0.62) was optimized to maximize expected profit using the business cost matrix, not default 0.5.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Telecom', description: 'Telcos use churn models to identify subscribers likely to switch carriers, offering targeted plan upgrades, device discounts, or loyalty rewards to high-risk customers.' },
      { industry: 'SaaS', description: 'Companies like Spotify and Netflix predict churn from engagement patterns (listening habits, login frequency), sending personalized recommendations and win-back offers.' },
      { industry: 'Banking', description: 'Banks predict account closure risk from transaction patterns, triggering relationship manager outreach, fee waivers, or product recommendations.' },
    ],
    caseStudy: {
      problem: 'A telecom company had a 35% annual churn rate, losing $120M in annual revenue. Retention campaigns were reactive (triggered after cancellation) and offered blanket discounts to all customers, wasting 60% of the retention budget.',
      solution: 'They built an XGBoost churn model trained on 2 years of customer data (calls, data usage, support tickets, billing). The model scored customers daily with a cost-optimized threshold. High-risk customers received personalized offers based on churn drivers (e.g., data users got more data, not discounts).',
      results: 'Churn rate dropped from 35% to 18% in 12 months. Retention spend efficiency improved 4x ($50 saved per retained customer vs $200 blanket offer). $45M in annual revenue retained.',
    },
    bestPractices: [
      'Define churn operationally before modeling — use a consistent, business-aligned definition',
      'Engineer time-based features (usage trends, not just snapshot values) to capture behavioral changes',
      'Use temporal train/test splits — never random split on time-series data',
      'Calibrate model probabilities for accurate risk ranking across customer segments',
      'Optimize threshold using the actual cost matrix from your business',
      'Monitor for concept drift — churn behavior changes with market conditions and pricing changes',
    ],
    tools: ['Pandas & NumPy', 'scikit-learn', 'imbalanced-learn (SMOTE)', 'XGBoost / LightGBM', 'SHAP', 'FastAPI', 'Docker', 'Airflow (batch scoring)'],
    jobRoles: ['Data Scientist', 'Machine Learning Engineer', 'Analytics Engineer', 'Growth/CRM Analyst'],
    furtherReading: [
      'imbalanced-learn Documentation: SMOTE',
      'XGBoost: Handling Imbalanced Data',
      'SHAP: Model Interpretability for Churn',
      'Cost-Sensitive Learning — Elkan (2001)',
    ],
  },
  quiz: [
    {
      id: 'p21-ch-1', type: 'mcq',
      question: 'Why is accuracy a misleading metric for churn prediction?',
      options: [
        'Accuracy is always lower on imbalanced datasets',
        'A model predicting "no churn" for all customers achieves high accuracy but is useless',
        'Accuracy cannot be computed for binary classification',
        'Accuracy does not account for false negatives',
      ],
      correctAnswer: 'A model predicting "no churn" for all customers achieves high accuracy but is useless',
      explanation: 'With a 10% churn rate, a "predict no churn always" model is 90% accurate but catches zero churners. Business value comes from identifying churners, not from overall accuracy.',
    },
    {
      id: 'p21-ch-2', type: 'code',
      question: 'What does SMOTE generate?',
      code: `# SMOTE creates synthetic samples by:
# 1. Finding k-nearest neighbors of a minority sample
# 2. Randomly selecting one neighbor
# 3. Interpolating between the sample and neighbor:
x_new = x_i + lambda_ * (x_zi - x_i)`,
      options: [
        'Copies of existing minority samples for oversampling',
        'Synthetic minority samples along the line connecting a sample to one of its neighbors',
        'Downsampled majority class samples with replacement',
        'New features derived from existing feature combinations',
      ],
      correctAnswer: 'Synthetic minority samples along the line connecting a sample to one of its neighbors',
      explanation: 'SMOTE picks a minority sample, finds a random neighbor from the same class, and creates a new sample at a random point on the line between them. This creates realistic but not duplicated minority samples.',
    },
    {
      id: 'p21-ch-3', type: 'truefalse',
      question: 'The optimal decision threshold for a churn model should always be 0.5.',
      correctAnswer: 'False',
      explanation: 'The optimal threshold depends on the business cost matrix. When false negatives are expensive (lost customers), the optimal threshold may be lower than 0.5 to catch more churners, even at the cost of more false positives.',
    },
    {
      id: 'p21-ch-4', type: 'fillblank',
      question: 'The metric that measures the proportion of actual churners correctly identified is called ___.',
      correctAnswer: 'Recall (or Sensitivity)',
      explanation: 'Recall = TP / (TP + FN). It answers: "Of all customers who actually churned, how many did we correctly flag?" This is critical for churn because missing a churner (FN) costs the customer lifetime value.',
    },
    {
      id: 'p21-ch-5', type: 'match',
      question: 'Match each business scenario with the optimal metric priority:',
      pairs: [
        { left: 'Expensive retention offer ($100+)', right: 'High Precision (avoid wasting budget on false positives)' },
        { left: 'High-value customer at risk ($10K CLV)', right: 'High Recall (cannot afford to miss this churner)' },
        { left: 'Limited retention team capacity', right: 'High Precision (only contact the surest churners)' },
        { left: 'Early-stage startup scaling fast', right: 'High Recall (retention > efficiency)' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'Business context determines metric priority. Expensive offers need precision to avoid waste; high-value customers need recall to avoid losing them. The threshold should always be set by the cost matrix.',
    },
  ],
}))

export {}
