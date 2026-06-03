import { registerContent } from '@/content/index'

registerContent('p8-llama-mistral', () => ({
  difficulty: 'Advanced',
  estimatedTime: '60 minutes',
  prerequisites: ['p8-gpt'],
  tags: ['Deep Learning', 'Advanced', 'Transformers', 'Open Source'],
  objectives: [
    'Understand the architectural innovations in LLaMA (RoPE, SwiGLU, RMS Norm, GQA)',
    "Explain Mistral's sliding window attention and rolling cache",
    "Describe Mixtral's sparse mixture-of-experts (MoE) architecture",
    'Load and run inference with open-source LLMs using Hugging Face',
    'Compare open-source models with proprietary alternatives',
  ],
  theory: `# LLaMA, Mistral, and Mixtral

## The Open-Source LLM Revolution

Meta's LLaMA family and Mistral AI's models have democratized access to large language models. These models match or exceed proprietary alternatives while being openly available.

## LLaMA: Meta's Efficient Architecture

### LLaMA (2023) — 7B, 13B, 33B, 65B

Paper: "LLaMA: Open and Efficient Foundation Language Models"

Key architectural innovations:

#### 1. RoPE (Rotary Position Embedding)
Instead of adding positional encoding to the input embedding, RoPE **rotates** the query and key vectors based on position:

$$\\text{RoPE}(x_m, m) = R_{\\Theta, m} \\cdot x_m$$

Where $R_{\\Theta, m}$ is a rotation matrix that depends on position $m$. This:
- Encodes relative position directly in attention computation
- Allows attention to decay smoothly with distance
- Provides better length generalization than learned embeddings
- Computationally efficient (implemented as pair-wise rotations)

#### 2. SwiGLU Activation
Replaces ReLU/GELU with SwiGLU (Swish-Gated Linear Unit):

$$\\text{SwiGLU}(x, W, V, b, c) = \\text{Swish}(xW + b) \\otimes (xV + c)$$

$$\\text{Swish}(x) = x \\cdot \\sigma(\\beta x)$$

SwiGLU consistently outperforms ReLU and GELU in Transformer language models, at the cost of 2/3 more parameters in the FFN (since it has three weight matrices instead of two).

#### 3. RMS Norm (Root Mean Square Layer Normalization)
Replaces LayerNorm with the simplified RMS Norm:

$$\\text{RMSNorm}(x) = \\frac{x}{\\sqrt{\\frac{1}{d}\\sum_{i=1}^{d} x_i^2 + \\epsilon}} \\cdot \\gamma$$

RMS Norm removes the mean-centering step, keeping only the scaling. This is computationally cheaper and performs similarly to LayerNorm in practice.

#### 4. Grouped-Query Attention (GQA)
Between MHA (each head has its own K,V) and MQA (all heads share one K,V):

- **MHA**: $h$ query heads, $h$ key/value heads
- **MQA**: $h$ query heads, 1 key/value head (faster decoding, quality loss)
- **GQA**: $h$ query heads, $g$ key/value heads where $1 < g < h$

GQA reduces KV cache size while maintaining most of MHA's quality. LLaMA 2 70B uses GQA with $g = 8$.

### LLaMA 2 (2023)
- Models: 7B, 13B, 70B
- **2x context length** (2048 to 4096 tokens)
- **Chat-tuned versions**: Fine-tuned with RLHF
- Open weights for commercial use

### LLaMA 3 (2024)
- Models: 8B, 70B (400B training)
- **128K vocabulary** (vs 32K in LLaMA 2) — better token efficiency
- GQA on all model sizes
- 8K context, extended to 128K in later versions
- Trained on 15T+ tokens

## Mistral: Efficiency Through Innovation

### Mistral 7B (2023)
Outperforms LLaMA 2 13B on most benchmarks

#### Sliding Window Attention (SWA)
Each token attends to a local window of $W$ previous tokens:

$$\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}} + M\\right)V$$

Where $M_{ij} = 0$ if $|i - j| \\leq W$ and $-\\infty$ otherwise.

With $W = 4096$, a stack of $L = 32$ layers provides an effective receptive field of $L \\times W = 128K$ tokens — information propagates layer by layer.

#### Rolling Buffer KV Cache
Only the last $W$ key-value pairs are cached, limiting memory to $O(W \\cdot d)$ instead of $O(n \\cdot d)$.

### Mixtral 8x7B (2024)
Paper: "Mixtral of Experts"

#### Sparse Mixture of Experts (MoE)
Instead of one dense FFN, Mixtral has 8 expert FFNs per layer. A router selects the top-2 experts:

$$y = \\sum_{i=1}^{2} G(x)_i \\cdot E_i(x)$$

$$G(x) = \\text{softmax}(\\text{TopK}(x \\cdot W_g, k))$$

Mixtral has 47B total parameters but only uses ~13B per token.

## Open-Source Ecosystem
- **Hugging Face**: Primary distribution platform
- **vLLM**: High-throughput serving with PagedAttention
- **Ollama**: Local model running on consumer hardware
- **llama.cpp**: CPU/quantized inference
- **Axolotl**: Fine-tuning framework`,
  understanding: {
    analogy: "Mixtral's MoE architecture is like a hospital with specialized doctors. Each expert (doctor) has deep knowledge in a specific area. When a patient (token) arrives, a triage nurse (router) determines which two experts are most relevant and sends the patient to them. The 'sparse' aspect means each token only activates a fraction of the total parameters — like only calling in 2 out of 8 specialists for each case, making the system efficient despite having a large staff.",
    steps: [
      { title: 'Tokenization with BPE', content: "LLaMA 3 uses a 128K-token BPE tokenizer (vs 32K for LLaMA 2). Larger vocabulary means fewer tokens per text, reducing sequence length and improving efficiency. Each token is mapped to a learned embedding." },
      { title: 'RoPE-Attention', content: 'Q and K vectors are rotated by position-dependent angles using sine/cosine pairs applied to 2D sub-dimensions. This encodes relative position directly into the attention computation.' },
      { title: 'Sliding Window (Mistral)', content: 'Attention is restricted to a local window (W=4096). Each token only attends to the previous W tokens, reducing memory from O(n^2) to O(n*W). Multiple layers propagate information further.' },
      { title: 'MoE Routing (Mixtral)', content: 'Before the FFN, a learned router computes scores for each expert. The top-2 experts are selected and their outputs are gated by the router weights.' },
      { title: 'RMS Norm + Residual', content: 'After attention and FFN/MoE, RMS Norm is applied (no mean-centering, just root-mean-square scaling). Residual connections wrap each sub-layer for stable gradient flow.' },
    ],
    misconceptions: [
      { misconception: 'MoE models use all parameters for every token', truth: 'MoE models are sparse — each token only activates a subset of experts (typically 2 out of 8). Total parameters can be large (47B), but per-token computation is only ~13B, similar to a dense 13B model.' },
      { misconception: 'Sliding window attention cannot capture long-range dependencies', truth: 'With L layers each having a window of W, the effective receptive field is L x W. For Mistral 7B (L=32, W=4096), this gives 128K effective context through layer-by-layer propagation.' },
      { misconception: 'Open-source models are always worse than proprietary ones', truth: "LLaMA 3 70B matches GPT-3.5 on many benchmarks. Mixtral 8x7B outperforms GPT-3.5 on several metrics. The gap between open and closed models is closing rapidly." },
    ],
    comparisons: [
      { label: 'Attention', methodA: 'GQA (Grouped-Query)', methodB: 'MHA (standard Multi-Head)', methodC: 'SWA (Sliding Window)' },
      { label: 'Position Encoding', methodA: 'RoPE (rotary)', methodB: 'Learned absolute', methodC: 'Sinusoidal' },
      { label: 'Normalization', methodA: 'RMS Norm', methodB: 'LayerNorm', methodC: 'LayerNorm' },
      { label: 'Activation', methodA: 'SwiGLU', methodB: 'GELU', methodC: 'GELU' },
      { label: 'FFN', methodA: 'Dense or MoE', methodB: 'Dense', methodC: 'Dense' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `import torch
from transformers import AutoTokenizer, AutoModelForCausalLM

# Using a smaller open model
model_name = "mistralai/Mistral-7B-v0.1"

print(f"Loading {model_name}...")
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(
    model_name,
    torch_dtype=torch.float16,
    device_map="auto",
)

tokenizer.pad_token = tokenizer.eos_token

# Basic inference
prompt = "Explain the concept of mixture of experts in one paragraph:"
inputs = tokenizer(prompt, return_tensors="pt").to(model.device)

with torch.no_grad():
    outputs = model.generate(
        **inputs,
        max_new_tokens=100,
        temperature=0.7,
        top_p=0.9,
        do_sample=True,
    )

response = tokenizer.decode(outputs[0], skip_special_tokens=True)
print(f"\\nPrompt: {prompt}")
print(f"Response:\\n{response[len(prompt):]}")`,
      output: `Loading mistralai/Mistral-7B-v0.1...
Prompt: Explain the concept of mixture of experts in one paragraph:
Response:
Mixture of Experts (MoE) is a machine learning technique where multiple specialized sub-models (experts) are combined, with a routing mechanism that dynamically selects which experts to activate for each input. In language models like Mixtral, the feed-forward layers are replaced by 8 expert networks, and a learned router selects the top 2 most relevant experts for each token.`,
      explanation: 'Loading open-source models from Hugging Face is straightforward with AutoModelForCausalLM. The device_map="auto" option distributes layers across available GPUs/CPU. Using float16 reduces memory by 2x while maintaining quality.',
    },
    {
      level: 'intermediate',
      code: `import torch
from transformers import pipeline
import time

# Using Hugging Face pipeline for easier inference
generator = pipeline(
    "text-generation",
    model="mistralai/Mistral-7B-v0.1",
    torch_dtype=torch.float16,
    device_map="auto",
)

# Batched prompts for efficient inference
prompts = [
    "Write a haiku about artificial intelligence:",
    "Explain what RMS Norm does in one sentence:",
    "What is the advantage of GQA over MHA?",
]

print("Generating responses for batched prompts...\\n")
start = time.time()

outputs = generator(
    prompts,
    max_new_tokens=60,
    temperature=0.7,
    do_sample=True,
    batch_size=3,
)

for i, output in enumerate(outputs):
    print(f"Prompt {i+1}: {prompts[i]}")
    print(f"Response: {output[0]['generated_text'][len(prompts[i]):]}")
    print()

print(f"Total time: {time.time() - start:.2f}s")`,
      output: `Generating responses for batched prompts...

Prompt 1: Write a haiku about artificial intelligence:
Response:
Silicon minds wake
Learning patterns from the world
Machines start to think

Prompt 2: Explain what RMS Norm does in one sentence:
Response:
RMS Norm normalizes activations by dividing by their root mean square, removing the mean-centering step of LayerNorm while retaining learnable scale parameters.

Prompt 3: What is the advantage of GQA over MHA?
Response:
GQA reduces the size of the KV cache by sharing key/value heads across query heads, speeding up inference with minimal quality loss.

Total time: 4.23s`,
      explanation: 'The Hugging Face pipeline abstraction simplifies batched inference. Batching multiple prompts together maximizes GPU utilization. Each prompt gets independent attention computation within the same forward pass.',
    },
    {
      level: 'advanced',
      code: `import torch
import torch.nn as nn
import torch.nn.functional as F
import math

class RMSNorm(nn.Module):
    def __init__(self, dim, eps=1e-6):
        super().__init__()
        self.weight = nn.Parameter(torch.ones(dim))
        self.eps = eps

    def forward(self, x):
        rms = torch.sqrt(torch.mean(x ** 2, dim=-1, keepdim=True) + self.eps)
        return x / rms * self.weight

class RotaryEmbedding(nn.Module):
    def __init__(self, dim, max_position=4096):
        super().__init__()
        inv_freq = 1.0 / (10000 ** (torch.arange(0, dim, 2).float() / dim))
        self.register_buffer('inv_freq', inv_freq)

    def forward(self, x, positions):
        freqs = positions.unsqueeze(-1).float() @ self.inv_freq.unsqueeze(0)
        emb = torch.cat([freqs, freqs], dim=-1)
        return emb.cos(), emb.sin()

def rotate_half(x):
    x1, x2 = x[..., :x.shape[-1] // 2], x[..., x.shape[-1] // 2:]
    return torch.cat([-x2, x1], dim=-1)

def apply_rotary_pos_emb(q, k, cos, sin):
    return q * cos + rotate_half(q) * sin, k * cos + rotate_half(k) * sin

class SwiGLU(nn.Module):
    def __init__(self, dim, hidden_dim):
        super().__init__()
        self.gate = nn.Linear(dim, hidden_dim, bias=False)
        self.up = nn.Linear(dim, hidden_dim, bias=False)
        self.down = nn.Linear(hidden_dim, dim, bias=False)

    def forward(self, x):
        return self.down(F.silu(self.gate(x)) * self.up(x))

class MoEFFN(nn.Module):
    def __init__(self, dim, hidden_dim, num_experts=8, top_k=2):
        super().__init__()
        self.num_experts = num_experts
        self.top_k = top_k
        self.router = nn.Linear(dim, num_experts, bias=False)
        self.experts = nn.ModuleList([
            nn.Sequential(
                nn.Linear(dim, hidden_dim, bias=False),
                nn.SiLU(),
                nn.Linear(hidden_dim, dim, bias=False),
            )
            for _ in range(num_experts)
        ])

    def forward(self, x):
        batch, seq, dim = x.shape
        x_flat = x.view(-1, dim)

        router_logits = self.router(x_flat)
        router_weights = F.softmax(router_logits, dim=-1)
        topk_weights, topk_indices = torch.topk(router_weights, self.top_k, dim=-1)
        topk_weights = topk_weights / topk_weights.sum(dim=-1, keepdim=True)

        output = torch.zeros_like(x_flat)
        for expert_idx in range(self.num_experts):
            mask = (topk_indices == expert_idx).any(dim=-1)
            if not mask.any():
                continue
            expert_input = x_flat[mask]
            expert_output = self.experts[expert_idx](expert_input)
            weights = topk_weights[mask][(topk_indices[mask] == expert_idx).nonzero(as_tuple=True)]
            output[mask] += expert_output * weights.view(-1, 1)

        return output.view(batch, seq, dim)

# Quick MoE demo
moe = MoEFFN(dim=512, hidden_dim=2048, num_experts=8, top_k=2)
dummy = torch.randn(2, 10, 512)
out = moe(dummy)
active = moe.router(dummy.view(-1, 512)).softmax(dim=-1)
print(f"Input shape: {dummy.shape}")
print(f"Output shape: {out.shape}")
print(f"Params: {sum(p.numel() for p in moe.parameters()):,}")`,
      output: `Input shape: torch.Size([2, 10, 512])
Output shape: torch.Size([2, 10, 512])
Params: 18,880,512`,
      explanation: 'This implements the key innovations: RMS Norm (simplified normalization), Rotary Position Embedding (relative position via rotation), SwiGLU (gated activation), and Sparse MoE (top-2 expert routing). The router achieves high sparsity — each token only activates 2 out of 8 experts.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'On-Device AI', description: 'LLaMA 7B and Mistral 7B run on consumer laptops and phones using llama.cpp with 4-bit quantization. Companies deploy on-device chatbots that preserve user privacy by processing data locally.' },
      { industry: 'Enterprise Search', description: 'Mixtral 8x7B powers retrieval-augmented generation (RAG) pipelines in enterprise search. Its MoE architecture provides GPT-3.5-level quality at significantly lower serving costs.' },
      { industry: 'Specialized Fine-Tuning', description: 'Open-source models are fine-tuned on domain-specific data (medical, legal, code). Organizations fine-tune LLaMA on their proprietary knowledge bases, creating custom models without sharing data with API providers.' },
    ],
    caseStudy: {
      problem: 'A healthcare SaaS company needed a clinical decision support chatbot. GPT-4 API costs were $200k/month for 1M patient queries. Data privacy regulations (HIPAA) prohibited sending patient data to external APIs.',
      solution: 'They deployed LLaMA 2 70B fine-tuned on medical literature (PubMed, clinical guidelines) using QLoRA. The model ran on two A100 GPUs using vLLM for serving. 4-bit quantization reduced memory from 140GB to 35GB.',
      results: 'Monthly inference cost dropped to $4,000 (98% savings). All data remained on-premises, ensuring HIPAA compliance. The fine-tuned LLaMA matched GPT-4 accuracy on medical QA benchmarks (87% vs 89%). Latency was 200ms per query.',
    },
    bestPractices: [
      'Use vLLM with PagedAttention for high-throughput serving — 10-20x throughput vs standard HF generation',
      'Quantize to 4-bit (GPTQ/AWQ) to fit larger models on fewer GPUs with minimal quality loss',
      'Use GQA/MQA models (LLaMA 2 70B+, Mistral) for faster decoding — less KV cache pressure',
      'For MoE models (Mixtral), set num_experts_per_tok appropriately — top-2 is standard, but top-1 can be faster',
      'Use sliding window (Mistral) for long documents — memory grows linearly with window, not quadratically with length',
      'Flash Attention v2 is available for most architectures — enables 2x+ speedup and longer sequences',
    ],
    tools: ['Hugging Face Transformers', 'vLLM', 'Ollama', 'llama.cpp', 'Axolotl (fine-tuning)', 'bitsandbytes (quantization)'],
    jobRoles: ['Open-Source LLM Engineer', 'ML Infrastructure Engineer', 'AI Deployment Engineer', 'Model Optimization Engineer', 'Privacy-Preserving AI Engineer'],
    furtherReading: [
      '"LLaMA: Open and Efficient Foundation Language Models" — Touvron et al. 2023',
      '"Llama 2: Open Foundation and Fine-Tuned Chat Models" — Touvron et al. 2023',
      '"Mistral 7B" — Jiang et al. 2023',
      '"Mixtral of Experts" — Jiang et al. 2024',
      '"RoFormer: Enhanced Transformer with Rotary Position Embedding" — Su et al. 2021',
    ],
  },
  quiz: [
    {
      id: 'lm-1', type: 'mcq',
      question: 'What is the key advantage of RoPE (Rotary Position Embedding) over learned absolute positional embeddings?',
      options: [
        'RoPE is computationally cheaper than adding positional encodings',
        'RoPE encodes relative position directly in the attention computation, allowing better generalization to longer sequences',
        'RoPE eliminates the need for residual connections',
        'RoPE reduces the number of attention heads needed',
      ],
      correctAnswer: 'RoPE encodes relative position directly in the attention computation, allowing better generalization to longer sequences',
      explanation: 'RoPE rotates Q and K vectors based on position, so the attention score QK^T naturally depends on relative distance. This provides better length generalization than absolute learned embeddings, which can struggle with positions not seen during training.',
    },
    {
      id: 'lm-2', type: 'truefalse',
      question: 'Grouped-Query Attention (GQA) uses fewer key/value heads than query heads, reducing KV cache memory while maintaining most of the quality of full Multi-Head Attention.',
      correctAnswer: 'True',
      explanation: 'GQA sits between MHA (h KV heads) and MQA (1 KV head) by using g KV heads where 1 < g < h. This reduces the KV cache proportionally to h/g while preserving model quality close to MHA.',
    },
    {
      id: 'lm-3', type: 'mcq',
      question: "In Mixtral's sparse MoE, how are experts selected for each token?",
      options: [
        'All 8 experts process every token, and their outputs are averaged',
        'A learned router selects the top-2 experts based on token features, and only those experts process the token',
        'Experts are randomly assigned to tokens during training',
        'The first 2 experts in the list are always used for efficiency',
      ],
      correctAnswer: 'A learned router selects the top-2 experts based on token features, and only those experts process the token',
      explanation: "A learned linear router computes affinity scores for all 8 experts. The top-2 are selected, and their outputs are weighted by the router's softmax scores. This keeps per-token computation equivalent to a ~13B dense model despite having 47B total parameters.",
    },
    {
      id: 'lm-4', type: 'fillblank',
      question: "Mistral's attention mechanism uses a ___ ___ of size W=4096, where each token only attends to the previous W tokens.",
      correctAnswer: 'sliding window',
      explanation: 'Sliding window attention restricts each token\'s attention to a local window of W tokens. With L layers, the effective receptive field is L * W. This reduces memory from O(n^2) to O(n*W).',
    },
    {
      id: 'lm-5', type: 'match',
      question: 'Match each normalization technique with its computation:',
      pairs: [
        { left: 'RMS Norm', right: 'x / sqrt(mean(x^2) + eps) * gamma — no mean-centering' },
        { left: 'LayerNorm', right: '(x - mean(x)) / sqrt(var(x) + eps) * gamma + beta' },
        { left: 'BatchNorm', right: '(x - batch_mean) / sqrt(batch_var + eps) * gamma + beta' },
        { left: 'SwiGLU', right: 'Swish(gate) * up projection — gated activation' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'RMS Norm simplifies LayerNorm by removing mean-centering while retaining learnable scaling. It is computationally cheaper and performs similarly in practice.',
    },
  ],
}))

export {}

