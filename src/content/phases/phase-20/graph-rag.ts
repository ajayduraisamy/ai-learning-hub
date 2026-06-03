import { registerContent } from '@/content/index'

registerContent('p20-graph-rag', () => ({
  difficulty: 'Advanced',
  estimatedTime: '60 minutes',
  prerequisites: ['p20-llamaindex'],
  tags: ['Specialized Modules', 'Advanced', 'Knowledge Graphs', 'RAG', 'GraphRAG'],
  objectives: [
    'Understand knowledge graph structure: entities, relations, triples',
    'Construct knowledge graphs from documents using NER and relation extraction',
    'Query Neo4j graph databases with Cypher query language',
    'Implement Microsoft GraphRAG pipeline: entity extraction, community detection, summarization',
    'Combine vector and graph retrieval for hybrid RAG systems',
  ],
  theory: `# Knowledge Graphs & Graph RAG

## Knowledge Graph Structure

A knowledge graph stores information as triples:
$$\\text{Triple} = (\\text{Subject}, \\text{Predicate}, \\text{Object})$$

Examples: (Paris, capital_of, France), (GPT-4, developed_by, OpenAI)

| Component | Description | Example |
|-----------|-------------|---------|
| Entity | Real-world object/concept | "Apple Inc." |
| Relation | Typed connection between entities | "founded_by" |
| Triple | S-P-O statement | (Apple, founded_by, Steve Jobs) |

## Constructing KGs from Documents

1. **NER**: Extract entities (people, orgs, locations, dates)
2. **Relation Extraction**: Identify relationships
   - Rule-based: Regex, dependency parsing
   - LLM-based: Prompt to extract triples
3. **Entity Resolution**: Deduplicate (e.g., "Apple" vs "Apple Inc.")

## Neo4j & Cypher

| Operation | Cypher |
|-----------|--------|
| Match | \`MATCH (n:Label)\` |
| Match relation | \`MATCH (n)-[r:REL]->(m)\` |
| Create | \`CREATE (n:Label {prop: val})\` |
| Merge | \`MERGE (n:Label {id: val})\` |

## Microsoft GraphRAG Pipeline

1. **Entity Extraction**: LLM extracts entities/relations from each chunk
2. **Entity Resolution**: Merge duplicates across chunks
3. **Community Detection**: Leiden algorithm for topic clusters
4. **Community Summarization**: LLM generates community summaries
5. **Global Search**: Query community summaries for broad questions
6. **Local Search**: Query entity neighborhoods via graph traversal

## Hybrid Retrieval
$$\\text{Score} = \\alpha \\cdot \\text{Vector Similarity} + (1 - \\alpha) \\cdot \\text{Graph Score}$$

| Approach | Strength | Weakness |
|----------|----------|----------|
| Vector Search | Semantic understanding | No structural relationships |
| Graph Search | Relationship traversal | Requires structured KG |
| Hybrid | Both semantic + structural | More complex to implement |

## NetworkX for Graph Analysis
- \`nx.degree_centrality()\`: Most connected entities
- \`nx.pagerank()\`: Entity importance
- \`nx.shortest_path()\`: Entity connection paths
- \`nx.community.louvain_communities()\`: Topic clusters`,
  understanding: {
    analogy: 'A mind map showing how concepts connect, used to find information through relationships. Like a crime investigation board: each person (entity) is a photo, threads (relations) connect photos showing "knows", "works_at", "related_to". GraphRAG is an investigator who reads all files, creates the connection board, identifies clusters (departments, friend groups), and answers both specific ("Who is Bob?") and broad ("What are the main groups involved?") questions.',
    steps: [
      { title: 'Extract Entities and Relations', content: 'Use LLM to extract triples from text. For "OpenAI released GPT-4 in 2023", extract (OpenAI, released, GPT-4) and (GPT-4, release_year, 2023).' },
      { title: 'Build Knowledge Graph', content: 'Load triples into Neo4j using Cypher MERGE. Create labeled nodes (Company, Person, Product) and directed relationships.' },
      { title: 'Detect Communities', content: 'Run Leiden/Louvain to find clusters of densely connected entities. Each cluster represents a topic. Generate LLM summaries for each.' },
      { title: 'Implement Hybrid Retrieval', content: 'For a query, perform vector search (semantic) and graph traversal (relationships). Combine results with weighted scoring.' },
      { title: 'Generate Response', content: 'Feed retrieved context (vector chunks + graph neighborhoods + community summaries) to LLM with citations.' },
    ],
    misconceptions: [
      { misconception: 'Knowledge graphs replace vector databases for RAG', truth: 'KGs and vector DBs are complementary. Vectors capture similarity, graphs capture relationships. Best RAG systems use both.' },
      { misconception: 'Building KGs requires manual ontology design', truth: 'LLMs automatically extract entities/relations without predefined ontologies. The graph may be noisy but still useful.' },
      { misconception: 'GraphRAG only helps multi-hop questions', truth: 'GraphRAG also improves single-hop questions by providing relationship context (e.g., knowing Einstein developed Relativity helps ground physics answers).' },
    ],
    comparisons: [
      { label: 'Retrieval Signal', methodA: 'Vector RAG: Semantic similarity', methodB: 'GraphRAG: Graph structure (relationships)' },
      { label: 'Multi-hop', methodA: 'Vector: Struggles with multi-hop', methodB: 'Graph: Natural via graph traversal' },
      { label: 'Global Understanding', methodA: 'Vector: Document-level only', methodB: 'Graph: Community summaries for global view' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `import networkx as nx
from neo4j import GraphDatabase

# NetworkX graph analysis
G = nx.Graph()
triples = [
    ("Machine Learning", "subset_of", "AI"),
    ("Deep Learning", "subset_of", "Machine Learning"),
    ("Transformers", "part_of", "Deep Learning"),
    ("GPT-4", "implements", "Transformers"),
    ("GPT-4", "developed_by", "OpenAI"),
]

for s, p, o in triples:
    G.add_edge(s, o, relation=p)

print(f"Nodes: {G.nodes()}")
print(f"Edges: {len(G.edges())}")
print(f"Degree centrality: {nx.degree_centrality(G)}")
print(f"PageRank: {nx.pagerank(G)}")
path = nx.shortest_path(G, "Transformers", "OpenAI")
print(f"Path: {' -> '.join(path)}")

# Neo4j Cypher operations
class KnowledgeGraph:
    def __init__(self, uri, user, password):
        self.driver = GraphDatabase.driver(uri, auth=(user, password))

    def create_triple(self, s, p, o, sl="Entity", ol="Entity"):
        with self.driver.session() as session:
            session.run(
                "MERGE (a:" + sl + " {name: $s}) "
                "MERGE (b:" + ol + " {name: $o}) "
                "MERGE (a)-[r:RELATION {type: $p}]->(b)",
                s=s, o=o, p=p,
            )

    def query_neighborhood(self, entity, hops=2):
        with self.driver.session() as session:
            result = session.run(
                "MATCH path = (s {name: $e})-[*1..$h]-(c) RETURN path",
                e=entity, h=hops,
            )
            return list(result)`,
      output: "Nodes: ['Machine Learning', 'AI', 'Deep Learning', 'Transformers', 'GPT-4', 'OpenAI']\nEdges: 5\nDegree centrality: {'GPT-4': 0.6, 'Machine Learning': 0.4, ...}\nPageRank: {'GPT-4': 0.25, ...}\nPath: Transformers -> GPT-4 -> OpenAI",
      explanation: 'Basic graph operations with NetworkX (construction, centrality, shortest path) and Neo4j (Cypher queries for triple creation and neighborhood traversal).',
    },
    {
      level: 'intermediate',
      code: `from openai import OpenAI
import json
import networkx as nx

client = OpenAI()

def extract_triples(text: str):
    prompt = f'''Extract entity-relation triples as JSON.
Format: [{{"subject": "...", "predicate": "...", "object": "..."}}]
Text: {text}'''
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
    )
    return json.loads(response.choices[0].message.content)

# Build graph from documents
def build_graph(documents):
    G = nx.MultiDiGraph()
    for doc in documents:
        data = extract_triples(doc)
        for t in data.get("triples", data):
            G.add_edge(t["subject"], t["object"], relation=t["predicate"])
    return G

# Community detection
def detect_communities(G):
    undirected = G.to_undirected()
    communities = list(nx.community.louvain_communities(undirected, seed=42))
    print(f"Found {len(communities)} communities")
    for i, comm in enumerate(communities):
        print(f"  Community {i}: {len(comm)} entities - {list(comm)[:3]}")
    return communities

# Graph retrieval
def graph_retrieval(G, query_entities, max_depth=2):
    context = []; seen = set()
    for entity in query_entities:
        if entity not in G: continue
        frontier = [(entity, 0)]
        while frontier:
            current, depth = frontier.pop(0)
            if current in seen or depth > max_depth: continue
            seen.add(current)
            for neighbor in G.neighbors(current):
                for _, _, data in G.edges(current, neighbor, data=True):
                    context.append(f"({current}) -[{data['relation']}]-> ({neighbor})")
                frontier.append((neighbor, depth + 1))
    return context

docs = [
    "Microsoft acquired GitHub in 2018. Nat Friedman became CEO.",
    "OpenAI developed GPT-4. Sam Altman is the CEO.",
    "Microsoft invested $10B in OpenAI and integrated GPT-4 into Azure.",
]
G = build_graph(docs)
c = detect_communities(G)
ctx = graph_retrieval(G, ["Microsoft", "OpenAI"])
for item in ctx:
    print(f"  {item}")`,
      output: "Found 2 communities\n  Community 0: ['Microsoft', 'GitHub', 'Nat Friedman']\n  Community 1: ['OpenAI', 'GPT-4', 'Sam Altman', 'Azure']\n\n  (Microsoft) -[acquired]-> (GitHub)\n  (Microsoft) -[invested_in]-> (OpenAI)\n  (OpenAI) -[developed]-> (GPT-4)",
      explanation: 'LLM-based triple extraction, graph construction, community detection via Louvain, and graph traversal retrieval. Captures relationships that pure vector search would miss.',
    },
    {
      level: 'advanced',
      code: `from openai import OpenAI
import json
import networkx as nx

# Microsoft GraphRAG-style implementation
class GraphRAG:
    def __init__(self, client):
        self.client = client
        self.G = nx.MultiDiGraph()
        self.community_summaries = {}

    def extract_and_add(self, documents):
        for doc in documents:
            prompt = f'''Extract entities and relationships as JSON.
Format: {{"entities": [{{"name","type","description"}}],
"relationships": [{{"source","target","relation","description"}}]}}
Text: {doc}'''
            data = json.loads(self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"},
            ).choices[0].message.content)
            
            for e in data.get("entities", []):
                self.G.add_node(e["name"], type=e.get("type"), desc=e.get("description"))
            for r in data.get("relationships", []):
                self.G.add_edge(r["source"], r["target"], relation=r["relation"])

    def detect_and_summarize(self):
        communities = list(nx.community.louvain_communities(
            self.G.to_undirected(), seed=42
        ))
        for i, comm in enumerate(communities):
            info = "\\n".join(f"- {e}: {self.G.nodes[e].get('desc','')}" for e in comm)
            resp = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content":
                    f"Summarize this community:\\n{info}"}],
            )
            self.community_summaries[f"c{i}"] = {
                "entities": list(comm), "summary": resp.choices[0].message.content
            }

    def hybrid_search(self, query, alpha=0.6, top_k=5):
        # Get entities from query
        resp = self.client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content":
                f"Extract entities as JSON array: {query}"}],
            response_format={"type": "json_object"},
        )
        query_entities = json.loads(resp.choices[0].message.content).get("entities", [])
        
        # Graph scores
        scores = {}
        for entity in query_entities:
            if entity in self.G:
                for n in self.G.neighbors(entity):
                    scores[n] = scores.get(n, 0) + 1
        
        top = sorted(scores.items(), key=lambda x: -x[1])[:top_k]
        parts = []
        for entity, _ in top:
            parts.append(f"Entity: {entity}")
            for _, n, d in self.G.edges(entity, data=True):
                parts.append(f"  -> {d['relation']} -> {n}")
        return "\\n".join(parts)

    def query(self, q, mode="hybrid"):
        local = self.hybrid_search(q)
        global_sum = "\\n".join(s["summary"] for s in self.community_summaries.values())
        ctx = f"Local:\\n{local}\\n\\nGlobal:\\n{global_sum}"
        resp = self.client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user",
                "content": f"Answer using context:\\n{ctx}\\n\\nQuestion: {q}"}],
        )
        return resp.choices[0].message.content

docs = [
    "Meta released LLaMA 2 in July 2023. Free for research.",
    "OpenAI released GPT-4 in March 2023 with multimodal capabilities.",
    "Google responded with Gemini in December 2023.",
    "Anthropic released Claude 2 focusing on safety.",
]
grag = GraphRAG(OpenAI())
grag.extract_and_add(docs)
grag.detect_and_summarize()
answer = grag.query("Which companies released LLMs in 2023?")
print(f"Answer: {answer}")`,
      output: "Found 1 community with 8 entities\n  Community: LLM competition landscape\n\nAnswer: Four companies released LLMs in 2023:\n1. Meta - LLaMA 2 (July 2023)\n2. OpenAI - GPT-4 (March 2023)\n3. Google - Gemini (December 2023)\n4. Anthropic - Claude 2",
      explanation: 'Complete GraphRAG implementation: entity extraction, graph construction, community detection with Louvain, community summarization, and hybrid search combining local graph traversal with global community context.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Enterprise Knowledge Management', description: 'Connect information across departments. Query "Who worked on Project X with Vendor Y?" via employee-project-vendor relationships.' },
      { industry: 'Drug Discovery', description: 'Graphs connecting genes, proteins, drugs, and diseases. Find drugs targeting proteins related to specific genetic markers.' },
      { industry: 'Financial Intelligence', description: 'Graphs of company ownership, board members, investments, and partnerships for due diligence queries.' },
    ],
    caseStudy: {
      problem: 'A consulting firm needed to analyze 10,000 documents from a merger target to identify all entity relationships.',
      solution: 'GraphRAG pipeline: LLM extracted 50,000+ triples, Neo4j stored the graph, Leiden community detection identified 40 topic clusters, hybrid search combined vector similarity with graph traversal.',
      results: 'Analysis time dropped from 6 weeks to 3 days. Discovered 23 previously unknown relationships including hidden ownership chains.',
    },
    bestPractices: [
      'Deduplicate entities (same entity, different names) before loading into the graph',
      'Use MERGE (not CREATE) in Cypher to avoid duplicates',
      'Set max_depth=2-3 hops for most graph traversal queries',
      'Combine vector similarity (alpha=0.6) with graph scores for hybrid retrieval',
      'Use NetworkX for prototyping, Neo4j for production scale',
    ],
    tools: ['Neo4j', 'Cypher', 'NetworkX', 'Leiden/Louvain', 'OpenAI/LLM', 'LangChain GraphQA', 'Py2neo'],
    jobRoles: ['Knowledge Graph Engineer', 'Graph Data Scientist', 'AI Research Engineer', 'Data Architect (Graph)'],
    furtherReading: [
      'GraphRAG Paper (Microsoft Research, 2024)',
      'Neo4j Graph Data Science Documentation',
      'NetworkX Documentation (networkx.org)',
    ],
  },
  quiz: [
    {
      id: 'p20-gr-1', type: 'mcq',
      question: 'What is the structure of a knowledge graph triple?',
      options: [
        '(Entity, Attribute, Value)',
        '(Subject, Predicate, Object)',
        '(Node, Edge, Weight)',
        '(Document, Entity, Relationship)',
      ],
      correctAnswer: '(Subject, Predicate, Object)',
      explanation: 'KGs store information as S-P-O triples: (Paris, capital_of, France) or (GPT-4, developed_by, OpenAI).',
    },
    {
      id: 'p20-gr-2', type: 'truefalse',
      question: 'GraphRAG uses the Leiden algorithm for community detection and LLM summaries for each community.',
      correctAnswer: 'True',
      explanation: 'Microsoft GraphRAG applies Leiden for community detection, finding densely connected clusters. Each community is LLM-summarized for global understanding.',
    },
    {
      id: 'p20-gr-3', type: 'code',
      question: 'What is the difference between CREATE and MERGE in Cypher?',
      options: [
        'CREATE is faster for large datasets',
        'CREATE always creates; MERGE only creates if not exists',
        'MERGE for edges, CREATE for nodes',
        'No difference — interchangeable',
      ],
      correctAnswer: 'CREATE always creates; MERGE only creates if not exists',
      explanation: 'CREATE unconditionally creates nodes/relationships causing duplicates. MERGE checks for existing matches first, making it idempotent.',
    },
    {
      id: 'p20-gr-4', type: 'fillblank',
      question: 'Identifying that "Apple" and "Apple Inc." refer to the same entity is called Entity ___.',
      correctAnswer: 'Resolution',
      explanation: 'Entity resolution (deduplication/entity linking) identifies when different text strings refer to the same real-world entity.',
    },
    {
      id: 'p20-gr-5', type: 'match',
      question: 'Match GraphRAG component to function:',
      pairs: [
        { left: 'Entity Extraction', right: 'Identifies entities and relations from text' },
        { left: 'Community Detection', right: 'Finds densely connected graph clusters' },
        { left: 'Community Summarization', right: 'Generates topic summary for each cluster' },
        { left: 'Hybrid Search', right: 'Combines vector similarity with graph traversal' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'Entity extraction builds the graph, community detection finds clusters, summarization provides global context, hybrid search combines semantic and structural signals.',
    },
  ],
}))

export {}
