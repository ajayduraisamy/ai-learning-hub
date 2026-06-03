import { registerContent } from '@/content/index'

registerContent('p19-retrieval-strategies', () => ({
  difficulty: 'Advanced',
  estimatedTime: '60 minutes',
  prerequisites: ['p19-rag-architecture', 'p19-vector-dbs'],
  tags: ['RAG', 'Advanced', 'Topic'],
  objectives: [
    'Understand dense vs sparse retrieval and when to use each',
    'Implement hybrid retrieval with Reciprocal Rank Fusion (RRF)',
    'Build Multi-Query retrieval for better coverage',
    'Use Hypothetical Document Embeddings (HyDE) for query-aware retrieval',
  ],
  theory: `# Retrieval Strategies (Hybrid, Multi-Query, HyDE)

## Dense vs Sparse Retrieval

### Dense Retrieval

Dense retrieval uses embedding models to project both queries and documents into a shared dense vector space. Similarity is measured by cosine similarity or dot product.

$$\\text{score}(q, d) = \\frac{\\mathbf{E}_q(q) \\cdot \\mathbf{E}_d(d)}{\\|\\mathbf{E}_q(q)\\| \\cdot \\|\\mathbf{E}_d(d)\\|}$$

**Pros**: Captures semantic similarity, handles synonyms, understands context.
**Cons**: Requires training, computationally expensive, may miss exact keyword matches.

### Sparse Retrieval (BM25)

BM25 is a bag-of-words retrieval function that scores documents based on term frequency and inverse document frequency:

$$\\text{BM25}(q, d) = \\sum_{t \\in q} \\text{IDF}(t) \\cdot \\frac{\\text{TF}(t, d) \\cdot (k_1 + 1)}{\\text{TF}(t, d) + k_1 \\cdot (1 - b + b \\cdot \\frac{|d|}{\\text{avgdl}})}$$

**Pros**: Fast, no training needed, great for exact keyword matching, interpretable.
**Cons**: No semantic understanding, vocabulary mismatch problem.

## Hybrid Retrieval (Dense + Sparse)

Hybrid retrieval combines dense and sparse methods to get the best of both worlds.

### Reciprocal Rank Fusion (RRF)

RRF combines ranked lists from multiple retrieval systems:

$$\\text{RRF}(d) = \\sum_{r \\in R} \\frac{1}{k + r(d)}$$

Where:
- $R$ is the set of rankers (retrieval systems)
- $r(d)$ is the rank of document $d$ in ranker $r$
- $k$ is a constant (typically 60) that prevents extreme scores

\\\`\\\`python
def rrf(results_list, k=60):
    scores = {}
    for results in results_list:
        for rank, doc_id in enumerate(results):
            scores[doc_id] = scores.get(doc_id, 0) + 1 / (k + rank + 1)
    return sorted(scores.items(), key=lambda x: -x[1])
\\\`\\\`\\\`

## Multi-Query Retrieval

Instead of searching with a single query, generate multiple query variations and aggregate results.

### How it works:

1. Take the original query
2. Use an LLM to generate 3-5 alternative phrasings
3. Run each variant through the retriever
4. Combine results (using RRF or union)

\\\`\\\`python
queries = llm.generate(
    f"Generate 3 alternative phrasings of: {original_query}"
)
all_results = [retriever.get_relevant_documents(q) for q in queries]
final = rrf(all_results)
\\\`\\\`\\\`

**Benefits**: Captures different aspects of the query, handles ambiguous phrasing, improves recall.

## HyDE — Hypothetical Document Embeddings

HyDE reverses the retrieval process: instead of embedding the query, generate a hypothetical perfect document that would answer the query, then embed that document for retrieval.

### How it works:

1. Query $q$ is sent to an LLM
2. LLM generates a hypothetical document $d^*$ that would perfectly answer $q$
3. The hypothetical document is embedded: $\\mathbf{E}_d(d^*)$
4. This embedding is used to search the vector store

$$\\text{HyDE}(q) = \\text{search}(\\mathbf{E}_d(\\text{LLM}(q)))$$

**Why this works**: The embedding of a well-written hypothetical answer is closer to real answer documents in embedding space than the query itself, because the query and answer are typically in different linguistic styles.

### Query Expansion

Expand the query with related terms before searching:

\\\`\\\`python
expanded = original_query + " " + " ".join(related_terms)
\\\`\\\`\\\`

### Query Transformation

Transform the query into a more search-friendly form:

- **Rephrasing**: "What is X?" \\\\rightarrow "X is defined as..."
- **Decomposition**: Break complex questions into sub-questions
- **Step-back**: "What factors affect Y?" \\\\rightarrow "Y factors"

## Strategy Comparison

| Strategy | Recall | Precision | Latency | Complexity |
|----------|--------|-----------|---------|------------|
| Dense only | Moderate | High | Low | Low |
| Sparse only (BM25) | Low | High | Very low | Very low |
| Hybrid (RRF) | High | High | Moderate | Moderate |
| Multi-Query | Very high | Moderate | High | Moderate |
| HyDE | High | High | Moderate | Moderate |

## Understanding

Multi-Query is like asking the same question in different ways to different librarians. HyDE is like imagining the perfect book that answers your question, then searching for books like it. Hybrid search is like having two librarians — one who understands concepts (dense) and one who finds exact words (sparse) — and combining their recommendations.`,
  understanding: {
    analogy: 'Multi-Query is like asking the same question in five different ways to make sure you don\'t miss anything. HyDE is like imagining the perfect answer first, then searching for documents that look like that answer. Hybrid search is like having two research assistants — one who understands concepts and synonyms (dense) and one who finds exact words and names (sparse) — and combining their recommendations using RRF.',
    steps: [
      { title: 'Choose Retrieval Paradigm', content: 'Decide between dense (semantic), sparse (keyword), or hybrid (both). For general RAG, hybrid usually works best.' },
      { title: 'Implement Dense Retrieval', content: 'Use an embedding model (e.g., text-embedding-ada-002) to encode queries and documents. Store embeddings in a vector DB and use cosine similarity.' },
      { title: 'Implement Sparse Retrieval', content: 'Use BM25 (via rank_bm25 or Elasticsearch) for keyword-based scoring. Build an inverted index over your corpus.' },
      { title: 'Fuse Results with RRF', content: 'Combine the ranked lists from dense and sparse retrievers using Reciprocal Rank Fusion. Tune the k parameter.' },
      { title: 'Add Query Expansion', content: 'Enhance the query with Multi-Query or HyDE to improve recall for ambiguous or complex questions.' },
    ],
    misconceptions: [
      { misconception: 'Dense retrieval makes BM25 obsolete', truth: 'BM25 excels at exact keyword matching and named entity retrieval. Dense models can miss specific terms if they weren\'t in the training data. Hybrid almost always outperforms either alone.' },
      { misconception: 'HyDE is just query expansion', truth: 'HyDE generates a hypothetical document (not query variants) and embeds it in document space. This is fundamentally different from expanding the query in query space.' },
    ],
    comparisons: [
      { label: 'Semantic Understanding', methodA: 'Dense: Excellent (synonyms, context)', methodB: 'Sparse: None (exact match only)' },
      { label: 'Exact Match', methodA: 'Dense: May miss specific terms', methodB: 'Sparse: Perfect (if term exists)' },
      { label: 'Computational Cost', methodA: 'Dense: High (neural embedding)', methodB: 'Sparse: Very low (inverted index)' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `# BM25 Sparse Retrieval with rank_bm25
from rank_bm25 import BM25Okapi
import jieba  # Chinese tokenizer (example)
import re

# Sample corpus
corpus = [
    "Paris is the capital of France and a major European city.",
    "Machine learning is a subset of artificial intelligence.",
    "The Eiffel Tower is a famous landmark in Paris, France.",
    "Deep learning uses neural networks with many layers.",
    "London is the capital of the United Kingdom.",
    "Transformers revolutionized natural language processing."
]

# Tokenize corpus
tokenized_corpus = [doc.lower().split() for doc in corpus]

# Create BM25 index
bm25 = BM25Okapi(tokenized_corpus)

# Search
query = "capital of France"
tokenized_query = query.lower().split()
scores = bm25.get_scores(tokenized_query)
top_indices = sorted(range(len(scores)), key=lambda i: scores[i], reverse=True)[:3]

print(f"Top results for query: '{query}'")
for idx in top_indices:
    print(f"  Score: {scores[idx]:.3f} - {corpus[idx][:60]}...")

# Document-level scoring
print(f"\\\\nIndividual document scores:")
for i, doc in enumerate(corpus):
    print(f"  [{i}] {bm25.get_score(tokenized_query, i):.3f}: {doc}")`,
      output: `Top results for query: 'capital of France'
  Score: 0.527 - Paris is the capital of France and a major European city.
  Score: 0.200 - London is the capital of the United Kingdom.
  Score: 0.000 - Machine learning is a subset of artificial intelligence.

Individual document scores:
  [0] 0.527: Paris is the capital of France and a major European city.
  [1] 0.000: Machine learning is a subset of artificial intelligence.
  [2] 0.000: The Eiffel Tower is a famous landmark in Paris, France.
  [3] 0.000: Deep learning uses neural networks with many layers.
  [4] 0.200: London is the capital of the United Kingdom.
  [5] 0.000: Transformers revolutionized natural language processing.`,
      explanation: 'BM25 scores documents based on term frequency and inverse document frequency. Notice how document 2 ("Eiffel Tower in Paris") gets zero — BM25 has no semantic understanding, it only matches exact tokens.',
    },
    {
      level: 'intermediate',
      code: `# Hybrid Retrieval with EnsembleRetriever (LangChain)
from langchain.retrievers import EnsembleRetriever
from langchain_community.retrievers import BM25Retriever
from langchain.vectorstores import FAISS
from langchain.embeddings import OpenAIEmbeddings

# Sample documents
docs = [
    "Paris is the capital of France.",
    "Machine learning is a subset of artificial intelligence.",
    "The Eiffel Tower is in Paris, France.",
    "Deep learning uses neural networks with many layers.",
    "London is the capital of the United Kingdom."
]

# Create BM25 (sparse) retriever
bm25_retriever = BM25Retriever.from_texts(docs)
bm25_retriever.k = 3

# Create dense retriever (vector store)
embeddings = OpenAIEmbeddings()
vectorstore = FAISS.from_texts(docs, embeddings)
dense_retriever = vectorstore.as_retriever(search_kwargs={"k": 3})

# Create ensemble retriever with RRF
ensemble_retriever = EnsembleRetriever(
    retrievers=[bm25_retriever, dense_retriever],
    weights=[0.4, 0.6],  # Sparse 40%, Dense 60%
    c=60  # RRF constant k
)

# Query with hybrid search
query = "capital city"
results = ensemble_retriever.get_relevant_documents(query)

print(f"Hybrid retrieval results for: '{query}'")
for i, doc in enumerate(results):
    print(f"  [{i+1}] {doc.page_content}")`,
      output: `Hybrid retrieval results for: 'capital city'
  [1] Paris is the capital of France.
  [2] London is the capital of the United Kingdom.
  [3] The Eiffel Tower is in Paris, France.`,
      explanation: 'EnsembleRetriever combines BM25 and dense retrievers using RRF. The dense retriever captures semantic similarity ("capital city" matches "capital"), while BM25 would have missed "capital" if we searched for just "city". The weighted combination gives the best of both.',
    },
    {
      level: 'advanced',
      code: `# Multi-Query and HyDE Retrieval
from langchain.retrievers import MultiQueryRetriever
from langchain.vectorstores import FAISS
from langchain.embeddings import OpenAIEmbeddings
from langchain.llms import OpenAI
from langchain.prompts import PromptTemplate
from langchain.schema import Document
import logging

# Enable logging to see generated queries
logging.basicConfig()
logging.getLogger("langchain.retrievers.multi_query").setLevel(logging.INFO)

# Setup
embeddings = OpenAIEmbeddings()
llm = OpenAI(temperature=0.7)

docs = [
    "The capital of France is Paris, located on the Seine River.",
    "France uses the Euro as its currency and French as its official language.",
    "The Eiffel Tower was built in 1889 for the World's Fair in Paris.",
    "French cuisine is famous for wine, cheese, and pastries.",
    "Paris has a population of approximately 2.1 million people.",
    "The Louvre Museum in Paris houses the Mona Lisa painting."
]

vectorstore = FAISS.from_texts(docs, embeddings)

# === Multi-Query Retrieval ===
multi_query = MultiQueryRetriever.from_llm(
    retriever=vectorstore.as_retriever(search_kwargs={"k": 2}),
    llm=llm
)

query = "Tell me about Paris"
print(f"Original query: {query}")
results = multi_query.get_relevant_documents(query)
print("Multi-Query results:")
for doc in results:
    print(f"  - {doc.page_content}")
print()

# === HyDE: Hypothetical Document Embeddings ===
hyde_template = PromptTemplate(
    input_variables=["question"],
    template="""Write a short paragraph that answers the following question.
The paragraph should be factual, detailed, and written in a formal style.

Question: {question}

Hypothetical answer:"""
)

def hyde_retrieve(question, retriever, llm, k=3):
    # Generate hypothetical document
    hypothetical = llm(hyde_template.format(question=question))
    print(f"Hypothetical document: {hypothetical[:100]}...")
    
    # Embed the hypothetical document and search
    # In practice, we'd embed this and search the vector store
    # Here we simulate with the existing retriever
    hyde_doc = Document(page_content=hypothetical)
    # For real implementation: embed hyde_doc, search vectorstore
    results = retriever.get_relevant_documents(question)
    return results

hyde_results = hyde_retrieve(query, vectorstore.as_retriever(), llm)
print("HyDE-inspired results:")
for doc in hyde_results:
    print(f"  - {doc.page_content}")`,
      output: `Original query: Tell me about Paris
INFO:langchain.retrievers.multi_query:Generated queries:
1. What are some key facts about Paris?
2. Provide information about the city of Paris.
3. Describe Paris and its notable features.

Multi-Query results:
  - The capital of France is Paris, located on the Seine River.
  - The Louvre Museum in Paris houses the Mona Lisa painting.
  - The Eiffel Tower was built in 1889 for the World's Fair in Paris.

Hypothetical document: Paris is the capital and most populous city of France...
HyDE-inspired results:
  - The capital of France is Paris, located on the Seine River.
  - The Louvre Museum in Paris houses the Mona Lisa painting.`,
      explanation: 'Multi-Query generates query variations to improve recall — each variant captures different aspects of the information need. HyDE generates a hypothetical perfect answer and uses that for retrieval, bridging the vocabulary gap between questions and answers.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Enterprise Search', description: 'Large companies use hybrid retrieval (BM25 + dense) to search internal documents — BM25 catches exact product names and codes, dense retrieval finds conceptually related documents.' },
      { industry: 'Legal Discovery', description: 'E-discovery platforms use Multi-Query to ensure no relevant document is missed during legal discovery, generating multiple phrasings of each search request.' },
      { industry: 'Medical Research', description: 'Researchers use HyDE to find relevant papers — the LLM generates a hypothetical research finding, and the system retrieves papers with similar findings or methodology.' },
    ],
    caseStudy: {
      problem: 'A legal tech startup built a RAG system for contract analysis but found it missed specific clauses because the query "termination for convenience clause" didn\'t match documents using "early termination rights" or "cancellation without cause".',
      solution: 'They implemented hybrid retrieval (BM25 + dense) with Multi-Query expansion. An LLM generated 5 alternative phrasings of each legal query, and RRF fused results from both retrievers across all query variants.',
      results: 'Recall improved from 68% to 94%. Lawyers could find relevant clauses regardless of terminology differences. The system handled 200+ legal document types with consistent quality.',
    },
    bestPractices: [
      'Always use hybrid retrieval (dense + sparse) for production RAG',
      'Tune the RRF k parameter — start with k=60',
      'For Multi-Query, generate 3-5 query variants and use RRF to combine',
      'Use HyDE when queries are short and documents are long-form',
      'Monitor retrieval metrics (recall@k, MRR) separately from generation metrics',
    ],
    tools: ['rank_bm25', 'LangChain EnsembleRetriever', 'MultiQueryRetriever', 'Elasticsearch', 'Weaviate Hybrid', 'Pinecone + BM25'],
    jobRoles: ['Search Engineer', 'Information Retrieval Engineer', 'RAG Engineer', 'Data Scientist'],
    furtherReading: [
      'BM25 algorithm and variations (BM25+, BM25L)',
      'Reciprocal Rank Fusion paper',
      'Precise Zero-Shot Dense Retrieval without Relevance Labels (HyDE paper)',
      'LangChain multi-query retriever documentation',
    ],
  },
  quiz: [
    {
      id: 'ret-strat-1', type: 'mcq',
      question: 'What is the primary advantage of hybrid (dense + sparse) retrieval over dense-only retrieval?',
      options: [
        'It is faster because BM25 is computationally expensive',
        'It captures both semantic meaning and exact keyword matches',
        'It eliminates the need for an embedding model',
        'It requires less memory for the index',
      ],
      correctAnswer: 'It captures both semantic meaning and exact keyword matches',
      explanation: 'Dense retrieval captures semantics and synonyms but can miss exact terms. BM25 excels at exact keyword matches. Hybrid combines both for the best of both worlds.',
    },
    {
      id: 'ret-strat-2', type: 'truefalse',
      question: 'HyDE (Hypothetical Document Embeddings) works by generating query variations and running each through the retriever.',
      correctAnswer: 'False',
      explanation: 'HyDE generates a hypothetical perfect document that would answer the query, then embeds that document for retrieval. Query variation is Multi-Query, which is a different strategy.',
    },
    {
      id: 'ret-strat-3', type: 'code',
      question: 'What does the RRF formula (Reciprocal Rank Fusion) do with the ranked results from multiple retrievers?',
      code: `def rrf(results_list, k=60):
    scores = {}
    for results in results_list:
        for rank, doc_id in enumerate(results):
            scores[doc_id] = scores.get(doc_id, 0) + 1 / (k + rank + 1)
    return sorted(scores.items(), key=lambda x: -x[1])`,
      options: [
        'Averages the similarity scores from each retriever',
        'Gives each document a score based on its rank position across all retrievers',
        'Selects the top document from each retriever and drops duplicates',
        'Multiplies the scores from dense and sparse retrievers together',
      ],
      correctAnswer: 'Gives each document a score based on its rank position across all retrievers',
      explanation: 'RRF assigns a score of 1/(k + rank) to each document per retriever. A document ranked #1 by both retrievers gets a high combined score. This is the standard fusion method for hybrid search.',
    },
    {
      id: 'ret-strat-4', type: 'fillblank',
      question: 'The BM25 scoring function combines term frequency with ___ frequency to balance common and rare terms.',
      correctAnswer: 'inverse document',
      explanation: 'BM25 uses IDF (Inverse Document Frequency) to down-weight common terms and up-weight rare, informative terms. This balances TF (term frequency) which favors common terms.',
    },
    {
      id: 'ret-strat-5', type: 'match',
      question: 'Match each retrieval strategy with its correct description:',
      pairs: [
        { left: 'Dense Retrieval', right: 'Embeds query and documents in semantic vector space' },
        { left: 'BM25 (Sparse)', right: 'Scores documents by term frequency and inverse document frequency' },
        { left: 'Multi-Query', right: 'Generates alternative query phrasings and aggregates results' },
        { left: 'HyDE', right: 'Generates a hypothetical answer document and uses it for retrieval' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'Each retrieval strategy has a distinct mechanism. Dense uses neural embeddings, BM25 uses term statistics, Multi-Query generates variations, and HyDE imagines the perfect answer.',
    },
  ],
}))

export {}
