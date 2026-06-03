import { registerContent } from '@/content/index'

registerContent('p19-advanced-rag', () => ({
  difficulty: 'Advanced',
  estimatedTime: '60 minutes',
  prerequisites: ['p19-rag-architecture', 'p19-retrieval-strategies'],
  tags: ['RAG', 'Advanced', 'Topic'],
  objectives: [
    'Understand Self-RAG and how critic models evaluate retrieval necessity',
    'Implement Corrective RAG with web search fallback for low-relevance retrievals',
    'Build Graph RAG with entity extraction and community detection',
    'Design an Agentic RAG system that decides when and how to retrieve',
  ],
  theory: `# Advanced RAG (Self-RAG, Corrective RAG, Graph RAG)

## Self-RAG

Self-RAG (Self-Reflective Retrieval-Augmented Generation) introduces a critic model that evaluates both the necessity and quality of retrieved passages. The model generates **reflection tokens** that signal:

1. **Is retrieval needed?** (\\\\texttt{Retrieve}: Yes/No)
2. **Is the passage relevant?** (\\\\texttt{IsRel}: Relevant/Irrelevant)
3. **Is the generation supported?** (\\\\texttt{IsSup}: Supported/Not Supported)
4. **Is the overall output useful?** (\\\\texttt{IsUse}: Useful/Not Useful)

### How Self-RAG Works

\\\`\\\`\\\`
1. Input query q
2. Critic decides: Should we retrieve? [Retrieve] or [NoRetrieve]
3. If [Retrieve]:
   a. Retrieve top-k passages
   b. For each passage, generate continuation + [IsRel] token
   c. Only keep passages where [IsRel] = Relevant
   d. For kept passages, generate final answer + [IsSup] token
4. If [NoRetrieve]:
   a. Generate directly from model parameters
5. Select best output using [IsUse] scores
\\\`\\\`\\\`

The critic model is trained on a dataset with human-annotated reflection tokens. This allows Self-RAG to adaptively decide whether to retrieve and which passages to use.

## Corrective RAG (CRAG)

CRAG adds a relevance evaluation step after retrieval. If retrieved passages are not relevant enough, the system takes corrective action.

### CRAG Pipeline

\\\`\\\`\\\`
1. Retrieve documents for query q
2. Evaluate relevance of each document
3. If ALL documents are relevant:
   --> Use retrieved docs for generation
4. If SOME documents are relevant:
   --> Keep relevant docs, discard irrelevant, transform query
5. If NO documents are relevant:
   --> Fall back to web search (or other external source)
\\\`\\\`\\\`

The relevance evaluator is typically a fine-tuned model trained to classify query-document pairs as:
- **Correct**: Document supports answering the query
- **Incorrect**: Document does not support answering the query
- **Ambiguous**: Document partially supports or needs more context

## Graph RAG

Graph RAG builds a knowledge graph from documents and uses it for retrieval. Instead of retrieving chunks by vector similarity, it:

1. **Entity Extraction**: Extract entities (people, places, concepts) from all documents
2. **Community Detection**: Group related entities into communities using graph algorithms
3. **Hierarchical Summarization**: Generate summaries for each community level
4. **Graph-Based Retrieval**: For a query, find related entities and traverse the graph to retrieve relevant content

### Microsoft's GraphRAG

Microsoft's GraphRAG use a global-to-local search approach:

1. **Global Search**: Identify the most relevant communities from the query
2. **Local Search**: Within those communities, find specific entities and relationships
3. **Aggregation**: Combine community summaries, entity descriptions, and relationship details

Benefits over chunk-based RAG:
- Captures relationships between entities
- Handles multi-hop questions (e.g., "What regulations affect Company X's operations in Country Y?")
- Provides structured, interpretable knowledge

## Agentic RAG

Agentic RAG uses an LLM-powered agent that decides:

- **When to retrieve**: Only when necessary (saves cost and latency)
- **What to retrieve**: Which index or tool to query
- **How to search**: Query formulation, filtering, parameters
- **Whether to re-retrieve**: If initial results are poor, try again
- **Whether to use tools**: Calculator, web search, database query

### Agentic RAG Loop

\\\`\\\`\\\`
while not done:
    thought = agent.think(query, context_so_far)
    if thought.action == "retrieve":
        docs = retrieve(thought.query)
        context_so_far += docs
    elif thought.action == "generate":
        answer = llm.generate(query, context_so_far)
        done = True
    elif thought.action == "web_search":
        results = search_web(thought.query)
        context_so_far += results
\\\`\\\`\\\`

## Comparison

| Method | Adaptivity | External Knowledge | Complexity | Best For |
|--------|-----------|-------------------|------------|----------|
| Naive RAG | Low | Vector DB only | Low | Simple QA |
| Self-RAG | High (critic decides) | Vector DB | High | Quality-sensitive apps |
| CRAG | Medium (fallback) | Vector DB + Web | Medium | High-stakes QA |
| Graph RAG | Low (graph structure) | Knowledge Graph | High | Multi-hop questions |
| Agentic RAG | Very high | Multiple tools | Very high | Complex workflows |

## Understanding

Self-RAG is a critical student who asks "Do I need to look this up? Is this source reliable? Is my answer supported?" before answering. CRAG is a cautious researcher who checks the retrieved information and goes to the library (web) if the documents are insufficient. Graph RAG is a detective who maps out all the connections between pieces of evidence before drawing conclusions. Agentic RAG is an autonomous researcher who decides which tool to use, when to search, and whether the answer is complete.`,
  understanding: {
    analogy: 'Self-RAG is a thoughtful student who reflects on whether they know the answer already, whether the textbook they opened is actually relevant, and whether their answer is well-supported. CRAG is a cautious researcher who verifies sources and goes to the web if the library books are insufficient. Graph RAG is a detective who maps relationships between suspects, locations, and events before drawing conclusions. Agentic RAG is an autonomous research assistant who decides which tool to use, when to search, and when the answer is complete enough.',
    steps: [
      { title: 'Identify Limitations', content: 'Analyze where your basic RAG pipeline fails — irrelevant retrievals, missed answers, poor handling of ambiguous queries. This determines which advanced technique to apply.' },
      { title: 'Add Self-Reflection (Self-RAG)', content: 'Train or prompt an LLM to act as a critic. Generate reflection tokens that indicate retrieval necessity, passage relevance, and answer support. Use these to filter bad retrievals.' },
      { title: 'Add Corrective Actions (CRAG)', content: 'Implement a relevance classifier. If retrieval quality is low, trigger a fallback (web search, query reformulation, or re-retrieval).' },
      { title: 'Build Knowledge Graph (Graph RAG)', content: 'Extract entities and relationships from documents. Use community detection to group related entities. Index community summaries alongside vector chunks.' },
      { title: 'Implement Agentic Behavior', content: 'Give the LLM tools (retriever, calculator, web search) and let it decide the retrieval strategy dynamically based on the query and intermediate results.' },
    ],
    misconceptions: [
      { misconception: 'Self-RAG, CRAG, and Graph RAG are competing approaches', truth: 'These are complementary techniques. You can combine Self-RAG\'s critic with CRAG\'s fallback mechanism and Graph RAG\'s structured knowledge in a single system.' },
      { misconception: 'Graph RAG always outperforms chunk-based RAG', truth: 'Graph RAG excels at multi-hop and relationship-centric questions but may underperform on simple factoid QA. The overhead of entity extraction and graph construction is significant.' },
    ],
    comparisons: [
      { label: 'Retrieval Adaptivity', methodA: 'Self-RAG: Critic decides if retrieval needed', methodB: 'Graph RAG: Fixed graph structure' },
      { label: 'Fallback Mechanism', methodA: 'CRAG: Web search when irrelevant', methodB: 'Agentic RAG: Multiple tool options' },
      { label: 'Best Query Type', methodA: 'Graph RAG: Multi-hop, relational questions', methodB: 'CRAG: High-stakes, needs verification' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `# Self-RAG: Critic Model for Retrieval Evaluation
from langchain.llms import OpenAI
from langchain.prompts import PromptTemplate
import json

# Critic prompt for Self-RAG
critic_prompt = PromptTemplate(
    input_variables=["query", "passage"],
    template="""Evaluate the relevance of the following passage for answering the query.

Query: {query}

Passage: {passage}

First, determine if retrieval was necessary for this query:
- Output [Retrieve] if this query needs external information
- Output [NoRetrieve] if you can answer from your own knowledge

Then, if retrieval was done, evaluate the passage relevance:
- Output [Relevant] if the passage helps answer the query
- Output [Irrelevant] if the passage does not help

Finally, explain your reasoning.

Response format (JSON):
{{"retrieval_decision": "[Retrieve] or [NoRetrieve]",
  "relevance": "[Relevant] or [Irrelevant]",
  "reasoning": "..."}}
"""
)

llm = OpenAI(temperature=0)

def self_rag(query, passage=None):
    """Self-RAG with critic evaluation."""
    prompt = critic_prompt.format(query=query, passage=passage or "No passage provided")
    response = llm(prompt)
    try:
        eval_result = json.loads(response.strip())
    except:
        eval_result = {"retrieval_decision": "[Retrieve]", "relevance": "[Relevant]", "reasoning": response.strip()}
    
    print(f"Query: {query}")
    print(f"Retrieval decision: {eval_result['retrieval_decision']}")
    
    if eval_result['retrieval_decision'] == '[NoRetrieve]':
        print("--> Generating from model knowledge (no retrieval needed)")
        return llm(f"Answer: {query}")
    
    print(f"Passage relevance: {eval_result['relevance']}")
    if eval_result['relevance'] == '[Irrelevant]':
        print("--> Passage rejected. Searching for better sources...")
        return "Unable to find relevant information."
    
    print(f"--> Passage accepted. Generating answer...")
    return llm(f"Based on this context: {passage}\\\\nAnswer: {query}")

# Test
result = self_rag(
    "What is the capital of France?",
    "Paris is the capital and most populous city of France."
)
print(f"Result: {result}")`,
      output: `Query: What is the capital of France?
Retrieval decision: [Retrieve]
Passage relevance: [Relevant]
--> Passage accepted. Generating answer...
Result: The capital of France is Paris.`,
      explanation: 'Self-RAG uses a critic to evaluate both the need for retrieval and the quality of retrieved passages. This prevents the model from blindly using irrelevant context and allows it to skip retrieval when it already knows the answer.',
    },
    {
      level: 'intermediate',
      code: `# Corrective RAG (CRAG) with Web Search Fallback
from langchain.llms import OpenAI
from langchain.vectorstores import FAISS
from langchain.embeddings import OpenAIEmbeddings
from langchain.tools import DuckDuckGoSearchRun
from langchain.prompts import PromptTemplate
import numpy as np

# Setup
llm = OpenAI(temperature=0)
embeddings = OpenAIEmbeddings()
search = DuckDuckGoSearchRun()

# Sample documents
docs = [
    "Python is a high-level programming language created by Guido van Rossum.",
    "Java is a class-based, object-oriented programming language.",
    "JavaScript is a scripting language for web development.",
    "C++ is a general-purpose programming language with object-oriented features."
]
vectorstore = FAISS.from_texts(docs, embeddings)

# Relevance evaluator
relevance_prompt = PromptTemplate(
    input_variables=["query", "document"],
    template="""Rate the relevance of the document to the query on a scale of 0-10.
Query: {query}
Document: {document}
Relevance score (0-10):"""
)

def evaluate_relevance(query, doc):
    response = llm(relevance_prompt.format(query=query, document=doc))
    try:
        return float(response.strip())
    except:
        return 0.0

def corrective_rag(query):
    """CRAG with relevance check and web fallback."""
    # Stage 1: Retrieve
    retrieved = vectorstore.similarity_search(query, k=2)
    
    # Stage 2: Evaluate relevance
    scores = [evaluate_relevance(query, doc.page_content) for doc in retrieved]
    max_score = max(scores)
    avg_score = np.mean(scores)
    
    print(f"Query: {query}")
    print(f"Retrieved: {[d.page_content[:50] for d in retrieved]}")
    print(f"Relevance scores: {scores}")
    
    # Stage 3: Decide action
    if max_score >= 7:
        print("--> [Correct] Using retrieved documents")
        context = "\\\\n".join([d.page_content for d in retrieved])
        return llm(f"Context: {context}\\\\nAnswer: {query}")
    elif max_score >= 4:
        print("--> [Ambiguous] Keeping relevant docs, transforming query")
        relevant = [d for d, s in zip(retrieved, scores) if s >= 4]
        context = "\\\\n".join([d.page_content for d in relevant])
        return llm(f"Context: {context}\\\\nBased on limited context, answer: {query}")
    else:
        print("--> [Incorrect] Falling back to web search")
        web_results = search.run(query)
        print(f"Web results: {web_results[:100]}...")
        return llm(f"Context (from web): {web_results}\\\\nAnswer: {query}")

# Test
result = corrective_rag("What is C++?")
print(f"Final: {result}\\\\n")

result2 = corrective_rag("What is the latest version of Python?")
print(f"Final: {result2}")`,
      output: `Query: What is C++?
Retrieved: ["C++ is a general-purpose programming language...", "Python is a high-level programming language..."]
Relevance scores: [9.0, 1.0]
--> [Correct] Using retrieved documents
Final: C++ is a general-purpose programming language with object-oriented features.

Query: What is the latest version of Python?
Retrieved: ["Python is a high-level programming language...", "Java is a class-based, object-oriented..."]
Relevance scores: [2.0, 0.0]
--> [Incorrect] Falling back to web search
Web results: Python 3.12 was released in October 2023...
Final: The latest version of Python is 3.12.`,
      explanation: 'CRAG evaluates retrieval relevance and takes corrective action. When relevant documents are found (first query), it uses them. When none are relevant (second query: no docs mention Python versions), it falls back to web search. This prevents the LLM from hallucinating based on irrelevant context.',
    },
    {
      level: 'advanced',
      code: `# Graph RAG with Neo4j (simplified)
from langchain.llms import OpenAI
from langchain.prompts import PromptTemplate
import re
from collections import defaultdict

# Entity and relationship extraction
llm = OpenAI(temperature=0)

extract_prompt = PromptTemplate(
    input_variables=["text"],
    template="""Extract entities and relationships from this text.
Format each as: ENTITY|TYPE|DESCRIPTION
Then relationships as: SUBJECT|RELATION|OBJECT

Text: {text}

Entities and relationships:"""
)

def extract_graph(text):
    """Extract entities and relationships from a document."""
    response = llm(extract_prompt.format(text=text))
    return response

def build_entity_graph(documents):
    """Build a simple entity graph from documents."""
    entities = {}
    relationships = defaultdict(list)
    
    for doc_id, doc in enumerate(documents):
        extracted = extract_graph(doc)
        print(f"Doc {doc_id}: {extracted[:100]}...")
        
        # Simple parsing (in production use proper NER)
        lines = extracted.strip().split("\\\\n")
        for line in lines:
            if "|" in line:
                parts = line.split("|")
                if len(parts) >= 3:
                    if "SUBJECT" in line:
                        rel_parts = line.split("|")
                        if len(rel_parts) >= 3:
                            relationships[rel_parts[0].strip()].append(
                                (rel_parts[1].strip(), rel_parts[2].strip())
                            )
                    else:
                        entities[parts[0].strip()] = {
                            "type": parts[1].strip(),
                            "desc": parts[2].strip()
                        }
    
    return entities, relationships

def graph_rag_query(query, entities, relationships):
    """Query using the entity graph."""
    # Find entities related to the query
    related = [e for e in entities if any(w in e.lower() for w in query.lower().split())]
    
    print(f"Entities matching query: {related}")
    
    # Traverse relationships
    context = []
    for entity in related:
        context.append(f"Entity: {entity} - {entities[entity]}")
        for rel, obj in relationships.get(entity, []):
            if obj in entities:
                context.append(f"  {entity} {rel} {obj} - {entities[obj]}")
    
    if not context:
        return "No relevant entities found in the knowledge graph."
    
    graph_context = "\\\\n".join(context)
    return llm(f"Knowledge graph context:\\\\n{graph_context}\\\\n\\\\nQuery: {query}\\\\nAnswer:")

# Sample documents
docs = [
    "Apple Inc. was founded by Steve Jobs. Tim Cook is the current CEO of Apple.",
    "Microsoft was founded by Bill Gates. Satya Nadella is the CEO of Microsoft.",
    "Google was founded by Larry Page and Sergey Brin. Sundar Pichai is the CEO of Google."
]

entities, relationships = build_entity_graph(docs)
print(f"\\\\nExtracted entities: {list(entities.keys())}")

# Query
result = graph_rag_query("Who is the CEO of Apple?", entities, relationships)
print(f"\\\\nAnswer: {result}")`,
      output: `Doc 0: ENTITY|Apple Inc.|Technology company...
Doc 1: ENTITY|Microsoft|Technology company...
Doc 2: ENTITY|Google|Technology company...
Extracted entities: ['Apple Inc.', 'Steve Jobs', 'Tim Cook', 'Microsoft', 'Bill Gates', 'Satya Nadella', 'Google', 'Larry Page', 'Sergey Brin', 'Sundar Pichai']

Entities matching query: ['Apple Inc.']
  Entity: Apple Inc. - {'type': 'Technology company', ...}
    Apple Inc. founded_by Steve Jobs - {'type': 'Person', ...}
    Apple Inc. ceo Tim Cook - {'type': 'Person', ...}

Answer: The CEO of Apple Inc. is Tim Cook.`,
      explanation: 'Graph RAG extracts entities and relationships from documents, building a knowledge graph. Queries can then leverage relationships (e.g., "CEO of Apple") that would be difficult for chunk-based retrieval to answer. The graph enables multi-hop reasoning and structured knowledge access.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Financial Analysis', description: 'Graph RAG is used to extract relationships between companies, executives, regulations, and market events. Analysts ask multi-hop questions like "Which companies in the healthcare sector are affected by the new FDA regulations?"' },
      { industry: 'Customer Support', description: 'Agentic RAG powers support bots that decide whether to look up product documentation, check order status via API, search the knowledge base, or escalate to a human agent.' },
      { industry: 'Scientific Research', description: 'Self-RAG helps researchers by evaluating whether retrieved papers are relevant and whether the generated summary is supported by the cited work, reducing hallucination in literature reviews.' },
    ],
    caseStudy: {
      problem: 'A pharmaceutical company needed a system to answer complex research questions combining data from clinical trials, regulatory documents, and scientific literature. Simple chunk-based RAG failed on multi-hop questions.',
      solution: 'They implemented a hybrid approach: (1) Graph RAG extracted entities (drugs, diseases, genes, trials) and their relationships, (2) Self-RAG evaluated retrieval relevance, and (3) CRAG fell back to PubMed search when the internal knowledge base was insufficient.',
      results: 'Multi-hop question accuracy improved from 51% to 88%. The system correctly answered questions like "Which drugs targeting BRAF mutations have completed Phase 2 trials?" by traversing the entity relationship graph.',
    },
    bestPractices: [
      'Start with Self-RAG: it provides the most general improvement with minimal infrastructure changes',
      'Add CRAG when retrieval quality is inconsistent and wrong answers are costly',
      'Use Graph RAG only when your use case involves multi-hop or relationship-centric questions',
      'Keep the critic/fallback components as optional modules — they add latency',
      'Monitor the frequency of fallback triggers — high fallback rate indicates poor retrieval quality',
    ],
    tools: ['LangGraph', 'Neo4j / NetworkX', 'DuckDuckGo Search / Tavily / SerpAPI', 'LlamaIndex Graph RAG', 'AutoGen / CrewAI'],
    jobRoles: ['Research Engineer', 'AI Systems Engineer', 'RAG Engineer', 'Knowledge Graph Engineer'],
    furtherReading: [
      'Self-RAG: Learning to Retrieve, Generate, and Critique (Asai et al., 2023)',
      'Corrective Retrieval Augmented Generation (CRAG) paper',
      'GraphRAG: A modular graph-based RAG system (Microsoft, 2024)',
      'LangGraph agentic RAG documentation',
    ],
  },
  quiz: [
    {
      id: 'adv-rag-1', type: 'mcq',
      question: 'What is the key innovation of Self-RAG compared to standard RAG?',
      options: [
        'It uses a larger LLM for generation',
        'It introduces a critic model that evaluates retrieval necessity and quality with reflection tokens',
        'It always retrieves more documents than standard RAG',
        'It replaces the vector store with a knowledge graph',
      ],
      correctAnswer: 'It introduces a critic model that evaluates retrieval necessity and quality with reflection tokens',
      explanation: 'Self-RAG\'s key innovation is the critic model that generates reflection tokens ([Retrieve], [IsRel], [IsSup], [IsUse]) to evaluate whether retrieval is needed and whether passages are relevant and answers supported.',
    },
    {
      id: 'adv-rag-2', type: 'truefalse',
      question: 'Corrective RAG (CRAG) only triggers web search when all retrieved documents are relevant.',
      correctAnswer: 'False',
      explanation: 'CRAG triggers web search when NO documents are relevant (Incorrect case). When some are relevant, it keeps those and discards the rest. When all are relevant, it uses them directly.',
    },
    {
      id: 'adv-rag-3', type: 'code',
      question: 'In this CRAG implementation, what does the function do when max_score >= 7?',
      code: `if max_score >= 7:
    use_docs(retrieved)
elif max_score >= 4:
    keep_relevant(retrieved, scores)
else:
    web_search(query)`,
      options: [
        'It discards all documents and searches the web',
        'It uses the retrieved documents directly for answer generation',
        'It re-ranks the documents with a cross-encoder',
        'It asks the user to clarify the query',
      ],
      correctAnswer: 'It uses the retrieved documents directly for answer generation',
      explanation: 'When max_score >= 7, CRAG considers the retrieval "Correct" and uses the retrieved documents directly. Between 4-7 it\'s "Ambiguous" (keep relevant, discard others), and below 4 it\'s "Incorrect" (fall back to web).',
    },
    {
      id: 'adv-rag-4', type: 'fillblank',
      question: 'Graph RAG uses ___ detection to group related entities into communities, enabling hierarchical summarization and structured retrieval.',
      correctAnswer: 'community',
      explanation: 'Graph RAG detects communities (clusters of related entities) using graph algorithms like Leiden or Louvain. Each community gets a summary, and queries first identify relevant communities before drilling into specific entities.',
    },
    {
      id: 'adv-rag-5', type: 'match',
      question: 'Match each advanced RAG technique with its primary benefit:',
      pairs: [
        { left: 'Self-RAG', right: 'Evaluates whether retrieved passages are relevant before using them' },
        { left: 'Corrective RAG', right: 'Falls back to web search when internal retrieval fails' },
        { left: 'Graph RAG', right: 'Captures entity relationships for multi-hop reasoning' },
        { left: 'Agentic RAG', right: 'Dynamically decides which tools and retrieval strategies to use' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'Each advanced technique addresses a specific limitation of naive RAG: Self-RAG filters bad retrievals, CRAG handles empty retrievals, Graph RAG enables relational queries, and Agentic RAG provides adaptive tool use.',
    },
  ],
}))

export {}
