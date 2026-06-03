import { registerContent } from '@/content/index'

registerContent('p20-llamaindex', () => ({
  difficulty: 'Advanced',
  estimatedTime: '60 minutes',
  prerequisites: ['p8-transformers'],
  tags: ['Specialized Modules', 'Advanced', 'RAG', 'LlamaIndex'],
  objectives: [
    'Understand LlamaIndex core: Documents, Nodes, Indices, Query Engines',
    'Build ingestion pipelines with readers, parsers, and transformations',
    'Implement different index types: Summary, VectorStore, KeywordTable, KnowledgeGraph',
    'Create QueryEngine and ChatEngine with memory and routing',
    'Build document agents with tool integration for complex workflows',
  ],
  theory: `# LlamaIndex Complete

## Core Concepts

### Documents and Nodes
**Documents** are raw input. **Nodes** are processed chunks with text, metadata, and embeddings.

### Index Types
| Index | Retrieval Strategy | Use Case |
|-------|-------------------|----------|
| SummaryIndex | Iterate all nodes sequentially | Small docs, simple Q&A |
| VectorStoreIndex | Top-k embedding similarity | Semantic search, RAG |
| KeywordTableIndex | Keyword matching | Factual lookups |
| KnowledgeGraphIndex | Entity-relation graph | Multi-hop reasoning |

### Ingestion Pipeline
$$\\text{Raw Data} \\rightarrow \\text{Readers} \\rightarrow \\text{Parsers} \\rightarrow \\text{Transformations} \\rightarrow \\text{Indices}$$

1. **Readers**: SimpleDirectoryReader, PDFReader, DatabaseReader
2. **Parsers**: SentenceSplitter, TokenTextSplitter
3. **Transformations**: Embeddings, metadata extraction

### QueryEngine vs ChatEngine
- **QueryEngine**: Single-turn Q&A (Retrieve $\\rightarrow$ Synthesize $\\rightarrow$ Response)
- **ChatEngine**: Multi-turn with memory (QueryEngine + ChatMemoryBuffer)

### RouterQueryEngine
Routes queries to specialized sub-engines:
1. Selector chooses best sub-engine based on query
2. Sub-engine handles the query
3. Response returned

### Agents
$$\\text{DocumentAgent} = \\text{QueryEngine}_1 + \\text{QueryEngine}_2 + \\dots + \\text{Tools}$$

- **OpenAIAgent**: Function calling with OpenAI
- **ReActAgent**: ReAct loop (Reason + Act)`,
  understanding: {
    analogy: 'A personal research assistant who reads all documents, organizes them in a filing cabinet (indices), and answers questions. The ingestion pipeline is highlighting and tagging documents. QueryEngine answers "What does this say about X?" ChatEngine has conversations remembering what was discussed.',
    steps: [
      { title: 'Load Documents', content: 'Use SimpleDirectoryReader or specialized readers to load documents with text and metadata.' },
      { title: 'Parse and Transform', content: 'Split into Nodes with SentenceSplitter, apply transformations like embedding generation and metadata extraction.' },
      { title: 'Build Index', content: 'Choose index type: VectorStoreIndex for semantic, SummaryIndex for small docs, KeywordTableIndex for factual lookups.' },
      { title: 'Create Query Engine', content: 'Configure retriever (top_k, threshold) and response synthesizer (compact, refine, tree_summarize).' },
      { title: 'Deploy with Chat/Agency', content: 'Wrap in ChatEngine for conversation. Create agents with multiple QueryEngine tools for complex workflows.' },
    ],
    misconceptions: [
      { misconception: 'LlamaIndex only works with OpenAI models', truth: 'Supports any LLM through abstraction layer: Anthropic, Cohere, HuggingFace, Ollama, LlamaCPP.' },
      { misconception: 'VectorStoreIndex is always the best choice', truth: 'Excels at semantic search but struggles with factual lookups. KeywordTableIndex is better for exact matches.' },
      { misconception: 'LlamaIndex and LangChain compete', truth: 'They complement each other. LlamaIndex specializes in data indexing/retrieval, LangChain focuses on chain/agent orchestration.' },
    ],
    comparisons: [
      { label: 'Focus', methodA: 'LlamaIndex: Data indexing, retrieval, RAG', methodB: 'LangChain: Chain/agent orchestration, tools' },
      { label: 'Index Types', methodA: 'LlamaIndex: 10+ built-in index types', methodB: 'LangChain: Primarily vector store based' },
      { label: 'Query Routing', methodA: 'LlamaIndex: RouterQueryEngine built-in', methodB: 'LangChain: Custom routing with LCEL' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `from llama_index.core import VectorStoreIndex, SimpleDirectoryReader, Settings
from llama_index.embeddings.openai import OpenAIEmbedding
from llama_index.llms.openai import OpenAI

Settings.llm = OpenAI(model="gpt-4o-mini", temperature=0)
Settings.embed_model = OpenAIEmbedding(model="text-embedding-3-small")

# Load and index
documents = SimpleDirectoryReader("./data").load_data()
print(f"Loaded {len(documents)} documents")

index = VectorStoreIndex.from_documents(documents)

# Query
query_engine = index.as_query_engine(similarity_top_k=3)
response = query_engine.query("What is the main topic?")
print(f"Response: {response}")

# Streaming
stream_engine = index.as_query_engine(streaming=True)
response = stream_engine.query("Explain key concepts")
for chunk in response.response_gen:
    print(chunk, end="", flush=True)

# Persist
index.storage_context.persist("./storage")

# Reload
from llama_index.core import StorageContext, load_index_from_storage
storage = StorageContext.from_defaults(persist_dir="./storage")
loaded = load_index_from_storage(storage)`,
      output: `Loaded 12 documents
Response: The documents discuss machine learning fundamentals, covering supervised learning, neural networks, and deep learning with practical examples.`,
      explanation: 'Basic workflow: load documents, build VectorStoreIndex, query it. Index auto-generates embeddings. Persist saves to disk for reloading without re-indexing.',
    },
    {
      level: 'intermediate',
      code: `from llama_index.core import VectorStoreIndex, SimpleDirectoryReader, Settings
from llama_index.core.node_parser import SentenceSplitter
from llama_index.core.extractors import TitleExtractor
from llama_index.core.ingestion import IngestionPipeline
from llama_index.embeddings.openai import OpenAIEmbedding
from llama_index.core.indices.keyword_table import KeywordTableIndex
from llama_index.core.query_engine import RouterQueryEngine
from llama_index.core.selectors import LLMSingleSelector
from llama_index.core.tools import QueryEngineTool, ToolMetadata

Settings.embed_model = OpenAIEmbedding(model="text-embedding-3-small")

# Ingestion pipeline
pipeline = IngestionPipeline(
    transformations=[
        SentenceSplitter(chunk_size=512, chunk_overlap=50),
        TitleExtractor(),
        OpenAIEmbedding(),
    ]
)
nodes = pipeline.run(documents=SimpleDirectoryReader("./data").load_data())
print(f"Created {len(nodes)} nodes")

# Multiple index types
vec_index = VectorStoreIndex(nodes)
kw_index = KeywordTableIndex(nodes)

# Router query engine
router = RouterQueryEngine(
    selector=LLMSingleSelector.from_defaults(),
    query_engine_tools=[
        QueryEngineTool(
            query_engine=vec_index.as_query_engine(similarity_top_k=3),
            metadata=ToolMetadata(name="semantic", description="For semantic search"),
        ),
        QueryEngineTool(
            query_engine=kw_index.as_query_engine(),
            metadata=ToolMetadata(name="keyword", description="For exact keyword matches"),
        ),
    ],
)
response = router.query("What is backpropagation?")
print(f"Response: {response}")

# Chat engine
from llama_index.core.chat_engine import CondenseQuestionChatEngine
chat = CondenseQuestionChatEngine.from_defaults(
    query_engine=vec_index.as_query_engine(), verbose=True
)
print(chat.chat("What is gradient descent?"))
print(chat.chat("How does it relate to backpropagation?"))`,
      output: `Created 87 nodes
Response: Backpropagation calculates gradients of the loss function with respect to weights using the chain rule.
Chat 1: Gradient descent iteratively adjusts parameters to minimize loss.
Chat 2: Gradient descent uses gradients from backpropagation to update weights.`,
      explanation: 'Advanced features: ingestion pipeline (splitting, title extraction, embeddings), RouterQueryEngine (routes between semantic and keyword search), and CondenseQuestionChatEngine for multi-turn chat.',
    },
    {
      level: 'advanced',
      code: `from llama_index.core import VectorStoreIndex, SimpleDirectoryReader, Settings
from llama_index.core.agent import ReActAgent
from llama_index.core.tools import QueryEngineTool, ToolMetadata, FunctionTool
from llama_index.llms.openai import OpenAI
from llama_index.embeddings.openai import OpenAIEmbedding
from llama_index.core.memory import ChatMemoryBuffer
import json

Settings.llm = OpenAI(model="gpt-4o-mini", temperature=0)
Settings.embed_model = OpenAIEmbedding(model="text-embedding-3-small")

# Multi-domain indices
indices = {}
for domain in ["finance", "legal", "technical"]:
    docs = SimpleDirectoryReader(f"./{domain}").load_data()
    indices[domain] = VectorStoreIndex.from_documents(docs)

# Query engine tools
tools = []
for domain, index in indices.items():
    tools.append(QueryEngineTool(
        query_engine=index.as_query_engine(similarity_top_k=5),
        metadata=ToolMetadata(
            name=f"{domain}_qa",
            description=f"Use for {domain} document questions",
        ),
    ))

# Custom function tool
def count_words(text: str) -> str:
    return json.dumps({"word_count": len(text.split())})

tools.append(FunctionTool.from_defaults(fn=count_words))

# Agent with memory
agent = ReActAgent.from_tools(
    tools, verbose=True,
    memory=ChatMemoryBuffer.from_defaults(token_limit=4000),
    max_iterations=10,
)

# Multi-tool query
response = agent.chat(
    "What are the revenue projections from finance? "
    "Also check technical docs for implementation details."
)
print(f"Agent: {response}")

# Follow-up with memory
response2 = agent.chat("Summarize risks from legal contracts.")
print(f"Follow-up: {response2}")

# Async
import asyncio
async def run():
    tasks = [agent.achat("Total budget?"), agent.achat("Stakeholders?")]
    return await asyncio.gather(*tasks)`,
      output: `> Calling finance_qa with: What are revenue projections?
> Got: Revenue projections show 20% YoY growth...
> Calling technical_qa with: Implementation details?
> Got: Technical roadmap includes scaling infrastructure...

Agent: Revenue is projected to grow 20% YoY. Implementation requires scaling infrastructure.
Follow-up: Three main risks: data privacy compliance, contract renewal dependencies, liability caps.`,
      explanation: 'Production agent with multiple document query engines (finance, legal, technical), custom FunctionTool for metrics, ChatMemoryBuffer for conversation, and async support.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Enterprise Document Search', description: 'Index thousands of internal documents with RouterQueryEngine routing between document categories for natural language querying.' },
      { industry: 'Financial Analysis', description: 'Index annual reports and SEC filings. Agents combine query engines to cross-reference financial data, legal disclaimers, and technical projections.' },
      { industry: 'Legal Research', description: 'Index case law and contracts. KnowledgeGraphIndex captures entity relationships for multi-hop reasoning.' },
    ],
    caseStudy: {
      problem: 'A healthcare company needed clinical decision support across 50,000 medical papers, drug databases, and guidelines.',
      solution: 'Three-tier LlamaIndex: VectorStoreIndex for semantic search, KeywordTableIndex for exact drug names/dosages, KnowledgeGraphIndex for disease-symptom-treatment relationships. ReActAgent routed queries with citations.',
      results: 'Answer accuracy 96% with proper citations. Doctors saved 2 hours/day. System handles 5000 queries/day with 300ms retrieval time.',
    },
    bestPractices: [
      'Use IngestionPipeline for consistent processing — avoid manual node creation',
      'Combine multiple index types with RouterQueryEngine for better accuracy',
      'Set similarity_top_k=3-5 for Q&A, higher for summarization',
      'Persist indices with storage_context.persist() to avoid re-indexing',
      'Use async queries for high-throughput production systems',
    ],
    tools: ['LlamaIndex Core', 'SimpleDirectoryReader', 'VectorStoreIndex', 'RouterQueryEngine', 'ReActAgent', 'IngestionPipeline'],
    jobRoles: ['RAG Engineer', 'AI Application Developer', 'Data Engineer (AI)', 'Knowledge Management Engineer'],
    furtherReading: [
      'LlamaIndex Documentation (docs.llamaindex.ai)',
      'Building RAG with LlamaIndex (Tutorial)',
      'LlamaIndex Agent Documentation',
    ],
  },
  quiz: [
    {
      id: 'p20-li-1', type: 'mcq',
      question: 'What is the difference between a Document and a Node in LlamaIndex?',
      options: [
        'Documents are raw input; Nodes are processed chunks with metadata',
        'Documents store embeddings; Nodes store text only',
        'Documents in vector DB; Nodes in memory',
        'No difference — same concept',
      ],
      correctAnswer: 'Documents are raw input; Nodes are processed chunks with metadata',
      explanation: 'Documents are raw data from readers. Nodes are created by splitting/processing Documents, containing text, metadata, and optionally embeddings.',
    },
    {
      id: 'p20-li-2', type: 'truefalse',
      question: 'RouterQueryEngine selects the best sub-engine based on query content.',
      correctAnswer: 'True',
      explanation: 'RouterQueryEngine uses a selector (LLM or embedding-based) to analyze the query and route to the most appropriate sub-engine.',
    },
    {
      id: 'p20-li-3', type: 'code',
      question: 'What does IngestionPipeline do in this code?',
      code: 'pipeline = IngestionPipeline(\n    transformations=[\n        SentenceSplitter(chunk_size=512),\n        TitleExtractor(),\n        OpenAIEmbedding(),\n    ]\n)\nnodes = pipeline.run(documents=documents)',
      options: [
        'Sends documents to OpenAI',
        'Applies transformations to convert Documents into Nodes',
        'Creates vector database index directly',
        'Trains a model on document content',
      ],
      correctAnswer: 'Applies transformations to convert Documents into Nodes',
      explanation: 'IngestionPipeline applies transformations sequentially: splitting, title extraction, and embedding generation to produce processed Nodes.',
    },
    {
      id: 'p20-li-4', type: 'fillblank',
      question: 'The component that generates responses from retrieved Nodes is called Response ___.',
      correctAnswer: 'Synthesizer',
      explanation: 'Response Synthesizers (CompactAndRefine, TreeSummarize) take retrieved Nodes and generate coherent responses within context limits.',
    },
    {
      id: 'p20-li-5', type: 'match',
      question: 'Match LlamaIndex component to function:',
      pairs: [
        { left: 'VectorStoreIndex', right: 'Semantic search via embedding similarity' },
        { left: 'KeywordTableIndex', right: 'Exact keyword matching for factual lookups' },
        { left: 'RouterQueryEngine', right: 'Routes queries to specialized sub-engines' },
        { left: 'ReActAgent', right: 'Reason-act loop with tool orchestration' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'Different index types serve different strategies. RouterQueryEngine selects between them, ReActAgent orchestrates multi-tool workflows.',
    },
  ],
}))

export {}
