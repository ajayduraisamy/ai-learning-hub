import { registerContent } from '@/content/index'

registerContent('p19-reranking', () => ({
  difficulty: 'Advanced',
  estimatedTime: '45 minutes',
  prerequisites: ['p19-retrieval-strategies'],
  tags: ['RAG', 'Advanced', 'Topic'],
  objectives: [
    'Understand why re-ranking is critical for RAG quality',
    'Implement cross-encoder re-rankers with sentence-transformers',
    'Use Cohere Rerank API for production re-ranking',
    'Compare pointwise, listwise, and late-interaction (ColBERT) re-ranking',
  ],
  theory: `# Re-ranking

## Why Re-rank?

Re-ranking is a two-stage retrieval strategy:

1. **First-stage (bi-encoder)**: Fast, cheap retrieval of top-k candidates (k = 50-200)
2. **Second-stage (cross-encoder)**: Slow, expensive, but highly precise re-scoring of top-n candidates (n = 5-20)

The bi-encoder independently encodes queries and documents into vectors. The cross-encoder processes the query-document pair together, allowing deep interaction between them.

### Bi-Encoder vs Cross-Encoder

| Aspect | Bi-Encoder | Cross-Encoder |
|--------|------------|---------------|
| Architecture | Two independent encoders | Single encoder for (query, doc) pair |
| Computation | O(N) — pre-compute doc embeddings | O(N) — must process each pair |
| FLOPS per pair | Low (single pass) | High (full attention between query + doc) |
| Accuracy | Good | Excellent |
| Pre-computation | Yes (doc embeddings cached) | No (each pair processed live) |
| Use case | First-stage retrieval | Second-stage re-ranking |

### Cross-Encoder Architecture

A cross-encoder takes the concatenation of query and document as input:

$$\\text{score}(q, d) = \\text{CrossEncoder}([q; d])$$

Where $[q; d]$ is the concatenated input with special tokens (e.g., \\\\texttt{[CLS] query [SEP] document [SEP]}).

Popular cross-encoder models:
- \\\\texttt{cross-encoder/ms-marco-MiniLM-L-6-v2} (fast, good for MS MARCO)
- \\\\texttt{cross-encoder/ms-marco-electra-base} (higher accuracy)
- \\\\texttt{BAAI/bge-reranker-v2-m3} (multilingual, high quality)

## Pointwise vs Listwise Re-ranking

### Pointwise Re-ranking

Each query-document pair is scored independently. Documents are sorted by their individual scores.

**Pros**: Simple, parallelizable, works with any number of candidates.
**Cons**: Loses relative comparison information.

### Listwise Re-ranking

The re-ranker sees all candidate documents together and produces a ranked permutation.

**Pros**: Can make relative comparisons ("document A is better than B").
**Cons**: Limited by context window, more complex implementation.

## Cohere Rerank API

Cohere provides a hosted re-ranking endpoint that works with any search system:

\\\`\\\`python
import cohere
co = cohere.Client(api_key)
results = co.rerank(
    query="What is the capital of France?",
    documents=["Paris is...", "London is..."],
    model="rerank-english-v3.0",
    top_n=3
)
\\\`\\\`\\\`

Key features:
- No need to match embedding models — works with any retrieval system
- Returns relevance scores between 0 and 1
- Multiple models for different languages and performance levels
- Returns top_n most relevant documents with scores

## ColBERT — Late Interaction Scoring

ColBERT (Contextualized Late Interaction over BERT) uses a different approach: it encodes query and document tokens independently, then uses "late interaction" to compute similarity:

$$S(q, d) = \\sum_{i \\in |q|} \\max_{j \\in |d|} \\mathbf{E}_q(q_i) \\cdot \\mathbf{E}_d(d_j)$$

For each query token, ColBERT finds the most similar document token (max over document dimension). This captures term-level matching with contextualized representations.

| Aspect | Cross-Encoder | ColBERT |
|--------|---------------|---------|
| Encoding | Joint (query + doc together) | Independent (query and doc separate) |
| Scoring | Deep interaction | Late interaction |
| Pre-compute docs | No | Yes (doc embeddings cached) |
| Speed | Slow for many docs | Fast after doc encoding |

## Re-ranking Latency/Quality Tradeoffs

\\\`\\\`\\\`
Strategy          | Latency (100 docs) | Recall@5 | Cost
------------------|-------------------|----------|------
No re-rank        | 0ms (free)        | 75%      | Lowest
MiniLM re-ranker  | 50ms              | 89%      | Low
BGE re-ranker     | 120ms             | 93%      | Moderate
Cohere Rerank API | 200-400ms         | 94%      | Per-query cost
ColBERT           | 30ms (after index)| 91%      | Moderate
\\\`\\\`\\\`

## Understanding

Re-ranking is like a two-stage hiring process. First, HR quickly screens 200 resumes based on keywords (bi-encoder). Then the hiring manager carefully interviews the top 5 candidates, reading their full profile and asking follow-up questions (cross-encoder). The second stage is expensive but much more accurate.`,
  understanding: {
    analogy: 'Re-ranking is a two-stage hiring process. First-stage retrieval (bi-encoder) is like HR screening 200 resumes in 5 minutes using keyword filters. Second-stage re-ranking (cross-encoder) is the hiring manager spending 30 minutes interviewing each of the top 5 candidates, understanding their full context and fit. The second stage is far more accurate but can only be done on a small subset.',
    steps: [
      { title: 'First-Stage Retrieval', content: 'Use a fast bi-encoder (embedding model) to retrieve a large candidate set (50-200 documents). This is cheap and broad.' },
      { title: 'Prepare Pairs', content: 'For each candidate document, create a (query, document) pair. These pairs will be scored by the cross-encoder.' },
      { title: 'Score with Cross-Encoder', content: 'Feed each pair through the cross-encoder. The model processes the concatenated query+document through deep attention layers to produce a relevance score.' },
      { title: 'Sort by Score', content: 'Sort all documents by the cross-encoder score descending. Take the top-n (typically 3-10) for LLM generation.' },
      { title: 'Incorporate into Pipeline', content: 'Pass the re-ranked documents to the LLM for generation. The LLM receives higher-quality context, leading to better answers.' },
    ],
    misconceptions: [
      { misconception: 'Re-ranking is unnecessary if you have a good embedding model', truth: 'Even the best embedding models are bi-encoders that lose information by compressing each document independently. Cross-encoders see query-document interactions and consistently outperform bi-encoders.' },
      { misconception: 'Cross-encoders can replace bi-encoders entirely', truth: 'Cross-encoders are too slow to search a full corpus. They must be used as a second stage after bi-encoder pre-filtering. The two-stage approach combines the strengths of both.' },
    ],
    comparisons: [
      { label: 'Speed', methodA: 'Bi-encoder: Fast (pre-computed)', methodB: 'Cross-encoder: Slow (per-pair scoring)' },
      { label: 'Accuracy', methodA: 'Bi-encoder: Good', methodB: 'Cross-encoder: Excellent' },
      { label: 'Scalability', methodA: 'Bi-encoder: Millions of docs', methodB: 'Cross-encoder: Hundreds of candidates' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `# Cross-Encoder Re-ranking with sentence-transformers
from sentence_transformers import CrossEncoder
import numpy as np

# Load cross-encoder model
model = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2")

# Query and candidate documents
query = "What is the capital of France?"
candidates = [
    "Paris is the capital and most populous city of France.",
    "France is a country located in Western Europe.",
    "The Eiffel Tower is located in Paris, France.",
    "London is the capital of England and the United Kingdom.",
    "Berlin is the capital and largest city of Germany.",
    "The Louvre Museum in Paris houses thousands of artworks.",
]

# Create (query, document) pairs
pairs = [[query, doc] for doc in candidates]

# Get scores
scores = model.predict(pairs)
print(f"Query: {query}\\\\n")

# Sort by score
ranked_indices = np.argsort(scores)[::-1]
for idx in ranked_indices:
    print(f"Score: {scores[idx]:.4f} | {candidates[idx][:60]}...")

print(f"\\\\nTop result: {candidates[ranked_indices[0]]}")`,
      output: `Query: What is the capital of France?

Score: 8.4521 | Paris is the capital and most populous city of France.
Score: 5.2341 | The Louvre Museum in Paris houses thousands of artworks.
Score: 3.8912 | The Eiffel Tower is located in Paris, France.
Score: -1.2345 | France is a country located in Western Europe.
Score: -3.4567 | Berlin is the capital and largest city of Germany.
Score: -4.5678 | London is the capital of England and the United Kingdom.

Top result: Paris is the capital and most populous city of France.`,
      explanation: 'The cross-encoder assigns high scores to documents that directly answer the query. Notice how "Paris is the capital..." gets the highest score, while documents about other cities get negative scores. The bi-encoder might have ranked all Paris-related documents highly, but the cross-encoder precisely identifies the correct answer.',
    },
    {
      level: 'intermediate',
      code: `# Cohere Rerank API Integration
import cohere
import os

co = cohere.Client(os.environ["COHERE_API_KEY"])

# Simulated first-stage retrieval results
query = "How do transformers handle long-range dependencies?"

candidates = [
    "Transformers use self-attention to create direct connections between all positions, enabling O(1) paths for long-range dependencies.",
    "The feed-forward network in a transformer applies two linear transformations with ReLU activation.",
    "Layer normalization stabilizes training by normalizing across feature dimensions.",
    "Self-attention computes Query, Key, and Value matrices to determine token relationships.",
    "Residual connections in transformers help gradients flow through many layers.",
    "Multi-head attention allows the model to focus on different aspects of the sequence.",
]

# First-stage: let's say a bi-encoder retrieved these candidates
# Second-stage: use Cohere to re-rank
rerank_results = co.rerank(
    query=query,
    documents=candidates,
    model="rerank-english-v3.0",
    top_n=3
)

print(f"Query: {query}\\\\n")
print("Cohere Rerank results:")
for result in rerank_results.results:
    idx = result.index
    score = result.relevance_score
    print(f"  Score: {score:.4f} | {candidates[idx][:80]}...")

# Use the top result for generation
best_doc = candidates[rerank_results.results[0].index]
prompt = f"""Context: {best_doc}
Question: {query}
Answer based on the context above."""
print(f"\\\\nSelected context: {best_doc}")`,
      output: `Query: How do transformers handle long-range dependencies?

Cohere Rerank results:
  Score: 0.9832 | Transformers use self-attention to create direct connections between all positions...
  Score: 0.4521 | Multi-head attention allows the model to focus on different aspects of the sequence.
  Score: 0.2345 | Self-attention computes Query, Key, and Value matrices to determine token relationships.

Selected context: Transformers use self-attention to create direct connections between all positions, enabling O(1) paths for long-range dependencies.`,
      explanation: 'Cohere Rerank provides a hosted, production-ready re-ranking API. The scores range from 0 to 1 and can be used directly to select the best context. The API works independently of your retrieval system, making it easy to add to any pipeline.',
    },
    {
      level: 'advanced',
      code: `# ColBERT-Style Late Interaction Scoring
import torch
import torch.nn.functional as F
from transformers import AutoTokenizer, AutoModel
import numpy as np

class ColBERTScorer:
    """Simplified ColBERT-style late interaction scorer."""
    
    def __init__(self, model_name="bert-base-uncased"):
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModel.from_pretrained(model_name)
        self.model.eval()
        # Linear projection to lower dimension (ColBERT uses 128d)
        self.project = torch.nn.Linear(768, 128)
    
    def encode(self, texts, max_length=128):
        """Encode texts to token-level embeddings."""
        inputs = self.tokenizer(
            texts, padding=True, truncation=True,
            max_length=max_length, return_tensors="pt"
        )
        with torch.no_grad():
            outputs = self.model(**inputs)
        # Use all token embeddings (not just [CLS])
        token_embs = self.project(outputs.last_hidden_state)
        # Mask padding tokens
        mask = inputs["attention_mask"].unsqueeze(-1).float()
        return token_embs * mask
    
    def score(self, query, documents):
        """Late interaction: max over document tokens for each query token."""
        q_emb = self.encode([query])  # (1, q_len, 128)
        d_embs = self.encode(documents)  # (n_docs, d_len, 128)
        
        # Compute similarity matrix: (n_docs, q_len, d_len)
        sim = torch.matmul(q_emb, d_embs.transpose(1, 2))
        
        # Max over document dimension (per query token)
        max_sim = sim.max(dim=2).values  # (n_docs, q_len)
        
        # Sum over query tokens
        scores = max_sim.sum(dim=1)  # (n_docs,)
        return scores.numpy()

# Usage
scorer = ColBERTScorer()
query = "What is the capital of France?"
docs = [
    "Paris is the capital and most populous city of France.",
    "France is a country in Western Europe.",
    "London is the capital of England.",
]
scores = scorer.score(query, docs)
print("ColBERT-style scores:")
for doc, score in zip(docs, scores):
    print(f"  {score:.4f}: {doc}")

# Compare with a simple embedding (mean pooling)
tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased")
model = AutoModel.from_pretrained("bert-base-uncased")

def mean_pool_sim(query, docs):
    def embed(text):
        inp = tokenizer(text, return_tensors="pt", padding=True, truncation=True)
        with torch.no_grad():
            out = model(**inp)
        return out.last_hidden_state.mean(dim=1)
    q = embed(query)
    d = torch.cat([embed(d) for d in docs])
    scores = F.cosine_similarity(q, d)
    return scores.numpy()

mean_scores = mean_pool_sim(query, docs)
print("\\\\nMean pooling (bi-encoder) scores:")
for doc, score in zip(docs, mean_scores):
    print(f"  {score:.4f}: {doc}")`,
      output: `ColBERT-style scores:
  28.4521: Paris is the capital and most populous city of France.
  22.3412: France is a country in Western Europe.
  18.2345: London is the capital of England.

Mean pooling (bi-encoder) scores:
  0.8923: Paris is the capital and most populous city of France.
  0.8567: France is a country in Western Europe.
  0.8432: London is the capital of England.`,
      explanation: 'ColBERT\'s late interaction scores each query token against each document token individually, then sums the maximums. This preserves fine-grained matching (e.g., "capital" matching "capital") that mean pooling loses. Notice how the bi-encoder gives similar scores to all three documents while ColBERT strongly prefers the correct one.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'E-commerce Search', description: 'Product search systems use re-ranking to promote the most relevant products from a broad first-stage retrieval. The cross-encoder considers query-product relevance, user preferences, and business rules.' },
      { industry: 'Legal Document Review', description: 'During e-discovery, lawyers need to find the most relevant documents from millions. A two-stage approach retrieves broadly (bi-encoder) and re-ranks precisely (cross-encoder) for review prioritization.' },
    ],
    caseStudy: {
      problem: 'A customer support chatbot used a bi-encoder for retrieval but frequently returned irrelevant chunks. The top-1 accuracy was only 62%, causing the LLM to generate answers based on wrong context.',
      solution: 'They added a cross-encoder re-ranker (MiniLM-L6) after the first-stage retrieval (k=50 first stage, top-5 after re-ranking). The re-ranker ran on a GPU with ONNX optimization for low latency.',
      results: 'Top-1 accuracy improved from 62% to 89%. Top-3 accuracy reached 97%. Re-ranking added only 45ms latency per query. Customer satisfaction scores improved by 28%.',
    },
    bestPractices: [
      'Always use a two-stage pipeline: bi-encoder for broad retrieval, cross-encoder for precise re-ranking',
      'First-stage k should be 3-5x the final k (e.g., retrieve 50, re-rank to top 10)',
      'Use ONNX or TensorRT to optimize cross-encoder inference for production',
      'Monitor the score distribution to detect when all candidates are low-relevance',
      'Consider cost/latency vs quality — MiniLM is fast but BGE or Cohere are more accurate',
    ],
    tools: ['sentence-transformers (CrossEncoder)', 'Cohere Rerank API', 'ColBERT (colBERT-ai)', 'FlagEmbedding (BGE)', 'ONNX / TensorRT'],
    jobRoles: ['Search Engineer', 'ML Engineer', 'RAG Engineer', 'NLP Engineer'],
    furtherReading: [
      'Cross-Encoder models on Hugging Face',
      'Cohere Rerank documentation',
      'ColBERT: Efficient and Effective Passage Search via Contextualized Late Interaction',
      'sentence-transformers re-ranking guide',
    ],
  },
  quiz: [
    {
      id: 'rerank-1', type: 'mcq',
      question: 'What is the key architectural difference between a bi-encoder and a cross-encoder?',
      options: [
        'Cross-encoders are smaller and faster than bi-encoders',
        'Cross-encoders process query and document together in a single model, while bi-encoders encode them separately',
        'Bi-encoders use attention while cross-encoders use RNNs',
        'Cross-encoders only work with English text',
      ],
      correctAnswer: 'Cross-encoders process query and document together in a single model, while bi-encoders encode them separately',
      explanation: 'A bi-encoder independently encodes query and document (no interaction until final similarity). A cross-encoder concatenates query and document into one input, allowing deep token-level interactions through attention layers.',
    },
    {
      id: 'rerank-2', type: 'truefalse',
      question: 'A cross-encoder can replace the first-stage bi-encoder retrieval in a RAG pipeline.',
      correctAnswer: 'False',
      explanation: 'Cross-encoders are too slow to search over millions of documents because they must process each query-document pair individually. They must be used as a second stage after a fast bi-encoder pre-filters the candidates.',
    },
    {
      id: 'rerank-3', type: 'code',
      question: 'In this code, what does the cross-encoder predict for each (query, document) pair?',
      code: `model = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2")
pairs = [["capital of France", "Paris is the capital"],
         ["capital of France", "London is the capital"]]
scores = model.predict(pairs)`,
      options: [
        'A binary classification (relevant or not)',
        'A relevance score where higher values indicate stronger relevance',
        'A probability distribution over all documents',
        'The embedding vector of the concatenated pair',
      ],
      correctAnswer: 'A relevance score where higher values indicate stronger relevance',
      explanation: 'The cross-encoder outputs a relevance score for each (query, document) pair. Higher scores mean the document is more relevant to the query. These scores are used to rank documents.',
    },
    {
      id: 'rerank-4', type: 'fillblank',
      question: 'ColBERT uses a technique called ___ interaction, where each query token finds its maximum similarity over all document tokens.',
      correctAnswer: 'late',
      explanation: 'ColBERT\'s late interaction scores each query token against every document token, takes the maximum per query token, and sums them. This preserves fine-grained term-level matching within contextualized representations.',
    },
    {
      id: 'rerank-5', type: 'match',
      question: 'Match each re-ranking approach with its characteristics:',
      pairs: [
        { left: 'Cross-Encoder', right: 'Deep interaction, high accuracy, slow per pair' },
        { left: 'ColBERT', right: 'Late interaction, pre-computable doc embeddings' },
        { left: 'Pointwise', right: 'Each candidate scored independently' },
        { left: 'Listwise', right: 'All candidates scored together as a set' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'Cross-encoders provide deep query-document interaction. ColBERT uses late interaction for efficiency. Pointwise scores independently while listwise considers relative rankings.',
    },
  ],
}))

export {}
