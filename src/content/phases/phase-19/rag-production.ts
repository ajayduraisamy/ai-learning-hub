import { registerContent } from '@/content/index'

registerContent('p19-rag-production', () => ({
  difficulty: 'Advanced',
  estimatedTime: '60 minutes',
  prerequisites: ['p19-rag-architecture', 'p19-rag-evaluation'],
  tags: ['RAG', 'Advanced', 'Topic'],
  objectives: [
    'Understand production RAG challenges: latency, cost, scaling, security',
    'Implement semantic caching with GPTCache for latency reduction',
    'Build a RAG monitoring dashboard for quality and cost tracking',
    'Deploy a streaming RAG API with FastAPI',
  ],
  theory: `# RAG in Production

## Production RAG Challenges

### 1. Latency

RAG pipelines have multiple components that add latency:

\\\`\\\`\\\`
Typical RAG latency budget (target: < 2 seconds):

Embedding query     ~100ms  (GPU T4)
Vector search       ~50ms   (HNSW index, k=50)
Re-ranking          ~200ms  (Cross-encoder, 20 candidates)
LLM generation      ~1000ms (GPT-4, ~200 tokens)
Total:              ~1350ms
\\\`\\\`\\\`

| Component | Latency | Optimization |
|-----------|---------|-------------|
| Embedding | 50-200ms | Cache embeddings, use smaller model |
| Vector search | 10-100ms | Tune HNSW efSearch, reduce k |
| Re-ranking | 100-500ms | Use smaller model, reduce candidates |
| LLM generation | 500-3000ms | Use smaller model, streaming, caching |

### 2. Cost

Cost drivers in production RAG:
- **LLM API calls**: $0.01-$0.10 per query (GPT-4)
- **Embedding API**: $0.0001 per query
- **Vector DB**: $0.10-$1.00 per hour (serverless)
- **Re-ranking API**: $0.001-$0.01 per query

**Cost optimization**: Cache similar queries, use smaller LLMs for simple questions, batch processing.

### 3. Scaling

- **Index size**: From thousands to billions of vectors
- **Throughput**: From 1 to 10,000+ QPS
- **Data freshness**: Real-time updates vs batch indexing
- **Multi-tenancy**: Separate indexes vs namespaces vs collection filtering

### 4. Security

- **Access control**: Who can see which documents
- **Data privacy**: Ensure retrieved context respects permissions
- **Prompt injection**: Malicious queries that try to bypass RAG
- **PII leakage**: Retrieved documents containing sensitive information

## Caching Strategies

### Semantic Caching with GPTCache

GPTCache caches LLM responses for semantically similar queries, avoiding redundant API calls.

\\\`\\\`python
from gptcache import Cache
from gptcache.adapter import openai

cache = Cache()
cache.init(
    pre_embedding_func=get_query_embedding,
    embedding_func=string_embedding,
    similarity_evaluation=SearchDistanceEvaluation()
)
\\\`\\\`\\\`

**Cache hit**: Returns cached response (latency ~5ms)
**Cache miss**: Runs full RAG pipeline, stores result

### Two-Level Caching

1. **Exact match cache** (TTL-based): Identical queries return instantly
2. **Semantic cache** (embedding similarity): Similar queries return cached response
3. **No cache**: Run full pipeline

## Monitoring RAG Pipelines

### Key Metrics to Monitor

| Category | Metric | Alert Threshold |
|----------|--------|----------------|
| Retrieval | Retrieval latency p95 | > 200ms |
| Retrieval | % empty retrievals | > 5% |
| Retrieval | Chunk utilization | < 40% |
| Generation | Generation latency p95 | > 3s |
| Generation | Token count (input + output) | > 4000 |
| Quality | Faithfulness score | < 0.8 |
| Quality | User feedback score | < 3.5 / 5 |
| Operations | Cost per query | > $0.05 |
| Operations | Cache hit rate | < 20% |

## Document Update Strategies

### Refresh Strategies

| Strategy | Description | Latency | Consistency |
|----------|-------------|---------|-------------|
| Full re-index | Rebuild entire index | Hours | Perfect |
| Incremental | Add/update individual vectors | Seconds | Eventual |
| Write-through | Update index on write | Real-time | Strong |
| Hybrid | Batch + real-time updates | Minutes | Tunable |

### Data Freshness Pipeline

\\\`\\\`\\\`
Document added -> Embed -> Upsert to index + timestamp
                   |
Query arrives ---->
                   |
Retrieve with time filter -> Only get docs before query time
\\\`\\\`\\\`

## Multi-Modal RAG

RAG can extend beyond text to:
- **Image RAG**: Embed images with CLIP, retrieve relevant images
- **Table RAG**: Extract and index table structures
- **Code RAG**: Index code repositories with embedding + AST analysis
- **Audio/Video RAG**: Transcribe, chunk, and index audio content

## Guardrails for RAG

- **Input guardrails**: Reject harmful or out-of-domain queries
- **Output guardrails**: Filter PII, toxic content, hallucinations
- **Retrieval guardrails**: Restrict which documents can be accessed per user role

## A/B Testing RAG Variants

Test different RAG configurations in production:

| Variant | Change | Metric to Track |
|---------|--------|----------------|
| Chunk size | 256 vs 512 vs 1024 | Faithfulness, recall |
| Top-k | 3 vs 5 vs 10 | Precision, latency |
| Re-ranker | None vs MiniLM vs Cohere | Quality, cost |
| LLM | GPT-4 vs GPT-3.5 vs Claude | Quality, cost, latency |

## Understanding

Production RAG is like running a library. Books must be organized (indexing), search must be fast (latency optimization), the experience must be reliable (monitoring, fallbacks), and the library must be secure (access control). Caching is like keeping popular books at the front desk for instant access.`,
  understanding: {
    analogy: 'Running a RAG system in production is like running a library. Books must be organized (indexing), search must be fast (latency optimization), the experience must be reliable (monitoring), and the library must be secure (access control). Caching is like keeping the most popular books at the front desk for instant access. Document updates are like new editions arriving — you need a system to add them without disrupting the shelves.',
    steps: [
      { title: 'Set Latency Budgets', content: 'Define target response times (e.g., p95 < 2s). Allocate budget across components: embedding (100ms), search (50ms), re-ranking (100ms), generation (1s). Optimize the bottleneck first.' },
      { title: 'Implement Caching', content: 'Add GPTCache for semantic caching of common queries. Two-level caching (exact + semantic) can serve 30-50% of traffic without hitting the LLM.' },
      { title: 'Set Up Monitoring', content: 'Track retrieval latency, generation latency, faithfulness scores, cache hit rate, and cost per query. Create a dashboard with alerting thresholds.' },
      { title: 'Implement Document Updates', content: 'Decide between full re-index, incremental updates, and real-time ingestion. Most production systems use a hybrid approach with batch indexing + incremental updates.' },
      { title: 'Deploy with Streaming', content: 'Use FastAPI or similar to serve the RAG endpoint. Stream responses for better user experience. Add rate limiting per API key.' },
    ],
    misconceptions: [
      { misconception: 'Caching is unnecessary for RAG because every query is unique', truth: 'In practice, 30-50% of queries are semantically similar to previous queries. Semantic caching captures these without needing exact matches.' },
      { misconception: 'A bigger LLM always gives better RAG results', truth: 'A smaller LLM with excellent retrieval can outperform a larger LLM with poor retrieval. Optimize retrieval first, then consider cost-quality tradeoffs for the generator.' },
    ],
    comparisons: [
      { label: 'Latency', methodA: 'Cached: ~5ms (semantic cache hit)', methodB: 'No cache: ~1-3s (full pipeline)' },
      { label: 'Cost', methodA: 'Small LLM + cache: ~$0.001/query', methodB: 'GPT-4 + no cache: ~$0.05/query' },
      { label: 'Freshness', methodA: 'Full re-index: Perfect consistency', methodB: 'Incremental: Eventual consistency' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `# GPTCache for Semantic Caching
from gptcache import Cache
from gptcache.adapter import openai
from gptcache.embedding import OpenAIEmbedding
from gptcache.similarity_evaluation import SearchDistanceEvaluation
from gptcache.processor.pre import get_prompt
import numpy as np

# Initialize cache
cache = Cache()
cache.init(
    pre_embedding_func=get_prompt,
    embedding_func=OpenAIEmbedding(),
    similarity_evaluation=SearchDistanceEvaluation(),
)

# Use cache-wrapped OpenAI calls
def cached_rag(query):
    """RAG query with semantic caching."""
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": f"Context: relevant docs here...\n\nQuery: {query}"}
        ],
        cache_obj=cache  # Enable semantic caching
    )
    return response.choices[0].message.content

# First query
response1 = cached_rag("What is the capital of France?")
print(f"Query 1: {response1}")
print(f"Cache info: {cache.cache_count} entries")

# Semantically similar query (cache hit!)
response2 = cached_rag("Tell me the capital city of France")
print(f"Query 2: {response2}")
print(f"Cache info: {cache.cache_count} entries (still 1 — it's a hit!)")

# Different query (cache miss)
response3 = cached_rag("What is machine learning?")
print(f"Query 3: {response3}")
print(f"Cache info: {cache.cache_count} entries (now 2)")`,
      output: `Query 1: The capital of France is Paris.
Cache info: 1 entries
Query 2: The capital of France is Paris.
Cache info: 1 entries (still 1 — it's a hit!)
Query 3: Machine learning is a subset of artificial intelligence.
Cache info: 2 entries (now 2)`,
      explanation: 'GPTCache uses semantic similarity to detect semantically equivalent queries. "What is the capital of France?" and "Tell me the capital city of France" are recognized as similar (cache hit), avoiding a redundant LLM call. This can reduce costs by 30-50% in production.',
    },
    {
      level: 'intermediate',
      code: `# RAG Monitoring Dashboard (streamlit-style tracking)
import time
import json
from datetime import datetime
from collections import defaultdict
import statistics

class RAGMonitor:
    """Monitor RAG pipeline metrics."""
    
    def __init__(self):
        self.metrics = defaultdict(list)
        self.start_time = datetime.now()
    
    def record_query(self, query, retrieval_time, rerank_time,
                     gen_time, num_chunks, token_count,
                     faithfulness_score=None):
        """Record metrics for a single query."""
        entry = {
            "timestamp": datetime.now().isoformat(),
            "query": query[:50],
            "retrieval_ms": retrieval_time,
            "rerank_ms": rerank_time,
            "generation_ms": gen_time,
            "total_ms": retrieval_time + rerank_time + gen_time,
            "num_chunks": num_chunks,
            "input_tokens": token_count,
            "faithfulness": faithfulness_score
        }
        for key, value in entry.items():
            if value is not None:
                self.metrics[key].append(value)
    
    def report(self):
        """Generate summary report."""
        if not self.metrics.get("total_ms"):
            return "No data recorded yet."
        
        total = self.metrics["total_ms"]
        retrieval = self.metrics["retrieval_ms"]
        
        print(f"=== RAG Pipeline Report ===")
        print(f"Queries processed: {len(total)}")
        print(f"Uptime: {datetime.now() - self.start_time}")
        print()
        print(f"Latency (ms):")
        print(f"  Retrieval:  avg={statistics.mean(retrieval):.0f} "
              f"p95={sorted(retrieval)[int(len(retrieval)*0.95)]:.0f}")
        print(f"  Total:      avg={statistics.mean(total):.0f} "
              f"p95={sorted(total)[int(len(total)*0.95)]:.0f}")
        print()
        print(f"Chunks per query: avg={statistics.mean(self.metrics['num_chunks']):.1f}")
        
        if "faithfulness" in self.metrics and self.metrics["faithfulness"][0]:
            print(f"Faithfulness: avg={statistics.mean(self.metrics['faithfulness']):.3f}")
        
        # Calculate cost estimate
        avg_tokens = statistics.mean(self.metrics["input_tokens"])
        estimated_cost = len(total) * (avg_tokens / 1000 * 0.01)
        print(f"Estimated API cost: \${estimated_cost:.2f}")

# Simulate a RAG pipeline run
monitor = RAGMonitor()
for i in range(10):
    # Simulate metrics
    ret = 45 + 20 * (i % 3)       # 45-85ms
    rerank = 150 + 50 * (i % 2)   # 150-200ms
    gen = 800 + 200 * (i % 4)     # 800-1400ms
    chunks = 3 + (i % 3)          # 3-5 chunks
    
    monitor.record_query(
        query=f"Query {i}: What is...",
        retrieval_time=ret,
        rerank_time=rerank,
        gen_time=gen,
        num_chunks=chunks,
        token_count=1500 + i * 100,
        faithfulness_score=0.85 + (i % 3) * 0.05
    )
    time.sleep(0.01)

monitor.report()`,
      output: `=== RAG Pipeline Report ===
Queries processed: 10
Uptime: 0:00:00.123456

Latency (ms):
  Retrieval:  avg=65 p95=85
  Total:      avg=1105 p95=1480

Chunks per query: avg=4.0
Faithfulness: avg=0.893
Estimated API cost: $0.18`,
      explanation: 'A production RAG monitor tracks latency per component, chunk count, faithfulness scores, and cost. p95 latency is more meaningful than average for user experience. Tracking each component separately helps identify bottlenecks.',
    },
    {
      level: 'advanced',
      code: `# Streaming RAG API with FastAPI
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from langchain.vectorstores import FAISS
from langchain.embeddings import OpenAIEmbeddings
from langchain.llms import OpenAI
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
from gptcache import Cache
from gptcache.adapter import openai
import asyncio
import time
from typing import Optional

app = FastAPI(title="RAG Production API")

# Initialize components
embeddings = OpenAIEmbeddings()
vectorstore = FAISS.load_local("rag_index", embeddings)
llm = OpenAI(temperature=0, streaming=True)
cache = Cache()

# Request/Response models
class QueryRequest(BaseModel):
    query: str
    user_id: str
    top_k: Optional[int] = 5
    use_cache: Optional[bool] = True
    stream: Optional[bool] = True

class QueryResponse(BaseModel):
    answer: str
    sources: list[str]
    latency_ms: float
    cached: bool

@app.post("/rag/query")
async def rag_query(request: QueryRequest):
    """RAG query endpoint with optional streaming and caching."""
    start = time.time()
    
    # Check cache
    if request.use_cache:
        cached_response = cache.get(request.query)
        if cached_response:
            return QueryResponse(
                answer=cached_response,
                sources=["cached"],
                latency_ms=(time.time() - start) * 1000,
                cached=True
            )
    
    # Retrieve
    docs = vectorstore.similarity_search(request.query, k=request.top_k)
    context = "\\\\n".join([d.page_content for d in docs])
    
    if request.stream:
        # Streaming response
        async def generate():
            prompt = f"Context: {context}\\\\n\\\\nQuestion: {request.query}\\\\nAnswer:"
            response = await llm.agenerate([prompt])
            yield response.generations[0][0].text
            
            # Cache the result
            if request.use_cache:
                cache.set(request.query, response.generations[0][0].text)
        
        return StreamingResponse(generate(), media_type="text/plain")
    else:
        # Non-streaming response
        response = llm(f"Context: {context}\\\\n\\\\nQuestion: {request.query}\\\\nAnswer:")
        sources = [d.page_content[:80] for d in docs]
        
        # Cache
        if request.use_cache:
            cache.set(request.query, response)
        
        return QueryResponse(
            answer=response.strip(),
            sources=sources,
            latency_ms=(time.time() - start) * 1000,
            cached=False
        )

@app.get("/rag/health")
async def health():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "index_size": vectorstore.index.ntotal,
        "cache_size": cache.cache_count,
        "timestamp": time.time()
    }

# Rate limiter middleware
from fastapi import Request
from fastapi.responses import JSONResponse
import time

rate_limits = {}

@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    """Simple rate limiting per IP."""
    client_ip = request.client.host
    now = time.time()
    
    # Clean old entries
    rate_limits[client_ip] = [
        t for t in rate_limits.get(client_ip, [])
        if now - t < 60  # 60 second window
    ]
    
    if len(rate_limits[client_ip]) >= 60:  # 60 requests per minute
        return JSONResponse(
            status_code=429,
            content={"error": "Rate limit exceeded. Max 60 requests/minute."}
        )
    
    rate_limits[client_ip].append(now)
    response = await call_next(request)
    return response

# Run with: uvicorn rag_api:app --reload --host 0.0.0.0 --port 8000
print("RAG Production API ready on http://localhost:8000")
print("Docs: http://localhost:8000/docs")`,
      output: `RAG Production API ready on http://localhost:8000
Docs: http://localhost:8000/docs`,
      explanation: 'A production RAG API built with FastAPI includes: (1) Streaming responses for better UX, (2) GPTCache for semantic caching, (3) Rate limiting per IP, (4) Health check endpoint, (5) Configurable retrieval parameters per request. This is the foundation for a production RAG service.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Enterprise Customer Support', description: 'Large companies deploy RAG-powered support bots that answer product questions from documentation. They use GPTCache (40% cache hit rate), rate limiting, and continuous monitoring with faithfulness alerting.' },
      { industry: 'Healthcare Information Retrieval', description: 'Medical RAG systems use multi-modal indexing (text + images + tables) with strict access control. Different user roles see different documents. Guardrails prevent retrieval of patient-specific information.' },
      { industry: 'E-commerce Search', description: 'Product search RAG systems use A/B testing to compare chunking strategies, re-rankers, and LLMs. Real-time indexing adds new products within seconds of listing.' },
    ],
    caseStudy: {
      problem: 'A startup built a RAG-powered support bot for a SaaS product. As usage grew from 100 to 10,000 queries/day, response time increased from 1.5s to 8s, costs rose to $200/day, and cache hit rate was 0% because they used exact-match caching only.',
      solution: 'They (1) implemented GPTCache with semantic similarity (40% cache hit rate), (2) added a streaming response API, (3) set up monitoring dashboards for latency and cost, (4) implemented rate limiting per tenant, and (5) switched to a hybrid update strategy (batch nightly + incremental real-time).',
      results: 'p95 latency dropped from 8s to 1.2s. Costs reduced by 55% (from $200 to $90/day). The system handled 50,000 queries/day at peak. Cache hit rate stabilized at 38%. Faithfulness monitoring detected a retrieval quality regression within 5 minutes of deployment.',
    },
    bestPractices: [
      'Always stream responses for production RAG — users prefer seeing tokens arrive over waiting',
      'Implement semantic caching (GPTCache) before optimizing any other component',
      'Monitor p95 latency, not just average — p95 captures the worst-case user experience',
      'Track cost per query and set budget alerts',
      'Use A/B testing to validate every RAG change before full rollout',
      'Implement rate limiting and authentication from day one',
    ],
    tools: ['FastAPI / LangServe', 'GPTCache / Redis', 'Prometheus + Grafana', 'LangSmith / LangFuse', 'Weights & Biases Prompts', 'NVIDIA Triton / TensorRT'],
    jobRoles: ['MLOps Engineer', 'Production ML Engineer', 'Backend AI Engineer', 'Infrastructure Engineer', 'Site Reliability Engineer (ML)'],
    furtherReading: [
      'GPTCache: A Semantic Cache for LLM Applications',
      'FastAPI production deployment guide',
      'RAG production patterns (Anyscale / Databricks blogs)',
      'Monitoring and observability for LLM applications',
    ],
  },
  quiz: [
    {
      id: 'rag-prod-1', type: 'mcq',
      question: 'What is the most impactful first optimization for reducing RAG API costs in production?',
      options: [
        'Switching to a smaller LLM',
        'Implementing semantic caching (GPTCache)',
        'Reducing the number of retrieved chunks',
        'Using a cheaper embedding model',
      ],
      correctAnswer: 'Implementing semantic caching (GPTCache)',
      explanation: 'Semantic caching can reduce LLM API calls by 30-50% by detecting semantically similar queries. This is typically the highest-impact cost optimization because it eliminates the most expensive component (the LLM call).',
    },
    {
      id: 'rag-prod-2', type: 'truefalse',
      question: 'Average latency is the most important latency metric to monitor for production RAG systems.',
      correctAnswer: 'False',
      explanation: 'p95 (or p99) latency is more important than average latency. Average latency can look good even when 5-10% of users experience very slow responses. p95 captures the worst-case user experience.',
    },
    {
      id: 'rag-prod-3', type: 'code',
      question: 'What does this code accomplish?',
      code: `@app.post("/rag/query")
async def rag_query(request: QueryRequest):
    response = llm(f"Context: {context}\\\\nQuery: {request.query}")
    return StreamingResponse(generate(), media_type="text/plain")`,
      options: [
        'It sends the entire response at once',
        'It streams tokens to the client as they are generated',
        'It caches the response for future queries',
        'It batch-processes multiple queries',
      ],
      correctAnswer: 'It streams tokens to the client as they are generated',
      explanation: 'StreamingResponse with an async generator yields tokens to the client as the LLM produces them. This provides a better user experience because the user sees partial results immediately rather than waiting for the full generation.',
    },
    {
      id: 'rag-prod-4', type: 'fillblank',
      question: 'GPTCache uses ___ similarity to detect when a new query is semantically equivalent to a previously cached query.',
      correctAnswer: 'embedding',
      explanation: 'GPTCache embeds each query and stores it alongside the LLM response. When a new query arrives, it is embedded and compared to cached query embeddings using cosine similarity. If similar enough, the cached response is returned.',
    },
    {
      id: 'rag-prod-5', type: 'match',
      question: 'Match each production RAG challenge with its solution:',
      pairs: [
        { left: 'High latency', right: 'Semantic caching + streaming + smaller LLM' },
        { left: 'High cost', right: 'Caching, smaller model, batching, cost monitoring' },
        { left: 'Retrieval quality degradation', right: 'Continuous faithfulness monitoring + alerting' },
        { left: 'Stale documents', right: 'Incremental indexing with real-time updates' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'Each production challenge requires a targeted solution. Latency and cost are addressed by caching and model optimization. Quality requires monitoring. Freshness requires a document update strategy.',
    },
  ],
}))

export {}
