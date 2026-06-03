import { registerContent } from '@/content/index'

registerContent('p8-rnn-lstm', () => ({
  difficulty: 'Advanced',
  estimatedTime: '55 minutes',
  prerequisites: ['p8-nn-basics', 'p8-backpropagation'],
  tags: ['Phase 8', 'Deep Learning', 'RNN', 'LSTM'],
  objectives: [
    'Understand the RNN formulation for sequential data',
    'Explain the vanishing gradient problem in RNNs',
    'Implement an LSTM and understand its gating mechanism',
    'Build a character-level text generation model',
    'Perform sentiment classification with LSTM',
  ],
  theory: `# RNN & LSTM

## Recurrent Neural Networks (RNNs)

RNNs process sequential data by maintaining a **hidden state** that is updated at each time step:

$$ h_t = \\tanh(W_{hh} h_{t-1} + W_{xh} x_t + b_h) $$

$$ y_t = W_{hy} h_t + b_y $$

Where:
- $h_t$ is the hidden state at time $t$
- $x_t$ is the input at time $t$
- $W_{hh}$ is the recurrent weight matrix
- $W_{xh}$ is the input weight matrix
- $W_{hy}$ is the output weight matrix

### Sequential Processing

Unlike feedforward networks, RNNs process inputs **one time step at a time**, maintaining a memory of previous inputs through the hidden state.

### Unrolling Through Time

An RNN for a sequence of length $T$ can be unrolled into a feedforward network with $T$ layers, each sharing the same weights. This is how backpropagation through time (BPTT) works.

## Vanishing and Exploding Gradients in RNNs

The gradient at time step $k$ back to step $i$ involves repeated multiplication by $W_{hh}^T$:

$$ \\frac{\\partial L}{\\partial h_i} \\propto \\prod_{j=i}^{k-1} W_{hh}^T \\cdot \\text{diag}(\\tanh'(h_j)) $$

If the eigenvalues of $W_{hh}$ are < 1, gradients **vanish** (long-term dependencies lost).
If eigenvalues > 1, gradients **explode** (training instability).

This is why vanilla RNNs struggle with long sequences (>20-30 steps).

## LSTM (Long Short-Term Memory)

LSTM (Hochreiter & Schmidhuber, 1997) introduces a **cell state** $C_t$ and **gating mechanisms** to control information flow.

### Forget Gate

Controls what to discard from the cell state:

$$ f_t = \\sigma(W_f \\cdot [h_{t-1}, x_t] + b_f) $$

Output: values in (0, 1) — 0 means "completely forget", 1 means "completely retain".

### Input Gate

Controls what new information to store:

$$ i_t = \\sigma(W_i \\cdot [h_{t-1}, x_t] + b_i) $$
$$ \\tilde{C}_t = \\tanh(W_C \\cdot [h_{t-1}, x_t] + b_C) $$

### Cell State Update

$$ C_t = f_t \\odot C_{t-1} + i_t \\odot \\tilde{C}_t $$

The cell state is the "memory" of the LSTM. The forget gate decides what to erase, and the input gate decides what to add.

### Output Gate

Controls what to output from the cell state:

$$ o_t = \\sigma(W_o \\cdot [h_{t-1}, x_t] + b_o) $$
$$ h_t = o_t \\odot \\tanh(C_t) $$

### Bidirectional RNNs

Process the sequence in both forward and backward directions:

$$ \\vec{h}_t = \\text{RNN}_{\\text{fwd}}(x_t, \\vec{h}_{t-1}) $$
$$ \\mathleft{h}_t = \\text{RNN}_{\\text{bwd}}(x_t, \\mathleft{h}_{t+1}) $$
$$ h_t = [\\vec{h}_t; \\mathleft{h}_t] $$

The final hidden state is the concatenation of both directions, capturing context from past and future.

### Teacher Forcing

During training, the model receives the **true previous token** as input instead of its own prediction. This stabilizes training but creates exposure bias at inference.

### Truncation

Backpropagation through time is limited to a fixed window (e.g., 100 steps) to manage memory and computation.`,
  understanding: {
    analogy: 'Reading a book word by word: vanilla RNN is like a reader with poor short-term memory who can only remember the last few sentences. LSTM is like a reader with a notebook (cell state) who deliberately decides what to write down (input gate), what to erase (forget gate), and what to read aloud (output gate). This allows understanding long novels by maintaining key information throughout.',
    steps: [
      { title: 'Initialize State', content: 'Initialize hidden state $h_0$ and cell state $C_0$ (for LSTM) to zeros or learned initial values.' },
      { title: 'Process Input Step', content: 'At each time step, feed input $x_t$ and previous hidden state $h_{t-1}$ through the RNN/LSTM cell.' },
      { title: 'Update States', content: 'Compute new hidden state $h_t$ (and cell state $C_t$ for LSTM) using the gating mechanisms.' },
      { title: 'Produce Output', content: 'Generate output $y_t$ from the hidden state $h_t$, which can be a prediction for that time step.' },
      { title: 'Backpropagate Through Time', content: 'Compute gradients by unrolling the network through time and applying backpropagation (BPTT).' },
    ],
    misconceptions: [
      { misconception: 'LSTM completely solves the vanishing gradient problem', truth: 'LSTM significantly mitigates vanishing gradients through the cell state and additive gradient flow, but very long sequences (1000+ steps) can still be challenging, especially with certain gating configurations.' },
      { misconception: 'RNNs and LSTMs process entire sequences in parallel', truth: 'RNNs are inherently sequential — each step depends on the previous hidden state. True parallelization requires transformers or CNN-based alternatives.' },
    ],
    comparisons: [
      { label: 'Long-term memory', methodA: 'Vanilla RNN: Poor (vanishing gradient after ~20 steps)', methodB: 'LSTM: Good (cell state preserves info for 100+ steps)' },
      { label: 'Parameter count', methodA: 'RNN: Fewer (one weight matrix per connection)', methodB: 'LSTM: 4x more (forget, input, output gates + candidate)' },
      { label: 'Training difficulty', methodA: 'RNN: Simple but unstable', methodB: 'LSTM: More complex but more stable' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `import torch
import torch.nn as nn

# Vanilla RNN
rnn = nn.RNN(input_size=10, hidden_size=20, num_layers=1,
             batch_first=True)
x = torch.randn(4, 15, 10)  # (batch, seq_len, input_size)
out, h_n = rnn(x)
print(f"Input shape:  {x.shape}")
print(f"Output shape: {out.shape}")
print(f"Hidden state: {h_n.shape}")

# LSTM
lstm = nn.LSTM(input_size=10, hidden_size=20, num_layers=1,
               batch_first=True)
out_lstm, (h_n, c_n) = lstm(x)
print(f"LSTM output:  {out_lstm.shape}")
print(f"LSTM h_n:     {h_n.shape}")
print(f"LSTM c_n:     {c_n.shape}")`,
      output: `Input shape:  torch.Size([4, 15, 10])
Output shape: torch.Size([4, 15, 20])
Hidden state: torch.Size([1, 4, 20])
LSTM output:  torch.Size([4, 15, 20])
LSTM h_n:     torch.Size([1, 4, 20])
LSTM c_n:     torch.Size([1, 4, 20])`,
      explanation: 'nn.RNN and nn.LSTM process sequences with batch_first=True, so input is (batch, seq_len, input_size). Output is all hidden states across time steps, h_n is the final hidden state, c_n is the final cell state (LSTM only).',
    },
    {
      level: 'intermediate',
      code: `import torch
import torch.nn as nn
import torch.optim as optim

class CharRNN(nn.Module):
    def __init__(self, vocab_size, embed_dim=32, hidden_dim=64):
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, embed_dim)
        self.rnn = nn.RNN(embed_dim, hidden_dim, batch_first=True)
        self.fc = nn.Linear(hidden_dim, vocab_size)

    def forward(self, x, hidden=None):
        x = self.embedding(x)
        out, hidden = self.rnn(x, hidden)
        out = self.fc(out)  # (batch, seq_len, vocab_size)
        return out, hidden

    def generate(self, start_idx, length, device):
        self.eval()
        input_idx = torch.tensor([[start_idx]]).to(device)
        hidden = None
        outputs = [start_idx]

        for _ in range(length):
            logits, hidden = self(input_idx, hidden)
            probs = torch.softmax(logits[0, -1], dim=0)
            next_idx = torch.multinomial(probs, 1).item()
            outputs.append(next_idx)
            input_idx = torch.tensor([[next_idx]]).to(device)

        return outputs

# Dummy training
model = CharRNN(vocab_size=50)
optimizer = optim.Adam(model.parameters(), lr=0.01)
criterion = nn.CrossEntropyLoss()

x = torch.randint(0, 50, (4, 20))
y = torch.randint(0, 50, (4, 20))
logits, _ = model(x)
loss = criterion(logits.reshape(-1, 50), y.reshape(-1))
loss.backward()
optimizer.step()
print(f"Loss: {loss.item():.4f}")`,
      output: `Loss: 3.9185`,
      explanation: 'A character-level RNN. The generate method samples autoregressively from the predicted distribution. Training uses cross-entropy between predicted logits and the next character in the sequence.',
    },
    {
      level: 'advanced',
      code: `import torch
import torch.nn as nn
import torch.optim as optim

class SentimentLSTM(nn.Module):
    def __init__(self, vocab_size, embed_dim=100,
                 hidden_dim=128, num_layers=2,
                 num_classes=2, dropout=0.3):
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, embed_dim,
                                      padding_idx=0)
        self.lstm = nn.LSTM(
            embed_dim, hidden_dim, num_layers,
            batch_first=True, dropout=dropout,
            bidirectional=True,
        )
        self.classifier = nn.Sequential(
            nn.Linear(hidden_dim * 2, 64),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(64, num_classes),
        )

    def forward(self, x, lengths):
        # x: (batch, seq_len) token indices
        # lengths: original lengths before padding
        x = self.embedding(x)

        # Pack padded sequence for efficient LSTM
        x = nn.utils.rnn.pack_padded_sequence(
            x, lengths.cpu(), batch_first=True,
            enforce_sorted=False
        )
        _, (hidden, cell) = self.lstm(x)

        # Concatenate forward and backward final states
        # hidden: (num_layers * 2, batch, hidden_dim)
        h_fwd = hidden[-2, :, :]
        h_bwd = hidden[-1, :, :]
        h_combined = torch.cat([h_fwd, h_bwd], dim=1)

        return self.classifier(h_combined)

# Test model
model = SentimentLSTM(vocab_size=10000)
x = torch.randint(0, 10000, (4, 50))
lengths = torch.tensor([50, 45, 40, 35])
logits = model(x, lengths)
print(f"Logits shape: {logits.shape}")
print(f"Sentiment scores (batch of 4): {logits.argmax(1)}")`,
      output: `Logits shape: torch.Size([4, 2])
Sentiment scores (batch of 4): tensor([0, 1, 0, 1])`,
      explanation: 'A bidirectional LSTM for sentiment classification. pack_padded_sequence handles variable-length sequences efficiently. The final forward and backward hidden states are concatenated to capture context from both directions.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Speech Recognition', description: 'Bidirectional LSTMs were the backbone of early deep learning speech recognition systems (DeepSpeech, Listen-Attend-Spell). They model acoustic sequences with forward and backward temporal context.' },
      { industry: 'Machine Translation', description: 'Seq2Seq models with LSTM encoders and decoders powered early neural machine translation (Google Neural Machine Translation, 2016). Attention mechanisms on top of LSTM states enabled fluent translation.' },
      { industry: 'Time Series Forecasting', description: 'LSTMs forecast stock prices, energy demand, weather, and sensor data by learning long-term temporal dependencies that traditional ARIMA models cannot capture.' },
    ],
    caseStudy: {
      problem: 'A manufacturing company needed to predict equipment failures 24 hours in advance using sensor time series (temperature, vibration, pressure from 200 sensors at 1Hz). Early RNN models could only predict 30 minutes ahead due to vanishing gradients.',
      solution: 'They deployed a stacked bidirectional LSTM with 3 layers, 256 hidden units each, processing 24-hour windows of sensor data. Gradient clipping (max_norm=1.0) and scheduled sampling addressed training instability.',
      results: 'Failure prediction accuracy reached 93% at 24 hours ahead (from 55% with vanilla RNN). False alarm rate dropped from 30% to 4%. The system prevented 15 major equipment failures in the first year, saving $8M in downtime costs.',
    },
    bestPractices: [
      'Use gradient clipping (max_norm=1.0) to prevent exploding gradients in RNNs/LSTMs',
      'Pack padded sequences with pack_padded_sequence for efficient batch processing',
      'Use bidirectional LSTMs when future context is available (not for real-time generation)',
      'Set dropout between LSTM layers (not within) using the dropout parameter',
      'Initialize forget gate bias to 1.0 to reduce forgetting at the start of training',
      'Use teacher forcing during training but switch to scheduled sampling for better inference',
      'Truncate BPTT to 100-200 steps for very long sequences',
    ],
    tools: ['nn.RNN', 'nn.LSTM', 'nn.GRU', 'nn.utils.rnn.pack_padded_sequence', 'nn.utils.rnn.PackedSequence', 'torchtext (tokenization, datasets)', 'Hugging Face Transformers (modern seq models)', 'JAX (fast RNN implementations)'],
    jobRoles: ['NLP Engineer', 'Speech Recognition Engineer', 'Time Series Analyst', 'Deep Learning Engineer'],
    furtherReading: [
      'Hochreiter, S. & Schmidhuber, J. (1997). Long Short-Term Memory',
      'Graves, A. (2012). Supervised Sequence Labelling with Recurrent Neural Networks',
      'Sutskever, I. et al. (2014). Sequence to Sequence Learning with Neural Networks',
      'Pascanu, R. et al. (2013). On the difficulty of training recurrent neural networks',
    ],
  },
  quiz: [
    {
      id: 'rnn-1', type: 'mcq',
      question: 'How does LSTM address the vanishing gradient problem in vanilla RNNs?',
      options: [
        'It uses ReLU activation instead of tanh',
        'The cell state has additive gradient flow through the forget gate, allowing gradients to propagate over many time steps',
        'It reduces the number of time steps',
        'It increases the hidden state dimension',
      ],
      correctAnswer: 'The cell state has additive gradient flow through the forget gate, allowing gradients to propagate over many time steps',
      explanation: 'The LSTM cell state $C_t = f_t \\odot C_{t-1} + i_t \\odot \\tilde{C}_t$ provides an additive gradient path that does not involve repeated matrix multiplication, mitigating vanishing gradients.',
    },
    {
      id: 'rnn-2', type: 'truefalse',
      question: 'The LSTM hidden state $h_t$ and cell state $C_t$ contain the same information.',
      correctAnswer: 'False',
      explanation: 'The cell state $C_t$ is the long-term memory, while the hidden state $h_t$ is the gated output of the cell state. $h_t = o_t \\odot \\tanh(C_t)$, where the output gate controls what information is exposed.',
    },
    {
      id: 'rnn-3', type: 'code',
      question: 'What is the correct input shape for nn.LSTM when batch_first=True?',
      code: `lstm = nn.LSTM(input_size=50, hidden_size=100,
                 batch_first=True)
# What shape should x be?`,
      options: [
        '(seq_len, batch, input_size)',
        '(batch, seq_len, input_size)',
        '(batch, input_size, seq_len)',
        '(input_size, batch, seq_len)',
      ],
      correctAnswer: '(batch, seq_len, input_size)',
      explanation: 'When batch_first=True, the expected input shape is (batch, seq_len, input_size). When batch_first=False (default), the shape is (seq_len, batch, input_size).',
    },
    {
      id: 'rnn-4', type: 'fillblank',
      question: 'In an LSTM, the forget gate activation function is ___, producing values between 0 (completely forget) and 1 (completely retain).',
      correctAnswer: 'sigmoid',
      explanation: 'The forget gate uses the sigmoid activation function $\\sigma$ to produce values in (0, 1), determining how much of the previous cell state to retain.',
    },
    {
      id: 'rnn-5', type: 'match',
      question: 'Match each LSTM gate to its function:',
      pairs: [
        { left: 'Forget gate', right: 'Determines what to discard from the cell state' },
        { left: 'Input gate', right: 'Determines what new information to store' },
        { left: 'Output gate', right: 'Determines what to expose from the cell state to the hidden state' },
        { left: 'Cell state', right: 'The long-term memory that carries information across time steps' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'The three gates (forget, input, output) regulate information flow to and from the cell state, which serves as the memory channel throughout the sequence.',
    },
  ],
}))

export {}
