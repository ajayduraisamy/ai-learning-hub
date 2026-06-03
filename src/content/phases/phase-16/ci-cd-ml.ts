import { registerContent } from '@/content/index'

registerContent('p16-ci-cd-ml', () => ({
  difficulty: 'Advanced',
  estimatedTime: '60 minutes',
  prerequisites: ['p16-kubernetes-ml'],
  tags: ['MLOps', 'Advanced', 'Topic'],
  objectives: [
    'Understand CI/CD differences for ML vs traditional software',
    'Build a GitHub Actions workflow for ML: lint, test, train, evaluate, deploy',
    'Implement GitLab CI template for ML pipelines',
    'Create model promotion strategies (staging to production)',
    'Implement canary deployments and rollback strategies',
  ],
  theory: `# CI/CD Pipelines for ML

## CI/CD for ML vs Traditional Software

Traditional CI/CD:
$$\text{Code} \\xrightarrow{\text{CI}} \text{Build} \\xrightarrow{\text{Test}} \\xrightarrow{\text{CD}} \text{Deploy}$$

ML CI/CD adds data and model concerns:
$$\text{Code + Data} \\xrightarrow{\text{CI}} \text{Validate Data} \\xrightarrow{\text{Train}} \\xrightarrow{\text{Evaluate}} \\xrightarrow{\text{CD}} \text{Deploy Model} \\xrightarrow{\text{Monitor}} \\xrightarrow{\text{Retrain}} \\xrightarrow{\text{CI}} ...$$

### Key Differences

| Aspect | Traditional CI/CD | ML CI/CD |
|--------|------------------|----------|
| Artifact | Binary/package | Model (pkl, pt, onnx) |
| Test focus | Unit/integration | Data quality + model metrics |
| Success criteria | Tests pass | Tests pass + metric thresholds |
| Rollback | Previous binary | Previous model + data version |
| Triggers | Code change | Code + data + retrain schedule |

## ML Pipeline Stages

### 1. Data Validation
Test data quality before training:
- Schema conformance (column names, types)
- Missing value rates below threshold
- Distribution similarity to reference dataset
- No data leaks (future timestamps)

### 2. Training
Train the model with the validated data:
- Reproducible environment (Docker image)
- Fixed random seed
- Experiment tracking (MLflow)
- Hyperparameter configuration logged

### 3. Evaluation
Evaluate against defined thresholds:

$$\text{pass} = \begin{cases}
\text{accuracy} \geq \theta_{\text{acc}} \\
\text{precision} \geq \theta_{\text{prec}} \\
\text{recall} \geq \theta_{\text{rec}} \\
\text{latency} \leq \theta_{\text{lat}}
\end{cases}$$

All metrics must meet thresholds. Comparison to previous model: $$\Delta_{\text{metric}} \geq -\epsilon$$ (regression check).

### 4. Deployment

$$\text{Staging} \\xrightarrow{\text{promote}} \text{Canary (10\%)} \\xrightarrow{\text{monitor}} \text{Production (100\%)}$$

## GitHub Actions for ML

\`\`\`yaml
name: ML Pipeline
on: [push, pull_request]
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
      - run: pip install -r requirements.txt
      - run: pytest tests/ -v

  train:
    needs: [validate]
    runs-on: [self-hosted, GPU]
    container:
      image: pytorch/pytorch:2.1.0-cuda12.1-runtime
    steps:
      - run: python train.py
      - uses: actions/upload-artifact@v3
        with:
          name: model
          path: models/model.pkl

  evaluate:
    needs: [train]
    steps:
      - run: python evaluate.py
      - name: Check Metrics
        run: python -c "
          import json
          m = json.load(open('metrics.json'))
          assert m['accuracy'] > 0.95"

  deploy:
    needs: [evaluate]
    if: github.ref == 'refs/heads/main'
    steps:
      - run: python deploy.py --env staging
\`\`\`

## Model Registry Promotion

A model registry (MLflow Model Registry, DVC) manages the lifecycle:

$$\text{None} \to \text{Staging} \\xrightarrow{\text{approved}} \text{Production} \\xrightarrow{\text{archived}} \text{Archived}$$

Promotion requires:
1. CI pipeline passes (all gates)
2. Manual approval for production promotion
3. Canary deployment passes
4. Monitoring confirms no regression

## Rollback Strategies

| Strategy | Description | Downtime |
|----------|-------------|----------|
| Revert Git + Redeploy | Revert code, rebuild, redeploy | Minutes |
| Blue/Green | Instant switch between environments | Seconds |
| Canary + Rollback | Gradual shift, revert if bad | Zero |
| Shadow | Test new model alongside production | Zero |`,
  understanding: {
    analogy: 'CI/CD for ML is like an automated factory assembly line with quality checks at every station. Raw materials (data) arrive and are inspected at station 1 (data validation). The assembly happens at station 2 (training). Quality assurance inspects the finished product at station 3 (evaluation). If it passes, it moves to packaging and shipping (deployment). If it fails, it is rejected and sent back. Unlike traditional factories that make the same product repeatedly, ML factories must also check that the raw materials (data) have not changed quality since last time.',
    steps: [
      { title: 'Code Push Triggers Pipeline', content: 'Developer pushes code to Git. The CI pipeline triggers automatically. For ML, this might also be triggered by new data arrival or a scheduled retrain cron job.' },
      { title: 'Run Data and Code Tests', content: 'Validate data quality (schema, distributions, missing values), run unit tests for feature engineering code, and check for code quality (linting, typing).' },
      { title: 'Train and Evaluate Model', content: 'Train the model in a reproducible environment (Docker container with pinned versions). Evaluate against predefined thresholds. Compare to previous model version (regression check).' },
      { title: 'Promote to Staging', content: 'If metrics pass, register the model in the model registry (Staging stage). Deploy to staging environment for integration testing. Requires manual approval for further promotion.' },
      { title: 'Promote to Production with Canary', content: 'Route a small percentage of traffic (5-10%) to the new model. Monitor metrics for a stabilization period. Gradually increase traffic. If metrics degrade, instantly rollback to the previous model.' },
    ],
    misconceptions: [
      { misconception: 'ML CI/CD is the same as software CI/CD with different artifacts', truth: 'ML CI/CD must validate data quality and model metrics, not just code correctness. A model can pass all code tests but fail due to data drift or poor generalization on new data.' },
      { misconception: 'You need a fully automated pipeline from the start', truth: 'Start with manual approval gates between stages. Automate only after the process is well-understood. Over-automation too early leads to unreliable deployments.' },
      { misconception: 'Once deployed, the CI/CD pipeline job is done', truth: 'ML CI/CD includes a monitoring loop. Production data drift triggers retraining, which triggers a new pipeline run. The pipeline is cyclic, not linear.' },
    ],
    comparisons: [
      { label: 'Artifact', methodA: 'Traditional: Compiled binary or package', methodB: 'ML: Serialized model + metrics + version info' },
      { label: 'Testing', methodA: 'Traditional: Unit + integration tests', methodB: 'ML: Above + data validation + metric thresholds' },
      { label: 'Deployment', methodA: 'Traditional: Replace binary, restart', methodB: 'ML: Canary/shadow deployment with monitoring' },
      { label: 'Rollback', methodA: 'Traditional: Revert to previous binary', methodB: 'ML: Previous model + previous data version' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `# GitHub Actions workflow for ML pipeline
# Save as .github/workflows/ml-pipeline.yml

github_actions = '''
name: ML Training Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
  schedule:
    - cron: "0 6 * * 1"  # Every Monday at 6 AM

env:
  MLFLOW_TRACKING_URI: \${{ secrets.MLFLOW_URI }}
  REGISTRY: ghcr.io/\${{ github.repository }}

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: "3.10"
      - name: Install dependencies
        run: |
          pip install --upgrade pip
          pip install -r requirements-dev.txt
      - name: Lint with flake8
        run: flake8 src/ tests/
      - name: Type check with mypy
        run: mypy src/
      - name: Run unit tests
        run: pytest tests/unit/ -v --cov=src

  data-validation:
    needs: lint-and-test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
      - name: Validate data
        run: python src/validate_data.py --config configs/data_config.yaml
      - name: Upload validation report
        uses: actions/upload-artifact@v3
        with:
          name: data-validation-report
          path: reports/data_validation.html

  train:
    needs: data-validation
    runs-on: [self-hosted, gpu]
    container:
      image: pytorch/pytorch:2.1.0-cuda12.1-cudnn8-runtime
    steps:
      - uses: actions/checkout@v3
      - name: Install dependencies
        run: pip install -r requirements.txt
      - name: Train model
        run: python src/train.py --config configs/train_config.yaml
      - name: Upload model artifact
        uses: actions/upload-artifact@v3
        with:
          name: trained-model
          path: models/
      - name: Upload metrics
        uses: actions/upload-artifact@v3
        with:
          name: metrics
          path: metrics/

  evaluate:
    needs: train
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
      - name: Download model
        uses: actions/download-artifact@v3
        with:
          name: trained-model
          path: models/
      - name: Download metrics
        uses: actions/download-artifact@v3
        with:
          name: metrics
          path: metrics/
      - name: Evaluate model
        run: python src/evaluate.py --metrics-dir metrics/
      - name: Check metric thresholds
        run: |
          python -c "
          import json, sys
          with open('metrics/eval_metrics.json') as f:
              m = json.load(f)
          assert m['accuracy'] > 0.95, f'Accuracy {m[\"accuracy\"]} < 0.95'
          assert m['f1'] > 0.92, f'F1 {m[\"f1\"]} < 0.92'
          assert m['latency_ms'] < 100, f'Latency {m[\"latency_ms\"]}ms > 100ms'
          print('All metric thresholds passed!')
          "
      - name: Upload evaluation report
        uses: actions/upload-artifact@v3
        with:
          name: evaluation-report
          path: reports/evaluation.html

  deploy-staging:
    needs: evaluate
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to staging
        run: |
          python src/deploy.py --env staging --model-path models/model.onnx
      - name: Run smoke tests
        run: |
          python tests/smoke/test_staging.py --endpoint https://staging-api.example.com

  promote:
    needs: deploy-staging
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production
    steps:
      - name: Promote to production
        run: |
          python src/promote.py --from staging --to production
'''

print("=== GitHub Actions ML Pipeline ===\n")
print("Pipeline stages: lint → validate → train → evaluate → deploy-staging → promote")
print("Model promotion requires manual approval for production environment.")`,
      output: `=== GitHub Actions ML Pipeline ===

Pipeline stages: lint → validate → train → evaluate → deploy-staging → promote
Model promotion requires manual approval for production environment.`,
      explanation: 'This GitHub Actions workflow defines a complete ML CI/CD pipeline: linting and testing, data validation, training on a GPU runner, evaluation with metric thresholds, staging deployment, and production promotion (with manual approval). The pipeline runs on every push, but promotion to production requires human sign-off.',
    },
    {
      level: 'intermediate',
      code: `# GitLab CI template for ML

gitlab_ci = '''
image: python:3.10-slim

variables:
  PIP_CACHE_DIR: "$CI_PROJECT_DIR/.cache/pip"
  MLFLOW_TRACKING_URI: "\${MLFLOW_URI}"
  DVC_REMOTE: s3://ml-bucket/dvc-store

cache:
  paths:
    - .cache/pip/
    - .dvc/cache/

stages:
  - validate
  - train
  - evaluate
  - package
  - deploy

.validate_data: &validate_data
  script:
    - pip install -r requirements.txt
    - dvc pull data/raw.dvc
    - python src/validate_data.py
  artifacts:
    reports:
      html: reports/data_validation.html

.train_model: &train_model
  script:
    - pip install -r requirements.txt
    - python src/train.py --experiment $CI_COMMIT_BRANCH
    - dvc repro train
  artifacts:
    paths:
      - models/
      - metrics/

.evaluate_model: &evaluate_model
  script:
    - pip install -r requirements.txt
    - python src/evaluate.py
    - |
      python -c "
      import json
      with open('metrics/eval.json') as f:
        m = json.load(f)
      assert m['accuracy'] > 0.95
      "
    - dvc push
  artifacts:
    paths:
      - metrics/

data-validation:
  stage: validate
  <<: *validate_data
  only:
    changes:
      - data/*.dvc
      - src/validate_data.py

training:
  stage: train
  <<: *train_model
  tags:
    - gpu
  only:
    - main
    - develop
    - /^release-.*$/

evaluation:
  stage: evaluate
  <<: *evaluate_model
  needs: [training]

model-registration:
  stage: package
  script:
    - python src/register_model.py
      --model-path models/model.pkl
      --metrics metrics/eval.json
      --stage $CI_ENVIRONMENT_NAME
  only:
    - main

deploy-canary:
  stage: deploy
  script:
    - python src/deploy.py
      --env canary
      --traffic-percent 10
  environment:
    name: canary
    url: https://canary-api.example.com
  only:
    - main
  when: manual

deploy-production:
  stage: deploy
  script:
    - python src/deploy.py
      --env production
      --traffic-percent 100
  environment:
    name: production
    url: https://api.example.com
  only:
    - main
  when: manual
  needs: [deploy-canary]
'''

print("=== GitLab CI ML Pipeline ===\n")
print("Stages: validate → train → evaluate → package → deploy")
print("GPU tag ensures training runs on GPU runners.")
print("Deployment stages are manual (human approval required).")`,
      output: `=== GitLab CI ML Pipeline ===

Stages: validate → train → evaluate → package → deploy
GPU tag ensures training runs on GPU runners.
Deployment stages are manual (human approval required).`,
      explanation: 'This GitLab CI template defines ML-specific pipeline stages using YAML anchors for reusability. Key features: data validation on DVC changes, GPU-tagged training runners, metric threshold assertion, automatic model registration with MLflow, and manual canary + production deployment stages.',
    },
    {
      level: 'advanced',
      code: `# Model promotion script for model registry

import json
import os
import requests
from typing import Optional

class ModelRegistry:
    """Manage model lifecycle through staging to production."""

    def __init__(self, registry_url: str, api_token: str):
        self.registry_url = registry_url
        self.headers = {"Authorization": f"Bearer {api_token}"}

    def register_model(self, name: str, version: str,
                       model_path: str, metrics: dict) -> str:
        """Register a new model version in the registry."""
        payload = {
            "name": name,
            "version": version,
            "metrics": metrics,
            "artifact_path": model_path,
            "git_commit": os.environ.get("CI_COMMIT_SHA", "unknown"),
        }
        resp = requests.post(
            f"{self.registry_url}/api/models",
            json=payload,
            headers=self.headers,
        )
        resp.raise_for_status()
        model_id = resp.json()["model_id"]
        print(f"Registered model {name} v{version} as {model_id}")
        return model_id

    def promote(self, model_id: str,
                from_stage: str = "staging",
                to_stage: str = "production") -> bool:
        """Promote a model from one stage to another."""
        payload = {
            "model_id": model_id,
            "from_stage": from_stage,
            "to_stage": to_stage,
        }
        resp = requests.post(
            f"{self.registry_url}/api/models/promote",
            json=payload,
            headers=self.headers,
        )
        if resp.status_code == 200:
            print(f"Promoted {model_id} from {from_stage} to {to_stage}")
            return True
        else:
            print(f"Promotion failed: {resp.json().get('error', 'unknown')}")
            return False

    def get_current_production(self, model_name: str) -> Optional[dict]:
        """Get the currently deployed production model."""
        resp = requests.get(
            f"{self.registry_url}/api/models/{model_name}/production",
            headers=self.headers,
        )
        if resp.status_code == 200:
            return resp.json()
        return None

    def compare_and_promote(self, model_name: str, new_model_id: str,
                            metrics: dict) -> bool:
        """Compare new model to current production and promote if better."""
        current = self.get_current_production(model_name)
        if not current:
            print("No current production model. Promoting directly.")
            return self.promote(new_model_id, "staging", "production")

        current_metrics = current.get("metrics", {})
        print(f"Current production metrics: {current_metrics}")
        print(f"New model metrics: {metrics}")

        # Regression check: new model must not degrade
        for metric in ["accuracy", "f1", "precision", "recall"]:
            if metric in current_metrics and metric in metrics:
                delta = metrics[metric] - current_metrics[metric]
                if delta < -0.01:
                    print(f"REGRESSION: {metric} dropped by {abs(delta):.3f}")
                    return False
                print(f"{metric}: {delta:+.3f}")

        return self.promote(new_model_id, "staging", "production")

# Usage
registry = ModelRegistry(
    registry_url="https://mlflow.example.com",
    api_token=os.environ.get("MLFLOW_TOKEN", ""),
)

# Simulate promotion
new_metrics = {
    "accuracy": 0.967,
    "f1": 0.953,
    "precision": 0.949,
    "recall": 0.958,
}

success = registry.compare_and_promote(
    model_name="fraud-detection",
    new_model_id="model_abc123",
    metrics=new_metrics,
)
print(f"\nPromotion {'successful' if success else 'failed - metrics regressed'}")`,
      output: `Current production metrics: {'accuracy': 0.958, 'f1': 0.942, 'precision': 0.938, 'recall': 0.946}
New model metrics: {'accuracy': 0.967, 'f1': 0.953, 'precision': 0.949, 'recall': 0.958}
accuracy: +0.009
f1: +0.011
precision: +0.011
recall: +0.012

Promotion successful`,
      explanation: 'This model promotion script implements a registry client that registers new models, compares them to the current production model (regression check), and promotes only if all metrics meet or exceed the current baseline. The regression check (delta > -0.01) prevents deploying models that degrade performance. This is the core of automated CI/CD for ML.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Ride Sharing', description: 'Uber\'s Michelangelo CI/CD pipeline automatically retrains models daily, validates against production metrics, and deploys via staged rollout. Each model has shadow, canary, and production stages with automated rollback on metric degradation.' },
      { industry: 'Streaming Media', description: 'Netflix uses Spinnaker for ML deployment pipelines. Models are A/B tested against the current production model for 24 hours before full rollout. Automated canary analysis determines promotion or rollback.' },
      { industry: 'E-commerce', description: 'Amazon\'s search ranking models are retrained and deployed through CI/CD pipelines multiple times per day. Each pipeline validates data freshness, model accuracy, and serving latency before deployment.' },
    ],
    caseStudy: {
      problem: 'An ML team deployed models manually by SSH-ing into servers, copying files, and restarting processes. Deployments took 2 hours, often broke something, and rollbacks required digging through backups. Only one person knew the deployment process.',
      solution: 'They implemented a fully automated CI/CD pipeline with GitHub Actions. Data validation ran first, then training on GPU runners, evaluation with metric thresholds, and finally deployment to staging. Manual approval gates protected production. Rollbacks were one-click via the model registry.',
      results: 'Deployment time dropped from 2 hours to 5 minutes. Rollbacks became instant (1 click). The team deployed 10x more frequently (daily vs weekly). The deployment knowledge was captured in code, not in one person\'s head.',
    },
    bestPractices: [
      'Validate data quality and freshness before training — do not train on bad data',
      'Use metric thresholds as hard gates: no model below threshold ever deploys',
      'Implement regression checks against the current production model',
      'Use manual approval gates for production promotion (not fully automatic)',
      'Deploy with canary traffic splits — never route 100% traffic to an untested model',
      'Monitor deployed models continuously — CI/CD does not end at deployment',
      'Version everything: code, data, model, environment, and metrics',
    ],
    tools: ['GitHub Actions', 'GitLab CI', 'Jenkins', 'CircleCI', 'Argo Workflows', 'MLflow Model Registry'],
    jobRoles: ['MLOps Engineer', 'DevOps Engineer', 'ML Platform Engineer', 'CI/CD Engineer'],
    furtherReading: [
      'Google\'s MLOps: Continuous Delivery and Automation',
      'MLflow Model Registry documentation',
      'GitHub Actions for ML workflows',
      'Canary Deployments for ML Models (Netflix Tech Blog)',
    ],
  },
  quiz: [
    {
      id: 'p16-cd-1', type: 'mcq',
      question: 'What is the key difference between traditional CI/CD and ML CI/CD pipelines?',
      options: [
        'ML CI/CD does not need testing stages',
        'ML CI/CD must validate data quality and model metrics in addition to code correctness',
        'Traditional CI/CD is always faster than ML CI/CD',
        'ML CI/CD cannot be automated',
      ],
      correctAnswer: 'ML CI/CD must validate data quality and model metrics in addition to code correctness',
      explanation: 'ML pipelines add data validation (schema, distributions, missing values) and model evaluation (accuracy, precision, latency thresholds) stages. A model can pass all code tests but fail due to data drift or poor performance on new data.',
    },
    {
      id: 'p16-cd-2', type: 'truefalse',
      question: 'Model promotion to production should always be fully automated with no human approval.',
      correctAnswer: 'False',
      explanation: 'Production promotion should have manual approval gates or at minimum a canary deployment with automated monitoring. Fully automatic promotion risks deploying a model that passes initial tests but fails in production due to distribution shift.',
    },
    {
      id: 'p16-cd-3', type: 'fillblank',
      question: 'A deployment strategy that routes a small percentage of traffic to a new model version is called a ___ deployment.',
      correctAnswer: 'canary',
      explanation: 'Canary deployments route a small percentage of traffic (5-10%) to the new model version while keeping most traffic on the current version. If metrics degrade, the canary is rolled back instantly with minimal user impact.',
    },
    {
      id: 'p16-cd-4', type: 'code',
      question: 'What does this CI/CD step accomplish?',
      code: `- name: Check metric thresholds
  run: |
    python -c "
    import json
    with open('metrics.json') as f:
      m = json.load(f)
    assert m['accuracy'] > 0.95
    "`,
      options: [
        'Trains the model to achieve 95% accuracy',
        'Fails the pipeline if accuracy is below 95%',
        'Logs the accuracy to MLflow',
        'Deploys the model only if accuracy is above 95%',
      ],
      correctAnswer: 'Fails the pipeline if accuracy is below 95%',
      explanation: 'The step reads metrics from a JSON file and asserts that accuracy > 0.95. If the model does not meet the threshold, the assertion raises an exception, causing the CI step (and the entire pipeline) to fail. This is a hard gate that prevents poor models from progressing.',
    },
    {
      id: 'p16-cd-5', type: 'match',
      question: 'Match each ML CI/CD concept with its description:',
      pairs: [
        { left: 'Data Validation', right: 'Checks schema, distributions, and missing values before training' },
        { left: 'Model Evaluation', right: 'Validates metric thresholds and regression against current production' },
        { left: 'Canary Deployment', right: 'Routes a small percentage of traffic to a new model version' },
        { left: 'Model Promotion', right: 'Moves a model through stages: staging, canary, production' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'Data validation ensures quality inputs. Model evaluation enforces performance standards. Canary deployment enables safe rollout. Model promotion manages the lifecycle from registration to production.',
    },
  ],
}))

export {}
