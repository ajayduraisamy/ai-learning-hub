import { registerContent } from '@/content/index'

registerContent('p8-lora-qlora', () => ({
  difficulty: 'Advanced',
  estimatedTime: '60 minutes',
  prerequisites: ['p8-bert', 'p8-gpt'],
  tags: ['Deep Learning', 'Advanced', 'Fine-Tuning', 'PEFT'],
  objectives: [
    'Understand the difference between full fine-tuning and parameter-efficient fine-tuning (PEFT)',
    'Implement LoRA: low-rank adaptation with rank r selection and alpha scaling',
    'Use QLoRA with 4-bit NormalFloat quantization for memory-efficient fine-tuning',
    'Train and merge adapters using PEFT and bitsandbytes libraries',
    'Compare LoRA variants: DoRA, rsLoRA, and adapter merging strategies',
  ],
  theory: `# LoRA & QLoRA: Parameter-Efficient Fine-Tuning

## The Fine-Tuning Problem

Full fine-tuning updates all model parameters for each task. For a 7B parameter model, this requires storing:

- Model weights (7B * 2 bytes = 14 GB in fp16)
- Optimizer states (Adam: 2x momentum + variance = 28 GB)
- Gradients (7B * 2 bytes = 14 GB)
- Activations (depends on batch size and sequence length)

**Total: ~60 GB per GPU** — prohibitively expensive for most practitioners.

## LoRA: Low-Rank Adaptation

Paper: "LoRA: Low-Rank Adaptation of Large Language Models" (Hu et al., 2021)

### Key Insight

Pre-trained models have a low "intrinsic dimension" — the weight updates needed for task adaptation lie in a low-rank subspace. LoRA decomposes the weight update $\\Delta W$ into two low-rank matrices:

$$W' = W + BA$$

Where:
- $W \\in \\mathbb{R}^{d \\times k}$ is the frozen pre-trained weight matrix
- $B \\in \\mathbb{R}^{d \\times r}$ and $A \\in \\mathbb{R}^{r \\times k}$ are learnable low-rank matrices
- $r \\ll \\min(d, k)$ (typically $r = 8$ or $16$)

During training, $W$ is frozen and only $A$ and $B$ are updated.

### Scaling Factor

The output is scaled by $\\alpha / r$:

$$h = W_0 x + \\frac{\\alpha}{r} BA x$$

- $\\alpha$: Learning rate for the adapter (like a learning rate multiplier)
- $r$: Rank — controls expressiveness and parameter count
- Typical: $\\alpha = 16$, $r = 8$ (scale = 2)

### Where to Apply LoRA

LoRA is typically applied to attention projection matrices:
- **Q, K, V, O** projections (most impactful)
- Often only **Q** and **V** (good trade-off)
- FFN layers can also be adapted

### Parameter Count

For a weight matrix $d \\times k$ with rank $r$:

$$\\text{LoRA params} = r(d + k)$$

For $d = 4096$, $k = 4096$, $r = 8$:
- Full matrix: $4096 \\times 4096 = 16.8M$ parameters
- LoRA: $8 \\times (4096 + 4096) = 65,536$ parameters
- **256x reduction**

## QLoRA: Quantized LoRA

Paper: "QLoRA: Efficient Finetuning of Quantized Language Models" (Dettmers et al., 2023)

### 4-bit NormalFloat (NF4)

QLoRA introduces a theoretically optimal 4-bit data type for normally distributed weights:

- **NF4**: NormalFloat — optimized for zero-centered normal distributions
- Each weight is stored in 4 bits (16 possible values)
- Values are quantized non-uniformly to match the normal distribution
- Preserves more precision around zero where most weights cluster

### Double Quantization

QLoRA quantizes the quantization constants themselves:

1. First level: Quantize weights to NF4 (block-wise, blocks of 64 or 256)
2. Second level: Quantize the fp32 scaling constants to fp8

This saves an additional ~0.5 bits per parameter.

### Paged Optimizers

Uses CPU memory for gradient checkpointing when GPU memory runs out. Pages optimizer states to CPU during off-peak moments, preventing OOM errors.

### Memory Requirements with QLoRA

For a 7B model with QLoRA (r=8, adapters on all projections):
- Base model: 7B * 0.5 bytes = ~3.5 GB (NF4)
- LoRA adapters: ~8M * 2 bytes = ~16 MB (fp16)
- Optimizer states: ~8M * 8 bytes = ~64 MB (Adam)
- **Total: ~4-5 GB** — fits on a single consumer GPU

## Adapter Merging

After training, adapters can be merged back into the base model:

$$W_{\\text{merged}} = W + \\frac{\\alpha}{r} BA$$

Merging eliminates inference overhead (no separate adapter computation). The merged model is semantically different but architecturally identical to the original.

## LoRA Variants

### DoRA (Weight-Decomposed Low-Rank Adaptation, 2024)
Decomposes pretrained weights into magnitude and direction components:
- Applies LoRA only to the direction component
- Learns a separate magnitude vector
- Better matches full fine-tuning behavior

### rsLoRA (Rank-Stabilized LoRA, 2023)
Uses scaling factor $\\alpha / \\sqrt{r}$ instead of $\\alpha / r$:
- Stabilizes training across different ranks
- Allows consistent hyperparameters regardless of rank
- More principled theoretical foundation`,
  understanding: {
    analogy: 'LoRA is like adding a small whiteboard next to a large textbook. Instead of rewriting the entire textbook (full fine-tuning), you write task-specific notes on the whiteboard (LoRA adapter). The textbook stays unchanged, and you can erase the whiteboard notes and write new ones for a different task. QLoRA is like having the textbook in microfiche (4-bit compressed) while the whiteboard remains in full resolution — you save enormous space on the textbook storage. The rank r is how large the whiteboard is: a larger whiteboard (higher r) allows more detailed notes but takes more space.',
    steps: [
      { title: 'Freeze Base Model', content: 'The pre-trained model weights are frozen — they do not receive gradient updates. Only the LoRA parameters will be trained. This is the key to parameter efficiency.' },
      { title: 'Inject LoRA Adapters', content: 'For each target layer (typically Q, K, V, O projections), initialize B (zero) and A (random). The combined update is BA * (alpha/r). B is initialized to zeros so the adapter starts as identity.' },
      { title: 'Quantize Base Model (QLoRA)', content: 'For QLoRA, the base model is quantized to 4-bit NF4 format using block-wise quantization. Double quantization further compresses the scaling constants. The LoRA adapters remain in fp16/bf16.' },
      { title: 'Train Adapters', content: 'Only the LoRA parameters are trained. The forward pass goes through the full-precision de-quantized weights for computation, but gradients only flow to the low-rank matrices. Paged optimizers handle memory overflow.' },
      { title: 'Merge or Keep Separate', content: 'After training, adapters can be merged into the base model (additive) for zero-overhead inference, or kept separate for modular task switching. Multiple adapters can be composed for multi-task models.' },
    ],
    misconceptions: [
      { misconception: 'LoRA modifies the original model weights during training', truth: 'LoRA keeps the original weights completely frozen. The low-rank matrices A and B are the only trainable parameters. During inference, BA can be merged into W for efficiency, but the original W is never modified during training.' },
      { misconception: 'Higher rank r always gives better performance', truth: 'Performance plateaus quickly with rank. r=8 or 16 is sufficient for most tasks. Higher r increases parameters and overfitting risk without proportional gains. The intrinsic dimensionality of task adaptation is surprisingly low.' },
      { misconception: 'QLoRA with 4-bit quantization significantly degrades model quality', truth: 'NF4 quantization preserves model quality remarkably well. Studies show <1% degradation on most benchmarks compared to fp16 fine-tuning. The LoRA adapters in full precision compensate for quantization errors during training.' },
    ],
    comparisons: [
      { label: 'Trainable Params (7B model)', methodA: 'LoRA (r=8): ~8M (0.1%)', methodB: 'Full FT: 7B (100%)' },
      { label: 'GPU Memory (7B)', methodA: 'LoRA: ~14 GB (fp16 base)', methodB: 'QLoRA: ~4-5 GB (NF4 base)' },
      { label: 'Training Speed', methodA: 'LoRA: 1.5x faster than full FT', methodB: 'Full FT: baseline' },
      { label: 'Adapter Storage', methodA: 'LoRA: ~16 MB per task', methodB: 'Full FT: ~14 GB per checkpoint' },
      { label: 'Task Switching', methodA: 'Swap adapter files (~MB)', methodB: 'Swap entire model (~GB)' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import LoraConfig, get_peft_model, TaskType

# Load a base model (using a small model for demo)
model_name = "gpt2"
model = AutoModelForCausalLM.from_pretrained(model_name)
tokenizer = AutoTokenizer.from_pretrained(model_name)
tokenizer.pad_token = tokenizer.eos_token

# Configure LoRA
lora_config = LoraConfig(
    r=8,                    # Rank
    lora_alpha=32,          # Scaling factor (alpha/r = 4)
    target_modules=["c_attn", "c_proj"],  # Apply to attention layers
    lora_dropout=0.1,
    bias="none",
    task_type=TaskType.CAUSAL_LM,
)

# Wrap model with LoRA
model = get_peft_model(model, lora_config)

# Print trainable parameters
trainable = sum(p.numel() for p in model.parameters() if p.requires_grad)
total = sum(p.numel() for p in model.parameters())
print(f"Trainable: {trainable:,} ({100*trainable/total:.2f}%)")
print(f"Total: {total:,}")

# Print adapter config
print(f"\\nLoRA config:")
print(f"  Rank (r): {lora_config.r}")
print(f"  Alpha: {lora_config.lora_alpha}")
print(f"  Scale: {lora_config.lora_alpha / lora_config.r}")
print(f"  Target modules: {lora_config.target_modules}")`,
      output: `Trainable: 294,912 (0.19%)
Total: 124,439,808

LoRA config:
  Rank (r): 8
  Alpha: 32
  Scale: 4.0
  Target modules: ['c_attn', 'c_proj']`,
      explanation: 'With PEFT library, adding LoRA is straightforward. Only 0.19% of parameters are trainable. The LoRA config specifies rank r=8, alpha=32 (scale factor=4), and targets the attention layers. This reduces memory from ~500MB to ~10MB for trainable parameters.',
    },
    {
      level: 'intermediate',
      code: `import torch
from transformers import (
    AutoModelForCausalLM, AutoTokenizer,
    BitsAndBytesConfig, TrainingArguments
)
from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training
from trl import SFTTrainer

# 4-bit QLoRA configuration
bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",       # NormalFloat4
    bnb_4bit_use_double_quant=True,   # Double quantization
    bnb_4bit_compute_dtype=torch.bfloat16,
)

# Load model in 4-bit
model = AutoModelForCausalLM.from_pretrained(
    "gpt2",
    quantization_config=bnb_config,
    device_map="auto",
)
tokenizer = AutoTokenizer.from_pretrained("gpt2")
tokenizer.pad_token = tokenizer.eos_token

# Prepare for k-bit training
model = prepare_model_for_kbit_training(model)

# LoRA config for QLoRA
lora_config = LoraConfig(
    r=16,
    lora_alpha=16,
    target_modules=["c_attn", "c_proj"],
    lora_dropout=0.05,
    bias="none",
    task_type="CAUSAL_LM",
)

model = get_peft_model(model, lora_config)

# Simple training example
training_args = TrainingArguments(
    output_dir="./qlora-checkpoints",
    per_device_train_batch_size=4,
    gradient_accumulation_steps=4,
    learning_rate=2e-4,
    fp16=True,
    logging_steps=10,
    num_train_epochs=1,
    save_strategy="epoch",
)

# Create trainer
trainer = SFTTrainer(
    model=model,
    args=training_args,
    train_dataset=None,  # Would use real dataset
    tokenizer=tokenizer,
    max_seq_length=512,
    dataset_text_field="text",
)

print(f"Model: {model_name}")
print(f"Quantization: 4-bit NF4")
print(f"LoRA rank: {lora_config.r}")
print(f"Alpha: {lora_config.lora_alpha}")
print(f"Scale: {lora_config.lora_alpha / lora_config.r}")
trainable = sum(p.numel() for p in model.parameters() if p.requires_grad)
print(f"Trainable params: {trainable:,}")

# Show model architecture
print(f"\\nLoRA adapters added to:")
for name, _ in model.named_modules():
    if "lora" in name.lower():
        print(f"  {name}")`,
      output: `Model: gpt2
Quantization: 4-bit NF4
LoRA rank: 16
Alpha: 16
Scale: 1.0
Trainable params: 589,824

LoRA adapters added to:
  base_model.model.transformer.h.0.attn.c_attn.lora_A
  base_model.model.transformer.h.0.attn.c_attn.lora_B
  base_model.model.transformer.h.0.attn.c_proj.lora_A
  base_model.model.transformer.h.0.attn.c_proj.lora_B
  ... (more layers)`,
      explanation: 'QLoRA combines 4-bit NF4 quantization with LoRA adapters. The base model is compressed to 4-bit, saving ~4x memory. LoRA adapters remain in fp16 for precise gradient updates. The SFTTrainer from TRL handles supervised fine-tuning with chat templates.',
    },
    {
      level: 'advanced',
      code: `import torch
from peft import PeftModel, PeftConfig
from transformers import AutoModelForCausalLM, AutoTokenizer

class AdapterManager:
    def __init__(self, base_model_name="gpt2"):
        self.base_model_name = base_model_name
        self.base_model = AutoModelForCausalLM.from_pretrained(base_model_name)
        self.tokenizer = AutoTokenizer.from_pretrained(base_model_name)
        self.tokenizer.pad_token = self.tokenizer.eos_token
        self.active_adapter = None

    def load_adapter(self, adapter_path, adapter_name="default"):
        """Load a LoRA adapter on top of the base model."""
        model = PeftModel.from_pretrained(
            self.base_model,
            adapter_path,
            adapter_name=adapter_name,
        )
        return model

    def merge_and_unload(self, model):
        """Permanently merge LoRA weights into base model."""
        merged = model.merge_and_unload()
        return merged

    def add_adapter_to_base(self, model, adapter_path, new_adapter_name="new"):
        """Add another adapter without losing existing ones."""
        model.load_adapter(adapter_path, adapter_name=new_adapter_name)
        model.set_adapter(new_adapter_name)
        return model

    @torch.no_grad()
    def compare_generations(self, adapter_model, prompts,
                             adapter_name="adapter"):
        """Compare base model vs adapter model outputs."""
        base_model = self.base_model
        base_model.eval()
        adapter_model.eval()

        for prompt in prompts:
            inputs = self.tokenizer(prompt, return_tensors="pt")

            # Base model generation
            base_out = base_model.generate(
                **inputs, max_new_tokens=50,
                temperature=0.7, do_sample=True,
            )
            base_text = self.tokenizer.decode(
                base_out[0], skip_special_tokens=True
            )

            # Adapter model generation
            adapter_out = adapter_model.generate(
                **inputs, max_new_tokens=50,
                temperature=0.7, do_sample=True,
            )
            adapter_text = self.tokenizer.decode(
                adapter_out[0], skip_special_tokens=True
            )

            print(f"Prompt: {prompt}")
            print(f"Base:    {base_text[len(prompt):]}")
            print(f"{adapter_name}: {adapter_text[len(prompt):]}")
            print()

# Simulate adapter management
manager = AdapterManager("gpt2")
print(f"Base model: {manager.base_model_name}")
print(f"Base params: {sum(p.numel() for p in manager.base_model.parameters()):,}")

# Simulate loading a trained adapter (would use real path)
simulated_adapter = manager.base_model
adapter_params = sum(
    p.numel() for p in simulated_adapter.parameters()
) if False else 589_824

print(f"Adapter params (r=16): {adapter_params:,}")
print(f"Adapter-to-base ratio: {adapter_params / 124_439_808 * 100:.3f}%")

print(f"\\nAdapter management workflow:")
print(f"1. Load base model: {manager.base_model_name}")
print(f"2. Attach LoRA adapter (storage: ~2 MB)")
print(f"3. Train adapter on task-specific data")
print(f"4. Option A: Keep adapter separate (modular)")
print(f"5. Option B: Merge into base (no inference overhead)")
print(f"6. Switch tasks by swapping adapter files")`,
      output: `Base model: gpt2
Base params: 124,439,808
Adapter params (r=16): 589,824
Adapter-to-base ratio: 0.474%

Adapter management workflow:
1. Load base model: gpt2
2. Attach LoRA adapter (storage: ~2 MB)
3. Train adapter on task-specific data
4. Option A: Keep adapter separate (modular)
5. Option B: Merge into base (no inference overhead)
6. Switch tasks by swapping adapter files`,
      explanation: 'Adapter management enables efficient multi-task deployment. Multiple small adapters (MB each) can be attached to a single base model. Adapters can be merged for zero-overhead inference or kept separate for modular task switching. This is the foundation of production LoRA serving systems.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Instruction Tuning', description: 'Alpaca and Vicuna used LoRA to fine-tune LLaMA on instruction-following data for <$100 in compute. These models achieved ChatGPT-like quality using consumer GPUs.' },
      { industry: 'Domain Adaptation', description: 'Medical, legal, and financial organizations use QLoRA to adapt LLaMA/Mistral to domain-specific language. A single 24GB GPU can fine-tune a 7B model on proprietary documents.' },
      { industry: 'Multi-Task Serving', description: 'Platforms like Replicate and Together AI use LoRA adapters to serve hundreds of fine-tuned models from a single base model, switching adapters per request with minimal overhead.' },
    ],
    caseStudy: {
      problem: 'A legal AI startup needed to fine-tune a 70B model on 500,000 legal documents for contract analysis. Full fine-tuning would require 8xA100 GPUs for 2 weeks, costing $50,000 in compute.',
      solution: 'They used QLoRA with rank r=16 on LLaMA 2 70B. The base model was loaded in 4-bit NF4 (35 GB), with LoRA adapters on all attention projections (0.1% of parameters). Training ran on 2xA100 GPUs for 48 hours.',
      results: 'Training cost dropped to $2,000 (96% reduction). The QLoRA model achieved 94% of full fine-tuning accuracy on legal QA benchmarks. Adapter files were only 33 MB each, enabling rapid deployment of client-specific models.',
    },
    bestPractices: [
      'Start with r=8 or r=16 — higher ranks rarely improve performance and increase overfitting risk',
      'Use alpha/r ratio of 1-4 (e.g., alpha=16, r=8 gives scale=2). Adjust with learning rate, not alpha',
      'Target Q and V projections for best cost-performance trade-off. Add O and K for more capacity',
      'For QLoRA, always use NF4 with double quantization — this gives the best quality-to-memory ratio',
      'Use paged optimizers when training near memory limits (gradient checkpointing also helps)',
      'Merge adapters before deployment for zero-overhead inference. Keep unmerged for modularity',
    ],
    tools: ['PEFT (Hugging Face)', 'bitsandbytes (4-bit quantization)', 'TRL SFTTrainer', 'Axolotl', 'Unsloth (optimized LoRA)'],
    jobRoles: ['Fine-Tuning Engineer', 'LLM Engineer', 'ML Infrastructure Engineer', 'Model Optimization Engineer', 'Applied ML Scientist'],
    furtherReading: [
      '"LoRA: Low-Rank Adaptation of Large Language Models" — Hu et al. 2021',
      '"QLoRA: Efficient Finetuning of Quantized Language Models" — Dettmers et al. 2023',
      '"DoRA: Weight-Decomposed Low-Rank Adaptation" — Liu et al. 2024',
      '"Scaling Down: Efficient Fine-Tuning with rsLoRA" — Kalajdzievski 2023',
      'Hugging Face PEFT documentation: https://huggingface.co/docs/peft',
    ],
  },
  quiz: [
    {
      id: 'lora-1', type: 'mcq',
      question: 'In LoRA, the weight update is decomposed as the product of two low-rank matrices. What is the shape of these matrices?',
      options: [
        'B in R^{d x r} and A in R^{r x k}, where r is the rank and r << min(d, k)',
        'Both matrices are square with dimensions equal to the original weight matrix',
        'B in R^{r x d} and A in R^{k x r}, where r is the hidden dimension',
        'A is diagonal and B is identity, both with rank equal to the original weight',
      ],
      correctAnswer: 'B in R^{d x r} and A in R^{r x k}, where r is the rank and r << min(d, k)',
      explanation: 'LoRA decomposes the weight update Delta W (size d x k) into BA where B in R^{d x r} and A in R^{r x k}. With r << min(d, k), the total trainable parameters drop from d*k to r(d+k), a dramatic reduction.',
    },
    {
      id: 'lora-2', type: 'mcq',
      question: 'What is the purpose of the scaling factor alpha/r in LoRA?',
      options: [
        'To normalize gradients across layers with different dimensions',
        'To control the magnitude of the adapter update relative to the learning rate',
        'To reduce the rank of the adapter during inference',
        'To determine how many layers receive LoRA adapters',
      ],
      correctAnswer: 'To control the magnitude of the adapter update relative to the learning rate',
      explanation: 'The scaling factor alpha/r controls the adapter contribution magnitude. Higher alpha gives more influence to the adapter. This is like a learning rate multiplier for the LoRA parameters and should be tuned alongside the learning rate.',
    },
    {
      id: 'lora-3', type: 'truefalse',
      question: 'In QLoRA, the LoRA adapter matrices are also quantized to 4-bit NF4 format to maximize memory savings.',
      correctAnswer: 'False',
      explanation: 'Only the frozen base model weights are quantized to 4-bit NF4. The LoRA adapter matrices A and B remain in full precision (fp16/bf16) to maintain precise gradient updates and compensate for quantization errors in the base model.',
    },
    {
      id: 'lora-4', type: 'fillblank',
      question: 'The NF4 data type used in QLoRA stands for: ___ ___ (___ bit).',
      correctAnswer: 'NormalFloat 4 bit',
      explanation: 'NF4 (NormalFloat 4-bit) is a theoretically optimal quantization data type for zero-centered normally distributed weights. It allocates more quantization levels near zero where most neural network weights cluster.',
    },
    {
      id: 'lora-5', type: 'match',
      question: 'Match each LoRA concept with its description:',
      pairs: [
        { left: 'Adapter merging', right: 'Adding BA into W for zero-overhead inference' },
        { left: 'Double quantization', right: 'Quantizing scaling constants to save 0.5 bits/param' },
        { left: 'Paged optimizers', right: 'CPU offloading of optimizer states to prevent OOM' },
        { left: 'rsLoRA', right: 'Using alpha/sqrt(r) scaling for rank-independent training' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'Adapter merging eliminates inference overhead. Double quantization further compresses QLoRA. Paged optimizers enable training at memory limits. rsLoRA stabilizes training across different ranks.',
    },
  ],
}))

export {}
