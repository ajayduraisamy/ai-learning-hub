import { registerContent } from '@/content/index'

registerContent('p16-experiment-tracking', () => ({
  difficulty: 'Advanced',
  estimatedTime: '45 minutes',
  prerequisites: ['p8-transformers'],
  tags: ['MLOps', 'Advanced', 'Topic'],
  objectives: [
    'Understand why experiment tracking is critical for reproducible ML',
    'Track runs, parameters, metrics, and artifacts with MLflow',
    'Use W&B for experiment logging and visualization',
    'Compare MLflow vs W&B and choose the right tool',
    'Organize experiments with naming conventions and tags',
  ],
  theory: `# Experiment Tracking (MLflow, W&B)

## Why Track Experiments?

Machine learning is inherently experimental. You change hyperparameters, architectures, data preprocessing, and evaluate results. Without tracking, you lose:

- **Reproducibility**: What exact code, data, and hyperparameters produced that 98% accuracy?
- **Comparability**: Did experiment A or B perform better on the held-out set?
- **Efficiency**: How many hours were spent training, and which runs failed?
- **Collaboration**: What did your teammate try yesterday while you were away?

## MLflow Tracking

MLflow is an open-source platform for the ML lifecycle. Its tracking component records:

### Runs and Experiments
An **experiment** groups related runs. Each **run** captures:
- **Parameters**: Key-value pairs of hyperparameters (learning rate, batch size)
- **Metrics**: Numeric values tracked over time (loss, accuracy, F1)
- **Artifacts**: Output files (model weights, plots, confusion matrices)
- **Tags**: Metadata for organizing runs (dataset version, GPU type)
- **Source**: Git commit, entry point, and environment

### MLflow UI
The web UI lets you search, compare, and visualize runs:

$$\\text{loss curve} = \\{(t, \\text{loss}_t) \\mid t \\in [0, T]\\}$$

You can compare multiple runs side-by-side, plot metrics, and download artifacts.

## W&B (Weights & Biases)

W&B is a hosted experiment tracking platform with deeper visualization:

### Key Concepts
- **wandb.init()**: Start a run, optionally in a project
- **wandb.config**: Log hyperparameters as a dictionary
- **wandb.log()**: Log metrics (scalars, histograms, images, tables)
- **wandb.Artifact**: Version datasets and models
- **Sweeps**: Hyperparameter optimization with Bayesian, grid, or random search

### Comparison: MLflow vs W&B

| Feature | MLflow | W&B |
|---------|--------|-----|
| Hosting | Self-hosted or Databricks | Cloud-hosted (SaaS) |
| Pricing | Free (open source) | Free tier + paid |
| Visualization | Basic plots | Rich interactive dashboards |
| Sweeps | No native support | Built-in sweeps engine |
| Artifacts | Yes | Yes (Artifact system) |
| Collaboration | Via server | Native team features |

## Tracking Code Versions with Git

Always log the Git commit hash with each experiment:

$$\\text{experiment} = \\{\\text{params}, \\text{metrics}, \\text{artifacts}, \\text{commit: } \\mathcal{H}\\}$$

This creates an unbreakable link between code and results. In MLflow:

$$\\text{mlflow.set_tag}("\\text{git\_commit}", \\text{commit\_hash})$$

## Experiment Organization

### Naming Convention
\\texttt{\\{date\\}\\_\\{model\\}\\_\\{dataset\\}\\_\\{variant\\}}

Example: \\texttt{2024-06-15\_resnet50\_imagenet\_augmented}

### Tagging Strategy
- \\texttt{status: running | completed | failed}
- \\texttt{dataset: v1 | v2 | v3}
- \\texttt{environment: dev | staging | prod}
- \\texttt{team: ml-research | ml-engineering}

## Reproducible Runs

A truly reproducible run captures:
1. Code version (Git commit, uncommitted changes)
2. Environment (\\texttt{requirements.txt}, Docker image)
3. Data version (DVC hash, S3 URI with version ID)
4. Hyperparameters (complete config dictionary)
5. Random seeds (Python, NumPy, PyTorch/TensorFlow)
6. Hardware info (GPU type, CPU cores, RAM)`,
  understanding: {
    analogy: 'Experiment tracking is like a lab notebook for a scientist. A chemist does not mix random compounds and hope — they record every reagent, temperature, duration, and observation. Similarly, an ML practitioner must record every parameter, metric, and artifact so that any result can be reproduced, understood, and built upon. Without this notebook, a "successful" experiment is just a lucky accident.',
    steps: [
      { title: 'Log Hyperparameters', content: 'Before training starts, log all configuration: learning rate, batch size, optimizer, model architecture, data path. This creates the "recipe" for your experiment.' },
      { title: 'Log Metrics During Training', content: 'At each epoch or step, log loss, accuracy, and any custom metrics. This gives you the training dynamics — did the model converge? Did it overfit?' },
      { title: 'Log Artifacts on Completion', content: 'Save the trained model weights, tokenizer, preprocessing pipeline, and evaluation plots as artifacts. These are the "products" of your experiment.' },
      { title: 'Compare and Analyze', content: 'Use the tracking UI to compare multiple runs. Sort by validation accuracy, filter by dataset version, and identify the best configuration.' },
      { title: 'Promote the Best Run', content: 'Tag the winning run as "champion" or "production". Freeze the code, environment, data version, and model artifact for deployment.' },
    ],
    misconceptions: [
      { misconception: 'Experiment tracking is only for large teams', truth: 'Even a solo practitioner benefits enormously. After 50 experiments without tracking, you will have no idea which combination of settings produced your best model.' },
      { misconception: 'Just saving the model file is enough', truth: 'A model file without its hyperparameters, training data version, and evaluation metrics is nearly useless. You cannot reproduce, explain, or improve it.' },
      { misconception: 'Tracking slows down development', truth: 'Adding a few lines of mlflow.log_param or wandb.log takes seconds but saves hours of confusion. The upfront cost is negligible compared to the debugging time it saves.' },
    ],
    comparisons: [
      { label: 'Hosting', methodA: 'MLflow: Self-hosted (you manage server)', methodB: 'W&B: Cloud-hosted (managed service)' },
      { label: 'Visualization', methodA: 'MLflow: Basic line plots and tables', methodB: 'W&B: Rich interactive dashboards with slicing' },
      { label: 'Sweeps', methodA: 'MLflow: Manual orchestration needed', methodB: 'W&B: Built-in hyperparameter optimization' },
      { label: 'Artifact versioning', methodA: 'MLflow: Artifact store (local/S3)', methodB: 'W&B: Artifact system with version graph' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `import mlflow
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split

# Start an MLflow run
mlflow.set_experiment("iris-classification")

with mlflow.start_run(run_name="lr-baseline"):
    # Log parameters
    mlflow.log_param("model", "LogisticRegression")
    mlflow.log_param("C", 1.0)
    mlflow.log_param("solver", "lbfgs")
    mlflow.log_param("max_iter", 100)

    # Train model
    X, y = load_iris(return_X_y=True)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    model = LogisticRegression(C=1.0, solver="lbfgs", max_iter=100)
    model.fit(X_train, y_train)

    # Log metrics
    train_acc = model.score(X_train, y_train)
    test_acc = model.score(X_test, y_test)
    mlflow.log_metric("train_accuracy", train_acc)
    mlflow.log_metric("test_accuracy", test_acc)

    # Log model
    mlflow.sklearn.log_model(model, "model")

    print(f"Train accuracy: {train_acc:.4f}")
    print(f"Test accuracy: {test_acc:.4f}")
    print(f"Run ID: {mlflow.active_run().info.run_id}")
    mlflow.end_run()`,
      output: `Train accuracy: 0.9833
Test accuracy: 0.9667
Run ID: 4a7b3c9e2f1d8a5b6c7d8e9f0a1b2c3d`,
      explanation: 'This basic example shows an MLflow tracking loop: set experiment, start run, log parameters before training, log metrics after evaluation, and log the serialized model as an artifact. Every detail of the experiment is now searchable in the MLflow UI.',
    },
    {
      level: 'intermediate',
      code: `import mlflow
import wandb
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset

class SimpleNN(nn.Module):
    def __init__(self, input_dim=28*28, hidden_dim=128, num_classes=10):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(input_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, num_classes),
        )

    def forward(self, x):
        return self.net(x)

def train_with_tracking(config):
    # MLflow tracking
    mlflow.set_experiment("mnist-experiment")
    with mlflow.start_run(run_name=config["run_name"]):
        mlflow.log_params(config)

        # W&B tracking
        wandb.init(project="mnist-experiment",
                   name=config["run_name"],
                   config=config)

        model = SimpleNN(config["input_dim"],
                         config["hidden_dim"],
                         config["num_classes"])
        criterion = nn.CrossEntropyLoss()
        optimizer = torch.optim.Adam(
            model.parameters(), lr=config["lr"]
        )

        # Dummy data for illustration
        X = torch.randn(1000, 28*28)
        y = torch.randint(0, 10, (1000,))
        loader = DataLoader(TensorDataset(X, y), batch_size=config["batch_size"])

        for epoch in range(config["epochs"]):
            running_loss = 0.0
            for batch_X, batch_y in loader:
                optimizer.zero_grad()
                outputs = model(batch_X)
                loss = criterion(outputs, batch_y)
                loss.backward()
                optimizer.step()
                running_loss += loss.item()

            avg_loss = running_loss / len(loader)
            mlflow.log_metric("loss", avg_loss, step=epoch)
            wandb.log({"loss": avg_loss, "epoch": epoch})
            print(f"Epoch {epoch+1}/{config['epochs']}, Loss: {avg_loss:.4f}")

        torch.save(model.state_dict(), "model.pth")
        mlflow.log_artifact("model.pth")
        wandb.save("model.pth")
        wandb.finish()

config = {
    "run_name": "nn-v1",
    "lr": 0.001,
    "batch_size": 64,
    "epochs": 5,
    "hidden_dim": 128,
    "input_dim": 28*28,
    "num_classes": 10,
}
train_with_tracking(config)`,
      output: `Epoch 1/5, Loss: 2.3012
Epoch 2/5, Loss: 2.2987
Epoch 3/5, Loss: 2.2954
Epoch 4/5, Loss: 2.2911
Epoch 5/5, Loss: 2.2856
MLflow run: mnist-experiment / nn-v1
W&B run: mnist-experiment / nn-v1 (https://wandb.ai/user/mnist-experiment/runs/...)`,
      explanation: 'This intermediate example uses both MLflow and W&B simultaneously. MLflow handles parameter logging, while W&B provides richer visualization. The model is saved and logged as an artifact in both systems. In production, you would typically pick one, but this shows interoperability.',
    },
    {
      level: 'advanced',
      code: `import mlflow
import wandb
import json
import hashlib
import subprocess
from pathlib import Path
from dataclasses import dataclass, asdict
from typing import Optional

@dataclass
class ExperimentConfig:
    model_type: str
    learning_rate: float
    batch_size: int
    epochs: int
    dataset_version: str
    seed: int
    gpu_type: str = ""
    notes: str = ""

class ExperimentTracker:
    def __init__(self, project_name: str, config: ExperimentConfig):
        self.config = config
        self.git_commit = self._get_git_commit()
        self.diff_hash = self._get_uncommitted_diff_hash()

        mlflow.set_experiment(project_name)
        self.mlflow_run = mlflow.start_run(
            run_name=f"{config.model_type}-{config.dataset_version}"
        )
        wandb.init(project=project_name,
                   name=f"{config.model_type}-{config.dataset_version}",
                   config=asdict(config))

        self._log_environment()

    def _get_git_commit(self) -> str:
        try:
            return subprocess.check_output(
                ["git", "rev-parse", "HEAD"]
            ).decode().strip()
        except Exception:
            return "unknown"

    def _get_uncommitted_diff_hash(self) -> str:
        try:
            diff = subprocess.check_output(
                ["git", "diff"]
            ).decode()
            return hashlib.sha256(diff.encode()).hexdigest()[:12]
        except Exception:
            return "clean"

    def _log_environment(self):
        env_info = {
            "git_commit": self.git_commit,
            "uncommitted_diff_hash": self.diff_hash,
            "mlflow_version": mlflow.__version__,
            "wandb_version": wandb.__version__,
        }
        mlflow.log_params({f"env_{k}": v for k, v in env_info.items()})
        mlflow.set_tags({
            "git_commit": self.git_commit,
            "dataset_version": self.config.dataset_version,
        })
        with open("env_info.json", "w") as f:
            json.dump(env_info, f)
        mlflow.log_artifact("env_info.json")

    def log_metrics(self, metrics: dict, step: Optional[int] = None):
        mlflow.log_metrics(metrics, step=step)
        wandb.log(metrics, step=step)

    def log_artifact(self, local_path: str, artifact_path: str = ""):
        mlflow.log_artifact(local_path, artifact_path)
        wandb.save(local_path)

    def log_model(self, model, path: str = "model"):
        mlflow.pytorch.log_model(model, path)
        wandb.watch(model)

    def finish(self):
        mlflow.end_run()
        wandb.finish()

# Usage
config = ExperimentConfig(
    model_type="resnet50",
    learning_rate=0.0001,
    batch_size=128,
    epochs=50,
    dataset_version="imagenet-v2",
    seed=42,
    gpu_type="A100-80GB",
    notes="Baseline without augmentation",
)

tracker = ExperimentTracker("image-classification", config)
tracker.log_metrics({"loss": 2.1, "accuracy": 0.45}, step=0)
tracker.finish()
print(f"Experiment logged with config: {config}")
print(f"Git commit: {tracker.git_commit}")`,
      output: `Experiment logged with config: ExperimentConfig(model_type='resnet50', learning_rate=0.0001, batch_size=128, epochs=50, dataset_version='imagenet-v2', seed=42, gpu_type='A100-80GB', notes='Baseline without augmentation')
Git commit: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0`,
      explanation: 'This production-grade tracker class captures the full experiment context: Git commit, uncommitted diff hash, library versions, GPU type, and human-readable notes. Every run is fully reproducible — you can checkout the exact commit, apply uncommitted changes, and reproduce the same environment.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Research', description: 'ML research labs track thousands of experiments to compare architectural variations. MLflow\'s experiment UI allows researchers to filter, sort, and select the best-performing configurations for paper submission.' },
      { industry: 'Enterprise ML', description: 'Companies like Uber and Spotify use internal experiment tracking platforms to ensure models deployed to production have been properly validated, with full lineage from data to deployment.' },
      { industry: 'Pharmaceuticals', description: 'Drug discovery teams use W&B to track molecular generation experiments, comparing generative model variants across hundreds of runs with rich molecule visualizations.' },
    ],
    caseStudy: {
      problem: 'A team of 15 ML researchers was training models without tracking. When a model achieved state-of-the-art results, no one could remember the exact hyperparameters, data split, or random seed. The result was irreproducible.',
      solution: 'They adopted MLflow with a company-wide experiment server. Each researcher logged parameters, metrics, and artifacts. Git commit hashes were automatically captured. A shared dashboard displayed all ongoing experiments.',
      results: 'Reproducibility reached 100%. Model handoff between researchers dropped from 2 days to 30 minutes. The team identified and retired 20% of experiments that were duplicates of previous runs.',
    },
    bestPractices: [
      'Always log git commit hash and any uncommitted changes with every run',
      'Log all hyperparameters before training starts, not after',
      'Log metrics at every epoch or evaluation step, not just the final value',
      'Use consistent naming conventions for experiments and runs',
      'Tag runs with status, dataset version, and environment',
      'Log random seeds for both Python and framework-level randomness',
      'Clean up failed and aborted runs to keep the UI organized',
    ],
    tools: ['MLflow', 'Weights & Biases (W&B)', 'DVC (data versioning)', 'Git', 'Docker'],
    jobRoles: ['MLOps Engineer', 'Machine Learning Engineer', 'Data Scientist', 'AI Research Scientist'],
    furtherReading: [
      'MLflow Tracking documentation',
      'W&B Quickstart guide',
      'Reproducibility in ML (Papers with Code)',
      'Hidden Technical Debt in ML Systems (Sculley et al.)',
    ],
  },
  quiz: [
    {
      id: 'p16-et-1', type: 'mcq',
      question: 'What is the primary purpose of experiment tracking in machine learning?',
      options: [
        'To make models train faster',
        'To ensure results are reproducible by recording parameters, metrics, and artifacts',
        'To automatically deploy models to production',
        'To visualize neural network architectures',
      ],
      correctAnswer: 'To ensure results are reproducible by recording parameters, metrics, and artifacts',
      explanation: 'Experiment tracking records every detail of an ML experiment (hyperparameters, metrics, code version, artifacts) so that any result can be reproduced, compared, and built upon.',
    },
    {
      id: 'p16-et-2', type: 'truefalse',
      question: 'MLflow and W&B can be used together in the same training script to log experiments.',
      correctAnswer: 'True',
      explanation: 'Both tools can run simultaneously in the same script. Many teams use MLflow for self-hosted tracking and W&B for richer visualization and team collaboration features.',
    },
    {
      id: 'p16-et-3', type: 'fillblank',
      question: 'In MLflow, a group of related runs is called an ___.',
      correctAnswer: 'experiment',
      explanation: 'An MLflow experiment contains multiple runs. Each run belongs to exactly one experiment. Experiments help organize runs by project, dataset, or model family.',
    },
    {
      id: 'p16-et-4', type: 'code',
      question: 'What does the following MLflow code snippet do?',
      code: `with mlflow.start_run():
    mlflow.log_param("lr", 0.001)
    mlflow.log_metric("accuracy", 0.95)
    mlflow.log_artifact("model.pkl")`,
      options: [
        'Loads a pre-trained model from MLflow',
        'Starts a run, logs a parameter, a metric, and an artifact',
        'Deploys the model to a production endpoint',
        'Downloads experiment data from the MLflow server',
      ],
      correctAnswer: 'Starts a run, logs a parameter, a metric, and an artifact',
      explanation: 'This creates a new run, logs "lr" as a configuration parameter, "accuracy" as a evaluation metric, and "model.pkl" as a file artifact. These three categories (params, metrics, artifacts) form the core of MLflow tracking.',
    },
    {
      id: 'p16-et-5', type: 'match',
      question: 'Match each MLflow concept with its description:',
      pairs: [
        { left: 'log_param', right: 'Records hyperparameters as key-value pairs' },
        { left: 'log_metric', right: 'Records numeric values that can be tracked over time' },
        { left: 'log_artifact', right: 'Saves output files like model weights and plots' },
        { left: 'set_tag', right: 'Adds metadata for organizing and searching runs' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'Parameters are configuration values set before training. Metrics are evaluated during/after training. Artifacts are output files. Tags are searchable metadata.',
    },
  ],
}))

export {}
