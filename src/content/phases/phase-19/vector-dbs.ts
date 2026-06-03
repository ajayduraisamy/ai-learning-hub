import { registerContent } from '@/content/index'

registerContent('p19-vector-dbs', () => ({
  difficulty: 'Advanced',
  estimatedTime: '60 minutes',
  prerequisites: ['p19-rag-architecture', 'p12-semantic-search'],
  tags: ['RAG', 'Advanced', 'Topic'],
  objectives: [
    'Understand the architecture and tradeoffs of major vector databases',
    'Use Pinecone for serverless vector search with metadata filtering',
    'Build and query Weaviate with hybrid search and GraphQL',
    'Integrate Chroma for embedded local vector storage',
    'Deploy FAISS for high-performance in-memory similarity search',
  ],
  theory: `# Vector Databases (Pinecone, Weaviate, Chroma, FAISS)

## What is a Vector Database?

A vector database stores embeddings (dense vector representations) and enables fast similarity search. Unlike traditional databases that match exact values, vector databases find "most similar" items using distance metrics like cosine similarity, Euclidean distance, or dot product.

### Core Capabilities

1. **Vector Storage**: Store high-dimensional vectors (768d, 1024d, 1536d)
2. **ANN Search**: Approximate Nearest Neighbor search for sub-second queries
3. **Metadata Filtering**: Filter results by associated metadata before/during search
4. **Hybrid Search**: Combine vector similarity with keyword (BM25) search
5. **CRUD Operations**: Insert, update, delete vectors and metadata

## Pinecone

### Architecture

Pinecone is a fully-managed vector database offered as a cloud service.

- **Serverless**: Auto-scaling, no infrastructure management
- **Pod-based**: Provision pods with defined capacity (for legacy indexes)
- **Namespaces**: Isolate vectors within an index for multi-tenancy
- **Single-stage filtering**: Metadata filtering applied during ANN search (not post-filter)

### Key Concepts

\\\`\\\`python
# Create index
pc.create_index(
    name="my-index",
    dimension=1536,
    metric="cosine",  # cosine, dotproduct, euclidean
    spec=ServerlessSpec(cloud="aws", region="us-east-1")
)
\\\`\\\`\\\`

- **Index**: A named collection of vectors (analogous to a table)
- **Namespace**: Sub-division within an index (analogous to a partition)
- **Metadata**: Key-value pairs attached to each vector for filtering
- **Dimension**: Must match the embedding model's output dimension

## Weaviate

### Architecture

Weaviate is an open-source vector database with built-in AI capabilities.

- **Hybrid Search**: Combines vector + keyword (BM25) search natively
- **GraphQL API**: Query using GraphQL with vector search syntax
- **Multi-tenancy**: Isolate data per tenant at the class level
- **Vectorizer Modules**: Built-in modules (\\\\texttt{text2vec-openai}, \\\\texttt{text2vec-cohere}) that auto-vectorize data

### Key Concepts

\\\`graphql
{
  Get {
    Document(nearText: { concepts: ["machine learning"] }) {
      title
      content
      _additional { distance }
    }
  }
}
\\\`\\\`\\\`

- **Class**: A schema definition for objects (analogous to a table)
- **Object**: An instance of a class with properties and a vector
- **Property**: A field on the object (with data type)
- **Vectorizer**: Module that automatically generates embeddings

## Chroma

### Architecture

Chroma is an open-source, embedded vector database designed for simplicity.

- **Embedded**: Runs in-process, no separate server (for small-scale apps)
- **Collections**: Organize vectors into named collections
- **Metadata Filtering**: Filter on metadata during queries
- **Persistence**: Optional disk persistence with \\\\texttt{PersistentClient}

### Key Concepts

\\\`\\\`python
import chromadb
client = chromadb.Client()
collection = client.create_collection("my_docs")
collection.add(
    documents=["doc1", "doc2"],
    metadatas=[{"source": "wiki"}],
    ids=["id1", "id2"]
)
\\\`\\\`\\\`

## FAISS

### Architecture

FAISS (Facebook AI Similarity Search) is a library for efficient similarity search, not a database.

- **In-memory**: Vectors stored in RAM (can be saved/loaded from disk)
- **GPU Support**: Index operations on GPU for 10x speedup
- **Quantization**: Compress vectors to reduce memory (PQ, SQ)
- **Index Types**: Flat (exact), IVF (approximate), HNSW (graph-based)

### Key Index Types

| Index | Description | Memory | Speed | Recall |
|-------|-------------|--------|-------|--------|
| IndexFlatL2 | Brute force, exact | High | Slow | 100% |
| IndexIVFFlat | Inverted file + flat | Moderate | Fast | ~95% |
| IndexHNSWFlat | Graph-based | High | Very fast | ~99% |
| IndexIVFPQ | IVF + product quantization | Low | Fast | ~90% |

## Comparison

| Feature | Pinecone | Weaviate | Chroma | FAISS |
|---------|----------|----------|--------|-------|
| Management | Fully managed | Self-hosted/Cloud | Embedded | Library |
| Persistence | Automatic | Automatic | Optional | Manual |
| Hybrid Search | No (via separate) | Native | No | No |
| Filtering | Pre-filter | Pre/post-filter | Post-filter | Manual |
| Multi-tenancy | Namespaces | Multi-tenancy | Collections | Separate indexes |
| Best for | Production, large scale | Hybrid search apps | Prototyping, small apps | High perf, GPU |

## Understanding

Vector databases are like a smart filing system where files are organized by similarity rather than alphabetically. Pinecone is the cloud concierge, Weaviate is the librarian who also knows keywords, Chroma is your personal desktop filing system, and FAISS is the high-speed sorting machine behind the scenes.`,
  understanding: {
    analogy: 'Vector databases are like a smart filing system where files are organized by content similarity, not alphabetical order. Pinecone is a cloud concierge service (fully managed, just tell it what you need). Weaviate is a librarian who understands both topics and keywords (hybrid search). Chroma is your personal desktop filing cabinet (simple, embedded). FAISS is the high-speed sorting machine in the back room (raw performance).',
    steps: [
      { title: 'Choose a Vector DB', content: 'Select based on scale: Pinecone for production at scale, Weaviate for hybrid search needs, Chroma for prototyping and small projects, FAISS for maximum performance with GPU.' },
      { title: 'Define Schema', content: 'Each database has its own schema concept — Pinecone uses indexes with metadata fields, Weaviate uses classes with properties, Chroma uses collections with optional metadata.' },
      { title: 'Ingest Vectors', content: 'Generate embeddings using your chosen model, then upsert them into the database. Include metadata for filtering and provenance.' },
      { title: 'Build an Index', content: 'The database builds an ANN index for fast search. Parameters like nlist (IVF) or M (HNSW) control the speed/recall tradeoff.' },
      { title: 'Query and Filter', content: 'Query with a vector, optionally filtered by metadata. Adjust top-k and score thresholds to balance precision and recall.' },
    ],
    misconceptions: [
      { misconception: 'All vector databases give the same results', truth: 'ANN algorithms are approximate. Different databases use different algorithms (HNSW, IVF, DiskANN) with different speed/recall/memory tradeoffs.' },
      { misconception: 'Vector databases replace traditional databases', truth: 'Vector databases are specialized tools for similarity search. Most applications use a traditional DB for transactional data alongside a vector DB for search.' },
    ],
    comparisons: [
      { label: 'Management', methodA: 'Pinecone: Fully managed (serverless)', methodB: 'FAISS: Self-managed (library)' },
      { label: 'Search Type', methodA: 'Weaviate: Hybrid (vector + BM25)', methodB: 'Chroma: Vector-only' },
      { label: 'Persistence', methodA: 'Chroma: Optional (in-memory or disk)', methodB: 'Pinecone: Automatic (cloud)' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `# Pinecone: Create Index, Upsert, and Query
from pinecone import Pinecone, ServerlessSpec
import os

# Initialize Pinecone
pc = Pinecone(api_key=os.environ["PINECONE_API_KEY"])

# Create a serverless index
index_name = "rag-quickstart"
if index_name not in pc.list_indexes().names():
    pc.create_index(
        name=index_name,
        dimension=1536,  # OpenAI embedding dimension
        metric="cosine",
        spec=ServerlessSpec(
            cloud="aws",
            region="us-east-1"
        )
    )

# Connect to the index
index = pc.Index(index_name)

# Upsert vectors with metadata
vectors = [
    {
        "id": "doc-1",
        "values": [0.1] * 1536,  # Placeholder embedding
        "metadata": {"text": "Paris is the capital of France", "category": "geography"}
    },
    {
        "id": "doc-2",
        "values": [0.2] * 1536,
        "metadata": {"text": "The Eiffel Tower is in Paris", "category": "landmarks"}
    }
]
index.upsert(vectors=vectors)

# Query with metadata filter
query_vector = [0.15] * 1536
results = index.query(
    vector=query_vector,
    top_k=2,
    include_metadata=True,
    filter={"category": {"$eq": "geography"}}
)

for match in results.matches:
    print(f"ID: {match.id}, Score: {match.score:.4f}")
    print(f"Text: {match.metadata['text']}")
    print()`,
      output: `ID: doc-1, Score: 0.8567
Text: Paris is the capital of France`,
      explanation: 'Pinecone\'s serverless API makes vector search straightforward. Create an index, upsert vectors with metadata, and query with optional filters. The API automatically handles scaling and infrastructure.',
    },
    {
      level: 'intermediate',
      code: `# Weaviate: Schema, Objects, and Hybrid Search
import weaviate
from weaviate.classes.config import Property, DataType
from weaviate.classes.query import HybridVector

client = weaviate.connect_to_local()

# Define schema (class)
try:
    client.collections.delete("Document")
except:
    pass

documents = client.collections.create(
    name="Document",
    properties=[
        Property(name="title", data_type=DataType.TEXT),
        Property(name="content", data_type=DataType.TEXT),
        Property(name="category", data_type=DataType.TEXT),
    ],
    # Enable hybrid search (BM25 + vector)
    vectorizer_config=None  # We'll provide our own vectors
)

# Insert objects with vectors
import numpy as np

objects = [
    {
        "title": "Paris Guide",
        "content": "Paris is the capital and most populous city of France.",
        "category": "geography"
    },
    {
        "title": "Machine Learning",
        "content": "ML is a subset of AI that enables systems to learn from data.",
        "category": "technology"
    }
]

for obj in objects:
    documents.data.insert(
        properties=obj,
        vector=np.random.rand(1536).tolist()  # Replace with real embedding
    )

# Hybrid search (vector + BM25)
response = documents.query.hybrid(
    query="capital city",
    vector=HybridVector(np.random.rand(1536).tolist()),
    limit=2,
    return_metadata=["score", "distance", "explain_score"]
)

for obj in response.objects:
    print(f"Title: {obj.properties['title']}")
    print(f"Score: {obj.metadata.score:.4f}")
    print(f"Content: {obj.properties['content'][:80]}...")
    print()`,
      output: `Title: Paris Guide
Score: 0.8732
Content: Paris is the capital and most populous city of France...

Title: Machine Learning
Score: 0.2341
Content: ML is a subset of AI that enables systems to learn from data...`,
      explanation: 'Weaviate provides native hybrid search combining vector similarity and BM25 keyword scoring. The GraphQL-like API makes complex queries expressive. Each object has typed properties alongside its vector.',
    },
    {
      level: 'advanced',
      code: `# Chroma + FAISS Integration with Multiple Collections
import chromadb
from chromadb.config import Settings
import faiss
import numpy as np

# === Chroma: Embedded Vector Store ===
chroma_client = chromadb.PersistentClient(
    path="./chroma_db",
    settings=Settings(anonymized_telemetry=False)
)

# Create collections with metadata
wiki_collection = chroma_client.get_or_create_collection(
    name="wikipedia",
    metadata={"description": "Wikipedia articles"}
)

# Add documents
wiki_collection.add(
    documents=[
        "Paris is the capital of France.",
        "Machine learning is a subset of artificial intelligence.",
        "The Great Wall of China is a historic fortification."
    ],
    metadatas=[
        {"category": "geography", "language": "en"},
        {"category": "technology", "language": "en"},
        {"category": "history", "language": "en"}
    ],
    ids=["doc1", "doc2", "doc3"]
)

# Query with metadata filter
results = wiki_collection.query(
    query_texts=["French capital"],
    n_results=2,
    where={"category": {"$eq": "geography"}}
)
print("Chroma results:")
for doc, meta in zip(results['documents'][0], results['metadatas'][0]):
    print(f"  {doc} (category: {meta['category']})")

# === FAISS: High-Performance In-Memory ===
dimension = 768
n_vectors = 10000

# Generate random embeddings
embeddings = np.random.rand(n_vectors, dimension).astype('float32')

# Build HNSW index
index = faiss.IndexHNSWFlat(dimension, 32)  # 32 neighbors
index.hnsw.efConstruction = 40
index.hnsw.efSearch = 16
index.add(embeddings)

print(f"\\\\nFAISS index size: {index.ntotal} vectors")

# Search
query = np.random.rand(1, dimension).astype('float32')
distances, indices = index.search(query, k=5)

print("Top-5 nearest neighbors:")
for idx, dist in zip(indices[0], distances[0]):
    print(f"  Index {idx}: distance = {dist:.4f}")

# Save and reload
faiss.write_index(index, "faiss_index.bin")
loaded_index = faiss.read_index("faiss_index.bin")
print(f"\\\\nFAISS index saved and reloaded: {loaded_index.ntotal} vectors")`,
      output: `Chroma results:
  Paris is the capital of France. (category: geography)

FAISS index size: 10000 vectors
Top-5 nearest neighbors:
  Index 5231: distance = 9.2341
  Index 8912: distance = 9.4512
  Index 342: distance = 9.6789
  Index 7781: distance = 9.8123
  Index 1234: distance = 9.9012

FAISS index saved and reloaded: 10000 vectors`,
      explanation: 'Chroma is ideal for embedded/local use with persistent storage and metadata filtering. FAISS provides the raw performance for large-scale in-memory search with GPU support. They can be combined: Chroma for metadata management, FAISS for the vector index.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'E-commerce', description: 'Product recommendation systems use vector databases to find similar items based on embedding representations of product descriptions, images, and user behavior.' },
      { industry: 'Security', description: 'Facial recognition and anomaly detection systems use vector databases to match query embeddings against millions of known vectors in milliseconds.' },
      { industry: 'Content Platforms', description: 'News aggregators and content platforms use hybrid search (Weaviate) to combine semantic relevance with keyword matching for article recommendations.' },
    ],
    caseStudy: {
      problem: 'A SaaS company building an internal knowledge base search experienced slow queries (>5 seconds) with their PostgreSQL pgvector setup as the dataset grew to 10M+ embeddings.',
      solution: 'They migrated to Pinecone serverless with HNSW indexing. Metadata pre-filtering reduced the search space by 60% before vector search. They partitioned by tenant using namespaces.',
      results: 'Query latency dropped from 5.2s to 42ms. Recall remained above 97%. Operational costs decreased by 40% since they no longer needed to manage database infrastructure.',
    },
    bestPractices: [
      'Always use metadata filtering before vector search to narrow the search space',
      'Match embedding dimension exactly between model and vector DB',
      'Monitor index size and rebuild periodically to maintain performance',
      'For multi-tenant systems, use namespaces (Pinecone) or multi-tenancy (Weaviate)',
      'Benchmark your specific ANN parameters (efConstruction, efSearch, nprobe) for speed vs recall',
    ],
    tools: ['Pinecone', 'Weaviate', 'Chroma', 'FAISS', 'pgvector', 'Qdrant', 'Milvus', 'Vald'],
    jobRoles: ['Infrastructure Engineer', 'Search Engineer', 'MLOps Engineer', 'Backend Engineer (AI)'],
    furtherReading: [
      'Pinecone documentation and best practices',
      'Weaviate hybrid search guide',
      'FAISS official GitHub and wiki',
      'Chroma DB getting started guide',
    ],
  },
  quiz: [
    {
      id: 'vdbs-1', type: 'mcq',
      question: 'Which vector database provides native hybrid search (combining vector similarity with BM25 keyword scoring) out of the box?',
      options: ['Pinecone', 'Weaviate', 'Chroma', 'FAISS'],
      correctAnswer: 'Weaviate',
      explanation: 'Weaviate has built-in hybrid search that combines vector similarity search with BM25 keyword scoring. Pinecone, Chroma, and FAISS require separate keyword search implementations.',
    },
    {
      id: 'vdbs-2', type: 'truefalse',
      question: 'FAISS is a fully-managed cloud vector database service.',
      correctAnswer: 'False',
      explanation: 'FAISS is a library for efficient similarity search, not a managed database service. It runs in-memory in your application. Pinecone is the fully-managed cloud service among these options.',
    },
    {
      id: 'vdbs-3', type: 'code',
      question: 'In this Pinecone code, what does the metadata filter do?',
      code: `results = index.query(
    vector=query_vector,
    top_k=10,
    filter={"category": {"$eq": "geography"}}
)`,
      options: [
        'It filters results after vector search (post-filter)',
        'It narrows the search to only vectors with category = "geography" before scoring',
        'It sorts results by category in descending order',
        'It removes the category from search results',
      ],
      correctAnswer: 'It narrows the search to only vectors with category = "geography" before scoring',
      explanation: 'Pinecone applies metadata filters during the ANN search (pre-filter). This reduces the search space before computing vector similarities, making the query faster and more precise.',
    },
    {
      id: 'vdbs-4', type: 'fillblank',
      question: 'Chroma uses ___ to organize vectors and is designed as an ___ database (runs in the same process as your application).',
      correctAnswer: 'collections, embedded',
      explanation: 'Chroma organizes vectors into named collections and runs embedded in your application process (no separate server). This makes it ideal for prototyping and small-scale applications.',
    },
    {
      id: 'vdbs-5', type: 'match',
      question: 'Match each vector database with its primary distinguishing feature:',
      pairs: [
        { left: 'Pinecone', right: 'Fully managed serverless vector DB' },
        { left: 'Weaviate', right: 'Hybrid search with GraphQL API' },
        { left: 'Chroma', right: 'Embedded, simple, in-process DB' },
        { left: 'FAISS', right: 'High-performance GPU-accelerated library' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'Each vector database has a distinct strength. Pinecone excels at managed cloud scale, Weaviate at hybrid search, Chroma at simplicity and embedding, and FAISS at raw performance.',
    },
  ],
}))

export {}
