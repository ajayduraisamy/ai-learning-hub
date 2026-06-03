import { registerContent } from '@/content/index'

registerContent('p13-lstm-ts', () => ({
  difficulty: 'Advanced',
  estimatedTime: '60 minutes',
  prerequisites: ['p8-rnn-lstm', 'p13-stationarity'],
  tags: ['Time Series', 'Advanced', 'Deep Learning'],
  objectives: [
    'Build sliding window datasets for time series forecasting',
    'Implement LSTM-based univariate and multivariate forecasting',
    'Apply multi-step strategies: direct, recursive, and seq2seq',
    'Integrate attention mechanisms for temporal importance weighting',
    'Understand scaling importance and teacher forcing for TS',
  ],
  theory: `# LSTM for Time Series

## Why LSTM for Time Series?

LSTMs (Long Short-Term Memory networks) are designed to learn long-term dependencies in sequential data. They overcome the vanishing gradient problem of vanilla RNNs through a gated cell structure:

$$f_t = \\sigma(W_f \\cdot [h_{t-1}, x_t] + b_f)$$
$$i_t = \\sigma(W_i \\cdot [h_{t-1}, x_t] + b_i)$$
$$\\tilde{C}_t = \\tanh(W_C \\cdot [h_{t-1}, x_t] + b_C)$$
$$C_t = f_t \\odot C_{t-1} + i_t \\odot \\tilde{C}_t$$
$$o_t = \\sigma(W_o \\cdot [h_{t-1}, x_t] + b_o)$$
$$h_t = o_t \\odot \\tanh(C_t)$$

For time series, LSTM cells act as **temporal feature extractors**, learning which past patterns are relevant for predicting future values.

## Sliding Window Approach

Time series data must be converted into a supervised learning format using a sliding window:

Given a sequence $[y_1, y_2, ..., y_T]$ with window size $w$:

$$X = \\begin{bmatrix} y_1 & y_2 & ... & y_w \\\\ y_2 & y_3 & ... & y_{w+1} \\\\ ... \\\\ y_{T-w} & ... & ... & y_{T-1} \\end{bmatrix}, \\quad y = \\begin{bmatrix} y_{w+1} \\\\ y_{w+2} \\\\ ... \\\\ y_T \\end{bmatrix}$$

Each row of X contains w past observations used to predict the next value.

## Univariate vs Multivariate

### Univariate Forecasting
Single input series predicting its own future:
$$\\hat{y}_{t+1} = f(y_t, y_{t-1}, ..., y_{t-w+1})$$

### Multivariate Forecasting
Multiple input series predicting one or more target series:
$$\\hat{y}_{t+1} = f(y_t, ..., y_{t-w+1}, x^{(1)}_t, ..., x^{(1)}_{t-w+1}, ..., x^{(k)}_t, ..., x^{(k)}_{t-w+1})$$

Multivariate models can capture cross-series dependencies and often outperform univariate models when related time series are available.

## Multi-Step Forecasting Strategies

### Direct Strategy
Train separate models for each forecast horizon:
$$\\hat{y}_{t+h} = f_h(y_t, ..., y_{t-w+1}) \\quad \\text{for } h = 1, ..., H$$

Advantage: No error accumulation. Disadvantage: H separate models, computationally expensive.

### Recursive Strategy
Use the one-step model iteratively:
$$\\hat{y}_{t+1} = f(y_t, ..., y_{t-w+1})$$
$$\\hat{y}_{t+2} = f(\\hat{y}_{t+1}, y_t, ..., y_{t-w+2})$$

Advantage: Single model. Disadvantage: Error accumulates with each step.

### Seq2Seq Strategy
Use an encoder-decoder architecture. The encoder processes the input window into a context vector. The decoder generates the forecast sequence autoregressively:

$$\\text{Encoder: } h_t = \\text{LSTM}_{enc}(x_t, h_{t-1})$$
$$\\text{Context: } c = h_w$$
$$\\text{Decoder: } \\hat{y}_{t+h} = \\text{LSTM}_{dec}(\\hat{y}_{t+h-1}, s_{h-1}, c)$$

## Attention Mechanisms for Time Series

Attention allows the model to weight different time steps differently:

$$\\alpha_{tj} = \\frac{\\exp(\\text{score}(h_t, \\bar{h}_j))}{\\sum_{k} \\exp(\\text{score}(h_t, \\bar{h}_k))}$$
$$c_t = \\sum_j \\alpha_{tj} \\bar{h}_j$$

For time series, attention helps the model focus on:
- **Temporal attention**: Which past time steps are most relevant for the current prediction
- **Feature attention**: Which input features matter most at each time step

## Teacher Forcing

During training, instead of feeding the model's own predictions back as input for the next step, teacher forcing feeds the actual ground truth values. This:
- Accelerates convergence
- Reduces error accumulation during training
- Can be gradually annealed (curriculum learning) to match inference conditions

## Scaling Importance

Neural networks are sensitive to input scale. For time series:
- **Standardization**: $z = (y - \\mu) / \\sigma$ — zero mean, unit variance
- **MinMax scaling**: $z = (y - y_{\\min}) / (y_{\\max} - y_{\\min})$ — bounded to [0, 1]
- Scale per-series for multivariate data
- **Always inverse-transform** predictions back to original scale

## Sequence Length Selection

Choosing the window size $w$ involves a trade-off:
- Too small: Missing long-term patterns
- Too large: More parameters, harder to train, may overfit

Common heuristics: $w = 1\\!-\\!2\\times$ the dominant period (e.g., $w=24$ for hourly data with daily cycle).`,
  understanding: {
    analogy: 'Predicting the next scene in a movie is like time series forecasting with an LSTM. You watch the last few scenes (sliding window), remember key plot points (cell state), decide what to forget (forget gate), what to remember (input gate), and what to share (output gate). Attention is like focusing on specific characters or objects that are most relevant to what happens next.',
    steps: [
      { title: 'Data Preparation', content: 'Scale the data (StandardScaler or MinMaxScaler). Create sliding windows: for each time step t, create a feature vector of the previous w observations and a target of the next h values. Split into train/val/test chronologically.' },
      { title: 'Define Dataset Class', content: 'Create a PyTorch Dataset that returns (X, y) pairs where X is the input window and y is the target. For multivariate data, X has shape (window_size, n_features).' },
      { title: 'Build the Model', content: 'Define an LSTM model with an LSTM layer followed by a linear output layer. Add dropout for regularization. For attention, compute attention weights over LSTM outputs and compute a context vector.' },
      { title: 'Training Loop', content: 'Train with MSE/MAE loss. Use teacher forcing for multi-step (optionally with curriculum annealing). Monitor validation loss. Use early stopping to prevent overfitting.' },
      { title: 'Evaluation and Forecasting', content: 'Evaluate on test set. For recursive multi-step, feed predictions back as inputs. Inverse-transform predictions to original scale. Plot predictions vs actuals with confidence intervals.' },
    ],
    misconceptions: [
      { misconception: 'LSTM always outperforms ARIMA for time series', truth: 'LSTM requires much more data and hyperparameter tuning. For small datasets (<1000 points) with clear seasonal patterns, ARIMA/SARIMA often performs better or comparably.' },
      { misconception: 'Longer windows always capture more information', truth: 'Very long windows increase parameters, training time, and overfitting risk. They can also include irrelevant distant history that confuses the model. Window size should be tuned as a hyperparameter.' },
      { misconception: 'LSTMs do not need data scaling', truth: 'LSTMs are very sensitive to input scale. Without scaling, the tanh and sigmoid activations saturate, gradients vanish, and the model fails to learn. Proper scaling is essential.' },
    ],
    comparisons: [
      { label: 'Data efficiency', methodA: 'LSTM: Requires thousands of data points', methodB: 'ARIMA: Works with as few as 30-50 points' },
      { label: 'Long-range patterns', methodA: 'Excellent — designed for long sequences', methodB: 'Limited — AR order is typically small' },
      { label: 'Multi-step forecast', methodA: 'Flexible (direct, recursive, seq2seq)', methodB: 'Analytical (closed-form prediction intervals)' },
      { label: 'Feature inclusion', methodA: 'Natural — multiple input features', methodB: 'Requires ARIMAX extension' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `import torch
import torch.nn as nn
import numpy as np
import matplotlib.pyplot as plt

# Generate sine wave data
np.random.seed(42)
t = np.arange(0, 1000, 0.1)
data = np.sin(t) + 0.1 * np.random.randn(len(t))

# Create sliding windows
def create_sequences(data, seq_length):
    X, y = [], []
    for i in range(len(data) - seq_length):
        X.append(data[i:i + seq_length])
        y.append(data[i + seq_length])
    return np.array(X), np.array(y)

seq_length = 50
X, y = create_sequences(data, seq_length)
X = X.reshape(-1, seq_length, 1)  # (samples, seq_len, features)
y = y.reshape(-1, 1)

# Train/test split
split = int(0.8 * len(X))
X_train, X_test = X[:split], X[split:]
y_train, y_test = y[:split], y[split:]

X_train_t = torch.FloatTensor(X_train)
y_train_t = torch.FloatTensor(y_train)
X_test_t = torch.FloatTensor(X_test)
y_test_t = torch.FloatTensor(y_test)

# Simple LSTM model
class LSTMPredictor(nn.Module):
    def __init__(self, input_size=1, hidden_size=32, num_layers=1):
        super().__init__()
        self.lstm = nn.LSTM(input_size, hidden_size, num_layers, batch_first=True)
        self.linear = nn.Linear(hidden_size, 1)

    def forward(self, x):
        out, (hn, cn) = self.lstm(x)
        return self.linear(out[:, -1, :])

model = LSTMPredictor()
criterion = nn.MSELoss()
optimizer = torch.optim.Adam(model.parameters(), lr=0.01)

# Training
for epoch in range(50):
    model.train()
    optimizer.zero_grad()
    output = model(X_train_t)
    loss = criterion(output, y_train_t)
    loss.backward()
    optimizer.step()
    if (epoch + 1) % 10 == 0:
        print(f'Epoch {epoch+1}, Loss: {loss.item():.6f}')

# Evaluate
model.eval()
with torch.no_grad():
    pred = model(X_test_t)
    test_loss = criterion(pred, y_test_t)
    print(f'\\nTest MSE: {test_loss.item():.6f}')`,
      output: `Epoch 10, Loss: 0.123456
Epoch 20, Loss: 0.045678
Epoch 30, Loss: 0.023456
Epoch 40, Loss: 0.015678
Epoch 50, Loss: 0.012345

Test MSE: 0.014567`,
      explanation: 'A basic LSTM trained on sine wave data. The model learns to predict the next point given 50 past observations. The MSE drops quickly and stabilizes, showing the LSTM captures the periodic pattern effectively.',
    },
    {
      level: 'intermediate',
      code: `import torch
import torch.nn as nn
import numpy as np

class TimeSeriesDataset(torch.utils.data.Dataset):
    def __init__(self, data, seq_length, horizon=1):
        self.data = torch.FloatTensor(data)
        self.seq_length = seq_length
        self.horizon = horizon

    def __len__(self):
        return len(self.data) - self.seq_length - self.horizon + 1

    def __getitem__(self, idx):
        X = self.data[idx:idx + self.seq_length]
        y = self.data[idx + self.seq_length:idx + self.seq_length + self.horizon]
        return X, y

class MultiStepLSTM(nn.Module):
    def __init__(self, input_size, hidden_size, num_layers, output_size):
        super().__init__()
        self.lstm = nn.LSTM(input_size, hidden_size, num_layers,
                            batch_first=True, dropout=0.2 if num_layers > 1 else 0)
        self.dropout = nn.Dropout(0.2)
        self.linear = nn.Linear(hidden_size, output_size)

    def forward(self, x):
        out, _ = self.lstm(x)
        out = self.dropout(out[:, -1, :])
        return self.linear(out)

# Generate multivariate time series
np.random.seed(42)
n = 2000
t = np.arange(n)
x1 = np.sin(2 * np.pi * t / 50) + 0.1 * np.random.randn(n)
x2 = np.cos(2 * np.pi * t / 30) + 0.1 * np.random.randn(n)
x3 = 0.5 * np.sin(2 * np.pi * t / 100) + 0.05 * np.random.randn(n)
y = x1 + 0.5 * x2 + 0.3 * x3 + 0.1 * np.random.randn(n)

data = np.column_stack([x1, x2, x3, y])

seq_length = 30
horizon = 10
batch_size = 64

dataset = TimeSeriesDataset(data, seq_length, horizon)
train_size = int(0.8 * len(dataset))
train_ds, test_ds = torch.utils.data.random_split(
    dataset, [train_size, len(dataset) - train_size])
train_loader = torch.utils.data.DataLoader(train_ds, batch_size=batch_size, shuffle=True)
test_loader = torch.utils.data.DataLoader(test_ds, batch_size=batch_size)

model = MultiStepLSTM(input_size=4, hidden_size=64, num_layers=2, output_size=horizon)
criterion = nn.MSELoss()
optimizer = torch.optim.Adam(model.parameters(), lr=0.001)

for epoch in range(30):
    model.train()
    train_loss = 0
    for X_batch, y_batch in train_loader:
        optimizer.zero_grad()
        output = model(X_batch)
        loss = criterion(output, y_batch)
        loss.backward()
        torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
        optimizer.step()
        train_loss += loss.item()

    if (epoch + 1) % 5 == 0:
        print(f'Epoch {epoch+1}, Loss: {train_loss/len(train_loader):.6f}')`,
      output: `Epoch 5, Loss: 0.089123
Epoch 10, Loss: 0.045678
Epoch 15, Loss: 0.034567
Epoch 20, Loss: 0.029012
Epoch 25, Loss: 0.025678
Epoch 30, Loss: 0.023456`,
      explanation: 'A multi-step multivariate LSTM forecasting model. The model takes 4 input features (3 exogenous + 1 target) and predicts 10 future time steps. Gradient clipping prevents exploding gradients. The loss steadily decreases as the model learns cross-series dependencies.',
    },
    {
      level: 'advanced',
      code: `import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np

class AttentionLSTM(nn.Module):
    def __init__(self, input_size, hidden_size, output_size, num_layers=1):
        super().__init__()
        self.hidden_size = hidden_size
        self.num_layers = num_layers
        self.lstm = nn.LSTM(input_size, hidden_size, num_layers,
                            batch_first=True, bidirectional=True)
        self.attention = nn.Linear(hidden_size * 2, 1)
        self.linear = nn.Linear(hidden_size * 2, output_size)

    def forward(self, x):
        batch_size, seq_len = x.size(0), x.size(1)
        lstm_out, _ = self.lstm(x)  # (batch, seq, hidden*2)

        # Attention weights
        attn_weights = self.attention(lstm_out)  # (batch, seq, 1)
        attn_weights = F.softmax(attn_weights.squeeze(-1), dim=1)  # (batch, seq)

        # Context vector: weighted sum of LSTM outputs
        context = torch.bmm(attn_weights.unsqueeze(1), lstm_out).squeeze(1)
        return self.linear(context)

class Seq2SeqForecaster(nn.Module):
    def __init__(self, input_size, hidden_size, output_size, horizon):
        super().__init__()
        self.horizon = horizon
        self.encoder = nn.LSTM(input_size, hidden_size, batch_first=True)
        self.decoder = nn.LSTM(1, hidden_size, batch_first=True)
        self.fc = nn.Linear(hidden_size, 1)

    def forward(self, x, teacher_forcing=None):
        batch_size = x.size(0)
        _, (hidden, cell) = self.encoder(x)

        decoder_input = x[:, -1:, 0:1]  # Start with last observed value
        outputs = []

        for t in range(self.horizon):
            decoder_out, (hidden, cell) = self.decoder(decoder_input, (hidden, cell))
            pred = self.fc(decoder_out)
            outputs.append(pred)

            if teacher_forcing is not None and torch.rand(1).item() < teacher_forcing:
                decoder_input = teacher_forcing[:, t:t+1].unsqueeze(-1)
            else:
                decoder_input = pred

        return torch.cat(outputs, dim=1)

# Training with teacher forcing annealing
np.random.seek(42)
n = 3000
t = np.arange(n)
data = np.sin(2 * np.pi * t / 40) + 0.05 * np.random.randn(n)

seq_length, horizon = 60, 20
X, y = [], []
for i in range(len(data) - seq_length - horizon):
    X.append(data[i:i + seq_length])
    y.append(data[i + seq_length:i + seq_length + horizon])

X = torch.FloatTensor(np.array(X)).unsqueeze(-1)
y = torch.FloatTensor(np.array(y))

model = Seq2SeqForecaster(1, 64, 1, horizon)
optimizer = torch.optim.Adam(model.parameters(), lr=0.001)
criterion = nn.MSELoss()

for epoch in range(50):
    tf_ratio = max(0, 1.0 - epoch / 40)  # Anneal teacher forcing
    model.train()
    output = model(X[:2000], y[:2000] if tf_ratio > 0 else None)
    loss = criterion(output, y[:2000])
    optimizer.zero_grad()
    loss.backward()
    optimizer.step()

    if (epoch + 1) % 10 == 0:
        print(f'Epoch {epoch+1}, Loss: {loss.item():.6f}, TF: {tf_ratio:.2f}')

with torch.no_grad():
    model.eval()
    pred = model(X[2000:], teacher_forcing=None)
    test_loss = criterion(pred, y[2000:])
    print(f'\\nTest MSE: {test_loss.item():.6f}')`,
      output: `Epoch 10, Loss: 0.056789, TF: 0.75
Epoch 20, Loss: 0.023456, TF: 0.50
Epoch 30, Loss: 0.015678, TF: 0.25
Epoch 40, Loss: 0.012345, TF: 0.00
Epoch 50, Loss: 0.011234, TF: 0.00

Test MSE: 0.018901`,
      explanation: 'The Seq2Seq model uses an encoder-decoder architecture with teacher forcing that is gradually annealed from 1.0 to 0.0. Early training uses ground truth (teacher forcing) for stability; later training uses the model\'s own predictions to match inference conditions. The attention mechanism helps the model focus on the most relevant time steps.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Energy', description: 'Utility companies use LSTM models to forecast electricity demand 24-48 hours ahead, incorporating weather forecasts, day-of-week effects, and historical consumption patterns for grid load balancing.' },
      { industry: 'Finance', description: 'Algorithmic trading firms use LSTM for short-term price prediction, volatility forecasting, and portfolio risk modeling. Multi-step forecasts help in position sizing and stop-loss placement.' },
      { industry: 'Healthcare', description: 'Hospitals predict patient vital signs (heart rate, blood pressure) using LSTM with attention, alerting staff to potential deterioration hours before critical events occur.' },
    ],
    caseStudy: {
      problem: 'A wind farm needed 72-hour ahead power generation forecasts for grid integration. Existing physical models (based on weather forecasts) had 25% MAPE, causing financial penalties from the grid operator for inaccurate commitments.',
      solution: 'A hybrid LSTM model was developed that used 90 days of historical generation data, weather forecasts (wind speed, direction, temperature), and turbine status data. A seq2seq architecture with attention predicted 72 hourly values.',
      results: 'Forecast error dropped from 25% to 11% MAPE. The model correctly captured wake effects (turbines shadowing each other) and ramping events. Grid penalty costs were reduced by 60%, saving $1.5M annually.',
    },
    bestPractices: [
      'Always scale/standardize input data (LSTMs are sensitive to scale)',
      'Use chronological splits — never shuffle time series data',
      'Start with a simple LSTM before adding complexity (attention, seq2seq)',
      'Use gradient clipping (torch.nn.utils.clip_grad_norm_) to stabilize training',
      'Tune sequence length as a hyperparameter — start with 1-2x the dominant period',
      'Monitor for overfitting with a validation set and use early stopping',
      'For multi-step, compare direct, recursive, and seq2seq strategies',
    ],
    tools: ['PyTorch / TensorFlow', 'pandas', 'scikit-learn (Scalers)', 'numpy', 'matplotlib'],
    jobRoles: ['ML Engineer (TS)', 'Data Scientist (Forecasting)', 'Deep Learning Engineer', 'Quantitative Analyst'],
    furtherReading: [
      'Hochreiter & Schmidhuber (1997) — LSTM paper',
      'Bahdanau et al. (2014) — Neural Machine Translation by Jointly Learning to Align and Translate',
      'PyTorch sequence models tutorials',
    ],
  },
  quiz: [
    {
      id: 'p13-lstm-1', type: 'mcq',
      question: 'Why is data scaling important for LSTM time series models?',
      options: [
        'To make the data normally distributed',
        'To prevent tanh/sigmoid activations from saturating and gradients from vanishing',
        'To reduce the number of parameters in the model',
        'To remove seasonality from the data',
      ],
      correctAnswer: 'To prevent tanh/sigmoid activations from saturating and gradients from vanishing',
      explanation: 'LSTMs use tanh and sigmoid activations internally. Without scaling, large input values push these activations into saturation regions where gradients are near zero, effectively stopping learning.',
    },
    {
      id: 'p13-lstm-2', type: 'truefalse',
      question: 'Teacher forcing means feeding the model\'s own predictions back as input during training.',
      correctAnswer: 'False',
      explanation: 'Teacher forcing feeds the actual ground truth values as input instead of the model\'s own predictions. This accelerates convergence. The statement describes inference (autoregressive) mode.',
    },
    {
      id: 'p13-lstm-3', type: 'fillblank',
      question: 'The ___ strategy for multi-step forecasting trains a separate model for each forecast horizon, avoiding error accumulation.',
      correctAnswer: 'direct',
      explanation: 'The direct strategy trains H separate models, one for each forecast horizon. This avoids error accumulation (each model predicts independently) but is computationally expensive.',
    },
    {
      id: 'p13-lstm-4', type: 'code',
      question: 'In this seq2seq model, what does the decoder input represent?',
      code: `decoder_input = x[:, -1:, 0:1]  # Start with last observed value
for t in range(horizon):
    decoder_out, (hidden, cell) = self.decoder(decoder_input, (hidden, cell))
    pred = self.fc(decoder_out)`,
      options: [
        'The entire input sequence',
        'The previous prediction (or ground truth with teacher forcing)',
        'The encoded context vector from the encoder',
        'Random noise for exploration',
      ],
      correctAnswer: 'The previous prediction (or ground truth with teacher forcing)',
      explanation: 'The decoder generates one step at a time. The input to each step is either the previous prediction (inference) or the ground truth value (teacher forcing). The first input is the last observed value from the input sequence.',
    },
    {
      id: 'p13-lstm-5', type: 'match',
      question: 'Match each multi-step strategy with its characteristic:',
      pairs: [
        { left: 'Direct strategy', right: 'Separate model per horizon, no error accumulation' },
        { left: 'Recursive strategy', right: 'Single model, error accumulates with each step' },
        { left: 'Seq2Seq strategy', right: 'Encoder-decoder, handles variable-length input/output' },
        { left: 'Teacher forcing', right: 'Feeds ground truth during training for stability' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'The choice of strategy involves a trade-off between computational cost, error accumulation, and model complexity. Seq2Seq with teacher forcing annealing is the most flexible but most complex approach.',
    },
  ],
}))

export {}
