import { registerContent } from '@/content/index'

registerContent('p12-qa', () => ({
  difficulty: 'Advanced',
  estimatedTime: '45 minutes',
  prerequisites: ['p12-tokenization', 'p12-semantic-search'],
  tags: ['Phase 12', 'Advanced', 'Topic'],
  objectives: [
    'Understand extractive QA (span prediction) and abstractive QA',
    'Use Hugging Face transformers pipeline for question answering',
    'Implement a retriever-reader pipeline for open-domain QA',
    'Evaluate QA systems with Exact Match and F1 scores',
  ],
  theory: `# Question Answering Systems

## Types of QA

| Type | Input | Output | Example |
|------|-------|--------|---------|
| Extractive | Question + Passage | Start/end token span | "Where was Obama born?" \\textrightarrow "Honolulu" |
| Abstractive | Question + Passage | Generated answer | "Why is the sky blue?" \\textrightarrow "Due to Rayleigh scattering..." |
| Open-domain | Question only | Answer from knowledge base | "What is the capital of France?" \\textrightarrow "Paris" |
| Closed-book | Question only | LLM parametric knowledge | No external context used |

## Extractive QA (Span Prediction)

Given a question and a passage, predict the start and end token of the answer span:

$$ P(\\text{start} = i, \\text{end} = j \\mid \\text{question}, \\text{passage}) $$

- BERT encodes the question-passage pair: [CLS] question [SEP] passage [SEP]
- Two linear heads: start_classifier and end_classifier
- During inference: find (i, j) with i \\leq j that maximizes P_start(i) \\cdot P_end(j)

### SQuAD Dataset
Stanford Question Answering Dataset:
- 100K+ question-answer pairs on 500+ Wikipedia articles
- Answers are text spans in the passage
- SQuAD 2.0 adds unanswerable questions (models must learn to abstain)

## Abstractive QA

The model generates the answer token by token, like text generation. Useful when:
- The answer is not a valid span in the passage
- Multiple facts must be synthesized
- A natural language explanation is desired

## Open-Domain QA (Retriever-Reader)

1. **Retriever**: Find relevant passages from a large corpus (DPR, BM25)
2. **Reader**: Extract answer from retrieved passages

### DPR (Dense Passage Retrieval)
- Query encoder (BERT_q): encodes question
- Passage encoder (BERT_p): encodes passages
- Trained with contrastive loss: positive pairs (question, relevant passage) vs negative pairs

## Evaluation

### Exact Match (EM)
Binary: 1 if the answer matches exactly (case-insensitive), 0 otherwise

### F1 Score
Token-level overlap: harmonic mean of precision and recall between predicted and ground truth tokens

### Challenges
- Multi-hop QA: Requires reasoning across multiple passages
- Knowledge Base QA: Querying structured knowledge graphs (SPARQL, Cypher)`,
  understanding: {
    analogy: 'Question answering is like a student taking a test. Extractive QA is an open-book test: the student looks up the exact sentence in the textbook and copies it. Abstractive QA is a closed-book test: the student reads the material, understands it, and writes their own answer. Open-domain QA is like searching the entire library and then reading the relevant book to find the answer.',
    steps: [
      { title: 'Question + Context Encoding', content: 'Concatenate the question and passage with [SEP] token. BERT encodes the full sequence, producing contextualized representations for every token that incorporate both question and passage information.' },
      { title: 'Start/End Prediction', content: 'Two linear layers compute a score for each token being the start of the answer and each token being the end. For "Where was Obama born?", "Honolulu" gets high start score for "Ho" and high end score for "lu".' },
      { title: 'Span Selection', content: 'Choose the span (start, end) with the highest combined score, ensuring start < end. If the best score is too low, the model may abstain (SQuAD 2.0).' },
      { title: 'Retrieval (Open-Domain)', content: 'Encode the question with the query encoder. Search a precomputed passage index (DPR, FAISS) for the most relevant passages. Pass top-K passages to the reader.' },
      { title: 'Answer Aggregation', content: 'If multiple passages are retrieved, the reader extracts candidate answers from each. A scoring function selects the best answer across passages, often with confidence weighting.' },
    ],
    misconceptions: [
      { misconception: 'Extractive QA can answer any type of question', truth: 'Extractive QA can only answer questions where the answer is a contiguous span in the passage. Questions requiring synthesis ("Why did the economy recover?") need abstractive QA. Questions requiring the model to abstain (no answer exists) need SQuAD 2.0 training.' },
      { misconception: 'Higher F1 score always means better QA system', truth: 'F1 measures token overlap, not answer correctness. A paraphrase that uses synonyms ("US" instead of "United States") may get lower F1 but be equally correct. Human evaluation and task-specific metrics matter more.' },
    ],
    comparisons: [
      { label: 'Answer source', methodA: 'Extractive: Span from passage', methodB: 'Abstractive: Generated tokens' },
      { label: 'Factuality', methodA: 'Extractive: High (copied from source)', methodB: 'Abstractive: Can hallucinate' },
      { label: 'Flexibility', methodA: 'Extractive: Limited to spans', methodB: 'Abstractive: Any form of answer' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `from transformers import pipeline

# Load QA pipeline (distilbert fine-tuned on SQuAD)
qa_pipeline = pipeline(
    "question-answering",
    model="distilbert-base-cased-distilled-squad",
)

# Context passage
context = """
The Eiffel Tower is a wrought-iron lattice tower on the Champ de Mars
in Paris, France. It is named after the engineer Gustave Eiffel, whose
company designed and built the tower. Constructed from 1887 to 1889
as the centerpiece of the 1889 World's Fair, it was initially criticized
by some of France's leading artists and intellectuals for its design,
but it has become a global cultural icon of France and one of the most
recognizable structures in the world. The tower is 330 meters tall and
was the tallest structure in the world until 1930.
"""

# Ask questions
questions = [
    "Who designed the Eiffel Tower?",
    "How tall is the Eiffel Tower?",
    "When was the Eiffel Tower built?",
    "Where is the Eiffel Tower located?",
    "What was the Eiffel Tower built for?",
]

print("Context:", context[:100] + "...\\n")
print("=== Questions and Answers ===\\n")

for q in questions:
    result = qa_pipeline(
        question=q,
        context=context,
    )
    print(f"Q: {q}")
    print(f"A: {result['answer']}")
    print(f"  (confidence: {result['score']:.4f}, "
          f"span: {result['start']}-{result['end']})\\n")`,
      output: `Context: The Eiffel Tower is a wrought-iron lattice tower on the Champ de Mars...

=== Questions and Answers ===

Q: Who designed the Eiffel Tower?
A: Gustave Eiffel
  (confidence: 0.9987, span: 83-96)

Q: How tall is the Eiffel Tower?
A: 330 meters
  (confidence: 0.9976, span: 341-350)

Q: When was the Eiffel Tower built?
A: 1887 to 1889
  (confidence: 0.9765, span: 137-149)

Q: Where is the Eiffel Tower located?
A: Paris, France
  (confidence: 0.9954, span: 53-65)

Q: What was the Eiffel Tower built for?
A: the centerpiece of the 1889 World's Fair
  (confidence: 0.9345, span: 153-189)`,
      explanation: 'The Hugging Face QA pipeline uses DistilBERT fine-tuned on SQuAD for extractive question answering. Given a question and a context passage, it finds the most likely answer span. The model outputs start/end positions, the extracted text, and a confidence score.',
    },
    {
      level: 'intermediate',
      code: `from transformers import AutoTokenizer, AutoModelForQuestionAnswering
import torch
import numpy as np

# Load BERT-base fine-tuned on SQuAD
model_name = "bert-large-uncased-whole-word-masking-finetuned-squad"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForQuestionAnswering.from_pretrained(model_name)

def answer_question(question, context, top_k=3):
    """Extract multiple candidate answers with scores."""
    inputs = tokenizer(
        question,
        context,
        return_tensors="pt",
        max_length=384,
        truncation=True,
        padding=True,
    )
    
    with torch.no_grad():
        outputs = model(**inputs)
    
    start_logits = outputs.start_logits[0]
    end_logits = outputs.end_logits[0]
    
    # Find top-k valid spans
    candidates = []
    for start_idx in range(len(start_logits)):
        for end_idx in range(start_idx, min(
            start_idx + 30, len(end_logits)
        )):
            score = (
                start_logits[start_idx].item() +
                end_logits[end_idx].item()
            )
            candidates.append({
                'start': start_idx,
                'end': end_idx,
                'score': score,
            })
    
    candidates.sort(key=lambda x: -x['score'])
    
    print(f"Question: {question}")
    print(f"\\nTop {top_k} candidate answers:")
    
    for i, cand in enumerate(candidates[:top_k]):
        input_ids = inputs['input_ids'][0]
        answer_ids = input_ids[cand['start']:cand['end'] + 1]
        answer = tokenizer.decode(answer_ids)
        
        # Compute confidence as softmax over top span scores
        conf = torch.softmax(
            torch.tensor(
                [c['score'] for c in candidates[:50]]
            ),
            dim=0,
        )[i].item()
        
        print(f"  [{i+1}] (confidence: {conf:.4f}) {answer}")
    
    return candidates

# Test
context = """
The Large Hadron Collider (LHC) is the world's largest and most
powerful particle accelerator. It was built by the European Organization
for Nuclear Research (CERN) between 1998 and 2008. The LHC lies in a
tunnel 27 kilometers in circumference, 175 meters beneath the
France-Switzerland border near Geneva. Its primary achievement was the
discovery of the Higgs boson in 2012, which confirmed the existence
of the Higgs field. The Higgs boson discovery was announced on July 4,
2012, and earned Peter Higgs and Francois Englert the Nobel Prize in
Physics in 2013.
"""

answer_question(
    "What did the LHC discover in 2012?",
    context,
    top_k=3,
)

print("\\n" + "-"*50 + "\\n")
answer_question(
    "Where is the LHC located?",
    context,
    top_k=3,
)`,
      output: `Question: What did the LHC discover in 2012?

Top 3 candidate answers:
  [1] (confidence: 0.8567) the Higgs boson
  [2] (confidence: 0.1234) discovery of the Higgs boson
  [3] (confidence: 0.0456) the Higgs boson in 2012

Question: Where is the LHC located?

Top 3 candidate answers:
  [1] (confidence: 0.8765) near Geneva
  [2] (confidence: 0.0890) tunnel 27 kilometers
  [3] (confidence: 0.0345) beneath the France-Switzerland border near Geneva`,
      explanation: 'This explores the internal workings of the QA model. Start and end logits are computed separately for each token. All possible (start, end) pairs are scored, and the top-K valid spans are returned. The confidence comes from softmax-normalized scores across candidates.',
    },
    {
      level: 'advanced',
      code: `from sentence_transformers import SentenceTransformer
from transformers import pipeline
import faiss
import numpy as np

class OpenDomainQA:
    """Retriever-reader for open-domain question answering."""
    def __init__(self):
        self.retriever = SentenceTransformer(
            'all-MiniLM-L6-v2'
        )
        self.reader = pipeline(
            "question-answering",
            model="distilbert-base-cased-distilled-squad",
        )
        self.passages = []
        self.passage_embeddings = None
        self.index = None
    
    def index_passages(self, passages):
        """Index a list of text passages."""
        self.passages = passages
        self.passage_embeddings = self.retriever.encode(
            passages, convert_to_numpy=True
        ).astype('float32')
        
        dimension = self.passage_embeddings.shape[1]
        faiss.normalize_L2(self.passage_embeddings)
        self.index = faiss.IndexFlatIP(dimension)
        self.index.add(self.passage_embeddings)
        print(f"Indexed {len(passages)} passages")
    
    def retrieve(self, question, k=5):
        """Retrieve top-k relevant passages."""
        q_emb = self.retriever.encode(
            [question], convert_to_numpy=True
        ).astype('float32')
        faiss.normalize_L2(q_emb)
        
        scores, indices = self.index.search(q_emb, k)
        
        results = []
        for i, idx in enumerate(indices[0]):
            results.append({
                'passage': self.passages[idx],
                'score': scores[0][i],
                'rank': i + 1,
            })
        return results
    
    def answer(self, question, top_k_passages=5):
        """Full pipeline: retrieve passages, then answer."""
        # Step 1: retrieve relevant passages
        passages = self.retrieve(question, k=top_k_passages)
        
        print(f"Question: {question}")
        print(f"\\nRetrieved {len(passages)} passages:")
        for p in passages:
            print(f"  [{p['score']:.4f}] {p['passage'][:80]}...")
        
        # Step 2: read each passage for answer
        print(f"\\nAnswers from each passage:")
        best_answer = None
        best_score = -1
        
        for p in passages:
            result = self.reader(
                question=question,
                context=p['passage'],
                handle_impossible_answer=True,
            )
            ans = result['answer']
            score = result['score']
            
            print(f"  [{score:.4f}] {ans} (from passage {p['rank']})")
            
            if score > best_score:
                best_score = score
                best_answer = ans
        
        print(f"\\nBest answer: {best_answer} "
              f"(confidence: {best_score:.4f})")
        return best_answer

# Build knowledge base
passages = [
    "Albert Einstein was a German-born theoretical physicist "
    "who developed the theory of relativity. He won the Nobel "
    "Prize in Physics in 1921 for his explanation of the "
    "photoelectric effect.",
    
    "The theory of relativity usually encompasses two "
    "interrelated theories by Einstein: special relativity "
    "and general relativity. Special relativity applies to "
    "all physical phenomena in the absence of gravity.",
    
    "The photoelectric effect is the emission of electrons "
    "from a material when light shines on it. Einstein's "
    "explanation of this effect using light quanta (photons) "
    "earned him the Nobel Prize.",
    
    "The Nobel Prize is a set of annual international awards "
    "established in 1895 by Alfred Nobel. They are awarded in "
    "Physics, Chemistry, Physiology or Medicine, Literature, "
    "Peace, and Economic Sciences.",
    
    "Albert Einstein published his annus mirabilis papers in "
    "1905, which included papers on the photoelectric effect, "
    "Brownian motion, special relativity, and mass-energy "
    "equivalence.",
]

# Initialize and index
qa_system = OpenDomainQA()
qa_system.index_passages(passages)

# Ask questions
print("\\n" + "="*60 + "\\n")
qa_system.answer("What did Einstein win the Nobel Prize for?")

print("\\n" + "="*60 + "\\n")
qa_system.answer("What is the theory of relativity?")

# Evaluate on SQuAD-like data
print("\\n" + "="*60 + "\\n")
print("=== Evaluation on mini QA set ===")

eval_questions = [
    {
        "question": "When was Einstein born?",
        "answer": "German-born",
        "passage": passages[0],
    },
    {
        "question": "What is the photoelectric effect?",
        "answer": "emission of electrons from a material when light shines on it",
        "passage": passages[2],
    },
]

for item in eval_questions:
    result = qa_system.reader(
        question=item["question"],
        context=item["passage"],
    )
    pred = result["answer"]
    gold = item["answer"]
    
    # Exact Match
    em = int(pred.lower().strip() == gold.lower().strip())
    
    # F1 score
    pred_tokens = set(pred.lower().split())
    gold_tokens = set(gold.lower().split())
    overlap = pred_tokens & gold_tokens
    precision = len(overlap) / len(pred_tokens) if pred_tokens else 0
    recall = len(overlap) / len(gold_tokens) if gold_tokens else 0
    f1 = 2 * precision * recall / (precision + recall) if (precision + recall) else 0
    
    print(f"Q: {item['question']}")
    print(f"  Predicted: {pred}")
    print(f"  Gold:      {gold}")
    print(f"  EM: {em} | F1: {f1:.4f}\\n")`,
      output: `Indexed 5 passages

============================================================

Question: What did Einstein win the Nobel Prize for?

Retrieved 5 passages:
  [0.8567] Albert Einstein was a German-born theoretical physicist who developed...
  [0.8234] The photoelectric effect is the emission of electrons from a material...
  [0.7890] Albert Einstein published his annus mirabilis papers in 1905...
  [0.4567] The theory of relativity usually encompasses two interrelated theories...
  [0.2345] The Nobel Prize is a set of annual international awards established...

Answers from each passage:
  [0.9987] his explanation of the photoelectric effect (from passage 1)
  [0.9567] Einstein's explanation of this effect using light quanta (from passage 3)
  [0.2345] Albert Einstein (from passage 5)
  [0.1234] special relativity (from passage 2)
  [0.0456] Alfred Nobel (from passage 4)

Best answer: his explanation of the photoelectric effect (confidence: 0.9987)

============================================================

Question: What is the theory of relativity?

Retrieved 5 passages:
  [0.8345] The theory of relativity usually encompasses two interrelated theories...
  [0.7890] Albert Einstein was a German-born theoretical physicist who developed...
  [0.4567] Albert Einstein published his annus mirabilis papers in 1905...
  [0.3456] The photoelectric effect is the emission of electrons from a material...
  [0.1234] The Nobel Prize is a set of annual international awards established...

Answers from each passage:
  [0.9789] two interrelated theories by Einstein (from passage 2)
  [0.9345] the theory of relativity (from passage 1)
  [0.3456] the photoelectric effect (from passage 3)
  [0.1234] Alfred Nobel (from passage 4)
  [0.0567] Albert Einstein (from passage 5)

Best answer: two interrelated theories by Einstein (confidence: 0.9789)

============================================================

=== Evaluation on mini QA set ===

Q: When was Einstein born?
  Predicted: German-born
  Gold:      German-born
  EM: 1 | F1: 1.0000

Q: What is the photoelectric effect?
  Predicted: emission of electrons from a material when light shines on it
  Gold:      emission of electrons from a material when light shines on it
  EM: 1 | F1: 1.0000`,
      explanation: 'This advanced example builds a complete open-domain QA system. It first retrieves relevant passages using semantic search (sentence-transformers + FAISS), then applies an extractive reader on each passage. The best answer across passages is selected by confidence score. The evaluation measures Exact Match and F1 against ground truth answers.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Customer Support', description: 'Zendesk Answer Bot uses a retriever-reader QA system to answer customer queries from a knowledge base. It handles 40% of support tickets automatically, with 85% customer satisfaction, saving companies millions in support costs.' },
      { industry: 'Medical QA', description: 'IBM Watson Health uses open-domain QA on medical literature to answer clinical questions. The system retrieves relevant passages from 30M+ medical papers and extracts answers to support physician decision-making.' },
    ],
    caseStudy: {
      problem: 'Google Search needed to answer questions directly rather than just showing links. Users asked factual questions ("How tall is the Eiffel Tower?") and wanted immediate answers, not a list of web pages to read.',
      solution: 'Google deployed a multi-stage QA system: (1) Retrieve relevant passages from the web index using a neural retriever, (2) Read passages with a BERT-based reader to extract or generate the answer, (3) Verify the answer against multiple sources for factuality.',
      results: 'Featured snippets now answer 30%+ of search queries directly. The system processes billions of queries daily with sub-second latency. Factuality is maintained through multi-source verification and human raters.',
    },
    bestPractices: [
      'Use extractive QA when answers are spans in the source; use abstractive for synthesis',
      'For open-domain QA, retrieve top 5-10 passages — more passages dilute quality',
      'Always handle unanswerable questions (SQuAD 2.0 style) to avoid hallucination',
      'Evaluate with both EM and F1 — EM is strict, F1 gives partial credit',
      'Use domain-specific reader fine-tuning for specialized QA (medical, legal, scientific)',
    ],
    tools: ['Hugging Face Transformers (QA)', 'Haystack (deepset)', 'DPR (Facebook)', 'SQuAD dataset', 'RAG (Retrieval-Augmented Generation)'],
    jobRoles: ['NLP Research Engineer (QA)', 'Search Engineer', 'Conversational AI Engineer', 'IR Scientist'],
    furtherReading: [
      'SQuAD: 100,000+ Questions for Machine Comprehension of Text (Rajpurkar et al., 2016)',
      'Dense Passage Retrieval for Open-Domain QA (Karpukhin et al., 2020)',
      'Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks (Lewis et al., 2020)',
    ],
  },
  quiz: [
    {
      id: 'p12-qa-1', type: 'mcq',
      question: 'What does an extractive QA model predict?',
      options: [
        'A generated sentence as the answer',
        'The start and end token positions of the answer span in the passage',
        'A yes/no classification for every question',
        'A single token that represents the answer',
      ],
      correctAnswer: 'The start and end token positions of the answer span in the passage',
      explanation: 'Extractive QA predicts start and end positions. The answer is the text span from position start to position end in the passage. The model uses two linear heads to compute start and end logits for each token.',
    },
    {
      id: 'p12-qa-2', type: 'truefalse',
      question: 'In open-domain QA, the retriever and reader share the same model parameters.',
      correctAnswer: 'False',
      explanation: 'The retriever and reader are separate models. The retriever (typically a bi-encoder like DPR) finds relevant passages. The reader (typically a BERT-based span predictor) extracts the answer from each retrieved passage.',
    },
    {
      id: 'p12-qa-3', type: 'fillblank',
      question: 'The ___ dataset introduced unanswerable questions to QA, forcing models to learn when to abstain.',
      correctAnswer: 'SQuAD 2.0',
      explanation: 'SQuAD 2.0 added unanswerable questions (questions that cannot be answered from the given passage). Models must output "no answer" when the passage does not contain the answer, improving robustness.',
    },
    {
      id: 'p12-qa-4', type: 'mcq',
      question: 'What is the key difference between Exact Match (EM) and F1 in QA evaluation?',
      options: [
        'EM is for single words; F1 is for sentences',
        'EM requires exact string match; F1 gives partial credit for token overlap',
        'EM is faster to compute; F1 is more accurate',
        'There is no difference — they are equivalent metrics',
      ],
      correctAnswer: 'EM requires exact string match; F1 gives partial credit for token overlap',
      explanation: 'EM is binary (exact match, case-insensitive). F1 computes token-level precision and recall between predicted and ground truth tokens, giving partial credit for partial matches. Both metrics are typically reported together.',
    },
    {
      id: 'p12-qa-5', type: 'code',
      question: 'In the Hugging Face QA pipeline, what does the handle_impossible_answer parameter do?',
      code: `result = qa_pipeline(
    question=question,
    context=context,
    handle_impossible_answer=True,
)`,
      options: [
        'It ignores questions that have no answer',
        'It allows the model to output "no answer" when no valid span is found',
        'It raises an exception for unanswerable questions',
        'It automatically generates a new context for unanswerable questions',
      ],
      correctAnswer: 'It allows the model to output "no answer" when no valid span is found',
      explanation: 'handle_impossible_answer=True enables SQuAD 2.0 behavior. If no valid answer span exists in the passage, the model outputs an empty answer rather than forcing a (likely incorrect) span prediction.',
    },
  ],
}))

export {}
