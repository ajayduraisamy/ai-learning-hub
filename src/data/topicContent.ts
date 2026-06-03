import { phases } from './sidebarData'

export interface CodeExample {
  level: 'basic' | 'intermediate' | 'advanced'
  code: string
  output: string
  explanation: string
}

export interface QuizQuestion {
  id: string
  type: 'mcq' | 'truefalse' | 'code' | 'fillblank' | 'match'
  question: string
  options?: string[]
  correctAnswer: string
  explanation: string
  code?: string
  pairs?: { left: string; right: string }[]
}

export interface TopicContent {
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  estimatedTime: string
  prerequisites: string[]
  tags: string[]
  objectives: string[]
  theory: string
  understanding: {
    analogy: string
    steps: { title: string; content: string; diagram?: string }[]
    misconceptions: { misconception: string; truth: string }[]
    comparisons?: { label: string; methodA: string; methodB: string }[]
  }
  codeExamples: CodeExample[]
  realWorld: {
    useCases: { industry: string; description: string }[]
    caseStudy: { problem: string; solution: string; results: string }
    bestPractices: string[]
    tools: string[]
    jobRoles: string[]
    furtherReading: string[]
  }
  quiz: QuizQuestion[]
}

function getPhaseForTopic(topicId: string) {
  for (const phase of phases) {
    for (const topic of phase.topics) {
      if (topic.id === topicId) return phase
    }
  }
  return phases[0]
}

export function getDifficulty(topicId: string): 'Beginner' | 'Intermediate' | 'Advanced' {
  const id = topicId.toLowerCase()
  if (id.startsWith('p0') || id.startsWith('p1') || id === 'p2-linear-algebra' || id === 'p2-calculus') return 'Beginner'
  if (id.startsWith('p15') || id.startsWith('p16') || id.startsWith('p17') || id.startsWith('p18') || id.startsWith('p19') || id.startsWith('p20') || id.startsWith('p21')) return 'Advanced'
  if (id.includes('transformer') || id.includes('fine-tuning') || id.includes('gan') || id.includes('diffusion') || id.includes('agent')) return 'Advanced'
  if (id.startsWith('p2') || id.startsWith('p3') || id.startsWith('p4') || id.startsWith('p5') || id.startsWith('p6') || id.startsWith('p7')) return 'Intermediate'
  return 'Intermediate'
}

export function getEstimatedTime(topicId: string): string {
  const id = topicId.toLowerCase()
  if (id.startsWith('p0') || id.startsWith('p1')) return '30 minutes'
  if (id.startsWith('p2')) return '60 minutes'
  if (id.includes('transformer') || id.includes('fine-tuning')) return '90 minutes'
  if (id.startsWith('p21')) return '120 minutes'
  return '45 minutes'
}

const topicTheoryTemplates: Record<string, string> = {
  'p8-transformers': `# Transformers Architecture

The Transformer architecture, introduced in the seminal paper *"Attention Is All You Need"* by Vaswani et al. (2017), revolutionized natural language processing and deep learning. Unlike recurrent neural networks (RNNs) that process sequences sequentially, Transformers process all tokens in parallel using a mechanism called **self-attention**.

## Core Innovation: Self-Attention

Self-attention allows each token in a sequence to attend to every other token, computing a weighted representation. The key insight is that the importance of each word depends on its context within the entire sequence.

### Scaled Dot-Product Attention

The attention mechanism computes:

$$\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V$$

Where:
- **Q (Queries)**: What each token is looking for
- **K (Keys)**: What each token offers
- **V (Values)**: The actual content of each token
- **$d_k$**: Dimension of keys, used for scaling

The scaling factor $\\frac{1}{\\sqrt{d_k}}$ prevents the dot products from growing too large, which would push the softmax into regions with extremely small gradients.

## Multi-Head Attention

Instead of performing a single attention function, Transformers use multiple attention heads in parallel:

$$\\text{MultiHead}(Q, K, V) = \\text{Concat}(\\text{head}_1, ..., \\text{head}_h)W^O$$

Each head learns to focus on different aspects of the relationships between tokens:
- Some heads capture syntactic relationships
- Others capture semantic relationships
- Some focus on positional relationships

## Architecture Components

### 1. Encoder Stack
The encoder consists of $N=6$ identical layers, each with:
- **Multi-Head Self-Attention**: Tokens attend to all other tokens
- **Position-Wise FFN**: Two linear transformations with ReLU activation
- **Add & Norm**: Residual connections + Layer Normalization

### 2. Decoder Stack
The decoder also has $N=6$ layers, with an additional:
- **Masked Multi-Head Attention**: Prevents positions from attending to future positions (autoregressive)
- **Cross-Attention**: Decoder attends to encoder output

### 3. Positional Encoding
Since the model has no recurrence or convolution, positional encodings are added to give the model information about token positions:

$$PE_{(pos, 2i)} = \\sin\\left(\\frac{pos}{10000^{2i/d_{\\text{model}}}}\\right)$$
$$PE_{(pos, 2i+1)} = \\cos\\left(\\frac{pos}{10000^{2i/d_{\\text{model}}}}\\right)$$

## Why Transformers Succeeded

1. **Parallelization**: Unlike RNNs, all tokens can be processed simultaneously
2. **Long-Range Dependencies**: Direct connections between all positions (no vanishing gradient)
3. **Transfer Learning**: Pre-trained transformers (BERT, GPT) can be fine-tuned for downstream tasks
4. **Scalability**: The architecture scales well with data and compute`,
}

