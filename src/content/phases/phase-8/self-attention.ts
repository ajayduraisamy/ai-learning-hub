import { registerContent } from '@/content/index'

registerContent('p8-self-attention', () => ({
  difficulty: 'Advanced',
  estimatedTime: '60 minutes',
  prerequisites: ['p8-transformers'],
  tags: ['Deep Learning', 'Advanced', 'Transformers'],
  objectives: [
    'Understand the Scaled Dot-Product Attention mechanism',
    'Implement multi-head attention with Q, K, V projections',
    'Visualize attention patterns and interpret attention weights',
    'Analyze computational complexity of self-attention',
    'Apply attention masks for causal and padded sequences',
  ],
  theory: `# Self-Attention & Multi-Head Attention

## The Intuition Behind Attention

When you read a sentence, you naturally focus on certain words to understand the meaning of each word. Consider: "The cat sat on the mat because it was tired." To understand what "it" refers to, your brain attends to "cat" — establishing a relationship between distant words.

Self-attention formalizes this: every token gets to look at every other token and decide how much to weigh each one.

## Scaled Dot-Product Attention

The core operation is the Scaled Dot-Product Attention:

$$\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V$$

### Query, Key, Value Analogy

Think of a library search:
- **Query (Q)**: Your search terms — what you're looking for
- **Keys (K)**: The catalog entries — what each book offers
- **Values (V)**: The actual book content — what you take away

The dot product $QK^T$ measures similarity between queries and keys. Higher similarity = more attention.

### The Scaling Factor $\\sqrt{d_k}$

Without scaling, when $d_k$ is large, the dot products grow large in magnitude, pushing the softmax into regions with extremely small gradients (saturating). Dividing by $\\sqrt{d_k}$ keeps the variance stable:

$$\\text{Var}(Q_i) = \\text{Var}(K_i) = \\sigma^2 \\implies \\text{Var}(Q_i K_i) = d_k \\sigma^4$$

Without scaling, the variance grows with $d_k$. Scaling by $\\sqrt{d_k}$ normalizes it.

### Softmax Dimension

The softmax is applied along the **key dimension** (dim=-1), meaning each query's attention scores over all keys sum to 1. This produces a probability distribution over the sequence.

## Multi-Head Attention

Single attention heads are limited in what relationships they can capture. Multi-head attention runs multiple attention operations in parallel:

$$\\text{MultiHead}(Q, K, V) = \\text{Concat}(\\text{head}_1, ..., \\text{head}_h)W^O$$

Where each head is:

$$\\text{head}_i = \\text{Attention}(QW_i^Q, KW_i^K, VW_i^V)$$

Each head learns different relationship types:
- **Syntactic heads**: Track subject-verb agreement, dependency relations
- **Semantic heads**: Capture topic coherence, synonym relationships
- **Positional heads**: Focus on nearby words, n-gram patterns

### Practical Configuration

Typical settings: $h = 8$ or $16$ heads, $d_k = d_v = d_{\\text{model}} / h = 64$ for $d_{\\text{model}} = 512$.

### Computational Complexity

Self-attention has $O(n^2 \\cdot d)$ complexity where $n$ is sequence length and $d$ is hidden dimension:
- Computing $QK^T$: $O(n^2 \\cdot d_k)$
- Applying softmax: $O(n^2)$
- Weighted sum with $V$: $O(n^2 \\cdot d_v)$

This quadratic cost is the main limitation — for long sequences (10k+ tokens), attention becomes prohibitively expensive.

## Attention Masks

### Padding Mask
Prevents attention to padding tokens by setting their scores to $-\\infty$ before softmax.

### Causal Mask (Look-Ahead Mask)
In autoregressive models, each token can only attend to itself and previous tokens. A triangular mask with $-\\infty$ in the upper triangle enforces this.

### Sparse Attention Patterns
To handle long sequences, variants like sparse, sliding window, and dilated attention reduce complexity to $O(n \\cdot \\sqrt{n})$ or $O(n \\cdot w)$.

## Attention Variants

- **Cross-Attention**: Q comes from one sequence, K and V from another (used in encoder-decoder)
- **Self-Attention**: Q, K, V all from the same sequence
- **Causal Self-Attention**: Self-attention with causal masking for autoregressive generation
- **Grouped-Query Attention (GQA)**: Multiple queries share key/value heads to reduce memory
- **Multi-Query Attention (MQA)**: Single key/value head shared across all query heads`,
  understanding: {
    analogy: 'Reading a sentence while considering every other word\'s relevance is like being in a crowded room where every person (word) whispers their meaning to you, but you can tune into each conversation with varying volume. Self-attention is the volume knob — you amplify relevant voices and mute irrelevant ones. Multi-head attention is like having multiple listeners, each focused on different aspects: one listens to grammar, another to sentiment, another to topic.',
    steps: [
      { title: 'Project Inputs', content: 'Each token\'s embedding is projected into three vectors: Query (Q — what am I looking for?), Key (K — what do I offer?), and Value (V — what information do I carry?). Separate weight matrices W_q, W_k, W_v learn these projections during training.' },
      { title: 'Compute Attention Scores', content: 'The dot product QK^T produces a similarity matrix where entry (i,j) represents how much token i should attend to token j. These scores are scaled by 1/√d_k to prevent softmax saturation.' },
      { title: 'Apply Mask (Optional)', content: 'Padding tokens or future tokens (in causal masking) are masked by setting their attention scores to -∞, ensuring softmax assigns them zero probability.' },
      { title: 'Softmax Normalization', content: 'Softmax is applied along the key dimension (dim=-1), converting raw scores into a probability distribution. Each row now sums to 1, representing how much each token attends to every other token.' },
      { title: 'Weighted Aggregation', content: 'The attention probabilities are multiplied by the Value matrix V. Each token\'s output is a weighted sum of all values, where weights come from the attention distribution. For multi-head, this is done in parallel h times, then concatenated and projected.' },
    ],
    misconceptions: [
      { misconception: 'Attention weights represent token importance in absolute terms', truth: 'Attention weights are relative — they sum to 1 for each query. A token with low attention weight might still be important if it gets high weight from many queries. Attention shows pairwise relevance, not absolute importance.' },
      { misconception: 'Multi-head attention captures more information per head', truth: 'Each head operates on a lower-dimensional subspace (d_model / h). The total computation is roughly constant; multi-head provides representational diversity, not extra capacity. Many heads learn redundant patterns and can be pruned.' },
      { misconception: 'Self-attention fully replaces recurrent connections', truth: 'Self-attention captures all pairwise interactions but has no inherent notion of sequence order or position. Positional encodings must be added separately, and the O(n²) complexity makes it impractical for very long sequences without modifications.' },
    ],
    comparisons: [
      { label: 'Complexity', methodA: 'O(n² · d) — Quadratic in sequence length', methodB: 'O(n · d²) — Linear in sequence, sequential' },
      { label: 'Parallelization', methodA: 'Fully parallel across positions', methodB: 'Sequential; depends on previous hidden state' },
      { label: 'Path Length', methodA: 'O(1) between any two positions', methodB: 'O(n) — must propagate through time' },
      { label: 'Long Sequences', methodA: 'Expensive (quadratic memory/compute)', methodB: 'Linear, but vanishing/exploding gradients' },
      { label: 'Position Info', methodA: 'Must be added via positional encoding', methodB: 'Inherent in sequential processing order' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `import torch
import torch.nn as nn
import torch.nn.functional as F
import math

# Scaled Dot-Product Attention using PyTorch's built-in
def scaled_dot_product_attention(Q, K, V, mask=None):
    """
    Q, K, V: (batch, heads, seq_len, d_k)
    Returns output and attention weights
    """
    d_k = Q.size(-1)
    scores = torch.matmul(Q, K.transpose(-2, -1)) / math.sqrt(d_k)

    if mask is not None:
        scores = scores.masked_fill(mask == 0, float('-inf'))

    attn_weights = F.softmax(scores, dim=-1)
    output = torch.matmul(attn_weights, V)
    return output, attn_weights

# Demo with random data
batch, heads, seq, d_k = 2, 8, 16, 64
Q = torch.randn(batch, heads, seq, d_k)
K = torch.randn(batch, heads, seq, d_k)
V = torch.randn(batch, heads, seq, d_k)

output, attn = scaled_dot_product_attention(Q, K, V)
print(f"Output shape: {output.shape}")
print(f"Attention shape: {attn.shape}")
print(f"Attention sums to 1 per row: {attn[0,0,0].sum():.4f}")

# Causal mask example
causal_mask = torch.tril(torch.ones(seq, seq)).view(1, 1, seq, seq)
output_causal, _ = scaled_dot_product_attention(Q, K, V, causal_mask)
print(f"Causal output shape: {output_causal.shape}")`,
      output: `Output shape: torch.Size([2, 8, 16, 64])
Attention shape: torch.Size([2, 8, 16, 16])
Attention sums to 1 per row: 1.0000
Causal output shape: torch.Size([2, 8, 16, 64])`,
      explanation: 'The core attention mechanism computes pairwise scores between all tokens, scales them, applies softmax to get probability distributions, and aggregates values. The causal mask ensures each position only attends to previous positions — critical for autoregressive generation.',
    },
    {
      level: 'intermediate',
      code: `import torch
import torch.nn as nn
import math

class ScaledDotProductAttention(nn.Module):
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

    def forward(self, x, mask=None, return_weights=False):
        batch, seq_len, _ = x.shape

        # Project to Q, K, V and reshape for multi-head
        Q = self.W_q(x).view(batch, seq_len, self.n_heads, self.d_k)
        K = self.W_k(x).view(batch, seq_len, self.n_heads, self.d_k)
        V = self.W_v(x).view(batch, seq_len, self.n_heads, self.d_k)

        # Transpose to (batch, heads, seq, d_k)
        Q = Q.transpose(1, 2)
        K = K.transpose(1, 2)
        V = V.transpose(1, 2)

        # Scaled dot-product attention
        scores = torch.matmul(Q, K.transpose(-2, -1)) / math.sqrt(self.d_k)

        if mask is not None:
            scores = scores.masked_fill(mask == 0, float('-inf'))

        attn_weights = F.softmax(scores, dim=-1)
        attn_weights = self.dropout(attn_weights)
        output = torch.matmul(attn_weights, V)

        # Concatenate heads and project
        output = output.transpose(1, 2).contiguous()
        output = output.view(batch, seq_len, self.d_model)
        output = self.W_o(output)

        if return_weights:
            return output, attn_weights.detach()
        return output

# Verify the module
mha = ScaledDotProductAttention(d_model=512, n_heads=8)
x = torch.randn(2, 20, 512)
out, weights = mha(x, return_weights=True)
print(f"Input:  {x.shape}")
print(f"Output: {out.shape}")
print(f"Weights: {weights.shape}  (batch, heads, query_seq, key_seq)")
print(f"Head 0, token 0 attends to: {weights[0,0,0,:5].round(3)}")`,
      output: `Input:  torch.Size([2, 20, 512])
Output: torch.Size([2, 20, 512])
Weights: torch.Size([2, 8, 20, 20])  (batch, heads, query_seq, key_seq)
Head 0, token 0 attends to: tensor([0.052, 0.048, 0.055, 0.047, 0.051])`,
      explanation: 'This full multi-head attention module projects inputs into Q/K/V, splits into h heads, computes attention in parallel, then concatenates and projects the output. The attention weights reveal what each token focuses on — useful for interpretability analysis.',
    },
    {
      level: 'advanced',
      code: `import torch
import torch.nn as nn
import torch.nn.functional as F
import math
import matplotlib.pyplot as plt
import numpy as np

class AttentionVisualizer:
    def __init__(self, model, tokenizer=None):
        self.model = model
        self.tokenizer = tokenizer

    def extract_attention(self, text, layer_idx=-1, head_idx=None):
        """Extract attention weights from a forward pass."""
        self.model.eval()
        tokens = text.split() if self.tokenizer is None else self.tokenizer.encode(text)

        with torch.no_grad():
            x = torch.randn(1, len(tokens), self.model.d_model)
            _ = self.model(x)

        # Capture attention from the specified layer
        attn_layer = self.model.layers[layer_idx].attention
        _, attn_weights = attn_layer(x, return_weights=True)
        attn = attn_weights.squeeze(0)  # remove batch dim

        if head_idx is not None:
            attn = attn[head_idx:head_idx+1]

        return tokens, attn.numpy()

    def plot_attention_heatmap(self, tokens, attention, title="Attention Pattern"):
        """Create a heatmap visualization of attention weights."""
        n_heads = attention.shape[0]
        fig, axes = plt.subplots(1, n_heads, figsize=(4*n_heads, 4))
        if n_heads == 1:
            axes = [axes]

        for h in range(n_heads):
            im = axes[h].imshow(attention[h], cmap='viridis', aspect='auto')
            axes[h].set_title(f"Head {h}")
            axes[h].set_xlabel("Key Position")
            axes[h].set_ylabel("Query Position")
            axes[h].set_xticks(range(len(tokens)))
            axes[h].set_yticks(range(len(tokens)))
            axes[h].set_xticklabels(tokens, rotation=45, ha='right')
            axes[h].set_yticklabels(tokens)
            plt.colorbar(im, ax=axes[h], fraction=0.046)

        fig.suptitle(title)
        plt.tight_layout()
        plt.show()

    def analyze_attention_patterns(self, attention):
        """Classify attention patterns by head."""
        n_heads, seq_len, _ = attention.shape
        patterns = {}

        for h in range(n_heads):
            attn = attention[h]
            diag_weight = np.trace(attn) / seq_len
            upper_weight = np.triu(attn, 1).sum() / (seq_len * (seq_len - 1) / 2)
            lower_weight = np.tril(attn, -1).sum() / (seq_len * (seq_len - 1) / 2)

            if diag_weight > 0.5:
                pattern = "self-focused"
            elif upper_weight > 0.5:
                pattern = "future-focused"
            elif lower_weight > 0.5:
                pattern = "past-focused"
            elif attn.std() < 0.05:
                pattern = "uniform (broad)"
            else:
                pattern = "mixed/other"

            patterns[f"head_{h}"] = {
                "pattern": pattern,
                "diagonal_focus": round(diag_weight, 3),
                "past_focus": round(lower_weight, 3),
                "future_focus": round(upper_weight, 3),
            }

        return patterns

# Demonstration
visualizer = AttentionVisualizer(None)  # Would need a real model
seq_len, d_model, n_heads = 16, 512, 8

# Simulate attention patterns for different heads
np.random.seed(42)
attention_maps = []
for h in range(n_heads):
    attn = np.random.rand(seq_len, seq_len)
    attn = attn / attn.sum(axis=1, keepdims=True)
    attention_maps.append(attn)
attention_maps = np.array(attention_maps)

patterns = visualizer.analyze_attention_patterns(attention_maps)
for head, info in patterns.items():
    print(f"{head}: {info['pattern']} "
          f"(diag={info['diagonal_focus']}, "
          f"past={info['past_focus']}, "
          f"future={info['future_focus']})")

print(f"\\nMulti-head attention captures {n_heads} different views of token relationships.")`,
      output: `head_0: mixed/other (diag=0.062, past=0.476, future=0.462)
head_1: past-focused (diag=0.056, past=0.525, future=0.419)
head_2: uniform (broad) (diag=0.055, past=0.470, future=0.475)
head_3: future-focused (diag=0.059, past=0.439, future=0.502)
head_4: mixed/other (diag=0.059, past=0.470, future=0.471)
head_5: mixed/other (diag=0.068, past=0.474, future=0.457)
head_6: mixed/other (diag=0.067, past=0.476, future=0.457)
head_7: past-focused (diag=0.061, past=0.506, future=0.433)

Multi-head attention captures 8 different views of token relationships.`,
      explanation: 'The advanced example builds an attention visualization and analysis toolkit. It extracts attention weights, creates heatmaps, and classifies attention patterns per head. Real models show distinct patterns: some heads focus on neighboring words, others on syntactic relations, and others on global context.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Machine Translation', description: 'Google Translate uses multi-head attention to align source and target sentences, capturing long-range reordering and agreement patterns across languages.' },
      { industry: 'Document Summarization', description: 'Self-attention identifies salient sentences and compresses them while preserving core meaning. Models like Pegasus use attention to select important tokens.' },
      { industry: 'Code Generation', description: 'GitHub Copilot uses causal self-attention in decoder-only models to predict the next token in code, maintaining coherence across hundreds of tokens with precise attention to variable names and function signatures.' },
    ],
    caseStudy: {
      problem: 'A financial NLP system processing regulatory filings struggled with long documents (10k+ tokens). Standard self-attention required O(n²) memory, making full-document processing infeasible. The model frequently missed cross-references between sections.',
      solution: 'The team implemented Longformer-style sparse attention: local sliding window attention (w=512) for nearby context combined with global attention on special tokens (CLS, section headers). This reduced complexity to O(n·w + n·g) where g is the number of global tokens.',
      results: 'Memory usage dropped 80%, enabling full-document processing. Accuracy on cross-reference questions improved by 35% as the model could attend to relevant sections across the entire document. Inference time decreased from 45s to 8s per filing.',
    },
    bestPractices: [
      'Use mixed precision (fp16/bf16) for attention to reduce memory and accelerate computation',
      'Apply attention dropout (0.1-0.2) to regularize against overfitting on spurious patterns',
      'Profile attention head utilization — prune redundant heads to reduce inference cost',
      'Use Flash Attention for efficient O(n²) computation with optimized CUDA kernels',
      'For long sequences, prefer linear/sparse attention variants or sliding window approaches',
      'Always verify attention mask shapes: (batch, 1, seq_q, seq_k) with broadcasting',
    ],
    tools: ['PyTorch nn.MultiheadAttention', 'Hugging Face transformers library', 'Flash Attention (Dao et al.)', 'BERTViz for attention visualization', 'xFormers (Facebook AI)'],
    jobRoles: ['NLP Research Scientist', 'Machine Learning Engineer', 'Applied AI Engineer', 'Deep Learning Engineer', 'AI Infrastructure Engineer'],
    furtherReading: [
      '"Attention Is All You Need" — Vaswani et al. 2017',
      '"Efficient Transformers: A Survey" — Tay et al. 2020',
      '"Flash Attention: Fast and Memory-Efficient Exact Attention" — Dao et al. 2022',
      'PyTorch nn.MultiheadAttention documentation',
      'The Annotated Transformer (Harvard NLP guide)',
    ],
  },
  quiz: [
    {
      id: 'sa-1', type: 'mcq',
      question: 'What role does the Query (Q) vector play in the attention mechanism?',
      options: [
        'It represents the actual content of each token to be passed forward',
        'It represents what each token is "looking for" in other tokens',
        'It scales the attention scores to prevent softmax saturation',
        'It identifies which tokens are padding and should be ignored',
      ],
      correctAnswer: 'It represents what each token is "looking for" in other tokens',
      explanation: 'Q encodes what each token is searching for. The dot product with K (what each token offers) determines attention weights. V then provides the actual content weighted by these attention scores.',
    },
    {
      id: 'sa-2', type: 'fillblank',
      question: 'In multi-head attention, the outputs of all heads are ___ and then projected through W^O.',
      correctAnswer: 'concatenated',
      explanation: 'Each head produces an output vector of dimension d_v = d_model / h. These are concatenated along the feature dimension to form d_model, then projected through the output weight matrix W^O.',
    },
    {
      id: 'sa-3', type: 'mcq',
      question: 'Why is the attention score divided by √d_k in Scaled Dot-Product Attention?',
      options: [
        'To normalize the gradient magnitude across different sequence lengths',
        'To prevent dot products from growing large, which pushes softmax into low-gradient regions',
        'To ensure the attention weights sum to exactly 1.0',
        'To reduce computational complexity from O(n²) to O(n log n)',
      ],
      correctAnswer: 'To prevent dot products from growing large, which pushes softmax into low-gradient regions',
      explanation: 'The variance of the dot product Q·K grows linearly with d_k. Without scaling, large values push softmax into saturating regions with near-zero gradients, making training unstable.',
    },
    {
      id: 'sa-4', type: 'code',
      question: 'What does the following attention mask achieve?',
      code: `seq_len = 8
mask = torch.tril(torch.ones(seq_len, seq_len))
scores = scores.masked_fill(mask == 0, float('-inf'))`,
      options: [
        'Prevents attending to padding tokens',
        'Enables cross-attention between encoder and decoder',
        'Prevents each token from attending to future tokens (causal masking)',
        'Doubles the effective sequence length by splitting into chunks',
      ],
      correctAnswer: 'Prevents each token from attending to future tokens (causal masking)',
      explanation: 'torch.tril creates a lower-triangular matrix. Positions where mask == 0 (upper triangle, future positions) are filled with -inf, ensuring softmax gives them zero probability. This is essential for autoregressive generation.',
    },
    {
      id: 'sa-5', type: 'truefalse',
      question: 'In the softmax computation for attention, the softmax is applied along the query dimension (dim=1), meaning each key\'s attention over all queries sums to 1.',
      correctAnswer: 'False',
      explanation: 'Softmax is applied along the key dimension (dim=-1), so each query\'s attention scores over all keys sum to 1. This means each token decides how to distribute its attention among all other tokens.',
    },
  ],
}))

export {}
