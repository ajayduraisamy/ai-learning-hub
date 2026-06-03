import { registerContent } from '@/content/index'

registerContent('p21-mlops-pipeline', () => ({
  difficulty: 'Advanced',
  estimatedTime: '120 minutes',
  prerequisites: ['p16-experiment-tracking', 'p16-data-versioning', 'p16-ci-cd-ml', 'p16-model-monitoring'],
  tags: ['End-to-End Projects', 'Advanced', 'Project'],
  objectives: [
    'Build a complete MLOps pipeline with CI/CD for ML',
    'Implement data and model versioning with DVC and MLflow',
    'Set up GitHub Actions for automated training and testing',
    'Containerize the pipeline with Docker and Kubernetes',
    'Deploy model monitoring with Evidently AI',
  ],
  theory: `# Full MLOps CI/CD Pipeline

## ML Pipeline Architecture

An MLOps pipeline automates the end-to-end ML lifecycle: data ingestion → preprocessing → training → evaluation → deployment → monitoring.

### Pipeline Stages

1. **Data Ingestion**: Download raw data from source, validate schema
2. **Data Preprocessing**: Clean, transform, and split data
3. **Feature Engineering**: Create features, store in feature store
4. **Model Training**: Train multiple models, log with MLflow
5. **Model Evaluation**: Compare models, select best based on metrics
6. **Model Registration**: Register best model in model registry
7. **Deployment**: Package and deploy to staging/production
8. **Monitoring**: Track data drift, model drift, and system metrics

## DVC Pipeline (dvc.yaml)

DVC (Data Version Control) tracks data and ML pipeline stages:

\\\`\\\`\\\`
stages:
  download:
    cmd: python src/download.py
    deps: [src/download.py]
    outs: [data/raw]
  preprocess:
    cmd: python src/preprocess.py
    deps: [src/preprocess.py, data/raw]
    outs: [data/processed]
  train:
    cmd: python src/train.py
    deps: [src/train.py, data/processed, params.yaml]
    outs: [models/model.pkl]
    metrics: [metrics/metrics.json]
  evaluate:
    cmd: python src/evaluate.py
    deps: [src/evaluate.py, models/model.pkl, data/processed]
    metrics: [metrics/eval.json]
\\\`\\\`\\\`

## MLflow Tracking

MLflow tracks experiments, parameters, metrics, and artifacts:

| Component | Purpose | Example |
|-----------|---------|---------|
| Tracking | Log params, metrics, artifacts | mlflow.log_param("lr", 0.01) |
| Model Registry | Version, stage, and deploy models | mlflow.register_model(...) |
| Projects | Package ML code for reproducibility | MLproject file |
| Models | Standard model format for deployment | MLflow model flavor |

## CI/CD with GitHub Actions

\\\`\\\`\\\`
name: ML Pipeline
on: [push, pull_request]

jobs:
  train:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
      - name: Install DVC
        run: pip install dvc dvc-s3
      - name: Pull data
        run: dvc pull
      - name: Run pipeline
        run: dvc repro
      - name: Register model
        run: python src/register_model.py
      - name: Build Docker
        run: docker build -t model-api .
\\\`\\\`\\\`

## Deployment Architecture

- **Staging**: Automated deploy on PR merge for testing
- **Production**: Manual approval gate, shadow deploy, then roll out
- **Container**: Docker + Kubernetes (EKS, GKE, AKS)
- **Serving**: FastAPI model server with horizontal auto-scaling

## Monitoring with Evidently AI

Monitor for:
1. **Data Drift**: Feature distribution changes (Population Stability Index, Jensen-Shannon Divergence)
2. **Model Drift**: Prediction distribution changes
3. **Performance Drift**: Accuracy degradation when ground truth arrives
4. **Target Drift**: Label distribution changes

## Infrastructure as Code (Terraform)

\\\`\\\`\\\`
resource "aws_s3_bucket" "mlflow_artifacts" {
  bucket = "mlflow-artifacts-prod"
}

resource "aws_ecs_cluster" "ml_cluster" {
  name = "ml-inference-cluster"
}
\\\`\\\`\\\``,

  understanding: {
    analogy: 'An MLOps pipeline is like an automated assembly line in a factory. Raw materials (data) come in on a conveyor belt. Each station (pipeline stage) performs a specific operation: cleaning (preprocessing), assembly (training), quality control (evaluation), packaging (deployment), and ongoing inspection (monitoring). DVC is the blueprint that specifies each station\'s operation. MLflow is the quality log that records every batch\'s specifications. GitHub Actions is the factory floor manager that starts the line when new materials arrive. Kubernetes is the factory layout that scales up when more production is needed.',
    steps: [
      { title: 'Set Up Data Versioning', content: 'Initialize DVC, configure remote storage (S3/GCS), and track raw data. Create dvc.yaml with pipeline stages (download, preprocess, train, evaluate). DVC caches intermediate results for fast iteration.' },
      { title: 'Configure Experiment Tracking', content: 'Set up MLflow tracking server (local or cloud). Instrument training code with mlflow.log_param, log_metric, log_artifact. Register best models in the Model Registry.' },
      { title: 'Build CI/CD Pipeline', content: 'Create GitHub Actions workflow that triggers on push/PR. Steps: checkout, install dependencies, pull data with DVC, reproduce pipeline (dvc repro), run tests, build Docker image, deploy to staging.' },
      { title: 'Containerize and Deploy', content: 'Package the model server (FastAPI) in a Docker container. Create Kubernetes deployment and service YAML. Set up horizontal pod autoscaling based on CPU/memory.' },
      { title: 'Set Up Monitoring', content: 'Integrate Evidently AI to monitor data drift, model drift, and prediction distributions. Set up alerts (PagerDuty, Slack) for significant drift. Create dashboards for visualization.' },
      { title: 'Infrastructure as Code', content: 'Define all infrastructure (buckets, clusters, databases) in Terraform. This enables reproducible environments, disaster recovery, and infrastructure versioning.' },
    ],
    misconceptions: [
      { misconception: 'MLOps is just DevOps for ML', truth: 'MLOps adds data versioning, experiment tracking, model registry, drift monitoring, and reproducibility concerns that don\'t exist in traditional DevOps. ML has unique challenges like non-deterministic training and model decay.' },
      { misconception: 'CI/CD for ML means running training on every code push', truth: 'Full training on every push is expensive and slow. Smart CI/CD uses conditional triggers: run lightweight pipeline (data validation, unit tests) on every push; run full training only when relevant files change (dvc.yaml, params.yaml, training code).' },
      { misconception: 'Monitoring is optional if the model is stable', truth: 'Models always degrade over time due to data drift and concept drift. Without monitoring, you don\'t know when your model\'s accuracy drops — potentially causing business losses for weeks before detection.' },
    ],
    comparisons: [
      { label: 'Data Versioning', methodA: 'DVC — Git-like, works with S3/GCS', methodB: 'LakeFS — Git-like for data lakes' },
      { label: 'Experiment Tracking', methodA: 'MLflow — Industry standard, open source', methodB: 'Weights & Biases — Cloud-first, richer UI' },
      { label: 'Model Serving', methodA: 'FastAPI + K8s — Flexible, custom', methodB: 'SageMaker / Vertex AI — Managed, less control' },
      { label: 'Monitoring', methodA: 'Evidently AI — Open source, Python-native', methodB: 'WhyLabs / Arize — Managed, ML-specific' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `# Setup: DVC pipeline stages
import yaml
import sys
from pathlib import Path

# dvc.yaml structure
pipeline_config = {
    "stages": {
        "download": {
            "cmd": "python src/download.py --config params.yaml",
            "deps": ["src/download.py", "params.yaml"],
            "outs": ["data/raw"],
        },
        "preprocess": {
            "cmd": "python src/preprocess.py --config params.yaml",
            "deps": ["src/preprocess.py", "params.yaml", "data/raw"],
            "outs": ["data/processed"],
        },
        "train": {
            "cmd": "python src/train.py --config params.yaml",
            "deps": ["src/train.py", "params.yaml", "data/processed"],
            "outs": ["models/model.pkl"],
            "metrics": ["metrics/train_metrics.json"],
            "plots": ["plots/confusion_matrix.png"],
        },
        "evaluate": {
            "cmd": "python src/evaluate.py --config params.yaml",
            "deps": ["src/evaluate.py", "params.yaml", "models/model.pkl"],
            "metrics": ["metrics/eval_metrics.json"],
        },
    }
}

# Write dvc.yaml
with open("dvc.yaml", "w") as f:
    yaml.dump(pipeline_config, f, default_flow_style=False)

print("dvc.yaml created with 4 pipeline stages")

# params.yaml
params = {
    "data": {"url": "s3://ml-bucket/dataset.csv", "test_size": 0.2},
    "preprocess": {"scale": "standard", "encode": "label"},
    "train": {"model": "xgboost", "n_estimators": 100, "max_depth": 6},
}
with open("params.yaml", "w") as f:
    yaml.dump(params, f, default_flow_style=False)

print("params.yaml created")
print(f"\\nRun: dvc repro  # To execute the full pipeline")`,
      output: `dvc.yaml created with 4 pipeline stages
params.yaml created

Run: dvc repro  # To execute the full pipeline`,
      explanation: 'DVC pipeline definition with four stages: download, preprocess, train, evaluate. Each stage specifies its command, dependencies, and outputs. DVC caches outputs and only re-runs stages when dependencies change. params.yaml centralizes configuration for reproducibility.',
    },
    {
      level: 'intermediate',
      code: `# Core logic: MLflow tracking during training
import mlflow
import mlflow.sklearn
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
import yaml

# Load config
with open("params.yaml") as f:
    config = yaml.safe_load(f)

# Set up MLflow experiment
mlflow.set_tracking_uri("http://mlflow-server:5000")
mlflow.set_experiment("customer_churn")

def train_pipeline():
    with mlflow.start_run() as run:
        run_id = run.info.run_id
        print(f"MLflow Run ID: {run_id}")

        # Log parameters
        mlflow.log_params(config["train"])
        mlflow.log_param("data_source", config["data"]["url"])

        # Load and split data
        df = pd.read_csv("data/processed/train_data.csv")
        X = df.drop("target", axis=1)
        y = df["target"]
        X_train, X_val, y_train, y_val = train_test_split(
            X, y, test_size=config["data"]["test_size"], random_state=42
        )

        # Train model
        model = RandomForestClassifier(
            n_estimators=config["train"]["n_estimators"],
            max_depth=config["train"]["max_depth"],
            random_state=42,
        )
        model.fit(X_train, y_train)

        # Evaluate
        y_pred = model.predict(X_val)
        metrics = {
            "accuracy": accuracy_score(y_val, y_pred),
            "precision": precision_score(y_val, y_pred),
            "recall": recall_score(y_val, y_pred),
            "f1": f1_score(y_val, y_pred),
        }

        # Log metrics
        mlflow.log_metrics(metrics)
        print(f"Metrics: {metrics}")

        # Log model
        mlflow.sklearn.log_model(
            model, "model",
            registered_model_name="churn_classifier"
        )

        # Log feature importance
        importance = pd.DataFrame({
            "feature": X.columns,
            "importance": model.feature_importances_,
        }).sort_values("importance", ascending=False)
        importance.to_csv("metrics/feature_importance.csv", index=False)
        mlflow.log_artifact("metrics/feature_importance.csv")

        return run_id

if __name__ == "__main__":
    train_pipeline()`,
      output: `MLflow Run ID: a1b2c3d4e5f6
Metrics: {'accuracy': 0.9123, 'precision': 0.8765, 'recall': 0.8345, 'f1': 0.8550}

View run at: http://mlflow-server:5000/#/experiments/1/runs/a1b2c3d4e5f6`,
      explanation: 'MLflow-tracked training pipeline that logs all parameters, metrics, and artifacts. The model is registered in the MLflow Model Registry with versioning. The experiment can be reproduced with identical parameters by restoring from the tracking server.',
    },
    {
      level: 'advanced',
      code: `# Deployment: GitHub Actions CI/CD + Monitoring
# .github/workflows/ml-pipeline.yml
name: MLOps Pipeline

on:
  push:
    branches: [main]
    paths:
      - 'src/**'
      - 'params.yaml'
      - 'dvc.yaml'
  pull_request:
    branches: [main]

env:
  MLFLOW_TRACKING_URI: \${{ secrets.MLFLOW_URI }}
  DVC_REMOTE: s3://ml-bucket/dvc-store

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with: { python-version: "3.10" }
      - name: Install dependencies
        run: pip install -r requirements.txt
      - name: Run tests
        run: pytest tests/ -v --junitxml=report.xml
      - name: Validate data schema
        run: python src/validate_schema.py

  train:
    needs: validate
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up DVC
        run: |
          pip install dvc dvc-s3
          dvc remote default $DVC_REMOTE
      - name: Pull data
        run: dvc pull
      - name: Reproduce pipeline
        run: dvc repro
      - name: Register best model
        run: python src/register_best.py

  deploy:
    needs: train
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v1
        with:
          role-to-assume: \${{ secrets.AWS_ROLE }}
      - name: Build and push Docker
        run: |
          docker build -t model-api:\${{ github.sha }} .
          docker push \${{ vars.ECR_REPO }}:\${{ github.sha }}
      - name: Deploy to EKS
        run: |
          kubectl set image deployment/model-api \\
            model-api=\${{ vars.ECR_REPO }}:\${{ github.sha }}

  monitor:
    needs: deploy
    runs-on: ubuntu-latest
    steps:
      - name: Set up Evidently monitoring
        run: |
          python src/monitoring/setup_drift_detection.py
          python src/monitoring/deploy_dashboard.py`,
      output: `# GitHub Actions workflow execution:
✓ validate (8s) — Tests passed, schema valid
✓ train (3m 42s) — Pipeline reproduced, model registered as v42
✓ deploy (1m 15s) — Docker image pushed, EKS deployment updated
✓ monitor (12s) — Evidently monitors configured and deployed

Dashboard: http://monitoring.internal/dashboard
Model Registry: http://mlflow-server:5000/#/models/churn_classifier`,
      explanation: 'Complete GitHub Actions CI/CD workflow with four jobs: validate (tests + schema checks), train (DVC pipeline + MLflow tracking + model registration), deploy (Docker build/push + EKS rolling update), and monitor (Evidently drift detection setup). The workflow triggers only on changes to source code or configuration.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Fintech', description: 'Financial institutions use MLOps pipelines for fraud detection models that must be updated daily with new transaction data, validated for fairness, and deployed with zero downtime across multiple regions.' },
      { industry: 'E-commerce', description: 'Recommendation systems require continuous retraining on user behavior data. MLOps pipelines automate A/B testing between model versions, monitor for drift during promotions/seasonal shifts, and auto-rollback on performance degradation.' },
      { industry: 'Healthcare', description: 'Medical ML models need rigorous validation, audit trails, and compliance (HIPAA). MLOps pipelines enforce data lineage, model explainability checks, and approval gates before production deployment.' },
    ],
    caseStudy: {
      problem: 'A fintech company\'s fraud detection model silently degraded over 3 months, with false positive rate increasing from 2% to 15%. The data science team didn\'t notice because there was no monitoring. Manual deployment took 2 days per release, so fixes couldn\'t be rolled out quickly.',
      solution: 'They implemented a full MLOps pipeline: DVC for data versioning, MLflow for experiment tracking, GitHub Actions for CI/CD (automated retraining on new transaction data), Docker + EKS for deployment, and Evidently AI for real-time drift monitoring. Alerts fired on Slack when the false positive rate crossed 3%.',
      results: 'Model retraining went from 2 days to 15 minutes (fully automated). False positive rate stayed below 3% with automatic rollback if exceeded. The pipeline saved 40 engineering hours per week previously spent on manual deployment. Fraud detection rate improved 23% with fresher models.',
    },
    bestPractices: [
      'Use DVC to version data and pipelines — never store large data in Git directly',
      'Instrument all training code with MLflow tracking from day one, even in development',
      'Set up CI/CD early — automating the pipeline pays for itself within weeks',
      'Implement gradual rollout (shadow → canary → production) for model deployments',
      'Monitor both data drift and model performance — they catch different types of degradation',
      'Define infrastructure as code (Terraform) for reproducible, auditable environments',
    ],
    tools: ['DVC', 'MLflow', 'GitHub Actions / GitLab CI', 'Docker', 'Kubernetes (EKS/GKE/AKS)', 'Evidently AI', 'Terraform', 'AWS / GCP / Azure'],
    jobRoles: ['MLOps Engineer', 'Data Engineer', 'Infrastructure Engineer', 'ML Platform Engineer'],
    furtherReading: [
      'DVC Documentation: Pipelines',
      'MLflow Documentation: Model Registry',
      'GitHub Actions for ML: CI/CD Best Practices',
      'Evidently AI: Open-Source ML Monitoring',
      'Kubernetes in Production: ML Serving Patterns',
    ],
  },
  quiz: [
    {
      id: 'p21-mlops-1', type: 'mcq',
      question: 'What is the primary purpose of DVC in an MLOps pipeline?',
      options: [
        'To deploy models to production',
        'To version control data, models, and ML pipeline stages',
        'To monitor model performance in production',
        'To track hyperparameter tuning experiments',
      ],
      correctAnswer: 'To version control data, models, and ML pipeline stages',
      explanation: 'DVC (Data Version Control) versions datasets, model files, and pipeline stages. It stores data in remote storage (S3/GCS) while keeping lightweight pointers in Git, enabling reproducible ML pipelines with full data lineage.',
    },
    {
      id: 'p21-mlops-2', type: 'code',
      question: 'What does the MLflow Model Registry track?',
      code: `# MLflow Model Registry
mlflow.sklearn.log_model(
    model, "model",
    registered_model_name="churn_classifier"
)`,
      options: [
        'Only the model code repository',
        'Model versions, stages (Staging/Production/Archived), and metadata',
        'Training data versions',
        'Deployment infrastructure configuration',
      ],
      correctAnswer: 'Model versions, stages (Staging/Production/Archived), and metadata',
      explanation: 'The Model Registry tracks model versions with their parameters, metrics, and artifacts. Models can be promoted through stages (None → Staging → Production → Archived), enabling controlled deployment and rollback.',
    },
    {
      id: 'p21-mlops-3', type: 'truefalse',
      question: 'In MLOps, the CI/CD pipeline should run the full model training pipeline on every code push.',
      correctAnswer: 'False',
      explanation: 'Full training on every push is expensive. Best practice: run lightweight checks (linting, tests, data validation) on every push, and trigger full training only when relevant files change (dvc.yaml, params.yaml, training code, or data source).',
    },
    {
      id: 'p21-mlops-4', type: 'fillblank',
      question: 'The ML monitoring concept where the relationship between features and target variable changes over time is called ___.',
      correctAnswer: 'concept drift',
      explanation: 'Concept drift occurs when the statistical relationship between input features and the target variable changes. The data distribution may remain the same, but the mapping function f(X) → y has changed. This requires model retraining even if data hasn\'t drifted.',
    },
    {
      id: 'p21-mlops-5', type: 'match',
      question: 'Match each MLOps component with its primary responsibility:',
      pairs: [
        { left: 'DVC', right: 'Data and pipeline versioning with Git-like semantics' },
        { left: 'MLflow', right: 'Experiment tracking and model registry' },
        { left: 'GitHub Actions', right: 'CI/CD automation for training, testing, and deployment' },
        { left: 'Evidently AI', right: 'Data drift, model drift, and performance monitoring' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'Each tool serves a distinct role: DVC manages data and pipeline versions, MLflow tracks experiments and models, GitHub Actions automates the CI/CD workflow, and Evidently AI monitors production performance.',
    },
  ],
}))

export {}