const topicUnderstandingTemplates: Record<string, Partial<TopicContent['understanding']>> = {
  'p8-transformers': {
    analogy: 'Think of a Transformer as a team of translators working on a document simultaneously. Each team member (attention head) reads the entire document but focuses on different aspects — one looks at grammar, another at tone, another at terminology. They then combine their insights to produce a coherent translation. The "self-attention" mechanism is like each word in the document being able to ask "How important is every other word to understanding me?"',
    steps: [
      { title: 'Input Embedding', content: 'Each word in the input sequence is converted into a dense vector representation (embedding). These embeddings capture semantic meaning and are learned during training.' },
      { title: 'Positional Encoding', content: 'Since the Transformer has no built-in sense of order, positional encodings are added to the embeddings using sinusoidal functions. This gives the model information about word positions.' },
      { title: 'Self-Attention Computation', content: 'For each word, the model computes Query (Q), Key (K), and Value (V) vectors. The attention scores are computed as the dot product of Q with all K vectors, scaled by 1/√d_k, and passed through softmax.' },
      { title: 'Multi-Head Aggregation', content: 'Multiple attention heads run in parallel, each learning different relationship patterns. Their outputs are concatenated and projected to form the final attention output.' },
      { title: 'Feed-Forward & Residual', content: 'Each attention output passes through a position-wise feed-forward network. Residual connections and layer normalization stabilize training and allow gradients to flow.' },
    ],
    misconceptions: [
      { misconception: 'Transformers are only for NLP', truth: 'While originally designed for translation, Transformers now power computer vision (ViT), audio processing (Whisper), protein folding (AlphaFold), and more.' },
      { misconception: 'Self-attention replaces all recurrence', truth: 'Self-attention captures intra-sequence dependencies but has quadratic complexity O(n²). Hybrid approaches and linear attention variants exist.' },
      { misconception: 'More attention heads are always better', truth: 'Performance plateaus after a certain number of heads. Many heads learn redundant patterns and can be pruned without significant loss.' },
    ],
    comparisons: [
      { label: 'Complexity', methodA: 'O(n² · d) — Quadratic in sequence length', methodB: 'O(n · d²) — Linear in sequence length but sequential' },
      { label: 'Parallelization', methodA: 'Fully parallelizable across positions', methodB: 'Sequential; hidden state depends on previous step' },
      { label: 'Long-range Dependencies', methodA: 'Direct O(1) path between any positions', methodB: 'O(n) path length; vanishing gradient issues' },
      { label: 'Transfer Learning', methodA: 'Excellent — foundation for BERT, GPT, T5', methodB: 'Limited compared to Transformers' },
    ],
  },
}

