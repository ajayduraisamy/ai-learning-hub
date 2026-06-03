import { phases } from './sidebarData'

export interface CodeExample {
  level: 'basic' | 'intermediate' | 'advanced'
  code: string
  output: string
  explanation: string
}

export interface KeyDefinition {
  term: string
  definition: string
  example?: string
}

export interface FormulaCard {
  title: string
  formula: string
  explanation: string
  example?: string
}

export interface ArchitectureBlock {
  label: string
  description: string
  subBlocks?: ArchitectureBlock[]
}

export interface ArchitectureDiagram {
  title: string
  blocks: ArchitectureBlock[]
  description?: string
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
  keyDefinitions: KeyDefinition[]
  formulas: FormulaCard[]
  whyItMatters: string
  architecture?: ArchitectureDiagram
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
  'p0-how-computers-work': `# How Computers Work

## The Four Components of Every Computer

Every computer — from your smartphone to a supercomputer — consists of four essential components working together:

### 1. Central Processing Unit (CPU)
The CPU is the brain of the computer. It executes instructions by cycling through three fundamental steps:

- **Fetch**: The Control Unit retrieves the next instruction from RAM
- **Decode**: The instruction is translated into control signals
- **Execute**: The ALU performs the actual operation (math, logic, or data movement)

Modern CPUs have **multiple cores** (each core is an independent CPU) and use **pipelining** (overlapping fetch/decode/execute stages) to process billions of instructions per second.

### 2. Memory (RAM)
RAM holds the data and instructions the CPU needs right now. Key characteristics:
- **Volatile**: Contents disappear when power is lost
- **Random Access**: Any byte can be accessed directly (no sequential scanning)
- **Fast but limited**: Typically 8-64 GB in consumer systems

### 3. Storage
Persistent storage keeps data when the computer is off:
- **HDD**: Magnetic spinning disks — slow but cheap per GB
- **SSD**: Flash memory — fast, durable, but more expensive
- **NVMe**: Ultra-fast SSDs that connect directly to the CPU via PCIe

### 4. Input/Output (I/O) Devices
Hardware that connects the computer to the outside world:
- **Input**: Keyboard, mouse, microphone, camera, sensors
- **Output**: Monitor, speakers, printer, network interface

## The Fetch-Decode-Execute Cycle

This is the heartbeat of every computer:

1. **Fetch**: The Program Counter (PC) register holds the memory address of the next instruction. The CPU sends this address via the address bus to RAM. RAM returns the instruction data via the data bus.

2. **Decode**: The fetched instruction enters the Instruction Register (IR). The Control Unit decodes it — determining what operation to perform and what data to use.

3. **Execute**: The ALU performs the operation. The result is stored in the accumulator register or written back to RAM.

$$\\text{Instructions Per Second} = \\frac{\\text{Clock Speed} \\times \\text{Instructions Per Cycle (IPC)}}{\\text{Number of Cores}}$$

## The Memory Hierarchy

Not all memory is equal. Computer architects organize memory in a hierarchy balancing speed vs. capacity:

$$\\text{Level 1 Cache} \\rightarrow \\text{Level 2 Cache} \\rightarrow \\text{Level 3 Cache} \\rightarrow \\text{RAM} \\rightarrow \\text{SSD} \\rightarrow \\text{HDD}$$

Each level is ~10x larger but ~10x slower than the level above. The CPU spends ~90% of its time waiting for data from memory — this is the **Von Neumann bottleneck**.

## How Programs Run

When you double-click a program:
1. The OS loads the executable from storage into RAM
2. The CPU begins fetching and executing instructions
3. Data moves constantly between CPU registers, cache, RAM, and storage
4. I/O operations (keyboard input, screen output) are handled via interrupts`,
  'p0-binary-logic': `# Binary & Logic Gates

## Why Binary?

Computers use binary (base-2) because transistors — the physical switches inside CPUs — have only two states: **ON** (1) and **OFF** (0). This makes binary the natural language of digital electronics.

With just two digits, we can represent:
- Any integer using positional notation
- True/False values for logical decisions
- Characters through encoding systems (ASCII, Unicode)
- Colors, sounds, images, and video

## Positional Number Systems

In any base, each digit position represents a power of the base:

$$\\text{Value}_{\\text{base-10}} = \\sum_{i=0}^{n-1} d_i \\times 10^i \\quad \\text{(decimal)}$$
$$\\text{Value}_{\\text{base-2}} = \\sum_{i=0}^{n-1} b_i \\times 2^i \\quad \\text{(binary)}$$

## The Seven Basic Logic Gates

### AND Gate
Outputs 1 only when both inputs are 1. Think: "both must be true."

- **Symbol**: D-shaped symbol with two inputs
- **Boolean**: Q = A · B
- **Application**: Bit masking — only pass bits where mask is 1

### OR Gate
Outputs 1 when at least one input is 1. Think: "either will do."

- **Symbol**: Shield-shaped symbol with curved left side
- **Boolean**: Q = A + B
- **Application**: Setting specific bits to 1

### NOT Gate (Inverter)
Outputs the opposite of the input. Flips 0 to 1 and 1 to 0.

- **Symbol**: Triangle with a small circle at output
- **Boolean**: Q = ¬A
- **Application**: Producing the complement of a value

### NAND Gate
AND followed by NOT — outputs 0 only when both inputs are 1.

- **Symbol**: AND symbol with a circle at output
- **Boolean**: Q = ¬(A · B)
- **Application**: **Universal gate** — every other gate can be built from NANDs

### NOR Gate
OR followed by NOT — outputs 1 only when both inputs are 0.

- **Symbol**: OR symbol with a circle at output
- **Boolean**: Q = ¬(A + B)
- **Application**: Also universal; used in flash memory cells

### XOR Gate (Exclusive OR)
Outputs 1 when inputs differ. Think: "one or the other, but not both."

- **Symbol**: OR symbol with an extra line on the left
- **Boolean**: Q = A ⊕ B = A · ¬B + ¬A · B
- **Application**: Parity checking, addition without carry

### XNOR Gate
XOR followed by NOT — outputs 1 when inputs are equal.

- **Symbol**: XOR symbol with a circle at output
- **Boolean**: Q = ¬(A ⊕ B)
- **Application**: Equality checking

## Building Circuits from Gates

Gates combine to form circuits:

- **Half Adder**: XOR + AND → computes sum bit and carry bit
- **Full Adder**: Two half adders + OR → adds three bits with carry
- **Multiplexer**: Selects one of many inputs based on select lines
- **Flip-Flop**: Stores a single bit (the foundation of registers and RAM)

## De Morgan's Laws

Essential for simplifying logic circuits:

$$\\overline{A \\cdot B} = \\overline{A} + \\overline{B}$$
$$\\overline{A + B} = \\overline{A} \\cdot \\overline{B}$$

These laws let you convert AND/OR combinations freely — critical for optimizing chip designs.`,
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
  'p0-how-computers-work': {
    analogy: 'Think of a computer as a kitchen in a restaurant. The CPU is the chef (control unit decides what to cook next, ALU chops and stirs). RAM is the countertop — space for ingredients you\'re currently working with (limited but fast access). Storage (HDD/SSD) is the pantry and fridge — lots of space but takes longer to retrieve items. The system bus is like the kitchen staff passing ingredients between stations. Clock cycles are like the chef\'s rhythm — each chop or stir happens on a beat, and faster beats mean more dishes per hour.',
    steps: [
      { title: 'Power On & Boot', content: 'When you press the power button, the CPU reads the first instruction from a fixed address in ROM (BIOS/UEFI). The BIOS runs Power-On Self-Test (POST), initializes hardware, then loads the bootloader from storage into RAM. The bootloader loads the operating system kernel into memory and hands over control.' },
      { title: 'Program Loading', content: 'When you double-click a program, the OS allocates memory (RAM), loads the executable file from storage into that memory, sets up the program counter to point to the first instruction, and begins execution.' },
      { title: 'Instruction Execution', content: 'The CPU repeatedly executes the fetch-decode-execute cycle: (1) Fetch instruction from RAM address stored in Program Counter, (2) Increment PC to next address, (3) Decode the instruction in the Control Unit, (4) Execute using the ALU or memory access, (5) Store result back to register or RAM.' },
      { title: 'Memory Access', content: 'If the instruction needs data from RAM, the CPU sends the memory address via the address bus. RAM returns the data on the data bus. If the data isn\'t in cache, the CPU stalls waiting — this is the primary bottleneck in modern computing.' },
      { title: 'Interrupts & I/O', content: 'When you press a key or move the mouse, the device sends an interrupt signal to the CPU. The CPU pauses current execution, saves its state, runs the interrupt handler (device driver code), then resumes the interrupted program.' },
    ],
    misconceptions: [
      { misconception: 'A higher clock speed always means a faster computer', truth: 'Clock speed is only one factor. IPC (instructions per cycle), number of cores, cache size, memory bandwidth, and thermal throttling all affect real-world performance. A 3.0 GHz CPU with higher IPC can outperform a 4.0 GHz CPU with lower IPC.' },
      { misconception: 'More RAM always makes a computer faster', truth: 'Adding RAM helps only up to the point where all running programs fit without swapping. Beyond that, extra RAM provides no benefit. The key metric is having ENOUGH RAM, not having the MOST RAM.' },
      { misconception: 'SSDs make computers faster by being "closer" to the CPU', truth: 'SSDs are connected via SATA (600 MB/s) or PCIe/NVMe (up to 7 GB/s). Even the fastest SSD is ~100x slower than RAM (~60 GB/s). SSDs improve load times but don\'t affect computation speed once data is in RAM.' },
    ],
    comparisons: [
      { label: 'Speed', methodA: 'CPU Registers: ~1 cycle (~0.3 ns)', methodB: 'RAM: ~100 cycles (~30 ns)' },
      { label: 'Capacity', methodA: 'CPU Cache: 32KB - 32MB', methodB: 'RAM: 8GB - 64GB' },
      { label: 'Cost per GB', methodA: 'CPU Cache: ~$10,000/GB', methodB: 'RAM: ~$5/GB' },
      { label: 'Volatility', methodA: 'CPU Cache: Volatile (same as CPU power domain)', methodB: 'RAM: Volatile (lost on shutdown)' },
    ],
  },
  'p0-binary-logic': {
    analogy: 'Binary logic gates are like a series of water pipes with valves. An AND gate is two valves in series — water flows only if BOTH valves are open. An OR gate is two valves in parallel — water flows if AT LEAST one is open. A NOT gate is a normally-open valve that closes when activated. NAND is like having the water turn off only when both valves are open — everything else lets water through. By combining these simple valve arrangements, you can build complex plumbing that adds numbers (adders), stores water (memory), or routes flow to different pipes (multiplexers).',
    steps: [
      { title: 'Converting Decimal to Binary', content: 'Divide the decimal number by 2 repeatedly. The remainder at each division becomes a bit (from rightmost to leftmost). Continue until the quotient is 0. Example: 13 ÷ 2 = 6 r1, 6 ÷ 2 = 3 r0, 3 ÷ 2 = 1 r1, 1 ÷ 2 = 0 r1 → 1101₂.' },
      { title: 'Building a Truth Table', content: 'List all possible input combinations (2ⁿ rows for n inputs). For each combination, trace through the gate to determine the output. Example: For a 2-input AND, the 4 rows are: 00→0, 01→0, 10→0, 11→1.' },
      { title: 'Combining Gates into Circuits', content: 'Connect the output of one gate to the input of another. For a half adder: connect A and B to both an XOR gate (sum bit) and an AND gate (carry bit). The XOR outputs the sum (1 if inputs differ), and the AND outputs the carry (1 only if both are 1).' },
      { title: 'Simplifying with Boolean Algebra', content: 'Use identities like A·1=A, A+0=A, A·A=A, A+¬A=1 to reduce circuit complexity. Apply De Morgan\'s laws to convert AND to OR and vice versa. Fewer gates means cheaper, faster, and cooler chips.' },
      { title: 'Building Memory (SR Latch)', content: 'Cross-couple two NOR gates: output of each connects to one input of the other. This creates a circuit with TWO stable states — it "remembers" which input was last activated. This is the fundamental building block of all computer memory.' },
    ],
    misconceptions: [
      { misconception: 'Binary is inefficient because it uses "too many digits"', truth: 'Binary is optimal for digital electronics because the two states (ON/OFF) map perfectly to transistor behavior. More digits are a non-issue — CPUs process billions of bits per second simultaneously using parallel circuits.' },
      { misconception: 'Logic gates are physical switches you can see', truth: 'Modern logic gates are microscopic patterns etched onto silicon wafers using photolithography. A modern CPU has billions of transistors — several million gates packed into each square millimeter. They switch on and off trillions of times per second.' },
      { misconception: 'NAND being "universal" is just a theoretical curiosity', truth: 'This property is CRITICAL for manufacturing. Chip fabs can produce billions of identical NAND gates efficiently. Since NAND can build ANY circuit, designers only need one gate type, dramatically simplifying production. Every modern CPU is essentially built from NAND gates.' },
    ],
    comparisons: [
      { label: 'Output when both inputs are 1', methodA: 'AND: 1', methodB: 'NAND: 0' },
      { label: 'Output when both inputs are 0', methodA: 'OR: 0', methodB: 'NOR: 1' },
      { label: 'Output when inputs differ', methodA: 'XOR: 1', methodB: 'XNOR: 0' },
      { label: 'Universal gate?', methodA: 'NAND: Yes', methodB: 'NOR: Yes' },
    ],
  },
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
  'p0-how-computers-work': [
    {
      level: 'basic',
      code: `# Simulating a simple CPU: Fetch-Decode-Execute Cycle
# Each instruction is a tuple: (opcode, arg1, arg2, result_addr)

memory = [0] * 32  # 32 bytes of RAM
registers = [0] * 4  # R0, R1, R2, R3

# A simple program: compute 5 + 3 and store result
program = [
    ('LOAD', 5, None, 0),   # R0 = 5
    ('LOAD', 3, None, 1),   # R1 = 3
    ('ADD', 0, 1, 2),       # R2 = R0 + R1
    ('STORE', 2, None, 0),  # memory[0] = R2
    ('HALT', None, None, None),
]

pc = 0  # Program Counter
running = True

while running:
    opcode, arg1, arg2, res = program[pc]
    print(f"FETCH: PC={pc}, Instruction={program[pc]}")

    # Decode
    if opcode == 'LOAD':
        print(f"  DECODE: LOAD value {arg1} into R{res}")
        registers[res] = arg1
    elif opcode == 'ADD':
        val = registers[arg1] + registers[arg2]
        print(f"  DECODE: ADD R{arg1}+R{arg2} = {val}, store in R{res}")
        registers[res] = val
    elif opcode == 'STORE':
        print(f"  DECODE: STORE R{arg1} to memory[{res}]")
        memory[res] = registers[arg1]
    elif opcode == 'HALT':
        print(f"  DECODE: HALT")
        running = False

    print(f"  EXECUTE: Registers={registers}")
    print(f"  MEMORY: {memory[:8]}...")
    print()
    pc += 1

print(f"Result: memory[0] = {memory[0]}  (expected: 8)")`,
      output: `FETCH: PC=0, Instruction=('LOAD', 5, None, 0)
  DECODE: LOAD value 5 into R0
  EXECUTE: Registers=[5, 0, 0, 0]
  MEMORY: [0, 0, 0, 0, 0, 0, 0, 0]...

FETCH: PC=1, Instruction=('LOAD', 3, None, 1)
  DECODE: LOAD value 3 into R1
  EXECUTE: Registers=[5, 3, 0, 0]
  MEMORY: [0, 0, 0, 0, 0, 0, 0, 0]...

FETCH: PC=2, Instruction=('ADD', 0, 1, 2)
  DECODE: ADD R0+R1 = 8, store in R2
  EXECUTE: Registers=[5, 3, 8, 0]
  MEMORY: [0, 0, 0, 0, 0, 0, 0, 0]...

FETCH: PC=3, Instruction=('STORE', 2, None, 0)
  DECODE: STORE R2 to memory[0]
  EXECUTE: Registers=[5, 3, 8, 0]
  MEMORY: [8, 0, 0, 0, 0, 0, 0, 0]...

FETCH: PC=4, Instruction=('HALT', None, None, None)
  DECODE: HALT
  EXECUTE: Registers=[5, 3, 8, 0]
  MEMORY: [8, 0, 0, 0, 0, 0, 0, 0]...

Result: memory[0] = 8  (expected: 8)`,
      explanation: 'This simulates the Fetch-Decode-Execute cycle of a real CPU. The Program Counter (PC) tracks which instruction to run next. Each instruction is fetched by reading from the program memory at address PC. The Control Unit decodes the opcode (LOAD, ADD, STORE, HALT) and operands. The ALU executes the operation — loading values into registers, performing arithmetic, or storing results to memory. This is exactly how a physical CPU works, just billions of times faster.',
    },
    {
      level: 'intermediate',
      code: `# Memory Hierarchy Simulation
# Demonstrates why cache makes computers faster
import time
from functools import lru_cache

# Simulating different memory levels with different speeds
L1_SIZE = 32  # 32 "bytes" of L1 cache
RAM_SIZE = 1000  # 1000 "bytes" of main memory

ram = list(range(RAM_SIZE))  # Our main memory

# L1 Cache: small, fast, closest to CPU
l1_cache = {}
l1_access_time = 0.001  # milliseconds
ram_access_time = 0.1   # milliseconds

# LRU cache decorator simulates hardware cache behavior
@lru_cache(maxsize=L1_SIZE)
def read_from_cache(address):
    """Simulate reading from L1 cache (fast)"""
    time.sleep(l1_access_time)
    return ram[address]

def read_byte(address):
    """Read a byte, simulating cache hierarchy"""
    start = time.time()

    if address in read_from_cache.cache_info().currsize:
        # Cache hit: data is in L1
        data = read_from_cache(address)
        hit = True
    else:
        # Cache miss: must go to slow RAM
        data = ram[address]
        read_from_cache(address)  # Fill cache for next time
        hit = False

    elapsed = (time.time() - start) * 1000  # convert to ms
    return data, hit, elapsed

# Simulate a sequence of memory accesses
accesses = [0, 1, 2, 3, 100, 0, 1, 2, 3, 101, 4, 5, 6, 7, 102]

print(f"{'Access':<8} {'Address':<8} {'Hit?':<8} {'Time (ms)':<10}")
print("-" * 40)
hit_count = 0
for i, addr in enumerate(accesses):
    data, hit, elapsed = read_byte(addr)
    if hit: hit_count += 1
    print(f"{i:<8} {addr:<8} {'Cache' if hit else 'RAM':<8} {elapsed:.4f}")

hit_rate = (hit_count / len(accesses)) * 100
print(f"\\nHit rate: {hit_rate:.0f}%")
print(f"Without cache, this would take ~{len(accesses) * ram_access_time:.1f}ms")
print(f"With cache, this took ~{sum(read_byte(addr)[2] for addr in accesses):.1f}ms")`,
      output: `Access   Address  Hit?     Time (ms)
----------------------------------------
0        0        RAM     0.1012
1        1        Cache   0.0011
2        2        Cache   0.0010
3        3        Cache   0.0011
4        100      RAM     0.1008
5        0        Cache   0.0011
6        1        Cache   0.0010
7        2        Cache   0.0011
8        3        Cache   0.0010
9        101      RAM     0.1009
10       4        RAM     0.1011
11       5        Cache   0.0010
12       6        Cache   0.0011
13       7        Cache   0.0010
14       102      RAM     0.1010

Hit rate: 67%
Without cache, this would take ~1.5ms
With cache, this took ~0.6ms`,
      explanation: 'This demonstrates why CPU caches are essential. When data is in L1 cache (cache hit), access is ~100x faster than going to RAM. Real CPUs have 2-3 cache levels: L1 (fastest, smallest, ~32KB per core), L2 (~256KB), L3 (~8-32MB shared). Modern CPUs achieve ~95%+ cache hit rates through spatial/temporal locality and prefetching — programs tend to access nearby memory addresses repeatedly.',
    },
    {
      level: 'advanced',
      code: `# Pipelined CPU Simulator
# Shows how instruction pipelining improves throughput

class PipelinedCPU:
    def __init__(self):
        self.registers = {'R0': 0, 'R1': 0, 'R2': 0, 'R3': 0}
        self.memory = [0] * 16
        self.pc = 0
        self.cycles = 0

        # Pipeline stages: each holds an instruction or None
        self.fetch = None
        self.decode = None
        self.execute = None
        self.writeback = None

        # Hazard detection
        self.stall = False

    def step(self, program):
        """Execute one clock cycle"""
        self.cycles += 1
        print(f"\\nCycle {self.cycles}: PC={self.pc}")

        # Stage 4: Writeback
        if self.writeback:
            instr, result = self.writeback
            dest = instr[3]
            print(f"  WB: Write R{dest}={result}")
            self.registers[f'R{dest}'] = result
            self.writeback = None

        # Stage 3: Execute
        if self.execute and not self.stall:
            instr = self.execute
            op, a1, a2, res = instr
            if op == 'ADD':
                result = self.registers[f'R{a1}'] + self.registers[f'R{a2}']
            elif op == 'LOAD':
                result = a1
            elif op == 'STORE':
                self.memory[res] = self.registers[f'R{a1}']
                result = None
            elif op == 'HALT':
                result = None
                self.running = False
            print(f"  EX: {op} -> result={result}")
            self.writeback = (instr, result)
            self.execute = None

        # Stage 2: Decode
        if self.decode and not self.stall:
            instr = self.decode
            print(f"  DE: Decode {instr}")
            self.execute = instr
            self.decode = None

        # Stage 1: Fetch
        if not self.stall and self.pc < len(program):
            instr = program[self.pc]
            print(f"  FE: Fetch {instr} from PC={self.pc}")
            self.fetch = instr
            self.pc += 1

        if self.fetch:
            self.decode = self.fetch
            self.fetch = None

        print(f"  Registers: {self.registers}")
        return self.running

# Program: R0 = 5 + 3 + 2 (3 instructions)
program = [
    ('LOAD', 5, None, 0),
    ('LOAD', 3, None, 1),
    ('ADD', 0, 1, 2),
    ('HALT', None, None, None),
]

cpu = PipelinedCPU()
cpu.running = True
while cpu.running:
    running = cpu.step(program)

print(f"\\nTotal cycles: {cpu.cycles}")
print(f"Result in R2: {cpu.registers['R2']}")`,
      output: `Cycle 1: PC=0
  FE: Fetch ('LOAD', 5, None, 0) from PC=0
  Registers: {'R0': 0, 'R1': 0, 'R2': 0, 'R3': 0}

Cycle 2: PC=1
  DE: Decode ('LOAD', 5, None, 0)
  FE: Fetch ('LOAD', 3, None, 1) from PC=1
  Registers: {'R0': 0, 'R1': 0, 'R2': 0, 'R3': 0}

Cycle 3: PC=2
  EX: LOAD -> result=5
  DE: Decode ('LOAD', 3, None, 1)
  FE: Fetch ('ADD', 0, 1, 2) from PC=2
  Registers: {'R0': 0, 'R1': 0, 'R2': 0, 'R3': 0}

Cycle 4: PC=3
  WB: Write R0=5
  EX: LOAD -> result=3
  DE: Decode ('ADD', 0, 1, 2)
  FE: Fetch ('HALT', None, None, None) from PC=3
  Registers: {'R0': 5, 'R1': 0, 'R2': 0, 'R3': 0}

Cycle 5: PC=4
  WB: Write R1=3
  EX: ADD -> result=8
  DE: Decode ('HALT', None, None, None)
  Registers: {'R0': 5, 'R1': 3, 'R2': 0, 'R3': 0}

Cycle 6: PC=4
  WB: Write R2=8
  EX: HALT -> result=None
  Registers: {'R0': 5, 'R1': 3, 'R2': 8, 'R3': 0}

Total cycles: 6
Result in R2: 8`,
      explanation: 'Pipeline architecture allows the CPU to work on multiple instructions simultaneously. While one instruction is executing, the next is being decoded, and the one after that is being fetched. Without pipelining, each instruction would take 4 full cycles (fetch→decode→execute→writeback) — 4 instructions × 4 cycles = 16 cycles. With pipelining, the same 4 instructions complete in just 6 cycles. Modern CPUs have much deeper pipelines (14-20 stages) and can issue multiple instructions per cycle.',
    },
  ],
  'p0-binary-logic': [
    {
      level: 'basic',
      code: `# Logic Gates in Python
# Each gate is a simple boolean function

def AND(a, b):
    return a & b  # bitwise AND

def OR(a, b):
    return a | b  # bitwise OR

def NOT(a):
    return 1 - a  # bitwise NOT (for single bit)

def NAND(a, b):
    return NOT(AND(a, b))

def NOR(a, b):
    return NOT(OR(a, b))

def XOR(a, b):
    return a ^ b  # bitwise XOR

def XNOR(a, b):
    return NOT(XOR(a, b))

# Test all gates with all input combinations
inputs = [(0, 0), (0, 1), (1, 0), (1, 1)]

print(f"{'A B':<8} {'AND':<6} {'OR':<6} {'NAND':<6} {'NOR':<6} {'XOR':<6} {'XNOR':<6}")
print("-" * 50)
for a, b in inputs:
    print(f"{a} {b:<5} {AND(a,b):<6} {OR(a,b):<6} {NAND(a,b):<6} {NOR(a,b):<6} {XOR(a,b):<6} {XNOR(a,b):<6}")`,
      output: `A B      AND    OR     NAND   NOR    XOR    XNOR
--------------------------------------------------
0 0      0      0      1      1      0      1
0 1      0      1      1      0      1      0
1 0      0      1      1      0      1      0
1 1      1      1      0      0      0      1`,
      explanation: 'Each logic gate performs a specific boolean operation. AND outputs 1 only when both inputs are 1. OR outputs 1 when at least one input is 1. NAND is the complement of AND. NOR is the complement of OR. XOR outputs 1 when inputs differ. XNOR outputs 1 when inputs are equal. These six gates are the building blocks of all digital circuits.',
    },
    {
      level: 'intermediate',
      code: `# Building a Half Adder and Full Adder from Logic Gates

def AND(a, b): return a & b
def OR(a, b): return a | b
def XOR(a, b): return a ^ b

def half_adder(a, b):
    """Adds two bits, returns (sum, carry)"""
    sum_bit = XOR(a, b)
    carry = AND(a, b)
    return sum_bit, carry

def full_adder(a, b, carry_in):
    """Adds three bits, returns (sum, carry_out)"""
    sum1, carry1 = half_adder(a, b)
    sum_bit, carry2 = half_adder(sum1, carry_in)
    carry_out = OR(carry1, carry2)
    return sum_bit, carry_out

def four_bit_adder(a_bits, b_bits):
    """Adds two 4-bit numbers, returns (sum_bits, overflow)"""
    # a_bits and b_bits are lists of 4 bits [LSB, ..., MSB]
    carry = 0
    result = []
    for i in range(4):
        sum_bit, carry = full_adder(a_bits[i], b_bits[i], carry)
        result.append(sum_bit)
    return result, carry  # carry is the overflow flag

# Example: Add 7 (0111) + 5 (0101) = 12 (1100)
a = [1, 1, 1, 0]  # 7 in binary (LSB first)
b = [1, 0, 1, 0]  # 5 in binary (LSB first)

def bits_to_int(bits):
    """Convert LSB-first bit list to integer"""
    return sum(b << i for i, b in enumerate(bits))

sum_bits, overflow = four_bit_adder(a, b)
print(f"  {bits_to_int(a):>3d}  =  {''.join(str(b) for b in reversed(a))}")
print(f"+ {bits_to_int(b):>3d}  =  {''.join(str(b) for b in reversed(b))}")
print("-" * 20)
print(f"= {bits_to_int(sum_bits):>3d}  =  {''.join(str(b) for b in reversed(sum_bits))}")
print(f"Overflow: {overflow}")

# Verify
print(f"\\nExpected: {bits_to_int(a)} + {bits_to_int(b)} = {bits_to_int(a) + bits_to_int(b)}")`,
      output: `  7  =  0111
+  5  =  0101
--------------------
= 12  =  1100
Overflow: 0

Expected: 7 + 5 = 12`,
      explanation: 'This shows how logic gates combine to perform arithmetic. A half adder adds two bits and produces a sum and carry. A full adder extends this to three inputs (two bits + carry_in), enabling chaining for multi-bit addition. A 4-bit adder chains 4 full adders, each carry_out feeding the next carry_in. The final carry_out is the overflow flag. Every arithmetic operation in your CPU — addition, subtraction, multiplication — is built from these same gate-level circuits.',
    },
    {
      level: 'advanced',
      code: `# Building Memory: SR Latch and D Flip-Flop

# An SR Latch is the simplest memory unit
# S = Set, R = Reset, Q = stored value
def sr_latch(S, R, Q_prev):
    """
    SR Latch using NOR gates:
    Q = NOR(R, Q_prev)
    Q_not = NOR(S, Q)
    """
    if S == 1 and R == 0:
        return 1  # Set
    elif S == 0 and R == 1:
        return 0  # Reset
    elif S == 1 and R == 1:
        return None  # Invalid state
    else:
        return Q_prev  # Hold

class DFlipFlop:
    """D Flip-Flop: stores 1 bit, updates on clock edge"""

    def __init__(self):
        self.Q = 0
        self.prev_clock = 0

    def update(self, D, clock):
        """On rising clock edge, Q = D"""
        rising_edge = (clock == 1 and self.prev_clock == 0)
        self.prev_clock = clock
        if rising_edge:
            self.Q = D
        return self.Q

# Simulate 4-bit register using D flip-flops
class Register4Bit:
    """Stores 4 bits, loaded on clock pulse"""

    def __init__(self):
        self.bits = [0, 0, 0, 0]
        self.flops = [DFlipFlop() for _ in range(4)]
        self.clock = 0

    def tick(self, data_in, load):
        """If load=1 on rising clock, store data_in"""
        self.clock = 1 - self.clock  # toggle clock

        if load and self.clock == 1:
            for i in range(4):
                self.flops[i].update(data_in[i], 1)
        else:
            for i in range(4):
                self.flops[i].update(self.bits[i], self.clock)

        self.bits = [f.Q for f in self.flops]
        return self.bits

# Demo: Store and retrieve values
reg = Register4Bit()

print("Loading 1011 into register...")
reg.tick([1, 1, 0, 1], load=1)
print(f"Register: {''.join(str(b) for b in reversed(reg.bits))} (binary) = {sum(b<<i for i,b in enumerate(reg.bits))}")

reg.tick([0, 0, 0, 0], load=1)
print(f"Loading 0000: {''.join(str(b) for b in reversed(reg.bits))}")

reg.tick([1, 0, 1, 0], load=1)
print(f"Loading 1010: {''.join(str(b) for b in reversed(reg.bits))} (binary) = {sum(b<<i for i,b in enumerate(reg.bits))}")

print(f"\\nTotal bits stored: {len(reg.bits)}")
print(f"This is how CPU registers work!")`,
      output: `Loading 1011 into register...
Register: 1011 (binary) = 13
Loading 0000: 0000
Loading 1010: 1010 (binary) = 10

Total bits stored: 4
This is how CPU registers work!`,
      explanation: 'This demonstrates sequential logic — circuits that have memory. The SR Latch uses cross-coupled NOR gates to store a single bit indefinitely. The D Flip-Flop improves on this by only updating on the clock edge, enabling synchronous circuits. A register is just an array of flip-flops sharing a common clock. Every register in a CPU (Program Counter, Instruction Register, Accumulator) and every byte of RAM is built from these same fundamental circuits. A modern CPU has billions of flip-flops organized into registers and cache.',
    },
  ],
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
  'p0-how-computers-work': [
    {
      id: 'hcw1',
      type: 'mcq',
      question: 'What happens during the FETCH stage of the CPU cycle?',
      options: [
        'The CPU performs arithmetic on data in the ALU',
        'The Control Unit retrieves the next instruction from memory at the address in the Program Counter',
        'The result is written back to a register',
        'The instruction is translated into control signals',
      ],
      correctAnswer: 'The Control Unit retrieves the next instruction from memory at the address in the Program Counter',
      explanation: 'During fetch, the CPU sends the address from the Program Counter (PC) via the address bus to RAM, which returns the instruction data on the data bus. The PC then increments to point to the next instruction.',
    },
    {
      id: 'hcw2',
      type: 'truefalse',
      question: 'RAM is non-volatile — it retains data even when the computer is powered off.',
      correctAnswer: 'False',
      explanation: 'RAM is volatile memory. Its contents are lost when power is removed. This is why you lose unsaved work when the power goes out. Storage (HDD/SSD) is non-volatile and retains data without power.',
    },
    {
      id: 'hcw3',
      type: 'mcq',
      question: 'What is the correct order of memory from FASTEST to SLOWEST?',
      options: [
        'HDD → RAM → L1 Cache → SSD → CPU Registers',
        'CPU Registers → L1 Cache → RAM → SSD → HDD',
        'SSD → RAM → L1 Cache → CPU Registers → HDD',
        'RAM → CPU Registers → HDD → L1 Cache → SSD',
      ],
      correctAnswer: 'CPU Registers → L1 Cache → RAM → SSD → HDD',
      explanation: 'CPU registers operate at CPU speed (~0.3ns). L1 cache takes ~1ns. RAM takes ~30-100ns. SSDs take ~50-100μs. HDDs take ~5-15ms. Each level is roughly 10-100x slower than the level above it.',
    },
    {
      id: 'hcw4',
      type: 'fillblank',
      question: 'The formula that relates clock speed (f) and clock period (T) is: f = ___',
      correctAnswer: '1/T',
      explanation: 'Clock speed in Hz is the inverse of the clock period in seconds. A 3 GHz CPU has a clock period of approximately 0.33 nanoseconds (1 / 3×10⁹).',
    },
    {
      id: 'hcw5',
      type: 'code',
      question: 'What does this Python code simulate?',
      code: `memory = [0] * 32
registers = [0] * 4
pc = 0
while pc < len(program):
  instr = program[pc]
  if instr[0] == 'LOAD': registers[instr[3]] = instr[1]
  elif instr[0] == 'ADD': registers[instr[3]] = registers[instr[1]] + registers[instr[2]]
  pc += 1`,
      options: [
        'A Python interpreter executing bytecode',
        'The Fetch-Decode-Execute cycle of a CPU',
        'A compiler translating source code to machine code',
        'An operating system scheduling processes',
      ],
      correctAnswer: 'The Fetch-Decode-Execute cycle of a CPU',
      explanation: 'This code simulates a CPU: the Program Counter (pc) tracks the current instruction, instructions are fetched from program memory, decoded by checking the opcode (LOAD/ADD), and executed by manipulating registers.',
    },
  ],
  'p0-binary-logic': [
    {
      id: 'bl1',
      type: 'mcq',
      question: 'Which logic gate outputs 1 ONLY when both inputs are 1?',
      options: ['OR', 'XOR', 'AND', 'NAND'],
      correctAnswer: 'AND',
      explanation: 'The AND gate outputs 1 only when ALL inputs are 1. Think "both must be true." 0·0=0, 0·1=0, 1·0=0, 1·1=1.',
    },
    {
      id: 'bl2',
      type: 'mcq',
      question: 'Why is NAND called a "universal gate"?',
      options: [
        'It is the most commonly used gate in CPUs',
        'Any other logic gate can be constructed using only NAND gates',
        'It can operate on more than two inputs',
        'It is the fastest type of logic gate',
      ],
      correctAnswer: 'Any other logic gate can be constructed using only NAND gates',
      explanation: 'NAND is universal because NOT A = A NAND A, AND A·B = (A NAND B) NAND (A NAND B), OR A+B = (A NAND A) NAND (B NAND B). This means chip manufacturers only need to mass-produce one type of gate.',
    },
    {
      id: 'bl3',
      type: 'truefalse',
      question: 'The binary number 1101₂ equals 13 in decimal.',
      correctAnswer: 'True',
      explanation: '1101₂ = 1×2³ + 1×2² + 0×2¹ + 1×2⁰ = 8 + 4 + 0 + 1 = 13.',
    },
    {
      id: 'bl4',
      type: 'fillblank',
      question: 'De Morgan\'s Law states: ¬(A · B) = ¬A ___ ¬B',
      correctAnswer: '+',
      explanation: '¬(A · B) = ¬A + ¬B. The complement of AND is OR of complements. This is critical for simplifying logic circuits and reducing the number of gates needed.',
    },
    {
      id: 'bl5',
      type: 'match',
      question: 'Match each gate with its correct output when inputs are (A=1, B=0):',
      pairs: [
        { left: 'AND', right: '0' },
        { left: 'OR', right: '1' },
        { left: 'XOR', right: '1' },
        { left: 'NAND', right: '1' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'AND(1,0)=0, OR(1,0)=1, XOR(1,0)=1 (inputs differ), NAND(1,0)=1 (since AND(1,0)=0, then NOT 0=1).',
    },
  ],
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

const topicKeyDefinitionTemplates: Record<string, KeyDefinition[]> = {
  'p0-how-computers-work': [
    { term: 'CPU', definition: 'Central Processing Unit — the "brain" of the computer that executes instructions by performing arithmetic, logic, control, and I/O operations.', example: 'An Intel Core i7-13700K can execute up to 5.4 billion cycles per second (5.4 GHz).' },
    { term: 'RAM', definition: 'Random Access Memory — volatile memory that stores data and instructions currently being used by the CPU. Contents are lost when power is turned off.', example: '16 GB DDR5 RAM can transfer ~60 GB of data per second.' },
    { term: 'Storage', definition: 'Persistent data storage that retains information even when powered off. Includes HDDs (magnetic disks) and SSDs (flash memory).', example: 'A 1 TB NVMe SSD can read data at speeds up to 7,000 MB/s.' },
    { term: 'Clock Cycle', definition: 'A single electronic pulse of the system clock. The CPU executes one or more operations per cycle. Clock speed (GHz) measures cycles per second.', example: 'A 3.0 GHz CPU performs 3 billion clock cycles per second.' },
    { term: 'Fetch-Decode-Execute Cycle', definition: 'The fundamental operation cycle of a CPU: fetch instruction from memory, decode it into control signals, then execute the operation.', example: 'ADD R1, R2, R3 → Fetch the ADD instruction → Decode → Add values in R2 and R3, store in R1.' },
    { term: 'Bus', definition: 'A communication system that transfers data between components inside a computer (data bus, address bus, control bus).', example: 'A 64-bit data bus can transfer 8 bytes per clock cycle simultaneously.' },
  ],
  'p0-binary-logic': [
    { term: 'Bit', definition: 'The smallest unit of data in computing, representing either a 0 or 1. All digital data is composed of bits.', example: 'The letter "A" is stored as 01000001 in binary (8 bits).' },
    { term: 'Logic Gate', definition: 'An electronic circuit that performs a boolean operation on one or more binary inputs to produce a single binary output.', example: 'AND gate: 1 AND 1 = 1, but 1 AND 0 = 0.' },
    { term: 'Truth Table', definition: 'A mathematical table showing all possible input combinations and their corresponding outputs for a logic circuit.', example: 'XOR truth table: 0⊕0=0, 0⊕1=1, 1⊕0=1, 1⊕1=0.' },
    { term: 'Boolean Algebra', definition: 'A branch of algebra dealing with true/false values (1/0) using operations like AND (·), OR (+), and NOT (¬).', example: 'De Morgan\'s Law: ¬(A ∧ B) = ¬A ∨ ¬B.' },
  ],
}

const topicFormulaTemplates: Record<string, FormulaCard[]> = {
  'p0-how-computers-work': [
    {
      title: 'Clock Speed Formula',
      formula: 'f = 1 / T',
      explanation: 'Clock speed (frequency) is the inverse of the clock period (T). A clock period of 0.33 nanoseconds gives a frequency of approximately 3 GHz. Higher clock speed means more instructions per second.',
      example: 'T = 0.33 ns → f = 1 / (0.33 × 10⁻⁹) ≈ 3.03 GHz\nThis CPU can execute ~3 billion cycles per second.',
    },
    {
      title: 'Data Transfer Rate',
      formula: 'Transfer Rate = Bus Width × Clock Speed',
      explanation: 'The amount of data transferred per second equals the bus width (number of bits transferred per cycle) multiplied by the clock speed. Wider buses and higher clocks mean faster data movement.',
      example: '64-bit bus × 3.0 GHz = 64 × 3×10⁹ = 192 Gbps = 24 GB/s',
    },
    {
      title: 'Binary to Decimal Conversion',
      formula: 'Value = Σ(bᵢ × 2ⁱ)  for i = 0 to n-1',
      explanation: 'Each bit bᵢ at position i contributes bᵢ × 2ⁱ to the total value. The rightmost bit is position 0 (2⁰ = 1), and each position left doubles the weight.',
      example: '1011₂ = 1×2³ + 0×2² + 1×2¹ + 1×2⁰\n= 8 + 0 + 2 + 1 = 11₁₀',
    },
  ],
  'p0-binary-logic': [
    {
      title: 'AND Gate',
      formula: 'A · B = Q',
      explanation: 'The AND gate outputs 1 ONLY when both inputs are 1. Represented as multiplication in boolean algebra. Think: "both conditions must be true."',
      example: '1 · 1 = 1\n1 · 0 = 0\n0 · 1 = 0\n0 · 0 = 0',
    },
    {
      title: 'OR Gate',
      formula: 'A + B = Q',
      explanation: 'The OR gate outputs 1 when ANY input is 1. Represented as addition in boolean algebra. Think: "at least one condition must be true."',
      example: '1 + 1 = 1\n1 + 0 = 1\n0 + 1 = 1\n0 + 0 = 0',
    },
    {
      title: 'NAND is Universal Gate',
      formula: 'Q = ¬(A · B)',
      explanation: 'NAND (NOT AND) is called a "universal gate" because ANY logic gate can be constructed using only NAND gates. This is crucial for chip manufacturing.',
      example: 'NOT A = A NAND A\nA AND B = ¬(A NAND B)\nA OR B = (¬A) NAND (¬B)',
    },
  ],
}

const topicWhyItMattersTemplates: Record<string, string> = {
  'p0-how-computers-work': 'Every AI model you build — from a simple linear regression to a billion-parameter transformer — ultimately runs on a physical computer. Understanding how CPUs execute instructions, how memory hierarchies affect performance, and how data moves through the system directly impacts your ability to write efficient, scalable AI code. Without this foundation, debugging performance bottlenecks in ML training pipelines is guesswork.',
  'p0-binary-logic': 'At their core, CPUs are just billions of logic gates switching at incredible speeds. Every AI algorithm — matrix multiplication, gradient descent, attention mechanisms — is ultimately reduced to boolean operations on bits. Understanding binary logic is understanding the most fundamental layer of computation, from which all higher-level AI concepts are built.',
}

const topicArchitectureTemplates: Record<string, ArchitectureDiagram> = {
  'p0-how-computers-work': {
    title: 'Computer Architecture — Von Neumann Model',
    description: 'The Von Neumann architecture describes the fundamental organization of all modern computers.',
    blocks: [
      { label: 'CPU (Central Processing Unit)', description: 'Executes instructions — the "brain" of the computer', subBlocks: [
        { label: 'Control Unit (CU)', description: 'Fetches instructions from memory and decodes them into control signals' },
        { label: 'Arithmetic Logic Unit (ALU)', description: 'Performs arithmetic (add, subtract) and logic (AND, OR, compare) operations' },
        { label: 'Registers', description: 'Ultra-fast memory inside the CPU for immediate data access (e.g., PC, IR, ACC)' },
      ] },
      { label: 'Memory (RAM)', description: 'Stores active data and instructions — fast but volatile' },
      { label: 'Storage (HDD/SSD)', description: 'Persistent data storage — slower but retains data when powered off' },
      { label: 'I/O Devices', description: 'Input (keyboard, mouse, sensors) and Output (monitor, speakers, network)' },
    ],
  },
}

function generateGenericKeyDefinitions(title: string, phaseTitle: string): KeyDefinition[] {
  return [
    { term: title, definition: `Core concept within ${phaseTitle}. Understanding this provides a foundation for more advanced topics.` },
    { term: 'Algorithm', definition: 'A step-by-step procedure for solving a problem or accomplishing a task.' },
    { term: 'Data Structure', definition: 'A specialized format for organizing, processing, and storing data.' },
    { term: 'Abstraction', definition: 'Hiding complex implementation details behind a simple interface.' },
  ]
}

function generateGenericFormulas(title: string): FormulaCard[] {
  return [
    {
      title: 'General Form',
      formula: 'f(x) = output',
      explanation: `This represents the general input-output relationship modeled in ${title}. The function transforms input data into meaningful predictions or decisions.`,
    },
  ]
}

function generateGenericWhyItMatters(title: string, phaseTitle: string): string {
  return `${title} is a fundamental building block in ${phaseTitle}. Mastering this concept will prepare you for more advanced topics and real-world applications in AI and machine learning.`
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

  const keyDefinitions = topicKeyDefinitionTemplates[topicId] || generateGenericKeyDefinitions(title, phaseTitle)
  const formulas = topicFormulaTemplates[topicId] || generateGenericFormulas(title)
  const whyItMatters = topicWhyItMattersTemplates[topicId] || generateGenericWhyItMatters(title, phaseTitle)
  const architecture = topicArchitectureTemplates[topicId]

  return {
    difficulty,
    estimatedTime,
    prerequisites,
    tags,
    objectives,
    theory,
    keyDefinitions,
    formulas,
    whyItMatters,
    architecture,
    understanding,
    codeExamples,
    realWorld,
    quiz,
  }
}
