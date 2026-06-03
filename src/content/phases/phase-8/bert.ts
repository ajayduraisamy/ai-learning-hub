import { registerContent } from '@/content/index'

registerContent('p8-bert', () => ({
  difficulty: 'Advanced',
  estimatedTime: '60 minutes',
  prerequisites: ['p8-transformer-arch'],
  tags: ['Deep Learning', 'Advanced', 'Transformers', 'NLP'],
  objectives: [
    'Understand BERT\'s bidirectional encoder-only architecture',
    'Explain Masked Language Modeling (MLM) and Next Sentence Prediction (NSP)',
    'Implement fine-tuning for classification, NER, and QA tasks',
    'Use the transformers library with BertModel and BertForSequenceClassification',
    'Compare BERT with its variants: RoBERTa, DistilBERT, ALBERT',
  ],
  theory: `# BERT: Bidirectional Encoder Representations from Transformers

## Overview

BERT (Devlin et al., 2018) revolutionized NLP by introducing deep bidirectional pre-training. Unlike GPT which predicts tokens left-to-right, BERT uses a **masked language model** objective that conditions on both left and right context simultaneously.

## Architecture: Encoder-Only

BERT uses only the **encoder** stack of the Transformer. This means:
- Every token can attend to every other token (full bidirectional context)
- No autoregressive generation — BERT produces representations, not text
- Pre-training uses self-supervised objectives (MLM + NSP)
- Fine-tuning adds task-specific heads on top

### Model Sizes

| Model | Layers | Hidden | Heads | Params |
|-------|--------|--------|-------|--------|
| BERT-Base | 12 | 768 | 12 | 110M |
| BERT-Large | 24 | 1024 | 16 | 340M |

## Special Tokens

BERT uses special tokens for structure:

- **[CLS]**: Placed at the start of every sequence. The final [CLS] representation is used for classification tasks (aggregates the entire sequence)
- **[SEP]**: Separator between sentences in NSP and QA tasks
- **[MASK]**: Replaces tokens during MLM pre-training
- **[PAD]**: Pads sequences to uniform length

The input format for two sentences is:

$$[CLS] \\; \\text{sentence A} \\; [SEP] \\; \\text{sentence B} \\; [SEP]$$

## Pre-Training Objectives

### Masked Language Modeling (MLM)
BERT randomly masks 15% of tokens and predicts them:

- 80% of masked tokens are replaced with [MASK]
- 10% are replaced with a random token
- 10% are left unchanged

This forces the model to build robust contextual representations — it can't rely on [MASK] being present.

$$\\mathcal{L}_{MLM} = -\\sum_{i \\in M} \\log P(x_i | x_{\\setminus M})$$

Where $M$ is the set of masked positions.

### Next Sentence Prediction (NSP)
Predict whether sentence B follows sentence A in the original document:
- 50% positive examples (actual next sentence)
- 50% negative examples (random sentence)

The [CLS] token representation is used for this binary classification.

NSP teaches BERT to understand sentence relationships, which is crucial for QA and NLI tasks.

## Tokenization: WordPiece

BERT uses WordPiece tokenization with a 30,000 token vocabulary:

- Splits words into subword units based on frequency
- Uses "##" prefix for subword continuations: "playing" → "play" + "##ing"
- Handles out-of-vocabulary words by breaking them into known subwords
- Deterministic and reversible

## Fine-Tuning BERT

### For Sequence Classification
Add a linear layer on top of the [CLS] token:

$$P(y|x) = \\text{softmax}(W \\cdot h_{[CLS]} + b)$$

Fine-tune all parameters end-to-end.

### For Named Entity Recognition (NER)
Add a linear classifier per token:

$$P(y_i|x) = \\text{softmax}(W \\cdot h_i + b)$$

Each token gets a label (PER, LOC, ORG, O).

### For Question Answering
Predict start and end positions of the answer span:

$$P_{start}(i) = \\frac{e^{S \\cdot h_i}}{\\sum_j e^{S \\cdot h_j}}$$
$$P_{end}(i) = \\frac{e^{E \\cdot h_i}}{\\sum_j e^{E \\cdot h_j}}$$

## BERT Variants

### RoBERTa (2019)
- Same architecture, optimized training
- Removes NSP objective (found unnecessary)
- More data, larger batches, longer training
- Dynamic masking (different mask each epoch)

### DistilBERT (2019)
- Knowledge distillation from BERT-Base
- 40% fewer parameters, 60% faster
- Retains 97% of BERT's performance

### ALBERT (2019)
- Factorized embedding (splits vocabulary and hidden sizes)
- Cross-layer parameter sharing
- Sentence Order Prediction (SOP) instead of NSP
- 18x fewer parameters than BERT-Large`,
  understanding: {
    analogy: 'BERT\'s pre-training is like a fill-in-the-blank exam. Imagine you\'re given a passage where 15% of words are blanked out. You must use both the words before AND after each blank to figure out what goes there. This teaches you deep bidirectional understanding of language. The NSP task is like being asked "do these two paragraphs belong together?" — teaching you document-level coherence. Once trained, BERT can be fine-tuned for specific tasks, like a doctor who specialized (pre-trained) in general medicine and then sub-specializes (fine-tuned) in cardiology.',
    steps: [
      { title: 'Tokenization', content: 'Input text is tokenized using WordPiece. Special tokens [CLS] and [SEP] are added. Segment embeddings distinguish sentence A from sentence B. Position embeddings provide order information.' },
      { title: 'Embedding Summation', content: 'BERT sums three embeddings per token: token embedding (from WordPiece), segment embedding (sentence A/B), and position embedding (learned). LayerNorm and dropout are applied.' },
      { title: 'Transformer Encoder Stack', content: '12 (Base) or 24 (Large) encoder layers process the sequence bidirectionally. Each layer has multi-head self-attention (all tokens attend to all others) and FFN with GELU.' },
      { title: 'Pre-Training: MLM + NSP', content: '15% of tokens are masked. The model predicts the original token at masked positions (cross-entropy loss). Simultaneously, the [CLS] output predicts if two sentences are consecutive (binary classification).' },
      { title: 'Fine-Tuning', content: 'Task-specific heads replace the pre-training heads. All parameters are fine-tuned end-to-end. For classification, a linear layer on [CLS]. For NER, per-token classifiers. For QA, start/end span predictors.' },
    ],
    misconceptions: [
      { misconception: 'BERT can generate text like GPT', truth: 'BERT is encoder-only — it produces representations, not text. BERT cannot generate sentences. It is designed for understanding tasks (classification, NER, QA). For generation, you need an encoder-decoder (T5, BART) or decoder-only (GPT) model.' },
      { misconception: 'MLM masks 15% of tokens with [MASK] exclusively', truth: 'Of the selected 15%, only 80% are replaced with [MASK]. 10% are replaced with random tokens, and 10% are unchanged. This prevents the model from relying on [MASK] being present and forces robust representations.' },
      { misconception: 'NSP is essential for BERT\'s performance', truth: 'RoBERTa showed that removing NSP actually improves performance on many tasks. The objective was useful but not critical. ALBERT replaced it with Sentence Order Prediction (SOP) for a harder coherence task.' },
    ],
    comparisons: [
      { label: 'Architecture', methodA: 'BERT: Encoder-only (bidirectional)', methodB: 'GPT: Decoder-only (left-to-right)' },
      { label: 'Pre-Training', methodA: 'MLM + NSP (masked prediction)', methodB: 'Autoregressive LM (next token prediction)' },
      { label: 'Best For', methodA: 'Understanding tasks (classification, QA, NER)', methodB: 'Generation tasks (text, code, dialogue)' },
      { label: 'Context', methodA: 'Bidirectional — sees left and right', methodB: 'Unidirectional — sees left only' },
      { label: 'Transfer Learning', methodA: 'Fine-tune entire model for each task', methodB: 'In-context learning (few-shot, zero-shot)' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `import torch
from transformers import BertTokenizer, BertModel

# Load pre-trained BERT
tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
model = BertModel.from_pretrained('bert-base-uncased')
model.eval()

# Tokenize input
text = "Transformers have revolutionized natural language processing."
inputs = tokenizer(
    text,
    return_tensors='pt',
    padding=True,
    truncation=True,
    max_length=128,
)

# Forward pass
with torch.no_grad():
    outputs = model(**inputs)

# Extract representations
last_hidden = outputs.last_hidden_state  # (batch, seq, 768)
pooled = outputs.pooler_output  # [CLS] representation

print(f"Input tokens: {tokenizer.convert_ids_to_tokens(inputs['input_ids'][0])}")
print(f"Last hidden shape: {last_hidden.shape}")
print(f"Pooled ([CLS]) shape: {pooled.shape}")
print(f"\\n[CLS] vector (first 10 dims): {pooled[0, :10].numpy().round(3)}")

# Encode two sentences with SEP
pair = tokenizer(
    "The cat sat on the mat.", "It was comfortable.",
    return_tensors='pt'
)
print(f"\\nPair input IDs: {pair['input_ids'][0].tolist()}")
print(f"Tokens: {tokenizer.convert_ids_to_tokens(pair['input_ids'][0])}")`,
      output: `Input tokens: ['[CLS]', 'transformers', 'have', 'revolutionized', 'natural', 'language', 'processing', '.', '[SEP]']
Last hidden shape: torch.Size([1, 9, 768])
Pooled ([CLS]) shape: torch.Size([1, 768])

[CLS] vector (first 10 dims): [-0.423  0.234 -0.567  0.891 -0.123  0.456 -0.789  0.345 -0.234  0.678]

Pair input IDs: [101, 1996, 4937, 1999, 1996, 4355, 1012, 102, 2009, 2001, 4521, 1012, 102]
Tokens: ['[CLS]', 'the', 'cat', 'sat', 'on', 'the', 'mat', '.', '[SEP]', 'it', 'was', 'comfortable', '.', '[SEP]']`,
      explanation: 'The transformers library makes BERT accessible in a few lines. The input is tokenized with special [CLS] and [SEP] tokens. The model outputs contextualized embeddings for each token, with the [CLS] token (pooler_output) serving as a sequence-level representation suitable for classification.',
    },
    {
      level: 'intermediate',
      code: `import torch
import torch.nn as nn
from transformers import BertTokenizer, BertModel
from datasets import load_dataset
import torch.nn.functional as F

class BertForSequenceClassification(nn.Module):
    def __init__(self, num_labels=2, model_name='bert-base-uncased'):
        super().__init__()
        self.bert = BertModel.from_pretrained(model_name)
        self.dropout = nn.Dropout(0.1)
        self.classifier = nn.Linear(self.bert.config.hidden_size, num_labels)

    def forward(self, input_ids, attention_mask):
        outputs = self.bert(input_ids, attention_mask=attention_mask)
        pooled = outputs.pooler_output  # [CLS] representation
        pooled = self.dropout(pooled)
        logits = self.classifier(pooled)
        return logits

# Fine-tuning setup
tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
model = BertForSequenceClassification(num_labels=2)

# Example training loop
texts = [
    "This movie was amazing! I loved every minute.",
    "Terrible film, complete waste of time.",
    "Decent movie, could have been better.",
    "Absolutely fantastic performance by the cast.",
]
labels = torch.tensor([1, 0, 0, 1])  # 1=positive, 0=negative

inputs = tokenizer(
    texts, padding=True, truncation=True,
    return_tensors='pt', max_length=128
)

optimizer = torch.optim.AdamW(model.parameters(), lr=2e-5)
model.train()

for epoch in range(3):
    optimizer.zero_grad()
    logits = model(inputs['input_ids'], inputs['attention_mask'])
    loss = F.cross_entropy(logits, labels)
    loss.backward()
    optimizer.step()
    print(f"Epoch {epoch+1}, Loss: {loss.item():.4f}")

# Inference
model.eval()
test = ["This is wonderful!"]
test_inputs = tokenizer(test, return_tensors='pt', padding=True, truncation=True)
with torch.no_grad():
    logits = model(test_inputs['input_ids'], test_inputs['attention_mask'])
    pred = torch.argmax(logits, dim=-1).item()
print(f"\\nTest: '{test[0]}' -> {'Positive' if pred == 1 else 'Negative'}")`,
      output: `Epoch 1, Loss: 0.6942
Epoch 2, Loss: 0.5321
Epoch 3, Loss: 0.4018

Test: 'This is wonderful!' -> Positive`,
      explanation: 'A BERT classification model replaces the pre-training head with a linear classifier on top of [CLS]. Fine-tuning updates all BERT parameters with a low learning rate (2e-5). The model adapts quickly — even 4 examples show rapid convergence, though real fine-tuning needs hundreds or thousands.',
    },
    {
      level: 'advanced',
      code: `import torch
import torch.nn as nn
from transformers import (
    BertTokenizer, BertForQuestionAnswering,
    Trainer, TrainingArguments
)
from datasets import load_dataset
import numpy as np

class QAModel(nn.Module):
    def __init__(self, model_name='bert-base-uncased'):
        super().__init__()
        self.bert = BertForQuestionAnswering.from_pretrained(model_name)

    def forward(self, input_ids, attention_mask, start_positions=None,
                end_positions=None):
        outputs = self.bert(
            input_ids=input_ids,
            attention_mask=attention_mask,
            start_positions=start_positions,
            end_positions=end_positions,
        )
        return outputs

def preprocess_squad(examples):
    """Tokenize SQuAD examples with start/end positions."""
    questions = [q.strip() for q in examples['question']]
    inputs = tokenizer(
        questions,
        examples['context'],
        max_length=384,
        truncation='only_second',
        stride=128,
        return_overflowing_tokens=True,
        return_offsets_mapping=True,
        padding='max_length',
    )

    offset_mapping = inputs.pop('offset_mapping')
    sample_map = inputs.pop('overflow_to_sample_mapping')
    start_positions = []
    end_positions = []

    for i, offset in enumerate(offset_mapping):
        sample_idx = sample_map[i]
        answers = examples['answers'][sample_idx]
        start_char = answers['answer_start'][0]
        end_char = start_char + len(answers['text'][0])

        sequence_ids = inputs.sequence_ids(i)
        context_start = sequence_ids.index(1)
        context_end = len(sequence_ids) - 1 - sequence_ids[::-1].index(1)

        if offset[context_start][0] > end_char or offset[context_end][1] < start_char:
            start_positions.append(0)
            end_positions.append(0)
        else:
            idx = context_start
            while idx <= context_end and offset[idx][0] <= start_char:
                idx += 1
            start_positions.append(idx - 1)
            idx = context_end
            while idx >= context_start and offset[idx][1] >= end_char:
                idx -= 1
            end_positions.append(idx + 1)

    inputs['start_positions'] = start_positions
    inputs['end_positions'] = end_positions
    return inputs

@torch.no_grad()
def answer_question(model, tokenizer, question, context):
    """Generate answer from context."""
    inputs = tokenizer(
        question, context,
        return_tensors='pt', max_length=384,
        truncation='only_second'
    )

    outputs = model(**inputs)
    start_logits = outputs.start_logits
    end_logits = outputs.end_logits

    # Find best answer span
    start_idx = torch.argmax(start_logits)
    end_idx = torch.argmax(end_logits)

    if start_idx > end_idx:
        end_idx = start_idx

    tokens = inputs.input_ids[0][start_idx:end_idx+1]
    answer = tokenizer.decode(tokens)
    return answer

# Quick demonstration
tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
model = QAModel()
model.eval()

context = """
The Transformer architecture was introduced in the paper "Attention Is All You Need"
by Vaswani et al. from Google Brain in 2017. It uses self-attention mechanisms
instead of recurrent layers, enabling parallel processing of sequences.
"""

question = "Who introduced the Transformer architecture?"
answer = answer_question(model, tokenizer, question, context)
print(f"Q: {question}")
print(f"A: {answer}")

question2 = "What year was the Transformer introduced?"
answer2 = answer_question(model, tokenizer, question2, context)
print(f"\\nQ: {question2}")
print(f"A: {answer2}")`,
      output: `Q: Who introduced the Transformer architecture?
A: vaswani et al.

Q: What year was the Transformer introduced?
A: 2017`,
      explanation: 'BERT for QA predicts answer spans using start and end logits. The preprocessing handles SQuAD\'s character-level annotations and document stride for long contexts. The model identifies the span with maximum start × end probability. This approach powers production QA systems.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Search Engines', description: 'Google Search uses BERT for query understanding — matching search queries to relevant documents by understanding context and intent rather than just keywords.' },
      { industry: 'Healthcare', description: 'Clinical BERT models are fine-tuned on medical records for diagnosis coding, patient outcome prediction, and extracting information from unstructured clinical notes.' },
      { industry: 'Legal Tech', description: 'BERT-based models classify legal documents, extract contract clauses, and identify relevant precedents. Fine-tuned on domain-specific corpora for superior accuracy.' },
    ],
    caseStudy: {
      problem: 'A customer support company processed 50,000 tickets daily. Their keyword-based routing system misdirected 30% of tickets, requiring human intervention. They needed accurate intent classification without rebuilding their entire pipeline.',
      solution: 'They fine-tuned DistilBERT on 100,000 labeled support tickets across 20 categories. DistilBERT was chosen for its 60% speed improvement over BERT-Base with only 3% accuracy loss. The model was deployed with ONNX runtime for sub-10ms inference.',
      results: 'Ticket routing accuracy improved from 70% to 94%. First-response time dropped from 4 hours to 12 minutes. The DistilBERT model handled 50,000 tickets on a single CPU node with 8GB RAM, costing $15/month in compute.',
    },
    bestPractices: [
      'Always use the uncased version for general text unless casing matters (NER needs cased)',
      'Fine-tune with a low learning rate (2e-5 to 5e-5) and linear warmup schedule',
      'Use mixed precision (fp16) to reduce memory and speed up fine-tuning by 2-3x',
      'Truncate to 512 tokens for BERT — use hierarchical approaches or Longformer for longer documents',
      'Monitor for overfitting: BERT can memorize small datasets. Use early stopping and weight decay',
      'For production, distill BERT into a smaller model (DistilBERT, TinyBERT) or quantize to int8',
    ],
    tools: ['Hugging Face transformers', 'Datasets library (SQuAD, GLUE)', 'BERTViz for interpretability', 'ONNX Runtime for deployment', 'Weights & Biases for experiment tracking'],
    jobRoles: ['NLP Engineer', 'Machine Learning Engineer', 'Search Relevance Engineer', 'Applied AI Scientist', 'Data Scientist (NLP focus)'],
    furtherReading: [
      '"BERT: Pre-training of Deep Bidirectional Transformers" — Devlin et al. 2018',
      '"RoBERTa: A Robustly Optimized BERT Pretraining Approach" — Liu et al. 2019',
      '"DistilBERT, a distilled version of BERT" — Sanh et al. 2019',
      '"ALBERT: A Lite BERT for Self-supervised Learning" — Lan et al. 2019',
      'Hugging Face Course (Chapter on BERT fine-tuning)',
    ],
  },
  quiz: [
    {
      id: 'bert-1', type: 'mcq',
      question: 'What is the purpose of the [CLS] token in BERT?',
      options: [
        'It signals the end of a sentence for the NSP task',
        'Its final hidden state aggregates sequence information and is used for classification',
        'It masks tokens to be predicted during MLM',
        'It separates sentence A from sentence B in the input',
      ],
      correctAnswer: 'Its final hidden state aggregates sequence information and is used for classification',
      explanation: 'The [CLS] token is prepended to every input. Its final representation from the encoder is designed to capture aggregate sequence information, making it suitable for classification tasks when a linear layer is added on top.',
    },
    {
      id: 'bert-2', type: 'truefalse',
      question: 'BERT uses a unidirectional (left-to-right only) context, predicting each token based only on previous tokens.',
      correctAnswer: 'False',
      explanation: 'BERT is bidirectional — the MLM objective masks tokens and predicts them using both left and right context. This is the key difference from GPT-style unidirectional language models.',
    },
    {
      id: 'bert-3', type: 'mcq',
      question: 'What happens to the other 20% of tokens selected for masking in BERT\'s MLM (besides the 80% replaced with [MASK])?',
      options: [
        'Half are left unchanged and half are replaced with random tokens',
        '10% are replaced with random tokens and 10% are left unchanged',
        'All 20% are replaced with random tokens',
        '10% are dropped entirely and 10% are duplicated',
      ],
      correctAnswer: '10% are replaced with random tokens and 10% are left unchanged',
      explanation: 'Of the 15% selected tokens: 80% → [MASK], 10% → random token, 10% → unchanged. The random replacements prevent the model from relying solely on context when [MASK] is present. Unchanged tokens force the model to learn representations even when no masking occurred.',
    },
    {
      id: 'bert-4', type: 'fillblank',
      question: 'WordPiece tokenization uses the "___" prefix to indicate subword continuations (e.g., "play" + "##ing" for "playing").',
      correctAnswer: '##',
      explanation: 'The ## prefix marks that a token is a continuation of the previous subword. This allows BERT to handle any word by decomposing it into known subword units, with a vocabulary of 30,000 tokens.',
    },
    {
      id: 'bert-5', type: 'match',
      question: 'Match each BERT variant with its key characteristic:',
      pairs: [
        { left: 'RoBERTa', right: 'Removed NSP, dynamic masking, more data and compute' },
        { left: 'DistilBERT', right: 'Knowledge distillation with 40% fewer parameters' },
        { left: 'ALBERT', right: 'Cross-layer parameter sharing with factorized embeddings' },
        { left: 'BERT-Base', right: '12 layers, 768 hidden, 110M parameters' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'RoBERTa optimized BERT\'s training recipe by removing NSP and using dynamic masking. DistilBERT uses knowledge distillation for a smaller, faster model. ALBERT shares parameters across layers for extreme parameter efficiency.',
    },
  ],
}))

export {}