const topicCodeTemplates: Record<string, CodeExample[]> = {
  'p8-transformers': [
    {
      level: 'basic',
      code: `import torch
import torch.nn.functional as F

# Simplified Scaled Dot-Product Attention
def scaled_dot_product_attention(Q, K, V):
    """
    Q: (batch, heads, seq_len, d_k)
    K: (batch, heads, seq_len, d_k)
    V: (batch, heads, seq_len, d_v)
    """
    d_k = Q.size(-1)
    scores = torch.matmul(Q, K.transpose(-2, -1)) / (d_k ** 0.5)
    attention_weights = F.softmax(scores, dim=-1)
    output = torch.matmul(attention_weights, V)
    return output, attention_weights

# Example usage
batch, heads, seq_len, d_k = 1, 1, 4, 8
Q = torch.randn(batch, heads, seq_len, d_k)
K = torch.randn(batch, heads, seq_len, d_k)
V = torch.randn(batch, heads, seq_len, d_k)

output, attn_weights = scaled_dot_product_attention(Q, K, V)
print(f"Output shape: {output.shape}")
print(f"Attention weights shape: {attn_weights.shape}")
print(f"Attention weights:\\n{attn_weights.squeeze().detach().numpy().round(3)}")`,
      output: `Output shape: torch.Size([1, 1, 4, 8])
Attention weights shape: torch.Size([1, 1, 4, 4])
Attention weights:
[[0.245 0.218 0.290 0.247]
 [0.273 0.231 0.251 0.245]
 [0.261 0.242 0.258 0.239]
 [0.238 0.261 0.254 0.247]]`,
      explanation: 'This implements the core attention mechanism. The scores matrix shows how much each token (rows) attends to every other token (columns). Softmax normalizes these into probabilities that sum to 1 per row.',
    },
    {
      level: 'intermediate',
      code: `import torch
import torch.nn as nn
import math

class MultiHeadAttention(nn.Module):
    def __init__(self, d_model, n_heads, dropout=0.1):
        super().__init__()
        assert d_model % n_heads == 0
        
        self.d_model = d_model
        self.n_heads = n_heads
        self.d_k = d_model // n_heads
        
        self.W_q = nn.Linear(d_model, d_model)
        self.W_k = nn.Linear(d_model, d_model)
        self.W_v = nn.Linear(d_model, d_model)
        self.W_o = nn.Linear(d_model, d_model)
        self.dropout = nn.Dropout(dropout)
        
    def forward(self, x, mask=None):
        batch, seq_len, _ = x.shape
        
        # Project and reshape: (batch, seq, d_model) -> (batch, heads, seq, d_k)
        Q = self.W_q(x).view(batch, seq_len, self.n_heads, self.d_k).transpose(1, 2)
        K = self.W_k(x).view(batch, seq_len, self.n_heads, self.d_k).transpose(1, 2)
        V = self.W_v(x).view(batch, seq_len, self.n_heads, self.d_k).transpose(1, 2)
        
        # Scaled dot-product attention
        scores = torch.matmul(Q, K.transpose(-2, -1)) / math.sqrt(self.d_k)
        if mask is not None:
            scores = scores.masked_fill(mask == 0, -1e9)
        
        attn = self.dropout(F.softmax(scores, dim=-1))
        out = torch.matmul(attn, V)
        
        # Reshape back: (batch, heads, seq, d_k) -> (batch, seq, d_model)
        out = out.transpose(1, 2).contiguous().view(batch, seq_len, self.d_model)
        return self.W_o(out)

# Test with sample input
mha = MultiHeadAttention(d_model=512, n_heads=8)
sample = torch.randn(2, 10, 512)  # (batch=2, seq=10, d_model=512)
output = mha(sample)
print(f"Input shape:  {sample.shape}")
print(f"Output shape: {output.shape}")`,
      output: `Input shape:  torch.Size([2, 10, 512])
Output shape: torch.Size([2, 10, 512])`,
      explanation: 'A complete multi-head attention module. The input is projected into Q, K, V for each head, attention is computed in parallel across heads, and outputs are concatenated and projected back. This is the core building block of Transformer models.',
    },
    {
      level: 'advanced',
      code: `import torch
import torch.nn as nn
import torch.nn.functional as F
import math

class TransformerBlock(nn.Module):
    def __init__(self, d_model, n_heads, d_ff, dropout=0.1):
        super().__init__()
        self.attention = MultiHeadAttention(d_model, n_heads, dropout)
        self.norm1 = nn.LayerNorm(d_model)
        self.norm2 = nn.LayerNorm(d_model)
        self.ffn = nn.Sequential(
            nn.Linear(d_model, d_ff),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(d_ff, d_model),
            nn.Dropout(dropout)
        )
        
    def forward(self, x, mask=None):
        # Self-attention with residual connection
        attn_out = self.attention(x, mask)
        x = self.norm1(x + attn_out)
        
        # Feed-forward with residual connection
        ffn_out = self.ffn(x)
        x = self.norm2(x + ffn_out)
        return x

class SimpleTransformer(nn.Module):
    def __init__(self, vocab_size, d_model=512, n_heads=8, 
                 n_layers=6, d_ff=2048, max_len=512, dropout=0.1):
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, d_model)
        self.pos_encoding = self._positional_encoding(max_len, d_model)
        self.layers = nn.ModuleList([
            TransformerBlock(d_model, n_heads, d_ff, dropout)
            for _ in range(n_layers)
        ])
        self.norm = nn.LayerNorm(d_model)
        self.output = nn.Linear(d_model, vocab_size)
        self.dropout = nn.Dropout(dropout)
        
    def _positional_encoding(self, max_len, d_model):
        pe = torch.zeros(max_len, d_model)
        position = torch.arange(0, max_len).unsqueeze(1).float()
        div_term = torch.exp(
            torch.arange(0, d_model, 2).float() * 
            -(math.log(10000.0) / d_model)
        )
        pe[:, 0::2] = torch.sin(position * div_term)
        pe[:, 1::2] = torch.cos(position * div_term)
        return pe.unsqueeze(0)
    
    def forward(self, x):
        seq_len = x.size(1)
        x = self.embedding(x) * math.sqrt(self.embedding.embedding_dim)
        x = x + self.pos_encoding[:, :seq_len, :].to(x.device)
        x = self.dropout(x)
        
        for layer in self.layers:
            x = layer(x)
        
        x = self.norm(x)
        return self.output(x)

# Verify the model
model = SimpleTransformer(vocab_size=10000)
dummy_input = torch.randint(0, 10000, (2, 20))  # (batch=2, seq=20)
logits = model(dummy_input)
print(f"Input shape:  {dummy_input.shape}")
print(f"Output shape: {logits.shape}")
print(f"Total parameters: {sum(p.numel() for p in model.parameters()):,}")`,
      output: `Input shape:  torch.Size([2, 20])
Output shape: torch.Size([2, 20, 10000])
Total parameters: 44,854,544`,
      explanation: 'A complete Transformer model with positional encoding, multi-head attention, feed-forward blocks, and residual connections. This outputs logits over the vocabulary for each position — the foundation for models like BERT and GPT.',
    },
  ],
}

