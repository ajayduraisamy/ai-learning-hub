import { registerContent } from '@/content/index'

registerContent('p21-house-price-prediction', () => ({
  difficulty: 'Advanced',
  estimatedTime: '120 minutes',
  prerequisites: ['p6-linear-regression', 'p6-random-forest', 'p6-xgboost'],
  tags: ['End-to-End Projects', 'Advanced', 'Project'],
  objectives: [
    'Frame a regression problem from a business perspective',
    'Build an end-to-end pipeline from raw data to deployed API',
    'Engineer features from structured tabular data',
    'Compare and ensemble multiple regression models',
    'Deploy a production-ready prediction API with FastAPI',
  ],
  theory: `# House Price Prediction Pipeline

## Business Problem Framing

Predicting house prices is a classic supervised regression problem. A real estate company wants to estimate the sale price of a property given features like lot size, number of bedrooms, year built, location, and quality indicators.

### Problem Statement

Given 79 explanatory variables describing aspects of residential homes in Ames, Iowa, predict the final sale price of each home.

**Business Value**: Accurate price prediction enables:
- Sellers to set competitive asking prices
- Buyers to identify undervalued properties
- Lenders to assess collateral value
- Investors to evaluate ROI

## Data Acquisition & EDA

The Ames Housing dataset (Kaggle) contains 1,460 training examples with 79 features:

| Feature Type | Examples | Count |
|-------------|----------|-------|
| Numerical | Lot Area, Year Built, Total Bsmt SF | 38 |
| Categorical | MS Zoning, Neighborhood, Kitchen Qual | 43 |
| Ordinal | Overall Qual, Overall Cond | 3 |

### Key EDA Findings

1. **Target Distribution**: SalePrice is right-skewed — log transformation helps
2. **Strongest Correlations**: OverallQual (r=0.79), GrLivArea (r=0.71)
3. **Missing Data**: LotFrontage, Garage variables, and Masonry have significant nulls
4. **Outliers**: A few properties with extremely high prices relative to features

## Feature Engineering Pipeline

### Numerical Features
- Log transform skewed features (SalePrice, Lot Area)
- Combine related features (total square footage = 1stFlr + 2ndFlr + TotalBsmt)
- Create interaction features (OverallQual x GrLivArea)
- Binning for year-built decades

### Categorical Features
- Ordinal encoding for ordered categories (Ex, Gd, TA, Fa, Po)
- One-hot encoding for nominal categories
- Frequency encoding for high-cardinality features (Neighborhood)

## Model Architecture

### Baseline
- **Linear Regression**: Interpretable, assumes linearity
- **Ridge/Lasso**: Regularized linear models to prevent overfitting

### Tree-Based
- **Random Forest**: Ensemble of decision trees, captures non-linear patterns
- **XGBoost**: Gradient-boosted trees with regularization
- **LightGBM**: Leaf-wise tree growth for efficiency on large data

### Ensemble
- **Stacking**: Meta-model (Ridge) trained on out-of-fold predictions
- **Weighted Average**: Blend top models by validation performance

## Hyperparameter Tuning

Using Optuna with 100 trials and 5-fold cross-validation:

$$\\text{Objective} = \\min_{\\theta} \\text{RMSE}_{\\text{CV}}(\\theta)$$

Key hyperparameters tuned:
- **XGBoost**: learning_rate, max_depth, subsample, colsample_bytree, reg_alpha, reg_lambda
- **Random Forest**: n_estimators, max_depth, min_samples_split, min_samples_leaf

## Deployment Architecture

The final model is deployed as a FastAPI endpoint:
- **POST /predict**: Accepts JSON with feature values, returns predicted price
- **Preprocessing**: Same pipeline used during training (applied via sklearn Pipeline)
- **Monitoring**: Prediction distribution tracked with Evidently AI
- **Container**: Docker image deployed to AWS ECS or GCP Cloud Run`,

  understanding: {
    analogy: 'Building a house price prediction pipeline is like appraising a home. An appraiser walks through the property, noting features (bedrooms, square footage, condition), compares with recent sales of similar homes, and arrives at a valuation. Similarly, our model ingests features, compares patterns learned from training data, and outputs a predicted price. The ensemble method is like getting opinions from multiple expert appraisers and combining their estimates.',
    steps: [
      { title: 'Data Ingestion', content: 'Load the CSV files, merge training and test sets for consistent preprocessing. Store raw data in a data/raw directory with version control (DVC).' },
      { title: 'Exploratory Analysis', content: 'Analyze distributions, correlations, missing values, and outliers. Generate pairplots and correlation heatmaps. Document findings to guide feature engineering decisions.' },
      { title: 'Feature Engineering', content: 'Apply transformations (log, scaling), create interaction and aggregate features, encode categoricals, and handle missing values. Wrap everything in sklearn Pipelines and ColumnTransformers.' },
      { title: 'Model Training & Tuning', content: 'Train multiple model families with cross-validation. Use Optuna for hyperparameter optimization. Log all experiments with MLflow.' },
      { title: 'Ensemble & Evaluation', content: 'Combine models via stacking or weighted averaging. Evaluate on holdout set using RMSE, MAE, and R-squared. Analyze residuals for systematic errors.' },
      { title: 'Deployment', content: 'Package the final pipeline in a FastAPI app. Containerize with Docker. Deploy to cloud with monitoring and automated retraining triggers.' },
    ],
    misconceptions: [
      { misconception: 'More features always improve model accuracy', truth: 'Irrelevant or redundant features add noise and increase overfitting risk. Feature selection and regularization are crucial even with tree-based models.' },
      { misconception: 'RMSE alone tells the whole story', truth: 'RMSE is sensitive to outliers. Always check MAE, R-squared, and residual plots. A model with good RMSE might systematically overprice cheap homes.' },
      { misconception: 'XGBoost always beats linear models', truth: 'On clean, well-structured data with strong linear signals, regularized linear models can match or outperform XGBoost and are far more interpretable.' },
    ],
    comparisons: [
      { label: 'Interpretability', methodA: 'Linear Regression — High (coefficient weights)', methodB: 'XGBoost — Low (SHAP needed)' },
      { label: 'Training Speed', methodA: 'Linear — Seconds', methodB: 'XGBoost — Minutes' },
      { label: 'Handling Non-linearity', methodA: 'Linear — Needs feature engineering', methodB: 'XGBoost — Inherently captures interactions' },
      { label: 'Overfitting Risk', methodA: 'Ridge/Lasso — Controlled via alpha', methodB: 'XGBoost — Controlled via max_depth, subsample' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `# Setup: Data loading and initial EDA
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

# Load the dataset
train = pd.read_csv('data/train.csv')
print(f"Train shape: {train.shape}")
print(f"Columns: {list(train.columns)}")

# Basic data info
print(f"\\nMissing values:\\n{train.isnull().sum().sort_values(ascending=False).head(10)}")

# Target variable analysis
plt.figure(figsize=(12, 5))
plt.subplot(1, 2, 1)
sns.histplot(train['SalePrice'], kde=True)
plt.title('SalePrice Distribution')

plt.subplot(1, 2, 2)
sns.histplot(np.log1p(train['SalePrice']), kde=True)
plt.title('Log-Transformed SalePrice')
plt.tight_layout()
plt.show()

# Correlation with target
numeric_cols = train.select_dtypes(include=[np.number]).columns
correlations = train[numeric_cols].corr()['SalePrice'].sort_values()
print(f"\\nTop 5 positive correlations:\\n{correlations.tail(5)}")
print(f"\\nTop 5 negative correlations:\\n{correlations.head(5)}")`,
      output: `Train shape: (1460, 81)
Columns: ['Id', 'MSSubClass', 'MSZoning', ..., 'SalePrice']

Missing values:
PoolQC          1453
MiscFeature     1406
Alley           1369
Fence           1179
FireplaceQu      690
                ... 

SalePrice distribution is right-skewed.
Log transformation normalizes the distribution.

Top 5 positive correlations:
OverallQual     0.790982
GrLivArea       0.708624
GarageCars      0.640409
GarageArea      0.623431
TotalBsmtSF     0.613581`,
      explanation: 'Initial data loading and EDA reveals the target is right-skewed (log transform helps), key missing values, and strong positive correlations with OverallQual and GrLivArea. This guides feature engineering decisions.',
    },
    {
      level: 'intermediate',
      code: `# Core pipeline: Preprocessing, training, and tuning
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler, OrdinalEncoder
from sklearn.model_selection import cross_val_score, KFold
from sklearn.linear_model import Ridge
from sklearn.ensemble import RandomForestRegressor
import xgboost as xgb
import numpy as np
import pandas as pd

# Preprocessing pipelines
numeric_features = ['LotArea', 'GrLivArea', 'TotalBsmtSF', 'GarageArea', 'YearBuilt']
categorical_features = ['MSZoning', 'Neighborhood', 'KitchenQual', 'ExterQual']
ordinal_features = ['OverallQual', 'OverallCond']

numeric_transformer = Pipeline([
    ('scaler', StandardScaler()),
])

categorical_transformer = Pipeline([
    ('ordinal', OrdinalEncoder(handle_unknown='use_encoded_value', unknown_value=-1)),
])

preprocessor = ColumnTransformer([
    ('num', numeric_transformer, numeric_features),
    ('cat', categorical_transformer, categorical_features),
])

# Model definitions
models = {
    'Ridge': Ridge(alpha=1.0),
    'RandomForest': RandomForestRegressor(n_estimators=200, max_depth=12, random_state=42),
    'XGBoost': xgb.XGBRegressor(n_estimators=500, learning_rate=0.05, max_depth=6, random_state=42),
}

# Cross-validation evaluation
kfold = KFold(n_splits=5, shuffle=True, random_state=42)
for name, model in models.items():
    pipeline = Pipeline([
        ('preprocessor', preprocessor),
        ('regressor', model),
    ])
    scores = cross_val_score(
        pipeline, X_train, y_log, cv=kfold,
        scoring='neg_root_mean_squared_error'
    )
    rmse_scores = -scores
    print(f"{name}: RMSE = {rmse_scores.mean():.4f} (+/- {rmse_scores.std():.4f})")`,
      output: `Ridge: RMSE = 0.1523 (+/- 0.0124)
RandomForest: RMSE = 0.1389 (+/- 0.0157)
XGBoost: RMSE = 0.1241 (+/- 0.0102)`,
      explanation: 'A complete preprocessing pipeline with ColumnTransformer, comparing three model families. XGBoost performs best with the default preprocessing. Note the log-transformed target reduces RMSE magnitude. The Pipeline object ensures consistent preprocessing between training and inference.',
    },
    {
      level: 'advanced',
      code: `# Deployment: FastAPI prediction endpoint with full pipeline
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import numpy as np
import pandas as pd
from typing import Optional, Dict, Any

app = FastAPI(title="House Price Prediction API")

# Load the full pipeline (preprocessor + model)
pipeline: Pipeline = joblib.load('models/final_pipeline.pkl')

class HouseFeatures(BaseModel):
    LotArea: float
    GrLivArea: float
    TotalBsmtSF: float
    GarageArea: float
    YearBuilt: int
    MSZoning: str
    Neighborhood: str
    KitchenQual: str
    ExterQual: str
    OverallQual: int
    OverallCond: int

class PredictionResponse(BaseModel):
    predicted_price: float
    predicted_price_log: float
    confidence_interval: Optional[Dict[str, float]] = None
    model_version: str

@app.on_event("startup")
async def load_model():
    global pipeline
    pipeline = joblib.load('models/final_pipeline.pkl')

@app.post("/predict", response_model=PredictionResponse)
async def predict(features: HouseFeatures):
    try:
        input_df = pd.DataFrame([features.model_dump()])
        log_pred = pipeline.predict(input_df)[0]
        price = np.expm1(log_pred)

        return PredictionResponse(
            predicted_price=round(price, 2),
            predicted_price_log=round(log_pred, 4),
            model_version="ensemble_v2.1"
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/health")
async def health():
    return {"status": "healthy", "model_loaded": pipeline is not None}

# Run with: uvicorn app:app --host 0.0.0.0 --port 8000
# Test: curl -X POST http://localhost:8000/predict -H "Content-Type: application/json" -d @sample.json`,
      output: `$ curl -X POST http://localhost:8000/predict \\
  -H "Content-Type: application/json" \\
  -d '{"LotArea": 8450, "GrLivArea": 1710, "TotalBsmtSF": 856, "GarageArea": 480, "YearBuilt": 2003, "MSZoning": "RL", "Neighborhood": "CollgCr", "KitchenQual": "Gd", "ExterQual": "Gd", "OverallQual": 7, "OverallCond": 5}'

{"predicted_price": 208500.25, "predicted_price_log": 12.2471, "model_version": "ensemble_v2.1"}`,
      explanation: 'Production-grade FastAPI deployment with Pydantic validation, model loading on startup, health check endpoint, and prediction endpoint. The pipeline object ensures preprocessing is identical to training. Confidence intervals and model versioning support A/B testing and monitoring.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Real Estate', description: 'Zillow uses machine learning models (Zestimate) to estimate home values for millions of properties, updated daily with market data, tax assessments, and user-submitted information.' },
      { industry: 'Insurance', description: 'Property insurance companies use pricing models to estimate replacement costs, assess risk, and determine premiums based on property features and location data.' },
      { industry: 'Finance', description: 'Mortgage lenders use automated valuation models (AVM) as a low-cost alternative to full appraisals, enabling faster lending decisions and portfolio risk assessment.' },
    ],
    caseStudy: {
      problem: 'A regional real estate brokerage relied on manual appraisals taking 3-5 days per property, costing $500+ each. Agents needed instant price estimates during client meetings to provide competitive market analysis on the spot.',
      solution: 'They built an XGBoost-based pipeline using the company\'s 15-year transaction history (120K sales). Features included property characteristics, neighborhood trends, proximity to amenities, and time-based market indicators. The model was deployed as a FastAPI microservice integrated into their CRM.',
      results: 'Instant estimates in under 200ms with 92% accuracy within 10% of final sale price. Cost per estimate dropped from $500 to near zero. Agents closed 23% more listings with data-backed pricing discussions.',
    },
    bestPractices: [
      'Log-transform skewed targets to normalize error distribution across price ranges',
      'Use sklearn Pipeline and ColumnTransformer for consistent preprocessing across train and inference',
      'Track all experiments with MLflow — log parameters, metrics, and model artifacts',
      'Ensemble diverse model families (linear + tree-based) for robustness',
      'Validate temporal stability — ensure model works across different market conditions',
      'Implement prediction monitoring to detect data drift and model decay',
    ],
    tools: ['Pandas & NumPy', 'scikit-learn', 'XGBoost / LightGBM', 'Optuna', 'MLflow', 'FastAPI', 'Docker', 'AWS Sagemaker / GCP Vertex AI'],
    jobRoles: ['Machine Learning Engineer', 'Data Scientist', 'MLOps Engineer', 'Data Engineer'],
    furtherReading: [
      'Kaggle: House Prices Advanced Regression Techniques',
      'scikit-learn User Guide: Pipelines and ColumnTransformer',
      'FastAPI Documentation: Deployment',
      'Feature Engineering for Machine Learning — Alice Zheng',
    ],
  },
  quiz: [
    {
      id: 'p21-hp-1', type: 'mcq',
      question: 'Why is SalePrice log-transformed in house price prediction pipelines?',
      options: [
        'To reduce the number of features needed',
        'To normalize the right-skewed distribution and stabilize error variance',
        'To convert categorical targets to numerical values',
        'To speed up gradient descent convergence',
      ],
      correctAnswer: 'To normalize the right-skewed distribution and stabilize error variance',
      explanation: 'SalePrice is typically right-skewed with a long tail of expensive homes. Log transformation makes the distribution approximately normal, which improves model performance and ensures prediction errors are proportional rather than absolute.',
    },
    {
      id: 'p21-hp-2', type: 'truefalse',
      question: 'Adding more features always improves the predictive performance of a house price model.',
      correctAnswer: 'False',
      explanation: 'Irrelevant or redundant features add noise, increase dimensionality, and raise overfitting risk. Feature selection and regularization are essential even with tree-based models that handle many features.',
    },
    {
      id: 'p21-hp-3', type: 'code',
      question: 'What will the following code output?',
      code: `from sklearn.metrics import mean_squared_error
import numpy as np
y_true = np.array([3.0, 5.0, 2.5, 8.0])
y_pred = np.array([2.8, 5.2, 2.6, 7.2])
rmse = np.sqrt(mean_squared_error(y_true, y_pred))
print(f"{rmse:.4f}")`,
      options: [
        '0.4272',
        '0.4899',
        '0.5657',
        '0.6403',
      ],
      correctAnswer: '0.4272',
      explanation: 'MSE = mean((3-2.8)² + (5-5.2)² + (2.5-2.6)² + (8-7.2)²) = mean(0.04 + 0.04 + 0.01 + 0.64) = 0.1825. RMSE = sqrt(0.1825) = 0.4272.',
    },
    {
      id: 'p21-hp-4', type: 'fillblank',
      question: 'The sklearn component that applies different transformations to different columns in a single pipeline is called ___Transforms.',
      correctAnswer: 'Column',
      explanation: 'ColumnTransformer allows applying different preprocessing pipelines to different columns (e.g., StandardScaler for numerics, OneHotEncoder for categoricals) in a single, composable object.',
    },
    {
      id: 'p21-hp-5', type: 'match',
      question: 'Match each model evaluation metric with its characteristic:',
      pairs: [
        { left: 'RMSE', right: 'Penalizes large errors more; same units as target' },
        { left: 'MAE', right: 'Average absolute error; robust to outliers' },
        { left: 'R-squared', right: 'Proportion of variance explained by the model' },
        { left: 'MAPE', right: 'Percentage error; interpretable across price ranges' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'RMSE squares errors before averaging (penalizing outliers), MAE uses absolute values (more robust), R-squared measures fit quality, and MAPE gives percentage-based error for cross-price-range comparison.',
    },
  ],
}))

export {}
