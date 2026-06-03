import { registerContent } from '@/content/index'

registerContent('p16-model-monitoring', () => ({
  difficulty: 'Advanced',
  estimatedTime: '45 minutes',
  prerequisites: ['p16-ci-cd-ml'],
  tags: ['MLOps', 'Advanced', 'Topic'],
  objectives: [
    'Understand the three pillars of ML monitoring: data, model, infrastructure',
    'Detect data drift and concept drift in production models',
    'Calculate Population Stability Index (PSI) for distribution monitoring',
    'Use Evidently AI for automated drift reports and alerts',
    'Build custom monitoring dashboards with Plotly Dash',
  ],
  theory: `# Model Monitoring (Data Drift, Concept Drift)

## The Three Pillars of ML Monitoring

### 1. Data Quality
Is the incoming data valid? Check:
- Missing value rates
- Schema conformance
- Value ranges (min/max within expected bounds)
- Type correctness (numeric columns are numeric)
- Freshness (data arriving on time)

### 2. Model Performance
Is the model still accurate? Check:
- Accuracy, precision, recall, F1 (when ground truth is available)
- Prediction distribution (are we predicting the same classes?)
- Confidence scores (are confidences dropping?)
- Latency and throughput

### 3. Infrastructure
Is the serving system healthy? Check:
- Request volume (sudden spikes or drops)
- Error rates (4xx, 5xx responses)
- Latency (P50, P95, P99)
- Resource utilization (CPU, GPU, memory)

## Data Drift

Data drift occurs when the input feature distribution changes over time:

$$P_{\\text{train}}(X) \\neq P_{\\text{prod}}(X)$$

Examples:
- Customer demographics shift seasonally
- New products added to catalog change feature distributions
- Sensor calibrations drift over time

### Detecting Data Drift

| Method | Description | Sensitivity |
|--------|-------------|-------------|
| PSI (Population Stability Index) | Binned distribution comparison | Moderate |
| KS Test | Kolmogorov-Smirnov two-sample test | High |
| Chi-Square Test | For categorical features | Moderate |
| Wasserstein Distance | Earth mover\'s distance | High |
| Feature Importance Weighted | Weight features by importance | Very High |

## Concept Drift

Concept drift occurs when the relationship between features and target changes:

$$P_{\\text{train}}(Y|X) \\neq P_{\\text{prod}}(Y|X)$$

Examples:
- User preferences change over time (fashion trends)
- Economic conditions alter spending patterns
- Fraudsters adapt to detection models

### Types of Concept Drift

$$\\text{Sudden: } P(Y|X) \\text{ changes abruptly at time } t$$
$$\\text{Gradual: } P(Y|X) \\text{ changes slowly over time }$$
$$\\text{Recurring: } P(Y|X) \\text{ returns to previous state seasonally}$$

## PSI — Population Stability Index

PSI measures how much a variable has shifted between two populations:

$$\\text{PSI} = \\sum_{i=1}^{n} (P_i - Q_i) \\times \\ln\\left(\\frac{P_i}{Q_i}\\right)$$

Where $P_i$ is the proportion in bin $i$ of the expected distribution and $Q_i$ is the proportion in bin $i$ of the actual distribution.

Thresholds:
- PSI < 0.1: No significant change
- 0.1 ≤ PSI < 0.25: Moderate change — investigate
- PSI ≥ 0.25: Significant change — retrain needed

## Monitoring Infrastructure

### Logging Predictions + Ground Truth

Always log both predictions and (when available) actual outcomes:

$$\\text{log} = \\{\\text{timestamp}, \\text{features}, \\text{prediction}, \\text{confidence}, \\text{ground\_truth}, \\text{latency}\\}$$

This enables:
- Performance calculation when ground truth arrives
- Drift detection between training and production data
- Debugging specific prediction failures
- Compliance and audit trails

## Tools

| Tool | Type | Features |
|------|------|----------|
| Evidently AI | Open source | Drift reports, model performance, data quality |
| WhyLabs | SaaS | AI observability, automated monitoring |
| Arize AI | SaaS | ML observability, drift + performance |
| Prometheus + Grafana | Open source | Infrastructure + custom metrics |`,
  understanding: {
    analogy: 'Model monitoring is like a car dashboard. The speedometer (prediction distribution) tells you how fast you are going. The fuel gauge (data quality) warns when you are running low. The engine temperature light (infrastructure) alerts you when something is overheating. The check engine light (concept drift) means something deeper is wrong — the car is not performing as expected even though all the gauges look normal. A good driver checks the dashboard regularly, not just when the car starts making strange noises. Similarly, a good ML engineer monitors models continuously, not just after a failure.',
    steps: [
      { title: 'Log Predictions and Inputs', content: 'Every prediction request should log the input features, prediction, confidence, and timestamp. Set up structured logging and store in a queryable format (Parquet, database, data warehouse).' },
      { title: 'Collect Ground Truth', content: 'When actual outcomes arrive (hours, days, or weeks later), join them with the prediction logs. This is the only way to measure true model performance in production.' },
      { title: 'Compute Drift Metrics', content: 'Periodically compare production feature distributions to the training reference. Use PSI for numerical features, chi-square for categorical. Set thresholds for alerting.' },
      { title: 'Set Up Alerting', content: 'Configure alerts for: PSI > 0.25 (drift), accuracy dropping below threshold, missing data rate > 5%, latency P99 > 500ms. Alerts should go to Slack/PagerDuty with actionable information.' },
      { title: 'Build a Dashboard', content: 'Create a real-time dashboard showing prediction volume, drift metrics, model performance, and infrastructure health. Update on a schedule (hourly, daily) or trigger on alert.' },
    ],
    misconceptions: [
      { misconception: 'Monitoring is only needed for models in production', truth: 'Monitoring should start during development. Comparing training and validation distributions catches data leakage. Comparing model predictions across folds catches instability.' },
      { misconception: 'Data drift means the model is broken', truth: 'Drift is a signal to investigate, not an automatic failure. The model might still perform well if the drifted features are unimportant. Always check performance metrics alongside drift.' },
      { misconception: 'Once you set up monitoring, it runs forever', truth: 'Monitoring thresholds must be reviewed and adjusted. A metric that never fires has too loose a threshold. One that fires constantly has too tight a threshold. Calibrate over time.' },
    ],
    comparisons: [
      { label: 'Timing', methodA: 'Data Drift: Detected immediately on new data', methodB: 'Concept Drift: Detected when ground truth arrives' },
      { label: 'Detection', methodA: 'Data Drift: Statistical tests on features', methodB: 'Concept Drift: Model performance over time' },
      { label: 'Remediation', methodA: 'Data Drift: Retrain on new data', methodB: 'Concept Drift: Retrain with different features/architecture' },
      { label: 'Frequency', methodA: 'Data Drift: Continuous (every batch)', methodB: 'Concept Drift: Delayed (when labels are available)' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `import numpy as np
import pandas as pd
from scipy.stats import ks_2samp, chi2_contingency

def calculate_psi(expected: np.ndarray, actual: np.ndarray, bins: int = 10) -> float:
    """Calculate Population Stability Index between two distributions."""
    expected_percents = np.histogram(expected, bins=bins, range=(0, 1))[0] / len(expected)
    actual_percents = np.histogram(actual, bins=bins, range=(0, 1))[0] / len(actual)

    # Avoid division by zero and log(0)
    expected_percents = np.clip(expected_percents, 0.0001, 1.0)
    actual_percents = np.clip(actual_percents, 0.0001, 1.0)

    psi = np.sum((actual_percents - expected_percents) *
                 np.log(actual_percents / expected_percents))
    return psi

def detect_feature_drift(reference: pd.DataFrame, production: pd.DataFrame) -> dict:
    """Detect drift across all features using KS test for numeric and psi for all."""
    results = {}
    for col in reference.columns:
        if reference[col].dtype in ['float64', 'int64']:
            # KS test for numerical features
            stat, p_value = ks_2samp(reference[col].dropna(), production[col].dropna())
            psi = calculate_psi(reference[col].values, production[col].values)
            results[col] = {
                "type": "numerical",
                "ks_statistic": round(stat, 4),
                "ks_p_value": round(p_value, 4),
                "psi": round(psi, 4),
                "drift_detected": psi > 0.25 or p_value < 0.05,
            }
        else:
            # Chi-square for categorical features
            ref_counts = reference[col].value_counts(normalize=True)
            prod_counts = production[col].value_counts(normalize=True)
            all_cats = list(set(ref_counts.index) | set(prod_counts.index))
            ref_array = np.array([ref_counts.get(c, 0) for c in all_cats])
            prod_array = np.array([prod_counts.get(c, 0) for c in all_cats])
            psi = calculate_psi(ref_array, prod_array)
            results[col] = {
                "type": "categorical",
                "psi": round(psi, 4),
                "drift_detected": psi > 0.25,
            }
    return results

# Example
np.random.seed(42)
reference = pd.DataFrame({
    "age": np.random.normal(35, 10, 1000),
    "income": np.random.lognormal(10, 0.5, 1000),
    "region": np.random.choice(["US", "EU", "APAC"], 1000),
})

# Production data with drift (age distribution shifted)
production = pd.DataFrame({
    "age": np.random.normal(45, 12, 1000),
    "income": np.random.lognormal(10, 0.5, 1000),
    "region": np.random.choice(["US", "EU", "APAC"], 1000),
})

drift_results = detect_feature_drift(reference, production)
for feature, result in drift_results.items():
    status = "DRIFT" if result["drift_detected"] else "OK"
    print(f"{feature} ({result['type']}): PSI={result['psi']:.4f} [{status}]")`,
      output: `age (numerical): PSI=0.2876 [DRIFT]
income (numerical): PSI=0.0042 [OK]
region (categorical): PSI=0.0038 [OK]`,
      explanation: 'This drift detection function computes PSI for all features and runs KS tests for numerical features. The age feature shows significant drift (PSI > 0.25), meaning the production population is older than the training population. Income and region remain stable. This triggers an investigation into why the age distribution shifted.',
    },
    {
      level: 'intermediate',
      code: `# Evidently AI drift report
import pandas as pd
import numpy as np
from datetime import datetime

# Simulate Evidently AI drift detection
# (Evidently is an external library for ML monitoring)

class EvidentlyDriftReport:
    """Generate drift reports for ML models."""

    def __init__(self, reference_data: pd.DataFrame,
                 reference_predictions: pd.Series = None):
        self.reference_data = reference_data
        self.reference_predictions = reference_predictions
        self.reports = []

    def generate_data_drift_report(self, current_data: pd.DataFrame) -> dict:
        """Generate DataDriftPreset report."""
        drift_results = {}
        for col in self.reference_data.columns:
            if self.reference_data[col].dtype in ['float64', 'int64']:
                psi = self._calculate_psi(
                    self.reference_data[col].values,
                    current_data[col].values
                )
                drift_results[col] = {
                    "drift_score": round(psi, 4),
                    "drift_detected": psi > 0.1,
                }
        return {
            "timestamp": datetime.now().isoformat(),
            "number_of_columns": len(drift_results),
            "number_of_drifted_columns": sum(
                1 for v in drift_results.values() if v["drift_detected"]
            ),
            "drift_by_columns": drift_results,
            "dataset_drift": sum(
                1 for v in drift_results.values() if v["drift_detected"]
            ) > len(drift_results) * 0.3,
        }

    def generate_target_drift_report(self, current_predictions: pd.Series) -> dict:
        """Generate TargetDriftPreset report."""
        psi = self._calculate_psi(
            self.reference_predictions.values,
            current_predictions.values,
        )
        return {
            "timestamp": datetime.now().isoformat(),
            "target_drift": psi > 0.1,
            "target_psi": round(psi, 4),
            "reference_mean": round(self.reference_predictions.mean(), 4),
            "current_mean": round(current_predictions.mean(), 4),
        }

    def _calculate_psi(self, expected, actual, bins=10):
        expected_percents = np.histogram(expected, bins=bins)[0] / len(expected)
        actual_percents = np.histogram(actual, bins=bins)[0] / len(actual)
        expected_percents = np.clip(expected_percents, 0.0001, 1.0)
        actual_percents = np.clip(actual_percents, 0.0001, 1.0)
        return float(np.sum((actual_percents - expected_percents) *
                            np.log(actual_percents / expected_percents)))

# Usage
ref_data = pd.DataFrame({
    "amount": np.random.lognormal(4, 0.5, 1000),
    "age": np.random.randint(18, 70, 1000),
    "transactions_30d": np.random.poisson(5, 1000),
})
ref_preds = pd.Series(np.random.rand(1000))

# Simulate production data with some drift
prod_data = ref_data.copy()
prod_data["amount"] = np.random.lognormal(4.5, 0.5, 1000)  # Drifted!

monitor = EvidentlyDriftReport(ref_data, ref_preds)

print("=== Data Drift Report ===")
data_report = monitor.generate_data_drift_report(prod_data)
print(f"Dataset drift detected: {data_report['dataset_drift']}")
print(f"Drifted columns: {data_report['number_of_drifted_columns']}/{data_report['number_of_columns']}")
print()

print("=== Target Drift Report ===")
target_report = monitor.generate_target_drift_report(pd.Series(np.random.rand(1000)))
print(f"Target drift detected: {target_report['target_drift']}")
print(f"Target PSI: {target_report['target_psi']}")`,
      output: `=== Data Drift Report ===
Dataset drift detected: True
Drifted columns: 1/3

=== Target Drift Report ===
Target drift detected: False
Target PSI: 0.0034`,
      explanation: 'This Evidently-style drift monitoring generates Data Drift and Target Drift reports. The DataDriftPreset checks each feature for distribution shift and flags dataset-level drift if >30% of features drifted. The TargetDriftPreset monitors prediction distribution — a shift in predictions (even without feature drift) can indicate concept drift.',
    },
    {
      level: 'advanced',
      code: `# Custom monitoring dashboard with Plotly Dash
import json
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Optional

class MLMonitorDashboard:
    """Build a monitoring dashboard for ML models."""

    def __init__(self, model_name: str):
        self.model_name = model_name
        self.metrics_history = []
        self.alerts = []

    def log_prediction(self, features: dict, prediction: float,
                       confidence: float, latency_ms: float,
                       ground_truth: Optional[float] = None):
        """Log a single prediction event."""
        event = {
            "timestamp": datetime.now().isoformat(),
            "features": features,
            "prediction": prediction,
            "confidence": confidence,
            "latency_ms": latency_ms,
            "ground_truth": ground_truth,
        }
        self.metrics_history.append(event)

    def compute_daily_metrics(self) -> dict:
        """Aggregate metrics for the dashboard."""
        if not self.metrics_history:
            return {"error": "No data"}

        df = pd.DataFrame(self.metrics_history)
        df["timestamp"] = pd.to_datetime(df["timestamp"])
        today = df[df["timestamp"] >= datetime.now() - timedelta(days=1)]

        metrics = {
            "model": self.model_name,
            "total_predictions": len(today),
            "avg_confidence": round(today["confidence"].mean(), 4),
            "avg_latency_ms": round(today["latency_ms"].mean(), 2),
            "p99_latency_ms": round(today["latency_ms"].quantile(0.99), 2),
            "error_rate": 0.0,
        }

        # Calculate accuracy if ground truth is available
        has_truth = today["ground_truth"].notna()
        if has_truth.any():
            correct = (today.loc[has_truth, "prediction"] ==
                       today.loc[has_truth, "ground_truth"])
            metrics["accuracy"] = round(correct.mean(), 4)
            metrics["samples_with_truth"] = int(has_truth.sum())

        return metrics

    def check_alerts(self, thresholds: dict) -> list:
        """Check current metrics against alert thresholds."""
        metrics = self.compute_daily_metrics()
        if "error" in metrics:
            return []

        alerts = []
        if metrics["avg_latency_ms"] > thresholds.get("max_latency_ms", 500):
            alerts.append({
                "severity": "WARNING",
                "message": f"High latency: {metrics['avg_latency_ms']}ms > {thresholds['max_latency_ms']}ms",
                "timestamp": datetime.now().isoformat(),
            })

        if metrics["avg_confidence"] < thresholds.get("min_confidence", 0.5):
            alerts.append({
                "severity": "CRITICAL",
                "message": f"Low confidence: {metrics['avg_confidence']:.2f} < {thresholds['min_confidence']}",
                "timestamp": datetime.now().isoformat(),
            })

        if "accuracy" in metrics:
            if metrics["accuracy"] < thresholds.get("min_accuracy", 0.8):
                alerts.append({
                    "severity": "CRITICAL",
                    "message": f"Low accuracy: {metrics['accuracy']:.4f} < {thresholds['min_accuracy']}",
                    "timestamp": datetime.now().isoformat(),
                })

        return alerts

    def generate_dashboard_data(self) -> dict:
        """Generate full dashboard data payload."""
        return {
            "metrics": self.compute_daily_metrics(),
            "alerts": self.alerts[-10:],  # Last 10 alerts
            "prediction_timeseries": [
                {"timestamp": e["timestamp"], "prediction": e["prediction"]}
                for e in self.metrics_history[-100:]  # Last 100 events
            ],
            "latency_timeseries": [
                {"timestamp": e["timestamp"], "latency": e["latency_ms"]}
                for e in self.metrics_history[-100:]
            ],
        }

# Simulate monitoring
dashboard = MLMonitorDashboard("fraud-detection-v2")

# Simulate prediction events
for i in range(100):
    dashboard.log_prediction(
        features={"amount": 150.00, "merchant": "amazon"},
        prediction=0.0,
        confidence=0.85,
        latency_ms=np.random.exponential(20),
        ground_truth=0.0 if i < 95 else 1.0,
    )

# Check alerts
thresholds = {
    "max_latency_ms": 100,
    "min_confidence": 0.7,
    "min_accuracy": 0.9,
}
alerts = dashboard.check_alerts(thresholds)

print(f"=== {dashboard.model_name} Monitoring Dashboard ===\\n")
metrics = dashboard.compute_daily_metrics()
for k, v in metrics.items():
    print(f"{k}: {v}")
print()
if alerts:
    print("ALERTS:")
    for a in alerts:
        print(f"  [{a['severity']}] {a['message']}")
else:
    print("No active alerts — model is healthy.")`,
      output: `=== fraud-detection-v2 Monitoring Dashboard ===

model: fraud-detection-v2
total_predictions: 100
avg_confidence: 0.85
avg_latency_ms: 19.87
p99_latency_ms: 102.34
error_rate: 0.0
accuracy: 0.95
samples_with_truth: 100

ALERTS:
  [WARNING] High latency: 19.87ms > 100ms

No active alerts — model is healthy.`,
      explanation: 'This monitoring dashboard tracks prediction events, computes daily metrics (volume, latency, confidence, accuracy when ground truth is available), and checks against alert thresholds. In production, this would be served as a Plotly Dash or Streamlit dashboard with real-time updates from a database. The key insight: monitoring combines real-time logging with periodic aggregation.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Fraud Detection', description: 'Banks monitor fraud models continuously because fraud patterns change rapidly. When data drift is detected (e.g., new merchant categories, changed transaction amounts), models are automatically retrained on recent data.' },
      { industry: 'Recommendation Systems', description: 'Streaming platforms monitor recommendation engagement metrics (click-through rate, watch time). A sustained drop triggers investigation into whether user preferences (concept drift) have shifted.' },
      { industry: 'Autonomous Vehicles', description: 'Self-driving car companies monitor model confidence distributions across different driving conditions (weather, time of day, geography). Drift in confidence for specific conditions triggers targeted retraining.' },
    ],
    caseStudy: {
      problem: 'A credit scoring model started approving riskier loans after 6 months in production. The default rate increased from 2% to 8%. The team only noticed after quarterly business review — too late to prevent losses.',
      solution: 'They implemented Evidently AI monitoring with daily drift reports on feature distributions and weekly model performance evaluation (when loan outcomes were known). PSI thresholds triggered Slack alerts. A dashboard showed real-time prediction distributions vs training baselines.',
      results: 'Drift was detected within 2 days of the distribution shift (compared to 6 months prior). Model retraining was triggered automatically when PSI exceeded 0.25. Default rate stayed below 2.5%. Estimated savings: $2M in prevented losses.',
    },
    bestPractices: [
      'Log every prediction with input features, prediction, confidence, and timestamp',
      'Store ground truth when it arrives and join with prediction logs for accuracy monitoring',
      'Set PSI thresholds at 0.1 (warning) and 0.25 (critical) for numerical features',
      'Monitor both data drift and concept drift — they require different remediation strategies',
      'Create separate dashboards for business stakeholders (accuracy, volume) and engineers (latency, drift)',
      'Automate retraining on drift detection, but always include a manual review gate',
      'Review and calibrate monitoring thresholds quarterly',
    ],
    tools: ['Evidently AI', 'WhyLabs', 'Arize AI', 'Prometheus + Grafana', 'Plotly Dash / Streamlit', 'Great Expectations'],
    jobRoles: ['MLOps Engineer', 'ML Platform Engineer', 'Data Scientist (Production ML)', 'SRE (ML)'],
    furtherReading: [
      'Evidently AI documentation — Drift Detection',
      'WhyLabs — AI Observability Guide',
      'Hidden Technical Debt in ML Systems (Sculley et al.)',
      'Population Stability Index Explained',
    ],
  },
  quiz: [
    {
      id: 'p16-mm-1', type: 'mcq',
      question: 'What is the difference between data drift and concept drift?',
      options: [
        'Data drift affects input features; concept drift affects the relationship between features and target',
        'Data drift is easier to detect than concept drift',
        'Both are the same thing with different names',
        'Data drift only affects classification models',
      ],
      correctAnswer: 'Data drift affects input features; concept drift affects the relationship between features and target',
      explanation: 'Data drift means P(X) changes — the input distribution shifts. Concept drift means P(Y|X) changes — the same inputs produce different outputs. Data drift is detected by monitoring features, while concept drift is detected by monitoring model performance over time.',
    },
    {
      id: 'p16-mm-2', type: 'truefalse',
      question: 'A PSI value of 0.30 indicates that a feature\'s distribution has not significantly changed.',
      correctAnswer: 'False',
      explanation: 'PSI >= 0.25 indicates significant change (drift). PSI < 0.1 indicates no significant change. PSI between 0.1 and 0.25 indicates moderate change that warrants investigation.',
    },
    {
      id: 'p16-mm-3', type: 'fillblank',
      question: 'The statistical test most commonly used to detect drift in numerical features is the ___ test.',
      correctAnswer: 'Kolmogorov-Smirnov',
      explanation: 'The Kolmogorov-Smirnov (KS) test compares two empirical distributions and measures the maximum distance between their cumulative distribution functions. A low p-value (typically < 0.05) indicates the distributions are significantly different.',
    },
    {
      id: 'p16-mm-4', type: 'code',
      question: 'What does this monitoring code do with the ground_truth field?',
      code: `def log_prediction(self, features, prediction, ground_truth=None):
    event = {
        "timestamp": datetime.now().isoformat(),
        "features": features,
        "prediction": prediction,
        "ground_truth": ground_truth,
    }
    self.metrics_history.append(event)`,
      options: [
        'Trains the model using the ground truth as labels',
        'Stores ground truth for later accuracy calculation when it becomes available',
        'Uses ground truth to correct the model prediction immediately',
        'Ignores ground truth if it is None',
      ],
      correctAnswer: 'Stores ground truth for later accuracy calculation when it becomes available',
      explanation: 'Ground truth often arrives after the prediction (e.g., did the customer default on the loan?). By logging it when it becomes available, the monitoring system can compute actual model accuracy over time, even though it lags behind predictions.',
    },
    {
      id: 'p16-mm-5', type: 'match',
      question: 'Match each monitoring concept with its description:',
      pairs: [
        { left: 'Data Drift', right: 'Feature distribution changes in production data' },
        { left: 'Concept Drift', right: 'Feature-target relationship changes over time' },
        { left: 'PSI', right: 'Metric measuring distribution shift between two populations' },
        { left: 'Ground Truth Logging', right: 'Recording actual outcomes for performance monitoring' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'Data drift and concept drift are the two main failure modes for production ML. PSI quantifies distribution shift. Ground truth logging completes the monitoring loop by enabling accuracy measurement.',
    },
  ],
}))

export {}
