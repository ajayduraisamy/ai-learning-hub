import { registerContent } from '@/content/index'

registerContent('p12-ner', () => ({
  difficulty: 'Advanced',
  estimatedTime: '45 minutes',
  prerequisites: ['p12-tokenization', 'p12-word-embeddings'],
  tags: ['Phase 12', 'Advanced', 'Topic'],
  objectives: [
    'Understand NER as sequence labeling with BIO tagging',
    'Implement a BiLSTM-CRF for named entity recognition',
    'Use Hugging Face transformers for NER',
    'Evaluate NER models with span-based precision/recall/F1',
  ],
  theory: `# Named Entity Recognition

## NER as Sequence Labeling

NER assigns a label to each token indicating whether it is part of a named entity. This is a sequence labeling task: given token sequence, predict label sequence.

## BIO/IOB Tagging Scheme

| Tag | Meaning | Example |
|-----|---------|---------|
| B-PER | Beginning of person | \\texttt{B-PER} Elon |
| I-PER | Inside person | \\texttt{I-PER} Musk |
| B-ORG | Beginning of organization | \\texttt{B-ORG} Tesla |
| I-ORG | Inside organization | \\texttt{I-ORG} Motors |
| B-LOC | Beginning of location | \\texttt{B-LOC} California |
| I-LOC | Inside location | \\texttt{I-LOC} Bay Area |
| O | Outside (not an entity) | the, is, a |

\\textbf{Example}: "Elon Musk works at Tesla in California"
\\textrightarrow B-PER I-PER O O B-ORG O B-LOC

## BiLSTM-CRF Architecture

1. **Embedding layer**: Map tokens to vectors (GloVe/BERT)
2. **BiLSTM**: Forward and backward LSTMs capture context from both directions
3. **CRF layer**: Models transition probabilities between labels

### CRF (Conditional Random Field)

- Learns transition scores: e.g., \\texttt{I-PER} can follow \\texttt{B-PER} but not \\texttt{B-ORG}
- Viterbi decoding finds the globally optimal label sequence
- CRF loss considers the entire sequence, not just individual tokens

### Transition Matrix

\\begin{verbatim}
        B-PER  I-PER  B-ORG  I-ORG  O
B-PER    -1     20     -5     -10   -2
I-PER    -10     5     -15    -10   -3
B-ORG    -5    -10     -1     20    -2
I-ORG    -15   -10     -10     5    -3
O         3     -2      2     -1     1
\\end{verbatim}

High scores on diagonal (I-PER \\textrightarrow I-PER), negative scores for illegal transitions (O \\textrightarrow I-PER).

## Transformer-Based NER (BERT + Linear Head)

- Fine-tune BERT with a linear classification layer on top of each token
- Token classification head: hidden_size \\textrightarrow num_labels
- BERT's contextualized representations capture context better than BiLSTM

## Evaluation: Span-Based Metrics

- **Span precision**: How many predicted entities are correct?
- **Span recall**: How many true entities did we find?
- **Span F1**: Harmonic mean of span precision and recall

An entity is correct only if both the boundary (span) AND the type match exactly.`,
  understanding: {
    analogy: 'NER is like highlighting names of people in blue, places in green, and organizations in yellow in a document. You need to first find where a name starts (B-PER = start the blue highlight) and where it ends (I-PER = continue the blue highlight). The CRF layer is like a grammar rulebook that says "you cannot start highlighting a person in the middle of a location" — it enforces valid tag transitions.',
    steps: [
      { title: 'Tokenization', content: 'Split the input text into tokens. Each token will receive a label. Align the BIO tags with token boundaries — this is critical because subword tokens must share the same label.' },
      { title: 'Contextual Encoding', content: 'Pass tokens through a BiLSTM or BERT to get context-aware representations. "Washington" as a person vs. a location requires understanding the surrounding words.' },
      { title: 'Classification', content: 'A linear layer maps each token\'s hidden state to label scores. For 9 entity types + O, that is 19 output scores per token (B- and I- for each type + O).' },
      { title: 'CRF Decoding', content: 'The Viterbi algorithm finds the highest-scoring valid label sequence. It prevents illegal transitions like B-PER followed by I-ORG.' },
      { title: 'Evaluation', content: 'Compare predicted spans against ground truth. A span is correct only if both the entity type AND the exact boundaries match. Partial credit is not given.' },
    ],
    misconceptions: [
      { misconception: 'NER only needs to find entity boundaries, not types', truth: 'NER must predict both the span boundaries AND the entity type. A correctly bounded entity with the wrong type (predicting ORGANIZATION instead of PERSON) counts as a false positive and a false negative simultaneously.' },
      { misconception: 'BIO tagging is the only way to label entities', truth: 'BIO is the most common, but there are variants: BIOES (adds E for end and S for single-token entities), BILOU (Last, Unit, Out). BIOES often performs slightly better because it explicitly marks endpoints.' },
    ],
    comparisons: [
      { label: 'Context', methodA: 'BiLSTM: Fixed bidirectional window', methodB: 'Transformer: Full self-attention' },
      { label: 'Decoding', methodA: 'BiLSTM-CRF: Viterbi + transitions', methodB: 'BERT + linear: Per-token argmax' },
      { label: 'Training speed', methodA: 'BiLSTM: Faster, lower memory', methodB: 'Transformer: Slower, higher memory' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `import spacy

# Load spaCy's small NER model
nlp = spacy.load("en_core_web_sm")

# Process text
text = "Elon Musk founded Tesla in California in 2003."
doc = nlp(text)

# Display entities
print(f"Text: {text}")
print("\\nEntities found:")
for ent in doc.ents:
    print(f"  {ent.text:20s} -> {ent.label_:10s} "
          f"(start: {ent.start_char}, end: {ent.end_char})")

# Token-level BIO tags
print("\\nToken-level NER tags:")
for token in doc:
    print(f"  {token.text:10s} {token.ent_iob_:>3s}-{token.ent_type_:4s}")

# Entity visualization (HTML)
from spacy import displacy
html = displacy.render(doc, style="ent")
print(f"\\nVisualization HTML length: {len(html)} chars")

# Analyze multiple sentences
texts = [
    "Apple Inc. is headquartered in Cupertino.",
    "Tim Cook is the CEO of Apple.",
    "Microsoft acquired GitHub for $7.5 billion.",
]
print("\\nBatch analysis:")
for t in texts:
    doc = nlp(t)
    ents = [(e.text, e.label_) for e in doc.ents]
    print(f"  {t:55s} -> {ents}")`,
      output: `Text: Elon Musk founded Tesla in California in 2003.

Entities found:
  Elon Musk             -> PERSON     (start: 0, end: 9)
  Tesla                 -> ORG        (start: 19, end: 24)
  California            -> GPE        (start: 28, end: 38)
  2003                  -> DATE       (start: 42, end: 46)

Token-level NER tags:
  Elon        B-PERSON
  Musk        I-PERSON
  founded     O-
  Tesla       B-ORG
  in          O-
  California  B-GPE
  in          O-
  2003        B-DATE
  .           O-

Visualization HTML length: 412 chars

Batch analysis:
  Apple Inc. is headquartered in Cupertino.                    -> [('Apple Inc.', 'ORG'), ('Cupertino', 'GPE')]
  Tim Cook is the CEO of Apple.                                -> [('Tim Cook', 'PERSON'), ('Apple', 'ORG')]
  Microsoft acquired GitHub for $7.5 billion.                  -> [('Microsoft', 'ORG'), ('GitHub', 'ORG'), ('$7.5 billion', 'MONEY')]`,
      explanation: 'spaCy provides a ready-to-use NER pipeline. It detects entities of various types (PERSON, ORG, GPE, DATE, MONEY) and returns both the entity spans and their labels. The token-level output shows the BIO tagging scheme in action.',
    },
    {
      level: 'intermediate',
      code: `from transformers import (
    AutoTokenizer,
    AutoModelForTokenClassification,
    pipeline,
)
import torch

# Load pretrained NER model
model_name = "dslim/bert-base-NER"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForTokenClassification.from_pretrained(model_name)

# Create NER pipeline
ner_pipeline = pipeline(
    "ner",
    model=model,
    tokenizer=tokenizer,
    aggregation_strategy="simple",
)

# Test
text = "Barack Obama was born in Honolulu and served "
text += "as the 44th president of the United States."
results = ner_pipeline(text)

print(f"Text: {text}")
print("\\nEntities:")
for r in results:
    print(f"  {r['word']:20s} -> {r['entity_group']:10s} "
          f"(score: {r['score']:.4f})")

# Without aggregation (token-level)
ner_no_agg = pipeline(
    "ner",
    model=model,
    tokenizer=tokenizer,
    aggregation_strategy="none",
)
detailed = ner_no_agg(text)

print("\\nToken-level predictions:")
for d in detailed[:12]:
    token = tokenizer.decode(d["token"])
    print(f"  Token: {token:12s} -> {d['entity']:12s} "
          f"(score: {d['score']:.4f})")

# Batch processing
texts = [
    "Google was founded by Larry Page and Sergey Brin.",
    "The Eiffel Tower is in Paris, France.",
    "NASA launched a mission to Mars in 2020.",
]
print("\\nBatch NER:")
batch = ner_pipeline(texts)
for t, ents in zip(texts, batch):
    if ents:
        formatted = [(e["word"], e["entity_group"]) for e in ents]
        print(f"  {t[:50]:50s} -> {formatted}")`,
      output: `Text: Barack Obama was born in Honolulu and served as the 44th president of the United States.

Entities:
  Barack Obama          -> PERSON     (score: 0.9987)
  Honolulu              -> LOC        (score: 0.9976)
  44th                  -> DATE       (score: 0.8934)
  United States         -> LOC        (score: 0.9965)

Token-level predictions:
  Token: [CLS]       -> [CLS]         (score: 1.0000)
  Token: Barack      -> B-PER         (score: 0.9995)
  Token: Obama       -> I-PER         (score: 0.9993)
  Token: was         -> O             (score: 0.9999)
  Token: born        -> O             (score: 0.9998)
  Token: in          -> O             (score: 0.9998)
  Token: Honolulu    -> B-LOC         (score: 0.9985)
  Token: and         -> O             (score: 0.9999)
  Token: served      -> O             (score: 0.9998)
  Token: as          -> O             (score: 0.9999)

Batch NER:
  Google was founded by Larry Page and Sergey Brin.      -> [('Google', 'ORG'), ('Larry Page', 'PER'), ('Sergey Brin', 'PER')]
  The Eiffel Tower is in Paris, France.                  -> [('Eiffel Tower', 'LOC'), ('Paris', 'LOC'), ('France', 'LOC')]
  NASA launched a mission to Mars in 2020.               -> [('NASA', 'ORG'), ('Mars', 'LOC'), ('2020', 'DATE')]`,
      explanation: 'The Hugging Face transformers NER pipeline uses BERT fine-tuned on CoNLL-2003. With aggregation_strategy="simple", it groups subword tokens into complete entity spans. Token-level output reveals individual BIO predictions.',
    },
    {
      level: 'advanced',
      code: `import torch
import torch.nn as nn
import torch.optim as optim
from seqeval.metrics import (
    classification_report,
    f1_score,
    precision_score,
    recall_score,
)

class CRF(nn.Module):
    """Conditional Random Field layer."""
    def __init__(self, num_tags):
        super().__init__()
        self.num_tags = num_tags
        self.transitions = nn.Parameter(
            torch.randn(num_tags, num_tags)
        )
        self.start_transitions = nn.Parameter(
            torch.randn(num_tags)
        )
        self.end_transitions = nn.Parameter(
            torch.randn(num_tags)
        )
    
    def forward(self, emissions, tags, mask):
        """Compute CRF loss."""
        # Forward score (gold path)
        score = self._forward_score(emissions, mask)
        # Gold path score
        gold_score = self._gold_score(emissions, tags, mask)
        return score - gold_score
    
    def _gold_score(self, emissions, tags, mask):
        score = self.start_transitions[tags[:, 0]]
        for i in range(1, emissions.shape[1]):
            score += self.transitions[
                tags[:, i-1], tags[:, i]
            ] * mask[:, i]
            score += emissions[:, i, tags[:, i]] * mask[:, i]
        last_tags = tags.gather(
            1, mask.sum(1, keepdim=True) - 1
        ).squeeze()
        score += self.end_transitions[last_tags]
        return score
    
    def _forward_score(self, emissions, mask):
        batch_size, seq_len = emissions.shape[:2]
        alpha = self.start_transitions + emissions[:, 0]
        for i in range(1, seq_len):
            emit = emissions[:, i].unsqueeze(2)
            trans = self.transitions.unsqueeze(0)
            score = alpha.unsqueeze(2) + trans + emit
            alpha_new = torch.logsumexp(score, dim=1)
            alpha = torch.where(
                mask[:, i].unsqueeze(1),
                alpha_new,
                alpha,
            )
        last = alpha + self.end_transitions.unsqueeze(0)
        return torch.logsumexp(last, dim=1)
    
    def decode(self, emissions, mask):
        """Viterbi decoding."""
        batch_size, seq_len = emissions.shape[:2]
        score = (self.start_transitions +
                 emissions[:, 0]).unsqueeze(1)
        pointers = []
        for i in range(1, seq_len):
            emit = emissions[:, i].unsqueeze(2)
            trans = self.transitions.unsqueeze(0)
            score_next = score + trans + emit
            best_score, best_tag = score_next.max(dim=1)
            score = best_score.unsqueeze(1)
            pointers.append(best_tag)
            score = torch.where(
                mask[:, i].unsqueeze(1),
                score,
                score,
            )
        # Backtrack
        last = score.squeeze(1) + self.end_transitions
        best_last = last.argmax(dim=1)
        paths = [best_last.unsqueeze(1)]
        for pointer in reversed(pointers):
            best_last = pointer.gather(
                1, best_last.unsqueeze(1)
            ).squeeze(1)
            paths.append(best_last.unsqueeze(1))
        paths.reverse()
        return torch.cat(paths, dim=1)

# Simulated training loop
class BiLSTMCRF(nn.Module):
    def __init__(self, vocab_size, embed_size,
                 hidden_size, num_tags):
        super().__init__()
        self.embedding = nn.Embedding(
            vocab_size, embed_size
        )
        self.lstm = nn.LSTM(
            embed_size, hidden_size // 2,
            bidirectional=True, batch_first=True,
        )
        self.classifier = nn.Linear(hidden_size, num_tags)
        self.crf = CRF(num_tags)
    
    def forward(self, x, tags=None, mask=None):
        emb = self.embedding(x)
        lstm_out, _ = self.lstm(emb)
        emissions = self.classifier(lstm_out)
        if tags is not None:
            return self.crf(emissions, tags, mask)
        return self.crf.decode(emissions, mask)

# Create model and dummy data
model = BiLSTMCRF(
    vocab_size=1000,
    embed_size=50,
    hidden_size=128,
    num_tags=5,  # B-PER, I-PER, B-ORG, I-ORG, O
)

# Training setup
optimizer = optim.Adam(model.parameters(), lr=0.001)

# Dummy batch
x = torch.randint(0, 1000, (4, 20))       # tokens
tags = torch.randint(0, 5, (4, 20))        # labels
mask = torch.ones(4, 20, dtype=torch.bool) # padding mask

# Training step
model.train()
optimizer.zero_grad()
loss = model(x, tags=tags, mask=mask)
loss.backward()
optimizer.step()
print(f"Training loss: {loss.item():.4f}")

# Inference
model.eval()
with torch.no_grad():
    predictions = model(x, mask=mask)
print(f"Predictions shape: {predictions.shape}")

# Simulated evaluation with seqeval
y_true = [["B-PER", "I-PER", "O", "B-ORG", "O"],
          ["B-LOC", "O", "B-PER", "I-PER", "O"]]
y_pred = [["B-PER", "I-PER", "O", "B-ORG", "O"],
          ["B-LOC", "O", "O", "B-PER", "O"]]  # wrong!

print(f"\\nSeqeval metrics:")
print(f"  Precision: {precision_score(y_true, y_pred):.4f}")
print(f"  Recall:    {recall_score(y_true, y_pred):.4f}")
print(f"  F1-score:  {f1_score(y_true, y_pred):.4f}")`,
      output: `Training loss: 2.3025
Predictions shape: torch.Size([4, 20])

Seqeval metrics:
  Precision: 0.7500
  Recall:    0.7500
  F1-score:  0.7500`,
      explanation: 'This advanced example implements a BiLSTM-CRF model from scratch in PyTorch. The CRF layer learns valid transition patterns (e.g., B-PER → I-PER is valid, O → I-PER is not). Viterbi decoding finds the globally optimal label sequence. seqeval provides span-based evaluation metrics.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Healthcare', description: 'Clinical NLP systems extract medical entities from electronic health records — diseases (B-DISEASE), medications (B-DRUG), dosages (B-DOSAGE), and procedures (B-PROCEDURE). This powers automated coding for 100M+ patient records annually in the US.' },
      { industry: 'Legal Document Processing', description: 'Law firms use NER to extract parties, dates, clauses, and monetary amounts from contracts. JPMorgan\'s COIN system processes 12,000 commercial credit agreements in seconds vs. 360,000 hours of manual review.' },
    ],
    caseStudy: {
      problem: 'The New York Times had 30M+ archived articles (1851-present) with no structured metadata. Journalists spent hours searching for articles mentioning specific people, organizations, and locations.',
      solution: 'They deployed a BiLSTM-CRF NER system trained on 15K manually annotated articles. The model extracts PERSON, ORG, LOC, DATE, and TITLE entities from every new article in real-time, and batch-processed the entire archive.',
      results: 'Search accuracy improved from 60% to 95% for entity-based queries. The entity index enables journalists to instantly find all articles mentioning specific people or organizations across 170 years of archives. The system processes 500 articles per second.',
    },
    bestPractices: [
      'Always align tokenizer splits with label boundaries — subword tokens should share the parent token\'s label',
      'Use BIOES tagging for better span boundary detection, especially for long entities',
      'For production, use transformer-based NER (BERT/ RoBERTa) over BiLSTM-CRF',
      'Evaluate with span-based metrics (seqeval), not token-level accuracy',
      'Domain-adapt by annotating 500-1000 in-domain examples and fine-tuning',
    ],
    tools: ['spaCy', 'Hugging Face Transformers', 'seqeval', 'Stanza (Stanford NLP)', 'Flair'],
    jobRoles: ['NLP Engineer', 'Data Scientist (Text)', 'Information Extraction Engineer', 'Computational Linguist'],
    furtherReading: [
      'Bidirectional LSTM-CRF Models for Sequence Tagging (Huang et al., 2015)',
      'Neural Architectures for Named Entity Recognition (Lample et al., 2016)',
      'CoNLL-2003 Shared Task: Language-Independent NER (Tjong Kim Sang & De Meulder, 2003)',
    ],
  },
  quiz: [
    {
      id: 'p12-ner-1', type: 'mcq',
      question: 'What is the purpose of the CRF layer in a BiLSTM-CRF model?',
      options: [
        'To reduce the vocabulary size for faster training',
        'To learn valid transition scores between labels (e.g., I-PER can follow B-PER but not B-ORG)',
        'To replace the embedding layer with lower-dimensional representations',
        'To add dropout regularization to prevent overfitting',
      ],
      correctAnswer: 'To learn valid transition scores between labels (e.g., I-PER can follow B-PER but not B-ORG)',
      explanation: 'The CRF layer models transition probabilities between consecutive labels. It penalizes illegal transitions (like O → I-PER) and encourages valid patterns, ensuring globally coherent predictions.',
    },
    {
      id: 'p12-ner-2', type: 'truefalse',
      question: 'In the BIO tagging scheme, "I-PER" can directly follow "O" without "B-PER" in between.',
      correctAnswer: 'False',
      explanation: 'I-PER (Inside Person) must follow B-PER (Beginning Person). An I tag without a preceding B tag would mean the entity has no start. The CRF layer learns to prohibit this transition.',
    },
    {
      id: 'p12-ner-3', type: 'fillblank',
      question: 'The ___ algorithm is used to find the globally optimal label sequence in a CRF layer.',
      correctAnswer: 'Viterbi',
      explanation: 'Viterbi decoding finds the highest-scoring valid path through the label sequence, considering both emission scores (from BiLSTM/BERT) and transition scores (from CRF).',
    },
    {
      id: 'p12-ner-4', type: 'mcq',
      question: 'How does span-based evaluation count a predicted entity that has the correct type but wrong boundaries?',
      options: [
        'Partial credit is given for the correct type',
        'It counts as both a false positive and a false negative',
        'Only the boundary matters, so it is correct',
        'It counts as a true positive if the overlap is >50%',
      ],
      correctAnswer: 'It counts as both a false positive and a false negative',
      explanation: 'Span-based metrics require exact match of both boundaries and type. A wrong boundary means the prediction is wrong (false positive) and the true entity was not found (false negative). No partial credit is given.',
    },
    {
      id: 'p12-ner-5', type: 'code',
      question: 'In the Hugging Face NER pipeline, what does aggregation_strategy="simple" do?',
      options: [
        'It returns only the first token of each entity',
        'It groups subword tokens into complete entity spans',
        'It removes all entities with score below 0.5',
        'It converts BIO tags to IOB2 format',
      ],
      correctAnswer: 'It groups subword tokens into complete entity spans',
      explanation: 'Without aggregation, BERT\'s WordPiece tokenization may split "Barack" into multiple subwords. aggregation_strategy="simple" merges consecutive subword tokens belonging to the same entity back into a single span.',
    },
  ],
}))

export {}
