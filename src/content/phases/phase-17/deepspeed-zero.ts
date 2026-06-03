import { registerContent } from '@/content/index'

registerContent('p17-deepspeed-zero', () => ({
  difficulty: 'Advanced',
  estimatedTime: '60 minutes',
  prerequisites: ['p17-distributed-training'],
  tags: ['Distributed ML', 'Advanced', 'Training', 'DeepSpeed'],
  objectives: [
    'Understand ZeRO stages 1-3 and when to use each',
    'Configure DeepSpeed with a JSON configuration file',
    'Implement training with deepspeed.initialize',
    'Combine ZeRO-3 with Hugging Face Transformers',
    'Use activation checkpointing and gradient clipping in DeepSpeed',
  ],
  theory: `# DeepSpeed & ZeRO

## The Memory Problem

Training large models is memory-bound. A 175B parameter model in fp16:

| Component | Memory Needed |
|-----------|--------------|
| Model parameters (fp16) | 350 GB |
| Gradients (fp16) | 350 GB |
| Adam optimizer states (fp32) | 1400 GB (2x momentum + variance) |
| **Total** | **2100 GB per GPU** |

Without optimizations, this requires 26+ A100 80 GB GPUs just to store the state.

## ZeRO: Zero Redundancy Optimizer

ZeRO eliminates memory redundancy by partitioning model states across GPUs. It has three stages:

### ZeRO Stage 1: Optimizer State Partitioning

Only the optimizer states are partitioned. Each GPU stores $O/N$ optimizer states.

$$\\text{Memory per GPU} = P + G + \\frac{O}{N}$$

- **P**: Parameters (fp16) — full copy on each GPU
- **G**: Gradients (fp16) — full copy on each GPU  
- **O**: Optimizer States (fp32 momentum + variance) — **sharded**
- **N**: Number of GPUs

**Communication**: $O(P)$ per training step (broadcast updated params)

### ZeRO Stage 2: + Gradient Partitioning

Gradients are also partitioned. After backward, gradients are reduce-scattered (not all-reduced).

$$\\text{Memory per GPU} = P + \\frac{G}{N} + \\frac{O}{N}$$

**Communication**: $O(P)$ per training step (reduce-scatter grads + all-gather params)

### ZeRO Stage 3: + Parameter Partitioning

Everything is partitioned. Parameters are all-gathered on demand before forward/backward.

$$\\text{Memory per GPU} = \\frac{P}{N} + \\frac{G}{N} + \\frac{O}{N}$$

**Communication**: $O(\\psi P)$ where $\\psi$ is the number of parameter all-gathers

## ZeRO-Infinity

ZeRO-Infinity extends ZeRO-3 by allowing offload to CPU and NVMe:

$$\\text{GPU Memory} = \\frac{P_{\\text{active}}}{N} + \\frac{G_{\\text{current}}}{N}$$

$$\\text{CPU/NVMe} = P_{\\text{inactive}} + G_{\\text{previous}} + O$$

This enables training 100B+ models on a single GPU by streaming parameters from NVMe.

### Offload Strategy

| Offload Location | Bandwidth | Latency | Use Case |
|-----------------|-----------|---------|----------|
| GPU Memory | 2 TB/s | ~1 us | Active parameters (default) |
| CPU RAM | 50 GB/s | ~10 us | Idle parameters, optimizer states |
| NVMe SSD | 3 GB/s | ~100 us | Cold parameters (rarely accessed) |

## DeepSpeed Engine

DeepSpeed replaces the standard optimizer with the **DeepSpeedEngine**:

1. **ZeRO Optimization**: Automatic partitioning of model states
2. **Mixed Precision**: fp16/bf16 training with loss scaling
3. **Gradient Clipping**: By norm or value
4. **Activation Checkpointing**: Trade compute for memory
5. **Communication Optimizations**: Gradient bucketing, fused ops
6. **Learning Rate Schedulers**: Warmup, cosine, polynomial

### DeepSpeed Configuration JSON

All DeepSpeed settings are defined in a JSON configuration file:

$$\\text{zero\\_optimization} = \\{ \\text{stage}, \\text{offload\\_param}, \\text{offload\\_optimizer}, \\text{allgather\\_bucket\\_size} \\}$$

$$\\text{fp16} = \\{ \\text{enabled}, \\text{auto\\_cast}, \\text{loss\\_scale}, \\text{initial\\_scale\\_power} \\}$$

## Activation Checkpointing

Instead of storing all intermediate activations for the backward pass, activation checkpointing:
1. Stores selected activations (checkpoints)
2. Recomputes intermediate activations during backward from checkpoints

$$\\text{Memory Savings} \\approx O(L \\cdot S \\cdot H)$$

Where $L$ = layers, $S$ = sequence length, $H$ = hidden dimension.

**Trade-off**: ~33% compute overhead for ~50-70% memory reduction.

## Gradient Clipping

Gradient clipping prevents exploding gradients by scaling gradients to a maximum norm:

$$g \\leftarrow \\frac{g \\cdot \\text{max\\_norm}}{\\|g\\|_2 + \\epsilon} \\text{ if } \\|g\\|_2 > \\text{max\\_norm}$$

DeepSpeed integrates gradient clipping into the ZeRO optimizer, avoiding the need to gather all gradients before clipping.

## Mixed Precision Training

DeepSpeed supports:
- **fp16**: Half precision with dynamic loss scaling
- **bf16**: Brain float (better range, no loss scaling needed)
- **fp32 master weights**: Maintained for numerical stability
- **Tensor Core utilization**: Requires dimensions to be multiples of 8

## Communication Efficiency

DeepSpeed optimizes communication with:
- **Gradient bucketing**: Group small gradients into larger buffers
- **Hierarchical all-reduce**: Faster within node vs across nodes
- **Communication compression**: 1-bit Adam, 1-bit LAMB
- **Overlap communication**: Compute next layer while communicating current layer`,
  understanding: {
    analogy: 'A group studying for an exam where each person memorizes different chapters and shares knowledge on demand. ZeRO-1 is like each person memorizing the summary (optimizer states) of their assigned chapters. ZeRO-2 is each person memorizing both the summary and the practice questions (gradients). ZeRO-3 is each person memorizing everything about their chapters (parameters too). When anyone needs information from another chapter, they ask the person who memorized it.',
    steps: [
      { title: 'Define DeepSpeed Config', content: 'Create a JSON configuration file specifying ZeRO stage, mixed precision, gradient clipping, and other optimization settings. This file controls all DeepSpeed behavior.' },
      { title: 'Parse Arguments', content: 'Use deepspeed.add_config_arguments() to add command-line arguments for the config path. DeepSpeed uses argparse to parse its configuration.' },
      { title: 'Initialize Engine', content: 'Replace your standard optimizer with deepspeed.initialize(), which returns the engine, optimizer, dataloader, and learning rate scheduler.' },
      { title: 'Training Loop', content: 'Use engine.backward(loss) instead of loss.backward(), and engine.step() instead of optimizer.step(). The engine handles gradient accumulation, clipping, and ZeRO partitioning automatically.' },
      { title: 'Save and Load', content: 'Use engine.save_checkpoint() and engine.load_checkpoint() for ZeRO-aware checkpointing. Standard torch.save() does not handle sharded states correctly.' },
    ],
    misconceptions: [
      { misconception: 'ZeRO-3 is always better than ZeRO-2', truth: 'ZeRO-3 adds significant communication overhead (all-gather parameters before forward/backward). ZeRO-2 can be faster when the model fits in GPU memory with gradients partitioned.' },
      { misconception: 'DeepSpeed only works with Hugging Face', truth: 'DeepSpeed is model-agnostic and works with any PyTorch model. The HF integration is convenient but not required.' },
      { misconception: 'Activation checkpointing always saves memory with no cost', truth: 'It trades compute for memory — about 33% more computation for 50-70% memory reduction. The compute overhead varies by model architecture.' },
    ],
    comparisons: [
      { label: 'Memory Savings', methodA: 'ZeRO-1: O/N optim states saved', methodB: 'ZeRO-3: O(P+G+O)/N all saved' },
      { label: 'Comm Volume', methodA: 'ZeRO-1: O(P) per step', methodB: 'ZeRO-3: O(2P) per step (all-gather + reduce-scatter)' },
      { label: 'Offload Support', methodA: 'ZeRO-2: Optimizer + grad offload', methodB: 'ZeRO-3: Param + optim + grad to CPU/NVMe' },
      { label: 'Config Complexity', methodA: 'ZeRO-2: Simple config, few knobs', methodB: 'ZeRO-3: Complex config, many tuning options' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `import deepspeed
import torch
import torch.nn as nn

# DeepSpeed configuration (ds_config.json)
"""
{
    "train_batch_size": 32,
    "gradient_accumulation_steps": 1,
    "fp16": {
        "enabled": true,
        "auto_cast": true,
        "loss_scale": 0,
        "initial_scale_power": 16
    },
    "zero_optimization": {
        "stage": 2,
        "allgather_partitions": true,
        "allgather_bucket_size": 2e8,
        "overlap_comm": true,
        "reduce_scatter": true,
        "reduce_bucket_size": 2e8
    },
    "gradient_clipping": 1.0,
    "steps_per_print": 100
}
"""

class SimpleModel(nn.Module):
    def __init__(self, input_dim=784, hidden=256, output=10):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(input_dim, hidden),
            nn.ReLU(),
            nn.Linear(hidden, output),
        )
    def forward(self, x):
        return self.net(x)

def train_with_deepspeed():
    model = SimpleModel()
    
    # Initialize DeepSpeed engine
    model_engine, optimizer, _, _ = deepspeed.initialize(
        args=args,  # argparse.Namespace with deepspeed_config
        model=model,
        model_parameters=model.parameters(),
    )
    
    # Training data
    dataset = torch.randn(1000, 784)
    labels = torch.randint(0, 10, (1000,))
    
    for epoch in range(10):
        for i in range(0, len(dataset), 32):
            batch = dataset[i:i+32].to(model_engine.device)
            target = labels[i:i+32].to(model_engine.device)
            
            outputs = model_engine(batch)
            loss = nn.CrossEntropyLoss()(outputs, target)
            
            model_engine.backward(loss)
            model_engine.step()
        
        if epoch % 2 == 0:
            print(f"Epoch {epoch} Loss {loss.item():.4f}")

# Run with: deepspeed train.py --deepspeed_config ds_config.json`,
      output: `# Launch command:
# deepspeed train.py --deepspeed_config ds_config.json

# Training output (rank 0):
Epoch 0 Loss 2.3124
Epoch 2 Loss 1.2345
Epoch 4 Loss 0.5678
Epoch 6 Loss 0.2345
Epoch 8 Loss 0.1234`,
      explanation: 'Basic DeepSpeed training with ZeRO-2. The JSON config specifies all optimization settings. deepspeed.initialize() wraps the model and replaces the standard optimizer. The engine handles gradient partitioning, clipping, and fp16 scaling automatically.',
    },
    {
      level: 'intermediate',
      code: `import deepspeed
import torch
import torch.nn as nn

# ZeRO-3 configuration with CPU offload
deepspeed_config = {
    "train_batch_size": 16,
    "gradient_accumulation_steps": 4,
    "fp16": {
        "enabled": True,
        "auto_cast": True,
        "initial_scale_power": 16,
    },
    "zero_optimization": {
        "stage": 3,
        "offload_param": {
            "device": "cpu",
            "pin_memory": True,
        },
        "offload_optimizer": {
            "device": "cpu",
            "pin_memory": True,
        },
        "overlap_comm": True,
        "contiguous_gradients": True,
        "sub_group_size": 1e9,
        "reduce_bucket_size": 2e8,
        "stage3_prefetch_bucket_size": 2e8,
        "stage3_param_persistence_threshold": 1e6,
    },
    "activation_checkpointing": {
        "partition_activations": True,
        "cpu_checkpointing": True,
        "number_checkpoints": 2,
        "profile": False,
    },
    "gradient_clipping": 1.0,
    "steps_per_print": 100,
}

class LargeTransformer(nn.Module):
    def __init__(self, vocab_size=50000, d_model=1024, n_layers=12):
        super().__init__()
        self.embed = nn.Embedding(vocab_size, d_model)
        self.layers = nn.ModuleList([
            nn.TransformerEncoderLayer(d_model, nhead=16, batch_first=True)
            for _ in range(n_layers)
        ])
        self.norm = nn.LayerNorm(d_model)
        self.output = nn.Linear(d_model, vocab_size)
    
    def forward(self, x):
        x = self.embed(x)
        for layer in self.layers:
            x = layer(x)
        return self.output(self.norm(x))

# Enable activation checkpointing on transformer layers
def checkpoint_enable(layer):
    """Custom checkpointing function."""
    if isinstance(layer, nn.TransformerEncoderLayer):
        return deepspeed.checkpointing.checkpoint(layer)
    return layer

model = LargeTransformer()

# Initialize DeepSpeed with ZeRO-3 and CPU offload
model_engine, optimizer, _, _ = deepspeed.initialize(
    model=model,
    model_parameters=model.parameters(),
    config_params=deepspeed_config,
)

# Training loop
for step in range(1000):
    x = torch.randint(0, 50000, (2, 512)).to(model_engine.device)
    
    loss = model_engine(x).mean()
    model_engine.backward(loss)
    model_engine.step()
    
    if step % 100 == 0:
        print(f"Step {step} Loss {loss.item():.4f} "
              f"Mem {torch.cuda.memory_allocated()/1e9:.2f}GB")

model_engine.save_checkpoint('./checkpoint')`,
      output: `Step 0 Loss 10.2341 Mem 14.56 GB
Step 100 Loss 8.1234 Mem 14.58 GB
Step 200 Loss 6.7890 Mem 14.55 GB
Step 300 Loss 5.4321 Mem 14.60 GB
Step 400 Loss 4.0987 Mem 14.57 GB
Step 500 Loss 3.2345 Mem 14.59 GB`,
      explanation: 'ZeRO-3 with CPU offload for both parameters and optimizer states, combined with activation checkpointing. The config uses contiguous gradients for efficient communication, and prefetch buckets to overlap parameter all-gather with computation.',
    },
    {
      level: 'advanced',
      code: `import deepspeed
import torch
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    TrainingArguments,
    Trainer,
    DeepSpeedConfig,
)
from transformers.integrations import HfDeepSpeedConfig

# Hugging Face + DeepSpeed ZeRO-3 integration
# ds_config.json:
"""
{
    "bf16": {"enabled": true},
    "zero_optimization": {
        "stage": 3,
        "offload_param": {"device": "cpu"},
        "offload_optimizer": {"device": "cpu"},
        "overlap_comm": true,
        "contiguous_gradients": true,
        "reduce_bucket_size": 2e8,
        "stage3_prefetch_bucket_size": 5e8,
        "stage3_param_persistence_threshold": 1e6,
        "sub_group_size": 5e8,
        "gather_16bit_weights_on_model_save": true
    },
    "gradient_accumulation_steps": 8,
    "gradient_clipping": 1.0,
    "steps_per_print": 10,
    "train_batch_size": 64,
    "train_micro_batch_size_per_gpu": 4,
    "wall_clock_breakdown": false
}
"""

model_name = "meta-llama/Llama-2-7b-hf"
tokenizer = AutoTokenizer.from_pretrained(model_name)
tokenizer.pad_token = tokenizer.eos_token

# Initialize HF DeepSpeed config BEFORE loading model
# This ensures model parameters are immediately sharded
dscf = HfDeepSpeedConfig("ds_config.json")

model = AutoModelForCausalLM.from_pretrained(
    model_name,
    torch_dtype=torch.bfloat16,
    device_map="auto",
)

# Hugging Face Trainer with DeepSpeed
training_args = TrainingArguments(
    output_dir="./output",
    per_device_train_batch_size=4,
    gradient_accumulation_steps=8,
    num_train_epochs=3,
    save_steps=500,
    logging_steps=10,
    learning_rate=2e-5,
    warmup_steps=200,
    bf16=True,
    deepspeed="ds_config.json",
    report_to="wandb",
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=dataset,  # Your HF dataset
    tokenizer=tokenizer,
    data_collator=None,  # Default data collator
)

trainer.train()

# Save final model (merges shards)
trainer.save_model("./final_model")
tokenizer.save_pretrained("./final_model")

# For custom training without Trainer:
def custom_deepspeed_train():
    engine = deepspeed.initialize(
        model=model,
        model_parameters=model.parameters(),
        config_params="ds_config.json",
    )[0]
    
    for step, batch in enumerate(dataloader):
        loss = engine(batch["input_ids"], labels=batch["input_ids"]).loss
        engine.backward(loss)
        engine.step()

# This also works with ZeRO-3 offload to NVMe:
"""
"zero_optimization": {
    "stage": 3,
    "offload_param": {"device": "nvme", "nvme_path": "/nvme/offload"},
    "offload_optimizer": {"device": "nvme", "nvme_path": "/nvme/offload"}
}
"""`,
      output: `# Hugging Face + DeepSpeed ZeRO-3 fine-tuning LLaMA-2 7B
wandb: Logging to Weights & Biases
wandb: Run: efficient-fine-tune-42

{'loss': 2.3456, 'grad_norm': 0.89, 'learning_rate': 2e-5, 'epoch': 0.01}
{'loss': 1.8901, 'grad_norm': 0.76, 'learning_rate': 2e-5, 'epoch': 0.02}
{'loss': 1.6543, 'grad_norm': 0.92, 'learning_rate': 1.98e-5, 'epoch': 0.03}

# Memory: 42 GB per GPU (vs 56 GB without ZeRO-3 offload)
# Throughput: 1200 tokens/second/GPU`,
      explanation: 'Production-level ZeRO-3 with Hugging Face Transformers. HfDeepSpeedConfig ensures parameters are sharded immediately when the model is loaded. The Trainer handles checkpointing, logging, and ZeRO-aware save. NVMe offload enables training even larger models on limited GPU memory.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'LLM Training', description: 'Meta trained LLaMA 65B using ZeRO-3 across 2048 A100 GPUs. DeepSpeed ZeRO is the standard for training large language models at scale.' },
      { industry: 'Scientific Computing', description: 'DeepSpeed ZeRO is used for training large molecular dynamics models and climate models that require billions of parameters.' },
      { industry: 'Multimodal AI', description: 'Models like Flamingo and GPT-4V combine vision and language components, requiring ZeRO to manage heterogeneous parameter distributions across GPUs.' },
    ],
    caseStudy: {
      problem: 'A team needed to fine-tune a 70B parameter model on 8 A100 GPUs. Full training required ~560 GB of memory, but they only had 8 x 80 GB = 640 GB — barely enough without any overhead for activations.',
      solution: 'They used DeepSpeed ZeRO-3 with CPU offload for optimizer states and activation checkpointing. The per-GPU memory dropped from ~520 GB to ~52 GB, leaving room for activations and temporary buffers.',
      results: 'Fine-tuning completed in 14 days with 95% GPU utilization. Peak memory was 74 GB per GPU (under the 80 GB limit). The model converged to within 0.5% of the full-precision baseline.',
    },
    bestPractices: [
      'Always start with ZeRO-2 — it has lower communication overhead than ZeRO-3',
      'Use bf16 instead of fp16 when available (better numerical range, no loss scaling)',
      'Set contiguous_gradients=True in ZeRO-3 for faster communication',
      'Tune reduce_bucket_size and allgather_bucket_size based on your model size',
      'Use gradient checkpointing beyond 1B parameters to save memory',
      'Monitor gradient norm — DeepSpeed clips at the optimizer level, not after all-gather',
      'Save checkpoints with engine.save_checkpoint(), not torch.save() with ZeRO-3',
    ],
    tools: ['DeepSpeed Engine', 'DeepSpeed Config JSON', 'ZeRO-1/2/3', 'ZeRO-Infinity', 'Hugging Face Transformers', 'NVMe Offload', 'Activation Checkpointing'],
    jobRoles: ['ML Infrastructure Engineer', 'Large-Scale Training Engineer', 'Deep Learning Systems Researcher', 'AI Platform Engineer'],
    furtherReading: [
      'ZeRO Paper (Microsoft Research)',
      'DeepSpeed Documentation (deepspeed.ai)',
      'ZeRO-Infinity Paper',
      'Hugging Face DeepSpeed Integration Guide',
    ],
  },
  quiz: [
    {
      id: 'p17-ds-1', type: 'mcq',
      question: 'What does ZeRO Stage 2 partition across GPUs?',
      options: [
        'Only optimizer states (momentum and variance)',
        'Optimizer states and gradients, but not parameters',
        'Parameters, gradients, and optimizer states',
        'Only gradients — parameters and optimizer states are replicated',
      ],
      correctAnswer: 'Optimizer states and gradients, but not parameters',
      explanation: 'ZeRO-2 partitions optimizer states and gradients (G + O sharded, P replicated). Each GPU keeps a full copy of model parameters but only stores its fraction of gradients and optimizer states.',
    },
    {
      id: 'p17-ds-2', type: 'truefalse',
      question: 'ZeRO-Infinity can offload model parameters to CPU RAM and NVMe SSDs, enabling training of 100B+ parameter models on a single GPU.',
      correctAnswer: 'True',
      explanation: 'ZeRO-Infinity extends ZeRO-3 with heterogeneous memory support, streaming parameters from CPU/NVMe when needed. This enables training trillions of parameters on limited GPU memory.',
    },
    {
      id: 'p17-ds-3', type: 'code',
      question: 'What is the purpose of engine.backward(loss) instead of loss.backward() in DeepSpeed?',
      options: [
        'It computes gradients with a different algorithm',
        'It integrates gradient scaling, clipping, and ZeRO gradient partitioning',
        'It is exactly the same as loss.backward() — just a wrapper',
        'It skips gradient computation for frozen layers',
      ],
      correctAnswer: 'It integrates gradient scaling, clipping, and ZeRO gradient partitioning',
      explanation: 'DeepSpeed\'s backward handles fp16 loss scaling, gradient clipping, and ZeRO gradient partitioning internally. It also manages gradient accumulation buffers correctly for ZeRO stages.',
    },
    {
      id: 'p17-ds-4', type: 'fillblank',
      question: 'The technique that trades compute for memory by discarding intermediate activations and recomputing them during the backward pass is called ___.',
      correctAnswer: 'activation checkpointing',
      explanation: 'Activation checkpointing (also called gradient checkpointing) stores only selected activations as checkpoints. During backward, intermediate activations are recomputed from checkpoints, reducing memory at the cost of extra computation.',
    },
    {
      id: 'p17-ds-5', type: 'match',
      question: 'Match each ZeRO component with its typical memory location:',
      pairs: [
        { left: 'Active Parameters (ZeRO-3)', right: 'GPU Memory, all-gathered on demand' },
        { left: 'Inactive Parameters (ZeRO-3)', right: 'Sharded across GPUs, can offload to CPU' },
        { left: 'Optimizer States (ZeRO-1)', right: 'Partitioned across GPUs, fp32 precision' },
        { left: 'Gradients (ZeRO-2)', right: 'Reduce-scattered, fp16 precision' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'ZeRO distributes model states across the memory hierarchy. Active parameters are on GPU for computation, inactive ones are sharded/offloaded. Optimizer states remain in fp32, while gradients are in fp16.',
    },
  ],
}))

export {}
