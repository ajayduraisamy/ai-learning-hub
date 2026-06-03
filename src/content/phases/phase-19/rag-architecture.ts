import { registerContent } from '@/content/index'

registerContent('p19-rag-architecture', () => ({
  difficulty: 'Advanced',
  estimatedTime: '45 minutes',
  prerequisites: ['p8-llama-mistral', 'p10-langchain-agents', 'p12-semantic-search'],
  tags: ['RAG', 'Advanced', 'Topic'],
  objectives: [
    'Understand the RAG pipeline: retrieval + generation architecture',
    'Compare naive RAG vs advanced RAG vs fine-tuning vs long-context models',
    'Implement a basic RAG pipeline with LangChain',
    'Build an end-to-end RAG system with LlamaIndex',
  ],
  theory: `# RAG Architecture & Pipeline

## What is RAG?

Retrieval-Augmented Generation (RAG) combines a **retriever** (finds relevant documents) with a **generator** (produces answers). Instead of relying solely on parametric knowledge stored in model weights, RAG lets the model look up external knowledge at inference time.

### Why RAG?

| Challenge | Without RAG | With RAG |
|-----------|-------------|----------|
| Outdated knowledge | Model frozen at training cutoff | Always up-to-date documents |
| Hallucination | Model guesses facts | Answers grounded in retrieved docs |
| Proprietary data | Can't include in training | Just index your internal docs |
| Model size | Need larger model for more knowledge | Smaller model + external knowledge |

## The RAG Pipeline

### Ingestion Pipeline (Offline)

\\\`\\\`\\\`
Raw Documents
    \\\\downarrow
Document Loaders (PDF, HTML, Markdown, DB)
    \\\\downarrow
Chunking (Text Splitters)
    \\\\downarrow
Embeddings (text \\\\rightarrow vector)
    \\\\downarrow
Vector Store Indexing (FAISS, Pinecone, Chroma)
\\\`\\\`\\\`

### Retrieval Pipeline (Online / Inference)

\\\`\\\`\\\`
User Query
    \\\\downarrow
Query Embedding
    \\\\downarrow
Similarity Search (ANN, k-NN, MIPS)
    \\\\downarrow
Re-rank (Cross-encoder)
    \\\\downarrow
LLM Generation (with context)
    \\\\downarrow
Final Answer
\\\`\\\`\\\`

## Naive RAG vs Advanced RAG

### Naive RAG
1. Index documents into chunks
2. Retrieve top-k chunks by similarity
3. Concatenate chunks into prompt
4. Generate answer with LLM

**Problems**: Fixed chunk size, no query rewriting, no re-ranking, no handling of missing context.

### Advanced RAG

Advanced RAG adds pre-retrieval and post-retrieval optimizations:

**Pre-retrieval**:
- Query rewriting / expansion
- Query transformation (HyDE, Multi-Query)
- Routing to appropriate index

**Post-retrieval**:
- Re-ranking with cross-encoders
- Context compression (extract relevant snippets)
- Filtering based on metadata or relevance scores

## Indexing Strategies

| Strategy | Description | Best For |
|----------|-------------|----------|
| Flat Index (brute force) | Exact nearest neighbor search | Small datasets (<10k docs) |
| IVF (Inverted File Index) | Cluster centroids, search nearest clusters | Medium datasets |
| HNSW (Hierarchical Navigable Small World) | Graph-based ANN | Large datasets, high recall |
| PQ (Product Quantization) | Compress vectors for memory efficiency | Memory-constrained deployment |

## Retrieval Granularity

| Granularity | Unit | Pros | Cons |
|-------------|------|------|------|
| Document-level | Whole documents | Preserves full context | May miss specific answers |
| Chunk-level | Fixed-length segments | Precise retrieval | Context truncation |
| Sentence-level | Individual sentences | Maximum precision | Loses surrounding context |
| Hierarchical | Multiple levels | Best of all worlds | Complex implementation |

## Generator Optimization

- **Prompt engineering**: Structure the context + instruction carefully
- **Few-shot examples**: Include examples of correct retrieval-grounded answers
- **Conditional generation**: Instruct model to say "I don't know" when context is insufficient
- **Citation generation**: Make model cite source chunks in answers

## RAG vs Fine-tuning vs Long-Context

| Aspect | RAG | Fine-tuning | Long-Context (e.g., 128k) |
|--------|-----|-------------|---------------------------|
| Knowledge freshness | Real-time | Static (re-train needed) | Static |
| Computational cost | Low (retrieval only) | High (training) | High (attention O(n\\\\u00b2)) |
| Accuracy on specific facts | High (grounded) | Moderate (memorized) | High but degraded at extremes |
| Hallucination risk | Low | Moderate | Moderate |
| Implementation complexity | Moderate | High | Low (just use bigger model) |
| Use case | Open-book QA | Style/skill acquisition | Long document analysis |

## The RAG Triad

Three key metrics in RAG evaluation:

1. **Context Relevance**: Are the retrieved documents actually relevant to the query?
2. **Groundedness (Faithfulness)**: Is the generated answer supported by the retrieved context?
3. **Answer Relevance**: Does the answer actually address the user's question?

## RAG with LangChain vs LlamaIndex

| Feature | LangChain | LlamaIndex |
|---------|-----------|------------|
| Flexibility | High, many integrations | High, RAG-optimized |
| Retrieval | Chains, retrievers | Index structures, retrievers |
| Simplicity | Moderate (many abstractions) | Higher (RAG-first design) |
| Query engines | Generic chains | Specialized query engines |
| Best for | General LLM apps | Document-focused RAG |

## Understanding

The fundamental RAG pipeline: load \\\\rightarrow chunk \\\\rightarrow embed \\\\rightarrow index \\\\rightarrow retrieve \\\\rightarrow generate. Each stage is a potential bottleneck or optimization point.`,
  understanding: {
    analogy: 'RAG is like an open-book exam. The student (LLM) has a textbook (knowledge base) open on the desk. When asked a question, the student first flips to the relevant section (retrieval), reads the relevant passage (context), and then writes their answer based on what they read (generation). Without RAG, it\'s a closed-book exam — the student relies entirely on memory.',
    steps: [
      { title: 'Load Documents', content: 'Raw documents are loaded from various sources: PDFs, web pages, databases, or code repositories. Each source requires a specific loader that extracts text content while preserving structure.' },
      { title: 'Chunk & Embed', content: 'Documents are split into manageable chunks (typically 256-1024 tokens) and each chunk is converted into a dense vector embedding using a model like text-embedding-ada-002 or sentence-transformers.' },
      { title: 'Index in Vector Store', content: 'Embeddings are stored in a vector database (FAISS, Pinecone, Chroma) that supports fast approximate nearest neighbor (ANN) search.' },
      { title: 'Retrieve Relevant Chunks', content: 'When a query comes in, it is embedded with the same model, and the vector store returns the top-k most similar chunks via cosine similarity or dot product.' },
      { title: 'Generate with Context', content: 'The retrieved chunks are inserted into a prompt template alongside the user query. The LLM reads the context and generates a grounded answer.' },
    ],
    misconceptions: [
      { misconception: 'RAG eliminates all hallucination', truth: 'RAG reduces hallucination by grounding answers in retrieved text, but the LLM can still ignore or misinterpret the context. Careful prompt engineering and evaluation are still required.' },
      { misconception: 'More context always improves RAG', truth: 'Adding too many chunks can confuse the LLM or exceed context windows. Retrieval quality (precision and recall) matters more than quantity.' },
      { misconception: 'RAG replaces fine-tuning entirely', truth: 'RAG and fine-tuning serve different purposes. RAG adds external knowledge; fine-tuning changes model behavior, tone, or format. They are complementary.' },
    ],
    comparisons: [
      { label: 'Knowledge Source', methodA: 'RAG: External documents (dynamic)', methodB: 'Fine-tuning: Model weights (static)' },
      { label: 'Update Frequency', methodA: 'RAG: Real-time (change index)', methodB: 'Fine-tuning: Weeks/months (re-train)' },
      { label: 'Best For', methodA: 'RAG: Factual QA, research, customer support', methodB: 'Fine-tuning: Style, format, domain adaptation' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `# Basic RAG Pipeline with LangChain
from langchain.document_loaders import TextLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import FAISS
from langchain.chains import RetrievalQA
from langchain.chat_models import ChatOpenAI

# 1. Load documents
loader = TextLoader("knowledge_base.txt")
documents = loader.load()

# 2. Split into chunks
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=50,
    separators=["\\\\n\\\\n", "\\\\n", " ", ""]
)
chunks = text_splitter.split_documents(documents)
print(f"Created {len(chunks)} chunks")

# 3. Create embeddings and vector store
embeddings = OpenAIEmbeddings()
vectorstore = FAISS.from_documents(chunks, embeddings)

# 4. Create retrieval QA chain
llm = ChatOpenAI(model_name="gpt-4", temperature=0)
qa_chain = RetrievalQA.from_chain_type(
    llm=llm,
    chain_type="stuff",
    retriever=vectorstore.as_retriever(search_kwargs={"k": 3})
)

# 5. Ask a question
query = "What is the capital of France?"
answer = qa_chain.run(query)
print(f"Q: {query}")
print(f"A: {answer}")`,
      output: `Created 15 chunks
Q: What is the capital of France?
A: The capital of France is Paris.`,
      explanation: 'This is the simplest RAG pipeline — load, chunk, embed, retrieve, generate. The "stuff" chain type puts all retrieved chunks into a single prompt. For many chunks, you would use "map_reduce" or "refine" chain types.',
    },
    {
      level: 'intermediate',
      code: `# Custom RAG Pipeline with Re-ranking
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import FAISS
from langchain.schema import Document
from langchain.llms import OpenAI
from sentence_transformers import CrossEncoder
import numpy as np

# Sample documents
docs = [
    "Paris is the capital and most populous city of France.",
    "France is a country in Western Europe.",
    "The Eiffel Tower is located in Paris, France.",
    "London is the capital of England and the United Kingdom.",
    "Berlin is the capital and largest city of Germany.",
]
documents = [Document(page_content=d) for d in docs]

# Embed and index
embeddings = OpenAIEmbeddings()
vectorstore = FAISS.from_documents(documents, embeddings)

# Retrieve top-k
query = "What is the capital of France?"
retrieved_docs = vectorstore.similarity_search(query, k=3)

# Re-rank with Cross-Encoder
cross_encoder = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2")
pairs = [[query, doc.page_content] for doc in retrieved_docs]
scores = cross_encoder.predict(pairs)

# Sort by re-rank score
ranked = sorted(
    zip(retrieved_docs, scores),
    key=lambda x: x[1],
    reverse=True
)

print("Re-ranked results:")
for doc, score in ranked:
    print(f"  Score: {score:.3f} - {doc.page_content}")

# Generate with best context
best_context = ranked[0][0].page_content
prompt = f"""Context: {best_context}
Question: {query}
Answer based only on the context."""
llm = OpenAI(temperature=0)
answer = llm(prompt)
print(f"\\\\nAnswer: {answer.strip()}")`,
      output: `Re-ranked results:
  Score: 8.452 - Paris is the capital and most populous city of France.
  Score: 0.123 - The Eiffel Tower is located in Paris, France.
  Score: -2.341 - France is a country in Western Europe.

Answer: Paris is the capital of France.`,
      explanation: 'Adding a cross-encoder re-ranker significantly improves retrieval quality. The bi-encoder (embedding model) does a fast first-pass retrieval, then the cross-encoder does expensive but precise scoring on the top candidates.',
    },
    {
      level: 'advanced',
      code: `# End-to-End RAG with LlamaIndex
from llama_index import (
    VectorStoreIndex, SimpleDirectoryReader,
    ServiceContext, StorageContext
)
from llama_index.vector_stores import ChromaVectorStore
from llama_index.embeddings import OpenAIEmbedding
from llama_index.llms import OpenAI
from llama_index.node_parser import SentenceSplitter
from llama_index.postprocessor import SentenceTransformerRerank
from llama_index.query_engine import RetrieverQueryEngine
from llama_index.retrievers import VectorIndexRetriever
import chromadb

# Initialize ChromaDB client
db = chromadb.PersistentClient(path="./chroma_rag_db")
chroma_collection = db.get_or_create_collection("knowledge_base")

# Set up LLM and embedding model
llm = OpenAI(model="gpt-4", temperature=0)
embed_model = OpenAIEmbedding()
service_context = ServiceContext.from_defaults(
    llm=llm,
    embed_model=embed_model,
    node_parser=SentenceSplitter(chunk_size=512, chunk_overlap=50)
)

# Load and index documents
documents = SimpleDirectoryReader("./docs").load_data()
vector_store = ChromaVectorStore(chroma_collection=chroma_collection)
storage_context = StorageContext.from_defaults(vector_store=vector_store)
index = VectorStoreIndex.from_documents(
    documents,
    service_context=service_context,
    storage_context=storage_context
)

# Configure retriever with re-ranker
retriever = VectorIndexRetriever(
    index=index,
    similarity_top_k=5
)
reranker = SentenceTransformerRerank(
    model="cross-encoder/ms-marco-MiniLM-L-6-v2",
    top_n=2
)

# Build query engine
query_engine = RetrieverQueryEngine.from_args(
    retriever=retriever,
    node_postprocessors=[reranker],
    service_context=service_context
)

# Query with streaming
response = query_engine.query(
    "What are the key benefits of RAG over fine-tuning?"
)
print(f"Answer: {response}")
print(f"\\\\nSources:")
for node in response.source_nodes:
    print(f"  - {node.node.get_text()[:100]}...")`,
      output: `Answer: RAG provides dynamic, real-time access to external knowledge without retraining, reducing hallucination and allowing instant updates to the knowledge base. Unlike fine-tuning, which modifies model weights and requires weeks of training, RAG simply indexes new documents and makes them retrievable immediately.

Sources:
  - RAG combines a retriever (finds relevant documents) with a generator (produces answers)...
  - Fine-tuning changes model behavior, tone, or format. They are complementary...`,
      explanation: 'LlamaIndex provides a production-grade RAG framework with built-in support for vector stores, re-rankers, and query engines. The pipeline is configurable: you can swap retrievers, add post-processors, and customize the query strategy.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Customer Support', description: 'RAG powers support chatbots that retrieve answers from product documentation, knowledge bases, and past tickets, providing accurate and up-to-date responses without hallucination.' },
      { industry: 'Legal', description: 'Legal research assistants use RAG to search through millions of case documents and statutes, retrieving relevant precedents and generating summaries with citations.' },
      { industry: 'Healthcare', description: 'Clinical decision support systems retrieve relevant medical literature, drug interactions, and patient history to assist doctors with diagnosis and treatment planning.' },
    ],
    caseStudy: {
      problem: 'A large enterprise had 50,000 internal documents (policies, procedures, technical docs) scattered across wikis, SharePoint, and file shares. Employees spent 30% of their time searching for information.',
      solution: 'They built a RAG-powered internal Q&A system using LangChain and Pinecone. Documents were indexed with metadata filters for department, document type, and date. A re-ranker ensured the most relevant chunks were used for generation.',
      results: 'Information retrieval time dropped from 20 minutes to 30 seconds. Employee satisfaction scores improved by 40%. The system answered 85% of queries correctly on first attempt.',
    },
    bestPractices: [
      'Always re-rank retrieved chunks before sending to the LLM',
      'Use metadata filtering to narrow search scope before vector search',
      'Include chunk citations in generated answers for user trust',
      'Monitor retrieval quality metrics (hit rate, MRR, NDCG) in production',
      'Implement query rewriting for ambiguous or poorly-phrased questions',
    ],
    tools: ['LangChain', 'LlamaIndex', 'FAISS', 'Pinecone', 'Chroma', 'Weaviate', 'OpenAI / Anthropic / Cohere'],
    jobRoles: ['RAG Engineer', 'ML Infrastructure Engineer', 'AI Engineer', 'Search & Retrieval Engineer', 'LLM Application Developer'],
    furtherReading: [
      'Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks (Lewis et al., 2020)',
      'LangChain RAG documentation',
      'LlamaIndex RAG guide',
      'Advanced RAG patterns on Pinecone blog',
    ],
  },
  quiz: [
    {
      id: 'rag-arch-1', type: 'mcq',
      question: 'What is the primary purpose of the retrieval step in a RAG pipeline?',
      options: [
        'To train the LLM on new data',
        'To find relevant documents from a knowledge base to ground the LLM\'s answer',
        'To rewrite the user query for better understanding',
        'To cache previous answers for faster response',
      ],
      correctAnswer: 'To find relevant documents from a knowledge base to ground the LLM\'s answer',
      explanation: 'Retrieval fetches the most relevant chunks from an indexed knowledge base. These chunks provide factual context that the LLM uses to generate a grounded, accurate answer.',
    },
    {
      id: 'rag-arch-2', type: 'truefalse',
      question: 'Adding more retrieved chunks to the prompt always improves RAG answer quality.',
      correctAnswer: 'False',
      explanation: 'Too many chunks can dilute relevant information, exceed context windows, and confuse the LLM. Retrieval precision and having the right chunks matters more than quantity.',
    },
    {
      id: 'rag-arch-3', type: 'code',
      question: 'In the following RAG pipeline code, what does the "stuff" chain type do?',
      code: `qa_chain = RetrievalQA.from_chain_type(
    llm=llm,
    chain_type="stuff",
    retriever=vectorstore.as_retriever()
)`,
      options: [
        'Stuffs all retrieved documents into a single prompt',
        'Stuffs the query into the vector store index',
        'Processes each document individually and combines results',
        'Refines the answer iteratively through each document',
      ],
      correctAnswer: 'Stuffs all retrieved documents into a single prompt',
      explanation: 'The "stuff" chain type concatenates all retrieved documents into one prompt. It is simple and preserves full context but is limited by the LLM\'s context window.',
    },
    {
      id: 'rag-arch-4', type: 'fillblank',
      question: 'The three components of the "RAG Triad" are Context Relevance, Answer Relevance, and ___.',
      correctAnswer: 'Groundedness',
      explanation: 'The RAG Triad measures: (1) whether the retrieved context matches the query, (2) whether the answer addresses the question, and (3) whether the answer is grounded in (faithful to) the retrieved context.',
    },
    {
      id: 'rag-arch-5', type: 'match',
      question: 'Match each RAG stage with its primary role:',
      pairs: [
        { left: 'Document Loader', right: 'Extracts text from raw files (PDF, HTML, etc.)' },
        { left: 'Text Splitter', right: 'Divides documents into manageable chunks' },
        { left: 'Embedding Model', right: 'Converts text into dense vector representations' },
        { left: 'Vector Store', right: 'Stores and indexes embeddings for similarity search' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'These four stages form the ingestion pipeline. Document loaders handle format diversity, text splitters manage chunk boundaries, embedding models encode semantics, and vector stores enable fast retrieval.',
    },
  ],
}))

export {}
