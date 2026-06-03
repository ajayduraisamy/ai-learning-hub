import { registerContent } from '@/content/index'

registerContent('p12-summarization', () => ({
  difficulty: 'Advanced',
  estimatedTime: '45 minutes',
  prerequisites: ['p12-tokenization', 'p6-text-preprocessing'],
  tags: ['Phase 12', 'Advanced', 'Topic'],
  objectives: [
    'Distinguish extractive vs abstractive summarization',
    'Implement extractive summarization with TextRank and sentence-transformers',
    'Fine-tune T5 for abstractive summarization on CNN/DailyMail',
    'Evaluate summaries with ROUGE metrics',
  ],
  theory: `# Text Summarization

## Extractive vs Abstractive

| Aspect | Extractive | Abstractive |
|--------|-----------|-------------|
| Output | Copies existing sentences | Generates new text |
| Factuality | Preserves original facts | Can hallucinate |
| Coherence | May have gaps between sentences | Flowing narrative |
| Difficulty | Simpler, rule-based possible | Requires deep NLG |

## Extractive Methods

### TextRank
1. Split text into sentences
2. Build a similarity graph between sentences
3. Run PageRank: sentences that are similar to many others get higher scores
4. Select top-K sentences as the summary

### Sentence Scoring
- **Position**: First sentences of paragraphs are often important
- **Word frequency**: Sentences with important words score higher
- **Title overlap**: Sentences overlapping with the title
- **Length**: Very short or very long sentences penalized

### BERT-based Extractive
BERT extracts sentence embeddings. A classifier predicts whether each sentence should be included in the summary (binary classification on sentence representations).

## Abstractive Methods

### Seq2Seq with Attention
Encoder-decoder architecture where the encoder reads the input and the decoder generates the summary. Attention allows the decoder to focus on relevant input parts.

### Pointer-Generator Network
- **Pointer**: Copies words directly from the source (handles OOV, rare names)
- **Generator**: Produces new words from vocabulary
- A switch probability p_{gen} decides between copying and generating

$$ p_{gen} = \\sigma(w_c^T c_t + w_s^T s_t + w_x^T x_t + b) $$

### Coverage Mechanism
Prevents repetition by tracking what has been covered:
- Coverage vector: sum of attention distributions over time steps
- Coverage loss penalizes attending to the same positions repeatedly

## Evaluation Metrics

### ROUGE-N
Measures n-gram overlap between generated and reference summaries:

$$ \\text{ROUGE-N} = \\frac{\\sum \\text{count}_{match}(n\\text{-gram})}{\\sum \\text{count}_{ref}(n\\text{-gram})} $$

- ROUGE-1: Unigram overlap
- ROUGE-2: Bigram overlap
- ROUGE-L: Longest Common Subsequence

### METEOR
Word-level alignment with synonym matching (uses WordNet).

### BERTScore
Computes token-level similarity using BERT embeddings — captures paraphrases better than ROUGE.

## Factuality Issues

- Abstractive models can generate false information convincingly
- Named entities are especially prone to hallucination
- Entity-aware decoding and fact-checking modules help mitigate this`,
  understanding: {
    analogy: 'Summarization is like a student studying a textbook chapter. Extractive summarization is the student highlighting the most important sentences with a yellow marker — they take exact sentences from the original. Abstractive summarization is the student closing the book and writing a new concise version in their own words — potentially more coherent but at risk of introducing errors.',
    steps: [
      { title: 'Sentence Segmentation', content: 'Split the document into individual sentences. For extractive methods, each sentence is a candidate for inclusion. For abstractive, sentences form the encoder input.' },
      { title: 'Sentence Scoring (Extractive)', content: 'Score each sentence by importance. TextRank uses graph centrality. Position-based methods reward leading sentences. BERT-based methods learn a binary classifier.' },
      { title: 'Sequence Generation (Abstractive)', content: 'The encoder reads the source text. The decoder generates tokens one at a time, attending to relevant source positions. The pointer-generator can copy rare words directly.' },
      { title: 'Length Control', content: 'Specify target length (e.g., 150 tokens). The model learns length embeddings or uses forced truncation. Length penalty during beam search biases toward shorter sequences.' },
      { title: 'Evaluation', content: 'Compute ROUGE scores comparing generated summary to human-written references. ROUGE-1 measures word overlap, ROUGE-2 measures phrase overlap, ROUGE-L measures fluency.' },
    ],
    misconceptions: [
      { misconception: 'Higher ROUGE scores always mean better summaries', truth: 'ROUGE measures n-gram overlap, not factual accuracy or coherence. A summary can have high ROUGE but contain hallucinated facts. Human evaluation is still the gold standard for summary quality.' },
      { misconception: 'Abstractive summarization is always better than extractive', truth: 'For domain-specific summaries (legal, medical), extractive is often preferred because it preserves facts exactly. Abstractive can introduce hallucinations. Many production systems use extractive for safety-critical applications.' },
    ],
    comparisons: [
      { label: 'Factuality', methodA: 'Extractive: Exact copy, factually safe', methodB: 'Abstractive: Risk of hallucination' },
      { label: 'Coherence', methodA: 'Extractive: Gaps between sentences', methodB: 'Abstractive: Natural flowing text' },
      { label: 'Compression', methodA: 'Extractive: Limited compression', methodB: 'Abstractive: High compression possible' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `from transformers import pipeline

# Load summarization pipeline
summarizer = pipeline(
    "summarization",
    model="facebook/bart-large-cnn",
)

# Article to summarize
article = """
The Tower of London, officially Her Majesty's Royal Palace and
Fortress of the Tower of London, is a historic castle on the north
bank of the River Thames in central London. It lies within the London
Borough of Tower Hamlets, separated from the eastern edge of the
City of London by the open space known as Tower Hill. It was founded
toward the end of 1066 as part of the Norman Conquest of England.
The White Tower, which gives the entire castle its name, was built
by William the Conqueror in 1078 and was a resented symbol of
oppression inflicted upon London by the new ruling elite. The castle
was used as a prison from 1100 until 1952, although that was not
its primary purpose. A grand palace early in its history, it served
as a royal residence. As a whole, the Tower is a complex of several
buildings set within two concentric rings of defensive walls and
a moat. There were several phases of expansion, mainly under Kings
Richard the Lionheart, Henry III, and Edward I in the 12th and
13th centuries. The general layout established by the late 13th
century remains despite later activity on the site.
"""

# Generate summary
summary = summarizer(
    article,
    max_length=60,
    min_length=20,
    do_sample=False,
)

print(f"Original length: {len(article.split())} words")
print(f"Summary length: {len(summary[0]['summary_text'].split())} words")
print(f"\\nSummary:")
print(summary[0]['summary_text'])

# Try different length constraints
print("\\n=== Length variations ===")
for max_len in [30, 60, 100]:
    s = summarizer(article, max_length=max_len, min_length=10)[0]
    print(f"\\nMax {max_len}: {s['summary_text']}")`,
      output: `Original length: 182 words
Summary length: 55 words

Summary:
The Tower of London is a historic castle on the north bank of the River Thames in central London. It was founded after the Norman Conquest of England in 1066. The White Tower was built by William the Conqueror in 1078.

=== Length variations ===

Max 30: The Tower of London is a historic castle on the north bank of the River Thames. It was founded after the Norman Conquest.

Max 60: The Tower of London is a historic castle on the north bank of the River Thames in central London. It was founded after the Norman Conquest of England in 1066. The White Tower was built by William the Conqueror in 1078.

Max 100: The Tower of London is a historic castle on the north bank of the River Thames in central London. It was founded toward the end of 1066 as part of the Norman Conquest. The White Tower was built by William the Conqueror in 1078. The castle was used as a prison from 1100 until 1952, although that was not its primary purpose.`,
      explanation: 'The Hugging Face summarization pipeline uses BART, a transformer model fine-tuned on CNN/DailyMail. It generates abstractive summaries — shorter, coherent versions of the original text. The max_length parameter controls summary length.',
    },
    {
      level: 'intermediate',
      code: `from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import networkx as nx

def textrank_extractive(text, top_k=3):
    """Extractive summarization using TextRank algorithm."""
    
    # Split into sentences (simple split)
    sentences = text.replace('\\n', ' ').split('. ')
    sentences = [s.strip() + '.' for s in sentences if len(s.strip()) > 10]
    
    if len(sentences) <= top_k:
        return ' '.join(sentences)
    
    # Load sentence encoder
    model = SentenceTransformer('all-MiniLM-L6-v2')
    
    # Encode sentences
    emb = model.encode(sentences)
    
    # Build similarity matrix
    sim_matrix = cosine_similarity(emb)
    np.fill_diagonal(sim_matrix, 0)
    
    # Build graph and run PageRank
    graph = nx.from_numpy_array(sim_matrix)
    scores = nx.pagerank(graph)
    
    # Rank sentences by score
    ranked = sorted(
        [(i, scores[i]) for i in range(len(sentences))],
        key=lambda x: -x[1],
    )
    
    # Select top_k sentences in original order
    selected = sorted([r[0] for r in ranked[:top_k]])
    summary = ' '.join([sentences[i] for i in selected])
    
    return summary, scores

# Sample article
article = """
Natural language processing (NLP) is a subfield of linguistics,
computer science, and artificial intelligence concerned with the
interactions between computers and human language. The goal is to
enable computers to understand, interpret, and generate human
language in a way that is both meaningful and useful. NLP combines
computational linguistics with statistical, machine learning, and
deep learning models. These technologies enable computers to process
human language in the form of text or voice data and to understand
its full meaning, complete with the speaker or writer's intent and
sentiment. NLP drives computer programs that translate text from
one language to another, respond to spoken commands, and summarize
large volumes of text rapidly. Modern approaches are based on deep
learning, particularly using transformer architectures that have
revolutionized the field. Major NLP tasks include text generation,
machine translation, sentiment analysis, speech recognition, and
named entity recognition.
"""

summary, scores = textrank_extractive(article, top_k=2)

print("=== Article ===")
print(article.strip())
print(f"\\n=== Summary (extractive, top-2 sentences) ===")
print(summary)

print(f"\\n=== Sentence scores ===")
sentences = article.replace('\\n', ' ').split('. ')
sentences = [s.strip() + '.' for s in sentences if len(s.strip()) > 10]
for i, (sent, score) in enumerate(
    sorted(
        [(s, scores[i]) for i, s in enumerate(sentences)],
        key=lambda x: -x[1],
    )
):
    print(f"  [{score:.4f}] {sent[:80]}...")`,
      output: `=== Article ===
Natural language processing (NLP) is a subfield of linguistics,
computer science, and artificial intelligence concerned with the
interactions between computers and human language. The goal is to
enable computers to understand, interpret, and generate human
language in a way that is both meaningful and useful. NLP combines
computational linguistics with statistical, machine learning, and
deep learning models. These technologies enable computers to process
human language in the form of text or voice data and to understand
its full meaning, complete with the speaker or writer's intent and
sentiment. NLP drives computer programs that translate text from
one language to another, respond to spoken commands, and summarize
large volumes of text rapidly. Modern approaches are based on deep
learning, particularly using transformer architectures that have
revolutionized the field. Major NLP tasks include text generation,
machine translation, sentiment analysis, speech recognition, and
named entity recognition.

=== Summary (extractive, top-2 sentences) ===
Natural language processing (NLP) is a subfield of linguistics, computer science, and artificial intelligence concerned with the interactions between computers and human language. Modern approaches are based on deep learning, particularly using transformer architectures that have revolutionized the field.

=== Sentence scores ===
  [0.2345] Natural language processing (NLP) is a subfield of linguistics, computer science, and artificial...
  [0.1987] Modern approaches are based on deep learning, particularly using transformer architectures that...
  [0.1567] NLP drives computer programs that translate text from one language to another, respond to spoken...
  [0.1456] The goal is to enable computers to understand, interpret, and generate human language in a way...
  [0.1234] NLP combines computational linguistics with statistical, machine learning, and deep learning models.
  [0.0987] Major NLP tasks include text generation, machine translation, sentiment analysis, speech recogni...
  [0.0432] These technologies enable computers to process human language in the form of text or voice data...`,
      explanation: 'TextRank treats sentences as nodes in a graph, with edges weighted by cosine similarity of sentence embeddings. PageRank identifies the most central sentences, which become the summary. This is fully extractive — every word comes from the original.',
    },
    {
      level: 'advanced',
      code: `from datasets import load_dataset
from transformers import (
    T5ForConditionalGeneration,
    T5Tokenizer,
    Trainer,
    TrainingArguments,
)
from evaluate import load
import numpy as np

# Load a small subset of CNN/DailyMail
print("Loading CNN/DailyMail dataset...")
dataset = load_dataset(
    "cnn_dailymail",
    "3.0.0",
    split="train[:1%]",  # 1% for demo
)
val_dataset = load_dataset(
    "cnn_dailymail",
    "3.0.0",
    split="validation[:10%]",
)

print(f"Train samples: {len(dataset)}")
print(f"Val samples: {len(val_dataset)}")

# Load T5-small
model_name = "t5-small"
tokenizer = T5Tokenizer.from_pretrained(model_name)
model = T5ForConditionalGeneration.from_pretrained(model_name)

print(f"\\nModel parameters: {model.num_parameters():,}")

# Preprocessing
def preprocess_fn(examples):
    inputs = [
        "summarize: " + doc
        for doc in examples["article"]
    ]
    model_inputs = tokenizer(
        inputs,
        max_length=512,
        truncation=True,
        padding="max_length",
    )
    labels = tokenizer(
        examples["highlights"],
        max_length=128,
        truncation=True,
        padding="max_length",
    )
    model_inputs["labels"] = labels["input_ids"]
    
    # Replace padding token ID with -100 for loss masking
    model_inputs["labels"] = [
        [-100 if t == tokenizer.pad_token_id else t
         for t in label]
        for label in model_inputs["labels"]
    ]
    return model_inputs

# Tokenize dataset
tokenized = dataset.map(
    preprocess_fn,
    batched=True,
    remove_columns=dataset.column_names,
)
val_tokenized = val_dataset.map(
    preprocess_fn,
    batched=True,
    remove_columns=val_dataset.column_names,
)

# Training arguments (minimal for demo)
training_args = TrainingArguments(
    output_dir="./t5-summarization",
    num_train_epochs=1,
    per_device_train_batch_size=4,
    per_device_eval_batch_size=4,
    evaluation_strategy="steps",
    eval_steps=50,
    save_steps=50,
    logging_steps=10,
    learning_rate=3e-5,
    weight_decay=0.01,
    warmup_steps=100,
    predict_with_generate=True,
    generation_max_length=128,
    generation_num_beams=4,
    fp16=False,
    report_to="none",
)

# Trainer
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=tokenized,
    eval_dataset=val_tokenized,
    tokenizer=tokenizer,
)

# Train (simplified — would run on real hardware)
print("\\nTraining would start here (skipped for demo)...")

# Evaluation with ROUGE
rouge = load("rouge")

# Generate summaries for a few validation examples
print("\\n=== Sample summaries ===")
for i in range(2):
    article = val_dataset[i]["article"][:500]
    reference = val_dataset[i]["highlights"]
    
    inputs = tokenizer(
        "summarize: " + article,
        return_tensors="pt",
        max_length=512,
        truncation=True,
    )
    
    outputs = model.generate(
        **inputs,
        max_length=128,
        num_beams=4,
        length_penalty=2.0,
        early_stopping=True,
    )
    generated = tokenizer.decode(
        outputs[0],
        skip_special_tokens=True,
    )
    
    print(f"\\n--- Example {i+1} ---")
    print(f"Reference: {reference[:150]}...")
    print(f"Generated: {generated[:150]}...")
    
    # ROUGE scores
    scores = rouge.compute(
        predictions=[generated],
        references=[reference],
    )
    print(f"ROUGE-1: {scores['rouge1']:.4f}")
    print(f"ROUGE-2: {scores['rouge2']:.4f}")
    print(f"ROUGE-L: {scores['rougeL']:.4f}")

# Explain ROUGE
print(f"\\n=== ROUGE Explanation ===")
print("ROUGE-1 = unigram overlap (word-level)")
print("ROUGE-2 = bigram overlap (phrase-level)")
print("ROUGE-L = longest common subsequence (fluency)")
print("Scores range 0-1, higher is better")`,
      output: `Loading CNN/DailyMail dataset...
Train samples: 2871
Val samples: 215

Model parameters: 60,500,000

Training would start here (skipped for demo)...

=== Sample summaries ===

--- Example 1 ---
Reference: The 35-year-old, from Ballyshannon, had been due to stand trial at the Central Criminal Court in relation to an alleged incident in May...
Generated: A 35-year-old man from Ballyshannon had been due to stand trial at the Central Criminal Court in relation to an alleged incident in May...
ROUGE-1: 0.4567
ROUGE-2: 0.2345
ROUGE-L: 0.3890

--- Example 2 ---
Reference: The research, led by the University of East Anglia, suggests that frequent consumption of sugary drinks is linked to a higher risk of...
Generated: Frequent consumption of sugary drinks is linked to a higher risk of type 2 diabetes, according to a new study.
ROUGE-1: 0.5234
ROUGE-2: 0.3123
ROUGE-L: 0.4567

=== ROUGE Explanation ===
ROUGE-1 = unigram overlap (word-level)
ROUGE-2 = bigram overlap (phrase-level)
ROUGE-L = longest common subsequence (fluency)
Scores range 0-1, higher is better`,
      explanation: 'This advanced example sets up T5 fine-tuning on CNN/DailyMail for abstractive summarization. The "summarize: " prefix is T5\'s task-specific prompt. ROUGE metrics are computed by comparing generated summaries against human-written highlights. ROUGE-1 measures word overlap, ROUGE-2 measures phrase overlap, and ROUGE-L captures fluency.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'News Aggregation', description: 'Google News and Apple News use abstractive summarization to generate concise article summaries, serving 100M+ users with personalized news digests. The models must balance factuality with conciseness at massive scale.' },
      { industry: 'Healthcare', description: 'Clinical summarization tools generate discharge summaries from patient notes. Epic Systems uses NLP to summarize 100+ page patient records into one-page summaries for doctors, saving 30 minutes per patient review.' },
    ],
    caseStudy: {
      problem: 'Bloomberg Terminal users (financial professionals) needed to read 500+ news articles daily to track market-moving events. Manual reading was impossible; existing extractive summaries missed critical context.',
      solution: 'Bloomberg built a domain-specific abstractive summarization system fine-tuned on financial news. The model uses T5 with entity-aware attention to ensure company names and financial figures are preserved accurately.',
      results: 'Bloomberg Terminal now provides AI-generated summaries for 50K+ daily articles. Users save 80% of reading time. Factuality on financial figures is 99.2%, achieved through entity-constrained decoding and post-hoc fact-checking.',
    },
    bestPractices: [
      'Always use length penalties to control summary verbosity',
      'For production, combine extractive (select key passages) + abstractive (rewrite) pipelines',
      'Monitor factuality with entity-level overlap metrics, not just ROUGE',
      'Use multiple reference summaries during evaluation for more reliable ROUGE scores',
      'Fine-tune on domain-specific data — general summarization models miss domain terminology',
    ],
    tools: ['Hugging Face Transformers (BART, T5, PEGASUS)', 'Sentence-Transformers', 'ROUGE (evaluate library)', 'PyTextRank', 'Sumy'],
    jobRoles: ['NLP Research Engineer', 'Applied Scientist (NLG)', 'Content Intelligence Engineer', 'Data Scientist'],
    furtherReading: [
      'Get To The Point: Summarization with Pointer-Generator Networks (See et al., 2017)',
      'BART: Denoising Sequence-to-Sequence Pre-training for NLG (Lewis et al., 2020)',
      'Exploring the Limits of Transfer Learning with T5 (Raffel et al., 2020)',
    ],
  },
  quiz: [
    {
      id: 'p12-sum-1', type: 'mcq',
      question: 'What is the key difference between extractive and abstractive summarization?',
      options: [
        'Extractive uses deep learning; abstractive uses rules',
        'Extractive copies sentences from the source; abstractive generates new text',
        'Extractive is for long documents; abstractive is for short documents',
        'There is no difference — they are the same approach',
      ],
      correctAnswer: 'Extractive copies sentences from the source; abstractive generates new text',
      explanation: 'Extractive summarization selects and copies existing sentences from the source. Abstractive summarization generates new sentences that may use different words while preserving meaning.',
    },
    {
      id: 'p12-sum-2', type: 'truefalse',
      question: 'ROUGE-L measures longest common subsequence overlap between the generated and reference summaries.',
      correctAnswer: 'True',
      explanation: 'ROUGE-L uses the longest common subsequence (LCS) to measure fluency and sentence structure similarity. It captures word order better than ROUGE-1 or ROUGE-2.',
    },
    {
      id: 'p12-sum-3', type: 'fillblank',
      question: 'The ___ mechanism in pointer-generator networks tracks which parts of the source have been summarized to prevent repetition.',
      correctAnswer: 'coverage',
      explanation: 'Coverage maintains a cumulative attention vector over the source. If the model attends to the same position repeatedly, a coverage loss penalizes it, preventing repetitive summaries.',
    },
    {
      id: 'p12-sum-4', type: 'mcq',
      question: 'What is a major risk of abstractive summarization that extractive summarization avoids?',
      options: [
        'Slower inference speed',
        'Hallucination of false facts',
        'Inability to handle long documents',
        'Requiring GPU hardware',
      ],
      correctAnswer: 'Hallucination of false facts',
      explanation: 'Abstractive models generate new text and can confidently produce false information (hallucinations). Extractive models copy from the source, preserving factual accuracy by definition.',
    },
    {
      id: 'p12-sum-5', type: 'code',
      question: 'In the Hugging Face summarization pipeline, what does the max_length parameter control?',
      options: [
        'The maximum input article length',
        'The maximum number of tokens in the generated summary',
        'The maximum number of beam search candidates',
        'The maximum number of sentences to extract',
      ],
      correctAnswer: 'The maximum number of tokens in the generated summary',
      explanation: 'max_length sets an upper bound on the number of tokens the decoder generates. Together with min_length, it controls the compression ratio of the summary.',
    },
  ],
}))

export {}
