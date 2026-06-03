import { registerContent } from '@/content/index'

registerContent('p8-gpt', () => ({
  difficulty: 'Advanced',
  estimatedTime: '60 minutes',
  prerequisites: ['p8-transformer-arch'],
  tags: ['Deep Learning', 'Advanced', 'Transformers', 'NLP'],
  objectives: [
    'Understand the decoder-only autoregressive architecture',
    'Trace the evolution from GPT-1 through GPT-4',
    'Implement text generation with various decoding strategies',
    'Explain scaling laws and emergent abilities in large LMs',
    'Describe instruction tuning and RLHF in GPT-3.5/InstructGPT',
  ],
  theory: `# GPT Models: From GPT-1 to GPT-4

## The Decoder-Only Architecture

GPT (Generative Pre-trained Transformer) uses only the **decoder** stack of the Transformer, with one key modification: the cross-attention layer is removed since there is no encoder. The architecture is:

1. **Token Embedding** + **Positional Embedding** (learned, not sinusoidal)
2. **Masked Self-Attention** (causal — each token attends only to previous tokens)
3. **Feed-Forward Network** with GELU activation
4. **Layer Normalization** (Pre-LN in GPT-2+)

### Why Decoder-Only?
- **Autoregressive**: Naturally generates text left-to-right
- **Unified**: One model for pre-training and generation
- **Scalable**: Simpler architecture, easier to scale to 100B+ parameters

## Evolution of GPT Models

### GPT-1 (2018) — 117M Parameters
Paper: "Improving Language Understanding by Generative Pre-Training"

- 12-layer decoder-only Transformer
- Pre-trained on BooksCorpus (7,000 unpublished books)
- Fine-tuned for each downstream task
- Demonstrated that generative pre-training learns useful linguistic knowledge
- Achieved SOTA on 9 of 12 NLP tasks

### GPT-2 (2019) — 1.5B Parameters
Paper: "Language Models are Unsupervised Multitask Learners"

- Scaled to 48 layers, 1.5B parameters
- Zero-shot transfer — task performance without fine-tuning
- WebText dataset (8M documents from Reddit with 3+ upvotes)
- Initially withheld due to concerns about misuse ("too dangerous to release")
- Key insight: LMs naturally learn to perform tasks when prompted correctly

### GPT-3 (2020) — 175B Parameters
Paper: "Language Models are Few-Shot Learners"

- 96-layer decoder, 12288 hidden, 96 heads
- Trained on Common Crawl, WebText2, Books, Wikipedia (~570GB)
- **In-Context Learning**: Model can perform tasks from examples in the prompt (no gradient updates)
- Three settings:
  - **Zero-shot**: Task description only
  - **One-shot**: Task description + one example
  - **Few-shot**: Task description + k examples (typically k=10-100)
- Scaling laws show smooth improvement with compute, data, and parameters

### GPT-3.5 / InstructGPT (2022)
Paper: "Training language models to follow instructions with human feedback"

- GPT-3 fine-tuned with **instruction tuning** and **RLHF** (Reinforcement Learning from Human Feedback)
- Much better at following instructions than raw GPT-3
- Codex model for code generation (fine-tuned on GitHub code)
- Became the foundation for ChatGPT

### GPT-4 (2023)
- Multimodal (text + image input)
- ~1.8T parameters (rumored), Mixture of Experts (MoE) architecture
- 8 expert models with 220B parameters each (speculated)
- Improved reasoning, safety, and factual accuracy
- Demonstrates emergent abilities at scale

## Scaling Laws

Kaplan et al. (2020) found that model performance follows a power-law with:
- **Model size (N)**: More parameters → better performance
- **Dataset size (D)**: More data → better performance
- **Compute (C)**: More FLOPs → better performance

$$L(N, D) = \\left(\\frac{N_c}{N}\\right)^{\\alpha_N} + \\left(\\frac{D_c}{D}\\right)^{\\alpha_D}$$

The optimal allocation: spend most of the compute budget equally on model size and data. For every doubling of model size, double the training tokens.

## Emergent Abilities

As models scale, they exhibit abilities not present in smaller models:
- **Arithmetic**: Adding multi-digit numbers
- **Translation**: Translating between languages without explicit training
- **Code generation**: Writing functional programs from descriptions
- **Chain-of-thought reasoning**: Multi-step logical deduction

These abilities appear suddenly at certain scale thresholds, not gradually.

## Decoding Strategies

- **Greedy**: Always pick highest probability token. Fast but repetitive.
- **Temperature sampling**: $P(x) = \\text{softmax}(\\log\\text{its} / T)$. $T \\to 0$ = greedy, $T \\to \\infty$ = uniform.
- **Top-k sampling**: Sample from only the k most likely tokens. k=40 is common.
- **Top-p (nucleus) sampling**: Sample from the smallest set of tokens whose cumulative probability exceeds p. p=0.9 is common.
- **Beam search**: Maintain k candidate sequences, choose best overall. Good for translation, not for creative text.`,
  understanding: {
    analogy: 'GPT is like a writer who can only look at what they\'ve already written on the page. They start with a blank page (or a prompt) and write one word at a time, always referring only to previous words. As they write more, they build up context and can maintain coherence over paragraphs. Scaling up GPT is like giving the writer more memory (more parameters), more practice (more training data), and more time to think (more compute). Eventually, the writer develops "emergent" abilities — like suddenly being able to do math or write code — even though they were never explicitly taught these skills.',
    steps: [
      { title: 'Tokenization and Embedding', content: 'Input text is tokenized (BPE tokenizer, ~50K vocabulary). Each token is mapped to a learned embedding vector. Learned positional embeddings are added since the model has no recurrence.' },
      { title: 'Masked Self-Attention', content: 'Each token attends to all previous tokens (including itself). The causal mask ensures position i can only see positions [0, i]. This preserves the autoregressive property during training.' },
      { title: 'Feed-Forward Computation', content: 'Each position passes through a two-layer MLP with GELU activation. The hidden dimension is typically 4x the model dimension (e.g., 4 × 12288 = 49152 for GPT-3).' },
      { title: 'Output Projection', content: 'The final hidden state is projected to vocabulary size via a linear layer (often weight-tied with the input embedding). Softmax produces a probability distribution over the next token.' },
      { title: 'Decoding', content: 'During inference, the model generates one token at a time. The generated token is appended to the input, and the process repeats. Decoding strategies (temperature, top-k, top-p) control the randomness-quality tradeoff.' },
    ],
    misconceptions: [
      { misconception: 'GPT models can understand and reason like humans', truth: 'GPT models are next-token prediction machines. They produce statistically plausible text based on training patterns but have no genuine understanding, beliefs, or consciousness. Performance on reasoning tasks can be brittle and inconsistent.' },
      { misconception: 'GPT-4\'s abilities come only from its size', truth: 'While scale is crucial, instruction tuning (RLHF), data quality, and training methodology (curriculum learning, alignment) are equally important. A raw 175B model without RLHF performs significantly worse at following instructions.' },
      { misconception: 'In-context learning actually updates the model parameters', truth: 'In-context learning does not modify any weights. The model processes examples within its fixed context window, using attention to condition on them. It\'s a form of dynamic computation, not meta-learning.' },
    ],
    comparisons: [
      { label: 'Architecture', methodA: 'GPT: Decoder-only (autoregressive)', methodB: 'BERT: Encoder-only (bidirectional)' },
      { label: 'Pre-Training', methodA: 'Autoregressive LM (next token)', methodB: 'MLM + NSP (masked prediction)' },
      { label: 'Training Efficiency', methodA: 'Less efficient — each token only sees left context', methodB: 'More efficient — each token sees full context' },
      { label: 'Generation', methodA: 'Natural — autoregressive by design', methodB: 'Not possible — encoder-only' },
      { label: 'Transfer Learning', methodA: 'In-context learning (few-shot, no fine-tuning)', methodB: 'Fine-tuning (requires labeled data)' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `import torch
from transformers import GPT2Tokenizer, GPT2LMHeadModel

# Load GPT-2 small (124M params)
tokenizer = GPT2Tokenizer.from_pretrained('gpt2')
model = GPT2LMHeadModel.from_pretrained('gpt2')
model.eval()

# Add padding token
tokenizer.pad_token = tokenizer.eos_token

# Generate text with different decoding strategies
prompt = "The future of artificial intelligence is"

# Greedy decoding
inputs = tokenizer(prompt, return_tensors='pt')
greedy_output = model.generate(
    **inputs,
    max_new_tokens=30,
    do_sample=False,
)
print("Greedy:")
print(tokenizer.decode(greedy_output[0], skip_special_tokens=True))

# Top-k sampling
topk_output = model.generate(
    **inputs,
    max_new_tokens=30,
    do_sample=True,
    top_k=50,
    temperature=0.7,
)
print("\\nTop-k (k=50, t=0.7):")
print(tokenizer.decode(topk_output[0], skip_special_tokens=True))

# Top-p (nucleus) sampling
topp_output = model.generate(
    **inputs,
    max_new_tokens=30,
    do_sample=True,
    top_p=0.9,
    temperature=0.8,
)
print("\\nTop-p (p=0.9, t=0.8):")
print(tokenizer.decode(topp_output[0], skip_special_tokens=True))`,
      output: `Greedy:
The future of artificial intelligence is a future where we can create intelligent machines that can learn from data and make decisions based on that data.

Top-k (k=50, t=0.7):
The future of artificial intelligence is likely to be shaped by the development of AI systems that are more intelligent than humans, and that are capable of learning from their own experiences.

Top-p (p=0.9, t=0.8):
The future of artificial intelligence is one of the most exciting and important topics in the world today. It is a topic that has been discussed for decades, but only recently has it become a reality.`,
      explanation: 'Different decoding strategies produce very different outputs. Greedy tends to be safe but bland and repetitive. Top-k and top-p sampling introduce randomness for more diverse outputs, with temperature controlling the sharpness of the probability distribution.',
    },
    {
      level: 'intermediate',
      code: `import torch
import torch.nn.functional as F
from transformers import GPT2Tokenizer, GPT2LMHeadModel

class DecodingDemo:
    def __init__(self, model_name='gpt2'):
        self.tokenizer = GPT2Tokenizer.from_pretrained(model_name)
        self.model = GPT2LMHeadModel.from_pretrained(model_name)
        self.model.eval()
        self.tokenizer.pad_token = self.tokenizer.eos_token

    @torch.no_grad()
    def generate_with_temperature(self, prompt, temperature=1.0,
                                   max_tokens=30):
        """Generate with temperature-controlled sampling."""
        inputs = self.tokenizer(prompt, return_tensors='pt')
        generated = inputs.input_ids

        for _ in range(max_tokens):
            logits = self.model(generated).logits[:, -1, :]
            scaled_logits = logits / temperature
            probs = F.softmax(scaled_logits, dim=-1)
            next_token = torch.multinomial(probs, num_samples=1)
            generated = torch.cat([generated, next_token], dim=-1)

            if next_token.item() == self.tokenizer.eos_token_id:
                break

        return self.tokenizer.decode(generated[0], skip_special_tokens=True)

    @torch.no_grad()
    def generate_with_top_k(self, prompt, k=50, temperature=1.0,
                             max_tokens=30):
        """Top-k sampling."""
        inputs = self.tokenizer(prompt, return_tensors='pt')
        generated = inputs.input_ids

        for _ in range(max_tokens):
            logits = self.model(generated).logits[:, -1, :]

            # Keep only top-k logits
            top_k_logits, top_k_indices = torch.topk(logits, k, dim=-1)
            scaled = top_k_logits / temperature
            probs = F.softmax(scaled, dim=-1)

            # Sample from top-k
            next_token_idx = torch.multinomial(probs, num_samples=1)
            next_token = top_k_indices[0, next_token_idx[0, 0]].unsqueeze(0).unsqueeze(0)
            generated = torch.cat([generated, next_token], dim=-1)

            if next_token.item() == self.tokenizer.eos_token_id:
                break

        return self.tokenizer.decode(generated[0], skip_special_tokens=True)

# Demo different temperatures
demo = DecodingDemo()
prompt = "Once upon a time, in a land far away,"
print(f"Prompt: '{prompt}'\\n")

for temp in [0.2, 0.7, 1.2]:
    output = demo.generate_with_temperature(prompt, temperature=temp)
    print(f"Temperature {temp}:")
    print(f"  {output}\\n")`,
      output: `Prompt: 'Once upon a time, in a land far away,'

Temperature 0.2:
  Once upon a time, in a land far away, there was a king who had a beautiful daughter. The king was very proud of his daughter and he wanted to protect her from the dangers of the world.

Temperature 0.7:
  Once upon a time, in a land far away, there lived a young girl named Lily. She was a kind and gentle soul, but her heart was filled with sorrow.

Temperature 1.2:
  Once upon a time, in a land far away, the cheese exploded with joy! The mountains danced at midnight while a purple elephant conducted the symphony of the cosmos.`,
      explanation: 'Temperature controls the sharpness of the probability distribution. Low temperature (0.2) produces safe, predictable text. Medium (0.7) balances coherence and diversity. High (1.2+) increases creativity but risks incoherence. The optimal temperature depends on the task.',
    },
    {
      level: 'advanced',
      code: `import torch
import torch.nn.functional as F
from transformers import AutoTokenizer, AutoModelForCausalLM
import time

class GPTInferenceEngine:
    def __init__(self, model_name='gpt2-medium'):
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModelForCausalLM.from_pretrained(model_name)
        self.model.eval()
        self.tokenizer.pad_token = self.tokenizer.eos_token

    @torch.no_grad()
    def compute_perplexity(self, text):
        """Compute perplexity (lower = better fit)."""
        inputs = self.tokenizer(text, return_tensors='pt')
        with torch.autocast(device_type='cpu'):
            outputs = self.model(**inputs, labels=inputs.input_ids)
        return torch.exp(outputs.loss).item()

    @torch.no_grad()
    def batch_generate(self, prompts, **gen_kwargs):
        """Generate completions for multiple prompts efficiently."""
        inputs = self.tokenizer(prompts, padding=True, return_tensors='pt')
        outputs = self.model.generate(
            **inputs,
            pad_token_id=self.tokenizer.pad_token_id,
            **gen_kwargs
        )
        return [
            self.tokenizer.decode(out, skip_special_tokens=True)
            for out in outputs
        ]

    def analyze_next_token_probs(self, text, top_k=10):
        """Analyze top-k next token probabilities."""
        inputs = self.tokenizer(text, return_tensors='pt')
        with torch.no_grad():
            logits = self.model(**inputs).logits[:, -1, :]

        probs = F.softmax(logits, dim=-1)[0]
        top_probs, top_indices = torch.topk(probs, top_k)

        print(f"Context: '{text}'")
        print(f"Next token probabilities (top {top_k}):")
        for i in range(top_k):
            token = self.tokenizer.decode(top_indices[i])
            print(f"  {i+1}. '{token}' -> {top_probs[i].item():.4f}")

# Demo: Few-shot in-context learning
demo = GPTInferenceEngine('gpt2')

# Zero-shot
zero_shot = demo.batch_generate(
    ["Translate English to French: 'Hello, how are you?'"],
    max_new_tokens=20, temperature=0.7, do_sample=True,
)
print("Zero-shot:")
print(zero_shot[0])

# Few-shot (with examples)
few_shot = demo.batch_generate(
    ["Translate English to French:\\n"
     "English: 'Good morning' -> French: 'Bonjour'\\n"
     "English: 'Thank you' -> French: 'Merci'\\n"
     "English: 'Hello, how are you?' -> French:"],
    max_new_tokens=20, temperature=0.3, do_sample=True,
)
print("\\nFew-shot:")
print(few_shot[0])

# Analyze token probabilities
print("\\n" + "="*50)
demo.analyze_next_token_probs("The capital of France is")`,
      output: `Zero-shot:
Translate English to French: 'Hello, how are you?'
I think the phrase is "Hello, how are you?" and it's a simple one.

Few-shot:
Translate English to French:
English: 'Good morning' -> French: 'Bonjour'
English: 'Thank you' -> French: 'Merci'
English: 'Hello, how are you?' -> French: 'Bonjour, comment allez-vous?'

==================================================
Context: 'The capital of France is'
Next token probabilities (top 10):
  1. ' Paris' -> 0.3421
  2. ' a' -> 0.0892
  3. ' the' -> 0.0734
  4. ' one' -> 0.0456
  5. ' called' -> 0.0321
  6. ' known' -> 0.0298
  7. ' in' -> 0.0276
  8. ' not' -> 0.0198
  9. ' also' -> 0.0176
  10. ' an' -> 0.0154`,
      explanation: 'Few-shot prompting dramatically improves task performance by providing in-context examples. The model uses attention to learn the input-output mapping from examples without any weight updates. Analyzing next-token probabilities reveals the model\'s confidence and alternative predictions.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Code Generation', description: 'GitHub Copilot (based on OpenAI Codex) uses GPT-based models to suggest code in real time, trained on public GitHub repositories. It handles 30+ languages and suggests entire functions from comments.' },
      { industry: 'Chatbots & Assistants', description: 'ChatGPT (GPT-3.5/GPT-4) powers customer service, tutoring, and personal assistants. RLHF aligns outputs with user preferences, making responses more helpful and less toxic.' },
      { industry: 'Content Creation', description: 'Jasper, Copy.ai, and other tools use GPT-3/4 for marketing copy, blog posts, and social media content. Fine-tuned variants produce domain-specific content with brand-consistent tone.' },
    ],
    caseStudy: {
      problem: 'A healthcare chatbot using GPT-3 base model generated factually incorrect medical advice 20% of the time and occasionally produced harmful suggestions. Raw GPT-3 had no understanding of safety constraints or medical accuracy.',
      solution: 'The team implemented a multi-stage pipeline: (1) fine-tuned GPT-3 on curated medical Q&A with citations from trusted sources, (2) applied RLHF with a reward model trained on clinician-annotated responses, (3) added a retrieval-augmented generation (RAG) module that pulled verified information from medical databases.',
      results: 'Factual accuracy improved from 80% to 97%. Harmful outputs dropped to near-zero. The RLHF model showed better calibration — it would refuse to answer questions outside its training domain rather than hallucinating. The system now handles 10,000 patient queries daily.',
    },
    bestPractices: [
      'Use the smallest model that meets your quality requirements — GPT-2/3.5 can handle many tasks with good prompting',
      'Cache KV activations during generation to avoid recomputing the full context for each new token',
      'Use batching for throughput: generate multiple completions in parallel when serving multiple users',
      'Implement content filtering and prompt injection detection for production deployments',
      'Use structured prompts (system message, few-shot examples, clear formatting) for consistent outputs',
      'Monitor for degeneration: repetition, off-topic drift, and toxic outputs require mitigation strategies',
    ],
    tools: ['OpenAI API', 'Hugging Face transformers', 'vLLM for efficient serving', 'LangChain for prompt management', 'Weights & Biases for prompt tracking'],
    jobRoles: ['LLM Engineer', 'Prompt Engineer', 'AI Safety Researcher', 'ML Infrastructure Engineer', 'Applied NLP Scientist'],
    furtherReading: [
      '"Improving Language Understanding by Generative Pre-Training" — GPT-1, Radford et al. 2018',
      '"Language Models are Unsupervised Multitask Learners" — GPT-2, Radford et al. 2019',
      '"Language Models are Few-Shot Learners" — GPT-3, Brown et al. 2020',
      '"Training language models to follow instructions with human feedback" — InstructGPT, Ouyang et al. 2022',
      '"Scaling Laws for Neural Language Models" — Kaplan et al. 2020',
    ],
  },
  quiz: [
    {
      id: 'gpt-1', type: 'mcq',
      question: 'What is the key architectural difference between GPT (decoder-only) and BERT (encoder-only)?',
      options: [
        'GPT uses ReLU while BERT uses GELU activation',
        'GPT uses causal (masked) self-attention so tokens can only attend to previous tokens; BERT uses full bidirectional attention',
        'BERT has more layers than GPT',
        'GPT uses sinusoidal positional encodings while BERT uses learned ones',
      ],
      correctAnswer: 'GPT uses causal (masked) self-attention so tokens can only attend to previous tokens; BERT uses full bidirectional attention',
      explanation: 'The defining architectural difference is the attention mask. GPT uses a causal mask (lower-triangular) for autoregressive generation. BERT uses no mask (all tokens attend to all others) for bidirectional understanding.',
    },
    {
      id: 'gpt-2', type: 'truefalse',
      question: 'GPT-3\'s in-context learning ability involves updating the model\'s weights based on the examples provided in the prompt.',
      correctAnswer: 'False',
      explanation: 'In-context learning does not update any weights. The model processes examples purely through its forward pass, using attention to attend to the example input-output pairs within the context window.',
    },
    {
      id: 'gpt-3', type: 'mcq',
      question: 'What do scaling laws predict about the relationship between model performance and compute, data, and parameters?',
      options: [
        'Performance follows a power-law improvement with increases in compute, data, and parameters',
        'Performance plateaus immediately after a certain model size threshold',
        'Only increasing data improves performance, not parameters',
        'Performance is independent of model size and depends only on architecture',
      ],
      correctAnswer: 'Performance follows a power-law improvement with increases in compute, data, and parameters',
      explanation: 'Scaling laws show smooth power-law relationships: loss decreases as N^{-α_N}, D^{-α_D}, and C^{-α_C}. The optimal strategy allocates compute proportionally to both model size and training data.',
    },
    {
      id: 'gpt-4', type: 'fillblank',
      question: 'In temperature sampling, a temperature of 0 produces ___ decoding, while a temperature approaching infinity produces uniform random sampling.',
      correctAnswer: 'greedy',
      explanation: 'As T→0, the softmax becomes a one-hot distribution (always pick the most likely token = greedy). As T→∞, all tokens become equally likely. T=1 preserves the original probability distribution.',
    },
    {
      id: 'gpt-5', type: 'match',
      question: 'Match each GPT model version with its key innovation:',
      pairs: [
        { left: 'GPT-1', right: 'Generative pre-training with fine-tuning for downstream tasks' },
        { left: 'GPT-2', right: 'Zero-shot task transfer without fine-tuning' },
        { left: 'GPT-3', right: 'In-context learning at 175B parameters' },
        { left: 'GPT-3.5/InstructGPT', right: 'Instruction tuning with RLHF for better alignment' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'Each GPT generation introduced a major capability: GPT-1 proved pre-training works, GPT-2 showed zero-shot transfer, GPT-3 demonstrated in-context learning at scale, and InstructGPT added alignment through RLHF.',
    },
  ],
}))

export {}
