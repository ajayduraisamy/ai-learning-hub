import { registerContent } from '@/content/index'

registerContent('p17-distributed-training', () => ({
  difficulty: 'Advanced',
  estimatedTime: '60 minutes',
  prerequisites: ['p8-nn-basics', 'p8-optimizers'],
  tags: ['Distributed ML', 'Advanced', 'Training'],
  objectives: [
    'Understand the motivation for distributed training and when to use it',
    'Implement DDP with torch.distributed and NCCL backend',
    'Configure FSDP with sharding strategies and CPU offloading',
    'Combine mixed precision, gradient accumulation, and distributed training',
    'Set up multi-node training with SLURM and launch utilities',
  ],
  theory: `# Distributed Training (DDP & FSDP)

## Why Distributed Training?

Modern deep learning models exceed the memory capacity of a single GPU. A 70B parameter model in fp16 requires 140 GB — far beyond the 80 GB of an A100. Distributed training solves this by:

1. **Memory Scaling**: Split model parameters, gradients, and optimizer states across GPUs
2. **Throughput Scaling**: Process more samples per second with data parallelism
3. **Training Speed**: Reduce time-to-accuracy from weeks to days

### Types of Parallelism

| Strategy | What's Split | When to Use |
|----------|-------------|-------------|
| **Data Parallel** | Batches across GPUs | Model fits on one GPU, need throughput |
| **Model Parallel** | Layers across GPUs | Model too large for one GPU |
| **Pipeline Parallel** | Layers split with micro-batches | Balance of memory and throughput |
| **Tensor Parallel** | Matrix operations split | Very large transformers |
| **FSDP/ZeRO** | Params, grads, optimizer states | Largest models that barely fit |

## DDP: Distributed Data Parallel

### How DDP Works

DDP uses the **all-reduce** collective communication primitive to synchronize gradients:

1. Each GPU receives a copy of the model and a distinct subset of the batch
2. Each GPU computes forward and backward passes independently
3. Gradients are averaged across all GPUs via all-reduce (ring algorithm)
4. Each GPU applies the averaged gradients to its local model copy

### Gradient Bucketing

DDP groups gradients into **buckets** (by size) to overlap computation and communication:

$$\\text{all-reduce}(g_i) \\parallel \\text{backward}(g_{i+1})$$

This hides communication latency behind gradient computation.

### NCCL Backend

NCCL (NVIDIA Collective Communications Library) provides optimized:
- **all-reduce**: Sum gradients across GPUs and distribute
- **broadcast**: Send model parameters from rank 0 to all
- **all-gather**: Gather tensors from all GPUs to all GPUs
- **reduce-scatter**: Sum and redistribute shards

### Key DDP Parameters

- \`device_ids\`: Which GPU to use for this process
- \`output_device\`: Where to place output
- \`find_unused_parameters\`: For models with conditional computation
- \`gradient_as_bucket_view\`: Avoid extra memory copies

## FSDP: Fully Sharded Data Parallel

### How FSDP Differs from DDP

DDP keeps a full copy of the model on each GPU. FSDP **shards** (distributes) parameters, gradients, and optimizer states across GPUs:

| Resource | DDP | FSDP |
|----------|-----|------|
| Parameters | Full copy per GPU | Sharded (1/N per GPU) |
| Gradients | Full per GPU, all-reduced | Sharded, reduce-scatter |
| Optimizer States | Full per GPU | Sharded (1/N per GPU) |
| Memory per GPU | O(P) | O(P/N) |

### Sharding Strategies

**FULL_SHARD** (HSD): Shard parameters, gradients, optimizer states
- Memory: O(P/N) — best memory savings
- Communication: All-gather parameters forward/backward

**SHARD_GRAD_OP**: Shard only gradients and optimizer states
- Memory: O(P) parameters + O(G/N + O/N)
- Communication: All-reduce gradients (like DDP)

**NO_SHARD**: Equivalent to DDP
- Memory: Full copy
- Communication: All-reduce

### FSDP vs ZeRO

FSDP implements the ZeRO Stage 3 algorithm. The concepts align:

| ZeRO Stage | FSDP Equivalent | Memory Savings |
|-----------|-----------------|----------------|
| ZeRO-1 | — | Optimizer states |
| ZeRO-2 | SHARD_GRAD_OP | + Gradients |
| ZeRO-3 | FULL_SHARD | + Parameters |

### CPU Offload

FSDP can offload parameters to CPU when not in use:

$$\\text{GPU Memory} = \\frac{P}{N} + \\frac{G}{N} + \\frac{O}{N}$$

$$\\text{CPU Memory} = P \\cdot (1 - \\frac{1}{N}) + G \\cdot (1 - \\frac{1}{N})$$

This trades compute (CPU-GPU transfers) for memory, enabling training on fewer GPUs.

## Multi-Node Setup with SLURM

SLURM (Simple Linux Utility for Resource Management) schedules jobs on clusters:

1. \`srun\` launches processes across nodes
2. Environment variables: \`SLURM_PROCID\`, \`SLURM_NTASKS\`, \`SLURM_NODELIST\`
3. \`torchrun\` handles \`MASTER_ADDR\`, \`MASTER_PORT\`, \`WORLD_SIZE\`, \`RANK\`

### Key Environment Variables

| Variable | Purpose |
|----------|---------|
| \`RANK\` | Global process rank (0 to world_size-1) |
| \`LOCAL_RANK\` | Rank within a single node |
| \`WORLD_SIZE\` | Total processes across all nodes |
| \`MASTER_ADDR\` | Hostname/IP of rank 0 node |
| \`MASTER_PORT\` | Port for distributed communication |

## Mixed Precision + DDP

Combining automatic mixed precision (AMP) with DDP:

- **Forward pass**: fp16 for compute, fp32 master weights
- **Gradient scaling**: Prevent underflow in fp16 gradients
- **All-reduce**: Gradients communicated in fp16, accumulated in fp32
- **Loss scaling**: Dynamic loss scaling adapts to gradient magnitude

## Gradient Accumulation Across GPUs

With gradient accumulation, the effective batch size is:

$$\\text{Effective Batch} = \\text{Batch Per GPU} \\times \\text{GPUs} \\times \\text{Accumulation Steps}$$

This allows training with very large effective batch sizes without requiring proportional GPU memory.`,
  understanding: {
    analogy: 'A group project where each person gets a complete copy of the textbook (DDP) versus each person specializes in one chapter and shares what they know on demand (FSDP). In DDP, everyone reads the same book, takes notes, and then meets to compare notes and average them. In FSDP, each person memorizes one chapter, and when someone needs chapter 3, they ask that person for the relevant passages.',
    steps: [
      { title: 'Initialize Process Group', content: 'Call dist.init_process_group() to set up the distributed environment. This configures the backend (NCCL for GPU) and establishes communication between processes using MASTER_ADDR and MASTER_PORT.' },
      { title: 'Wrap Model for DDP/FSDP', content: 'Wrap your model with torch.nn.parallel.DistributedDataParallel for DDP, or use FSDP from torch.distributed.fsdp with the desired sharding strategy.' },
      { title: 'Partition Data', content: 'Use DistributedSampler to split the dataset across processes. Each process gets a unique subset of the batch, ensuring no overlap and complete coverage.' },
      { title: 'Train with Synchronization', content: 'Run forward/backward as usual. DDP automatically synchronizes gradients via all-reduce. FSDP gathers sharded parameters before forward and reduces gradients after backward.' },
      { title: 'Save Checkpoints', content: 'Only rank 0 saves the model to avoid file corruption. Use dist.barrier() to ensure all processes reach the save point before checkpointing.' },
    ],
    misconceptions: [
      { misconception: 'DDP and FSDP give identical results to single-GPU training', truth: 'While mathematically equivalent, numerical differences arise from floating-point non-associativity in all-reduce. FSDP additionally introduces all-gather operations that can cause subtle numerical differences.' },
      { misconception: 'More GPUs always means faster training', truth: 'Communication overhead grows with GPU count. The speedup follows Amdahl\'s law — at some point, communication dominates compute. Gradient bucketing and overlap help but do not eliminate this.' },
      { misconception: 'FSDP eliminates the need for model parallelism', truth: 'FSDP shards parameters but still requires all-gather for forward/backward passes. For models that cannot fit even a single layer on one GPU, tensor/pipeline parallelism is still needed.' },
    ],
    comparisons: [
      { label: 'Memory per GPU', methodA: 'DDP: O(P) — full model copy', methodB: 'FSDP: O(P/N) — sharded across N GPUs' },
      { label: 'Communication', methodA: 'DDP: all-reduce gradients (O(P))', methodB: 'FSDP: all-gather params + reduce-scatter (O(2P))' },
      { label: 'Compute Overlap', methodA: 'DDP: Gradient bucketing overlaps comm/comp', methodB: 'FSDP: Prefetching next layer while computing current layer' },
      { label: 'CPU Offload', methodA: 'DDP: Not supported natively', methodB: 'FSDP: Can offload params/grads/optim states to CPU' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `import torch
import torch.distributed as dist
import torch.nn as nn
import torch.optim as optim
from torch.nn.parallel import DistributedDataParallel as DDP
from torch.utils.data import DataLoader, Dataset, DistributedSampler

# Basic DDP training script
class SimpleModel(nn.Module):
    def __init__(self):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(784, 256),
            nn.ReLU(),
            nn.Linear(256, 10),
        )
    def forward(self, x):
        return self.net(x)

def setup(rank, world_size):
    """Initialize the distributed process group."""
    dist.init_process_group(
        backend='nccl',
        init_method='env://',
        rank=rank,
        world_size=world_size,
    )
    torch.cuda.set_device(rank)

def cleanup():
    dist.destroy_process_group()

def train(rank, world_size, dataset):
    setup(rank, world_size)
    
    # Create distributed sampler and dataloader
    sampler = DistributedSampler(dataset, num_replicas=world_size, rank=rank)
    dataloader = DataLoader(dataset, batch_size=32, sampler=sampler)
    
    # Create model and move to GPU
    model = SimpleModel().to(rank)
    ddp_model = DDP(model, device_ids=[rank])
    
    optimizer = optim.Adam(ddp_model.parameters(), lr=0.001)
    criterion = nn.CrossEntropyLoss()
    
    for epoch in range(10):
        sampler.set_epoch(epoch)  # Shuffle differently per epoch
        for batch_idx, (data, target) in enumerate(dataloader):
            data, target = data.to(rank), target.to(rank)
            
            optimizer.zero_grad()
            output = ddp_model(data)
            loss = criterion(output, target)
            loss.backward()
            optimizer.step()
            
            if batch_idx % 100 == 0 and rank == 0:
                print(f"Epoch {epoch} Batch {batch_idx} Loss {loss.item():.4f}")
    
    # Save checkpoint on rank 0 only
    if rank == 0:
        torch.save(model.state_dict(), 'model.pt')
    
    cleanup()

if __name__ == '__main__':
    world_size = torch.cuda.device_count()
    dataset = torch.randn(10000, 784), torch.randint(0, 10, (10000,))
    # Launch with: torchrun --nproc_per_node=N script.py`,
      output: `# Expected launch command:
# torchrun --nproc_per_node=4 distributed_train.py

# Training output (rank 0 only):
Epoch 0 Batch 0 Loss 2.3124
Epoch 0 Batch 100 Loss 1.8542
Epoch 1 Batch 0 Loss 1.2345
...
Epoch 9 Batch 0 Loss 0.2341`,
      explanation: 'This shows the complete DDP training pattern. The model is wrapped with DDP, DistributedSampler partitions data across GPUs, and gradients are automatically all-reduced. Only rank 0 saves the checkpoint to avoid file corruption.',
    },
    {
      level: 'intermediate',
      code: `import torch
import torch.nn as nn
from torch.distributed.fsdp import (
    FullyShardedDataParallel as FSDP,
    CPUOffload,
    MixedPrecision,
    BackwardPrefetch,
    ShardingStrategy,
)
from torch.distributed.fsdp.wrap import (
    transformer_auto_wrap_policy,
    size_based_auto_wrap_policy,
)
import torch.distributed as dist

class TransformerBlock(nn.Module):
    def __init__(self, d_model=512, nhead=8):
        super().__init__()
        self.attn = nn.MultiheadAttention(d_model, nhead)
        self.ffn = nn.Sequential(
            nn.Linear(d_model, d_model * 4),
            nn.GELU(),
            nn.Linear(d_model * 4, d_model),
        )
        self.ln1 = nn.LayerNorm(d_model)
        self.ln2 = nn.LayerNorm(d_model)

    def forward(self, x):
        x = x + self.attn(self.ln1(x), self.ln1(x), self.ln1(x))[0]
        x = x + self.ffn(self.ln2(x))
        return x

class TransformerModel(nn.Module):
    def __init__(self, vocab_size=30000, d_model=512, n_layers=6):
        super().__init__()
        self.embed = nn.Embedding(vocab_size, d_model)
        self.layers = nn.ModuleList([
            TransformerBlock(d_model) for _ in range(n_layers)
        ])
        self.output = nn.Linear(d_model, vocab_size)

    def forward(self, x):
        x = self.embed(x)
        for layer in self.layers:
            x = layer(x)
        return self.output(x)

def setup_fsdp(rank, world_size):
    dist.init_process_group(backend='nccl', rank=rank, world_size=world_size)
    torch.cuda.set_device(rank)

    # Mixed precision config
    fp16_policy = MixedPrecision(
        param_dtype=torch.float16,
        reduce_dtype=torch.float16,
        buffer_dtype=torch.float16,
    )

    # Auto-wrap policy — wraps each TransformerBlock separately
    wrap_policy = size_based_auto_wrap_policy(
        min_num_params=1_000_000
    )

    model = TransformerModel().to(rank)

    fsdp_model = FSDP(
        model,
        sharding_strategy=ShardingStrategy.FULL_SHARD,
        cpu_offload=CPUOffload(offload_params=True),
        mixed_precision=fp16_policy,
        auto_wrap_policy=wrap_policy,
        backward_prefetch=BackwardPrefetch.BACKWARD_PRE,
        device_id=rank,
    )

    return fsdp_model

def train_fsdp(rank, world_size):
    model = setup_fsdp(rank, world_size)
    optim = torch.optim.AdamW(model.parameters(), lr=3e-4)
    
    for step in range(1000):
        # Simulated input
        x = torch.randint(0, 30000, (4, 128)).to(rank)
        
        loss = model(x).mean()
        loss.backward()
        optim.step()
        optim.zero_grad()
        
        if step % 100 == 0 and rank == 0:
            print(f"Step {step} Loss {loss.item():.4f}")

    # Save consolidated checkpoint
    if rank == 0:
        state_dict = model.state_dict()
        torch.save(state_dict, 'fsdp_model.pt')

dist.init_process_group(
    backend='nccl',
    init_method='env://',
)
rank = int(dist.get_rank())
train_fsdp(rank, dist.get_world_size())
`,
      output: `Step 0 Loss 10.2341
Step 100 Loss 8.4562
Step 200 Loss 6.7891
Step 300 Loss 5.1234
Step 400 Loss 3.5678
Step 500 Loss 2.3456`,
      explanation: 'This FSDP example uses FULL_SHARD strategy to shard parameters across GPUs, mixed precision for memory efficiency, and CPU offload for parameters not in active use. The auto_wrap_policy decides which modules to wrap individually, enabling fine-grained sharding.',
    },
    {
      level: 'advanced',
      code: `import torch
import torch.nn as nn
from torch.distributed.fsdp import (
    FullyShardedDataParallel as FSDP,
    ShardingStrategy,
    MixedPrecision,
    CPUOffload,
)
from torch.utils.data import DistributedSampler
from torch.cuda.amp import GradScaler, autocast

class LargeModel(nn.Module):
    def __init__(self, vocab_size=50000, d_model=1024, n_layers=24):
        super().__init__()
        self.embed = nn.Embedding(vocab_size, d_model)
        self.layers = nn.ModuleList([
            nn.TransformerEncoderLayer(d_model, nhead=16, dim_feedforward=4096)
            for _ in range(n_layers)
        ])
        self.norm = nn.LayerNorm(d_model)
        self.output = nn.Linear(d_model, vocab_size)
    
    def forward(self, x):
        x = self.embed(x)
        for layer in self.layers:
            x = layer(x)
        return self.output(self.norm(x))

def create_fsdp_model(rank, world_size, shard_strategy=ShardingStrategy.FULL_SHARD):
    model = LargeModel()
    
    # Gradient checkpointing saves memory by recomputing activations
    model.gradient_checkpointing_enable()
    
    # Mixed precision policy
    mp_policy = MixedPrecision(
        param_dtype=torch.bfloat16,
        reduce_dtype=torch.bfloat16,
        buffer_dtype=torch.bfloat16,
    )
    
    fsdp_model = FSDP(
        model,
        sharding_strategy=shard_strategy,
        mixed_precision=mp_policy,
        cpu_offload=CPUOffload(offload_params=False),
        device_id=rank,
        limit_all_gathers=True,
        use_orig_params=True,
    )
    return fsdp_model

def train_multi_node():
    rank = int(dist.get_rank())
    world_size = dist.get_world_size()
    local_rank = int(dist.get_local_rank())
    
    torch.cuda.set_device(local_rank)
    
    model = create_fsdp_model(rank, world_size)
    optimizer = torch.optim.AdamW(model.parameters(), lr=1e-4, fused=True)
    scaler = GradScaler('cuda')
    
    # Simulate large dataset
    total_batches = 10000
    accumulation_steps = 8
    effective_batch = 4 * world_size * accumulation_steps
    
    for batch_idx in range(total_batches):
        # Simulated input
        x = torch.randint(0, 50000, (4, 512)).to(local_rank)
        targets = torch.randint(0, 50000, (4, 512)).to(local_rank)
        
        with autocast('cuda'):
            logits = model(x)
            loss = nn.functional.cross_entropy(
                logits.view(-1, 50000),
                targets.view(-1),
                reduction='mean',
            )
            loss = loss / accumulation_steps
        
        scaler.scale(loss).backward()
        
        if (batch_idx + 1) % accumulation_steps == 0:
            scaler.step(optimizer)
            scaler.update()
            optimizer.zero_grad()
        
        if batch_idx % 100 == 0 and rank == 0:
            print(f"Batch {batch_idx}/{total_batches} "
                  f"Loss {loss.item() * accumulation_steps:.4f} "
                  f"GPU Mem {torch.cuda.memory_allocated(local_rank)/1e9:.2f} GB")
    
    if rank == 0:
        consolidated = FSDP.consolidate_sharded_model_shard(model)
        torch.save(consolidated, 'sharded_model.pt')

# Launch:
# torchrun --nnodes=2 --nproc_per_node=8 --rdzv_endpoint=master:29500 script.py`,
      output: `# Multi-node training with 2 nodes x 8 GPUs = 16 GPUs
Batch 0/10000 Loss 10.4321 GPU Mem 14.23 GB
Batch 100/10000 Loss 8.1234 GPU Mem 14.25 GB
Batch 200/10000 Loss 6.7890 GPU Mem 14.20 GB
...
Batch 9900/10000 Loss 0.2345 GPU Mem 14.22 GB

# Effective batch size: 4 x 16 GPUs x 8 accum = 512

# Model saved: sharded_model.pt`,
      explanation: 'This production-level training script combines FSDP with mixed precision (bf16), gradient accumulation, gradient checkpointing, and multi-node support. The fused AdamW optimizer reduces memory overhead. FSDP.consolidate_sharded_model_shard gathers all shards for checkpointing.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Large Language Models', description: 'Training GPT-4, LLaMA, and other frontier models requires thousands of GPUs with FSDP/ZeRO-3. Meta trained LLaMA 65B on 2048 A100 GPUs using FSDP.' },
      { industry: 'Computer Vision', description: 'Training ViT-G/14 and other large vision models requires distributed data parallelism across dozens of GPUs. DDP is the standard approach when models fit on a single GPU.' },
      { industry: 'Drug Discovery', description: 'AlphaFold and other protein folding models use distributed training across TPU pods or GPU clusters to train on massive genomic datasets.' },
    ],
    caseStudy: {
      problem: 'A research lab needed to fine-tune a 13B parameter LLM on 4 A100 GPUs. Full fine-tuning required ~260 GB of memory (model + optimizer + gradients), but they only had 4 x 80 GB = 320 GB total.',
      solution: 'They used FSDP with FULL_SHARD strategy, sharding parameters across all 4 GPUs. Combined with CPU offload for optimizer states and fp16 mixed precision, they reduced per-GPU memory from 260 GB to ~65 GB.',
      results: 'The 13B model was fine-tuned successfully on 4 GPUs with only 15% throughput overhead compared to DDP on a single GPU. Peak memory was 58 GB per GPU, well within the 80 GB limit.',
    },
    bestPractices: [
      'Use torchrun instead of raw multiprocessing for process management',
      'Set OMP_NUM_THREADS=1 to avoid thread contention in distributed settings',
      'Profile communication overhead with torch.profiler before scaling up',
      'Use gradient bucketing (default in DDP) to overlap communication and computation',
      'Save checkpoints only on rank 0 to avoid write conflicts',
      'Use NCCL_DEBUG=INFO to diagnose communication issues during setup',
      'Always validate that loss curves match across different GPU counts',
    ],
    tools: ['PyTorch DDP', 'PyTorch FSDP', 'NCCL', 'torchrun', 'SLURM', 'CUDA', 'DeepSpeed', 'Horovod'],
    jobRoles: ['Distributed Systems Engineer', 'ML Infrastructure Engineer', 'Large-Scale ML Researcher', 'HPC Engineer'],
    furtherReading: [
      'PyTorch Distributed Tutorials (pytorch.org/tutorials)',
      'FSDP Paper: "Fully Sharded Data Parallel: Scaling to 1 Trillion Parameters"',
      'NCCL Documentation (NVIDIA Developer)',
      'ZeRO Paper: "ZeRO: Memory Optimizations Toward Training Trillion Parameter Models"',
    ],
  },
  quiz: [
    {
      id: 'p17-dt-1', type: 'mcq',
      question: 'What is the primary difference between DDP and FSDP in terms of memory usage per GPU?',
      options: [
        'DDP uses more memory than FSDP because parameter updates take longer',
        'DDP keeps a full model copy on each GPU; FSDP shards parameters across GPUs',
        'FSDP uses more memory because it stores redundant copies of optimizer states',
        'There is no difference — both use the same amount of memory',
      ],
      correctAnswer: 'DDP keeps a full model copy on each GPU; FSDP shards parameters across GPUs',
      explanation: 'DDP replicates the entire model on each GPU (O(P) memory per GPU). FSDP shards parameters, gradients, and optimizer states across all GPUs, achieving O(P/N) memory per GPU, where N is the number of GPUs.',
    },
    {
      id: 'p17-dt-2', type: 'truefalse',
      question: 'In DDP, every GPU maintains its own copy of the model parameters but gradients are averaged across all GPUs via all-reduce.',
      correctAnswer: 'True',
      explanation: 'DDP starts with identical model parameters on each GPU (broadcast from rank 0). After the backward pass, gradients are all-reduced (averaged) across all GPUs, then each GPU independently applies the same gradients to keep parameters synchronized.',
    },
    {
      id: 'p17-dt-3', type: 'code',
      question: 'In the following DDP setup, what is the purpose of DistributedSampler?',
      code: `sampler = DistributedSampler(dataset, num_replicas=world_size, rank=rank)
dataloader = DataLoader(dataset, batch_size=32, sampler=sampler)`,
      options: [
        'It ensures each GPU processes the entire dataset independently',
        'It partitions the dataset so each GPU gets a unique subset without overlap',
        'It duplicates data across GPUs to improve accuracy',
        'It randomly shuffles the dataset on every epoch without any partitioning',
      ],
      correctAnswer: 'It partitions the dataset so each GPU gets a unique subset without overlap',
      explanation: 'DistributedSampler assigns each GPU a unique subset of indices, ensuring no data overlap between processes. Together, all GPUs cover the complete dataset exactly once per epoch.',
    },
    {
      id: 'p17-dt-4', type: 'fillblank',
      question: 'The collective communication operation used in DDP to average gradients across all GPUs is called ___.',
      correctAnswer: 'all-reduce',
      explanation: 'All-reduce combines tensors from all processes (summation) and distributes the result back to every process. For gradient averaging, the sum is divided by world_size.',
    },
    {
      id: 'p17-dt-5', type: 'match',
      question: 'Match each sharding strategy to its memory savings:',
      pairs: [
        { left: 'FULL_SHARD (ZeRO-3)', right: 'Shards parameters, gradients, and optimizer states' },
        { left: 'SHARD_GRAD_OP (ZeRO-2)', right: 'Shards only gradients and optimizer states' },
        { left: 'NO_SHARD (DDP)', right: 'Keeps full copy of everything on each GPU' },
        { left: 'CPU Offload', right: 'Moves idle parameters to CPU memory' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'Higher ZeRO stages progressively shard more state. FULL_SHARD (ZeRO-3) is the most memory-efficient, while NO_SHARD is equivalent to DDP. CPU offload can be combined with any strategy.',
    },
  ],
}))

export {}
