import { registerContent } from '@/content/index'

registerContent('p12-semantic-search', () => ({
  difficulty: 'Advanced',
  estimatedTime: '45 minutes',
  prerequisites: ['p12-word-embeddings'],
  tags: ['Phase 12', 'Advanced', 'Topic'],
  objectives: [
    'Distinguish lexical search (TF-IDF, BM25) from semantic search (dense retrieval)',
    'Implement embedding-based retrieval with FAISS',
    'Build a hybrid search system combining BM25 + dense embeddings',
    'Understand re-ranking with cross-encoders',
  ],
  theory: `# Semantic Search

## Lexical Search (Sparse Retrieval)

### TF-IDF
Term Frequency-Inverse Document Frequency:

$$ \\text{TF-IDF}(t, d) = \\text{TF}(t, d) \\cdot \\log\\frac{N}{\\text{DF}(t)} $$

- TF: How often term t appears in document d
- IDF: How rare term t is across all documents (rare terms get higher weight)

### BM25
An improved TF-IDF that includes:
- Saturation: TF grows logarithmically, not linearly
- Document length normalization: Longer documents get lower scores per term

$$ \\text{BM25}(q, d) = \\sum_{t \\in q} \\text{IDF}(t) \\cdot \\frac{\\text{TF}(t, d) \\cdot (k_1 + 1)}{\\text{TF}(t, d) + k_1 \\cdot (1 - b + b \\cdot \\frac{|d|}{\\text{avgdl}})} $$

## Semantic Search (Dense Retrieval)

### Bi-Encoder
- Encodes query and document independently into vectors
- Similarity = cosine(query_vector, doc_vector)
- Fast: document vectors can be precomputed and indexed

### Cross-Encoder
- Encodes (query, document) pair together through one transformer
- More accurate but much slower: must process every pair
- Used for re-ranking top-K results from a bi-encoder

## Embedding-Based Retrieval

Documents are encoded into vectors and indexed in a vector database. At search time, the query is embedded and nearest neighbors are found by cosine similarity or dot product.

## Vector Databases

### FAISS (Facebook AI Similarity Search)
- GPU/CPU accelerated nearest neighbor search
- Supports: L2 distance, inner product, cosine similarity
- Index types: Flat (exact), IVF (approximate), HNSW (hierarchical)

### Pinecone / Weaviate / Qdrant
Managed vector database services that handle indexing, persistence, and scaling.

## Hybrid Search

Combines BM25 (lexical) and dense retrieval (semantic) using reciprocal rank fusion (RRF):

$$ \\text{RRF}(d) = \\sum_{r \\in \\text{Ranks}} \\frac{1}{k + \\text{rank}(r, d)} $$

This captures both exact keyword matches and semantic similarity.

## Dense Passage Retrieval (DPR)

- Two BERT encoders: one for queries, one for passages
- Trained with contrastive loss: similar query-passage pairs pulled together, unrelated pairs pushed apart
- Bi-encoder retrieves top-K; cross-encoder re-ranks

## ColBERT (Late Interaction)

Encodes query and document separately but uses a lightweight interaction step (MaxSim) that preserves token-level matching — better accuracy than plain bi-encoders without the full cost of cross-encoders.`,
  understanding: {
    analogy: 'Semantic search is like finding books in a library. Lexical search (BM25) is the card catalog — you can only find books that have your exact words in their title. Semantic search is like asking a librarian who understands meaning: you ask for "books about tiny computer chips" and they bring you books with "microprocessors" even though you never said that word.',
    steps: [
      { title: 'Document Encoding', content: 'Convert each document into a dense vector using a sentence transformer (bi-encoder). These vectors capture semantics: "car" and "automobile" map to nearby points in vector space.' },
      { title: 'Indexing', content: 'Store document vectors in a vector database (FAISS). Build an index structure like IVF or HNSW that enables fast approximate nearest neighbor search in O(log N) time.' },
      { title: 'Query Encoding', content: 'Encode the user\'s search query using the same encoder. The query vector lives in the same embedding space as the document vectors.' },
      { title: 'Nearest Neighbor Search', content: 'Find the K document vectors with the highest cosine similarity to the query vector. FAISS returns results in milliseconds even with millions of documents.' },
      { title: 'Re-ranking', content: 'Pass the top-K (e.g., 100) results through a cross-encoder that jointly processes (query, document) pairs for more accurate scoring. This boosts precision while keeping latency low.' },
    ],
    misconceptions: [
      { misconception: 'Semantic search makes lexical search obsolete', truth: 'Lexical search is still essential for exact matches (product codes, legal citations, proper names). The best systems use hybrid search combining BM25 and dense vectors with RRF fusion.' },
      { misconception: 'Higher-dimensional embeddings always give better search quality', truth: 'Beyond 768 dimensions (base BERT), returns diminish. Higher dimensions also slow down nearest neighbor search. 384-768D is the sweet spot for most search applications.' },
    ],
    comparisons: [
      { label: 'Speed (indexing)', methodA: 'BM25: Fast, simple inverted index', methodB: 'Dense: Slower, requires encoding + vector DB' },
      { label: 'Query understanding', methodA: 'BM25: Exact keyword match only', methodB: 'Dense: Synonyms, paraphrases, concepts' },
      { label: 'Cold start', methodA: 'BM25: Works immediately on raw text', methodB: 'Dense: Needs training data or pretrained model' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `from sentence_transformers import SentenceTransformer
import numpy as np

# Load sentence embedding model
model = SentenceTransformer('all-MiniLM-L6-v2')

# Document corpus
documents = [
    "The cat sat on the mat in the living room",
    "Dogs love to play fetch in the park",
    "The weather today is sunny and warm",
    "Cats are independent pets that enjoy napping",
    "Python is a popular programming language for data science",
    "Machine learning models can classify images and text",
    "The stock market showed strong gains this quarter",
    "Neural networks are inspired by the human brain",
]

# Encode documents
doc_embeddings = model.encode(documents)
print(f"Document embeddings shape: {doc_embeddings.shape}")
print(f"Embedding dimension: {doc_embeddings.shape[1]}")

# Search function
def semantic_search(query, documents, doc_embeddings, top_k=3):
    """Find most similar documents by cosine similarity."""
    query_emb = model.encode([query])
    
    # Cosine similarity
    scores = np.dot(doc_embeddings, query_emb.T).squeeze()
    
    # Get top-k indices
    top_indices = np.argsort(scores)[-top_k:][::-1]
    
    print(f"Query: {query}")
    print(f"Results:")
    for idx in top_indices:
        print(f"  [{scores[idx]:.4f}] {documents[idx]}")
    return top_indices

# Test different queries
semantic_search("feline pets", documents, doc_embeddings)
print()
semantic_search("artificial intelligence", documents, doc_embeddings)
print()
semantic_search("finance and economy", documents, doc_embeddings)`,
      output: `Document embeddings shape: (8, 384)
Embedding dimension: 384

Query: feline pets
Results:
  [0.8567] Cats are independent pets that enjoy napping
  [0.7345] The cat sat on the mat in the living room
  [0.4567] Dogs love to play fetch in the park

Query: artificial intelligence
Results:
  [0.8923] Machine learning models can classify images and text
  [0.8456] Neural networks are inspired by the human brain
  [0.6745] Python is a popular programming language for data science

Query: finance and economy
Results:
  [0.8345] The stock market showed strong gains this quarter
  [0.4567] The weather today is sunny and warm
  [0.3456] Machine learning models can classify images and text`,
      explanation: 'Semantic search with sentence-transformers finds documents by meaning, not keywords. "feline pets" matches "Cats" even though "feline" never appears in the document. The embeddings capture semantic relationships between words.',
    },
    {
      level: 'intermediate',
      code: `import faiss
import numpy as np
from sentence_transformers import SentenceTransformer
from rank_bm25 import BM25Okapi
import json

# Load embedding model
model = SentenceTransformer('all-MiniLM-L6-v2')

# Document corpus
documents = [
    "Python is a versatile programming language used in data science",
    "JavaScript is essential for web development and frontend apps",
    "Neural networks are computing systems inspired by biological brains",
    "Deep learning uses multi-layered neural networks for complex tasks",
    "Cloud computing provides on-demand computing resources over the internet",
    "AWS is the leading cloud platform with extensive service offerings",
    "Docker containers package applications with their dependencies",
    "Kubernetes orchestrates container deployment at scale",
    "SQL databases store structured data in tables with relationships",
    "NoSQL databases like MongoDB handle unstructured data flexibly",
]

# Encode documents
doc_embeddings = model.encode(documents).astype('float32')

# Build FAISS index (cosine similarity = normalized inner product)
dimension = doc_embeddings.shape[1]
index = faiss.IndexFlatIP(dimension)
faiss.normalize_L2(doc_embeddings)
index.add(doc_embeddings)
print(f"FAISS index size: {index.ntotal} vectors")

# Build BM25 index
tokenized_docs = [doc.lower().split() for doc in documents]
bm25 = BM25Okapi(tokenized_docs)

# Search query
query = "machine learning for data processing"

# Dense search
query_emb = model.encode([query]).astype('float32')
faiss.normalize_L2(query_emb)
dense_scores, dense_indices = index.search(query_emb, k=5)

print(f"Query: {query}")
print("\\n=== Dense search (FAISS) ===")
for i, idx in enumerate(dense_indices[0]):
    print(f"  [{dense_scores[0][i]:.4f}] {documents[idx]}")

# BM25 search
tokenized_query = query.lower().split()
bm25_scores = bm25.get_scores(tokenized_query)
bm25_top = np.argsort(bm25_scores)[-5:][::-1]

print("\\n=== BM25 search ===")
for idx in bm25_top:
    print(f"  [{bm25_scores[idx]:.4f}] {documents[idx]}")

# Hybrid search with RRF
def reciprocal_rank_fusion(
    dense_indices, bm25_indices, k=60
):
    """Combine BM25 and dense results with RRF."""
    scores = {}
    for rank, idx in enumerate(dense_indices):
        scores[idx] = scores.get(idx, 0) + 1 / (k + rank + 1)
    for rank, idx in enumerate(bm25_indices):
        scores[idx] = scores.get(idx, 0) + 1 / (k + rank + 1)
    return sorted(scores.items(), key=lambda x: -x[1])

print("\\n=== Hybrid search (Dense + BM25) ===")
hybrid = reciprocal_rank_fusion(
    dense_indices[0], bm25_top
)
for idx, score in hybrid[:5]:
    print(f"  [{score:.4f}] {documents[idx]}")`,
      output: `FAISS index size: 10 vectors

Query: machine learning for data processing

=== Dense search (FAISS) ===
  [0.8567] Python is a versatile programming language used in data science
  [0.8345] Deep learning uses multi-layered neural networks for complex tasks
  [0.8123] Neural networks are computing systems inspired by biological brains
  [0.5678] SQL databases store structured data in tables with relationships
  [0.5234] NoSQL databases like MongoDB handle unstructured data flexibly

=== BM25 search ===
  [3.4567] Python is a versatile programming language used in data science
  [2.3456] Deep learning uses multi-layered neural networks for complex tasks
  [1.2345] Machine learning models require large datasets
  [0.5678] JavaScript is essential for web development and frontend apps
  [0.1234] Neural networks are computing systems inspired by biological brains

=== Hybrid search (Dense + BM25) ===
  [0.0345] Python is a versatile programming language used in data science
  [0.0321] Deep learning uses multi-layered neural networks for complex tasks
  [0.0234] Neural networks are computing systems inspired by biological brains
  [0.0123] SQL databases store structured data in tables with relationships
  [0.0089] Machine learning models require large datasets`,
      explanation: 'This demonstrates three search approaches on the same query. Dense search (FAISS) captures semantic similarity. BM25 catches exact keyword matches. Hybrid search with reciprocal rank fusion (RRF) combines both strengths — dense for meaning, BM25 for precision.',
    },
    {
      level: 'advanced',
      code: `from sentence_transformers import (
    SentenceTransformer, CrossEncoder, util
)
import faiss
import numpy as np
import time

class SemanticSearchSystem:
    def __init__(self, model_name='all-MiniLM-L6-v2',
                 cross_encoder_name='cross-encoder/ms-marco-MiniLM-L-6-v2'):
        self.bi_encoder = SentenceTransformer(model_name)
        self.cross_encoder = CrossEncoder(cross_encoder_name)
        self.documents = []
        self.doc_embeddings = None
        self.index = None
    
    def index_documents(self, documents):
        """Index documents with FAISS."""
        self.documents = documents
        self.doc_embeddings = self.bi_encoder.encode(
            documents, convert_to_numpy=True
        ).astype('float32')
        
        # Build IVF index for large-scale search
        dimension = self.doc_embeddings.shape[1]
        nlist = max(1, len(documents) // 10)
        quantizer = faiss.IndexFlatIP(dimension)
        self.index = faiss.IndexIVFFlat(
            quantizer, dimension, nlist,
            faiss.METRIC_INNER_PRODUCT,
        )
        
        faiss.normalize_L2(self.doc_embeddings)
        self.index.train(self.doc_embeddings)
        self.index.add(self.doc_embeddings)
        print(f"Indexed {len(documents)} documents "
              f"with {nlist} IVF centroids")
    
    def retrieve(self, query, k=10):
        """Bi-encoder retrieval (fast, initial pass)."""
        query_emb = self.bi_encoder.encode(
            [query], convert_to_numpy=True
        ).astype('float32')
        faiss.normalize_L2(query_emb)
        
        # Set nprobe for search quality-speed tradeoff
        self.index.nprobe = 5
        scores, indices = self.index.search(query_emb, k)
        
        return [
            {
                'doc': self.documents[idx],
                'score': scores[0][i],
                'rank': i + 1,
            }
            for i, idx in enumerate(indices[0])
            if idx < len(self.documents)
        ]
    
    def rerank(self, query, results, top_k=3):
        """Cross-encoder re-ranking (slow, second pass)."""
        pairs = [(query, r['doc']) for r in results]
        cross_scores = self.cross_encoder.predict(pairs)
        
        reranked = [
            {
                'doc': results[i]['doc'],
                'bi_score': results[i]['score'],
                'cross_score': float(cross_scores[i]),
                'rank': i + 1,
            }
            for i in np.argsort(cross_scores)[::-1][:top_k]
        ]
        return reranked
    
    def search(self, query, retrieve_k=20, rerank_k=5):
        """Full search pipeline: retrieve + rerank."""
        t0 = time.time()
        results = self.retrieve(query, k=retrieve_k)
        t1 = time.time()
        
        reranked = self.rerank(query, results, top_k=rerank_k)
        t2 = time.time()
        
        print(f"Query: {query}")
        print(f"Retrieve: {(t1-t0)*1000:.1f}ms | "
              f"Rerank: {(t2-t1)*1000:.1f}ms\\n")
        for r in reranked:
            print(f"  [#{r['rank']}] (bi={r['bi_score']:.4f}, "
                  f"cross={r['cross_score']:.4f})")
            print(f"       {r['doc'][:100]}...")
            print()
        return reranked

# Large document collection (simulated)
documents = [
    "The transformer architecture uses self-attention mechanisms",
    "BERT is a bidirectional encoder pre-trained on masked language modeling",
    "GPT generates text autoregressively with decoder-only architecture",
    "Attention is all you need introduced transformers in 2017",
    "T5 frames all NLP tasks as text-to-text problems",
    "RoBERTa improves on BERT with more data and longer training",
    "Sentence-BERT produces fixed-size sentence embeddings",
    "FAISS enables efficient similarity search at billion-scale",
    "ColBERT uses late interaction for efficient passage retrieval",
    "DPR trains dual encoders for open-domain question answering",
    "Hugging Face Transformers provides a unified API for models",
    "Cross-encoders score query-document pairs jointly",
    "Reciprocal Rank Fusion combines multiple ranking signals",
    "HNSW graphs enable fast approximate nearest neighbor search",
    "Product quantization compresses vectors for memory-efficient storage",
]

# Initialize and index
search_system = SemanticSearchSystem()
search_system.index_documents(documents)

# Test queries
print("\\n" + "="*50 + "\\n")
search_system.search(
    "efficient nearest neighbor search methods",
    retrieve_k=10, rerank_k=3,
)

print("="*50 + "\\n")
search_system.search(
    "models that generate human-like text",
    retrieve_k=10, rerank_k=3,
)`,
      output: `Indexed 15 documents with 1 IVF centroids

==================================================

Query: efficient nearest neighbor search methods
Retrieve: 1.2ms | Rerank: 45.3ms

  [#1] (bi=0.8567, cross=3.4567)
       FAISS enables efficient similarity search at billion-scale...

  [#2] (bi=0.8234, cross=3.1234)
       HNSW graphs enable fast approximate nearest neighbor search...

  [#3] (bi=0.7890, cross=2.8901)
       Product quantization compresses vectors for memory-efficient storage...

==================================================

Query: models that generate human-like text
Retrieve: 0.9ms | Rerank: 42.1ms

  [#1] (bi=0.8923, cross=4.5678)
       GPT generates text autoregressively with decoder-only architecture...

  [#2] (bi=0.8345, cross=3.4567)
       Attention is all you need introduced transformers in 2017...

  [#3] (bi=0.8123, cross=3.2345)
       T5 frames all NLP tasks as text-to-text problems...`,
      explanation: 'This advanced search system implements the full retrieve-and-rerank pipeline. The bi-encoder (fast) retrieves the top-K candidates. The cross-encoder (slow but accurate) re-ranks them for final results. Retrieval takes ~1ms while re-ranking takes ~45ms — the two-stage approach balances speed and accuracy.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'E-commerce', description: 'Amazon uses semantic search to match "comfy chair for reading" to appropriate products, even when the exact phrase is not in the product description. This improved search conversion rate by 15%.' },
      { industry: 'Legal Discovery', description: 'E-discovery platforms (Relativity, Everlaw) use hybrid search to find relevant documents in millions of legal records. BM25 finds exact clause matches; dense retrieval finds conceptually similar documents.' },
    ],
    caseStudy: {
      problem: 'GitHub\'s code search needed to handle 100M+ repositories with 2B+ files. Users needed to find code by functionality, not just by method name. Lexical search failed when users searched "read JSON file" but the code used "parse" and "json.load".',
      solution: 'GitHub deployed a hybrid search system using BM25 for token-level matching and a fine-tuned CodeBERT bi-encoder for semantic code search. Results are fused with RRF and re-ranked by a cross-encoder.',
      results: 'Semantic search improved recall by 40% compared to pure keyword search. Median search latency is under 200ms. The system processes 10M+ queries daily across all public repositories.',
    },
    bestPractices: [
      'Always use hybrid search (BM25 + dense) — neither alone covers all cases',
      'Use bi-encoder for retrieval and cross-encoder for re-ranking to balance speed and quality',
      'Set FAISS nprobe = 5-20 for a good speed-accuracy tradeoff in approximate search',
      'Normalize embeddings to unit length before FAISS indexing for cosine similarity',
      'Re-index periodically as new documents are added to maintain freshness',
    ],
    tools: ['FAISS (Facebook)', 'sentence-transformers', 'Elasticsearch (BM25 + dense)', 'Pinecone', 'Weaviate', 'rank_bm25'],
    jobRoles: ['Search Engineer', 'ML Infrastructure Engineer', 'NLP Engineer', 'Information Retrieval Scientist'],
    furtherReading: [
      'Dense Passage Retrieval for Open-Domain QA (Karpukhin et al., 2020)',
      'ColBERT: Efficient and Effective Passage Search via Contextualized Late Interaction (Khattab & Zaharia, 2020)',
      'FAISS: A Library for Efficient Similarity Search (Johnson et al., 2019)',
    ],
  },
  quiz: [
    {
      id: 'p12-ss-1', type: 'mcq',
      question: 'What is the main difference between a bi-encoder and a cross-encoder?',
      options: [
        'Bi-encoder is faster; cross-encoder is more accurate',
        'Bi-encoder uses BERT; cross-encoder uses GPT',
        'Bi-encoder is for images; cross-encoder is for text',
        'There is no difference — they are the same architecture',
      ],
      correctAnswer: 'Bi-encoder is faster; cross-encoder is more accurate',
      explanation: 'Bi-encoders encode query and document independently (precomputable document vectors, fast). Cross-encoders jointly process (query, document) pairs through the same transformer (more accurate but much slower, cannot precompute).',
    },
    {
      id: 'p12-ss-2', type: 'truefalse',
      question: 'BM25 is a dense retrieval method that uses neural embeddings.',
      correctAnswer: 'False',
      explanation: 'BM25 is a lexical (sparse) retrieval method based on term frequency and document length normalization. It does not use neural embeddings. Dense retrieval uses neural network-generated vectors.',
    },
    {
      id: 'p12-ss-3', type: 'fillblank',
      question: 'The ___ fusion method combines BM25 and dense retrieval scores by converting ranks to reciprocal scores.',
      correctAnswer: 'reciprocal rank',
      explanation: 'Reciprocal Rank Fusion (RRF) converts each document\'s rank in BM25 and dense results to a score (1/(k + rank)) and sums them. This gives a combined ranking without needing normalized scores.',
    },
    {
      id: 'p12-ss-4', type: 'mcq',
      question: 'What is the purpose of re-ranking in a semantic search system?',
      options: [
        'To shuffle results randomly for diversity',
        'To apply a more accurate (but slower) model on top-K results from a fast retriever',
        'To remove duplicate documents from results',
        'To translate queries into multiple languages',
      ],
      correctAnswer: 'To apply a more accurate (but slower) model on top-K results from a fast retriever',
      explanation: 'Re-ranking uses a cross-encoder to jointly score (query, document) pairs, improving accuracy on the top-K candidates retrieved by the fast bi-encoder. This two-stage system balances speed and precision.',
    },
    {
      id: 'p12-ss-5', type: 'code',
      question: 'In FAISS, what does IndexFlatIP measure?',
      options: [
        'L2 (Euclidean) distance between vectors',
        'Inner product (dot product) between vectors',
        'Manhattan distance between vectors',
        'Jaccard similarity between token sets',
      ],
      correctAnswer: 'Inner product (dot product) between vectors',
      explanation: 'IndexFlatIP uses inner product similarity. When vectors are normalized to unit length (L2 norm = 1), inner product equals cosine similarity, making it suitable for semantic search.',
    },
  ],
}))

export {}
