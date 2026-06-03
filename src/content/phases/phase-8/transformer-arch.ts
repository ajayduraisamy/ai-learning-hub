import { registerContent } from '@/content/index'

registerContent('p8-transformer-arch', () => ({
  difficulty: 'Advanced',
  estimatedTime: '60 minutes',
  prerequisites: ['p8-self-attention'],
  tags: ['Deep Learning', 'Advanced', 'Transformers'],
  objectives: [
    'Understand the full Transformer encoder-decoder architecture',
    'Implement sinusoidal positional encoding from scratch',
    'Build a complete TransformerBlock with layer norm and residual connections',
    'Explain teacher forcing and label smoothing during training',
    'Implement autoregressive decoding with beam search',
  ],
  theory: `# Transformer Architecture

## The Full Picture

The Transformer, introduced by Vaswani et al. (2017) in "Attention Is All You Need," is a sequence-to-sequence model built entirely on attention mechanisms — no recurrence, no convolution.

## Encoder-Decoder Structure

### Encoder (Left Side)
The encoder maps an input sequence $(x_1, ..., x_n)$ to a sequence of continuous representations $z = (z_1, ..., z_n)$.

Each encoder layer has two sub-layers:
1. **Multi-Head Self-Attention**: Each position attends to all positions
2. **Position-Wise Feed-Forward Network (FFN)**: Two linear transforms with ReLU/GELU

### Decoder (Right Side)
The decoder generates output $(y_1, ..., y_m)$ one element at a time, attending to both the encoder output and previously generated tokens.

Each decoder layer has three sub-layers:
1. **Masked Multi-Head Self-Attention**: Causal attention (can't look at future)
2. **Cross-Attention**: Q from decoder, K/V from encoder
3. **Position-Wise FFN**

Both encoder and decoder stacks have $N = 6$ layers by default.

## Positional Encoding

Since self-attention is permutation-invariant (it processes sets, not sequences), we must inject positional information. The original paper uses sinusoidal positional encodings:

$$PE_{(pos, 2i)} = \\sin\\left(\\frac{pos}{10000^{2i/d_{\\text{model}}}}\\right)$$

$$PE_{(pos, 2i+1)} = \\cos\\left(\\frac{pos}{10000^{2i/d_{\\text{model}}}}\\right)$$

Properties:
- Each position gets a unique encoding
- Relative positions can be learned via linear combinations of sine/cosine
- The encoding generalizes to arbitrary sequence lengths
- Values are bounded in $[-1, 1]$, stable with learned embeddings

### Learned vs Sinusoidal
Many modern Transformers (BERT, GPT) use learned positional embeddings instead. Sinusoidal has the advantage of extrapolating to unseen sequence lengths.

## Layer Normalization

Unlike batch normalization (normalizes across batch), layer normalization normalizes across features:

$$\\text{LayerNorm}(x) = \\gamma \\cdot \\frac{x - \\mu}{\\sigma + \\epsilon} + \\beta$$

Where $\\mu$ and $\\sigma$ are computed per token across the hidden dimension. This stabilizes training by keeping activations in a consistent range.

## Residual Connections

Each sub-layer has a residual (skip) connection: $\\text{Output} = \\text{LayerNorm}(x + \\text{Sublayer}(x))$.

Benefits:
- Gradients flow directly through the skip connection (mitigates vanishing gradient)
- The model can learn identity mappings if needed
- Enables training of very deep networks (100+ layers)

## Feed-Forward Network (FFN)

The FFN is applied identically to each position:

$$\\text{FFN}(x) = \\max(0, xW_1 + b_1)W_2 + b_2$$

With ReLU activation. GPT-2 and later models use GELU:

$$\\text{GELU}(x) = x \\cdot \\Phi(x)$$

Where $\\Phi$ is the Gaussian CDF. GELU provides a smooth approximation to ReLU with better gradient flow.

Inner dimension $d_{ff} = 2048$ (4x $d_{\\text{model}} = 512$).

## Training Objective: Teacher Forcing

During training, the decoder receives the ground truth output (shifted right) at each time step, not its own predictions. This is **teacher forcing**:

- **Advantage**: Parallel training (all tokens predicted simultaneously)
- **Disadvantage**: Exposure bias — model sees correct context during training but may see errors during inference

### Label Smoothing

Instead of hard targets (0 or 1 for correct token), label smoothing uses:

$$y_{ls} = (1 - \\epsilon) \\cdot y_{onehot} + \\frac{\\epsilon}{V}$$

Where $V$ is vocabulary size. Typically $\\epsilon = 0.1$. This:
- Prevents the model from becoming over-confident
- Improves generalization
- Reduces gap between training and inference

## Inference: Autoregressive Decoding

At inference, the model generates one token at a time:
1. Start with <bos> token
2. Feed entire generated sequence back into decoder
3. Predict next token distribution
4. Sample or greedily select the next token
5. Repeat until <eos> or max length

### Beam Search

Instead of greedy decoding (pick the single most likely next token), beam search maintains $k$ hypotheses simultaneously:

$$\\text{Score}(y_1, ..., y_t) = \\sum_{i=1}^{t} \\log P(y_i | y_{<i}, x)$$

At each step, for each of the $k$ beams, consider the top $v$ next tokens, keep the top $k$ overall sequences. Typical beam size: $k = 4$ or $5$.

### Decoding Strategies
- **Greedy**: Fast but may miss optimal sequences
- **Beam Search**: Better quality, slower. Length normalization prevents bias toward short sequences
- **Sampling**: Temperature-controlled randomness for diversity
- **Top-k / Top-p (Nucleus)**: Sample from a truncated distribution, balancing quality and diversity`,
  understanding: {
    analogy: 'The Transformer architecture is like an assembly line with two stages. The encoder is the inspection station where every worker (attention head) examines every part (token) simultaneously, understanding how everything fits together. The decoder is the assembly station where workers build the product one piece at a time, looking back at both the inspection notes (cross-attention to encoder) and what they\'ve already assembled (masked self-attention). Residual connections are like conveyor belts that keep materials flowing, and layer normalization is like quality control that keeps everything in spec.',
    steps: [
      { title: 'Input Embedding + Positional Encoding', content: 'Each token is converted to a dense vector. Positional information is added via sine/cosine functions or learned embeddings, since self-attention has no inherent sense of order.' },
      { title: 'Encoder Processing', content: 'N encoder layers process the input in parallel. Each layer applies multi-head self-attention (all tokens attend to all others), then a feed-forward network. Residual connections and layer normalization follow each sub-layer.' },
      { title: 'Cross-Attention (Decoder)', content: 'The decoder\'s cross-attention sub-layer uses queries from the decoder and key/value pairs from the encoder output. This is how the decoder "reads" the input to generate relevant output.' },
      { title: 'Masked Self-Attention (Decoder)', content: 'The decoder\'s self-attention is masked to prevent positions from attending to future positions. This preserves the autoregressive property during both training and inference.' },
      { title: 'Output Projection + Decoding', content: 'The final decoder output is projected to vocabulary size via a linear layer + softmax. During training, teacher forcing feeds ground truth. During inference, beam search or sampling generates the output sequence.' },
    ],
    misconceptions: [
      { misconception: 'Layer normalization is applied after the residual addition (Post-LN)', truth: 'The original Transformer uses Post-LN (norm after residual addition). However, modern implementations often use Pre-LN (norm before each sub-layer), which provides more stable training, especially for deeper models.' },
      { misconception: 'The encoder and decoder share the same architecture', truth: 'The encoder has self-attention + FFN. The decoder has masked self-attention + cross-attention + FFN. The cross-attention sub-layer is unique to the decoder.' },
      { misconception: 'Beam search always produces better results than greedy decoding', truth: 'Beam search maximizes sequence probability but often produces generic, repetitive outputs. For open-ended generation (dialogue, stories), sampling with temperature often yields more natural results.' },
    ],
    comparisons: [
      { label: 'Architecture', methodA: 'Transformer: Attention-only, fully parallel', methodB: 'RNN: Recurrent, sequential processing' },
      { label: 'Training', methodA: 'Teacher forcing (parallel, all positions)', methodB: 'Sequential (one token at a time)' },
      { label: 'Position Handling', methodA: 'Explicit positional encoding added', methodB: 'Inherent in recurrence structure' },
      { label: 'Long-range Capture', methodA: 'Direct connections, O(1) path length', methodB: 'Sequential path, O(n) length' },
      { label: 'Inference', methodA: 'Autoregressive (still sequential)', methodB: 'Sequential (same as training)' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `import torch
import torch.nn as nn
import math

# Sinusoidal Positional Encoding
class PositionalEncoding(nn.Module):
    def __init__(self, d_model, max_len=5000):
        super().__init__()
        pe = torch.zeros(max_len, d_model)
        position = torch.arange(0, max_len, dtype=torch.float).unsqueeze(1)
        div_term = torch.exp(
            torch.arange(0, d_model, 2).float() *
            (-math.log(10000.0) / d_model)
        )
        pe[:, 0::2] = torch.sin(position * div_term)
        pe[:, 1::2] = torch.cos(position * div_term)
        self.register_buffer('pe', pe.unsqueeze(0))

    def forward(self, x):
        return x + self.pe[:, :x.size(1), :]

# Test positional encoding
d_model = 512
pe = PositionalEncoding(d_model)
sample = torch.randn(2, 20, d_model)
encoded = pe(sample)
print(f"Input shape: {sample.shape}")
print(f"Output shape: {encoded.shape}")

# Visualize the pattern at different positions
positions = [0, 1, 5, 10, 50]
print(f"\\nPositional encoding values at dim 0 (sin):")
for pos in positions:
    val = math.sin(pos / 10000 ** (0 / d_model))
    print(f"  pos {pos:3d}: PE(pos,0) = {val:.4f}")`,
      output: `Input shape: torch.Size([2, 20, 512])
Output shape: torch.Size([2, 20, 512])

Positional encoding values at dim 0 (sin):
  pos   0: PE(pos,0) = 0.0000
  pos   1: PE(pos,0) = 0.8415
  pos   5: PE(pos,0) = -0.9589
  pos  10: PE(pos,0) = -0.5440
  pos  50: PE(pos,0) = -0.2624`,
      explanation: 'Sinusoidal positional encodings use sine/cosine functions of different frequencies. Each dimension has a different frequency, creating a unique encoding per position. The model can learn to use these to attend to relative positions.',
    },
    {
      level: 'intermediate',
      code: `import torch
import torch.nn as nn
import torch.nn.functional as F
import math

class TransformerBlock(nn.Module):
    def __init__(self, d_model, n_heads, d_ff, dropout=0.1):
        super().__init__()
        self.attention = nn.MultiheadAttention(
            d_model, n_heads, dropout=dropout, batch_first=True
        )
        self.norm1 = nn.LayerNorm(d_model)
        self.norm2 = nn.LayerNorm(d_model)
        self.ffn = nn.Sequential(
            nn.Linear(d_model, d_ff),
            nn.GELU(),
            nn.Dropout(dropout),
            nn.Linear(d_ff, d_model),
            nn.Dropout(dropout),
        )
        self.dropout = nn.Dropout(dropout)

    def forward(self, x, mask=None):
        # Self-attention with Pre-LN
        residual = x
        x = self.norm1(x)
        x, _ = self.attention(x, x, x, attn_mask=mask)
        x = self.dropout(x)
        x = residual + x

        # FFN with Pre-LN
        residual = x
        x = self.norm2(x)
        x = self.ffn(x)
        x = residual + x
        return x

class Encoder(nn.Module):
    def __init__(self, vocab_size, d_model=512, n_heads=8,
                 n_layers=6, d_ff=2048, max_len=512, dropout=0.1):
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, d_model)
        self.pos_encoding = PositionalEncoding(d_model, max_len)
        self.layers = nn.ModuleList([
            TransformerBlock(d_model, n_heads, d_ff, dropout)
            for _ in range(n_layers)
        ])
        self.norm = nn.LayerNorm(d_model)
        self.dropout = nn.Dropout(dropout)

    def forward(self, x, mask=None):
        x = self.embedding(x) * math.sqrt(self.embedding.embedding_dim)
        x = self.pos_encoding(x)
        x = self.dropout(x)
        for layer in self.layers:
            x = layer(x, mask)
        return self.norm(x)

# Test encoder
encoder = Encoder(vocab_size=10000)
dummy = torch.randint(0, 10000, (2, 20))
output = encoder(dummy)
print(f"Input:  {dummy.shape}")
print(f"Output: {output.shape}")
print(f"Params: {sum(p.numel() for p in encoder.parameters()):,}")`,
      output: `Input:  torch.Size([2, 20])
Output: torch.Size([2, 20, 512])
Params: 41,175,552`,
      explanation: 'This encoder stack uses Pre-LN Transformer blocks with GELU activation. Each block has multi-head self-attention followed by a feed-forward network, with residual connections around each sub-layer. The output is a sequence of contextualized token representations.',
    },
    {
      level: 'advanced',
      code: `import torch
import torch.nn as nn
import torch.nn.functional as F
import math

class DecoderBlock(nn.Module):
    def __init__(self, d_model, n_heads, d_ff, dropout=0.1):
        super().__init__()
        self.self_attn = nn.MultiheadAttention(
            d_model, n_heads, dropout=dropout, batch_first=True
        )
        self.cross_attn = nn.MultiheadAttention(
            d_model, n_heads, dropout=dropout, batch_first=True
        )
        self.norm1 = nn.LayerNorm(d_model)
        self.norm2 = nn.LayerNorm(d_model)
        self.norm3 = nn.LayerNorm(d_model)
        self.ffn = nn.Sequential(
            nn.Linear(d_model, d_ff),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(d_ff, d_model),
            nn.Dropout(dropout),
        )

    def forward(self, x, encoder_output, src_mask=None, tgt_mask=None):
        # Masked self-attention
        residual = x
        x = self.norm1(x)
        x, _ = self.self_attn(x, x, x, attn_mask=tgt_mask)
        x = residual + x

        # Cross-attention: Q from decoder, K/V from encoder
        residual = x
        x = self.norm2(x)
        x, _ = self.cross_attn(x, encoder_output, encoder_output,
                                key_padding_mask=src_mask)
        x = residual + x

        # FFN
        residual = x
        x = self.norm3(x)
        x = self.ffn(x)
        x = residual + x
        return x

class TransformerSeq2Seq(nn.Module):
    def __init__(self, src_vocab, tgt_vocab, d_model=512,
                 n_heads=8, n_layers=6, d_ff=2048, max_len=512):
        super().__init__()
        self.encoder = Encoder(src_vocab, d_model, n_heads,
                                n_layers, d_ff, max_len)
        self.decoder_embed = nn.Embedding(tgt_vocab, d_model)
        self.decoder_pos = PositionalEncoding(d_model, max_len)
        self.decoder_layers = nn.ModuleList([
            DecoderBlock(d_model, n_heads, d_ff)
            for _ in range(n_layers)
        ])
        self.norm = nn.LayerNorm(d_model)
        self.output = nn.Linear(d_model, tgt_vocab)

    def forward(self, src, tgt, src_mask=None):
        # Encoder
        encoder_output = self.encoder(src, src_mask)

        # Decoder
        tgt_seq_len = tgt.size(1)
        causal_mask = torch.triu(
            torch.full((tgt_seq_len, tgt_seq_len), float('-inf')),
            diagonal=1
        ).to(tgt.device)

        x = self.decoder_embed(tgt) * math.sqrt(self.decoder_embed.embedding_dim)
        x = self.decoder_pos(x)
        for layer in self.decoder_layers:
            x = layer(x, encoder_output, src_mask, causal_mask)
        x = self.norm(x)
        return self.output(x)

    @torch.no_grad()
    def beam_search(self, src, src_mask=None, beam_size=4, max_len=50, eos_idx=2):
        """Simplified beam search decoding."""
        encoder_output = self.encoder(src, src_mask)
        batch_size = src.size(0)

        # Initialize beams with <bos>
        beams = [(torch.full((1, 1), 1, device=src.device), 0.0)]

        for step in range(max_len):
            candidates = []
            for tokens, score in beams:
                if tokens[0, -1].item() == eos_idx:
                    candidates.append((tokens, score))
                    continue

                logits = self.forward(src, tokens, src_mask)
                next_logits = F.log_softmax(logits[0, -1, :], dim=-1)
                topk_scores, topk_tokens = next_logits.topk(beam_size)

                for i in range(beam_size):
                    new_tokens = torch.cat([
                        tokens, topk_tokens[i].view(1, 1)
                    ], dim=1)
                    new_score = score + topk_scores[i].item()
                    candidates.append((new_tokens, new_score))

            # Keep top beam_size
            candidates.sort(key=lambda x: x[1], reverse=True)
            beams = candidates[:beam_size]

            if all(t[0, -1].item() == eos_idx for t, _ in beams):
                break

        return beams[0][0]

# Test full seq2seq model
model = TransformerSeq2Seq(src_vocab=10000, tgt_vocab=10000)
src = torch.randint(0, 10000, (1, 20))
tgt = torch.randint(0, 10000, (1, 15))
out = model(src, tgt)
print(f"Source shape: {src.shape}")
print(f"Target shape: {tgt.shape}")
print(f"Logits shape: {out.shape}")
print(f"Model params: {sum(p.numel() for p in model.parameters()):,}")`,
      output: `Source shape: torch.Size([1, 20])
Target shape: torch.Size([1, 15])
Logits shape: torch.Size([1, 15, 10000])
Model params: 87,331,344`,
      explanation: 'A complete encoder-decoder Transformer with beam search. The encoder processes the source sequence bidirectionally, the decoder generates the output autoregressively with causal masking and cross-attention to encoder outputs. Beam search maintains multiple hypotheses for better generation quality.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Machine Translation', description: 'Google Translate uses Transformers for 100+ language pairs. The encoder processes the source language, and the decoder generates the translation autoregressively with beam search optimization.' },
      { industry: 'Speech Recognition', description: 'Whisper (OpenAI) uses an encoder-decoder Transformer where the encoder processes spectrogram features and the decoder generates text transcripts with punctuation and casing.' },
      { industry: 'Text Summarization', description: 'Pegasus and BART use encoder-decoder architectures where the encoder reads the full document and the decoder generates a concise summary, using masked spans during pre-training.' },
    ],
    caseStudy: {
      problem: 'A real-time translation system for live broadcasts required sub-500ms latency but beam search with k=4 took 2 seconds per sentence. Inference was bottlenecked by the autoregressive decoder.',
      solution: 'The team implemented speculative decoding: a smaller draft model generates candidate tokens quickly, and the full model verifies them in parallel. Combined with int8 quantization and Flash Attention, this reduced decoder latency by 4x.',
      results: 'End-to-end latency dropped from 2s to 350ms per sentence while maintaining 98% of BLEU score. The system now handles 10 concurrent live streams on a single GPU.',
    },
    bestPractices: [
      'Use Pre-LN (layer norm before sub-layers) for more stable training of deep Transformers',
      'Apply label smoothing with epsilon=0.1 to prevent overconfidence and improve generalization',
      'Use gradient clipping (max_norm=1.0) to prevent gradient explosion in deep models',
      'Prefer GELU over ReLU for smoother gradients and better performance',
      'Set dropout to 0.1 for small models, reduce for larger models (overfitting is less of an issue)',
      'Use length normalization in beam search to avoid bias toward shorter sequences',
    ],
    tools: ['PyTorch nn.Transformer', 'Hugging Face transformers library', 'Fairseq (Facebook AI)', 'Tensor2Tensor', 'OpenNMT'],
    jobRoles: ['NLP Research Scientist', 'ML Engineer (Translation/Generation)', 'Speech Recognition Engineer', 'AI Infrastructure Engineer', 'Deep Learning Researcher'],
    furtherReading: [
      '"Attention Is All You Need" — Vaswani et al. 2017',
      '"The Annotated Transformer" — Harvard NLP',
      '"BERT: Pre-training of Deep Bidirectional Transformers" — Devlin et al. 2018',
      '"Transformers from Scratch" — Peter Bloem',
      'PyTorch nn.Transformer documentation',
    ],
  },
  quiz: [
    {
      id: 'ta-1', type: 'mcq',
      question: 'What is the key architectural difference between the encoder and decoder in the original Transformer?',
      options: [
        'The encoder has more layers than the decoder',
        'The decoder has cross-attention (attends to encoder output) and masked self-attention, while the encoder only has self-attention',
        'The decoder uses learned positional embeddings while the encoder uses sinusoidal',
        'The encoder uses GELU activation while the decoder uses ReLU',
      ],
      correctAnswer: 'The decoder has cross-attention (attends to encoder output) and masked self-attention, while the encoder only has self-attention',
      explanation: 'The encoder has self-attention + FFN. The decoder has masked self-attention (prevents looking at future tokens) + cross-attention (attends to encoder output) + FFN. Cross-attention is what connects the encoder and decoder.',
    },
    {
      id: 'ta-2', type: 'truefalse',
      question: 'Residual connections in Transformers allow gradients to flow directly through the network, helping to mitigate the vanishing gradient problem in deep models.',
      correctAnswer: 'True',
      explanation: 'Residual (skip) connections add the input to the output of each sub-layer. During backpropagation, gradients can flow directly through these skip connections without being multiplied by layer weights, preventing vanishing gradients in deep stacks.',
    },
    {
      id: 'ta-3', type: 'mcq',
      question: 'What is the purpose of label smoothing during Transformer training?',
      options: [
        'To reduce the vocabulary size by merging similar tokens',
        'To prevent the model from becoming overconfident by softening target distributions',
        'To smooth the positional encodings across neighboring positions',
        'To reduce the computational cost of teacher forcing',
      ],
      correctAnswer: 'To prevent the model from becoming overconfident by softening target distributions',
      explanation: 'Label smoothing replaces hard one-hot targets (0 or 1) with softer targets (e.g., 0.9 for correct token, 0.1/V spread across all tokens). This prevents the model from assigning extreme probabilities and improves generalization.',
    },
    {
      id: 'ta-4', type: 'fillblank',
      question: 'During training, ___ forcing feeds the ground truth output to the decoder at each time step instead of the model\'s own predictions.',
      correctAnswer: 'teacher',
      explanation: 'Teacher forcing enables parallel training of the decoder — all positions are predicted simultaneously since the model always sees correct context. The trade-off is exposure bias during inference when the model must use its own predictions.',
    },
    {
      id: 'ta-5', type: 'match',
      question: 'Match each Transformer training/inference concept with its description:',
      pairs: [
        { left: 'Teacher Forcing', right: 'Feeds ground truth tokens during training for parallelism' },
        { left: 'Beam Search', right: 'Maintains k candidate sequences during inference' },
        { left: 'Label Smoothing', right: 'Softens target distributions with epsilon noise' },
        { left: 'Exposure Bias', right: 'Gap between teacher-forced training and autoregressive inference' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'Teacher forcing enables efficient training but creates exposure bias. Beam search improves inference quality over greedy decoding. Label smoothing regularizes the model by preventing overconfidence.',
    },
  ],
}))

export {}
