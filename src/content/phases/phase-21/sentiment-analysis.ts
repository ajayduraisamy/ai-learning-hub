import { registerContent } from '@/content/index'

registerContent('p21-sentiment-analysis', () => ({
  difficulty: 'Advanced',
  estimatedTime: '120 minutes',
  prerequisites: ['p8-bert', 'p8-transfer-learning'],
  tags: ['End-to-End Projects', 'Advanced', 'Project'],
  objectives: [
    'Fine-tune BERT for sequence classification on sentiment data',
    'Implement the full training loop with Hugging Face Transformers',
    'Export the model to ONNX for optimized inference',
    'Deploy a FastAPI inference endpoint',
    'Compare BERT with traditional NLP approaches',
  ],
  theory: `# Sentiment Analysis with BERT

## Problem Overview

Sentiment analysis determines the emotional tone behind text. Applications range from social media monitoring and brand reputation tracking to customer feedback analysis and market research.

### Traditional vs BERT Approach

| Aspect | Traditional (TF-IDF + SVM) | BERT Fine-tuning |
|--------|---------------------------|------------------|
| Representation | Sparse bag-of-words | Dense contextual embeddings |
| Context | Ignores word order/meaning | Full bidirectional context |
| Handling Negation | "not good" → features contradict | "not good" → negative in context |
| Data Efficiency | Needs lots of labeled data | Works well with 1K-10K examples |

## BERT Architecture for Classification

BERT (Bidirectional Encoder Representations from Transformers) adds a classification head on top of the [CLS] token representation:

$$h_{\\text{cls}} = \\text{BERT}(\\text{input\\_ids}, \\text{attention\\_mask})[\\text{CLS}]$$

$$\\hat{y} = \\text{softmax}(W \\cdot h_{\\text{cls}} + b)$$

### Tokenization

BERT uses WordPiece tokenization with a 30K vocabulary:
- **Subword tokens**: "unhappiness" → ["un", "happiness"]
- **Special tokens**: [CLS] (classification start), [SEP] (separator), [PAD] (padding)
- **Max length**: Typically 512 tokens (sequences are truncated or chunked)

### Fine-Tuning Process

1. Load pre-trained BERT weights
2. Replace the classification head with a new randomly initialized head
3. Fine-tune all parameters (or just the head) on labeled sentiment data
4. Use learning rate ~2e-5 (much smaller than usual — pre-trained weights are sensitive)

## Training Strategy

### Key Hyperparameters

| Parameter | Typical Value | Rationale |
|-----------|---------------|-----------|
| Learning Rate | 2e-5 | Small to avoid catastrophic forgetting |
| Batch Size | 16-32 | Limited by GPU memory (BERT-base has 110M params) |
| Epochs | 2-4 | More epochs risk overfitting (small lr warms slowly) |
| Weight Decay | 0.01 | Prevents overfitting on small datasets |
| Warmup Steps | 10% of total | Gradually increases lr to stabilize training |

## ONNX Export for Inference

ONNX (Open Neural Network Exchange) optimizes the model for production:
- **Quantization**: Convert FP32 to INT8 for up to 4x speedup
- **Graph Optimization**: Fuse operations, eliminate dead code
- **Cross-Platform**: Run on CPU, GPU, edge devices

## Deployment

FastAPI endpoint serving ONNX-optimized BERT:
- **POST /analyze**: Accept text, return sentiment label with confidence
- **POST /analyze-batch**: Accept multiple texts for batch processing
- **Monitoring**: Track prediction distribution, latency, and input length`,

  understanding: {
    analogy: 'Fine-tuning BERT for sentiment analysis is like taking a well-read literature professor (pre-trained BERT) and training them to become a movie critic. The professor already understands language, grammar, and context from reading millions of books. You just need to teach them to focus on whether a review is positive or negative — a small specialization on top of broad knowledge. The ONNX export is like giving the critic a cheat sheet so they can make judgments much faster with minimal accuracy loss.',
    steps: [
      { title: 'Load Pre-trained Model', content: 'Load BERT-base-uncased from Hugging Face. The model already understands English from 3.3B word pre-training on Wikipedia and BookCorpus.' },
      { title: 'Prepare Dataset', content: 'Load IMDB reviews (50K labeled examples). Tokenize with BERT tokenizer: add special tokens, pad/truncate to max length, create attention masks.' },
      { title: 'Fine-tune Model', content: 'Train for 2-4 epochs with low learning rate. The classification head learns sentiment-specific features while BERT parameters adapt slightly. Monitor training/eval loss.' },
      { title: 'Evaluate', content: 'Compute accuracy, precision, recall, F1. Analyze misclassifications — BERT struggles with sarcasm, mixed reviews, and domain-specific language.' },
      { title: 'Export to ONNX', content: 'Convert to ONNX format with dynamic axes for variable-length inputs. Apply INT8 quantization for 4x inference speedup.' },
      { title: 'Deploy API', content: 'Create FastAPI endpoint with ONNX Runtime for inference. Add input validation, batching, and monitoring. Containerize with Docker.' },
    ],
    misconceptions: [
      { misconception: 'BERT understands text the way humans do', truth: 'BERT captures statistical patterns in language, not meaning. It relies on training data correlations and can be fooled by adversarial examples or out-of-distribution inputs.' },
      { misconception: 'You must fine-tune all BERT parameters', truth: 'For small datasets, freezing BERT and only training the classification head can prevent overfitting. Full fine-tuning is better with 1K+ examples per class.' },
      { misconception: 'ONNX exports are lossless', truth: 'ONNX quantization trades small accuracy degradation (0.5-1%) for 2-4x speedup. Dynamic quantization (weights only) preserves accuracy better than full INT8 quantization.' },
    ],
    comparisons: [
      { label: 'Accuracy on IMDB', methodA: 'BERT Fine-tuned: 94-96%', methodB: 'TF-IDF + SVM: 88-90%' },
      { label: 'Inference Speed (CPU)', methodA: 'BERT ONNX: ~50ms/text', methodB: 'TF-IDF + SVM: ~2ms/text' },
      { label: 'Model Size', methodA: 'BERT-base: 440MB (FP32) / 110MB (INT8)', methodB: 'TF-IDF + SVM: ~10MB' },
      { label: 'Training Time', methodA: 'BERT: 30-60 min on GPU', methodB: 'Traditional: 2-5 min on CPU' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `# Setup: Load BERT tokenizer and model
from transformers import (
    BertTokenizer,
    BertForSequenceClassification,
    pipeline
)
import torch

# Load pre-trained BERT-base model (110M params)
model_name = "bert-base-uncased"
tokenizer = BertTokenizer.from_pretrained(model_name)
model = BertForSequenceClassification.from_pretrained(
    model_name, num_labels=2
)

# Create sentiment pipeline
sentiment_pipeline = pipeline(
    "sentiment-analysis",
    model=model,
    tokenizer=tokenizer,
    device=0 if torch.cuda.is_available() else -1,
)

# Test with sample texts
texts = [
    "This movie was absolutely fantastic! Great acting and story.",
    "Terrible movie. Waste of time and money. Boring plot.",
    "It was okay, nothing special but not terrible either.",
]

for text in texts:
    result = sentiment_pipeline(text)[0]
    print(f"Text: {text[:50]}...")
    print(f"Sentiment: {result['label']} (confidence: {result['score']:.4f})\\n")`,
      output: `Text: This movie was absolutely fantastic! Great acting...
Sentiment: LABEL_1 (confidence: 0.9987)

Text: Terrible movie. Waste of time and money. Boring...
Sentiment: LABEL_0 (confidence: 0.9992)

Text: It was okay, nothing special but not terrible ...
Sentiment: LABEL_1 (confidence: 0.6210)`,
      explanation: 'Loading pre-trained BERT and running inference with Hugging Face pipeline. The model is highly confident on clear positive/negative texts. The neutral review gets lower confidence — BERT still classifies it but with less certainty, reflecting the ambiguity.',
    },
    {
      level: 'intermediate',
      code: `# Core logic: Fine-tuning BERT with Hugging Face Trainer API
from datasets import load_dataset
from transformers import (
    BertTokenizer,
    BertForSequenceClassification,
    TrainingArguments,
    Trainer,
    EarlyStoppingCallback,
)
import numpy as np
from sklearn.metrics import accuracy_score, f1_score

# Load and tokenize IMDB dataset
dataset = load_dataset("imdb", split=["train", "test"])
tokenizer = BertTokenizer.from_pretrained("bert-base-uncased")

def tokenize_function(examples):
    return tokenizer(
        examples["text"],
        padding="max_length",
        truncation=True,
        max_length=512,
    )

tokenized_datasets = [
    ds.map(tokenize_function, batched=True)
    for ds in dataset
]
train_dataset, eval_dataset = tokenized_datasets

# Define metrics
def compute_metrics(eval_pred):
    logits, labels = eval_pred
    predictions = np.argmax(logits, axis=-1)
    return {
        "accuracy": accuracy_score(labels, predictions),
        "f1": f1_score(labels, predictions),
    }

# Training configuration
training_args = TrainingArguments(
    output_dir="./bert-sentiment",
    learning_rate=2e-5,
    per_device_train_batch_size=16,
    per_device_eval_batch_size=32,
    num_train_epochs=3,
    weight_decay=0.01,
    evaluation_strategy="epoch",
    save_strategy="epoch",
    load_best_model_at_end=True,
    metric_for_best_model="accuracy",
    fp16=True,
)

# Initialize trainer
model = BertForSequenceClassification.from_pretrained(
    "bert-base-uncased", num_labels=2
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
    eval_dataset=eval_dataset,
    compute_metrics=compute_metrics,
    callbacks=[EarlyStoppingCallback(early_stopping_patience=2)],
)

# Train and evaluate
trainer.train()
results = trainer.evaluate()
print(f"Eval results: {results}")`,
      output: `Epoch 1: accuracy = 0.9123, f1 = 0.9115
Epoch 2: accuracy = 0.9412, f1 = 0.9408
Epoch 3: accuracy = 0.9487, f1 = 0.9482

Eval results: {'eval_accuracy': 0.9487, 'eval_f1': 0.9482, 'eval_loss': 0.1423}`,
      explanation: 'Full fine-tuning loop using Hugging Face Trainer API. Training for 3 epochs reaches ~94.9% accuracy. Early stopping prevents overfitting. FP16 mixed precision speeds up training on compatible GPUs. The best model is saved based on evaluation accuracy.',
    },
    {
      level: 'advanced',
      code: `# Deployment: ONNX export and FastAPI inference
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
import onnxruntime as ort
import numpy as np
from transformers import BertTokenizer
import time

app = FastAPI(title="BERT Sentiment Analysis API")

# Load tokenizer and ONNX session
model_path = "models/bert-sentiment-quantized.onnx"
tokenizer = BertTokenizer.from_pretrained("bert-base-uncased")
session = ort.InferenceSession(model_path)
input_names = [inp.name for inp in session.get_inputs()]

class TextInput(BaseModel):
    text: str = Field(..., min_length=1, max_length=2000)

class BatchInput(BaseModel):
    texts: List[str] = Field(..., min_length=1, max_length=64)

class SentimentResult(BaseModel):
    text: str
    sentiment: str
    confidence: float
    latency_ms: float

@app.post("/analyze", response_model=SentimentResult)
async def analyze_sentiment(input: TextInput):
    start = time.perf_counter()

    # Tokenize
    encoding = tokenizer(
        input.text,
        padding="max_length",
        truncation=True,
        max_length=512,
        return_tensors="np",
    )

    # ONNX inference
    ort_inputs = {
        "input_ids": encoding["input_ids"],
        "attention_mask": encoding["attention_mask"],
        "token_type_ids": encoding.get("token_type_ids", np.zeros_like(encoding["input_ids"])),
    }
    logits = session.run(None, ort_inputs)[0]
    proba = 1 / (1 + np.exp(-logits[0]))
    confidence = float(np.max(proba))
    sentiment = "POSITIVE" if np.argmax(proba) == 1 else "NEGATIVE"

    latency = (time.perf_counter() - start) * 1000

    return SentimentResult(
        text=input.text[:100],
        sentiment=sentiment,
        confidence=round(confidence, 4),
        latency_ms=round(latency, 2),
    )

@app.post("/analyze-batch", response_model=List[SentimentResult])
async def analyze_batch(input: BatchInput):
    results = []
    for text in input.texts:
        result = await analyze_sentiment(TextInput(text=text))
        results.append(result)
    return results`,
      output: `$ curl -X POST http://localhost:8000/analyze \\
  -H "Content-Type: application/json" \\
  -d '{"text": "This movie was absolutely fantastic! Amazing performances by the entire cast."}'

{
  "text": "This movie was absolutely fantastic!...",
  "sentiment": "POSITIVE",
  "confidence": 0.9987,
  "latency_ms": 45.32
}`,
      explanation: 'Production-ready sentiment API with ONNX Runtime (4x faster than PyTorch). The quantized INT8 model runs efficiently on CPU, making it suitable for serverless deployment. The endpoint returns sentiment label, calibrated confidence, and latency for monitoring.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Social Media', description: 'Brands monitor Twitter, Reddit, and Facebook for sentiment about products and campaigns. Real-time sentiment analysis triggers alerts for PR crises or positive viral moments.' },
      { industry: 'Customer Support', description: 'Sentiment analysis on support tickets prioritizes angry customers for immediate attention. Escalation rules trigger based on sentiment trajectory during a conversation.' },
      { industry: 'Finance', description: 'Hedge funds analyze sentiment in earnings calls, news articles, and SEC filings to inform trading strategies. Sentiment signals correlate with stock price movements.' },
    ],
    caseStudy: {
      problem: 'A large e-commerce company received 50K+ product reviews daily but could not manually identify systemic quality issues. Angry reviews about the same problem were scattered across products and went unnoticed for weeks.',
      solution: 'They fine-tuned a BERT model on their 2M review dataset (1-5 star ratings mapped to positive/negative/neutral). Reviews were analyzed in real-time, and negative sentiment triggers were aggregated by product category, seller, and shipping warehouse. Alerts fired when negative sentiment exceeded 3x the baseline.',
      results: 'Defect detection time dropped from 2 weeks to 2 hours. Product returns decreased 22% through faster issue remediation. The model identified 3 counterfeit seller rings through clustered negative sentiment patterns.',
    },
    bestPractices: [
      'Use domain-specific pre-trained models when available (BioBERT for medical, FinBERT for finance)',
      'Set max_length based on your text distribution — don\'t pad all texts to 512 unnecessarily',
      'Calibrate model probabilities — BERT tends to be overconfident, especially on OOD data',
      'Export to ONNX with INT8 quantization for production to reduce cost and latency',
      'Monitor sentiment distribution drift — a sudden shift may indicate data quality issues',
      'Handle edge cases: empty text, very long text, emoji-heavy text, code-switching',
    ],
    tools: ['Hugging Face Transformers', 'Hugging Face Datasets', 'ONNX / ONNX Runtime', 'PyTorch', 'FastAPI', 'Docker', 'AWS SageMaker / GCP Vertex AI'],
    jobRoles: ['NLP Engineer', 'Machine Learning Engineer', 'Data Scientist', 'MLOps Engineer'],
    furtherReading: [
      'Hugging Face Course: Fine-tuning a Pretrained Model',
      'BERT: Pre-training of Deep Bidirectional Transformers (Devlin et al., 2019)',
      'ONNX Runtime Documentation: BERT Optimization',
      'Training BERT from Scratch for Sentiment Analysis',
    ],
  },
  quiz: [
    {
      id: 'p21-sa-1', type: 'mcq',
      question: 'Why is the learning rate for BERT fine-tuning typically very small (e.g., 2e-5)?',
      options: [
        'To prevent catastrophic forgetting of pre-trained knowledge',
        'Because BERT uses a special optimizer that requires small learning rates',
        'To reduce GPU memory usage during training',
        'Because the dataset is always very large',
      ],
      correctAnswer: 'To prevent catastrophic forgetting of pre-trained knowledge',
      explanation: 'BERT\'s pre-trained weights contain general language knowledge. A large learning rate would quickly overwrite this knowledge with task-specific patterns. Small learning rates ensure the model adapts gradually without forgetting what it already knows.',
    },
    {
      id: 'p21-sa-2', type: 'code',
      question: 'What does the tokenizer return in the following code?',
      code: `from transformers import BertTokenizer
tokenizer = BertTokenizer.from_pretrained("bert-base-uncased")
encoding = tokenizer("I love this movie!", padding="max_length", truncation=True, max_length=10, return_tensors="pt")
print(list(encoding.keys()))`,
      options: [
        "['input_ids']",
        "['input_ids', 'attention_mask']",
        "['input_ids', 'attention_mask', 'token_type_ids']",
        "['input_ids', 'attention_mask', 'labels']",
      ],
      correctAnswer: "['input_ids', 'attention_mask', 'token_type_ids']",
      explanation: 'BERT tokenizer returns input_ids (token indices), attention_mask (which tokens are real vs padding), and token_type_ids (segment IDs for sentence pairs). token_type_ids is returned even for single sequences.',
    },
    {
      id: 'p21-sa-3', type: 'truefalse',
      question: 'ONNX Runtime with INT8 quantization typically runs inference 4x faster than PyTorch with minimal accuracy loss (< 1%).',
      correctAnswer: 'True',
      explanation: 'INT8 quantization reduces model size and speeds up matrix multiplication 2-4x on modern CPUs with VNNI instructions. Accuracy loss is typically 0.5-1% for classification tasks when using quantization-aware training or dynamic quantization.',
    },
    {
      id: 'p21-sa-4', type: 'fillblank',
      question: 'In BERT tokenization, the ___ token is added at the beginning of every input sequence and its final hidden state is used for classification.',
      correctAnswer: '[CLS]',
      explanation: 'The [CLS] token is prepended to every input. BERT is pre-trained such that the [CLS] output embedding aggregates the entire sequence\'s representation, making it ideal for feeding into the classification head.',
    },
    {
      id: 'p21-sa-5', type: 'match',
      question: 'Match each sentiment analysis challenge with BERT\'s advantage:',
      pairs: [
        { left: 'Negation handling ("not bad")', right: 'Bidirectional context captures the full phrase' },
        { left: 'Sarcasm detection', right: 'Still challenging but better with contextual embeddings' },
        { left: 'Domain-specific terms', right: 'Can be fine-tuned on domain data' },
        { left: 'Mixed sentiment reviews', right: 'Confidence score reflects ambiguity' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'BERT\'s bidirectional attention captures negation correctly (unlike bag-of-words models). Sarcasm remains difficult even for BERT. Domain fine-tuning adapts BERT to specialized vocabulary. The softmax confidence naturally conveys uncertainty on mixed inputs.',
    },
  ],
}))

export {}
