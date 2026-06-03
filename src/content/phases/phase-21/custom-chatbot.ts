import { registerContent } from '@/content/index'

registerContent('p21-custom-chatbot', () => ({
  difficulty: 'Advanced',
  estimatedTime: '120 minutes',
  prerequisites: ['p8-llama-mistral', 'p8-lora-qlora'],
  tags: ['End-to-End Projects', 'Advanced', 'Project'],
  objectives: [
    'Prepare a custom dataset in instruction-following format',
    'Fine-tune an LLM using LoRA with 4-bit quantization',
    'Apply PEFT (Parameter-Efficient Fine-Tuning)',
    'Create a Gradio chat interface with conversation memory',
    'Deploy with vLLM for optimized inference',
  ],
  theory: `# Custom Chatbot with Fine-tuning

## Problem Overview

Building a custom chatbot requires adapting a general-purpose LLM to your specific domain, tone, and knowledge. Fine-tuning with LoRA (Low-Rank Adaptation) makes this practical on consumer hardware.

### Why Fine-tune Instead of Prompt Engineering?

| Aspect | Prompt Engineering | Fine-tuning (LoRA) |
|--------|-------------------|-------------------|
| Knowledge | Limited to context window | Embedded in model weights |
| Tone Control | Inconsistent, needs careful prompting | Consistently learned |
| Cost per Query | Higher (longer prompts) | Lower (shorter prompts) |
| Data Requirements | Needs good prompt design | Needs 500-10K examples |
| Setup Time | Minutes | 1-4 hours on consumer GPU |

## Dataset Preparation: Instruction Format

Fine-tuning data follows the chat/instruction format:

\\\`\\\`\\\`
{
  "messages": [
    {"role": "system", "content": "You are a helpful coding assistant."},
    {"role": "user", "content": "Write a Python function to sort a list."},
    {"role": "assistant", "content": "Here's a sorting function:\\ndef sort_list(items):\\n    return sorted(items)"}
  ]
}
\\\`\\\`\\\`

### Data Quality Rules

1. **Diverse inputs**: Cover edge cases, common questions, and rare scenarios
2. **Correct outputs**: Every response must be accurate
3. **Consistent tone**: All responses follow the same style guidelines
4. **Hard negatives**: Include examples the model should refuse (harmful prompts)
5. **Multi-turn**: Include conversation chains for dialogue understanding

## LoRA (Low-Rank Adaptation)

LoRA freezes the pre-trained weights and injects trainable rank decomposition matrices:

$$W' = W + \\Delta W = W + BA \\quad \\text{where} \\quad B \\in \\mathbb{R}^{d \\times r}, A \\in \\mathbb{R}^{r \\times k}$$

- **r (rank)**: Typically 8-64. Lower = fewer parameters, faster training
- **Target modules**: Usually attention layers (q_proj, v_proj, etc.)
- **alpha**: Scaling factor (typically 16-32)
- **Parameters trained**: <1% of full model

### 4-bit Quantization (QLoRA)

QLoRA combines LoRA with 4-bit NormalFloat quantization:
- **NF4**: Information-theoretically optimal for normally distributed weights
- **Double Quantization**: Quantizes the quantization constants for extra savings
- **Paged Optimizers**: Uses unified memory for GPU/CPU to handle memory spikes

## Inference Optimization

| Technique | Speedup | Memory Reduction | Quality Impact |
|-----------|---------|-----------------|----------------|
| FP16 Inference | 2x | 50% | None |
| INT8 Quantization | 2-3x | 75% | Minimal |
| vLLM (PagedAttention) | 10-24x | Variable | None |
| FlashAttention-2 | 2-3x | Variable | None |

## Deployment Options

1. **vLLM**: Fastest inference with PagedAttention and continuous batching
2. **Gradio**: Quick UI prototyping with chat components
3. **FastAPI**: Custom REST API for integration
4. **TGI (Text Generation Inference)**: Hugging Face optimized serving`,

  understanding: {
    analogy: 'Fine-tuning with LoRA is like learning a new accent. You don\'t need to learn language from scratch — you already know English (pre-trained model). LoRA is like taking a few accent coaching sessions that slightly adjust how you pronounce certain words, without changing your entire vocabulary and grammar. The "rank" parameter controls how many adjustments you can make: higher rank = more accent changes, lower rank = fewer changes but cheaper. 4-bit quantization is like compressing your knowledge into a pocket dictionary — slightly less precise but much more portable.',
    steps: [
      { title: 'Prepare Dataset', content: 'Create instruction-following examples in JSONL format (system/user/assistant messages). Ensure diversity, correctness, and consistent tone. Aim for 500-10K examples depending on the task.' },
      { title: 'Load and Quantize Base Model', content: 'Load the base LLM (Mistral-7B, Llama-2, Llama-3) with 4-bit quantization using bitsandbytes. This reduces memory from 14GB to ~4GB for a 7B model.' },
      { title: 'Configure LoRA', content: 'Set up PEFT LoRA config: target modules (q_proj, v_proj), rank (r=16), alpha=32, dropout=0.05. Only LoRA parameters are trained (<1% of total parameters).' },
      { title: 'Fine-tune', content: 'Train with SFTTrainer from TRL library. Use packing for efficient training. Monitor loss — overfitting starts when training loss drops far below validation loss.' },
      { title: 'Evaluate', content: 'Test on held-out prompts. Check for quality, tone adherence, and refusal behavior. Compare before/after fine-tuning on representative examples.' },
      { title: 'Merge and Deploy', content: 'Merge LoRA weights into base model for deployment. Export to vLLM format for 10-24x faster inference. Deploy with Gradio UI or FastAPI endpoint.' },
    ],
    misconceptions: [
      { misconception: 'Fine-tuning teaches the model new facts', truth: 'Fine-tuning teaches format, tone, and behavior — it does not reliably add new factual knowledge. The model already "knows" facts from pre-training. Fine-tuning teaches it how to present them in your desired style.' },
      { misconception: 'QLoRA (4-bit) training is as good as full fine-tuning', truth: 'QLoRA with 4-bit quantization achieves ~90-95% of full fine-tuning quality. For most applications this is sufficient, but for maximum quality, full fine-tuning with 16-bit precision is still superior.' },
      { misconception: 'More training data always improves quality', truth: 'Quality > quantity. 500 high-quality, diverse, well-curated examples outperform 10K noisy, repetitive examples. Bad examples actively harm model behavior.' },
    ],
    comparisons: [
      { label: 'Memory (7B model)', methodA: 'Full Fine-tuning: 56GB (FP16)', methodB: 'QLoRA (4-bit): ~5GB' },
      { label: 'Trainable Params', methodA: 'Full: 7B (100%)', methodB: 'LoRA: 4-16M (<0.5%)' },
      { label: 'Training Time (7B)', methodA: 'Full: 3-7 days on 8x A100', methodB: 'QLoRA: 2-6 hours on 1x A100' },
      { label: 'Output Quality', methodA: 'Full: Baseline (100%)', methodB: 'QLoRA: ~90-95% of full' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `# Setup: Load base model with 4-bit quantization
import torch
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    BitsAndBytesConfig,
)

# 4-bit quantization config
bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.bfloat16,
    bnb_4bit_use_double_quant=True,
)

# Load tokenizer and quantized model
model_name = "mistralai/Mistral-7B-Instruct-v0.2"
tokenizer = AutoTokenizer.from_pretrained(model_name)
tokenizer.pad_token = tokenizer.eos_token

model = AutoModelForCausalLM.from_pretrained(
    model_name,
    quantization_config=bnb_config,
    device_map="auto",
    trust_remote_code=True,
)

print(f"Model loaded: {model_name}")
print(f"Memory: {model.get_memory_footprint() / 1024**3:.2f} GB")

# Test base model before fine-tuning
prompt = "Write a friendly greeting for a customer."
inputs = tokenizer(prompt, return_tensors="pt").to("cuda")
output = model.generate(**inputs, max_new_tokens=50)
print(f"\\nBefore fine-tuning:\\n{tokenizer.decode(output[0])}")`,
      output: `Model loaded: mistralai/Mistral-7B-Instruct-v0.2
Memory: 4.23 GB

Before fine-tuning:
Write a friendly greeting for a customer.

Hello! How can I assist you today? We have a wide selection of products...`,
      explanation: 'Loading a quantized 7B model using bitsandbytes 4-bit NF4 quantization. The model footprint drops from ~14GB (FP16) to ~4.2GB (4-bit), fitting on consumer GPUs. The base model shows generic instruction-following behavior before fine-tuning.',
    },
    {
      level: 'intermediate',
      code: `# Core logic: LoRA fine-tuning with SFTTrainer
from datasets import load_dataset
from trl import SFTTrainer
from peft import LoraConfig, get_peft_model

# Load dataset (JSONL with "messages" format)
dataset = load_dataset(
    "json",
    data_files="data/chatbot_training.jsonl",
    split="train",
)

# LoRA configuration
peft_config = LoraConfig(
    r=16,                          # Rank
    lora_alpha=32,                 # Scaling factor
    target_modules=["q_proj", "v_proj", "k_proj", "o_proj"],
    lora_dropout=0.05,
    bias="none",
    task_type="CAUSAL_LM",
)

# Format function for chat template
def format_chat(example):
    messages = example["messages"]
    formatted = tokenizer.apply_chat_template(
        messages, tokenize=False
    )
    return {"text": formatted}

dataset = dataset.map(format_chat)
train_val = dataset.train_test_split(test_size=0.05)
train_dataset = train_val["train"]
eval_dataset = train_val["test"]

# SFT Trainer
trainer = SFTTrainer(
    model=model,
    train_dataset=train_dataset,
    eval_dataset=eval_dataset,
    peft_config=peft_config,
    dataset_text_field="text",
    max_seq_length=2048,
    tokenizer=tokenizer,
    packing=True,
    args=TrainingArguments(
        output_dir="./mistral-lora",
        per_device_train_batch_size=4,
        gradient_accumulation_steps=4,
        warmup_steps=100,
        num_train_epochs=3,
        learning_rate=2e-4,
        fp16=True,
        logging_steps=10,
        evaluation_strategy="steps",
        save_strategy="steps",
        load_best_model_at_end=True,
    ),
)

# Train
trainer.train()

# Save LoRA weights
trainer.save_model("./mistral-lora-final")
print("Fine-tuning complete! LoRA weights saved.")`,
      output: `Training started...
Step 10/300: loss=1.2345, eval_loss=1.3456
Step 50/300: loss=0.8765, eval_loss=0.9567
Step 100/300: loss=0.6543, eval_loss=0.7456
Step 200/300: loss=0.4987, eval_loss=0.6123
Step 300/300: loss=0.4123, eval_loss=0.5678

Training completed. Best model saved at step 250 (eval_loss=0.5543).`,
      explanation: 'LoRA fine-tuning with SFTTrainer from Hugging Face TRL. Only ~0.1% of parameters are trained (LoRA adapters). The model learns the desired response format and tone while the base weights remain frozen. Packing (multiple sequences in one) improves training efficiency.',
    },
    {
      level: 'advanced',
      code: `# Deployment: vLLM inference and Gradio chat interface
import gradio as gr
from vllm import LLM, SamplingParams
from transformers import AutoTokenizer

# Load model with vLLM (optimized inference)
model_path = "./mistral-lora-final-merged"
llm = LLM(
    model=model_path,
    tensor_parallel_size=1,
    dtype="float16",
    max_model_len=4096,
)
tokenizer = AutoTokenizer.from_pretrained(model_path)

sampling_params = SamplingParams(
    temperature=0.7,
    top_p=0.95,
    max_tokens=1024,
    presence_penalty=0.1,
)

def format_messages(messages):
    return tokenizer.apply_chat_template(
        messages, tokenize=False, add_generation_prompt=True
    )

def predict(message, history):
    history = history or []
    messages = [
        {"role": "system", "content": "You are a helpful coding assistant."}
    ]
    for user_msg, assistant_msg in history:
        messages.append({"role": "user", "content": user_msg})
        messages.append({"role": "assistant", "content": assistant_msg})
    messages.append({"role": "user", "content": message})

    prompt = format_messages(messages)
    outputs = llm.generate([prompt], sampling_params)
    response = outputs[0].outputs[0].text.strip()
    return response

# Gradio chat interface
with gr.Blocks(title="Custom Chatbot", theme="soft") as demo:
    gr.Markdown("# \\U0001f4ac Custom Fine-tuned Chatbot")
    chatbot = gr.ChatInterface(
        predict,
        title="Chatbot",
        description="Fine-tuned with LoRA on custom instruction data",
        theme="soft",
    )

if __name__ == "__main__":
    demo.launch(server_name="0.0.0.0", server_port=7860)`,
      output: `Gradio app running on http://localhost:7860

User: Write a Python function to merge two sorted lists.
Assistant: Here's an efficient O(n) merge function:
def merge_sorted_lists(list1, list2):
    result = []
    i = j = 0
    while i < len(list1) and j < len(list2):
        if list1[i] <= list2[j]:
            result.append(list1[i])
            i += 1
        else:
            result.append(list2[j])
            j += 1
    result.extend(list1[i:])
    result.extend(list2[j:])
    return result`,
      explanation: 'Production deployment with vLLM for 10-24x faster inference over vanilla Hugging Face. The Gradio chat interface includes conversation history management. vLLM\'s PagedAttention and continuous batching maximize GPU utilization for serving.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Customer Support', description: 'Companies fine-tune LLMs on their support documentation and historical tickets to create a chatbot that answers customer questions in the company\'s brand voice with accurate product-specific knowledge.' },
      { industry: 'Healthcare', description: 'Medical chatbot fine-tuned on clinical guidelines and approved responses assists patients with appointment scheduling, medication reminders, and FAQs while refusing medical advice requests.' },
      { industry: 'Code Assistants', description: 'Developer tools fine-tune models on internal codebases and style guides to create coding assistants that generate code following company-specific patterns, naming conventions, and library usage.' },
    ],
    caseStudy: {
      problem: 'A SaaS company\'s customer support team handled 15K+ tickets monthly with a 12-hour average response time. Their general-purpose chatbot (GPT-4 with prompt engineering) gave inconsistent answers and didn\'t know their product\'s specific features.',
      solution: 'They created 3K high-quality training examples from solved support tickets, product documentation, and API reference. Using QLoRA, they fine-tuned Mistral-7B on a single A100 in 4 hours. The model was deployed with vLLM for low-latency inference.',
      results: 'First-response time dropped from 12 hours to 30 seconds. Ticket deflection (auto-resolved by chatbot) reached 65%. Customer satisfaction scores for chatbot interactions matched human agents (4.2/5 vs 4.3/5). The system saved $1.8M/year in support costs.',
    },
    bestPractices: [
      'Curate high-quality training data — 500 excellent examples beat 10K noisy ones',
      'Use the chat template from the base model (apply_chat_template) for consistent formatting',
      'Merge LoRA weights into base model for deployment (eliminates PEFT dependency)',
      'Always set pad_token = eos_token to avoid padding issues during generation',
      'Test on held-out prompts before deployment — evaluate tone, accuracy, and safety',
      'Monitor deployed model for drift — user queries change over time, requiring retraining',
    ],
    tools: ['Hugging Face Transformers', 'PEFT (LoRA/QLoRA)', 'bitsandbytes', 'TRL (SFTTrainer)', 'vLLM', 'Gradio', 'Docker'],
    jobRoles: ['LLM Engineer', 'NLP Engineer', 'AI Engineer', 'Applied Scientist'],
    furtherReading: [
      'Hugging Face PEFT Documentation: LoRA',
      'QLoRA: Efficient Finetuning of Quantized LLMs (Dettmers et al., 2023)',
      'vLLM: Easy, Fast, and Cheap LLM Serving',
      'LoRA: Low-Rank Adaptation of Large Language Models (Hu et al., 2021)',
    ],
  },
  quiz: [
    {
      id: 'p21-cb-1', type: 'mcq',
      question: 'What is the primary advantage of LoRA over full fine-tuning?',
      options: [
        'LoRA achieves higher accuracy than full fine-tuning',
        'LoRA trains only a small fraction of parameters, making it memory-efficient and fast',
        'LoRA does not require any training data',
        'LoRA works without a GPU',
      ],
      correctAnswer: 'LoRA trains only a small fraction of parameters, making it memory-efficient and fast',
      explanation: 'LoRA injects low-rank matrices into attention layers and trains only those (<0.5% of parameters). This reduces GPU memory from ~56GB to ~5GB for a 7B model and training time from days to hours, while retaining most of the quality.',
    },
    {
      id: 'p21-cb-2', type: 'code',
      question: 'What does r=16 control in the LoRA configuration?',
      code: `peft_config = LoraConfig(
    r=16,
    lora_alpha=32,
    lora_dropout=0.05,
)`,
      options: [
        'The number of attention layers to modify',
        'The rank of the low-rank matrices — determines how many parameters are added',
        'The learning rate scaling factor',
        'The maximum sequence length for training',
      ],
      correctAnswer: 'The rank of the low-rank matrices — determines how many parameters are added',
      explanation: 'The rank r controls the dimension of the low-rank decomposition matrices B (d×r) and A (r×k). Higher rank = more expressive adaptation but more parameters. r=16 is a good default for most tasks.',
    },
    {
      id: 'p21-cb-3', type: 'truefalse',
      question: 'Fine-tuning reliably teaches an LLM new factual information that it didn\'t know before.',
      correctAnswer: 'False',
      explanation: 'Fine-tuning primarily teaches format, tone, and behavior. It does not reliably inject new factual knowledge — that requires pre-training. Fine-tuning on facts often leads to memorization without generalization and can cause catastrophic forgetting.',
    },
    {
      id: 'p21-cb-4', type: 'fillblank',
      question: 'The vLLM optimization technique that manages KV cache memory more efficiently by allocating fixed-size blocks is called ___.',
      correctAnswer: 'PagedAttention',
      explanation: 'PagedAttention manages the KV cache in fixed-size blocks (like virtual memory paging). This eliminates fragmentation, enables memory sharing across sequences, and supports copy-on-write for speculative decoding.',
    },
    {
      id: 'p21-cb-5', type: 'match',
      question: 'Match each concept with its role in fine-tuning:',
      pairs: [
        { left: 'NF4 Quantization', right: '4-bit NormalFloat for memory-efficient model loading' },
        { left: 'LoRA Adapters', right: 'Trainable low-rank matrices injected into frozen weights' },
        { left: 'Chat Template', right: 'Formatting function that structures system/user/assistant messages' },
        { left: 'Packing', right: 'Combines multiple training sequences into one for efficiency' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'NF4 reduces memory via quantization, LoRA adapters are the only trained parameters, chat template structures multi-turn conversations, and packing maximizes GPU utilization during training.',
    },
  ],
}))

export {}
