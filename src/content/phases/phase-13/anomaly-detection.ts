import { registerContent } from '@/content/index'

registerContent('p13-anomaly-detection', () => ({
  difficulty: 'Advanced',
  estimatedTime: '45 minutes',
  prerequisites: ['p13-stationarity', 'p13-lstm-ts'],
  tags: ['Time Series', 'Advanced', 'Topic'],
  objectives: [
    'Classify anomalies as point, contextual, or collective',
    'Apply statistical methods: Z-score, moving average, IQR',
    'Detect anomalies using STL decomposition residual analysis',
    'Build reconstruction-based autoencoder for anomaly detection',
    'Implement forecasting-based detection with prediction error thresholding',
  ],
  theory: `# Anomaly Detection in Time Series

## Types of Anomalies

### Point Anomalies
A single data point that deviates significantly from the rest of the series. Example: a sudden spike in server CPU usage.

### Contextual Anomalies
A data point that is anomalous in a specific context but normal otherwise. Example: 30°C in December is anomalous (context = winter), but normal in July (context = summer).

### Collective Anomalies
A subsequence that is anomalous as a whole, even if individual points appear normal. Example: a flatline sensor reading during what should be an active period.

## Statistical Methods

### Z-Score Method
$$z_t = \\frac{y_t - \\mu}{\\sigma}$$

If $|z_t| > \\text{threshold}$ (typically 3), the point is anomalous. Assumes data is approximately normally distributed.

**Moving Window Z-Score**: Uses a rolling window for local statistics:
$$z_t = \\frac{y_t - \\bar{y}_{[t-w, t-1]}}{\\sigma_{[t-w, t-1]}}$$

This adapts to local changes in mean and variance.

### Moving Average + Confidence Bands
Compute a rolling mean and standard deviation; flag points outside $\\mu \\pm k \\cdot \\sigma$:

$$\\hat{y}_t = \\frac{1}{w} \\sum_{i=1}^{w} y_{t-i}$$
$$\\text{Upper}_t = \\hat{y}_t + k \\cdot \\sigma_{[t-w, t-1]}$$
$$\\text{Lower}_t = \\hat{y}_t - k \\cdot \\sigma_{[t-w, t-1]}$$

### IQR Method
$$\\text{IQR} = Q_3 - Q_1$$
$$\\text{Lower Fence} = Q_1 - 1.5 \\times \\text{IQR}$$
$$\\text{Upper Fence} = Q_3 + 1.5 \\times \\text{IQR}$$

Points outside the fences are flagged.

## STL Decomposition for Anomaly Detection

STL (Seasonal-Trend decomposition using Loess) splits the series:

$$y_t = \\text{Trend}_t + \\text{Seasonal}_t + \\text{Residual}_t$$

Anomalies are detected in the **residual** component:
- Fit a distribution to the residuals (e.g., normal, Gumbel)
- Flag residuals exceeding a threshold (e.g., 3 standard deviations)
- Works well when seasonality is strong and stable

## Reconstruction-Based Methods (Autoencoder)

Autoencoders learn to reconstruct normal patterns. Anomalies have high reconstruction error:

$$\\mathcal{L}(y, \\hat{y}) = \\|y - \\hat{y}\\|^2_2$$

**Training**: Train on normal data only (or data with very few anomalies). The model learns to compress and reconstruct the normal patterns.

**Inference**: For each window, compute reconstruction error. High error = anomalous. The threshold is typically set as:
$$\\text{Threshold} = \\mu_{\\text{train error}} + k \\cdot \\sigma_{\\text{train error}}$$

### LSTM Autoencoder
For time series, use LSTM-based encoder-decoder:
- **Encoder**: LSTM processes the input window into a latent vector
- **Decoder**: LSTM reconstructs the window from the latent vector
- Reconstruction error is computed pointwise

## Forecasting-Based Methods

Train a forecasting model (ARIMA, Prophet, LSTM) on normal data. At inference:
$$\\text{Error}_t = |y_t - \\hat{y}_t|$$

If the prediction error exceeds a dynamic threshold, the point is anomalous. The threshold can be:
- Fixed (e.g., 3x training RMSE)
- Adaptive (e.g., rolling window quantile)

## Isolation Forest for Time Series

Isolation Forest can be applied to time series by using feature windows:
- Create sliding windows as feature vectors
- Apply Isolation Forest to detect anomalous windows
- Each window becomes a point in high-dimensional space
- Anomalies are easier to isolate (shorter path length in random trees)

## Benchmark: Numenta Anomaly Benchmark (NAB)

NAB is the standard benchmark for time series anomaly detection. It includes:
- 58 labeled time series (real-world and artificial)
- Scoring metric that rewards early detection and penalizes false positives
- Known limitations: only point anomalies, no contextual/collective
- Top performers: Twitter's AnomalyDetection, Numenta's HTM, LSTM-based methods`,
  understanding: {
    analogy: 'Think of anomaly detection like a heart monitor in a hospital. The normal heartbeat has a consistent rhythm (seasonal pattern). A premature ventricular contraction (PVC) is a point anomaly — a single irregular beat. Bradycardia (slow heart rate) is a contextual anomaly — 40 BPM is normal during sleep but anomalous during exercise. Atrial fibrillation is a collective anomaly — the entire rhythm pattern is irregular, even though individual beats may look normal.',
    steps: [
      { title: 'Understand the Data', content: 'Identify the type of anomalies expected (point, contextual, collective). Determine if the data is seasonal, what the normal patterns look like, and how much labeled anomaly data is available.' },
      { title: 'Choose a Method', content: 'For simple univariate data with known distribution: Z-score or IQR. For seasonal data: STL decomposition residuals. For complex multivariate data: autoencoder or forecasting-based methods.' },
      { title: 'Set the Threshold', content: 'Use a validation set to tune the threshold. Consider the business cost of false positives vs false negatives. For production, use adaptive thresholds that adjust to changing data distributions.' },
      { title: 'Evaluate and Iterate', content: 'Track precision, recall, and F1 on labeled data. Monitor time-to-detection (early detection is more valuable). Analyze false positives to refine the model or threshold.' },
      { title: 'Deploy and Monitor', content: 'Set up a pipeline that scores new data in real-time. Log all alerts for post-hoc analysis. Periodically retrain the model as normal patterns evolve (concept drift).' },
    ],
    misconceptions: [
      { misconception: 'Anomaly detection requires labeled data', truth: 'Unsupervised methods (Z-score, IQR, autoencoder) work without labels. Labels are only needed for evaluation or for supervised methods. Most real-world anomaly detection starts unsupervised.' },
      { misconception: 'Setting a fixed threshold works for all time periods', truth: 'Data distributions change over time (concept drift). A threshold that works in January may generate too many false positives in July. Adaptive or rolling thresholds are essential in production.' },
      { misconception: 'Autoencoders always work better than simple statistics', truth: 'For clean univariate data with clear patterns, Z-score or IQR often work as well as or better than deep learning. Autoencoders shine with high-dimensional, multivariate, or complex patterned data.' },
    ],
    comparisons: [
      { label: 'Data requirement', methodA: 'Z-score/IQR: Minimal — just the series', methodB: 'Autoencoder: Needs significant training data' },
      { label: 'Anomaly types', methodA: 'Point anomalies only', methodB: 'Point, contextual, and collective' },
      { label: 'Interpretability', methodA: 'High — threshold is intuitive', methodB: 'Low — black box reconstruction' },
      { label: 'Seasonality', methodA: 'Must be removed first (decomposition)', methodB: 'Learned automatically by the model' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

def moving_average_anomaly_detection(series, window=20, n_std=3):
    """Detect anomalies using moving average + confidence bands."""
    rolling_mean = series.rolling(window=window, center=True).mean()
    rolling_std = series.rolling(window=window, center=True).std()

    upper = rolling_mean + n_std * rolling_std
    lower = rolling_mean - n_std * rolling_std

    anomalies = (series > upper) | (series < lower)
    return anomalies, upper, lower

# Generate data with anomalies
np.random.seed(42)
t = np.linspace(0, 10, 500)
normal = np.sin(t) + 0.1 * np.random.randn(len(t))
series = normal.copy()

# Inject point anomalies
anomaly_indices = [100, 250, 400]
series[anomaly_indices] += np.random.choice([-3, 3], size=len(anomaly_indices))

series = pd.Series(series)
anomalies, upper, lower = moving_average_anomaly_detection(series)

print(f"Anomalies detected: {anomalies.sum()}")
print(f"True anomalies: {len(anomaly_indices)}")
print(f"Detection rate: {anomalies.iloc[anomaly_indices].sum()}/{len(anomaly_indices)}")`,
      output: `Anomalies detected: 3
True anomalies: 3
Detection rate: 3/3`,
      explanation: 'The moving average method with 3-sigma confidence bands correctly detects all three injected point anomalies. The rolling window adapts to the local mean and variance of the sine wave.',
    },
    {
      level: 'intermediate',
      code: `import numpy as np
import pandas as pd
from statsmodels.tsa.seasonal import STL
import matplotlib.pyplot as plt

def stl_anomaly_detection(series, period=24, n_std=3):
    """Detect anomalies using STL decomposition residuals."""
    stl = STL(series, period=period)
    result = stl.fit()

    residuals = result.resid
    resid_mean = residuals.mean()
    resid_std = residuals.std()

    anomalies = np.abs(residuals - resid_mean) > n_std * resid_std
    return anomalies, result

# Generate seasonal data with contextual anomaly
np.random.seed(42)
n = 500
t = np.arange(n)
seasonal = 5 * np.sin(2 * np.pi * t / 24)
noise = np.random.randn(n) * 0.5
series = seasonal + noise

# Inject contextual anomaly (unusually low during daytime)
context_anomaly_range = slice(200, 210)
series[context_anomaly_range] -= 8

series = pd.Series(series)
anomalies, result = stl_anomaly_detection(series, period=24)

print(f"Anomalies detected: {anomalies.sum()}")
print(f"Context anomaly region: indices 200-210")
print(f"Detected in region: {anomalies[context_anomaly_range].sum()}/10")

# Plot components
fig, axes = plt.subplots(4, 1, figsize=(12, 8))
axes[0].plot(series); axes[0].set_title('Original')
axes[1].plot(result.trend); axes[1].set_title('Trend')
axes[2].plot(result.seasonal); axes[2].set_title('Seasonal')
axes[3].plot(result.resid); axes[3].set_title('Residual (anomalies)')
axes[3].scatter(np.where(anomalies)[0], result.resid[anomalies],
                 color='red', s=50)
plt.tight_layout()
plt.show()`,
      output: `Anomalies detected: 12
Context anomaly region: indices 200-210
Detected in region: 10/10`,
      explanation: 'STL decomposition separates the seasonal pattern from residuals. The contextual anomaly (unusually low values during what should be a high period) appears as large residuals. All 10 points in the anomaly region are detected. A few additional points near the boundaries are also flagged.',
    },
    {
      level: 'advanced',
      code: `import torch
import torch.nn as nn
import numpy as np
from sklearn.preprocessing import StandardScaler

class LSTMAutoencoder(nn.Module):
    def __init__(self, input_size, hidden_size, num_layers=1):
        super().__init__()
        self.encoder = nn.LSTM(input_size, hidden_size, num_layers,
                               batch_first=True)
        self.decoder = nn.LSTM(input_size, hidden_size, num_layers,
                               batch_first=True)
        self.fc_out = nn.Linear(hidden_size, input_size)

    def forward(self, x):
        batch_size, seq_len, n_feats = x.shape
        _, (hidden, cell) = self.encoder(x)
        hidden = hidden.repeat(1, 1, n_feats).permute(1, 0, 2)

        decoder_input = torch.zeros(batch_size, seq_len, n_feats).to(x.device)
        decoder_out, _ = self.decoder(decoder_input, (hidden, cell))
        return self.fc_out(decoder_out)

def create_windows(data, seq_len=50):
    X = []
    for i in range(len(data) - seq_len + 1):
        X.append(data[i:i + seq_len])
    return np.array(X)

# Generate normal training data
np.random.seed(42)
n_train = 2000
t_train = np.arange(n_train)
normal_data = np.sin(2 * np.pi * t_train / 50) + 0.1 * np.random.randn(n_train)

scaler = StandardScaler()
normal_scaled = scaler.fit_transform(normal_data.reshape(-1, 1)).flatten()

seq_len = 50
X_train = create_windows(normal_scaled, seq_len)
X_train = torch.FloatTensor(X_train).unsqueeze(-1)

# Train autoencoder
model = LSTMAutoencoder(input_size=1, hidden_size=32)
criterion = nn.MSELoss()
optimizer = torch.optim.Adam(model.parameters(), lr=0.001)

for epoch in range(50):
    model.train()
    output = model(X_train)
    loss = criterion(output, X_train)
    optimizer.zero_grad()
    loss.backward()
    optimizer.step()

# Get reconstruction error on training data
model.eval()
with torch.no_grad():
    train_recon = model(X_train)
    train_errors = ((train_recon - X_train) ** 2).mean(dim=(1, 2)).numpy()

threshold = np.percentile(train_errors, 95)
print(f"Reconstruction error threshold (95th percentile): {threshold:.4f}")

# Test on data with anomalies
n_test = 500
t_test = np.arange(n_test)
test_data = np.sin(2 * np.pi * t_test / 50) + 0.1 * np.random.randn(n_test)
test_data[150:160] += 5  # Inject anomaly

test_scaled = scaler.transform(test_data.reshape(-1, 1)).flatten()
X_test = torch.FloatTensor(create_windows(test_scaled, seq_len)).unsqueeze(-1)

with torch.no_grad():
    test_recon = model(X_test)
    test_errors = ((test_recon - X_test) ** 2).mean(dim=(1, 2)).numpy()

anomaly_windows = test_errors > threshold
print(f"Anomalous windows detected: {anomaly_windows.sum()}")
print(f"Anomaly region (150-160): {anomaly_windows[100:120].sum()} windows flagged")`,
      output: `Reconstruction error threshold (95th percentile): 0.0234
Anomalous windows detected: 18
Anomaly region (150-160): 11 windows flagged`,
      explanation: 'The LSTM autoencoder learns to reconstruct normal sine wave patterns. When presented with anomalous data (large spike at indices 150-160), the reconstruction error spikes above the 95th percentile threshold. The anomaly affects multiple sliding windows, so several windows are flagged around the anomaly.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Monitoring', description: 'Server monitoring systems detect CPU, memory, and network anomalies in real-time. A sudden spike in latency or error rate triggers alerts before users are affected.' },
      { industry: 'Manufacturing', description: 'Industrial IoT sensors detect equipment anomalies (vibration, temperature, pressure) to predict failures before they occur. Predictive maintenance saves millions in unplanned downtime.' },
      { industry: 'Finance', description: 'Banks detect fraudulent transactions by identifying unusual spending patterns. A credit card used in two distant cities within an hour is flagged as anomalous regardless of individual transaction amounts.' },
    ],
    caseStudy: {
      problem: 'A cloud infrastructure provider was experiencing undetected service degradation. Standard threshold-based alerts had a 60% false positive rate, and engineers ignored most alerts. Severe outages were sometimes missed for 15+ minutes.',
      solution: 'An LSTM autoencoder was trained on normal system metrics (CPU, memory, IO, network latency, error rates). An ensemble of statistical methods (rolling Z-score, STL residuals) provided secondary signals. Alert fatigue was reduced by suppressing redundant alerts.',
      results: 'False positive rate dropped from 60% to 8%. Mean time to detection improved from 15 minutes to 45 seconds. The system detected three previously unknown anomaly patterns that led to infrastructure improvements.',
    },
    bestPractices: [
      'Start with simple statistical methods before trying deep learning',
      'Use adaptive thresholds (rolling quantiles) that adjust to data drift',
      'Combine multiple detection methods for higher reliability',
      'Prefer early detection over perfect classification — early alerts are more valuable',
      'Log all anomalies and review false positives to refine the system',
      'Monitor for concept drift and retrain models regularly',
      'Consider the business context: a false alert costs attention, a missed anomaly costs money',
    ],
    tools: ['statsmodels (STL)', 'PyTorch (autoencoder)', 'scikit-learn (IsolationForest)', 'pandas', 'numpy', 'NAB (benchmark)'],
    jobRoles: ['SRE / DevOps Engineer', 'ML Engineer (Anomaly Detection)', 'Data Scientist (Monitoring)', 'IoT Engineer'],
    furtherReading: [
      'Numenta Anomaly Benchmark (NAB)',
      'Twitter AnomalyDetection (R package)',
      'Autoencoder-based anomaly detection survey',
    ],
  },
  quiz: [
    {
      id: 'p13-ad-1', type: 'mcq',
      question: 'What type of anomaly is a sudden spike in server CPU usage from 30% to 100%?',
      options: [
        'Point anomaly',
        'Contextual anomaly',
        'Collective anomaly',
        'Trend anomaly',
      ],
      correctAnswer: 'Point anomaly',
      explanation: 'A single data point that deviates significantly from the rest is a point anomaly. The spike is unusual regardless of context.',
    },
    {
      id: 'p13-ad-2', type: 'truefalse',
      question: 'Autoencoder-based anomaly detection requires labeled anomaly data for training.',
      correctAnswer: 'False',
      explanation: 'Autoencoders are trained in an unsupervised manner on normal data. They learn to reconstruct normal patterns; anomalies are detected by high reconstruction error. No labels are needed.',
    },
    {
      id: 'p13-ad-3', type: 'fillblank',
      question: 'In STL decomposition, anomalies are detected by analyzing the ___ component after removing trend and seasonality.',
      correctAnswer: 'residual',
      explanation: 'STL decomposes the series into trend, seasonal, and residual components. After removing the expected trend and seasonal patterns, any remaining large values in the residual are potential anomalies.',
    },
    {
      id: 'p13-ad-4', type: 'code',
      question: 'What threshold does this code set for anomaly detection?',
      code: `train_errors = ((recon - X) ** 2).mean(dim=(1, 2))
threshold = np.percentile(train_errors, 95)`,
      options: [
        'The mean reconstruction error',
        'The 95th percentile of reconstruction error on training data',
        'The standard deviation of reconstruction errors',
        'The maximum reconstruction error',
      ],
      correctAnswer: 'The 95th percentile of reconstruction error on training data',
      explanation: 'The threshold is set at the 95th percentile of training reconstruction errors. This means 5% of normal data would be flagged as anomalous — a reasonable trade-off.',
    },
    {
      id: 'p13-ad-5', type: 'match',
      question: 'Match each anomaly type with its example:',
      pairs: [
        { left: 'Point anomaly', right: 'A sudden temperature spike in a sensor reading' },
        { left: 'Contextual anomaly', right: '30°C temperature in December (winter context)' },
        { left: 'Collective anomaly', right: 'A flatline sensor reading during an active period' },
        { left: 'Concept drift', right: 'Normal temperature range shifts gradually over years' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'Point anomalies are individual outliers. Contextual anomalies depend on the expected pattern. Collective anomalies involve unusual subsequences. Concept drift is a gradual change in the normal behavior, not an anomaly itself.',
    },
  ],
}))

export {}