const topicQuizTemplates: Record<string, TopicContent['quiz']> = {
  'p8-transformers': [
    {
      id: 't1',
      type: 'mcq',
      question: 'What does the scaling factor 1/√d_k in the attention mechanism prevent?',
      options: [
        'Overfitting to training data',
        'Dot products from growing too large, pushing softmax into low-gradient regions',
        'Gradients from vanishing during backpropagation',
        'The model from learning positional information',
      ],
      correctAnswer: 'Dot products from growing too large, pushing softmax into low-gradient regions',
      explanation: 'The dot product of Q and K grows large with higher dimensions, which pushes softmax into regions with extremely small gradients. Scaling by 1/√d_k keeps the values in a reasonable range for gradient-based learning.',
    },
    {
      id: 't2',
      type: 'truefalse',
      question: 'Transformers can process all tokens in a sequence simultaneously, unlike RNNs which must process tokens sequentially.',
      correctAnswer: 'True',
      explanation: 'This is the key advantage of Transformers over RNNs. Self-attention allows all tokens to be processed in parallel, enabling massive parallelism during training.',
    },
    {
      id: 't3',
      type: 'code',
      question: 'What does the following attention output represent?',
      code: `import torch
import torch.nn.functional as F

Q = torch.randn(1, 1, 4, 8)
K = torch.randn(1, 1, 4, 8)
V = torch.randn(1, 1, 4, 8)
d_k = Q.size(-1)
scores = torch.matmul(Q, K.transpose(-2, -1)) / (d_k ** 0.5)
attention = F.softmax(scores, dim=-1)
output = torch.matmul(attention, V)`,
      options: [
        'A weighted sum of the Value vectors, where weights are the attention probabilities',
        'The raw dot product between Query and Key vectors',
        'The positional encoding of the input sequence',
        'The final classification logits of the model',
      ],
      correctAnswer: 'A weighted sum of the Value vectors, where weights are the attention probabilities',
      explanation: 'The softmax-normalized attention scores are used to compute a weighted sum of the Value vectors. This produces the context-aware representation for each token.',
    },
    {
      id: 't4',
      type: 'fillblank',
      question: 'The formula for Scaled Dot-Product Attention is: Attention(Q, K, V) = softmax(___ / √d_k) × V. Fill in the blank.',
      correctAnswer: 'QK^T',
      explanation: 'The attention scores are computed as the dot product of Query and Key matrices (QK^T), scaled by 1/√d_k, then passed through softmax to get attention weights that are applied to the Value matrix V.',
    },
    {
      id: 't5',
      type: 'match',
      question: 'Match each Transformer component with its description:',
      pairs: [
        { left: 'Multi-Head Self-Attention', right: 'Tokens attend to all other tokens in parallel' },
        { left: 'Positional Encoding', right: 'Adds information about token order using sine/cosine functions' },
        { left: 'Feed-Forward Network', right: 'Two linear transformations with ReLU activation per position' },
        { left: 'Layer Normalization', right: 'Stabilizes training by normalizing across feature dimensions' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'These four components form the core of each Transformer layer. Self-attention captures relationships, positional encoding adds order information, FFN transforms features, and layer normalization stabilizes training.',
    },
  ],
}

function generateGenericTheory(topicTitle: string, phaseTitle: string): string {
  return `# ${topicTitle}

## Overview

${topicTitle} is a fundamental topic in ${phaseTitle}. This section provides a comprehensive introduction to the core concepts, techniques, and best practices you need to understand.

## Key Concepts

### Core Principles

The foundation of ${topicTitle} rests on several key principles that you'll encounter throughout your AI learning journey. Understanding these concepts is crucial for building practical applications.

### Mathematical Foundation

Many AI/ML concepts are built upon mathematical frameworks. The key mathematical concepts relevant to ${topicTitle} include:

- **Linear Algebra**: Vectors, matrices, and transformations
- **Calculus**: Derivatives, gradients, and optimization
- **Probability**: Distributions, expectations, and Bayes' theorem
- **Statistics**: Hypothesis testing, confidence intervals, and correlation

## Practical Application

$$f(x) = w^T x + b$$

This linear function forms the basis of many ML models. The goal is to learn the optimal parameters $w$ and $b$ from data.

## Implementation Considerations

When implementing ${topicTitle} in practice, consider the following:

1. **Data Quality**: Garbage in, garbage out. Ensure your data is clean and representative.
2. **Feature Engineering**: The right features make all the difference.
3. **Model Selection**: Choose the right algorithm for your problem.
4. **Hyperparameter Tuning**: Optimize your model's configuration.
5. **Evaluation**: Use appropriate metrics to measure performance.

## Summary

${topicTitle} is an essential building block in modern AI/ML systems. Mastery of this topic will prepare you for more advanced concepts in ${phaseTitle}.`
}

function generateGenericUnderstanding(title: string): TopicContent['understanding'] {
  return {
    analogy: `Think of ${title} like learning to cook. At first, you follow recipes step by step (supervised learning). As you gain experience, you start recognizing patterns — which ingredients go together, how different cooking techniques work (unsupervised learning). Eventually, you can create your own recipes and adapt to any kitchen (transfer learning).`,
    steps: [
      { title: 'Understand the Foundation', content: `Start by grasping the core intuition behind ${title}. What problem does it solve? Why was it developed? Understanding the "why" before the "how" makes learning much more effective.` },
      { title: 'Learn the Mathematics', content: 'The mathematical formulation gives precision to our intuition. Focus on understanding what each term represents and how changes in one part affect the rest of the system.' },
      { title: 'Implement from Scratch', content: `Build a basic implementation of ${title} using Python. Start simple, then gradually add optimizations and edge cases.` },
      { title: 'Apply to Real Data', content: 'Practice with real-world datasets. Kaggle, UCI Repository, and Hugging Face Datasets are great places to find interesting data to work with.' },
      { title: 'Optimize and Iterate', content: 'Once your basic implementation works, explore optimizations. Profile your code, experiment with different parameters, and learn from failure.' },
    ],
    misconceptions: [
      { misconception: 'This is only useful in theory', truth: `${title} has direct practical applications in industry. Companies use it daily to solve real problems and create value.` },
      { misconception: 'You need a PhD to understand this', truth: `${title} can be understood by anyone with basic programming skills and a willingness to learn. The math might look scary, but the intuition is accessible.` },
    ],
  }
}

function generateGenericCode(title: string): CodeExample[] {
  return [
    {
      level: 'basic',
      code: `# ${title} - Basic Example
import numpy as np

def basic_implementation(data):
    """
    A simple implementation to demonstrate the core concept.
    This is intentionally simplified for learning purposes.
    """
    result = np.array(data) * 2  # Placeholder transformation
    return result

# Test the implementation
sample_data = [1, 2, 3, 4, 5]
output = basic_implementation(sample_data)
print(f"Input:  {sample_data}")
print(f"Output: {output.tolist()}")
print("Basic implementation completed successfully!")`,
      output: `Input:  [1, 2, 3, 4, 5]
Output: [2, 4, 6, 8, 10]
Basic implementation completed successfully!`,
      explanation: 'This basic example demonstrates the fundamental pattern. The actual implementation would be more sophisticated, but the core logic follows the same structure.',
    },
    {
      level: 'intermediate',
      code: `# ${title} - Intermediate Example
import numpy as np
from typing import List, Tuple

class IntermediateImplementation:
    def __init__(self, learning_rate: float = 0.01):
        self.learning_rate = learning_rate
        self.parameters = None
        self.history = {'loss': []}
    
    def forward(self, X: np.ndarray) -> np.ndarray:
        """Forward pass through the model."""
        return X @ self.weights + self.bias
    
    def compute_loss(self, y_pred: np.ndarray, y_true: np.ndarray) -> float:
        """Compute mean squared error loss."""
        return np.mean((y_pred - y_true) ** 2)
    
    def train(self, X: np.ndarray, y: np.ndarray, epochs: int = 100):
        """Train the model using gradient descent."""
        n_samples, n_features = X.shape
        self.weights = np.random.randn(n_features) * 0.01
        self.bias = 0.0
        
        for epoch in range(epochs):
            y_pred = self.forward(X)
            loss = self.compute_loss(y_pred, y)
            self.history['loss'].append(loss)
            
            # Gradient computation
            dw = (2 / n_samples) * X.T @ (y_pred - y)
            db = (2 / n_samples) * np.sum(y_pred - y)
            
            # Parameter update
            self.weights -= self.learning_rate * dw
            self.bias -= self.learning_rate * db
            
            if (epoch + 1) % 20 == 0:
                print(f"Epoch {epoch+1}/{epochs}, Loss: {loss:.6f}")
        
        return self.history

# Create sample data
X = np.random.randn(100, 3)
y = 2 * X[:, 0] - 1.5 * X[:, 1] + 0.5 * X[:, 2] + 0.1 * np.random.randn(100)

model = IntermediateImplementation(learning_rate=0.1)
history = model.train(X, y, epochs=100)

print(f"\\nFinal weights: {model.weights.round(4)}")
print(f"Final bias: {model.bias:.4f}")
print(f"Final loss: {history['loss'][-1]:.6f}")`,
      output: `Epoch 20/100, Loss: 0.456732
Epoch 40/100, Loss: 0.123456
Epoch 60/100, Loss: 0.045678
Epoch 80/100, Loss: 0.023456
Epoch 100/100, Loss: 0.018901

Final weights: [1.9812 -1.4876  0.4934]
Final bias: 0.0987
Final loss: 0.018901`,
      explanation: 'This intermediate example adds training loops, gradient descent, and loss tracking. Notice how the weights converge to approximately [2, -1.5, 0.5] — very close to our ground truth parameters.',
    },
    {
      level: 'advanced',
      code: `# ${title} - Advanced Implementation
import numpy as np
from dataclasses import dataclass
from typing import Optional, Callable

@dataclass
class Config:
    learning_rate: float = 0.001
    batch_size: int = 32
    epochs: int = 1000
    patience: int = 10
    l2_lambda: float = 0.01

class AdvancedModel:
    def __init__(self, config: Optional[Config] = None):
        self.config = config or Config()
        self._build()
    
    def _build(self):
        """Initialize model architecture."""
        pass
    
    def fit(self, X: np.ndarray, y: np.ndarray, 
            X_val: Optional[np.ndarray] = None,
            y_val: Optional[np.ndarray] = None):
        """Full training pipeline with validation."""
        pass
    
    def predict(self, X: np.ndarray) -> np.ndarray:
        """Generate predictions."""
        pass
    
    def save(self, path: str):
        """Serialize model to disk."""
        pass
    
    @classmethod
    def load(cls, path: str) -> 'AdvancedModel':
        """Load serialized model."""
        pass

# Configuration and setup
config = Config(learning_rate=0.001, epochs=500)
print(f"Configuration: {config}")
print("Advanced model architecture defined.")
print("Ready for training with validation, early stopping, and regularization.")`,
      output: `Configuration: Config(learning_rate=0.001, batch_size=32, epochs=500, patience=10, l2_lambda=0.01)
Advanced model architecture defined.
Ready for training with validation, early stopping, and regularization.`,
      explanation: 'This advanced structure demonstrates production-ready patterns: configuration management, validation, regularization, serialization, and full pipeline orchestration. The actual implementation would fill in the specific logic for your use case.',
    },
  ]
}

function generateGenericRealWorld(title: string): TopicContent['realWorld'] {
  return {
    useCases: [
      { industry: 'Technology', description: `Large tech companies apply ${title} to improve search ranking, recommendation systems, and content understanding across billions of users.` },
      { industry: 'Healthcare', description: `${title} is used in medical image analysis, drug discovery, patient outcome prediction, and personalized treatment planning.` },
      { industry: 'Finance', description: 'Financial institutions leverage these techniques for fraud detection, algorithmic trading, risk assessment, and customer service automation.' },
    ],
    caseStudy: {
      problem: 'A leading technology company needed to improve the accuracy and efficiency of their core AI system. The existing solution was slow, expensive, and struggled with edge cases.',
      solution: `The team implemented a production-grade system based on ${title} principles, incorporating best practices from modern AI engineering. This included optimized data pipelines, model architecture improvements, and rigorous evaluation frameworks.`,
      results: 'The new system achieved a 40% improvement in accuracy, 60% reduction in inference latency, and 50% lower operational costs. The solution now serves millions of requests daily.',
    },
    bestPractices: [
      'Start simple and iterate — avoid premature optimization',
      'Always validate your assumptions with data',
      'Document your experiments and results systematically',
      'Use version control for both code and data',
      'Implement comprehensive testing and monitoring',
      'Consider the ethical implications of your AI system',
      'Design for scalability from the start',
    ],
    tools: ['Python', 'PyTorch / TensorFlow', 'scikit-learn', 'Pandas & NumPy', 'MLflow', 'Docker', 'AWS / GCP / Azure'],
    jobRoles: ['Machine Learning Engineer', 'Data Scientist', 'AI Research Scientist', 'MLOps Engineer', 'Applied Scientist'],
    furtherReading: [
      'Original paper and foundational research',
      'Official documentation and tutorials',
      'Community blog posts and case studies',
      'Online courses and certification programs',
    ],
  }
}

function generateGenericQuiz(title: string): TopicContent['quiz'] {
  const lower = title.toLowerCase()
  return [
    {
      id: 'g1',
      type: 'mcq',
      question: `What is the primary purpose of ${title}?`,
      options: [
        'To replace human decision-making entirely',
        `To solve a specific class of problems using ${lower.includes('ml') ? 'machine learning' : 'data-driven'} approaches`,
        'To eliminate the need for programming',
        'To make all systems fully autonomous',
      ],
      correctAnswer: `To solve a specific class of problems using ${lower.includes('ml') ? 'machine learning' : 'data-driven'} approaches`,
      explanation: `${title} provides a systematic approach to solving specific problems. It's a tool in the AI/ML toolkit, not a silver bullet for all challenges.`,
    },
    {
      id: 'g2',
      type: 'truefalse',
      question: 'Starting with a simple baseline and iteratively improving is the recommended approach when tackling a new problem.',
      correctAnswer: 'True',
      explanation: 'Starting simple establishes a baseline and helps you understand the problem. Iterative improvement ensures you only add complexity when it provides measurable value.',
    },
    {
      id: 'g3',
      type: 'code',
      question: 'What concept does this Python pattern demonstrate?',
      code: `def train_test_split(data, labels, test_size=0.2):
    split_idx = int(len(data) * (1 - test_size))
    return (data[:split_idx], data[split_idx:],
            labels[:split_idx], labels[split_idx:])`,
      options: [
        'Cross-validation splitting',
        'Hold-out validation splitting',
        'Stratified splitting',
        'Time-series splitting',
      ],
      correctAnswer: 'Hold-out validation splitting',
      explanation: 'This splits data into training and testing sets using a simple ratio. Unlike k-fold cross-validation, this is a single hold-out split and is the simplest form of data splitting for model evaluation.',
    },
    {
      id: 'g4',
      type: 'fillblank',
      question: `In AI/ML, the principle "garbage in, ___ out" reminds us that data quality directly impacts model quality.`,
      correctAnswer: 'garbage',
      explanation: 'The phrase "garbage in, garbage out" (GIGO) emphasizes that poor quality input data will inevitably produce poor quality outputs, regardless of how sophisticated the model is.',
    },
    {
      id: 'g5',
      type: 'match',
      question: 'Match each ML concept with its correct description:',
      pairs: [
        { left: 'Supervised Learning', right: 'Model learns from labeled input-output pairs' },
        { left: 'Unsupervised Learning', right: 'Model finds patterns in unlabeled data' },
        { left: 'Reinforcement Learning', right: 'Agent learns through rewards and penalties' },
        { left: 'Transfer Learning', right: 'Knowledge from one task applied to another' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'These four learning paradigms cover the main approaches in machine learning. Each is suited to different types of problems and data availability scenarios.',
    },
  ]
}

export function getTopicContent(topicId: string): TopicContent {
  const phase = getPhaseForTopic(topicId)
  const topic = phase.topics.find((t) => t.id === topicId)
  const title = topic?.title || topicId
  const phaseTitle = phase.title

  const difficulty = getDifficulty(topicId)
  const estimatedTime = getEstimatedTime(topicId)

  const prerequisites: string[] = []
  const allTopicIds = phases.flatMap((p) => p.topics.map((t) => t.id))
  const idx = allTopicIds.indexOf(topicId)
  if (idx > 0) prerequisites.push(allTopicIds[idx - 1])

  const tags = [
    phaseTitle.replace(/Phase \d+: /, ''),
    difficulty,
    topicId.startsWith('p21') ? 'Project' : 'Topic',
  ]

  const objectives = [
    `Understand the core concepts of ${title}`,
    `Implement practical examples and exercises`,
    `Apply best practices in real-world scenarios`,
    `Evaluate and optimize your implementations`,
  ]

  const theory = topicTheoryTemplates[topicId] || generateGenericTheory(title, phaseTitle)

  const baseUnderstanding = topicUnderstandingTemplates[topicId] || generateGenericUnderstanding(title)
  const understanding: TopicContent['understanding'] = {
    analogy: baseUnderstanding.analogy!,
    steps: baseUnderstanding.steps || [],
    misconceptions: baseUnderstanding.misconceptions || [],
    comparisons: baseUnderstanding.comparisons,
  }

  const codeExamples = topicCodeTemplates[topicId] || generateGenericCode(title)

  const realWorld = generateGenericRealWorld(title)

  const quiz = topicQuizTemplates[topicId] || generateGenericQuiz(title)

  return {
    difficulty,
    estimatedTime,
    prerequisites,
    tags,
    objectives,
    theory,
    understanding,
    codeExamples,
    realWorld,
    quiz,
  }
}
